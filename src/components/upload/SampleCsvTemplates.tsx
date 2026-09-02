"use client";

import React from "react";
import { Download, FileText, Sparkles } from "lucide-react";

export function SampleCsvTemplates() {
  // Gera modelo CSV em formato LONGO (valores ilustrativos — substitua pelos números reais da pesquisa publicada)
  const downloadLongTemplate = () => {
    const content = `data,instituto,uf,cenario,turno,tipo,candidato,votos,margem_erro,amostra
2026-08-25,Nome do Instituto,BR,Cenário 1,1º Turno,Estimulada,Candidato A,0.0,2.0,2500
2026-08-25,Nome do Instituto,BR,Cenário 1,1º Turno,Estimulada,Candidato B,0.0,2.0,2500
2026-08-25,Nome do Instituto,BR,Cenário 1,1º Turno,Estimulada,Candidato C,0.0,2.0,2500
2026-08-25,Nome do Instituto,BR,Cenário 1,1º Turno,Estimulada,Branco / Nulo,0.0,2.0,2500
2026-08-25,Nome do Instituto,BR,Cenário 1,1º Turno,Estimulada,Indecisos,0.0,2.0,2500`;

    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_pesquisas_formato_longo.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Gera modelo CSV em formato AMPLO (Wide) (valores ilustrativos — substitua pelos números reais da pesquisa publicada)
  const downloadWideTemplate = () => {
    const content = `data,instituto,uf,cenario,turno,tipo,amostra,margem_erro,Candidato A,Candidato B,Candidato C,Branco / Nulo,Indecisos
2026-08-28,Nome do Instituto,BR,Cenário 1,1º Turno,Estimulada,4200,1.5,0.0,0.0,0.0,0.0,0.0
2026-08-20,Nome do Instituto,BR,Cenário 1,1º Turno,Estimulada,2020,2.2,0.0,0.0,0.0,0.0,0.0`;

    const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_pesquisas_formato_amplo.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Modelos de Arquivo CSV para Download
          </h3>
          <p className="text-xs text-slate-400">
            Você pode baixar arquivos de exemplo nos formatos suportados para conferir a estrutura recomendada
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Modelo Longo */}
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2 text-blue-400 font-bold text-xs">
              <FileText className="w-4 h-4" />
              <span>Formato Longo (1 linha por candidato)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ideal para bases consolidadas de TSE, repositórios abertos e múltiplos cenários. Colunas: <code>data, instituto, uf, cenario, turno, candidato, votos...</code>
            </p>
          </div>

          <button
            onClick={downloadLongTemplate}
            className="inline-flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Modelo Longo (.csv)</span>
          </button>
        </div>

        {/* Modelo Amplo */}
        <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/60 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
              <FileText className="w-4 h-4" />
              <span>Formato Amplo (Wide - colunas por candidato)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ideal para tabelas manuais de jornais e planilhas resumidas. Colunas com os nomes dos candidatos: <code>Candidato A, Candidato B, Indecisos...</code>
            </p>
          </div>

          <button
            onClick={downloadWideTemplate}
            className="inline-flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar Modelo Amplo (.csv)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
