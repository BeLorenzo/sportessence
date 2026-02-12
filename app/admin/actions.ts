"use server";

import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import PaymentConfirmEmail from "../components/emails/ricevutaPronta"; 
import { createClient } from '../utils/supabase/server'; // Client Standard (per Auth)
import { createClient as createAdminClient } from '@supabase/supabase-js'; // Client Admin (per azioni DB)

const resend = new Resend(process.env.RESEND_API_KEY)

// --- HELPER SUPER ADMIN ---
// Questo client ha i superpoteri (Service Role). 
// Va usato SOLO dopo aver controllato i permessi con checkAdminPermissions().
function getAdminSupabase() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Manca la SUPABASE_SERVICE_ROLE_KEY nel file .env.local");
  }
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    { auth: { persistSession: false } }
  );
}

// --- HELPER SICUREZZA OTTIMIZZATO ---
// Controlla i metadati del token JWT (app_metadata).
// È più veloce perché non deve interrogare la tabella 'profiles'.
async function checkAdminPermissions() {
  const supabaseAuth = await createClient(); // Client standard (cookie based)
  
  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
  
  if (authError || !user) {
    return { authorized: false, error: "Utente non autenticato." };
  }

  // --- IL NUOVO CONTROLLO ---
  // Verifica diretta sui metadati protetti dell'utente
  const isAdmin = user.app_metadata?.role === 'admin';

  if (!isAdmin) {
    return { authorized: false, error: "Accesso negato: Non sei un amministratore." };
  }

  return { authorized: true, user };
}

// 1. REGISTRA PAGAMENTO
export async function registerPayment(enrollmentId: string, amountToAdd: number) {
  // --- BLOCCO SICUREZZA ---
  const authCheck = await checkAdminPermissions();
  if (!authCheck.authorized) return { success: false, error: authCheck.error };
  // ------------------------

  const supabase = getAdminSupabase(); 
  
  // FASE 1: Recupero l'iscrizione
  const { data: enrollment, error: fetchError } = await supabase
    .from('enrollments')
    .select('id, pagato, prezzo_totale, stato, child_id, camp_id') 
    .eq('id', enrollmentId)
    .single();
    
  if (fetchError || !enrollment) {
    console.error("Errore fetch enrollment:", fetchError);
    return { success: false, error: "Iscrizione non trovata o errore DB." };
  }

  // FASE 2: Recupero il Bambino per trovare il Genitore
  const { data: child, error: childError } = await supabase
    .from('children')
    .select('nome, cognome, parent_id')
    .eq('id', enrollment.child_id)
    .single();

  if (childError || !child) {
    console.error("Errore fetch child:", childError);
    return { success: false, error: "Bambino non trovato." };
  }

  // Calcoli
  const currentPaid = enrollment.pagato || 0;
  const newTotal = currentPaid + amountToAdd;
  const isSaldato = newTotal >= enrollment.prezzo_totale;
  const newStatus = isSaldato ? 'COMPLETED' : enrollment.stato;
  
  // FASE 3: Aggiornamento DB
  const { error: updateError } = await supabase
    .from('enrollments')
    .update({ 
      pagato: newTotal,
      stato: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', enrollmentId);

  if (updateError) return { success: false, error: updateError.message };

  // FASE 4: INVIO EMAIL (Solo se saldato)
  if (isSaldato) {
    try {
      const [profileRes, campRes] = await Promise.all([
        supabase.from('profiles').select('nome, cognome, email, email_contatti').eq('id', child.parent_id).single(),
        supabase.from('camps').select('nome').eq('id', enrollment.camp_id).single()
      ]);

      const profile = profileRes.data;
      const camp = campRes.data;

      if (profile && camp) {
        const parentName = `${profile.nome} ${profile.cognome}`;
        const childName = `${child.nome} ${child.cognome}`;
        const dateStr = new Date().toLocaleDateString('it-IT');
        const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sportessence.it'}/Utente`;
        
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
      }
    } catch (emailErr) {
      console.error("Errore invio email:", emailErr);
      // Non ritorniamo false perché il pagamento è comunque salvato
      revalidatePath('/admin');
      return { success: true, warning: "Pagamento salvato, ma errore email." };
    }
  }
  
  revalidatePath('/admin'); 
  return { success: true };
}

// 3. MODIFICA COMPLETA
export async function updateEnrollmentDetails(
  enrollmentId: string, 
  newPrice: number, 
  newCampId: string
) {
  // --- BLOCCO SICUREZZA ---
  const authCheck = await checkAdminPermissions();
  if (!authCheck.authorized) return { success: false, error: authCheck.error };
  // ------------------------

  const supabase = getAdminSupabase();

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

// 4. ELIMINA ISCRIZIONE
export async function deleteEnrollment(enrollmentId: string) {
  // --- BLOCCO SICUREZZA ---
  const authCheck = await checkAdminPermissions();
  if (!authCheck.authorized) return { success: false, error: authCheck.error };
  // ------------------------

  const supabaseAdmin = getAdminSupabase();

  const { error: deleteError } = await supabaseAdmin
    .from('enrollments')
    .delete()
    .eq('id', enrollmentId);

  if (deleteError) {
    console.error("Errore eliminazione:", deleteError);
    return { success: false, error: "Impossibile eliminare. Controlla settimane o pagamenti collegati." };
  }

  revalidatePath('/admin');
  return { success: true };
}