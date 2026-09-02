"use client";

import React from "react";
import { StateTseSummary } from "@/types/election";
import { BRAZIL_STATES_GEO } from "@/data/brazil-states-svg";
import { formatPercent, formatInteger } from "@/lib/color-utils";
import { FileCheck2, DollarSign } from "lucide-react";

interface MapTooltipProps {
  summary: StateTseSummary | null;
  position: { x: number; y: number } | null;
}

export function MapTooltip({ summary, position }: MapTooltipProps) {
  if (!summary || !position) return null;

  const geo = BRAZIL_STATES_GEO[summary.uf];
  const formatBrl = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(val);

  return (
    <div
      className="fixed z-50 pointer-events-none transition-transform duration-75 ease-out"
      style={{
        left: `${position.x + 15}px`,
        top: `${position.y - 30}px`,
      }}
    >
      <div className="bg-slate-900/95 text-white border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md w-64 max-w-xs animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm text-white">{summary.stateName}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                {summary.uf}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">{summary.region} • Cap: {geo?.capital}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Eleitorado</span>
            <span className="text-xs font-semibold text-emerald-400">
              {formatPercent(geo?.voterShare)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs bg-slate-800/80 rounded-lg p-2 border border-slate-700/60">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Pesquisas registradas</span>
            </span>
            <span className="font-bold text-white">{formatInteger(summary.registriesCount)}</span>
          </div>

          <div className="flex items-center justify-between text-xs bg-slate-800/80 rounded-lg p-2 border border-slate-700/60">
            <span className="flex items-center space-x-1.5 text-slate-300">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Investimento total</span>
            </span>
            <span className="font-bold text-emerald-400">{formatBrl(summary.totalInvestment)}</span>
          </div>

          {summary.topAgency && (
            <div className="text-[11px] text-slate-400">
              Instituto com mais registros: <span className="text-slate-200 font-medium">{summary.topAgency}</span>
            </div>
          )}
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>{summary.uniqueAgencies} institutos • {summary.uniqueContractors} contratantes</span>
          <span className="text-blue-400 font-medium">Clique p/ detalhes →</span>
        </div>
      </div>
    </div>
  );
}
