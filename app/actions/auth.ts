'use server'

import { createClient } from '../utils/supabase/server'
import { headers } from "next/headers"

// --- REGISTRAZIONE CON OTP PER CONFERMA ---
export async function signup(formData: any) {
  const supabase = await createClient()
  
  const { 
    email, 
    password, 
    nome, 
    cognome, 
    codiceFiscale, 
    telefono, 
    emailContatto, 
    via,
    civico,
    cap,
    paese,
    provincia,
    recaptchaToken
  } = formData

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      captchaToken: recaptchaToken,
      data: { // I dati vengono salvati nei metadati di sistema di Supabase
        nome: nome,
        cognome: cognome,
        cf: codiceFiscale,
        telefono: telefono,
        email_contatti: emailContatto || email,
        indirizzo_via: via,
        indirizzo_civico: civico,
        indirizzo_paese: paese,
        indirizzo_provincia: provincia,
        indirizzo_cap: cap,
      }
    }
  })

  if (authError) {
    if (authError.message.includes("User already registered") || authError.status === 422) {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })
      if (resendError) {
        return { error: "Errore nell'invio del nuovo codice OTP. Riprova più tardi." }
      }
      return { success: true, needsVerification: true, email: email }
    }
    return { error: authError.message }
  }

  if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
    return { error: "Questa email è già registrata e attiva. Fai il login." }
  }

  return { 
    success: true,
    needsVerification: true, 
    email: email
  }
}

// --- VERIFICA OTP DOPO REGISTRAZIONE ---
export async function verifySignupOTP(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const token = formData.get('token') as string

  if (!email || !token) {
    return { error: "Email e codice richiesti" }
  }

  // Verifica il codice OTP
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup'
  })

  if (error) {
    return { error: "Codice non valido o scaduto" }
  }

  if (!data.user) {
    return { error: "Errore durante la verifica" }
  }

  // ORA CHE È VERIFICATO, RECUPERIAMO I METADATI E CREIAMO IL PROFILO
  const meta = data.user.user_metadata

  // Usiamo upsert invece di insert. Se per caso clicca due volte o cade la rete, non va in errore
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: data.user.id,
      email: email,
      nome: meta.nome,
      cognome: meta.cognome,
      cf: meta.cf,
      telefono: meta.telefono,
      email_contatti: meta.email_contatti,
      indirizzo_via: meta.indirizzo_via,
      indirizzo_civico: meta.indirizzo_civico,
      indirizzo_paese: meta.indirizzo_paese,
      indirizzo_provincia: meta.indirizzo_provincia,
      indirizzo_cap: meta.indirizzo_cap,
    })

  if (profileError) {
    console.error("Errore salvataggio profilo:", profileError)
    // Se fallisce qui è un problema di backend, ma l'utente su Supabase auth è ormai attivo
    return { error: "Verifica riuscita ma errore nel salvataggio dei dati profilo." }
  }

  return { success: true }
}

// --- LOGIN NORMALE CON PASSWORD (non cambia!) ---
export async function login(formData: FormData) {
  
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const token = formData.get('recaptchaToken') as string

  // Login normale con password
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      captchaToken: token 
    }
  })

  if (error) {
    // --- AGGIUNGI QUESTO LOG ---
    console.error("ERRORE SUPABASE LOGIN:", error.message); 
    // ---------------------------
    
    // Se l'errore è "Email not confirmed", dillo all'utente (o gestiscilo)
    if (error.message.includes("Email not confirmed")) {
        return { error: "Devi confermare la tua email prima di accedere." }
    }

    return { error: "Email o password errati" }
  }

  if (!data.user) {
    return { error: "Errore durante il login" }
  }

  // Controlla se è admin
  const { data: adminRow } = await supabase
    .from('admins_whitelist')
    .select('id')
    .eq('id', data.user.id)
    .single()

  const isAdmin = !!adminRow

  return { 
    success: true, 
    role: isAdmin ? 'admin' : 'user' as 'admin' | 'user'
  }
}

// --- RESET PASSWORD: Step 1 - Richiedi OTP ---
export async function forgotPassword(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get("email") as string
  const recaptchaToken = formData.get("recaptchaToken") as string // 1. Recupera il token
  
  if (!email) {
    return { error: "Email richiesta" }
  }

  const origin = (await headers()).get('origin')

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback`, 
    captchaToken: recaptchaToken, 
  })

  if (error) {
    console.error("Errore invio OTP reset:", error.message)
    
    // Se fallisce il captcha, ha senso avvisare l'utente di riprovare
    if (error.message.includes("captcha")) {
        return { error: "Verifica di sicurezza fallita. Ricarica la pagina e riprova." }
    }
    
    // Per altri errori, fingiamo il successo per non rivelare se l'email esiste
    return { success: true } 
  }

  return { success: true }
}

// --- RESET PASSWORD: Step 2 - Verifica OTP e Cambia Password ---
export async function verifyOTPAndResetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  const password = formData.get('password') as string

  if (!email || !token || !password) {
    return { error: "Tutti i campi sono richiesti" }
  }

  // 1. Verifica l'OTP
  const { data, error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'recovery' 
  })

  // Se c'è un errore di verifica, fermati subito
  if (verifyError) {
    return { error: "Codice non valido o scaduto" }
  }

  // 2. IMPORTANTE: A questo punto l'utente è loggato. 
  // Se updateuser fallisce, è perché la sessione non è stata propagata bene nel server client.
  const { error: updateError } = await supabase.auth.updateUser({
    password: password,
  })

  if (updateError) {
    console.error("Errore UpdateUser:", updateError.message)
    return { error: "Sessione stabilita, ma errore nel cambio password. Riprova il login." }
  }

  // 3. Opzionale: Dopo il reset, conviene fare il logout o reindirizzare
  // perché l'utente ha ora una sessione attiva.
  return { success: true }
}

