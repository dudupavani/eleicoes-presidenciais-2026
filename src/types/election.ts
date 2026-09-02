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

export interface StatePollSummary {
  uf: UF;
  stateName: string;
  region: Region;
  leaderId: string | null;
  leaderName: string | null;
  leaderPercentage: number;
  runnerUpId: string | null;
  runnerUpName: string | null;
  runnerUpPercentage: number;
  margin: number;
  color: string;
  intensity: number; // 0 to 1
  pollCount: number;
  tseRegistriesCount?: number;
  totalTseInvestment?: number;
  latestPollDate: string | null;
  results: {
    candidateId: string;
    candidateName: string;
    party: string;
    percentage: number;
    color: string;
  }[];
  isSimulated: boolean; // Se foi projetado com base em dados regionais/nacionais
}

export interface NationalConsolidated {
  totalPolls: number;
  dateRange: { start: string; end: string };
  institutes: string[];
  leader: {
    candidateId: string;
    name: string;
    percentage: number;
    validPercentage: number;
    color: string;
  } | null;
  runnerUp: {
    candidateId: string;
    name: string;
    percentage: number;
    validPercentage: number;
    color: string;
  } | null;
  margin: number;
  candidatesRanking: {
    candidateId: string;
    name: string;
    shortName: string;
    party: string;
    color: string;
    averagePercentage: number;
    averageValidPercentage: number;
    minPercentage: number;
    maxPercentage: number;
    trend: number; // Mudança recente (+1.2, -0.5, etc.)
  }[];
  blanksAndNulls: number;
  undecided: number;
}

export interface FilterOptions {
  scenario: string;
  round: RoundType | "Todos";
  type: PollType | "Todos";
  institutes: string[];
  dateRange: "all" | "30d" | "90d" | "180d" | "365d" | "custom";
  customStartDate?: string;
  customEndDate?: string;
  useValidVotes: boolean;
  selectedUf?: UF | null;
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
