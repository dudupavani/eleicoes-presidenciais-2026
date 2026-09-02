import fs from "fs";
import path from "path";
import { parsePollCsv, parseTseCsv } from "../src/lib/csv-parser.js";

/**
 * Script utilitário para ingestão em lote de múltiplos arquivos CSV de uma pasta
 * Uso: node scripts/ingest-csvs.mjs [caminho_da_pasta]
 */

const targetDir = process.argv[2] || "./data/csvs";

console.log(`\n======================================================`);
console.log(`📥 INICIANDO INGESTÃO EM LOTE DE ARQUIVOS CSV`);
console.log(`📂 Diretório alvo: ${path.resolve(targetDir)}`);
console.log(`======================================================\n`);

if (!fs.existsSync(targetDir)) {
  console.log(`📁 Criando diretório ${targetDir} para receber novos arquivos CSV...`);
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`✨ Pasta criada! Coloque seus arquivos .csv em "${targetDir}" e execute novamente.`);
  process.exit(0);
}

const files = fs.readdirSync(targetDir).filter((f) => f.toLowerCase().endsWith(".csv"));

if (files.length === 0) {
  console.log(`⚠️ Nenhum arquivo .csv encontrado em "${targetDir}".`);
  console.log(`👉 Copie seus arquivos para esta pasta e execute: npm run ingest`);
  process.exit(0);
}

console.log(`🔍 Encontrados ${files.length} arquivo(s) CSV para processamento:\n`);

let totalPollsParsed = 0;
let totalTseParsed = 0;
const allPolls = [];
const allTse = [];
const reports = [];

files.forEach((file, index) => {
  const filePath = path.join(targetDir, file);
  const content = fs.readFileSync(filePath, "utf-8");

  // Detecta se é arquivo do TSE ou pesquisa eleitoral
  if (
    content.includes("NR_PROTOCOLO_REGISTRO") ||
    content.includes("VR_PAGO_CONTRATANTE") ||
    content.includes("DT_GERACAO")
  ) {
    const { registries, report } = parseTseCsv(content, file);
    allTse.push(...registries);
    reports.push(report);
    totalTseParsed += registries.length;
    console.log(`  [${index + 1}/${files.length}] ⚖️ TSE: "${file}" -> ${registries.length} registros extraídos.`);
  } else {
    const { polls, report } = parsePollCsv(content, file);
    allPolls.push(...polls);
    reports.push(report);
    totalPollsParsed += polls.length;
    console.log(`  [${index + 1}/${files.length}] 📊 PESQUISA: "${file}" -> ${polls.length} pesquisas processadas.`);
  }
});

console.log(`\n======================================================`);
console.log(`✅ INGESTÃO CONCLUÍDA COM SUCESSO!`);
console.log(`📊 Total de Pesquisas de Intenção de Voto: ${totalPollsParsed}`);
console.log(`⚖️ Total de Registros Oficiais TSE: ${totalTseParsed}`);
console.log(`======================================================\n`);
