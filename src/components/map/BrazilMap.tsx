"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { usePollsData } from "@/context/PollsDataContext";
import { getTseIntensityColor } from "@/lib/color-utils";
import { getPollLeader } from "@/lib/poll-aggregator";
import { CANDIDATES } from "@/data/candidate-profiles";
import { MapTooltip } from "./MapTooltip";
import { MapLegend } from "./MapLegend";
import { StateDetailDrawer } from "./StateDetailDrawer";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import type { UF, MapMetricKey } from "@/types/election";

interface GeoFeatureProperties {
  sigla: string;
  name: string;
}

type BrazilFeature = Feature<Geometry, GeoFeatureProperties>;
type BrazilFeatureCollection = FeatureCollection<Geometry, GeoFeatureProperties>;

const MAP_WIDTH = 900;
const MAP_HEIGHT = 780;

export function BrazilMap() {
  const { stateSummaries, statePolls, setSelectedUf } = usePollsData();
  const hasAnyStatePoll = useMemo(() => Object.keys(statePolls).length > 0, [statePolls]);
  const [metric, setMetric] = useState<MapMetricKey>(hasAnyStatePoll ? "leader" : "count");

  const [geoData, setGeoData] = useState<BrazilFeatureCollection | null>(null);
  const [pathStrings, setPathStrings] = useState<Map<string, string>>(new Map());
  const [centroids, setCentroids] = useState<Map<string, [number, number]>>(new Map());

  const [tooltip, setTooltip] = useState<{ x: number; y: number; uf: string } | null>(null);
  const [hoveredUf, setHoveredUf] = useState<string | null>(null);

  // Zoom & pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const maxValue = useMemo(() => {
    return Math.max(
      0,
      ...Object.values(stateSummaries).map((s) =>
        metric === "count" ? s.registriesCount : s.totalInvestment
      )
    );
  }, [stateSummaries, metric]);

  // Load GeoJSON
  useEffect(() => {
    fetch("/brazil-states.geojson")
      .then((r) => r.json())
      .then((data: BrazilFeatureCollection) => {
        setGeoData(data);

        const projection = geoMercator()
          .center([-53, -14])
          .scale(830)
          .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2]);

        const pathGenerator = geoPath().projection(projection);

        const paths = new Map<string, string>();
        const cents = new Map<string, [number, number]>();

        data.features.forEach((feature) => {
          const uf = feature.properties?.sigla;
          if (!uf) return;
          const d = pathGenerator(feature);
          if (d) paths.set(uf, d);
          const c = pathGenerator.centroid(feature);
          if (c && !isNaN(c[0])) cents.set(uf, [c[0], c[1]]);
        });

        setPathStrings(paths);
        setCentroids(cents);
      })
      .catch((err) => console.error("Erro ao carregar GeoJSON:", err));
  }, []);

  // Mouse handlers
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGElement>) => {
    if (isDragging && dragStart.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
    }
  }, [isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGElement>) => {
    if (e.target === svgRef.current || (e.target as SVGElement).tagName === "svg") {
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    }
  }, [pan]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((prev) => Math.min(6, Math.max(0.7, prev - e.deltaY * 0.001)));
  }, []);

  const handleStateClick = useCallback((uf: string) => {
    setSelectedUf(uf as UF);
  }, [setSelectedUf]);

  const handleStateMouseEnter = useCallback((e: React.MouseEvent, uf: string) => {
    setHoveredUf(uf);
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, uf });
    }
  }, []);

  const handleStateMouseLeave = useCallback(() => {
    setHoveredUf(null);
    setTooltip(null);
  }, []);

  const handleStateMouseMove = useCallback((e: React.MouseEvent, uf: string) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, uf });
    }
  }, []);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Label font size per state (small states get smaller labels)
  const labelSize = useCallback((uf: string): number => {
    const small = ["DF", "SE", "AL", "RN", "PB", "ES", "RJ", "SC", "RR", "AP", "AC", "RO"];
    if (uf === "DF") return 6;
    if (["SE", "AL"].includes(uf)) return 7;
    if (small.includes(uf)) return 8;
    return 10;
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-white">
            Mapa de Registros de Pesquisas Eleitorais no TSE por Estado
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Passe o mouse para ver detalhes. Clique para abrir a lista de registros. Use o scroll para dar zoom.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            {hasAnyStatePoll && (
              <button
                onClick={() => setMetric("leader")}
                className={`px-2.5 py-1.5 rounded-md font-semibold transition-all ${
                  metric === "leader" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Candidato Líder
              </button>
            )}
            <button
              onClick={() => setMetric("count")}
              className={`px-2.5 py-1.5 rounded-md font-semibold transition-all ${
                metric === "count" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Nº de Pesquisas
            </button>
            <button
              onClick={() => setMetric("investment")}
              className={`px-2.5 py-1.5 rounded-md font-semibold transition-all ${
                metric === "investment" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Valor Investido
            </button>
          </div>
          <button
            onClick={() => setZoom((z) => Math.min(6, z * 1.3))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Aproximar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.7, z / 1.3))}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Afastar"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Resetar visão"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative flex gap-4 p-4">
        {/* Mapa SVG */}
        <div className="relative flex-1 overflow-hidden rounded-xl bg-slate-950/60 border border-slate-800/50" style={{ minHeight: 520 }}>
          {!geoData && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
              Carregando mapa geográfico...
            </div>
          )}

          <svg
            ref={svgRef}
            viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
            className="w-full h-full"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <defs>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(0,0,0,0.5)" />
              </filter>
            </defs>

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} style={{ transformOrigin: `${MAP_WIDTH / 2}px ${MAP_HEIGHT / 2}px` }}>
              {/* Estado paths */}
              {geoData?.features.map((feature) => {
                const uf = feature.properties?.sigla;
                if (!uf) return null;
                const pathD = pathStrings.get(uf);
                if (!pathD) return null;

                const summary = stateSummaries[uf as UF];
                let fillColor: string;
                if (metric === "leader") {
                  const featuredPoll = statePolls[uf as UF]?.[0];
                  const leader = featuredPoll ? getPollLeader(featuredPoll) : null;
                  fillColor = leader ? (CANDIDATES[leader.candidateId]?.color || "#64748B") : "#1e293b";
                } else {
                  const value = summary ? (metric === "count" ? summary.registriesCount : summary.totalInvestment) : 0;
                  fillColor = getTseIntensityColor(value, maxValue);
                }

                const isHovered = hoveredUf === uf;

                return (
                  <path
                    key={uf}
                    d={pathD}
                    fill={fillColor}
                    stroke={isHovered ? "#ffffff" : "#0f172a"}
                    strokeWidth={isHovered ? 2 / zoom : 0.8 / zoom}
                    style={{
                      transition: "fill 0.3s ease, stroke 0.2s ease",
                      filter: isHovered ? "url(#shadow)" : undefined,
                      cursor: "pointer",
                    }}
                    onClick={() => handleStateClick(uf)}
                    onMouseEnter={(e) => handleStateMouseEnter(e, uf)}
                    onMouseLeave={handleStateMouseLeave}
                    onMouseMove={(e) => handleStateMouseMove(e, uf)}
                  />
                );
              })}

              {/* Rótulos dos estados */}
              {centroids && Array.from(centroids.entries()).map(([uf, [cx, cy]]) => {
                const fontSize = labelSize(uf) / zoom;
                return (
                  <text
                    key={`label-${uf}`}
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={Math.max(fontSize, 4)}
                    fontWeight="700"
                    fontFamily="monospace"
                    fill="white"
                    style={{ pointerEvents: "none", textShadow: "0 1px 3px rgba(0,0,0,0.8)", userSelect: "none" }}
                    opacity={zoom < 0.8 && ["DF", "SE", "AL"].includes(uf) ? 0 : 1}
                  >
                    {uf}
                  </text>
                );
              })}
            </g>
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <MapTooltip
              summary={stateSummaries[tooltip.uf as UF] || null}
              featuredPoll={statePolls[tooltip.uf as UF]?.[0] || null}
              metric={metric}
              position={{ x: tooltip.x, y: tooltip.y }}
            />
          )}
        </div>

        {/* Legenda lateral */}
        <div className="w-52 shrink-0 hidden lg:block">
          <MapLegend metric={metric} statePolls={statePolls} />
        </div>
      </div>

      {/* Drawer de detalhes */}
      <StateDetailDrawer />
    </div>
  );
}
