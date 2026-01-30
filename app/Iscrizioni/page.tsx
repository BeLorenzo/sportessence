"use client";

import { createClient } from "@/app/utils/supabase/client";
import { useEffect, useState, useMemo } from "react";
import { Download, Calendar, FileText, Euro, ChevronDown, ChevronUp, Clock, Filter, X, User } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { RicevutaPDF, RicevutaData } from "../components/ricevutaPDF";

export default function StoricoIscrizioniPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // --- STATO FILTRI ---
  const [filters, setFilters] = useState({
    status: 'ALL', 
    child: 'ALL',
    camp: 'ALL',
    year: 'ALL'
  });

  const supabase = createClient();



  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if(!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('nome, cognome')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setUserProfile(profileData);
      }

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id, 
          created_at, 
          prezzo_totale, 
          pagato, 
          stato,
          children!inner (id, nome, cognome, cf), 
          camps (id, nome, data_inizio, data_fine),
          enrollment_weeks (
            id,
            type,
            pre_post,
            computed_price, 
            camp_weeks (label, data_inizio, data_fine)
          )
        `)
        .eq('children.parent_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Errore caricamento storico:", error);
      } else {
        setEnrollments(data || []);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // --- HELPER LOGIC ---
  const isEnrollmentPaid = (e: any) => (e.pagato + 0.01) >= e.prezzo_totale;

  const filterOptions = useMemo(() => {
    const years = new Set<string>();
    const children = new Map<string, string>();
    const camps = new Set<string>();

    enrollments.forEach(e => {
      const year = new Date(e.created_at).getFullYear().toString();
      years.add(year);
      const childName = `${e.children.nome} ${e.children.cognome}`;
      children.set(childName, childName); 
      if(e.camps?.nome) camps.add(e.camps.nome);
    });

    return {
      years: Array.from(years).sort().reverse(),
      children: Array.from(children.values()).sort(),
      camps: Array.from(camps).sort()
    };
  }, [enrollments]);

  const filteredEnrollments = enrollments.filter(e => {
    if (filters.status === 'PAID' && !isEnrollmentPaid(e)) return false;
    if (filters.status === 'TO_PAY' && isEnrollmentPaid(e)) return false;
    if (filters.child !== 'ALL') {
      const fullName = `${e.children.nome} ${e.children.cognome}`;
      if (fullName !== filters.child) return false;
    }
    if (filters.camp !== 'ALL' && e.camps?.nome !== filters.camp) return false;
    if (filters.year !== 'ALL') {
      const year = new Date(e.created_at).getFullYear().toString();
      if (year !== filters.year) return false;
    }
    return true;
  });

  const resetFilters = () => setFilters({ status: 'ALL', child: 'ALL', camp: 'ALL', year: 'ALL' });
  const hasActiveFilters = Object.values(filters).some(v => v !== 'ALL');

  // --- RENDER HELPERS ---
  const getStatusBadge = (enrollment: any) => {
    const dataFine = enrollment.camps?.data_fine ? new Date(enrollment.camps.data_fine) : new Date();
    const isEnded = dataFine < new Date();
    const isPaid = isEnrollmentPaid(enrollment);

    if (isEnded) return <span className="whitespace-nowrap bg-gray-100 text-gray-500 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold border border-gray-200">Terminata</span>;
    if (!isPaid) return <span className="whitespace-nowrap bg-red-50 text-red-600 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold border border-red-100">Da Saldare</span>;
    return <span className="whitespace-nowrap bg-green-50 text-green-600 px-2 py-1 rounded-full text-[10px] md:text-xs font-bold border border-green-100">Attiva</span>;
  };

  const formatDateRange = (start: string, end: string) => {
    if (!start || !end) return "Date non disp.";
    const s = new Date(start).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    const e = new Date(end).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    return `${s} - ${e}`;
  };

  const getTypeLabel = (type: string) => type === 'FULL' ? 'Intera' : 'Mezza';
  const getPrePostLabel = (prePost: string) => {
    switch(prePost) {
      case 'PRE': return 'Pre';
      case 'POST': return 'Post';
      case 'BOTH': return 'Pre+Post';
      default: return null;
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-6 px-3 md:py-12 md:px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Compact su mobile */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg overflow-hidden mb-6">
          <div className="bg-blue-light p-6 md:p-8 text-white relative">
            <h1 className="text-2xl md:text-3xl font-extrabold mb-1 relative z-10 flex items-center gap-2">
              <FileText size={24} className="md:w-8 md:h-8"/> Storico Iscrizioni
            </h1>
            <p className="text-blue-100 text-sm md:text-base relative z-10">
              Le tue iscrizioni passate e in corso
            </p>
          </div>
        </div>

        {/* --- BARRA DEI FILTRI RESPONSIVE --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
          <div className="flex flex-col gap-3">
            
            <div className="flex items-center gap-2 text-gray-500 font-bold text-sm">
              <Filter size={16} /> Filtra per:
            </div>

            {/* Grid layout per i filtri su mobile */}
            <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 md:gap-3 w-full">
              
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="col-span-2 md:col-span-1 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none w-full"
              >
                <option value="ALL">Tutti gli stati</option>
                <option value="TO_PAY">Da Saldare</option>
                <option value="PAID">Saldati</option>
              </select>

              <select 
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: e.target.value})}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none w-full"
              >
                <option value="ALL">Tutti gli anni</option>
                {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select 
                value={filters.child}
                onChange={(e) => setFilters({...filters, child: e.target.value})}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none w-full"
              >
                <option value="ALL">Tutti i bambini</option>
                {filterOptions.children.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

               <select 
                value={filters.camp}
                onChange={(e) => setFilters({...filters, camp: e.target.value})}
                className="col-span-2 md:col-span-1 bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none w-full truncate"
              >
                <option value="ALL">Tutti i campi</option>
                {filterOptions.camps.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {hasActiveFilters && (
              <button 
                onClick={resetFilters}
                className="w-full md:w-auto flex items-center justify-center gap-1 text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
              >
                <X size={16} /> Rimuovi Filtri
              </button>
            )}
          </div>
        </div>
        
        {/* --- LISTA ISCRIZIONI --- */}
        <div className="space-y-3 md:space-y-4">
          {filteredEnrollments.map((enrollment) => {
            const isPaid = isEnrollmentPaid(enrollment);
            const isExpanded = expandedRows.has(enrollment.id);
            const sortedWeeks = enrollment.enrollment_weeks 
              ? [...enrollment.enrollment_weeks].sort((a:any, b:any) => 
                  (a.camp_weeks?.data_inizio || '').localeCompare(b.camp_weeks?.data_inizio || '')
                )
              : [];

            return (
              <div key={enrollment.id} className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                
                {/* --- HEADER RIGA (Layout Mobile vs Desktop) --- */}
                <div 
                    className="p-4 md:p-6 cursor-pointer md:cursor-default" 
                    onClick={() => window.innerWidth < 768 && toggleRow(enrollment.id)}
                >
                  <div className="grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 items-center">
                    
                    {/* 1. Bambino & Stato (Mobile: Top Row) */}
                    <div className="col-span-2 md:col-span-2 flex justify-between md:block items-center">
                      <div>
                        <div className="text-[10px] text-gray-400 font-mono mb-0.5 md:hidden">#{enrollment.id.slice(0,8).toUpperCase()}</div>
                        <div className="font-bold text-blue-deep text-lg md:text-base flex items-center gap-2">
                            {enrollment.children?.nome} {enrollment.children?.cognome}
                        </div>
                        <div className="md:hidden mt-1">{getStatusBadge(enrollment)}</div>
                      </div>
                    </div>

                    {/* 2. Data & ID (Desktop Only - Mobile spostato) */}
                    <div className="hidden md:block md:col-span-2">
                      <div className="text-sm text-gray-500 mb-1">Data Ordine</div>
                      <div className="font-bold text-gray-700">
                        {new Date(enrollment.created_at).toLocaleDateString('it-IT')}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-1">
                        #{enrollment.id.slice(0,8).toUpperCase()}
                      </div>
                    </div>

                    {/* 3. Campo (Mobile: Second Row) */}
                    <div className="col-span-2 md:col-span-3">
                      <div className="text-xs md:text-sm text-gray-500 mb-0.5 md:mb-1">Campo Estivo</div>
                      <div className="font-medium text-gray-700 text-sm md:text-base truncate">{enrollment.camps?.nome}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Calendar size={10}/>
                        <span className="truncate">{formatDateRange(enrollment.camps?.data_inizio, enrollment.camps?.data_fine)}</span>
                      </div>
                    </div>

                    {/* 4. Info Metrics (Mobile: Grid 2 cols) */}
                    <div className="col-span-2 md:col-span-4 grid grid-cols-2 md:grid-cols-2 gap-2 mt-2 md:mt-0">
                        {/* Settimane */}
                        <div className="md:text-center bg-gray-50 md:bg-transparent p-2 md:p-0 rounded-lg">
                            <div className="text-xs md:text-sm text-gray-500 mb-0.5 md:mb-1">Settimane</div>
                            <div className="font-bold text-cyan-600 text-sm md:text-lg">
                                {enrollment.enrollment_weeks?.length || 0}
                            </div>
                        </div>

                        {/* Importo */}
                        <div className="md:text-center bg-gray-50 md:bg-transparent p-2 md:p-0 rounded-lg">
                            <div className="text-xs md:text-sm text-gray-500 mb-0.5 md:mb-1">Importo</div>
                            <div className="font-bold text-gray-900 text-sm md:text-base flex items-center md:justify-center gap-1">
                                <Euro size={12} className="md:w-3.5 md:h-3.5"/>
                                {enrollment.prezzo_totale}
                            </div>
                            <div className="text-[10px] md:text-xs mt-0.5">
                                {isPaid ? (
                                <span className="text-green-600 font-medium">Saldato</span>
                                ) : (
                                <span className="text-red-600 font-medium">
                                    Resto: €{(enrollment.prezzo_totale - enrollment.pagato).toFixed(2)}
                                </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 5. Azioni (Desktop Only - Mobile ha click su tutta la card) */}
                    <div className="hidden md:flex md:col-span-1 items-center justify-end gap-2">
                      {getStatusBadge(enrollment)}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleRow(enrollment.id); }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
                      </button>
                    </div>

                    {/* Mobile Chevron Hint */}
                    <div className="col-span-2 md:hidden flex justify-center mt-1">
                        {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>

                  </div>
                </div>

                {/* --- SEZIONE ESPANSA --- */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 md:p-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Dettaglio Settimane */}
                      <div className="lg:col-span-2">
                        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm md:text-base">
                          <Calendar size={16} className="text-cyan-600"/> Dettaglio Settimane
                        </h3>
                        <div className="space-y-2">
                          {sortedWeeks.map((week: any) => (
                            <div key={week.id} className="bg-white p-3 md:p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <div>
                                <div className="font-bold text-gray-800 text-sm md:text-base">
                                  {week.camp_weeks?.label || "Settimana"}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 mb-1.5 md:mb-2">
                                  <Clock size={10}/>
                                  {formatDateRange(week.camp_weeks?.data_inizio, week.camp_weeks?.data_fine)}
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-[10px] bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-full border border-cyan-100 font-bold">
                                    {getTypeLabel(week.type)}
                                  </span>
                                  {getPrePostLabel(week.pre_post) && (
                                    <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100 font-bold">
                                      {getPrePostLabel(week.pre_post)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="font-bold text-gray-900 text-sm md:text-base self-end sm:self-center">
                                €{week.computed_price}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Riepilogo Pagamenti */}
                      <div>
                        <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2 text-sm md:text-base">
                          <Euro size={16} className="text-cyan-600"/> Riepilogo
                        </h3>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Totale</span>
                            <span className="font-bold text-gray-900">€{enrollment.prezzo_totale}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Pagato</span>
                            <span className="font-bold text-green-600">€{enrollment.pagato}</span>
                          </div>
                          <div className="border-t pt-3 flex justify-between items-center">
                            <span className="text-gray-600 font-medium text-sm">Saldo</span>
                            <span className={`font-bold text-base md:text-lg ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                              €{(enrollment.prezzo_totale - enrollment.pagato).toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="pt-3 border-t border-gray-200">
  {isPaid && userProfile ? (
        (() => {
          // Creiamo l'oggetto dati QUI, usando userProfile + enrollment
          const ricevutaData: RicevutaData = {
            // Usa updated_at se esiste (data saldo), altrimenti created_at
            dataPagamento: new Date(enrollment.updated_at || enrollment.created_at).toLocaleDateString('it-IT'),
            dataEmissione: new Date().toLocaleDateString('it-IT'),
            // DATI GENITORE DAL PROFILO
            genitore: `${userProfile.nome} ${userProfile.cognome}`.toUpperCase(),
            // DATI BAMBINO DALL'ISCRIZIONE
            bambino: `${enrollment.children.nome} ${enrollment.children.cognome}`.toUpperCase(),
            codiceFiscale: enrollment.children.cf?.toUpperCase() || "N/D",
            importo: enrollment.prezzo_totale,
            nomeCampo: enrollment.camps.nome,
            causale: `Saldo ${enrollment.camps.nome} ${new Date(enrollment.camps.data_inizio).getFullYear()}`
          };

          return (
            <PDFDownloadLink
              document={<RicevutaPDF data={ricevutaData} />}
              fileName={`Ricevuta_${enrollment.children.cognome}_${enrollment.id.slice(0,4)}.pdf`}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all font-bold bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm text-sm"
            >
              {({ loading }) => (
                <>
                  <Download size={16} />
                  {loading ? "Generazione..." : "Scarica Ricevuta"}
                </>
              )}
            </PDFDownloadLink>
          );
        })()
      ) : (
        <button 
          disabled
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed font-bold text-sm"
        >
          <Download size={16} />
          {isPaid ? "Caricamento dati..." : "Ricevuta non disp."}
        </button>
      )}
</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* --- EMPTY STATES --- */}
        {enrollments.length > 0 && filteredEnrollments.length === 0 && (
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center mt-8">
            <Filter size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">Nessuna iscrizione corrisponde ai filtri.</p>
            <button onClick={resetFilters} className="text-cyan-600 font-bold mt-2 hover:underline text-sm">Rimuovi filtri</button>
           </div>
        )}

        {enrollments.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center mt-8">
            <FileText size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 italic">Non ci sono ancora iscrizioni nel tuo storico.</p>
          </div>
        )}
      </div>
    </div>
  );
}