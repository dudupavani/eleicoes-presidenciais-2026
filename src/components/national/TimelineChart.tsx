"use client";

import React, { useMemo } from "react";
import { usePollsData } from "@/context/PollsDataContext";
import { getTimelineChartData } from "@/lib/poll-aggregator";
import { formatPercent } from "@/lib/color-utils";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendingUp, Calendar } from "lucide-react";

export function TimelineChart() {
  const { filteredPolls, filters } = usePollsData();

  const { data, candidatesInSeries } = useMemo(() => {
    return getTimelineChartData(filteredPolls, filters.useValidVotes);
  }, [filteredPolls, filters.useValidVotes]);

  if (data.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <p>Não há pesquisas suficientes com datas válidas para renderizar a linha do tempo.</p>
      </div>
    );
  }

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pointData = payload[0].payload;

      return (
        <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl backdrop-blur-md text-xs text-white max-w-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              {pointData.formattedDate} ({pointData.date})
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-medium">
              {pointData.institute}
            </span>
          </div>

          <div className="space-y-1.5">
            {payload
              .sort((a: any, b: any) => (b.value || 0) - (a.value || 0))
              .map((entry: any) => (
                <div key={entry.dataKey} className="flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-slate-300">{entry.name}</span>
                  </div>
                  <span className="font-bold text-white">
                    {formatPercent(entry.value)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
      
      {/* Header do Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Evolução Histórica das Intenções de Voto
          </h3>
          <p className="text-xs text-slate-400">
            Série temporal consolidada das pesquisas nacionais ao longo dos meses
          </p>
        </div>

        <div className="text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-300">
          Base: <span className="font-semibold text-white">{filters.useValidVotes ? "Votos Válidos" : "Votos Totais"}</span>
        </div>
      </div>

      {/* Gráfico Recharts */}
      <div className="w-full h-80 sm:h-96 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis
              dataKey="formattedDate"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              domain={[0, (dataMax: number) => Math.min(100, Math.ceil(dataMax + 8))]}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
              iconType="circle"
            />
            {candidatesInSeries.map((c) => (
              <Line
                key={c.id}
                type="monotone"
                dataKey={c.id}
                name={c.name}
                stroke={c.color}
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#0f172a" }}
                activeDot={{ r: 7, strokeWidth: 2, fill: c.color }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
