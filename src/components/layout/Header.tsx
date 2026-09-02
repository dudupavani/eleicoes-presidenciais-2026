"use client";

import React, { useMemo } from "react";
import { usePollsData } from "@/context/PollsDataContext";
import {
  Vote,
  UploadCloud,
  RotateCcw,
  Download,
  Calendar,
  Building2,
  CheckCircle2,
} from "lucide-react";

export function Header() {
  const { tseRegistries, resetToDefaults, setActiveTab } = usePollsData();

  const institutesCount = useMemo(
    () => new Set(tseRegistries.map((r) => r.pollingAgency).filter(Boolean)).size,
    [tseRegistries]
  );

  const dateRange = useMemo(() => {
    const dates = tseRegistries
      .map((r) => r.registrationDate || r.generationDate)
      .filter((d): d is string => !!d)
      .sort();
    if (dates.length === 0) return { start: "-", end: "-" };
    return { start: dates[0], end: dates[dates.length - 1] };
  }, [tseRegistries]);

  const handleExportCsv = () => {
    const rows = [
      ["Protocolo", "UF", "Instituto Executor", "Contratante", "CNPJ Contratante", "Pagante", "Data Registro", "Valor Pago", "Recurso Próprio"],
    ];

    tseRegistries.forEach((r) => {
      rows.push([
        `"${r.protocol}"`,
        `"${r.uf}"`,
        `"${r.pollingAgency}"`,
        `"${r.contractorName}"`,
        `"${r.contractorCnpj}"`,
        `"${r.payerName || ""}"`,
        `"${r.registrationDate || r.generationDate}"`,
        `${r.valuePaid}`,
        `"${r.isSelfFunded ? "Sim" : "Não"}"`,
      ]);
    });

    const csvString = rows.map((e) => e.join(";")).join("\n");
    const blob = new Blob(["﻿" + csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `registros_tse_2026_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-4 gap-4">
          {/* Logo & Título */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 via-blue-600 to-red-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Vote className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Eleições Presidenciais 2026
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Brasil
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400">
                Auditoria de Registros Oficiais de Pesquisas Eleitorais no TSE
              </p>
            </div>
          </div>

          {/* Badges de Resumo Rápido */}
          <div className="hidden lg:flex items-center space-x-3 text-xs">
            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center space-x-2">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-slate-300">Institutos:</span>
              <span className="font-semibold text-white">{institutesCount}</span>
            </div>

            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">Registros TSE:</span>
              <span className="font-semibold text-emerald-400">{tseRegistries.length}</span>
            </div>

            <div className="bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300">Período:</span>
              <span className="font-medium text-slate-200">
                {dateRange.start} até {dateRange.end}
              </span>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("data_manager")}
              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-all shadow-md shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Subir CSVs</span>
            </button>

            <button
              onClick={handleExportCsv}
              title="Exportar registros TSE para CSV"
              className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-2 rounded-lg border border-slate-700 transition-all hover:text-white"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            <button
              onClick={resetToDefaults}
              title="Restaurar base de dados padrão"
              className="inline-flex items-center p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
