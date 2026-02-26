import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {


  const path = request.nextUrl.pathname
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          const oneWeek = 60 * 60 * 24 * 7;
          const newOptions = { 
            ...options, 
            maxAge: oneWeek,
            expires: new Date(Date.now() + oneWeek * 1000) 
          };
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, newOptions);
        });
      },
    },
    }
  )

  // 2. CHECK ADMIN (Necessario per farti passare)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  const isAdmin = user?.app_metadata?.role == 'admin'
  
  // ============================================================
  // 🚧 BLOCCO MANUTENZIONE TOTALE
  // ============================================================
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  if (isMaintenanceMode) {
    // Se sei Admin, passi sempre. Se non lo sei, controlliamo dove vuoi andare.
    if (!isAdmin) {
      // Rotte strettamente necessarie per far funzionare il sito tecnicamente
      const isSystemPath = 
        path.startsWith('/api') ||     // Auth e Database
        path.startsWith('/_next') ||   // CSS e JS di Next.js
        path.includes('.')             // Immagini, favicon, loghi
      
      // Le uniche due pagine visibili agli umani: Manutenzione e Login (per te)
      const isPublicPage = 
        path === '/manutenzione' 

      // Se non è roba di sistema E non è una pagina permessa -> Manutenzione
      if (!isSystemPath && !isPublicPage) {
        // Rewrite mantiene l'URL ma mostra il contenuto di manutenzione
        return NextResponse.rewrite(new URL('/manutenzione', request.url))
      }
    } else {
    }
  }
  // ============================================================

  // 3. PROTEZIONE ROTTE ADMIN (Tua logica originale standard)
  if (path.startsWith('/admin')) {
    if (!user || !isAdmin) {
      const redirectUrl = new URL(user ? '/' : '/Login', request.url)
      if (!user) redirectUrl.searchParams.set('redirect', path)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('Cache-Control', 'no-store, must-revalidate')
      return response
    }
  }

  // 4. PROTEZIONE ROTTE UTENTE (Tua logica originale standard)
  // Nota: In manutenzione questo codice non viene nemmeno raggiunto dai non-admin perché bloccati prima
  const userProtectedRoutes = ['/Utente', '/Iscrizione', '/Iscrizioni']
  const isUserProtectedRoute = userProtectedRoutes.some(route => path.startsWith(route))
  
  if (isUserProtectedRoute) {
    if (!user) {
      const redirectUrl = new URL('/Login', request.url)
      redirectUrl.searchParams.set('redirect', path)
      const response = NextResponse.redirect(redirectUrl)
      response.headers.set('Cache-Control', 'no-store, must-revalidate')
      return response
    }
  }

  // 5. REDIRECT LOGIN (Per pulizia)
  if (user && path === '/Login') {
    const homeUrl = isAdmin ? '/admin/Dashboard' : '/'
    return NextResponse.redirect(new URL(homeUrl, request.url))
  }

  // 6. HEADERS NO-CACHE
  if (path.startsWith('/admin') || path.startsWith('/Utente') || path.startsWith('/Iscrizione')) {
    supabaseResponse.headers.set('Cache-Control', 'no-store, must-revalidate')
    supabaseResponse.headers.set('Pragma', 'no-cache')
    supabaseResponse.headers.set('Expires', '0')
  }

  return supabaseResponse
}

export const config = {
  matcher: [
'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|ico|css|js|map|json|webmanifest)$).*)',  ],
}