import Link from "next/link";

export default function Privacy() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Header */}
      <section className="bg-blue-light py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-white/90">
            Informativa sul trattamento dei dati personali ai sensi del GDPR
          </p>
        </div>
      </section>

      {/* Contenuto */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          
          {/* Introduzione */}
          <div>
            <p className="text-gray-700 leading-relaxed mb-4">
              La presente Privacy Policy descrive le modalità di gestione del sito web 
              <strong> SPORTESSENCE</strong> in riferimento al trattamento dei dati personali 
              degli utenti che lo consultano e si iscrivono ai nostri servizi.
            </p>
            <p className="text-gray-700 leading-relaxed">
              L'informativa è resa ai sensi dell'art. 13 del Regolamento UE 2016/679 
              (GDPR - General Data Protection Regulation).
            </p>
          </div>

          {/* Titolare del Trattamento */}
          <div className="border-l-4 border-cyan-600 pl-6">
            <h2 className="text-2xl font-bold text-blue-deep mb-4">
              Titolare del Trattamento
            </h2>
    <p className="text-gray-700 leading-relaxed">
  <strong>SPORTESSENCE ASD/APS</strong><br />
  Sede legale: Via L. Mascherpa 4, 22100 Como (CO)<br />
  P.IVA: 04231980139<br />
  CF: 95150810133<br />
  Codice SDI: KRRH6B9<br />
  Email: sportessence.asd.aps@gmail.com<br />
  Telefono: 342 039 4661
</p>








          </div>

          {/* Tipologia di Dati Raccolti */}
          <div>
            <h2 className="text-2xl font-bold text-blue-deep mb-4">
              Dati Personali Raccolti
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-blue-deep mb-2">
                  1. Dati di Navigazione
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  I sistemi informatici e le procedure software preposte al funzionamento 
                  di questo sito acquisiscono, nel corso del loro normale esercizio, alcuni 
                  dati personali la cui trasmissione è implicita nell'uso dei protocolli di 
                  comunicazione di Internet (es. indirizzi IP, tipo di browser, sistema operativo).
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-deep mb-2">
                  2. Dati Forniti Volontariamente dall'Utente
                </h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Durante la registrazione e l'iscrizione ai campi estivi, raccogliamo:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Dati del genitore/tutore:</strong> Nome, cognome, codice fiscale, 
                    email, numero di telefono, indirizzo di residenza</li>
                  <li><strong>Dati del minore:</strong> Nome, cognome, data di nascita, 
                    codice fiscale, sesso</li>
                  <li><strong>Dati sanitari:</strong> Allergie, intolleranze alimentari, 
                    patologie rilevanti (solo se dichiarate)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Finalità del Trattamento */}
          <div>
            <h2 className="text-2xl font-bold text-blue-deep mb-4">
              Finalità del Trattamento
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              I dati personali sono raccolti e trattati per le seguenti finalità:
            </p>
            
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-deep mb-1">
                  a) Gestione delle iscrizioni
                </h4>
                <p className="text-sm text-gray-700">
                  Base giuridica: Esecuzione del contratto (art. 6, comma 1, lett. b GDPR)
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-deep mb-1">
                  b) Adempimenti normativi e fiscali
                </h4>
                <p className="text-sm text-gray-700">
                  Base giuridica: Obblighi di legge (art. 6, comma 1, lett. c GDPR)
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-deep mb-1">
                  c) Comunicazioni relative al servizio
                </h4>
                <p className="text-sm text-gray-700">
                  Base giuridica: Legittimo interesse (art. 6, comma 1, lett. f GDPR)
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-deep mb-1">
                  d) Sicurezza e tutela della salute dei partecipanti
                </h4>
                <p className="text-sm text-gray-700">
                  Base giuridica: Consenso esplicito per dati sanitari (art. 9, comma 2, lett. a GDPR)
                </p>
              </div>
            </div>
          </div>

          {/* Cookie */}
          <div>
            <h2 className="text-2xl font-bold text-blue-deep mb-4">
              Cookie e Tecnologie Utilizzate
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Questo sito utilizza <strong>esclusivamente cookie tecnici</strong> necessari 
              per il funzionamento e la sicurezza del sito.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                ✓ <strong>Cookie tecnici di sessione</strong>: Gestiti da Supabase per l'autenticazione<br />
                ✓ <strong>Tecnologie di sicurezza</strong>: Utilizziamo Cloudflare Turnstile per la protezione da bot e spam. 
                Questo servizio non traccia gli utenti per fini commerciali.<br />
                ✓ <strong>Non utilizziamo</strong> cookie di profilazione, analytics o marketing<br />
                ✓ <strong>Non è richiesto il consenso</strong> per i cookie tecnici (art. 122 
                del Codice Privacy)
              </p>
            </div>
          </div>

          {/* Modalità di Trattamento */}
          <div>
            <h2 className="text-2xl font-bold text-blue-deep mb-4">
              Modalità di Trattamento e Luogo
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              I dati personali sono trattati esclusivamente con strumenti elettronici e automatizzati, 
              per il tempo strettamente necessario a conseguire gli scopi per cui sono stati raccolti. 
              I dati sono conservati su server sicuri situati preferibilmente all'interno dell'Unione Europea 
              o in paesi che garantiscono un livello di protezione adeguato (conformità GDPR o Data Privacy Framework).
            </p>
            
            <p className="text-gray-700 leading-relaxed mb-2 font-semibold">
              I provider tecnologici (Responsabili del Trattamento) utilizzati sono:
            </p>
            
            <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-4 space-y-1 ml-2">
              <li>
                <strong>Supabase:</strong> Piattaforma di Database e Autenticazione (gestione profili utenti e dati iscrizioni).
              </li>
              <li>
                <strong>Vercel Inc.:</strong> Infrastruttura di Hosting del sito web, gestione dei log di sistema e sicurezza serverless.
              </li>
              <li>
                <strong>Resend:</strong> Servizio per l'invio di email transazionali (es. conferme di iscrizione, reset password).
              </li>
              <li>
                <strong>Cloudflare (Turnstile):</strong> Servizio di sicurezza per la protezione da bot e spam nei moduli.
              </li>
            </ul>

            <p className="text-gray-700 leading-relaxed">
              Specifiche misure di sicurezza sono osservate per prevenire la perdita dei dati, 
              usi illeciti o non corretti ed accessi non autorizzati. 
              Le comunicazioni tra l'utente e il server avvengono esclusivamente tramite protocollo sicuro e crittografato (HTTPS/TLS).
            </p>
          </div>

          {/* Periodo di Conservazione */}
          <div>
            <h2 className="text-2xl font-bold text-blue-deep mb-4">
              Periodo di Conservazione
            </h2>
            <p className="text-gray-700 leading-relaxed">
              I dati personali vengono conservati per il tempo necessario a soddisfare le 
              finalità per cui sono stati raccolti:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3 ml-4">
              <li>Dati di iscrizione: fino a 10 anni dalla cessazione del rapporto 
                (obblighi fiscali e contabili)</li>
              <li>Dati sanitari: fino al termine del servizio più il periodo necessario 
                per eventuali contestazioni</li>
            </ul>
          </div>

          {/* Diritti dell'Interessato */}
          <div>
            <h2 className="text-2xl font-bold text-blue-deep mb-4">
              Diritti dell'Interessato
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Gli utenti hanno il diritto di:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Accesso:</strong> Ottenere conferma dell'esistenza dei propri dati 
                e riceverne copia (art. 15 GDPR)</li>
              <li><strong>Rettifica:</strong> Correggere dati inesatti o integrarli (art. 16 GDPR)</li>
              <li><strong>Cancellazione:</strong> Ottenere la cancellazione dei dati ("diritto 
                all'oblio") quando non più necessari (art. 17 GDPR)</li>
              <li><strong>Limitazione:</strong> Limitare il trattamento in determinati casi 
                (art. 18 GDPR)</li>
              <li><strong>Portabilità:</strong> Ricevere i dati in formato strutturato e 
                trasmetterli ad altro titolare (art. 20 GDPR)</li>
              <li><strong>Opposizione:</strong> Opporsi al trattamento per motivi legittimi 
                (art. 21 GDPR)</li>
              <li><strong>Revoca del consenso:</strong> Revocare in qualsiasi momento il 
                consenso prestato</li>
            </ul>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-gray-700">
                <strong>Per esercitare i tuoi diritti</strong>, contattaci via email a{" "}
                <a 
                  href="mailto:sportessence.asd.aps@gmail.com" 
                  className="text-cyan-600 underline font-semibold"
                >
                  sportessence.asd.aps@gmail.com
                </a>{" "}
                o telefonicamente al 342 039 4661.
              </p>
            </div>
          </div>

          {/* Reclamo */}
          <div>
            <h2 className="text-2xl font-bold text-blue-deep mb-4">
              Reclamo all'Autorità di Controllo
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Gli interessati che ritengono che il trattamento dei dati personali effettuato 
              attraverso questo sito avvenga in violazione del GDPR hanno il diritto di 
              proporre reclamo al Garante per la Protezione dei Dati Personali:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-3">
              <p className="text-sm text-gray-700">
                <strong>Garante per la Protezione dei Dati Personali</strong><br />
                Piazza Venezia, 11 - 00187 Roma<br />
                Email: garante@gpdp.it<br />
                PEC: protocollo@pec.gpdp.it<br />
                Sito web: www.garanteprivacy.it
              </p>
            </div>
          </div>

          {/* Modifiche */}
          <div>
            <h2 className="text-2xl font-bold text-blue-deep mb-4">
              Modifiche alla Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Questa Privacy Policy può essere soggetta a modifiche. Si consiglia di 
              consultarla periodicamente. La data dell'ultimo aggiornamento è riportata 
              in fondo alla pagina.
            </p>
          </div>

          {/* Data ultima modifica */}
          <div className="border-t pt-6 text-sm text-gray-500">
            <p>Ultimo aggiornamento: Febbraio 2026</p>
          </div>
        </div>

        {/* Torna alla Home */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-cyan-600 text-white px-8 py-3 rounded-lg font-semibold 
              hover:bg-cyan-700 transition-colors"
          >
            ← Torna alla Home
          </Link>
        </div>
      </section>
    </main>
  );
}