import { Candidate } from "@/types/election";

/**
 * Candidatos a Presidente da República oficialmente registrados no TSE para 2026
 * (prazo de registro de candidatura: 15/08/2026). Fonte: TSE / cobertura eleitoral 2026.
 * Não há dados oficiais do TSE com percentuais de intenção de voto por candidato —
 * o TSE só publica quem registrou/pagou pesquisas, não os resultados delas.
 */
export const CANDIDATES: Record<string, Candidate> = {
  lula: {
    id: "lula",
    name: "Luiz Inácio Lula da Silva",
    shortName: "Lula",
    party: "PT",
    color: "#DC2626",
    lightColor: "#FEE2E2",
    accentColor: "#991B1B",
    textColor: "#FFFFFF",
  },
  flavio_bolsonaro: {
    id: "flavio_bolsonaro",
    name: "Flávio Bolsonaro",
    shortName: "Flávio Bolsonaro",
    party: "PL",
    color: "#2563EB",
    lightColor: "#DBEAFE",
    accentColor: "#1E40AF",
    textColor: "#FFFFFF",
  },
  ronaldo_caiado: {
    id: "ronaldo_caiado",
    name: "Ronaldo Caiado",
    shortName: "Ronaldo Caiado",
    party: "PSD",
    color: "#059669",
    lightColor: "#D1FAE5",
    accentColor: "#065F46",
    textColor: "#FFFFFF",
  },
  romeu_zema: {
    id: "romeu_zema",
    name: "Romeu Zema",
    shortName: "Romeu Zema",
    party: "NOVO",
    color: "#EA580C",
    lightColor: "#FFEDD5",
    accentColor: "#9A3412",
    textColor: "#FFFFFF",
  },
  renan_santos: {
    id: "renan_santos",
    name: "Renan Santos",
    shortName: "Renan Santos",
    party: "Missão",
    color: "#0891B2",
    lightColor: "#CFFAFE",
    accentColor: "#0E7490",
    textColor: "#FFFFFF",
  },
  augusto_cury: {
    id: "augusto_cury",
    name: "Augusto Cury",
    shortName: "Augusto Cury",
    party: "Avante",
    color: "#9333EA",
    lightColor: "#F3E8FF",
    accentColor: "#6B21A8",
    textColor: "#FFFFFF",
  },
  pablo_marcal: {
    id: "pablo_marcal",
    name: "Pablo Marçal",
    shortName: "Pablo Marçal",
    party: "PRTB",
    color: "#EAB308",
    lightColor: "#FEF9C3",
    accentColor: "#854D0E",
    textColor: "#000000",
  },
  edmilson_costa: {
    id: "edmilson_costa",
    name: "Edmilson Costa",
    shortName: "Edmilson Costa",
    party: "PCB",
    color: "#B91C1C",
    lightColor: "#FEE2E2",
    accentColor: "#7F1D1D",
    textColor: "#FFFFFF",
  },
  hertz_dias: {
    id: "hertz_dias",
    name: "Hertz Dias",
    shortName: "Hertz Dias",
    party: "PSTU",
    color: "#DB2777",
    lightColor: "#FCE7F3",
    accentColor: "#9D174D",
    textColor: "#FFFFFF",
  },
  samara_martins: {
    id: "samara_martins",
    name: "Samara Martins",
    shortName: "Samara Martins",
    party: "UP",
    color: "#7C3AED",
    lightColor: "#EDE9FE",
    accentColor: "#5B21B6",
    textColor: "#FFFFFF",
  },
  rui_costa_pimenta: {
    id: "rui_costa_pimenta",
    name: "Rui Costa Pimenta",
    shortName: "Rui Costa Pimenta",
    party: "PCO",
    color: "#B45309",
    lightColor: "#FEF3C7",
    accentColor: "#78350F",
    textColor: "#FFFFFF",
  },
  wilson_grassi: {
    id: "wilson_grassi",
    name: "Wilson Grassi",
    shortName: "Wilson Grassi",
    party: "Democrata",
    color: "#0D9488",
    lightColor: "#CCFBF1",
    accentColor: "#115E59",
    textColor: "#FFFFFF",
  },
  clariana_barao: {
    id: "clariana_barao",
    name: "Clariana Barão",
    shortName: "Clariana Barão",
    party: "DC",
    color: "#4338CA",
    lightColor: "#E0E7FF",
    accentColor: "#312E81",
    textColor: "#FFFFFF",
  },
  brancos_nulos: {
    id: "brancos_nulos",
    name: "Branco / Nulo",
    shortName: "Brancos/Nulos",
    party: "-",
    color: "#475569",
    lightColor: "#F1F5F9",
    accentColor: "#334155",
    textColor: "#FFFFFF",
    isNeutral: true,
  },
  indecisos: {
    id: "indecisos",
    name: "Indecisos / Não Sabe",
    shortName: "Indecisos",
    party: "-",
    color: "#64748B",
    lightColor: "#F8FAFC",
    accentColor: "#475569",
    textColor: "#FFFFFF",
    isNeutral: true,
  },
  outros: {
    id: "outros",
    name: "Outros Candidatos",
    shortName: "Outros",
    party: "-",
    color: "#94A3B8",
    lightColor: "#F1F5F9",
    accentColor: "#64748B",
    textColor: "#FFFFFF",
    isOther: true,
  },
};

/**
 * Mapeia variações de nomes e grafias vindas de arquivos CSV para IDs padronizados de candidatos
 */
export function normalizeCandidateName(rawName: string): { id: string; profile: Candidate } {
  if (!rawName) {
    return { id: "outros", profile: CANDIDATES.outros };
  }

  const clean = rawName.trim().toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, ""); // Remove acentos

  if (clean.includes("lula") || clean.includes("luiz inacio")) {
    return { id: "lula", profile: CANDIDATES.lula };
  }
  if (
    clean.includes("flavio") ||
    (clean.includes("bolsonaro") && !clean.includes("jair") && !clean.includes("eduardo") && !clean.includes("michelle"))
  ) {
    return { id: "flavio_bolsonaro", profile: CANDIDATES.flavio_bolsonaro };
  }
  if (clean.includes("caiado")) {
    return { id: "ronaldo_caiado", profile: CANDIDATES.ronaldo_caiado };
  }
  if (clean.includes("zema")) {
    return { id: "romeu_zema", profile: CANDIDATES.romeu_zema };
  }
  if (clean.includes("renan santos") || clean === "renan") {
    return { id: "renan_santos", profile: CANDIDATES.renan_santos };
  }
  if (clean.includes("augusto cury") || clean.includes("cury")) {
    return { id: "augusto_cury", profile: CANDIDATES.augusto_cury };
  }
  if (clean.includes("marcal") || clean.includes("marçal")) {
    return { id: "pablo_marcal", profile: CANDIDATES.pablo_marcal };
  }
  if (clean.includes("edmilson")) {
    return { id: "edmilson_costa", profile: CANDIDATES.edmilson_costa };
  }
  if (clean.includes("hertz")) {
    return { id: "hertz_dias", profile: CANDIDATES.hertz_dias };
  }
  if (clean.includes("samara")) {
    return { id: "samara_martins", profile: CANDIDATES.samara_martins };
  }
  if (clean.includes("rui costa pimenta") || clean.includes("costa pimenta")) {
    return { id: "rui_costa_pimenta", profile: CANDIDATES.rui_costa_pimenta };
  }
  if (clean.includes("wilson grassi") || clean.includes("grassi")) {
    return { id: "wilson_grassi", profile: CANDIDATES.wilson_grassi };
  }
  if (clean.includes("clariana") || clean.includes("barao") || clean.includes("barão")) {
    return { id: "clariana_barao", profile: CANDIDATES.clariana_barao };
  }
  if (
    clean.includes("branco") ||
    clean.includes("nulo") ||
    clean.includes("brancos") ||
    clean.includes("nulos") ||
    clean === "b/n" ||
    clean === "bn"
  ) {
    return { id: "brancos_nulos", profile: CANDIDATES.brancos_nulos };
  }
  if (
    clean.includes("indeciso") ||
    clean.includes("nao sabe") ||
    clean.includes("ns/nr") ||
    clean.includes("ns/no") ||
    clean.includes("indecisos") ||
    clean.includes("nao respondeu") ||
    clean === "ns" ||
    clean === "nr"
  ) {
    return { id: "indecisos", profile: CANDIDATES.indecisos };
  }

  // Gera um ID dinâmico caso seja um novo candidato
  const dynamicId = clean.replace(/[^a-z0-9]/g, "_").slice(0, 20);
  const fallbackCandidate: Candidate = {
    id: dynamicId,
    name: rawName.trim(),
    shortName: rawName.trim().split(" ")[0],
    party: "Indep.",
    color: "#6366F1",
    lightColor: "#EEF2FF",
    accentColor: "#4338CA",
    textColor: "#FFFFFF",
    isOther: true,
  };

  return { id: dynamicId, profile: fallbackCandidate };
}
