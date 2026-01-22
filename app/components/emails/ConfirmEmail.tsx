import * as React from 'react';

// 1. Aggiorniamo l'interfaccia per accettare i nuovi dati
interface EmailProps {
  parentName: string;
  childName: string;
  childCF: string;        // <--- AGGIUNTO
  campName: string;
  amount: number;
  iban: string;
  reservationId: string;  // <--- AGGIUNTO
}

// 2. IMPORTANTE: Rimuovi 'async' se c'era. Deve essere una const normale.
export const ConfirmEmail: React.FC<EmailProps> = ({
  parentName,
  childName,
  childCF,
  campName,
  amount,
  iban,
  reservationId
}) => {
  // Logica causale
  const shortId = reservationId ? reservationId.slice(0, 8).toUpperCase() : '---';
  const causale = `Iscr. ${childName} - ${campName} (Rif: ${shortId} - CF: ${childCF})`;

  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#333', lineHeight: '1.5' }}>
      <h1 style={{ color: '#0891b2', marginBottom: '24px' }}>Iscrizione Confermata! 🎉</h1>
      
      <p style={{ fontSize: '16px' }}>Ciao <strong>{parentName}</strong>,</p>
      
      <p style={{ fontSize: '16px' }}>
        Abbiamo ricevuto correttamente la richiesta di iscrizione per <strong>{childName}</strong> al campo <strong>{campName}</strong>.
      </p>
      
      <div style={{ background: '#fffbeb', padding: '24px', borderRadius: '12px', border: '1px solid #fcd34d', margin: '30px 0' }}>
        <h3 style={{ marginTop: 0, color: '#92400e' }}>Dettagli per il Bonifico</h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0', color: '#78350f', fontSize: '14px' }}>Importo:</td>
              <td style={{ padding: '8px 0', fontWeight: 'bold', fontSize: '18px', color: '#000' }}>€{amount.toFixed(2)}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#78350f', fontSize: '14px' }}>IBAN:</td>
              <td style={{ padding: '8px 0', fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold' }}>{iban}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#78350f', fontSize: '14px' }}>Intestatario:</td>
              <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Sport Essence ASD</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0', color: '#78350f', fontSize: '14px', verticalAlign: 'top' }}>Causale:</td>
              <td style={{ padding: '8px 0', fontStyle: 'italic', background: '#fff', border: '1px solid #fae8b4', paddingLeft: '8px', borderRadius: '4px' }}>
                {causale}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ fontSize: '14px', color: '#666' }}>
        L'iscrizione sarà effettiva alla ricezione del bonifico. Ti preghiamo di effettuarlo entro 3 giorni lavorativi.
      </p>

      <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '30px 0' }} />
      
      <p style={{ fontSize: '12px', color: '#999' }}>
        Sport Essence ASD<br/>
        Questa è una email automatica, non rispondere direttamente.
      </p>
    </div>
  );
};

export default ConfirmEmail;