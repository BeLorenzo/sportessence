"use client";

import React from "react";
import { Calendar, CreditCard, Edit, Trash2, ChevronDown, ChevronUp, Baby, AlertTriangle, User } from "lucide-react";

export const EnrollmentDetails = ({ enrollment, onPay, onEdit, onDelete }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
        <h4 className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Calendar size={14} className="text-blue-600"/> Settimane Selezionate
        </h4>
        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{enrollment.enrollment_weeks?.length} Totali</span>
      </div>
      <div className="p-3 space-y-2 max-h-[250px] overflow-y-auto">
        {enrollment.enrollment_weeks?.map((ew: any) => (
          <div key={ew.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">{ew.camp_weeks?.label || "Settimana"}</span>
              <div className="flex gap-2 mt-0.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${ew.type === 'FULL' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
                  {ew.type === 'FULL' ? 'INTERA' : 'MEZZA'}
                </span>
                {ew.pre_post !== 'NONE' && (
                  <span className="text-[9px] font-bold bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">+{ew.pre_post}</span>
                )}
              </div>
            </div>
            <div className="text-sm font-mono font-bold text-gray-600">€{ew.computed_price}</div>
          </div>
        ))}
      </div>
    </div>

    <div className="flex flex-col gap-4">
      <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-4 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-blue-600 uppercase">Totale</span>
            <span className="text-lg font-extrabold text-gray-900">€{enrollment.prezzo_totale}</span>
          </div>
          <div className="flex flex-col border-l border-blue-100">
            <span className="text-[10px] font-bold text-red-600 uppercase">Residuo</span>
            <span className="text-lg font-extrabold text-red-600">€{(enrollment.prezzo_totale - enrollment.pagato).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={(e) => { e.stopPropagation(); onPay(enrollment); }} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-all font-bold text-xs shadow-sm shadow-green-100">
            <CreditCard size={14}/> Paga
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(enrollment); }} className="px-3 py-2.5 bg-white text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors shadow-sm">
            <Edit size={16}/>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(enrollment); }} className="px-3 py-2.5 bg-white text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition-colors shadow-sm">
            <Trash2 size={16}/>
          </button>
        </div>
      </div>
      <p className="text-[10px] text-gray-400 italic text-center px-4">Iscrizione creata il {new Date(enrollment.created_at).toLocaleString('it-IT')}</p>
    </div>
  </div>
);

export const EnrollmentTable = ({ data, expandedRows, onToggleRow, onOpenChild, onOpenParent, onPay, onEdit, onDelete }: any) => (
  <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-100 border-b border-gray-200">
        <tr>
          <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider">Data</th>
          <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider">Bambino</th>
          <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider">Genitore</th>
          <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider text-center">Set</th>
          <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider text-right">Totale</th>
          <th className="p-4 font-bold text-gray-800 uppercase text-xs tracking-wider text-center">Stato</th>
          <th className="p-4"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map((enrollment: any) => {
          const isPaid = ((enrollment.pagato || 0) + 0.1) >= (enrollment.prezzo_totale || 0);
          const isExpanded = expandedRows.has(enrollment.id);
          return (
            <React.Fragment key={enrollment.id}>
              <tr className="hover:bg-blue-50/50 transition-colors">
                <td className="p-4 align-top cursor-pointer" onClick={() => onToggleRow(enrollment.id)}>
                  <div className="font-bold text-gray-900">{new Date(enrollment.created_at).toLocaleDateString()}</div>
                </td>
                <td className="p-4 align-top">
                  <button onClick={() => onOpenChild(enrollment)} className="flex items-center gap-2 text-left group">
                    <Baby size={16} className="text-blue-500 group-hover:text-blue-700" />
                    <span className="font-bold text-blue-900 text-base group-hover:underline">
                    {enrollment.children?.nome} {enrollment.children?.cognome} - {enrollment.age !== null ? `${enrollment.age} anni` : 'Età N/D'}
                    </span>
                    {enrollment.hasMedicalIssues && <AlertTriangle size={16} className="text-amber-500" />}
                  </button>
                  <div className="text-xs font-medium text-gray-600 mt-1 flex items-center gap-1"><Calendar size={12}/> {enrollment.camps?.nome}</div>
                </td>
                <td className="p-4 align-top">
                  <button onClick={() => onOpenParent(enrollment)} className="flex items-center gap-2 text-left group">
                    <User size={16} className="text-emerald-500 group-hover:text-emerald-700" />
                    <span className="font-bold text-gray-800 group-hover:underline">{enrollment.parent?.nome} {enrollment.parent?.cognome}</span>
                  </button>
                  <div className="text-xs text-gray-600 truncate max-w-[150px]">{enrollment.parent?.email}</div>
                </td>
                <td className="p-4 align-top text-center cursor-pointer" onClick={() => onToggleRow(enrollment.id)}>
                  <span className="bg-gray-100 text-gray-800 font-bold px-2 py-1 rounded text-xs">{enrollment.enrollment_weeks?.length || 0}</span>
                </td>
                <td className="p-4 align-top text-right cursor-pointer" onClick={() => onToggleRow(enrollment.id)}>
                  <div className="font-extrabold text-gray-900">€ {enrollment.prezzo_totale}</div>
                  {enrollment.discount_applied && <span className="text-[10px] text-green-700 bg-green-100 px-1 rounded font-bold">Sconto OK</span>}
                </td>
                <td className="p-4 align-top text-center cursor-pointer" onClick={() => onToggleRow(enrollment.id)}>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold uppercase ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isPaid ? 'Saldato' : 'Da Saldare'}</span>
                </td>
                <td className="p-4 align-top text-right text-gray-500 cursor-pointer" onClick={() => onToggleRow(enrollment.id)}>
                  {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                </td>
              </tr>
              {isExpanded && (
                <tr className="bg-gray-50 border-t border-gray-200 shadow-inner">
                  <td colSpan={7} className="p-6">
                    <EnrollmentDetails enrollment={enrollment} onPay={onPay} onEdit={onEdit} onDelete={onDelete} />
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  </div>
);

export const EnrollmentCards = ({ data, expandedRows, onToggleRow, onOpenChild, onOpenParent, onPay, onEdit, onDelete }: any) => (
  <div className="md:hidden space-y-4">
    {data.map((enrollment: any) => {
      const isPaid = ((enrollment.pagato || 0) + 0.1) >= (enrollment.prezzo_totale || 0);
      const isExpanded = expandedRows.has(enrollment.id);
      return (
        <div key={enrollment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <button onClick={() => onOpenChild(enrollment)} className="flex items-center gap-2 text-left">
                  <Baby size={16} className="text-blue-500" />
                  <h3 className="font-bold text-lg text-blue-900">{enrollment.children?.nome} {enrollment.children?.cognome}</h3>
                  {enrollment.hasMedicalIssues && <AlertTriangle size={16} className="text-amber-500" />}
                </button>
                <div className="text-xs text-gray-600 font-medium flex items-center gap-1 mt-0.5"><Calendar size={12}/> {enrollment.camps?.nome}</div>
              </div>
              <span className={`px-2 py-1 rounded text-[10px] font-extrabold uppercase ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isPaid ? 'Saldato' : 'Da Saldare'}
              </span>
            </div>
            <div className="flex justify-between items-end border-t border-gray-100 pt-3">
              <button onClick={() => onOpenParent(enrollment)} className="text-sm text-left">
                <div className="text-gray-500 text-xs">Genitore</div>
                <div className="font-semibold text-gray-800">{enrollment.parent?.nome} {enrollment.parent?.cognome}</div>
              </button>
              <div className="text-right">
                <div className="font-extrabold text-gray-900 text-lg">€ {enrollment.prezzo_totale}</div>
                {!isPaid && <div className="text-[10px] text-red-600 font-bold">Mancano €{(enrollment.prezzo_totale - enrollment.pagato).toFixed(0)}</div>}
              </div>
            </div>
            <div className="flex justify-center pt-1 text-gray-400 cursor-pointer" onClick={() => onToggleRow(enrollment.id)}>
              {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
            </div>
          </div>
          {isExpanded && (
            <div className="bg-gray-50 border-t border-gray-200 p-4 animate-in slide-in-from-top-2 duration-200">
              <EnrollmentDetails enrollment={enrollment} onPay={onPay} onEdit={onEdit} onDelete={onDelete} />
            </div>
          )}
        </div>
      )
    })}
  </div>
);