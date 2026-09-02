"use client";

import React from "react";
import { CANDIDATES } from "@/data/candidate-profiles";

export function MapLegend() {
  const mainCandidates = [
    CANDIDATES.lula,
    CANDIDATES.flavio_bolsonaro,
    CANDIDATES.romeu_zema,
    CANDIDATES.tarcisio_freitas,
    CANDIDATES.ciro_gomes,
    CANDIDATES.simone_tebet,
    CANDIDATES.ronaldo_caiado,
  ];

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-3.5 shadow-lg backdrop-blur-md text-xs">
      
      {/* Candidatos e Cores */}
      <div className="mb-3">
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Candidato Líder no Estado
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {mainCandidates.map((c) => (
            <div key={c.id} className="flex items-center space-x-2">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: c.color }}
              />
              <span className="text-slate-200 font-medium truncate">{c.shortName}</span>
              <span className="text-[10px] text-slate-500 font-mono">({c.party})</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-800 pt-2.5">
        {/* Escala de Intensidade por Margem */}
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <span>Intensidade por Vantagem</span>
          <span className="text-[10px] text-slate-500 font-normal">Pontos %</span>
        </h4>
        
        <div className="flex items-center justify-between space-x-2 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-500/40 border border-blue-400/50" />
            <span className="text-slate-400">&lt; 3% (Apertado)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-500/70 border border-blue-400/80" />
            <span className="text-slate-300">3% a 8% (Moderado)</span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded bg-blue-600 border border-blue-300" />
            <span className="text-slate-200 font-semibold">&gt; 8% (Consolidado)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
