"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ToolOverlay from "../ToolOverlay";
import { derbiCylinders, derbiDefaultPartsByGoal, derbiPartCatalog, derbiRecommendedCylinder, derbiSpecialCrankByCylinder } from "../derbiCatalog";
import {
  categoryLabels,
  categoryOrder,
  cylinders,
  defaultPartsByGoal,
  goals,
  goalsByTier,
  partCatalog,
  tierLabels,
  tierRank,
  type PartCategory,
  type SetupEngine,
  type SetupGoal,
  type Tier,
} from "../setupCatalog";

const steps = ["Silnik i cel", "Cylinder", "Osprzęt", "Podsumowanie"];
const DEFAULT_EUR_PLN = 4.3775;
const fmtEuro = (amount: number) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "EUR", maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
const fmtZloty = (amount: number) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(amount);
const fmtPrice = (amount: number, exchangeRate: number) => `${fmtZloty(amount * exchangeRate)} · ${fmtEuro(amount)}`;
const fmtRange = (range: [number, number]) => `${range[0]}–${range[1]}`;

/** Mapowanie gaźnika z katalogu na parametry CarbState (przybliżenie) */
function carbPresetFromPartId(carbId: string, displacement: number): Record<string, unknown> {
  const carbMap: Record<string, Record<string, unknown>> = {
    "keep-carb":          { boreDiameter: 17, mainJet: 78, pilotJet: 42, needleClip: 3, mixtureScrewTurns: 1.5, mixtureScrewType: "air" },
    "motoforce-phbg19":   { boreDiameter: 19, mainJet: 85, pilotJet: 45, needleClip: 3, mixtureScrewTurns: 1.5, mixtureScrewType: "air" },
    "dellorto-21":        { boreDiameter: 21, mainJet: 92, pilotJet: 48, needleClip: 3, mixtureScrewTurns: 1.75, mixtureScrewType: "air" },
    "dellorto-phbg19-ds": { boreDiameter: 19, mainJet: 85, pilotJet: 45, needleClip: 3, mixtureScrewTurns: 1.5, mixtureScrewType: "air" },
    "dellorto-phbg21-ds": { boreDiameter: 21, mainJet: 92, pilotJet: 48, needleClip: 3, mixtureScrewTurns: 1.75, mixtureScrewType: "air" },
    "motoforce-pwk24":    { boreDiameter: 24, mainJet: 105, pilotJet: 38, needleClip: 3, mixtureScrewTurns: 1.5, mixtureScrewType: "fuel" },
    "stage6-pwk28":       { boreDiameter: 28, mainJet: 122, pilotJet: 42, needleClip: 3, mixtureScrewTurns: 1.5, mixtureScrewType: "fuel" },
    "mikuni-tm24":        { boreDiameter: 24, mainJet: 108, pilotJet: 40, needleClip: 3, mixtureScrewTurns: 1.5, mixtureScrewType: "fuel" },
    "polini-cp19":        { boreDiameter: 19, mainJet: 84, pilotJet: 44, needleClip: 3, mixtureScrewTurns: 1.5, mixtureScrewType: "air" },
    "keihin-pe28":        { boreDiameter: 28, mainJet: 120, pilotJet: 42, needleClip: 3, mixtureScrewTurns: 1.5, mixtureScrewType: "fuel" },
  };
  const base = carbMap[carbId] ?? carbMap["motoforce-phbg19"];
  // Skalowanie dyszy głównej do pojemności
  const dispScale = Math.max(0.85, Math.min(1.4, displacement / 70));
  return { ...base, mainJet: Math.round((base.mainJet as number) * dispScale), displacementCc: displacement };
}


function getDefaults(engine: SetupEngine, goal: SetupGoal) {
  if (engine === "Minarelli AM6") return defaultPartsByGoal[goal];
  const defaults = derbiDefaultPartsByGoal[goal];
  return engine === "Derbi D50B1" && goal === "track" ? { ...defaults, ignition: "derbi-mvt-dd-e4" } : defaults;
}

function cylinderIdFor(engine: SetupEngine, goal: SetupGoal) {
  return engine === "Minarelli AM6" ? goals.find((item) => item.id === goal)?.recommendedCylinder ?? cylinders[0].id : derbiRecommendedCylinder[goal];
}

function partsForCylinder(engine: SetupEngine, cylinder: (typeof cylinders)[number] | (typeof derbiCylinders)[number]) {
  const defaults = getDefaults(engine, goalsByTier[cylinder.tier]);
  const exhaustByCylinder: Record<string, string> = {
    "derbi-2fast70": "derbi-2fast70-exhaust",
    "derbi-streetrace88": "derbi-yasuni-r3",
    "derbi-bigracing88": "derbi-yasuni-r3",
    "derbi-mvt-iron90": "derbi-rt-exhaust90",
    "derbi-rt95": "derbi-rt-exhaust90",
    "derbi-bidalot90": "derbi-rt-exhaust90",
    "derbi-2fast100": "derbi-rt-exhaust90",
  };
  const specialCrank = cylinder.recommendedCrankshaft ?? (engine === "Minarelli AM6" ? undefined : derbiSpecialCrankByCylinder[cylinder.id]);
  const specialExhaust = cylinder.recommendedExhaust ?? (engine === "Minarelli AM6" ? undefined : exhaustByCylinder[cylinder.id]);
  return {
    ...defaults,
    ...(specialCrank ? { crankshaft: specialCrank } : {}),
    ...(cylinder.recommendedBearings ? { bearings: cylinder.recommendedBearings } : {}),
    ...(specialExhaust ? { exhaust: specialExhaust } : {}),
  };
}

function SetupFlowDiagram() {
  const steps = [
    { x: 62, title: "Filtr", sub: "powietrze" },
    { x: 184, title: "Gaźnik", sub: "paliwo + powietrze" },
    { x: 306, title: "Membrana", sub: "jednokierunkowo" },
    { x: 428, title: "Skrzynia", sub: "sprężanie wstępne" },
    { x: 550, title: "Cylinder", sub: "spalanie" },
    { x: 672, title: "Wydech", sub: "fala rezonansowa" },
  ];

  return (
    <section className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-300">Schemat 2T</p><h3 className="mt-1 text-sm font-bold">Jak współpracują części</h3></div>
        <span className="text-[10px] text-zinc-500">przepływ mieszanki i spalin</span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <svg viewBox="0 0 734 142" role="img" aria-labelledby="setup-flow-title setup-flow-desc" className="min-w-[680px] w-full">
          <title id="setup-flow-title">Schemat przepływu w silniku dwusuwowym</title>
          <desc id="setup-flow-desc">Powietrze przechodzi przez filtr, gaźnik i membranę do skrzyni korbowej i cylindra, a spaliny wychodzą przez wydech.</desc>
          <defs><marker id="setup-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#f87171" /></marker></defs>
          {steps.slice(0, -1).map((node, index) => <line key={node.title} x1={node.x + 29} y1="48" x2={steps[index + 1].x - 30} y2="48" stroke="#f87171" strokeWidth="2" strokeDasharray={index === 4 ? "5 4" : undefined} markerEnd="url(#setup-arrow)" />)}
          {steps.map((node, index) => (
            <g key={node.title}>
              <circle cx={node.x} cy="48" r="25" fill={index === 4 ? "#292524" : "#151515"} stroke={index === 4 ? "#a1a1aa" : "#52525b"} strokeWidth="2" />
              {index === 0 && <><path d={`M${node.x - 10} 42h20M${node.x - 10} 48h20M${node.x - 10} 54h20`} stroke="#d4d4d8" strokeWidth="2" /></>}
              {index === 1 && <><path d={`M${node.x - 7} 34v18q0 7 7 7t7-7V34M${node.x} 59v5`} fill="none" stroke="#d4d4d8" strokeWidth="2" /><circle cx={node.x} cy="48" r="3" fill="#f87171" /></>}
              {index === 2 && <><path d={`M${node.x - 11} 38h22v20h-22zM${node.x - 8} 41l6 7-6 7M${node.x + 8} 41l-6 7 6 7`} fill="none" stroke="#d4d4d8" strokeWidth="1.6" /></>}
              {index === 3 && <><path d={`M${node.x - 13} 46a13 9 0 1 0 26 0a13 9 0 1 0-26 0M${node.x} 46l8 5m-8-5-3-8`} fill="none" stroke="#d4d4d8" strokeWidth="2" /><circle cx={node.x} cy="46" r="3" fill="#f87171" /></>}
              {index === 4 && <><path d={`M${node.x - 10} 58V37h20v21M${node.x - 7} 35h14M${node.x} 40v10m-6-3h12`} fill="none" stroke="#e4e4e7" strokeWidth="2" /><path d={`M${node.x} 50v8`} stroke="#f87171" strokeWidth="2" /></>}
              {index === 5 && <><path d={`M${node.x - 14} 40h10q5 0 5 5v7q0 8 8 8h7`} fill="none" stroke="#d4d4d8" strokeWidth="4" strokeLinecap="round" /><path d={`M${node.x + 12} 56l7 4-7 4`} fill="none" stroke="#f87171" strokeWidth="2" /></>}
              <text x={node.x} y="91" textAnchor="middle" fill="#e4e4e7" fontSize="11" fontWeight="700">{node.title}</text>
              <text x={node.x} y="107" textAnchor="middle" fill="#71717a" fontSize="9">{node.sub}</text>
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-2 text-[10px] leading-4 text-zinc-600">Schemat poglądowy. Rzeczywiste kanały i kierunki przepływu zależą od konstrukcji cylindra.</p>
    </section>
  );
}

export default function SetupBuilder() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<SetupGoal>("sport");
  const [tierFilter, setTierFilter] = useState<Tier | "all">("all");
  const [engine, setEngine] = useState<SetupEngine>("Minarelli AM6");
  const [bike, setBike] = useState("");
  const [year, setYear] = useState("");
  const [eurPlnInput, setEurPlnInput] = useState(String(DEFAULT_EUR_PLN));
  const [cylinderId, setCylinderId] = useState(cylinderIdFor("Minarelli AM6", "sport"));
  const [partSelection, setPartSelection] = useState<Record<PartCategory, string>>(defaultPartsByGoal.sport);
  const [setupName, setSetupName] = useState("");
  const [authStatus, setAuthStatus] = useState<"checking" | "guest" | "signed-in">("checking");
  const [saveStatus, setSaveStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => { if (active) setAuthStatus(data.user ? "signed-in" : "guest"); })
      .catch(() => { if (active) setAuthStatus("guest"); });
    return () => { active = false; };
  }, []);

  const isDerbi = engine !== "Minarelli AM6";
  const currentCylinders = (isDerbi ? derbiCylinders : cylinders).filter((item) => !item.compatibleEngines || item.compatibleEngines.includes(engine));
  const currentPartCatalog = isDerbi ? derbiPartCatalog : partCatalog;
  const recommendedCylinderId = cylinderIdFor(engine, goal);
  const selectedCylinder = currentCylinders.find((item) => item.id === cylinderId) ?? currentCylinders.find((item) => item.id === recommendedCylinderId) ?? currentCylinders[0];
  const parsedRate = Number.parseFloat(eurPlnInput.replace(",", "."));
  const exchangeRate = Number.isFinite(parsedRate) && parsedRate > 0 ? parsedRate : DEFAULT_EUR_PLN;
  const chosenParts = useMemo(() => Object.fromEntries(
    categoryOrder.map((category) => [category, currentPartCatalog[category].find((part) => part.id === partSelection[category]) ?? currentPartCatalog[category][0]]),
  ) as Record<PartCategory, (typeof partCatalog)[PartCategory][number]>, [partSelection, currentPartCatalog]);
  const total = selectedCylinder.priceEur + categoryOrder.reduce((sum, category) => sum + chosenParts[category].priceEur, 0);
  const sortedCylinders = [...currentCylinders].sort((a, b) => Number(b.id === recommendedCylinderId) - Number(a.id === recommendedCylinderId) || a.priceEur - b.priceEur);
  const visibleCylinders = tierFilter === "all" ? sortedCylinders : sortedCylinders.filter((item) => item.tier === tierFilter);
  const cylinderTier = tierRank[selectedCylinder.tier];
  const warnings: string[] = [];

  if (cylinderTier >= 2 && chosenParts.crankshaft.keepExisting) warnings.push("Wybrany cylinder racing/high-end: przed montażem zweryfikuj wał, korbowód i łożyska; katalog zaleca wzmocniony wał.");
  if (cylinderTier >= 2 && tierRank[chosenParts.exhaust.tier] < 2) warnings.push("Wydech jest niższego poziomu niż cylinder i może ograniczyć jego użyteczne pasmo.");
  if (cylinderTier >= 2 && tierRank[chosenParts.carburetor.tier] < 2) warnings.push("Sprawdź przepływ gaźnika i króćca względem cylindra; po zmianie dolotu trzeba ponownie ustawić dyszę.");
  if (cylinderTier >= 2 && chosenParts.clutch.keepExisting) warnings.push("Przy takim poziomie mocy sprawdź sprzęgło pod obciążeniem; poślizg utrudni przeniesienie mocy.");
  if (cylinderTier >= 2 && chosenParts.crankshaft.id === "keep-crank" && chosenParts.bearings.keepExisting) warnings.push("Przy mocnym cylindrze skontroluj wał, łożyska i uszczelniacze. Jeśli rozpoławiasz silnik, dobierz nowe łożyska do wymiarów seryjnego wału.");
  if (chosenParts.crankshaft.id === "doppler-endurance" && chosenParts.bearings.keepExisting) warnings.push("Wał Doppler Endurance jest sprzedawany bez łożysk głównych. Dodaj osobny komplet zgodny z wymiarem czopów 20 mm.");
  if (chosenParts.crankshaft.id === "stage6-rt-crank" && chosenParts.bearings.keepExisting) warnings.push("Wał Stage6 R/T ma czopy 20/20 mm i wymaga osobnych łożysk głównych 20 mm oraz uszczelniaczy.");
  if (chosenParts.crankshaft.id === "stage6-hpc" && chosenParts.bearings.keepExisting) warnings.push("Wał Stage6 HPC zawiera łożyska główne. Uszczelniacze są osobno — uwzględnij je przy składaniu silnika.");
  if (chosenParts.bearings.id === "motoforce-bearings" && ["doppler-endurance", "stage6-hpc", "stage6-rt-crank"].includes(chosenParts.crankshaft.id)) warnings.push("Komplet MotoForce jest wymiarem OEM 17 mm, a wybrany wał ma czopy 20 mm. Wybierz łożyska zgodne z wałem; przy Stage6 HPC łożyska główne są już w zestawie.");
  if (chosenParts.bearings.id === "stage6-rt-bearings" && chosenParts.crankshaft.id === "keep-crank") warnings.push("Komplet Stage6 R/T ma wymiar 20 mm. Przed użyciem z seryjnym wałem potwierdź wymiar czopów — seryjny wał może wymagać łożysk OEM 17 mm.");
  if (chosenParts.bearings.id === "stage6-rt-bearings" && chosenParts.crankshaft.id === "stage6-hpc") warnings.push("Wał Stage6 HPC ma już w komplecie łożyska główne. Zestaw Stage6 R/T zawiera kolejną parę; sprawdź zawartość i koszt, by nie kupić łożysk podwójnie.");
  if (chosenParts.airFilter.id !== "keep-airbox") warnings.push("Filtr otwarty zmienia ilość powietrza — po montażu ponownie dobierz dysze gaźnika i sprawdź szczelność dolotu.");
  const requiredCrankshaft = selectedCylinder.recommendedCrankshaft ?? (isDerbi ? derbiSpecialCrankByCylinder[selectedCylinder.id] : undefined);
  if (requiredCrankshaft && chosenParts.crankshaft.id !== requiredCrankshaft) warnings.push(`Ten cylinder wymaga wału o określonym skoku i długości korbowodu. Dobierz wariant: ${currentPartCatalog.crankshaft.find((item) => item.id === requiredCrankshaft)?.name ?? "sprawdź instrukcję producenta"}.`);
  if (chosenParts.crankshaft.requiresFitmentCheck) warnings.push(`${selectedCylinder.brand} ${selectedCylinder.name}: ${chosenParts.crankshaft.detail}`);
  if (isDerbi && ["derbi-rt95", "derbi-bigracing88", "derbi-streetrace88", "derbi-mvt-iron90", "derbi-bidalot90", "derbi-2fast80", "derbi-2fast100", "derbi-top86-trophy", "derbi-italkit88", "derbi-italkit96"].includes(selectedCylinder.id)) warnings.push("To zestaw o długim skoku / dużej pojemności. Sprawdź w instrukcji obróbkę karterów, wysokość cylindra, sworzeń tłoka i luz squish.");
  if (isDerbi && engine === "Derbi D50B1" && chosenParts.ignition.id === "derbi-mvt-dd-e3") warnings.push("Wybrano zapłon Euro 2/3 przy silniku opisanym jako D50B1. Potwierdź generację instalacji; dla Euro 4 użyj właściwego wariantu DD28.");
  if (isDerbi && engine === "Derbi D50B0" && chosenParts.ignition.id === "derbi-mvt-dd-e4") warnings.push("Wybrano zapłon Euro 4 przy silniku opisanym jako D50B0. Sprawdź kod instalacji i wersję Euro przed zakupem.");
  if (chosenParts.ignition.id === "mvt-dd" && /yamaha|mbk/i.test(bike)) warnings.push("Zapłon MVT ma osobne wersje dla Yamaha/MBK i pozostałych silników AM6. Potwierdź numer części dla konkretnego motocykla.");

  const applyGoal = (nextGoal: SetupGoal) => {
    setGoal(nextGoal);
    setCylinderId(cylinderIdFor(engine, nextGoal));
    setPartSelection(getDefaults(engine, nextGoal));
  };

  const selectCylinder = (id: string) => {
    const nextCylinder = currentCylinders.find((item) => item.id === id)!;
    setCylinderId(id);
    setPartSelection(partsForCylinder(engine, nextCylinder));
  };

  const updatePart = (category: PartCategory, id: string) => setPartSelection((current) => ({ ...current, [category]: id }));

  const saveSetup = async () => {
    if (saving) return;
    setSaving(true);
    setSaveStatus("");
    const fallbackName = `${bike || engine} · ${selectedCylinder.brand} ${selectedCylinder.name}`.slice(0, 100);
    const payload = {
      name: (setupName.trim() || fallbackName).slice(0, 100),
      engine,
      goal,
      setup: {
        bike,
        year,
        cylinder: selectedCylinder,
        parts: categoryOrder.map((category) => ({ ...chosenParts[category], category })),
        power: selectedCylinder.power,
        rpm: selectedCylinder.rpm,
        totalEur: total,
        totalPln: Math.round(total * exchangeRate),
        exchangeRate,
      },
    };
    try {
      const response = await fetch("/api/setups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (response.status === 401) setAuthStatus("guest");
      if (!response.ok) throw new Error(data.error ?? "Nie udało się zapisać setupu.");
      setSaveStatus("Setup zapisany w Twoim profilu.");
      setAuthStatus("signed-in");
    } catch (error) {
      setSaveStatus(error instanceof Error ? error.message : "Nie udało się zapisać setupu.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-7xl px-5 py-5 lg:px-8">
        <ToolOverlay active="setup" title="Kreator setupu 2T" description="Wybierz rodzinę silnika i cel, porównaj pasujące cylindry, a potem skompletuj wał, dolot, wydech i osprzęt. Na końcu zobaczysz listę części i orientacyjny koszt.">
          <b className="text-red-200">Katalogi: Minarelli AM6 oraz Derbi D50B0 / D50B1</b><br />Ceny z kart produktów przeliczamy z EUR na PLN. Przed zakupem sprawdź dokładny kod silnika, wersję Euro i rocznik motocykla.
          <label className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-zinc-300">Kurs 1 EUR = <input aria-label="Kurs euro do złotego" type="text" inputMode="decimal" value={eurPlnInput} onChange={(event) => setEurPlnInput(event.target.value)} className="w-24 rounded-lg border border-white/10 bg-[#101010] px-2 py-1.5 text-center text-xs text-white outline-none focus:border-red-400/50" /> PLN <a href="https://nbp.pl/statystyka-i-sprawozdawczosc/kursy/tabela-a/" target="_blank" rel="noreferrer" className="text-red-200 underline underline-offset-2">Kurs NBP ↗</a></label>
          <span className="mt-1 block text-[10px] text-zinc-600">Start: 4,3775 PLN/EUR · tabela NBP z 09.10.2026. Kurs możesz zmienić.</span>
        </ToolOverlay>

        <nav aria-label="Etapy kreatora setupu" className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const active = stepNumber === step;
            const visited = stepNumber < step;
            return <button key={label} type="button" onClick={() => visited && setStep(stepNumber)} disabled={!visited && !active} aria-current={active ? "step" : undefined} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition ${active ? "border-red-400/30 bg-red-500/10 text-white" : visited ? "border-white/10 bg-white/[.025] text-zinc-300 hover:border-red-400/20" : "border-white/[.06] text-zinc-600"}`}><span className={`font-mono ${active || visited ? "text-red-300" : "text-zinc-700"}`}>0{stepNumber}</span>{label}</button>;
          })}
        </nav>

        {step === 1 && <section className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-7">
            <div className="mb-5"><p className="text-xs font-black uppercase tracking-[.22em] text-red-300">Krok 1 z 4</p><h2 className="mt-2 text-2xl font-black">Jaki silnik i jaki efekt?</h2><p className="mt-2 text-sm text-zinc-400">Dobór zaczyna się od rodziny silnika. Nie wybieraj części na podstawie samego oznaczenia „50 cc”.</p></div>
            <label className="block"><span className="mb-2 block text-xs font-semibold text-zinc-300">Rodzina silnika</span><select value={engine} onChange={(event) => { const nextEngine = event.target.value as SetupEngine; setEngine(nextEngine); setTierFilter("all"); setCylinderId(cylinderIdFor(nextEngine, goal)); setPartSelection(getDefaults(nextEngine, goal)); setSaveStatus(""); }} className="w-full rounded-xl border border-white/10 bg-[#101010] px-3 py-3 text-sm text-white outline-none focus:border-red-400/50"><option value="Minarelli AM6">Minarelli AM6</option><option value="Derbi D50B0">Derbi D50B0 · Euro 3</option><option value="Derbi D50B1">Derbi D50B1 · Euro 4</option></select><span className="mt-2 block text-[11px] text-zinc-500">Katalog części przełącza się razem z silnikiem. Dla Derbi potwierdź wariant Euro i rocznik w karcie produktu.</span></label>
            <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="block"><span className="mb-2 block text-xs font-semibold text-zinc-300">Marka i model motocykla · opcjonalnie</span><input value={bike} onChange={(event) => setBike(event.target.value)} placeholder="np. Rieju MRT, Yamaha DT" className="w-full rounded-xl border border-white/10 bg-[#101010] px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-400/50" /></label><label className="block"><span className="mb-2 block text-xs font-semibold text-zinc-300">Rocznik · opcjonalnie</span><input inputMode="numeric" value={year} onChange={(event) => setYear(event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="np. 2018" className="w-full rounded-xl border border-white/10 bg-[#101010] px-3 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-400/50" /></label></div>
            <fieldset className="mt-7"><legend className="text-xs font-semibold text-zinc-300">Wybierz priorytet setupu</legend><div className="mt-3 grid gap-3 sm:grid-cols-2">
              {goals.map((item) => <button key={item.id} type="button" aria-pressed={goal === item.id} onClick={() => applyGoal(item.id)} className={`rounded-2xl border p-4 text-left transition ${goal === item.id ? "border-red-400/40 bg-red-500/[.09]" : "border-white/10 bg-black/15 hover:border-white/20"}`}><span className={`text-sm font-bold ${goal === item.id ? "text-white" : "text-zinc-200"}`}>{item.title}</span><span className="mt-1.5 block text-xs leading-5 text-zinc-500">{item.detail}</span></button>)}
            </div></fieldset>
            <div className="mt-7 flex justify-end"><button type="button" onClick={() => { setCylinderId(cylinderIdFor(engine, goal)); setPartSelection(getDefaults(engine, goal)); setStep(2); }} className="rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-400">Pokaż pasujące cylindry <span aria-hidden="true">→</span></button></div>
          </div>
          <aside className="rounded-3xl border border-red-500/15 bg-red-500/[.035] p-5"><p className="text-xs font-bold uppercase tracking-[.18em] text-red-300">Jak działa dobór?</p><ol className="mt-4 space-y-4 text-sm leading-6 text-zinc-400"><li><b className="text-zinc-200">1.</b> Cel ustawia punkt startowy, nie blokuje własnego wyboru.</li><li><b className="text-zinc-200">2.</b> Wybierasz konkretny cylinder i producenta.</li><li><b className="text-zinc-200">3.</b> Kreator proponuje spójny osprzęt, który możesz zmienić.</li><li><b className="text-zinc-200">4.</b> Podsumowanie pokazuje koszt zakupu i elementy do kontroli.</li></ol></aside>
        </section>}

        {step === 2 && <section className="mt-5 rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.22em] text-red-300">Krok 2 z 4 · {engine}</p><h2 className="mt-2 text-2xl font-black">Wybierz cylinder</h2><p className="mt-2 max-w-3xl text-sm text-zinc-400">{currentCylinders.length} modeli w katalogu {engine}. High-end obejmuje tu aluminiowe cylindry wyczynowe; żeliwne zestawy pozostają w klasie Sport lub Racing.</p></div><span className="rounded-full border border-red-400/20 bg-red-500/[.07] px-3 py-1.5 text-xs font-semibold text-red-200">Cel: {goals.find((item) => item.id === goal)?.title}</span></div>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Filtr klasy cylindra">
            <button type="button" aria-pressed={tierFilter === "all"} onClick={() => setTierFilter("all")} className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold transition ${tierFilter === "all" ? "border-red-400/30 bg-red-500/10 text-red-100" : "border-white/10 text-zinc-400 hover:text-white"}`}>Wszystkie <span className="ml-1 text-zinc-500">{currentCylinders.length}</span></button>
            {(["daily", "sport", "racing", "high-end"] as const).map((tier) => {
              const count = currentCylinders.filter((item) => item.tier === tier).length;
              return <button key={tier} type="button" disabled={count === 0} aria-pressed={tierFilter === tier} onClick={() => setTierFilter(tier)} className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-30 ${tierFilter === tier ? "border-red-400/30 bg-red-500/10 text-red-100" : "border-white/10 text-zinc-400 hover:text-white"}`}>{tierLabels[tier]} <span className="ml-1 text-zinc-500">{count}</span></button>;
            })}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleCylinders.map((item) => {
              const selected = cylinderId === item.id;
              const recommended = recommendedCylinderId === item.id;
              return <article key={item.id} className={`rounded-2xl border p-4 transition ${selected ? "border-red-400/40 bg-red-500/[.075]" : "border-white/10 bg-black/15 hover:border-white/20"}`}>
                <div className="flex items-start justify-between gap-2"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-zinc-500">{item.brand}</p><h3 className="mt-1 text-base font-bold">{item.name}</h3></div>{recommended && <span className="shrink-0 rounded-full bg-red-500/15 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-red-200">Polecany</span>}</div>
                <div className="mt-3 flex flex-wrap gap-1.5"><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-zinc-300">{item.displacement}</span><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-zinc-400">{tierLabels[item.tier]}</span><span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-zinc-400">{item.material}</span></div>
                <p className="mt-3 min-h-10 text-xs leading-5 text-zinc-400">{item.note}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-black/25 p-3"><div><p className="text-[9px] uppercase tracking-wider text-zinc-600">Potencjał setupu</p><p className="mt-1 text-sm font-bold text-white">{fmtRange(item.power)} KM</p></div><div><p className="text-[9px] uppercase tracking-wider text-zinc-600">Pasmo szczytu</p><p className="mt-1 text-sm font-bold text-white">{fmtRange(item.rpm)} obr./min</p></div></div>
                <div className="mt-3 flex items-center justify-between gap-3"><b className="text-sm">{fmtPrice(item.priceEur, exchangeRate)}</b><a href={item.url} target="_blank" rel="noreferrer" className="text-[10px] font-semibold text-zinc-400 underline decoration-white/20 underline-offset-4 hover:text-white">Karta części</a></div>
                <button type="button" aria-pressed={selected} onClick={() => selectCylinder(item.id)} className={`mt-3 w-full rounded-xl border px-3 py-2.5 text-xs font-bold transition ${selected ? "border-red-300/30 bg-red-500/15 text-white" : "border-white/10 text-zinc-300 hover:border-red-400/30 hover:text-white"}`}>{selected ? "Wybrany cylinder" : "Wybierz ten cylinder"}</button>
              </article>;
            })}
          </div>
          <p className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[.035] p-3 text-[11px] leading-5 text-amber-100/70">Moc i obroty to zakres orientacyjny dla poprawnie złożonego i zestrojonego silnika. Dla części modeli wartości pochodzą ze sprzedawcy lub wykresu Stage6; pozostałe są szacunkiem klasy zestawu, nie gwarancją wyniku na hamowni.</p>
          <div className="mt-5 flex justify-between"><button type="button" onClick={() => setStep(1)} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white">← Wstecz</button><button type="button" onClick={() => setStep(3)} className="rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-400">Dobierz osprzęt →</button></div>
        </section>}

        {step === 3 && <section className="mt-5 rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-black uppercase tracking-[.22em] text-red-300">Krok 3 z 4 · {selectedCylinder.brand} {selectedCylinder.displacement}</p><h2 className="mt-2 text-2xl font-black">Dopasuj resztę silnika</h2><p className="mt-2 text-sm text-zinc-400">Punkty startowe są dobrane do klasy cylindra i rodziny silnika. Możesz zmienić dowolny element albo zostawić sprawną część seryjną.</p></div><button type="button" onClick={() => setPartSelection(partsForCylinder(engine, selectedCylinder))} className="self-start rounded-lg border border-white/10 px-3 py-2 text-[11px] font-bold text-zinc-300 hover:text-white">Przywróć polecany zestaw</button></div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {categoryOrder.map((category) => {
              const options = currentPartCatalog[category];
              const selected = chosenParts[category];
              return <section key={category} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold">{categoryLabels[category].title}</h3><span className="text-[10px] text-zinc-600">{selected.keepExisting ? "część seryjna" : tierLabels[selected.tier]}</span></div>
                <p className="mt-1.5 min-h-10 text-[11px] leading-5 text-zinc-500">{categoryLabels[category].helper}</p>
                <label className="mt-3 block"><span className="sr-only">Wybierz {categoryLabels[category].title}</span><select value={partSelection[category]} onChange={(event) => updatePart(category, event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-xs text-white outline-none focus:border-red-400/50">{options.map((option) => <option key={option.id} value={option.id}>{option.brand} · {option.name} · {option.includedInCylinder ? "w zestawie cylindra" : option.keepExisting ? "pozostaw" : option.requiresFitmentCheck ? "dobór do potwierdzenia" : fmtPrice(option.priceEur, exchangeRate)}</option>)}</select></label>
                <div className="mt-3 flex items-start justify-between gap-3"><p className="text-[11px] leading-5 text-zinc-400">{selected.detail}</p>{selected.url && <a href={selected.url} target="_blank" rel="noreferrer" className="shrink-0 text-[10px] font-semibold text-zinc-400 underline decoration-white/20 underline-offset-4 hover:text-white">Sklep ↗</a>}</div>
              </section>;
            })}
          </div>
          <div className="mt-5 flex justify-between"><button type="button" onClick={() => setStep(2)} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white">← Wstecz</button><button type="button" onClick={() => setStep(4)} className="rounded-xl bg-red-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-400">Zobacz gotowy setup →</button></div>
        </section>}

        {step === 4 && <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[.22em] text-red-300">Krok 4 z 4 · gotowy setup</p><h2 className="mt-2 text-2xl font-black">{bike || engine}{year ? ` · ${year}` : ""}</h2><p className="mt-1 text-sm text-zinc-400">Cel: {goals.find((item) => item.id === goal)?.title} · {selectedCylinder.brand} {selectedCylinder.name}</p>
            <section className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/[.045] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold text-zinc-100">Zapisz setup w profilu</p><p className="mt-1 text-[11px] leading-5 text-zinc-400">Zachowaj listę części, wybrany silnik i podsumowanie kosztów na swoim koncie.</p></div>{authStatus === "signed-in" && <Link href="/profil" className="text-[10px] font-semibold text-red-200 underline underline-offset-4">Moje zapisane setupy →</Link>}</div>
              {authStatus === "signed-in" ? <div className="mt-3 flex flex-col gap-2 sm:flex-row"><input value={setupName} onChange={(event) => setSetupName(event.target.value)} maxLength={100} placeholder={`${bike || engine} · ${selectedCylinder.brand} ${selectedCylinder.name}`} aria-label="Nazwa zapisywanego setupu" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-red-400/40" /><button type="button" onClick={saveSetup} disabled={saving} className="rounded-xl bg-red-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-400 disabled:cursor-wait disabled:opacity-60">{saving ? "Zapisywanie…" : "Zapisz w profilu"}</button></div> : authStatus === "guest" ? <div className="mt-3 flex flex-wrap items-center gap-3"><Link href="/logowanie" className="rounded-xl bg-red-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-400">Zaloguj się, aby zapisać</Link><span className="text-[10px] text-zinc-500">Kreator i podgląd pozostają dostępne bez konta.</span></div> : <p className="mt-3 text-[11px] text-zinc-500">Sprawdzam status logowania…</p>}
              {saveStatus && <p role="status" className={`mt-3 text-[11px] ${saveStatus.startsWith("Setup zapisany") ? "text-emerald-300" : "text-amber-200"}`}>{saveStatus}</p>}
            </section>
            <div className="mt-5 overflow-hidden rounded-2xl border border-white/10"><div className="grid grid-cols-[minmax(0,1fr)_auto] bg-white/[.04] px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500"><span>Część do setupu</span><span>Orientacyjna cena</span></div>
              <div className="divide-y divide-white/[.06]">
                <div className="flex items-start justify-between gap-4 px-4 py-3"><div><p className="text-xs font-bold">Cylinder · {selectedCylinder.brand} {selectedCylinder.name}</p><p className="mt-1 text-[10px] text-zinc-500">{selectedCylinder.displacement} · {tierLabels[selectedCylinder.tier]}</p></div><span className="whitespace-nowrap text-xs font-semibold">{fmtPrice(selectedCylinder.priceEur, exchangeRate)}</span></div>
                {categoryOrder.map((category) => { const part = chosenParts[category]; return <div key={category} className="flex items-start justify-between gap-4 px-4 py-3"><div><p className="text-xs font-bold">{categoryLabels[category].title} · {part.brand}</p><p className="mt-1 text-[10px] text-zinc-500">{part.name}{part.includedInCylinder ? " · w zestawie cylindra" : part.keepExisting ? " · pozostaw / skontroluj" : part.requiresFitmentCheck ? " · nie wyceniono — potwierdź przed zakupem" : ""}</p></div><div className="flex shrink-0 items-center gap-3"><span className="whitespace-nowrap text-xs font-semibold">{part.includedInCylinder ? "w zestawie" : part.keepExisting ? "bez zakupu" : part.requiresFitmentCheck ? "do potwierdzenia" : fmtPrice(part.priceEur, exchangeRate)}</span>{part.url && <a href={part.url} target="_blank" rel="noreferrer" aria-label={`Otwórz kartę: ${part.name}`} className="text-[10px] text-red-200 underline decoration-red-300/30 underline-offset-4">sklep</a>}</div></div>; })}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs font-bold text-zinc-200">Potencjał poprawnie zestrojonego zestawu</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><div><p className="text-[10px] uppercase tracking-wider text-zinc-600">Moc</p><p className="mt-1 text-xl font-black">{fmtRange(selectedCylinder.power)} KM</p></div><div><p className="text-[10px] uppercase tracking-wider text-zinc-600">Pasmo szczytu</p><p className="mt-1 text-xl font-black">{fmtRange(selectedCylinder.rpm)} <span className="text-xs font-semibold text-zinc-400">obr./min</span></p></div></div><p className="mt-3 text-[11px] leading-5 text-zinc-500">{selectedCylinder.sourceNote} Rzeczywisty wynik zależy m.in. od stanu silnika, squishu, timingu portów, dysz, paliwa i pomiaru na hamowni.</p></div>
            <section className="mt-4 border-y border-white/10 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-xs font-bold text-zinc-200">Kontrola kompatybilności</h3><span className="text-[10px] text-zinc-500">{bike ? `${bike}${year ? ` · ${year}` : ""}` : "Nie wskazano modelu motocykla"}</span></div>
              <p className="mt-1 text-[10px] leading-4 text-zinc-600">Katalog weryfikuje rodzinę silnika, ale nie zawiera pełnej tabeli mocowań dla każdego modelu i rocznika. Pozycje wymagające kontroli nie są potwierdzeniem dopasowania.</p>
              <ul className="mt-3 divide-y divide-white/[.05]">
                <li className="flex flex-wrap justify-between gap-2 py-2 text-[11px]"><span className="text-zinc-300">Cylinder · {selectedCylinder.brand} {selectedCylinder.name}</span><span className={selectedCylinder.compatibleEngines?.includes(engine) ? "text-emerald-300" : "text-amber-200"}>{selectedCylinder.compatibleEngines?.includes(engine) ? `Rodzina ${engine} potwierdzona w katalogu` : "Potwierdź kod silnika w dokumentacji cylindra"}</span></li>
                {categoryOrder.map((category) => {
                  const part = chosenParts[category];
                  const status = part.includedInCylinder ? "W zestawie cylindra" : part.keepExisting ? "Pozostaw część po kontroli stanu" : part.requiresFitmentCheck ? "Wymaga potwierdzenia wymiarów" : "Sprawdź rocznik, wymiary i mocowanie";
                  return <li key={category} className="flex flex-wrap justify-between gap-2 py-2 text-[11px]"><span className="text-zinc-300">{categoryLabels[category].title} · {part.brand}</span><span className={part.includedInCylinder ? "text-emerald-300" : "text-amber-200/80"}>{status}</span></li>;
                })}
              </ul>
              {(!bike || !year) && <p className="mt-2 text-[10px] text-amber-200/70">Uzupełnij {!bike ? "model" : ""}{!bike && !year ? " i " : ""}{!year ? "rocznik" : ""} w kroku 1, aby zachować kontekst kontroli.</p>}
            </section>
            <SetupFlowDiagram />
            <details className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
              <summary className="cursor-pointer text-xs font-bold text-zinc-200">Porady przy składaniu i strojeniu</summary>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/[.06] bg-white/[.025] p-3"><p className="text-xs font-bold text-red-200">1. Zanim zamówisz</p><p className="mt-1.5 text-[11px] leading-5 text-zinc-400">Odczytaj kod silnika, zmierz średnicę gaźnika i sprawdź wymiary czopów wału. Sam model motocykla lub napis „AM6” nie potwierdza dopasowania wydechu do ramy.</p></div>
                <div className="rounded-xl border border-white/[.06] bg-white/[.025] p-3"><p className="text-xs font-bold text-red-200">2. Wał i dół silnika</p><p className="mt-1.5 text-[11px] leading-5 text-zinc-400">Przy rozpoławianiu skontroluj łożyska i uszczelniacze. Sprawdź, czy wybrany wał zawiera łożyska główne, aby nie kupować ich drugi raz.</p><a href="https://www.maxiscoot.com/en/seite/tutorial-crankshaft-disassembly-and-assembly-274/" target="_blank" rel="noreferrer" className="mt-2 inline-block text-[10px] font-semibold text-red-200 underline underline-offset-4">Poradnik rozbiórki i montażu wału ↗</a></div>
                <div className="rounded-xl border border-white/[.06] bg-white/[.025] p-3"><p className="text-xs font-bold text-red-200">3. Cylinder</p><p className="mt-1.5 text-[11px] leading-5 text-zinc-400">Ustaw squish i szczeliny według instrukcji konkretnego zestawu; nie przenoś jednej wartości na każdy cylinder. Przed pierwszym uruchomieniem sprawdź swobodę ruchu tłoka.</p><a href="https://www.motoscoot.net/blog/wp-content/uploads/2023/06/S6-7518801_Manual_compressed.pdf" target="_blank" rel="noreferrer" className="mt-2 inline-block text-[10px] font-semibold text-red-200 underline underline-offset-4">Instrukcja Stage6 R/T 70 AM6 ↗</a></div>
                <div className="rounded-xl border border-white/[.06] bg-white/[.025] p-3"><p className="text-xs font-bold text-red-200">4. Dolot i pierwsze strojenie</p><p className="mt-1.5 text-[11px] leading-5 text-zinc-400">Po zmianie gaźnika, filtra lub wydechu zacznij od bogatszej dyszy i dostrój silnik pod obciążeniem. Sprawdź szczelność dolotu i skrzyni korbowej.</p></div>
              </div>
            </details>
            {warnings.length > 0 ? <div role="status" className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/[.045] p-4"><h3 className="text-xs font-bold text-amber-100">Przed montażem sprawdź</h3><ul className="mt-2 space-y-2">{warnings.map((warning) => <li key={warning} className="text-[11px] leading-5 text-amber-100/75">• {warning}</li>)}</ul></div> : <div className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/[.035] p-4 text-xs text-emerald-100/80">Wybrane części są zbliżone poziomem. Nadal potwierdź wymiary i mocowania dla konkretnego motocykla.</div>}
            <p className="mt-4 text-[10px] leading-5 text-zinc-600">To lista do planowania, nie automatyczne zamówienie. Ceny z kart mogą się zmieniać; PLN przeliczam według edytowalnego kursu. Suma nie obejmuje wysyłki ani pozycji, których wybrany cylinder lub wał nie ma w zestawie, np. uszczelek czy narzędzi. Części seryjne oznaczono jako posiadane do kontroli.</p>
            <div className="mt-5 flex justify-between"><button type="button" onClick={() => setStep(3)} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white">← Zmień osprzęt</button><button type="button" onClick={() => { setStep(1); }} className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white">Zacznij od nowa</button></div>
          </div>
          <aside className="self-start rounded-3xl border border-red-500/20 bg-[#101010] p-5"><p className="text-xs font-bold uppercase tracking-[.2em] text-red-300">Koszt części</p><p className="mt-2 text-4xl font-black">{fmtZloty(total * exchangeRate)}</p><p className="mt-1 text-xs text-zinc-500">około {fmtEuro(total)} · kurs {exchangeRate.toLocaleString("pl-PL")} PLN/EUR</p><p className="mt-2 text-xs leading-5 text-zinc-500">Suma elementów oznaczonych jako zakup. Części seryjne do kontroli nie zwiększają kosztu.</p><div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs font-semibold text-zinc-300">Założenia kompatybilności</p><ul className="mt-3 space-y-2 text-[11px] leading-5 text-zinc-500"><li>• Silnik: {engine}.</li><li>• Dobór wydechu obejmuje rodzinę silnika, nie potwierdza mocowania do każdej ramy.</li><li>• Zapłon może zależeć od rocznika i instalacji elektrycznej.</li><li>• Przed zakupem porównaj kod silnika oraz numer katalogowy części.</li></ul></div><a href={selectedCylinder.url} target="_blank" rel="noreferrer" className="mt-5 block rounded-xl bg-red-500 px-4 py-3 text-center text-xs font-bold text-white transition hover:bg-red-400">Otwórz kartę cylindra ↗</a></aside>
        </section>}
      </div>
    </main>
  );
}
