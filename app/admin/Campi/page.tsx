"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { Plus, Edit2, Trash2, X, Calendar, MapPin, CheckCircle, XCircle, FileText, Euro, Users, Clock, Wand2 } from "lucide-react";
import { upsertCampFull, deleteCamp, type CampData, type CampWeekData, type PricingTierData } from "@/app/actions/camps";

// Componente helper per i titoli delle sezioni nel form
const SectionTitle = ({ title }: { title: string }) => (
  <h3 className="text-lg font-bold text-blue-900 border-b border-blue-100 pb-2 mb-4 mt-6">{title}</h3>
);

// Helper per formattare date a video
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function AdminCampiPage() {
  const [camps, setCamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  
  // STATO DEL FORM
  const [formData, setFormData] = useState<CampData>({
    nome: "",
    indirizzo_via: "",
    indirizzo_civico: "",
    indirizzo_cap: "",
    indirizzo_paese: "",
    indirizzo_provincia: "",
    descrizione: "",
    data_inizio: "", // Usato per il generatore e salvato opzionalmente
    data_fine: "",   // Usato per il generatore e salvato opzionalmente
    attivo: true,
    price_half_day: 70,
    price_pre: 10,
    price_post: 10,
    price_pre_post_bundle: 15,
    membership_fee: 15,
    membership_discount_percent: 5,
    membership_type: 'NONE',
    weeks: [],
    tiers: [{ min_weeks: 1, price_per_week: 100 }]
  });

  const supabase = createClient();

  // --- CARICAMENTO DATI ---
  const loadCamps = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("camps")
      .select("*, camp_weeks(*), camp_pricing_tiers(*)")
      .order("created_at", { ascending: false });

    if (!error) setCamps(data || []);
    setLoading(false);
  };

  useEffect(() => { loadCamps(); }, []);

  // --- GESTIONE MODALE ---
  const handleOpenModal = (camp?: any) => {
    if (camp) {
      setEditingId(camp.id);
      setFormData({
        nome: camp.nome,
        indirizzo_via: camp.indirizzo_via,
        indirizzo_civico: camp.indirizzo_civico,
        indirizzo_cap: camp.indirizzo_cap,
        indirizzo_paese: camp.indirizzo_paese,
        indirizzo_provincia: camp.indirizzo_provincia,
        descrizione: camp.descrizione || "",
        data_inizio: camp.data_inizio || "", // Carichiamo le date esistenti per il generatore
        data_fine: camp.data_fine || "",
        attivo: camp.attivo,
        price_half_day: camp.price_half_day ?? 70,
        price_pre: camp.price_pre ?? 10,
        price_post: camp.price_post ?? 10,
        price_pre_post_bundle: camp.price_pre_post_bundle ?? 15,
        membership_fee: camp.membership_fee ?? 15,
        membership_discount_percent: camp.membership_discount_percent ?? 5,
        membership_type: camp.membership_type ?? 'NONE',
        weeks: camp.camp_weeks || [],
        tiers: camp.camp_pricing_tiers?.sort((a: any,b: any) => a.min_weeks - b.min_weeks) || []
      });
    } else {
      setEditingId(undefined);
      setFormData({
        nome: "", indirizzo_via: "", indirizzo_civico: "", indirizzo_cap: "", indirizzo_paese: "", indirizzo_provincia: "", descrizione: "", 
        data_inizio: "", data_fine: "", attivo: true,
        price_half_day: 70, price_pre: 10, price_post: 10, price_pre_post_bundle: 15, membership_fee: 15, membership_discount_percent: 5, membership_type: 'NONE',
        weeks: [], tiers: [{ min_weeks: 1, price_per_week: 100 }]
      });
    }
    setShowModal(true);
  };

  // --- HELPER PER INPUT NUMERICI ---
  const handlePriceChange = (field: keyof CampData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === "" ? undefined : parseFloat(value)
    }));
  };

  // --- GESTIONE ARRAY SETTIMANE ---
  const addWeek = () => {
    setFormData(prev => ({
      ...prev,
      weeks: [...prev.weeks, { label: `Settimana ${prev.weeks.length + 1}`, data_inizio: '', data_fine: '' }]
    }));
  };

  const removeWeek = (index: number) => {
    setFormData(prev => ({
      ...prev,
      weeks: prev.weeks.filter((_, i) => i !== index)
    }));
  };

  const updateWeek = (index: number, field: keyof CampWeekData, value: string) => {
    const newWeeks = [...formData.weeks];
    // @ts-ignore
    newWeeks[index][field] = value;
    setFormData({ ...formData, weeks: newWeeks });
  };

  // --- GENERATORE AUTOMATICO ---
  const generateAutoWeeks = () => {
    if (!formData.data_inizio || !formData.data_fine) {
      alert("Per favore inserisci le date 'Da Data' e 'A Data' nel box viola prima di generare.");
      return;
    }

    if (formData.weeks.length > 0) {
      if (!confirm("Attenzione: questa operazione sovrascriverà le settimane già inserite. Vuoi continuare?")) {
        return;
      }
    }

    const startDate = new Date(formData.data_inizio);
    const endDate = new Date(formData.data_fine);
    const newWeeks: CampWeekData[] = [];
    let counter = 1;

    let currentIter = new Date(startDate);
    let safety = 0; // Evitiamo loop infiniti per errore

    while (currentIter < endDate && safety < 52) {
      const weekStart = new Date(currentIter);
      const weekEnd = new Date(currentIter);
      // Lun -> Ven = +4 giorni
      weekEnd.setDate(weekEnd.getDate() + 4);

      // Formattiamo YYYY-MM-DD (en-CA è il formato ISO standard per gli input date)
      const startStr = weekStart.toLocaleDateString('en-CA'); 
      const endStr = weekEnd.toLocaleDateString('en-CA');

      newWeeks.push({
        label: `Settimana ${counter}`,
        data_inizio: startStr,
        data_fine: endStr
      });

      // Saltiamo alla prossima settimana (+7gg)
      currentIter.setDate(currentIter.getDate() + 7);
      counter++;
      safety++;
    }

    setFormData(prev => ({ ...prev, weeks: newWeeks }));
  };

  // --- GESTIONE ARRAY TIERS (SCAGLIONI) ---
  const addTier = () => {
    setFormData(prev => ({
      ...prev,
      tiers: [...prev.tiers, { min_weeks: prev.tiers.length + 1, price_per_week: 0 }]
    }));
  };

  const removeTier = (index: number) => {
    setFormData(prev => ({ ...prev, tiers: prev.tiers.filter((_, i) => i !== index) }));
  };

  const updateTier = (index: number, field: keyof PricingTierData, value: string) => {
    const newTiers = [...formData.tiers];
    // @ts-ignore
    // Gestiamo il valore vuoto come undefined per permettere la cancellazione
    newTiers[index][field] = value === "" ? undefined : parseFloat(value);
    setFormData({ ...formData, tiers: newTiers });
  };

  // --- SALVATAGGIO ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Sanitizzazione finale
    const finalData = {
        ...formData,
        price_half_day: formData.price_half_day ?? 0,
        price_pre: formData.price_pre ?? 0,
        price_post: formData.price_post ?? 0,
        price_pre_post_bundle: formData.price_pre_post_bundle ?? 0,
        membership_fee: formData.membership_fee ?? 0,
        membership_discount_percent: formData.membership_discount_percent ?? 0,
        tiers: formData.tiers.map(t => ({
            ...t,
            min_weeks: t.min_weeks ?? 0,
            price_per_week: t.price_per_week ?? 0
        }))
    };

    const res = await upsertCampFull(finalData, editingId);
    setIsSubmitting(false);
    
    if (res.error) {
      alert("Errore: " + res.error);
    } else {
      setShowModal(false);
      loadCamps();
    }
  };

  const handleDeleteCamp = async (id: string) => {
    if(!confirm("Sicuro di voler eliminare questo campo e tutte le settimane associate?")) return;
    await deleteCamp(id);
    loadCamps();
  };

  const inputClass = "w-full border border-gray-300 p-2 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-cyan-600 focus:border-transparent placeholder-gray-400";
  const labelClass = "block font-bold text-sm text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER PAGINA */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Gestione Campi</h1>
          <button onClick={() => handleOpenModal()} className="bg-cyan-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold hover:bg-cyan-700 transition-colors shadow-sm">
            <Plus size={20} /> Nuovo Campo
          </button>
        </div>

        {/* LISTA CAMPI DETTAGLIATA */}
        <div className="space-y-8">
          {camps.map(camp => (
            <div key={camp.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              
              {/* HEADER CARD */}
              <div className="bg-blue-50/50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-blue-deep">{camp.nome}</h2>
                    {camp.attivo ? (
                      <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-green-200">
                        <CheckCircle size={12}/> Attivo
                      </span>
                    ) : (
                      <span className="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-bold flex items-center gap-1 border border-red-200">
                        <XCircle size={12}/> Disattivo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1"><MapPin size={16} className="text-cyan-600"/> {camp.indirizzo_paese} ({camp.indirizzo_provincia})</span>
                    <span className="flex items-center gap-1"><Clock size={16} className="text-cyan-600"/> {camp.camp_weeks?.length || 0} Settimane</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleOpenModal(camp)} className="px-4 py-2 bg-white border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 font-semibold flex items-center gap-2 transition-colors">
                    <Edit2 size={16}/> Modifica
                  </button>
                  <button onClick={() => handleDeleteCamp(camp.id)} className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-semibold flex items-center gap-2 transition-colors">
                    <Trash2 size={16}/> Elimina
                  </button>
                </div>
              </div>

              {/* BODY CARD - GRIGLIA INFORMATIVA */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* COLONNA SX: Info Generali & Economiche */}
                <div className="space-y-6">
                  {/* Dettagli Indirizzo e Descrizione */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><FileText size={14}/> Info Generali</h3>
                    <p className="text-sm text-gray-800 mb-1">
                      <strong>Indirizzo:</strong> {camp.indirizzo_via} {camp.indirizzo_civico}, {camp.indirizzo_cap} {camp.indirizzo_paese}
                    </p>
                    <p className="text-sm text-gray-600 italic line-clamp-2">
                      {camp.descrizione || "Nessuna descrizione."}
                    </p>
                  </div>

                  {/* Prezzi Extra e Tesseramento */}
                  <div className="bg-cyan-50/30 rounded-xl text-gray-600 p-4 border border-cyan-100">
                    <h3 className="text-xs font-bold text-cyan-700 uppercase mb-3 flex items-center gap-2"><Euro size={14}/> Listino Extra & Tesseramento</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-700">
                      <div className="flex justify-between border-b border-cyan-100 pb-1 mr-2"><span>Mezza Giornata:</span> <strong>€{camp.price_half_day}</strong></div>
                      <div className="flex justify-between border-b border-cyan-100 pb-1"><span>Pre-Scuola:</span> <strong>€{camp.price_pre}</strong></div>
                      <div className="flex justify-between border-b border-cyan-100 pb-1 mr-2"><span>Post-Scuola:</span> <strong>€{camp.price_post}</strong></div>
                      <div className="flex justify-between border-b border-cyan-100 pb-1"><span>Bundle:</span> <strong>€{camp.price_pre_post_bundle}</strong></div>
                    </div>
                    
                    <div className="mt-4 pt-2 border-t border-cyan-200">
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-600">Tesseramento:</span>
                           <span className="font-bold">
                             {camp.membership_type === 'NONE' && 'Nessuno'}
                             {camp.membership_type === 'MANDATORY' && `Obbligatorio (€${camp.membership_fee})`}
                             {camp.membership_type === 'OPTIONAL' && `Facoltativo (€${camp.membership_fee})`}
                           </span>
                        </div>
                        {camp.membership_type === 'OPTIONAL' && (
                          <div className="flex justify-between text-sm text-green-700 mt-1">
                             <span>Sconto Soci:</span>
                             <strong>-{camp.membership_discount_percent}%</strong>
                          </div>
                        )}
                     </div>
                  </div>
                </div>

                {/* COLONNA DX: Tabelle Settimane e Scaglioni */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Tabella Scaglioni */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col h-fit">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200">
                      <h3 className="text-xs font-bold text-gray-700 uppercase">Scaglioni (Full)</h3>
                    </div>
                    <div className="overflow-y-auto max-h-48">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs">
                          <tr>
                            <th className="px-3 py-2">Settimane</th>
                            <th className="px-3 py-2 text-right">Prezzo</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {camp.camp_pricing_tiers?.sort((a:any,b:any) => a.min_weeks - b.min_weeks).map((tier: any) => (
                            <tr key={tier.id}>
                              <td className="px-3 py-2 text-gray-700">Min. {tier.min_weeks}</td>
                              <td className="px-3 py-2 text-right font-bold text-blue-600">€{tier.price_per_week}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tabella Settimane */}
                  <div className="border border-gray-200 text-gray-700 rounded-xl overflow-hidden flex flex-col h-64">
                    <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                      <h3 className="text-xs font-bold text-gray-700 uppercase">Calendario</h3>
                      <span className="text-[10px] bg-white px-2 rounded border border-gray-300">{camp.camp_weeks?.length || 0} sett.</span>
                    </div>
                    <div className="overflow-y-auto flex-1 bg-white">
                      <ul className="divide-y divide-gray-50">
                        {camp.camp_weeks?.sort((a:any,b:any) => a.data_inizio.localeCompare(b.data_inizio)).map((week:any) => (
                          <li key={week.id} className="px-4 py-2.5 hover:bg-gray-50">
                             <p className="text-xs font-bold text-blue-deep mb-0.5">{week.label}</p>
                             <p className="text-[11px] text-gray-500">
                               {formatDate(week.data_inizio)} - {formatDate(week.data_fine)}
                             </p>
                          </li>
                        ))}
                        {(!camp.camp_weeks || camp.camp_weeks.length === 0) && (
                          <li className="p-4 text-xs text-gray-400 text-center italic">Nessuna settimana</li>
                        )}
                      </ul>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          ))}

          {!loading && camps.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <div className="text-4xl mb-4">🏕️</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Nessun campo presente</h3>
                <p className="text-gray-500 mb-6">Inizia creando il tuo primo campo estivo.</p>
                <button onClick={() => handleOpenModal()} className="bg-cyan-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-cyan-700 transition-colors">
                  Crea Campo
                </button>
            </div>
          )}
        </div>
      </div>

      {/* MODALE DI MODIFICA/CREAZIONE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-20">
              <h2 className="text-2xl font-bold text-blue-deep">{editingId ? 'Modifica Campo' : 'Nuovo Campo'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-gray-100"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              
              {/* --- DATI GENERALI (Senza Date) --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                    <label className={labelClass}>Nome Campo</label>
                    <input required placeholder="Es. Summer Camp 2025" className={inputClass} value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
                </div>
                <div><label className={labelClass}>Via</label><input required placeholder="Via Roma" className={inputClass} value={formData.indirizzo_via} onChange={e => setFormData({...formData, indirizzo_via: e.target.value})} /></div>
                <div><label className={labelClass}>Civico</label><input required placeholder="10" className={inputClass} value={formData.indirizzo_civico} onChange={e => setFormData({...formData, indirizzo_civico: e.target.value})} /></div>
                <div><label className={labelClass}>Comune</label><input required placeholder="Milano" className={inputClass} value={formData.indirizzo_paese} onChange={e => setFormData({...formData, indirizzo_paese: e.target.value})} /></div>
                <div><label className={labelClass}>Provincia</label><input required placeholder="MI" className={inputClass} value={formData.indirizzo_provincia} onChange={e => setFormData({...formData, indirizzo_provincia: e.target.value})} /></div>
                <div><label className={labelClass}>CAP</label><input required placeholder="20100" className={inputClass} value={formData.indirizzo_cap} onChange={e => setFormData({...formData, indirizzo_cap: e.target.value})} /></div>
              </div>

              <div>
                <label className={labelClass}>Descrizione</label>
                <textarea className={inputClass} placeholder="Descrivi le attività..." rows={3} value={formData.descrizione || ''} onChange={e => setFormData({...formData, descrizione: e.target.value})} />
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer" onClick={() => setFormData({...formData, attivo: !formData.attivo})}>
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${formData.attivo ? 'bg-cyan-600 border-cyan-600' : 'bg-white border-gray-400'}`}>
                    {formData.attivo && <CheckCircle size={14} className="text-white"/>}
                </div>
                <label className="font-bold text-gray-800 cursor-pointer select-none">Campo Attivo (Accetta nuove iscrizioni)</label>
              </div>

              {/* --- CONFIGURAZIONE PREZZI --- */}
              <SectionTitle title="1. Configurazione Prezzi Extra & Base" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-5 rounded-xl border border-gray-200">
                <div><label className={labelClass}>Mezza Giornata (€)</label><input type="number" className={inputClass} value={formData.price_half_day ?? ""} onChange={e => handlePriceChange('price_half_day', e.target.value)} /></div>
                <div><label className={labelClass}>Pre-Scuola (€)</label><input type="number" className={inputClass} value={formData.price_pre ?? ""} onChange={e => handlePriceChange('price_pre', e.target.value)} /></div>
                <div><label className={labelClass}>Post-Scuola (€)</label><input type="number" className={inputClass} value={formData.price_post ?? ""} onChange={e => handlePriceChange('price_post', e.target.value)} /></div>
                <div><label className={labelClass}>Bundle Pre+Post (€)</label><input type="number" className={inputClass} value={formData.price_pre_post_bundle ?? ""} onChange={e => handlePriceChange('price_pre_post_bundle', e.target.value)} /></div>
              </div>

              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 mt-4">
                  <label className="text-xs font-bold text-cyan-800 mb-3 block uppercase tracking-wider">Gestione Tesseramento</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div>
                      <label className={labelClass}>Politica</label>
                      <select className={inputClass} value={formData.membership_type} onChange={(e:any) => {
                           const newType = e.target.value;
                           setFormData({...formData, membership_type: newType, membership_fee: newType === 'NONE' ? 0 : formData.membership_fee, membership_discount_percent: newType !== 'OPTIONAL' ? 0 : formData.membership_discount_percent});
                        }}>
                        <option value="NONE">Nessuno / Incluso</option>
                        <option value="MANDATORY">Obbligatorio (Pagamento in Loco)</option>
                        <option value="OPTIONAL">Facoltativo (Sconto Socio)</option>
                      </select>
                    </div>
                    {formData.membership_type !== 'NONE' && (
                      <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <label className={labelClass}>Costo Tesseramento (€)</label>
                        <input type="number" className={inputClass} value={formData.membership_fee ?? ""} onChange={e => handlePriceChange('membership_fee', e.target.value)} />
                      </div>
                    )}
                    {formData.membership_type === 'OPTIONAL' && (
                      <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <label className={labelClass}>Sconto applicabile (%)</label>
                        <input type="number" className={inputClass} value={formData.membership_discount_percent ?? ""} onChange={e => handlePriceChange('membership_discount_percent', e.target.value)} />
                      </div>
                    )}
                  </div>
              </div>

              {/* --- SCAGLIONI PREZZO --- */}
              <SectionTitle title="2. Scaglioni Prezzo (Giornata Intera)" />
              <div className="space-y-3 bg-gray-50 p-5 rounded-xl border border-gray-200">
                {formData.tiers.map((tier, idx) => (
                  <div key={idx} className="flex gap-4 items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                    <span className="text-sm font-bold w-6 text-center text-gray-500">{idx + 1}.</span>
                    <div className="flex items-center gap-2"><input type="number" className={`${inputClass} w-24`} value={tier.min_weeks ?? ""} onChange={e => updateTier(idx, 'min_weeks', e.target.value)} /><span className="text-sm text-gray-700 font-medium">settimane →</span></div>
                    <div className="flex items-center gap-2"><input type="number" className={`${inputClass} w-28`} value={tier.price_per_week ?? ""} onChange={e => updateTier(idx, 'price_per_week', e.target.value)} /><span className="text-sm text-gray-700 font-medium">€/sett</span></div>
                    <button type="button" onClick={() => removeTier(idx)} className="text-gray-400 hover:text-red-600 p-2 ml-auto transition-colors"><Trash2 size={18}/></button>
                  </div>
                ))}
                <button type="button" onClick={addTier} className="text-sm text-cyan-700 font-bold flex items-center gap-2 mt-2 hover:bg-cyan-50 p-2 rounded transition-colors w-fit"><Plus size={16}/> Aggiungi Scaglione</button>
              </div>

              {/* --- CALENDARIO SETTIMANE (TOOL GENERATORE) --- */}
              <h3 className="text-lg font-bold text-blue-900 border-b border-blue-100 pb-2 mb-4 mt-8">3. Calendario Settimane</h3>
              
              {/* TOOLBAR GENERAZIONE */}
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6 flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-purple-800 mb-1 block uppercase">Da Data</label>
                    <input type="date" className={`${inputClass} border-purple-200 focus:ring-purple-500`} value={formData.data_inizio} onChange={e => setFormData({...formData, data_inizio: e.target.value})} />
                  </div>
                  <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-purple-800 mb-1 block uppercase">A Data</label>
                    <input type="date" className={`${inputClass} border-purple-200 focus:ring-purple-500`} value={formData.data_fine} onChange={e => setFormData({...formData, data_fine: e.target.value})} />
                  </div>
                  <button type="button" onClick={generateAutoWeeks} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm">
                    <Wand2 size={18} /> Genera
                  </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {formData.weeks.map((week, idx) => (
                   <div key={idx} className="flex flex-wrap md:flex-nowrap gap-3 items-end bg-white p-4 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="flex-grow min-w-[200px]">
                        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Etichetta</label>
                        <input type="text" placeholder="Es. Settimana 1" className={inputClass} value={week.label} onChange={e => updateWeek(idx, 'label', e.target.value)} />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Inizio</label>
                        <input type="date" className={inputClass} value={week.data_inizio} onChange={e => updateWeek(idx, 'data_inizio', e.target.value)} />
                     </div>
                     <span className="text-gray-300 pb-3 hidden md:block">→</span>
                     <div>
                        <label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Fine</label>
                        <input type="date" className={inputClass} value={week.data_fine} onChange={e => updateWeek(idx, 'data_fine', e.target.value)} />
                     </div>
                     <button type="button" onClick={() => removeWeek(idx)} className="text-gray-400 hover:text-red-600 p-2.5 mb-0.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={18}/></button>
                   </div>
                ))}
                
                {formData.weeks.length === 0 && (
                  <div className="text-center py-6 text-gray-400 italic text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    Nessuna settimana inserita. Usa il generatore qui sopra o aggiungile manualmente.
                  </div>
                )}

                <button type="button" onClick={addWeek} className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold hover:border-cyan-500 hover:text-cyan-600 hover:bg-cyan-50/30 flex justify-center gap-2 items-center transition-all mt-4">
                  <Plus size={20}/> Aggiungi Settimana Manualmente
                </button>
              </div>

              {/* FOOTER AZIONI */}
              <div className="pt-6 border-t border-gray-100 mt-8 flex gap-4 sticky bottom-0 bg-white pb-2 z-10">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">Annulla</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? 'Salvataggio...' : 'Salva Campo'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}