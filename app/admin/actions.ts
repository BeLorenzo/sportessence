"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import PaymentConfirmEmail from "../components/emails/ricevutaPronta"; 
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)

// --- HELPER SUPER ADMIN ---
function getAdminSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Manca la SUPABASE_SERVICE_ROLE_KEY nel file .env.local");
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    { auth: { persistSession: false } }
  );
}

// 1. REGISTRA PAGAMENTO
export async function registerPayment(enrollmentId: string, amountToAdd: number) {
  const supabase = getAdminSupabase();
  
  // FASE 1: Recupero l'iscrizione (SOLO dati iscrizione)
  // Nota: usiamo 'campi_id' come mi hai detto che si chiama la colonna
  const { data: enrollment, error: fetchError } = await supabase
    .from('enrollments')
    .select('id, pagato, prezzo_totale, stato, child_id, camp_id') 
    .eq('id', enrollmentId)
    .single();
    
  if (fetchError || !enrollment) {
    console.error("Errore fetch enrollment:", fetchError);
    return { success: false, error: "Iscrizione non trovata o errore DB: " + fetchError?.message };
  }

  // FASE 2: Recupero il Bambino per trovare il Genitore (user_id)
  // Dobbiamo sapere di chi è questo bambino per mandare la mail
  const { data: child, error: childError } = await supabase
    .from('children')
    .select('nome, cognome, parent_id') // Assumo che 'children' abbia 'user_id' che punta al genitore
    .eq('id', enrollment.child_id)
    .single();

  if (childError || !child) {
    console.error("Errore fetch child:", childError);
    return { success: false, error: "Bambino non trovato. Impossibile risalire al genitore." };
  }

  // Calcoli
  const currentPaid = enrollment.pagato || 0;
  const newTotal = currentPaid + amountToAdd;
  const isSaldato = newTotal >= enrollment.prezzo_totale;
  
  // FASE 3: Aggiornamento DB
  const { error: updateError } = await supabase
    .from('enrollments')
    .update({ 
      pagato: newTotal,
      updated_at: new Date().toISOString()
    })
    .eq('id', enrollmentId);

  if (updateError) return { success: false, error: updateError.message };

  // FASE 4: INVIO EMAIL (Solo se saldato)
  if (isSaldato) {
    try {
      // Ora recuperiamo Genitore e Campo per completare i dati dell'email
      const [profileRes, campRes] = await Promise.all([
        supabase.from('profiles').select('nome, cognome, email, email_contatti').eq('id', child.parent_id).single(),
        supabase.from('camps').select('nome').eq('id', enrollment.camp_id).single() // Nota: campi_id dall'iscrizione
      ]);

      const profile = profileRes.data;
      const camp = campRes.data;

      if (profile && camp) {
        const parentName = `${profile.nome} ${profile.cognome}`;
        const childName = `${child.nome} ${child.cognome}`;
        const dateStr = new Date().toLocaleDateString('it-IT');
        const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sportessence.it'}/Utente`;
        
        // Usa email_contatti se c'è, altrimenti quella di login
        const emailDestinatario = profile.email_contatti || profile.email;

        await resend.emails.send({
          from: 'SportEssence <noReply@sportessence.it>',
          to: [emailDestinatario],
          subject: `Ricevuta saldo finale - ${childName}`,
          react: PaymentConfirmEmail({
              parentName,
              childName,
              campName: camp.nome,
              amount: newTotal,
              paymentDate: dateStr,
              dashboardUrl: dashboardUrl
          }) as any,
        });
      } else {
        console.warn("Dati profilo o campo mancanti per l'email");
      }

    } catch (emailErr) {
      console.error("Errore invio email:", emailErr);
      revalidatePath('/admin');
      return { success: true, warning: "Pagamento salvato, ma errore email." };
    }
  }
  
  revalidatePath('/admin'); 
  return { success: true };
}

// 2. APPLICA SCONTO (Corretto con Admin Client)
export async function applyMembershipDiscount(enrollmentId: string) {
  const supabase = getAdminSupabase();

  console.log(`Tentativo sconto ID: ${enrollmentId}`);

  const { data: enrollment, error: fetchError } = await supabase
    .from('enrollments')
    .select(`
      prezzo_totale, 
      pagato, 
      stato, 
      discount_applied,
      camps (membership_discount_percent)
    `)
    .eq('id', enrollmentId)
    .single();

  if (fetchError || !enrollment) {
    console.error("Errore fetch dati:", fetchError);
    return { success: false, error: "Errore lettura dati" };
  }

  // 2. Controlli di sicurezza
  if (enrollment.discount_applied) {
    return { success: false, error: "Sconto già applicato!" };
  }

  // Recuperiamo la percentuale dalla relazione (gestendo il fatto che camps potrebbe essere un array o oggetto)
  const campData = Array.isArray(enrollment.camps) ? enrollment.camps[0] : enrollment.camps;
  const discountPercent = campData?.membership_discount_percent || 0;

  if (discountPercent <= 0) {
    return { success: false, error: "Nessuno sconto previsto per questo campo (0%)" };
  }

  // 3. Calcolo Sconto
  // Calcoliamo quanto togliere. Esempio: 15% di 200€ = 30€
  const prezzoAttuale = Number(enrollment.prezzo_totale);
  const discountAmount = (prezzoAttuale * discountPercent) / 100;
  
  // Nuovo prezzo
  const newPrice = Math.max(0, prezzoAttuale - discountAmount);

  // 4. Ricalcolo Stato (fondamentale!)
  const pagato = Number(enrollment.pagato || 0);
  const isSaldato = pagato >= newPrice;
  const newStatus = isSaldato ? 'saldato' : (enrollment.stato || 'acconto');

  console.log(`Applicazione sconto ${discountPercent}%: -${discountAmount}€. Nuovo Totale: ${newPrice}`);

  // 5. Update
  const { error: updateError } = await supabase
    .from('enrollments')
    .update({ 
      prezzo_totale: newPrice,
      discount_applied: true, // Blocchiamo futuri sconti
      discount_amount: discountAmount, // Salviamo quanto abbiamo tolto (utile per UI)
      stato: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', enrollmentId);

  if (updateError) return { success: false, error: updateError.message };
  
  revalidatePath('/admin/Dashboard');
  return { success: true };
}

// 3. MODIFICA COMPLETA (Corretto con Admin Client)
export async function updateEnrollmentDetails(
  enrollmentId: string, 
  newPrice: number, 
  newCampId: string
) {
  const supabase = getAdminSupabase();

  const { error } = await supabase
    .from('enrollments')
    .update({ 
      prezzo_totale: newPrice,
      camp_id: newCampId // Corretto: usa 'campi_id'
    })
    .eq('id', enrollmentId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  return { success: true };
}