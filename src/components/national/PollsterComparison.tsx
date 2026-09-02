"use client";

import React, { useMemo } from "react";
import { usePollsData } from "@/context/PollsDataContext";
import { formatPercent } from "@/lib/color-utils";
import { Building2, Layers, Calendar, BarChart2 } from "lucide-react";
import { CANDIDATES } from "@/data/candidate-profiles";

export function PollsterComparison() {
  const { filteredPolls, filters } = usePollsData();

  // Agrupa a pesquisa mais recente de cada instituto no cenário selecionado
  const latestByPollster = useMemo(() => {
    const map = new Map<string, typeof filteredPolls[0]>();

    filteredPolls.forEach((p) => {
      if (p.scope !== "BR") return;
      const existing = map.get(p.institute);
      if (!existing || new Date(p.date) > new Date(existing.date)) {
        map.set(p.institute, p);
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filteredPolls]);

  // Lista dos principais candidatos avaliados
  const trackedCandidates = useMemo(() => {
    const set = new Set<string>();
    latestByPollster.forEach((p) => {
      p.results.forEach((r) => {
        if (r.candidateId !== "brancos_nulos" && r.candidateId !== "indecisos") {
          set.add(r.candidateId);
        }
      });
    });
    return Array.from(set).slice(0, 6);
  }, [latestByPollster]);

  if (latestByPollster.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Comparativo de Resultados por Instituto
          </h3>
          <p className="text-xs text-slate-400">
            Última pesquisa divulgada por cada instituto de pesquisa registrado
          </p>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-blue-400 font-semibold border border-slate-700">
          {latestByPollster.length} Institutos
        </span>
      </div>

      {/* Tabela Comparativa Responsiva */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3 px-3 rounded-l-lg">Instituto</th>
              <th className="py-3 px-3">Data</th>
              <th className="py-3 px-3">Amostra / Margem</th>
              {trackedCandidates.map((cId) => {
                const c = CANDIDATES[cId];
                return (
                  <th key={cId} className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: c?.color || "#64748B" }}
                      />
                      <span>{c?.shortName || cId}</span>
                    </div>
                  </th>
                );
              })}
              <th className="py-3 px-3 text-right rounded-r-lg">B / N / Ind.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {latestByPollster.map((p) => {
              const blankResult = p.results.find((r) => r.candidateId === "brancos_nulos");
              const undecidedResult = p.results.find((r) => r.candidateId === "indecisos");
              const nonValidTotal = (blankResult?.percentage || 0) + (undecidedResult?.percentage || 0);

              return (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  
                  {/* Nome do Instituto */}
                  <td className="py-3.5 px-3 font-bold text-white whitespace-nowrap">
                    {p.institute}
                  </td>

                  {/* Data */}
                  <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap">
                    {p.date}
                  </td>

                  {/* Amostra e Margem */}
                  <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                    {p.sampleSize} ent. (±{p.marginOfError}p.p.)
                  </td>

                  {/* Resultados por Candidato */}
                  {trackedCandidates.map((cId) => {
                    const res = p.results.find((r) => r.candidateId === cId);
                    const val = filters.useValidVotes
                      ? res?.validPercentage ?? res?.percentage
                      : res?.percentage;

                    return (
                      <td key={cId} className="py-3.5 px-3 text-right font-semibold text-white whitespace-nowrap">
                        {res ? (
                          <span
                            className="px-2 py-0.5 rounded font-mono"
                            style={{
                              backgroundColor: `${CANDIDATES[cId]?.color || "#64748B"}15`,
                              color: CANDIDATES[cId]?.color || "#ffffff",
                            }}
                          >
                            {formatPercent(val)}
                          </span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Brancos e Indecisos */}
                  <td className="py-3.5 px-3 text-right text-slate-400 font-mono text-[11px]">
                    {filters.useValidVotes ? "0,0%" : formatPercent(nonValidTotal)}
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
