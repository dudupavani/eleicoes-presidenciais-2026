"use client";

import React from "react";
import { usePollsData } from "@/context/PollsDataContext";
import { BRAZIL_STATES_GEO } from "@/data/brazil-states-svg";
import { formatPercent, formatInteger } from "@/lib/color-utils";
import { X, TrendingUp, Users, Calendar, Building2 } from "lucide-react";

export function StateDetailDrawer() {
  const { selectedUf, setSelectedUf, stateSummaries, filteredPolls, filters } = usePollsData();

  if (!selectedUf) return null;

  const geo = BRAZIL_STATES_GEO[selectedUf];
  const summary = stateSummaries[selectedUf];

  // Pesquisas específicas deste estado
  const statePolls = filteredPolls.filter((p) => p.scope === selectedUf);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl text-white flex flex-col">
          
          {/* Cabeçalho do Drawer */}
          <div className="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between sticky top-0 z-10">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-white">{summary?.stateName || geo.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 font-mono text-xs font-bold border border-blue-500/30">
                  {selectedUf}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Região {geo.region} • Capital: {geo.capital}
              </p>
            </div>

            <button
              onClick={() => setSelectedUf(null)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo com Scroll */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            
            {/* Cards de Métricas do Estado */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block mb-1">Eleitorado Aprox.</span>
                <span className="text-sm font-bold text-white block">
                  {formatInteger(geo.electorateSize)}
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold">
                  {formatPercent(geo.voterShare)} do Brasil
                </span>
              </div>

              <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60">
                <span className="text-[11px] text-slate-400 block mb-1">Pesquisas Mapeadas</span>
                <span className="text-sm font-bold text-white block">
                  {summary?.pollCount || 0}
                </span>
                <span className="text-[10px] text-blue-400">
                  {summary?.isSimulated ? "Projeção Calibrada" : "Dados Estaduais"}
                </span>
              </div>
            </div>

            {/* Destaque do Líder */}
            {summary?.leaderName && (
              <div
                className="rounded-xl p-4 border relative overflow-hidden"
                style={{
                  backgroundColor: `${summary.color}15`,
                  borderColor: `${summary.color}40`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-300 block mb-1">
                      Líder em {selectedUf}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: summary.color }}
                      />
                      <span className="text-base font-bold text-white">
                        {summary.leaderName}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-white">
                      {formatPercent(summary.leaderPercentage)}
                    </span>
                    <div className="flex items-center justify-end space-x-1 text-xs text-emerald-400 font-bold">
                      <TrendingUp className="w-3 h-3" />
                      <span>+{formatPercent(summary.margin)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Gráfico / Ranking de Candidatos no Estado */}
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                <span>Intenção de Voto Compilada</span>
                <span className="text-[10px] font-normal text-slate-500">
                  {filters.useValidVotes ? "Votos Válidos" : "Votos Totais"}
                </span>
              </h4>

              <div className="space-y-3">
                {summary?.results.map((c, index) => (
                  <div key={c.candidateId} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-slate-500 w-3">{index + 1}.</span>
                        <span className="font-semibold text-slate-200">{c.candidateName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({c.party})</span>
                      </div>
                      <span className="font-bold text-white">{formatPercent(c.percentage)}</span>
                    </div>

                    <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700/40">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, c.percentage)}%`,
                          backgroundColor: c.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Histórico de Pesquisas Específicas da UF */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Pesquisas de Intenção de Voto na UF</span>
                <span className="text-xs text-blue-400 font-semibold">{statePolls.length}</span>
              </h4>

              {statePolls.length > 0 ? (
                <div className="space-y-2.5">
                  {statePolls.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-800/70 rounded-xl p-3.5 border border-slate-700/60 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5 font-semibold text-xs text-white">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>{p.institute}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{p.date}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-700/40 pt-2">
                        {p.results.slice(0, 4).map((r) => (
                          <div key={r.candidateId} className="flex justify-between items-center">
                            <span className="text-slate-300 truncate max-w-[90px]">
                              {r.candidateName.split(" ")[0]}
                            </span>
                            <span className="font-semibold text-white">
                              {formatPercent(filters.useValidVotes ? (r.validPercentage ?? r.percentage) : r.percentage)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-2 text-[10px] text-slate-500 flex justify-between">
                        <span>Amostra: {p.sampleSize}</span>
                        <span>Margem: ±{p.marginOfError}p.p.</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-800/40 rounded-xl p-4 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                  <p className="font-medium text-slate-300 mb-1">Nenhuma pesquisa individual específica para {selectedUf}.</p>
                  <p className="text-[11px] text-slate-500">
                    Os números exibidos para este estado são calculados com base na média ponderada regional da Região {geo.region} e histórico eleitoral do TSE.
                  </p>
                </div>
              )}
            </div>

            {/* Registros Oficiais e Contratantes no TSE */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Registros TSE nesta UF</span>
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono font-bold">
                  {summary?.tseRegistriesCount || 0} protocolos
                </span>
              </div>

              {(summary?.tseRegistriesCount || 0) > 0 ? (
                <div className="space-y-2">
                  <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Investimento Total Declarado:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(summary?.totalTseInvestment || 0)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Para auditar cada protocolo, contratante e CNPJ desta UF, consulte a aba <strong className="text-blue-400">Auditoria TSE & Registros</strong>.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-800 text-[11px] text-slate-500">
                  Nenhum protocolo individual registrado para {selectedUf} na extração atual do TSE.
                </div>
              )}
            </div>

          </div>

          {/* Rodapé */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex justify-end">
            <button
              onClick={() => setSelectedUf(null)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 rounded-lg text-xs transition-colors border border-slate-700"
            >
              Fechar Detalhes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
