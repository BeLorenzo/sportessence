/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import logoImg from '../../public/imgs/logoPdf.png'; 
import firmaImg from '../../public/imgs/firmaPdf.png'; 

// NESSUNA REGISTRAZIONE FONT - Usiamo Helvetica (font di default, sempre disponibile)

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingTop: 30,
    fontSize: 11,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    color: '#000',
    position: 'relative',
  },
  
  // --- DATA IN ALTO A DESTRA ---
  dateAbsolute: {
    position: 'absolute',
    top: 30,
    right: 40,
    fontSize: 10,
    color: '#000',
  },

  // --- HEADER & LOGO ---
  headerSection: {
    marginBottom: 20,
    marginTop: 5,
  },
  logoBig: {
    width: 200,
    height: 100,
    objectFit: 'contain',
  },

  // --- TITOLO PRINCIPALE ---
  declarationTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 20,
    marginTop: 15,
    color: '#000',
    textAlign: 'left',
  },

  // --- CORPO DEL TESTO ---
  bodyText: {
    marginBottom: 25,
    textAlign: 'justify',
    lineHeight: 1.6,
    fontSize: 11,
    color: '#000',
  },
  bold: {
    fontWeight: 700,
    textTransform: 'uppercase',
  },

  // --- BOX RIEPILOGO ---
  summaryBox: {
    border: '1.5pt solid #000',
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  summaryTitle: {
    fontWeight: 700,
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
    color: '#000',
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingBottom: 4,
  },
  summaryLabel: {
    width: '50%',
    fontSize: 11,
    color: '#000',
  },
  summaryValue: {
    width: '50%',
    fontSize: 11,
    color: '#000',
    textAlign: 'left',
  },

  // --- NOTA LEGALE SOTTO RIEPILOGO ---
  legalNoteAfterSummary: {
    fontSize: 9,
    color: '#000',
    textAlign: 'justify',
    lineHeight: 1.4,
    marginBottom: 20,
  },

  // --- SEZIONE LOCATION E FIRMA VERTICALE ---
  locationAndSignatureSection: {
    marginBottom: 20,
  },
  locationText: {
    fontSize: 11,
    color: '#000',
    marginBottom: 10,
  },
  signatureImage: {
    width: 150,
    height: 90,
    objectFit: 'contain',
  },

  // --- LOGO CENTRALE SOPRA FOOTER ---
  centralLogoSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 15,
  },
  logoCentral: {
    width: 180,
    height: 90,
    objectFit: 'contain',
    opacity: 0.7,
  },

  // --- FOOTER AZIENDA ---
  companyFooter: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    borderTop: '0.5pt solid #ccc',
    paddingTop: 10,
  },
  companyInfo: {
    fontSize: 8,
    color: '#000',
    textAlign: 'center',
  },
  companyName: {
    fontWeight: 700,
    marginBottom: 2,
  },
});

export interface RicevutaData {
  dataPagamento: string;
  dataEmissione: string;
  genitore: string;
  bambino: string;
  codiceFiscale: string;
  importo: number;
  nomeCampo: string;
  causale: string;
}

export const RicevutaPDF = ({ data }: { data: RicevutaData }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* DATA IN ALTO A DESTRA */}
        <View style={styles.dateAbsolute}>
          <Text>Data: {data.dataEmissione}</Text>
        </View>

        {/* LOGO */}
        <View style={styles.headerSection}>
          <Image style={styles.logoBig} src={logoImg.src} />
        </View>

        {/* TITOLO */}
        <Text style={styles.declarationTitle}>SI DICHIARA</Text>

        {/* CORPO */}
        <Text style={styles.bodyText}>
          Di aver ricevuto dal Sig./Sig.ra <Text style={styles.bold}>{data.genitore}</Text>{'\n'}
          quale esercente la patria potestà di <Text style={styles.bold}>{data.bambino}</Text>, 
          codice fiscale <Text style={styles.bold}>{data.codiceFiscale}</Text>{'\n'}
          la somma di <Text style={styles.bold}>{data.importo}€</Text> in data <Text style={styles.bold}>{data.dataPagamento}</Text>
        </Text>

        {/* BOX RIEPILOGO */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>RIEPILOGO</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Importo totale corrisposto:</Text>
            <Text style={styles.summaryValue}>{data.importo} €</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Data:</Text>
            <Text style={styles.summaryValue}>{data.dataPagamento}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Attività Sportiva Praticata:</Text>
            <Text style={styles.summaryValue}>{data.nomeCampo}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Categoria di pagamento:</Text>
            <Text style={styles.summaryValue}>{data.causale}</Text>
          </View>
        </View>

        {/* NOTA LEGALE SOTTO IL RIEPILOGO */}
        <Text style={styles.legalNoteAfterSummary}>
          Prestazione sportiva dilettantistica non soggetta ad Iva per mancanza dei presupposti di cui all'art. 4, D.P.R. 633/1972 – ricevuta esente da imposta di bollo per la legge finanziaria del 2019 (Legge n. 145) al comma 646.
        </Text>

        {/* LOCATION E FIRMA (VERTICALE) */}
        <View style={styles.locationAndSignatureSection}>
          <Text style={styles.locationText}>
            Como (Co), {data.dataPagamento}
          </Text>
          <Image style={styles.signatureImage} src={firmaImg.src} />
        </View>

        {/* LOGO CENTRALE SOPRA FOOTER */}
        <View style={styles.centralLogoSection}>
          <Image style={styles.logoCentral} src={logoImg.src} />
        </View>

        {/* FOOTER AZIENDA */}
        <View style={styles.companyFooter}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>Via Mascherpa, 4 (Como) - Cod.Fisc. 95150810133</Text>
            <Text>email: sportessence.asd.aps@gmail.com</Text>
            <Text>IT56I0306909606100000409540</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};