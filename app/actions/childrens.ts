// app/actions/children.ts
'use server'

import { createClient } from '../utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Tipo per i dati del bambino
export type ChildData = {
  nome: string
  cognome: string
  cf: string
  data_nascita: string
  taglia_maglietta: string
  intolleranze: string[]
}

// --- CREA NUOVO BAMBINO ---
export async function createChild(formData: FormData) {
  const supabase = await createClient()
  
  // 1. Verifica autenticazione
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'Non autenticato' }
  }

  // 2. Estrai dati dal FormData
  const nome = formData.get('nome') as string
  const cognome = formData.get('cognome') as string
  const cf = (formData.get('cf') as string).toUpperCase()
  const data_nascita = formData.get('data_nascita') as string
  const taglia_maglietta = formData.get('taglia_maglietta') as string
  
  // Intolleranze: possono essere una stringa JSON o array
  const intolleranzeRaw = formData.get('intolleranze')
  let intolleranze: string[] = []
  
  if (intolleranzeRaw) {
    try {
      intolleranze = typeof intolleranzeRaw === 'string' 
        ? JSON.parse(intolleranzeRaw)
        : intolleranzeRaw as unknown as string[]
    } catch {
      intolleranze = []
    }
  }

  // 3. Validazioni backend (doppia sicurezza)
  if (!nome || !cognome || !cf || !data_nascita || !taglia_maglietta) {
    return { error: 'Campi obbligatori mancanti' }
  }

  // Valida formato CF
  const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
  if (!cfRegex.test(cf)) {
    return { error: 'Codice Fiscale non valido' }
  }

  // Valida nome e cognome (solo lettere, accenti, spazi)
  const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ''\s-]+$/
  if (!nomeRegex.test(nome) || !nomeRegex.test(cognome)) {
    return { error: 'Nome o cognome contengono caratteri non validi' }
  }

  // Valida data nascita
  const birthDate = new Date(data_nascita)
  const today = new Date()
  const minDate = new Date('1900-01-01')
  
  if (birthDate > today || birthDate < minDate) {
    return { error: 'Data di nascita non valida' }
  }

  // Valida taglia
  const taglie = ['4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL']
  if (!taglie.includes(taglia_maglietta)) {
    return { error: 'Taglia non valida' }
  }

  // 4. Inserisci nel database
  const { data: child, error: insertError } = await supabase
    .from('children')
    .insert({
      parent_id: user.id,
      nome,
      cognome,
      cf,
      data_nascita,
      taglia_maglietta,
      intolleranze,
    })
    .select()
    .single()

  if (insertError) {
    console.error('Errore inserimento bambino:', insertError)
    
    // Gestione CF duplicato
    if (insertError.code === '23505') {
      return { error: 'Questo Codice Fiscale è già registrato' }
    }
    
    return { error: insertError.message }
  }

  // 5. Ricarica la pagina utente
  revalidatePath('/Utente')

  return { success: true, child }
}

// --- AGGIORNA BAMBINO ---
export async function updateChild(childId: string, formData: FormData) {
  const supabase = await createClient()
  
  // 1. Verifica autenticazione
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'Non autenticato' }
  }

  // 2. Verifica che il bambino appartenga all'utente
  const { data: existingChild, error: checkError } = await supabase
    .from('children')
    .select('parent_id')
    .eq('id', childId)
    .single()

  if (checkError || !existingChild) {
    return { error: 'Bambino non trovato' }
  }

  if (existingChild.parent_id !== user.id) {
    return { error: 'Non autorizzato' }
  }

  // 3. Estrai dati
  const nome = formData.get('nome') as string
  const cognome = formData.get('cognome') as string
  const cf = (formData.get('cf') as string)?.toUpperCase()
  const data_nascita = formData.get('data_nascita') as string
  const taglia_maglietta = formData.get('taglia_maglietta') as string
  
  const intolleranzeRaw = formData.get('intolleranze')
  let intolleranze: string[] = []
  
  if (intolleranzeRaw) {
    try {
      intolleranze = typeof intolleranzeRaw === 'string' 
        ? JSON.parse(intolleranzeRaw)
        : intolleranzeRaw as unknown as string[]
    } catch {
      intolleranze = []
    }
  }

  // 4. Validazioni (stesse di create)
  if (!nome || !cognome || !cf || !data_nascita || !taglia_maglietta) {
    return { error: 'Campi obbligatori mancanti' }
  }

  const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
  if (!cfRegex.test(cf)) {
    return { error: 'Codice Fiscale non valido' }
  }

  const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ''\s-]+$/
  if (!nomeRegex.test(nome) || !nomeRegex.test(cognome)) {
    return { error: 'Nome o cognome contengono caratteri non validi' }
  }

  const birthDate = new Date(data_nascita)
  const today = new Date()
  const minDate = new Date('1900-01-01')
  
  if (birthDate > today || birthDate < minDate) {
    return { error: 'Data di nascita non valida' }
  }

  const taglie = ['4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL']
  if (!taglie.includes(taglia_maglietta)) {
    return { error: 'Taglia non valida' }
  }

  // 5. Aggiorna nel database
  const { data: child, error: updateError } = await supabase
    .from('children')
    .update({
      nome,
      cognome,
      cf,
      data_nascita,
      taglia_maglietta,
      intolleranze,
    })
    .eq('id', childId)
    .select()
    .single()

  if (updateError) {
    console.error('Errore aggiornamento bambino:', updateError)
    
    if (updateError.code === '23505') {
      return { error: 'Questo Codice Fiscale è già registrato' }
    }
    
    return { error: updateError.message }
  }

  // 6. Ricarica la pagina
  revalidatePath('/Utente')

  return { success: true, child }
}

// --- ELIMINA BAMBINO ---
export async function deleteChild(childId: string) {
  const supabase = await createClient()
  
  // 1. Verifica autenticazione
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Non autenticato' }

  // 2. Verifica che il bambino appartenga all'utente
  const { data: existingChild, error: checkError } = await supabase
    .from('children')
    .select('parent_id')
    .eq('id', childId)
    .single()

  if (checkError || !existingChild) return { error: 'Bambino non trovato' }
  if (existingChild.parent_id !== user.id) return { error: 'Non autorizzato' }

  // 3. VERIFICA SETTIMANE ATTIVE
  // Query per trovare tutte le settimane di campo associate al bambino
  const { data: bookedWeeks, error: weeksError } = await supabase
    .from('enrollment_weeks')
    .select(`
      camp_weeks!inner (
        data_fine
      )
    `)
    .eq('child_id', childId)

  if (weeksError) {
    console.error("Errore controllo settimane:", weeksError)
    return { error: "Errore durante il controllo delle date." }
  }

  // Se ci sono settimane prenotate, controlliamo se sono future
  if (bookedWeeks && bookedWeeks.length > 0) {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset ore per confronto solo sulla data

    // Verifica se esiste almeno una settimana non ancora conclusa
    const hasActiveWeeks = bookedWeeks.some((row: any) => {
      const dataFineSettimana = new Date(row.camp_weeks.data_fine)
      dataFineSettimana.setHours(0, 0, 0, 0) // Reset ore
      return dataFineSettimana >= today
    })
    
    if (hasActiveWeeks) {
      return { 
        error: 'Impossibile eliminare: ci sono settimane di campo non ancora concluse. Potrai eliminare questo bambino solo dopo la fine dell\'ultimo campo prenotato.' 
      }
    }
  }

  // 4. Se tutto ok, elimina il bambino
  const { error: deleteError } = await supabase
    .from('children')
    .delete()
    .eq('id', childId)

  if (deleteError) {
    console.error('Errore eliminazione bambino:', deleteError)
    
    // Gestione errore foreign key (se manca ON DELETE CASCADE)
    if (deleteError.code === '23503') {
      return { 
        error: 'Impossibile eliminare: esistono dati collegati. Contatta l\'assistenza se il problema persiste.' 
      }
    }
    
    return { error: deleteError.message }
  }

  revalidatePath('/Utente')
  return { success: true }
}

// --- ELIMINA ACCOUNT UTENTE ---
export async function deleteAccount() {
  const supabase = await createClient()
  
  // 1. Verifica autenticazione
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Non autenticato' }

  // 2. Verifica che non ci siano bambini associati
  const { data: children, error: childrenError } = await supabase
    .from('children')
    .select('id, nome, cognome')
    .eq('parent_id', user.id)

  if (childrenError) {
    console.error('Errore controllo children:', childrenError)
    return { error: 'Errore durante il controllo dei dati' }
  }

  if (children && children.length > 0) {
    return { 
      error: `Impossibile eliminare l'account: ci sono ancora ${children.length} bambino/i registrato/i. Elimina prima tutti i bambini.` 
    }
  }

  // 3. Verifica pagamenti in sospeso (sicurezza extra)
const { data: enrollments, error: enrollmentsError } = await supabase
  .from('enrollments')
  .select(`
    prezzo_totale, 
    pagato, 
    children!inner(parent_id)
  `)
  .eq('children.parent_id', user.id); // Filtriamo sul parent_id dentro la tabella children

if (enrollmentsError) {
  console.error('Errore controllo enrollments:', enrollmentsError);
  return { error: 'Errore durante il controllo dei pagamenti' };
}

if (enrollments && enrollments.length > 0) {
  // Calcoliamo se c'è un debito (prezzo_totale > pagato)
  const hasDebt = enrollments.some(e => {
    const totale = e.prezzo_totale || 0;
    const pagato = e.pagato || 0;
    return (totale - pagato) > 0;
  });

  if (hasDebt) {
    return { 
      error: 'Impossibile eliminare l\'account: ci sono pagamenti in sospeso. Salda tutti i debiti prima di procedere.' 
    };
  }
}

  // 4. Elimina il profilo (CASCADE dovrebbe gestire le relazioni)
  const { error: deleteError } = await supabase
    .from('profiles')
    .delete()
    .eq('id', user.id)

  if (deleteError) {
    console.error('Errore eliminazione profilo:', deleteError)
    return { error: 'Errore durante l\'eliminazione del profilo: ' + deleteError.message }
  }

  return { success: true }
}