import { ALL_UFS, BRAZIL_STATES_GEO } from "@/data/brazil-states-svg";
import { PresidentialRegistrySummary, Poll, PollResult, StateTseSummary, TsePollRegistry, UF } from "@/types/election";

/**
 * Calcula os resumos por UF com base exclusivamente nos registros oficiais do TSE
 * (protocolos, institutos, contratantes e valores pagos). O TSE não publica os
 * resultados de intenção de voto das pesquisas que registra, então essa função
 * não determina "candidato líder" — isso vem de pesquisas reais e publicadas
 * (ver getStatePresidentialPolls), quando existirem para a UF.
 */
export function getStateTseSummaries(
  tseRegistries: TsePollRegistry[]
): Record<UF, StateTseSummary> {
  const summaries: Record<string, StateTseSummary> = {};

  ALL_UFS.forEach((uf) => {
    const geo = BRAZIL_STATES_GEO[uf];
    const stateRegistries = tseRegistries.filter((reg) => reg.uf === uf);

    const totalInvestment = stateRegistries.reduce((acc, r) => acc + (r.valuePaid || 0), 0);
    const uniqueAgencies = new Set(stateRegistries.map((r) => r.pollingAgency).filter(Boolean));
    const uniqueContractors = new Set(stateRegistries.map((r) => r.contractorName).filter(Boolean));

    const agencyCounts = new Map<string, number>();
    stateRegistries.forEach((r) => {
      if (!r.pollingAgency) return;
      agencyCounts.set(r.pollingAgency, (agencyCounts.get(r.pollingAgency) || 0) + 1);
    });
    let topAgency: string | null = null;
    let topAgencyCount = 0;
    agencyCounts.forEach((count, name) => {
      if (count > topAgencyCount) {
        topAgencyCount = count;
        topAgency = name;
      }
    });

    const registrationDates = stateRegistries
      .map((r) => r.registrationDate)
      .filter((d): d is string => !!d)
      .sort();
    const latestRegistrationDate = registrationDates.length > 0
      ? registrationDates[registrationDates.length - 1]
      : null;

    summaries[uf] = {
      uf,
      stateName: geo.name,
      region: geo.region,
      registriesCount: stateRegistries.length,
      totalInvestment,
      uniqueAgencies: uniqueAgencies.size,
      uniqueContractors: uniqueContractors.size,
      topAgency,
      latestRegistrationDate,
    };
  });

  return summaries as Record<UF, StateTseSummary>;
}

/**
 * Isola, dentro dos registros oficiais do TSE, apenas os protocolos cujo
 * DS_CARGO declarado inclui "Presidente" — ou seja, pesquisas eleitorais
 * registradas especificamente para a corrida presidencial (em vez de
 * governador, senador ou deputado). O TSE registra essas pesquisas com
 * abrangência nacional (UF "BR").
 */
export function getPresidentialRegistrySummary(
  tseRegistries: TsePollRegistry[]
): PresidentialRegistrySummary {
  const presidentialRegistries = tseRegistries.filter((r) =>
    (r.position || "").includes("Presidente")
  );

  const totalInvestment = presidentialRegistries.reduce((acc, r) => acc + (r.valuePaid || 0), 0);
  const uniqueAgencies = new Set(presidentialRegistries.map((r) => r.pollingAgency).filter(Boolean));
  const uniqueContractors = new Set(presidentialRegistries.map((r) => r.contractorName).filter(Boolean));

  const registrationDates = presidentialRegistries
    .map((r) => r.registrationDate)
    .filter((d): d is string => !!d)
    .sort();

  return {
    registries: presidentialRegistries,
    count: presidentialRegistries.length,
    totalInvestment,
    uniqueAgencies: uniqueAgencies.size,
    uniqueContractors: uniqueContractors.size,
    earliestRegistrationDate: registrationDates[0] || null,
    latestRegistrationDate: registrationDates[registrationDates.length - 1] || null,
  };
}

/**
 * Agrupa, por UF, as pesquisas presidenciais reais e publicadas (scope != "BR")
 * já carregadas no app — vindas de institutos que divulgaram os números
 * (não do TSE, que não publica resultado). Cada grupo é ordenado com o 1º
 * turno mais recente primeiro, para servir como "pesquisa em destaque" da UF.
 */
export function getStatePresidentialPolls(allPolls: Poll[]): Partial<Record<UF, Poll[]>> {
  const grouped: Partial<Record<UF, Poll[]>> = {};

  allPolls
    .filter((p) => p.scope !== "BR")
    .forEach((p) => {
      const uf = p.scope as UF;
      if (!grouped[uf]) grouped[uf] = [];
      grouped[uf]!.push(p);
    });

  Object.values(grouped).forEach((polls) => {
    polls!.sort((a, b) => {
      if (a.round !== b.round) return a.round === "1º Turno" ? -1 : 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  });

  return grouped;
}

/**
 * Retorna o resultado com maior percentual em uma pesquisa, ignorando
 * brancos/nulos/indecisos e o "outros" usado para representar o resto do
 * 2º turno (quando só os dois principais candidatos foram detalhados).
 */
export function getPollLeader(poll: Poll): PollResult | null {
  const ranked = [...poll.results]
    .filter((r) => !["brancos_nulos", "indecisos", "outros"].includes(r.candidateId))
    .sort((a, b) => b.percentage - a.percentage);
  return ranked[0] || null;
}
