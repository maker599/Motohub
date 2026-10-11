"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  categoryOrder,
  getCompatibleCylinders,
  getPartLabel,
  recommendSetup,
} from "../setupRecommendations";
import { tierLabels, type SetupEngine } from "../setupCatalog";

const engines: SetupEngine[] = ["Minarelli AM6", "Derbi D50B0", "Derbi D50B1"];
const defaultCylinders: Record<SetupEngine, string> = {
  "Minarelli AM6": "top-performances-70",
  "Derbi D50B0": "derbi-streetrace77",
  "Derbi D50B1": "derbi-mf70-cast",
};
const formatRange = (values?: [number, number]) => values ? `${values[0]}–${values[1]}` : "—";

export default function SetupComparisonTool() {
  const [engineA, setEngineA] = useState<SetupEngine>("Minarelli AM6");
  const [engineB, setEngineB] = useState<SetupEngine>("Minarelli AM6");
  const [cylinderA, setCylinderA] = useState(defaultCylinders[engineA]);
  const [cylinderB, setCylinderB] = useState("stage6-bigracing-77");
  const [exchangeRate, setExchangeRate] = useState("4,3775");
  const rateValue = Number.parseFloat(exchangeRate.replace(",", "."));
  const rate = Number.isFinite(rateValue) && rateValue > 0 && rateValue <= 100 ? rateValue : 4.3775;
  const setupA = useMemo(() => recommendSetup(engineA, cylinderA), [engineA, cylinderA]);
  const setupB = useMemo(() => recommendSetup(engineB, cylinderB), [engineB, cylinderB]);
  const money = (eur: number) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(eur * rate);
  const selectClass = "w-full rounded-lg border border-white/10 bg-[#101010] px-3 py-2.5 text-xs text-white outline-none focus:border-red-400/40";

  function changeEngine(side: "a" | "b", value: SetupEngine) {
    const first = getCompatibleCylinders(value)[0]?.id ?? "";
    if (side === "a") {
      setEngineA(value);
      setCylinderA(defaultCylinders[value] ?? first);
    } else {
      setEngineB(value);
      setCylinderB(defaultCylinders[value] ?? first);
    }
  }

  const comparisonRows = [
    { label: "Rodzina silnika", value: (setup: typeof setupA) => setup?.engine ?? "—" },
    { label: "Cel", value: (setup: typeof setupA) => setup?.goal ?? "—" },
    { label: "Cylinder", value: (setup: typeof setupA) => `${setup?.cylinder.brand ?? ""} ${setup?.cylinder.name ?? "—"}` },
    { label: "Pojemność", value: (setup: typeof setupA) => setup?.cylinder.displacement ?? "—" },
    { label: "Klasa", value: (setup: typeof setupA) => setup ? tierLabels[setup.cylinder.tier] : "—" },
    { label: "Moc · KM", value: (setup: typeof setupA) => formatRange(setup?.cylinder.power) },
    { label: "Pasmo · obr./min", value: (setup: typeof setupA) => formatRange(setup?.cylinder.rpm) },
    { label: "Cena orientacyjna", value: (setup: typeof setupA) => setup ? money(setup.totalEur) : "—" },
    ...categoryOrder.map((category) => ({
      label: getPartLabel(category),
      value: (setup: typeof setupA) => setup?.parts.find((part) => part.category === category)?.name ?? "—",
    })),
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
      <section className="min-w-0">
        <div className="grid gap-4 md:grid-cols-2">
          {[{ side: "a" as const, engine: engineA, cylinder: cylinderA, title: "Konfiguracja A", onEngine: (value: SetupEngine) => changeEngine("a", value), onCylinder: setCylinderA }, { side: "b" as const, engine: engineB, cylinder: cylinderB, title: "Konfiguracja B", onEngine: (value: SetupEngine) => changeEngine("b", value), onCylinder: setCylinderB }].map((column) => (
            <section key={column.side} className="border-b border-white/10 pb-4">
              <div className="flex items-center justify-between"><h2 className="text-sm font-bold">{column.title}</h2><span className="font-mono text-[10px] text-red-300">0{column.side === "a" ? 1 : 2}</span></div>
              <label className="mt-3 block text-[10px] text-zinc-500">Rodzina silnika<select className={`${selectClass} mt-1`} value={column.engine} onChange={(event) => column.onEngine(event.target.value as SetupEngine)}>{engines.map((engine) => <option key={engine}>{engine}</option>)}</select></label>
              <label className="mt-3 block text-[10px] text-zinc-500">Cylinder<select className={`${selectClass} mt-1`} value={column.cylinder} onChange={(event) => column.onCylinder(event.target.value)}>{getCompatibleCylinders(column.engine).map((cylinder) => <option key={cylinder.id} value={cylinder.id}>{cylinder.brand} · {cylinder.name}</option>)}</select></label>
              {setupA && column.side === "a" && <p className="mt-2 text-[10px] leading-4 text-zinc-600">{setupA.cylinder.sourceNote}</p>}
              {setupB && column.side === "b" && <p className="mt-2 text-[10px] leading-4 text-zinc-600">{setupB.cylinder.sourceNote}</p>}
            </section>
          ))}
        </div>
        <div className="mt-6 overflow-x-auto border-y border-white/10">
          <table className="w-full min-w-[680px] text-left text-xs"><thead><tr className="border-b border-white/[.07]"><th className="w-40 px-3 py-3 text-[10px] uppercase text-zinc-500">Parametr</th><th className="px-3 py-3 text-red-100">Konfiguracja A</th><th className="px-3 py-3 text-red-100">Konfiguracja B</th></tr></thead><tbody>
            {comparisonRows.map((row) => <tr key={row.label} className="border-b border-white/[.04] last:border-0"><th className="px-3 py-2.5 text-[10px] font-medium text-zinc-500">{row.label}</th><td className="px-3 py-2.5 text-zinc-300">{row.value(setupA)}</td><td className="px-3 py-2.5 text-zinc-300">{row.value(setupB)}</td></tr>)}
          </tbody></table>
        </div>
        <p className="mt-4 text-[10px] leading-5 text-zinc-600">Ceny są orientacyjnymi snapshotami katalogu bez wysyłki. Proponowany osprzęt nie zastępuje weryfikacji wymiarów, rocznika, instalacji i mocowania do ramy.</p>
      </section>
      <aside className="self-start border-t border-red-400/30 pt-5 xl:border-l xl:border-t-0 xl:pl-5">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-300">Ustawienia</p>
        <label className="mt-4 block text-[10px] text-zinc-500">Kurs EUR → PLN<input inputMode="decimal" value={exchangeRate} onChange={(event) => setExchangeRate(event.target.value)} className={`${selectClass} mt-1`} /></label>
        <div className="mt-6 border-y border-white/10 py-4"><p className="text-xs font-bold text-zinc-300">Porównaj inne warianty</p><p className="mt-2 text-[11px] leading-5 text-zinc-500">Zbuduj dokładny zestaw w kreatorze, zapisz go na profilu i zestaw do trzech konfiguracji w swoim profilu.</p><Link href="/narzedzia/kreator-setupu" className="mt-4 inline-block text-xs font-bold text-red-200 underline underline-offset-4">Otwórz kreator →</Link></div>
      </aside>
    </div>
  );
}