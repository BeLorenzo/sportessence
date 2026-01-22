"use client";

import { useState } from "react";
import { Copy, Check, Info } from "lucide-react";
import { BANK_INFO, getCausale } from "@/app/utils/bankInfo";

type Props = {
  amount: number;
  childName: string;
  childSurname: string;
  childCF: string;      // NUOVO
  campName: string;
  reservationId: string; // NUOVO
};

export default function BankTransferBox({ 
  amount, 
  childName, 
  childSurname, 
  childCF, 
  campName, 
  reservationId 
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(BANK_INFO.iban);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const causale = getCausale(childName, childSurname, campName, reservationId, childCF);

  return (
    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl overflow-hidden text-sm">
      {/* Header Avviso */}
      <div className="p-3 bg-amber-100/50 flex items-start gap-3 border-b border-amber-200/50">
        <Info size={18} className="text-amber-700 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-amber-900">Pagamento in sospeso</p>
          <p className="text-amber-800 text-xs leading-relaxed">
            L'iscrizione è confermata. Per completarla, effettua un bonifico di <strong>€{amount.toFixed(2)}</strong>.
          </p>
        </div>
      </div>

      {/* Dettagli Bonifico */}
      <div className="p-4 space-y-3">
        
        {/* Beneficiario */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Beneficiario</span>
          <span className="font-medium text-gray-800">{BANK_INFO.intestatario}</span>
          <span className="text-xs text-gray-500">{BANK_INFO.banca}</span>
        </div>

        {/* IBAN */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">IBAN</span>
          <div className="flex items-center gap-2">
            <code className="font-mono bg-white border border-gray-200 px-2 py-1 rounded text-gray-700 select-all w-full md:w-fit">
              {BANK_INFO.iban}
            </code>
            <button 
              onClick={handleCopy}
              className="text-cyan-600 hover:text-cyan-700 p-1.5 hover:bg-cyan-50 rounded-md transition-colors flex items-center gap-1 bg-white border border-gray-200"
              title="Copia IBAN"
            >
              {copied ? <Check size={16} className="text-green-600"/> : <Copy size={16}/>}
              <span className="text-xs font-bold">{copied ? "Copiato!" : "Copia"}</span>
            </button>
          </div>
        </div>

        {/* Causale */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">Causale da inserire (Obbligatoria)</span>
          <div className="font-medium text-gray-800 italic bg-white px-3 py-2 rounded border border-amber-200 text-xs break-all select-all">
            {causale}
          </div>
        </div>
      </div>
    </div>
  );
}