import { Candidate } from "@/types/election";

export const CANDIDATES: Record<string, Candidate> = {
  lula: {
    id: "lula",
    name: "Luiz Inácio Lula da Silva",
    shortName: "Lula",
    party: "PT",
    color: "#DC2626", // Vermelho Obrigatório
    lightColor: "#FEE2E2",
    accentColor: "#991B1B",
    textColor: "#FFFFFF",
    avatarUrl: "/avatars/lula.png",
  },
  flavio_bolsonaro: {
    id: "flavio_bolsonaro",
    name: "Flávio Bolsonaro",
    shortName: "Flávio Bolsonaro",
    party: "PL",
    color: "#2563EB", // Azul Obrigatório
    lightColor: "#DBEAFE",
    accentColor: "#1E40AF",
    textColor: "#FFFFFF",
    avatarUrl: "/avatars/flavio.png",
  },
  romeu_zema: {
    id: "romeu_zema",
    name: "Romeu Zema",
    shortName: "Romeu Zema",
    party: "NOVO",
    color: "#EA580C", // Laranja Obrigatório
    lightColor: "#FFEDD5",
    accentColor: "#9A3412",
    textColor: "#FFFFFF",
    avatarUrl: "/avatars/zema.png",
  },
  tarcisio_freitas: {
    id: "tarcisio_freitas",
    name: "Tarcísio de Freitas",
    shortName: "Tarcísio",
    party: "Republicanos",
    color: "#0891B2", // Ciano / Azul Petróleo
    lightColor: "#CFFAFE",
    accentColor: "#0E7490",
    textColor: "#FFFFFF",
    avatarUrl: "/avatars/tarcisio.png",
  },
  ciro_gomes: {
    id: "ciro_gomes",
    name: "Ciro Gomes",
    shortName: "Ciro Gomes",
    party: "PDT",
    color: "#9333EA", // Roxo
    lightColor: "#F3E8FF",
    accentColor: "#6B21A8",
    textColor: "#FFFFFF",
    avatarUrl: "/avatars/ciro.png",
  },
  simone_tebet: {
    id: "simone_tebet",
    name: "Simone Tebet",
    shortName: "Simone Tebet",
    party: "MDB",
    color: "#EAB308", // Dourado / Amarelo
    lightColor: "#FEF9C3",
    accentColor: "#854D0E",
    textColor: "#000000",
    avatarUrl: "/avatars/tebet.png",
  },
  ronaldo_caiado: {
    id: "ronaldo_caiado",
    name: "Ronaldo Caiado",
    shortName: "Ronaldo Caiado",
    party: "União Brasil",
    color: "#059669", // Verde Esmeralda
    lightColor: "#D1FAE5",
    accentColor: "#065F46",
    textColor: "#FFFFFF",
    avatarUrl: "/avatars/caiado.png",
  },
  ratinho_junior: {
    id: "ratinho_junior",
    name: "Ratinho Júnior",
    shortName: "Ratinho Jr",
    party: "PSD",
    color: "#10B981", // Verde Menta
    lightColor: "#ECFDF5",
    accentColor: "#047857",
    textColor: "#FFFFFF",
    avatarUrl: "/avatars/ratinho.png",
  },
  eduardo_leite: {
    id: "eduardo_leite",
    name: "Eduardo Leite",
    shortName: "Eduardo Leite",
    party: "PSDB",
    color: "#4F46E5", // Índigo
    lightColor: "#E0E7FF",
    accentColor: "#3730A3",
    textColor: "#FFFFFF",
    avatarUrl: "/avatars/leite.png",
  },
  brancos_nulos: {
    id: "brancos_nulos",
    name: "Branco / Nulo",
    shortName: "Brancos/Nulos",
    party: "-",
    color: "#475569", // Slate
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
    color: "#64748B", // Slate
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
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove acentos

  if (clean.includes("lula") || clean.includes("luiz inacio")) {
    return { id: "lula", profile: CANDIDATES.lula };
  }
  if (
    clean.includes("flavio") ||
    clean.includes("flávio") ||
    clean.includes("flavio bolsonaro") ||
    clean.includes("bolsonaro, flavio") ||
    (clean.includes("bolsonaro") && !clean.includes("jair") && !clean.includes("eduardo") && !clean.includes("michelle"))
  ) {
    return { id: "flavio_bolsonaro", profile: CANDIDATES.flavio_bolsonaro };
  }
  if (clean.includes("zema") || clean.includes("romeu zema")) {
    return { id: "romeu_zema", profile: CANDIDATES.romeu_zema };
  }
  if (clean.includes("tarcisio") || clean.includes("tarcísio") || clean.includes("freitas")) {
    return { id: "tarcisio_freitas", profile: CANDIDATES.tarcisio_freitas };
  }
  if (clean.includes("ciro") || clean.includes("ciro gomes")) {
    return { id: "ciro_gomes", profile: CANDIDATES.ciro_gomes };
  }
  if (clean.includes("tebet") || clean.includes("simone") || clean.includes("simone tebet")) {
    return { id: "simone_tebet", profile: CANDIDATES.simone_tebet };
  }
  if (clean.includes("caiado") || clean.includes("ronaldo caiado")) {
    return { id: "ronaldo_caiado", profile: CANDIDATES.ronaldo_caiado };
  }
  if (clean.includes("ratinho") || clean.includes("ratinho junior") || clean.includes("ratinho jr")) {
    return { id: "ratinho_junior", profile: CANDIDATES.ratinho_junior };
  }
  if (clean.includes("leite") || clean.includes("eduardo leite")) {
    return { id: "eduardo_leite", profile: CANDIDATES.eduardo_leite };
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
    color: "#6366F1", // Indigo genérico
    lightColor: "#EEF2FF",
    accentColor: "#4338CA",
    textColor: "#FFFFFF",
    isOther: true,
  };

  return { id: dynamicId, profile: fallbackCandidate };
}
