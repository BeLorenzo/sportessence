/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@react-email/components',
    '@react-email/render',
    '@react-email/html',
    '@react-email/tailwind'
  ],
  // Abilita React Strict Mode per migliori pratiche
  reactStrictMode: true,

  // Configurazione immagini
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.ascsport.it',
      },
      {
        protocol: 'https',
        hostname: 'www.seristampa.promo',
      },
      {
        protocol: 'https',
        hostname: 'centrosp.it',
      },
    ],
  },
  // Security Headers - IMPORTANTE PER SICUREZZA
  async headers() {
    return [
      {
        // Applica a tutte le route
        source: '/:path*',
        headers: [
          // Content Security Policy (CSP)
          // Previene XSS attacks
          {
            key: 'Content-Security-Policy',
            value: [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://challenges.cloudflare.com",
  
  "style-src 'self' 'unsafe-inline'",
  
  "img-src 'self' data: https:",
  
  "font-src 'self' data:",
  
  "connect-src 'self' https://*.supabase.co https://www.google.com/recaptcha/ https://nominatim.openstreetmap.org https://challenges.cloudflare.com",
  
  "frame-src 'self' https://www.google.com/recaptcha/ https://challenges.cloudflare.com",
  
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests"
].join('; ')
          },
          // X-Frame-Options: Previene clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // X-Content-Type-Options: Previene MIME-type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // X-XSS-Protection: Protezione XSS legacy
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Referrer-Policy: Controlla referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Permissions-Policy: Disabilita feature non necessarie
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
          },
          // Strict-Transport-Security: Forza HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }
    ]
  },

  // Configurazione build
  compiler: {
    // Rimuovi console.log in produzione
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Ottimizzazioni
  swcMinify: true,
}
module.exports = nextConfig

