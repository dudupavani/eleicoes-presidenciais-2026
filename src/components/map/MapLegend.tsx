"use client";

import React, { useMemo } from "react";
import { MapMetricKey, Poll, UF } from "@/types/election";
import { CANDIDATES } from "@/data/candidate-profiles";
import { getPollLeader } from "@/lib/poll-aggregator";

interface MapLegendProps {
  metric: MapMetricKey;
  statePolls: Partial<Record<UF, Poll[]>>;
}

export function MapLegend({ metric, statePolls }: MapLegendProps) {
  const leaderCandidates = useMemo(() => {
    const set = new Map<string, { name: string; color: string }>();
    Object.values(statePolls).forEach((polls) => {
      const featured = polls?.[0];
      if (!featured) return;
      const leader = getPollLeader(featured);
      if (!leader) return;
      const profile = CANDIDATES[leader.candidateId];
      set.set(leader.candidateId, { name: profile?.shortName || leader.candidateName, color: profile?.color || "#64748B" });
    });
    return Array.from(set.values());
  }, [statePolls]);

  if (metric === "leader") {
    return (
      <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-3.5 shadow-lg backdrop-blur-md text-xs">
        <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Candidato Líder (pesquisa real)
        </h4>
        <div className="space-y-1.5 mb-3">
          {leaderCandidates.map((c) => (
            <div key={c.name} className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: c.color }} />
              <span className="text-slate-200 font-medium">{c.name}</span>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full shrink-0 bg-slate-800 border border-slate-700" />
            <span className="text-slate-500">Sem pesquisa real na UF</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-500 pt-2.5 border-t border-slate-800 leading-relaxed">
          Cor = candidato líder na pesquisa mais recente e publicada para aquele estado, conferida contra o
          registro no TSE. Só {Object.keys(statePolls).length} estado(s) têm pesquisa estadual real disponível
          até agora.
        </p>
      </div>
    );
  }

  const metricLabel = metric === "count" ? "Nº de Pesquisas Registradas" : "Valor Investido Declarado";

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-xl p-3.5 shadow-lg backdrop-blur-md text-xs">
      <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Intensidade por {metricLabel}
      </h4>
      <p className="text-[11px] text-slate-500 mb-2.5">
        Cor mais forte = maior {metric === "count" ? "número de pesquisas registradas" : "valor investido"} no TSE, em relação ao estado com mais registros.
      </p>

      <div className="flex items-center space-x-1.5">
        <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700" />
        <span className="text-slate-500 text-[11px]">Sem registros</span>
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <div
          className="flex-1 h-3 rounded-full"
          style={{ background: "linear-gradient(to right, rgba(59,130,246,0.25), rgba(59,130,246,1))" }}
        />
      </div>
      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
        <span>Poucos registros</span>
        <span>Muitos registros</span>
      </div>

      <p className="text-[10px] text-slate-500 mt-3 pt-2.5 border-t border-slate-800 leading-relaxed">
        Fonte: Repositório de Dados Eleitorais do TSE. Não há dados de intenção de voto — o TSE registra apenas quem contratou e pagou pesquisas, não seus resultados.
      </p>
    </div>
  );
}
