"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, CreditCard, Calendar, Search, 
  FileText, ChevronDown, ChevronUp, AlertCircle, Phone, Mail, User, 
  Clock, Sun, Moon, Edit, CheckCircle, PlusCircle 
} from "lucide-react";
import { registerPayment, applyMembershipDiscount, updateEnrollmentDetails } from "../actions"; 
import { useRouter } from "next/navigation";

// --- TIPI CORRETTI ---
type DashboardProps = {
  enrollments: any[];
  camps: any[];
  weeks: any[]; // Ora incluso per evitare errori TS
  profiles: any[];
};

export default function AdminDashboardClient({ enrollments, camps, profiles }: DashboardProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loadingAction, setLoadingAction] = useState(false);

  // --- STATI MODALI ---
  const [activeModal, setActiveModal] = useState<{
    type: 'PAYMENT' | 'EDIT' | 'MEMBERSHIP' | null,
    enrollmentId: string | null,
    data?: any
  }>({ type: null, enrollmentId: null });

  // --- STATI FILTRI ---
  const [filters, setFilters] = useState({
    campId: "ALL",
    weekDate: "ALL", 
    status: "ALL", 
  });

  // --- 1. ARRICCHIMENTO DATI ---
  const enrichedEnrollments = useMemo(() => {
    if (!enrollments) return [];
    return enrollments.map(enrollment => {
      const parentId = enrollment.children?.parent_id;
      // Safety check: profiles potrebbe essere undefined se la fetch fallisce
      const parentProfile = profiles?.find(p => p.id === parentId);
      return { ...enrollment, parent: parentProfile };
    });
  }, [enrollments, profiles]);

  // --- 2. OPZIONI FILTRO SETTIMANE ---
  const uniqueWeeksOptions = useMemo(() => {
    const optionsMap = new Map();
    enrichedEnrollments.forEach(enrollment => {
      if (filters.campId !== "ALL" && enrollment.camps?.id !== filters.campId) return;
      
      if (enrollment.enrollment_weeks && Array.isArray(enrollment.enrollment_weeks)) {
        enrollment.enrollment_weeks.forEach((ew: any) => {
            const dataInizio = ew.camp_weeks?.data_inizio;
            const label = ew.camp_weeks?.label;
            if (dataInizio && !optionsMap.has(dataInizio)) {
            optionsMap.set(dataInizio, {
                value: dataInizio,
                label: label || new Date(dataInizio).toLocaleDateString()
            });
            }
        });
      }
    });
    return Array.from(optionsMap.values()).sort((a: any, b: any) => a.value.localeCompare(b.value));
  }, [enrichedEnrollments, filters.campId]);

  // --- 3. FILTRAGGIO DATI ---
  const filteredData = useMemo(() => {
    return enrichedEnrollments.filter((e) => {
      const searchStr = `
        ${e.id || ''} 
        ${e.children?.nome || ''} ${e.children?.cognome || ''} 
        ${e.parent?.nome || ''} ${e.parent?.cognome || ''} ${e.parent?.email || ''}
      `.toLowerCase();
      
      const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
      const matchesCamp = filters.campId === "ALL" || e.camps?.id === filters.campId;
      
      const matchesWeek = filters.weekDate === "ALL" || 
        (e.enrollment_weeks && e.enrollment_weeks.some((ew: any) => ew.camp_weeks?.data_inizio === filters.weekDate));
      
      // Gestione sicura numeri
      const pagato = e.pagato || 0;
      const totale = e.prezzo_totale || 0;
      const isPaid = (pagato + 0.1) >= totale;
      
      const matchesStatus = filters.status === "ALL" || 
        (filters.status === "PAID" && isPaid) || 
        (filters.status === "TO_PAY" && !isPaid);

      return matchesSearch && matchesCamp && matchesWeek && matchesStatus;
    });
  }, [enrichedEnrollments, searchTerm, filters]);

  // --- 4. KPI ---
  const stats = useMemo(() => {
    const totalRevenue = filteredData.reduce((acc, curr) => acc + (curr.pagato || 0), 0);
    const totalPotential = filteredData.reduce((acc, curr) => acc + (curr.prezzo_totale || 0), 0);
    const uniqueChildren = new Set(filteredData.map(e => e.children?.id)).size;
    
    const weeksSold = filteredData.reduce((acc, curr) => {
      if (!curr.enrollment_weeks) return acc;
      if (filters.weekDate === "ALL") {
        return acc + curr.enrollment_weeks.length;
      } else {
        const matchingWeeks = curr.enrollment_weeks.filter((ew: any) => ew.camp_weeks?.data_inizio === filters.weekDate);
        return acc + matchingWeeks.length;
      }
    }, 0);

    return { totalRevenue, totalPotential, uniqueChildren, weeksSold };
  }, [filteredData, filters.weekDate]);

  // --- ACTIONS HANDLERS ---
  const closeModal = () => setActiveModal({ type: null, enrollmentId: null });

  const handlePaymentSubmit = async (amount: number) => {
    if (!activeModal.enrollmentId) return;
    setLoadingAction(true);
    const res = await registerPayment(activeModal.enrollmentId, amount);
    setLoadingAction(false);
    if (res.success) { closeModal(); router.refresh(); } 
    else { alert("Errore: " + res.error); }
  };

  const handleEditSubmit = async (price: number, campId: string) => {
    if (!activeModal.enrollmentId) return;
    setLoadingAction(true);
    const res = await updateEnrollmentDetails(activeModal.enrollmentId, price, campId);
    setLoadingAction(false);
    if (res.success) { closeModal(); router.refresh(); } 
    else { alert("Errore: " + res.error); }
  };

  const handleMembershipSubmit = async () => {
    if (!activeModal.enrollmentId) return;
    const discount = 15; 
    setLoadingAction(true);
    const res = await applyMembershipDiscount(activeModal.enrollmentId, discount);
    setLoadingAction(false);
    if (res.success) { closeModal(); router.refresh(); } 
    else { alert("Errore: " + res.error); }
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const resetFilters = () => {
    setFilters({ campId: "ALL", weekDate: "ALL", status: "ALL" });
    setSearchTerm("");
  };

  const getPrePostLabel = (val: string) => {
    switch (val) {
      case 'PRE': return 'Solo Pre';
      case 'POST': return 'Solo Post';
      case 'BOTH': return 'Pre + Post';
      default: return null;
    }
  };

  return (
    <div className="space-y-8 font-sans relative">
      
      {/* --- MODALE PAGAMENTO --- */}
      {activeModal.type === 'PAYMENT' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard className="text-green-600"/> Registra Pagamento
                </h3>
                <p className="text-sm text-gray-500 mb-4">Inserisci l'importo ricevuto. Verrà sommato al totale già pagato.</p>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const val = parseFloat((e.target as any).amount.value);
                    if (val) handlePaymentSubmit(val);
                }}>
                    <input name="amount" type="number" step="0.01" placeholder="Importo €" className="w-full border p-3 rounded-lg text-lg font-bold mb-4 focus:ring-2 ring-green-500 outline-none" autoFocus />
                    <div className="flex gap-2">
                        <button type="button" onClick={closeModal} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold">Annulla</button>
                        <button type="submit" disabled={loadingAction} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                            {loadingAction ? '...' : 'Conferma'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- MODALE EDIT --- */}
      {activeModal.type === 'EDIT' && activeModal.data && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Edit className="text-blue-600"/> Modifica Iscrizione
                </h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const price = parseFloat((e.target as any).price.value);
                    const camp = (e.target as any).camp.value;
                    handleEditSubmit(price, camp);
                }}>
                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Campo Estivo</label>
                            <select name="camp" defaultValue={activeModal.data.campId} className="w-full border p-2 rounded-lg bg-gray-50">
                                {camps?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Override Prezzo Totale (€)</label>
                            <input name="price" type="number" step="0.01" defaultValue={activeModal.data.price} className="w-full border p-2 rounded-lg font-mono font-bold" />
                            <p className="text-[10px] text-orange-500 mt-1">Attenzione: Disabilita il calcolo automatico.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={closeModal} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold">Annulla</button>
                        <button type="submit" disabled={loadingAction} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                            {loadingAction ? '...' : 'Salva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- KPI --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* KPI CARDS (Codice identico a prima, ometto per brevità ma è incluso) */}
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><CreditCard size={20}/></div>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Incasso</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">€ {stats.totalRevenue.toLocaleString()}</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Potenziale: <span className="text-gray-900 font-bold">€ {stats.totalPotential.toLocaleString()}</span></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Users size={20}/></div>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Bambini</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.uniqueChildren}</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Attivi nel filtro</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Calendar size={20}/></div>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Settimane</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{stats.weeksSold}</div>
          <div className="text-sm text-gray-500 font-medium mt-1">{filters.weekDate !== 'ALL' ? 'Prenotazioni nel periodo' : 'Totale vendute'}</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg"><FileText size={20}/></div>
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ordini</span>
          </div>
          <div className="text-3xl font-extrabold text-gray-900">{filteredData.length}</div>
          <div className="text-sm text-gray-500 font-medium mt-1">Iscrizioni trovate</div>
        </div>
      </div>

      {/* --- BARRA FILTRI --- */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto flex-1">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Cerca ID, Bambino, Genitore..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <select value={filters.campId} onChange={e => setFilters({...filters, campId: e.target.value, weekDate: 'ALL'})} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="ALL">Tutti i Campi</option>
                {camps?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select value={filters.weekDate} onChange={e => setFilters({...filters, weekDate: e.target.value})} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="ALL">Tutte le Settimane</option>
                {uniqueWeeksOptions.map((w: any) => <option key={w.value} value={w.value}>{w.label}</option>)}
            </select>
            <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="ALL">Tutti gli Stati</option>
                <option value="TO_PAY">Da Saldare</option>
                <option value="PAID">Saldati</option>
            </select>
        </div>
        {(filters.campId !== "ALL" || filters.weekDate !== "ALL" || filters.status !== "ALL" || searchTerm) && (
             <button onClick={resetFilters} className="text-red-600 text-sm font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100">Resetta Filtri</button>
        )}
      </div>

      {/* --- TABELLA --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                    <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">ID / Data</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Bambino</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider">Genitore</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider text-center">Sett.</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider text-right">Totale</th>
                    <th className="p-4 font-bold text-gray-700 uppercase text-xs tracking-wider text-center">Stato</th>
                    <th className="p-4"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredData.map(enrollment => {
                    const isPaid = ((enrollment.pagato || 0) + 0.1) >= (enrollment.prezzo_totale || 0);
                    const isExpanded = expandedRows.has(enrollment.id);

                    return (
                        <React.Fragment key={enrollment.id}>
                            <tr onClick={() => toggleRow(enrollment.id)} className="cursor-pointer hover:bg-blue-50/50 transition-colors group">
                                <td className="p-4 align-top">
                                    <div className="font-bold text-gray-800">{new Date(enrollment.created_at).toLocaleDateString()}</div>
                                    <div className="text-xs text-gray-500 font-mono mt-0.5">#{enrollment.id.slice(0,8)}</div>
                                </td>
                                <td className="p-4 align-top">
                                    <div className="font-bold text-blue-900 text-base">{enrollment.children?.nome} {enrollment.children?.cognome}</div>
                                    <div className="text-xs font-medium text-gray-600 mt-1 flex items-center gap-1"><Calendar size={12}/> {enrollment.camps?.nome}</div>
                                </td>
                                <td className="p-4 align-top">
                                    {enrollment.parent ? (
                                        <div>
                                            <div className="font-bold text-gray-800 flex items-center gap-1"><User size={14} className="text-gray-400"/> {enrollment.parent.nome} {enrollment.parent.cognome}</div>
                                            <div className="flex flex-col gap-0.5 mt-1">
                                                {enrollment.parent.email && <div className="text-xs text-gray-500 flex items-center gap-1 truncate max-w-[180px]" title={enrollment.parent.email}><Mail size={10}/> {enrollment.parent.email}</div>}
                                                {enrollment.parent.telefono && <div className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10}/> {enrollment.parent.telefono}</div>}
                                            </div>
                                        </div>
                                    ) : <span className="text-xs text-gray-400 italic">Dati non disp.</span>}
                                </td>
                                <td className="p-4 align-top text-center">
                                    <span className="inline-flex items-center justify-center bg-gray-100 text-gray-800 font-bold px-2.5 py-1 rounded-md text-sm border border-gray-200">{enrollment.enrollment_weeks?.length || 0}</span>
                                </td>
                                <td className="p-4 align-top text-right">
                                    <div className="font-extrabold text-gray-900 text-base">€ {enrollment.prezzo_totale}</div>
                                    {!isPaid && <div className="text-xs text-red-600 font-bold mt-1 bg-red-50 inline-block px-1.5 py-0.5 rounded">Mancano: € {(enrollment.prezzo_totale - enrollment.pagato).toFixed(2)}</div>}
                                </td>
                                <td className="p-4 align-top text-center">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${isPaid ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{isPaid ? 'Saldato' : 'Da Saldare'}</span>
                                </td>
                                <td className="p-4 align-top text-right">
                                    <div className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 transition-colors">
                                        {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                    </div>
                                </td>
                            </tr>

                            {/* RIGA DETTAGLI */}
                            {isExpanded && (
                                <tr className="bg-gray-50 border-t border-gray-200 shadow-inner">
                                    <td colSpan={7} className="p-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            
                                            {/* 1. SETTIMANE */}
                                            <div className="lg:col-span-1">
                                                <h4 className="text-xs font-extrabold text-gray-500 uppercase mb-3 flex items-center gap-2 tracking-wider">
                                                    <Calendar size={16} className="text-blue-600"/> Dettaglio Settimane
                                                </h4>
                                                <div className="space-y-2">
                                                    {enrollment.enrollment_weeks?.map((ew: any) => (
                                                        <div key={ew.id} className="flex justify-between items-center bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
                                                            <div>
                                                                <div className="font-bold text-gray-800 text-sm mb-1">{ew.camp_weeks?.label || "Settimana"}</div>
                                                                <div className="text-xs text-gray-500 mb-2">
                                                                    {new Date(ew.camp_weeks?.data_inizio).toLocaleDateString()} - {new Date(ew.camp_weeks?.data_fine).toLocaleDateString()}
                                                                </div>
                                                                <div className="flex gap-2 items-center flex-wrap">
                                                                    <span className={`inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${ew.type === 'FULL' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                                                        {ew.type === 'FULL' ? <Sun size={10}/> : <Moon size={10}/>}
                                                                        {ew.type === 'FULL' ? 'Intera' : 'Mezza'}
                                                                    </span>
                                                                    {ew.pre_post && ew.pre_post !== 'NONE' && (
                                                                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                                                                            <Clock size={10}/> {getPrePostLabel(ew.pre_post)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-bold text-gray-900 text-sm">€{ew.computed_price}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* 2. MEMBERSHIP / INFO */}
                                            <div className="lg:col-span-1 space-y-4">
                                                <h4 className="text-xs font-extrabold text-gray-500 uppercase mb-3 flex items-center gap-2 tracking-wider">
                                                    <AlertCircle size={16} className="text-orange-600"/> Stato & Sconti
                                                </h4>
                                                {enrollment.camps?.membership_type === 'OPTIONAL' && (
                                                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-bold text-gray-700">Tesseramento Facoltativo</span>
                                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded border border-purple-200">Optional</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mb-3">Verifica requisiti per lo sconto.</p>
                                                        <button 
                                                            onClick={() => setActiveModal({ type: 'MEMBERSHIP', enrollmentId: enrollment.id })}
                                                            className="w-full py-2 border-2 border-dashed border-purple-300 text-purple-700 rounded-lg font-bold text-xs hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <CheckCircle size={14}/> Verifica e Applica Sconto
                                                        </button>
                                                    </div>
                                                )}
                                                {enrollment.camps?.membership_type !== 'OPTIONAL' && (
                                                    <div className="p-4 rounded-lg border border-dashed border-gray-200 text-center text-xs text-gray-400 italic">
                                                        Nessuna azione di tesseramento per questo campo.
                                                    </div>
                                                )}
                                            </div>

                                            {/* 3. AZIONI ADMIN */}
                                            <div className="lg:col-span-1">
                                                <h4 className="text-xs font-extrabold text-gray-500 uppercase mb-3 flex items-center gap-2 tracking-wider">
                                                    <FileText size={16} className="text-blue-600"/> Gestione Amministrativa
                                                </h4>
                                                <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm space-y-3">
                                                    <button 
                                                        onClick={() => setActiveModal({ type: 'EDIT', enrollmentId: enrollment.id, data: { price: enrollment.prezzo_totale, campId: enrollment.camps?.id } })}
                                                        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all group"
                                                    >
                                                        <div className="text-left">
                                                            <div className="font-bold text-gray-800 text-sm">Modifica Iscrizione</div>
                                                            <div className="text-[10px] text-gray-400">Prezzo manuale, cambio campo</div>
                                                        </div>
                                                        <Edit size={18} className="text-gray-400 group-hover:text-blue-600"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => setActiveModal({ type: 'PAYMENT', enrollmentId: enrollment.id })}
                                                        className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-all group"
                                                    >
                                                        <div className="text-left">
                                                            <div className="font-bold text-green-900 text-sm">Registra Pagamento</div>
                                                            <div className="text-[10px] text-green-700/70">Aggiungi bonifico o contanti</div>
                                                        </div>
                                                        <PlusCircle size={18} className="text-green-600"/>
                                                    </button>
                                                    <div className="border-t border-gray-100 my-2 pt-2">
                                                        <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Prezzo Totale:</span><span className="font-bold">€ {enrollment.prezzo_totale}</span></div>
                                                        <div className="flex justify-between items-center text-sm"><span className="text-gray-500">Già Pagato:</span><span className="font-bold text-green-600">€ {enrollment.pagato}</span></div>
                                                        <div className="flex justify-between items-center text-lg mt-1"><span className="font-bold text-gray-700">Da Pagare:</span><span className={`font-extrabold ${!isPaid ? 'text-red-600' : 'text-gray-400'}`}>€ {(enrollment.prezzo_totale - enrollment.pagato).toFixed(2)}</span></div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    );
                })}
            </tbody>
        </table>
        {filteredData.length === 0 && <div className="p-12 text-center text-gray-500 font-medium bg-gray-50">Nessuna iscrizione trovata con i filtri attuali.</div>}
      </div>
    </div>
  );
}