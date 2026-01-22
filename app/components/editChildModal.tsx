"use client";

import { useState, useEffect } from "react";
import { X, Plus, Edit2, AlertCircle } from "lucide-react";
import { updateChild } from "../actions/childrens";

// REGEX VALIDAZIONI
const nomeRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ''\s-]+$/;
const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;

// Taglie disponibili
const TAGLIE = ['4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL'];

type Child = {
  id: string;
  nome: string;
  cognome: string;
  cf: string;
  data_nascita: string;
  taglia_maglietta: string;
  intolleranze: string[];
};

interface EditChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child | null;
  onSuccess: () => void;
  showAlert: (msg: string, type: "error" | "success") => void;
}

export default function EditChildModal({ 
  isOpen, 
  onClose, 
  child,
  onSuccess,
  showAlert 
}: EditChildModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    cf: "",
    data_nascita: "",
    taglia_maglietta: "",
    intolleranze: [] as string[],
  });

  const [intolleranzaInput, setIntolleranzaInput] = useState("");

  const [validations, setValidations] = useState({
    nome: true,
    cognome: true,
    cf: true,
    data_nascita: true,
  });

  // Carica dati bambino quando si apre il modal
  useEffect(() => {
    if (isOpen && child) {
      setFormData({
        nome: child.nome,
        cognome: child.cognome,
        cf: child.cf,
        data_nascita: child.data_nascita,
        taglia_maglietta: child.taglia_maglietta,
        intolleranze: child.intolleranze || [],
      });
      setIntolleranzaInput("");
      setValidations({
        nome: true,
        cognome: true,
        cf: true,
        data_nascita: true,
      });
    }
  }, [isOpen, child]);

  // Blocca scroll quando modal è aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // CF sempre maiuscolo
    const finalValue = name === 'cf' ? value.toUpperCase() : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    // Validazione in tempo reale
    if (name === 'nome' || name === 'cognome') {
      setValidations(prev => ({
        ...prev,
        [name]: nomeRegex.test(value)
      }));
    } else if (name === 'cf') {
      setValidations(prev => ({
        ...prev,
        cf: cfRegex.test(finalValue)
      }));
    } else if (name === 'data_nascita') {
      const isValid = validateDataNascita(value);
      setValidations(prev => ({
        ...prev,
        data_nascita: isValid
      }));
    }
  };

  const validateDataNascita = (date: string): boolean => {
    if (!date) return false;
    const birthDate = new Date(date);
    const today = new Date();
    const minDate = new Date('1900-01-01');
    
    return birthDate <= today && birthDate >= minDate;
  };

  // NORMALIZZAZIONE INTOLLERANZE
  const normalizeIntolleranza = (text: string): string => {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' '); // Rimuovi spazi multipli
  };

  const addIntolleranza = () => {
    const trimmed = intolleranzaInput.trim();
    if (!trimmed) return;

    // Gestisce input multipli separati da virgola
    const items = trimmed.split(',').map(item => item.trim()).filter(Boolean);
    
    const newIntolleranze: string[] = [];
    
    items.forEach(item => {
      const normalized = normalizeIntolleranza(item);
      
      // Controlla se esiste già (case-insensitive)
      const exists = formData.intolleranze.some(
        existing => normalizeIntolleranza(existing) === normalized
      );
      
      if (!exists && !newIntolleranze.includes(normalized)) {
        newIntolleranze.push(normalized);
      }
    });

    if (newIntolleranze.length > 0) {
      setFormData(prev => ({
        ...prev,
        intolleranze: [...prev.intolleranze, ...newIntolleranze]
      }));
    }
    
    setIntolleranzaInput("");
  };

  const removeIntolleranza = (index: number) => {
    setFormData(prev => ({
      ...prev,
      intolleranze: prev.intolleranze.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!child) return;
    
    setIsSubmitting(true);

    // VALIDAZIONI COMPLETE (stesse di addChildModal)
    
    if (!formData.nome || !formData.cognome || !formData.cf || 
        !formData.data_nascita || !formData.taglia_maglietta) {
      showAlert("❌ Compila tutti i campi obbligatori", "error");
      setIsSubmitting(false);
      return;
    }

    if (!nomeRegex.test(formData.nome)) {
      showAlert("❌ Il nome contiene caratteri non validi (solo lettere, accenti e spazi)", "error");
      setValidations(prev => ({ ...prev, nome: false }));
      setIsSubmitting(false);
      return;
    }

    if (!nomeRegex.test(formData.cognome)) {
      showAlert("❌ Il cognome contiene caratteri non validi (solo lettere, accenti e spazi)", "error");
      setValidations(prev => ({ ...prev, cognome: false }));
      setIsSubmitting(false);
      return;
    }

    if (!cfRegex.test(formData.cf)) {
      showAlert("❌ Codice Fiscale non valido (16 caratteri, formato: RSSMRA90A01F205X)", "error");
      setValidations(prev => ({ ...prev, cf: false }));
      setIsSubmitting(false);
      return;
    }

    if (!validateDataNascita(formData.data_nascita)) {
      showAlert("❌ Data di nascita non valida (non può essere futura)", "error");
      setValidations(prev => ({ ...prev, data_nascita: false }));
      setIsSubmitting(false);
      return;
    }

    try {
      // Crea FormData
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('nome', formData.nome);
      formDataToSubmit.append('cognome', formData.cognome);
      formDataToSubmit.append('cf', formData.cf);
      formDataToSubmit.append('data_nascita', formData.data_nascita);
      formDataToSubmit.append('taglia_maglietta', formData.taglia_maglietta);
      formDataToSubmit.append('intolleranze', JSON.stringify(formData.intolleranze));

      // Chiama Server Action
      const result = await updateChild(child.id, formDataToSubmit);

      if (result?.error) {
        showAlert("❌ " + result.error, "error");
        setIsSubmitting(false);
        return;
      }

      // Successo!
      showAlert("✅ Dati bambino aggiornati con successo!", "success");
      onSuccess(); // Ricarica i dati
      onClose(); // Chiudi modal
    } catch (error: any) {
      console.error("Errore aggiornamento bambino:", error);
      showAlert("❌ Errore durante l'aggiornamento: " + error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !child) return null;

  return (
    <div className="fixed inset-0 z-49 mt-10 flex items-center justify-center p-4">
      {/* Overlay sfondo opacizzato */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-blue-light text-white p-6 flex justify-between items-center rounded-t-2xl z-10">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Edit2 size={28} />
            Modifica Dati Bambino
          </h2>
          <button
            onClick={onClose}
            className="hover:scale-125 p-2 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Nome e Cognome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-deep font-semibold mb-2">
                Nome *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Mario"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-600 text-black
                  ${!validations.nome && formData.nome ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {!validations.nome && formData.nome && (
                <p className="text-red-500 text-xs mt-1">Solo lettere, accenti e spazi</p>
              )}
            </div>

            <div>
              <label className="block text-blue-deep font-semibold mb-2">
                Cognome *
              </label>
              <input
                type="text"
                name="cognome"
                value={formData.cognome}
                onChange={handleChange}
                required
                placeholder="Rossi"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-600 text-black
                  ${!validations.cognome && formData.cognome ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {!validations.cognome && formData.cognome && (
                <p className="text-red-500 text-xs mt-1">Solo lettere, accenti e spazi</p>
              )}
            </div>
          </div>

          {/* Codice Fiscale */}
          <div>
            <label className="block text-blue-deep font-semibold mb-2">
              Codice Fiscale *
            </label>
            <input
              type="text"
              name="cf"
              value={formData.cf}
              onChange={handleChange}
              required
              maxLength={16}
              placeholder="RSSMRA10A01F205X"
              className={`w-full px-4 py-2 border rounded-lg uppercase focus:ring-2 focus:ring-cyan-600 text-black font-mono
                ${!validations.cf && formData.cf ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            {!validations.cf && formData.cf && (
              <p className="text-red-500 text-xs mt-1">16 caratteri (es: RSSMRA90A01F205X)</p>
            )}
          </div>

          {/* Data di Nascita e Taglia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-blue-deep font-semibold mb-2">
                Data di Nascita *
              </label>
              <input
                type="date"
                name="data_nascita"
                value={formData.data_nascita}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
                min="1900-01-01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-600 text-black
                  ${!validations.data_nascita && formData.data_nascita ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
              />
              {!validations.data_nascita && formData.data_nascita && (
                <p className="text-red-500 text-xs mt-1">Data non valida</p>
              )}
            </div>

            <div>
              <label className="block text-blue-deep font-semibold mb-2">
                Taglia Maglietta *
              </label>
              <select
                name="taglia_maglietta"
                value={formData.taglia_maglietta}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black"
              >
                <option value="">Seleziona taglia</option>
                {TAGLIE.map(taglia => (
                  <option key={taglia} value={taglia}>
                    {taglia}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Intolleranze/Allergie */}
          <div>
            <label className="block text-blue-deep font-semibold mb-2">
              Intolleranze/Allergie (opzionale)
            </label>
            
            {/* Input per aggiungere */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={intolleranzaInput}
                onChange={(e) => setIntolleranzaInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addIntolleranza();
                  }
                }}
                placeholder="Es: Lattosio, Glutine, Noci..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-600 text-black"
              />
              <button
                type="button"
                onClick={addIntolleranza}
                className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Lista intolleranze */}
            {formData.intolleranze.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.intolleranze.map((int, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2"
                  >
                    {int}
                    <button
                      type="button"
                      onClick={() => removeIntolleranza(index)}
                      className="hover:text-orange-900"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <p className="text-gray-500 text-xs mt-2">
              💡 Puoi inserire più intolleranze separate da virgola (es: "Lattosio, Glutine")
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-1">ℹ️ Nota:</p>
                <p className="text-xs">
                  Le intolleranze vengono normalizzate automaticamente (minuscole, senza spazi extra) 
                  per evitare duplicati.
                </p>
              </div>
            </div>
          </div>

          {/* Pulsanti */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 
                transition-all font-semibold disabled:opacity-50"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 bg-cyan-600 text-white py-3 rounded-lg hover:bg-cyan-700 
                transition-all font-semibold flex items-center justify-center gap-2
                ${isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Edit2 size={20} />
                  Salva Modifiche
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}