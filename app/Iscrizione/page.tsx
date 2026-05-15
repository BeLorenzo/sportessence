"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Calendar, MapPin, Users, CheckCircle, Euro, Info, Clock, 
  ArrowRight, Loader2, AlertTriangle, X, Tag
} from "lucide-react";
import { createEnrollment } from "@/app/actions/enrollments";

// --- TIPI ---
type Child = { id: string; nome: string; cognome: string; data_nascita?: string };
type CampWeek = { id: string; label: string; data_inizio: string; data_fine: string };
type PricingTier = { price_per_week: number; min_weeks: number; discount_percent: number };

type QuoteDetail = {
  week_id: string;
  selected: boolean;
  type: 'FULL' | 'HALF';
  prePost: 'NONE' | 'PRE' | 'POST' | 'BOTH';
  
  price: number;        // Prezzo FINALE applicato
  originalPrice: number; // Prezzo BASE (per mostrare barrato)
  discountReason?: string; // Motivo sconto (es. "Fratello", "Tier 2")
  
  is_full: boolean;
  extraPrice: number; 
  is_new?: boolean;
};

type Camp = { 
  id: string; 
  nome: string; 
  indirizzo_paese: string;
  sibling_discount_value: number; 
  sibling_discount_week_price: number;
  prezzo_base_indicativo: number; 
  price_half_day: number;
  price_pre: number;
  price_post: number;
  price_pre_post_bundle: number;
  camp_weeks: CampWeek[];
  camp_pricing_tiers: PricingTier[];
};

type LocalQuote = {
  tuition: number;
  extras: number;
  discountSibling: number;
  discountPromo: number;
  registrationFee: number;
  total: number;
  details: QuoteDetail[];
};

type ExistingBooking = {
  camp_week_id: string;
  type: 'FULL' | 'HALF';
  prePost: 'NONE' | 'PRE' | 'POST' | 'BOTH';
};

function IscrizioneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => createClient(), []);


  const [children, setChildren] = useState<Child[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [weeks, setWeeks] = useState<CampWeek[]>([]); 
  const [loadingData, setLoadingData] = useState(true);

  const [selectedChild, setSelectedChild] = useState<string>("");
  const [selectedCamp, setSelectedCamp] = useState<string>("");
  
  const [bookedWeeks, setBookedWeeks] = useState<ExistingBooking[]>([]);
  const [bookedWeekIds, setBookedWeekIds] = useState<string[]>([]);
  const [alreadyBilledAmount, setAlreadyBilledAmount] = useState(0);
  const [siblingWeekIds, setSiblingWeekIds] = useState<Set<string>>(new Set());

  const [weekSelections, setWeekSelections] = useState<Record<string, {
    selected: boolean,
    type: 'FULL' | 'HALF',
    prePost: 'NONE' | 'PRE' | 'POST' | 'BOTH'
  }>>({});

  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");

  // NUOVO STATO PER TERMINI E CONDIZIONI
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [priceQuote, setPriceQuote] = useState<LocalQuote | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableCamps = useMemo(() => {
    if (!selectedChild) return camps; 

    const childObj = children.find(c => c.id === selectedChild);
    if (!childObj || !childObj.data_nascita) return camps;

    const birthYear = new Date(childObj.data_nascita).getFullYear();
    const currentYear = new Date().getFullYear();

    // Età di riferimento per il Baby Camp: dai 3 ai 6 anni compiuti nell'anno del camp
    const minAge = 3;
    const maxAge = 6;
    
    // Anni di nascita validi calcolati dinamicamente
    const maxBirthYear = currentYear - minAge; // es. 2026 - 3 = 2023
    const minBirthYear = currentYear - maxAge; // es. 2026 - 6 = 2020

    return camps.filter(camp => {
      if (camp.nome.toLowerCase().includes("capiago intimiano baby camp")) {
        return birthYear >= minBirthYear && birthYear <= maxBirthYear;
      }
      return true;
    });
  }, [camps, selectedChild, children]);

  const currentCampObj = camps.find(c => c.id === selectedCamp);
  const isCastelloCamp = currentCampObj?.nome.toLowerCase().includes("castello");
  const isMuliniCamp = currentCampObj?.nome.toLowerCase().includes("uggiate");

const currentPromoCode = isCastelloCamp ? process.env.NEXT_PUBLIC_SCONTO_FEDELI_CODICE_CANTU : isMuliniCamp ? process.env.NEXT_PUBLIC_SCONTO_FEDELI_CODICE_MULINI : "";
const currentPromoValue = isCastelloCamp ? process.env.NEXT_PUBLIC_SCONTO_FEDELI_CANTU : isMuliniCamp ? process.env.NEXT_PUBLIC_SCONTO_FEDELI_MULINI : 0;


  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/Login?redirect=/Iscrizione"); return; }

      const { data: childrenData } = await supabase.from('children').select('id, nome, cognome, data_nascita').eq('parent_id', user.id);
      setChildren(childrenData || []);

      const { data: campsData } = await supabase
        .from('camps')
        .select(`
            id, nome, indirizzo_paese, 
            sibling_discount_value, sibling_discount_week_price,
            price_half_day, price_pre, price_post, price_pre_post_bundle,
            camp_weeks (id, label, data_inizio, data_fine),
            camp_pricing_tiers (price_per_week, min_weeks, discount_percent)
        `)
        .eq('attivo', true);

      const formattedCamps = (campsData || []).map((c: any) => ({
        ...c,
        prezzo_base_indicativo: c.camp_pricing_tiers?.sort((a:any,b:any) => a.min_weeks - b.min_weeks)[0]?.price_per_week || 0
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

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedChild || !selectedCamp) { 
          setBookedWeeks([]); 
          setBookedWeekIds([]);
          setSiblingWeekIds(new Set());
          setAlreadyBilledAmount(0);
          return; 
      }

      const currentYear = new Date().getFullYear();
      const startOfYear = `${currentYear}-01-01T00:00:00.000Z`;

      // A. MIEI DATI
      const { data: myEnrollments } = await supabase.from('enrollments')
        .select(`
            id, prezzo_totale, stato,
            enrollment_weeks (camp_week_id, type, pre_post)
        `)
        .eq('child_id', selectedChild)
        .eq('camp_id', selectedCamp)
        .in('stato', ['CONFIRMED', 'COMPLETED', 'PENDING', 'saldato', 'acconto'])
        .gte('created_at', startOfYear);;
      
      let pastWeeks: ExistingBooking[] = [];
      let pastTotal = 0;
      let pastIds: string[] = [];

      if (myEnrollments) {
          myEnrollments.forEach((e: any) => {
              pastTotal += e.prezzo_totale || 0;
              if (e.enrollment_weeks) {
                  e.enrollment_weeks.forEach((ew: any) => {
                      pastWeeks.push({
                          camp_week_id: ew.camp_week_id,
                          type: ew.type,
                          prePost: ew.pre_post
                      });
                      pastIds.push(ew.camp_week_id);
                  });
              }
          });
      }
      
      setBookedWeeks(pastWeeks);
      setBookedWeekIds(pastIds);
      setAlreadyBilledAmount(pastTotal);

      // B. FRATELLI
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: siblingsData } = await supabase.from('enrollment_weeks')
        .select('camp_week_id, child_id, enrollments!inner(camp_id, stato, created_at)')
        .neq('child_id', selectedChild)
        .eq('enrollments.camp_id', selectedCamp)
        .in('enrollments.stato', ['CONFIRMED', 'COMPLETED', 'PENDING', 'saldato', 'acconto'])
        .gte('enrollments.created_at', startOfYear);

      const siblingSet = new Set<string>();
      siblingsData?.forEach((row: any) => siblingSet.add(row.camp_week_id));
      setSiblingWeekIds(siblingSet);
    };

    fetchHistory();
  }, [selectedChild, selectedCamp, supabase]);

  useEffect(() => {
    if (selectedCamp && selectedChild) {
      const isValid = availableCamps.some(c => c.id === selectedCamp);
      if (!isValid) {
        handleCampChange(""); // Resetta istantaneamente se il campo non è più valido per l'età
      }
    }
  }, [selectedChild, availableCamps, selectedCamp]);

  const handleCampChange = (campId: string, campsList: Camp[] = camps) => {
    setSelectedCamp(campId);
    const camp = campsList.find(c => c.id === campId);
    setWeeks(camp?.camp_weeks?.sort((a, b) => a.data_inizio.localeCompare(b.data_inizio)) || []);
    setWeekSelections({});
    setPriceQuote(null);
    setErrorMsg(null);
    setPromoCode("");
    setIsPromoApplied(false);
    setAcceptTerms(false); // Reset checkbox quando cambia campo
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

  const applyPromoCode = () => {
    if (!currentPromoCode) return;
    if (promoCode.trim().toUpperCase() === currentPromoCode.toUpperCase()) {
    setIsPromoApplied(true);
    setPromoError("");
  } else {
    setIsPromoApplied(false);
    setPromoError("Codice non valido");
  }
  };

  const isWeekBooked = (wid: string) => bookedWeekIds.includes(wid);

  // --- CALCOLO LOCALE (CON LOGICA VISIVA SCONTI) ---
  useEffect(() => {
    if (!selectedCamp || !selectedChild) return;
    
    setCalculating(true);
    const timer = setTimeout(() => {
      const campObj = camps.find(c => c.id === selectedCamp);
      if (!campObj) return;

      const selectedIds = Object.keys(weekSelections).filter(k => weekSelections[k].selected && !isWeekBooked(k));
      
      if (selectedIds.length === 0) {
        setPriceQuote(null);
        setCalculating(false);
        return;
      }

      const newWeeksDetails = selectedIds.map(wid => ({ week_id: wid, ...weekSelections[wid], is_new: true }));
      const oldWeeksDetails = bookedWeeks.map(bw => ({ week_id: bw.camp_week_id, type: bw.type, prePost: bw.prePost, selected: true, is_new: false }));
      
      const allWeeks = [...oldWeeksDetails, ...newWeeksDetails];
      const fullWeeks = allWeeks.filter(w => w.type === 'FULL');
      
      // 1. TIER CALCULATION
      const numFullWeeks = fullWeeks.length;
      const tiers = campObj.camp_pricing_tiers || [];
      const sortedTiers = [...tiers].sort((a, b) => a.min_weeks - b.min_weeks);
      
      const activeTierObj = [...sortedTiers].reverse().find(t => numFullWeeks >= t.min_weeks);
      
      // Prezzo base standard (Tier 1) per confronto visivo
      const baseStandardPrice = campObj.prezzo_base_indicativo;

      // Prezzo Tier Applicato
      let tierBasePrice = activeTierObj?.price_per_week || baseStandardPrice;
      const discountPercentTier = activeTierObj?.discount_percent || 0;

      if (tierBasePrice === 0 && activeTierObj) {
         const prevTier = sortedTiers.filter(t => t.min_weeks < activeTierObj.min_weeks && t.price_per_week > 0).pop();
         if (prevTier) tierBasePrice = prevTier.price_per_week;
      }

      const discountedTierPrice = tierBasePrice * (1 - (discountPercentTier / 100));

      // 2. CALCOLO DETTAGLIATO
      let grandTuition = 0;
      let grandExtras = 0;
      let grandSiblingDiscount = 0;
      
      const allCalculatedDetails = allWeeks.map(w => {
          let price = 0;
          let originalPrice = 0;
          let discountReason = undefined;
          let extra = 0;

          if (w.type === 'HALF') {
              price = campObj.price_half_day;
              originalPrice = campObj.price_half_day;
          } else {
              // FULL
              originalPrice = baseStandardPrice; // Prezzo di partenza standard (1 settimana)
              
              // Verifica Overlap Fratelli
              const hasOverlap = siblingWeekIds.has(w.week_id);
              
              if (hasOverlap && campObj.sibling_discount_week_price > 0) {
                  // CASO A: Prezzo Fisso Fratelli
                  price = campObj.sibling_discount_week_price;
                  discountReason = "Sconto Fratello";
              } else {
                  // CASO B: Tier Standard
                  price = discountedTierPrice;
                  
                  if (discountPercentTier > 0) {
                      discountReason = `Tier ${activeTierObj?.min_weeks} sett.`;
                  }

                  // CASO C: Sconto % Fratelli (Accumulato)
                  if (hasOverlap) {
                      if (campObj.sibling_discount_value > 0 && campObj.sibling_discount_value <= 1) {
                          // Sconto Percentuale (es. 0.10 = 10% a settimana)
                          grandSiblingDiscount += price * campObj.sibling_discount_value;
                          discountReason = discountReason ? `${discountReason} + Fratello` : "Sconto Fratello";
                      } else if (campObj.sibling_discount_value > 1) {
                          // Sconto Assoluto (es. 20€ a settimana)
                          grandSiblingDiscount += Number(campObj.sibling_discount_value);
                          discountReason = discountReason ? `${discountReason} + Fratello` : "Sconto Fratello";
                      }
                  }
              }
          }
          
          if (w.prePost === 'BOTH') extra = campObj.price_pre_post_bundle || (campObj.price_pre + campObj.price_post);
          else if (w.prePost === 'PRE') extra = campObj.price_pre;
          else if (w.prePost === 'POST') extra = campObj.price_post;

          grandTuition += price;
          grandExtras += extra;

          return { 
              ...w, 
              price, 
              originalPrice, // Salviamo il prezzo originale per il confronto visivo
              discountReason,
              extraPrice: extra, 
              is_full: w.type === 'FULL' 
          };
      });

      // Sconto Promo
      let grandPromoDiscount = 0;
      if (isPromoApplied) {
       grandPromoDiscount = grandTuition * Number(currentPromoValue); 
      }

      const registrationFee = 15;

      const grandTotal = Math.max(0, grandTuition + grandExtras - grandSiblingDiscount - grandPromoDiscount) + registrationFee;
      const toPayNow = Math.max(0, grandTotal - alreadyBilledAmount);

      const newWeeksDisplay = allCalculatedDetails.filter(d => d.is_new);

      setPriceQuote({
        tuition: grandTuition,
        extras: grandExtras,
        discountSibling: grandSiblingDiscount,
        discountPromo: grandPromoDiscount,
        registrationFee: registrationFee,
        total: toPayNow,
        details: newWeeksDisplay as QuoteDetail[] 
      });
      
      setCalculating(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedCamp, selectedChild, weekSelections, bookedWeeks, alreadyBilledAmount, isPromoApplied, camps, siblingWeekIds, currentPromoValue]);

  // Invio Dati
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!priceQuote) return;
    
    // VALIDAZIONE TERMINI
    if (!acceptTerms) {
        setErrorMsg("Devi accettare il regolamento per procedere.");
        return;
    }

    setSubmitting(true); setErrorMsg(null);

    const weeksPayload = priceQuote.details.map((d: any) => ({
        camp_week_id: d.week_id, type: d.type, pre_post: d.prePost || 'NONE', price: d.price
    }));

    if (weeksPayload.length === 0) { setErrorMsg("Nessuna settimana selezionata."); setSubmitting(false); return; }

    const result = await createEnrollment({
      campId: selectedCamp, childId: selectedChild, weeks: weeksPayload, 
      totalPrice: priceQuote.total, priceSnapshot: priceQuote, appliedPromo: isPromoApplied
    });

    if (result.error) { setErrorMsg(result.error); setSubmitting(false); } 
    else { router.push('/Utente?success=enrollment_created'); }
  };

  const formatDateRange = (start: string, end: string) => {
    const s = new Date(start).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    const e = new Date(end).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
    return `${s} - ${e}`;
  };

  if (loadingData) return <div className="flex h-screen items-center justify-center bg-cream"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div></div>;

  if (children.length === 0) {
    return (
       <div className="max-w-4xl mx-auto py-10 px-4">
         <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-10 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Aggiungi il tuo primo bambino</h2>
            <button onClick={() => router.push('/Utente')} className="bg-cyan-600 text-white px-8 py-4 rounded-xl font-bold">Vai alla Dashboard</button>
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
        
        {/* COLONNA SINISTRA */}
        <div className="lg:col-span-8 space-y-8">
          {/* ... (Selettori Bambino/Camp rimangono uguali) ... */}
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
                    {availableCamps.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.indirizzo_paese})</option>)}
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
                   const isAlreadyBooked = isWeekBooked(week.id); 
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
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          )}
        </div>

        {/* COLONNA DESTRA */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-gray-100 sticky top-8 flex flex-col h-fit">
            <h3 className="font-bold text-xl text-blue-deep mb-6 flex items-center gap-2 border-b border-gray-100 pb-4"><Euro size={22} className="text-cyan-600"/> Riepilogo</h3>
            
            {!selectedChild || !selectedCamp ? (
              <div className="text-center py-10 text-gray-400"><Users size={48} className="mx-auto mb-3 opacity-20"/><p className="text-sm">Seleziona bambino e campo.</p></div>
            ) : calculating ? (
              <div className="flex flex-col items-center justify-center py-12 text-cyan-600"><Loader2 className="animate-spin mb-2" size={32}/> <span className="text-sm font-medium">Calcolo...</span></div>
            ) : priceQuote ? (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {priceQuote.details.map((d:any) => {
                    const weekObj = weeks.find(w => w.id === d.week_id);
                    // --- LOGICA VISUALIZZAZIONE SCONTO PER RIGA ---
                    const showDiscount = d.is_full && d.price < d.originalPrice;
                    
                    return (
                        <div key={d.week_id} className="flex justify-between items-start text-sm p-3 rounded-xl bg-gray-50 border border-gray-100">
                           <div className="w-full">
                               <div className="flex justify-between">
                                   <span className="font-bold text-gray-700 block mb-1">{weekObj?.label}</span>
                                   {/* Etichetta Sconto */}
                                   {showDiscount && (
                                       <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold h-fit">
                                            {d.discountReason || "Sconto serie settimane"}
                                       </span>
                                   )}
                               </div>
                               
                               <div className="flex flex-col gap-0.5 text-xs text-gray-500">
                                   <div className="flex items-center gap-2">
                                       {/* PREZZO BARRATO */}
                                       {showDiscount && (
                                           <span className="line-through text-gray-400">€{d.originalPrice}</span>
                                       )}
                                       {/* PREZZO REALE */}
                                       <span className="font-bold text-gray-800">
                                            €{d.price} {d.is_full ? "" : "(Mezza)"}
                                       </span>
                                   </div>
                                   {d.extraPrice > 0 && <div className="text-cyan-700 font-medium">+ €{d.extraPrice} ({d.prePost === 'BOTH' ? 'Pre+Post' : d.prePost})</div>}
                               </div>
                           </div>
                        </div>
                    );
                  })}
                </div>

                <div className="border-t border-dashed border-gray-200"></div>

                {(isCastelloCamp || isMuliniCamp) && (
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <label className="text-xs font-bold text-purple-900 mb-1 flex items-center gap-1"><Tag size={12}/> Codice Sconto Fedeltà</label>
                        <div className="flex gap-2">
                            <input type="text" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} placeholder="Inserisci codice" className="text-black w-full text-sm p-2 rounded border border-purple-200 outline-none uppercase" disabled={isPromoApplied} />
                            {isPromoApplied ? <button onClick={() => { setIsPromoApplied(false); setPromoCode(""); }} className="bg-red-100 text-red-600 px-3 rounded font-bold text-xs hover:bg-red-200">X</button> : <button onClick={applyPromoCode} className="bg-purple-600 text-white px-3 rounded font-bold text-xs hover:bg-purple-700">Applica</button>}
                        </div>
                        {promoError && <p className="text-xs text-red-500 mt-1 font-bold">{promoError}</p>}
                        {isPromoApplied && <p className="text-xs text-green-600 mt-1 font-bold">Sconto applicato!</p>}
                    </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-gray-600 text-sm font-medium"><span>Totale Settimane (Cumulativo)</span><span>€{priceQuote.tuition.toFixed(2)}</span></div>
                  <div className="flex justify-between items-center text-gray-600 text-sm font-medium"><span>Extra (Pre/Post)</span><span>€{priceQuote.extras.toFixed(2)}</span></div>
                    <div className="flex justify-between items-center text-gray-800 text-sm font-bold">
                      <span>Quota Iscrizione</span>
                      <span>+ €{priceQuote.registrationFee.toFixed(2)}</span>
                    </div>
                  {priceQuote.discountSibling > 0 && <div className="flex justify-between items-center text-green-600 text-sm font-bold"><span>Sconto Fratelli</span><span>- €{priceQuote.discountSibling.toFixed(2)}</span></div>}
                  {priceQuote.discountPromo > 0 && <div className="flex justify-between items-center text-purple-600 text-sm font-bold"><span>Sconto Codice</span><span>- €{priceQuote.discountPromo.toFixed(2)}</span></div>}
                  {alreadyBilledAmount > 0 && <div className="flex justify-between items-center text-cyan-700 text-sm font-medium"><span>Già Fatturato</span><span>- €{alreadyBilledAmount.toFixed(2)}</span></div>}
                  
                  <div className="border-b border-gray-100 my-1"></div>
                  <div className="bg-blue-600 p-5 rounded-2xl flex justify-between items-center shadow-lg shadow-blue-200 mt-2">
                    <div className="text-white"><p className="text-xs uppercase tracking-wider opacity-80 mb-0.5">Da Saldare Ora</p><p className="text-xs opacity-70">(Bonifico)</p></div>
                    <span className="text-3xl font-extrabold text-white">€{priceQuote.total.toFixed(2)}</span>
                  </div>
                

                  {errorMsg && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex gap-2 border border-red-100"><AlertTriangle size={14}/> {errorMsg}</div>}

                  <button 
                    onClick={handleSubmit} 
                    disabled={submitting || priceQuote.total < 0 || !acceptTerms} 
                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg flex justify-center items-center gap-2 group ${
                      (submitting || priceQuote.total < 0 || !acceptTerms) 
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed shadow-none" 
                      : "bg-cyan-600 text-white hover:bg-cyan-700 hover:shadow-cyan-200/50"
                    }`}
                  >
                    {submitting ? <><Loader2 className="animate-spin" size={20}/> Elaborazione...</> : <>Conferma Iscrizione <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform"/></>}
                  </button>

                  {/* CHECKBOX REGOLAMENTO (SOTTO IL BOTTONE) */}
                  <div className="mt-4 flex justify-center">
                    <label className="flex items-start gap-2 cursor-pointer opacity-90 hover:opacity-100 transition-opacity select-none">
                       <input 
                         type="checkbox" 
                         checked={acceptTerms}
                         onChange={(e) => setAcceptTerms(e.target.checked)}
                         className="mt-0.5 accent-cyan-600 w-4 h-4 cursor-pointer"
                       />
                       <span className="text-xs text-gray-600 leading-tight">
                         Dichiaro di aver letto e di accettare il <a href="/regolamentoSportEssence.pdf" target="_blank" rel="noopener noreferrer" className="text-cyan-700 font-bold hover:underline" onClick={(e) => e.stopPropagation()}>Regolamento del camp</a>.
                       </span>
                    </label>
                  </div>

                </div>
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