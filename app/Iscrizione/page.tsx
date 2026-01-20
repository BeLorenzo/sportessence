"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { createEnrollment } from "@/app/actions/enrollments";
import { 
  Calendar, 
  MapPin, 
  Users, 
  CheckCircle, 
  Euro,
  Info,
  Clock,
  ArrowRight
} from "lucide-react";

// Tipi
type Child = {
  id: string;
  nome: string;
  cognome: string;
};

type Camp = {
  id: string;
  nome: string;
  prezzo: number;
  data_inizio: string;
  data_fine: string;
  indirizzo_paese: string;
};

// Componente Wrapper per gestire useSearchParams in Suspense
function IscrizioneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Stati Dati
  const [children, setChildren] = useState<Child[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Stati Form
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedCamp, setSelectedCamp] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [type, setType] = useState<"giornata_intera" | "mezza_giornata">("giornata_intera");
  const [extras, setExtras] = useState<"nessuno" | "pre" | "post" | "entrambi">("nessuno");
  
  // Stato UI
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);

  // 1. Caricamento Dati Iniziali
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/Login?redirect=/Iscrizione");
        return;
      }

      // Fetch Figli
      const { data: childrenData } = await supabase
        .from('children')
        .select('id, nome, cognome')
        .eq('parent_id', user.id);
      
      setChildren(childrenData || []);

      // Fetch Campi Attivi
      const { data: campsData } = await supabase
        .from('camps')
        .select('id, nome, prezzo, data_inizio, data_fine, indirizzo_paese')
        .eq('attivo', true)
        .order('data_inizio');

      setCamps(campsData || []);
      
      // Gestione Pre-selezione da URL
      const urlChild = searchParams.get('child');
      const urlCamp = searchParams.get('campo');

      if (urlChild && childrenData?.some(c => c.id === urlChild)) {
        setSelectedChild(urlChild);
      }
      if (urlCamp && campsData?.some(c => c.id === urlCamp)) {
        handleCampChange(urlCamp, campsData || []);
      }

      setLoadingData(false);
    };

    initData();
  }, [searchParams, router, supabase]);

  // 2. Gestione cambio campo (imposta date default)
  const handleCampChange = (campId: string, campsList: Camp[] = camps) => {
    setSelectedCamp(campId);
    const camp = campsList.find(c => c.id === campId);
    if (camp) {
      // Imposta le date del form uguali a quelle del campo come default
      // Formato input date richiede YYYY-MM-DD
      setStartDate(camp.data_inizio.split('T')[0]);
      setEndDate(camp.data_fine.split('T')[0]);
    }
  };

  // 3. Calcolo Prezzo Real-time (UI Only - il vero calcolo è nel server)
  useEffect(() => {
    if (!selectedCamp || !startDate || !endDate) {
      setEstimatedPrice(0);
      return;
    }

    const camp = camps.find(c => c.id === selectedCamp);
    if (!camp) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Calcolo settimane
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    // Minimo 1 settimana se le date sono valide, altrimenti 0
    const weeks = (!isNaN(diffDays) && diffDays >= 0) ? Math.max(1, Math.ceil(diffDays / 7)) : 0;

    let base = camp.prezzo;
    if (type === 'mezza_giornata') base = base * 0.7; // Logica speculare al server

    let extraCost = 0;
    if (extras === 'pre' || extras === 'post') extraCost = 15;
    if (extras === 'entrambi') extraCost = 25;

    setEstimatedPrice((base + extraCost) * weeks);

  }, [selectedCamp, startDate, endDate, type, extras, camps]);


  // 4. Invio Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = {
      child_id: selectedChild,
      camp_id: selectedCamp,
      data_inizio: startDate,
      data_fine: endDate,
      tipo_iscrizione: type,
      opzioni_extra: extras
    };

    const result = await createEnrollment(formData);

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      router.push('/Iscrizioni'); // Reindirizza alla pagina riepilogo
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Form */}
        <div className="bg-blue-light p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Nuova Iscrizione</h1>
          <p className="text-blue-100">Compila il modulo per iscrivere tuo figlio al campo estivo.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2 border border-red-200">
              <Info size={20} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 1. Selezione Bambino e Campo */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Chi vuoi iscrivere?
                </label>
                <div className="relative">
                  <select
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-600 focus:border-transparent appearance-none bg-white text-gray-900"
                  >
                    <option value="">-- Seleziona un bambino --</option>
                    {children.map(child => (
                      <option key={child.id} value={child.id}>
                        {child.nome} {child.cognome}
                      </option>
                    ))}
                  </select>
                  <Users className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
                {children.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    Non hai ancora registrato bambini. <a href="/Utente" className="underline">Vai al profilo</a>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  A quale campo?
                </label>
                <div className="relative">
                  <select
                    value={selectedCamp}
                    onChange={(e) => handleCampChange(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-600 focus:border-transparent appearance-none bg-white text-gray-900"
                  >
                    <option value="">-- Seleziona un campo --</option>
                    {camps.map(camp => (
                      <option key={camp.id} value={camp.id}>
                        {camp.nome} ({camp.indirizzo_paese})
                      </option>
                    ))}
                  </select>
                  <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
            </div>

            {/* 2. Riepilogo Prezzo (Card laterale desktop) */}
            <div className="bg-cream rounded-xl p-6 border border-cyan-100 h-fit">
              <h3 className="font-bold text-blue-deep mb-4 flex items-center gap-2">
                <Euro size={20} className="text-cyan-600" />
                Riepilogo Costi
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Prezzo Base (settimanale):</span>
                  <span className="font-semibold">
                    {selectedCamp 
                      ? `€${camps.find(c => c.id === selectedCamp)?.prezzo}` 
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Opzioni Extra:</span>
                  <span className="font-semibold">
                    {extras === 'nessuno' ? '€0' : extras === 'entrambi' ? '+€25' : '+€15'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tipologia:</span>
                  <span className="font-semibold">
                    {type === 'mezza_giornata' ? '-30%' : 'Standard'}
                  </span>
                </div>
                <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-lg text-blue-deep">Totale Stimato:</span>
                  <span className="font-bold text-2xl text-cyan-600">
                    €{estimatedPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Date e Opzioni */}
          <div className="pt-6 border-t border-gray-100">
            <h3 className="font-bold text-lg text-blue-deep mb-4">Dettagli Periodo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data Inizio
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-600 bg-white text-gray-900"
                  />
                  <Calendar className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Data Fine
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-600 bg-white text-gray-900"
                  />
                  <Calendar className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
              </div>
            </div>

            <h3 className="font-bold text-lg text-blue-deep mb-4 mt-8">Personalizzazione</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Tipologia */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipologia Orario
                </label>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${type === 'giornata_intera' ? 'border-cyan-600 bg-cyan-50' : 'border-gray-200 hover:border-cyan-300'}`}>
                    <input 
                      type="radio" 
                      name="tipo" 
                      value="giornata_intera"
                      checked={type === 'giornata_intera'}
                      onChange={() => setType('giornata_intera')}
                      className="w-5 h-5 text-cyan-600 border-gray-300 focus:ring-cyan-500"
                    />
                    <div className="ml-3">
                      <span className="block font-semibold text-gray-900">Giornata Intera</span>
                      <span className="block text-xs text-gray-500">Pranzo incluso, fino alle 17:30</span>
                    </div>
                  </label>

                  <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${type === 'mezza_giornata' ? 'border-cyan-600 bg-cyan-50' : 'border-gray-200 hover:border-cyan-300'}`}>
                    <input 
                      type="radio" 
                      name="tipo" 
                      value="mezza_giornata"
                      checked={type === 'mezza_giornata'}
                      onChange={() => setType('mezza_giornata')}
                      className="w-5 h-5 text-cyan-600 border-gray-300 focus:ring-cyan-500"
                    />
                    <div className="ml-3">
                      <span className="block font-semibold text-gray-900">Mezza Giornata</span>
                      <span className="block text-xs text-gray-500">Uscita ore 12:30 / 13:30</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Extra */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Servizi Extra (Pre/Post Scuola)
                </label>
                <div className="relative">
                  <select
                    value={extras}
                    onChange={(e: any) => setExtras(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-600 bg-white text-gray-900"
                  >
                    <option value="nessuno">Nessun servizio extra</option>
                    <option value="pre">Solo Pre-Campo (7:30 - 8:30)</option>
                    <option value="post">Solo Post-Campo (17:30 - 18:30)</option>
                    <option value="entrambi">Entrambi (Pre + Post)</option>
                  </select>
                  <Clock className="absolute left-3 top-3.5 text-gray-400" size={20} />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  I servizi extra prevedono un costo aggiuntivo settimanale.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={submitting || !selectedChild || !selectedCamp}
              className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all ${
                submitting || !selectedChild || !selectedCamp
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-cyan-600 hover:bg-cyan-700 hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Elaborazione...
                </>
              ) : (
                <>
                  Conferma Iscrizione
                  <ArrowRight size={24} />
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// Pagina Principale
export default function IscrizionePage() {
  return (
    <main className="min-h-screen bg-cream py-12 px-4">
      <Suspense fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      }>
        <IscrizioneContent />
      </Suspense>
    </main>
  );
}