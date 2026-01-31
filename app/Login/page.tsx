"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/actions/auth";
import { Turnstile } from '@marsidev/react-turnstile'; // Assicurati di aver installato: npm install @marsidev/react-turnstile

export default function Login() {
  const router = useRouter();
  
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  
  // Stato per il token di Cloudflare
  const [token, setToken] = useState<string | null>(null);

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const showAlert = (msg: string, type: "error" | "success" = "error") => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!form.email || !form.password) {
      showAlert("Compila tutti i campi");
      setIsSubmitting(false);
      return;
    }

    // Controllo Token Cloudflare
    if (!token) {
      showAlert("Attendi la verifica di sicurezza (Cloudflare)");
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepara FormData
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("password", form.password);
      // Passiamo il token con lo stesso nome che si aspetta la tua Server Action
      formData.append("recaptchaToken", token);

      // Chiama la Server Action
      const result = await login(formData);

      if (result?.error) {
        showAlert(result.error);
        setIsSubmitting(false);
        // Resetta il widget in caso di errore (opzionale, ma consigliato)
        setToken(null); 
        return;
      }

      // Login riuscito!
      if (result?.success && result?.role) {
        const targetUrl = result.role === 'admin' ? '/admin/Dashboard' : '/Utente';
        router.refresh(); 
        router.push(targetUrl); 
      } 
      
    } catch (error: any) {
      console.error("Login error:", error);
      showAlert("Errore di connessione");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream flex justify-center items-start pt-24 relative">
      <div className="absolute top-0 left-0 w-full h-full z-10">
        <img
          src="/imgs/sfondoLogin.jpg"
          alt="Sfondo decorativo"
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* ALERT */}
      {alertMsg && (
        <div
          className={`fixed z-50 top-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg font-semibold shadow-lg ${
            alertType === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
          }`}
        >
          {alertMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-md relative z-20">
        <h1 className="text-3xl font-bold text-blue-deep mb-6 text-center">
          Accedi al tuo account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-blue-deep font-semibold mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="mario.rossi@email.it"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          <div>
            <label className="block text-blue-deep font-semibold mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Inserisci la password"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black focus:ring-2 focus:ring-cyan-600"
            />
          </div>

          {/* WIDGET CLOUDFLARE TURNSTILE */}
          <div className="flex justify-center py-2">
            <Turnstile 
  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} 
  onSuccess={(token) => setToken(token)}
  options={{
    appearance: 'always', // Forza l'esecuzione
    theme: 'light',
  }}
/>
          </div>

          <button
            type="submit"
            // Disabilitato se sta caricando o se non c'è il token Cloudflare
            disabled={isSubmitting || !token}
            className={`w-full bg-cyan-600 text-white py-3 rounded-lg shadow-md 
              hover:-translate-y-1 hover:shadow-xl hover:bg-cyan-700 hover:cursor-pointer
              transition-all duration-300 ease-out font-semibold
              ${(isSubmitting || !token) ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {isSubmitting ? "Accesso in corso..." : !token ? "Verifica in corso..." : "Accedi"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600 space-y-2">
          <p>
            Non hai un account?{" "}
            <a href="/Registrazione" className="text-cyan-600 font-semibold hover:underline">
              Crea account
            </a>
          </p>
          <p>
            Hai dimenticato la password?{" "}
            <a href="/RecuperoPassword" className="text-cyan-600 font-semibold hover:underline">
              Recupera password
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}