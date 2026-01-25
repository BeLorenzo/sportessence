"use client";

import { createClient } from "@/app/utils/supabase/client";
import { useEffect, useState, useMemo } from "react";
import { Download, Calendar, FileText, Euro, ChevronDown, ChevronUp, Clock, Filter, X } from "lucide-react";

export default function StoricoIscrizioniPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // --- STATO FILTRI ---
  const [filters, setFilters] = useState({
    status: 'ALL', // 'ALL', 'PAID', 'TO_PAY'
    child: 'ALL',
    camp: 'ALL',
    year: 'ALL'
  });

  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if(!user) return;

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          id, 
          created_at, 
          prezzo_totale, 
          pagato, 
          stato,
          children!inner (id, nome, cognome), 
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

  // --- ESTRAZIONE OPZIONI FILTRI (Memoized) ---
  const filterOptions = useMemo(() => {
    const years = new Set<string>();
    const children = new Map<string, string>(); // ID -> "Nome Cognome"
    const camps = new Set<string>();

    enrollments.forEach(e => {
      // Anni
      const year = new Date(e.created_at).getFullYear().toString();
      years.add(year);
      // Bambini
      const childName = `${e.children.nome} ${e.children.cognome}`;
      children.set(childName, childName); // Uso il nome come chiave per semplicità visuale
      // Campi
      if(e.camps?.nome) camps.add(e.camps.nome);
    });

    return {
      years: Array.from(years).sort().reverse(),
      children: Array.from(children.values()).sort(),
      camps: Array.from(camps).sort()
    };
  }, [enrollments]);

  // --- LOGICA FILTRAGGIO ---
  const filteredEnrollments = enrollments.filter(e => {
    // 1. Filtro Stato
    if (filters.status === 'PAID' && !isEnrollmentPaid(e)) return false;
    if (filters.status === 'TO_PAY' && isEnrollmentPaid(e)) return false;

    // 2. Filtro Bambino
    if (filters.child !== 'ALL') {
      const fullName = `${e.children.nome} ${e.children.cognome}`;
      if (fullName !== filters.child) return false;
    }

    // 3. Filtro Campo
    if (filters.camp !== 'ALL' && e.camps?.nome !== filters.camp) return false;

    // 4. Filtro Anno
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

    if (isEnded) return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">Terminata</span>;
    if (!isPaid) return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">Da Saldare</span>;
    return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100">Attiva</span>;
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
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="bg-blue-light p-8 text-white relative">
            <h1 className="text-3xl font-extrabold mb-2 relative z-10 flex items-center gap-3">
              <FileText size={32}/> Storico Iscrizioni
            </h1>
            <p className="text-blue-100 relative z-10">Visualizza tutte le iscrizioni passate e in corso</p>
          </div>
        </div>

        {/* --- BARRA DEI FILTRI --- */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            
            <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
              <div className="flex items-center gap-2 text-gray-500 font-bold text-sm mr-2">
                <Filter size={18} /> Filtra:
              </div>

              {/* Filtro Stato */}
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none"
              >
                <option value="ALL">Tutti gli stati</option>
                <option value="TO_PAY">Da Saldare</option>
                <option value="PAID">Saldati</option>
              </select>

              {/* Filtro Anno */}
              <select 
                value={filters.year}
                onChange={(e) => setFilters({...filters, year: e.target.value})}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none"
              >
                <option value="ALL">Tutti gli anni</option>
                {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              {/* Filtro Bambino */}
              <select 
                value={filters.child}
                onChange={(e) => setFilters({...filters, child: e.target.value})}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none"
              >
                <option value="ALL">Tutti i bambini</option>
                {filterOptions.children.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

               {/* Filtro Campo */}
               <select 
                value={filters.camp}
                onChange={(e) => setFilters({...filters, camp: e.target.value})}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 outline-none max-w-[200px] truncate"
              >
                <option value="ALL">Tutti i campi</option>
                {filterOptions.camps.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button 
                onClick={resetFilters}
                className="flex items-center gap-1 text-red-500 text-sm font-bold hover:bg-red-50 px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
              >
                <X size={16} /> Rimuovi Filtri
              </button>
            )}
          </div>
        </div>
        
        {/* --- LISTA --- */}
        <div className="space-y-4">
          {filteredEnrollments.map((enrollment) => {
            const isPaid = isEnrollmentPaid(enrollment);
            const isExpanded = expandedRows.has(enrollment.id);
            
            const sortedWeeks = enrollment.enrollment_weeks 
              ? [...enrollment.enrollment_weeks].sort((a:any, b:any) => 
                  (a.camp_weeks?.data_inizio || '').localeCompare(b.camp_weeks?.data_inizio || '')
                )
              : [];

            return (
              <div key={enrollment.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                {/* Header Riga */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Data Ordine */}
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-500 mb-1">Data Ordine</div>
                      <div className="font-bold text-gray-700">
                        {new Date(enrollment.created_at).toLocaleDateString('it-IT')}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-1">
                        #{enrollment.id.slice(0,8).toUpperCase()}
                      </div>
                    </div>

                    {/* Bambino */}
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-500 mb-1">Bambino</div>
                      <div className="font-bold text-blue-deep">
                        {enrollment.children?.nome} {enrollment.children?.cognome}
                      </div>
                    </div>

                    {/* Campo */}
                    <div className="md:col-span-3">
                      <div className="text-sm text-gray-500 mb-1">Campo Estivo</div>
                      <div className="font-medium text-gray-700">{enrollment.camps?.nome}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <Calendar size={10}/>
                        {formatDateRange(enrollment.camps?.data_inizio, enrollment.camps?.data_fine)}
                      </div>
                    </div>

                    {/* Settimane Count */}
                    <div className="md:col-span-2 text-center">
                      <div className="text-sm text-gray-500 mb-1">Settimane</div>
                      <div className="font-bold text-cyan-600 text-lg">
                        {enrollment.enrollment_weeks?.length || 0}
                      </div>
                    </div>

                    {/* Importo */}
                    <div className="md:col-span-2 text-center">
                      <div className="text-sm text-gray-500 mb-1">Importo</div>
                      <div className="font-bold text-gray-900 flex items-center justify-center gap-1">
                        <Euro size={14}/>
                        {enrollment.prezzo_totale}
                      </div>
                      <div className="text-xs mt-1">
                        {isPaid ? (
                          <span className="text-green-600 font-medium">Saldato</span>
                        ) : (
                          <span className="text-red-600 font-medium">
                            Resto: €{(enrollment.prezzo_totale - enrollment.pagato).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Azioni */}
                    <div className="md:col-span-1 flex items-center justify-end gap-2">
                      {getStatusBadge(enrollment)}
                      <button
                        onClick={() => toggleRow(enrollment.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dettaglio Espandibile (Identico a prima) */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Lista Settimane */}
                      <div className="lg:col-span-2">
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                          <Calendar size={18} className="text-cyan-600"/> Dettaglio Settimane
                        </h3>
                        <div className="space-y-2">
                          {sortedWeeks.map((week: any) => (
                            <div key={week.id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-start">
                              <div>
                                <div className="font-bold text-gray-800 mb-1">
                                  {week.camp_weeks?.label || "Settimana"}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                                  <Clock size={12}/>
                                  {formatDateRange(week.camp_weeks?.data_inizio, week.camp_weeks?.data_fine)}
                                </div>
                                <div className="flex gap-2">
                                  <span className="text-xs bg-cyan-50 text-cyan-700 px-2 py-1 rounded-full border border-cyan-100">
                                    {getTypeLabel(week.type)}
                                  </span>
                                  {getPrePostLabel(week.pre_post) && (
                                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-100">
                                      {getPrePostLabel(week.pre_post)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="font-bold text-gray-900">€{week.computed_price}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Box Pagamenti */}
                      <div>
                        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                          <Euro size={18} className="text-cyan-600"/> Riepilogo
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
                            <span className="text-gray-600 font-medium">Saldo</span>
                            <span className={`font-bold text-lg ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                              €{(enrollment.prezzo_totale - enrollment.pagato).toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="pt-3 border-t">
                            <button 
                              disabled={!isPaid}
                              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all font-bold ${
                                isPaid ? "bg-cyan-600 text-white hover:bg-cyan-700" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              <Download size={18} />
                              {isPaid ? "Scarica Ricevuta" : "Ricevuta non disp."}
                            </button>
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
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center mt-8">
            <Filter size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium text-lg">Nessuna iscrizione corrisponde ai filtri.</p>
            <button onClick={resetFilters} className="text-cyan-600 font-bold mt-2 hover:underline">Rimuovi filtri</button>
           </div>
        )}

        {enrollments.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center mt-8">
            <FileText size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-400 italic text-lg">Non ci sono ancora iscrizioni nel tuo storico.</p>
          </div>
        )}
      </div>
    </div>
  );
}