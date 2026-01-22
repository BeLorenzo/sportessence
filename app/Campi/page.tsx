import { createClient } from "@/app/utils/supabase/server";
import Link from "next/link";
import { Calendar, MapPin, Users, Mail, XCircle, Clock, CheckCircle2, ArrowRight, Phone } from "lucide-react";
import { BiLogoWhatsapp } from "react-icons/bi";

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
    <main className="min-h-screen bg-cream font-sans">
      
      {/* --- HERO SECTION --- */}
      <section className="bg-blue-light text-white py-20 px-6 shadow-md">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md uppercase tracking-wider">
            I Nostri Campi Estivi
          </h1>
          <p className="text-lg md:text-xl font-light text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Scopri tutti i nostri campi estivi disponibili. Avventura, sport, creatività e tanto divertimento ti aspettano!
          </p>
        </div>
      </section>

      {/* --- DESCRIZIONE GENERALE --- */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-16">

          {/* Intro */}
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-deep mb-6 uppercase tracking-wide">
              Molto più di un campo estivo
            </h2>
            <div className="h-1 w-24 bg-cyan-500 mx-auto rounded-full mb-8"></div>
            <p className="text-gray-700 text-lg leading-relaxed">
              I nostri campi estivi sportivi sono pensati per offrire ai bambini e ai ragazzi
              un'esperienza completa fatta di movimento, gioco e socialità.
              Ogni giornata è strutturata per garantire divertimento, sicurezza e crescita personale,
              seguiti da istruttori qualificati.
            </p>
          </div>

          {/* Grid Dettagli (Restyling Card) */}
          <div className="grid md:grid-cols-2 gap-12 mt-17 items-stretch">
            
            {/* Colonna Sinistra: Attività */}
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-blue-deep mb-6 flex items-center gap-3">
                <span className="p-2 rounded-lg text-cyan-700">⚽</span>
                Sport, gioco e movimento
              </h3>
              <ul className="space-y-6">
                {[
                  "Attività multisportive e giochi di squadra",
                  "Esercizi motori adatti all'età e alle capacità",
                  "Socializzazione e rispetto delle regole",
                  "Educatori e istruttori sempre presenti"
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <CheckCircle2 className="text-cyan-500 shrink-0 mt-1" />
                    <span className="text-gray-700 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Colonna Destra: Giornata Tipo (Card Bianca) */}
            <div className="bg-white rounded-[2rem] shadow-xl p-8 mt-3 md:p-10 border-t-8 border-blue-500 relative overflow-hidden">
              <h4 className="text-2xl font-bold text-blue-deep mb-8 flex items-center gap-3">
                <Clock className="text-blue-500" />
                La giornata tipo
              </h4>
              <div className="space-y-6 relative z-10">
                {[
                  { title: "Accoglienza", desc: "Attività leggere per iniziare la giornata nel modo giusto." },
                  { title: "Sport & Giochi", desc: "Sport, tornei e giochi di gruppo organizzati." },
                  { title: "Pranzo & Relax", desc: "Momento di recupero e socializzazione." },
                  { title: "Pomeriggio", desc: "Giochi più leggeri e conclusione della giornata." }
                ].map((phase, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 rounded-full bg-blue-200 border-2 border-blue-500"></div>
                      {i !== 3 && <div className="w-0.5 h-full bg-blue-100 my-1"></div>}
                    </div>
                    <div>
                      <span className="font-bold text-gray-800 block">{phase.title}</span>
                      <span className="text-sm text-gray-600">{phase.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dove siamo (Box Blu) */}
          <div className="bg-blue-light rounded-3xl p-10 md:p-14 shadow-xl text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/imgs/pattern.png')] opacity-10"></div>
            <div className="relative z-10 max-w-3xl mx-auto">
              <MapPin className="mx-auto w-12 h-12 mb-4 text-cyan-300" />
              <h3 className="text-2xl md:text-3xl font-bold mb-4 uppercase">
                Più sedi nel territorio comasco
              </h3>
              <p className="text-blue-100 text-lg leading-relaxed">
                I nostri campi estivi sono attivi in diverse sedi nel territorio comasco,
                per offrire alle famiglie una soluzione comoda e facilmente raggiungibile.
                Ogni struttura è selezionata per garantire spazi adeguati, sicurezza e qualità.
              </p>
            </div>
          </div>

          {/* CTA Anchor */}
          <div className="text-center pt-5">
            <h3 className="text-3xl font-bold text-blue-deep mb-2">
              Scegli il campo più adatto a te
            </h3>
            <p className="text-gray-500 text-lg">
              Scopri qui sotto date, sedi e disponibilità.
            </p>
          </div>

        </div>
      </section>

      {/* --- LISTA CAMPI (Refactored Cards) --- */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          {!camps || camps.length === 0 ? (
            <div className="bg-white rounded-[2rem] shadow-xl p-16 text-center border border-gray-100">
              <div className="text-7xl mb-6">🏕️</div>
              <h3 className="text-2xl font-bold text-blue-deep mb-2">
                Nessun campo disponibile
              </h3>
              <p className="text-gray-500">
                Torna presto per scoprire le nostre prossime avventure!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:gap-10 gap-8">
              {camps.map((camp) => {
                const postiEsauriti = camp.posti_disponibili !== null && 
                                     camp.posti_disponibili !== undefined && 
                                     camp.posti_disponibili === 0;
                
                const campoDisattivato = !camp.attivo;
                
                return (
                  <div 
                    key={camp.id} 
                    className={`group bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100
                      hover:shadow-2xl hover:-translate-y-2 transition-all duration-300
                      flex flex-col ${campoDisattivato && isLoggedIn ? 'grayscale opacity-90' : ''}`}
                  >
                    {/* Header Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src="/imgs/sfondoRegistrazione.jpg"
                        alt={camp.nome}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${
                        campoDisattivato && isLoggedIn
                          ? 'from-gray-900/90 to-transparent' 
                          : 'from-blue-900/90 via-blue-900/40 to-transparent'
                      } flex flex-col justify-end p-8`}>
                        
                        {/* Badge Status */}
                        {campoDisattivato && isLoggedIn && (
                          <div className="absolute top-6 right-6">
                            <span className="bg-red-500/90 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg uppercase tracking-wide">
                              <XCircle size={16} /> Iscrizioni Chiuse
                            </span>
                          </div>
                        )}
                        
                        <h3 className="text-3xl font-extrabold text-white mb-2 drop-shadow-md">
                          {camp.nome}
                        </h3>
                        <div className="flex items-center gap-2 text-blue-100 font-medium text-sm">
                          <MapPin size={18} className="text-cyan-400" />
                          <span>{camp.indirizzo_paese} ({camp.indirizzo_provincia})</span>
                        </div>
                      </div>
                    </div>

                    {/* Body Card */}
                    <div className="p-8 flex flex-col flex-grow relative">
                      
                      {/* Date */}
                      <div className="flex items-start gap-4 mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                        <div className="bg-white p-3 rounded-xl shadow-sm text-blue-600">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1">Periodo</p>
                          <p className="text-gray-800 font-semibold text-lg leading-tight">
                            {formatDate(camp.data_inizio)} <br/> 
                            <span className="text-gray-400 text-sm font-normal">fino al</span> {formatDate(camp.data_fine)}
                          </p>
                        </div>
                      </div>

                      {/* Descrizione */}
                      {camp.descrizione && (
                        <div className="mb-6">
                          <p className="text-gray-600 leading-relaxed line-clamp-3">
                            {camp.descrizione}
                          </p>
                        </div>
                      )}

                      {/* Spacer */}
                      <div className="flex-grow"></div>

                      {/* Prezzo */}
                      {camp.prezzo !== null && camp.prezzo !== undefined && (
                        <div className="flex items-end justify-between mb-8 border-t border-gray-100 pt-6">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">A partire da</p>
                            <p className="text-xs text-gray-400">*prezzo settimanale.</p>
                              <p className="text-xs text-gray-400">Possibilità di sconti e offerte in fase di iscrizione</p>
                          </div>
                          <div className="text-right">
                            <p className="text-4xl font-extrabold text-blue-deep">
                              €{camp.prezzo}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Pulsanti Azione */}
                      {!isLoggedIn ? (
                        <div className="space-y-3">
                          <p className="text-sm text-gray-500 text-center italic">
                            Devi accedere per iscriverti
                          </p>
                          <Link
                            href="/Login"
                            className="flex items-center justify-center w-full bg-gray-800 text-white py-4 rounded-xl 
                              hover:bg-gray-900 hover:shadow-lg transition-all font-bold tracking-wide"
                          >
                            Accedi per Iscriverti
                          </Link>
                        </div>
                      ) : campoDisattivato ? (
                        <div className="space-y-3">
                          <button disabled className="w-full bg-gray-100 text-gray-400 py-4 rounded-xl font-bold cursor-not-allowed border border-gray-200">
                            Iscrizioni Chiuse
                          </button>
                          <a href="mailto:sportessence.asd.aps@gmail.com" className="block text-center text-sm text-cyan-600 hover:underline font-medium">
                            Richiedi informazioni
                          </a>
                        </div>
                      ) : postiEsauriti ? (
                        <a
                          href="mailto:sportessence.asd.aps@gmail.com?subject=Richiesta%20Info%20Campo"
                          className="flex items-center justify-center gap-2 w-full bg-orange-500 text-white py-4 rounded-xl 
                            hover:bg-orange-600 hover:shadow-lg transition-all font-bold"
                        >
                          <Mail size={20} />
                          Contattaci (Posti Esauriti)
                        </a>
                      ) : (
                        <Link
                          href={`/Iscrizione?campo=${camp.id}`}
                          className="flex items-center justify-center gap-2 w-full bg-blue-deep text-white py-4 rounded-xl 
                            hover:bg-cyan-700 hover:shadow-lg hover:-translate-y-1 transition-all font-bold tracking-wide"
                        >
                          Iscriviti Ora <ArrowRight size={20} />
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

      {/* --- CALL TO ACTION (Non Loggato) --- */}
      {!isLoggedIn && camps && camps.length > 0 && (
        <section className="bg-blue-light py-20 px-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/imgs/pattern.png')] opacity-5"></div>
          <div className="max-w-4xl mx-auto text-center text-white relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Pronto per l'avventura?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Crea subito il tuo account per gestire le iscrizioni dei tuoi figli in pochi click.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/Registrazione"
                className="bg-white text-blue-deep py-4 px-10 rounded-xl shadow-lg 
                  hover:-translate-y-1 hover:shadow-2xl transition-all font-bold text-lg"
              >
                Registrati Ora
              </Link>
              <Link
                href="/Login"
                className="bg-transparent border-2 border-white text-white py-4 px-10 rounded-xl 
                  hover:bg-white hover:text-cyan-600 transition-all font-bold text-lg"
              >
                Ho già un account
              </Link>
            </div>
          </div>
        </section>
      )}

{/* --- INFO CONTATTI (Restyled) --- */}
        <section className="py-12 pt-20 px-6">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center border-t-4 border-cyan-600">
            <h3 className="text-2xl font-bold text-blue-deep mb-2">
              Hai domande specifiche?
            </h3>
            <p className="text-gray-600 mb-6 text-sm md:text-base">
              Il nostro staff è a disposizione per chiarire ogni dubbio.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* Email Button */}
              <a
                href="mailto:sportessence.asd.aps@gmail.com"
                className="flex items-center gap-2 bg-blue-light text-white px-6 py-3 rounded-xl font-semibold shadow-md
                  hover:bg-blue-800 hover:-translate-y-1 transition-all text-sm"
              >
                <Mail size={18} />
                Invia Email
              </a>

              {/* Phone Button */}
              <a
                href="tel:+393420394661"
                className="flex items-center gap-2 bg-white text-blue-deep border-2 border-blue-light px-6 py-3 rounded-xl font-semibold shadow-md
                  hover:bg-blue-50 hover:-translate-y-1 transition-all text-sm"
              >
                <PhoneIcon />
                342 039 4661
              </a>
            </div>
          </div>
        </section>

      {/* --- ALTRE ATTIVITÀ (Style LezioniIndividuali) --- */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-blue-light rounded-[2.5rem] p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            
            <h3 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">
              Scopri le altre attività 🌟
            </h3>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              Non solo campi estivi: offriamo percorsi di crescita sportiva ed educativa durante tutto l'anno.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
              <Link
                href="/Psicomotricita"
                className="bg-white text-blue-deep py-4 px-8 rounded-xl shadow-lg 
                  hover:-translate-y-1 hover:shadow-xl transition-all duration-300 font-bold
                  flex items-center justify-center gap-3"
              >
                <span className="text-2xl">👶</span>
                Psicomotricità
              </Link>
              <Link
                href="/LezioniIndividuali"
                className="bg-white text-blue-deep py-4 px-8 rounded-xl shadow-lg 
                  hover:-translate-y-1 hover:shadow-xl transition-all duration-300 font-bold
                  flex items-center justify-center gap-3"
              >
                <span className="text-2xl">⚽🏀</span>
                Lezioni Individuali
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}

// Piccolo componente helper per l'icona telefono se non importata da lucide
function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  )
}