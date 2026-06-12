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

// 3. MODIFICA COMPLETA (Prezzo, Campo e Settimane)
export async function updateEnrollmentDetails(
  enrollmentId: string, 
  newPrice: number, 
  newCampId: string,
  weeks: Array<{ camp_week_id: string; type: 'FULL' | 'HALF'; pre_post: 'NONE' | 'PRE' | 'POST' | 'BOTH'; computed_price: number }>
) {
  // --- BLOCCO SICUREZZA ---
  const authCheck = await checkAdminPermissions();
  if (!authCheck.authorized) return { success: false, error: authCheck.error };
  // ------------------------

  const supabaseAdmin = getAdminSupabase();

  // FASE 1: Aggiorna l'iscrizione principale
  const { error: updateError } = await supabaseAdmin
    .from('enrollments')
    .update({ 
      prezzo_totale: newPrice,
      camp_id: newCampId,
      updated_at: new Date().toISOString()
    })
    .eq('id', enrollmentId);

  if (updateError) return { success: false, error: updateError.message };

  // Recupera child_id per ripopolare correttamente le settimane
  const { data: enr } = await supabaseAdmin.from('enrollments').select('child_id').eq('id', enrollmentId).single();

  // FASE 2: Elimina le vecchie settimane collegate
  const { error: deleteError } = await supabaseAdmin
    .from('enrollment_weeks')
    .delete()
    .eq('enrollment_id', enrollmentId);

  if (deleteError) return { success: false, error: `Errore reset settimane: ${deleteError.message}` };

  // FASE 3: Inserisci le nuove settimane aggiornate
  if (weeks && weeks.length > 0) {
    const weeksToInsert = weeks.map(w => ({
      enrollment_id: enrollmentId,
      child_id: enr?.child_id, // <-- CORREZIONE AGGIUNTA
      camp_week_id: w.camp_week_id,
      type: w.type,
      pre_post: w.pre_post,
      computed_price: w.computed_price
    }));

    const { error: weeksError } = await supabaseAdmin
      .from('enrollment_weeks')
      .insert(weeksToInsert);

    if (weeksError) return { success: false, error: `Errore salvataggio settimane: ${weeksError.message}` };
  }

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

// 5. CREA GENITORE SENZA OTP
// TYPE CORRETTO con tutti i campi, inclusa email_contatti
type CreateAdminParentParams = {
  nome: string;
  cognome: string;
  email: string;
  email_contatti?: string; // <-- AGGIUNTO
  cf: string;
  telefono?: string;
  indirizzo_via?: string;
  indirizzo_civico?: string;
  indirizzo_cap?: string;
  indirizzo_paese?: string;
  indirizzo_provincia?: string;
};

export async function createAdminParent(data: CreateAdminParentParams) {
  const authCheck = await checkAdminPermissions();
  if (!authCheck.authorized) return { success: false, error: authCheck.error };

  const supabaseAdmin = getAdminSupabase();
  const tempPassword = `SportEssence${new Date().getFullYear()}!`;

  // 1. Crea Auth (Bypassa email confirm e registra metadati)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      nome: data.nome,
      cognome: data.cognome,
      cf: data.cf,
      email_contatti: data.email_contatti, // <-- AGGIUNTO
      telefono: data.telefono,
      indirizzo_via: data.indirizzo_via,
      indirizzo_civico: data.indirizzo_civico,
      indirizzo_cap: data.indirizzo_cap,
      indirizzo_paese: data.indirizzo_paese,
      indirizzo_provincia: data.indirizzo_provincia,
   }
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
       return { success: false, error: "Email già registrata. Usa il menù a tendina in alto." };
    }
    return { success: false, error: authError.message };
  }

  // 2. Crea/Upserta il Profilo a database
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id: authData.user.id,
      nome: data.nome,
      cognome: data.cognome,
      email: data.email,
      email_contatti: data.email_contatti || data.email, // <-- AGGIUNTO (fallback di sicurezza)
      cf: data.cf,
      telefono: data.telefono || null,
      indirizzo_via: data.indirizzo_via || null,
      indirizzo_civico: data.indirizzo_civico || null,
      indirizzo_cap: data.indirizzo_cap || null,
      indirizzo_paese: data.indirizzo_paese || null,
      indirizzo_provincia: data.indirizzo_provincia || null,
    });

  if (profileError) return { success: false, error: `Errore Tabella Profili: ${profileError.message}` };

  return { success: true, parentId: authData.user.id, tempPassword };
}

// 6. CREA BAMBINO AGGANCIATO AL GENITORE
export async function createAdminChild(data: { nome: string; cognome: string; cf: string; data_nascita: string; taglia_maglietta: string; intolleranze: string[]; parent_id: string }) {
  const authCheck = await checkAdminPermissions();
  if (!authCheck.authorized) return { success: false, error: authCheck.error };

  const supabaseAdmin = getAdminSupabase();

  const { data: childData, error: childError } = await supabaseAdmin
    .from('children')
    .insert({
      nome: data.nome,
      cognome: data.cognome,
      cf: data.cf, // <-- CORREZIONE BUG DB: colonna si chiama cf, non codice_fiscale
      data_nascita: data.data_nascita,
      taglia_maglietta: data.taglia_maglietta,
      intolleranze: data.intolleranze,
      parent_id: data.parent_id
    })
    .select('id')
    .single();

  if (childError) {
    if (childError.code === '23505') return { success: false, error: "Codice Fiscale già registrato." };
    return { success: false, error: `Errore Creazione Bambino: ${childError.message}` };
  }
  
  return { success: true, childId: childData.id };
}

// 7. CREA ISCRIZIONE COMPLETA CON SETTIMANE
export async function createAdminEnrollment(data: {
  child_id: string;
  camp_id: string;
  prezzo_totale: number;
  pagato: number;
  weeks: Array<{ camp_week_id: string; type: 'FULL' | 'HALF'; pre_post: 'NONE' | 'PRE' | 'POST' | 'BOTH'; computed_price: number }>;
}) {
  const authCheck = await checkAdminPermissions();
  if (!authCheck.authorized) return { success: false, error: authCheck.error };

  const supabaseAdmin = getAdminSupabase();
  const statoIscrizione = data.pagato >= data.prezzo_totale ? 'COMPLETED' : 'CONFIRMED';

  // 1. Inserisci record principale iscrizione
  const { data: enrollment, error: enrollError } = await supabaseAdmin
    .from('enrollments')
    .insert({
      child_id: data.child_id,
      camp_id: data.camp_id,
      prezzo_totale: data.prezzo_totale,
      pagato: data.pagato,
      stato: statoIscrizione,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      price_snapshot: { source: "admin_wizard" } // Metadato per tracciabilità
    })
    .select('id')
    .single();

  if (enrollError) return { success: false, error: `Errore Iscrizione: ${enrollError.message}` };

  // 2. Se ci sono settimane, inseriscile nella tabella di giunzione
  if (data.weeks && data.weeks.length > 0) {
    const weeksToInsert = data.weeks.map(w => ({
      enrollment_id: enrollment.id,
      child_id: data.child_id, // <-- CORREZIONE AGGIUNTA
      camp_week_id: w.camp_week_id, 
      type: w.type,
      pre_post: w.pre_post,
      computed_price: w.computed_price
    }));

    const { error: weeksError } = await supabaseAdmin
      .from('enrollment_weeks')
      .insert(weeksToInsert);

    if (weeksError) {
      // Se fallisce l'inserimento settimane, faccio il rollback
      await supabaseAdmin.from('enrollments').delete().eq('id', enrollment.id);
      return { success: false, error: `Errore Settimane: ${weeksError.message}` };
    }
  }

  revalidatePath('/admin');
  return { success: true, enrollmentId: enrollment.id };
}