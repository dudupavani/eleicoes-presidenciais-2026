"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import {
  CsvDiagnosticReport,
  Poll,
  PresidentialRegistrySummary,
  StateTseSummary,
  TsePollRegistry,
  UF,
} from "@/types/election";
import { DEFAULT_POLLS } from "@/data/default-polls-data";
import { DEFAULT_TSE_REGISTRIES } from "@/data/default-tse-registries";
import { parseMultiplePollCsvs } from "@/lib/csv-parser";
import { getPresidentialRegistrySummary, getStatePresidentialPolls, getStateTseSummaries } from "@/lib/poll-aggregator";

export type NavTab = "polls" | "map" | "tse_audit" | "data_manager";

interface PollsDataContextType {
  allPolls: Poll[];
  tseRegistries: TsePollRegistry[];
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedUf: UF | null;
  setSelectedUf: (uf: UF | null) => void;
  stateSummaries: Record<UF, StateTseSummary>;
  statePolls: Partial<Record<UF, Poll[]>>;
  presidentialSummary: PresidentialRegistrySummary;
  diagnosticReports: CsvDiagnosticReport[];
  isProcessingUpload: boolean;
  uploadError: string | null;
  handleFileUpload: (files: File[]) => Promise<void>;
  resetToDefaults: () => void;
  deletePoll: (id: string) => void;
  deleteTseRegistry: (protocol: string) => void;
}

const PollsDataContext = createContext<PollsDataContextType | undefined>(undefined);

export function PollsDataProvider({ children }: { children: React.ReactNode }) {
  const [allPolls, setAllPolls] = useState<Poll[]>(DEFAULT_POLLS);
  const [tseRegistries, setTseRegistries] = useState<TsePollRegistry[]>(DEFAULT_TSE_REGISTRIES);
  const [activeTab, setActiveTab] = useState<NavTab>("polls");
  const [selectedUf, setSelectedUf] = useState<UF | null>(null);
  const [diagnosticReports, setDiagnosticReports] = useState<CsvDiagnosticReport[]>([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Resumos por estado (27 UFs), calculados exclusivamente a partir de registros reais do TSE
  const stateSummaries = useMemo(() => {
    return getStateTseSummaries(tseRegistries);
  }, [tseRegistries]);

  // Registros TSE cujo cargo declarado (DS_CARGO) é "Presidente" — abrangência nacional (BR)
  const presidentialSummary = useMemo(() => {
    return getPresidentialRegistrySummary(tseRegistries);
  }, [tseRegistries]);

  // Pesquisas presidenciais reais e publicadas, agrupadas por UF (scope != "BR")
  const statePolls = useMemo(() => {
    return getStatePresidentialPolls(allPolls);
  }, [allPolls]);

  // Manipulador de upload de múltiplos CSVs (suporta pesquisas eleitorais e arquivos oficiais TSE)
  const handleFileUpload = async (files: File[]) => {
    setIsProcessingUpload(true);
    setUploadError(null);
    try {
      const { polls, tseRegistries: newTse, reports } = await parseMultiplePollCsvs(files);
      if (polls.length === 0 && newTse.length === 0) {
        setUploadError("Nenhum dado válido de pesquisa ou registro TSE pôde ser extraído dos arquivos.");
      } else {
        if (polls.length > 0) {
          setAllPolls((prev) => [...polls, ...prev]);
        }
        if (newTse.length > 0) {
          setTseRegistries((prev) => [...newTse, ...prev]);
        }
        setDiagnosticReports((prev) => [...reports, ...prev]);
      }
    } catch (err: any) {
      setUploadError(err?.message || "Ocorreu um erro ao processar os arquivos CSV.");
    } finally {
      setIsProcessingUpload(false);
    }
  };

  // Restaura dataset padrão
  const resetToDefaults = () => {
    setAllPolls(DEFAULT_POLLS);
    setTseRegistries(DEFAULT_TSE_REGISTRIES);
    setDiagnosticReports([]);
    setSelectedUf(null);
    setUploadError(null);
  };

  // Deleta uma pesquisa específica
  const deletePoll = (id: string) => {
    setAllPolls((prev) => prev.filter((p) => p.id !== id));
  };

  // Deleta um registro TSE específico
  const deleteTseRegistry = (protocol: string) => {
    setTseRegistries((prev) => prev.filter((r) => r.protocol !== protocol));
  };

  return (
    <PollsDataContext.Provider
      value={{
        allPolls,
        tseRegistries,
        activeTab,
        setActiveTab,
        selectedUf,
        setSelectedUf,
        stateSummaries,
        statePolls,
        presidentialSummary,
        diagnosticReports,
        isProcessingUpload,
        uploadError,
        handleFileUpload,
        resetToDefaults,
        deletePoll,
        deleteTseRegistry,
      }}
    >
      {children}
    </PollsDataContext.Provider>
  );
}

export function usePollsData() {
  const context = useContext(PollsDataContext);
  if (!context) {
    throw new Error("usePollsData must be used within a PollsDataProvider");
  }
  return context;
}
