"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup, verifySignupOTP } from "@/app/actions/auth";
import { Turnstile } from "@marsidev/react-turnstile";

export default function Registrazione() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    nome: "",
    cognome: "",
    codiceFiscale: "",
    telefono: "",
    emailContatto: "",
    usaStessaEmail: false,
    via: "",
    civico: "",
    cap: "",
    paese: "",
    provincia: "",
    password: "",
    confermaPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [pwdFlags, setPwdFlags] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ''\s-]+$/;
  const codiceFiscaleRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/i;
  const phoneRegex = /^3\d{9}$/;

  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: { target: { name: any; value: any; type: any; checked: any } }) => {
    const { name, value, type, checked } = e.target;

    if (name === "email") setIsEmailValid(emailRegex.test(value));

    if (name === "password") {
      const pwd = value;
      setPwdFlags({
        length: pwd.length >= 8,
        uppercase: /[A-Z]/.test(pwd),
        lowercase: /[a-z]/.test(pwd),
        number: /\d/.test(pwd),
        special: /[^A-Za-z0-9]/.test(pwd),
      });
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "usaStessaEmail" && checked ? { emailContatto: prev.email } : {}),
    }));
  };

  const showAlert = (msg: string, type: "error" | "success" = "error") => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => setAlertMsg(null), 5000);
  };

  const verificaIndirizzo = async () => {
    const { via, civico, paese, provincia } = form;
    const query = `${via} ${civico}, ${paese}, ${provincia}, Italia`;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}`
      );
      const data = await res.json();

      if (data.length > 0) {
        const address = data[0].address;
        if (address.postcode) {
          setForm((prev) => ({ ...prev, cap: address.postcode }));
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Errore verifica indirizzo:", err);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validazioni
    if (!emailRegex.test(form.email)) {
      showAlert("Email non valida");
      setIsSubmitting(false);
      return;
    }
    if (!codiceFiscaleRegex.test(form.codiceFiscale)) {
      showAlert("Codice Fiscale non valido");
      setIsSubmitting(false);
      return;
    }
    if (Object.values(pwdFlags).some((f) => !f)) {
      showAlert("Password non rispetta i criteri di sicurezza");
      setIsSubmitting(false);
      return;
    }
    if (form.password !== form.confermaPassword) {
      showAlert("Le password non coincidono");
      setIsSubmitting(false);
      return;
    }
    if (!nomeRegex.test(form.nome) || !nomeRegex.test(form.cognome)) {
      showAlert("Nome o cognome contengono caratteri non validi");
      setIsSubmitting(false);
      return;
    }
    const telefonoPulito = form.telefono.replace(/\s+/g, "");
    if (!phoneRegex.test(telefonoPulito)) {
      showAlert("Numero di telefono non valido (deve iniziare con 3 ed essere di 10 cifre)");
      setIsSubmitting(false);
      return;
    }

    // Verifica indirizzo
    const indirizzoValido = await verificaIndirizzo();
    if (!indirizzoValido) {
      showAlert("Indirizzo non trovato su mappa. Controlla i dati.");
      setIsSubmitting(false);
      return;
    }

    if (!turnstileToken) {
      showAlert("Attendi la verifica di sicurezza");
      setIsSubmitting(false);
      return;
    }

    try {
      const signupData = {
        email: form.email,
        password: form.password,
        nome: form.nome,
        cognome: form.cognome,
        codiceFiscale: form.codiceFiscale,
        telefono: telefonoPulito,
        emailContatto: form.emailContatto,
        via: form.via,
        civico: form.civico,
        cap: form.cap,
        paese: form.paese,
        provincia: form.provincia,
        recaptchaToken: turnstileToken,
      };

      const res = await signup(signupData);

      if (res?.error) {
        showAlert(res.error);
        setTurnstileToken(null);
      } else if (res?.needsVerification) {
        // ✅ NUOVO: Passa allo step di verifica OTP
        setRegisteredEmail(form.email);
        showAlert(
          "Account creato! Controlla la tua email per il codice di verifica.",
          "success"
        );
        setStep("otp");
      } else {
        showAlert("Registrazione completata!", "success");
        setTimeout(() => router.push("/Login"), 2000);
      }
    } catch (err) {
      console.error(err);
      showAlert("Errore imprevisto durante la registrazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (otp.length !== 8) {
      showAlert("Il codice deve essere di 8 cifre");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("email", registeredEmail);
    formData.append("token", otp);

    const result = await verifySignupOTP(formData);

    if (result?.error) {
      showAlert(result.error);
      setIsSubmitting(false);
    } else {
      showAlert("Email verificata! Ora puoi accedere.", "success");
      setTimeout(() => router.push("/Login"), 2000);
    }
  };

  return (
    <main className="min-h-screen bg-cream flex items-center relative justify-center px-4 py-12">
      <div className="absolute top-0 left-0 w-full h-full z-10">
        <img
          src="/imgs/sfondoRegistrazione.jpg"
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

      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-2xl relative z-20">
        {step === "form" ? (
          // STEP 1: Form Registrazione (come prima)
          <>
            <h1 className="text-3xl font-bold text-blue-deep mb-6 text-center">
              Crea il tuo account
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* EMAIL PRINCIPALE */}
              <div>
                <label className="block text-blue-deep font-semibold mb-1">Email principale</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="mario.rossi@email.it"
                  className={`w-full px-4 py-2 rounded-lg border text-black focus:ring-2 focus:ring-cyan-600 ${
                    !isEmailValid && form.email.length > 0 ? "border-red-400" : "border-gray-300"
                  }`}
                />
              </div>

              {/* NOME E COGNOME */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-deep font-semibold mb-1">Nome</label>
                  <input
                    type="text"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    placeholder="Mario"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-deep font-semibold mb-1">Cognome</label>
                  <input
                    type="text"
                    name="cognome"
                    value={form.cognome}
                    onChange={handleChange}
                    placeholder="Rossi"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black"
                    required
                  />
                </div>
              </div>

              {/* CF E TELEFONO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-deep font-semibold mb-1">Codice Fiscale</label>
                  <input
                    type="text"
                    name="codiceFiscale"
                    value={form.codiceFiscale}
                    onChange={handleChange}
                    placeholder="RSSMRA90A01F205X"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg uppercase focus:ring-2 focus:ring-cyan-600 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-deep font-semibold mb-1">Cellulare</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleChange}
                    placeholder="342 0000000"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black"
                    required
                  />
                </div>
              </div>

              {/* INDIRIZZO (Via, Civico) */}
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                <div>
                  <label className="block text-blue-deep font-semibold mb-1">Via / Piazza</label>
                  <input
                    type="text"
                    name="via"
                    value={form.via}
                    onChange={handleChange}
                    placeholder="Via Roma"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-deep font-semibold mb-1">Civico</label>
                  <input
                    type="text"
                    name="civico"
                    value={form.civico}
                    onChange={handleChange}
                    placeholder="12/B"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black"
                    required
                  />
                </div>
              </div>

              {/* INDIRIZZO (CAP, Paese, Provincia) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-blue-deep font-semibold mb-1">CAP</label>
                  <input
                    type="text"
                    name="cap"
                    value={form.cap}
                    onChange={handleChange}
                    placeholder="20100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-deep font-semibold mb-1">Comune</label>
                  <input
                    type="text"
                    name="paese"
                    value={form.paese}
                    onChange={handleChange}
                    placeholder="Milano"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-blue-deep font-semibold mb-1">Prov.</label>
                  <input
                    type="text"
                    name="provincia"
                    value={form.provincia}
                    onChange={handleChange}
                    placeholder="MI"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black"
                    required
                  />
                </div>
              </div>

              {/* EMAIL CONTATTO */}
              <div>
                <label className="block text-blue-deep font-semibold mb-1">Email per contatti</label>
                <input
                  type="email"
                  name="emailContatto"
                  value={form.emailContatto}
                  onChange={handleChange}
                  placeholder="genitore2@email.it"
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black ${
                    form.usaStessaEmail ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                  }`}
                  disabled={form.usaStessaEmail}
                  required
                />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="usaStessaEmail"
                    checked={form.usaStessaEmail}
                    onChange={handleChange}
                    className="w-4 h-4 accent-cyan-600"
                  />
                  <span className="text-sm text-gray-600">Usa la stessa email dell'account</span>
                </label>
              </div>

              {/* PASSWORD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-deep font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    placeholder="Min. 8 caratteri"
                    className="w-full px-4 py-2 rounded-lg text-black border border-gray-300 focus:ring-2 focus:ring-cyan-600"
                  />
                  <ul className="text-xs space-y-1 mt-2 text-gray-500">
                    <li className={pwdFlags.length ? "text-green-600 line-through" : ""}>
                      - Almeno 8 caratteri
                    </li>
                    <li className={pwdFlags.uppercase ? "text-green-600 line-through" : ""}>
                      - Una maiuscola
                    </li>
                    <li className={pwdFlags.lowercase ? "text-green-600 line-through" : ""}>
                      - Una minuscola
                    </li>
                    <li className={pwdFlags.number ? "text-green-600 line-through" : ""}>
                      - Un numero
                    </li>
                    <li className={pwdFlags.special ? "text-green-600 line-through" : ""}>
                      - Un carattere speciale
                    </li>
                  </ul>
                </div>
                <div>
                  <label className="block text-blue-deep font-semibold mb-1">Conferma Password</label>
                  <input
                    type="password"
                    name="confermaPassword"
                    value={form.confermaPassword}
                    onChange={handleChange}
                    required
                    placeholder="Ripeti password"
                    className={`w-full px-4 py-2 text-black rounded-lg border ${
                      form.confermaPassword && form.confermaPassword !== form.password
                        ? "border-red-400"
                        : "border-gray-300"
                    } focus:ring-2 focus:ring-cyan-600`}
                  />
                </div>
              </div>

{/* WIDGET CLOUDFLARE TURNSTILE */}
              <div className="flex justify-center py-2">
                <Turnstile 
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""} 
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  options={{ theme: 'light' }}
                />
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting || !turnstileToken}
                className={`w-full bg-cyan-600 text-white py-3 rounded-lg shadow-md hover:bg-cyan-700 transition-all font-semibold ${
                  (isSubmitting || !turnstileToken) ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Registrazione in corso..." : "Registrati"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              Hai già un account?{" "}
              <a href="/Login" className="text-cyan-600 font-semibold hover:underline">
                Accedi qui
              </a>
            </p>
          </>
        ) : (
          // STEP 2: Verifica OTP
          <>
            <h1 className="text-3xl font-bold text-blue-deep mb-2 text-center">
              Verifica Email
            </h1>
            <p className="text-gray-600 text-sm text-center mb-2">
              Abbiamo inviato un codice di 8 cifre a:
            </p>
            <p className="text-blue-deep font-semibold text-center mb-6">
              {registeredEmail}
            </p>

            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="block text-blue-deep font-semibold mb-1 text-center">
                  Codice di Verifica
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  required
                  maxLength={8}
                  placeholder="12345678"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-black text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-cyan-600"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 8}
                className={`w-full bg-cyan-600 text-white py-3 rounded-lg shadow-md hover:bg-cyan-700 transition-all font-semibold ${
                  (isSubmitting || otp.length !== 8) ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? "Verifica..." : "Verifica Email"}
              </button>
            </form>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-gray-700">
              <p className="font-semibold mb-2">💡 Suggerimenti:</p>
              <ul className="space-y-1">
                <li>• Controlla anche la cartella spam</li>
                <li>• Il codice è valido per 1 ora</li>
                <li>• Non condividere il codice con nessuno</li>
              </ul>
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={() => setStep("form")}
                className="text-cyan-600 text-sm hover:underline"
              >
                ← Torna al form di registrazione
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}