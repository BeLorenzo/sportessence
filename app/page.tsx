import Image from "next/image";
import Link from "next/link";
import AttivitaSlider from "@/app/components/attivitaSlider";
import TestimonianzeSlider from "@/app/components/testimonianzeSlider";
import immagineMobile from "@/public/imgs/immagineHome.jpeg";
import immagineDesktop from "@/public/imgs/fotoHeroOriz.webp";

export default function Home() {
  return (
    <main className="bg-cream text-blue-deep">
      {/* HERO */}
      <section className="relative h-screen overflow-hidden">
  
  <div className="block lg:hidden relative w-full h-full">
    <Image
      src={immagineMobile}
      alt="Bambini che giocano - mobile"
      fill
      priority
      className="object-cover object-center"
    />
  </div>

  <div className="hidden lg:block relative w-full h-full">
    <Image
      src={immagineDesktop}
      alt="Bambini che giocano - desktop"
      fill
      priority
      className="object-cover object-center"
    />
  </div>

</section>

      {/* CHI SIAMO */}
      <section className="bg-cream py-16 px-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center items-center gap-12">
            <div className="flex flex-col items-center md:items-start gap-4">
              <Image
                src="/imgs/logoNoSfondo.png"
                alt="Logo Azienda"
                width={900}
                height={900}
                className="object-contain w-100 sm:w-100 md:w-300 lg:w-200 min-w-[350px]"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-blue-deep">
                Chi Siamo
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Fondata nel 2023, SPORTESSENCE si dedica a creare esperienze indimenticabili
                per bambini e ragazzi. Grazie alla nostra passione per lo sport, la creatività
                e il divertimento, ogni estate trasformiamo il gioco in apprendimento e amicizia.
              </p>
              <Link
                href="/About"
                className="inline-block mt-6 text-cyan-600 font-semibold hover:underline 
                  hover:text-cyan-700 transition-colors"
              >
                Scopri di più su di noi →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MASCOTTE */}
      <section className="bg-blue-light py-3 px-6">
        <div className="flex flex-col md:flex-row items-center gap-12 max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-4 md:w-1/3">
            <Image
              src="/imgs/mascotte.png"
              alt="Mascotte FIRO"
              width={400}
              height={400}
              className="object-contain w-72 sm:w-80 md:w-96 lg:w-[250px] 
                hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="text-center md:text-left flex flex-col justify-center md:w-2/3">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Ciao, sono FIRO! 👋
            </h2>
            <p className="text-white text-lg leading-relaxed">
              Sono FIRO, la mascotte ufficiale di SPORTESSENCE! 
              Ogni anno accompagno bambini e ragazzi nelle nostre attività,
              portando allegria, curiosità e tanto divertimento. Vieni a scoprire
              con me tutte le avventure che ti aspettano ai nostri campi estivi!
            </p>
          </div>
        </div>
      </section>

      {/* COMPONENTI CLIENT */}
      <AttivitaSlider />

      {/* STATISTICHE */}
      <section className="bg-blue-light py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
            I Nostri Numeri
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Anni di Esperienza", value: "5" },
              { label: "Bambini Felici", value: "5.000+" },
              { label: "Educatori Qualificati", value: "50+" },
              { label: "Settimane di Campo", value: "50+" }
            ].map(({ label, value }) => (
              <div 
                key={label} 
                className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-6 
                  hover:bg-white/20 hover:scale-105 transition-all duration-300"
              >
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{value}</p>
                <p className="text-base md:text-lg font-semibold text-white/90">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TestimonianzeSlider />
      
      {/* ATTIVITÀ EXTRA - NUOVO LAYOUT LATERALE */}
      <section className="py-16 px-6 bg-blue-light">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-white">
            Non Solo Campi Estivi!
          </h2>
          <p className="text-center text-white font-semibold text-lg mb-12 max-w-3xl mx-auto">
            Scopri le nostre attività extra per tutto l'anno.
          </p>
          
          <div className="space-y-8">
            {/* Psicomotricità - Foto SINISTRA */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <div className="flex flex-col md:flex-row">
                {/* Immagine */}
                <div className="relative h-64 md:h-auto md:w-2/5">
                  <Image
                    src="/imgs/psicomotricitaImmagine.jpg"
                    alt="Psicomotricità negli asili"
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Contenuto */}
                <div className="p-8 md:w-3/5 flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-blue-deep mb-4">
                    👶 Psicomotricità negli Asili
                  </h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Percorsi educativi per bambini dai 12 mesi ai 5 anni che favoriscono lo sviluppo 
                    motorio e cognitivo attraverso il gioco e attività ludiche stimolanti.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-cyan-600 font-bold text-xl">✓</span>
                      <span>Sviluppo motorio e coordinazione</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-cyan-600 font-bold text-xl">✓</span>
                      <span>Socializzazione e gioco di gruppo</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-cyan-600 font-bold text-xl">✓</span>
                      <span>Psicomotricisti qualificati</span>
                    </div>
                  </div>
                  <Link
                    href="/Psicomotricita"
                    className="inline-block w-full md:w-auto text-center bg-cyan-600 text-white py-3 px-8 rounded-lg 
                      hover:bg-cyan-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                  >
                    Scopri di Più →
                  </Link>
                </div>
              </div>
            </div>

            {/* Calcio - Foto DESTRA */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <div className="flex flex-col md:flex-row-reverse">
                {/* Immagine */}
                <div className="relative h-64 md:h-auto md:w-2/5">
                  <Image
                    src="/imgs/calciatore.jpeg"
                    alt="Lezioni individuali di calcio"
                    fill
                    className="object-cover"
                  />
                </div>
                
                {/* Contenuto */}
                <div className="p-8 md:w-3/5 flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-blue-deep mb-4">
                    ⚽ Lezioni Individuali di Calcio
                  </h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Allenamenti personalizzati per migliorare tecnica e tattica. Dai principianti 
                    agli avanzati, ogni atleta riceve un percorso su misura con allenatori certificati.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-cyan-600 font-bold text-xl">✓</span>
                      <span>Allenamenti personalizzati 1-a-1</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-cyan-600 font-bold text-xl">✓</span>
                      <span>Tecnica, tattica e preparazione fisica</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-cyan-600 font-bold text-xl">✓</span>
                      <span>Allenatori UEFA certificati</span>
                    </div>
                  </div>
                  <Link
                    href="/LezioniIndividuali"
                    className="inline-block w-full md:w-auto text-center bg-cyan-600 text-white py-3 px-8 rounded-lg 
                      hover:bg-cyan-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                  >
                    Scopri di Più →
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. Basket - Foto SINISTRA (Nuovo) */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
              <div className="flex flex-col md:flex-row">
                {/* Immagine Placeholder Basket */}
                <div className="relative h-64 md:h-auto md:w-2/5 bg-orange-100 flex items-center justify-center">
                  <Image
                    src="/imgs/lezioneBasket.JPG"
                    alt="Lezione Basket"
                    fill
                    className="object-cover"
                  />
                </div>
                
                <div className="p-8 md:w-3/5 flex flex-col justify-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-blue-deep mb-4">
                    🏀 Lezioni Individuali di Basket
                  </h3>
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    Sessioni tecniche intensive per sviluppare i fondamentali della pallacanestro. 
                    Migliora il palleggio, il tiro e la lettura del gioco con i nostri coach esperti.
                  </p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-cyan-600 font-bold text-xl">✓</span>
                      <span>Ball handling e meccanica di tiro</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-cyan-600 font-bold text-xl">✓</span>
                      <span>Movimenti offensivi e difensivi</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <span className="text-cyan-600 font-bold text-xl">✓</span>
                      <span>Preparazione atletica specifica</span>
                    </div>
                  </div>
                  <Link
                    href="/LezioniIndividuali" // Link richiesto
                    className="inline-block w-full md:w-auto text-center bg-cyan-600 text-white py-3 px-8 rounded-lg 
                      hover:bg-cyan-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
                  >
                    Scopri di Più →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + CTA */}
      <section className="bg-cream py-20 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-stretch">
          
          {/* FAQ Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col">
            <h2 className="text-3xl font-bold text-blue-deep mb-4">
              Hai domande? 🤔
            </h2>
            <p className="text-gray-700 text-lg mb-6">
              Consulta le nostre domande più frequenti per trovare tutte le informazioni 
              su iscrizioni, attività e sicurezza.
            </p>
            
            {/* FAQ Preview */}
            <ul className="text-gray-700 mb-6 space-y-3 flex-grow">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>Età minima?</strong> Dai 6 ai 21 anni</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>Serve certificato medico?</strong> Sì, obbligatorio</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>Sconti per fratelli?</strong> Sì, dal 10% al 15%</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 font-bold">•</span>
                <span><strong>Iscrizione a metà estate?</strong> Sì, se ci sono posti</span>
              </li>
            </ul>
            
            <Link
              href="/Info"
              className="w-full bg-blue-light text-white 
                py-4 px-6 rounded-lg shadow-md text-center font-semibold text-lg
                hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              Scopri tutte le FAQ →
            </Link>
          </div>

          {/* CTA Card */}
          <div className="bg-blue-light rounded-2xl shadow-xl 
            p-8 text-white flex flex-col justify-center items-center text-center">
            <div className="text-6xl mb-4">🏕️</div>
            <h3 className="text-3xl font-bold mb-4">
              Prenota il tuo posto oggi!
            </h3>
            <p className="mb-8 text-white/90 text-lg">
              Non perdere l'occasione di vivere un'estate indimenticabile con SPORTESSENCE. 
              <strong className="block mt-2">Posti limitati!</strong>
            </p>
            <Link
              href="/Campi"
              className="bg-white text-blue-deep py-4 px-8 rounded-lg shadow-lg 
                font-bold text-lg hover:bg-cream hover:scale-105 
                transition-all duration-300"
            >
              Scopri i Campi →
            </Link>
          </div>
        </div>
      </section>

{/* SPONSOR - PIÙ STRETTO */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-deep text-center mb-8">
            I Nostri Partner
          </h2>
          <div className="bg-blue-light rounded-2xl shadow-lg p-8">
            <div className="flex justify-center items-center gap-12 md:gap-16 flex-wrap">
              {[{
                name: "ASC Sport",
                img: "https://www.ascsport.it/wp-content/themes/asc_sport/images_new/ASC-Logo.svg",
                href: "https://www.ascsport.it"
                // Usa il default (p-4)
              },{
                name: "Seristampa",
                img: "https://www.seristampa.promo/wp-content/uploads/2024/01/LOGO-header.png",
                href: "https://www.seristampa.promo"
                // Usa il default (p-4)
              },{
                name: "Centro SP",
                img: "https://centrosp.it/wp-content/uploads/2025/08/logo-sito-1024x380.png",
                href: "https://centrosp.it",
                width: 220, // Aumentiamo l'immagine
                height: 150,
                padding: "p-0" // <--- E togliamo il cuscinetto per compensare!
              }].map((sponsor) => (
                <a
                  key={sponsor.name}
                  href={sponsor.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  // LOGICA QUI SOTTO: Se c'è un padding specifico usa quello, altrimenti p-4
                  className={`inline-block ${sponsor.padding || "p-4"} rounded-lg hover:shadow-xl hover:scale-110 transition-all duration-300`}
                >
                  <Image
                    src={sponsor.img}
                    alt={sponsor.name}
                    width={sponsor.width || 180} 
                    height={sponsor.height || 100}
                    className="object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STACCO CREMA PRIMA DEL FOOTER */}
      <div className="h-12 bg-cream"></div>
    </main>
  );
}