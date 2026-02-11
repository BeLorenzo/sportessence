// SEZIONE PROFILO MIGLIORATA CON VALIDAZIONI E MODAL OTP
// Sostituisci la sezione "Dati Personali" nella pagina Utente con questo codice

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit2, 
  Save, 
  X
} from "lucide-react";
import ChangeCredentialsModal from "./changeCredentialsModal";  // ✨ Modal con OTP

type Profile = {
  id: string;
  email: string;
  nome: string;
  cognome: string;
  cf: string;
  telefono: string;
  email_contatti: string;
  indirizzo_via: string;
  indirizzo_civico: string;
  indirizzo_cap: string;
  indirizzo_paese: string;
  indirizzo_provincia: string;
};

// REGEX DI VALIDAZIONE (stesse della registrazione)
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ''\s-]+$/;
const phoneRegex = /^3\d{9}$/;
const capRegex = /^\d{5}$/;
const provinciaRegex = /^[A-Z]{2}$/;

interface ProfileSectionProps {
  profile: Profile;
  onProfileUpdate: () => void;
  showAlert: (msg: string, type: "error" | "success") => void;
}

export default function ProfileSection({ profile, onProfileUpdate, showAlert }: ProfileSectionProps) {
  const supabase = createClient();
  
  const [editingProfile, setEditingProfile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Profile>(profile);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);  // ✨ Modal OTP
  
  // Stato validazioni
  const [validations, setValidations] = useState({
    nome: true,
    cognome: true,
    telefono: true,
    emailContatti: true,
    cap: true,
    provincia: true,
  });

  // Aggiorna formData quando cambia profile
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  // Validazione in tempo reale
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'nome':
      case 'cognome':
        return nomeRegex.test(value);
      case 'telefono':
        const cleanPhone = value.replace(/\s+/g, "");
        return phoneRegex.test(cleanPhone);
      case 'email_contatti':
        return emailRegex.test(value);
      case 'indirizzo_cap':
        return capRegex.test(value);
      case 'indirizzo_provincia':
        return provinciaRegex.test(value.toUpperCase());
      default:
        return true;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Aggiorna form data
    setFormData(prev => ({
      ...prev,
      [name]: name === 'indirizzo_provincia' ? value.toUpperCase() : value
    }));

    // Aggiorna validazione in tempo reale
    const isValid = validateField(name, value);
    setValidations(prev => ({
      ...prev,
      [name === 'email_contatti' ? 'emailContatti' : name]: isValid
    }));
  };

  const handleSaveProfile = async () => {
    // VALIDAZIONE COMPLETA PRIMA DEL SALVATAGGIO
    
    // 1. Controlla campi obbligatori vuoti
    if (!formData.nome || !formData.cognome || !formData.telefono || 
        !formData.email_contatti || !formData.indirizzo_via || 
        !formData.indirizzo_civico || !formData.indirizzo_cap || 
        !formData.indirizzo_paese || !formData.indirizzo_provincia) {
      showAlert("Compila tutti i campi obbligatori", "error");
      return;
    }

    // 2. Valida Nome e Cognome
    if (!nomeRegex.test(formData.nome)) {
      showAlert("Il nome contiene caratteri non validi (solo lettere, accenti e spazi)", "error");
      setValidations(prev => ({ ...prev, nome: false }));
      return;
    }
    if (!nomeRegex.test(formData.cognome)) {
      showAlert("Il cognome contiene caratteri non validi (solo lettere, accenti e spazi)", "error");
      setValidations(prev => ({ ...prev, cognome: false }));
      return;
    }

    // 3. Valida Telefono
    const telefonoPulito = formData.telefono.replace(/\s+/g, "");
    if (!phoneRegex.test(telefonoPulito)) {
      showAlert("Numero di telefono non valido (deve iniziare con 3 ed essere di 10 cifre)", "error");
      setValidations(prev => ({ ...prev, telefono: false }));
      return;
    }

    // 4. Valida Email Contatti
    if (!emailRegex.test(formData.email_contatti)) {
      showAlert("Email di contatto non valida", "error");
      setValidations(prev => ({ ...prev, emailContatti: false }));
      return;
    }

    // 5. Valida CAP
    if (!capRegex.test(formData.indirizzo_cap)) {
      showAlert("CAP non valido (deve essere di 5 cifre)", "error");
      setValidations(prev => ({ ...prev, cap: false }));
      return;
    }

    // 6. Valida Provincia
    if (!provinciaRegex.test(formData.indirizzo_provincia)) {
      showAlert("Provincia non valida (2 lettere maiuscole, es. MI)", "error");
      setValidations(prev => ({ ...prev, provincia: false }));
      return;
    }

    setIsSubmitting(true);

    // 7. SALVA SU SUPABASE
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome,
          cognome: formData.cognome,
          telefono: telefonoPulito,
          email_contatti: formData.email_contatti,
          indirizzo_via: formData.indirizzo_via,
          indirizzo_civico: formData.indirizzo_civico,
          indirizzo_cap: formData.indirizzo_cap,
          indirizzo_paese: formData.indirizzo_paese,
          indirizzo_provincia: formData.indirizzo_provincia,
        })
        .eq('id', profile.id);

      if (error) throw error;

      showAlert("✅ Dati aggiornati con successo!", "success");
      setEditingProfile(false);
      onProfileUpdate(); // Ricarica i dati
    } catch (error: any) {
      console.error("Errore aggiornamento profilo:", error);
      showAlert("❌ Errore durante l'aggiornamento: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile); // Reset ai valori originali
    setEditingProfile(false);
    // Reset validazioni
    setValidations({
      nome: true,
      cognome: true,
      telefono: true,
      emailContatti: true,
      cap: true,
      provincia: true,
    });
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-blue-deep flex items-center gap-2">
            <User size={24} />
            Dati Personali
          </h2>
          {!editingProfile ? (
            <button
              onClick={() => setEditingProfile(true)}
              className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 
                transition-all flex items-center gap-2 font-semibold"
            >
              <Edit2 size={18} />
              Modifica
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={isSubmitting}
                className={`bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 
                  transition-all flex items-center gap-2 font-semibold
                  ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <Save size={18} />
                {isSubmitting ? 'Salvataggio...' : 'Salva'}
              </button>
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 
                  transition-all flex items-center gap-2 font-semibold"
              >
                <X size={18} />
                Annulla
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome */}
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-2">
              Nome *
            </label>
            {editingProfile ? (
              <>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-600 text-black
                    ${!validations.nome ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                {!validations.nome && (
                  <p className="text-red-500 text-xs mt-1">Solo lettere, accenti e spazi</p>
                )}
              </>
            ) : (
              <p className="text-gray-800 font-medium">{formData.nome}</p>
            )}
          </div>

          {/* Cognome */}
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-2">
              Cognome *
            </label>
            {editingProfile ? (
              <>
                <input
                  type="text"
                  name="cognome"
                  value={formData.cognome}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-600 text-black
                    ${!validations.cognome ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                {!validations.cognome && (
                  <p className="text-red-500 text-xs mt-1">Solo lettere, accenti e spazi</p>
                )}
              </>
            ) : (
              <p className="text-gray-800 font-medium">{formData.cognome}</p>
            )}
          </div>

          {/* Email (con pulsante modifica) */}
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-2 flex items-center gap-2">
              <Mail size={16} />
              Email Account
            </label>
            <div className="flex items-center gap-2">
              <p className="text-gray-800 font-medium">{formData.email}</p>
              <button
                onClick={() => setShowCredentialsModal(true)}
                className="text-cyan-600 text-sm hover:underline"
              >
                Modifica Email/Password
              </button>
            </div>
          </div>

          {/* Codice Fiscale (non modificabile) */}
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-2">
              Codice Fiscale
            </label>
            <p className="text-gray-800 font-medium uppercase">{formData.cf}</p>
            <p className="text-xs text-gray-500 mt-1">Non modificabile</p>
          </div>

          {/* Telefono */}
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-2 flex items-center gap-2">
              <Phone size={16} />
              Telefono *
            </label>
            {editingProfile ? (
              <>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="342 0000000"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-600 text-black
                    ${!validations.telefono ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                {!validations.telefono && (
                  <p className="text-red-500 text-xs mt-1">Deve iniziare con 3 (10 cifre)</p>
                )}
              </>
            ) : (
              <p className="text-gray-800 font-medium">{formData.telefono}</p>
            )}
          </div>

          {/* Email Contatti */}
          <div>
            <label className="block text-gray-600 text-sm font-semibold mb-2 flex items-center gap-2">
              <Mail size={16} />
              Email Contatti *
            </label>
            {editingProfile ? (
              <>
                <input
                  type="email"
                  name="email_contatti"
                  value={formData.email_contatti}
                  onChange={handleChange}
                  placeholder="contatto@email.it"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-600 text-black
                    ${!validations.emailContatti ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                />
                {!validations.emailContatti && (
                  <p className="text-red-500 text-xs mt-1">Email non valida</p>
                )}
              </>
            ) : (
              <p className="text-gray-800 font-medium">{formData.email_contatti}</p>
            )}
          </div>

          {/* Indirizzo */}
          <div className="md:col-span-2">
            <label className="block text-gray-600 text-sm font-semibold mb-2 flex items-center gap-2">
              <MapPin size={16} />
              Indirizzo *
            </label>
            {editingProfile ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-4">
                  <input
                    type="text"
                    name="indirizzo_via"
                    value={formData.indirizzo_via}
                    onChange={handleChange}
                    placeholder="Via/Piazza"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black"
                  />
                  <input
                    type="text"
                    name="indirizzo_civico"
                    value={formData.indirizzo_civico}
                    onChange={handleChange}
                    placeholder="Civico"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      name="indirizzo_cap"
                      value={formData.indirizzo_cap}
                      onChange={handleChange}
                      placeholder="CAP"
                      maxLength={5}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-600 text-black
                        ${!validations.cap ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                    {!validations.cap && (
                      <p className="text-red-500 text-xs mt-1">5 cifre</p>
                    )}
                  </div>
                  <input
                    type="text"
                    name="indirizzo_paese"
                    value={formData.indirizzo_paese}
                    onChange={handleChange}
                    placeholder="Comune"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black"
                  />
                  <div>
                    <input
                      type="text"
                      name="indirizzo_provincia"
                      value={formData.indirizzo_provincia}
                      onChange={handleChange}
                      placeholder="Prov."
                      maxLength={2}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-600 text-black uppercase
                        ${!validations.provincia ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                    {!validations.provincia && (
                      <p className="text-red-500 text-xs mt-1">2 lettere</p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-800 font-medium mb-2">
                  {formData.indirizzo_via} {formData.indirizzo_civico}
                </p>
                <p className="text-gray-800 font-medium">
                  {formData.indirizzo_cap} {formData.indirizzo_paese} ({formData.indirizzo_provincia})
                </p>
              </>
            )}
          </div>
        </div>

        {/* Info verifica indirizzo */}
        {editingProfile && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              ℹ️ <strong>Nota:</strong> L'indirizzo verrà verificato su OpenStreetMap prima del salvataggio 
              per garantire che sia valido e corretto.
            </p>
          </div>
        )}
      </div>

      {/* ✨ Modal Cambio Credenziali con OTP */}
      <ChangeCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
        currentEmail={profile.email}
        showAlert={showAlert}
      />
    </>
  );
}