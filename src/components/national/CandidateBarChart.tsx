"use client";

import React from "react";
import { usePollsData } from "@/context/PollsDataContext";
import { formatPercent } from "@/lib/color-utils";
import { BarChart3, TrendingUp, TrendingDown, Minus } from "lucide-react";

export function CandidateBarChart() {
  const { nationalData, filters } = usePollsData();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Ranking Consolidado de Candidatos
          </h3>
          <p className="text-xs text-slate-400">
            Intenção média de voto com intervalo de variação entre institutos (Min - Max)
          </p>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700">
          {nationalData.candidatesRanking.length} Candidatos
        </span>
      </div>

      {/* Lista de Barras de Candidatos */}
      <div className="space-y-4">
        {nationalData.candidatesRanking.map((c, index) => {
          const currentPct = filters.useValidVotes ? c.averageValidPercentage : c.averagePercentage;
          const isLeader = index === 0;

          return (
            <div
              key={c.candidateId}
              className={`p-3.5 rounded-xl border transition-all ${
                isLeader
                  ? "bg-slate-800/80 border-slate-700 shadow-md"
                  : "bg-slate-800/40 border-slate-800 hover:border-slate-700/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                
                {/* Nome e Partido */}
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 text-center text-xs font-bold text-slate-500 font-mono">
                    {index + 1}º
                  </span>
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: c.color }}
                  />
                  <div>
                    <span className="font-bold text-white text-sm">
                      {c.name}
                    </span>
                    <span className="text-xs text-slate-400 font-mono ml-2">
                      ({c.party})
                    </span>
                  </div>
                </div>

                {/* Percentual e Tendência */}
                <div className="flex items-center space-x-3">
                  {c.trend !== 0 && (
                    <div
                      className={`flex items-center space-x-0.5 text-xs font-bold ${
                        c.trend > 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                      title="Tendência recente em relação à média"
                    >
                      {c.trend > 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {c.trend > 0 ? `+${c.trend}` : c.trend} p.p.
                      </span>
                    </div>
                  )}

                  <div className="text-right">
                    <span className="text-lg font-black text-white">
                      {formatPercent(currentPct)}
                    </span>
                  </div>
                </div>

              </div>

              {/* Barra de Progresso Visual */}
              <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{
                    width: `${Math.min(100, currentPct)}%`,
                    backgroundColor: c.color,
                  }}
                />
              </div>

              {/* Informações Complementares (Intervalo Min - Max) */}
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>
                  Intervalo entre institutos: {formatPercent(c.minPercentage)} — {formatPercent(c.maxPercentage)}
                </span>
                <span>
                  {filters.useValidVotes
                    ? `Totais: ${formatPercent(c.averagePercentage)}`
                    : `Válidos: ${formatPercent(c.averageValidPercentage)}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
