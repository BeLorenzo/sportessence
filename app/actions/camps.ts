'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Nuovi tipi allineati al DB
export type CampWeekData = {
  id?: string // Opzionale se nuova
  label: string
  data_inizio: string
  data_fine: string
}

export type PricingTierData = {
  id?: string // Opzionale se nuovo
  min_weeks: number
  price_per_week: number
}

export type CampData = {
  nome: string
  indirizzo_via: string
  indirizzo_civico: string
  indirizzo_cap: string
  indirizzo_paese: string
  indirizzo_provincia: string
  descrizione?: string
  attivo: boolean
  
  // Aggiungi queste due righe per risolvere l'errore del Form
  data_inizio?: string 
  data_fine?: string

  // Configurazione prezzi
  price_half_day: number
  price_pre: number
  price_post: number
  price_pre_post_bundle: number
  membership_fee: number
  membership_discount_percent: number
  membership_type: 'NONE' | 'MANDATORY' | 'OPTIONAL'

  // Relazioni
  weeks: CampWeekData[]
  tiers: PricingTierData[]
}

// --- GET TUTTI I CAMPI (CON RELAZIONI) ---
export async function getAllCamps() {
  const supabase = await createClient()
  
  // Fetch con le relazioni per calcolare date min/max e prezzi visuali
  const { data, error } = await supabase
    .from('camps')
    .select(`
      *,
      camp_weeks (*),
      camp_pricing_tiers (*)
    `)
    .order('created_at', { ascending: false }) // Ordine creazione, poi ordineremo per data weeks

  if (error) {
    console.error('Errore recupero campi:', error)
    return { error: error.message }
  }

  // Ordiniamo lato client/server in base alla prima settimana disponibile
  const sortedCamps = data?.sort((a, b) => {
    const dateA = a.camp_weeks?.[0]?.data_inizio || '9999-12-31';
    const dateB = b.camp_weeks?.[0]?.data_inizio || '9999-12-31';
    return dateA.localeCompare(dateB);
  })

  return { success: true, camps: sortedCamps }
}

// --- CREA / AGGIORNA CAMPO COMPLESSO ---
// Nota: Per semplicità in questa fase, gestiamo creazione e update con logica simile
// L'update è complesso perché bisogna gestire diff di settimane/tiers. 
// Qui facciamo un approccio "Upsert" semplificato per le relazioni.

export async function upsertCampFull(campData: CampData, campId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Non autenticato' }

  // 1. Prepara dati tabella Master (Camps)
  const masterData = {
    nome: campData.nome,
    indirizzo_via: campData.indirizzo_via,
    indirizzo_civico: campData.indirizzo_civico,
    indirizzo_cap: campData.indirizzo_cap,
    indirizzo_paese: campData.indirizzo_paese,
    indirizzo_provincia: campData.indirizzo_provincia,
    descrizione: campData.descrizione,
    attivo: campData.attivo,
    price_half_day: campData.price_half_day,
    price_pre: campData.price_pre,
    price_post: campData.price_post,
    price_pre_post_bundle: campData.price_pre_post_bundle,
    membership_fee: campData.membership_fee,
    membership_discount_percent: campData.membership_discount_percent,
    membership_type: campData.membership_type,
    // Per compatibilità query vecchie, calcoliamo data inizio/fine globali
    data_inizio: campData.weeks.length > 0 ? campData.weeks.sort((a,b) => a.data_inizio.localeCompare(b.data_inizio))[0].data_inizio : null,
    data_fine: campData.weeks.length > 0 ? campData.weeks.sort((a,b) => b.data_fine.localeCompare(a.data_fine))[0].data_fine : null,
  }

  let currentCampId = campId;

  // 2. Inserimento/Update Master
  if (currentCampId) {
    const { error } = await supabase.from('camps').update(masterData).eq('id', currentCampId);
    if (error) return { error: `Errore update camp: ${error.message}` }
  } else {
    const { data, error } = await supabase.from('camps').insert(masterData).select('id').single();
    if (error) return { error: `Errore insert camp: ${error.message}` }
    currentCampId = data.id;
  }

  if (!currentCampId) return { error: "ID Campo mancante" };

  // 3. Gestione Settimane (Camp Weeks)
  // Strategia semplice: Cancelliamo le settimane non presenti nell'array inviato e upsertiamo le altre
  // (In produzione servirebbe logica più raffinata per non rompere FK su iscrizioni esistenti, ma usiamo ON DELETE RESTRICT nel DB per sicurezza)
  
  // A. Upsert Settimane
  for (const w of campData.weeks) {
    const weekPayload = {
      camp_id: currentCampId,
      label: w.label,
      data_inizio: w.data_inizio,
      data_fine: w.data_fine
    };
    
    if (w.id) {
       await supabase.from('camp_weeks').update(weekPayload).eq('id', w.id);
    } else {
       await supabase.from('camp_weeks').insert(weekPayload);
    }
  }
  
  // B. Eliminazione settimane rimosse dalla UI (quelle nel DB che non sono nel payload)
  if (campData.weeks.length > 0) {
    const payloadIds = campData.weeks.map(w => w.id).filter(Boolean);
    if (payloadIds.length > 0) {
        // Elimina quelle che non sono nella lista degli ID inviati
        await supabase.from('camp_weeks').delete().eq('camp_id', currentCampId).not('id', 'in', `(${payloadIds.join(',')})`);
    }
  }

  // 4. Gestione Tiers (Listini)
  // Stessa logica: Upsert + Delete missing
  await supabase.from('camp_pricing_tiers').delete().eq('camp_id', currentCampId); // Tiers sono leggeri, possiamo ricrearli per pulizia
  
  if (campData.tiers.length > 0) {
    const tiersPayload = campData.tiers.map(t => ({
        camp_id: currentCampId,
        min_weeks: t.min_weeks,
        price_per_week: t.price_per_week
    }));
    const { error: errTiers } = await supabase.from('camp_pricing_tiers').insert(tiersPayload);
    if (errTiers) return { error: `Errore tiers: ${errTiers.message}` };
  }

  revalidatePath('/Campi');
  revalidatePath('/admin/Campi');
  return { success: true };
}

export async function deleteCamp(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('camps').delete().eq('id', id);
    if (error) return { error: error.message }
    revalidatePath('/Campi');
    revalidatePath('/admin/Campi');
    return { success: true }
}