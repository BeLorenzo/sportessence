"use client";

import Image from "next/image";
import { Phone, Mail, Check, User, Calendar, Target, Trophy, Activity } from "lucide-react";
import { BiLogoWhatsapp } from "react-icons/bi"; 
import calcioImg from "@/public/imgs/calciatore.jpeg";
// Placeholder per il basket
// import basketImg from "@/public/imgs/basket.jpg";

export default function LezioniIndividuali() {
  return (
    <main className="min-h-screen bg-cream font-sans">
      
      {/* --- HERO SECTION SPLITTATA --- */}
      <section className="relative w-full h-[85vh] md:h-[600px] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        
        {/* LATO SINISTRO: CALCIO */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full group overflow-hidden">
          <Image
            src={calcioImg}
            alt="Lezioni di Calcio"
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-blue-900/90 to-transparent flex flex-col justify-end md:justify-center p-8 md:p-12">
            <div className="md:max-w-xs translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <div className="bg-white/20 backdrop-blur-md w-fit p-3 rounded-xl mb-4 text-white">
                <Trophy size={32} />
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold text-white uppercase tracking-wider drop-shadow-lg mb-2">
                Calcio
              </h2>
              <p className="text-blue-100 font-medium text-lg md:text-xl">
                Tecnica, controllo e visione di gioco.
              </p>
            </div>
          </div>
        </div>

        {/* LATO DESTRO: BASKET (Placeholder) */}
        <div className="relative w-full md:w-1/2 h-1/2 md:h-full bg-orange-600 flex items-center justify-center group overflow-hidden border-t-4 md:border-t-0 md:border-l-4 border-white">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-700 opacity-90"></div>
            
            <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left p-8 md:p-12 w-full">
                <div className="md:max-w-xs md:ml-auto md:mr-0 mx-auto md:text-right flex flex-col items-center md:items-end translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="bg-white/20 backdrop-blur-md w-fit p-3 rounded-xl mb-4 text-white">
                    <Activity size={32} />
                  </div>
                  <h2 className="text-4xl md:text-6xl font-extrabold text-white uppercase tracking-wider drop-shadow-lg mb-2">
                    Basket
                  </h2>
                  <p className="text-orange-100 font-medium text-lg md:text-xl">
                    Palleggio, tiro e fondamentali.
                  </p>
                </div>
            </div>
        </div>

        {/* Badge Centrale */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
            <div className="bg-white p-2 rounded-full shadow-2xl">
              <div className="bg-blue-light text-white w-24 h-24 rounded-full flex items-center justify-center text-center font-bold text-sm uppercase tracking-widest border-4 border-white">
                Lezioni<br/>Private
              </div>
            </div>
        </div>
      </section>

      {/* --- INTRO --- */}
      <section className="py-16 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-blue-deep mb-6">
          Migliora il tuo talento
        </h1>
        <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
          Che tu voglia affinare la tecnica calcistica o perfezionare il tiro a canestro, 
          i nostri istruttori qualificati ti guideranno in un percorso <span className="text-cyan-600 font-bold">1-to-1</span> personalizzato.
        </p>
      </section>

      {/* --- CARDS CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Card Calcio */}
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-blue-100 group">
            <div className="bg-blue-light p-6 md:p-8 flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-white uppercase italic">Per il Calciatore</h3>
                  <p className="text-blue-100 text-sm mt-1">Focus su tecnica e tattica</p>
                </div>
                <Trophy className="text-white/20 absolute right-4 top-1/2 -translate-y-1/2 rotate-12 group-hover:scale-125 transition-transform duration-500" size={100} />
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-8 leading-relaxed">
                  Un programma intensivo per chi vuole fare il salto di qualità. 
                  Analizziamo i tuoi movimenti e correggiamo i dettagli che fanno la differenza in partita.
              </p>
              <ul className="space-y-4">
                  {[
                      "Miglioramento del controllo palla orientato",
                      "Tecnica di passaggio e tiro in porta",
                      "Coordinazione motoria e rapidità",
                      "Lettura delle situazioni di gioco"
                  ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                          <div className="bg-cyan-100 p-1 rounded-full text-cyan-600 mt-0.5">
                            <Check size={16} strokeWidth={3} />
                          </div>
                          <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                  ))}
              </ul>
            </div>
        </div>

        {/* Card Basket */}
        <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-orange-100 group">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 md:p-8 flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl md:text-3xl font-bold text-white uppercase italic">Per il Cestista</h3>
                  <p className="text-orange-100 text-sm mt-1">Focus su fondamentali e tiro</p>
                </div>
                <Activity className="text-white/20 absolute right-4 top-1/2 -translate-y-1/2 rotate-12 group-hover:scale-125 transition-transform duration-500" size={100} />
            </div>
            <div className="p-8">
              <p className="text-gray-600 mb-8 leading-relaxed">
                  Sessioni dedicate allo sviluppo del giocatore a 360 gradi. 
                  Dal ball handling alla meccanica di tiro, costruiamo il giocatore del futuro.
              </p>
              <ul className="space-y-4">
                  {[
                      "Ball handling avanzato e doppio pallone",
                      "Correzione meccanica di tiro",
                      "Movimenti in post e penetrazione",
                      "Difesa individuale e scivolamenti"
                  ].map((item, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors">
                          <div className="bg-orange-100 p-1 rounded-full text-orange-600 mt-0.5">
                            <Check size={16} strokeWidth={3} />
                          </div>
                          <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                  ))}
              </ul>
            </div>
        </div>
      </div>

      {/* --- SEZIONE 1: COME INIZIARE (BLUE) --- */}
      <section className="bg-blue-light text-white py-20 relative overflow-hidden">
        {/* Decorazione */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-wide">Come Iniziare</h2>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                  Il percorso è semplice e flessibile. Non ci sono abbonamenti vincolanti.
              </p>
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                {/* Step 1 */}
                <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors duration-300">
                    <div className="bg-white text-blue-deep w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg">
                      <User size={28} />
                    </div>
                    <h4 className="text-xl font-bold mb-3">1. Contattaci</h4>
                    <p className="text-blue-100 leading-relaxed">
                      Scrivici su WhatsApp, inviaci una mail o chiamaci. Raccontaci i tuoi obiettivi.
                    </p>
                </div>
                {/* Step 2 */}
                <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors duration-300">
                    <div className="bg-white text-blue-deep w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg">
                      <Calendar size={28} />
                    </div>
                    <h4 className="text-xl font-bold mb-3">2. Pianifica</h4>
                    <p className="text-blue-100 leading-relaxed">
                      Scegliamo insieme giorni e orari. Massima flessibilità per te.
                    </p>
                </div>
                {/* Step 3 */}
                <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-md border border-white/10 hover:bg-white/20 transition-colors duration-300">
                    <div className="bg-white text-blue-deep w-14 h-14 rounded-full flex items-center justify-center mb-6 mx-auto md:mx-0 shadow-lg">
                      <Target size={28} />
                    </div>
                    <h4 className="text-xl font-bold mb-3">3. Allenati</h4>
                    <p className="text-blue-100 leading-relaxed">
                      Scendi in campo con il tuo istruttore dedicato e inizia a migliorare.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* --- SEZIONE 2: CTA FINALE (CREAM) --- */}
      <section className="bg-cream py-20 px-6">
         <div className="max-w-5xl mx-auto">
            {/* CTA Box Bianco */}
            <div className="bg-white rounded-3xl p-10 md:p-14 shadow-2xl flex flex-col items-center justify-center text-center border-t-4 border-blue-light">
                <h3 className="text-2xl md:text-4xl font-bold text-blue-deep mb-3 uppercase">Prenota la tua lezione</h3>
                <p className="text-gray-500 mb-10 text-lg">I posti per le lezioni individuali sono limitati.</p>
                
                {/* GRIGLIA PULSANTI SIMMETRICI */}
                <div className="flex flex-col md:flex-row gap-5 w-full justify-center items-center">
                    
                    {/* 1. WhatsApp */}
                    <a 
                      href="https://wa.me/393420394661" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full md:w-64 flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 px-6 rounded-xl font-bold hover:bg-[#20bd5a] transition-all shadow-md hover:scale-105 hover:-translate-y-1"
                    >
                        <BiLogoWhatsapp size={26} />
                        <span>WhatsApp</span>
                    </a>

                    {/* 2. Email */}
                    <a 
                      href="mailto:sportessence.asd.aps@gmail.com" 
                      className="w-full md:w-64 flex items-center justify-center gap-3 bg-blue-light text-white py-4 px-6 rounded-xl font-bold hover:bg-blue-800 transition-all shadow-md hover:scale-105 hover:-translate-y-1"
                    >
                        <Mail size={24} />
                        <span>Invia Email</span>
                    </a>

                    {/* 3. Telefono */}
                    <a 
                      href="tel:+393420394661" 
                      className="w-full md:w-64 flex items-center justify-center gap-3 bg-white text-blue-deep border-2 border-blue-light py-4 px-6 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-md hover:scale-105 hover:-translate-y-1"
                    >
                        <Phone size={24} />
                        <span>Chiama</span>
                    </a>

                </div>
            </div>
         </div>
      </section>

    </main>
  );
}