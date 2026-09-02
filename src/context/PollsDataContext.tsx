"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import {
  CsvDiagnosticReport,
  FilterOptions,
  NationalConsolidated,
  Poll,
  RoundType,
  StatePollSummary,
  TsePollRegistry,
  UF,
} from "@/types/election";
import { DEFAULT_POLLS } from "@/data/default-polls-data";
import { DEFAULT_TSE_REGISTRIES } from "@/data/default-tse-registries";
import { parseMultiplePollCsvs } from "@/lib/csv-parser";
import {
  filterPolls,
  getNationalConsolidated,
  getStatePollSummaries,
} from "@/lib/poll-aggregator";

export type NavTab = "map" | "national" | "scenarios" | "tse_audit" | "data_manager";

interface PollsDataContextType {
  allPolls: Poll[];
  filteredPolls: Poll[];
  tseRegistries: TsePollRegistry[];
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  updateFilter: <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  selectedUf: UF | null;
  setSelectedUf: (uf: UF | null) => void;
  nationalData: NationalConsolidated;
  stateSummaries: Record<UF, StatePollSummary>;
  diagnosticReports: CsvDiagnosticReport[];
  isProcessingUpload: boolean;
  uploadError: string | null;
  handleFileUpload: (files: File[]) => Promise<void>;
  resetToDefaults: () => void;
  deletePoll: (id: string) => void;
  deleteTseRegistry: (protocol: string) => void;
  availableScenarios: string[];
  availableInstitutes: string[];
}

const defaultFilters: FilterOptions = {
  scenario: "Cenário 1 (Principal)",
  round: "Todos",
  type: "Estimulada",
  institutes: [],
  dateRange: "all",
  useValidVotes: false,
  selectedUf: null,
};

const PollsDataContext = createContext<PollsDataContextType | undefined>(undefined);

export function PollsDataProvider({ children }: { children: React.ReactNode }) {
  const [allPolls, setAllPolls] = useState<Poll[]>(DEFAULT_POLLS);
  const [tseRegistries, setTseRegistries] = useState<TsePollRegistry[]>(DEFAULT_TSE_REGISTRIES);
  const [filters, setFilters] = useState<FilterOptions>(defaultFilters);
  const [activeTab, setActiveTab] = useState<NavTab>("map");
  const [selectedUf, setSelectedUf] = useState<UF | null>(null);
  const [diagnosticReports, setDiagnosticReports] = useState<CsvDiagnosticReport[]>([]);
  const [isProcessingUpload, setIsProcessingUpload] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Lista dinâmica de cenários disponíveis nas pesquisas carregadas
  const availableScenarios = useMemo(() => {
    const set = new Set<string>();
    allPolls.forEach((p) => {
      if (p.scenario) set.add(p.scenario);
    });
    return Array.from(set);
  }, [allPolls]);

  // Lista de institutos presentes
  const availableInstitutes = useMemo(() => {
    const set = new Set<string>();
    allPolls.forEach((p) => {
      if (p.institute) set.add(p.institute);
    });
    return Array.from(set);
  }, [allPolls]);

  // Atualizador pontual de filtros
  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Pesquisas filtradas
  const filteredPolls = useMemo(() => {
    return filterPolls(allPolls, filters);
  }, [allPolls, filters]);

  // Resumo consolidado nacional
  const nationalData = useMemo(() => {
    return getNationalConsolidated(filteredPolls, filters.useValidVotes);
  }, [filteredPolls, filters.useValidVotes]);

  // Resumos por estado (27 UFs) integrados com TSE
  const stateSummaries = useMemo(() => {
    return getStatePollSummaries(allPolls, filters, filters.useValidVotes, tseRegistries);
  }, [allPolls, filters, filters.useValidVotes, tseRegistries]);

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
    setFilters(defaultFilters);
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
        filteredPolls,
        tseRegistries,
        filters,
        setFilters,
        updateFilter,
        activeTab,
        setActiveTab,
        selectedUf,
        setSelectedUf,
        nationalData,
        stateSummaries,
        diagnosticReports,
        isProcessingUpload,
        uploadError,
        handleFileUpload,
        resetToDefaults,
        deletePoll,
        deleteTseRegistry,
        availableScenarios,
        availableInstitutes,
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
