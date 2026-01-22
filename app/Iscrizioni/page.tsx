"use client";

import { createClient } from "@/app/utils/supabase/client";
import { useEffect, useState } from "react";
import { Download, Calendar, FileText } from "lucide-react";

export default function StoricoIscrizioniPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if(!user) return;

      const { data } = await supabase
        .from('enrollments')
        .select(`
          id, 
          created_at, 
          prezzo_totale, 
          pagato, 
          stato,
          children (nome, cognome),
          camps (nome, data_fine)
        `)
        .eq('children.parent_id', user.id)
        .order('created_at', { ascending: false });
        
      setEnrollments(data || []);
      setLoading(false);
    };
    loadData();
  }, []);

  // Funzione Helper per lo Stato
  const getStatusBadge = (enrollment: any) => {
    const isPaid = enrollment.pagato >= enrollment.prezzo_totale;
    const isEnded = new Date(enrollment.camps.data_fine) < new Date();

    if (isEnded) {
      return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">Terminata</span>;
    }
    if (!isPaid) {
      return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-100">Da Saldare</span>;
    }
    return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100">Attiva</span>;
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-deep mb-6 flex items-center gap-3">
            <FileText className="text-cyan-600"/> Storico Iscrizioni
        </h1>
        
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b border-gray-100">
                <tr>
                  <th className="p-5">Data Ordine</th>
                  <th className="p-5">Bambino</th>
                  <th className="p-5">Campo Estivo</th>
                  <th className="p-5 text-center">Stato</th>
                  <th className="p-5 text-center">Ricevuta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enrollments.map((row) => {
                  const isPaid = row.pagato >= row.prezzo_totale;

                  return (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-5 text-gray-600">
                        {new Date(row.created_at).toLocaleDateString()}
                        <div className="text-[10px] text-gray-400">#{row.id.slice(0,8).toUpperCase()}</div>
                      </td>
                      <td className="p-5 font-bold text-blue-deep">
                        {row.children?.nome} {row.children?.cognome}
                      </td>
                      <td className="p-5 text-gray-600">
                        <div className="font-medium">{row.camps?.nome}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Calendar size={10}/> Fine: {new Date(row.camps?.data_fine).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        {getStatusBadge(row)}
                      </td>
                      <td className="p-5 text-center">
                        <button 
                            disabled={!isPaid}
                            className={`flex items-center justify-center gap-2 mx-auto px-3 py-1.5 rounded-lg transition-all ${
                                isPaid 
                                ? "text-cyan-600 hover:bg-cyan-50 border border-cyan-100 hover:border-cyan-200 cursor-pointer" 
                                : "text-gray-300 cursor-not-allowed"
                            }`} 
                            title={isPaid ? "Scarica Ricevuta" : "Pagamento non completato"}
                        >
                          <Download size={16} />
                          <span className="hidden md:inline text-xs font-bold">Scarica</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {enrollments.length === 0 && (
              <div className="p-12 text-center text-gray-400 italic">
                  Non ci sono ancora iscrizioni nel tuo storico.
              </div>
          )}
        </div>
      </div>
    </div>
  );
}