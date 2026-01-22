"use client";

import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/app/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  User, Edit2, Trash2, Users, Calendar, AlertTriangle, 
  Plus, FileText, TrendingUp, CheckCircle, ChevronDown, ChevronUp
} from "lucide-react";
import AddChildModal from "../components/addChildModal";
import EditChildModal from "../components/editChildModal";
import ProfileSection from "../components/profileSection";
import { deleteChild } from "../actions/childrens";
import DeleteConfirmModal from "../components/deleteConfirmModal"; 
import BankTransferBox from "../components/BankTransferBox";

// --- TIPI ---
type Profile = {
  id: string; email: string; nome: string; cognome: string; cf: string; telefono: string;
  email_contatti: string; indirizzo_via: string; indirizzo_civico: string;
  indirizzo_cap: string; indirizzo_paese: string; indirizzo_provincia: string;
};

type Child = {
  id: string; nome: string; cognome: string; data_nascita: string; cf: string;
  taglia_maglietta: string; intolleranze: string[]; parent_id: string;
};

type Enrollment = {
  id: string; child_id: string; camp_id: string; created_at: string;
  prezzo_totale: number; pagato: number; saldata: boolean; stato: string; 
  camps: { nome: string; indirizzo_via: string; indirizzo_paese: string; };
  enrollment_weeks: { camp_weeks: { data_inizio: string; data_fine: string; } }[];
};

// --- COMPONENTE INTERNO: RIGA ISCRIZIONE ---
const EnrollmentItem = ({ enrollment, child }: { enrollment: Enrollment; child: Child }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Calcoli
  const daSaldare = enrollment.prezzo_totale - (enrollment.pagato || 0);
  const isSaldato = daSaldare <= 0;
  
  // Date
  const bookedWeeks = enrollment.enrollment_weeks
     .map(ew => ew.camp_weeks)
     .sort((a, b) => a.data_inizio.localeCompare(b.data_inizio));
  
  const realStart = bookedWeeks[0]?.data_inizio;
  const realEnd = bookedWeeks[bookedWeeks.length - 1]?.data_fine;
  const weeksCount = bookedWeeks.length;

  const formatDate = (d: string) => new Date(d).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });

  return (
    <div className={`border border-gray-200 rounded-xl bg-gray-50/30 overflow-hidden transition-all duration-300 ${isOpen ? 'shadow-md bg-white border-cyan-100' : ''}`}>
      {/* Header Riga */}
      <div 
        className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer hover:bg-gray-50 transition-colors gap-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1">
           <div className="flex items-center gap-3">
              <p className="font-bold text-blue-deep text-lg">{enrollment.camps.nome}</p>
              <span className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500 font-medium whitespace-nowrap">
                 {weeksCount} sett.
              </span>
           </div>
           <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
              <Calendar size={14} className="text-cyan-600"/>
              {realStart && realEnd ? `${formatDate(realStart)} - ${formatDate(realEnd)}` : "Date da definire"}
           </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
           {isSaldato ? (
              <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs font-bold border border-green-200">
                 <CheckCircle size={12}/> Saldato
              </span>
           ) : (
              <div className="text-right">
                 <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 mb-1">
                    Confermata
                 </span>
                 <p className="text-xs text-red-600 font-bold">Da saldare: €{daSaldare.toFixed(2)}</p>
              </div>
           )}
           <div className={`transition-transform duration-300 text-gray-400 ${isOpen ? 'rotate-180 text-cyan-600' : ''}`}>
              <ChevronDown size={20}/>
           </div>
        </div>
      </div>

      {/* Body Espandibile */}
      {isOpen && (
        <div className="p-4 pt-0 border-t border-gray-100 bg-white animate-in slide-in-from-top-2">
           <div className="mt-4 flex flex-col md:flex-row gap-4 md:gap-8 text-xs text-gray-400 mb-4 pb-4 border-b border-dashed border-gray-100">
              <span className="flex items-center gap-2">
                  <FileText size={14}/> Ordine <strong>#{enrollment.id.slice(0,8).toUpperCase()}</strong>
              </span>
              <span>Data: {new Date(enrollment.created_at).toLocaleDateString()}</span>
              <span>Totale: €{enrollment.prezzo_totale.toFixed(2)} (Pagato: €{enrollment.pagato.toFixed(2)})</span>
           </div>

           {!isSaldato && (
              <BankTransferBox 
                amount={daSaldare}
                childName={child.nome}
                childSurname={child.cognome}
                childCF={child.cf}
                campName={enrollment.camps.nome}
                reservationId={enrollment.id}
              />
           )}
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE INTERNO: CARD BAMBINO ---
const ChildCard = ({ child, enrollments, onEdit, onDelete, onRegister }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const activeEnrollments = enrollments || [];
  
  const calculateAge = (birthDate: string) => {
    const diff = Date.now() - new Date(birthDate).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  return (
    <div className="border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-cyan-200 transition-all shadow-sm bg-white">
      
      {/* Header Bambino */}
      <div className="bg-gradient-to-r from-cyan-50 to-white p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          <div className="flex-1 cursor-pointer group" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-xl font-bold text-blue-deep group-hover:text-cyan-700 transition-colors">
                  {child.nome} {child.cognome}
              </h3>
              <span className="bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">
                {calculateAge(child.data_nascita)} anni
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
               <span className="font-mono bg-gray-50 px-1 rounded text-xs">{child.cf}</span>
               {activeEnrollments.length > 0 && (
                  <span className="flex items-center gap-1 text-cyan-700 font-bold bg-cyan-100/50 px-2 py-0.5 rounded-md text-xs">
                     <Calendar size={12}/> {activeEnrollments.length} Iscrizioni
                  </span>
               )}
            </div>
            {child.intolleranze && child.intolleranze.length > 0 && (
                <p className="text-xs text-orange-600 font-bold mt-2 flex items-center gap-1">
                    <AlertTriangle size={12}/> {child.intolleranze.join(", ")}
                </p>
            )}
          </div>

          <div className="flex gap-2 items-center self-end md:self-center">
            <button onClick={() => onRegister(child.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 font-bold text-sm shadow-sm whitespace-nowrap">
               <TrendingUp size={16}/> Nuova
            </button>
            <button onClick={() => onEdit(child)} className="p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors" title="Modifica Dati">
               <Edit2 size={18}/>
            </button>
            <button onClick={() => onDelete(child)} className="p-2 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Elimina Bambino">
               <Trash2 size={18}/>
            </button>
            <button 
               onClick={() => setIsExpanded(!isExpanded)} 
               className={`p-2 ml-2 transition-colors rounded-full ${isExpanded ? 'bg-cyan-50 text-cyan-600' : 'text-gray-400 hover:bg-gray-50'}`}
            >
               {isExpanded ? <ChevronUp size={24}/> : <ChevronDown size={24}/>}
            </button>
          </div>
        </div>
      </div>

      {/* Body Espandibile */}
      {isExpanded && (
        <div className="p-6 bg-white space-y-4 animate-in slide-in-from-top-4 border-t border-gray-100">
           <h4 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-3 ml-1">Storico Iscrizioni</h4>
           
           {activeEnrollments.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                 <p className="text-sm text-gray-400 italic mb-3">Nessuna iscrizione presente per {child.nome}.</p>
                 <button onClick={() => onRegister(child.id)} className="text-cyan-600 font-bold text-sm hover:underline flex items-center justify-center gap-1 mx-auto">
                    <Plus size={14}/> Iscrivi ora
                 </button>
              </div>
           ) : (
              activeEnrollments.map((enr: any) => (
                 <EnrollmentItem key={enr.id} enrollment={enr} child={child} />
              ))
           )}
        </div>
      )}
    </div>
  );
};


// --- CONTENUTO PAGINA PRINCIPALE (Logic Wrapper) ---
function UtenteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [enrollments, setEnrollments] = useState<{ [childId: string]: Enrollment[] }>({});
  
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [alert, setAlert] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  
  // Modali
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState<{ isOpen: boolean; type: "ACCOUNT" | "CHILD" | null; data: any; }>({ isOpen: false, type: null, data: null });

  const showAlert = (msg: string, type: "error" | "success" = "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 5000);
  };

  useEffect(() => {
    if (searchParams.get('success') === 'true' || searchParams.get('success') === 'enrollment_created') {
      showAlert("✅ Prenotazione confermata! Apri la scheda del bambino per i dettagli di pagamento.", "success");
      // Puliamo l'URL per non mostrare il messaggio al refresh
      router.replace('/Utente');
    }
  }, [searchParams, router]);

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/Login"); return; }

      try {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(profile);

        const { data: kids } = await supabase.from('children').select('*').eq('parent_id', user.id).order('data_nascita');
        setChildren(kids || []);

        if (kids && kids.length > 0) {
          const enrollMap: any = {};
          for (const k of kids) {
            const { data } = await supabase.from('enrollments')
              .select(`*, camps(nome, indirizzo_via, indirizzo_paese), enrollment_weeks(camp_weeks(data_inizio, data_fine))`)
              .eq('child_id', k.id).order('created_at', { ascending: false });
            enrollMap[k.id] = data || [];
          }
          setEnrollments(enrollMap);
        }
        setLoading(false);
      } catch (e) { console.error(e); setLoading(false); }
    };
    loadData();
  }, []);

  // Handlers
  const handleRegister = (childId: string) => router.push(`/Iscrizione?child=${childId}`);
  
  const handleDeleteChild = (child: Child) => {
     if (enrollments[child.id]?.length > 0) {
        showAlert("Impossibile eliminare: ci sono iscrizioni nello storico.", "error");
        return;
     }
     setDeleteModalConfig({ isOpen: true, type: "CHILD", data: child });
  };

  const handleDeleteAccount = () => {
     const hasDebt = Object.values(enrollments).flat().some(e => (e.prezzo_totale - e.pagato) > 0);
     if (hasDebt) {
        showAlert("Impossibile eliminare l'account: ci sono pagamenti in sospeso.", "error");
        return;
     }
     setDeleteModalConfig({ isOpen: true, type: "ACCOUNT", data: null });
  };

  const performDeletion = async () => {
     try {
       if(deleteModalConfig.type === "CHILD") {
          await deleteChild(deleteModalConfig.data.id);
          showAlert("Bambino eliminato correttamente", "success");
          window.location.reload();
       } else if (deleteModalConfig.type === "ACCOUNT") {
          const { error } = await supabase.from('profiles').delete().eq('id', profile!.id);
          if (error) throw error;
          await supabase.auth.signOut();
          router.push("/");
       }
     } catch(e: any) {
        showAlert("Errore durante l'eliminazione: " + e.message);
     }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-cream"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div></div>;
  if (!profile) return null;

  return (
    <>
      {alert && (
        <div className={`fixed z-[200] top-6 left-1/2 -translate-x-1/2 px-6 py-4 rounded-xl font-bold shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${alert.type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
          {alert.type === "error" ? <AlertTriangle size={20}/> : <CheckCircle size={20}/>}
          {alert.msg}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Profilo */}
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col md:flex-row items-center gap-6 border border-gray-100">
           <div className="bg-cyan-100 p-4 rounded-full"><User className="text-cyan-600" size={40} /></div>
           <div>
             <h1 className="text-3xl font-bold text-blue-deep">Ciao, {profile.nome}! 👋</h1>
             <p className="text-gray-500">Gestisci qui le tue iscrizioni e i dati della famiglia.</p>
           </div>
        </div>

        {/* Sezione Profilo Editabile */}
        <ProfileSection profile={profile} onProfileUpdate={() => window.location.reload()} showAlert={showAlert} />

        {/* Lista Figli */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-deep flex items-center gap-2">
              <Users size={24} /> I Miei Figli ({children.length})
            </h2>
            <button onClick={() => setShowAddChildModal(true)} className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center gap-2 font-bold text-sm shadow-md transition-all hover:-translate-y-0.5">
               <Plus size={18}/> Aggiungi
            </button>
          </div>

          <div className="space-y-6">
             {children.length === 0 && (
                <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                   <Users className="mx-auto mb-3 opacity-20" size={48}/>
                   <p>Non hai ancora registrato nessun bambino.</p>
                </div>
             )}
             {children.map(child => (
                <ChildCard 
                   key={child.id} 
                   child={child} 
                   enrollments={enrollments[child.id]} 
                   onEdit={(c: Child) => { setEditingChild(c); setShowEditModal(true); }}
                   onDelete={handleDeleteChild}
                   onRegister={handleRegister}
                />
             ))}
          </div>
        </div>

        {/* Zona Pericolosa */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-red-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-lg"><AlertTriangle className="text-red-600" size={24} /></div>
            <h2 className="text-xl font-bold text-red-700">Zona Pericolosa</h2>
          </div>
          <p className="text-gray-600 mb-6 text-sm">
             Eliminando l'account perderai l'accesso a tutti i dati e allo storico delle iscrizioni.
          </p>
          <button onClick={handleDeleteAccount} className="bg-white border-2 border-red-200 text-red-600 px-6 py-3 rounded-xl hover:bg-red-50 transition-all flex items-center gap-2 font-bold text-sm">
            <Trash2 size={18} /> Elimina Account
          </button>
        </div>
      </div>

      {/* Modali */}
      <AddChildModal isOpen={showAddChildModal} onClose={() => setShowAddChildModal(false)} onSuccess={() => window.location.reload()} showAlert={showAlert} />
      <EditChildModal isOpen={showEditModal} child={editingChild} onClose={() => { setShowEditModal(false); setEditingChild(null); }} onSuccess={() => window.location.reload()} showAlert={showAlert} />
      <DeleteConfirmModal 
          isOpen={deleteModalConfig.isOpen} 
          onClose={() => setDeleteModalConfig({ isOpen: false, type: null, data: null })} 
          onConfirm={performDeletion} 
          title={deleteModalConfig.type === "ACCOUNT" ? "Elimina Account" : "Elimina Bambino"}
          description={deleteModalConfig.type === "ACCOUNT" ? "Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile." : "Sei sicuro di voler eliminare questo bambino?"}
          confirmText="Elimina definitivamente" 
      />
    </>
  );
}

// --- EXPORT DEFAULT (Pagina Wrapper con Suspense) ---
export default function PaginaUtente() {
  return (
    <main className="min-h-screen bg-cream py-12 px-4">
      <Suspense fallback={
         <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
         </div>
      }>
        <UtenteContent />
      </Suspense>
    </main>
  );
}