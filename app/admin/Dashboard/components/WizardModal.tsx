"use client";

import React, { useState, useEffect } from "react";
import { X, Sparkles, ClipboardList, User, Baby, MapPin, Phone, Mail, Euro, Calendar, CheckCircle, Calculator, Tag, ChevronRight, ArrowLeft } from "lucide-react";
import { createAdminParent, createAdminChild, createAdminEnrollment } from "../../actions";

export const WizardModal = ({ profiles, camps, weeks, childrenData, onClose, onSuccess }: any) => {
  const [wizardStep, setWizardStep] = useState(1);
  const [loadingAction, setLoadingAction] = useState(false);
  const [tempIntolleranze, setTempIntolleranze] = useState("");
  const [useSameEmail, setUseSameEmail] = useState(true); 
  
  const [isSibling, setIsSibling] = useState(false); 
  const [isPromo, setIsPromo] = useState(false);

  // Stati per la ricerca genitore
  const [parentSearchTerm, setParentSearchTerm] = useState("");
  const [showParentDropdown, setShowParentDropdown] = useState(false);

  // Stato per la modalità bambino (Lista vs Creazione form)
  const [isCreatingChild, setIsCreatingChild] = useState(false);

  const [wizardData, setWizardData] = useState({ 
    parent_id: "", 
    child_id: "", 
    camp_id: "", 
    prezzo_totale: 0, 
    pagato: 0, 
    weeks: [] as any[] 
  });
  
  const [autoPrice, setAutoPrice] = useState(0);

  // --- MOTORE DI CALCOLO PREZZO ---
  const getWeekPrice = (camp: any, type: string, pre_post: string, fullWeeksCount: number) => {
    if (!camp) return 0;
    const baseFull = camp.prezzo_base_indicativo || 0;
    const baseHalf = camp.price_half_day || 0;
    const preBundle = camp.price_pre_post_bundle || 0;
    const prePrice = camp.price_pre || 0;
    const postPrice = camp.price_post || 0;

    const tiers = camp.camp_pricing_tiers || [];
    const activeTier = [...tiers].sort((a: any, b: any) => b.min_weeks - a.min_weeks).find((t: any) => fullWeeksCount >= t.min_weeks);

    let tierBasePrice = activeTier?.price_per_week || baseFull;
    const discountPercentTier = activeTier?.discount_percent || 0;
    
    if (tierBasePrice === 0 && activeTier) {
        const prevTier = [...tiers].sort((a: any, b: any) => a.min_weeks - b.min_weeks).filter((t: any) => t.min_weeks < activeTier.min_weeks && t.price_per_week > 0).pop();
        if (prevTier) tierBasePrice = prevTier.price_per_week;
    }
    const discountedTierPrice = tierBasePrice * (1 - (discountPercentTier / 100));

    let price = type === 'HALF' ? baseHalf : discountedTierPrice;
    let extra = 0;
    if (pre_post === 'BOTH') extra = preBundle || (prePrice + postPrice);
    else if (pre_post === 'PRE') extra = prePrice;
    else if (pre_post === 'POST') extra = postPrice;

    return price + extra;
  };

  useEffect(() => {
    const campObj = camps?.find((c: any) => c.id === wizardData.camp_id);
    if (!campObj || wizardData.weeks.length === 0) {
      setAutoPrice(0);
      return;
    }

    const fullWeeks = wizardData.weeks.filter(w => w.type === 'FULL');
    const numFullWeeks = fullWeeks.length;
    
    const tiers = campObj.camp_pricing_tiers || [];
    const activeTierObj = [...tiers].sort((a: any, b: any) => b.min_weeks - a.min_weeks).find((t: any) => numFullWeeks >= t.min_weeks);
    
    const baseStandardPrice = campObj.prezzo_base_indicativo || 0;
    let tierBasePrice = activeTierObj?.price_per_week || baseStandardPrice;
    const discountPercentTier = activeTierObj?.discount_percent || 0;

    if (tierBasePrice === 0 && activeTierObj) {
        const prevTier = [...tiers].sort((a: any, b: any) => a.min_weeks - b.min_weeks).filter((t:any) => t.min_weeks < activeTierObj.min_weeks && t.price_per_week > 0).pop();
        if (prevTier) tierBasePrice = prevTier.price_per_week;
    }

    const discountedTierPrice = tierBasePrice * (1 - (discountPercentTier / 100));

    let grandTuition = 0;
    let grandExtras = 0;
    let grandSiblingDiscount = 0;

    wizardData.weeks.forEach(w => {
        let price = 0; let extra = 0;
        if (w.type === 'HALF') price = campObj.price_half_day || 0;
        else {
            if (isSibling && campObj.sibling_discount_week_price > 0) price = campObj.sibling_discount_week_price;
            else {
                price = discountedTierPrice;
                if (isSibling) {
                    if (campObj.sibling_discount_value > 0 && campObj.sibling_discount_value <= 1) grandSiblingDiscount += price * campObj.sibling_discount_value;
                    else if (campObj.sibling_discount_value > 1) grandSiblingDiscount += Number(campObj.sibling_discount_value);
                }
            }
        }
        if (w.pre_post === 'BOTH') extra = campObj.price_pre_post_bundle || ((campObj.price_pre||0) + (campObj.price_post||0));
        else if (w.pre_post === 'PRE') extra = campObj.price_pre || 0;
        else if (w.pre_post === 'POST') extra = campObj.price_post || 0;

        grandTuition += price; grandExtras += extra;
    });

    let grandPromoDiscount = 0;
    if (isPromo) {
        const isCastelloCamp = campObj.nome.toLowerCase().includes("castello");
        const isMuliniCamp = campObj.nome.toLowerCase().includes("uggiate");
        const promoValue = isCastelloCamp ? Number(process.env.NEXT_PUBLIC_SCONTO_FEDELI_CANTU || 0.20) : isMuliniCamp ? Number(process.env.NEXT_PUBLIC_SCONTO_FEDELI_MULINI || 0.20) : 0;
        grandPromoDiscount = grandTuition * promoValue;
    }

    const registrationFee = 15;
    setAutoPrice(Math.max(0, grandTuition + grandExtras - grandSiblingDiscount - grandPromoDiscount) + registrationFee);
  }, [wizardData.weeks, wizardData.camp_id, camps, isSibling, isPromo]);

  const applyAutoPrice = () => {
    const camp = camps?.find((c: any) => c.id === wizardData.camp_id);
    const fullWeeksCount = wizardData.weeks.filter(w => w.type === 'FULL').length;
    const updatedWeeks = wizardData.weeks.map(w => ({ ...w, computed_price: getWeekPrice(camp, w.type, w.pre_post, fullWeeksCount) }));
    setWizardData(prev => ({ ...prev, weeks: updatedWeeks, prezzo_totale: autoPrice }));
  };

  // --- HELPER GENITORI & BAMBINI ---
  const filteredParents = profiles?.filter((p: any) => 
    `${p.nome} ${p.cognome} ${p.email}`.toLowerCase().includes(parentSearchTerm.toLowerCase())
  ) || [];

  const handleSelectParent = (p: any) => {
    setWizardData({...wizardData, parent_id: p.id, child_id: ""});
    setParentSearchTerm(`${p.nome} ${p.cognome} (${p.email})`);
    setShowParentDropdown(false);
  };

  const parentChildrenList = childrenData?.filter((c: any) => c.parent_id === wizardData.parent_id) || [];

  // Seleziona se mostrare la lista o il form in base a se ha bambini o meno
  useEffect(() => {
    if (wizardStep === 2) {
      if (parentChildrenList.length === 0) setIsCreatingChild(true);
      else setIsCreatingChild(false);
    }
  }, [wizardStep, wizardData.parent_id, parentChildrenList.length]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-cyan-600 p-5 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg"><Sparkles className="text-amber-400" size={20} /></div>
            <div>
                <h3 className="font-bold text-lg leading-tight">Iscrizione Rapida Admin</h3>
                <p className="text-xs text-white">Bypassa l'OTP e iscrivi direttamente</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20}/></button>
        </div>

        {/* STEPPER VISIVO */}
        <div className="bg-slate-50 px-8 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className={`flex flex-col items-center ${wizardStep >= 1 ? 'text-cyan-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 ${wizardStep >= 1 ? 'bg-cyan-600 text-white shadow-md' : 'bg-gray-200'}`}>1</div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Genitore</span>
            </div>
            <div className={`h-1 flex-1 mx-4 rounded-full ${wizardStep >= 2 ? 'bg-cyan-600' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center ${wizardStep >= 2 ? 'text-cyan-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 ${wizardStep >= 2 ? 'bg-cyan-600 text-white shadow-md' : 'bg-gray-200'}`}>2</div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Bambino</span>
            </div>
            <div className={`h-1 flex-1 mx-4 rounded-full ${wizardStep >= 3 ? 'bg-cyan-600' : 'bg-gray-200'}`}></div>
            <div className={`flex flex-col items-center ${wizardStep >= 3 ? 'text-cyan-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 ${wizardStep >= 3 ? 'bg-cyan-600 text-white shadow-md' : 'bg-gray-200'}`}>3</div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Iscrizione</span>
            </div>
        </div>

        <div className="p-6 md:p-8 max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          
          {/* STEP 1: GENITORE */}
          {wizardStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              
              {/* DROPDOWN RICERCA GENITORE */}
              <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-5 relative">
                <label className="block text-xs font-bold text-cyan-900 uppercase mb-2 flex items-center gap-2"><User size={14}/> Cerca Genitore Esistente</label>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Digita nome, cognome o email..." 
                        className="w-full border-0 p-3 rounded-lg bg-white shadow-sm text-sm text-black focus:ring-2 focus:ring-cyan-500 outline-none"
                        value={parentSearchTerm}
                        onChange={(e) => {
                            setParentSearchTerm(e.target.value);
                            setShowParentDropdown(true);
                            if (wizardData.parent_id) setWizardData({...wizardData, parent_id: ""});
                        }}
                        onFocus={() => setShowParentDropdown(true)}
                        onBlur={() => setTimeout(() => setShowParentDropdown(false), 200)}
                    />
                    {showParentDropdown && filteredParents.length > 0 && (
                        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                            {filteredParents.map((p: any) => (
                                <li key={p.id} onClick={() => handleSelectParent(p)} className="p-3 hover:bg-cyan-50 cursor-pointer border-b border-gray-100 text-sm flex flex-col">
                                    <span className="font-bold text-gray-800">{p.nome} {p.cognome}</span>
                                    <span className="text-gray-500 text-[10px]">{p.email}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
              </div>

              <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-widest">Oppure Crea Nuovo Profilo</span>
                  <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <form id="parentForm" onSubmit={async (e) => {
                  e.preventDefault(); 
                  setLoadingAction(true); 
                  const fd = new FormData(e.currentTarget as HTMLFormElement);
                  
                  const mainEmail = fd.get('p_email') as string;
                  const emailContatti = useSameEmail ? mainEmail : (fd.get('p_email_contatti') as string);
                  
                  const res = await createAdminParent({ 
                      nome: fd.get('p_nome') as string, cognome: fd.get('p_cognome') as string, 
                      email: mainEmail, email_contatti: emailContatti, cf: (fd.get('p_cf') as string).toUpperCase(),
                      telefono: fd.get('p_tel') as string, indirizzo_via: fd.get('p_via') as string,
                      indirizzo_civico: fd.get('p_civico') as string, indirizzo_cap: fd.get('p_cap') as string,
                      indirizzo_paese: fd.get('p_paese') as string, indirizzo_provincia: fd.get('p_prov') as string,
                  });
                  setLoadingAction(false); 
                  if(res.success) { 
                      setWizardData({...wizardData, parent_id: res.parentId!}); 
                      setWizardStep(2); 
                  } else alert(res.error);
                }}>
                <div className={`space-y-4 ${wizardData.parent_id ? 'opacity-40 pointer-events-none' : ''}`}>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Nome</label><input name="p_nome" required={!wizardData.parent_id} type="text" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black" /></div>
                        <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cognome</label><input name="p_cognome" required={!wizardData.parent_id} type="text" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black" /></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Mail size={12}/> Email (Login)</label><input name="p_email" required={!wizardData.parent_id} type="email" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black" /></div>
                        <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Codice Fiscale</label><input name="p_cf" required={!wizardData.parent_id} type="text" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black font-mono uppercase" /></div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 accent-cyan-600 rounded" checked={useSameEmail} onChange={(e) => setUseSameEmail(e.target.checked)} />
                            Usa l'email principale anche per le comunicazioni e ricevute
                        </label>
                        {!useSameEmail && (
                            <div className="mt-4 pt-3 border-t border-gray-200 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Mail size={12}/> Email Contatti Alternativa</label>
                                <input name="p_email_contatti" required={!useSameEmail && !wizardData.parent_id} type="email" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black bg-white" placeholder="es. miamammail@gmail.com" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-[1fr_2fr] gap-4">
                        <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><Phone size={12}/> Telefono</label><input name="p_tel" type="tel" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black" /></div>
                        <div className="grid grid-cols-[2fr_1fr] gap-4">
                            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1 flex items-center gap-1"><MapPin size={12}/> Via/Piazza</label><input name="p_via" required={!wizardData.parent_id} type="text" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black" /></div>
                            <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Civico</label><input name="p_civico" required={!wizardData.parent_id} type="text" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black" /></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CAP</label><input name="p_cap" required={!wizardData.parent_id} type="text" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black" /></div>
                        <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Comune</label><input name="p_paese" required={!wizardData.parent_id} type="text" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black" /></div>
                        <div><label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Prov.</label><input name="p_prov" required={!wizardData.parent_id} type="text" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black" /></div>
                    </div>
                </div>

                <div className="flex justify-end pt-6 mt-6 border-t border-gray-100">
                  {wizardData.parent_id ? (
                    <button type="button" onClick={() => setWizardStep(2)} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-md transition-all">Avanti al Bambino</button>
                  ) : (
                    <button type="submit" disabled={loadingAction} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2">
                        {loadingAction ? 'Salvataggio...' : <><CheckCircle size={18}/> Salva Profilo & Avanti</>}
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: BAMBINO */}
          {wizardStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              
              {/* LISTA BAMBINI ESISTENTI */}
              {!isCreatingChild && parentChildrenList.length > 0 ? (
                  <div className="space-y-5">
                      <div className="border-b border-gray-100 pb-3 flex items-center gap-2 text-cyan-900">
                          <Baby size={20} />
                          <h4 className="font-bold text-lg">Seleziona un Bambino</h4>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                          {parentChildrenList.map((child: any) => (
                              <div 
                                key={child.id} 
                                onClick={() => { setWizardData({...wizardData, child_id: child.id}); setWizardStep(3); }}
                                className="p-4 bg-white border border-gray-200 rounded-xl hover:border-cyan-500 hover:shadow-md cursor-pointer transition-all flex items-center justify-between group"
                              >
                                  <div>
                                      <div className="font-bold text-gray-800 group-hover:text-cyan-700 transition-colors">{child.nome} {child.cognome}</div>
                                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                          <span>CF: {child.cf || child.codice_fiscale}</span>
                                          {child.data_nascita && <span>• Nato il: {new Date(child.data_nascita).toLocaleDateString()}</span>}
                                      </div>
                                  </div>
                                  <ChevronRight className="text-gray-300 group-hover:text-cyan-500 transition-colors" />
                              </div>
                          ))}
                      </div>

                      <div className="relative flex py-4 items-center">
                          <div className="flex-grow border-t border-gray-200"></div>
                          <span className="flex-shrink mx-4 text-gray-400 text-[10px] uppercase font-bold tracking-widest">Oppure</span>
                          <div className="flex-grow border-t border-gray-200"></div>
                      </div>

                      <button onClick={() => setIsCreatingChild(true)} className="w-full py-3 bg-cyan-50 text-cyan-700 font-bold rounded-xl hover:bg-cyan-100 transition-all border border-cyan-200">
                          + Crea Nuovo Bambino
                      </button>

                      <div className="pt-6 mt-2 border-t border-gray-100">
                          <button type="button" onClick={() => setWizardStep(1)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl transition-all hover:bg-gray-200">Indietro</button>
                      </div>
                  </div>
              ) : (
                  // FORM CREAZIONE NUOVO BAMBINO
                  <>
                    <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-cyan-900">
                            <Baby size={20} />
                            <h4 className="font-bold text-lg">Crea Nuovo Bambino</h4>
                        </div>
                        {parentChildrenList.length > 0 && (
                            <button onClick={() => setIsCreatingChild(false)} className="text-xs text-cyan-600 font-bold hover:text-cyan-800 flex items-center gap-1">
                                <ArrowLeft size={14}/> Torna alla lista
                            </button>
                        )}
                    </div>
                    <form onSubmit={async (e) => {
                        e.preventDefault(); 
                        setLoadingAction(true); 
                        const fd = new FormData(e.currentTarget as HTMLFormElement);
                        const intolleranzeArr = tempIntolleranze.split(',').map(i => i.trim()).filter(Boolean);
                        
                        const res = await createAdminChild({ 
                            nome: fd.get('c_nome') as string, 
                            cognome: fd.get('c_cognome') as string, 
                            cf: (fd.get('c_cf') as string).toUpperCase(), 
                            data_nascita: fd.get('c_nas') as string, 
                            taglia_maglietta: fd.get('c_taglia') as string, 
                            intolleranze: intolleranzeArr, 
                            parent_id: wizardData.parent_id 
                        });
                        setLoadingAction(false); 
                        if(res.success) { 
                            setWizardData({...wizardData, child_id: res.childId!}); 
                            setWizardStep(3); 
                        } else alert(res.error);
                        }}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Nome Bambino</label><input name="c_nome" required type="text" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black" /></div>
                            <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Cognome Bambino</label><input name="c_cognome" required type="text" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black" /></div>
                            </div>
                            <div className="grid grid-cols-[2fr_1fr] gap-4">
                            <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Codice Fiscale</label><input name="c_cf" required type="text" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black font-mono uppercase" /></div>
                            <div><label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Data Nascita</label><input name="c_nas" required type="date" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Taglia Maglietta</label>
                                    <select name="c_taglia" required className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black bg-white">
                                        <option value="4XS">4XS</option><option value="3XS">3XS</option><option value="2XS">2XS</option><option value="XS">XS</option>
                                        <option value="S">S</option><option value="M">M</option><option value="L">L</option><option value="XL">XL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Intolleranze (Separate da virgola)</label>
                                    <input type="text" placeholder="Es: Glutine, Lattosio" value={tempIntolleranze} onChange={(e) => setTempIntolleranze(e.target.value)} className="w-full border border-gray-300 p-2.5 rounded-lg text-sm text-black" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-between pt-6 mt-6 border-t border-gray-100">
                        <button type="button" onClick={() => setWizardStep(1)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl transition-all hover:bg-gray-200">Indietro</button>
                        <button type="submit" disabled={loadingAction} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2">
                            {loadingAction ? 'Salvataggio...' : <><CheckCircle size={18}/> Salva Bambino & Avanti</>}
                        </button>
                        </div>
                    </form>
                  </>
              )}
            </div>
          )}

          {/* STEP 3: ISCRIZIONE E PREZZO */}
          {wizardStep === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              
              <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-5 flex justify-between items-center gap-6">
                  <div className="flex-1">
                      <label className="block text-xs font-bold text-cyan-900 uppercase mb-2 flex items-center gap-2"><Calendar size={14}/> 1. Assegna al Campo Estivo</label>
                      <select required className="w-full border-0 p-3 rounded-lg bg-white shadow-sm text-sm text-black focus:ring-2 focus:ring-cyan-500 outline-none" value={wizardData.camp_id} onChange={(e) => setWizardData({...wizardData, camp_id: e.target.value})}>
                        <option value="">-- Seleziona Campo --</option>
                        {camps?.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                  </div>
                  
                  {/* SCONTI E PROMO */}
                  <div className="flex-1">
                      <label className="block text-xs font-bold text-purple-900 uppercase mb-2 flex items-center gap-2"><Tag size={14}/> Sconti e Promo</label>
                      <div className="flex flex-col gap-2">
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer bg-white p-2 rounded-lg border border-purple-100 shadow-sm">
                              <input type="checkbox" className="w-4 h-4 accent-purple-600 rounded" checked={isSibling} onChange={(e) => setIsSibling(e.target.checked)} />
                              Applica Sconto Fratello
                          </label>
                       </div>
                  </div>
              </div>

              <form onSubmit={async (e) => {
                  e.preventDefault(); 
                  setLoadingAction(true);
                  const res = await createAdminEnrollment({ 
                      child_id: wizardData.child_id, 
                      camp_id: wizardData.camp_id, 
                      prezzo_totale: wizardData.prezzo_totale, 
                      pagato: wizardData.pagato, 
                      weeks: wizardData.weeks 
                  });
                  setLoadingAction(false); 
                  if(res.success) onSuccess(); else alert(res.error);
                }}>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 mb-6">
                  <span className="block text-xs font-bold text-slate-700 uppercase mb-3 flex items-center gap-2"><ClipboardList size={16}/> 2. Seleziona Settimane</span>
                  
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                    {weeks?.filter((w: any) => !wizardData.camp_id || w.camp_id === wizardData.camp_id).map((wk: any) => {
                      const currentWeek = wizardData.weeks.find((w: any) => w.camp_week_id === wk.id);
                      const isChecked = !!currentWeek;
                      return (
                        <div key={wk.id} className={`flex flex-col p-3 bg-white rounded-lg border transition-colors ${isChecked ? 'border-cyan-400 shadow-sm' : 'border-gray-200 opacity-70'}`}>
                          <label className="flex items-center gap-3 font-bold text-gray-800 cursor-pointer w-full text-sm">
                            <input type="checkbox" className="w-4 h-4 accent-cyan-600 rounded" checked={isChecked} onChange={(e) => {
                                if(e.target.checked) {
                                    setWizardData({...wizardData, weeks: [...wizardData.weeks, { camp_week_id: wk.id, type: 'FULL', pre_post: 'NONE', computed_price: 0 }]});
                                } else {
                                    setWizardData({...wizardData, weeks: wizardData.weeks.filter((w: any) => w.camp_week_id !== wk.id)});
                                }
                              }} />
                            {wk.label || `Settimana del ${new Date(wk.data_inizio).toLocaleDateString()}`}
                          </label>
                          {isChecked && (
                            <div className="flex gap-2 items-center mt-3 pt-3 border-t border-gray-100">
                              <select className="p-2 border border-gray-200 rounded-lg text-xs bg-gray-50 flex-1 outline-none text-black" onChange={(e) => {
                                  const updated = wizardData.weeks.map((w: any) => w.camp_week_id === wk.id ? {...w, type: e.target.value} : w); setWizardData({...wizardData, weeks: updated});
                                }} value={currentWeek.type}>
                                  <option value="FULL">GIORNATA INTERA</option>
                                  <option value="HALF">MEZZA GIORNATA</option>
                              </select>
                              <select className="p-2 border border-gray-200 rounded-lg text-xs bg-gray-50 flex-1 outline-none text-black" onChange={(e) => {
                                  const updated = wizardData.weeks.map((w: any) => w.camp_week_id === wk.id ? {...w, pre_post: e.target.value} : w); setWizardData({...wizardData, weeks: updated});
                                }} value={currentWeek.pre_post}>
                                  <option value="NONE">NO EXTRA</option>
                                  <option value="PRE">PRE</option>
                                  <option value="POST">POST</option>
                                  <option value="BOTH">BOTH (PRE+POST)</option>
                              </select>

                              
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {(!wizardData.camp_id || weeks?.filter((w: any) => w.camp_id === wizardData.camp_id).length === 0) && (
                        <div className="text-center py-4 text-xs text-gray-400">Seleziona un campo per vedere le settimane.</div>
                    )}
                  </div>
                </div>

                {/* BLOCCO CALCOLO PREZZO */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr] gap-4 mb-6">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-emerald-800 uppercase flex items-center gap-1"><Calculator size={12}/> Prezzo Calcolato</p>
                            <p className="text-[9px] text-emerald-600 mt-1 leading-tight">Basato sui listini ufficiali, extra, sconti e quota iscrizione di 15€.</p>
                        </div>
                        <div className="mt-3">
                            <span className="text-2xl font-black text-emerald-900 block mb-2">€ {autoPrice.toFixed(2)}</span>
                            <button 
                                type="button" 
                                disabled={wizardData.weeks.length === 0}
                                onClick={applyAutoPrice}
                                className="w-full py-2 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700 transition shadow-sm disabled:opacity-50"
                            >
                                APPLICA QUESTO PREZZO
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-3 justify-center">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1 flex items-center gap-1"><Euro size={12}/> 3. Prezzo Finale di Iscrizione</label>
                            <input required type="number" step="0.01" className="w-full border border-gray-300 p-2.5 rounded-lg text-lg font-mono font-bold text-black shadow-inner" value={wizardData.prezzo_totale === 0 ? "" : wizardData.prezzo_totale} onChange={(e) => setWizardData({...wizardData, prezzo_totale: parseFloat(e.target.value) || 0})} />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">Acconto già ricevuto in mano/bonifico</label>
                            <input required type="number" step="0.01" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm font-mono text-black font-bold shadow-inner" value={wizardData.pagato || 0} onChange={(e) => setWizardData({...wizardData, pagato: parseFloat(e.target.value) || 0})} />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-100">
                  <button type="button" onClick={() => setWizardStep(2)} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl transition-all hover:bg-gray-200">Indietro</button>
                  <button type="submit" disabled={loadingAction || !wizardData.camp_id || wizardData.weeks.length === 0} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50">
                      {loadingAction ? 'Finalizzazione...' : 'Concludi Iscrizione'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};