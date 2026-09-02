"use client";

import React, { useState, useMemo } from "react";
import { usePollsData } from "@/context/PollsDataContext";
import { CANDIDATES } from "@/data/candidate-profiles";
import { formatPercent } from "@/lib/color-utils";
import { Swords, CheckCircle2, TrendingUp, ArrowRight, Trophy } from "lucide-react";

export function ScenarioComparator() {
  const { allPolls, filters } = usePollsData();

  // Cenários de Segundo Turno pré-definidos
  const runoffScenarios = [
    {
      id: "lula_vs_flavio",
      title: "Lula vs Flávio Bolsonaro",
      scenarioKey: "Lula x Flávio Bolsonaro",
      candA: CANDIDATES.lula,
      candB: CANDIDATES.flavio_bolsonaro,
    },
    {
      id: "lula_vs_zema",
      title: "Lula vs Romeu Zema",
      scenarioKey: "Lula x Romeu Zema",
      candA: CANDIDATES.lula,
      candB: CANDIDATES.romeu_zema,
    },
    {
      id: "lula_vs_tarcisio",
      title: "Lula vs Tarcísio de Freitas",
      scenarioKey: "Lula x Tarcísio de Freitas",
      candA: CANDIDATES.lula,
      candB: CANDIDATES.tarcisio_freitas,
    },
  ];

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("lula_vs_flavio");

  const currentScenario = runoffScenarios.find((s) => s.id === selectedScenarioId) || runoffScenarios[0];

  // Pesquisas correspondentes ao cenário de segundo turno selecionado
  const matchingPolls = useMemo(() => {
    return allPolls.filter((p) => {
      const s = (p.scenario || "").toLowerCase();
      const target = currentScenario.scenarioKey.toLowerCase();
      return (p.round === "2º Turno" || s.includes("2º turno") || s.includes("segundo")) &&
        (s.includes(currentScenario.candB.id) || s.includes(currentScenario.candB.shortName.toLowerCase()) || s.includes(target));
    });
  }, [allPolls, currentScenario]);

  // Médias do confronto direto
  const headToHeadStats = useMemo(() => {
    if (matchingPolls.length === 0) {
      // Projeção base
      return {
        candAPct: 48.5,
        candAValidPct: 54.0,
        candBPct: 41.5,
        candBValidPct: 46.0,
        blanks: 6.8,
        undecided: 3.2,
        margin: 7.0,
        pollsCount: 0,
      };
    }

    let sumA = 0;
    let sumAValid = 0;
    let sumB = 0;
    let sumBValid = 0;
    let sumBlanks = 0;
    let sumUndecided = 0;

    matchingPolls.forEach((p) => {
      p.results.forEach((r) => {
        if (r.candidateId === currentScenario.candA.id) {
          sumA += r.percentage;
          sumAValid += r.validPercentage ?? r.percentage;
        } else if (r.candidateId === currentScenario.candB.id) {
          sumB += r.percentage;
          sumBValid += r.validPercentage ?? r.percentage;
        } else if (r.candidateId === "brancos_nulos") {
          sumBlanks += r.percentage;
        } else if (r.candidateId === "indecisos") {
          sumUndecided += r.percentage;
        }
      });
    });

    const count = matchingPolls.length;
    const candAPct = Number((sumA / count).toFixed(1));
    const candAValidPct = Number((sumAValid / count).toFixed(1));
    const candBPct = Number((sumB / count).toFixed(1));
    const candBValidPct = Number((sumBValid / count).toFixed(1));
    const blanks = Number((sumBlanks / count).toFixed(1));
    const undecided = Number((sumUndecided / count).toFixed(1));

    const leadPct = filters.useValidVotes ? candAValidPct : candAPct;
    const runPct = filters.useValidVotes ? candBValidPct : candBPct;
    const margin = Number(Math.abs(leadPct - runPct).toFixed(1));

    return {
      candAPct,
      candAValidPct,
      candBPct,
      candBValidPct,
      blanks,
      undecided,
      margin,
      pollsCount: count,
    };
  }, [matchingPolls, currentScenario, filters.useValidVotes]);

  const candAIsLeading =
    (filters.useValidVotes ? headToHeadStats.candAValidPct : headToHeadStats.candAPct) >=
    (filters.useValidVotes ? headToHeadStats.candBValidPct : headToHeadStats.candBPct);

  return (
    <div className="space-y-6">
      
      {/* Seletor de Cenários de 2º Turno */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Swords className="w-5 h-5 text-blue-400" />
              Simulador e Comparador de Cenários de 2º Turno
            </h2>
            <p className="text-xs text-slate-400">
              Selecione os confrontos diretos para analisar as pesquisas de segundo turno
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-800/90 rounded-lg p-1 border border-slate-700">
            {runoffScenarios.map((sc) => (
              <button
                key={sc.id}
                onClick={() => setSelectedScenarioId(sc.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  selectedScenarioId === sc.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {sc.candA.shortName} x {sc.candB.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* Card do Confronto Direto */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-slate-950/60 rounded-2xl p-6 border border-slate-800">
          
          {/* Candidato A */}
          <div className="md:col-span-5 flex items-center space-x-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shrink-0"
              style={{ backgroundColor: currentScenario.candA.color }}
            >
              {currentScenario.candA.shortName[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-white">
                  {currentScenario.candA.name}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({currentScenario.candA.party})
                </span>
              </div>
              <div className="flex items-baseline space-x-2 mt-1">
                <span
                  className="text-4xl font-black"
                  style={{ color: currentScenario.candA.color }}
                >
                  {formatPercent(
                    filters.useValidVotes
                      ? headToHeadStats.candAValidPct
                      : headToHeadStats.candAPct
                  )}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {filters.useValidVotes ? "votos válidos" : "votos totais"}
                </span>
              </div>
              {candAIsLeading && (
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 mt-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Em vantagem (+{formatPercent(headToHeadStats.margin)})</span>
                </span>
              )}
            </div>
          </div>

          {/* Divisor VS */}
          <div className="md:col-span-2 text-center py-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs shadow-inner">
              VS
            </div>
          </div>

          {/* Candidato B */}
          <div className="md:col-span-5 flex items-center justify-end space-x-4 text-right">
            <div>
              <div className="flex items-center justify-end space-x-2">
                <span className="text-xs text-slate-400 font-mono">
                  ({currentScenario.candB.party})
                </span>
                <span className="text-base font-bold text-white">
                  {currentScenario.candB.name}
                </span>
              </div>
              <div className="flex items-baseline justify-end space-x-2 mt-1">
                <span className="text-xs text-slate-400 font-medium">
                  {filters.useValidVotes ? "votos válidos" : "votos totais"}
                </span>
                <span
                  className="text-4xl font-black"
                  style={{ color: currentScenario.candB.color }}
                >
                  {formatPercent(
                    filters.useValidVotes
                      ? headToHeadStats.candBValidPct
                      : headToHeadStats.candBPct
                  )}
                </span>
              </div>
              {!candAIsLeading && (
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-400 mt-1">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Em vantagem (+{formatPercent(headToHeadStats.margin)})</span>
                </span>
              )}
            </div>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shrink-0"
              style={{ backgroundColor: currentScenario.candB.color }}
            >
              {currentScenario.candB.shortName[0]}
            </div>
          </div>

        </div>

        {/* Barra de Confronto Bipolar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-400 font-semibold">
            <span style={{ color: currentScenario.candA.color }}>
              {currentScenario.candA.shortName}: {formatPercent(filters.useValidVotes ? headToHeadStats.candAValidPct : headToHeadStats.candAPct)}
            </span>
            {!filters.useValidVotes && (
              <span className="text-slate-500">
                Brancos/Nulos: {formatPercent(headToHeadStats.blanks)} • Indecisos: {formatPercent(headToHeadStats.undecided)}
              </span>
            )}
            <span style={{ color: currentScenario.candB.color }}>
              {currentScenario.candB.shortName}: {formatPercent(filters.useValidVotes ? headToHeadStats.candBValidPct : headToHeadStats.candBPct)}
            </span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-4 overflow-hidden flex border border-slate-800 p-0.5 shadow-inner">
            <div
              className="h-full rounded-l-full transition-all duration-500"
              style={{
                width: `${(filters.useValidVotes ? headToHeadStats.candAValidPct : headToHeadStats.candAPct)}%`,
                backgroundColor: currentScenario.candA.color,
              }}
            />
            {!filters.useValidVotes && (
              <div
                className="h-full bg-slate-700 transition-all duration-500"
                style={{
                  width: `${headToHeadStats.blanks + headToHeadStats.undecided}%`,
                }}
              />
            )}
            <div
              className="h-full rounded-r-full transition-all duration-500"
              style={{
                width: `${(filters.useValidVotes ? headToHeadStats.candBValidPct : headToHeadStats.candBPct)}%`,
                backgroundColor: currentScenario.candB.color,
              }}
            />
          </div>
        </div>

      </div>

      {/* Lista de Pesquisas Registradas para este Cenário */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">
          Pesquisas Registradas para {currentScenario.title}
        </h3>

        {matchingPolls.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matchingPolls.map((p) => {
              const resA = p.results.find((r) => r.candidateId === currentScenario.candA.id);
              const resB = p.results.find((r) => r.candidateId === currentScenario.candB.id);

              return (
                <div
                  key={p.id}
                  className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white text-xs block">{p.institute}</span>
                    <span className="text-[10px] text-slate-400">{p.date} • Amostra: {p.sampleSize}</span>
                  </div>

                  <div className="flex items-center space-x-3 text-sm font-bold">
                    <span style={{ color: currentScenario.candA.color }}>
                      {formatPercent(filters.useValidVotes ? resA?.validPercentage ?? resA?.percentage : resA?.percentage)}
                    </span>
                    <span className="text-slate-500 text-xs font-normal">x</span>
                    <span style={{ color: currentScenario.candB.color }}>
                      {formatPercent(filters.useValidVotes ? resB?.validPercentage ?? resB?.percentage : resB?.percentage)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Nenhuma pesquisa individual cadastrada para este cenário de segundo turno.</p>
        )}
      </div>

    </div>
  );
}
