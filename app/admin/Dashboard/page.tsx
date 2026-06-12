import { createClient } from "@/app/utils/supabase/server";
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminDashboardPage() {
  const supabaseAuth = await createClient();
  const { data: { user } } = await supabaseAuth.auth.getUser();
  
  if (!user || user.app_metadata?.role !== 'admin') {
     redirect('/');
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    { auth: { persistSession: false } }
  );

  // A. Campi 
  const { data: camps, error: campError } = await supabaseAdmin
    .from('camps')
    .select(`
      id, 
      nome, 
      indirizzo_paese, 
      sibling_discount_value, 
      sibling_discount_week_price,
      price_half_day, 
      price_pre, 
      price_post, 
      price_pre_post_bundle,
      camp_weeks (id, label, data_inizio, data_fine),
      camp_pricing_tiers (price_per_week, min_weeks, discount_percent)
  `).order('nome');
  
  if (campError) console.error("Errore Campi:", campError);

  const formattedCamps = (camps || []).map((c: any) => ({
    ...c,
    prezzo_base_indicativo: c.camp_pricing_tiers?.sort((a:any, b:any) => a.min_weeks - b.min_weeks)[0]?.price_per_week || 0
  }));

  // B. Settimane
  const { data: weeks } = await supabaseAdmin
    .from('camp_weeks')
    .select('id, camp_id, label, data_inizio, data_fine')
    .order('data_inizio');

  // C. Profili Genitori
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, nome, cognome, email, telefono, indirizzo_via, indirizzo_civico, indirizzo_paese, indirizzo_cap, cf, email_contatti');

  // ---> NUOVO: ESTRAIAMO TUTTI I BAMBINI <---
  const { data: childrenData } = await supabaseAdmin
    .from('children')
    .select('*');

  // D. Iscrizioni
  const { data: enrollments, error: enrollError } = await supabaseAdmin
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
            camps={formattedCamps || []}
            weeks={weeks || []}
            profiles={profiles || []}
            childrenData={childrenData || []} // Passiamo i bambini
        />
      </div>
    </div>
  );
}