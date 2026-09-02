import Papa from "papaparse";
import { CsvDiagnosticReport, Poll, PollResult, PollType, RoundType, UF } from "@/types/election";
import { ALL_UFS } from "@/data/brazil-states-svg";
import { normalizeCandidateName } from "@/data/candidate-profiles";

// Dicionário de aliases para cabeçalhos comuns em português e inglês
const COLUMN_ALIASES: Record<string, string[]> = {
  date: [
    "data", "date", "data_pesquisa", "dt_pesquisa", "data_fim", "data_divulgacao",
    "coleta_fim", "periodo", "data_coleta", "dia", "data_final"
  ],
  institute: [
    "instituto", "pollster", "empresa", "instituto_pesquisa", "fonte", "source",
    "orgao", "contratante", "pesquisador", "institute"
  ],
  scope: [
    "uf", "estado", "state", "regiao", "localidade", "abrangencia", "ambito",
    "local", "territorio", "geografia", "scope"
  ],
  scenario: [
    "cenario", "scenario", "modalidade", "cenario_id", "questionario", "pergunta",
    "cenario_pesquisa", "hipotese"
  ],
  round: [
    "turno", "round", "fase", "etapa", "turno_eleicao"
  ],
  type: [
    "tipo", "tipo_pesquisa", "espontanea_estimulada", "metodologia", "estimulada_espontanea",
    "metodo", "type", "modalidade_pesquisa"
  ],
  candidate: [
    "candidato", "candidate", "nome_candidato", "nome", "politico", "opcao",
    "resposta", "candidatos"
  ],
  value: [
    "votos", "porcentagem", "percentual", "pct", "value", "intencao_voto",
    "%", "taxa", "resultado", "pontos", "percent", "voto", "votes"
  ],
  marginOfError: [
    "margem_erro", "margem", "margin_of_error", "erro", "margem_de_erro", "moe", "margin"
  ],
  sampleSize: [
    "amostra", "sample_size", "entrevistados", "n_entrevistas", "total_entrevistados",
    "tamanho_amostra", "amostragem", "n", "sample"
  ],
};

/**
 * Mapeia o nome do estado por extenso ou sigla para UF padronizada
 */
export function normalizeUf(raw: string | undefined): UF {
  if (!raw) return "BR";
  const clean = raw.trim().toUpperCase();

  if (clean === "BR" || clean === "BRASIL" || clean === "NACIONAL" || clean === "PAIS" || clean === "BRA") {
    return "BR";
  }

  // Verifica se já é uma UF válida
  if (ALL_UFS.includes(clean as UF)) {
    return clean as UF;
  }

  const nameMap: Record<string, UF> = {
    "ACRE": "AC", "ALAGOAS": "AL", "AMAPA": "AP", "AMAPÁ": "AP",
    "AMAZONAS": "AM", "BAHIA": "BA", "CEARA": "CE", "CEARÁ": "CE",
    "DISTRITO FEDERAL": "DF", "BRASILIA": "DF", "BRASÍLIA": "DF",
    "ESPIRITO SANTO": "ES", "ESPÍRITO SANTO": "ES", "GOIAS": "GO", "GOIÁS": "GO",
    "MARANHAO": "MA", "MARANHÃO": "MA", "MATO GROSSO": "MT",
    "MATO GROSSO DO SUL": "MS", "MINAS GERAIS": "MG", "MINAS": "MG",
    "PARA": "PA", "PARÁ": "PA", "PARAIBA": "PB", "PARAÍBA": "PB",
    "PARANA": "PR", "PARANÁ": "PR", "PERNAMBUCO": "PE", "PIAUI": "PI", "PIAUÍ": "PI",
    "RIO DE JANEIRO": "RJ", "RIO": "RJ", "RIO GRANDE DO NORTE": "RN",
    "RIO GRANDE DO SUL": "RS", "GAUCHO": "RS", "RONDONIA": "RO", "RONDÔNIA": "RO",
    "RORAIMA": "RR", "SANTA CATARINA": "SC", "SAO PAULO": "SP", "SÃO PAULO": "SP",
    "SERGIPE": "SE", "TOCANTINS": "TO"
  };

  const normalized = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return nameMap[normalized] || "BR";
}

/**
 * Normaliza número percentual aceitando vírgula, % e pontos de milhar
 */
export function normalizeNumber(val: any, defaultValue: number = 0): number {
  if (val === null || val === undefined) return defaultValue;
  if (typeof val === "number") return isNaN(val) ? defaultValue : val;

  let str = String(val).trim().replace("%", "").replace(/\s+/g, "");
  if (!str) return defaultValue;

  // Se tiver vírgula e ponto (ex: 1.250,5 ou 1,250.5)
  if (str.includes(",") && str.includes(".")) {
    if (str.indexOf(".") < str.indexOf(",")) {
      // Formato BR: 1.250,5 -> 1250.5
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      // Formato US: 1,250.5 -> 1250.5
      str = str.replace(/,/g, "");
    }
  } else if (str.includes(",")) {
    // Formato BR com apenas vírgula: 42,5 -> 42.5
    str = str.replace(",", ".");
  }

  const num = parseFloat(str);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Normaliza formatos de datas populares para YYYY-MM-DD
 */
export function normalizeDate(rawDate: string | undefined): string {
  if (!rawDate) {
    return new Date().toISOString().split("T")[0];
  }
  const clean = rawDate.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // DD/MM/YYYY ou DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // YYYY/MM/DD
  const ymdMatch = clean.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, "0");
    const day = ymdMatch[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Fallback se for timestamp ou Date parseável
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }

  return new Date().toISOString().split("T")[0];
}

/**
 * Identifica o papel de cada coluna com base nos aliases conhecidos
 */
function mapHeaders(headers: string[]): Record<string, string> {
  const columnMap: Record<string, string> = {};

  for (const header of headers) {
    const cleanHeader = header.trim().toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_]/g, "_");

    let matchedRole: string | null = null;
    for (const [role, aliases] of Object.entries(COLUMN_ALIASES)) {
      for (const alias of aliases) {
        if (cleanHeader === alias || cleanHeader === `_${alias}` || cleanHeader === `${alias}_`) {
          matchedRole = role;
          break;
        }
      }
      if (matchedRole) break;
    }

    if (matchedRole) {
      columnMap[matchedRole] = header;
    }
  }

  return columnMap;
}

/**
 * Analisa e processa o conteúdo de um arquivo CSV de pesquisas eleitorais
 */
export function parsePollCsv(csvContent: string, fileName: string = "arquivo.csv"): {
  polls: Poll[];
  report: CsvDiagnosticReport;
} {
  const parseResult = Papa.parse<Record<string, any>>(csvContent, {
    header: true,
    skipEmptyLines: "greedy",
    dynamicTyping: false,
  });

  const rawRows = parseResult.data;
  const headers = parseResult.meta.fields || [];

  const report: CsvDiagnosticReport = {
    fileName,
    totalRows: rawRows.length,
    validPollsParsed: 0,
    detectedFormat: "long",
    detectedColumns: {},
    detectedInstitutes: [],
    detectedCandidates: [],
    detectedUfs: [],
    detectedScenarios: [],
    errors: [],
    warnings: [],
  };

  if (rawRows.length === 0 || headers.length === 0) {
    report.errors.push("O arquivo CSV está vazio ou não possui cabeçalhos válidos.");
    return { polls: [], report };
  }

  const columnMap = mapHeaders(headers);
  report.detectedColumns = columnMap;

  // Determina se o CSV é formato Long ou Wide
  const isLongFormat = !!(columnMap.candidate && columnMap.value);
  report.detectedFormat = isLongFormat ? "long" : "wide";

  const pollsMap: Map<string, Poll> = new Map();
  const candidateSet = new Set<string>();
  const instituteSet = new Set<string>();
  const ufSet = new Set<string>();
  const scenarioSet = new Set<string>();

  if (isLongFormat) {
    // Processamento de Formato Longo (1 linha por candidato)
    rawRows.forEach((row, index) => {
      try {
        const institute = String(row[columnMap.institute] || "Instituto Não Informado").trim();
        const rawDate = row[columnMap.date];
        const date = normalizeDate(rawDate);
        const uf = normalizeUf(row[columnMap.scope]);
        const scenario = String(row[columnMap.scenario] || "Cenário 1").trim();
        
        let roundStr = String(row[columnMap.round] || "").trim().toLowerCase();
        let round: RoundType = roundStr.includes("2") || roundStr.includes("segundo") ? "2º Turno" : "1º Turno";

        let typeStr = String(row[columnMap.type] || "").trim().toLowerCase();
        let type: PollType = typeStr.includes("espont") ? "Espontânea" : "Estimulada";

        const sampleSize = Math.round(normalizeNumber(row[columnMap.sampleSize], 2000));
        const marginOfError = normalizeNumber(row[columnMap.marginOfError], 2.2);

        const rawCandidate = String(row[columnMap.candidate] || "").trim();
        if (!rawCandidate) return;

        const { id: candidateId, profile } = normalizeCandidateName(rawCandidate);
        const percentage = normalizeNumber(row[columnMap.value], 0);

        instituteSet.add(institute);
        ufSet.add(uf);
        scenarioSet.add(scenario);
        candidateSet.add(profile.name);

        // Chave única para agrupar as opções de voto de uma mesma pesquisa/cenário
        const pollKey = `${institute}|${date}|${uf}|${scenario}|${round}|${type}`;

        let existingPoll = pollsMap.get(pollKey);
        if (!existingPoll) {
          existingPoll = {
            id: `poll_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
            institute,
            date,
            scope: uf,
            round,
            scenario,
            type,
            sampleSize,
            marginOfError,
            results: [],
            isCustom: true,
          };
          pollsMap.set(pollKey, existingPoll);
        }

        // Adiciona ou atualiza resultado do candidato
        const existingResult = existingPoll.results.find((r) => r.candidateId === candidateId);
        if (existingResult) {
          existingResult.percentage = percentage;
        } else {
          existingPoll.results.push({
            candidateId,
            candidateName: profile.name,
            percentage,
          });
        }
      } catch (err: any) {
        report.warnings.push(`Erro ao processar linha ${index + 1}: ${err?.message || "Dado inválido"}`);
      }
    });
  } else {
    // Processamento de Formato Amplo (Wide - colunas por candidato)
    const metaColumnNames = Object.values(columnMap);
    const candidateColumns = headers.filter((h) => !metaColumnNames.includes(h));

    rawRows.forEach((row, index) => {
      try {
        const institute = String(row[columnMap.institute] || "Instituto Não Informado").trim();
        const rawDate = row[columnMap.date];
        const date = normalizeDate(rawDate);
        const uf = normalizeUf(row[columnMap.scope]);
        const scenario = String(row[columnMap.scenario] || "Cenário 1").trim();

        let roundStr = String(row[columnMap.round] || "").trim().toLowerCase();
        let round: RoundType = roundStr.includes("2") || roundStr.includes("segundo") ? "2º Turno" : "1º Turno";

        let typeStr = String(row[columnMap.type] || "").trim().toLowerCase();
        let type: PollType = typeStr.includes("espont") ? "Espontânea" : "Estimulada";

        const sampleSize = Math.round(normalizeNumber(row[columnMap.sampleSize], 2000));
        const marginOfError = normalizeNumber(row[columnMap.marginOfError], 2.2);

        instituteSet.add(institute);
        ufSet.add(uf);
        scenarioSet.add(scenario);

        const results: PollResult[] = [];

        for (const col of candidateColumns) {
          const val = row[col];
          if (val === undefined || val === null || String(val).trim() === "") continue;

          const { id: candidateId, profile } = normalizeCandidateName(col);
          const percentage = normalizeNumber(val, 0);

          candidateSet.add(profile.name);
          results.push({
            candidateId,
            candidateName: profile.name,
            percentage,
          });
        }

        if (results.length > 0) {
          const pollId = `poll_wide_${index}_${Math.random().toString(36).substring(2, 7)}`;
          pollsMap.set(pollId, {
            id: pollId,
            institute,
            date,
            scope: uf,
            round,
            scenario,
            type,
            sampleSize,
            marginOfError,
            results,
            isCustom: true,
          });
        }
      } catch (err: any) {
        report.warnings.push(`Erro ao processar linha ${index + 1}: ${err?.message || "Dado inválido"}`);
      }
    });
  }

  // Calcula percentuais sobre votos válidos para cada pesquisa compilada
  const polls = Array.from(pollsMap.values()).map((p) => {
    // Votos válidos = Exclui Brancos, Nulos e Indecisos
    const validResults = p.results.filter(
      (r) => r.candidateId !== "brancos_nulos" && r.candidateId !== "indecisos"
    );
    const sumValid = validResults.reduce((acc, curr) => acc + curr.percentage, 0);

    const enrichedResults = p.results.map((r) => {
      if (r.candidateId === "brancos_nulos" || r.candidateId === "indecisos") {
        return { ...r, validPercentage: 0 };
      }
      const validPct = sumValid > 0 ? (r.percentage / sumValid) * 100 : r.percentage;
      return {
        ...r,
        validPercentage: Number(validPct.toFixed(1)),
      };
    });

    return {
      ...p,
      results: enrichedResults,
    };
  });

  report.validPollsParsed = polls.length;
  report.detectedInstitutes = Array.from(instituteSet);
  report.detectedCandidates = Array.from(candidateSet);
  report.detectedUfs = Array.from(ufSet);
  report.detectedScenarios = Array.from(scenarioSet);

  return { polls, report };
}

/**
 * Extrai a UF a partir do protocolo de registro oficial do TSE (ex: "AC029782026" -> "AC", "BR055802026" -> "BR")
 */
export function extractUfFromTseProtocol(protocol: string | undefined): UF {
  if (!protocol) return "BR";
  const clean = protocol.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const prefix = clean.substring(0, 2) as UF;
  if (ALL_UFS.includes(prefix)) {
    return prefix;
  }
  if (prefix === "BR") return "BR";
  return "BR";
}

/**
 * Analisa e processa CSVs oficiais do Repositório de Dados Eleitorais do TSE (PESQUISA_ELEITORAL_CONTRATANTE)
 */
export function parseTseCsv(csvContent: string, fileName: string = "tse_contratante.csv"): {
  registries: import("@/types/election").TsePollRegistry[];
  report: CsvDiagnosticReport;
} {
  // Limpa possíveis marcadores UTF-8 BOM e analisa com delimitador automático (ponto e vírgula ou vírgula)
  const parseResult = Papa.parse<Record<string, any>>(csvContent.replace(/^\uFEFF/, ""), {
    header: true,
    skipEmptyLines: "greedy",
    delimiter: csvContent.includes(";") ? ";" : ",",
    dynamicTyping: false,
  });

  const rawRows = parseResult.data;
  const headers = parseResult.meta.fields || [];

  const report: CsvDiagnosticReport = {
    fileName,
    totalRows: rawRows.length,
    validPollsParsed: 0,
    detectedFormat: "long",
    detectedColumns: {},
    detectedInstitutes: [],
    detectedCandidates: [],
    detectedUfs: [],
    detectedScenarios: [],
    errors: [],
    warnings: [],
  };

  const registries: import("@/types/election").TsePollRegistry[] = [];
  const ufsSet = new Set<string>();
  const contractorsSet = new Set<string>();

  rawRows.forEach((row, idx) => {
    try {
      const protocol = String(row["NR_PROTOCOLO_REGISTRO"] || row["protocolo"] || "").trim().replace(/"/g, "");
      if (!protocol || protocol === "#NULO#" || protocol === "#NE#") return;

      const uf = extractUfFromTseProtocol(protocol);
      const contractorName = String(row["NM_CONTRATANTE"] || row["contratante"] || "Não informado").trim().replace(/"/g, "");
      const contractorCnpj = String(row["NR_CPF_CNPJ_CONTRATANTE"] || row["cnpj"] || "").trim().replace(/"/g, "");
      const contractorId = Number(row["CD_CONTRATANTE"] || 0);
      const rawValue = row["VR_PAGO_CONTRATANTE"] || row["valor"];
      const valuePaid = normalizeNumber(rawValue, 0);
      const rawDate = String(row["DT_GERACAO"] || row["data"] || "").trim().replace(/"/g, "");
      const generationDate = normalizeDate(rawDate);
      const year = Number(row["AA_ELEICAO"] || 2026);
      const isSelfFunded = String(row["ST_CONTRATANTE_PAGANTE"] || "").trim().toUpperCase().includes("S");
      const resourceOrigin = String(row["DS_ORIGEM_RECURSO"] || "Recurso Próprio").trim().replace(/"/g, "");

      ufsSet.add(uf);
      contractorsSet.add(contractorName);

      const pollingAgency = String(row["NM_EMPRESA_FANTASIA"] || row["NM_EMPRESA"] || row["empresa"] || contractorName).trim().replace(/"/g, "");
      const sampleSize = Math.round(normalizeNumber(row["QT_ENTREVISTADO"] || row["amostra"], 0));
      const statisticianName = String(row["NM_ESTATISTICO_RESP"] || row["estatistico"] || "").trim().replace(/"/g, "");
      const conreId = String(row["CD_CONRE"] || row["conre"] || "").trim().replace(/"/g, "");
      const methodology = String(row["DS_METODOLOGIA_PESQUISA"] || row["metodologia"] || "").trim().replace(/"/g, "").slice(0, 300);

      registries.push({
        protocol,
        uf,
        year,
        generationDate,
        pollingAgency,
        contractorId,
        contractorCnpj,
        contractorName,
        sampleSize,
        statisticianName,
        conreId,
        valuePaid,
        isSelfFunded,
        resourceOrigin: resourceOrigin === "#NULO#" ? "Recurso Próprio" : resourceOrigin,
        methodology,
      });
    } catch (err: any) {
      report.warnings.push(`Erro na linha ${idx + 1}: ${err?.message}`);
    }
  });

  report.validPollsParsed = registries.length;
  report.detectedUfs = Array.from(ufsSet);
  report.detectedInstitutes = Array.from(contractorsSet);

  return { registries, report };
}

/**
 * Processa múltiplos arquivos CSV simultâneos e agrega diagnósticos (suporta pesquisas e registros TSE)
 */
export async function parseMultiplePollCsvs(files: File[]): Promise<{
  polls: Poll[];
  tseRegistries: import("@/types/election").TsePollRegistry[];
  reports: CsvDiagnosticReport[];
}> {
  const allPolls: Poll[] = [];
  const allTseRegistries: import("@/types/election").TsePollRegistry[] = [];
  const reports: CsvDiagnosticReport[] = [];

  for (const file of files) {
    const text = await file.text();

    // Detecta se é arquivo oficial do TSE (presença de colunas características do TSE)
    if (text.includes("NR_PROTOCOLO_REGISTRO") || text.includes("VR_PAGO_CONTRATANTE") || text.includes("DT_GERACAO")) {
      const { registries, report } = parseTseCsv(text, file.name);
      allTseRegistries.push(...registries);
      reports.push(report);
    } else {
      const { polls, report } = parsePollCsv(text, file.name);
      allPolls.push(...polls);
      reports.push(report);
    }
  }

  return { polls: allPolls, tseRegistries: allTseRegistries, reports };
}
