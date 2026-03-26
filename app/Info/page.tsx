import { Mail } from "lucide-react";
import Link from "next/link";

export default function InfoUtili() {
  return (
    <main className="min-h-screen bg-cream">
      {/* Hero Section - IDENTICO A CAMPI */}
      <section className="bg-blue-light text-white py-20 px-6 shadow-xl">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            Informazioni Utili
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Tutto quello che devi sapere sui nostri campi estivi
          </p>
        </div>
      </section>

      {/* Sezione Generale */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-deep mb-8 text-center">
              Informazioni Generali
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-blue-deep mb-3">
                  📅 Periodo e Orari
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  I nostri campi estivi si svolgono da giugno a settembre. 
                  L'orario standard è dalle 8:30 alle 16:30, con possibilità di pre-accoglienza 
                  dalle 7:30 e post-accoglienza fino alle 17:30.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-deep mb-3">
                  👥 Età Partecipanti
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Accettiamo bambini e ragazzi dai 3 ai 18 anni. I gruppi sono 
                  organizzati per fasce d'età per garantire attività appropriate 
                  e stimolanti per tutti.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-deep mb-3">
                  🏃 Rapporto Educatori/Bambini
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Manteniamo un rapporto di 1 educatore ogni 8-10 bambini per garantire 
                  un'attenzione personalizzata e la massima sicurezza durante tutte le attività.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-deep mb-3">
                  🍽️ Pranzo e Merende
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Il pranzo è preparato da una mensa convenzionata 
                  con menù bilanciati e approvati da nutrizionisti. Sono disponibili 
                  menù per esigenze alimentari speciali (celiachia, allergie, vegetariani).
                  Il costo per l'accesso al pranzo è di 5€ da pagare giornalmente in loco.
                  Le merende di metà mattina e pomeriggio sono fornite dall'organizzazione.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Iscrizioni */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-deep mb-8 text-center">
              Iscrizioni e Pagamenti
            </h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Come posso iscrivere mio figlio?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  L'iscrizione avviene online attraverso il nostro sito. Dopo la registrazione, 
                  potrai accedere alla tua area personale e completare l'iscrizione compilando 
                  i dati del bambino/ragazzo e scegliendo le settimane desiderate.
                </p>
              </div>

              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Qual è l'età minima per partecipare?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  I nostri campi estivi accolgono bambini e ragazzi <strong>dai 3 ai 18 anni</strong>. 
                  I gruppi sono organizzati per fasce d'età per garantire attività appropriate 
                  e stimolanti per tutti.
                </p>
              </div>

              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Quando aprono le iscrizioni?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Le iscrizioni aprono generalmente a Febbraio per la stagione estiva. 
                  Ti consigliamo di iscriverti il prima possibile perché i posti sono limitati 
                  e le settimane più richieste si riempiono velocemente.
                </p>
              </div>

              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  È possibile iscriversi per singole settimane?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Sì!</strong> Puoi scegliere liberamente le settimane che preferisci, non c'è obbligo 
                  di iscrizione per l'intera estate. Offriamo anche sconti per chi si iscrive 
                  a più settimane.
                </p>
              </div>

              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Quali sono i costi?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  I costi variano in base al tipo di campo e alla durata. Indicativamente, 
                  una settimana costa intorno ai 100€. Nella pagina di ciascun campo trovi 
                  i dettagli specifici. Offriamo sconti per fratelli e per iscrizioni multiple.
                </p>
              </div>

              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Come funziona il pagamento?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Dopo aver completato l'iscrizione online, riceverai le istruzioni per il pagamento via bonifico bancario. 
                  È richiesto un acconto di 15€ al momento dell'iscrizione per confermarla. Il saldo può essere versato liberamente 
                  anche in più soluzioni, purché sia interamente saldato entro il venerdì della settimana precedente all'inizio del campo.
                </p>
              </div>

              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Ci sono sconti per fratelli?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Sì!</strong> Offriamo uno sconto dal secondo figlio in poi. Lo sconto viene applicato automaticamente 
                  al momento del calcolo della quota.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Documenti */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-deep mb-8 text-center">
              Documenti Necessari
            </h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Quali documenti servono per l'iscrizione?
                </h3>
                <p className="text-gray-700 mb-2">
                  Per completare l'iscrizione sono necessari:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Modulo di autorizzazione compilato e firmato (fornito da noi)</li>
                  <li>Eventuali certificazioni per allergie o necessità particolari</li>
                </ul>
              </div>

              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Mio figlio ha allergie/intolleranze, cosa devo fare?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  È fondamentale segnalarlo al momento dell'iscrizione e fornire 
                  certificazione medica dettagliata. Collaboriamo con la mensa per 
                  garantire menù adeguati e i nostri educatori sono formati per gestire 
                  situazioni di emergenza.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Attività */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-deep mb-8 text-center">
              Attività e Organizzazione
            </h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Che tipo di attività vengono proposte?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Ogni giorno proponiamo un mix bilanciato di attività sportive (calcio, basket, 
                  pallavolo, giochi di squadra), laboratori creativi (arte, teatro, musica), 
                  giochi all'aperto e momenti di relax. Il programma varia ogni settimana 
                  per mantenere alta la motivazione.
                </p>
              </div>

              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Come vengono formati i gruppi?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  I bambini/ragazzi vengono divisi in gruppi per fasce d'età (6-8 anni, 
                  9-11 anni, 12-14 anni, 15-21 anni) per garantire attività adeguate. 
                  Ogni gruppo ha educatori di riferimento che seguono i partecipanti 
                  per tutta la settimana.
                </p>
              </div>

              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Cosa succede in caso di maltempo?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Abbiamo accesso a strutture coperte (palestra, sale attività) dove 
                  spostiamo le attività in caso di pioggia. Il programma viene adattato 
                  ma l'offerta di attività rimane comunque ricca e divertente.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Sicurezza */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-deep mb-8 text-center">
              Sicurezza e Salute
            </h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Gli educatori sono qualificati?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Sì, tutti i nostri educatori hanno qualifiche in ambito educativo/sportivo 
                  (laurea in Scienze Motorie, diploma ISEF, laurea in Scienze dell'Educazione) 
                  e certificazioni di Primo Soccorso. Sono inoltre sottoposti a controlli 
                  del casellario giudiziale.
                </p>
              </div>

              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  C'è un'assicurazione?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Sì, tutti i partecipanti sono coperti da assicurazione RC e infortuni 
                  per tutta la durata del campo. I dettagli della polizza vengono forniti 
                  al momento dell'iscrizione.
                </p>
              </div>

              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Cosa succede se mio figlio si sente male?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Abbiamo protocolli precisi: in caso di malessere lieve (mal di pancia, 
                  piccoli infortuni) interviene l'educatore con il primo soccorso e vi 
                  contattiamo. In caso di emergenza chiamiamo il 118 e vi avvisiamo 
                  immediatamente. Per questo è fondamentale fornire numeri di contatto 
                  sempre raggiungibili.
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Logistica */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-deep mb-8 text-center">
              Logistica e Trasporti
            </h2>
            
            <div className="space-y-6">
              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Dove si trova la sede del campo?
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  I nostri campi si svolgono in diverse sedi nel territorio comasco. 
                  Alcune attività si svolgono presso strutture sportive convenzionate. 
                </p>
              </div>

              <div className="border-l-4 border-cyan-600 pl-6 py-3 hover:bg-cyan-50 transition-colors rounded-r-lg">
                <h3 className="text-lg font-semibold text-blue-deep mb-2">
                  Cosa deve portare mio figlio?
                </h3>
                <p className="text-gray-700 mb-2">
                  Ogni giorno serve:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Zaino con nome</li>
                  <li>Abbigliamento comodo e sportivo</li>
                  <li>Scarpe da ginnastica</li>
                  <li>Cappello e crema solare</li>
                  <li>Borraccia (importante!)</li>
                  <li>Cambio completo</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  Tutto deve essere <strong>MARCATO</strong> con nome e cognome!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sezione Info Contatti */}
        <section className="pb-12 px-6">
          <div className="max-w-4xl mx-auto bg-blue-light backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">
            Altre Domande?
            </h3>
            <p className="text-white mb-6">
            Se non hai trovato la risposta che cercavi, contattaci! 
            Siamo a tua disposizione per qualsiasi chiarimento.            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
              <a 
                href="mailto:sportessence.asd.aps@gmail.com"
                className="flex items-center gap-2 text-white hover:font-bold hover:underline font-semibold"
              >
                <Mail size={18} />
                sportessence.asd.aps@gmail.com
              </a>
              <span className="hidden sm:inline text-white">|</span>
              <a 
                href="tel:3420394661"
                className="flex items-center gap-2 text-white hover:font-bold hover:underline font-semibold"
              >
                📞 342 039 4661
              </a>
            </div>
          </div>
        </section>
    </main>
  );
}