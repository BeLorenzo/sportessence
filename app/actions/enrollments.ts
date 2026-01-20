'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type EnrollmentData = {
  child_id: string
  camp_id: string
  data_inizio: string
  data_fine: string
  tipo_iscrizione: 'giornata_intera' | 'mezza_giornata'
  opzioni_extra: 'nessuno' | 'pre' | 'post' | 'entrambi'
}

export async function createEnrollment(data: EnrollmentData) {
  const supabase = await createClient()
  
  // 1. Verifica autenticazione
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Devi essere loggato per effettuare un\'iscrizione.' }
  }

  // 2. Recupera info campo per calcolo prezzo e validazione
  const { data: camp, error: campError } = await supabase
    .from('camps')
    .select('*')
    .eq('id', data.camp_id)
    .single()

  if (campError || !camp) {
    return { error: 'Campo non trovato o non valido.' }
  }

  // 3. Calcolo delle settimane (approssimato per eccesso)
  const start = new Date(data.data_inizio)
  const end = new Date(data.data_fine)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  // Aggiungiamo 1 giorno per includere l'ultimo giorno nel calcolo se necessario, 
  // oppure usiamo la logica standard dei 7 giorni.
  // Qui assumiamo che 1 settimana = 7 giorni.
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) 
  const weeks = Math.max(1, Math.ceil(diffDays / 7))

  // 4. Calcolo Prezzo Totale (Logica Server-Side)
  let prezzoBase = camp.prezzo || 0 // Prezzo settimanale dal DB
  
  // Esempio logica sconti/extra (PERSONALIZZA QUESTA PARTE)
  if (data.tipo_iscrizione === 'mezza_giornata') {
    prezzoBase = prezzoBase * 0.7 // Esempio: 70% del prezzo per mezza giornata
  }

  let costoExtra = 0
  if (data.opzioni_extra === 'pre' || data.opzioni_extra === 'post') costoExtra = 15 // €15 a settimana
  if (data.opzioni_extra === 'entrambi') costoExtra = 25 // €25 a settimana

  const prezzoTotale = (prezzoBase + costoExtra) * weeks

  // 5. Inserimento nel DB
  const { error: insertError } = await supabase
    .from('enrollments')
    .insert({
      child_id: data.child_id,
      camp_id: data.camp_id,
      user_id: user.id, // Importante per collegare al genitore
      data_inizio: data.data_inizio,
      data_fine: data.data_fine,
      tipo_iscrizione: data.tipo_iscrizione, // Assicurati di avere questa colonna nel DB o rimuovila
      opzioni_extra: data.opzioni_extra,     // Assicurati di avere questa colonna nel DB o rimuovila
      prezzo_totale: prezzoTotale,
      importo_pagato: 0,
      saldata: false,
      stato: 'confirmed' // Come richiesto
    })

  if (insertError) {
    console.error('Errore iscrizione:', insertError)
    return { error: 'Errore durante il salvataggio dell\'iscrizione. Riprova.' }
  }

  revalidatePath('/Iscrizioni')
  revalidatePath('/Utente')
  
  return { success: true }
}