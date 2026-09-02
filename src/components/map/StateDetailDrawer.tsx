"use client";

import React, { useMemo } from "react";
import { usePollsData } from "@/context/PollsDataContext";
import { BRAZIL_STATES_GEO } from "@/data/brazil-states-svg";
import { formatPercent, formatInteger } from "@/lib/color-utils";
import { X, Calendar, Building2, FileCheck2, DollarSign } from "lucide-react";

export function StateDetailDrawer() {
  const { selectedUf, setSelectedUf, stateSummaries, tseRegistries, setActiveTab } = usePollsData();

  const stateRegistries = useMemo(
    () => (selectedUf ? tseRegistries.filter((r) => r.uf === selectedUf) : []),
    [tseRegistries, selectedUf]
  );

  if (!selectedUf) return null;

  const geo = BRAZIL_STATES_GEO[selectedUf];
  const summary = stateSummaries[selectedUf];

  const formatBrl = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

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
                <span className="text-[11px] text-slate-400 block mb-1">Pesquisas Registradas no TSE</span>
                <span className="text-sm font-bold text-white block">
                  {summary?.registriesCount || 0}
                </span>
                <span className="text-[10px] text-blue-400">
                  {summary?.uniqueAgencies || 0} institutos ativos
                </span>
              </div>
            </div>

            {/* Investimento Total */}
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 flex items-center justify-between">
              <span className="flex items-center space-x-2 text-xs text-slate-300">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Investimento total declarado</span>
              </span>
              <span className="font-bold text-emerald-400 font-mono text-sm">
                {formatBrl(summary?.totalInvestment || 0)}
              </span>
            </div>

            {/* Histórico de Registros TSE da UF */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Protocolos Registrados no TSE nesta UF</span>
                <span className="text-xs text-blue-400 font-semibold">{stateRegistries.length}</span>
              </h4>

              {stateRegistries.length > 0 ? (
                <div className="space-y-2.5">
                  {stateRegistries.slice(0, 20).map((r) => (
                    <div
                      key={r.protocol}
                      className="bg-slate-800/70 rounded-xl p-3.5 border border-slate-700/60 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5 font-semibold text-xs text-white">
                          <Building2 className="w-3.5 h-3.5 text-blue-400" />
                          <span className="truncate max-w-[180px]">{r.pollingAgency || "Não informado"}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{r.registrationDate || r.generationDate}</span>
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-700/40 pt-2">
                        <span className="flex items-center gap-1">
                          <FileCheck2 className="w-3 h-3 text-slate-500" />
                          <span className="font-mono">{r.protocol}</span>
                        </span>
                        <span className={r.valuePaid > 0 ? "text-emerald-400 font-semibold" : "text-slate-500"}>
                          {formatBrl(r.valuePaid)}
                        </span>
                      </div>
                      <div className="mt-1 text-[10px] text-slate-500 truncate">
                        Contratante: {r.contractorName}
                      </div>
                    </div>
                  ))}
                  {stateRegistries.length > 20 && (
                    <button
                      onClick={() => setActiveTab("tse_audit")}
                      className="w-full text-center text-xs text-blue-400 hover:text-blue-300 font-semibold py-2"
                    >
                      Ver todos os {stateRegistries.length} registros na Auditoria TSE →
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-slate-800/40 rounded-xl p-4 border border-dashed border-slate-700 text-center text-xs text-slate-400">
                  <p className="font-medium text-slate-300 mb-1">Nenhum protocolo registrado para {selectedUf}.</p>
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
