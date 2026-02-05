"use client";

import Image from "next/image";
import Link from "next/link";

// --- DATI DEL TEAM (Incluso FIRO) ---
const teamMembers = [
  {
    name: "Filippo Carrante",
    role: "Fondatore e Responsabile Organizzativo",
    image: "/imgs/team/filippo.png",
    bio: "Laureato in Scienze Motorie con oltre 10 anni di esperienza nel settore educativo, Filippo ha fondato questa realtà con un obiettivo preciso: trasmettere ai ragazzi i valori dello sport sano. È il motore pulsante dell'organizzazione, colui che trasforma le idee in esperienze indimenticabili per ogni partecipante.",
    quote: "Non organizziamo solo un camp, creiamo ricordi che accompagneranno i ragazzi per tutta la vita.",
    tags: ["Scienze Motorie", "Leadership", "Organizzazione"],
    color: "cyan"
  },
  {
    name: "Giacomo Cavallini",
    role: "Direttore Amministrativo e Commerciale",
    image: "/imgs/team/giacomoCavallini.png",
    bio: "Responsabile della stabilità e della crescita del progetto, Giacomo unisce competenze manageriali a una grande passione per il mondo giovanile. Il suo lavoro dietro le quinte garantisce che tutto funzioni alla perfezione, permettendo allo staff educativo di concentrarsi al 100% sui ragazzi.",
    quote: "L'efficienza organizzativa è la base su cui costruiamo il divertimento in sicurezza.",
    tags: ["Management", "Strategia", "Amministrazione"],
    color: "blue"
  },
  {
    name: "Stefano Frigerio",
    role: "Socio, Fisioterapista e Osteopata",
    image: "/imgs/team/stefanoFrigerio.png",
    bio: "Fisioterapista e Osteopata specializzato in Psiconeurodinamica, Stefano porta nel team un'expertise medica di altissimo livello. Collabora con realtà d'eccellenza come PGC Cantù, Golf Club Villa D’Este e Briantea84. La sua presenza garantisce un'attenzione professionale alla salute fisica e al benessere motorio di ogni ragazzo.",
    quote: "Aiutare le persone a migliorare il proprio stato di salute mi dà grande soddisfazione. Credo che il gioco e il movimento siano strumenti efficaci per insegnare ai bambini l’importanza di prendersi cura del proprio corpo.",
    tags: ["Fisioterapia", "Osteopatia", "Salute & Benessere"],
    color: "emerald"
  },
  {
    name: "Marco Tambini",
    role: "Socio e Direttore Amministrativo",
    image: "/imgs/team/marcoTambini.png",
    bio: "Pilastro della gestione societaria, Marco supervisiona gli aspetti logistici e burocratici con precisione assoluta. La sua esperienza assicura che ogni aspetto del camp rispetti i più alti standard di qualità e normativa, offrendo alle famiglie la massima tranquillità.",
    quote: "La serietà di una struttura si vede dai dettagli che nessuno nota, ma che fanno funzionare tutto.",
    tags: ["Logistica", "Pianificazione", "Back-office"],
    color: "indigo"
  },
  {
    name: "Stefano Caldrer",
    role: "Socio e Segretario Generale",
    image: "/imgs/team/StefanoCaldrer.jpeg",
    bio: "Il punto di riferimento per le famiglie. Stefano gestisce la segreteria e le relazioni esterne con pazienza e disponibilità. È la voce amica che accoglie i genitori e risolve ogni dubbio, assicurando una comunicazione limpida e puntuale tra l'organizzazione e le famiglie.",
    quote: "L'accoglienza inizia dal primo sorriso e dalla prima risposta chiara che diamo a un genitore.",
    tags: ["Segreteria", "Relazioni Esterne", "Accoglienza"],
    color: "orange"
  },
  {
    name: "Fulvio Ronconi", 
    role: "Coordinatore Attività",
    image: "/imgs/team/FulvioRonconi.jpeg",
    bio: "Un vulcano di energia sul campo. Fulvio coordina le squadre degli animatori assicurandosi che il ritmo delle giornate sia sempre alto e coinvolgente. Esperto nella gestione dei gruppi, sa cogliere le dinamiche tra i ragazzi per favorire l'integrazione e il divertimento di tutti.",
    quote: "Un gruppo unito è la forza più grande. Qui nessuno rimane in panchina.",
    tags: ["Coordinamento", "Team Building", "Animazione"],
    color: "violet"
  },
  {
    name: "Eduardo Romeo",
    role: "Coordinatore Attività",
    image: "/imgs/team/eduardoRomeo.png",
    bio: "Con una profonda esperienza nell'educazione non formale, Eduardo progetta e supervisiona le attività quotidiane. Il suo focus è sull'equilibrio tra sicurezza e avventura, garantendo che ogni gioco abbia anche un valore educativo oltre che ludico.",
    quote: "Educare significa tirare fuori il meglio da ogni ragazzo, spesso semplicemente facendolo giocare.",
    tags: ["Programmazione", "Sicurezza", "Educazione"],
    color: "rose"
  },
  {
    name: "FIRO 🦊",
    role: "Mascotte Ufficiale",
    image: "/imgs/mascotte.png", // Usa l'immagine della mascotte
    bio: "Ciao! Sono FIRO, una volpe curiosa e super energica che adora fare nuove amicizie! Ogni anno accompagno i bambini nelle loro avventure al campo, insegnando loro l'importanza del gioco di squadra, del rispetto e del divertimento.",
    quote: "La mia missione? Far sorridere TUTTI! Al campo estivo non ci sono estranei, solo amici che non si sono ancora conosciuti! 😄",
    tags: ["Allegria Garantita", "Amico di Tutti", "100% Energia"],
    color: "fox" // Colore custom definito sotto
  }
];

// --- HELPER COLORI ---
const getColorClasses = (color: string | number) => {
  const themes = {
    cyan: { bg: "from-cyan-100 to-blue-100", text: "text-cyan-700", badge: "bg-cyan-50 text-cyan-700 border-cyan-200", border: "border-cyan-500", icon: "text-cyan-600/50" },
    blue: { bg: "from-blue-100 to-indigo-100", text: "text-blue-700", badge: "bg-blue-50 text-blue-700 border-blue-200", border: "border-blue-500", icon: "text-blue-600/50" },
    emerald: { bg: "from-emerald-100 to-green-100", text: "text-emerald-700", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", border: "border-emerald-500", icon: "text-emerald-600/50" },
    indigo: { bg: "from-indigo-100 to-purple-100", text: "text-indigo-700", badge: "bg-indigo-50 text-indigo-700 border-indigo-200", border: "border-indigo-500", icon: "text-indigo-600/50" },
    orange: { bg: "from-orange-100 to-amber-100", text: "text-orange-700", badge: "bg-orange-50 text-orange-700 border-orange-200", border: "border-orange-500", icon: "text-orange-600/50" },
    violet: { bg: "from-violet-100 to-fuchsia-100", text: "text-violet-700", badge: "bg-violet-50 text-violet-700 border-violet-200", border: "border-violet-500", icon: "text-violet-600/50" },
    rose: { bg: "from-rose-100 to-pink-100", text: "text-rose-700", badge: "bg-rose-50 text-rose-700 border-rose-200", border: "border-rose-500", icon: "text-rose-600/50" },
    // Colore specifico per FIRO (simile all'orange ma distinto se vuoi, qui riuso orange per coerenza visiva)
    fox: { bg: "from-orange-100 to-yellow-100", text: "text-orange-600", badge: "bg-orange-50 text-orange-700 border-orange-200", border: "border-orange-500", icon: "text-orange-600/50" },
  } as const;

  type ThemeKey = keyof typeof themes;
  const key = String(color) as ThemeKey;
  return themes[key] ?? themes.cyan;
};

export default function About() {
  return (
    <main className="min-h-screen bg-cream font-sans">
      
      {/* --- HERO SECTION --- */}
      <section className="bg-blue-light text-white py-16 px-6 shadow-md">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md uppercase tracking-wider">
            Chi Siamo
          </h1>
          <p className="text-lg md:text-xl font-light text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Più di un campo estivo: una famiglia che cresce insieme da anni
          </p>
        </div>
      </section>

      {/* --- STORIA AZIENDA --- */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-t-8 border-cyan-600 relative overflow-hidden">
            <h2 className="text-3xl font-bold text-blue-deep mb-8 text-center uppercase tracking-wide">
              La Nostra Storia
            </h2>
            
            <div className="space-y-6 text-gray-700 text-base md:text-lg leading-relaxed relative z-10">
              <p>
                <strong className="text-cyan-700 font-bold">SPORTESSENCE</strong> nasce nel 2023
                dalla passione di un gruppo di educatori e professionisti dello sport che 
                hanno voluto creare qualcosa di speciale: un luogo dove i bambini e ragazzi 
                potessero crescere divertendosi, imparando e facendo amicizie indimenticabili.
              </p>
              <p>
                Quello che è iniziato come un piccolo campo estivo con pochi partecipanti 
                è cresciuto anno dopo anno, grazie alla fiducia delle famiglie e alla 
                dedizione del nostro team. Oggi accogliamo centinaia di bambini ogni estate, 
                ma il nostro obiettivo rimane invariato: <strong>fare di ogni giorno 
                un'avventura memorabile</strong>.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 my-8">
                <div className="bg-cyan-50 rounded-xl p-6 text-center border border-cyan-100 hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="text-5xl mb-3">⚽</div>
                  <h3 className="font-bold text-cyan-800 text-lg mb-1">Sport & Movimento</h3>
                  <p className="text-sm text-cyan-700 leading-snug">
                    Promuoviamo uno stile di vita attivo e salutare
                  </p>
                </div>
                
                <div className="bg-cyan-50 rounded-xl p-6 text-center border border-cyan-100 hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="text-5xl mb-3">🎨</div>
                  <h3 className="font-bold text-cyan-800 text-lg mb-1">Creatività</h3>
                  <p className="text-sm text-cyan-700 leading-snug">
                    Stimoliamo l'immaginazione e l'espressione personale
                  </p>
                </div>
                
                <div className="bg-cyan-50 rounded-xl p-6 text-center border border-cyan-100 hover:shadow-md transition-all hover:-translate-y-1">
                  <div className="text-5xl mb-3">🤝</div>
                  <h3 className="font-bold text-cyan-800 text-lg mb-1">Amicizia & Valori</h3>
                  <p className="text-sm text-cyan-700 leading-snug">
                    Coltiviamo rispetto, collaborazione e inclusione
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SEZIONE TEAM (Con Sfondo Cream) --- */}
      <div className="bg-cream pb-16">
        <div className="text-center mb-12 px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-deep uppercase">Il Nostro Team</h2>
          <div className="h-1 w-24 bg-cyan-500 mx-auto rounded-full mt-4 mb-4"></div>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Professionisti appassionati al servizio dei tuoi figli, selezionati per la loro competenza ed empatia.
          </p>
        </div>

        {teamMembers.map((member, index) => {
          const theme = getColorClasses(member.color);
          const isEven = index % 2 !== 0; // Alternanza Destra/Sinistra

          return (
            <section key={member.name} className="pb-10 px-6">
              <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 transition-shadow hover:shadow-xl">
                  
                  {/* LAYOUT GRID SYSTEM
                      - Mobile (Opzione B): Immagine Full Width in alto
                      - Desktop: Grid 2 colonne alternata
                  */}
                  <div className={`flex flex-col md:grid ${!isEven ? 'md:grid-cols-[280px_1fr]' : 'md:grid-cols-[1fr_280px]'}`}>
                    
                    {/* --- FOTO MOBILE (Opzione B - Full Width & Altezza Fissa) --- */}
                    <div className="md:hidden relative h-96 w-full">
                       <Image 
                           src={member.image} 
                           alt={member.name}
                           fill
                           className="object-cover object-top" // object-top TAGLIA il basso se l'immagine è troppo alta
                           priority={index < 2} // Carica subito i primi due
                       />
                       {/* Sfumatura in basso per staccare dal testo bianco */}
                       <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white to-transparent opacity-80"></div>
                    </div>

                    {/* --- FOTO DESKTOP (Gestione Grid) --- */}
                    {/* Impostiamo min-h per uniformità. w-full riempie i 280px della griglia */}
                    <div className={`hidden md:flex bg-gradient-to-br ${theme.bg} items-center justify-center relative min-h-[400px] h-full ${!isEven ? 'order-1' : 'order-2'}`}>
                       <div className="absolute inset-0 w-full h-full">
                          <Image 
                            src={member.image} 
                            alt={member.name}
                            fill
                            className="object-cover object-top" // Fondamentale per il "taglio" richiesto
                            sizes="280px"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                          />
                       </div>
                    </div>
                    
                    {/* --- CONTENUTO TESTUALE --- */}
                    <div className={`p-8 lg:p-12 flex flex-col justify-center ${!isEven ? 'order-2' : 'order-1'}`}>
                      <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                          <h3 className="text-3xl font-bold text-blue-deep">{member.name}</h3>
                          <span className={`${theme.badge} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit`}>
                              {member.role}
                          </span>
                      </div>
                      
                      <div className="space-y-4 text-gray-600 text-base leading-relaxed">
                          <p>{member.bio}</p>
                          <p>
                              <em className={`${theme.text} font-semibold block border-l-4 ${theme.border} pl-4 my-4`}>
                              "{member.quote}"
                              </em>
                          </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-6">
                        {member.tags.map(tag => (
                            <span key={tag} className={`bg-white ${theme.text} border ${theme.border} px-3 py-1 rounded-lg text-xs font-bold shadow-sm opacity-80`}>
                                #{tag}
                            </span>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* --- CTA FINALE --- */}
      <section className="pb-20 px-6 pt-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-light rounded-2xl shadow-xl p-10 md:p-14 text-center text-white relative overflow-hidden">
            {/* Background decorativo */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/imgs/pattern.png')] opacity-5 pointer-events-none"></div>

            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
              Vieni a Conoscerci!
            </h2>
            <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto relative z-10">
              Vuoi saperne di più sui nostri campi estivi? Contattaci o scopri 
              tutte le informazioni utili per la prossima stagione.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="/Info"
                className="bg-white text-blue-deep px-8 py-3 rounded-xl font-bold text-lg 
                  hover:bg-cream hover:scale-105 transition-all duration-300 shadow-lg"
              >
                Informazioni Utili
              </Link>
              <Link
                href="/Campi"
                className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-lg 
                  hover:bg-orange-600 hover:scale-105 transition-all duration-300 shadow-lg border-2 border-orange-500"
              >
                Scopri i Campi
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}