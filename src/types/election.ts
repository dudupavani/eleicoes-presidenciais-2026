export type Region = "Norte" | "Nordeste" | "Centro-Oeste" | "Sudeste" | "Sul";

export type UF =
  | "AC" | "AL" | "AP" | "AM" | "BA" | "CE" | "DF" | "ES" | "GO"
  | "MA" | "MT" | "MS" | "MG" | "PA" | "PB" | "PR" | "PE" | "PI"
  | "RJ" | "RN" | "RS" | "RO" | "RR" | "SC" | "SP" | "SE" | "TO"
  | "BR"; // BR = Nacional

export type PollType = "Estimulada" | "Espontânea";
export type RoundType = "1º Turno" | "2º Turno";

export interface Candidate {
  id: string;
  name: string;
  shortName: string;
  party: string;
  color: string;
  lightColor: string;
  textColor: string;
  accentColor: string;
  avatarUrl?: string;
  isOther?: boolean;
  isNeutral?: boolean; // Para Branco/Nulo/Indeciso
}

export interface PollResult {
  candidateId: string;
  candidateName: string;
  percentage: number; // Percentual bruto (votos totais)
  validPercentage?: number; // Percentual sobre votos válidos
}

export interface Poll {
  id: string;
  institute: string; // Ex: Datafolha, Quaest, AtlasIntel, Paraná Pesquisas
  date: string; // YYYY-MM-DD
  endDate?: string;
  scope: UF; // UF específica ou 'BR' para nacional
  round: RoundType;
  scenario: string; // Ex: 'Principal', 'Cenário 1', 'Lula x Flávio Bolsonaro'
  type: PollType;
  sampleSize: number; // Ex: 2000
  marginOfError: number; // Ex: 2.2
  results: PollResult[];
  sourceUrl?: string;
  notes?: string;
  isCustom?: boolean; // Se veio de upload CSV
}

export interface StateGeoData {
  uf: UF;
  name: string;
  region: Region;
  capital: string;
  voterShare: number; // % do eleitorado brasileiro (~TSE)
  electorateSize: number; // Número aproximado de eleitores
  svgPath: string;
  labelPosition: { x: number; y: number };
}

export interface TsePollRegistry {
  protocol: string; // Ex: "AC029782026", "SP088212026"
  uf: UF;
  year: number;
  generationDate: string;
  registrationDate?: string;
  disclosureDate?: string;
  pollingAgency: string; // Empresa executora (ex: ATLASINTEL, DATAFOLHA, PARANA PESQUISAS)
  pollingAgencyCnpj?: string;
  contractorId: number;
  contractorCnpj: string;
  contractorName: string;
  payerName?: string; // NM_PAGANTE: quem efetivamente pagou, quando difere do contratante
  payerCnpj?: string;
  sampleSize?: number;
  statisticianName?: string;
  conreId?: string;
  pollValue?: number;
  valuePaid: number;
  isSelfFunded: boolean;
  resourceOrigin: string;
  methodology?: string;
  position?: string;
}

export type MapMetricKey = "count" | "investment";

export interface StateTseSummary {
  uf: UF;
  stateName: string;
  region: Region;
  registriesCount: number;
  totalInvestment: number;
  uniqueAgencies: number;
  uniqueContractors: number;
  topAgency: string | null;
  latestRegistrationDate: string | null;
}

export interface CsvDiagnosticReport {
  fileName: string;
  totalRows: number;
  validPollsParsed: number;
  detectedFormat: "long" | "wide";
  detectedColumns: Record<string, string>;
  detectedInstitutes: string[];
  detectedCandidates: string[];
  detectedUfs: string[];
  detectedScenarios: string[];
  errors: string[];
  warnings: string[];
}
