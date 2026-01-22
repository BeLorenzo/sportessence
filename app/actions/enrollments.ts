'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Resend } from 'resend'
import { ConfirmEmail } from '../components/emails/ConfirmEmail'
import { BANK_INFO } from '../utils/bankInfo'

// Inizializza Resend con la chiave API (assicurati che sia nel .env.local)
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
}

export async function createEnrollment(payload: EnrollmentPayload) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non autenticato' }

  // 1. Validazione Input Base
  if (!payload.weeks || payload.weeks.length === 0) {
    return { error: 'Seleziona almeno una settimana' }
  }

  // --- 🛡️ GUARD CHECK: VERIFICA DUPLICATI ---
  // Prima di creare qualsiasi cosa, controlliamo se il bambino ha già una di queste settimane.
  const weekIdsToCheck = payload.weeks.map(w => w.camp_week_id);
  
  const { data: existingDuplicates, error: checkError } = await supabase
    .from('enrollment_weeks')
    .select('camp_week_id')
    .eq('child_id', payload.childId)
    .in('camp_week_id', weekIdsToCheck);

  if (checkError) {
    console.error("Errore controllo duplicati:", checkError);
    return { error: "Errore tecnico durante la verifica delle settimane." };
  }

  if (existingDuplicates && existingDuplicates.length > 0) {
    // ABORTIAMO: C'è un tentativo di doppia prenotazione
    return { 
      error: `Attenzione: ${existingDuplicates.length} settimane selezionate risultano già prenotate per questo bambino. Ricarica la pagina.` 
    };
  }
  // ------------------------------------------

  // 2. Creazione Record Master (Enrollment)
  const { data: enrollment, error: errEnrollment } = await supabase
    .from('enrollments')
    .insert({
      camp_id: payload.campId,
      child_id: payload.childId,
      stato: 'CONFIRMED', // Nasce confermata come richiesto
      prezzo_totale: payload.totalPrice,
      pagato: 0,
      price_snapshot: payload.priceSnapshot,
    })
    .select('id')
    .single()

  if (errEnrollment) {
    console.error("Errore creazione enrollment:", errEnrollment)
    return { error: 'Errore durante la creazione dell\'iscrizione' }
  }

  // 3. Creazione Dettagli (Enrollment Weeks)
  const weeksData = payload.weeks.map(w => ({
    enrollment_id: enrollment.id,
    camp_week_id: w.camp_week_id,
    child_id: payload.childId,
    type: w.type,
    pre_post: w.pre_post,
    computed_price: w.price
  }))

  const { error: errWeeks } = await supabase
    .from('enrollment_weeks')
    .insert(weeksData)

  if (errWeeks) {
    console.error("Errore inserimento settimane:", errWeeks)
    
    // ROLLBACK MANUALE: Se fallisce l'inserimento delle settimane, cancelliamo l'ordine "padre".
    await supabase.from('enrollments').delete().eq('id', enrollment.id)
    
    // Gestione specifica errore unique
    if (errWeeks.code === '23505') {
        return { error: 'Una delle settimane selezionate è stata appena prenotata. Ricarica la pagina.' }
    }

    return { error: 'Errore nel salvataggio delle settimane selezionate.' }
  }

  // --- 📧 INVIO EMAIL DI CONFERMA ---
  // A questo punto l'iscrizione è salvata nel DB. Proviamo a mandare l'email.
  // Usiamo un try/catch separato per non bloccare l'utente se l'email fallisce.
  try {
    // Recuperiamo i dati necessari per l'email in parallelo per velocità
    const [profileRes, childRes, campRes] = await Promise.all([
      supabase.from('profiles').select('email, nome').eq('id', user.id).single(),
      supabase.from('children').select('nome, cognome, cf').eq('id', payload.childId).single(), // Aggiunto CF per causale
      supabase.from('camps').select('nome').eq('id', payload.campId).single()
    ]);

    const profile = profileRes.data;
    const child = childRes.data;
    const camp = campRes.data;

    if (profile && child && camp) {
      await resend.emails.send({
        from: 'Sportessence <noreply@sportessence.it>', // Metti la tua mail verificata
        to: [profile.email],
        subject: `Conferma Iscrizione - ${child.nome} ${child.cognome}`,
        react: ConfirmEmail({
          parentName: profile.nome,
          childName: `${child.nome} ${child.cognome}`,
          childCF: child.cf,            // Ora TypeScript riconosce questo campo
          campName: camp.nome,
          amount: payload.totalPrice,
          iban: BANK_INFO.iban,
          reservationId: enrollment.id  // E anche questo
        }),
      });
    }
  } catch (emailError) {
    // Logghiamo l'errore ma NON ritorniamo errore all'utente, perché l'iscrizione è valida.
    console.error("⚠️ Errore invio email conferma:", emailError);
  }
  // ----------------------------------

  revalidatePath('/Utente')
  return { success: true, enrollmentId: enrollment.id }
}