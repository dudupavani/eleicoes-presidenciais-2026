"use client";

import React from "react";
import { usePollsData, NavTab } from "@/context/PollsDataContext";
import { Map, Database, Scale, Vote } from "lucide-react";

export function NavigationTabs() {
  const { activeTab, setActiveTab, diagnosticReports, tseRegistries, allPolls } = usePollsData();

  const tabs: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    {
      id: "polls",
      label: "Pesquisas para Presidente",
      icon: Vote,
      badge: allPolls.length > 0 ? allPolls.length : undefined,
    },
    {
      id: "map",
      label: "Mapa por Estados (UFs)",
      icon: Map,
    },
    {
      id: "tse_audit",
      label: "Auditoria TSE & Registros",
      icon: Scale,
      badge: tseRegistries.length,
    },
    {
      id: "data_manager",
      label: "Gerenciador de Dados & CSVs",
      icon: Database,
      badge: diagnosticReports.length > 0 ? diagnosticReports.length : undefined,
    },
  ];

  return (
    <nav className="bg-slate-900/90 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500/30 text-blue-300 font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
