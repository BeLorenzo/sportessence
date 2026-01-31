import * as React from 'react';

interface PaymentConfirmEmailProps {
  parentName: string;
  childName: string;
  campName: string;
  amount: number;
  paymentDate: string;
  dashboardUrl: string; // URL per andare allo storico
}

export const PaymentConfirmEmail: React.FC<PaymentConfirmEmailProps> = ({
  parentName,
  childName,
  campName,
  amount,
  paymentDate,
  dashboardUrl
}) => {
  return (
    <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: '#333', lineHeight: '1.6' }}>
      <h1 style={{ color: '#10b981', marginBottom: '24px' }}>Pagamento Confermato! ✅</h1>
      
      <p>Ciao <strong>{parentName}</strong>,</p>
      
      <p>
        Ti confermiamo di aver ricevuto il saldo di <strong>€{amount.toFixed(2)}</strong> per l'iscrizione 
        di <strong>{childName}</strong> al campo <strong>{campName}</strong>.
      </p>

      <div style={{ background: '#f3f4f6', padding: '15px', borderRadius: '8px', margin: '20px 0', textAlign: 'center' }}>
        <p style={{ margin: 0, color: '#4b5563', fontSize: '14px' }}>
          Data pagamento: <strong>{paymentDate}</strong>
        </p>
      </div>

      <p>
        La tua <strong>ricevuta ufficiale</strong> è stata generata ed è disponibile per il download nella tua area personale.
      </p>

      <div style={{ textAlign: 'center', margin: '30px 0' }}>
        <a 
          href={dashboardUrl}
          style={{
            backgroundColor: '#0284c7', // Cyan-600 simile al tuo sito
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block'
          }}
        >
          Vai allo Storico Iscrizioni
        </a>
      </div>

      <p style={{ fontSize: '12px', color: '#999', marginTop: '30px' }}>
        Sport Essence ASD - Questa è una email automatica.
      </p>
    </div>
  );
};

export default PaymentConfirmEmail;