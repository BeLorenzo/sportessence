"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, Brain, Smile, Activity, Users, Clock, Target, CheckCircle2 } from "lucide-react";
import { BiLogoWhatsapp } from "react-icons/bi";
// Assicurati che l'import dell'immagine sia corretto
import psicoImg from "@/public/imgs/psicomotricitaImmagine.jpg";

export default function Psicomotricita() {
  return (
    <main className="min-h-screen bg-cream font-sans">
      
      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden shadow-xl">
        <Image
          src={psicoImg}
          alt="Bambini durante attività di psicomotricità"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-blue-900/60 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent"></div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <span className="inline-block py-1 px-4 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-bold uppercase tracking-widest mb-6 border border-white/30 shadow-lg">
            Progetto Asili
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
            Psicomotricità Infantile
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 font-light max-w-2xl mx-auto leading-relaxed">
            Accompagniamo la crescita dei più piccoli attraverso il gioco, 
            il movimento e l'espressività corporea.
          </p>
        </div>
      </section>

      {/* --- INTRODUZIONE --- */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-xl p-10 md:p-16 border-t-8 border-cyan-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5 -translate-y-1/2 translate-x-1/4 pointer-events-none">
             <Brain size={400} />
          </div>
          
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-deep mb-8">
              Cos'è la Psicomotricità?
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              La psicomotricità è un'attività educativa che favorisce lo sviluppo globale del bambino 
              attraverso il movimento e il gioco. Nei nostri percorsi negli asili, accompagniamo i più 
              piccoli nella scoperta del proprio corpo, dello spazio e delle relazioni con gli altri.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed font-medium text-cyan-800">
              Ogni sessione è pensata per stimolare la creatività, la coordinazione motoria e le 
              competenze sociali in un ambiente sicuro e divertente.
            </p>
          </div>
        </div>
      </section>

      {/* --- I BENEFICI (Sfondo Blue-Light) --- */}
      <section className="py-20 px-6 bg-blue-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 uppercase tracking-wide">
              I Benefici
            </h2>
            <div className="h-1 w-20 bg-cyan-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Sviluppo Motorio", desc: "Migliora coordinazione ed equilibrio con attività ludiche.", icon: Activity, color: "text-blue-500", bg: "bg-blue-50" },
              { title: "Capacità Cognitive", desc: "Stimola attenzione, memoria e problem solving creativo.", icon: Brain, color: "text-purple-500", bg: "bg-purple-50" },
              { title: "Socializzazione", desc: "Favorisce la relazione, l'ascolto e il rispetto delle regole.", icon: Users, color: "text-green-500", bg: "bg-green-50" },
              { title: "Espressione Emotiva", desc: "Aiuta a riconoscere e gestire le emozioni in modo sano.", icon: HeartIcon, color: "text-red-500", bg: "bg-red-50" },
              { title: "Autonomia", desc: "Incoraggia la fiducia in se stessi e l'indipendenza.", icon: StarIcon, color: "text-yellow-500", bg: "bg-yellow-50" },
              { title: "Creatività", desc: "Promuove l'immaginazione attraverso il gioco simbolico.", icon: Smile, color: "text-orange-500", bg: "bg-orange-50" }
            ].map((item, i) => (
              <div key={i} className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon size={28} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-blue-deep mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- COME FUNZIONA --- */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-deep mb-16">
            Come Funzionano le Sessioni
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border-l-8 border-cyan-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-cyan-100 p-2 rounded-lg text-cyan-600"><Clock size={24} /></div>
                <h3 className="text-2xl font-bold text-blue-deep">Frequenza e Durata</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-cyan-500" size={20} /> Sessioni settimanali o bisettimanali
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-cyan-500" size={20} /> Durata: 45-60 minuti
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-cyan-500" size={20} /> Gruppi piccoli (max 10-12 bambini)
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border-l-8 border-orange-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><Users size={24} /></div>
                <h3 className="text-2xl font-bold text-blue-deep">Fasce d'Età</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-orange-500" size={20} /> Nido: 12-36 mesi
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-orange-500" size={20} /> Materna: 3-5 anni
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-orange-500" size={20} /> Attività personalizzate per età
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border-l-8 border-blue-600 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Target size={24} /></div>
                <h3 className="text-2xl font-bold text-blue-deep">Attività Tipo</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-blue-600" size={20} /> Percorsi motori con materiali morbidi
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-blue-600" size={20} /> Giochi di equilibrio e musica
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-blue-600" size={20} /> Gioco simbolico e drammatizzazione
                </li>
              </ul>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border-l-8 border-purple-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><Smile size={24} /></div>
                <h3 className="text-2xl font-bold text-blue-deep">Il Nostro Team</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-purple-500" size={20} /> Psicomotricisti qualificati
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-purple-500" size={20} /> Esperienza con bambini 0-6 anni
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-medium">
                  <CheckCircle2 className="text-purple-500" size={20} /> Collaborazione con le maestre
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* --- FAQ --- */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-blue-deep mb-12">
          Domande Frequenti
        </h2>
        <div className="space-y-6">
          {[
            { q: "È necessaria una valutazione preliminare?", a: "Non è obbligatoria, ma osserviamo ogni bambino durante la prima sessione per personalizzare le attività." },
            { q: "I genitori possono assistere alle sessioni?", a: "Le sessioni sono riservate ai bambini per favorire autonomia, ma organizziamo incontri periodici con i genitori." },
            { q: "Cosa serve portare?", a: "Consigliamo abbigliamento comodo e calzini antiscivolo. Tutti i materiali sono forniti da noi." },
            { q: "Collaborate con asili specifici?", a: "Sì, collaboriamo con diversi asili. Contattaci per sapere se siamo attivi nel tuo istituto." }
          ].map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-cyan-500 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-blue-deep mb-2 flex items-center gap-2">
                <span className="text-cyan-500">?</span> {faq.q}
              </h3>
              <p className="text-gray-600 ml-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA FINALE (Versione Compatta) --- */}
      <section className="bg-cream pb-20 px-6">
         <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-10 shadow-xl flex flex-col items-center justify-center text-center border-t-4 border-cyan-600">
                <h3 className="text-2xl md:text-3xl font-bold text-blue-deep mb-3 uppercase">
                  Porta la Psicomotricità nel tuo Asilo
                </h3>
                <p className="text-gray-600 mb-8 text-lg max-w-xl">
                  Sei un genitore o un dirigente scolastico? Contattaci per attivare un progetto su misura.
                </p>
                
                <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
                    <a 
                      href="https://wa.me/393420394661" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full md:w-auto min-w-[180px] flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 px-6 rounded-xl font-bold hover:bg-[#20bd5a] transition-all shadow-md hover:-translate-y-1"
                    >
                        <BiLogoWhatsapp size={24} />
                        <span>WhatsApp</span>
                    </a>
                    <a 
                      href="mailto:sportessence.asd.aps@gmail.com" 
                      className="w-full md:w-auto min-w-[180px] flex items-center justify-center gap-2 bg-blue-light text-white py-3 px-6 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-md hover:-translate-y-1"
                    >
                        <Mail size={22} />
                        <span>Invia Email</span>
                    </a>
                    <a 
                      href="tel:+393420394661" 
                      className="w-full md:w-auto min-w-[180px] flex items-center justify-center gap-2 bg-white text-blue-deep border-2 border-blue-light py-3 px-6 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-md hover:-translate-y-1"
                    >
                        <Phone size={22} />
                        <span>Chiama</span>
                    </a>
                </div>
            </div>
         </div>
      </section>

      {/* --- ALTRE ATTIVITÀ --- */}
      <section className="bg-cream pb-20 px-6 border-t border-gray-200/50 pt-16">
        <div className="max-w-4xl mx-auto text-center bg-blue-light p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/imgs/pattern.png')] opacity-5"></div>
          
          <h3 className="text-3xl font-bold text-white mb-4 relative z-10">
            Scopri le Nostre Altre Attività! 🌟
          </h3>
          <p className="text-white/90 text-lg mb-8 relative z-10">
            Dallo sport al divertimento estivo, c'è sempre qualcosa da fare.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <Link
              href="/Campi"
              className="bg-white text-blue-deep py-4 px-8 rounded-xl shadow-md 
                hover:-translate-y-1 hover:shadow-xl transition-all duration-300 font-bold
                flex items-center justify-center gap-2"
            >
              <span className="text-2xl">🏕️</span>
              Campi Estivi
            </Link>
            <Link
              href="/LezioniIndividuali"
              className="bg-white text-blue-deep py-4 px-8 rounded-xl shadow-md 
                hover:-translate-y-1 hover:shadow-xl transition-all duration-300 font-bold
                flex items-center justify-center gap-2"
            >
              <span className="text-2xl">⚽🏀</span>
              Lezioni Individuali 
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

function HeartIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
}
function StarIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}
