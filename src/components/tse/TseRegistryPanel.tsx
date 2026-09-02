"use client";

import React, { useState, useMemo } from "react";
import { usePollsData } from "@/context/PollsDataContext";
import { TsePollRegistry, UF } from "@/types/election";
import { formatInteger } from "@/lib/color-utils";
import {
  Scale,
  Building2,
  DollarSign,
  Search,
  FileCheck2,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  ExternalLink,
  MapPin,
  PieChart,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  FileText,
} from "lucide-react";
import { BRAZIL_STATES_GEO } from "@/data/brazil-states-svg";

export function TseRegistryPanel() {
  const { tseRegistries, deleteTseRegistry } = usePollsData();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUf, setSelectedUf] = useState("all");
  const [selectedAgency, setSelectedAgency] = useState("all");
  const [fundingType, setFundingType] = useState("all");
  const [selectedCargo, setSelectedCargo] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedRegistryModal, setSelectedRegistryModal] = useState<TsePollRegistry | null>(null);

  // Estatísticas Globais do TSE
  const totalInvestment = useMemo(() => {
    return tseRegistries.reduce((acc, r) => acc + (r.valuePaid || 0), 0);
  }, [tseRegistries]);

  const selfFundedCount = useMemo(() => {
    return tseRegistries.filter((r) => r.isSelfFunded || r.valuePaid === 0).length;
  }, [tseRegistries]);

  const uniqueAgencies = useMemo(() => {
    const set = new Set<string>();
    tseRegistries.forEach((r) => {
      if (r.pollingAgency) set.add(r.pollingAgency);
    });
    return Array.from(set).sort();
  }, [tseRegistries]);

  const uniqueContractors = useMemo(() => {
    return Array.from(new Set(tseRegistries.map((r) => r.contractorName)));
  }, [tseRegistries]);

  // Cargos declarados (DS_CARGO) presentes na base, para o filtro "Cargo"
  const uniqueCargos = useMemo(() => {
    const set = new Set<string>();
    tseRegistries.forEach((r) => {
      if (r.position) set.add(r.position);
    });
    return Array.from(set).sort();
  }, [tseRegistries]);

  const presidentialCount = useMemo(() => {
    return tseRegistries.filter((r) => (r.position || "").includes("Presidente")).length;
  }, [tseRegistries]);

  // Ranking dos Maiores Institutos / Empresas Executoras
  const topAgencies = useMemo(() => {
    const map = new Map<string, { name: string; count: number; totalValue: number }>();

    tseRegistries.forEach((r) => {
      const name = r.pollingAgency || "Outros";
      const entry = map.get(name) || { name, count: 0, totalValue: 0 };
      entry.count += 1;
      entry.totalValue += r.pollValue || r.valuePaid || 0;
      map.set(name, entry);
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [tseRegistries]);

  // Ranking de Maiores Contratantes por Valor
  const topContractorsByValue = useMemo(() => {
    const map = new Map<string, { name: string; cnpj: string; totalValue: number; count: number }>();

    tseRegistries.forEach((r) => {
      const entry = map.get(r.contractorName) || {
        name: r.contractorName,
        cnpj: r.contractorCnpj,
        totalValue: 0,
        count: 0,
      };
      entry.totalValue += r.valuePaid;
      entry.count += 1;
      map.set(r.contractorName, entry);
    });

    return Array.from(map.values()).sort((a, b) => b.totalValue - a.totalValue).slice(0, 6);
  }, [tseRegistries]);

  // Ranking de Estados com Maior Número de Registros
  const topStatesByRegistries = useMemo(() => {
    const map = new Map<string, { uf: string; name: string; count: number; totalValue: number }>();

    tseRegistries.forEach((r) => {
      const uf = r.uf || "BR";
      const entry = map.get(uf) || {
        uf,
        name: BRAZIL_STATES_GEO[uf as UF]?.name || uf,
        count: 0,
        totalValue: 0,
      };
      entry.count += 1;
      entry.totalValue += r.valuePaid;
      map.set(uf, entry);
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [tseRegistries]);

  // Lista Filtrada
  const filteredRegistries = useMemo(() => {
    return tseRegistries.filter((r) => {
      if (selectedUf !== "all" && r.uf !== selectedUf) {
        return false;
      }
      if (selectedAgency !== "all" && r.pollingAgency !== selectedAgency) {
        return false;
      }
      if (fundingType === "self" && !r.isSelfFunded && r.valuePaid > 0) {
        return false;
      }
      if (fundingType === "third_party" && (r.isSelfFunded || r.valuePaid === 0)) {
        return false;
      }
      if (selectedCargo !== "all" && r.position !== selectedCargo) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesProt = r.protocol.toLowerCase().includes(q);
        const matchesName = r.contractorName.toLowerCase().includes(q);
        const matchesAgency = (r.pollingAgency || "").toLowerCase().includes(q);
        const matchesCnpj = (r.contractorCnpj || "").toLowerCase().includes(q);
        const matchesStat = (r.statisticianName || "").toLowerCase().includes(q);
        const matchesUf = r.uf.toLowerCase().includes(q);
        if (!matchesProt && !matchesName && !matchesAgency && !matchesCnpj && !matchesStat && !matchesUf) {
          return false;
        }
      }
      return true;
    });
  }, [tseRegistries, selectedUf, selectedAgency, fundingType, selectedCargo, searchTerm]);

  // Paginação
  const totalPages = Math.ceil(filteredRegistries.length / itemsPerPage);
  const paginatedRegistries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRegistries.slice(start, start + itemsPerPage);
  }, [filteredRegistries, currentPage, itemsPerPage]);

  const formatBrl = (val: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Banner Oficial do TSE */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-800/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Auditoria Oficial do TSE: Registros & Contratantes
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {tseRegistries.length} Registros Homologados
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Base oficial completa do Repositório de Dados Eleitorais do TSE. Acompanhamento de empresas executoras, estatísticos responsáveis, metodologias, contratantes e valores financeiros declarados.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/90 text-emerald-400 border border-slate-700 font-semibold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Base Completa Brasil + 27 UFs</span>
            </span>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Globais do TSE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Protocolos Registrados</span>
            <FileCheck2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {formatInteger(tseRegistries.length)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Pesquisas oficiais em todo o território nacional
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Investido Declarado</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 truncate">
            {formatBrl(totalInvestment)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Valor acumulado pago por contratantes
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Institutos & Contratantes</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-300">
            {uniqueAgencies.length} <span className="text-xs font-normal text-slate-400">institutos</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {uniqueContractors.length} empresas e veículos contratantes
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Recurso Próprio / Financiado</span>
            <PieChart className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {Math.round((selfFundedCount / (tseRegistries.length || 1)) * 100)}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {formatInteger(selfFundedCount)} com recurso próprio / institutos
          </span>
        </div>

      </div>

      {/* Grid de Destaques: Maiores Institutos e Maiores Contratantes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Maiores Institutos Executores */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            Institutos com Maior Volume de Pesquisas Registradas
          </h3>

          <div className="space-y-2">
            {topAgencies.map((agency, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 text-center font-mono font-bold text-slate-500">{i + 1}º</span>
                  <span className="font-bold text-white truncate max-w-[220px]" title={agency.name}>
                    {agency.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-400 block">{agency.count} pesquisas</span>
                  <span className="text-[10px] text-slate-400">{formatBrl(agency.totalValue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maiores Contratantes por Investimento */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            Maiores Contratantes / Investidores em Pesquisas
          </h3>

          <div className="space-y-2">
            {topContractorsByValue.map((c, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2.5">
                  <span className="w-5 text-center font-mono font-bold text-slate-500">{i + 1}º</span>
                  <div>
                    <span className="font-bold text-white truncate block max-w-[200px]" title={c.name}>
                      {c.name}
                    </span>
                    {c.cnpj && <span className="text-[10px] text-slate-500 font-mono">CNPJ: {c.cnpj}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 block">{formatBrl(c.totalValue)}</span>
                  <span className="text-[10px] text-slate-400">{c.count} pesquisas pagas</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tabela Interativa de Protocolos TSE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-blue-400" />
              Tabela Completa de Registros Oficiais do TSE
            </h3>
            <p className="text-xs text-slate-400">
              Clique em qualquer registro para visualizar detalhes da metodologia, estatístico responsável e plano amostral
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setSelectedCargo(selectedCargo === "Presidente" ? "all" : "Presidente");
                setCurrentPage(1);
              }}
              className={`text-xs px-3 py-1 rounded-full font-semibold border transition-colors w-fit ${
                selectedCargo === "Presidente"
                  ? "bg-blue-600 text-white border-blue-500"
                  : "bg-slate-800 text-blue-300 border-slate-700 hover:border-blue-500"
              }`}
            >
              Só Presidente ({presidentialCount})
            </button>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-semibold border border-slate-700 w-fit">
              {filteredRegistries.length} de {tseRegistries.length} registros
            </span>
          </div>
        </div>

        {/* Filtros da Tabela */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

          {/* Busca Geral */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por protocolo, empresa, contratante ou estatístico..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-800/90 text-white text-xs rounded-xl pl-9 pr-3 py-2.5 border border-slate-700 focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>

          {/* Filtro por Cargo */}
          <div className="flex items-center space-x-2 bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-700 text-xs">
            <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCargo}
              onChange={(e) => {
                setSelectedCargo(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer w-full"
            >
              <option value="all" className="bg-slate-900 text-white">Todos os Cargos</option>
              {uniqueCargos.map((cargo) => (
                <option key={cargo} value={cargo} className="bg-slate-900 text-white">
                  {cargo}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por UF */}
          <div className="flex items-center space-x-2 bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-700 text-xs">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedUf}
              onChange={(e) => {
                setSelectedUf(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer w-full"
            >
              <option value="all" className="bg-slate-900 text-white">Todas as UFs ({Array.from(new Set(tseRegistries.map(r => r.uf))).length} UFs)</option>
              {Array.from(new Set(tseRegistries.map((r) => r.uf))).sort().map((uf) => (
                <option key={uf} value={uf} className="bg-slate-900 text-white">
                  {uf === "BR" ? "Nacional (BR)" : `UF: ${uf} (${BRAZIL_STATES_GEO[uf as UF]?.name || uf})`}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Empresa Executora */}
          <div className="flex items-center space-x-2 bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-700 text-xs">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedAgency}
              onChange={(e) => {
                setSelectedAgency(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer w-full"
            >
              <option value="all" className="bg-slate-900 text-white">Todos os Institutos</option>
              {uniqueAgencies.map((agency) => (
                <option key={agency} value={agency} className="bg-slate-900 text-white">
                  {agency}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Tipo de Financiamento */}
          <div className="flex items-center space-x-2 bg-slate-800/90 rounded-xl px-3 py-2 border border-slate-700 text-xs">
            <Scale className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={fundingType}
              onChange={(e) => {
                setFundingType(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer w-full"
            >
              <option value="all" className="bg-slate-900 text-white">Todos os Financiamentos</option>
              <option value="self" className="bg-slate-900 text-white">Apenas Recurso Próprio</option>
              <option value="third_party" className="bg-slate-900 text-white">Contratado por Terceiros</option>
            </select>
          </div>

        </div>

        {/* Tabela de Dados */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
              <tr>
                <th className="py-3 px-3">Protocolo TSE</th>
                <th className="py-3 px-3">UF</th>
                <th className="py-3 px-3">Cargo</th>
                <th className="py-3 px-3">Instituto Executor</th>
                <th className="py-3 px-3">Contratante</th>
                <th className="py-3 px-3">Amostra / Estatístico</th>
                <th className="py-3 px-3 text-right">Valor Pago</th>
                <th className="py-3 px-3 text-center">Recurso Próprio</th>
                <th className="py-3 px-3 text-right">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {paginatedRegistries.map((r, i) => (
                <tr
                  key={`${r.protocol}_${i}`}
                  onClick={() => setSelectedRegistryModal(r)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  {/* Protocolo */}
                  <td className="py-3.5 px-3 font-mono font-bold text-blue-400 whitespace-nowrap">
                    {r.protocol}
                  </td>

                  {/* UF */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                      {r.uf}
                    </span>
                  </td>

                  {/* Cargo */}
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    {r.position?.includes("Presidente") ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Presidente
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] truncate max-w-[140px] block" title={r.position}>
                        {r.position || "-"}
                      </span>
                    )}
                  </td>

                  {/* Instituto Executor */}
                  <td className="py-3.5 px-3 whitespace-nowrap font-semibold text-white">
                    {r.pollingAgency || "Não informado"}
                  </td>

                  {/* Contratante */}
                  <td className="py-3.5 px-3 max-w-[200px]">
                    <div className="font-medium text-slate-200 truncate" title={r.contractorName}>
                      {r.contractorName}
                    </div>
                  </td>

                  {/* Amostra e Estatístico */}
                  <td className="py-3.5 px-3 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                    <div>{r.sampleSize ? `${r.sampleSize} ent.` : "-"}</div>
                    <div className="text-slate-500 truncate max-w-[120px]">{r.statisticianName || "-"}</div>
                  </td>

                  {/* Valor Pago */}
                  <td className="py-3.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                    <span className={r.valuePaid > 0 ? "text-emerald-400" : "text-slate-500"}>
                      {formatBrl(r.valuePaid)}
                    </span>
                  </td>

                  {/* Recurso Próprio */}
                  <td className="py-3.5 px-3 text-center whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.isSelfFunded
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {r.isSelfFunded ? "Sim" : "Não"}
                    </span>
                  </td>

                  {/* Ação / Detalhes */}
                  <td className="py-3.5 px-3 text-right whitespace-nowrap">
                    <span className="text-blue-400 hover:text-blue-300 font-semibold text-xs inline-flex items-center gap-1">
                      <span>Ver</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controles de Paginação */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="text-slate-400">
              Mostrando página <span className="font-bold text-white">{currentPage}</span> de <span className="font-bold text-white">{totalPages}</span> ({filteredRegistries.length} registros)
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white border border-slate-700 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="flex items-center space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  let pageNum = idx + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = Math.min(totalPages - 4 + idx, currentPage - 2 + idx);
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-mono text-xs font-bold transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white border border-slate-700 flex items-center gap-1"
              >
                <span>Próxima</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Modal de Detalhes do Protocolo TSE */}
      {selectedRegistryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Protocolo TSE: {selectedRegistryModal.protocol}
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-xs">
                      {selectedRegistryModal.uf}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Registro oficial no Tribunal Superior Eleitoral
                    {selectedRegistryModal.position && ` • Cargo: ${selectedRegistryModal.position}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedRegistryModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block mb-0.5">Empresa / Instituto Executor:</span>
                <span className="font-bold text-white text-sm block">{selectedRegistryModal.pollingAgency}</span>
                {selectedRegistryModal.pollingAgencyCnpj && (
                  <span className="text-[10px] text-slate-500 font-mono">CNPJ: {selectedRegistryModal.pollingAgencyCnpj}</span>
                )}
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block mb-0.5">Contratante Declarado:</span>
                <span className="font-bold text-white text-sm block truncate">{selectedRegistryModal.contractorName}</span>
                {selectedRegistryModal.contractorCnpj && (
                  <span className="text-[10px] text-slate-500 font-mono">CNPJ: {selectedRegistryModal.contractorCnpj}</span>
                )}
              </div>

              {selectedRegistryModal.payerName && (
                <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 col-span-2">
                  <span className="text-slate-400 block mb-0.5">Pagante (quando difere do contratante):</span>
                  <span className="font-bold text-amber-300 text-sm block truncate">{selectedRegistryModal.payerName}</span>
                  {selectedRegistryModal.payerCnpj && (
                    <span className="text-[10px] text-slate-500 font-mono">CNPJ: {selectedRegistryModal.payerCnpj}</span>
                  )}
                </div>
              )}

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block mb-0.5">Valor Pago / Custo:</span>
                <span className="font-bold text-emerald-400 text-base font-mono">
                  {formatBrl(selectedRegistryModal.valuePaid)}
                </span>
                <span className="text-[10px] text-slate-400 block">Origem: {selectedRegistryModal.resourceOrigin}</span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
                <span className="text-slate-400 block mb-0.5">Estatístico Responsável:</span>
                <span className="font-bold text-white block">{selectedRegistryModal.statisticianName || "Não informado"}</span>
                {selectedRegistryModal.conreId && (
                  <span className="text-[10px] text-blue-400 font-mono">CONRE: {selectedRegistryModal.conreId}</span>
                )}
              </div>
            </div>

            {selectedRegistryModal.methodology && (
              <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 font-semibold block flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" />
                  <span>Resumo Metodológico e Amostragem:</span>
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {selectedRegistryModal.methodology}...
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedRegistryModal(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Fechar Detalhes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
