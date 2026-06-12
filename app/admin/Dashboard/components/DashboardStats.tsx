"use client";

import React, { useMemo, useState } from "react";
import { CreditCard, TrendingUp, FileText, Package, Users, Calendar, Shirt, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

export function DashboardStats({ filteredData, isWeekFiltered }: { filteredData: any[], isWeekFiltered: boolean }) {
  const [allergiesExpanded, setAllergiesExpanded] = useState(false);

  const stats = useMemo(() => {
    const BASE_WEEK_PRICE = 75;
    let totalRevenue = 0, totalPotential = 0, pendingAmount = 0, paidOrders = 0, unpaidOrders = 0;

    if (isWeekFiltered) {
      filteredData.forEach(e => {
        const isPaid = (e.pagato || 0) + 0.1 >= (e.prezzo_totale || 0);
        if (isPaid) { paidOrders++; totalRevenue += BASE_WEEK_PRICE; } 
        else { unpaidOrders++; pendingAmount += BASE_WEEK_PRICE; }
        totalPotential += BASE_WEEK_PRICE;
      });
    } else {
      filteredData.forEach(e => {
        const isPaid = (e.pagato || 0) + 0.1 >= (e.prezzo_totale || 0);
        isPaid ? paidOrders++ : unpaidOrders++;
      });
      totalRevenue = filteredData.reduce((acc, curr) => acc + (curr.pagato || 0), 0);
      totalPotential = filteredData.reduce((acc, curr) => acc + (curr.prezzo_totale || 0), 0);
      pendingAmount = totalPotential - totalRevenue;
    }

    const uniqueChildren = new Set(filteredData.map(e => e.children?.id)).size;
    const weeksSold = filteredData.reduce((acc, curr) => {
      if (!curr.enrollment_weeks) return acc;
      if (!isWeekFiltered) return acc + curr.enrollment_weeks.length;
      return acc + curr.enrollment_weeks.filter((ew: any) => ew.camp_weeks?.data_inizio).length;
    }, 0);

    const tshirtSizes: Record<string, number> = {};
    const allergiesList: { child: any; intolleranze: string[] }[] = [];

    filteredData.forEach(e => {
      const child = e.children;
      if (child) {
        if (child.taglia_maglietta) {
          tshirtSizes[child.taglia_maglietta] = (tshirtSizes[child.taglia_maglietta] || 0) + 1;
        }
        if (e.hasMedicalIssues && Array.isArray(child.intolleranze)) {
          if (!allergiesList.some(item => item.child.id === child.id)) {
             allergiesList.push({ child, intolleranze: child.intolleranze });
          }
        }
      }
    });

    return { totalRevenue, totalPotential, pendingAmount, uniqueChildren, weeksSold, tshirtSizes, allergiesList, allergiesCount: allergiesList.length, paidOrders, unpaidOrders, isWeekFiltered };
  }, [filteredData, isWeekFiltered]);

  const StatCard = ({ icon: Icon, label, value, subtext, color = "blue" }: any) => {
    const colorClasses: any = {
      blue: "bg-blue-50 text-blue-700", green: "bg-emerald-50 text-emerald-700",
      purple: "bg-purple-50 text-purple-700", orange: "bg-orange-50 text-orange-700",
      red: "bg-red-50 text-red-700", teal: "bg-teal-50 text-teal-700",
      pink: "bg-pink-50 text-pink-700", amber: "bg-amber-50 text-amber-700",
    };
    return (
      <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 md:gap-3 mb-2">
          <div className={`p-1.5 md:p-2 rounded-lg ${colorClasses[color]}`}><Icon size={18} className="md:w-5 md:h-5" /></div>
          <span className="text-[10px] md:text-xs font-bold text-gray-600 uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-xl md:text-2xl font-extrabold text-gray-900">{value}</div>
        {subtext && <div className="text-[10px] md:text-xs text-gray-500 font-medium mt-1">{subtext}</div>}
      </div>
    );
  };

  const TShirtStats = ({ sizes }: { sizes: Record<string, number> }) => {
    const sizeOrder = ['4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL'];
    const sortedSizes = Object.entries(sizes).sort((a, b) => {
      const idxA = sizeOrder.indexOf(a[0]); const idxB = sizeOrder.indexOf(b[0]);
      if (idxA === -1 && idxB === -1) return a[0].localeCompare(b[0]);
      if (idxA === -1) return 1; if (idxB === -1) return -1;
      return idxA - idxB;
    });
    if (sortedSizes.length === 0) return null;
    return (
      <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 md:gap-3 mb-3">
          <div className="p-1.5 md:p-2 rounded-lg bg-pink-50 text-pink-700"><Shirt size={18} className="md:w-5 md:h-5" /></div>
          <span className="text-[10px] md:text-xs font-bold text-gray-600 uppercase tracking-wider">Magliette</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {sortedSizes.map(([size, count]) => (
            <span key={size} className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800">{size}: {count}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={CreditCard} label={stats.isWeekFiltered ? "Incassato (Stimato)" : "Incassato"} value={`€ ${stats.totalRevenue.toLocaleString()}`} subtext={`Su € ${stats.totalPotential.toLocaleString()}`} color="green" />
        <StatCard icon={TrendingUp} label={stats.isWeekFiltered ? "Da Incassare (Stimato)" : "Da Incassare"} value={`€ ${stats.pendingAmount.toLocaleString()}`} subtext={`${stats.unpaidOrders} ordini da saldare`} color="orange" />
        <StatCard icon={FileText} label="Ordini Totali" value={stats.paidOrders + stats.unpaidOrders} subtext={`${stats.paidOrders} pagati, ${stats.unpaidOrders} da pagare`} color="blue" />
        <StatCard icon={Package} label="Totale Settimane" value={stats.weeksSold} subtext={`Media ${stats.uniqueChildren > 0 ? (stats.weeksSold / stats.uniqueChildren).toFixed(1) : '0'} per bambino`} color="purple" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={Users} label="Bambini Unici" value={stats.uniqueChildren} color="teal" />
        <StatCard icon={Calendar} label="Settimane Vendute" value={stats.weeksSold} color="purple" />
        <TShirtStats sizes={stats.tshirtSizes} />
        {stats.allergiesCount > 0 && (
          <div className="bg-amber-50 p-4 md:p-5 rounded-xl shadow-sm border border-amber-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 md:gap-3 mb-3">
              <div className="p-1.5 md:p-2 rounded-lg bg-amber-100 text-amber-700"><AlertTriangle size={18} className="md:w-5 md:h-5" /></div>
              <span className="text-[10px] md:text-xs font-bold text-amber-800 uppercase tracking-wider">Intolleranze ({stats.allergiesCount})</span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {stats.allergiesList.slice(0, allergiesExpanded ? stats.allergiesList.length : 3).map(({ child, intolleranze }) => (
                <div key={child.id} className="text-[11px] text-amber-900 bg-amber-100/50 p-2 rounded">
                  <span className="font-bold">{child.nome} {child.cognome}:</span><span className="ml-1">{intolleranze.join(", ")}</span>
                </div>
              ))}
            </div>
            {stats.allergiesList.length > 3 && (
              <button onClick={() => setAllergiesExpanded(!allergiesExpanded)} className="mt-3 w-full text-[11px] text-amber-700 font-bold hover:text-amber-900 flex items-center justify-center gap-1">
                {allergiesExpanded ? <>Mostra meno <ChevronUp size={14} /></> : <>Mostra tutti ({stats.allergiesList.length - 3} altri) <ChevronDown size={14} /></>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}