"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { NavigationTabs } from "@/components/layout/NavigationTabs";
import { BrazilMap } from "@/components/map/BrazilMap";
import { TseRegistryPanel } from "@/components/tse/TseRegistryPanel";
import { PresidentialPollsPanel } from "@/components/polls/PresidentialPollsPanel";
import { CsvUploader } from "@/components/upload/CsvUploader";
import { DiagnosticPanel } from "@/components/upload/DiagnosticPanel";
import { SampleCsvTemplates } from "@/components/upload/SampleCsvTemplates";
import { PollsTable } from "@/components/upload/PollsTable";
import { usePollsData } from "@/context/PollsDataContext";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  const { activeTab, tseRegistries } = usePollsData();

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* 1. Cabeçalho Superior */}
      <Header />

      {/* 2. Navegação por Abas Principais */}
      <NavigationTabs />

      {/* 3. Área de Conteúdo Dinâmico */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* ABA 1: PESQUISAS PARA PRESIDENTE (dados reais, publicados pelos institutos) */}
        {activeTab === "polls" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <PresidentialPollsPanel />
          </div>
        )}

        {/* ABA 2: MAPA POR ESTADOS (UFs) */}
        {activeTab === "map" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <BrazilMap />
          </div>
        )}

        {/* ABA 2: AUDITORIA TSE & REGISTROS */}
        {activeTab === "tse_audit" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <TseRegistryPanel />
          </div>
        )}

        {/* ABA 3: GERENCIADOR DE DADOS & UPLOAD DE CSVS */}
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
              Auditoria independente de registros oficiais de pesquisas eleitorais no TSE — Eleições 2026.
            </span>
          </div>

        </div>
      </footer>
    </main>
  );
}
