"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";
import logo from "@/public/imgs/logo.png";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client";

type UserRole = "guest" | "user" | "admin";

interface NavbarProps {
  initialRole: UserRole;
}

export default function Navbar({ initialRole }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sincronizzazione ruolo
  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  // Reset menu al cambio pagina
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Apri automaticamente Progetti se siamo in una delle pagine figlie
  useEffect(() => {
    if (pathname === "/LezioniIndividuali" || pathname === "/Psicomotricita") {
      setIsProjectsOpen(true);
    } else {
      setIsProjectsOpen(false);
    }
  }, [pathname]);

  // Click outside per dropdown desktop
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isOpen) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProjectsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Auth check
  useEffect(() => {
    const fetchRoleOnLogin = async () => {
      router.refresh();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRole("guest");
        return;
      }
      const { data: adminRow } = await supabase
        .from('admins_whitelist')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      setRole(adminRow ? "admin" : "user");
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setRole("guest");
        router.refresh();
      } else if (event === 'SIGNED_IN') {
        fetchRoleOnLogin();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, router]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      if (typeof document !== 'undefined') {
        document.cookie.split(";").forEach((cookie) => {
          const cookieName = cookie.split("=")[0].trim();
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
      }
      setRole("guest");
      router.refresh();
      window.location.href = "/Login";
    } catch (err) {
      console.error("Errore logout:", err);
      window.location.href = "/";
    }
  };

  // --- CONFIGURAZIONE LINK ---
  const navLinks: Record<UserRole, { name: string; href: string; isProject?: boolean }[]> = {
    guest: [
      { name: "Home", href: "/" },
      { name: "Chi siamo", href: "/About" },
      { name: "Campi Estivi", href: "/Campi" },
      { name: "Progetti", href: "#", isProject: true },
      { name: "Info utili", href: "/Info" },
      { name: "Login", href: "/Login" },
      { name: "Registrazione", href: "/Registrazione" },
    ],
    user: [
      { name: "Home", href: "/" },
      { name: "Chi siamo", href: "/About" },
      { name: "Campi Estivi", href: "/Campi" },
      { name: "Progetti", href: "#", isProject: true },
      { name: "Info utili", href: "/Info" },
      { name: "Iscrizioni", href: "/Iscrizioni" },
      { name: "Profilo", href: "/Utente" },
    ],
    admin: [
      { name: "Dashboard", href: "/admin/Dashboard" },
      { name: "Campi Estivi", href: "/admin/Campi" },
    ],
  };

  return (
    <nav className="bg-blue-light fixed top-0 left-0 right-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto py-2 px-4 h-auto flex justify-between items-center">
        <Link 
          href={role === "admin" ? "/admin/Dashboard" : "/"} 
          className="flex items-center"
        >
          <Image 
            src={logo} 
            alt="SportEssence logo" 
            quality={100} 
            width={290} 
            height={150} 
            priority 
          />
        </Link>

        {/* --- MENU DESKTOP --- */}
        <div className="hidden lg:flex flex-nowrap items-center gap-4 xl:gap-6 uppercase text-[clamp(13px,1.8vw,16px)]">
          {navLinks[role].map((link) => {
            if (link.isProject) {
              return (
                <div key={link.name} className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsProjectsOpen(!isProjectsOpen)}
                    className={`flex items-center gap-1 transition hover:underline uppercase hover:font-semibold hover:scale-105 ${
                      pathname === "/Psicomotricita" || pathname === "/LezioniIndividuali"
                        ? "text-white underline underline-offset-4 decoration-2 font-bold scale-105"
                        : "text-white"
                    }`}
                  >
                    {link.name}
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform duration-200 ${isProjectsOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {isProjectsOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-blue-light rounded-lg shadow-2xl py-2 z-50 border border-white">
                      <Link
                        href="/LezioniIndividuali"
                        className={`block px-4 py-3 text-sm text-white hover:underline hover:font-semibold transition-all ${
                          pathname === "/LezioniIndividuali" ? "text-white font-bold underline" : ""
                        }`}
                      >
                        Lezioni Individuali
                      </Link>
                      <Link
                        href="/Psicomotricita"
                        className={`block px-4 py-3 text-sm text-white hover:underline hover:font-semibold transition-all ${
                          pathname === "/Psicomotricita" ? "text-white font-bold underline" : ""
                        }`}
                      >
                        Psicomotricità negli Asili
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition hover:underline hover:font-semibold hover:scale-105 text-white whitespace-nowrap ${
                  pathname?.toLowerCase() === link.href.toLowerCase()
                    ? "underline underline-offset-4 decoration-2 font-bold scale-105"
                    : ""
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {role !== "guest" && (
            <button 
              onClick={handleLogout} 
              className="ml-2 text-white hover:text-red-400 transition"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>

        {/* --- HAMBURGER --- */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden block transition-transform duration-200 hover:scale-110 p-2 rounded text-white"
        >
          {isOpen ? <X size={30} /> : <Menu size={30} />}
        </button>
      </div>

      {/* --- MENU MOBILE --- */}
      {isOpen && (
        <div className="lg:hidden px-5 pb-3 space-y-2 bg-blue-light font-sans uppercase text-[16px]">
          {navLinks[role].map((link) => {
            if (link.isProject) {
              return (
                <div key={link.name}>
                  <div className="w-full flex items-center justify-between text-white py-1">
                    <span
                      className={`transition-transform duration-200 ${
                        pathname === "/LezioniIndividuali" || pathname === "/Psicomotricita"
                          ? "font-bold underline"
                          : ""
                      }`}
                    >
                      {link.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsProjectsOpen(!isProjectsOpen);
                      }}
                      className="p-2 -mr-2"
                      aria-label="Apri progetti"
                    >
                      <ChevronDown 
                        size={20} 
                        className={`transition-transform duration-200 ${isProjectsOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>
                  
                  {isProjectsOpen && (
                    <div className="ml-4 mt-1 space-y-3 pl-2 border-l border-white/30">
                      <Link
                        href="/LezioniIndividuali"
                        className={`block text-sm transition-transform duration-200 hover:scale-105 text-white ${
                          pathname === "/LezioniIndividuali" ? "font-bold underline" : ""
                        }`}
                      >
                        Lezioni Individuali
                      </Link>
                      <Link
                        href="/Psicomotricita"
                        className={`block text-sm transition-transform duration-200 hover:scale-105 text-white ${
                          pathname === "/Psicomotricita" ? "font-bold underline" : ""
                        }`}
                      >
                        Psicomotricità negli Asili
                      </Link>
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname?.toLowerCase() === link.href.toLowerCase();
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`block py-1 transition-transform duration-200 hover:scale-105 hover:underline hover:font-semibold text-white ${
                  isActive ? "font-bold underline underline-offset-4 decoration-2" : ""
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {role !== "guest" && (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 mt-4 text-white hover:text-red-400 transition"
            >
              <LogOut size={20} />
              <span>ESCI</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
