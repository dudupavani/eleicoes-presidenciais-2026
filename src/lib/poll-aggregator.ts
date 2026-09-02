import { ALL_UFS, BRAZIL_STATES_GEO } from "@/data/brazil-states-svg";
import { StateTseSummary, TsePollRegistry, UF } from "@/types/election";

/**
 * Calcula os resumos por UF com base exclusivamente nos registros oficiais do TSE
 * (protocolos, institutos, contratantes e valores pagos). O TSE não publica os
 * resultados de intenção de voto das pesquisas que registra, então não há
 * "candidato líder" real a exibir por estado a partir desses dados.
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
