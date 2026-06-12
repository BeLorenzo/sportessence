import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const pdfStyles = StyleSheet.create({
  page: { padding: 30, fontSize: 10 },
  title: { fontSize: 16, marginBottom: 20, fontWeight: 'bold', textAlign: 'center', color: '#1e3a8a' },
  table: { display: 'flex', width: 'auto', borderStyle: 'solid', borderWidth: 1, borderColor: '#d1d5db', borderRightWidth: 0, borderBottomWidth: 0 },
  tableRow: { margin: 'auto', flexDirection: 'row' },
  tableColHeader: { borderStyle: 'solid', borderColor: '#d1d5db', borderBottomWidth: 1, borderRightWidth: 1, backgroundColor: '#f3f4f6', padding: 5 },
  tableCol: { borderStyle: 'solid', borderColor: '#d1d5db', borderBottomWidth: 1, borderRightWidth: 1, padding: 5 },
  tableCellHeader: { margin: 2, fontSize: 10, fontWeight: 'bold', color: '#374151' },
  tableCell: { margin: 2, fontSize: 10, color: '#4b5563' }
});

export const ContattiPDF = ({ data, campName }: any) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <Text style={pdfStyles.title}>Lista Contatti - {campName}</Text>
      <View style={pdfStyles.table}>
        {/* INTESTAZIONI */}
        <View style={pdfStyles.tableRow}>
          <View style={[pdfStyles.tableColHeader, { width: '25%' }]}><Text style={pdfStyles.tableCellHeader}>Genitore</Text></View>
          <View style={[pdfStyles.tableColHeader, { width: '25%' }]}><Text style={pdfStyles.tableCellHeader}>Bambino</Text></View>
          <View style={[pdfStyles.tableColHeader, { width: '7%' }]}><Text style={pdfStyles.tableCellHeader}>Taglia</Text></View>
          <View style={[pdfStyles.tableColHeader, { width: '15%' }]}><Text style={pdfStyles.tableCellHeader}>Telefono</Text></View>
          <View style={[pdfStyles.tableColHeader, { width: '28%' }]}><Text style={pdfStyles.tableCellHeader}>Email</Text></View>
        </View>
        {/* RIGHE DATI */}
        {data.map((row: any, i: any) => (
          <View style={pdfStyles.tableRow} key={i} wrap={false}>
            <View style={[pdfStyles.tableCol, { width: '25%' }]}><Text style={pdfStyles.tableCell}>{row.genitore}</Text></View>
            <View style={[pdfStyles.tableCol, { width: '25%' }]}><Text style={pdfStyles.tableCell}>{row.bambino}</Text></View>
            <View style={[pdfStyles.tableCol, { width: '7%' }]}><Text style={pdfStyles.tableCell}>{row.taglia}</Text></View>
            <View style={[pdfStyles.tableCol, { width: '15%' }]}><Text style={pdfStyles.tableCell}>{row.telefono}</Text></View>
            <View style={[pdfStyles.tableCol, { width: '28%' }]}><Text style={pdfStyles.tableCell}>{row.email}</Text></View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);