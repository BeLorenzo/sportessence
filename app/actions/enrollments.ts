'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { ConfirmEmail } from '../components/emails/ConfirmEmail'
import { BANK_INFO } from '../utils/bankInfo'

const resend = new Resend(process.env.RESEND_API_KEY)

export type EnrollmentPayload = {
  campId: string
  childId: string
  weeks: {
    camp_week_id: string
    type: 'FULL' | 'HALF'
    pre_post: 'NONE' | 'PRE' | 'POST' | 'BOTH'
    price: number
  }[]
  totalPrice: number
  priceSnapshot: any
  appliedPromo?: boolean 
}

export async function createEnrollment(payload: EnrollmentPayload) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autenticato' }

  if (!payload.weeks || payload.weeks.length === 0) {
    return { error: 'Seleziona almeno una settimana' }
  }

  // --- 0. RECUPERO INFO CAMPO (Ottimizzato: lo facciamo una volta sola) ---
  const { data: campData, error: campError } = await supabase
    .from('camps')
    .select('nome')
    .eq('id', payload.campId)
    .single();

  if (campError || !campData) return { error: 'Campo non trovato' };
  
  const campName = campData.nome;
  const campNameLower = campName.toLowerCase();

  // --- 1. VERIFICA DUPLICATI ---
  const weekIdsToCheck = payload.weeks.map(w => w.camp_week_id);
  const { data: existingDuplicates, error: checkError } = await supabase
    .from('enrollment_weeks')
    .select('camp_week_id')
    .eq('child_id', payload.childId)
    .in('camp_week_id', weekIdsToCheck);

  if (checkError) {
      console.error("Errore check duplicati:", checkError);
      return { error: "Errore verifica disponibilità." };
  }

  if (existingDuplicates && existingDuplicates.length > 0) {
    return { error: `Attenzione: ${existingDuplicates.length} settimane risultano già prenotate.` };
  }

  // --- 2. CALCOLO PREZZO "SOURCE OF TRUTH" ---
  const rpcPayload = payload.weeks.map(w => ({
    camp_week_id: w.camp_week_id,
    type: w.type,
    pre_post: w.pre_post
  }));

  const { data: dbQuote, error: rpcError } = await supabase.rpc('calculate_enrollment_price', {
    p_camp_id: payload.campId,
    p_child_id: payload.childId,
    p_new_weeks: rpcPayload
  });

  if (rpcError || !dbQuote) {
    console.error("Errore RPC:", rpcError);
    return { error: "Errore nel calcolo del prezzo server." };
  }

  // B. Gestione Sconto Codice (ENV) - Dinamico per Campo
  let calculatedPromoDiscount = 0;
  
  if (payload.appliedPromo) {
    let promoPercent = 0;
    
    // Sceglie la percentuale in base al nome del campo
    if (campNameLower.includes('cantù')) {
        promoPercent = parseFloat(process.env.NEXT_PUBLIC_SCONTO_FEDELI_CANTU || "0.20");
    } else if (campNameLower.includes('mulini')) {
        promoPercent = parseFloat(process.env.NEXT_PUBLIC_SCONTO_FEDELI_MULINI || "0.20");
    }

    calculatedPromoDiscount = Number(dbQuote.tuition) * promoPercent;
  }

  // C. Costruzione Totale Server
  const dbGrandTotal = Number(dbQuote.grand_total_value); 
  const serverGrandTotal = Math.max(0, dbGrandTotal - calculatedPromoDiscount);
  
  const alreadyBilled = Number(dbQuote.already_billed);
  const serverDeltaToPay = Math.max(0, serverGrandTotal - alreadyBilled);

  // D. Check di sicurezza
  if (Math.abs(serverDeltaToPay - payload.totalPrice) > 1.5) {
    console.warn(`Mismatch Prezzo: Frontend €${payload.totalPrice} vs Server €${serverDeltaToPay}`);
  }

  // --- 3. INSERIMENTO DB ---
  const { data: enrollment, error: errEnrollment } = await supabase
    .from('enrollments')
    .insert({
      camp_id: payload.campId,
      child_id: payload.childId,
      stato: 'CONFIRMED',
      prezzo_totale: serverDeltaToPay,
      pagato: 0,
      price_snapshot: {
        ...payload.priceSnapshot,
        server_calculation: dbQuote,
        promo_applied: payload.appliedPromo,
        promo_value: calculatedPromoDiscount,
        final_verified_delta: serverDeltaToPay
      }, 
    })
    .select('id')
    .single()

  if (errEnrollment) return { error: 'Errore creazione iscrizione' };

  // --- 4. INSERIMENTO DETTAGLI SETTIMANE ---
  const weeksData = payload.weeks.map(w => {
    const serverDetail = dbQuote.details.find((d: any) => d.week_id === w.camp_week_id);
    const basePrice = serverDetail ? Number(serverDetail.price) : w.price;
    const extraPrice = serverDetail ? Number(serverDetail.extraPrice) : 0; 

    return {
      enrollment_id: enrollment.id,
      camp_week_id: w.camp_week_id,
      child_id: payload.childId,
      type: w.type,
      pre_post: w.pre_post,
      computed_price: basePrice + extraPrice
    };
  });

  const { error: errWeeks } = await supabase.from('enrollment_weeks').insert(weeksData);

  if (errWeeks) {
    await supabase.from('enrollments').delete().eq('id', enrollment.id);
    return { error: 'Errore salvataggio settimane.' };
  }

  // --- 5. EMAIL ---
  try {
    // Rimosso campRes, facciamo solo 2 query invece di 3
    const [profileRes, childRes] = await Promise.all([
      supabase.from('profiles').select('email, nome').eq('id', user.id).single(),
      supabase.from('children').select('nome, cognome, cf').eq('id', payload.childId).single()
    ]);

    if (profileRes.data && childRes.data) {
      await resend.emails.send({
        from: 'SportEssence <noreply@sportessence.it>', 
        to: [profileRes.data.email],
        subject: `Conferma Iscrizione - ${childRes.data.nome}`,
        react: ConfirmEmail({
          parentName: profileRes.data.nome,
          childName: `${childRes.data.nome} ${childRes.data.cognome}`,
          childCF: childRes.data.cf,
          campName: campName, // Usiamo il nome recuperato allo step 0
          amount: serverDeltaToPay,
          iban: BANK_INFO.iban,
          reservationId: enrollment.id
        }) as any,
      });
    }
  } catch (e) { console.error("Email error", e); }

  revalidatePath('/Utente');
  return { success: true, enrollmentId: enrollment.id };
}