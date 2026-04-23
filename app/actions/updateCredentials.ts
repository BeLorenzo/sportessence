'use server'

import { createClient } from '../utils/supabase/server'

// ==========================================
// 1. CAMBIO EMAIL (Step 1: Richiesta OTP con Password)
// ==========================================
export async function requestEmailChangeOTP(newEmail: string, currentPassword: string, captchaToken: string) {
  const supabase = await createClient()
  
  // 1. Check Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Non autenticato' }

  // 2. Validazioni Input
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
  if (!emailRegex.test(newEmail)) return { error: 'Email non valida' }
  
  if (newEmail.toLowerCase() === user.email?.toLowerCase()) {
    return { error: 'La nuova email è uguale a quella attuale' }
  }

  // 3. BLOCCO DI SICUREZZA: Verifica Password + Turnstile
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
    options: {
      captchaToken: captchaToken
    }
  })

  if (signInError) {
    console.error("Errore verifica password per cambio email:", signInError.message);
    if (signInError.message.toLowerCase().includes("captcha")) {
      return { error: 'Verifica di sicurezza fallita. Riprova.' }
    }
    return { error: 'La password attuale non è corretta' }
  }

  // 4. Invia richiesta OTP alla NUOVA email
  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    { emailRedirectTo: undefined } 
  )

  if (error) {
    if (error.message.includes('already registered')) return { error: 'Email già in uso da un altro utente' }
    return { error: error.message }
  }

  return { success: true }
}

// ==========================================
// 2. CAMBIO EMAIL (Step 2: Verifica OTP)
// ==========================================
export async function verifyEmailChangeOTP(newEmail: string, token: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Non autenticato' }

  if (!token || token.length < 6) return { error: 'Codice non valido' }

  const { error: verifyError } = await supabase.auth.verifyOtp({
    email: newEmail,
    token: token,
    type: 'email_change'
  })

  if (verifyError) return { error: 'Codice errato o scaduto' }

  // Sincronizza il profilo
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ email: newEmail })
    .eq('id', user.id)

  if (profileError) {
    console.error('Errore sync profilo:', profileError)
  }

  return { success: true }
}

// ==========================================
// 3. CAMBIO PASSWORD (Sicuro)
// ==========================================
export async function changePassword(currentPassword: string, newPassword: string, captchaToken: string) {
  const supabase = await createClient()
  
  // 1. Check Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Non autenticato' }

  // 2. Validazioni Sicurezza Password
  if (newPassword.length < 8) return { error: 'Minimo 8 caratteri' }
  if (!/[A-Z]/.test(newPassword)) return { error: 'Serve una maiuscola' }
  if (!/[a-z]/.test(newPassword)) return { error: 'Serve una minuscola' }
  if (!/[0-9]/.test(newPassword)) return { error: 'Serve un numero' }
  if (!/[^A-Za-z0-9]/.test(newPassword)) return { error: 'Serve un carattere speciale' }

  // 3. Verifica della vecchia password CON Turnstile
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
    options: {
      captchaToken: captchaToken // <-- Il parametro vitale
    }
  })

  if (signInError) {
    console.error("Errore di verifica vecchia password:", signInError.message);
    
    // Distinguiamo l'errore del captcha dall'errore della password
    if (signInError.message.toLowerCase().includes("captcha")) {
      return { error: 'Verifica di sicurezza fallita. Riprova.' }
    }
    return { error: 'La password attuale non è corretta' }
  }

  // 4. Aggiorna Password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (updateError) return { error: updateError.message }

  return { success: true }
}