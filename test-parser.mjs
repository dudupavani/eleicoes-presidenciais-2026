import { parsePollCsv, parseTseCsv, parseMultiplePollCsvs } from "./src/lib/csv-parser.js";

console.log("=== TESTANDO PARSER DE REGISTROS OFICIAIS DO TSE ===");

const tseCsvSample = `"DT_GERACAO";"HH_GERACAO";"AA_ELEICAO";"NR_PROTOCOLO_REGISTRO";"CD_CONTRATANTE";"NR_CPF_CNPJ_CONTRATANTE";"NM_CONTRATANTE";"VR_PAGO_CONTRATANTE";"ST_CONTRATANTE_PAGANTE";"DS_ORIGEM_RECURSO"
"01/09/2026";"05:46:44";2026;"AC029782026";51263;"03340836000123";"RAIMUNDO ADEMIR M. DE SOUZA / JORNAL DE NOTICIAS DA HORA";"16500,00";"S";"Outros"
"01/09/2026";"05:46:44";2026;"AC067872026";354807;"14339220000159";"RADIO E TELEVISAO NORTE LTDA";"26,00";"S";"Outros"
"01/09/2026";"05:46:44";2026;"AM068232026";51757;"18264177000160";"KLEYBER JORGE DA SILVEIRA 07661538601 / KS TURIS CONSULTORIA EM TURISMO";"37950,00";"N";"#NULO#"
"01/09/2026";"05:46:44";2026;"AP094382026";355034;"04387825000161";"RADIO TV DO AMAZONAS LTDA / REDE AMAZONICA RADIO E TELEVISAO";"128841,00";"S";"Outros"`;

const { registries, report } = parseTseCsv(tseCsvSample, "PESQUISA_ELEITORAL_CONTRATANTE_2026.csv");

console.log("Resultado Parse TSE:", {
  totalRegistries: registries.length,
  detectedUfs: report.detectedUfs,
  firstRegistry: registries[0],
  thirdRegistry: registries[2],
});

if (registries.length !== 4 || registries[0].uf !== "AC" || registries[2].uf !== "AM" || registries[0].valuePaid !== 16500) {
  console.error("ERRO na validação do parser TSE");
  process.exit(1);
}

console.log("TESTE DO PARSER TSE PASSOU COM SUCESSO!");
