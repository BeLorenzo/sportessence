"use client";

import Image from "next/image";
import Link from "next/link";

export default function About() {
  return (
    <main className="min-h-screen bg-cream font-sans">
      
      {/* --- HERO SECTION --- */}
      {/* Ridotta altezza (py-16) e mantenuto sfondo blue-light pulito */}
      <section className="bg-blue-light text-white py-16 px-6 shadow-md">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-md uppercase tracking-wider">
            Chi Siamo
          </h1>
          <p className="text-lg md:text-xl font-light text-blue-100 max-w-3xl mx-auto leading-relaxed">
            Più di un campo estivo: una famiglia che cresce insieme da oltre 10 anni
          </p>
        </div>
      </section>

      {/* --- STORIA AZIENDA --- */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Card contenitore con bordo superiore colorato */}
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border-t-8 border-cyan-600 relative overflow-hidden">
            <h2 className="text-3xl font-bold text-blue-deep mb-8 text-center uppercase tracking-wide">
              La Nostra Storia
            </h2>
            
            <div className="space-y-6 text-gray-700 text-base md:text-lg leading-relaxed relative z-10">
              <p>
                <strong className="text-cyan-700 font-bold">SPORTESSENCE</strong> nasce nel XXXX 
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
              
              <p className="font-semibold text-blue-deep mt-6 text-center md:text-left">
                La nostra filosofia si basa su tre pilastri fondamentali:
              </p>
              
              {/* Grid Pilastri - Stile moderno con le tue Emoji */}
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
              
              <p>
                Ogni anno investiamo nella formazione continua del nostro staff, 
                nella sicurezza delle strutture e nell'innovazione delle attività proposte. 
                Il nostro impegno è garantire che ogni bambino viva un'esperienza 
                positiva, formativa e, soprattutto, divertente!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- IL NOSTRO TEAM (Titolo) --- */}
      <section className="pb-8 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-deep mb-3 uppercase">
            Il Nostro Team
          </h2>
          <div className="h-1 w-20 bg-cyan-500 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Incontra le persone che rendono speciale ogni giornata al campo. 
          </p>
        </div>
      </section>

      {/* --- CARD FONDATORE --- */}
      <section className="pb-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
            <div className="grid md:grid-cols-[280px_1fr]">
              
              {/* Foto / Header Card */}
              <div className="bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center p-8 md:p-0 relative">
                 <div className="w-40 h-40 md:w-full md:h-full flex items-center justify-center rounded-full md:rounded-none overflow-hidden border-4 border-white md:border-0 shadow-lg md:shadow-none bg-white/30 backdrop-blur-sm">
                    {/* Placeholder */}
                    <div className="text-center text-cyan-600/50">
                        <span className="text-6xl md:text-8xl">👤</span>
                        <p className="text-xs font-bold mt-1">FOTO</p>
                    </div>
                 </div>
              </div>
              
              {/* Contenuto Testuale */}
              <div className="p-8 flex flex-col justify-center">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                    <h3 className="text-3xl font-bold text-blue-deep">Mario Rossi</h3>
                    <span className="bg-cyan-50 text-cyan-700 border border-cyan-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit">
                        Fondatore & Direttore
                    </span>
                </div>
                
                <div className="space-y-4 text-gray-600 text-base leading-relaxed">
                    <p>
                        Laureato in Scienze Motorie con oltre 15 anni di esperienza nel settore 
                        educativo, Mario ha fondato SPORTESSENCE con una visione chiara: 
                        creare un ambiente dove sport ed educazione si fondono per far crescere 
                        i ragazzi in modo sano e divertente.
                    </p>
                    <p>
                        <em className="text-cyan-700 font-semibold block border-l-4 border-cyan-500 pl-4">
                        "Ogni estate vedo bambini arrivare timidi e partire con nuovi amici e 
                        nuove competenze. È questa la magia del campo estivo: crescere giocando!"
                        </em>
                    </p>
                </div>
                
                {/* Tags stile Hashtag Moderno */}
                <div className="flex flex-wrap gap-2 mt-6">
                  {["Educatore Sportivo", "Primo Soccorso", "Formatore"].map(tag => (
                      <span key={tag} className="bg-white text-cyan-600 border border-cyan-200 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                          #{tag}
                      </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CARD COORDINATRICE --- */}
      <section className="pb-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
            {/* Su mobile usiamo flex-col per avere foto sopra, su desktop grid */}
            <div className="flex flex-col md:grid md:grid-cols-[1fr_280px]">
              
              {/* Foto Mobile (visibile solo su mobile) */}
              <div className="md:hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-8">
                 <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-6xl text-purple-600/50">👤</span>
                 </div>
              </div>

              {/* Testo */}
              <div className="p-8 flex flex-col justify-center order-2 md:order-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                    <h3 className="text-3xl font-bold text-blue-deep">Laura Bianchi</h3>
                    <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit">
                        Coordinatrice Attività
                    </span>
                </div>
                
                <div className="space-y-4 text-gray-600 text-base leading-relaxed">
                    <p>
                        Con una laurea in Scienze dell'Educazione e una passione infinita per 
                        il lavoro con i bambini, Laura coordina tutte le attività del campo, 
                        assicurandosi che ogni giornata sia ben organizzata, sicura e piena 
                        di sorprese.
                    </p>
                    <p>
                        <em className="text-purple-700 font-semibold block border-l-4 border-purple-500 pl-4">
                        "Il segreto è ascoltare i bambini: ogni gruppo è unico e io amo 
                        creare programmi su misura che li facciano sentire protagonisti!"
                        </em>
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  {["Educatrice", "Animazione", "Gestione Gruppi"].map(tag => (
                      <span key={tag} className="bg-white text-purple-600 border border-purple-200 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                          #{tag}
                      </span>
                  ))}
                </div>
              </div>

              {/* Foto Desktop (colonna laterale destra) */}
              <div className="hidden md:flex bg-gradient-to-bl from-purple-100 to-pink-100 items-center justify-center order-1 md:order-2">
                 <div className="text-center text-purple-700/50">
                    <span className="text-8xl">👤</span>
                    <p className="text-xs font-bold mt-1">FOTO</p>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* --- CARD ANIMATORE 1 --- */}
      <section className="pb-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
            <div className="grid md:grid-cols-[280px_1fr]">
              
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center p-8 md:p-0">
                 <div className="w-40 h-40 md:w-full md:h-full md:bg-transparent flex items-center justify-center rounded-full md:rounded-none overflow-hidden border-4 border-white md:border-0 shadow-lg md:shadow-none bg-white/30 backdrop-blur-sm">
                    <div className="text-center text-green-600/50">
                        <span className="text-6xl md:text-8xl">👤</span>
                        <p className="text-xs font-bold mt-1">FOTO</p>
                    </div>
                 </div>
              </div>
              
              <div className="p-8 flex flex-col justify-center">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                    <h3 className="text-3xl font-bold text-blue-deep">Luca Verdi</h3>
                    <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit">
                        Animatore Sportivo
                    </span>
                </div>
                
                <div className="space-y-4 text-gray-600 text-base leading-relaxed">
                    <p>
                        Diplomato ISEF e istruttore di calcio giovanile, Luca è l'anima delle 
                        attività sportive del campo. Con la sua energia contagiosa e la capacità 
                        di coinvolgere anche i più timidi, rende ogni partita un momento speciale.
                    </p>
                    <p>
                        <em className="text-green-700 font-semibold block border-l-4 border-green-500 pl-4">
                        "Lo sport insegna tanto: rispetto delle regole, lavoro di squadra, 
                        gestione delle emozioni. Ma soprattutto, insegna a divertirsi!"
                        </em>
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  {["Istruttore Sportivo", "Calcio", "Giochi di Squadra"].map(tag => (
                      <span key={tag} className="bg-white text-green-600 border border-green-200 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                          #{tag}
                      </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CARD ANIMATRICE 2 --- */}
      <section className="pb-10 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100">
            <div className="flex flex-col md:grid md:grid-cols-[1fr_280px]">
              
              {/* Foto Mobile */}
              <div className="md:hidden bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center p-8">
                 <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white/30 backdrop-blur-sm flex items-center justify-center">
                    <span className="text-6xl text-pink-600/50">👤</span>
                 </div>
              </div>

              {/* Testo */}
              <div className="p-8 flex flex-col justify-center order-2 md:order-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                    <h3 className="text-3xl font-bold text-blue-deep">Sofia Neri</h3>
                    <span className="bg-pink-50 text-pink-700 border border-pink-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit">
                        Animatrice Creativa
                    </span>
                </div>
                
                <div className="space-y-4 text-gray-600 text-base leading-relaxed">
                    <p>
                        Laureata all'Accademia di Belle Arti e appassionata di teatro, Sofia 
                        guida i laboratori creativi del campo. Dalle opere d'arte ai musical, 
                        ogni progetto diventa un'occasione per liberare la fantasia dei ragazzi.
                    </p>
                    <p>
                        <em className="text-pink-700 font-semibold block border-l-4 border-pink-500 pl-4">
                        "Adoro vedere i bambini scoprire talenti che non sapevano di avere. 
                        La creatività è libertà, e qui possono esprimersi senza limiti!"
                        </em>
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  {["Arte & Manualità", "Teatro", "Musica"].map(tag => (
                      <span key={tag} className="bg-white text-pink-600 border border-pink-200 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                          #{tag}
                      </span>
                  ))}
                </div>
              </div>

              {/* Foto Desktop */}
              <div className="hidden md:flex bg-gradient-to-bl from-pink-100 to-rose-100 items-center justify-center order-1 md:order-2">
                 <div className="text-center text-pink-700/50">
                    <span className="text-8xl">👤</span>
                    <p className="text-xs font-bold mt-1">FOTO</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MASCOTTE FIRO --- */}
      <section className="pb-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Stile uniformato alle altre card, ma con colori Orange/Fox */}
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-orange-100">
            <div className="grid md:grid-cols-[280px_1fr]">
              
              {/* Immagine */}
              <div className="bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center p-8 md:p-0 relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('/imgs/pattern.png')] opacity-10"></div>
                 {/* Su mobile usiamo un contenitore, su desktop un box coerente */}
                 <div className="w-48 h-48 md:w-full md:h-64 flex items-center justify-center relative">
                    <Image
                    src="/imgs/mascotte.png"
                    alt="FIRO - Mascotte"
                    width={200}
                    height={200}
                    className="object-contain drop-shadow-lg hover:scale-110 transition-transform duration-500"
                    />
                 </div>
              </div>
              
              {/* Testo */}
              <div className="p-8 flex flex-col justify-center">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-4">
                    <h3 className="text-3xl font-bold text-orange-600">FIRO 🦊</h3>
                    <span className="bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit">
                        Mascotte Ufficiale
                    </span>
                </div>
                
                <div className="space-y-4 text-gray-700 text-base leading-relaxed">
                  <p>
                    Ciao! Sono FIRO, una volpe curiosa e super energica che adora fare nuove 
                    amicizie! Ogni anno accompagno i bambini nelle loro avventure al campo,
                    insegnando loro l'importanza del gioco di squadra, del rispetto e del divertimento.
                  </p>
                  <p>
                    <em className="text-orange-700 font-semibold block border-l-4 border-orange-400 pl-4">
                    "La mia missione? Far sorridere TUTTI, anche i più timidi! 
                    Al campo estivo non ci sono estranei, solo amici che non si sono ancora conosciuti! 😄"
                    </em>
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  {["🎉 Allegria Garantita", "🤗 Amico di Tutti", "⚡ 100% Energia"].map(tag => (
                      <span key={tag} className="bg-white text-orange-600 border border-orange-200 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                          #{tag}
                      </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- CTA FINALE --- */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-blue-light rounded-2xl shadow-xl p-10 md:p-14 text-center text-white relative overflow-hidden">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 relative z-10">
              Vieni a Conoscerci!
            </h2>
            <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto relative z-10">
              Vuoi saperne di più sui nostri campi estivi? Contattaci o scopri 
              tutte le informazioni utili.
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