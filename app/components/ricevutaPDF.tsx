/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import logoImg from '../../public/imgs/logoPdf.png'; 
import firmaImg from '../../public/imgs/firmaPdf.png'; 

// FUNZIONE HELPER per ottenere l'URL base
const getBaseUrl = () => {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
};

// REGISTRAZIONE FONT LOCALE
// Nota: react-pdf caricherà il font via HTTP dalla tua cartella public
Font.register({
  family: 'Open Sans',
  fonts: [
    { src: `${getBaseUrl()}/fonts/OpenSans-Regular.ttf` },
    { src: `${getBaseUrl()}/fonts/OpenSans-Bold.ttf`, fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Open Sans', // ORA USIAMO IL FONT SCARICATO
    lineHeight: 1.4,
    color: '#333',
    position: 'relative',
  },
  
  // --- HEADER & LOGO ---
  headerSection: {
    flexDirection: 'row',
    marginBottom: 10,
    marginTop: 10,
  },
  logoBig: {
    width: 220,
    height: 120,
    objectFit: 'contain',
  },
  dateAbsolute: {
    position: 'absolute',
    top: 40,
    right: 40,
    fontSize: 10,
    color: '#black',
  },

  // --- TITOLI ---
  declarationTitle: {
    fontSize: 18,
    fontWeight: 700, // Usa il bold registrato sopra
    marginBottom: 15,
    marginTop: 10,
    color: '#004aad',
    textTransform: 'uppercase',
    textAlign: 'left',
  },

  // --- CORPO ---
  body: {
    marginBottom: 25,
    textAlign: 'justify',
    lineHeight: 1.6,
    fontSize: 11,
  },
  bold: {
    fontWeight: 700, // Grassetto vero
    color: '#000',
  },

  // --- RIEPILOGO ---
  summaryBox: {
    border: '1pt solid #ddd',
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
    padding: 15,
    marginBottom: 30,
  },
  summaryTitle: {
    fontWeight: 700,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
    color: '#004aad',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
    borderBottom: '1pt dotted #ccc',
    paddingBottom: 2,
  },
  label: {
    width: 200,
    fontWeight: 700,
    fontSize: 10,
    color: '#555',
  },
  value: {
    flex: 1,
    fontSize: 11,
    color: '#000',
  },

  // --- SEZIONE BASSA ---
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 10,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 11,
    color: '#444',
    marginBottom: 5,
  },
  
  signatureContainer: {
    alignItems: 'center',
    width: 200,
  },
  signatureLabel: {
    fontSize: 8,
    color: '#888',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  signatureImage: {
    width: 120, 
    height: 60,
    objectFit: 'contain',
    marginBottom: -15,
    zIndex: 10,
    marginLeft: 20,
  },
  signatureLine: {
    width: '100%',
    borderBottom: '1pt solid #000',
    marginTop: 5,
  },

  smallLogoContainer: {
    alignItems: 'center',
    marginBottom: 10,
    opacity: 0.5,
  },
  logoSmall: {
    width: 30,
    height: 30,
    objectFit: 'contain',
  },

  footer: {
    marginTop: 'auto',
    fontSize: 8,
    color: '#777',
    textAlign: 'center',
    borderTop: '1pt solid #eee',
    paddingTop: 10,
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
        
        <View style={styles.dateAbsolute}>
          <Text>Emessa il: {data.dataEmissione}</Text>
        </View>

        <View style={styles.headerSection}>
          <Image style={styles.logoBig} src={logoImg.src} />
        </View>

        <Text style={styles.declarationTitle}>SI DICHIARA</Text>

        <View style={styles.body}>
          <Text>
            Di aver ricevuto dal Sig./Sig.ra <Text style={styles.bold}>{data.genitore}</Text>, 
            quale esercente la patria potestà di <Text style={styles.bold}>{data.bambino}</Text> 
            (C.F. <Text style={styles.bold}>{data.codiceFiscale}</Text>), 
            la somma di <Text style={styles.bold}>{data.importo}€</Text> in data <Text style={styles.bold}>{data.dataPagamento}</Text>.
          </Text>
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>RIEPILOGO TRANSAZIONE</Text>
          
          <View style={styles.row}>
            <Text style={styles.label}>Importo versato:</Text>
            <Text style={styles.value}>{data.importo} €</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Data incasso:</Text>
            <Text style={styles.value}>{data.dataPagamento}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Attività:</Text>
            <Text style={styles.value}>{data.nomeCampo}</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Causale:</Text>
            <Text style={styles.value}>{data.causale}</Text>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <Text style={styles.locationText}>
            Como (CO), {data.dataPagamento}
          </Text>

          <View style={styles.signatureContainer}>
            <Text style={styles.signatureLabel}>L'Amministrazione</Text>
            <Image style={styles.signatureImage} src={firmaImg.src} />
            <View style={styles.signatureLine} />
          </View>
        </View>

        <View style={styles.smallLogoContainer}>
           <Image style={styles.logoSmall} src={logoImg.src} />
        </View>

        <View style={styles.footer}>
          <Text>
            Prestazione sportiva dilettantistica non soggetta ad IVA (art. 4, D.P.R. 633/1972).
          </Text>
          <Text>
            Esente da bollo (Legge n. 145/2018, comma 646).
          </Text>
          <Text style={{ marginTop: 5, fontWeight: 700, color: '#004aad' }}>
            SPORTESSENCE - Via Mascherpa, 4 (Como) - C.F. 95150810133
          </Text>
          <Text>sportessence.asd.aps@gmail.com</Text>
        </View>

      </Page>
    </Document>
  );
};