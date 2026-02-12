import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  
  // 1. Auth & Admin Check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect('/Login');

  const { data: adminCheck } = await supabase
    .from('admins_whitelist')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!adminCheck) redirect('/');

   // A. Campi (Verifica che 'membership_type' esista nel DB!)
  const { data: camps, error: campError } = await supabase
    .from('camps')
    .select('id, nome') 
    .order('nome');
  
  if (campError) console.error("Errore Campi:", campError);

  // B. Settimane
  const { data: weeks } = await supabase
    .from('camp_weeks')
    .select('id, camp_id, label, data_inizio, data_fine')
    .order('data_inizio');

  // C. Profili Genitori
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, nome, cognome, email, telefono, indirizzo_via, indirizzo_civico, indirizzo_paese, indirizzo_cap');

  // D. Iscrizioni
  const { data: enrollments, error: enrollError } = await supabase
    .from('enrollments')
    .select(`
      *,
      children (id, nome, cognome, parent_id, cf, data_nascita, taglia_maglietta, intolleranze),
      camps (id, nome), 
      enrollment_weeks (
        id,
        type,        
        pre_post,     
        computed_price,
        camp_weeks (id, label, data_inizio, data_fine)
      )
    `)
    .order('created_at', { ascending: false });

  if (enrollError) console.error("Errore Iscrizioni:", enrollError);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-[1400px] mx-auto">
        <header className="mb-8 border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2 font-medium">Panoramica iscrizioni e gestione amministrativa.</p>
        </header>

        <AdminDashboardClient 
            enrollments={enrollments || []} 
            camps={camps || []}
            weeks={weeks || []}
            profiles={profiles || []}
        />
      </div>
    </div>
  );
}