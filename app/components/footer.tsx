import Link from "next/link";
import { BiMailSend, BiPhone, BiLogoInstagram, BiLogoTiktok, BiLogoFacebook } from "react-icons/bi";

export default function Footer() {
  return (
    <footer className="bg-blue-light text-white font-semibold py-8 z-30">
      <div className="max-w-7xl mx-auto px-4">
        {/* Grid principale - 3 colonne su desktop, 1 su mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          
          {/* Contatti */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h5 className="font-bold uppercase mb-3">Contatti</h5>
            <ul className="text-sm space-y-2">
              <li className="flex items-center justify-center md:justify-start gap-2">
                <BiMailSend className="text-xl flex-shrink-0" />
                <span className="flex flex-col sm:flex-row sm:gap-1">
                  <span>Email:</span>
                  <a 
                    className="underline hover:text-orange-500 transition-colors break-all" 
                    href="mailto:sportessence.asd.aps@gmail.com"
                  >
                    sportessence.asd.aps@gmail.com
                  </a>
                </span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-2">
                <BiPhone className="text-xl flex-shrink-0" />
                <span>
                  Telefono:{" "}
                  <a 
                    className="hover:text-orange-500 underline transition-colors" 
                    href="tel:3420394661"
                  >
                    342 039 4661
                  </a>
                </span>
              </li>
            </ul>
          </div>

          {/* Info legali */}
          <div className="flex flex-col items-center text-center">
            <h5 className="font-bold uppercase mb-3">SportEssence Asd APS</h5>
            <ul className="text-sm space-y-1">
              <li>
                <span className="text-white/80">P.IVA:</span>{" "}
                <span>04231980139</span>
              </li>
              <li>
                <span className="text-white/80">Sede legale:</span>{" "}
                <span>Via L. Mascherpa 4, 22100 Como (CO)</span>
              </li>
              <li>
                <span className="text-white/80">CF:</span>{" "}
                <span>95150810133</span>
              </li>
              <li>
                <span className="text-white/80">Codice SDI:</span>{" "}
                <span>KRRH6B9</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right">
            <h5 className="font-bold uppercase mb-3">Seguici sui social</h5>
            <div className="flex justify-center md:justify-end items-center gap-6 text-3xl">
              <a 
                href="https://www.instagram.com/sportessence_official" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Instagram" 
                className="hover:text-orange-500 hover:scale-110 transition-all"
              >
                <BiLogoInstagram />
              </a>
              <a 
                href="https://www.tiktok.com/@sportessence.asd.aps" 
                target="_blank"
                rel="noopener noreferrer" 
                aria-label="TikTok" 
                className="hover:text-orange-500 hover:scale-110 transition-all"
              >
                <BiLogoTiktok />
              </a>
              <a 
                href="https://www.facebook.com/p/Sportessence-61573637458447" 
                target="_blank"
                rel="noopener noreferrer" 
                aria-label="Facebook" 
                className="hover:text-orange-500 hover:scale-110 transition-all"
              >
                <BiLogoFacebook />
              </a>
            </div>
          </div>
        </div>

        {/* Link Privacy e Copyright */}
        <div className="mt-8 pt-6 border-t border-white/20 text-center">
          <div className="flex flex-wrap justify-center items-center gap-3 text-sm">
            <Link 
              href="/Privacy" 
              className="underline hover:text-orange-500 transition-colors font-semibold"
            >
              Privacy Policy
            </Link>
            <span className="text-white/40">•</span>
            <Link 
              href="/Info" 
              className="underline hover:text-orange-500 transition-colors font-semibold"
            >
              Domande Frequenti
            </Link>
            <span className="text-white/40">•</span>
            <span className="text-white/70">
              © 2025 SportEssence - Tutti i diritti riservati
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}