/* eslint-disable jsx-a11y/alt-text */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// Palette colori professionale
const COLORS = {
  primary: '#1e3a8a',       // Blu scuro istituzionale
  primaryLight: '#eff6ff',  // Azzurro chiarissimo per sfondi
  headerBg: '#2563eb',      // Blu brillante per header tabelle
  text: '#1f2937',          // Grigio scuro (quasi nero)
  textLight: '#6b7280',     // Grigio medio
  border: '#d1d5db',        // Grigio chiaro per bordi
  rowEven: '#ffffff',
  rowOdd: '#f9fafb',        // Grigio chiarissimo per righe alternate
  warning: '#dc2626',       // Rosso per intolleranze
  accent: '#f59e0b',        // Arancio per dettagli
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 75,
    paddingBottom: 40,
    paddingHorizontal: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLORS.text,
  },

  // === HEADER FISSO ===
  headerContainer: {
    position: 'absolute',
    top: 15,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: 8,
  },
  logo: {
    width: 140,
    height: 50,
    objectFit: 'contain',
  },
  headerInfo: {
    alignItems: 'flex-end',
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  subTitle: {
    fontSize: 11,
    color: COLORS.text,
    marginTop: 2,
  },
  metaBadge: {
    fontSize: 8,
    backgroundColor: COLORS.primaryLight,
    color: COLORS.primary,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginTop: 4,
    fontWeight: 'bold',
  },

  // === GRUPPI ETA ===
  section: {
    marginBottom: 15,
  },
  sectionTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  sectionTitle: {
    color: COLORS.rowEven,
    fontWeight: 'bold',
    fontSize: 9,
  },

  // === TABELLA ===
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 0, 
  },
  
  // Header Tabella
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    height: 20,
    alignItems: 'center',
  },
  th: {
    color: '#ffffff',
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.3)',
    height: '100%',
    justifyContent: 'center',
    paddingTop: 4, 
  },
  
  // Sub-header (E / U)
  subHeader: {
    flexDirection: 'row',
    height: 12,
    backgroundColor: COLORS.primaryLight,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  subThCell: {
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subThText: {
    fontSize: 6,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // Righe
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    minHeight: 24,
    alignItems: 'stretch',
  },
  cell: {
    fontSize: 8,
    padding: 3,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 7,
  },
  cellSubText: {
    fontSize: 6,
    color: COLORS.textLight,
    marginTop: 1,
  },
  
  // Celle Giornaliere (E/U)
  dayCellContainer: {
    flexDirection: 'row',
    flex: 1,
    height: '100%',
  },
  daySubCell: {
    flex: 1, 
    borderRightWidth: 1,
    borderRightColor: COLORS.border, 
  },
  daySubCellLast: {
    flex: 1,
    borderRightWidth: 0,
  },

  // === COLONNE ===
  wChild: { width: '18%' },
  wParent: { width: '18%' },
  wDay: { width: '10.8%' }, 
  wNotes: { width: '10%' }, 

  // === FOOTER ===
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textLight,
  },
});

export interface ChildData {
  nome: string;
  cognome: string;
  eta: number;
  genitore: string;
  telefono: string;
  intolleranze: string;
  taglia?: string; // <--- AGGIUNTO QUI
}

export interface PresenzeData {
  campName: string;
  weekLabel: string;
  weekDates: {
    start: string;
    end: string;
  };
  children: ChildData[];
}

export const PresenzePDF = ({ data }: { data: PresenzeData }) => {
  const childrenByAge: { [key: number]: ChildData[] } = {};
  data.children.forEach((child) => {
    if (!childrenByAge[child.eta]) {
      childrenByAge[child.eta] = [];
    }
    childrenByAge[child.eta].push(child);
  });

  const sortedAges = Object.keys(childrenByAge)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        
        {/* HEADER FISSO */}
        <View style={styles.headerContainer} fixed>
          <Image src="/imgs/logoPDF.png" style={styles.logo} />
          <View style={styles.headerInfo}>
            <Text style={styles.mainTitle}>Registro Presenze</Text>
            <Text style={styles.subTitle}>{data.campName}</Text>
            <Text style={styles.metaBadge}>{data.weekLabel} • {data.weekDates.start} - {data.weekDates.end}</Text>
          </View>
        </View>

        {/* CONTENUTO */}
        {sortedAges.map((age) => {
          const ageGroup = childrenByAge[age];
          
          return (
            <View key={age} style={styles.section}>
              
              <View style={styles.sectionTitleBox}>
                <Text style={styles.sectionTitle}>GRUPPO {age} ANNI ({ageGroup.length})</Text>
              </View>

              <View style={styles.table}>
                
                {/* Header */}
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, styles.wChild]}>BAMBINO</Text>
                  <Text style={[styles.th, styles.wParent]}>GENITORE</Text>
                  <Text style={[styles.th, styles.wDay]}>LUN</Text>
                  <Text style={[styles.th, styles.wDay]}>MAR</Text>
                  <Text style={[styles.th, styles.wDay]}>MER</Text>
                  <Text style={[styles.th, styles.wDay]}>GIO</Text>
                  <Text style={[styles.th, styles.wDay]}>VEN</Text>
                  <Text style={[styles.th, styles.wNotes, { borderRightWidth: 0 }]}>NOTE</Text>
                </View>

                {/* Sub Header */}
                <View style={styles.subHeader}>
                  <View style={[styles.subThCell, styles.wChild]} />
                  <View style={[styles.subThCell, styles.wParent]} />
                  {[...Array(5)].map((_, i) => (
                    <View key={i} style={[styles.dayCellContainer, styles.wDay]}>
                      <View style={[styles.daySubCell, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={styles.subThText}>E</Text>
                      </View>
                      <View style={[styles.daySubCellLast, { justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={styles.subThText}>U</Text>
                      </View>
                    </View>
                  ))}
                  <View style={[styles.subThCell, styles.wNotes, { borderRightWidth: 0 }]} />
                </View>

                {/* Rows */}
                {ageGroup.map((child, idx) => (
                  <View 
                    key={idx} 
                    style={[
                      styles.row, 
                      { backgroundColor: idx % 2 === 0 ? COLORS.rowEven : COLORS.rowOdd }
                    ]}
                  >
                    {/* Bambino + Taglia */}
                    <View style={[styles.cell, styles.wChild]}>
                      <Text style={[styles.cellText, { fontWeight: 'bold' }]}>
                        {child.cognome} {child.nome} 
                        {/* Taglia aggiunta qui a fianco */}
                        {child.taglia ? <Text style={{ color: COLORS.textLight, fontSize: 6, fontWeight: 'normal' }}> ({child.taglia})</Text> : null}
                      </Text>
                    </View>

                    {/* Genitore */}
                    <View style={[styles.cell, styles.wParent]}>
                      <Text style={styles.cellText}>{child.genitore}</Text>
                      <Text style={styles.cellSubText}>{child.telefono}</Text>
                    </View>

                    {/* Giorni */}
                    {[...Array(5)].map((_, dayIdx) => (
                      <View key={dayIdx} style={[styles.cell, styles.wDay, { padding: 0 }]}>
                        <View style={styles.dayCellContainer}>
                          <View style={styles.daySubCell} />
                          <View style={styles.daySubCellLast} />
                        </View>
                      </View>
                    ))}

                    {/* Note */}
                    <View style={[styles.cell, styles.wNotes, { borderRightWidth: 0 }]}>
                      <Text style={{ 
                        fontSize: 6,
                        color: child.intolleranze ? COLORS.warning : COLORS.textLight,
                        fontWeight: child.intolleranze ? 'bold' : 'normal'
                      }}>
                        {child.intolleranze || '-'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* FOOTER */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Legenda: E = Entrata | U = Uscita</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Pag. ${pageNumber} / ${totalPages}`} />
        </View>

      </Page>
    </Document>
  );
};