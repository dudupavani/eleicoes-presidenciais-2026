"use client";

import React from "react";
import { usePollsData } from "@/context/PollsDataContext";
import { Filter, Layers, Check, Calendar, HelpCircle } from "lucide-react";

export function FilterBar() {
  const {
    filters,
    updateFilter,
    availableScenarios,
    availableInstitutes,
  } = usePollsData();

  const handleInstituteToggle = (inst: string) => {
    if (filters.institutes.includes(inst)) {
      updateFilter(
        "institutes",
        filters.institutes.filter((i) => i !== inst)
      );
    } else {
      updateFilter("institutes", [...filters.institutes, inst]);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800/80 py-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Esquerda: Filtros Principais */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          
          <div className="flex items-center space-x-1.5 text-slate-400 font-medium mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Filtros:</span>
          </div>

          {/* Cenário */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 rounded-lg px-2.5 py-1.5 border border-slate-700">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Cenário:</span>
            <select
              value={filters.scenario}
              onChange={(e) => updateFilter("scenario", e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="Todos" className="bg-slate-900 text-white">Todos os Cenários</option>
              {availableScenarios.map((sc) => (
                <option key={sc} value={sc} className="bg-slate-900 text-white">
                  {sc}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo (Estimulada vs Espontânea) */}
          <div className="flex items-center bg-slate-800/90 rounded-lg p-0.5 border border-slate-700">
            <button
              onClick={() => updateFilter("type", "Estimulada")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filters.type === "Estimulada"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Estimulada
            </button>
            <button
              onClick={() => updateFilter("type", "Espontânea")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filters.type === "Espontânea"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Espontânea
            </button>
            <button
              onClick={() => updateFilter("type", "Todos")}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
                filters.type === "Todos"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Todos
            </button>
          </div>

          {/* Período */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 rounded-lg px-2.5 py-1.5 border border-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Período:</span>
            <select
              value={filters.dateRange}
              onChange={(e) => updateFilter("dateRange", e.target.value as any)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-slate-900 text-white">Todo o Histórico</option>
              <option value="30d" className="bg-slate-900 text-white">Últimos 30 dias</option>
              <option value="90d" className="bg-slate-900 text-white">Últimos 3 meses</option>
              <option value="180d" className="bg-slate-900 text-white">Últimos 6 meses</option>
              <option value="365d" className="bg-slate-900 text-white">Último ano</option>
            </select>
          </div>

        </div>

        {/* Direita: Toggle de Votos Válidos vs Totais */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700">
            <button
              onClick={() => updateFilter("useValidVotes", false)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                !filters.useValidVotes
                  ? "bg-slate-700 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Votos Totais
            </button>
            <button
              onClick={() => updateFilter("useValidVotes", true)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                filters.useValidVotes
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Votos Válidos
            </button>
          </div>

          <div
            title="Votos Válidos excluem brancos, nulos e indecisos do total para simular a apuração oficial do TSE."
            className="cursor-pointer text-slate-500 hover:text-slate-300"
          >
            <HelpCircle className="w-4 h-4" />
          </div>
        </div>

      </div>
    </div>
  );
}
