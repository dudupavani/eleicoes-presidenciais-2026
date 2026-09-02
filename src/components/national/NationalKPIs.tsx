"use client";

import React from "react";
import { usePollsData } from "@/context/PollsDataContext";
import { formatPercent, formatInteger } from "@/lib/color-utils";
import { Trophy, TrendingUp, Users, PieChart, ShieldAlert, CheckCircle2 } from "lucide-react";

export function NationalKPIs() {
  const { nationalData, filters, filteredPolls } = usePollsData();

  const leader = nationalData.leader;
  const runnerUp = nationalData.runnerUp;
  const isEmpate = nationalData.margin < 2.5;

  const totalRespondents = filteredPolls.reduce((acc, p) => acc + (p.sampleSize || 2000), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Líder Consolidado */}
      <div
        className="bg-slate-900 border rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between"
        style={{
          borderColor: leader ? `${leader.color}50` : "#334155",
          background: leader
            ? `linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, ${leader.color}15 100%)`
            : undefined,
        }}
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Líder Nacional</span>
            </span>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm"
              style={{ backgroundColor: leader?.color || "#64748B" }}
            >
              1º Lugar
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {leader
                ? formatPercent(
                    filters.useValidVotes
                      ? leader.validPercentage
                      : leader.percentage
                  )
                : "-"}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {filters.useValidVotes ? "votos válidos" : "intenção total"}
            </span>
          </div>

          <div className="mt-2 flex items-center space-x-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: leader?.color || "#64748B" }}
            />
            <span className="font-bold text-slate-100 text-sm truncate">
              {leader?.name || "Sem dados"}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{filters.useValidVotes ? "Base: Apenas Válidos" : `Válidos: ${formatPercent(leader?.validPercentage)}`}</span>
          <span className="text-emerald-400 font-semibold">Média Ponderada</span>
        </div>
      </div>

      {/* Card 2: Segundo Colocado */}
      <div
        className="bg-slate-900 border rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between"
        style={{
          borderColor: runnerUp ? `${runnerUp.color}40` : "#334155",
          background: runnerUp
            ? `linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, ${runnerUp.color}10 100%)`
            : undefined,
        }}
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Segundo Colocado
            </span>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white shadow-sm"
              style={{ backgroundColor: runnerUp?.color || "#64748B" }}
            >
              2º Lugar
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white tracking-tight">
              {runnerUp
                ? formatPercent(
                    filters.useValidVotes
                      ? runnerUp.validPercentage
                      : runnerUp.percentage
                  )
                : "-"}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {filters.useValidVotes ? "votos válidos" : "intenção total"}
            </span>
          </div>

          <div className="mt-2 flex items-center space-x-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: runnerUp?.color || "#64748B" }}
            />
            <span className="font-bold text-slate-100 text-sm truncate">
              {runnerUp?.name || "Sem dados"}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{filters.useValidVotes ? "Base: Apenas Válidos" : `Válidos: ${formatPercent(runnerUp?.validPercentage)}`}</span>
          <span className="text-slate-400 font-medium">Em perseguição</span>
        </div>
      </div>

      {/* Card 3: Margem e Cenário Eleitoral */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Vantagem do Líder</span>
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isEmpate
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              }`}
            >
              {isEmpate ? "Empate Técnico" : "Liderança Real"}
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white tracking-tight">
              +{formatPercent(nationalData.margin)}
            </span>
            <span className="text-xs text-slate-400">pontos percentuais</span>
          </div>

          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            {isEmpate
              ? "Diferença dentro da margem média de erro dos principais institutos."
              : "Líder mantém vantagem estatisticamente significativa fora da margem de erro."}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Distância 1º vs 2º</span>
          <span className="font-semibold text-slate-300">
            {leader?.name?.split(" ")[0]} vs {runnerUp?.name?.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Card 4: Base da Amostra & Votos Não Cristalizados */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-purple-400" />
              <span>Brancos & Indecisos</span>
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {filteredPolls.length} pesquisas
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block font-medium">Branco / Nulo</span>
              <span className="text-lg font-bold text-white">
                {formatPercent(nationalData.blanksAndNulls)}
              </span>
            </div>

            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/40">
              <span className="text-[10px] text-slate-400 block font-medium">Indecisos (NS/NR)</span>
              <span className="text-lg font-bold text-purple-300">
                {formatPercent(nationalData.undecided)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center space-x-1">
            <Users className="w-3.5 h-3.5 text-slate-500" />
            <span>Entrevistados:</span>
          </span>
          <span className="font-semibold text-slate-200">
            {formatInteger(totalRespondents)}
          </span>
        </div>
      </div>

    </div>
  );
}
