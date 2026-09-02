"use client";

import React, { useState, useMemo } from "react";
import { usePollsData } from "@/context/PollsDataContext";
import { formatPercent } from "@/lib/color-utils";
import { Search, Trash2, Database, MapPin, Building2, Calendar, FileSpreadsheet } from "lucide-react";
import { CANDIDATES } from "@/data/candidate-profiles";

export function PollsTable() {
  const { allPolls, deletePoll } = usePollsData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitute, setSelectedInstitute] = useState("all");
  const [selectedScope, setSelectedScope] = useState("all");

  const institutesList = useMemo(() => {
    return Array.from(new Set(allPolls.map((p) => p.institute)));
  }, [allPolls]);

  const scopesList = useMemo(() => {
    return Array.from(new Set(allPolls.map((p) => p.scope)));
  }, [allPolls]);

  const filteredList = useMemo(() => {
    return allPolls.filter((p) => {
      if (selectedInstitute !== "all" && p.institute !== selectedInstitute) {
        return false;
      }
      if (selectedScope !== "all" && p.scope !== selectedScope) {
        return false;
      }
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesInst = p.institute.toLowerCase().includes(query);
        const matchesScenario = p.scenario.toLowerCase().includes(query);
        const matchesDate = p.date.toLowerCase().includes(query);
        const matchesScope = p.scope.toLowerCase().includes(query);
        const matchesCand = p.results.some((r) => r.candidateName.toLowerCase().includes(query));
        if (!matchesInst && !matchesScenario && !matchesDate && !matchesScope && !matchesCand) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allPolls, searchTerm, selectedInstitute, selectedScope]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            Tabela Geral de Pesquisas Compiladas
          </h3>
          <p className="text-xs text-slate-400">
            Visualize, filtre e gerencie todas as pesquisas registradas no sistema
          </p>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700 w-fit">
          {filteredList.length} de {allPolls.length} pesquisas
        </span>
      </div>

      {/* Barra de Busca e Filtros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar por instituto, candidato, data ou UF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/90 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500 placeholder-slate-500"
          />
        </div>

        {/* Filtro por Instituto */}
        <div className="flex items-center space-x-2 bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-700 text-xs">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedInstitute}
            onChange={(e) => setSelectedInstitute(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer w-full"
          >
            <option value="all" className="bg-slate-900 text-white">Todos os Institutos</option>
            {institutesList.map((inst) => (
              <option key={inst} value={inst} className="bg-slate-900 text-white">
                {inst}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Abrangência / UF */}
        <div className="flex items-center space-x-2 bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-700 text-xs">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
            className="bg-transparent text-white font-medium focus:outline-none cursor-pointer w-full"
          >
            <option value="all" className="bg-slate-900 text-white">Todas as Abrangências (BR + UFs)</option>
            <option value="BR" className="bg-slate-900 text-white">Apenas Nacional (BR)</option>
            {scopesList.filter((s) => s !== "BR").map((s) => (
              <option key={s} value={s} className="bg-slate-900 text-white">
                UF: {s}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Tabela de Pesquisas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
            <tr>
              <th className="py-3 px-3">Data</th>
              <th className="py-3 px-3">Instituto</th>
              <th className="py-3 px-3">Abrangência</th>
              <th className="py-3 px-3">Cenário / Turno</th>
              <th className="py-3 px-3">Amostra / Margem</th>
              <th className="py-3 px-3">Resultados dos Candidatos</th>
              <th className="py-3 px-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredList.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                
                {/* Data */}
                <td className="py-3.5 px-3 whitespace-nowrap font-mono text-slate-300">
                  {p.date}
                </td>

                {/* Instituto */}
                <td className="py-3.5 px-3 whitespace-nowrap font-bold text-white">
                  <div className="flex items-center space-x-1.5">
                    <span>{p.institute}</span>
                    {p.isCustom && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        CSV
                      </span>
                    )}
                  </div>
                </td>

                {/* Abrangência */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                    p.scope === "BR"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  }`}>
                    {p.scope === "BR" ? "Nacional (BR)" : `UF: ${p.scope}`}
                  </span>
                </td>

                {/* Cenário e Turno */}
                <td className="py-3.5 px-3">
                  <div className="font-semibold text-slate-200">{p.scenario}</div>
                  <div className="text-[10px] text-slate-400">{p.round} • {p.type}</div>
                </td>

                {/* Amostra e Margem */}
                <td className="py-3.5 px-3 whitespace-nowrap font-mono text-[11px] text-slate-400">
                  <div>{p.sampleSize} ent.</div>
                  <div className="text-slate-500">±{p.marginOfError} p.p.</div>
                </td>

                {/* Resultados dos Candidatos com Pílulas */}
                <td className="py-3.5 px-3">
                  <div className="flex flex-wrap gap-1.5 max-w-md">
                    {p.results.map((r) => {
                      const profile = CANDIDATES[r.candidateId];
                      const val = r.percentage;

                      return (
                        <span
                          key={r.candidateId}
                          className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold"
                          style={{
                            backgroundColor: `${profile?.color || "#64748B"}20`,
                            color: profile?.color || "#ffffff",
                            border: `1px solid ${profile?.color || "#64748B"}40`,
                          }}
                        >
                          <span>{profile?.shortName || r.candidateName.split(" ")[0]}:</span>
                          <span className="font-bold">{formatPercent(val)}</span>
                        </span>
                      );
                    })}
                  </div>
                </td>

                {/* Ações (Excluir) */}
                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => deletePoll(p.id)}
                    title="Excluir pesquisa"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
