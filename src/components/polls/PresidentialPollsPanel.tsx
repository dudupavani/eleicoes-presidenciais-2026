"use client";

import React, { useMemo } from "react";
import { usePollsData } from "@/context/PollsDataContext";
import { CANDIDATES } from "@/data/candidate-profiles";
import { formatPercent } from "@/lib/color-utils";
import { Poll } from "@/types/election";
import {
  Vote,
  Calendar,
  Users,
  ShieldCheck,
  ExternalLink,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";

function PollCard({ poll }: { poll: Poll }) {
  const sortedResults = useMemo(
    () => [...poll.results].sort((a, b) => b.percentage - a.percentage),
    [poll.results]
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-white">{poll.institute}</h4>
            {poll.isVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <BadgeCheck className="w-3 h-3" />
                Conferido com o TSE
              </span>
            )}
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              {poll.scenario}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {poll.date}{poll.endDate && poll.endDate !== poll.date ? ` a ${poll.endDate}` : ""}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {poll.sampleSize.toLocaleString("pt-BR")} entrevistados
            </span>
            <span>±{poll.marginOfError} p.p.</span>
          </div>
        </div>

        {poll.tseProtocol && (
          <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/30 shrink-0">
            Protocolo TSE: {poll.tseProtocol}
          </span>
        )}
      </div>

      <div className="space-y-2">
        {sortedResults.map((r) => {
          const profile = CANDIDATES[r.candidateId];
          const color = profile?.color || "#64748B";
          return (
            <div key={r.candidateId} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  {r.candidateName}
                </span>
                <span className="font-bold text-white">{formatPercent(r.percentage)}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, r.percentage)}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {poll.sourceUrl && (
        <a
          href={poll.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
        >
          <span>Fonte: {poll.sourceName || "ver publicação"}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
}

export function PresidentialPollsPanel() {
  const { allPolls } = usePollsData();

  const nationalPolls = useMemo(
    () => allPolls.filter((p) => p.scope === "BR"),
    [allPolls]
  );

  const firstRound = useMemo(
    () =>
      nationalPolls
        .filter((p) => p.round === "1º Turno")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [nationalPolls]
  );

  const secondRound = useMemo(
    () =>
      nationalPolls
        .filter((p) => p.round === "2º Turno")
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [nationalPolls]
  );

  const simpleAverage = useMemo(() => {
    if (firstRound.length === 0) return null;
    const map = new Map<string, { name: string; sum: number; count: number }>();
    firstRound.forEach((p) => {
      p.results.forEach((r) => {
        if (r.candidateId === "brancos_nulos" || r.candidateId === "indecisos") return;
        const entry = map.get(r.candidateId) || { name: r.candidateName, sum: 0, count: 0 };
        entry.sum += r.percentage;
        entry.count += 1;
        map.set(r.candidateId, entry);
      });
    });
    return Array.from(map.entries())
      .map(([id, d]) => ({ candidateId: id, name: d.name, avg: d.sum / firstRound.length }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5);
  }, [firstRound]);

  if (nationalPolls.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
        <Vote className="w-8 h-8 text-slate-600 mx-auto" />
        <p className="text-sm text-slate-300 font-semibold">Nenhuma pesquisa carregada ainda.</p>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          O TSE não divulga o resultado das pesquisas que registra — só o instituto que a realizou o faz.
          Adicione pesquisas reais e publicadas via CSV na aba &quot;Gerenciador de Dados&quot;.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-800/40 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-lg">
            <Vote className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Pesquisas de Intenção de Voto para Presidente
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Números publicados pelos próprios institutos (o TSE não divulga resultado, só registro).
              Cada pesquisa abaixo foi conferida contra o protocolo oficial no TSE — instituto, data e
              amostra batem — e traz o link da publicação original.
            </p>
          </div>
        </div>

        {simpleAverage && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              Média simples das {firstRound.length} pesquisas nacionais mais recentes (1º turno)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {simpleAverage.map((c) => {
                const profile = CANDIDATES[c.candidateId];
                return (
                  <div key={c.candidateId} className="text-center">
                    <div
                      className="w-2 h-2 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: profile?.color || "#64748B" }}
                    />
                    <div className="text-lg font-black text-white">{formatPercent(c.avg)}</div>
                    <div className="text-[10px] text-slate-400 truncate">{profile?.shortName || c.name}</div>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 mt-3">
              Média não ponderada entre: {firstRound.map((p) => `${p.institute} (${p.date})`).join(", ")}.
            </p>
          </div>
        )}
      </div>

      {firstRound.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            1º Turno — Pesquisas Individuais
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {firstRound.map((p) => (
              <PollCard key={p.id} poll={p} />
            ))}
          </div>
        </div>
      )}

      {secondRound.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            2º Turno — Simulações
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {secondRound.map((p) => (
              <PollCard key={p.id} poll={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
