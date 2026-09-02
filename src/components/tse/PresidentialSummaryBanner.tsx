"use client";

import React, { useMemo } from "react";
import { usePollsData } from "@/context/PollsDataContext";
import { formatInteger } from "@/lib/color-utils";
import { Vote, FileCheck2, Building2, DollarSign, Calendar, ArrowRight } from "lucide-react";

export function PresidentialSummaryBanner() {
  const { presidentialSummary, setActiveTab } = usePollsData();

  const formatBrl = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);

  const recentRegistries = useMemo(() => {
    return [...presidentialSummary.registries]
      .sort((a, b) => (b.registrationDate || "").localeCompare(a.registrationDate || ""))
      .slice(0, 5);
  }, [presidentialSummary.registries]);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-800/40 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg">
            <Vote className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Pesquisas Registradas no TSE para Presidente da República
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Registros oficiais (Repositório de Dados Eleitorais do TSE) cujo cargo declarado é
              &quot;Presidente&quot;. O TSE não publica o resultado de intenção de voto dessas pesquisas —
              apenas quem as registrou, quando e com que amostra.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("tse_audit")}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-all shrink-0"
        >
          <span>Ver todos na Auditoria TSE</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Pesquisas Registradas</span>
            <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatInteger(presidentialSummary.count)}</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Institutos</span>
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300">{presidentialSummary.uniqueAgencies}</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Investimento Total</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-400 truncate">
            {formatBrl(presidentialSummary.totalInvestment)}
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider">Período</span>
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-[11px] font-semibold text-slate-200">
            {presidentialSummary.earliestRegistrationDate || "-"} até {presidentialSummary.latestRegistrationDate || "-"}
          </div>
        </div>
      </div>

      {recentRegistries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Registros Mais Recentes
          </h4>
          <div className="space-y-1.5">
            {recentRegistries.map((r) => (
              <div
                key={r.protocol}
                className="flex items-center justify-between text-xs bg-slate-900/60 border border-slate-800 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-blue-400 font-bold shrink-0">{r.protocol}</span>
                  <span className="text-slate-300 truncate">{r.pollingAgency}</span>
                </div>
                <span className="text-slate-500 font-mono text-[11px] shrink-0 ml-2">
                  {r.registrationDate || r.generationDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
