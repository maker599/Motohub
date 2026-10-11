"use client";

import { useMemo, useState } from "react";
import SiteNav from "../../SiteNav";
import FieldHelp from "../FieldHelp";
import ToolOverlay from "../ToolOverlay";
import CylinderModel, { type PortKey, type PortMillingPlan } from "./CylinderModel";
import PortProjection from "./PortProjection";

type GoalMode = "duration" | "area";
type Preset = "generic" | "am6-50" | "custom";
type CoolingType = "air" | "liquid";
type PortSetup = {
  roofHeight: number;
  chordAtRoof: number;
  chordAtBottom: number;
  chordAtTarget: number;
  portHeight: number;
  duration: number;
  targetOpeningArea: number;
  count: number;
  angularSpacing: number;
};
type Engine = { bore: number; stroke: number; rod: number; cylinders: number; deckClearance: number };
type VisualDimensions = { totalHeight: number; jacketDiameter: number; spigotDiameter: number; exhaustDuctDiameter: number; studDiagonal: number; studCount: number };

const PORTS: Array<{ key: PortKey; label: string; short: string }> = [
  { key: "wydech", label: "Wydech", short: "WYDECH" },
  { key: "transfer", label: "Transfer", short: "TRANSFER" },
  { key: "boost", label: "Aux / boost", short: "BOOST" },
];

const GENERIC_ENGINE: Engine = { bore: 54, stroke: 54, rod: 105, cylinders: 1, deckClearance: 0 };
const GENERIC_VISUAL: VisualDimensions = { totalHeight: 92, jacketDiameter: 68, spigotDiameter: 60, exhaustDuctDiameter: 28, studDiagonal: 78, studCount: 4 };
const GENERIC_PORTS: Record<PortKey, PortSetup> = {
  wydech: { roofHeight: 32.2, chordAtRoof: 32, chordAtBottom: 35, chordAtTarget: 33, portHeight: 20, duration: 190, targetOpeningArea: 800, count: 1, angularSpacing: 18 },
  transfer: { roofHeight: 43, chordAtRoof: 16, chordAtBottom: 19, chordAtTarget: 17, portHeight: 14, duration: 130, targetOpeningArea: 460, count: 2, angularSpacing: 56 },
  boost: { roofHeight: 42, chordAtRoof: 11, chordAtBottom: 13, chordAtTarget: 12, portHeight: 12, duration: 122, targetOpeningArea: 280, count: 1, angularSpacing: 28 },
};
const AM6_ENGINE: Engine = { bore: 40.3, stroke: 39, rod: 85, cylinders: 1, deckClearance: 0 };
const AM6_VISUAL: VisualDimensions = { totalHeight: 85, jacketDiameter: 68, spigotDiameter: 54, exhaustDuctDiameter: 26, studDiagonal: 74, studCount: 4 };
const AM6_PORTS: Record<PortKey, PortSetup> = {
  wydech: { roofHeight: 22.2, chordAtRoof: 25.5, chordAtBottom: 28, chordAtTarget: 26, portHeight: 18, duration: 192, targetOpeningArea: 596, count: 1, angularSpacing: 18 },
  transfer: { roofHeight: 34, chordAtRoof: 13, chordAtBottom: 16, chordAtTarget: 14, portHeight: 13, duration: 128, targetOpeningArea: 250, count: 2, angularSpacing: 56 },
  boost: { roofHeight: 33.5, chordAtRoof: 9, chordAtBottom: 10.5, chordAtTarget: 9.5, portHeight: 12, duration: 120, targetOpeningArea: 142, count: 3, angularSpacing: 36 },
};

const fmt = (value: number, digits = 2) => Number.isFinite(value)
  ? value.toLocaleString("pl-PL", { maximumFractionDigits: digits, minimumFractionDigits: digits })
  : "—";

function pistonDrop(angleDegrees: number, stroke: number, rodLength: number) {
  const radius = stroke / 2;
  const angle = angleDegrees * Math.PI / 180;
  const underRod = Math.max(0, rodLength ** 2 - (radius * Math.sin(angle)) ** 2);
  return radius * (1 - Math.cos(angle)) + rodLength - Math.sqrt(underRod);
}

function angleForDrop(drop: number, stroke: number, rodLength: number) {
  let low = 0;
  let high = 180;
  for (let iteration = 0; iteration < 64; iteration += 1) {
    const middle = (low + high) / 2;
    if (pistonDrop(middle, stroke, rodLength) < drop) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

function developedWidth(chord: number, bore: number) {
  return bore * Math.asin(chord / bore);
}

function meanDevelopedWidth(chordStart: number, chordEnd: number, bore: number) {
  const segments = 64;
  const step = 1 / segments;
  let sum = developedWidth(chordStart, bore) + developedWidth(chordEnd, bore);
  for (let index = 1; index < segments; index += 1) {
    const fraction = index / segments;
    const chord = chordStart + (chordEnd - chordStart) * fraction;
    sum += (index % 2 === 0 ? 2 : 4) * developedWidth(chord, bore);
  }
  return sum * step / 3;
}

function NumberField({
  id, label, unit, value, onChange, min = 0, max, step = "0.1", help,
}: {
  id: string; label: string; unit: string; value: number; onChange: (value: string) => void;
  min?: number; max?: number; step?: string; help: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 flex items-center justify-between gap-2 text-xs text-zinc-400">
        <span className="flex min-w-0 items-center">{label}<FieldHelp text={help} /></span><span className="shrink-0 text-zinc-600">{unit}</span>
      </span>
      <input id={id} type="number" inputMode="decimal" min={min} max={max} step={step} value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-400/60" />
    </label>
  );
}

export default function PortingStudio() {
  const [preset, setPreset] = useState<Preset>("generic");
  const [modelName, setModelName] = useState("Cylinder 2T · profil własny");
  const [liner, setLiner] = useState("iron");
  const [coolingType, setCoolingType] = useState<CoolingType>("liquid");
  const [engine, setEngine] = useState(GENERIC_ENGINE);
  const [visual, setVisual] = useState(GENERIC_VISUAL);
  const [ports, setPorts] = useState(GENERIC_PORTS);
  const [selected, setSelected] = useState<PortKey>("wydech");
  const [goalMode, setGoalMode] = useState<GoalMode>("duration");
  const [cutaway, setCutaway] = useState(true);
  const config = ports[selected];
  const portLabel = PORTS.find((port) => port.key === selected)?.label ?? "Port";
  const portPosition = selected === "wydech" ? "przód cylindra" : selected === "transfer" ? "boki cylindra" : "tył cylindra";

  const portPlans = useMemo<Record<PortKey, PortMillingPlan>>(() => {
    const planFor = (key: PortKey): PortMillingPlan => {
      const port = ports[key];
      const measurementsValid = Number.isFinite(engine.bore) && engine.bore > 0
        && Number.isFinite(engine.stroke) && engine.stroke > 0
        && Number.isFinite(engine.rod) && engine.rod > engine.stroke / 2
        && Number.isFinite(port.roofHeight) && Number.isFinite(port.portHeight) && port.portHeight > 0
        && Number.isFinite(port.chordAtRoof) && port.chordAtRoof > 0 && port.chordAtRoof <= engine.bore
        && Number.isFinite(port.chordAtBottom) && port.chordAtBottom > 0 && port.chordAtBottom <= engine.bore
        && Number.isFinite(port.chordAtTarget) && port.chordAtTarget > 0 && port.chordAtTarget <= engine.bore;
      if (!measurementsValid) return { targetRoof: port.roofHeight, cutDepth: 0 };

      let targetRoof: number;
      if (goalMode === "duration") {
        if (!Number.isFinite(port.duration) || port.duration <= 0 || port.duration >= 360) {
          return { targetRoof: port.roofHeight, cutDepth: 0 };
        }
        targetRoof = engine.deckClearance + pistonDrop((360 - port.duration) / 2, engine.stroke, engine.rod);
      } else {
        const existingMean = meanDevelopedWidth(port.chordAtRoof, port.chordAtBottom, engine.bore);
        const cutMean = meanDevelopedWidth(port.chordAtRoof, port.chordAtTarget, engine.bore);
        if (!Number.isFinite(port.targetOpeningArea) || port.targetOpeningArea <= 0 || cutMean <= 0) {
          return { targetRoof: port.roofHeight, cutDepth: 0 };
        }
        const existingArea = existingMean * port.portHeight;
        targetRoof = port.roofHeight - (port.targetOpeningArea - existingArea) / cutMean;
      }

      const cutDepth = port.roofHeight - targetRoof;
      const targetDrop = targetRoof - engine.deckClearance;
      if (!Number.isFinite(targetRoof) || targetDrop <= 0 || targetDrop > engine.stroke) {
        return { targetRoof: port.roofHeight, cutDepth: 0 };
      }
      return { targetRoof, cutDepth };
    };

    return {
      wydech: planFor("wydech"),
      transfer: planFor("transfer"),
      boost: planFor("boost"),
    };
  }, [engine, ports, goalMode]);

  const result = useMemo(() => {
    const errors: string[] = [];
    const finiteValues = [engine.bore, engine.stroke, engine.rod, engine.cylinders, engine.deckClearance,
      config.roofHeight, config.chordAtRoof, config.chordAtBottom, config.chordAtTarget, config.portHeight, config.duration,
      config.targetOpeningArea, config.count, config.angularSpacing];
    if (!finiteValues.every(Number.isFinite)) errors.push("Wszystkie pola muszą zawierać poprawne liczby.");
    if (engine.bore <= 0) errors.push("Średnica cylindra musi być większa od zera.");
    if (engine.stroke <= 0) errors.push("Skok tłoka musi być większy od zera.");
    if (engine.rod <= engine.stroke / 2) errors.push("Długość korbowodu musi być większa od promienia wykorbienia.");
    if (engine.cylinders <= 0 || !Number.isInteger(engine.cylinders)) errors.push("Liczba cylindrów musi być dodatnią liczbą całkowitą.");
    if (config.roofHeight <= engine.deckClearance) errors.push("Obecny dach musi znajdować się poniżej płaszczyzny tłoka w GMP.");
    if (config.roofHeight > engine.deckClearance + engine.stroke) errors.push("Obecny dach wypada poza zakresem skoku tłoka.");
    if (config.portHeight <= 0) errors.push("Wysokość istniejącego okna portu musi być większa od zera.");
    if (config.chordAtRoof <= 0 || config.chordAtRoof > engine.bore) errors.push("Obecna cięciwa musi być większa od 0 i nie większa od średnicy cylindra.");
    if (config.chordAtBottom <= 0 || config.chordAtBottom > engine.bore) errors.push("Cięciwa przy dolnej krawędzi musi być większa od 0 i nie większa od średnicy cylindra.");
    if (config.chordAtTarget <= 0 || config.chordAtTarget > engine.bore) errors.push("Docelowa cięciwa musi być większa od 0 i nie większa od średnicy cylindra.");
    if (config.count <= 0 || !Number.isInteger(config.count)) errors.push("Liczba jednakowych portów musi być dodatnią liczbą całkowitą.");
    if (config.angularSpacing <= 0 || config.angularSpacing > 180) errors.push("Odstęp kątowy portów musi mieścić się między 0° a 180°.");
    if (config.count > 1 && engine.bore > 0 && config.chordAtBottom > 0 && config.chordAtBottom <= engine.bore
      && config.angularSpacing <= 2 * Math.asin(config.chordAtBottom / engine.bore) * 180 / Math.PI) errors.push("Porty nachodzą na siebie przy podanym odstępie kątowym.");
    if (goalMode === "duration" && (config.duration <= 0 || config.duration >= 360)) errors.push("Czas otwarcia musi mieścić się między 0° a 360°.");
    if (goalMode === "area" && config.targetOpeningArea <= 0) errors.push("Docelowe pole okna musi być większe od zera.");

    const geometryInputsValid = errors.length === 0;
    const currentArc = engine.bore > 0 && config.chordAtRoof > 0 && config.chordAtRoof <= engine.bore
      ? developedWidth(config.chordAtRoof, engine.bore) : 0;
    const targetArc = engine.bore > 0 && config.chordAtTarget > 0 && config.chordAtTarget <= engine.bore
      ? developedWidth(config.chordAtTarget, engine.bore) : 0;
    const bottomArc = engine.bore > 0 && config.chordAtBottom > 0 && config.chordAtBottom <= engine.bore
      ? developedWidth(config.chordAtBottom, engine.bore) : 0;
    const cutMeanArc = engine.bore > 0 && config.chordAtRoof > 0 && config.chordAtRoof <= engine.bore
      && config.chordAtTarget > 0 && config.chordAtTarget <= engine.bore
      ? meanDevelopedWidth(config.chordAtRoof, config.chordAtTarget, engine.bore) : 0;
    const currentMeanArc = engine.bore > 0 && config.chordAtRoof > 0 && config.chordAtRoof <= engine.bore
      && config.chordAtBottom > 0 && config.chordAtBottom <= engine.bore
      ? meanDevelopedWidth(config.chordAtRoof, config.chordAtBottom, engine.bore) : 0;
    const currentAreaPerPort = currentMeanArc * config.portHeight;
    const currentAngle = geometryInputsValid
      ? angleForDrop(config.roofHeight - engine.deckClearance, engine.stroke, engine.rod) : 0;
    const currentDuration = 360 - 2 * currentAngle;
    const targetRoof = goalMode === "duration"
      ? engine.deckClearance + pistonDrop((360 - config.duration) / 2, engine.stroke, engine.rod)
      : config.roofHeight - (cutMeanArc > 0 ? (config.targetOpeningArea - currentAreaPerPort) / cutMeanArc : 0);
    const cutDepth = config.roofHeight - targetRoof;
    const targetDrop = targetRoof - engine.deckClearance;
    if (geometryInputsValid && (targetDrop <= 0 || targetDrop > engine.stroke)) errors.push("Wybrany cel wypada poza ruchem tłoka. Zmień timing albo pole okna.");
    if (geometryInputsValid && Math.max(currentArc, bottomArc) * config.count > Math.PI * engine.bore) errors.push("Łączna szerokość obecnych portów przekracza obwód cylindra.");
    if (geometryInputsValid && targetArc * config.count > Math.PI * engine.bore) errors.push("Łączna docelowa szerokość portów przekracza obwód cylindra.");

    const visualErrors: string[] = [];
    if (![visual.totalHeight, visual.jacketDiameter, visual.spigotDiameter, visual.exhaustDuctDiameter, visual.studDiagonal, visual.studCount].every(Number.isFinite)) visualErrors.push("Wymiary bryły 3D muszą być liczbami.");
    if (visual.totalHeight <= engine.stroke) visualErrors.push("Wysokość bryły 3D powinna być większa od skoku.");
    if (visual.jacketDiameter <= engine.bore || visual.spigotDiameter <= engine.bore) visualErrors.push("Średnice zewnętrzne modelu muszą być większe od średnicy tulei.");
    if (visual.exhaustDuctDiameter <= 0 || visual.exhaustDuctDiameter >= visual.jacketDiameter) visualErrors.push("Średnica kanału wydechowego musi być dodatnia i mniejsza od średnicy zewnętrznej płaszcza.");
    if (visual.studDiagonal <= 0) visualErrors.push("Rozstaw szpilek musi być większy od zera.");
    if (![4, 6, 8].includes(visual.studCount)) visualErrors.push("Wybierz układ 4, 6 lub 8 szpilek w modelu 3D.");

    const targetAngle = targetDrop > 0 && targetDrop <= engine.stroke && engine.rod > engine.stroke / 2
      ? angleForDrop(targetDrop, engine.stroke, engine.rod) : 0;
    const targetDuration = targetDrop > 0 && targetDrop <= engine.stroke ? 360 - 2 * targetAngle : 0;
    const areaRemovedPerPort = Math.max(0, cutDepth) * cutMeanArc;
    const openingAreaAfterPerPort = currentAreaPerPort + areaRemovedPerPort;
    const singleDisplacement = Math.PI / 4 * engine.bore ** 2 * engine.stroke / 1000;

    return {
      valid: errors.length === 0,
      errors,
      visualValid: visualErrors.length === 0,
      visualErrors,
      currentArc,
      bottomArc,
      targetArc,
      currentAreaPerPort,
      openingAreaAfterPerPort,
      areaRemovedPerPort,
      totalAreaRemoved: areaRemovedPerPort * config.count,
      totalOpeningAreaAfter: openingAreaAfterPerPort * config.count,
      targetRoof,
      cutDepth,
      currentDuration,
      targetDuration,
      singleDisplacement,
      totalDisplacement: singleDisplacement * engine.cylinders,
    };
  }, [engine, visual, config, goalMode]);

  const updateEngine = (key: keyof Engine, raw: string) => {
    const value = raw === "" ? 0 : Number(raw);
    setEngine((current) => ({ ...current, [key]: value }));
    setPreset("custom");
  };

  const updatePort = (key: keyof PortSetup, raw: string) => {
    const value = raw === "" ? 0 : Number(raw);
    setPorts((current) => ({ ...current, [selected]: { ...current[selected], [key]: value } }));
  };

  const updateVisual = (key: keyof VisualDimensions, raw: string) => {
    const value = raw === "" ? 0 : Number(raw);
    setVisual((current) => ({ ...current, [key]: value }));
    setPreset("custom");
  };

  const selectPreset = (value: Preset) => {
    setPreset(value);
    if (value === "am6-50") {
      setModelName("Minarelli AM6 · baza 50 cm³ · 40,3 × 39");
      setEngine(AM6_ENGINE);
      setVisual(AM6_VISUAL);
      setPorts(AM6_PORTS);
      setSelected("wydech");
      setLiner("iron");
      setCoolingType("liquid");
    } else if (value === "generic") {
      setModelName("Cylinder 2T · profil własny");
      setEngine(GENERIC_ENGINE);
      setVisual(GENERIC_VISUAL);
      setPorts(GENERIC_PORTS);
      setSelected("wydech");
      setLiner("unknown");
      setCoolingType("liquid");
    } else {
      setModelName("Własny cylinder 2T");
    }
  };

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-7xl px-5 py-5 lg:px-8">
        <SiteNav />
        <ToolOverlay active="porting" title="Porting kalkulator" description="Wybierz cylinder, wprowadź pomiary portu i określ cel. Symulator wyznaczy położenie nowego dachu oraz pokaże obszar obróbki na obracanym modelu 3D i rzutach wymiarowych."><div>{preset === "am6-50" ? <><b className="text-red-200">AM6 · profil referencyjny</b><br />Baza 40,3 × 39 mm i korbowód 85 mm pochodzą z danych zestawu/wału kompatybilnego z AM6. <span className="mt-2 block"><a className="underline decoration-red-300/40 underline-offset-2 hover:text-white" href="https://www.motorparts.it/documenti/pdf_libretti/ISTRUZIONI_9916770.pdf" target="_blank" rel="noreferrer">Instrukcja zestawu 50 cm³</a> · <a className="underline decoration-red-300/40 underline-offset-2 hover:text-white" href="https://stage6-racing.com/produkt/stage6-crankshaft-hpc-mk2-minarelli-am6/" target="_blank" rel="noreferrer">Dane wału Stage6</a></span><span className="mt-2 block text-zinc-400">Wymiary portów są przykładowe. Zweryfikuj wszystkie dane na swoim cylindrze.</span></> : <><b className="text-red-200">Uniwersalny profil 2T</b><br />Wprowadź zmierzone wymiary dowolnego cylindra, niezależnie od producenta, pojemności i rodzaju chłodzenia. Domyślne liczby są przykładową geometrią startową, nie specyfikacją części.</>}</div></ToolOverlay>

        <nav aria-label="Etapy konfiguracji portingu" className="mt-7 grid gap-2 sm:grid-cols-4">
          {[["01", "Cylinder"], ["02", "Pomiary"], ["03", "Cel"], ["04", "Plan obróbki"]].map(([number, label]) => <div key={number} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.025] px-3 py-2.5"><span className="font-mono text-xs text-cyan-300">{number}</span><span className="text-xs font-semibold text-zinc-300">{label}</span></div>)}
        </nav>

        <div className="mt-6 grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
              <div className="flex items-center justify-between gap-3"><h2 className="font-bold">01 · Jaki cylinder masz?</h2><button type="button" onClick={() => selectPreset("am6-50")} className="text-xs text-zinc-500 hover:text-white">Preset AM6</button></div>
              <label htmlFor="cylinder-profile" className="mt-4 block"><span className="mb-2 flex items-center text-xs text-zinc-400">Profil geometrii silnika<FieldHelp text="Wybierz gotowy zestaw startowy albo uniwersalny profil do wpisania własnych wymiarów. Preset nie zastępuje pomiarów konkretnego cylindra." /></span><select id="cylinder-profile" value={preset} onChange={(event) => selectPreset(event.target.value as Preset)} className="w-full rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60"><option value="generic">Uniwersalny cylinder 2T · własne wymiary</option><option value="am6-50">Minarelli AM6 · przykład referencyjny</option><option value="custom">Własny cylinder 2T · bieżące dane</option></select></label>
              <label htmlFor="cylinder-name" className="mt-4 block"><span className="mb-2 flex items-center text-xs text-zinc-400">Marka / model / oznaczenie cylindra<FieldHelp text="Nazwa wyłącznie opisuje konfigurację. Odczytaj ją z odlewu, pudełka lub dokumentacji producenta." /></span><input id="cylinder-name" value={modelName} onChange={(event) => { setModelName(event.target.value); setPreset("custom"); }} className="w-full rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60" /></label>
              <details className="mt-4 rounded-xl border border-white/10 bg-black/15 p-3">
                <summary className="cursor-pointer text-xs font-semibold text-zinc-300">Materiał i chłodzenie <span className="text-zinc-600">· opcjonalne</span></summary>
                <div className="mt-3 space-y-3">
                  <label htmlFor="cylinder-liner" className="block"><span className="mb-2 flex items-center text-xs text-zinc-400">Rodzaj tulei / powłoki<FieldHelp text="Wybierz materiał powierzchni cylindra. Rozpoznaj po dokumentacji lub oględzinach: żeliwo jest magnetyczne, a powłoka NiSi znajduje się na aluminiowym odlewie. Przy niepewności ustaw „Nie wiem”." /></span><select id="cylinder-liner" value={liner} onChange={(event) => setLiner(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60"><option value="nikasil">Aluminium · powłoka NiSi</option><option value="iron">Tuleja żeliwna</option><option value="unknown">Nie wiem / inny materiał</option></select></label>
                  <label htmlFor="cooling-type" className="block"><span className="mb-2 flex items-center text-xs text-zinc-400">Rodzaj chłodzenia<FieldHelp text="Żebra wskazują chłodzenie powietrzem, płaszcz i króćce — cieczą." /></span><select id="cooling-type" value={coolingType} onChange={(event) => { setCoolingType(event.target.value as CoolingType); setPreset("custom"); }} className="w-full rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60"><option value="liquid">Cieczą</option><option value="air">Powietrzem</option></select></label>
                </div>
              </details>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <NumberField id="engine-bore" label="Średnica zmierzona" unit="mm" min={1} step="0.01" value={engine.bore} onChange={(value) => updateEngine("bore", value)} help="Średnica robocza cylindra. Zmierz średnicówką w kilku kierunkach i na kilku wysokościach; przy kontroli tłoka uwzględnij wymagany luz montażowy." />
                <NumberField id="engine-stroke" label="Skok wału" unit="mm" min={1} step="0.01" value={engine.stroke} onChange={(value) => updateEngine("stroke", value)} help="Droga tłoka między GMP i DMP. Odczytaj dokumentację wału albo zmierz czujnikiem zegarowym ruch tłoka przy pełnym obrocie wału." />
                <NumberField id="engine-rod" label="Korbowód · osie" unit="mm" min={1} step="0.1" value={engine.rod} onChange={(value) => updateEngine("rod", value)} help="Długość między środkami sworznia tłoka i czopa korbowodu. Odczytaj specyfikację korbowodu lub zmierz na rozebranym wale przyrządem do pomiaru rozstawu osi." />
                <div className="col-span-2 text-[11px] leading-5 text-zinc-500">Pojemność: {fmt(Math.PI / 4 * engine.bore ** 2 * engine.stroke * engine.cylinders / 1000)} cm³</div>
              </div>
              <details className="mt-4 rounded-xl border border-white/10 bg-black/15 p-3">
                <summary className="cursor-pointer text-xs font-semibold text-zinc-300">Dodatkowe dane silnika <span className="text-zinc-600">· opcjonalne</span></summary>
                <div className="mt-3 space-y-3">
                  <NumberField id="engine-cylinders" label="Liczba cylindrów silnika" unit="szt." min={1} step="1" value={engine.cylinders} onChange={(value) => updateEngine("cylinders", value)} help="Liczba cylindrów pracujących w silniku. Odczytaj z konstrukcji silnika lub dokumentacji." />
                  <NumberField id="engine-deck" label="Luz tłoka względem płaszczyzny bloku w GMP" unit="mm" min={-5} max={10} step="0.01" value={engine.deckClearance} onChange={(value) => updateEngine("deckClearance", value)} help="Położenie denka tłoka względem płaszczyzny bloku w GMP; wartość dodatnia oznacza tłok poniżej bloku. Zmierz mostkiem pomiarowym i czujnikiem zegarowym albo sprawdź szczelinomierzem względem krawędzi pokładu." />
                </div>
              </details>
              <details className="mt-4 rounded-xl border border-white/10 bg-black/15 p-3">
                <summary className="cursor-pointer text-xs font-semibold text-zinc-300">Wymiary zewnętrzne bryły 3D <span className="text-zinc-600">· opcjonalne</span></summary>
                <p className="mt-2 text-[10px] leading-4 text-zinc-500">Zmieniają kształt wizualizacji, nie obliczenia timingu ani powierzchni portu. Średnica płaszcza 68 mm jest proporcją modelu; wpisz zmierzone wymiary swojego odlewu.</p>
                <div className="mt-3 space-y-3">
                  <NumberField id="visual-height" label="Wysokość całkowita dołu spigotu" unit="mm" min={1} step="0.1" value={visual.totalHeight} onChange={(value) => updateVisual("totalHeight", value)} help="Wysokość modelowanej części cylindra od płaszczyzny głowicy do końca spigotu. Zmierz suwmiarką lub głębokościomierzem na cylindrze." />
                  <NumberField id="visual-jacket" label="Średnica zewnętrzna płaszcza" unit="mm" min={1} step="0.1" value={visual.jacketDiameter} onChange={(value) => updateVisual("jacketDiameter", value)} help="Największa średnica zewnętrzna płaszcza lub żebrowania. Zmierz suwmiarką w najszerszym miejscu." />
                  <NumberField id="visual-spigot" label="Średnica zewnętrzna spigotu" unit="mm" min={1} step="0.1" value={visual.spigotDiameter} onChange={(value) => updateVisual("spigotDiameter", value)} help="Średnica dolnego kołnierza wsuwanego w karter. Zmierz suwmiarką zewnętrzną w kilku kierunkach." />
                  <NumberField id="visual-studs" label="Rozstaw szpilek po przekątnej" unit="mm" min={1} step="0.1" value={visual.studDiagonal} onChange={(value) => updateVisual("studDiagonal", value)} help="Odległość między środkami przeciwległych otworów/szpilek głowicy po przekątnej. Zmierz od osi do osi; przy pomiarze krawędzi dodaj średnicę jednego otworu." />
                  <label htmlFor="visual-stud-count" className="block"><span className="mb-2 flex items-center text-xs text-zinc-400">Układ szpilek głowicy<FieldHelp text="Wybierz liczbę szpilek lub śrub mocujących głowicę. Policz pozycje na płaszczyźnie cylindra albo sprawdź dokumentację." /></span><select id="visual-stud-count" value={visual.studCount} onChange={(event) => updateVisual("studCount", event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60"><option value={4}>4 szpilki</option><option value={6}>6 szpilek</option><option value={8}>8 szpilek</option></select></label>
                </div>
                <a href="https://gmoto.pt/cilindro-de-ceramica-minarelli-am6-50-cm3-liquido%2C81540.html" target="_blank" rel="noreferrer" className="mt-3 inline-block text-[10px] text-cyan-200/70 underline decoration-cyan-200/20 underline-offset-2 hover:text-cyan-100">Wymiary przykładowego zestawu AM6 50 cm³</a>
              </details>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
              <div className="flex items-center justify-between gap-3"><h2 className="font-bold">02 · Jakie są pomiary?</h2><span className="rounded-full border border-cyan-300/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200">{PORTS.find((port) => port.key === selected)?.short}</span></div>
              <div className="mt-4 grid grid-cols-3 gap-2" role="group" aria-label="Wybierz rodzaj portu cylindra">
                {PORTS.map((port) => <button key={port.key} type="button" title={port.key === "wydech" ? "Okno wydechowe: łączy cylinder z kanałem i komorą rezonansową." : port.key === "transfer" ? "Okna transferowe: doprowadzają świeży ładunek z karteru do cylindra." : "Okno boost: dodatkowy kanał transferowy skierowany ku tylnej części cylindra."} aria-pressed={selected === port.key} onClick={() => setSelected(port.key)} className={`rounded-xl border px-2 py-2.5 text-[11px] font-semibold transition ${selected === port.key ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100" : "border-white/10 text-zinc-500 hover:text-white"}`}>{port.label}</button>)}
              </div>
              <div className="mt-4 space-y-4">
                <NumberField id="port-roof" label="Obecny dach od płaszczyzny bloku" unit="mm" min={0} step="0.01" value={config.roofHeight} onChange={(value) => updatePort("roofHeight", value)} help="Odległość od płaszczyzny bloku/cylindra do górnej krawędzi okna, mierzona równolegle do osi cylindra. Zdejmij cylinder i zmierz głębokościomierzem lub suwmiarką głębokościową." />
                <NumberField id="port-chord" label="Szerokość cięciwy przy obecnym dachu" unit="mm" min={0} step="0.01" value={config.chordAtRoof} onChange={(value) => updatePort("chordAtRoof", value)} help="Prosta szerokość okna na jego górnej krawędzi, od lewej do prawej krawędzi. Zmierz małą suwmiarką; nie mierz po łuku tulei." />
                <NumberField id="port-height" label="Wysokość okna do dolnej krawędzi" unit="mm" min={0} step="0.01" value={config.portHeight} onChange={(value) => updatePort("portHeight", value)} help="Odległość osiowa od dachu portu do jego dolnej krawędzi. Zmierz głębokościomierzem lub suwmiarką od górnej do najniższej krawędzi okna." />
                <details className="rounded-xl border border-white/10 bg-black/15 p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-zinc-300">Pozostałe wymiary portu <span className="text-zinc-600">· opcjonalne</span></summary>
                  <div className="mt-3 space-y-3">
                    <NumberField id="port-bottom-chord" label="Szerokość dolnej krawędzi" unit="mm" min={0} step="0.01" value={config.chordAtBottom} onChange={(value) => updatePort("chordAtBottom", value)} help="Prosta szerokość dolnej krawędzi okna. Zmierz suwmiarką na cylindrze; dla kształtu nieregularnego zmierz w kilku punktach i wpisz szerokość w najniższej krawędzi." />
                    <NumberField id="port-target-chord" label="Docelowa szerokość dachu" unit="mm" min={0} step="0.01" value={config.chordAtTarget} onChange={(value) => updatePort("chordAtTarget", value)} help="Docelowa prosta szerokość nowego dachu okna po obróbce. Ustal na podstawie projektu/rozwinięcia i sprawdź szablonem na tulei. Nie przekraczaj bezpiecznej szerokości dla mostka i pierścienia." />
                    <NumberField id="port-count" label="Liczba jednakowych okien" unit="szt." min={1} step="1" value={config.count} onChange={(value) => updatePort("count", value)} help="Liczba jednakowych okien tego typu dookoła tulei. Policz je na cylindrze; każde okno wprowadź jako tę samą geometrię." />
                    <NumberField id="port-angle-spacing" label="Odstęp między oknami" unit="° obwodu" min={0.1} max={180} step="0.1" value={config.angularSpacing} onChange={(value) => updatePort("angularSpacing", value)} help="Kąt na obwodzie między osiami sąsiednich okien. Zmierz kątomierzem na rozwiniętym szablonie obwodu cylindra albo wylicz z odległości łukowej: kąt = 360° × łuk / (π × bore)." />
                    {selected === "wydech" && <NumberField id="exhaust-duct-diameter" label="Średnica kanału wydechowego" unit="mm" min={1} step="0.1" value={visual.exhaustDuctDiameter} onChange={(value) => updateVisual("exhaustDuctDiameter", value)} help="Średnica okrągłego kanału, którym spaliny wychodzą na zewnątrz cylindra. Zmierz średnicę wewnętrzną kanału/króćca suwmiarką wewnętrzną w kilku kierunkach; podaj wymiar przelotu, nie średnicę zewnętrznej flanszy." />}
                  </div>
                </details>
              </div>
              <p className="mt-4 text-[11px] leading-5 text-zinc-500">Mierz wymiary na cylindrze po zdjęciu i oczyszczeniu. Podaj cięciwy, liczbę okien i odstęp kątowy. Model interpoluje profil i odwzorowuje rozkład portów na obwodzie tulei.</p>
            </section>

            <section className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[.035] p-5">
              <h2 className="font-bold">03 · Co chcesz osiągnąć?</h2>
              <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Wybierz cel portingu">
                <button type="button" title="Oblicza położenie dachu z zadanego czasu otwarcia i kinematyki wału." aria-pressed={goalMode === "duration"} onClick={() => setGoalMode("duration")} className={`rounded-xl border p-3 text-left transition ${goalMode === "duration" ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 hover:border-white/20"}`}><b className="block text-xs">Czas otwarcia</b><span className="mt-1 block text-[10px] leading-4 text-zinc-500">wyznacz położenie dachu</span></button>
                <button type="button" title="Oblicza przesunięcie dachu potrzebne do uzyskania zadanego pola pojedynczego okna." aria-pressed={goalMode === "area"} onClick={() => setGoalMode("area")} className={`rounded-xl border p-3 text-left transition ${goalMode === "area" ? "border-cyan-300/40 bg-cyan-300/10" : "border-white/10 hover:border-white/20"}`}><b className="block text-xs">Pole okna portu</b><span className="mt-1 block text-[10px] leading-4 text-zinc-500">wyznacz zmianę powierzchni</span></button>
              </div>
              <div className="mt-4">
                {goalMode === "duration"
                  ? <NumberField id="port-duration" label="Docelowy czas otwarcia" unit="° wału" min={1} max={359} step="0.1" value={config.duration} onChange={(value) => updatePort("duration", value)} help="Docelowy czas, przez który port pozostaje otwarty podczas obrotu wału. Odczytaj z projektu tuningu lub zmierz tarczą stopniową przy GMP i czujnikiem zegarowym; model zakłada symetrię względem GMP." />
                  : <NumberField id="port-target-area" label="Docelowe pole okna po zmianie" unit="mm² / port" min={1} step="1" value={config.targetOpeningArea} onChange={(value) => updatePort("targetOpeningArea", value)} help="Docelowe geometryczne pole pojedynczego okna. Odczytaj z projektu albo oszacuj na rozwiniętym szablonie: podziel okno na wąskie pasy i zsumuj ich szerokość × wysokość. To nie jest pole przekroju kanału." />}
              </div>
              <p className="mt-3 text-[11px] leading-5 text-zinc-500">To jest cel wpisany przez Ciebie, nie automatyczna rekomendacja dla silnika. Sam timing albo pole okna nie przewidują mocy ani bezpiecznej grubości ścianki.</p>
            </section>
          </aside>

          <section className="min-w-0 space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
              {[
                ["Pojemność · jeden cylinder", result.valid ? `${fmt(result.singleDisplacement)} cm³` : "—"],
                ["Pojemność całkowita", result.valid ? `${fmt(result.totalDisplacement)} cm³` : "—"],
                ["Timing obecny · model", result.valid ? `${fmt(result.currentDuration, 1)}°` : "—"],
                ["Timing po obróbce", result.valid ? `${fmt(result.targetDuration, 1)}°` : "—"],
                ["Docelowy dach od bloku", result.valid ? `${fmt(result.targetRoof)} mm` : "—"],
                ["Pole do zebrania · łącznie", result.valid ? `${fmt(result.totalAreaRemoved)} mm²` : "—"],
              ].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs text-zinc-500">{label}</p><p className="mt-2 text-xl font-black tabular-nums">{value}</p></div>)}
            </div>

            {!result.valid && <div role="alert" className="rounded-2xl border border-amber-400/25 bg-amber-400/[.06] p-4 text-sm leading-6 text-amber-100">{result.errors.map((error) => <p key={error}>{error}</p>)}</div>}
            {result.valid && result.cutDepth > 0 && <div role="status" className="rounded-2xl border border-red-400/25 bg-red-400/[.06] p-4 text-sm leading-6 text-red-100"><b>Plan przewiduje zebranie materiału:</b> dach przesuwa się o {fmt(result.cutDepth)} mm w stronę płaszczyzny bloku. Pole czerwone na modelu i rzutach oznacza ścianę portu objętą zmianą.</div>}
            {result.valid && result.cutDepth === 0 && <div role="status" className="rounded-2xl border border-white/10 bg-white/[.04] p-4 text-sm leading-6 text-zinc-300">Zadany cel odpowiada obecnej geometrii. Model nie wskazuje pola do zebrania.</div>}
            {result.valid && result.cutDepth < 0 && <div role="status" className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[.05] p-4 text-sm leading-6 text-cyan-100"><b>Frezowanie nie osiągnie tego celu.</b> Wymagane byłoby obniżenie dachu o {fmt(Math.abs(result.cutDepth))} mm lub odbudowanie materiału; kalkulator nie zaznacza tego jako skrawania.</div>}

            <section className="rounded-3xl border border-white/10 bg-white/[.025] p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 px-2 pb-3">
                <div><p className="text-xs font-black uppercase tracking-[.2em] text-zinc-500">Model bryły i przekroju</p><h2 className="mt-1 text-lg font-bold">{modelName}</h2></div>
                <div className="flex rounded-xl border border-white/10 bg-black/30 p-1" role="group" aria-label="Tryb wizualizacji cylindra">
                  <button type="button" aria-pressed={cutaway} onClick={() => setCutaway(true)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${cutaway ? "bg-cyan-300/15 text-cyan-100" : "text-zinc-500 hover:text-white"}`}>Przekrój portów</button>
                  <button type="button" aria-pressed={!cutaway} onClick={() => setCutaway(false)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${!cutaway ? "bg-cyan-300/15 text-cyan-100" : "text-zinc-500 hover:text-white"}`}>Bryła zewnętrzna</button>
                </div>
              </div>
              <div className="mb-3 space-y-2 px-2 text-[11px] text-zinc-400">
                <div className="flex flex-wrap gap-x-4 gap-y-1"><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />Wydech · przód</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-sky-400" />Transfery · boki</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-violet-400" />Boost · tył</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-red-500" />Czerwone · frezowanie</span></div>
                <p className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-zinc-300">Aktywny port: <b className="text-white">{portLabel} · {portPosition}</b>{result.cutDepth > 0.005 ? <span className="text-red-200"> · frezuj dach {fmt(result.cutDepth)} mm w górę, ku blokowi</span> : result.cutDepth < -0.005 ? <span className="text-amber-200"> · cel wymaga obniżenia dachu {fmt(Math.abs(result.cutDepth))} mm</span> : <span> · brak materiału do zebrania</span>}</p>
                {selected === "wydech" && <p className="text-[10px] text-zinc-500">Kanał wydechowy: Ø {fmt(visual.exhaustDuctDiameter)} mm</p>}
              </div>
              {result.valid && result.visualValid && <CylinderModel modelName={modelName} bore={engine.bore} portKey={selected} portLabel={portLabel} portLayouts={ports} portPlans={portPlans} roofHeight={config.roofHeight} targetRoof={result.targetRoof} portHeight={config.portHeight} currentChord={config.chordAtRoof} bottomChord={config.chordAtBottom} targetChord={config.chordAtTarget} count={config.count} angularSpacing={config.angularSpacing} cutaway={cutaway} coolingType={coolingType} totalHeight={visual.totalHeight} jacketDiameter={visual.jacketDiameter} spigotDiameter={visual.spigotDiameter} exhaustDuctDiameter={visual.exhaustDuctDiameter} studDiagonal={visual.studDiagonal} studCount={visual.studCount} />}
              {result.valid && !result.visualValid && <div role="alert" className="flex min-h-[430px] items-center justify-center rounded-2xl border border-dashed border-amber-300/20 bg-black/20 p-8 text-center text-sm text-amber-100">Obliczenia portingu są dostępne, ale popraw wymiary zewnętrzne w sekcji „Wymiary zewnętrzne bryły 3D”, aby zbudować model.</div>}
              {!result.valid && <div className="flex min-h-[430px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-sm text-zinc-500">Popraw pomiary po lewej, aby wyświetlić model zgodny z wpisaną geometrią.</div>}
            </section>

            {result.valid && <PortProjection currentArc={result.currentArc} bottomArc={result.bottomArc} targetArc={result.targetArc} cutDepth={result.cutDepth} currentRoof={config.roofHeight} targetRoof={result.targetRoof} portHeight={config.portHeight} count={config.count} />}

            <section className="rounded-3xl border border-red-400/20 bg-gradient-to-br from-red-400/[.07] to-white/[.02] p-5 sm:p-6">
              <p className="text-[10px] font-black uppercase tracking-[.25em] text-red-300">04 · Plan obróbki</p>
              <h2 className="mt-2 text-2xl font-black">Wymiary dla: {portLabel.toLowerCase()}</h2>
              {result.valid ? <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Wynik z modelu</p>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-3"><dt className="text-zinc-500">Punkt odniesienia</dt><dd className="text-right">płaszczyzna bloku</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-zinc-500">Obecny dach</dt><dd className="font-mono">{fmt(config.roofHeight)} mm</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-zinc-500">Dach docelowy</dt><dd className="font-mono">{fmt(result.targetRoof)} mm</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-zinc-500">Przesunięcie dachu</dt><dd className="font-mono">{fmt(result.cutDepth)} mm</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-zinc-500">Cięciwa obecna → docelowa</dt><dd className="font-mono text-right">{fmt(config.chordAtRoof)} → {fmt(config.chordAtTarget)} mm</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-zinc-500">Łuk tulei przy dachu</dt><dd className="font-mono">{fmt(result.currentArc)} → {fmt(result.targetArc)} mm</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-zinc-500">Cięciwa dolnej krawędzi</dt><dd className="font-mono">{fmt(config.chordAtBottom)} mm</dd></div>
                    <div className="flex justify-between gap-3 border-t border-white/10 pt-3"><dt className="text-zinc-300">Pole do zebrania</dt><dd className="font-mono font-bold">{fmt(result.areaRemovedPerPort)} × {config.count} = {fmt(result.totalAreaRemoved)} mm²</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-zinc-500">Pole okna po zmianie</dt><dd className="font-mono">{fmt(result.openingAreaAfterPerPort)} mm² / port</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-zinc-500">Timing wynikowy</dt><dd className="font-mono">{fmt(result.targetDuration, 1)}° wału</dd></div>
                  </dl>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Kolejność prac</p>
                  <ol className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
                    <li className="flex gap-3"><span className="font-mono text-red-300">01</span><span>Ustal bazę na płaszczyźnie bloku i zaznacz dach na {fmt(result.targetRoof)} mm. Wartość odnosi się do osi cylindra, nie do powierzchni głowicy.</span></li>
                    <li className="flex gap-3"><span className="font-mono text-red-300">02</span><span>Model przewiduje podniesienie krawędzi o {fmt(Math.max(0, result.cutDepth))} mm. Uformuj dach o cięciwie {fmt(config.chordAtTarget)} mm i płynne przejście do obecnego dachu {fmt(config.chordAtRoof)} mm; istniejący profil prowadzi dalej do cięciwy dolnej {fmt(config.chordAtBottom)} mm.</span></li>
                    <li className="flex gap-3"><span className="font-mono text-red-300">03</span><span>Pole ściany do obróbki wynosi {fmt(result.areaRemovedPerPort)} mm² na port. Przy {config.count} jednakowych portach suma to {fmt(result.totalAreaRemoved)} mm².</span></li>
                    <li className="flex gap-3"><span className="font-mono text-red-300">04</span><span>Po obróbce zmierz timing tarczą stopniową i sprawdź krawędzie pod kątem zaczepiania pierścienia. Nie zmieniaj dolnej krawędzi okna, jeśli cel jej nie obejmuje.</span></li>
                  </ol>
                </div>
              </div> : <p className="mt-3 text-sm text-zinc-400">Uzupełnij poprawne wymiary, aby wygenerować plan.</p>}
              <div className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/[.04] p-3 text-xs leading-5 text-amber-100/75">Plan opisuje krawędź dachu i pole ściany przy przyjętym profilu. Przed skrawaniem sprawdź mapę kanałów wodnych, grubość tulei w kilku punktach i powłokę. Szczególnie przy {liner === "nikasil" ? "powłoce NiSi" : liner === "iron" ? "tulei żeliwnej" : "nieznanym materiale"} sam wynik nie potwierdza, że cylinder ma bezpieczny zapas materiału.</div>
            </section>

            <details className="group rounded-3xl border border-white/10 bg-black/20 p-5">
              <summary className="cursor-pointer list-none font-bold">Dane wejściowe, równania i granice modelu <span className="float-right text-zinc-500 group-open:rotate-180">⌄</span></summary>
              <div className="mt-4 grid gap-5 text-xs leading-5 text-zinc-400 lg:grid-cols-3">
                <div><h3 className="font-bold text-zinc-200">Wymagane pomiary</h3><p className="mt-2">Średnica tulei, skok, długość korbowodu, luz tłoka w GMP, wysokość dachu portu, szerokość cięciwy, wysokość okna i liczba portów. Dla innego cylindra zmień preset i wpisz dane konkretnego zestawu.</p></div>
                <div><h3 className="font-bold text-zinc-200">Kinematyka i powierzchnia</h3><p className="mt-2">Położenie tłoka x(θ) = r(1 − cos θ) + L − √(L² − r² sin² θ). Łuk tulei s = B · asin(c / B). Szerokość interpolowana jest liniowo między cięciwami dachu i dolnej krawędzi; średnią szerokość łukową całkuje metoda Simpsona (64 przedziały).</p></div>
                <div><h3 className="font-bold text-zinc-200">Założenia</h3><p className="mt-2">Timing jest symetryczny względem GMP. Dach traktowany jest jako prosta krawędź, a szerokość zmienia się liniowo. Bryła 3D to obracalny model poglądowy z wymiarami zewnętrznymi, nie skan konkretnego odlewu ani CAM; nie odtwarza promieni naroży ani dokładnej mapy płaszcza wodnego.</p></div>
              </div>
            </details>
          </section>
        </div>
      </div>
    </main>
  );
}

