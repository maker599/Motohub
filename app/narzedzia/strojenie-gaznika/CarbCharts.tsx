"use client";

import { useMemo, useState } from "react";
import { type CarbState, type FlowAnalysis, generateAfrCurve } from "./carbPhysics";

type Props = {
  state: CarbState;
  analysis: FlowAnalysis;
};

export default function CarbCharts({ state, analysis }: Props) {
  const [hoveredPoint, setHoveredPoint] = useState<{
    throttlePct: number;
    afr: number;
    pilotPct: number;
    needlePct: number;
    mainPct: number;
  } | null>(null);

  const curveData = useMemo(() => generateAfrCurve(state, 60), [state]);

  // Wymiary wykresu SVG AFR
  const svgWidth = 660;
  const svgHeight = 230;
  const padding = { top: 24, right: 32, bottom: 38, left: 48 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Zakresy osi
  const minAfr = 9.0;
  const maxAfr = 18.0;

  const getX = (throttlePct: number) => padding.left + (throttlePct / 100) * plotWidth;
  const getY = (afr: number) => {
    const clamped = Math.max(minAfr, Math.min(maxAfr, afr));
    return padding.top + plotHeight - ((clamped - minAfr) / (maxAfr - minAfr)) * plotHeight;
  };

  // Ścieżka SVG krzywej AFR
  const afrPathD = useMemo(() => {
    if (!curveData.length) return "";
    return curveData.reduce((acc, pt, idx) => {
      const x = getX(pt.throttlePct);
      const y = getY(pt.afr);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, "");
  }, [curveData]);

  // Ścieżki warstwowe dla obwodów (% contribution)
  const circuitsSvgHeight = 130;
  const circuitsPlotHeight = circuitsSvgHeight - 24;

  const pilotAreaD = useMemo(() => {
    if (!curveData.length) return "";
    let d = `M ${getX(0)} ${circuitsPlotHeight}`;
    curveData.forEach((pt) => {
      const x = getX(pt.throttlePct);
      const y = circuitsPlotHeight - (pt.pilotPct / 100) * circuitsPlotHeight;
      d += ` L ${x} ${y}`;
    });
    d += ` L ${getX(100)} ${circuitsPlotHeight} Z`;
    return d;
  }, [curveData]);

  const needleAreaD = useMemo(() => {
    if (!curveData.length) return "";
    let d = `M ${getX(0)} ${circuitsPlotHeight - (curveData[0].pilotPct / 100) * circuitsPlotHeight}`;
    curveData.forEach((pt) => {
      const x = getX(pt.throttlePct);
      const y = circuitsPlotHeight - ((pt.pilotPct + pt.needlePct) / 100) * circuitsPlotHeight;
      d += ` L ${x} ${y}`;
    });
    for (let i = curveData.length - 1; i >= 0; i--) {
      const pt = curveData[i];
      const x = getX(pt.throttlePct);
      const y = circuitsPlotHeight - (pt.pilotPct / 100) * circuitsPlotHeight;
      d += ` L ${x} ${y}`;
    }
    d += " Z";
    return d;
  }, [curveData]);

  const mainAreaD = useMemo(() => {
    if (!curveData.length) return "";
    let d = `M ${getX(0)} 0`;
    curveData.forEach((pt) => {
      const x = getX(pt.throttlePct);
      d += ` L ${x} 0`;
    });
    for (let i = curveData.length - 1; i >= 0; i--) {
      const pt = curveData[i];
      const x = getX(pt.throttlePct);
      const y = circuitsPlotHeight - ((pt.pilotPct + pt.needlePct) / 100) * circuitsPlotHeight;
      d += ` L ${x} ${y}`;
    }
    d += " Z";
    return d;
  }, [curveData]);

  // Pozycja bieżącego kursora manetki
  const currentCursorX = getX(state.throttle * 100);
  const currentCursorY = getY(analysis.afr);

  const displayPoint = hoveredPoint ?? {
    throttlePct: Math.round(state.throttle * 100),
    afr: analysis.afr,
    pilotPct: analysis.pilotSharePct,
    needlePct: analysis.needleSharePct,
    mainPct: analysis.mainSharePct,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* 1. Główny wykres krzywej AFR */}
      <div className="lg:col-span-2 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#07080a] p-6 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.08] pb-4">
          <div>
            <span className="font-mono text-[10px] font-black uppercase tracking-widest text-red-400">
              TELEMETRIA DYNAMOMETRYCZNA
            </span>
            <h4 className="text-base font-black text-white">Charakterystyka AFR w całym zakresie manetki</h4>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
              Optymalna moc 2T (12.2 - 13.0)
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-red-300">
              <span className="size-2 rounded-full bg-red-400 shadow-[0_0_6px_#ef4444]" />
              Zagrożenie zatarciem (&gt;13.8)
            </span>
          </div>
        </div>

        {/* Dynamiczny wskaźnik scrubber */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/5 bg-white/[.02] px-4 py-2 text-xs font-mono">
          <span className="text-zinc-400">
            Punkt na manetce: <b className="text-white">{displayPoint.throttlePct}%</b>
          </span>
          <span className="text-zinc-400">
            AFR: <b className="text-sky-400">{displayPoint.afr.toFixed(2)} : 1</b>
          </span>
          <span className="text-zinc-400">
            Wiodący obwód:{" "}
            <b className="text-amber-300">
              {displayPoint.pilotPct > 50
                ? "Pilot / Śruba"
                : displayPoint.needlePct > 45
                ? "Iglica / Rozpylacz"
                : "Dysza Główna"}
            </b>
          </span>
        </div>

        <div className="mt-3 relative">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            onMouseLeave={() => setHoveredPoint(null)}
            className="w-full h-auto overflow-visible select-none"
          >
            <defs>
              {/* Poświata neonowa linii */}
              <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Gradient strefy optymalnej (12.0 - 13.2 AFR) */}
              <linearGradient id="opt-zone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.06" />
              </linearGradient>
            </defs>

            {/* Strefa uboga (AFR > 13.8) */}
            <rect
              x={padding.left}
              y={padding.top}
              width={plotWidth}
              height={getY(13.8) - padding.top}
              fill="rgba(239, 68, 68, 0.08)"
            />

            {/* Strefa optymalna mocy 2T (AFR 12.0 .. 13.2) */}
            <rect
              x={padding.left}
              y={getY(13.2)}
              width={plotWidth}
              height={getY(12.0) - getY(13.2)}
              fill="url(#opt-zone)"
              stroke="rgba(16, 185, 129, 0.35)"
              strokeWidth="1"
            />

            {/* Strefa zalewania (AFR < 11.2) */}
            <rect
              x={padding.left}
              y={getY(11.2)}
              width={plotWidth}
              height={padding.top + plotHeight - getY(11.2)}
              fill="rgba(245, 158, 11, 0.08)"
            />

            {/* Poziome linie siatki AFR */}
            {[10, 11, 12, 13, 14, 15, 16, 17].map((afrVal) => {
              const y = getY(afrVal);
              return (
                <g key={afrVal}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + plotWidth}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeDasharray={afrVal === 12.6 ? "none" : "3 3"}
                    strokeWidth={afrVal === 12.6 ? "1.5" : "1"}
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 3.5}
                    textAnchor="end"
                    fill={afrVal === 12 || afrVal === 13 ? "#34d399" : afrVal > 14 ? "#f87171" : "#71717a"}
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    {afrVal}:1
                  </text>
                </g>
              );
            })}

            {/* Pionowe linie siatki % gazu */}
            {[0, 25, 50, 75, 100].map((tPct) => {
              const x = getX(tPct);
              return (
                <g key={tPct}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + plotHeight}
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={padding.top + plotHeight + 16}
                    textAnchor="middle"
                    fill="#a1a1aa"
                    fontSize="9.5"
                    fontFamily="monospace"
                  >
                    {tPct}%
                  </text>
                </g>
              );
            })}

            {/* Etykiety faz przepustnicy */}
            <text x={getX(8)} y={padding.top + plotHeight + 28} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
              JAŁOWY
            </text>
            <text x={getX(20)} y={padding.top + plotHeight + 28} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
              ŚCIĘCIE
            </text>
            <text x={getX(50)} y={padding.top + plotHeight + 28} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
              STOŻEK IGLICY
            </text>
            <text x={getX(88)} y={padding.top + plotHeight + 28} textAnchor="middle" fill="#64748b" fontSize="8" fontWeight="bold">
              DYSZA GŁÓWNA
            </text>

            {/* Neonowa Krzywa AFR */}
            <path
              d={afrPathD}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#neon-glow)"
            />

            {/* Kursor manetki */}
            <line
              x1={currentCursorX}
              y1={padding.top}
              x2={currentCursorX}
              y2={padding.top + plotHeight}
              stroke="#f43f5e"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <circle cx={currentCursorX} cy={currentCursorY} r="6" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
            <circle cx={currentCursorX} cy={currentCursorY} r="12" fill="none" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" className="animate-ping" />

            {/* Interaktywny Hover Scrubber */}
            {curveData.map((pt, idx) => {
              const x = getX(pt.throttlePct);
              return (
                <rect
                  key={idx}
                  x={x - 5}
                  y={padding.top}
                  width={10}
                  height={plotHeight}
                  fill="transparent"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  className="cursor-pointer"
                />
              );
            })}
          </svg>
        </div>

        {/* 2. Udział obwodów w dawce paliwa (% Fuel Delivery Breakdown) */}
        <div className="mt-5 border-t border-white/[.08] pt-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-black uppercase tracking-wider text-zinc-400">
              Udział poszczególnych obwodów w zasilaniu paliwem (%)
            </span>
            <div className="flex flex-wrap gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1.5 text-amber-400">
                <span className="size-2 rounded-sm bg-amber-500" /> Obwód Pilot (0-25%)
              </span>
              <span className="flex items-center gap-1.5 text-yellow-400">
                <span className="size-2 rounded-sm bg-yellow-400" /> Iglica & Rozpylacz (25-75%)
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <span className="size-2 rounded-sm bg-rose-500" /> Dysza Główna (75-100%)
              </span>
            </div>
          </div>

          <div className="mt-3">
            <svg viewBox={`0 0 ${svgWidth} ${circuitsSvgHeight}`} className="w-full h-auto select-none">
              {/* Dysza główna */}
              <path d={mainAreaD} fill="rgba(244, 63, 94, 0.45)" />
              {/* Iglica */}
              <path d={needleAreaD} fill="rgba(234, 179, 8, 0.55)" />
              {/* Pilot */}
              <path d={pilotAreaD} fill="rgba(245, 158, 11, 0.75)" />

              {/* Kursor manetki */}
              <line
                x1={currentCursorX}
                y1={0}
                x2={currentCursorX}
                y2={circuitsPlotHeight}
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. Panel Stanu Świecy Zapłonowej i Diagnostyki Silnika */}
      <div className="flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#07080a] p-6 shadow-2xl">
        <div>
          <div className="flex items-center justify-between border-b border-white/[.08] pb-3">
            <div>
              <span className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-400">
                DIAGNOSTYKA SPALANIA
              </span>
              <h4 className="text-base font-black text-white">Wizualizator Świecy Zapłonowej</h4>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
              NGK RACING
            </span>
          </div>

          {/* Rysunek świecy zapłonowej z metalicznym wykończeniem */}
          <div className="relative mx-auto my-5 flex h-48 w-full max-w-[220px] items-center justify-center rounded-3xl border border-white/5 bg-[#0a0c10] p-4 shadow-inner">
            <svg viewBox="0 0 120 180" className="h-full w-auto drop-shadow-md">
              {/* Gwint świecy M14x1.25 */}
              <rect x="36" y="60" width="48" height="42" fill="#52525b" stroke="#3f3f46" strokeWidth="2" rx="2" />
              {[64, 72, 80, 88, 96].map((gy) => (
                <line key={gy} x1="36" y1={gy} x2="84" y2={gy} stroke="#27272a" strokeWidth="2.5" />
              ))}

              {/* Sześciokątny korpus świecy (klucz 21) */}
              <path d="M30 35 L90 35 L94 60 L26 60 Z" fill="#71717a" stroke="#52525b" strokeWidth="2" />

              {/* Porcelanowy izolator górny */}
              <rect x="42" y="10" width="36" height="25" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" rx="3" />
              <line x1="42" y1="18" x2="78" y2="18" stroke="#0284c7" strokeWidth="2" />
              <text x="60" y="27" textAnchor="middle" fill="#0284c7" fontSize="8" fontWeight="bold">NGK BR9ES</text>

              {/* Dolna komora świecy */}
              <rect x="42" y="102" width="36" height="40" fill="#27272a" stroke="#3f3f46" strokeWidth="1.5" />

              {/* Izolator wewnętrzny (STREFA DIAGNOSTYCZNA - ZMIENIA BARWĘ NA ŻYWO) */}
              <path
                d="M48 102 L72 102 L68 134 L52 134 Z"
                fill={analysis.sparkPlugColor}
                stroke="#18181b"
                strokeWidth="1.5"
                className="transition-colors duration-300"
              />

              {/* Elektroda środkowa */}
              <rect x="58" y="112" width="4" height="28" fill="#e2e8f0" stroke="#1e293b" strokeWidth="1" />

              {/* Elektroda boczna masowa */}
              <path d="M38 102 L38 144 L58 144" fill="none" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />

              {/* Błysk iskry */}
              {analysis.engineRpm > 0 && (
                <circle cx="59" cy="142" r="3.5" fill="#67e8f9" className="animate-ping" opacity="0.85" />
              )}
            </svg>
          </div>

          {/* Opis stanu świecy */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs">
            <div className="flex items-center gap-2.5">
              <span
                className="size-4 shrink-0 rounded-full border border-white/30 shadow-md"
                style={{ backgroundColor: analysis.sparkPlugColor }}
              />
              <span className="font-bold text-white text-sm">{analysis.sparkPlugText}</span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-zinc-400">
              W silnikach dwusuwowych właściwy kolor to odcień kawy z mlekiem / ciemna czekolada. Za jasny kolor oznacza groźbę przegrzania denka tłoka lub zatarcia.
            </p>
          </div>
        </div>

        {/* Wskaźniki cyfrowe */}
        <div className="mt-5 grid grid-cols-2 gap-2 text-center text-xs font-mono">
          <div className="rounded-2xl border border-white/5 bg-white/[.02] p-3">
            <span className="text-[10px] text-zinc-400">Aktualny AFR</span>
            <div className="mt-1 text-lg font-black text-sky-400">{analysis.afr.toFixed(2)} : 1</div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-white/[.02] p-3">
            <span className="text-[10px] text-zinc-400">Współczynnik Lambda</span>
            <div className="mt-1 text-lg font-black text-amber-400">λ {analysis.lambda.toFixed(3)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
