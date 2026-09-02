import { ALL_UFS, BRAZIL_STATES_GEO } from "@/data/brazil-states-svg";
import { CANDIDATES } from "@/data/candidate-profiles";
import { FilterOptions, NationalConsolidated, Poll, StatePollSummary, UF } from "@/types/election";
import { calculateStateColorIntensity, getCandidateColor } from "./color-utils";

/**
 * Regional historical bias factors relative to national average (Calibration for 2026)
 */
const REGIONAL_FACTORS: Record<string, Record<string, number>> = {
  // Nordeste: forte vantagem Lula
  Nordeste: {
    lula: 1.35,
    flavio_bolsonaro: 0.62,
    romeu_zema: 0.45,
    tarcisio_freitas: 0.55,
    ciro_gomes: 1.45,
    simone_tebet: 0.6,
    ronaldo_caiado: 0.5,
  },
  // Sul: forte vantagem Flávio / Zema / Direita
  Sul: {
    lula: 0.78,
    flavio_bolsonaro: 1.28,
    romeu_zema: 1.32,
    tarcisio_freitas: 1.25,
    ciro_gomes: 0.7,
    simone_tebet: 0.9,
    ronaldo_caiado: 1.1,
    eduardo_leite: 2.8,
    ratinho_junior: 2.9,
  },
  // Centro-Oeste: forte vantagem agro / direita
  "Centro-Oeste": {
    lula: 0.75,
    flavio_bolsonaro: 1.35,
    romeu_zema: 1.15,
    tarcisio_freitas: 1.2,
    ciro_gomes: 0.65,
    simone_tebet: 1.2,
    ronaldo_caiado: 3.2,
  },
  // Sudeste: equilibrado / peso determinante
  Sudeste: {
    lula: 0.96,
    flavio_bolsonaro: 1.05,
    romeu_zema: 1.38,
    tarcisio_freitas: 1.35,
    ciro_gomes: 0.9,
    simone_tebet: 0.95,
    ronaldo_caiado: 0.8,
  },
  // Norte: equilibrado com variações
  Norte: {
    lula: 1.05,
    flavio_bolsonaro: 1.08,
    romeu_zema: 0.7,
    tarcisio_freitas: 0.9,
    ciro_gomes: 0.8,
    simone_tebet: 0.8,
    ronaldo_caiado: 1.2,
  },
};

/**
 * Filtra as pesquisas com base nas opções selecionadas pelo usuário
 */
export function filterPolls(polls: Poll[], filters: FilterOptions): Poll[] {
  return polls.filter((p) => {
    // Filtro por Turno
    if (filters.round !== "Todos" && p.round !== filters.round) {
      return false;
    }

    // Filtro por Cenário
    if (filters.scenario && filters.scenario !== "Todos") {
      // Correspondência flexível de cenário
      const normScenario = p.scenario.toLowerCase();
      const normFilter = filters.scenario.toLowerCase();
      if (!normScenario.includes(normFilter) && !normFilter.includes(normScenario)) {
        return false;
      }
    }

    // Filtro por Tipo (Estimulada vs Espontânea)
    if (filters.type !== "Todos" && p.type !== filters.type) {
      return false;
    }

    // Filtro por Instituto
    if (filters.institutes && filters.institutes.length > 0) {
      if (!filters.institutes.includes(p.institute)) {
        return false;
      }
    }

    // Filtro por Data
    if (filters.dateRange !== "all") {
      const pollDate = new Date(p.date);
      const now = new Date();
      let days = 3650; // default amplo

      if (filters.dateRange === "30d") days = 30;
      else if (filters.dateRange === "90d") days = 90;
      else if (filters.dateRange === "180d") days = 180;
      else if (filters.dateRange === "365d") days = 365;

      const diffTime = Math.abs(now.getTime() - pollDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > days) return false;
    }

    return true;
  });
}

/**
 * Consolida as pesquisas nacionais com cálculo de média ponderada e estatísticas
 */
export function getNationalConsolidated(
  polls: Poll[],
  useValidVotes: boolean = false
): NationalConsolidated {
  const nationalPolls = polls.filter((p) => p.scope === "BR");
  const targetPolls = nationalPolls.length > 0 ? nationalPolls : polls;

  if (targetPolls.length === 0) {
    return {
      totalPolls: 0,
      dateRange: { start: "-", end: "-" },
      institutes: [],
      leader: null,
      runnerUp: null,
      margin: 0,
      candidatesRanking: [],
      blanksAndNulls: 0,
      undecided: 0,
    };
  }

  // Ordena por data decrescente
  const sortedPolls = [...targetPolls].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const dates = sortedPolls.map((p) => p.date);
  const minDate = dates[dates.length - 1];
  const maxDate = dates[0];
  const institutes = Array.from(new Set(sortedPolls.map((p) => p.institute)));

  // Agregação ponderada por recência e tamanho de amostra
  const candidateStatsMap = new Map<
    string,
    {
      totalWeightedVotes: number;
      totalWeightedValidVotes: number;
      sumWeights: number;
      values: number[];
      validValues: number[];
      profile: (typeof CANDIDATES)[string];
    }
  >();

  let totalBlankWeighted = 0;
  let totalUndecidedWeighted = 0;
  let totalGlobalWeight = 0;

  sortedPolls.forEach((p, index) => {
    // Fator de recência (pesquisas mais novas recebem peso maior)
    const recencyWeight = Math.max(0.5, 1 - index * 0.05);
    const sampleWeight = Math.sqrt(p.sampleSize || 2000) / 44.7; // normaliza ~2000 para 1.0
    const weight = recencyWeight * sampleWeight;

    totalGlobalWeight += weight;

    p.results.forEach((r) => {
      if (r.candidateId === "brancos_nulos") {
        totalBlankWeighted += r.percentage * weight;
        return;
      }
      if (r.candidateId === "indecisos") {
        totalUndecidedWeighted += r.percentage * weight;
        return;
      }

      let stat = candidateStatsMap.get(r.candidateId);
      if (!stat) {
        stat = {
          totalWeightedVotes: 0,
          totalWeightedValidVotes: 0,
          sumWeights: 0,
          values: [],
          validValues: [],
          profile: CANDIDATES[r.candidateId] || {
            id: r.candidateId,
            name: r.candidateName,
            shortName: r.candidateName.split(" ")[0],
            party: "-",
            color: "#6366F1",
            lightColor: "#EEF2FF",
            accentColor: "#4338CA",
            textColor: "#FFFFFF",
          },
        };
        candidateStatsMap.set(r.candidateId, stat);
      }

      stat.totalWeightedVotes += r.percentage * weight;
      stat.totalWeightedValidVotes += (r.validPercentage ?? r.percentage) * weight;
      stat.sumWeights += weight;
      stat.values.push(r.percentage);
      stat.validValues.push(r.validPercentage ?? r.percentage);
    });
  });

  const blanksAndNulls = totalGlobalWeight > 0 ? totalBlankWeighted / totalGlobalWeight : 0;
  const undecided = totalGlobalWeight > 0 ? totalUndecidedWeighted / totalGlobalWeight : 0;

  const ranking = Array.from(candidateStatsMap.entries())
    .map(([candidateId, stat]) => {
      const avg = stat.sumWeights > 0 ? stat.totalWeightedVotes / stat.sumWeights : 0;
      const avgValid = stat.sumWeights > 0 ? stat.totalWeightedValidVotes / stat.sumWeights : 0;
      const min = stat.values.length > 0 ? Math.min(...stat.values) : 0;
      const max = stat.values.length > 0 ? Math.max(...stat.values) : 0;

      // Calcula tendência (diferença entre pesquisa mais recente e média anterior)
      const recent = stat.values[0] || avg;
      const trend = Number((recent - avg).toFixed(1));

      return {
        candidateId,
        name: stat.profile.name,
        shortName: stat.profile.shortName,
        party: stat.profile.party,
        color: stat.profile.color,
        averagePercentage: Number(avg.toFixed(1)),
        averageValidPercentage: Number(avgValid.toFixed(1)),
        minPercentage: Number(min.toFixed(1)),
        maxPercentage: Number(max.toFixed(1)),
        trend,
      };
    })
    .sort((a, b) => {
      const valA = useValidVotes ? a.averageValidPercentage : a.averagePercentage;
      const valB = useValidVotes ? b.averageValidPercentage : b.averagePercentage;
      return valB - valA;
    });

  const leaderItem = ranking[0] || null;
  const runnerUpItem = ranking[1] || null;

  const leader = leaderItem
    ? {
        candidateId: leaderItem.candidateId,
        name: leaderItem.name,
        percentage: leaderItem.averagePercentage,
        validPercentage: leaderItem.averageValidPercentage,
        color: leaderItem.color,
      }
    : null;

  const runnerUp = runnerUpItem
    ? {
        candidateId: runnerUpItem.candidateId,
        name: runnerUpItem.name,
        percentage: runnerUpItem.averagePercentage,
        validPercentage: runnerUpItem.averageValidPercentage,
        color: runnerUpItem.color,
      }
    : null;

  const leadPct = leader ? (useValidVotes ? leader.validPercentage : leader.percentage) : 0;
  const runPct = runnerUp ? (useValidVotes ? runnerUp.validPercentage : runnerUp.percentage) : 0;
  const margin = Number(Math.max(0, leadPct - runPct).toFixed(1));

  return {
    totalPolls: sortedPolls.length,
    dateRange: { start: minDate, end: maxDate },
    institutes,
    leader,
    runnerUp,
    margin,
    candidatesRanking: ranking,
    blanksAndNulls: Number(blanksAndNulls.toFixed(1)),
    undecided: Number(undecided.toFixed(1)),
  };
}

/**
 * Calcula os resumos por UF com base nas pesquisas estaduais ou projeção regional e registros TSE
 */
export function getStatePollSummaries(
  allPolls: Poll[],
  filters: FilterOptions,
  useValidVotes: boolean = false,
  tseRegistries: import("@/types/election").TsePollRegistry[] = []
): Record<UF, StatePollSummary> {
  const filteredPolls = filterPolls(allPolls, filters);
  const nationalConsolidated = getNationalConsolidated(filteredPolls, useValidVotes);

  const summaries: Record<string, StatePollSummary> = {};

  ALL_UFS.forEach((uf) => {
    const geo = BRAZIL_STATES_GEO[uf];
    const region = geo.region;

    // Registros oficiais do TSE nesta UF
    const stateTseRegistries = tseRegistries.filter((reg) => reg.uf === uf);
    const tseRegistriesCount = stateTseRegistries.length;
    const totalTseInvestment = stateTseRegistries.reduce((acc, curr) => acc + curr.valuePaid, 0);

    // Procura pesquisas específicas desta UF
    const statePolls = filteredPolls.filter((p) => p.scope === uf);

    if (statePolls.length > 0) {
      // Agrega dados reais da UF
      const sortedStatePolls = [...statePolls].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const candidateMap = new Map<string, { sum: number; count: number; name: string }>();

      sortedStatePolls.forEach((p) => {
        p.results.forEach((r) => {
          if (r.candidateId === "brancos_nulos" || r.candidateId === "indecisos") return;
          const val = useValidVotes ? (r.validPercentage ?? r.percentage) : r.percentage;
          const entry = candidateMap.get(r.candidateId) || { sum: 0, count: 0, name: r.candidateName };
          entry.sum += val;
          entry.count += 1;
          candidateMap.set(r.candidateId, entry);
        });
      });

      const results = Array.from(candidateMap.entries())
        .map(([cId, data]) => {
          const profile = CANDIDATES[cId];
          const pct = Number((data.sum / data.count).toFixed(1));
          return {
            candidateId: cId,
            candidateName: profile?.name || data.name,
            party: profile?.party || "-",
            percentage: pct,
            color: profile?.color || "#64748B",
          };
        })
        .sort((a, b) => b.percentage - a.percentage);

      const leader = results[0] || null;
      const runnerUp = results[1] || null;
      const margin = leader && runnerUp ? Number((leader.percentage - runnerUp.percentage).toFixed(1)) : 0;
      const leaderColor = leader ? leader.color : "#94A3B8";

      const intensityInfo = calculateStateColorIntensity(margin, leader ? leader.percentage : 0);

      summaries[uf] = {
        uf,
        stateName: geo.name,
        region,
        leaderId: leader ? leader.candidateId : null,
        leaderName: leader ? leader.candidateName : null,
        leaderPercentage: leader ? leader.percentage : 0,
        runnerUpId: runnerUp ? runnerUp.candidateId : null,
        runnerUpName: runnerUp ? runnerUp.candidateName : null,
        runnerUpPercentage: runnerUp ? runnerUp.percentage : 0,
        margin,
        color: leaderColor,
        intensity: intensityInfo.opacity,
        pollCount: statePolls.length,
        tseRegistriesCount,
        totalTseInvestment,
        latestPollDate: sortedStatePolls[0]?.date || null,
        results,
        isSimulated: false,
      };
    } else {
      // Projeção baseada nos fatores regionais e agregação nacional
      const regionalFactor = REGIONAL_FACTORS[region] || {};
      
      // Ajustes específicos adicionais para estados-chave
      let stateSpecificMultiplier: Record<string, number> = {};
      if (uf === "MG") stateSpecificMultiplier = { romeu_zema: 3.2 };
      if (uf === "SP") stateSpecificMultiplier = { tarcisio_freitas: 1.35, flavio_bolsonaro: 1.15 };
      if (uf === "RJ") stateSpecificMultiplier = { flavio_bolsonaro: 1.25 };
      if (uf === "BA" || uf === "PE" || uf === "MA" || uf === "PI" || uf === "CE") {
        stateSpecificMultiplier = { lula: 1.3 };
      }
      if (uf === "SC" || uf === "PR" || uf === "RO" || uf === "MT" || uf === "MS") {
        stateSpecificMultiplier = { flavio_bolsonaro: 1.35, lula: 0.75 };
      }

      let rawResults = nationalConsolidated.candidatesRanking.map((c) => {
        const rFactor = regionalFactor[c.candidateId] || 1.0;
        const sFactor = stateSpecificMultiplier[c.candidateId] || 1.0;
        const basePct = useValidVotes ? c.averageValidPercentage : c.averagePercentage;
        const projected = basePct * rFactor * sFactor;
        return {
          candidateId: c.candidateId,
          candidateName: c.name,
          party: c.party,
          percentage: projected,
          color: c.color,
        };
      });

      // Normaliza para que a soma bata proporcionalmente
      const sumRaw = rawResults.reduce((acc, curr) => acc + curr.percentage, 0);
      const targetSum = useValidVotes ? 100 : Math.max(75, 100 - (nationalConsolidated.blanksAndNulls + nationalConsolidated.undecided));
      
      const normalizedResults = rawResults
        .map((r) => ({
          ...r,
          percentage: Number(((r.percentage / (sumRaw || 1)) * targetSum).toFixed(1)),
        }))
        .sort((a, b) => b.percentage - a.percentage);

      const leader = normalizedResults[0] || null;
      const runnerUp = normalizedResults[1] || null;
      const margin = leader && runnerUp ? Number((leader.percentage - runnerUp.percentage).toFixed(1)) : 0;
      const leaderColor = leader ? leader.color : "#94A3B8";

      const intensityInfo = calculateStateColorIntensity(margin, leader ? leader.percentage : 0);

      summaries[uf] = {
        uf,
        stateName: geo.name,
        region,
        leaderId: leader ? leader.candidateId : null,
        leaderName: leader ? leader.candidateName : null,
        leaderPercentage: leader ? leader.percentage : 0,
        runnerUpId: runnerUp ? runnerUp.candidateId : null,
        runnerUpName: runnerUp ? runnerUp.candidateName : null,
        runnerUpPercentage: runnerUp ? runnerUp.percentage : 0,
        margin,
        color: leaderColor,
        intensity: intensityInfo.opacity,
        pollCount: 0,
        tseRegistriesCount,
        totalTseInvestment,
        latestPollDate: null,
        results: normalizedResults,
        isSimulated: true,
      };
    }
  });

  return summaries as Record<UF, StatePollSummary>;
}

/**
 * Gera pontos para gráfico de evolução temporal (Timeline)
 */
export function getTimelineChartData(polls: Poll[], useValidVotes: boolean = false): {
  data: Array<{
    date: string;
    formattedDate: string;
    institute: string;
    [candidateId: string]: any;
  }>;
  candidatesInSeries: Array<{ id: string; name: string; color: string }>;
} {
  const nationalPolls = polls
    .filter((p) => p.scope === "BR")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const candidatesMap = new Map<string, { id: string; name: string; color: string }>();

  const data = nationalPolls.map((p) => {
    const d = new Date(p.date);
    const formattedDate = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;

    const point: any = {
      date: p.date,
      formattedDate,
      institute: p.institute,
    };

    p.results.forEach((r) => {
      const val = useValidVotes ? (r.validPercentage ?? r.percentage) : r.percentage;
      point[r.candidateId] = val;

      if (!candidatesMap.has(r.candidateId) && r.candidateId !== "brancos_nulos" && r.candidateId !== "indecisos") {
        candidatesMap.set(r.candidateId, {
          id: r.candidateId,
          name: CANDIDATES[r.candidateId]?.shortName || r.candidateName,
          color: CANDIDATES[r.candidateId]?.color || "#64748B",
        });
      }
    });

    return point;
  });

  return {
    data,
    candidatesInSeries: Array.from(candidatesMap.values()),
  };
}
