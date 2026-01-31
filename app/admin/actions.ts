"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import PaymentConfirmEmail from "../components/emails/ricevutaPronta";

const resend = new Resend(process.env.RESEND_API_KEY)

// 1. REGISTRA PAGAMENTO
export async function registerPayment(enrollmentId: string, amountToAdd: number) {
  const supabase = await createClient();
  
  // 1. Recupero dati
  const { data: current, error: fetchError } = await supabase
    .from('enrollments')
    .select(`
      id, pagato, prezzo_totale, stato,
      children (nome, cognome),
      profiles (nome, cognome, email_contatti),
      camps (nome)
    `)
    .eq('id', enrollmentId)
    .single();
    
  if (fetchError || !current) return { success: false, error: "Iscrizione non trovata" };

  // Spacchettamento array
  const profile = Array.isArray(current.profiles) ? current.profiles[0] : current.profiles;
  const child = Array.isArray(current.children) ? current.children[0] : current.children;
  const camp = Array.isArray(current.camps) ? current.camps[0] : current.camps;

  if (!profile || !child || !camp) {
    return { success: false, error: "Dati profilo, bambino o campo mancanti" };
  }

  const currentPaid = current.pagato || 0;
  const newTotal = currentPaid + amountToAdd;
  const isSaldato = newTotal >= current.prezzo_totale;
  const newStatus = isSaldato ? 'saldato' : (current.stato || 'acconto');

  // 2. Aggiornamento DB
  const { error: updateError } = await supabase
    .from('enrollments')
    .update({ 
      pagato: newTotal,
      stato_pagamento: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', enrollmentId);

  if (updateError) return { success: false, error: updateError.message };

  // 3. INVIO EMAIL (Solo se saldato)
  if (isSaldato) {
    try {
      const parentName = `${profile.nome} ${profile.cognome}`;
      const childName = `${child.nome} ${child.cognome}`;
      const dateStr = new Date().toLocaleDateString('it-IT');
      
      const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sportessence.it'}/Utente`;

      await resend.emails.send({
        from: 'Sport Essence <noReply@sportessence.it>',
        to: [profile.email_contatti],
        subject: `Conferma Saldo - ${childName}`,
        react: PaymentConfirmEmail({
            parentName,
            childName,
            campName: camp.nome,
            amount: newTotal,
            paymentDate: dateStr,
            dashboardUrl: dashboardUrl
        }) as any,
      });

    } catch (emailErr) {
      console.error("Errore invio email:", emailErr);
      // Non blocchiamo, logghiamo solo
      revalidatePath('/admin');
      return { success: true, warning: "Pagamento salvato, ma errore email." };
    }
  }
  
  revalidatePath('/admin'); 
  return { success: true };
}

// 2. APPLICA SCONTO TESSERAMENTO
export async function applyMembershipDiscount(enrollmentId: string, discountAmount: number) {
  const supabase = await createClient();

  // Prendiamo il prezzo attuale
  const { data: current } = await supabase
    .from('enrollments')
    .select('prezzo_totale')
    .eq('id', enrollmentId)
    .single();

  if (!current) return { success: false, error: "Errore lettura prezzo" };

  // Applichiamo lo sconto
  const { error } = await supabase
    .from('enrollments')
    .update({ 
      prezzo_totale: current.prezzo_totale - discountAmount,
      // Magari salviamo un flag per dire che lo sconto è stato applicato
      // membership_verified: true 
    })
    .eq('id', enrollmentId);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/admin');
  return { success: true };
}

// 3. MODIFICA COMPLETA (Override Prezzo e Campo)
// Nota: La modifica delle settimane richiede una logica complessa di cancellazione/inserimento
// che va gestita con cura. Qui gestiamo l'override del prezzo e cambio campo.
export async function updateEnrollmentDetails(
  enrollmentId: string, 
  newPrice: number, 
  newCampId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('enrollments')
    .update({ 
      prezzo_totale: newPrice,
      camp_id: newCampId
    })
    .eq('id', enrollmentId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  return { success: true };
}