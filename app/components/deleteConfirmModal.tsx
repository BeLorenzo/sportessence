"use client";

import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Lock, X, Trash2, Loader2, KeyRound, Type } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Elimina definitivamente"
}: DeleteConfirmModalProps) {
  const supabase = createClient();
  
  // Stati
  const [inputValue, setInputValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [authMethod, setAuthMethod] = useState<'password' | 'social' | 'loading'>('loading');
  const [userEmail, setUserEmail] = useState("");
  
  // Stati per Turnstile
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  // Al caricamento, controlliamo il metodo di login
  useEffect(() => {
    if (isOpen) {
      const checkUserProvider = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || "");
          const provider = user.app_metadata.provider;
          setAuthMethod(provider === 'email' ? 'password' : 'social');
        } else {
          setAuthMethod('loading');
        }
      };
      checkUserProvider();
      
      // Reset stati
      setInputValue("");
      setError("");
      setCaptchaToken(null); // Reset token captcha
      // Nota: Il Turnstile si resetta automaticamente quando il componente viene smontato/rimontato o via ref
    }
  }, [isOpen, supabase]);

  if (!isOpen) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsVerifying(true);

    try {
      if (authMethod === 'password') {
        // --- CASO 1: UTENTE EMAIL/PASSWORD + TURNSTILE ---
        
        // Se il token non è pronto (raro con invisibile, ma possibile), blocchiamo
        if (!captchaToken) {
            // Proviamo a forzare l'esecuzione se manca
            turnstileRef.current?.reset();
            throw new Error("Verifica di sicurezza in corso... Riprova tra un istante.");
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: userEmail,
          password: inputValue,
          options: {
            captchaToken: captchaToken 
          }
        });

        if (signInError) {
          // Se fallisce, resettiamo il captcha per generarne uno nuovo valido
          turnstileRef.current?.reset();
          
          console.error("Errore Auth:", signInError);
          if (signInError.message.includes("Invalid login")) throw new Error("Password non corretta");
          if (signInError.message.includes("captcha")) throw new Error("Errore Captcha. Riprova.");
          throw new Error(signInError.message);
        }
      } else {
        // --- CASO 2: UTENTE GOOGLE/SOCIAL ---
        if (inputValue !== "ELIMINA") {
          throw new Error("La parola di conferma non è corretta.");
        }
      }

      // Verifica passata
      await onConfirm();
      onClose();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3 text-red-600">
            <div className="bg-red-100 p-2 rounded-full"><AlertTriangle size={24} /></div>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <p className="text-gray-600 mb-6 text-sm leading-relaxed">{description}</p>

        <form onSubmit={handleConfirm} className="space-y-4">
          
          {/* --- TURNSTILE INVISIBILE --- */}
          {/* Lo mettiamo hidden così non cambia l'estetica, ma lavora in background */}
          {authMethod === 'password' && (
             <div className="hidden">
                <Turnstile 
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                    onSuccess={(token) => setCaptchaToken(token)}
                    onError={() => setError("Errore connessione Captcha")}
                    onExpire={() => setCaptchaToken(null)}
                    options={{ size: 'invisible' }} // Modalità invisibile
                />
             </div>
          )}

          {authMethod === 'loading' ? (
            <div className="text-center py-4 text-gray-500"><Loader2 className="animate-spin mx-auto" /> Caricamento...</div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                {authMethod === 'password' ? (
                  <><KeyRound size={16} /> Conferma con la tua Password</>
                ) : (
                  <><Type size={16} /> Scrivi "ELIMINA" per confermare</>
                )}
              </label>
              
              <input
                type={authMethod === 'password' ? "password" : "text"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={authMethod === 'password' ? "La tua password" : "Scrivi ELIMINA"}
                className={`text-black w-full px-4 py-3 border rounded-lg focus:ring-2 outline-none transition-all ${
                    authMethod === 'social' ? 'uppercase placeholder:normal-case' : ''
                } ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-red-500'}`}
                autoFocus
              />
              
              {error && <p className="text-red-600 text-sm mt-2 font-medium flex items-center gap-1">❌ {error}</p>}
              
              {authMethod === 'social' && !error && (
                <p className="text-xs text-gray-400 mt-2">Login Social rilevato: digita la parola per confermare.</p>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button type="button" onClick={onClose} disabled={isVerifying} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200">
              Annulla
            </button>
            <button
              type="submit"
              disabled={!inputValue || isVerifying || authMethod === 'loading'}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-200"
            >
              {isVerifying ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}