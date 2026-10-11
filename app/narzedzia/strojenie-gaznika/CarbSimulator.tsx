"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CARB_PRESETS,
  NEEDLE_PROFILES,
  WORKSHOP_SCENARIOS,
  type WorkshopScenario,
  type CarbState,
  evaluateCarbFlow,
} from "./carbPhysics";
import { carbAudio } from "./CarbAudio";
import CarbFlowCanvas from "./CarbFlowCanvas";
import CarbCharts from "./CarbCharts";

const DEFAULT_STATE: CarbState = {
  boreDiameter: 19,
  mainJet: 85,
  pilotJet: 45,
  atomizerDiameter: 2.62,
  needleName: "W7",
  needleClip: 3,
  slideCutaway: 40,
  idleScrewTurns: 1.5,
  mixtureScrewTurns: 1.5,
  mixtureScrewType: "air",
  chokeEngaged: false,
  floatLevelOffset: 0,
  displacementCc: 50,
  throttle: 0.0,
  ambientTempC: 20,
  altitudeM: 100,
  airFilterType: "sponge",
};

// Kompaktowa, elegancka śruba z obracającą się główką
function CompactScrewControl({
  title,
  turns,
  minTurns,
  maxTurns,
  step,
  onChange,
  color = "amber",
  ruleText,
}: {
  title: string;
  turns: number;
  minTurns: number;
  maxTurns: number;
  step: number;
  onChange: (val: number) => void;
  color?: "amber" | "zinc";
  ruleText?: string;
}) {
  const angleDeg = (turns * 360) % 180;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-white">{title}</span>
          <div className="mt-0.5 flex items-baseline gap-1.5 font-mono">
            <span
              className={`text-xl font-black ${
                color === "amber" ? "text-amber-400" : "text-zinc-200"
              }`}
            >
              {turns.toFixed(2)}
            </span>
            <span className="text-[10px] text-zinc-500">obr. od oporu</span>
          </div>
        </div>

        {/* Fizyczna główka śruby z obrotem */}
        <div className="relative flex size-11 shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 shadow-inner">
          <div
            className={`flex size-8 items-center justify-center rounded-full border shadow-sm transition-transform duration-100 ${
              color === "amber"
                ? "border-amber-500/60 bg-gradient-to-br from-amber-300 via-yellow-600 to-amber-900"
                : "border-zinc-400/60 bg-gradient-to-br from-zinc-200 via-zinc-500 to-zinc-800"
            }`}
            style={{ transform: `rotate(${angleDeg}deg)` }}
          >
            <div className="h-1 w-6 rounded-full bg-black/90" />
          </div>
        </div>
      </div>

      {/* Przyciski skokowego kręcenia */}
      <div className="mt-2.5 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(Math.max(minTurns, parseFloat((turns - step).toFixed(2))))}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1 text-[11px] font-bold text-zinc-300 transition hover:bg-white/10 active:scale-95"
        >
          ↺ -{step}
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.min(maxTurns, parseFloat((turns + step).toFixed(2))))}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1 text-[11px] font-bold text-zinc-300 transition hover:bg-white/10 active:scale-95"
        >
          ↻ +{step}
        </button>
        <button
          type="button"
          onClick={() => onChange(1.5)}
          className="rounded-lg border border-white/5 px-2 py-1 text-[10px] text-zinc-500 hover:text-white"
        >
          1.50
        </button>
      </div>

      <input
        type="range"
        aria-label={title}
        min={minTurns}
        max={maxTurns}
        step={0.125}
        value={turns}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 ${
          color === "amber" ? "accent-amber-500" : "accent-zinc-400"
        }`}
      />

      {ruleText && <p className="mt-1.5 text-[9.5px] leading-3.5 text-zinc-400">{ruleText}</p>}
    </div>
  );
}

export default function CarbSimulator() {
  const [state, setState] = useState<CarbState>(DEFAULT_STATE);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState("phbg-19-black");
  const [centerTab, setCenterTab] = useState<"canvas" | "charts">("canvas");
  const [isRevving, setIsRevving] = useState(false);

  // Scenariusze warsztatowe (Wyzwania diagnostyczne)
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>("lean-mid-needle");
  const [showHint, setShowHint] = useState<boolean>(false);
  const [scenarioFilter, setScenarioFilter] = useState<string>("all");
  const [showScenarioCatalog, setShowScenarioCatalog] = useState<boolean>(false);

  const updateState = (patch: Partial<CarbState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  // Wyliczenie fizyki przepływu
  const analysis = useMemo(() => evaluateCarbFlow(state), [state]);

  // Aktywny scenariusz & Live ewaluacja rozwiązania
  const activeScenario = useMemo(
    () => WORKSHOP_SCENARIOS.find((s) => s.id === activeScenarioId) ?? null,
    [activeScenarioId]
  );

  const solutionStatus = useMemo(() => {
    if (!activeScenario) return null;
    return activeScenario.checkSolution(state, analysis);
  }, [activeScenario, state, analysis]);

  const selectScenario = (scenario: WorkshopScenario) => {
    setActiveScenarioId(scenario.id);
    setShowHint(false);
    updateState({ ...scenario.initialPatch });
  };

  const resetCurrentScenario = () => {
    if (!activeScenario) return;
    updateState({ ...activeScenario.initialPatch });
  };

  const nextScenario = () => {
    if (!activeScenario) return;
    const currentIndex = WORKSHOP_SCENARIOS.findIndex((s) => s.id === activeScenario.id);
    const nextIndex = (currentIndex + 1) % WORKSHOP_SCENARIOS.length;
    selectScenario(WORKSHOP_SCENARIOS[nextIndex]);
  };

  const filteredScenarios = useMemo(() => {
    if (scenarioFilter === "all") return WORKSHOP_SCENARIOS;
    return WORKSHOP_SCENARIOS.filter((s) => s.category === scenarioFilter);
  }, [scenarioFilter]);

  // Audio Engine
  useEffect(() => {
    carbAudio.setMuted(!audioEnabled);
  }, [audioEnabled]);

  useEffect(() => {
    if (audioEnabled) {
      carbAudio.update(analysis.engineRpm, state.throttle, analysis.afr, analysis.isFourStroking);
    }
  }, [audioEnabled, analysis, state.throttle]);

  // Przegazowanie (Rev Snap)
  const revIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const handleRevSnap = () => {
    if (isRevving) return;
    setIsRevving(true);
    let step = 0;
    const initialThrottle = state.throttle;
    if (revIntervalRef.current) clearInterval(revIntervalRef.current);

    revIntervalRef.current = setInterval(() => {
      step++;
      if (step <= 5) {
        updateState({ throttle: Math.min(1.0, initialThrottle + (0.95 - initialThrottle) * (step / 5)) });
      } else if (step <= 12) {
        const backProgress = (step - 5) / 7;
        updateState({ throttle: 0.95 - (0.95 - initialThrottle) * backProgress });
      } else {
        if (revIntervalRef.current) clearInterval(revIntervalRef.current);
        updateState({ throttle: initialThrottle });
        setIsRevving(false);
      }
    }, 38);
  };

  // Zastosowanie presetu fabrycznego
  const applyPreset = (presetId: string) => {
    const preset = CARB_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(presetId);
    setActiveScenarioId(null);
    updateState({
      boreDiameter: preset.boreDiameter,
      mainJet: preset.mainJet,
      pilotJet: preset.pilotJet,
      atomizerDiameter: preset.atomizerDiameter,
      needleName: preset.needleName,
      needleClip: preset.needleClip,
      slideCutaway: preset.slideCutaway,
      idleScrewTurns: preset.idleScrewTurns,
      mixtureScrewTurns: preset.mixtureScrewTurns,
      mixtureScrewType: preset.mixtureScrewType,
    });
  };

  return (
    <div className="w-full">
      {/* GŁÓWNY UKŁAD 3-KOLUMNOWY STUDIO (BEZ SCROLLOWANIA NA DESKTOPIE) */}
      <div className="grid grid-cols-1 gap-4.5 xl:grid-cols-[330px_minmax(0,1fr)_330px] 2xl:grid-cols-[360px_minmax(0,1fr)_360px] items-start">
        
        {/* ============================================================== */}
        {/* LEWY PANEL (SIDEBAR 1): REGULACJA GAŹNIKA (ŚRUBY, IGLICA, DYSZE) */}
        {/* ============================================================== */}
        <aside className="space-y-4 rounded-3xl border border-white/10 bg-[#0a0c10] p-4.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/[.08] pb-3">
            <div>
              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-red-400">
                01 / WARSZTAT
              </span>
              <h3 className="text-sm font-black text-white">Regulacja Gaźnika</h3>
            </div>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
              Ø{state.boreDiameter} mm
            </span>
          </div>

          {/* Model gaźnika */}
          <div>
            <label htmlFor="carb-preset-select" className="text-[11px] font-bold text-zinc-400">Model gaźnika:</label>
            <select
              id="carb-preset-select"
              aria-label="Wybierz fabryczny model gaźnika"
              value={selectedPresetId}
              onChange={(e) => applyPreset(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#14161d] p-2 text-xs font-bold text-white outline-none focus:border-red-400"
            >
              {CARB_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Śruba mieszanki */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-400">Typ śruby składu:</span>
              <div className="flex rounded-lg border border-white/10 bg-black/50 p-0.5 text-[9.5px] font-mono">
                <button
                  type="button"
                  onClick={() => updateState({ mixtureScrewType: "air" })}
                  className={`rounded px-1.5 py-0.5 transition ${
                    state.mixtureScrewType === "air" ? "bg-amber-500/30 text-white font-bold" : "text-zinc-500"
                  }`}
                >
                  Powietrza (od filtra)
                </button>
                <button
                  type="button"
                  onClick={() => updateState({ mixtureScrewType: "fuel" })}
                  className={`rounded px-1.5 py-0.5 transition ${
                    state.mixtureScrewType === "fuel" ? "bg-amber-500/30 text-white font-bold" : "text-zinc-500"
                  }`}
                >
                  Paliwa
                </button>
              </div>
            </div>

            <CompactScrewControl
              title={state.mixtureScrewType === "air" ? "Śruba Powietrza (Air Screw)" : "Śruba Paliwa (Fuel Screw)"}
              turns={state.mixtureScrewTurns}
              minTurns={0.25}
              maxTurns={4.0}
              step={0.25}
              onChange={(val) => updateState({ mixtureScrewTurns: val })}
              color="amber"
              ruleText={
                state.mixtureScrewType === "air"
                  ? "Wykręcanie wpuszcza powietrze (ZUBAŻA). Wkręcanie WZBOGACA."
                  : "Wykręcanie wpuszcza paliwo (WZBOGACA). Wkręcanie ZUBAŻA."
              }
            />
          </div>

          {/* Śruba jałowego */}
          <CompactScrewControl
            title="Śruba oporowa (Idle Speed)"
            turns={state.idleScrewTurns}
            minTurns={0.5}
            maxTurns={3.0}
            step={0.25}
            onChange={(val) => updateState({ idleScrewTurns: val })}
            color="zinc"
            ruleText="Wkręcanie śruby unosi suwak, zwiększając szczelinę i obroty jałowe."
          />

          {/* Iglica stożkowa & Klips */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Klips Iglicy (1=Góra, 5=Dół)</span>
              <span className="font-mono text-xs font-black text-yellow-400">
                Rowek {state.needleClip}/5
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-5 gap-1.5">
              {[1, 2, 3, 4, 5].map((slot) => {
                const isSelected = state.needleClip === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => updateState({ needleClip: slot })}
                    className={`flex flex-col items-center justify-center rounded-xl border py-1.5 transition active:scale-95 ${
                      isSelected
                        ? "border-yellow-400 bg-yellow-400/25 text-white shadow-[0_0_10px_rgba(250,204,21,0.3)]"
                        : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span className="font-mono text-sm font-black">{slot}</span>
                    <span className="text-[8px] font-bold">
                      {slot === 1 ? "Ubogo" : slot === 5 ? "Bogato" : slot === 3 ? "Baza" : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
              <div>
                <label htmlFor="needle-profile-select-3" className="text-zinc-400 font-semibold">Profil iglicy:</label>
                <select
                  id="needle-profile-select-3"
                  value={state.needleName}
                  onChange={(e) => updateState({ needleName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#161820] p-1.5 text-[11px] font-bold text-white"
                >
                  {Object.entries(NEEDLE_PROFILES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="atomizer-select-3" className="text-zinc-400 font-semibold">Rozpylacz:</label>
                <select
                  id="atomizer-select-3"
                  value={state.atomizerDiameter}
                  onChange={(e) => updateState({ atomizerDiameter: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#161820] p-1.5 text-[11px] font-bold text-white"
                >
                  <option value={2.60}>AN 260</option>
                  <option value={2.62}>AN 262</option>
                  <option value={2.64}>AN 264</option>
                  <option value={2.66}>AN 266</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dysza Główna & Dysza Pilotowa */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3.5 shadow-sm space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Dysza Główna (MJ)</span>
                <span className="font-mono text-lg font-black text-rose-400">#{state.mainJet}</span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {[70, 75, 80, 85, 90, 95, 102, 110, 118].map((mj) => (
                  <button
                    key={mj}
                    type="button"
                    onClick={() => updateState({ mainJet: mj })}
                    className={`rounded-lg border px-2 py-0.5 font-mono text-[10px] font-bold transition ${
                      state.mainJet === mj
                        ? "border-rose-400 bg-rose-500/25 text-white"
                        : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    #{mj}
                  </button>
                ))}
              </div>
              <input
                type="range"
                aria-label="Dysza główna"
                min={60}
                max={140}
                step={1}
                value={state.mainJet}
                onChange={(e) => updateState({ mainJet: parseInt(e.target.value, 10) })}
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-rose-500"
              />
            </div>

            <div className="border-t border-white/[.07] pt-2.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">Dysza Pilotowa</span>
                <div className="mt-1 flex gap-1">
                  {[35, 40, 45, 50].map((pj) => (
                    <button
                      key={pj}
                      type="button"
                      onClick={() => updateState({ pilotJet: pj })}
                      className={`rounded-lg border px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                        state.pilotJet === pj
                          ? "border-amber-400 bg-amber-500/25 text-white"
                          : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                      }`}
                    >
                      #{pj}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-base font-black text-amber-400">#{state.pilotJet}</span>
              </div>
            </div>

            {/* Dźwignia ssania */}
            <div className="border-t border-white/[.07] pt-2 flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-300">Dźwignia ssania (Choke)</span>
              <button
                type="button"
                onClick={() => updateState({ chokeEngaged: !state.chokeEngaged })}
                className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition ${
                  state.chokeEngaged
                    ? "border-amber-500 bg-amber-500/30 text-amber-200"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                {state.chokeEngaged ? "SSANIE ON" : "OFF"}
              </button>
            </div>
          </div>
        </aside>

        {/* ============================================================== */}
        {/* ŚRODKOWA KOLUMNA (CENTRUM): PRZEKRÓJ CAD, MANETKA, ZEGAREK, TELEMETRIA */}
        {/* ============================================================== */}
        <main className="space-y-4 min-w-0">
          
          {/* PASEK ZEGAREK TELEMETRII (KOMPAKTOWY HUD) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-3xl border border-white/10 bg-[#0a0c10] p-4 shadow-xl backdrop-blur-md">
            {/* 1. Obroty 2T */}
            <div className="rounded-2xl border border-white/5 bg-black/50 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>OBROTY 2T</span>
                <span className="text-red-400">RPM</span>
              </div>
              <div className="my-1 font-mono text-2xl sm:text-3xl font-black text-white">
                {analysis.engineRpm.toLocaleString("pl-PL")}
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${Math.min(100, (analysis.engineRpm / 13500) * 100)}%`,
                    backgroundColor:
                      analysis.engineRpm > 11500 ? "#ef4444" : analysis.engineRpm > 8500 ? "#f59e0b" : "#10b981",
                  }}
                />
              </div>
            </div>

            {/* 2. Szerokopasmowy AFR */}
            <div className="rounded-2xl border border-white/5 bg-black/50 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>SKŁAD AFR</span>
                <span className="text-sky-400">WIDEBAND</span>
              </div>
              <div
                className="my-1 font-mono text-2xl sm:text-3xl font-black"
                style={{
                  color:
                    analysis.condition === "optimal"
                      ? "#34d399"
                      : analysis.condition === "rich"
                      ? "#fbbf24"
                      : analysis.condition === "lean"
                      ? "#f87171"
                      : "#ef4444",
                }}
              >
                {analysis.afr.toFixed(2)}
                <span className="text-xs text-zinc-500 font-normal">:1</span>
              </div>
              <div className="text-[10px] font-mono text-zinc-400">
                λ {analysis.lambda.toFixed(3)}
              </div>
            </div>

            {/* 3. Moc chwilowa KM */}
            <div className="rounded-2xl border border-white/5 bg-black/50 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>MOC DYNAMO</span>
                <span className="text-amber-400">KM</span>
              </div>
              <div className="my-1 font-mono text-2xl sm:text-3xl font-black text-white">
                {analysis.powerOutputHp.toFixed(1)}
              </div>
              <div className="text-[10px] font-mono text-zinc-400">
                Sprawność: {Math.round(analysis.combustionEfficiency * 100)}%
              </div>
            </div>

            {/* 4. Stan pracy & Dźwięk */}
            <div className="rounded-2xl border border-white/5 bg-black/50 p-3 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>STATUS</span>
                <button
                  type="button"
                  onClick={() => setAudioEnabled((v) => !v)}
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    audioEnabled ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-zinc-400"
                  }`}
                >
                  {audioEnabled ? "🔊 AUDIO ON" : "🔇 AUDIO OFF"}
                </button>
              </div>
              <div
                className="my-1 text-xs font-black truncate"
                style={{
                  color:
                    analysis.isFourStroking || analysis.isBoggingDown
                      ? "#f87171"
                      : analysis.condition === "optimal"
                      ? "#34d399"
                      : "#fbbf24",
                }}
              >
                {analysis.isFourStroking
                  ? "⚠️ Czterosuw (Zalany)"
                  : analysis.isBoggingDown
                  ? "⚠️ Dusi się (Ubogo)"
                  : analysis.condition === "optimal"
                  ? "✓ Czysty rezonans"
                  : "Stabilny"}
              </div>
              <div className="text-[9.5px] text-zinc-500 truncate">
                {analysis.conditionLabel}
              </div>
            </div>
          </div>

          {/* PRZEŁĄCZNIK ZAKŁADEK CENTRUM: PRZEKRÓJ CAD VS WYKRES AFR */}
          <div className="flex items-center justify-between border-b border-white/10 px-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCenterTab("canvas")}
                className={`border-b-2 py-2 px-4 text-xs font-black transition ${
                  centerTab === "canvas" ? "border-red-500 text-white" : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Przekrój CAD & Przepływy
              </button>
              <button
                type="button"
                onClick={() => setCenterTab("charts")}
                className={`border-b-2 py-2 px-4 text-xs font-black transition ${
                  centerTab === "charts" ? "border-red-500 text-white" : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Krzywa AFR & Rozkład Obwodów
              </button>
            </div>
            <span className="font-mono text-[10px] text-zinc-500">
              Prędkość: <b className="text-sky-400">{analysis.airVelocityMs.toFixed(1)} m/s</b>
            </span>
          </div>

          {/* GŁÓWNA GRAFIKA / CANVAS LUB WYKRES */}
          {centerTab === "canvas" ? (
            <CarbFlowCanvas
              state={state}
              analysis={analysis}
              onUpdateState={updateState}
            />
          ) : (
            <CarbCharts state={state} analysis={analysis} />
          )}

          {/* STACJA MANETKI GAZU (TWISTGRIP THROTTLE CONTROL) */}
          <div className="rounded-3xl border border-white/10 bg-[#0d0f14] p-4.5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-red-300">
                  Manetka gazu:
                </span>
                <span className="rounded-lg border border-red-500/30 bg-red-500/20 px-2.5 py-0.5 font-mono text-xs font-black text-red-100">
                  {Math.round(state.throttle * 100)}%
                </span>
                <span className="text-[11px] text-zinc-400">
                  (Suwak: {analysis.slideLiftMm.toFixed(1)} mm)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateState({ throttle: 0 })}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  0%
                </button>
                <button
                  type="button"
                  onClick={() => updateState({ throttle: 0.25 })}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => updateState({ throttle: 0.5 })}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => updateState({ throttle: 0.75 })}
                  className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white"
                >
                  75%
                </button>
                <button
                  type="button"
                  onClick={() => updateState({ throttle: 1.0 })}
                  className="rounded-lg border border-red-500/30 bg-red-500/20 px-2.5 py-1 text-xs font-bold text-red-200 hover:bg-red-500/30"
                >
                  100%
                </button>

                <button
                  type="button"
                  disabled={isRevving}
                  onClick={handleRevSnap}
                  className="rounded-lg border border-amber-500/50 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 px-3 py-1 text-xs font-black text-amber-200 shadow-sm transition hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  ⚡ PRZEGAZUJ!
                </button>
              </div>
            </div>

            <input
              type="range"
              aria-label="Otwarcie manetki gazu"
              min={0}
              max={1}
              step={0.01}
              value={state.throttle}
              onChange={(e) => updateState({ throttle: parseFloat(e.target.value) })}
              className="mt-3 h-2.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-red-500 shadow-inner"
            />
            <div className="mt-1.5 flex justify-between font-mono text-[9px] text-zinc-500">
              <span className="text-amber-400">0-25% Pilot & Śruba</span>
              <span className="text-yellow-400">25-75% Iglica & Rozpylacz</span>
              <span className="text-rose-400 font-bold">75-100% Dysza Główna</span>
            </div>
          </div>
        </main>

        {/* ============================================================== */}
        {/* PRAWY PANEL (SIDEBAR 2): ŚWIECA, WYZWANIA, ŚRODOWISKO */}
        {/* ============================================================== */}
        <aside className="space-y-4 rounded-3xl border border-white/10 bg-[#0a0c10] p-4.5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/[.08] pb-3">
            <div>
              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-sky-400">
                02 / DIAGNOSTYKA
              </span>
              <h3 className="text-sm font-black text-white">Świeca & Scenariusze</h3>
            </div>
            <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] text-sky-300">
              {analysis.airDensityKgM3.toFixed(3)} kg/m³
            </span>
          </div>

          {/* Miniaturowy Wizualizator Świecy NGK */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div
                className="size-10 shrink-0 rounded-xl border border-white/20 shadow-md transition-colors duration-300"
                style={{ backgroundColor: analysis.sparkPlugColor }}
              />
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white">{analysis.sparkPlugText.split(".")[0]}</div>
                <div className="mt-0.5 text-[10px] text-zinc-400">
                  AFR {analysis.afr.toFixed(2)} · λ {analysis.lambda.toFixed(3)}
                </div>
                <div className="mt-0.5 text-[10px] font-bold" style={{ color: analysis.condition === 'optimal' ? '#34d399' : analysis.condition === 'rich' || analysis.condition === 'extremely-rich' ? '#fbbf24' : '#f87171' }}>
                  {analysis.conditionLabel.split('(')[0].trim()}
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* WYZWANIA WARSZTATOWE — Katalog Scenariuszy */}
          {/* ================================================================ */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3 shadow-sm space-y-2">
            {/* Nagłówek z filtrem i przyciskiem katalogu */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-white">Wyzwania Warsztatowe</span>
              <button
                type="button"
                onClick={() => setShowScenarioCatalog((v) => !v)}
                className={`rounded-lg border px-2 py-0.5 text-[9px] font-bold transition ${
                  showScenarioCatalog
                    ? "border-red-400/40 bg-red-500/15 text-red-200"
                    : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                {showScenarioCatalog ? "✕ Zamknij" : "📋 Katalog"}
              </button>
            </div>

            {/* Aktywny scenariusz — karta z informacjami */}
            {activeScenario && !showScenarioCatalog && (
              <div className="space-y-2">
                {/* Badge statusu scenariusza */}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    solutionStatus?.solved
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-amber-500/15 text-amber-300"
                  }`}>
                    {solutionStatus?.solved ? "✓ Rozwiązano!" : "⚙ W toku"}
                  </span>
                  <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold ${
                    activeScenario.difficulty === "Łatwy" ? "border-emerald-500/30 text-emerald-400"
                    : activeScenario.difficulty === "Średni" ? "border-amber-500/30 text-amber-400"
                    : "border-red-500/30 text-red-400"
                  }`}>
                    {activeScenario.difficulty}
                  </span>
                  <span className="ml-auto text-[9px] text-zinc-600">{activeScenario.category}</span>
                </div>

                {/* Tytuł scenariusza */}
                <h4 className="text-[11px] font-black leading-4 text-white">{activeScenario.title}</h4>

                {/* Objaw */}
                <div className="rounded-lg bg-red-950/40 border border-red-500/20 p-2">
                  <p className="text-[9.5px] font-bold text-red-300 mb-0.5">⚠ OBJAW:</p>
                  <p className="text-[9.5px] leading-3.5 text-zinc-300">{activeScenario.symptom}</p>
                </div>

                {/* Cel */}
                <div className="rounded-lg bg-sky-950/40 border border-sky-500/20 p-2">
                  <p className="text-[9.5px] font-bold text-sky-300 mb-0.5">🎯 CEL:</p>
                  <p className="text-[9.5px] leading-3.5 text-zinc-300">{activeScenario.goal}</p>
                </div>

                {/* Podpowiedź (toggle) */}
                <button
                  type="button"
                  onClick={() => setShowHint((v) => !v)}
                  className="w-full rounded-lg border border-amber-500/20 bg-amber-500/10 py-1 text-[9.5px] font-bold text-amber-300 hover:bg-amber-500/20"
                >
                  {showHint ? "▲ Ukryj podpowiedź" : "💡 Pokaż podpowiedź"}
                </button>

                {showHint && (
                  <div className="rounded-lg bg-amber-950/40 border border-amber-500/20 p-2">
                    <p className="text-[9.5px] leading-4 text-amber-200">{activeScenario.hint}</p>
                  </div>
                )}

                {/* Live feedback rozwiązania */}
                {solutionStatus && (
                  <div className={`rounded-lg border p-2 ${
                    solutionStatus.solved
                      ? "border-emerald-500/30 bg-emerald-950/40"
                      : "border-zinc-600/30 bg-black/30"
                  }`}>
                    <p className={`text-[9.5px] leading-3.5 ${
                      solutionStatus.solved ? "text-emerald-300 font-bold" : "text-zinc-400"
                    }`}>
                      {solutionStatus.feedback}
                    </p>
                  </div>
                )}

                {/* Przyciski akcji */}
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={resetCurrentScenario}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1 text-[9.5px] font-bold text-zinc-400 hover:text-white"
                  >
                    ↺ Reset
                  </button>
                  <button
                    type="button"
                    onClick={nextScenario}
                    className="flex-1 rounded-lg border border-sky-500/20 bg-sky-500/10 py-1 text-[9.5px] font-bold text-sky-300 hover:bg-sky-500/20"
                  >
                    Następne →
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowScenarioCatalog(true)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 py-1 text-[9.5px] font-bold text-zinc-400 hover:text-white"
                  >
                    📋 Lista
                  </button>
                </div>
              </div>
            )}

            {/* Katalog scenariuszy (lista) */}
            {showScenarioCatalog && (
              <div className="space-y-1.5">
                {/* Filtr kategorii */}
                <div className="flex flex-wrap gap-1">
                  {(["all", "Iglica & Środek", "Dysza Główna", "Bieg Jałowy", "Tuning & Dolot", "Pogoda"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setScenarioFilter(cat)}
                      className={`rounded px-1.5 py-0.5 text-[8px] font-bold transition ${
                        scenarioFilter === cat
                          ? "bg-red-500/25 text-red-200"
                          : "bg-white/5 text-zinc-500 hover:text-white"
                      }`}
                    >
                      {cat === "all" ? "Wszystkie" : cat}
                    </button>
                  ))}
                </div>

                {/* Lista scenariuszy */}
                <div className="max-h-72 overflow-y-auto space-y-1 pr-0.5">
                  {filteredScenarios.map((sc) => {
                    const isActive = sc.id === activeScenarioId;
                    const testResult = sc.checkSolution(state, analysis);
                    return (
                      <button
                        key={sc.id}
                        type="button"
                        onClick={() => { selectScenario(sc); setShowScenarioCatalog(false); }}
                        className={`w-full rounded-xl border p-2 text-left transition ${
                          isActive
                            ? testResult.solved
                              ? "border-emerald-500/40 bg-emerald-500/10"
                              : "border-red-400/30 bg-red-500/10"
                            : "border-white/10 bg-white/[.03] hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-bold text-white leading-tight line-clamp-1">{sc.title}</span>
                          {testResult.solved && <span className="shrink-0 text-[8px] text-emerald-400 font-black">✓</span>}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <span className={`text-[8px] font-bold ${
                            sc.difficulty === "Łatwy" ? "text-emerald-500"
                            : sc.difficulty === "Średni" ? "text-amber-500"
                            : "text-red-500"
                          }`}>{sc.difficulty}</span>
                          <span className="text-[8px] text-zinc-600">{sc.category}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Brak aktywnego scenariusza */}
            {!activeScenario && !showScenarioCatalog && (
              <button
                type="button"
                onClick={() => setShowScenarioCatalog(true)}
                className="w-full rounded-xl border border-dashed border-white/20 py-3 text-[10px] text-zinc-500 hover:text-white hover:border-white/40"
              >
                📋 Wybierz wyzwanie z katalogu
              </button>
            )}
          </div>

          {/* Konfiguracja Silnika & Środowisko */}
          <div className="rounded-2xl border border-white/10 bg-black/40 p-3 shadow-sm space-y-2 text-[11px]">
            <span className="font-bold text-white text-xs">Silnik & Środowisko</span>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="displacement-select" className="text-zinc-400">Pojemność:</label>
                <select
                  id="displacement-select"
                  value={state.displacementCc}
                  onChange={(e) => updateState({ displacementCc: parseInt(e.target.value, 10) })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#14161d] p-1.5 font-bold text-white"
                >
                  <option value={50}>50cc</option>
                  <option value={70}>70cc Sport</option>
                  <option value={80}>80cc Racing</option>
                  <option value={88}>88cc Big Bore</option>
                  <option value={95}>95cc Big Bore</option>
                </select>
              </div>

              <div>
                <label htmlFor="air-filter-select" className="text-zinc-400">Filtr:</label>
                <select
                  id="air-filter-select"
                  value={state.airFilterType}
                  onChange={(e) => updateState({ airFilterType: e.target.value as CarbState["airFilterType"] })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-[#14161d] p-1.5 font-bold text-white"
                >
                  <option value="airbox">Airbox</option>
                  <option value="sponge">Gąbka</option>
                  <option value="cone-open">Stożek</option>
                </select>
              </div>
            </div>

            {/* Pogoda & Wysokość */}
            <div className="border-t border-white/[.07] pt-2 space-y-1.5">
              <div>
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Temperatura powietrza:</span>
                  <span className="font-bold text-sky-400">{state.ambientTempC}°C</span>
                </div>
                <input type="range" aria-label="Temperatura powietrza" min={-15} max={45} step={1}
                  value={state.ambientTempC} onChange={(e) => updateState({ ambientTempC: parseInt(e.target.value, 10) })}
                  className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-sky-400"
                />
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Wysokość n.p.m.:</span>
                  <span className="font-bold text-sky-400">{state.altitudeM} m</span>
                </div>
                <input type="range" aria-label="Wysokość n.p.m." min={0} max={2500} step={50}
                  value={state.altitudeM} onChange={(e) => updateState({ altitudeM: parseInt(e.target.value, 10) })}
                  className="mt-1 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-zinc-800 accent-sky-400"
                />
              </div>
            </div>
          </div>

          {/* Diagnoza Mechanika */}
          <div className="rounded-2xl border border-white/5 bg-black/50 p-3 text-[10.5px] leading-4 text-zinc-300">
            <span className="font-bold text-yellow-300">Zalecenie diagnostyczne:</span>
            <p className="mt-1">
              {activeScenario && solutionStatus?.solved
                ? `✓ Scenariusz "${activeScenario.title.slice(0, 30)}..." rozwiązany!`
                : analysis.isFourStroking
                ? "Silnik czterosuwuje na dużym otwarciu. Zmniejsz dyszę główną (MJ) o 2–4 kalibry."
                : analysis.isBoggingDown
                ? "Silnik dusi się z ubóstwa. Opuść klips iglicy w dół (wzbogać) lub daj większą dyszę główną."
                : analysis.condition === "optimal"
                ? "Skład optymalny dla maksymalnej mocy i czystego rezonansu 2T."
                : "Zestrojenie bezpieczne."}
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
}
