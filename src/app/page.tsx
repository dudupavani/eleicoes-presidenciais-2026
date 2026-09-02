"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { NavigationTabs } from "@/components/layout/NavigationTabs";
import { FilterBar } from "@/components/common/FilterBar";
import { BrazilMap } from "@/components/map/BrazilMap";
import { NationalKPIs } from "@/components/national/NationalKPIs";
import { TimelineChart } from "@/components/national/TimelineChart";
import { CandidateBarChart } from "@/components/national/CandidateBarChart";
import { PollsterComparison } from "@/components/national/PollsterComparison";
import { ScenarioComparator } from "@/components/scenarios/ScenarioComparator";
import { TseRegistryPanel } from "@/components/tse/TseRegistryPanel";
import { CsvUploader } from "@/components/upload/CsvUploader";
import { DiagnosticPanel } from "@/components/upload/DiagnosticPanel";
import { SampleCsvTemplates } from "@/components/upload/SampleCsvTemplates";
import { PollsTable } from "@/components/upload/PollsTable";
import { usePollsData } from "@/context/PollsDataContext";
import { Info, ShieldCheck, Database, Layers, Scale } from "lucide-react";

export default function Home() {
  const { activeTab, allPolls, tseRegistries } = usePollsData();

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      
      {/* 1. Cabeçalho Superior */}
      <Header />

      {/* 2. Navegação por Abas Principais */}
      <NavigationTabs />

      {/* 3. Barra Global de Filtros */}
      <FilterBar />

      {/* 4. Área de Conteúdo Dinâmico */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* ABA 1: MAPA POR ESTADOS (UFs) */}
        {activeTab === "map" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <BrazilMap />
            <div className="pt-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Resumo Consolidado do Cenário Atual
              </h3>
              <NationalKPIs />
            </div>
          </div>
        )}

        {/* ABA 2: PAINEL NACIONAL & TENDÊNCIAS */}
        {activeTab === "national" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <NationalKPIs />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <TimelineChart />
              </div>
              <div className="lg:col-span-5">
                <CandidateBarChart />
              </div>
            </div>
            <PollsterComparison />
          </div>
        )}

        {/* ABA 3: COMPARADOR DE CENÁRIOS & 2º TURNO */}
        {activeTab === "scenarios" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <ScenarioComparator />
          </div>
        )}

        {/* ABA 4: AUDITORIA TSE & REGISTROS */}
        {activeTab === "tse_audit" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <TseRegistryPanel />
          </div>
        )}

        {/* ABA 5: GERENCIADOR DE DADOS & UPLOAD DE CSVS */}
        {activeTab === "data_manager" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <CsvUploader />
            <DiagnosticPanel />
            <SampleCsvTemplates />
            <PollsTable />
          </div>
        )}

      </div>

      {/* Rodapé Informativo */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Compilação independente para análise estatística das Eleições Presidenciais 2026.
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Base: {allPolls.length} pesquisas compiladas</span>
            <span>•</span>
            <span>Tolerância a múltiplos formatos CSV</span>
          </div>
        </div>
      </footer>

    </main>
  );
}
