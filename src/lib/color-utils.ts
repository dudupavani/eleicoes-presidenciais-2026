import { CANDIDATES } from "@/data/candidate-profiles";

/**
 * Converte cor Hex para RGBA com opacidade
 */
export function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace("#", "");
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

/**
 * Calcula a intensidade da cor baseada na margem de vitória (em pontos percentuais)
 * Margem < 3%: empate técnico / suave
 * Margem 3-8%: vantagem moderada
 * Margem 8-15%: liderança clara
 * Margem > 15%: liderança dominante
 */
export function calculateStateColorIntensity(margin: number, leaderPct: number): {
  fillColor: string;
  borderColor: string;
  textColor: string;
  intensityLevel: "tight" | "moderate" | "solid" | "dominant";
  opacity: number;
} {
  let opacity = 0.55;
  let intensityLevel: "tight" | "moderate" | "solid" | "dominant" = "tight";

  if (margin < 3) {
    opacity = 0.45;
    intensityLevel = "tight";
  } else if (margin < 8) {
    opacity = 0.65;
    intensityLevel = "moderate";
  } else if (margin < 15) {
    opacity = 0.85;
    intensityLevel = "solid";
  } else {
    opacity = 1.0;
    intensityLevel = "dominant";
  }

  // Se o candidato líder tem mais de 50%, reforça a cor
  if (leaderPct >= 50) {
    opacity = Math.min(1.0, opacity + 0.1);
  }

  return {
    fillColor: "", // Preenchido dinamicamente com a cor do líder
    borderColor: "#ffffff",
    textColor: "#ffffff",
    intensityLevel,
    opacity,
  };
}

/**
 * Obtém a cor representativa do candidato ou fallback neutro
 */
export function getCandidateColor(candidateId: string): string {
  if (CANDIDATES[candidateId]) {
    return CANDIDATES[candidateId].color;
  }
  return "#64748B"; // Slate
}

/**
 * Formata um número para percentual no padrão brasileiro (ex: 42,5%)
 */
export function formatPercent(value: number | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "0,0%";
  }
  return `${value.toFixed(decimals).replace(".", ",")}%`;
}

/**
 * Formata números inteiros com separador de milhar brasileiro (ex: 156.454.000)
 */
export function formatInteger(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

/**
 * Retorna a cor de preenchimento de um estado baseada na cor do candidato líder e na margem
 */
export function getStateColor(candidateColor: string, margin: number): string {
  const { opacity } = calculateStateColorIntensity(margin, 0);
  return hexToRgba(candidateColor, opacity);
}
