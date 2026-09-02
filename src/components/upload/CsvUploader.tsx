"use client";

import React, { useState, useRef } from "react";
import { usePollsData } from "@/context/PollsDataContext";
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function CsvUploader() {
  const { handleFileUpload, isProcessingUpload, uploadError } = usePollsData();
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccessCount, setUploadSuccessCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.toLowerCase().endsWith(".csv")
      );
      if (files.length > 0) {
        await handleFileUpload(files);
        setUploadSuccessCount(files.length);
      }
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter((f) =>
        f.name.toLowerCase().endsWith(".csv")
      );
      if (files.length > 0) {
        await handleFileUpload(files);
        setUploadSuccessCount(files.length);
      }
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Área de Drag & Drop */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? "border-blue-500 bg-blue-500/10 scale-[1.01]"
            : "border-slate-700 bg-slate-900/80 hover:border-slate-600 hover:bg-slate-900"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,text/csv"
          onChange={onFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
            {isProcessingUpload ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-white">
              {isProcessingUpload
                ? "Processando arquivos CSV..."
                : "Arraste e solte seus múltiplos arquivos CSV aqui"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              ou clique para selecionar do seu computador (suporte a seleção múltipla de arquivos)
            </p>
          </div>

          <div className="inline-flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs text-slate-300">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Parser inteligente: aceita colunas em Português ou Inglês, vírgulas decimais e múltiplos formatos</span>
          </div>
        </div>
      </div>

      {/* Alerta de Sucesso */}
      {uploadSuccessCount !== null && !uploadError && !isProcessingUpload && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-4 flex items-center space-x-3 text-xs text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            {uploadSuccessCount} arquivo(s) CSV processado(s) e incorporado(s) à base consolidada com sucesso!
          </span>
        </div>
      )}

      {/* Alerta de Erro */}
      {uploadError && (
        <div className="bg-red-500/15 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3 text-xs text-red-300 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

    </div>
  );
}
