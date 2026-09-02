import type { Metadata } from "next";
import "./globals.css";
import { PollsDataProvider } from "@/context/PollsDataContext";

export const metadata: Metadata = {
  title: "Eleições Presidenciais 2026 Brasil | Compilador & Mapa Interativo de Pesquisas",
  description: "Plataforma interativa para compilação, análise ponderada e visualização de pesquisas eleitorais para a Eleição Presidencial do Brasil em 2026 com mapa SVG por estados e upload inteligente de múltiplos CSVs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <PollsDataProvider>
          {children}
        </PollsDataProvider>
      </body>
    </html>
  );
}
