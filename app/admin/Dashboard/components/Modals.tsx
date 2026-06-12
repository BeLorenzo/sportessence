"use client";

import React from "react";
import { X, Baby, FileText, Shirt, AlertTriangle, User, Mail, Phone, MapPin, CreditCard, Loader2, Edit, ClipboardList, Trash2 } from "lucide-react";

export const ChildModal = ({ child, parent, onClose }: any) => {
  if (!child) return null;
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" }) : "Non specificata";
  const calculateAge = (dateStr?: string) => {
    if (!dateStr) return null;
    const birthDate = new Date(dateStr); const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() - birthDate.getMonth() < 0 || (today.getMonth() - birthDate.getMonth() === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };
  const intolleranzeArray = Array.isArray(child.intolleranze) ? child.intolleranze : [];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full"><Baby size={28} /></div>
              <div><h2 className="text-xl font-bold">{child.nome} {child.cognome}</h2><p className="text-cyan-100 text-sm">Dettaglio Bambino</p></div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><FileText size={14} /> Informazioni Personali</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Codice Fiscale</span><span className="text-sm font-mono font-medium text-gray-900">{child.cf || child.codice_fiscale || "Non specificato"}</span></div>
              <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Data di Nascita</span><span className="text-sm font-medium text-gray-900">{formatDate(child.data_nascita)}{calculateAge(child.data_nascita) && <span className="text-gray-500 ml-1">({calculateAge(child.data_nascita)} anni)</span>}</span></div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Shirt size={14} /> Taglia Maglietta</h3>
            <div className="bg-pink-50 rounded-xl p-4"><div className="flex items-center justify-between"><span className="text-sm text-gray-700">Taglia richiesta:</span><span className="text-2xl font-bold text-pink-700">{child.taglia_maglietta || "Non specificata"}</span></div></div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><AlertTriangle size={14} /> Intolleranze / Allergie</h3>
            <div className={`rounded-xl p-4 ${intolleranzeArray.length > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
              {intolleranzeArray.length > 0 ? (
                <div className="flex items-start gap-3"><AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" /><div className="flex flex-wrap gap-1">{intolleranzeArray.map((item: string, idx: number) => (<span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">{item}</span>))}</div></div>
              ) : <p className="text-sm text-gray-500 italic">Nessuna intolleranza segnalata</p>}
            </div>
          </div>
          {parent && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><User size={14} /> Genitore / Tutore</h3>
              <div className="bg-cyan-50 rounded-xl p-4 space-y-2">
                <div className="font-medium text-gray-900">{parent.nome} {parent.cognome}</div>
                <div className="flex items-center gap-2 text-sm text-gray-600"><Mail size={14} /><a href={`mailto:${parent.email}`} className="hover:text-cyan-600 transition-colors">{parent.email}</a></div>
                {parent.telefono && <div className="flex items-center gap-2 text-sm text-gray-600"><Phone size={14} /><a href={`tel:${parent.telefono}`} className="hover:text-cyan-600 transition-colors">{parent.telefono}</a></div>}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl"><button onClick={onClose} className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition-colors">Chiudi</button></div>
      </div>
    </div>
  );
};

export const ParentModal = ({ parent, childrenList, onClose }: any) => {
  if (!parent) return null;
  const hasAddress = parent.indirizzo_via || parent.indirizzo_civico || parent.indirizzo_paese || parent.indirizzo_cap;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-full"><User size={28} /></div>
              <div><h2 className="text-xl font-bold">{parent.nome} {parent.cognome}</h2><p className="text-emerald-100 text-sm">Dettaglio Genitore</p></div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} /></button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Mail size={14} /> Contatti</h3>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3"><Mail size={18} className="text-gray-400" /><a href={`mailto:${parent.email}`} className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors">{parent.email}</a></div>
              {parent.telefono && <div className="flex items-center gap-3"><Phone size={18} className="text-gray-400" /><a href={`tel:${parent.telefono}`} className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors">{parent.telefono}</a></div>}
              {hasAddress && (
                <div className="flex items-start gap-3 pt-2 border-t border-gray-200 mt-2">
                  <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-gray-900"><div className="font-medium">{parent.indirizzo_via} {parent.indirizzo_civico}</div><div className="text-gray-600">{parent.indirizzo_cap} {parent.indirizzo_paese}</div></div>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2"><Baby size={14} /> Figli Iscritti ({childrenList.length})</h3>
            <div className="space-y-2">
              {childrenList.map(({ child, campNames }: any) => {
                const childIntolleranze = Array.isArray(child.intolleranze) ? child.intolleranze : [];
                return (
                  <div key={child.id} className="bg-emerald-50 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div><div className="font-bold text-gray-900">{child.nome} {child.cognome}</div><div className="text-xs text-gray-600 mt-1">{campNames}</div></div>
                      {child.taglia_maglietta && <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">{child.taglia_maglietta}</span>}
                    </div>
                    {childIntolleranze.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-amber-700"><AlertTriangle size={12} className="flex-shrink-0" /><div className="flex flex-wrap gap-1">{childIntolleranze.map((item: string, idx: number) => (<span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800">{item}</span>))}</div></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl"><button onClick={onClose} className="w-full py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-bold transition-colors">Chiudi</button></div>
      </div>
    </div>
  );
};

export const PaymentModal = ({ loading, onClose, onSubmit }: any) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><CreditCard className="text-green-600"/> Registra Pagamento</h3>
      <p className="text-sm text-gray-600 mb-4">Inserisci l&apos;importo ricevuto.</p>
      <form onSubmit={(e) => { e.preventDefault(); const val = parseFloat((e.target as any).amount.value); if (val) onSubmit(val); }}>
        <input name="amount" type="number" step="0.01" placeholder="Importo €" className="w-full border border-gray-300 p-3 rounded-lg text-lg text-black font-bold mb-4 focus:ring-2 ring-green-500 outline-none" autoFocus />
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">Annulla</button>
          <button type="submit" disabled={loading} className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700">{loading ? '...' : 'Conferma'}</button>
        </div>
      </form>
    </div>
  </div>
);

export const EditModal = ({ editData, setEditData, camps, weeks, loading, onClose, onSubmit }: any) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Edit className="text-cyan-600"/> Modifica Iscrizione</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-800"><X size={20}/></button>
      </div>
      <form onSubmit={onSubmit}>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Campo Estivo</label>
            <select value={editData.campId} onChange={(e) => setEditData({...editData, campId: e.target.value})} className="w-full border border-gray-300 p-2.5 rounded-lg bg-gray-50 text-sm text-black font-medium outline-none focus:ring-2 focus:ring-cyan-600">
              {camps?.map((c: any) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Prezzo Totale Iscrizione (€)</label>
            <input type="number" step="0.01" value={editData.price} onChange={(e) => setEditData({...editData, price: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 p-2.5 rounded-lg font-mono font-bold text-black text-lg outline-none focus:ring-2 focus:ring-cyan-600" />
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-gray-200">
            <span className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-1"><ClipboardList size={14}/> Settimane Assegnate e Prezzi</span>
            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {weeks?.filter((w: any) => !editData.campId || w.camp_id === editData.campId).map((wk: any) => {
                const currentWeek = editData.weeks.find((w: any) => w.camp_week_id === wk.id);
                const isChecked = !!currentWeek;
                return (
                  <div key={wk.id} className={`flex flex-col p-2 bg-white rounded-lg border text-xs transition-colors ${isChecked ? 'border-cyan-400 shadow-sm' : 'border-gray-200 opacity-60'}`}>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 font-bold text-gray-800 cursor-pointer w-full">
                        <input type="checkbox" checked={isChecked} onChange={(e) => {
                            if(e.target.checked) setEditData({...editData, weeks: [...editData.weeks, { camp_week_id: wk.id, type: 'FULL', pre_post: 'NONE', computed_price: 75 }]});
                            else setEditData({...editData, weeks: editData.weeks.filter((w: any) => w.camp_week_id !== wk.id)});
                          }} className="w-4 h-4 accent-cyan-600 rounded" />
                        {wk.label || `Settimana del ${new Date(wk.data_inizio).toLocaleDateString()}`}
                      </label>
                    </div>
                    {isChecked && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-2 items-center">
                        <select className="p-1.5 border border-gray-300 rounded text-[10px] font-medium bg-gray-50 outline-none text-black focus:ring-2 focus:ring-cyan-600" value={currentWeek.type} onChange={(e) => {
                            const updated = editData.weeks.map((w: any) => w.camp_week_id === wk.id ? {...w, type: e.target.value} : w); setEditData({...editData, weeks: updated});
                          }}>
                          <option value="FULL">INTERA</option><option value="HALF">MEZZA</option>
                        </select>
                        <select className="p-1.5 border border-gray-300 rounded text-[10px] font-medium bg-gray-50 outline-none text-black focus:ring-2 focus:ring-cyan-600" value={currentWeek.pre_post} onChange={(e) => {
                            const updated = editData.weeks.map((w: any) => w.camp_week_id === wk.id ? {...w, pre_post: e.target.value} : w); setEditData({...editData, weeks: updated});
                          }}>
                          <option value="NONE">NO EXTRA</option><option value="PRE">PRE</option><option value="POST">POST</option><option value="BOTH">BOTH</option>
                        </select>
                        <div className="flex items-center gap-1 ml-auto bg-white border border-gray-300 rounded px-2">
                          <span className="text-[10px] font-bold text-gray-400">€</span>
                          <input type="number" step="0.01" value={currentWeek.computed_price} onChange={(e) => {
                              const updated = editData.weeks.map((w: any) => w.camp_week_id === wk.id ? {...w, computed_price: parseFloat(e.target.value) || 0} : w); setEditData({...editData, weeks: updated});
                            }} className="w-14 py-1 text-[11px] font-mono font-bold text-right outline-none text-black bg-transparent" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t border-gray-100 mt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors">Annulla</button>
          <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-700 shadow-md flex items-center justify-center gap-2 transition-colors">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Salva Modifiche'}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export const DeleteModal = ({ loading, onClose, onSubmit }: any) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200 border-t-4 border-red-600">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="p-3 bg-red-100 rounded-full text-red-600 mb-4"><Trash2 size={32} /></div>
        <h3 className="text-xl font-bold text-gray-900">Eliminare l'iscrizione?</h3>
        <p className="text-sm text-gray-500 mt-2">Stai per rimuovere definitivamente questa iscrizione dal database. Questa azione <strong>non può essere annullata</strong>.</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors">Annulla</button>
        <button onClick={onSubmit} disabled={loading} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-md shadow-red-200 transition-colors flex justify-center items-center gap-2">
          {loading ? <Loader2 size={18} className="animate-spin"/> : 'Elimina Definitivamente'}
        </button>
      </div>
    </div>
  </div>
);