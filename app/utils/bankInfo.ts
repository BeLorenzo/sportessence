export const BANK_INFO = {
  intestatario: "Sport Essence",
  banca: "Banca Popolare di Como",
  iban: "IT56I0306909606100000409540",
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