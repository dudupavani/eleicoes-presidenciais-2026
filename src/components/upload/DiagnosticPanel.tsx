"use client";

import React from "react";
import { usePollsData } from "@/context/PollsDataContext";
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Building2,
  Users,
  MapPin,
  Layers,
} from "lucide-react";

export function DiagnosticPanel() {
  const { diagnosticReports, allPolls } = usePollsData();

  if (diagnosticReports.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Status da Base de Dados Atual</h3>
            <p className="text-xs text-slate-400">Base de dados padrão de pesquisas eleitorais 2026 pré-carregada e ativa</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mt-4">
          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block mb-0.5">Total de Pesquisas</span>
            <span className="text-base font-bold text-white">{allPolls.length} pesquisas</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block mb-0.5">Institutos Ativos</span>
            <span className="text-base font-bold text-blue-400">
              {Array.from(new Set(allPolls.map((p) => p.institute))).length} institutos
            </span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block mb-0.5">Estados Mapeados</span>
            <span className="text-base font-bold text-emerald-400">27 UFs</span>
          </div>

          <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
            <span className="text-slate-400 block mb-0.5">Cenários Rastreados</span>
            <span className="text-base font-bold text-purple-400">
              {Array.from(new Set(allPolls.map((p) => p.scenario))).length} cenários
            </span>
          </div>
        </div>
      </div>
    );
  }

  const totalRows = diagnosticReports.reduce((acc, r) => acc + r.totalRows, 0);
  const totalValid = diagnosticReports.reduce((acc, r) => acc + r.validPollsParsed, 0);
  const allInstitutes = Array.from(new Set(diagnosticReports.flatMap((r) => r.detectedInstitutes)));
  const allCandidates = Array.from(new Set(diagnosticReports.flatMap((r) => r.detectedCandidates)));
  const allUfs = Array.from(new Set(diagnosticReports.flatMap((r) => r.detectedUfs)));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
      
      {/* Header do Diagnóstico */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Painel de Diagnóstico dos CSVs Carregados
            </h3>
            <p className="text-xs text-slate-400">
              Resumo estatístico e validação de compatibilidade dos arquivos processados
            </p>
          </div>
        </div>

        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
          {diagnosticReports.length} arquivo(s) analisado(s)
        </span>
      </div>

      {/* Métricas Globais */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Linhas & Pesquisas</span>
          </div>
          <span className="text-base font-bold text-white block">
            {totalValid} pesquisas
          </span>
          <span className="text-[10px] text-slate-400">{totalRows} linhas no total</span>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Institutos</span>
          </div>
          <span className="text-base font-bold text-white block">
            {allInstitutes.length} identificados
          </span>
          <span className="text-[10px] text-slate-400 truncate block">
            {allInstitutes.slice(0, 3).join(", ")}...
          </span>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Candidatos</span>
          </div>
          <span className="text-base font-bold text-white block">
            {allCandidates.length} detectados
          </span>
          <span className="text-[10px] text-slate-400 truncate block">
            {allCandidates.slice(0, 3).join(", ")}...
          </span>
        </div>

        <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
          <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span>Estados (UFs)</span>
          </div>
          <span className="text-base font-bold text-white block">
            {allUfs.length} localidades
          </span>
          <span className="text-[10px] text-slate-400">{allUfs.includes("BR") ? "Nacional + UFs" : "UFs"}</span>
        </div>
      </div>

      {/* Detalhamento por Arquivo */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Relatórios Individuais de Importação
        </h4>

        <div className="space-y-2.5">
          {diagnosticReports.map((r, i) => (
            <div
              key={i}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{r.fileName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Formato: {r.detectedFormat === "long" ? "Longo (1 linha/candidato)" : "Amplo (Wide)"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-slate-400 text-[11px]">
                <div>
                  <span className="text-slate-500">Linhas processadas: </span>
                  <span className="text-slate-200 font-semibold">{r.totalRows}</span>
                </div>
                <div>
                  <span className="text-slate-500">Pesquisas geradas: </span>
                  <span className="text-emerald-400 font-semibold">{r.validPollsParsed}</span>
                </div>
                <div>
                  <span className="text-slate-500">Candidatos no arquivo: </span>
                  <span className="text-slate-200 font-semibold">{r.detectedCandidates.length}</span>
                </div>
              </div>

              {/* Warnings se houver */}
              {r.warnings.length > 0 && (
                <div className="mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] space-y-1">
                  <div className="flex items-center space-x-1 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Avisos ({r.warnings.length}):</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                    {r.warnings.slice(0, 3).map((w, wi) => (
                      <li key={wi}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
