import { createClient } from "@/app/utils/supabase/server";
import Link from "next/link";
import { Calendar, MapPin, Users, Mail, XCircle } from "lucide-react";

// Disabilita cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CampiPage() {
  const supabase = await createClient();
  
  // Verifica se l'utente è loggato
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  // Recupera tutti i campi (anche quelli disattivati)
  const { data: camps, error } = await supabase
    .from('camps')
    .select('*')
    .order('data_inizio', { ascending: true });

  if (error) {
    console.error('Errore caricamento campi:', error);
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <main className="min-h-screen bg-cream relative">
      {/* Immagine di sfondo con overlay */}
      <div className="fixed inset-0 z-0">
        <img
          src="/imgs/sfondoRegistrazione.jpg"
          alt="Sfondo"
          className="w-full h-full object-cover opacity-10"
        />
      </div>

      {/* Contenuto */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="bg-blue-light text-white py-20 px-6 shadow-xl">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              I Nostri Campi Estivi
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Scopri tutti i nostri campi estivi disponibili. Avventura, sport, creatività e tanto divertimento ti aspettano!
            </p>
          </div>
        </section>

      {/* Sezione Descrizione Generale Campi */}
<section className="pt-20 px-6">
  <div className="max-w-7xl mx-auto space-y-20">

    {/* Intro */}
    <div className="text-center max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-blue-deep mb-6">
        Molto più di un campo estivo
      </h2>
      <p className="text-gray-700 text-lg leading-relaxed">
        I nostri campi estivi sportivi sono pensati per offrire ai bambini e ai ragazzi
        un'esperienza completa fatta di movimento, gioco e socialità.
        Ogni giornata è strutturata per garantire divertimento, sicurezza e crescita personale,
        seguiti da istruttori qualificati.
      </p>
    </div>

    {/* Attività */}
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <div>
        <h3 className="text-2xl font-bold text-blue-deep mb-4">
          Sport, gioco e movimento ogni giorno
        </h3>
        <ul className="space-y-4 text-gray-700 text-lg">
          <li className="flex items-start gap-3">
            <span>⚽</span>
            Attività multisportive e giochi di squadra
          </li>
          <li className="flex items-start gap-3">
            <span>🏃‍♂️</span>
            Esercizi motori adatti all'età e alle capacità di ciascuno
          </li>
          <li className="flex items-start gap-3">
            <span>🤝</span>
            Socializzazione e rispetto delle regole
          </li>
          <li className="flex items-start gap-3">
            <span>🧑‍🏫</span>
            Educatori e istruttori sempre presenti
          </li>
        </ul>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
        <h4 className="text-xl font-bold text-blue-deep mb-4">
          La giornata tipo
        </h4>
        <ul className="space-y-4 text-gray-700">
          <li>
            <span className="font-semibold">Accoglienza e riscaldamento</span><br />
            Attività leggere per iniziare la giornata nel modo giusto.
          </li>
          <li>
            <span className="font-semibold">Attività sportive e giochi organizzati</span><br />
            Sport, tornei e giochi di gruppo.
          </li>
          <li>
            <span className="font-semibold">Pausa e pranzo</span><br />
            Momento di recupero e socializzazione.
          </li>
          <li>
            <span className="font-semibold">Attività pomeridiane e rientro</span><br />
            Giochi più leggeri e conclusione della giornata.
          </li>
        </ul>
      </div>
    </div>

    {/* Dove siamo */}
    <div className="text-center max-w-4xl mx-auto bg-blue-light 
      rounded-2xl p-10 shadow-lg">
      <h3 className="text-2xl font-bold text-white mb-4">
        Più sedi nel territorio comasco
      </h3>
      <p className="text-white font-semi-bold text-lg leading-relaxed">
        I nostri campi estivi sono attivi in diverse sedi nel territorio comasco,
        per offrire alle famiglie una soluzione comoda e facilmente raggiungibile.
        Ogni struttura è selezionata per garantire spazi adeguati, sicurezza e qualità.
      </p>
    </div>

    {/* CTA */}
    <div className="text-center">
      <h3 className="text-2xl font-bold text-blue-deep mb-4">
        Scegli il campo più adatto a te
      </h3>
      <p className="text-gray-600 text-lg">
        Scopri qui sotto date, sedi e disponibilità dei nostri campi estivi.
      </p>
    </div>

  </div>
</section>



        {/* Campi disponibili */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            {!camps || camps.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center">
                <div className="text-6xl mb-4">🏕️</div>
                <p className="text-gray-700 text-xl mb-2 font-semibold">
                  Al momento non ci sono campi disponibili
                </p>
                <p className="text-gray-600">
                  Torna presto per scoprire le nostre prossime avventure!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:w-230 lg:mx-auto gap-8">
                {camps.map((camp) => {
                  const postiEsauriti = camp.posti_disponibili !== null && 
                                       camp.posti_disponibili !== undefined && 
                                       camp.posti_disponibili === 0;
                  
                  const campoDisattivato = !camp.attivo;
                  const iscrizioniNonPossibili = campoDisattivato || postiEsauriti;
                  
                  return (
                    <div 
                      key={camp.id} 
                      className={`bg-white/95 rounded-2xl shadow-xl overflow-hidden 
                        hover:shadow-2xl hover:-translate-y-2 transition-all duration-300
                        flex flex-col min-h-[520px] ${
                          campoDisattivato && isLoggedIn ? 'opacity-75' : ''
                        }`}
                    >
                      {/* Header Card con immagine di sfondo */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src="/imgs/sfondoRegistrazione.jpg"
                          alt={camp.nome}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${
                          campoDisattivato && isLoggedIn
                            ? 'from-gray-700/90 via-gray-600/70' 
                            : 'from-cyan-600/90 via-cyan-600/70'
                        } to-transparent flex flex-col justify-end p-6`}>
                          {/* Badge Disattivato - solo per utenti loggati */}
                          {campoDisattivato && isLoggedIn && (
                            <div className="absolute top-3 right-3">
                              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                <XCircle size={14} />
                                Iscrizioni Chiuse
                              </span>
                            </div>
                          )}
                          
                          <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                            {camp.nome}
                          </h3>
                          <div className="flex items-center gap-2 text-white/90 text-sm drop-shadow">
                            <MapPin size={16} className="flex-shrink-0" />
                            <span className="line-clamp-1">
                              {camp.indirizzo_via} {camp.indirizzo_civico}, {camp.indirizzo_paese} ({camp.indirizzo_provincia})
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Body Card - flex-grow per occupare spazio */}
                      <div className="p-6 flex flex-col flex-grow">
                        {/* Date - sempre presente */}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="bg-cyan-50 p-2 rounded-lg">
                            <Calendar className="text-cyan-600 flex-shrink-0" size={20} />
                          </div>
                          <div className="text-sm">
                            <p className="font-semibold text-gray-800 mb-1">Date del campo</p>
                            <p className="text-gray-600 leading-snug">
                              Dal <span className="font-medium">{formatDate(camp.data_inizio)}</span>
                              <br />
                              al <span className="font-medium">{formatDate(camp.data_fine)}</span>
                            </p>
                          </div>
                        </div>

                        {/* Descrizione - solo se presente */}
                        {camp.descrizione && (
                          <div className="mb-4">
                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                              {camp.descrizione}
                            </p>
                          </div>
                        )}

                        {/* Prezzo - solo se definito */}
                        {camp.prezzo !== null && camp.prezzo !== undefined && (
                          <div className="mb-4 bg-gradient-to-br from-blue-50 to-cyan-50 border border-cyan-100 rounded-xl p-4">
                            <p className="text-xs text-gray-600 mb-1">Prezzo indicativo per settimana</p>
                            <p className="text-3xl font-bold text-blue-900">
                              €{camp.prezzo.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              *Possibili sconti e offerte disponibili
                            </p>
                          </div>
                        )}

                        {/* Spacer per spingere i pulsanti in basso */}
                        <div className="flex-grow"></div>

                        {/* Pulsante Iscriviti / Login / Contattaci / Disattivato */}
                        {!isLoggedIn ? (
                          // Utente NON loggato - vede sempre "Vai al Login" (campo attivo o disattivo)
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 text-center font-medium">
                              Accedi per iscriverti
                            </p>
                            <Link
                              href="/Login"
                              className="block w-full bg-gray-700 text-white text-center py-3 rounded-xl 
                                hover:bg-gray-800 transition-all duration-300 font-semibold shadow-md"
                            >
                              Vai al Login
                            </Link>
                          </div>
                        ) : campoDisattivato ? (
                          // Utente loggato + campo disattivato - pulsante grigio non cliccabile
                          <div className="space-y-2">
                            <button
                              disabled
                              className="w-full bg-gray-300 text-gray-500 py-3 rounded-xl 
                                cursor-not-allowed font-semibold opacity-60"
                            >
                              🚫 Iscrizioni Chiuse
                            </button>
                            <p className="text-xs text-gray-500 text-center">
                              Per informazioni:{" "}
                              <a 
                                href="mailto:sportessence.asd.aps@gmail.com"
                                className="text-cyan-600 hover:underline"
                              >
                                sportessence.asd.aps@gmail.com
                              </a>
                            </p>
                          </div>
                        ) : postiEsauriti ? (
                          // Utente loggato + posti esauriti ma campo attivo
                          <a
                            href="mailto:sportessence.asd.aps@gmail.com?subject=Richiesta%20Informazioni%20Campo%20Estivo"
                            className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white 
                              py-3 rounded-xl shadow-md hover:-translate-y-1 hover:shadow-xl 
                              hover:bg-orange-600 transition-all duration-300 ease-out font-semibold"
                          >
                            <Mail size={20} />
                            Contattaci per Info
                          </a>
                        ) : (
                          // Utente loggato + campo attivo - può iscriversi
                          <Link
                            href={`/Iscrizione?campo=${camp.id}`}
                            className="block w-full bg-blue-light text-white 
                              text-center py-3 rounded-xl shadow-md hover:-translate-y-1 hover:shadow-xl 
                              transition-all duration-300 ease-out font-semibold"
                          >
                            🎉 Iscriviti Ora
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Call to Action - solo per non loggati */}
        {!isLoggedIn && camps && camps.length > 0 && (
          <section className="bg-blue-light py-16 px-6 shadow-2xl">
            <div className="max-w-3xl mx-auto text-center text-white">
              <div className="text-5xl mb-6">🌟</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pronto per l'avventura?
              </h2>
              <p className="text-lg md:text-xl mb-8 leading-relaxed">
                Registrati ora per iscriverti ai nostri campi estivi e vivere un'estate indimenticabile!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/Registrazione"
                  className="inline-block bg-white text-blue-light py-4 px-8 rounded-xl shadow-lg 
                    hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ease-out 
                    font-bold text-lg"
                >
                  Registrati Ora
                </Link>
                <Link
                  href="/Login"
                  className="inline-block bg-transparent border-2 border-white text-white 
                    py-4 px-8 rounded-xl shadow-lg hover:bg-white hover:text-cyan-600
                    transition-all duration-300 ease-out font-bold text-lg"
                >
                  Ho già un account
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Sezione Info Contatti */}
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-blue-deep mb-4">
              Hai bisogno di aiuto?
            </h3>
            <p className="text-gray-700 mb-6">
              Per qualsiasi domanda sui nostri campi estivi, contattaci via email o telefono
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
              <a 
                href="mailto:sportessence.asd.aps@gmail.com"
                className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 hover:underline font-semibold"
              >
                <Mail size={18} />
                sportessence.asd.aps@gmail.com
              </a>
              <span className="hidden sm:inline text-gray-400">|</span>
              <a 
                href="tel:3420394661"
                className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 hover:underline font-semibold"
              >
                📞 342 039 4661
              </a>
            </div>
          </div>
        </section>

        {/* Sezione Altre Attività */}
        <section className="py-16 px-6">
          <div className="mx-auto max-w-4xl text-center bg-blue-light p-8 rounded-2xl shadow-2xl">
            <h3 className="text-3xl font-bold text-white mb-4">
              Scopri le Nostre Altre Attività! 🌟
            </h3>
            <p className="text-white/90 text-lg mb-8">
              Non solo campi estivi: offriamo anche attività durante tutto l'anno
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/Psicomotricita"
                className="bg-white text-blue-deep py-4 px-8 rounded-lg shadow-md 
                  hover:-translate-y-1 hover:shadow-xl transition-all duration-300 font-semibold
                  flex items-center justify-center gap-2"
              >
                <span className="text-2xl">👶</span>
                Psicomotricità negli Asili
              </Link>
              <Link
                href="/LezioniIndividuali"
                className="bg-white text-blue-deep py-4 px-8 rounded-lg shadow-md 
                  hover:-translate-y-1 hover:shadow-xl transition-all duration-300 font-semibold
                  flex items-center justify-center gap-2"
              >
                <span className="text-2xl">⚽🏀</span>
                Lezioni Individuali 
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}