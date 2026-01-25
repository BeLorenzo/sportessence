"use server";

import { createClient } from "@/app/utils/supabase/server";
import { revalidatePath } from "next/cache";

// 1. REGISTRA PAGAMENTO
export async function registerPayment(enrollmentId: string, amountToAdd: number) {
  const supabase = await createClient();
  
  // Prima prendiamo il valore attuale
  const { data: current, error: fetchError } = await supabase
    .from('enrollments')
    .select('pagato')
    .eq('id', enrollmentId)
    .single();
    
  if (fetchError || !current) return { success: false, error: "Iscrizione non trovata" };

  const newTotal = (current.pagato || 0) + amountToAdd;

  const { error } = await supabase
    .from('enrollments')
    .update({ pagato: newTotal })
    .eq('id', enrollmentId);

  if (error) return { success: false, error: error.message };
  
  // Aggiorna la cache della pagina per vedere subito il cambiamento
  revalidatePath('/admin'); 
  return { success: true };
}

// 2. APPLICA SCONTO TESSERAMENTO
export async function applyMembershipDiscount(enrollmentId: string, discountAmount: number) {
  const supabase = await createClient();

  // Prendiamo il prezzo attuale
  const { data: current } = await supabase
    .from('enrollments')
    .select('prezzo_totale')
    .eq('id', enrollmentId)
    .single();

  if (!current) return { success: false, error: "Errore lettura prezzo" };

  // Applichiamo lo sconto
  const { error } = await supabase
    .from('enrollments')
    .update({ 
      prezzo_totale: current.prezzo_totale - discountAmount,
      // Magari salviamo un flag per dire che lo sconto è stato applicato
      // membership_verified: true 
    })
    .eq('id', enrollmentId);

  if (error) return { success: false, error: error.message };
  
  revalidatePath('/admin');
  return { success: true };
}

// 3. MODIFICA COMPLETA (Override Prezzo e Campo)
// Nota: La modifica delle settimane richiede una logica complessa di cancellazione/inserimento
// che va gestita con cura. Qui gestiamo l'override del prezzo e cambio campo.
export async function updateEnrollmentDetails(
  enrollmentId: string, 
  newPrice: number, 
  newCampId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('enrollments')
    .update({ 
      prezzo_totale: newPrice,
      camp_id: newCampId
    })
    .eq('id', enrollmentId);

  if (error) return { success: false, error: error.message };

  revalidatePath('/admin');
  return { success: true };
}