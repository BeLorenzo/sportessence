"use client";
import { useRef, useState, useEffect } from "react";
import { Quote, Star } from "lucide-react";

const testimonianze = [
  { 
    name: "Valentina Rossi", 
    role: "Mamma di Sofia (8 anni)",
    text: "Un'esperienza super positiva! Il team è qualificato e professionale. Sofia è tornata a casa entusiasta ogni giorno, non vedeva l'ora di raccontarmi le attività fatte." 
  },
  { 
    name: "Diana Merlo", 
    role: "Mamma di Luca (10 anni)",
    text: "Organizzazione impeccabile e staff fantastico. L’attenzione al dettaglio è incredibile: dalla sicurezza al divertimento, nulla è lasciato al caso. Torneremo sicuramente!" 
  },
  { 
    name: "Arianna Conti", 
    role: "Mamma di Marco (6 anni)",
    text: "Ottima gestione dei bambini, attività varie e sempre stimolanti. Mi sono sentita tranquilla nel lasciare Marco con loro, e lui si è divertito un mondo." 
  },
  { 
    name: "Francesco P.", 
    role: "Papà di Giulia (12 anni)",
    text: "Finalmente un campo estivo che unisce sport e crescita personale. Giulia ha fatto nuove amicizie e imparato tantissimo. Consigliatissimo a tutti i genitori." 
  },
  { 
    name: "Elisa Bianchi", 
    role: "Mamma di Tommaso (9 anni)",
    text: "Mio figlio è solitamente timido, ma gli animatori sono stati bravissimi a coinvolgerlo. È tornato a casa più sicuro di sé e felice. Grazie di cuore!" 
  },
  { 
    name: "Marco G.", 
    role: "Papà di Alessandro (11 anni)",
    text: "Rapporto qualità-prezzo eccellente. Le strutture sono belle e pulite, e si vede che lo staff fa questo lavoro con passione vera. Ci vediamo l'anno prossimo." 
  },
];

export default function TestimonianzeSlider() {
  const testimonianzeRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  const scrollToIndex = (i: number) => {
    const el = testimonianzeRef.current;
    if (!el) return;
    const cards = Array.from(el.children) as HTMLElement[];
    const card = cards[i];
    if (card) {
      el.scrollTo({ left: card.offsetLeft - (el.offsetWidth - card.offsetWidth) / 2, behavior: "smooth" });
    }
  };

  const updateIndex = () => {
    const el = testimonianzeRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.offsetWidth / 2;
    const cards = Array.from(el.children) as HTMLElement[];
    const i = cards.findIndex(card => center >= card.offsetLeft && center <= card.offsetLeft + card.offsetWidth);
    if (i !== -1) setIndex(i);
  };

  useEffect(() => {
    const el = testimonianzeRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateIndex, { passive: true });
    
    const checkScrollable = () => setIsScrollable(el.scrollWidth > el.clientWidth);
    checkScrollable();
    window.addEventListener("resize", checkScrollable);

    return () => {
      el.removeEventListener("scroll", updateIndex);
      window.removeEventListener("resize", checkScrollable);
    };
  }, []);

  return (
    <section className="py-20 px-4 bg-cream overflow-hidden">
      <div className="max-w-7xl mx-auto">
        
        {/* Intestazione */}
        <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-blue-deep mb-3">Cosa Dicono di Noi</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
                Le storie delle famiglie che ci hanno scelto. La vostra fiducia è il nostro orgoglio più grande.
            </p>
        </div>

        {/* CONTAINER SCROLLABILE (Mobile) / GRIGLIA (Desktop) */}
        <div
          ref={testimonianzeRef}
          className="
            flex overflow-x-auto snap-x snap-mandatory space-x-6 pb-8 -mx-4 px-4 scroll-smooth
            lg:grid lg:grid-cols-3 lg:gap-8 lg:space-x-0 lg:overflow-visible lg:pb-0
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          "
        >
          {testimonianze.map((t, i) => (
            <div 
                key={i} 
                className="
                    flex-shrink-0 w-[85vw] md:w-[45vw] lg:w-auto snap-center 
                    bg-white p-8 rounded-2xl shadow-lg border border-gray-100 
                    flex flex-col relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-xl
                "
            >
                {/* Icona Quote decorativa */}
                <Quote className="absolute top-6 right-6 text-gray-100 w-12 h-12 rotate-180 group-hover:text-cyan-50 transition-colors duration-300" />

                {/* Stelle */}
                <div className="flex text-yellow-400 mb-4 gap-0.5">
                    {[...Array(5)].map((_, idx) => <Star key={idx} size={18} fill="currentColor" />)}
                </div>

                {/* Testo */}
                <p className="text-gray-600 italic leading-relaxed mb-6 relative z-10">
                    "{t.text}"
                </p>

                {/* Autore */}
                <div className="mt-auto flex items-center gap-4 border-t border-gray-100 pt-4">
                    {/* Avatar con iniziali */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {t.name.split(" ")[0][0]}{t.name.split(" ")[1] ? t.name.split(" ")[1][0] : ""}
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 text-sm md:text-base">{t.name}</h4>
                        <p className="text-xs text-gray-400 font-medium">{t.role}</p>
                    </div>
                </div>
            </div>
          ))}
        </div>

        {/* PALLINI NAVIGAZIONE (Visibili solo se scrollabile/mobile) */}
        {isScrollable && (
          <div className="flex justify-center mt-8 space-x-2 lg:hidden">
            {testimonianze.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === index ? "w-8 h-2.5 bg-cyan-600" : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Vai alla testimonianza ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}