import fs from "fs";
import path from "path";
import Papa from "papaparse";

const eleitoralDir = "./data/csvs/tse_eleitoral";
const contratanteDir = "./data/csvs/tse_contratante";
const outputFile = "./src/data/default-tse-registries.ts";

console.log("=== COMPILANDO BASE COMPLETA NACIONAL DE REGISTROS TSE 2026 ===");

const ALL_UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO", "BR"
];

function normalizeNumber(val, defaultValue = 0) {
  if (val === null || val === undefined) return defaultValue;
  if (typeof val === "number") return isNaN(val) ? defaultValue : val;
  let str = String(val).trim().replace("%", "").replace(/\s+/g, "");
  if (!str || str === "#NULO#" || str === "#NE#") return defaultValue;
  if (str.includes(",") && str.includes(".")) {
    if (str.indexOf(".") < str.indexOf(",")) {
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      str = str.replace(/,/g, "");
    }
  } else if (str.includes(",")) {
    str = str.replace(",", ".");
  }
  const num = parseFloat(str);
  return isNaN(num) ? defaultValue : num;
}

function cleanString(str) {
  if (!str || str === "#NULO#" || str === "#NE#") return "";
  return String(str).trim().replace(/^"|"$/g, "");
}

function extractUf(protocol, fileUf) {
  if (fileUf && ALL_UFS.includes(fileUf.toUpperCase())) {
    return fileUf.toUpperCase();
  }
  if (!protocol) return "BR";
  const clean = protocol.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const prefix = clean.substring(0, 2);
  if (ALL_UFS.includes(prefix)) return prefix;
  if (clean.includes("BR") || clean.includes("BRASIL")) return "BR";
  return "BR";
}

// 1. Ler todos os arquivos de pesquisa_eleitoral (Metadados das empresas executoras)
const eleitoralFiles = fs.readdirSync(eleitoralDir).filter((f) => f.endsWith(".csv"));
const eleitoralMap = new Map();

console.log(`Lendo ${eleitoralFiles.length} arquivos de pesquisa eleitoral...`);

eleitoralFiles.forEach((file) => {
  const content = fs.readFileSync(path.join(eleitoralDir, file), "latin1");
  const parsed = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    delimiter: ";",
  });

  const fileUf = file.replace("pesquisa_eleitoral_2026_", "").replace(".csv", "");

  parsed.data.forEach((row) => {
    const protocol = cleanString(row["NR_PROTOCOLO_REGISTRO"]);
    if (!protocol) return;

    const uf = extractUf(protocol, cleanString(row["SG_UF"]) || fileUf);
    const agencyName = cleanString(row["NM_EMPRESA_FANTASIA"]) || cleanString(row["NM_EMPRESA"]) || "Instituto Não Informado";
    const agencyCnpj = cleanString(row["NR_CNPJ_EMPRESA"]);
    const sampleSize = Math.round(normalizeNumber(row["QT_ENTREVISTADO"], 1000));
    const statistician = cleanString(row["NM_ESTATISTICO_RESP"]);
    const conre = cleanString(row["CD_CONRE"]);
    const pollValue = normalizeNumber(row["VR_PESQUISA"], 0);
    const regDate = cleanString(row["DT_REGISTRO"]).split(" ")[0];
    const discDate = cleanString(row["DT_DIVULGACAO"]).split(" ")[0];
    const position = cleanString(row["DS_CARGO"]);
    const methodology = cleanString(row["DS_METODOLOGIA_PESQUISA"]).slice(0, 300);

    eleitoralMap.set(protocol, {
      protocol,
      uf,
      agencyName,
      agencyCnpj,
      sampleSize,
      statistician,
      conre,
      pollValue,
      regDate,
      discDate,
      position,
      methodology,
    });
  });
});

console.log(`Mapeados metadados de ${eleitoralMap.size} protocolos únicos do TSE.`);

// 2. Ler todos os arquivos de pesquisa_contratante
const contratanteFiles = fs.readdirSync(contratanteDir).filter((f) => f.endsWith(".csv"));
const allRegistries = [];
const seenKeys = new Set();

console.log(`Lendo ${contratanteFiles.length} arquivos de contratantes...`);

contratanteFiles.forEach((file) => {
  const content = fs.readFileSync(path.join(contratanteDir, file), "latin1");
  const parsed = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    delimiter: ";",
  });

  const fileUf = file.replace("pesquisa_contratante_2026_", "").replace(".csv", "");

  parsed.data.forEach((row) => {
    const protocol = cleanString(row["NR_PROTOCOLO_REGISTRO"]);
    if (!protocol) return;

    const contractorName = cleanString(row["NM_CONTRATANTE"]) || "Não informado";
    const contractorCnpj = cleanString(row["NR_CPF_CNPJ_CONTRATANTE"]);
    const contractorId = Number(cleanString(row["CD_CONTRATANTE"]) || 0);
    const valuePaid = normalizeNumber(row["VR_PAGO_CONTRATANTE"], 0);
    const genDate = cleanString(row["DT_GERACAO"]);
    const year = Number(cleanString(row["AA_ELEICAO"]) || 2026);
    const isSelfFunded = cleanString(row["ST_CONTRATANTE_PAGANTE"]).toUpperCase() === "S";
    const resourceOrigin = cleanString(row["DS_ORIGEM_RECURSO"]) || (isSelfFunded ? "Recurso Próprio" : "Outros");

    const meta = eleitoralMap.get(protocol);
    const uf = meta ? meta.uf : extractUf(protocol, fileUf);
    const pollingAgency = meta ? meta.agencyName : contractorName;

    const dedupeKey = `${protocol}_${contractorId}_${contractorName}`;
    if (seenKeys.has(dedupeKey)) return;
    seenKeys.add(dedupeKey);

    allRegistries.push({
      protocol,
      uf,
      year,
      generationDate: genDate ? genDate.split("/").reverse().join("-") : "2026-09-01",
      registrationDate: meta?.regDate || "",
      disclosureDate: meta?.discDate || "",
      pollingAgency,
      pollingAgencyCnpj: meta?.agencyCnpj || "",
      contractorId,
      contractorCnpj,
      contractorName,
      sampleSize: meta?.sampleSize || 0,
      statisticianName: meta?.statistician || "",
      conreId: meta?.conre || "",
      pollValue: meta?.pollValue || valuePaid,
      valuePaid,
      isSelfFunded,
      resourceOrigin,
      methodology: meta?.methodology || "",
      position: meta?.position || "",
    });
  });
});

console.log(`Total compilado: ${allRegistries.length} registros oficiais de contratantes no TSE!`);

// 3. Escrever arquivo TypeScript compilado
const fileContent = `import { TsePollRegistry } from "@/types/election";

/**
 * Base de Dados Completa Oficial do TSE (Eleições 2026)
 * Compilação de todas as 27 UFs + Registros Nacionais
 * Total de Registros: ${allRegistries.length}
 */
export const DEFAULT_TSE_REGISTRIES: TsePollRegistry[] = ${JSON.stringify(allRegistries, null, 2)};
`;

fs.writeFileSync(outputFile, fileContent, "utf-8");
console.log(`Arquivo salvo em: ${outputFile}`);
console.log("=== COMPILAÇÃO FINALIZADA COM SUCESSO ===");
