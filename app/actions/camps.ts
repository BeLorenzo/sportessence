'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- TIPI ---

export type CampWeekData = {
  id?: string 
  label: string
  data_inizio: string
  data_fine: string
}

export type PricingTierData = {
  id?: string 
  min_weeks: number
  price_per_week: number
  discount_percent: number
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
  
  data_inizio?: string 
  data_fine?: string

  // Configurazione prezzi
  price_half_day: number
  price_pre: number
  price_post: number
  price_pre_post_bundle: number
  
  // Nuova gestione sconti fratelli
  sibling_discount_value: number      // Sconto (Percentuale o Assoluto)
  sibling_discount_week_price: number // Prezzo Fisso Settimanale (NUOVO)

  // Relazioni
  weeks: CampWeekData[]
  tiers: PricingTierData[]
}

// --- GET TUTTI I CAMPI ---
export async function getAllCamps() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('camps')
    .select(`
      *,
      camp_weeks (*),
      camp_pricing_tiers (*)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Errore recupero campi:', error)
    return { error: error.message }
  }

  const sortedCamps = data?.sort((a, b) => {
    const dateA = a.camp_weeks?.[0]?.data_inizio || '9999-12-31';
    const dateB = b.camp_weeks?.[0]?.data_inizio || '9999-12-31';
    return dateA.localeCompare(dateB);
  })

  return { success: true, camps: sortedCamps }
}

// --- CREA / AGGIORNA CAMPO ---
export async function upsertCampFull(campData: CampData, campId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Non autenticato' }

  // 1. Prepara dati tabella Master (Camps)
  // Qui mancava il mapping di sibling_discount_week_price
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
    
    // MAPPING CORRETTO DEI NUOVI CAMPI
    sibling_discount_value: campData.sibling_discount_value,
    sibling_discount_week_price: campData.sibling_discount_week_price,

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
  const payloadIds = campData.weeks.map(w => w.id).filter(Boolean);

  // A. Upsert
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
  
  // B. Delete obsolete
  if (campData.weeks.length > 0 && payloadIds.length > 0) {
      // Elimina quelle che non sono nella lista degli ID inviati
      // (Nota: se l'array è vuoto non entra qui, se vuoi cancellare tutto in caso di array vuoto serve logica extra, 
      // ma di solito un campo ha sempre settimane)
      await supabase.from('camp_weeks').delete().eq('camp_id', currentCampId).not('id', 'in', `(${payloadIds.join(',')})`);
  } else if (campData.weeks.length === 0) {
      // Se l'array inviato è vuoto, cancella tutto (se non ci sono vincoli FK)
      await supabase.from('camp_weeks').delete().eq('camp_id', currentCampId);
  }

  // 4. Gestione Tiers (Listini)
  await supabase.from('camp_pricing_tiers').delete().eq('camp_id', currentCampId);
  
  if (campData.tiers.length > 0) {
    const tiersPayload = campData.tiers.map(t => ({
        camp_id: currentCampId,
        min_weeks: t.min_weeks,
        price_per_week: t.price_per_week,
        discount_percent: t.discount_percent || 0
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
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { error: 'Non autenticato' }
    
    const { error } = await supabase.from('camps').delete().eq('id', id);
    if (error) return { error: error.message }
    
    revalidatePath('/Campi');
    revalidatePath('/admin/Campi');
    return { success: true }
}