"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FolderPlus, Download, Users, Loader2 } from "lucide-react";
import { pdf } from '@react-pdf/renderer';

import { registerPayment, updateEnrollmentDetails, deleteEnrollment } from "../actions";
import { PresenzePDF } from '../../components/PresenzePDF'; 

import { ContattiPDF } from './components/ContattiPDF';
import { DashboardStats } from './components/DashboardStats';
import { EnrollmentTable, EnrollmentCards } from './components/EnrollmentViews';
import { ChildModal, ParentModal, PaymentModal, EditModal, DeleteModal } from './components/Modals';
import { WizardModal } from './components/WizardModal';

type DashboardProps = {
  enrollments: any[];
  camps: any[];
  weeks: any[]; 
  profiles: any[];
  childrenData: any[]; // <-- AGGIUNTO
};

export default function AdminDashboardClient({ enrollments, camps, weeks, profiles, childrenData }: DashboardProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loadingAction, setLoadingAction] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const [activeModal, setActiveModal] = useState<{
    type: 'PAYMENT' | 'EDIT' | 'CHILD' | 'PARENT' | 'DELETE' | 'WIZARD' | null,
    enrollmentId: string | null,
  }>({ type: null, enrollmentId: null });

  const [filters, setFilters] = useState({ campId: "ALL", weekDate: "ALL", status: "ALL", prePost: "ALL" });
  const [editData, setEditData] = useState({ price: 0, campId: "", weeks: [] as any[] });

  // --- 1. ARRICCHIMENTO DATI E CALCOLI PRINCIPALI ---
  const enrichedEnrollments = useMemo(() => {
    if (!enrollments) return [];
    return enrollments.map(enrollment => {
      const child = enrollment.children;
      const parentProfile = profiles?.find(p => p.id === child?.parent_id);
      const hasMedicalIssues = Array.isArray(child?.intolleranze) && child.intolleranze.length > 0;
      let age = null;
      if (child?.data_nascita) {
        const birthDate = new Date(child.data_nascita);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      }
      return { ...enrollment, parent: parentProfile, hasMedicalIssues, age };
    });
  }, [enrollments, profiles]);

  const uniqueWeeksOptions = useMemo(() => {
    const optionsMap = new Map();
    enrichedEnrollments.forEach(enrollment => {
      if (filters.campId !== "ALL" && enrollment.camps?.id !== filters.campId) return;
      if (enrollment.enrollment_weeks && Array.isArray(enrollment.enrollment_weeks)) {
        enrollment.enrollment_weeks.forEach((ew: any) => {
            const rawDate = ew.camp_weeks?.data_inizio;
            if (rawDate) {
                const dateObj = new Date(rawDate);
                const dateKey = dateObj.toISOString().split('T')[0];
                const label = ew.camp_weeks?.label;
                if (!optionsMap.has(dateKey)) {
                    optionsMap.set(dateKey, {
                        value: dateKey,
                        label: `${label} (${dateObj.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })})`,
                        fullDate: dateObj, fullLabel: label
                    });
                }
            }
        });
      }
    });
    return Array.from(optionsMap.values()).sort((a: any, b: any) => a.value.localeCompare(b.value));
  }, [enrichedEnrollments, filters.campId]);

  const filteredData = useMemo(() => {
    return enrichedEnrollments.filter((e) => {
      const searchFields = [
        e.id, e.children?.nome, e.children?.cognome, e.children?.codice_fiscale,
        e.parent?.nome, e.parent?.cognome, e.parent?.email, e.camps?.nome,
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchesSearch = searchTerm === '' || searchFields.includes(searchTerm.toLowerCase());
      const matchesCamp = filters.campId === "ALL" || e.camps?.id === filters.campId;
      const matchesWeek = filters.weekDate === "ALL" || (e.enrollment_weeks && e.enrollment_weeks.some((ew: any) => {
            const rawDate = ew.camp_weeks?.data_inizio;
            if (!rawDate) return false;
            return new Date(rawDate).toISOString().split('T')[0] === filters.weekDate;
        }));
      
      const pagato = e.pagato || 0; const totale = e.prezzo_totale || 0;
      const isPaid = (pagato + 0.1) >= totale;
      const matchesStatus = filters.status === "ALL" || (filters.status === "PAID" && isPaid) || (filters.status === "TO_PAY" && !isPaid);
      const matchesPrePost = filters.prePost === "ALL" || (e.enrollment_weeks && e.enrollment_weeks.some((ew: any) => {
            if (filters.prePost === "ANY_EXTRA") return ['PRE', 'POST', 'BOTH'].includes(ew.pre_post);
            if (filters.prePost === "PRE") return ['PRE', 'BOTH'].includes(ew.pre_post);
            if (filters.prePost === "POST") return ['POST', 'BOTH'].includes(ew.pre_post);
            return false;
        }));

      return matchesSearch && matchesCamp && matchesWeek && matchesStatus && matchesPrePost;
    });
  }, [enrichedEnrollments, searchTerm, filters]);

  // --- 2. GESTIONE STATI MODALI ---
  const selectedEnrollment = activeModal.enrollmentId ? enrichedEnrollments.find(e => e.id === activeModal.enrollmentId) : null;
  const closeModal = () => setActiveModal({ type: null, enrollmentId: null });

  const parentChildren = useMemo(() => {
    if (activeModal.type !== 'PARENT' || !selectedEnrollment) return [];
    const parentId = selectedEnrollment.children?.parent_id;
    if (!parentId) return [];
    const allEnrollmentsForParent = enrichedEnrollments.filter(e => e.children?.parent_id === parentId);
    const uniqueChildrenMap = new Map();
    allEnrollmentsForParent.forEach(e => {
      const childId = e.children?.id;
      if (!childId) return;
      if (!uniqueChildrenMap.has(childId)) { uniqueChildrenMap.set(childId, { child: e.children, camps: new Set([e.camps?.nome]) }); } 
      else { uniqueChildrenMap.get(childId).camps.add(e.camps?.nome); }
    });
    return Array.from(uniqueChildrenMap.values()).map((item: any) => ({ child: item.child, campNames: Array.from(item.camps).join(", ") }));
  }, [activeModal.type, activeModal.enrollmentId, enrichedEnrollments, selectedEnrollment]);

  // --- 3. GESTIONE SERVER ACTIONS ---
  const handlePaymentSubmit = async (amount: number) => {
    if (!activeModal.enrollmentId) return;
    setLoadingAction(true);
    const res = await registerPayment(activeModal.enrollmentId, amount);
    setLoadingAction(false);
    if (res.success) { closeModal(); router.refresh(); } else { alert("Errore: " + res.error); }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingAction(true);
    const res = await updateEnrollmentDetails(activeModal.enrollmentId!, editData.price, editData.campId, editData.weeks);
    setLoadingAction(false);
    if (res.success) { closeModal(); router.refresh(); } else { alert("Errore: " + res.error); }
  };

  const handleDeleteSubmit = async () => {
    if (!activeModal.enrollmentId) return;
    setLoadingAction(true);
    try {
      const res = await deleteEnrollment(activeModal.enrollmentId);
      if (res.success) { closeModal(); router.refresh(); } else { alert("Errore durante l'eliminazione: " + res.error); }
    } catch (error) { alert("Errore di connessione."); } 
    finally { setLoadingAction(false); }
  };

  // --- 4. GESTIONE PDF ---
  const handleGenerateContattiPDF = async () => {
    if (filters.campId === "ALL") { alert("Seleziona un campo specifico prima di generare la lista contatti"); return; }
    setIsGeneratingPDF(true);
    try {
      const campInfo = camps.find(c => c.id === filters.campId);
      let currentData = enrichedEnrollments.filter(e => e.camps?.id === filters.campId);
      let titleSuffix = "";
      if (filters.weekDate !== "ALL") {
        currentData = currentData.filter(e => e.enrollment_weeks?.some((ew: any) => ew.camp_weeks?.data_inizio && new Date(ew.camp_weeks?.data_inizio).toISOString().split('T')[0] === filters.weekDate));
        const weekInfo = uniqueWeeksOptions.find((w: any) => w.value === filters.weekDate);
        if (weekInfo) titleSuffix = ` - ${weekInfo.fullLabel}`;
      }
      const rawData = currentData.map(e => ({
          bambino: `${e.children?.nome || ''} ${e.children?.cognome || ''}`.trim(),
          taglia: e.children?.taglia_maglietta || 'N/D', // <-- AGGIUNTA QUESTA RIGA
          genitore: `${e.parent?.nome || ''} ${e.parent?.cognome || ''}`.trim(),
          telefono: e.parent?.telefono || 'N/D',
          email: e.parent?.email || 'N/D'
      }));
      const uniqueData = Array.from(new Map(rawData.map(item => [item.bambino, item])).values()).sort((a, b) => a.bambino.localeCompare(b.bambino));
      const pdfTitle = `${campInfo?.nome || 'Campo'}${titleSuffix}`;
      const blob = await pdf(<ContattiPDF data={uniqueData} campName={pdfTitle} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url;
      link.download = `Contatti_${pdfTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    } catch (error) { alert("Errore durante la generazione del PDF dei contatti."); } 
    finally { setIsGeneratingPDF(false); }
  };

  const handleGeneratePDF = async () => {
    if (filters.campId === "ALL") { alert("Seleziona un campo specifico prima di generare il PDF"); return; }
    if (filters.weekDate === "ALL") { alert("Seleziona una settimana specifica prima di generare il PDF"); return; }
    setIsGeneratingPDF(true);
    try {
        const weekInfo = uniqueWeeksOptions.find((w: any) => w.value === filters.weekDate);
        const campInfo = camps.find(c => c.id === filters.campId);
        const childrenData = filteredData
          .filter(e => e.enrollment_weeks?.some((ew: any) => ew.camp_weeks?.data_inizio && new Date(ew.camp_weeks?.data_inizio).toISOString().split('T')[0] === filters.weekDate))
          .map(e => ({
              nome: e.children?.nome || '', cognome: e.children?.cognome || '', eta: e.age || 0,
              genitore: `${e.parent?.nome || ''} ${e.parent?.cognome || ''}`.trim(), telefono: e.parent?.telefono || '',
              intolleranze: Array.isArray(e.children?.intolleranze) ? e.children?.intolleranze.join(', ') : '',
              taglia: e.children?.taglia_maglietta || ''
          }))
          .sort((a, b) => a.eta !== b.eta ? a.eta - b.eta : a.cognome.localeCompare(b.cognome));

        const pdfData = {
          campName: campInfo?.nome || 'Campo', weekLabel: weekInfo?.fullLabel || 'Settimana',
          weekDates: {
            start: weekInfo?.fullDate ? new Date(weekInfo.fullDate).toLocaleDateString('it-IT') : '',
            end: weekInfo?.fullDate ? new Date(new Date(weekInfo.fullDate).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT') : ''
          },
          children: childrenData
        };

        const blob = await pdf(<PresenzePDF data={pdfData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url;
        link.download = `Presenze_${pdfData.campName.replace(/\s+/g, '_')}_${pdfData.weekLabel}.pdf`;
        document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    } catch (error) { alert("Errore durante la generazione del PDF."); } 
    finally { setIsGeneratingPDF(false); }
  };

  const resetFilters = () => {
    setFilters({ campId: "ALL", weekDate: "ALL", status: "ALL", prePost: "ALL" });
    setSearchTerm("");
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  return (
    <div className="space-y-6 font-sans relative pb-20">
      
      {/* STATISTICHE AVANZATE */}
      <DashboardStats filteredData={filteredData} isWeekFiltered={filters.weekDate !== "ALL"} />

      {/* BARRA FILTRI */}
      <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200">
         <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
            <div className="relative w-full xl:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Cerca bambino, genitore, email, CF..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={16} /></button>
                )}
            </div>
            <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
                <select value={filters.campId} onChange={e => setFilters({...filters, campId: e.target.value, weekDate: 'ALL'})} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm w-full md:w-auto text-gray-900 font-medium">
                    <option value="ALL">Tutti i Campi</option>
                    {camps?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <select value={filters.weekDate} onChange={e => setFilters({...filters, weekDate: e.target.value})} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm w-full md:w-auto text-gray-900 font-medium">
                    <option value="ALL">Tutte le Settimane</option>
                    {uniqueWeeksOptions.map((w: any) => <option key={w.value} value={w.value}>{w.label}</option>)}
                </select>
                <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm w-full md:w-auto text-gray-900 font-medium">
                    <option value="ALL">Tutti gli Stati</option><option value="TO_PAY">Da Saldare</option><option value="PAID">Saldati</option>
                </select>
                <select value={filters.prePost} onChange={e => setFilters({...filters, prePost: e.target.value})} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm w-full md:w-auto text-gray-900 font-medium">
                    <option value="ALL">Tutti i Servizi</option><option value="ANY_EXTRA">Con Pre o Post</option><option value="PRE">Solo con Pre</option><option value="POST">Solo con Post</option>
                </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActiveModal({ type: 'WIZARD', enrollmentId: null })} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white text-sm font-bold rounded-lg shadow-md transition-all">
                <FolderPlus size={16} /><span className="hidden md:inline">Iscrizione Diretta Admin</span>
              </button>

              {filters.campId !== "ALL" && filters.weekDate !== "ALL" && (
                <button onClick={handleGeneratePDF} disabled={isGeneratingPDF} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg border border-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  {isGeneratingPDF ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} <span>PDF Presenze</span>
                </button>
              )}
              {filters.campId !== "ALL" && (
                <button onClick={handleGenerateContattiPDF} disabled={isGeneratingPDF} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg border border-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isGeneratingPDF ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />} <span>PDF Contatti</span>
                </button>
              )}
              {(filters.campId !== "ALL" || filters.weekDate !== "ALL" || filters.status !== "ALL" || filters.prePost !== "ALL" || searchTerm) && (
                  <button onClick={resetFilters} className="flex items-center gap-2 px-4 py-2.5 text-red-600 text-sm font-bold hover:bg-red-50 rounded-lg border border-red-200 transition-colors">
                    <X size={16} /> Resetta
                  </button>
              )}
            </div>
         </div>

         {/* BADGE FILTRI ATTIVI */}
         {(filters.campId !== "ALL" || filters.weekDate !== "ALL" || filters.status !== "ALL" || filters.prePost !== "ALL" || searchTerm) && (
           <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
             <span className="text-xs text-gray-500 font-medium">Filtri attivi:</span>
             {filters.campId !== "ALL" && (<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Campo: {camps.find(c => c.id === filters.campId)?.nome}<button onClick={() => setFilters({...filters, campId: "ALL"})}><X size={12} /></button></span>)}
             {filters.weekDate !== "ALL" && (<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Settimana<button onClick={() => setFilters({...filters, weekDate: "ALL"})}><X size={12} /></button></span>)}
             {filters.status !== "ALL" && (<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Stato: {filters.status === "PAID" ? "Saldati" : "Da Saldare"}<button onClick={() => setFilters({...filters, status: "ALL"})}><X size={12} /></button></span>)}
             {filters.prePost !== "ALL" && (<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">Servizio: {filters.prePost === "ANY_EXTRA" ? "Pre/Post" : filters.prePost}<button onClick={() => setFilters({...filters, prePost: "ALL"})}><X size={12} /></button></span>)}
             {searchTerm && (<span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Ricerca: &quot;{searchTerm}&quot;<button onClick={() => setSearchTerm('')}><X size={12} /></button></span>)}
           </div>
         )}
      </div>

      {/* VISTA DESKTOP E MOBILE */}
      <EnrollmentTable 
        data={filteredData} expandedRows={expandedRows} onToggleRow={toggleRow}
        onOpenChild={(e: any) => setActiveModal({ type: 'CHILD', enrollmentId: e.id })}
        onOpenParent={(e: any) => setActiveModal({ type: 'PARENT', enrollmentId: e.id })}
        onPay={(e: any) => setActiveModal({ type: 'PAYMENT', enrollmentId: e.id })}
        onDelete={(e: any) => setActiveModal({ type: 'DELETE', enrollmentId: e.id })}
        onEdit={(e: any) => {
            const mappedWeeks = (e.enrollment_weeks || []).map((ew: any) => ({ camp_week_id: ew.camp_week_id || ew.camp_weeks?.id, type: ew.type, pre_post: ew.pre_post, computed_price: ew.computed_price || 75 }));
            setEditData({ price: e.prezzo_totale, campId: e.camps?.id, weeks: mappedWeeks });
            setActiveModal({ type: 'EDIT', enrollmentId: e.id });
        }}
      />
      <EnrollmentCards 
        data={filteredData} expandedRows={expandedRows} onToggleRow={toggleRow}
        onOpenChild={(e: any) => setActiveModal({ type: 'CHILD', enrollmentId: e.id })}
        onOpenParent={(e: any) => setActiveModal({ type: 'PARENT', enrollmentId: e.id })}
        onPay={(e: any) => setActiveModal({ type: 'PAYMENT', enrollmentId: e.id })}
        onDelete={(e: any) => setActiveModal({ type: 'DELETE', enrollmentId: e.id })}
        onEdit={(e: any) => {
            const mappedWeeks = (e.enrollment_weeks || []).map((ew: any) => ({ camp_week_id: ew.camp_week_id || ew.camp_weeks?.id, type: ew.type, pre_post: ew.pre_post, computed_price: ew.computed_price || 75 }));
            setEditData({ price: e.prezzo_totale, campId: e.camps?.id, weeks: mappedWeeks });
            setActiveModal({ type: 'EDIT', enrollmentId: e.id });
        }}
      />

      {filteredData.length === 0 && <div className="p-8 text-center text-gray-600 font-medium bg-white rounded-xl border border-dashed border-gray-300">Nessuna iscrizione trovata.</div>}

      {/* RENDER MODALI */}
      {activeModal.type === 'CHILD' && <ChildModal child={selectedEnrollment?.children} parent={selectedEnrollment?.parent} onClose={closeModal} />}
      {activeModal.type === 'PARENT' && <ParentModal parent={selectedEnrollment?.parent} childrenList={parentChildren} onClose={closeModal} />}
      {activeModal.type === 'PAYMENT' && <PaymentModal loading={loadingAction} onClose={closeModal} onSubmit={handlePaymentSubmit} />}
      {activeModal.type === 'EDIT' && <EditModal editData={editData} setEditData={setEditData} camps={camps} weeks={weeks} loading={loadingAction} onClose={closeModal} onSubmit={handleEditSubmit} />}
      {activeModal.type === 'DELETE' && <DeleteModal loading={loadingAction} onClose={closeModal} onSubmit={handleDeleteSubmit} />}
{activeModal.type === 'WIZARD' && (
        <WizardModal 
            profiles={profiles} 
            camps={camps} 
            weeks={weeks} 
            childrenData={childrenData} 
            onClose={closeModal} 
            onSuccess={() => { closeModal(); router.refresh(); }} 
        />
      )}
    </div>
  );
}