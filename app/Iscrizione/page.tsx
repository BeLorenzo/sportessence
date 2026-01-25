"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Calendar, MapPin, Users, CheckCircle, Euro, Info, Clock, 
  ArrowRight, Loader2, AlertTriangle, Landmark, X, TicketPercent,
  UserPlus
} from "lucide-react";
import { createEnrollment } from "@/app/actions/enrollments";

// --- TIPI ---
type Child = { id: string; nome: string; cognome: string };
type CampWeek = { id: string; label: string; data_inizio: string; data_fine: string };
type Camp = { 
  id: string; 
  nome: string; 
  indirizzo_paese: string;
  membership_type: 'NONE' | 'MANDATORY' | 'OPTIONAL';
  prezzo_base_indicativo: number; 
  price_half_day: number; // AGGIUNTO
  price_pre: number;
  price_post: number;
  price_pre_post_bundle: number;
  camp_weeks: CampWeek[];
  camp_pricing_tiers: { price_per_week: number; min_weeks: number }[];
};

type PricingResponse = {
  grand_total_value: number;
  already_paid: number;
  to_pay_now: number;
  details: any[];
  membership_info?: { fee_amount: number; pay_on_site_required: boolean };
  savings?: { multi_week: number; sibling: number; total: number };
};

function IscrizioneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [children, setChildren] = useState<Child[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [weeks, setWeeks] = useState<CampWeek[]>([]); 
  const [loadingData, setLoadingData] = useState(true);

  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedCamp, setSelectedCamp] = useState<string>("");
  const [bookedWeekIds, setBookedWeekIds] = useState<string[]>([]);
  const [weekSelections, setWeekSelections] = useState<Record<string, {
    selected: boolean,
    type: 'FULL' | 'HALF',
    prePost: 'NONE' | 'PRE' | 'POST' | 'BOTH'
  }>>({});

  const [priceQuote, setPriceQuote] = useState<PricingResponse | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. CARICAMENTO INIZIALE
  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/Login?redirect=/Iscrizione"); return; }

      const { data: childrenData } = await supabase.from('children').select('id, nome, cognome').eq('parent_id', user.id);
      setChildren(childrenData || []);

      const { data: campsData } = await supabase
        .from('camps')
        .select(`
            id, nome, indirizzo_paese, membership_type, 
            price_half_day, price_pre, price_post, price_pre_post_bundle,
            camp_weeks (id, label, data_inizio, data_fine),
            camp_pricing_tiers (price_per_week, min_weeks)
        `)
        .eq('attivo', true);

      const formattedCamps = (campsData || []).map((c: any) => ({
        ...c,
        prezzo_base_indicativo: c.camp_pricing_tiers?.find((t:any) => t.min_weeks === 1)?.price_per_week || 0
      }));

      setCamps(formattedCamps);
      
      const urlChild = searchParams.get('child');
      const urlCamp = searchParams.get('campo');
      if (urlChild && childrenData?.some(c => c.id === urlChild)) setSelectedChild(urlChild);
      if (urlCamp && formattedCamps?.some(c => c.id === urlCamp)) handleCampChange(urlCamp, formattedCamps);

      setLoadingData(false);
    };
    initData();
  }, [searchParams, router, supabase]);

  // Caricamento Storico
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedChild || !selectedCamp) { setBookedWeekIds([]); return; }
      const { data } = await supabase.from('enrollment_weeks')
        .select('camp_week_id, enrollments!inner(stato)')
        .eq('child_id', selectedChild).eq('enrollments.camp_id', selectedCamp)
        .in('enrollments.stato', ['CONFIRMED', 'COMPLETED', 'PENDING']); 
      if (data) setBookedWeekIds(data.map((row: any) => row.camp_week_id));
    };
    fetchHistory();
  }, [selectedChild, selectedCamp, supabase]);

  const handleCampChange = (campId: string, campsList: Camp[] = camps) => {
    setSelectedCamp(campId);
    const camp = campsList.find(c => c.id === campId);
    setWeeks(camp?.camp_weeks?.sort((a, b) => a.data_inizio.localeCompare(b.data_inizio)) || []);
    setWeekSelections({});
    setPriceQuote(null);
    setErrorMsg(null);
  };

  const toggleWeek = (weekId: string) => {
    setWeekSelections(prev => {
      if (prev[weekId]?.selected) {
        const next = { ...prev }; delete next[weekId]; return next;
      }
      return { ...prev, [weekId]: { selected: true, type: 'FULL', prePost: 'NONE' } };
    });
  };

  const updateWeekConfig = (weekId: string, field: 'type' | 'prePost', value: string) => {
    setWeekSelections(prev => ({ ...prev, [weekId]: { ...prev[weekId], [field]: value } }));
  };

  // Calcolo Preventivo
  useEffect(() => {
    if (!selectedCamp || !selectedChild) return;
    const timer = setTimeout(async () => {
      const selectedIds = Object.keys(weekSelections).filter(k => weekSelections[k].selected && !bookedWeekIds.includes(k));
      if (selectedIds.length === 0) { setPriceQuote(null); return; }

      setCalculating(true); setErrorMsg(null);
      const payloadWeeks = selectedIds.map(wid => ({
        camp_week_id: wid, type: weekSelections[wid].type, pre_post: weekSelections[wid].prePost
      }));

      const { data, error } = await supabase.rpc('calculate_enrollment_price', {
        p_camp_id: selectedCamp, p_child_id: selectedChild, p_new_weeks: payloadWeeks
      });

      if (error) { console.error(error); setErrorMsg("Errore nel calcolo del preventivo."); } 
      else { setPriceQuote(data); }
      setCalculating(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [selectedCamp, selectedChild, weekSelections, supabase, bookedWeekIds]);

  // Invio
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceQuote) return;
    setSubmitting(true); setErrorMsg(null);

    const weeksPayload = priceQuote.details.filter((d: any) => d.is_new).map((d: any) => ({
        camp_week_id: d.week_id, type: d.type, pre_post: d.pre_post || 'NONE', price: d.computed_price
    }));

    if (weeksPayload.length === 0) { setErrorMsg("Nessuna nuova settimana da inserire."); setSubmitting(false); return; }

    const result = await createEnrollment({
      campId: selectedCamp, childId: selectedChild, weeks: weeksPayload, totalPrice: priceQuote.to_pay_now, priceSnapshot: priceQuote
    });

    if (result.error) { setErrorMsg(result.error); setSubmitting(false); } 
    else { router.push('/Utente?success=enrollment_created'); }
  };

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    const e = new Date(end).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    return `${s} - ${e}`;
  };

  const currentCampObj = camps.find(c => c.id === selectedCamp);
  
  const sortedDetails = priceQuote ? [...priceQuote.details].sort((a, b) => {
     const wA = weeks.find(w => w.id === a.week_id);
     const wB = weeks.find(w => w.id === b.week_id);
     return (wA?.data_inizio || '').localeCompare(wB?.data_inizio || '');
  }) : [];

  // Filtriamo solo le settimane FULL per calcolare quale Tier stiamo usando
  const fullWeeksCount = priceQuote ? priceQuote.details.filter((d:any) => d.type === 'FULL').length : 0;
  
  const currentTierPrice = currentCampObj?.camp_pricing_tiers
    ?.filter(t => t.min_weeks <= fullWeeksCount) // Il tier si basa su quante FULL stai prendendo (o totali, dipende dalla tua policy, qui metto totali se preferisci)
    .sort((a, b) => b.min_weeks - a.min_weeks)[0]?.price_per_week || currentCampObj?.prezzo_base_indicativo || 0;
    
  // Nota: se la tua policy è "il numero di settimane totali (full+half) determina il tier delle full", usa priceQuote.details.length invece di fullWeeksCount.
  // Nel dubbio lascio details.length che è più generoso.
  const tierBasisCount = priceQuote ? priceQuote.details.length : 0;
  const appliedTierPrice = currentCampObj?.camp_pricing_tiers
     ?.filter(t => t.min_weeks <= tierBasisCount)
     .sort((a, b) => b.min_weeks - a.min_weeks)[0]?.price_per_week || currentCampObj?.prezzo_base_indicativo || 0;


  const listinoTotale = priceQuote ? priceQuote.grand_total_value + (priceQuote.savings?.sibling || 0) : 0;

  if (loadingData) return <div className="flex h-screen items-center justify-center bg-cream"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div></div>;

  if (children.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-amber-500 p-8 text-white relative">
            <div className="absolute inset-0 bg-[url('/imgs/pattern.png')] opacity-10"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl">
                <AlertTriangle size={40} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold mb-2">Nessun Bambino Registrato</h1>
                <p className="text-amber-100">Prima di procedere con l'iscrizione è necessario aggiungere almeno un bambino.</p>
              </div>
            </div>
          </div>
          
          <div className="p-10 text-center">
            <div className="mb-8">
              <div className="inline-block bg-amber-50 p-6 rounded-full mb-6">
                <UserPlus size={64} className="text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Aggiungi il tuo primo bambino</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-2">
                Per iscrivere un bambino al campo estivo, devi prima registrare i suoi dati nella sezione dedicata.
              </p>
              <p className="text-sm text-gray-500">
                Potrai aggiungere nome, cognome, data di nascita e altre informazioni necessarie.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => router.push('/Utente')}
                className="bg-cyan-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-lg hover:shadow-cyan-200/50 flex items-center gap-3 group"
              >
                <UserPlus size={20} />
                Vai alla Sezione Bambini
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="bg-gray-100 text-gray-700 px-8 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Torna alla Home
              </button>
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 max-w-2xl mx-auto">
                <div className="flex gap-4 items-start">
                  <Info size={24} className="text-blue-600 shrink-0 mt-1" />
                  <div className="text-left">
                    <h3 className="font-bold text-blue-900 mb-2">Cosa serve per l'iscrizione?</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Nome e cognome del bambino</li>
                      <li>• Data di nascita</li>
                      <li>• Eventuali note o necessità particolari</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }




  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
        <div className="bg-blue-light p-8 text-white relative">
          <div className="absolute inset-0 bg-[url('/imgs/pattern.png')] opacity-10"></div>
          <h1 className="text-3xl font-extrabold mb-2 relative z-10">Nuova Iscrizione</h1>
          <p className="text-blue-100 relative z-10">Configura le settimane e personalizza l'esperienza.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLONNA SINISTRA (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="font-bold text-xl mb-6 flex items-center gap-3 text-blue-deep"><span className="bg-blue-100 p-2 rounded-lg text-blue-600"><Users size={20}/></span>Dati Principali</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Bambino</label>
                  <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-600 appearance-none bg-white text-gray-900" value={selectedChild} onChange={e => setSelectedChild(e.target.value)}>
                    <option value="">-- Seleziona --</option>
                    {children.map(c => <option key={c.id} value={c.id}>{c.nome} {c.cognome}</option>)}
                  </select>
                  <Users className="absolute left-3 top-[2.6rem] text-gray-400" size={18} />
                </div>
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Campo Estivo</label>
                  <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-600 appearance-none bg-white text-gray-900" value={selectedCamp} onChange={e => handleCampChange(e.target.value)}>
                    <option value="">-- Seleziona --</option>
                    {camps.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.indirizzo_paese})</option>)}
                  </select>
                  <MapPin className="absolute left-3 top-[2.6rem] text-gray-400" size={18} />
                </div>
            </div>
          </div>

          {selectedCamp && (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <h2 className="font-bold text-xl mb-6 flex items-center gap-3 text-blue-deep"><span className="bg-cyan-100 p-2 rounded-lg text-cyan-600"><Calendar size={20}/></span>Scegli le settimane</h2>
               <div className="space-y-4">
                 {weeks.map(week => {
                   const today = new Date(); today.setHours(0,0,0,0);
                   const weekStartDate = new Date(week.data_inizio);
                   const isAlreadyBooked = bookedWeekIds.includes(week.id);
                   const isPast = weekStartDate < today;
                   const isDisabled = isAlreadyBooked || isPast;
                   const isSel = isDisabled ? false : !!weekSelections[week.id]?.selected;

                   return (
                     <div key={week.id} className={`p-5 rounded-2xl border-2 transition-all duration-300 ${isDisabled ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed' : isSel ? 'border-cyan-500 bg-cyan-50/30 shadow-md transform scale-[1.01]' : 'border-gray-100 hover:border-gray-200 bg-white'}`}>
                       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <label className={`flex items-center gap-4 flex-grow ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer select-none'}`}>
                           <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${isAlreadyBooked ? 'bg-green-100 border-green-200' : isPast ? 'bg-gray-200 border-gray-300' : isSel ? 'bg-cyan-500 border-cyan-500' : 'border-gray-300 bg-white'}`}>
                             {isAlreadyBooked && <CheckCircle size={16} className="text-green-600"/>}
                             {isPast && <X size={16} className="text-gray-400"/>}
                             {isSel && !isDisabled && <CheckCircle size={16} className="text-white"/>}
                           </div>
                           <input type="checkbox" className="hidden" checked={isSel || isAlreadyBooked} disabled={isDisabled} onChange={() => !isDisabled && toggleWeek(week.id)} />
                           <div>
                             <div className="flex items-center gap-2 flex-wrap">
                               <p className={`font-bold text-lg ${isDisabled ? 'text-gray-500' : isSel ? 'text-cyan-900' : 'text-gray-700'}`}>{week.label}</p>
                               {isAlreadyBooked && <span className="text-[10px] uppercase bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Già Iscritto</span>}
                               {isPast && <span className="text-[10px] uppercase bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-bold">Conclusa</span>}
                             </div>
                             <p className="text-sm text-gray-500 flex items-center gap-2"><Clock size={14}/>{formatDateRange(week.data_inizio, week.data_fine)}</p>
                           </div>
                         </label>
                         {isSel && !isDisabled && (
                           <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in zoom-in-95 duration-300">
                             <select className="text-sm border border-cyan-200 rounded-lg p-2.5 bg-white text-gray-700 outline-none" value={weekSelections[week.id].type} onChange={(e:any) => updateWeekConfig(week.id, 'type', e.target.value)}>
                               <option value="FULL">Giornata Intera</option>
                               <option value="HALF">Mezza Giornata</option>
                             </select>
                             <select className="text-sm border border-cyan-200 rounded-lg p-2.5 bg-white text-gray-700 outline-none" value={weekSelections[week.id].prePost} onChange={(e:any) => updateWeekConfig(week.id, 'prePost', e.target.value)}>
                               <option value="NONE">No Extra</option>
                               <option value="PRE">Solo Pre</option>
                               <option value="POST">Solo Post</option>
                               <option value="BOTH">Pre + Post</option>
                             </select>
                           </div>
                         )}
                         {isDisabled && !isAlreadyBooked && !isPast && <div className="text-sm text-gray-400 italic px-2">Non disponibile</div>}
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          )}
        </div>

        {/* COLONNA DESTRA (4 cols) - RIEPILOGO */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 sticky top-8 flex flex-col h-fit">
            <h3 className="font-bold text-xl text-blue-deep mb-6 flex items-center gap-2 border-b border-gray-100 pb-4"><Euro size={22} className="text-cyan-600"/> Riepilogo</h3>
            
            {!selectedChild || !selectedCamp ? (
              <div className="text-center py-10 text-gray-400"><Users size={48} className="mx-auto mb-3 opacity-20"/><p className="text-sm">Seleziona bambino e campo.</p></div>
            ) : calculating ? (
              <div className="flex flex-col items-center justify-center py-12 text-cyan-600"><Loader2 className="animate-spin mb-2" size={32}/> <span className="text-sm font-medium">Calcolo...</span></div>
            ) : priceQuote ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* LISTA DETTAGLIATA */}
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {sortedDetails.map((d:any) => {
                    const label = weeks.find(w => w.id === d.week_id)?.label || 'Settimana';
                    const extrasVal = d.extras_value || 0; // Ora arriva dal DB
                    const isHalf = d.type === 'HALF';

                    return (
                        <div key={d.week_id} className="flex justify-between items-start text-sm p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div>
                            <span className="font-bold text-gray-700 block mb-1">{label}</span>
                            <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                                {/* Riga 1: Prezzo Settimana */}
                                <div>
    {isHalf ? (
        // Mezza Giornata
        <span className="font-bold text-gray-800">
            €{currentCampObj?.price_half_day} (Mezza Giornata)
        </span>
    ) : (
        // Intera Giornata
        <>
            {/* Mostra il barrato SOLO se il prezzo applicato è inferiore al base */}
            {appliedTierPrice < (currentCampObj?.prezzo_base_indicativo ?? 0) && (
                <span className="line-through text-gray-400 mr-2">
                    €{currentCampObj?.prezzo_base_indicativo ?? 0}
                </span>
            )}
            
            {/* Il prezzo finale lo mostriamo SEMPRE */}
            <span className="font-bold text-gray-800">
                €{appliedTierPrice}
            </span>
        </>
    )}
</div>
                                {/* Riga 2: Extra */}
                                {extrasVal > 0 && (
                                    <div className="text-cyan-700 font-medium">
                                        + €{extrasVal} ({d.pre_post === 'BOTH' ? 'Pre+Post' : d.pre_post})
                                    </div>
                                )}
                            </div>
                        </div>
                        {!d.is_new && <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded text-gray-500">Storico</span>}
                        </div>
                    );
                  })}
                </div>

                <div className="border-t border-dashed border-gray-200"></div>

                {/* --- SEZIONE CONTI --- */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-gray-600 text-sm font-medium">
                    <span>Listino Totale</span>
                    <span>€{listinoTotale}</span>
                  </div>

                  {priceQuote.savings && priceQuote.savings.sibling > 0 && (
                     <div className="flex justify-between items-center text-green-600 text-sm font-bold">
                       <span>Sconto Fratelli (10%)</span>
                       <span>- €{priceQuote.savings.sibling.toFixed(2)}</span>
                     </div>
                  )}

                  <div className="border-b border-gray-100 my-1"></div>

                  <div className="flex justify-between items-center text-gray-900 font-bold text-base">
                    <span>Totale Servizio</span>
                    <span>€{priceQuote.grand_total_value}</span>
                  </div>

                  {priceQuote.already_paid > 0 && (
                    <div className="flex justify-between items-center text-cyan-700 text-sm bg-cyan-50 px-2 py-1 rounded border border-cyan-100 mt-2">
                      <span>Già pagato</span>
                      <span>- €{priceQuote.already_paid}</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-600 p-5 rounded-2xl flex justify-between items-center shadow-lg shadow-blue-200 mt-2">
                  <div className="text-white"><p className="text-xs uppercase tracking-wider opacity-80 mb-0.5">Da Saldare</p><p className="text-xs opacity-70">(Bonifico)</p></div>
                  <span className="text-3xl font-extrabold text-white">€{priceQuote.to_pay_now}</span>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-xs text-gray-500 flex gap-2"><Landmark size={14} className="shrink-0 mt-0.5"/>Pagamento via bonifico. Riceverai IBAN via email.</div>
                {priceQuote.membership_info?.pay_on_site_required && <div className="bg-amber-50 text-amber-900 p-3 rounded-xl text-xs flex gap-2 border border-amber-200"><Info size={14} className="shrink-0 mt-0.5"/><div><strong>Tesseramento (€{priceQuote.membership_info.fee_amount})</strong> da pagare in loco.</div></div>}
                {currentCampObj?.membership_type === 'OPTIONAL' && <div className="bg-indigo-50 text-indigo-900 p-3 rounded-xl text-xs flex gap-2 border border-indigo-200"><TicketPercent size={14} className="shrink-0 mt-0.5"/><div><strong>Già tesserato?</strong> Sconto 5% applicabile in segreteria.</div></div>}
                {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex gap-2 border border-red-100"><AlertTriangle size={14}/> {errorMsg}</div>}

                <button onClick={handleSubmit} disabled={submitting || priceQuote.to_pay_now < 0} className="w-full bg-cyan-600 text-white py-4 rounded-xl font-bold hover:bg-cyan-700 transition-all shadow-lg hover:shadow-cyan-200/50 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 group">
                  {submitting ? <><Loader2 className="animate-spin" size={20}/> Attendere...</> : <>Conferma <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/></>}
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 flex flex-col items-center"><Info size={32} className="mb-2 opacity-30"/><p className="text-sm">Seleziona settimane.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IscrizionePage() {
  return (
    <main className="min-h-screen bg-cream py-12 px-4 font-sans">
      <Suspense fallback={<div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div></div>}>
        <IscrizioneContent />
      </Suspense>
    </main>
  );
}