"use client";

import React from "react";
import { StatePollSummary } from "@/types/election";
import { BRAZIL_STATES_GEO } from "@/data/brazil-states-svg";
import { formatPercent, formatInteger } from "@/lib/color-utils";
import { TrendingUp, Users } from "lucide-react";

interface MapTooltipProps {
  summary: StatePollSummary | null;
  position: { x: number; y: number } | null;
}

export function MapTooltip({ summary, position }: MapTooltipProps) {
  if (!summary || !position) return null;

  const geo = BRAZIL_STATES_GEO[summary.uf];

  return (
    <div
      className="fixed z-50 pointer-events-none transition-transform duration-75 ease-out"
      style={{
        left: `${position.x + 15}px`,
        top: `${position.y - 30}px`,
      }}
    >
      <div className="bg-slate-900/95 text-white border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md w-64 max-w-xs animate-in fade-in zoom-in-95 duration-100">
        
        {/* Cabeçalho do Estado */}
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

        {/* Resumo do Líder */}
        {summary.leaderName ? (
          <div className="bg-slate-800/80 rounded-lg p-2 mb-2.5 border border-slate-700/60">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: summary.color }}
                />
                <span className="font-semibold text-slate-100 truncate max-w-[120px]">
                  {summary.leaderName}
                </span>
              </div>
              <span className="font-bold text-white text-sm">
                {formatPercent(summary.leaderPercentage)}
              </span>
            </div>

            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-700/40 pt-1">
              <span className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-blue-400" />
                <span>Vantagem:</span>
              </span>
              <span className="font-bold text-emerald-400">
                +{formatPercent(summary.margin)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 py-1 mb-2">Sem dados compilados</div>
        )}

        {/* Detalhamento dos 3 Primeiros Candidatos */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
            Intenção de Voto
          </span>
          {summary.results.slice(0, 4).map((c) => (
            <div key={c.candidateId} className="text-xs">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-slate-300 truncate max-w-[130px]">{c.candidateName}</span>
                <span className="font-medium text-slate-100">{formatPercent(c.percentage)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, c.percentage)}%`,
                    backgroundColor: c.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé com Informação de Fonte */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center space-x-1">
            <Users className="w-3 h-3 text-slate-500" />
            <span>
              {summary.pollCount > 0
                ? `${summary.pollCount} pesquisa${summary.pollCount > 1 ? "s" : ""} no estado`
                : "Projeção Regional 2026"}
            </span>
          </span>
          <span className="text-blue-400 font-medium">Clique p/ detalhes →</span>
        </div>

      </div>
    </div>
  );
}
