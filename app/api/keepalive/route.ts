import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 1. FONDAMENTALE: Disabilita la cache di Vercel
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    // 2. Client "Stupido" e Diretto (senza cookie, senza sessioni utente)
    // Usa le chiavi pubbliche, tanto dobbiamo solo leggere la tabella camps che è pubblica
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // 3. La Query Sveglia
    // head: true significa "non scaricare i dati, conta solo le righe". È velocissimo ma sveglia il DB.
    const { count, error } = await supabase
      .from('camps')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Keepalive error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database svegliato con successo',
      rows: count,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Keepalive critical error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}