import { Poll } from "@/types/election";

/**
 * Sem dados padrão: o TSE não publica os resultados de intenção de voto das
 * pesquisas que registra, apenas metadados de registro (protocolo, instituto,
 * contratante, valor pago). Pesquisas reais e verificadas podem ser adicionadas
 * pela aba de upload de CSV.
 */
export const DEFAULT_POLLS: Poll[] = [];
