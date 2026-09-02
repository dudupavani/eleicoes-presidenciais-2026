"use client";

import React from "react";
import { MapMetricKey } from "@/types/election";

interface MapLegendProps {
  metric: MapMetricKey;
}

export function MapLegend({ metric }: MapLegendProps) {
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
