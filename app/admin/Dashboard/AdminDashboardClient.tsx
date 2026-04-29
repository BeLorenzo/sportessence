"use client";

import React, { useState, useMemo, Children } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, CreditCard, Calendar, Search, 
  FileText, ChevronDown, ChevronUp, Phone, Mail, User, 
  Edit, CheckCircle, PlusCircle, Tag, TrendingUp, Package,
  Baby, Shirt, AlertTriangle, X,
  MapPin, Download, Loader2, Trash2
} from "lucide-react";
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PresenzePDF } from '../../components/PresenzePDF'; 
import { registerPayment, updateEnrollmentDetails, deleteEnrollment } from "../actions";

// --- TIPI ---
type DashboardProps = {
  enrollments: any[];
  camps: any[];
  weeks: any[]; 
  profiles: any[];
};

const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontSize: 10 },
  title: { fontSize: 16, marginBottom: 20, fontWeight: 'bold', textAlign: 'center', color: '#1e3a8a' },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#d1d5db', borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { width: '25%', borderStyle: 'solid', borderColor: '#d1d5db', borderBottomWidth: 1, borderRightWidth: 1, backgroundColor: '#f3f4f6', padding: 5 },
  tableCol: { width: '25%', borderStyle: 'solid', borderColor: '#d1d5db', borderBottomWidth: 1, borderRightWidth: 1, padding: 5 },
  tableCellHeader: { margin: 2, fontSize: 10, fontWeight: 'bold', color: '#374151' },
  tableCell: { margin: 2, fontSize: 10, color: '#4b5563' }
});

const ContattiPDF = ({ data, campName }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.title}>Lista Contatti - {campName}</Text>
      <View style={pdfStyles.table}>
        {/* INTESTAZIONI */}
        <View style={pdfStyles.tableRow}>
          <View style={[pdfStyles.tableColHeader, { width: '25%' }]}><Text style={pdfStyles.tableCellHeader}>Genitore</Text></View>
          <View style={[pdfStyles.tableColHeader, { width: '25%' }]}><Text style={pdfStyles.tableCellHeader}>Bambino</Text></View>
          <View style={[pdfStyles.tableColHeader, { width: '15%' }]}><Text style={pdfStyles.tableCellHeader}>Telefono</Text></View>
          <View style={[pdfStyles.tableColHeader, { width: '35%' }]}><Text style={pdfStyles.tableCellHeader}>Email</Text></View>
        </View>
        {/* RIGHE DATI */}
        {data.map((row, i) => (
          <View style={pdfStyles.tableRow} key={i} wrap={false}>
            <View style={[pdfStyles.tableCol, { width: '25%' }]}><Text style={pdfStyles.tableCell}>{row.genitore}</Text></View>
            <View style={[pdfStyles.tableCol, { width: '25%' }]}><Text style={pdfStyles.tableCell}>{row.bambino}</Text></View>
            <View style={[pdfStyles.tableCol, { width: '15%' }]}><Text style={pdfStyles.tableCell}>{row.telefono}</Text></View>
            <View style={[pdfStyles.tableCol, { width: '35%' }]}><Text style={pdfStyles.tableCell}>{row.email}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default function AdminDashboardClient({ enrollments, camps, profiles }: DashboardProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loadingAction, setLoadingAction] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [allergiesExpanded, setAllergiesExpanded] = useState(false);

  // --- STATI MODALI ---
  const [activeModal, setActiveModal] = useState<{
    type: 'PAYMENT' | 'EDIT' | 'CHILD' | 'PARENT' | 'DELETE' | null,
    enrollmentId: string | null,
    data?: any
  }>({ type: null, enrollmentId: null });

  // --- STATI FILTRI ---
  const [filters, setFilters] = useState({
    campId: "ALL",
    weekDate: "ALL", 
    status: "ALL",
    prePost: "ALL",
  });


  // --- 1. ARRICCHIMENTO DATI ---
  const enrichedEnrollments = useMemo(() => {
    if (!enrollments) return [];
    return enrollments.map(enrollment => {
      const child = enrollment.children;
      const parentId = child?.parent_id;
      const parentProfile = profiles?.find(p => p.id === parentId);

      const hasMedicalIssues = Array.isArray(child?.intolleranze) && child.intolleranze.length > 0;

      let age = null;
      if (child?.data_nascita) {
        const birthDate = new Date(child.data_nascita);
        const today = new Date();
        age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }

      return { ...enrollment, parent: parentProfile, hasMedicalIssues, age };
    });
  }, [enrollments, profiles]);

  // --- 2. OPZIONI FILTRO SETTIMANE ---
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
                        fullDate: dateObj,
                        fullLabel: label
                    });
                }
            }
        });
      }
    });
    return Array.from(optionsMap.values()).sort((a: any, b: any) => a.value.localeCompare(b.value));
  }, [enrichedEnrollments, filters.campId]);

  // --- 3. FILTRAGGIO ---
  const filteredData = useMemo(() => {
    return enrichedEnrollments.filter((e) => {
      const searchFields = [
        e.id,
        e.children?.nome,
        e.children?.cognome,
        e.children?.codice_fiscale,
        e.parent?.nome,
        e.parent?.cognome,
        e.parent?.email,
        e.camps?.nome,
      ].filter(Boolean).join(' ').toLowerCase();
      
      const matchesSearch = searchTerm === '' || searchFields.includes(searchTerm.toLowerCase());
      const matchesCamp = filters.campId === "ALL" || e.camps?.id === filters.campId;
      
      const matchesWeek = filters.weekDate === "ALL" || 
        (e.enrollment_weeks && e.enrollment_weeks.some((ew: any) => {
            const rawDate = ew.camp_weeks?.data_inizio;
            if (!rawDate) return false;
            return new Date(rawDate).toISOString().split('T')[0] === filters.weekDate;
        }));
      
      const pagato = e.pagato || 0;
      const totale = e.prezzo_totale || 0;
      const isPaid = (pagato + 0.1) >= totale;
      
      const matchesStatus = filters.status === "ALL" || 
        (filters.status === "PAID" && isPaid) || 
        (filters.status === "TO_PAY" && !isPaid);

      const matchesPrePost = filters.prePost === "ALL" || 
        (e.enrollment_weeks && e.enrollment_weeks.some((ew: any) => {
            if (filters.prePost === "ANY_EXTRA") return ['PRE', 'POST', 'BOTH'].includes(ew.pre_post);
            if (filters.prePost === "PRE") return ['PRE', 'BOTH'].includes(ew.pre_post);
            if (filters.prePost === "POST") return ['POST', 'BOTH'].includes(ew.pre_post);
            return false;
        }));

      return matchesSearch && matchesCamp && matchesWeek && matchesStatus && matchesPrePost;
    });
  }, [enrichedEnrollments, searchTerm, filters]);

  // --- 4. STATISTICHE AVANZATE ---
  const stats = useMemo(() => {
    const totalRevenue = filteredData.reduce((acc, curr) => acc + (curr.pagato || 0), 0);
    const totalPotential = filteredData.reduce((acc, curr) => acc + (curr.prezzo_totale || 0), 0);
    const pendingAmount = totalPotential - totalRevenue;
    const uniqueChildren = new Set(filteredData.map(e => e.children?.id)).size;
    
    const weeksSold = filteredData.reduce((acc, curr) => {
      if (!curr.enrollment_weeks) return acc;
      if (filters.weekDate === "ALL") {
        return acc + curr.enrollment_weeks.length;
      } else {
        const matchingWeeks = curr.enrollment_weeks.filter((ew: any) => {
            const rawDate = ew.camp_weeks?.data_inizio;
            return rawDate && new Date(rawDate).toISOString().split('T')[0] === filters.weekDate;
        });
        return acc + matchingWeeks.length;
      }
    }, 0);

    const tshirtSizes: Record<string, number> = {};
    const allergiesList: { child: any; intolleranze: string[] }[] = [];

    filteredData.forEach(e => {
      const child = e.children;
      if (child) {
        if (child.taglia_maglietta) {
          tshirtSizes[child.taglia_maglietta] = (tshirtSizes[child.taglia_maglietta] || 0) + 1;
        }
        if (e.hasMedicalIssues && Array.isArray(child.intolleranze)) {
          // Evita duplicati se lo stesso bambino è in più righe
          const alreadyExists = allergiesList.some(item => item.child.id === child.id);
          if (!alreadyExists) {
             allergiesList.push({ child, intolleranze: child.intolleranze });
          }
        }
      }
    });

    let paidOrders = 0, unpaidOrders = 0;
    filteredData.forEach(e => {
      const isPaid = (e.pagato || 0) + 0.1 >= (e.prezzo_totale || 0);
      isPaid ? paidOrders++ : unpaidOrders++;
    });

    return { 
      totalRevenue, 
      totalPotential, 
      pendingAmount,
      uniqueChildren, 
      weeksSold, 
      tshirtSizes, 
      allergiesList, 
      allergiesCount: allergiesList.length,
      paidOrders,
      unpaidOrders
    };
  }, [filteredData, filters.weekDate]);

  // --- DATI PER MODALI (SPOSTATO QUI IN ALTO) ---
  const selectedEnrollment = activeModal.enrollmentId 
    ? enrichedEnrollments.find(e => e.id === activeModal.enrollmentId)
    : null;

  const parentChildren = useMemo(() => {
    if (activeModal.type !== 'PARENT' || !selectedEnrollment) return [];

    const parentId = selectedEnrollment.children?.parent_id;
    if (!parentId) return [];

    const allEnrollmentsForParent = enrichedEnrollments.filter(e => e.children?.parent_id === parentId);
    const uniqueChildrenMap = new Map();

    allEnrollmentsForParent.forEach(e => {
      const childId = e.children?.id;
      if (!childId) return;

      if (!uniqueChildrenMap.has(childId)) {
        uniqueChildrenMap.set(childId, {
          child: e.children,
          camps: new Set([e.camps?.nome])
        });
      } else {
        uniqueChildrenMap.get(childId).camps.add(e.camps?.nome);
      }
    });

    return Array.from(uniqueChildrenMap.values()).map((item: any) => ({
      child: item.child,
      campNames: Array.from(item.camps).join(", ")
    }));
  }, [activeModal.type, activeModal.enrollmentId, enrichedEnrollments, selectedEnrollment]);

  //PDF Contatti
  const handleGenerateContattiPDF = async () => {
    if (filters.campId === "ALL") {
      alert("Seleziona un campo specifico prima di generare la lista contatti");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const campInfo = camps.find(c => c.id === filters.campId);
      
      // Partiamo con tutti gli iscritti di quel campo
      let currentData = enrichedEnrollments.filter(e => e.camps?.id === filters.campId);
      let titleSuffix = "";

      // Se c'è una settimana selezionata, filtriamo ulteriormente
      if (filters.weekDate !== "ALL") {
        currentData = currentData.filter(e =>
          e.enrollment_weeks?.some((ew: any) => {
            const rawDate = ew.camp_weeks?.data_inizio;
            return rawDate && new Date(rawDate).toISOString().split('T')[0] === filters.weekDate;
          })
        );
        // Recuperiamo il nome della settimana per metterlo nel titolo del PDF
        const weekInfo = uniqueWeeksOptions.find((w: any) => w.value === filters.weekDate);
        if (weekInfo) {
           titleSuffix = ` - ${weekInfo.fullLabel}`;
        }
      }
      
      // Estraiamo solo i campi necessari
      const rawData = currentData.map(e => ({
          bambino: `${e.children?.nome || ''} ${e.children?.cognome || ''}`.trim(),
          genitore: `${e.parent?.nome || ''} ${e.parent?.cognome || ''}`.trim(),
          telefono: e.parent?.telefono || 'N/D',
          email: e.parent?.email || 'N/D'
      }));

      // Rimuoviamo i duplicati
      const uniqueData = Array.from(new Map(rawData.map(item => [item.bambino, item])).values())
        .sort((a, b) => a.bambino.localeCompare(b.bambino));

      const pdfTitle = `${campInfo?.nome || 'Campo'}${titleSuffix}`;

      const blob = await pdf(<ContattiPDF data={uniqueData} campName={pdfTitle} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Nome file dinamico, così non ti confondi se lo scarichi per tutto il campo o per una sola settimana
      link.download = `Contatti_${pdfTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Errore generazione PDF Contatti:", error);
      alert("Errore durante la generazione del PDF dei contatti.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };


  // --- FUNZIONE GENERAZIONE PDF PRESENZE ---
  const handleGeneratePDF = async () => {
    if (filters.campId === "ALL") {
      alert("Seleziona un campo specifico prima di generare il PDF");
      return;
    }
    if (filters.weekDate === "ALL") {
      alert("Seleziona una settimana specifica prima di generare il PDF");
      return;
    }

    setIsGeneratingPDF(true);

    try {
        const weekInfo = uniqueWeeksOptions.find((w: any) => w.value === filters.weekDate);
        const campInfo = camps.find(c => c.id === filters.campId);
        
        const childrenData = filteredData
          .filter(e => {
            return e.enrollment_weeks?.some((ew: any) => {
              const rawDate = ew.camp_weeks?.data_inizio;
              return rawDate && new Date(rawDate).toISOString().split('T')[0] === filters.weekDate;
            });
          })
          .map(e => {
            const child = e.children;
            const parent = e.parent;
            const birthDate = child?.data_nascita ? new Date(child.data_nascita) : null;
            const age = birthDate ? new Date().getFullYear() - birthDate.getFullYear() : 0;
            
            return {
              nome: child?.nome || '',
              cognome: child?.cognome || '',
              eta: age,
              genitore: `${parent?.nome || ''} ${parent?.cognome || ''}`.trim(),
              telefono: parent?.telefono || '',
              intolleranze: Array.isArray(child?.intolleranze) ? child.intolleranze.join(', ') : '',
              taglia: child?.taglia_maglietta || ''
            };
          })
          .sort((a, b) => {
            if (a.eta !== b.eta) return a.eta - b.eta;
            return a.cognome.localeCompare(b.cognome);
          });

        const pdfData = {
          campName: campInfo?.nome || 'Campo',
          weekLabel: weekInfo?.fullLabel || 'Settimana',
          weekDates: {
            start: weekInfo?.fullDate ? new Date(weekInfo.fullDate).toLocaleDateString('it-IT') : '',
            end: weekInfo?.fullDate ? new Date(new Date(weekInfo.fullDate).getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT') : ''
          },
          children: childrenData
        };

        const blob = await pdf(<PresenzePDF data={pdfData} />).toBlob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Presenze_${pdfData.campName.replace(/\s+/g, '_')}_${pdfData.weekLabel}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error("Errore generazione PDF:", error);
        alert("Errore durante la generazione del PDF.");
    } finally {
        setIsGeneratingPDF(false);
    }
  };

  // --- HANDLERS ---
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

  const handleDeleteSubmit = async () => {
    if (!activeModal.enrollmentId) return;

    setLoadingAction(true);
    try {
      const res = await deleteEnrollment(activeModal.enrollmentId);
      
      if (res.success) {
        closeModal();
        router.refresh();
      } else {
        alert("Errore durante l'eliminazione: " + res.error);
      }
    } catch (error) {
      console.error("Errore delete:", error);
      alert("Errore di connessione.");
    } finally {
      setLoadingAction(false);
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      newSet.has(id) ? newSet.delete(id) : newSet.add(id);
      return newSet;
    });
  };

  const resetFilters = () => {
    setFilters({ campId: "ALL", weekDate: "ALL", status: "ALL", prePost: "ALL" });
    setSearchTerm("");
  };

  const openChildModal = (enrollment: any) => {
    setActiveModal({ type: 'CHILD', enrollmentId: enrollment.id, data: enrollment });
  };

  const openParentModal = (enrollment: any) => {
    setActiveModal({ type: 'PARENT', enrollmentId: enrollment.id, data: enrollment });
  };

  // --- COMPONENTI INTERNI (UI) ---
  
  const StatCard = ({ icon: Icon, label, value, subtext, color = "blue" }: any) => {
    const colorClasses: any = {
      blue: "bg-blue-50 text-blue-700",
      green: "bg-emerald-50 text-emerald-700",
      purple: "bg-purple-50 text-purple-700",
      orange: "bg-orange-50 text-orange-700",
      red: "bg-red-50 text-red-700",
      teal: "bg-teal-50 text-teal-700",
      pink: "bg-pink-50 text-pink-700",
      amber: "bg-amber-50 text-amber-700",
    };

    return (
      <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <div className={`p-1.5 md:p-2 rounded-lg ${colorClasses[color]}`}>
            <Icon size={18} className="md:w-5 md:h-5" />
          </div>
          <span className="text-[10px] md:text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-gray-900">{value}</div>
        {subtext && <div className="text-[10px] md:text-xs text-gray-500 font-medium mt-1">{subtext}</div>}
      </div>
    );
  };

  const TShirtStats = ({ sizes }: { sizes: Record<string, number> }) => {
    const sizeOrder = ['4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL'];
    const sortedSizes = Object.entries(sizes).sort((a, b) => {
      const idxA = sizeOrder.indexOf(a[0]);
      const idxB = sizeOrder.indexOf(b[0]);
      if (idxA === -1 && idxB === -1) return a[0].localeCompare(b[0]);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    if (sortedSizes.length === 0) return null;

    return (
      <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 md:gap-3 mb-3">
          <div className="p-1.5 md:p-2 rounded-lg bg-pink-50 text-pink-700">
            <Shirt size={18} className="md:w-5 md:h-5" />
          </div>
          <span className="text-[10px] md:text-xs font-bold text-gray-600 uppercase tracking-wider">Magliette</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sortedSizes.map(([size, count]) => (
            <span key={size} className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800">
              {size}: {count}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const IntolerancesAlert = ({ list, count }: { list: { child: any; intolleranze: string[] }[]; count: number }) => {
    if (count === 0) return null;

    const displayLimit = allergiesExpanded ? list.length : 3;

    return (
      <div className="bg-amber-50 p-4 md:p-5 rounded-xl shadow-sm border border-amber-200 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 md:gap-3 mb-3">
          <div className="p-1.5 md:p-2 rounded-lg bg-amber-100 text-amber-700">
            <AlertTriangle size={18} className="md:w-5 md:h-5" />
          </div>
          <span className="text-[10px] md:text-xs font-bold text-amber-800 uppercase tracking-wider">
            Intolleranze ({count})
          </span>
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {list.slice(0, displayLimit).map(({ child, intolleranze }) => (
            <div key={child.id} className="text-[11px] text-amber-900 bg-amber-100/50 p-2 rounded">
              <span className="font-bold">{child.nome} {child.cognome}:</span>
              <span className="ml-1">{intolleranze.join(", ")}</span>
            </div>
          ))}
        </div>
        {list.length > 3 && (
          <button
            onClick={() => setAllergiesExpanded(!allergiesExpanded)}
            className="mt-3 w-full text-[11px] text-amber-700 font-bold hover:text-amber-900 flex items-center justify-center gap-1"
          >
            {allergiesExpanded ? (
              <>Mostra meno <ChevronUp size={14} /></>
            ) : (
              <>Mostra tutti ({list.length - 3} altri) <ChevronDown size={14} /></>
            )}
          </button>
        )}
      </div>
    );
  };

  const ChildDetailModal = ({ child, parent, onClose }: { child: any; parent: any; onClose: () => void }) => {
    if (!child) return null;

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return "Non specificata";
      return new Date(dateStr).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
    };

    const calculateAge = (dateStr?: string) => {
      if (!dateStr) return null;
      const birthDate = new Date(dateStr);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
    };

    const intolleranzeArray = Array.isArray(child.intolleranze) ? child.intolleranze : [];
    const hasIntolleranze = intolleranzeArray.length > 0;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full"><Baby size={28} /></div>
                <div>
                  <h2 className="text-xl font-bold">{child.nome} {child.cognome}</h2>
                  <p className="text-blue-100 text-sm">Dettaglio Bambino</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <FileText size={14} /> Informazioni Personali
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Codice Fiscale</span>
                  <span className="text-sm font-mono font-medium text-gray-900">{child.cf || "Non specificato"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Data di Nascita</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(child.data_nascita)}
                    {calculateAge(child.data_nascita) && <span className="text-gray-500 ml-1">({calculateAge(child.data_nascita)} anni)</span>}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Shirt size={14} /> Taglia Maglietta
              </h3>
              <div className="bg-pink-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Taglia richiesta:</span>
                  <span className="text-2xl font-bold text-pink-700">{child.taglia_maglietta || "Non specificata"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle size={14} /> Intolleranze / Allergie
              </h3>
              <div className={`rounded-xl p-4 ${hasIntolleranze ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
                {hasIntolleranze ? (
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {intolleranzeArray.map((item: string, idx: number) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : <p className="text-sm text-gray-500 italic">Nessuna intolleranza segnalata</p>}
              </div>
            </div>

            {parent && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                  <User size={14} /> Genitore / Tutore
                </h3>
                <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                  <div className="font-medium text-gray-900">{parent.nome} {parent.cognome}</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={14} />
                    <a href={`mailto:${parent.email}`} className="hover:text-blue-600 transition-colors">{parent.email}</a>
                  </div>
                  {parent.telefono && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} />
                      <a href={`tel:${parent.telefono}`} className="hover:text-blue-600 transition-colors">{parent.telefono}</a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button onClick={onClose} className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition-colors">
              Chiudi
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ParentDetailModal = ({ parent, children, onClose }: { parent: any; children: any[]; onClose: () => void }) => {
    if (!parent) return null;

    const hasAddress = parent.indirizzo_via || parent.indirizzo_civico || parent.indirizzo_paese || parent.indirizzo_cap;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-full"><User size={28} /></div>
                <div>
                  <h2 className="text-xl font-bold">{parent.nome} {parent.cognome}</h2>
                  <p className="text-emerald-100 text-sm">Dettaglio Genitore</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Mail size={14} /> Contatti
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <a href={`mailto:${parent.email}`} className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors">{parent.email}</a>
                </div>
                {parent.telefono && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} className="text-gray-400" />
                    <a href={`tel:${parent.telefono}`} className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors">{parent.telefono}</a>
                  </div>
                )}
                
                {hasAddress && (
                  <div className="flex items-start gap-3 pt-2 border-t border-gray-200 mt-2">
                    <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">
                        {parent.indirizzo_via} {parent.indirizzo_civico}
                      </div>
                      <div className="text-gray-600">
                        {parent.indirizzo_cap} {parent.indirizzo_paese}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <Baby size={14} /> Figli Iscritti ({children.length})
              </h3>
              <div className="space-y-2">
                {children.map(({ child, campNames }: any) => {
                  const childIntolleranze = Array.isArray(child.intolleranze) ? child.intolleranze : [];
                  const hasChildIntolleranze = childIntolleranze.length > 0;
                  
                  return (
                    <div key={child.id} className="bg-emerald-50 rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-gray-900">{child.nome} {child.cognome}</div>
                          <div className="text-xs text-gray-600 mt-1">{campNames}</div>
                        </div>
                        {child.taglia_maglietta && (
                          <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">{child.taglia_maglietta}</span>
                        )}
                      </div>
                      {hasChildIntolleranze && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-amber-700">
                          <AlertTriangle size={12} className="flex-shrink-0" />
                          <div className="flex flex-wrap gap-1">
                            {childIntolleranze.map((item: string, idx: number) => (
                              <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button onClick={onClose} className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition-colors">
              Chiudi
            </button>
          </div>
        </div>
      </div>
    );
  };

  const EnrollmentDetails = ({ enrollment }: { enrollment: any }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* COLONNA SINISTRA: RIEPILOGO SETTIMANE */}
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <h4 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Calendar size={14} className="text-blue-600"/> Settimane Selezionate
        </h4>
        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
          {enrollment.enrollment_weeks?.length} Totali
        </span>
      </div>
      <div className="p-3 space-y-2 max-h-[250px] overflow-y-auto">
        {enrollment.enrollment_weeks?.map((ew: any) => (
          <div key={ew.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">{ew.camp_weeks?.label || "Settimana"}</span>
              <div className="flex gap-2 mt-0.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${ew.type === 'FULL' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
                  {ew.type === 'FULL' ? 'INTERA' : 'MEZZA'}
                </span>
                {ew.pre_post !== 'NONE' && (
                  <span className="text-[9px] font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                    +{ew.pre_post}
                  </span>
                )}
              </div>
            </div>
            <div className="text-sm font-mono font-bold text-gray-600">€{ew.computed_price}</div>
          </div>
        ))}
      </div>
    </div>

    {/* COLONNA DESTRA: FINANZE E AZIONI */}
    <div className="flex flex-col gap-4">
      {/* BOX ECONOMICO */}
      <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-blue-600 uppercase">Totale</span>
            <span className="text-lg font-extrabold text-gray-900">€{enrollment.prezzo_totale}</span>
          </div>
          <div className="flex flex-col border-l border-blue-100">
            <span className="text-[10px] font-bold text-red-600 uppercase">Residuo</span>
            <span className="text-lg font-extrabold text-red-600">
              €{(enrollment.prezzo_totale - enrollment.pagato).toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* AZIONI RAPIDE */}
        <div className="flex gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveModal({ type: 'PAYMENT', enrollmentId: enrollment.id }); }} 
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-all font-bold text-xs shadow-sm shadow-green-100"
          >
            <CreditCard size={14}/> Paga
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveModal({ type: 'EDIT', enrollmentId: enrollment.id, data: { price: enrollment.prezzo_totale, campId: enrollment.camps?.id } }); }} 
            className="px-3 py-2.5 bg-white text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors shadow-sm"
          >
            <Edit size={16}/>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveModal({ type: 'DELETE', enrollmentId: enrollment.id }); }} 
            className="px-3 py-2.5 bg-white text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition-colors shadow-sm"
          >
            <Trash2 size={16}/>
          </button>
        </div>
      </div>
      
      <p className="text-[10px] text-gray-400 italic text-center px-4">
        Iscrizione creata il {new Date(enrollment.created_at).toLocaleString('it-IT')}
      </p>
    </div>
  </div>
);

  return (
    <div className="space-y-6 font-sans relative pb-20">
      
      {/* --- MODALI --- */}
      {activeModal.type === 'PAYMENT' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CreditCard className="text-green-600"/> Registra Pagamento
                </h3>
                <p className="text-sm text-gray-600 mb-4">Inserisci l&apos;importo ricevuto.</p>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const val = parseFloat((e.target as any).amount.value);
                    if (val) handlePaymentSubmit(val);
                }}>
                    <input name="amount" type="number" step="0.01" placeholder="Importo €" className="w-full border border-gray-300 p-3 rounded-lg text-lg text-gray-900 font-bold mb-4 focus:ring-2 ring-green-500 outline-none" autoFocus />
                    <div className="flex gap-2">
                        <button type="button" onClick={closeModal} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">Annulla</button>
                        <button type="submit" disabled={loadingAction} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">
                            {loadingAction ? '...' : 'Conferma'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

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
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Campo Estivo</label>
                            <select name="camp" defaultValue={activeModal.data.campId} className="w-full border border-gray-300 p-2 rounded-lg bg-gray-50 text-gray-900">
                                {camps?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Override Prezzo Totale (€)</label>
                            <input name="price" type="number" step="0.01" defaultValue={activeModal.data.price} className="w-full border border-gray-300 p-2 rounded-lg font-mono font-bold text-gray-900" />
                            <p className="text-[10px] text-orange-600 mt-1">Attenzione: Disabilita il calcolo automatico.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button type="button" onClick={closeModal} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">Annulla</button>
                        <button type="submit" disabled={loadingAction} className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">
                            {loadingAction ? '...' : 'Salva'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
      {activeModal.type === 'DELETE' && activeModal.enrollmentId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 border-t-4 border-red-600">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="p-3 bg-red-100 rounded-full text-red-600 mb-4">
                        <Trash2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Eliminare l'iscrizione?</h3>
                    <p className="text-sm text-gray-500 mt-2">
                        Stai per rimuovere definitivamente questa iscrizione dal database. 
                        Questa azione <strong>non può essere annullata</strong>.
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={closeModal} 
                        className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors"
                    >
                        Annulla
                    </button>
                    <button 
                        onClick={handleDeleteSubmit} 
                        disabled={loadingAction} 
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-md shadow-red-200 transition-colors flex justify-center items-center gap-2"
                    >
                        {loadingAction ? <Loader2 size={18} className="animate-spin"/> : 'Elimina Definitivamente'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* MODALE DETTAGLIO BAMBINO */}
      {activeModal.type === 'CHILD' && selectedEnrollment && (
        <ChildDetailModal 
          child={selectedEnrollment.children} 
          parent={selectedEnrollment.parent}
          onClose={closeModal}
        />
      )}

      {/* MODALE DETTAGLIO GENITORE */}
      {activeModal.type === 'PARENT' && selectedEnrollment && (
        <ParentDetailModal 
          parent={selectedEnrollment.parent}
          children={parentChildren}
          onClose={closeModal}
        />
      )}

      {/* --- STATISTICHE AVANZATE --- */}
      <div className="space-y-4">
        {/* RIGA 1: KPI FINANZIARI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={CreditCard}
            label="Incassato"
            value={`€ ${stats.totalRevenue.toLocaleString()}`}
            subtext={`Su € ${stats.totalPotential.toLocaleString()}`}
            color="green"
          />
          <StatCard
            icon={TrendingUp}
            label="Da Incassare"
            value={`€ ${stats.pendingAmount.toLocaleString()}`}
            subtext={`${stats.unpaidOrders} ordini da saldare`}
            color="orange"
          />
          <StatCard
            icon={FileText}
            label="Ordini Totali"
            value={stats.paidOrders + stats.unpaidOrders}
            subtext={`${stats.paidOrders} pagati, ${stats.unpaidOrders} da pagare`}
            color="blue"
          />
          <StatCard
            icon={Package}
            label="Totale Settimane"
            value={stats.weeksSold}
            subtext={`Media ${stats.uniqueChildren > 0 ? (stats.weeksSold / stats.uniqueChildren).toFixed(1) : '0'} per bambino`}
            color="purple"
          />
        </div>

        {/* RIGA 2: KPI OPERATIVI E LOGISTICI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <StatCard
            icon={Users}
            label="Bambini Unici"
            value={stats.uniqueChildren}
            color="teal"
          />
          <StatCard
            icon={Calendar}
            label="Settimane Vendute"
            value={stats.weeksSold}
            color="purple"
          />
          <TShirtStats sizes={stats.tshirtSizes} />
          <IntolerancesAlert 
            list={stats.allergiesList} 
            count={stats.allergiesCount} 
          />
        </div>
      </div>

      {/* --- BARRA FILTRI --- */}
      <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200">
         <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
            <div className="relative w-full xl:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cerca bambino, genitore, email, CF..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none" 
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={16} />
                  </button>
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
                    <option value="ALL">Tutti gli Stati</option>
                    <option value="TO_PAY">Da Saldare</option>
                    <option value="PAID">Saldati</option>
                </select>
                <select value={filters.prePost} onChange={e => setFilters({...filters, prePost: e.target.value})} className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm w-full md:w-auto text-gray-900 font-medium">
                    <option value="ALL">Tutti i Servizi</option>
                    <option value="ANY_EXTRA">Con Pre o Post</option>
                    <option value="PRE">Solo con Pre</option>
                    <option value="POST">Solo con Post</option>
                </select>
            </div>
            <div className="flex gap-2">
              {filters.campId !== "ALL" && filters.weekDate !== "ALL" && (
                <button 
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg border border-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingPDF ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  <span>PDF Presenze</span>
                </button>
              )}
              {filters.campId !== "ALL" && (
                <button 
                  onClick={handleGenerateContattiPDF}
                  disabled={isGeneratingPDF}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg border border-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                {isGeneratingPDF ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
                  <span>PDF Contatti</span>
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
             {filters.campId !== "ALL" && (
               <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                 Campo: {camps.find(c => c.id === filters.campId)?.nome}
                 <button onClick={() => setFilters({...filters, campId: "ALL"})}><X size={12} /></button>
               </span>
             )}
             {filters.weekDate !== "ALL" && (
               <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                 Settimana
                 <button onClick={() => setFilters({...filters, weekDate: "ALL"})}><X size={12} /></button>
               </span>
             )}
             {filters.status !== "ALL" && (
               <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                 Stato: {filters.status === "PAID" ? "Saldati" : "Da Saldare"}
                 <button onClick={() => setFilters({...filters, status: "ALL"})}><X size={12} /></button>
               </span>
             )}
             {filters.prePost !== "ALL" && (
               <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                 Servizio: {filters.prePost === "ANY_EXTRA" ? "Pre/Post" : filters.prePost}
                 <button onClick={() => setFilters({...filters, prePost: "ALL"})}><X size={12} /></button>
               </span>
             )}
             {searchTerm && (
               <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                 Ricerca: &quot;{searchTerm}&quot;
                 <button onClick={() => setSearchTerm('')}><X size={12} /></button>
               </span>
             )}
           </div>
         )}
      </div>

      {/* --- VISTA DESKTOP (Tabella) --- */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                    <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider">Data</th>
                    <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider">Bambino</th>
                    <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider">Genitore</th>
                    <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider text-center">Set</th>
                    <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider text-right">Totale</th>
                    <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider text-center">Stato</th>
                    <th className="p-4"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {filteredData.map(enrollment => {
                    const isPaid = ((enrollment.pagato || 0) + 0.1) >= (enrollment.prezzo_totale || 0);
                    const isExpanded = expandedRows.has(enrollment.id);

                    return (
                        <React.Fragment key={enrollment.id}>
                            <tr className="hover:bg-blue-50/50 transition-colors">
                                <td className="p-4 align-top cursor-pointer" onClick={() => toggleRow(enrollment.id)}>
                                    <div className="font-bold text-gray-900">{new Date(enrollment.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="p-4 align-top">
                                    <button onClick={() => openChildModal(enrollment)} className="flex items-center gap-2 text-left group">
                                      <Baby size={16} className="text-blue-500 group-hover:text-blue-700" />
                                      <span className="font-bold text-blue-900 text-base group-hover:underline">
                                      {enrollment.children?.nome} {enrollment.children?.cognome} - {enrollment.age !== null ? `${enrollment.age} anni` : 'Età N/D'}
                                      </span>
                                      {enrollment.hasMedicalIssues && (
                                        <AlertTriangle size={16} className="text-amber-500" />
                                      )}
                                    </button>
                                    <div className="text-xs font-medium text-gray-600 mt-1 flex items-center gap-1"><Calendar size={12}/> {enrollment.camps?.nome}</div>
                                </td>
                                <td className="p-4 align-top">
                                   <button onClick={() => openParentModal(enrollment)} className="flex items-center gap-2 text-left group">
                                      <User size={16} className="text-emerald-500 group-hover:text-emerald-700" />
                                      <span className="font-bold text-gray-800 group-hover:underline">{enrollment.parent?.nome} {enrollment.parent?.cognome}</span>
                                   </button>
                                   <div className="text-xs text-gray-600 truncate max-w-[150px]">{enrollment.parent?.email}</div>
                                </td>
                                <td className="p-4 align-top text-center cursor-pointer" onClick={() => toggleRow(enrollment.id)}>
                                    <span className="bg-gray-100 text-gray-800 font-bold px-2 py-1 rounded text-xs">{enrollment.enrollment_weeks?.length || 0}</span>
                                </td>
                                <td className="p-4 align-top text-right cursor-pointer" onClick={() => toggleRow(enrollment.id)}>
                                    <div className="font-extrabold text-gray-900">€ {enrollment.prezzo_totale}</div>
                                    {enrollment.discount_applied && <span className="text-[10px] text-green-700 bg-green-100 px-1 rounded font-bold">Sconto OK</span>}
                                </td>
                                <td className="p-4 align-top text-center cursor-pointer" onClick={() => toggleRow(enrollment.id)}>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isPaid ? 'Saldato' : 'Da Saldare'}</span>
                                </td>
                                <td className="p-4 align-top text-right text-gray-500 cursor-pointer" onClick={() => toggleRow(enrollment.id)}>
                                    {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                </td>
                            </tr>
                            {isExpanded && (
                                <tr className="bg-gray-50 border-t border-gray-200 shadow-inner">
                                    <td colSpan={7} className="p-6">
                                        <EnrollmentDetails enrollment={enrollment} />
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    );
                })}
            </tbody>
        </table>
      </div>

      {/* --- VISTA MOBILE (Card) --- */}
      <div className="md:hidden space-y-4">
        {filteredData.map(enrollment => {
            const isPaid = ((enrollment.pagato || 0) + 0.1) >= (enrollment.prezzo_totale || 0);
            const isExpanded = expandedRows.has(enrollment.id);

            return (
                <div key={enrollment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <button onClick={() => openChildModal(enrollment)} className="flex items-center gap-2 text-left">
                                  <Baby size={16} className="text-blue-500" />
                                  <h3 className="font-bold text-lg text-blue-900">{enrollment.children?.nome} {enrollment.children?.cognome}</h3>
                                  {enrollment.hasMedicalIssues && (
                                    <AlertTriangle size={16} className="text-amber-500" />
                                  )}
                                </button>
                                <div className="text-xs text-gray-600 font-medium flex items-center gap-1 mt-0.5">
                                    <Calendar size={12}/> {enrollment.camps?.nome}
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {isPaid ? 'Saldato' : 'Da Saldare'}
                            </span>
                        </div>
                        
                        <div className="flex justify-between items-end border-t border-gray-100 pt-3">
                            <button onClick={() => openParentModal(enrollment)} className="text-sm text-left">
                                <div className="text-gray-500 text-xs">Genitore</div>
                                <div className="font-semibold text-gray-800">{enrollment.parent?.nome} {enrollment.parent?.cognome}</div>
                            </button>
                            <div className="text-right">
                                <div className="font-extrabold text-gray-900 text-lg">€ {enrollment.prezzo_totale}</div>
                                {!isPaid && <div className="text-[10px] text-red-600 font-bold">Mancano €{(enrollment.prezzo_totale - enrollment.pagato).toFixed(0)}</div>}
                            </div>
                        </div>

                        <div 
                          className="flex justify-center pt-1 text-gray-400 cursor-pointer"
                          onClick={() => toggleRow(enrollment.id)}
                        >
                             {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                        </div>
                    </div>

                    {isExpanded && (
                        <div className="bg-gray-50 border-t border-gray-200 p-4 animate-in slide-in-from-top-2 duration-200">
                             <EnrollmentDetails enrollment={enrollment} />
                        </div>
                    )}
                </div>
            )
        })}
      </div>

      {filteredData.length === 0 && <div className="p-8 text-center text-gray-600 font-medium bg-white rounded-xl border border-dashed border-gray-300">Nessuna iscrizione trovata.</div>}
    </div>
  );
}