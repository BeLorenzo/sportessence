import * as React from 'react';

interface PaymentConfirmEmailProps {
  parentName: string;
  childName: string;
  campName: string;
  amount: number;
  paymentDate: string;
  dashboardUrl: string;
}

export const PaymentConfirmEmail: React.FC<PaymentConfirmEmailProps> = ({
  parentName,
  childName,
  campName,
  amount,
  paymentDate,
  dashboardUrl
}) => {
  
  const styles = {
    container: {
      fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
      backgroundColor: '#ffffff',
      color: '#333333',
      lineHeight: '1.6',
      fontSize: '16px',
      maxWidth: '600px',
      margin: '0',
      padding: '20px'
    },
    header: {
      borderBottom: '2px solid #0891b2', // Linea colorata del brand
      paddingBottom: '20px',
      marginBottom: '30px'
    },
    title: {
      color: '#0891b2',
      fontSize: '22px',
      margin: '0',
      fontWeight: 'bold' as const
    },
    highlight: {
      color: '#0891b2',
      fontWeight: 'bold' as const
    },
    amount: {
      fontSize: '18px',
      fontWeight: 'bold' as const,
      color: '#059669' // Verde smeraldo professionale
    },
    buttonContainer: {
      marginTop: '35px',
      marginBottom: '35px'
    },
    button: {
      backgroundColor: '#0891b2',
      color: '#ffffff',
      padding: '12px 25px',
      textDecoration: 'none',
      fontWeight: 'bold' as const,
      borderRadius: '4px', // Bordi poco arrotondati, più seri
      display: 'inline-block'
    },
    footer: {
      marginTop: '40px',
      paddingTop: '20px',
      borderTop: '1px solid #eeeeee',
      fontSize: '12px',
      color: '#888888'
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Header semplice con Titolo */}
      <div style={styles.header}>
        <h1 style={styles.title}>SportEssence - Conferma Pagamento</h1>
      </div>

      {/* Corpo del testo discorsivo e formale */}
      <p>Gentile <strong>{parentName}</strong>,</p>

      <p>
        Ti confermiamo con piacere la ricezione del saldo per l'iscrizione di <strong>{childName}</strong>.
      </p>

      <p>
        Di seguito il riepilogo della transazione registrata in data {paymentDate}:
      </p>

      {/* Lista pulita invece di tabelle/box */}
      <ul style={{ paddingLeft: '20px', margin: '20px 0', color: '#555' }}>
        <li style={{ marginBottom: '10px' }}>
          Attività: <span style={{ color: '#000', fontWeight: 'bold' }}>{campName}</span>
        </li>
        <li style={{ marginBottom: '10px' }}>
          Importo Saldato: <span style={styles.amount}>€{amount.toFixed(2)}</span>
        </li>
      </ul>

      <p>
        L'iscrizione risulta ora <strong>saldata</strong> e la relativa ricevuta è stata generata nei nostri sistemi pronta per essere scaricata dalla sua pagina Iscrizioni.
      </p>

      {/* Call to Action discreta */}
      <div style={styles.buttonContainer}>
        <a href={dashboardUrl} style={styles.button}>
          Vai alla tua Area Riservata
        </a>
      </div>

      <p>
        Restiamo a disposizione per qualsiasi necessità.
        <br />
        Un cordiale saluto,
      </p>

      <p style={{ fontWeight: 'bold', marginTop: '20px' }}>
        Il Team SportEssence
      </p>

      {/* Footer minimale */}
      <div style={styles.footer}>
        <p style={{ margin: 0 }}>
          SportEssence A.S.D. - Via Mascherpa, 4 - Como (CO)<br />
          Email: sportessence.asd.aps@gmail.com
        </p>
      </div>

    </div>
  );
};

export default PaymentConfirmEmail;
