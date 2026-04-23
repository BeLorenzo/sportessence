"use client";

import { useState, useRef, useEffect } from "react";
import { forgotPassword, verifyOTPAndResetPassword } from "@/app/actions/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Turnstile } from "@marsidev/react-turnstile";

export default function RecuperoPassword() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertType, setAlertType] = useState<"error" | "success">("error");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
  let interval: NodeJS.Timeout;
  if (resendTimer > 0) {
    interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
  }
  return () => clearInterval(interval);
}, [resendTimer]);

  // Stati per il Captcha
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<any>(null);

  const showAlert = (msg: string, type: "error" | "success" = "error") => {
    setAlertMsg(msg);
    setAlertType(type);
    setTimeout(() => setAlertMsg(null), 8000);
  };

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "La password deve essere di almeno 8 caratteri";
    if (!/[A-Z]/.test(pwd)) return "La password deve contenere almeno una lettera maiuscola";
    if (!/[a-z]/.test(pwd)) return "La password deve contenere almeno una lettera minuscola";
    if (!/[0-9]/.test(pwd)) return "La password deve contenere almeno un numero";
    return null;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!email) {
      showAlert("Inserisci la tua email");
      setIsSubmitting(false);
      return;
    }

    if (!captchaToken) {
      showAlert("Completa il controllo di sicurezza per procedere");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("recaptchaToken", captchaToken);

      const result = await forgotPassword(formData);

      if (result?.error) {
        showAlert(result.error);
        turnstileRef.current?.reset();
        setCaptchaToken(null);
      } else {
        showAlert(
          "Se hai un account registrato con questa email, riceverai un codice a breve. Controlla anche la cartella spam.",
          "success"
        );
        setStep("otp");
        setResendTimer(40);
      }
    } catch (error) {
      showAlert("Errore di connessione con il server");
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (otp.length !== 8) {
      showAlert("Il codice deve essere di 8 cifre");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Le password non corrispondono");
      setIsSubmitting(false);
      return;
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      showAlert(pwdError);
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("token", otp);
      formData.append("password", password);

      const result = await verifyOTPAndResetPassword(formData);

      if (result?.error) {
        showAlert(result.error);
        setIsSubmitting(false);
      } else {
        showAlert("Password aggiornata con successo!", "success");
        setTimeout(() => router.push("/Login"), 2000);
      }
    } catch (error) {
      showAlert("Errore di connessione con il server");
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

      {alertMsg && (
        <div
          className={`fixed z-50 top-4 left-1/2 -translate-x-1/2 px-4 py-3 rounded-lg font-semibold shadow-lg max-w-md ${
            alertType === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white"
          }`}
        >
          {alertMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 w-full max-w-md relative z-20 mb-15">
        {step === "email" ? (
          <>
            <h1 className="text-3xl font-bold text-blue-deep mb-2 text-center">
              Recupera Password
            </h1>
            <p className="text-gray-600 text-sm text-center mb-6">
              Ti invieremo un codice di 8 cifre per reimpostare la password
            </p>

            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-blue-deep font-semibold mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="mario.rossi@email.it"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black focus:ring-2 focus:ring-cyan-600"
                />
              </div>

              <div className="flex justify-center mt-4">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                  onSuccess={(token) => setCaptchaToken(token)}
                  options={{
                    theme: "light",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !captchaToken}
                className={`w-full bg-cyan-600 text-white py-3 rounded-lg shadow-md 
                  hover:-translate-y-1 hover:shadow-xl hover:bg-cyan-700 hover:cursor-pointer
                  transition-all duration-300 ease-out font-semibold
                  ${(isSubmitting || !captchaToken) ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? "Invio in corso..." : "Invia Codice di Verifica"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600 space-y-2">
              <p>
                Ricordi la password?{" "}
                <Link href="/Login" className="text-cyan-600 font-semibold hover:underline">
                  Torna al Login
                </Link>
              </p>
              <p>
                Non hai un account?{" "}
                <Link href="/Registrazione" className="text-cyan-600 font-semibold hover:underline">
                  Registrati
                </Link>
              </p>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold text-blue-900 mb-2">📧 Come funziona:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Inserisci la tua email e risolvi il captcha</li>
                <li>Riceverai un codice di 8 cifre via email</li>
                <li>Inserisci il codice e la nuova password</li>
                <li>Accedi con le nuove credenziali</li>
              </ol>
              <p className="mt-2 text-xs text-gray-600">
                ⏱️ Il codice è valido per 1 ora
              </p>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setStep("email")}
              className="mb-4 text-cyan-600 hover:underline text-sm"
            >
              ← Cambia email
            </button>

            <h1 className="text-3xl font-bold text-blue-deep mb-2 text-center">
              Reimposta Password
            </h1>
            <p className="text-gray-600 text-sm text-center mb-2">
              Inserisci il codice ricevuto via email:
            </p>
            <p className="text-blue-deep font-semibold text-center mb-6">
              {email}
            </p>

            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-blue-deep font-semibold mb-1 text-center">
                  Codice di 8 cifre
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  required
                  maxLength={8}
                  placeholder="12345678"
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-black text-center text-xl font-mono tracking-wider focus:ring-2 focus:ring-cyan-600"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-blue-deep font-semibold mb-1">
                  Nuova Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Almeno 8 caratteri"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black focus:ring-2 focus:ring-cyan-600"
                />
              </div>

              <div>
                <label className="block text-blue-deep font-semibold mb-1">
                  Conferma Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Ripeti la password"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black focus:ring-2 focus:ring-cyan-600"
                />
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs">
                <p className="font-semibold text-gray-700 mb-2">La password deve contenere:</p>
                <ul className="space-y-1 text-gray-600">
                  <li className={password.length >= 8 ? "text-green-600" : ""}>
                    ✓ Almeno 8 caratteri
                  </li>
                  <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>
                    ✓ Una lettera maiuscola
                  </li>
                  <li className={/[a-z]/.test(password) ? "text-green-600" : ""}>
                    ✓ Una lettera minuscola
                  </li>
                  <li className={/[0-9]/.test(password) ? "text-green-600" : ""}>
                    ✓ Un numero
                  </li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otp.length !== 8}
                className={`w-full bg-cyan-600 text-white py-3 rounded-lg shadow-md 
                  hover:-translate-y-1 hover:shadow-xl hover:bg-cyan-700 hover:cursor-pointer
                  transition-all duration-300 ease-out font-semibold
                  ${(isSubmitting || otp.length !== 8) ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isSubmitting ? "Aggiornamento..." : "Reimposta Password"}
              </button>
            </form>

            <div className="mt-4 text-center">
  <button
    onClick={() => {
      if (resendTimer === 0) {
        setCaptchaToken(null);
        setStep("email");
        showAlert("Completa di nuovo il Captcha per reinviare l'email", "success");
      }
    }}
    disabled={isSubmitting || resendTimer > 0} // Disabilitato se il timer è attivo
    type="button"
    className={`text-sm font-semibold transition-colors ${
      resendTimer > 0 
        ? "text-gray-400 cursor-not-allowed" 
        : "text-cyan-600 hover:underline cursor-pointer"
    }`}
  >
    {resendTimer > 0 
      ? `Puoi riprovare tra ${resendTimer}s` 
      : "Non hai ricevuto il codice? Riprova"}
  </button>
</div>

            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-gray-700">
              <p className="font-semibold mb-2">💡 Nota:</p>
              <p>Dopo aver reimpostato la password, potrai accedere immediatamente con la nuova password.</p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}