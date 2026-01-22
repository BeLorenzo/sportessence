export const BANK_INFO = {
  intestatario: "Sport Essence ASD",
  banca: "Banca Popolare di Como",
  iban: "IT 88 K 05034 10900 000000123456", // Esempio fittizio
  bic_swift: "BPCOIT22XXX"
};

export const getCausale = (
  nome: string, 
  cognome: string, 
  campo: string, 
  reservationId: string, 
  cf: string
) => {
  // Prendiamo solo i primi 8 caratteri dell'ID per non fare una causale chilometrica
  const shortId = reservationId.slice(0, 8).toUpperCase();
  return `Iscr. ${nome} ${cognome} - ${campo} (Rif: ${shortId} - CF: ${cf})`;
};