"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteNav from "../../SiteNav";

type Shape = "sport" | "street" | "race";
const presets: Record<Shape, { label: string; note: string; diffuser: number; belly: number; baffle: number }> = {
  street: { label: "Street", note: "Szerszy, spokojniejszy zakres", diffuser: 6, belly: 12, baffle: 8 },
  sport: { label: "Sport", note: "Uniwersalny punkt wyjścia", diffuser: 7, belly: 14, baffle: 9 },
  race: { label: "Race", note: "Orientacyjnie pod wyższe obroty", diffuser: 8, belly: 16, baffle: 10 },
};

function Field({ label, unit, value, min, max, step = 1, onChange }: { label: string; unit: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return <label className="block text-sm text-zinc-400">{label}<span className="mt-2 flex items-center gap-2"><input type="number" min={min} max={max} step={step} value={value} onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))} className="w-full min-w-0 rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-base font-semibold text-white outline-none focus:border-red-500" /><span className="shrink-0 text-xs text-zinc-500">{unit}</span></span></label>;
}

export default function ExhaustCalculator() {
  const [bore, setBore] = useState(54);
  const [stroke, setStroke] = useState(54);
  const [rpm, setRpm] = useState(9000);
  const [header, setHeader] = useState(28);
  const [diffuser, setDiffuser] = useState(7);
  const [belly, setBelly] = useState(14);
  const [baffle, setBaffle] = useState(9);
  const [stinger, setStinger] = useState(18);
  const [temp, setTemp] = useState(600);
  const [shape, setShape] = useState<Shape>("sport");
  const [showDeveloped, setShowDeveloped] = useState(true);
  const result = useMemo(() => {
    const cc = Math.PI * bore * bore * stroke / 4000;
    const targetLength = 0.5 * Math.sqrt(1.4 * 287.05 * (temp + 273.15)) * 60 / rpm * 1000;
    const totalLength = Math.round(Math.min(1000, Math.max(100, targetLength)));
    const sections = [header, diffuser, belly, baffle, stinger];
    const sum = sections.reduce((a, b) => a + b, 0);
    const scale = totalLength / sum;
    const lengths = sections.map(v => Math.round(v * scale));
    const diameters = [bore * 0.42, bore * 0.78, bore * 1.35, bore * 0.7, stinger];
    return { cc, totalLength, lengths, diameters, scale };
  }, [bore, stroke, rpm, header, diffuser, belly, baffle, stinger, temp]);

  const segments = [
    { name: "Rura początkowa", length: result.lengths[0], color: "#a1a1aa" },
    { name: "Stożek rozbieżny", length: result.lengths[1], color: "#ef4444" },
    { name: "Komora środkowa", length: result.lengths[2], color: "#b91c1c" },
    { name: "Stożek zbieżny", length: result.lengths[3], color: "#f87171" },
    { name: "Rurka końcowa", length: result.lengths[4], color: "#71717a" },
  ];
  return <main className="min-h-screen bg-[#09090b] text-white"><div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8"><SiteNav />
    <div className="mt-8 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.25em] text-red-400">MotoHub / Warsztat / 2T</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Kalkulator wydechu</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Interaktywny szkic komory rezonansowej. Zmieniaj parametry i zobacz podział długości sekcji oraz poglądowe rozwinięcie.</p></div><Link href="/narzedzia" className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-zinc-300 hover:bg-white/5">← Wszystkie narzędzia</Link></div>
    <div className="mt-8 grid gap-5 lg:grid-cols-[340px_1fr]">
      <aside className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><h2 className="text-lg font-extrabold">Parametry silnika</h2><div className="mt-5 grid grid-cols-2 gap-4"><Field label="Średnica cylindra" unit="mm" value={bore} min={30} max={100} onChange={setBore}/><Field label="Skok tłoka" unit="mm" value={stroke} min={20} max={100} onChange={setStroke}/><Field label="Obroty docelowe" unit="RPM" value={rpm} min={3000} max={15000} step={100} onChange={setRpm}/><Field label="Temp. spalin" unit="°C" value={temp} min={250} max={850} step={10} onChange={setTemp}/></div>
      <h2 className="mt-7 text-lg font-extrabold">Proporcje sekcji</h2><div className="mt-4 space-y-4"><Field label="Rura początkowa" unit="udział" value={header} min={5} max={60} onChange={setHeader}/><Field label="Stożek rozbieżny" unit="udział" value={diffuser} min={3} max={40} onChange={setDiffuser}/><Field label="Komora środkowa" unit="udział" value={belly} min={5} max={50} onChange={setBelly}/><Field label="Stożek zbieżny" unit="udział" value={baffle} min={3} max={40} onChange={setBaffle}/><Field label="Rurka końcowa" unit="mm (udział)" value={stinger} min={5} max={35} onChange={setStinger}/></div>
      <h2 className="mt-7 text-lg font-extrabold">Profil roboczy</h2><div className="mt-3 grid grid-cols-3 gap-2">{(Object.keys(presets) as Shape[]).map(key=><button key={key} onClick={()=>{setShape(key);setHeader(presets[key].diffuser*4);setDiffuser(presets[key].diffuser);setBelly(presets[key].belly);setBaffle(presets[key].baffle);}} className={`rounded-xl px-3 py-3 text-sm font-bold transition ${shape===key?"bg-red-600 text-white":"bg-white/5 text-zinc-400 hover:bg-white/10"}`}>{presets[key].label}</button>)}</div><p className="mt-3 text-xs leading-5 text-zinc-500">{presets[shape].note}. Wyniki są poglądowe, nie stanowią gotowej specyfikacji do wykonania części.</p>
      </aside>
      <div className="min-w-0 space-y-5">
        <section className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="text-xs uppercase tracking-wider text-zinc-500">Pojemność</p><p className="mt-2 text-3xl font-black">{result.cc.toFixed(1)} <span className="text-sm text-zinc-400">cm³</span></p></div><div className="rounded-2xl border border-red-500/25 bg-red-500/[.07] p-5"><p className="text-xs uppercase tracking-wider text-zinc-400">Długość modelu</p><p className="mt-2 text-3xl font-black">{result.totalLength} <span className="text-sm text-zinc-400">mm</span></p></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="text-xs uppercase tracking-wider text-zinc-500">Punkt pracy</p><p className="mt-2 text-3xl font-black">{rpm.toLocaleString("pl-PL")} <span className="text-sm text-zinc-400">RPM</span></p></div></section>
        <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5 sm:p-7"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[.2em] text-red-400">Wizualizacja</p><h2 className="mt-2 text-xl font-extrabold">Profil komory rezonansowej</h2></div><span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-zinc-400">Schemat 2D</span></div>
        <div className="mt-6 overflow-hidden rounded-2xl bg-[#101014] p-2 sm:p-4"><svg viewBox="0 0 820 300" className="w-full" role="img" aria-label="Poglądowy schemat komory wydechowej podzielonej na sekcje"><defs><linearGradient id="exhaustMetal" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#f4f4f5"/><stop offset=".45" stopColor="#52525b"/><stop offset="1" stopColor="#18181b"/></linearGradient><linearGradient id="exhaustRed" x1="0" x2="1"><stop offset="0" stopColor="#7f1d1d"/><stop offset=".5" stopColor="#ef4444"/><stop offset="1" stopColor="#991b1b"/></linearGradient></defs><path d={`M30 132 L${100+result.lengths[0]*.15} 132 L${160+result.lengths[0]*.15} 82 L${320+result.lengths[0]*.15} 55 L${500+result.lengths[0]*.15} 82 L${610+result.lengths[0]*.15} 132 L790 132 L790 168 L610 168 L500 218 L320 245 L160 218 L100 168 L30 168 Z`} fill="url(#exhaustMetal)" opacity=".9" stroke="#a1a1aa" strokeWidth="2"/><path d="M35 138 L120 138 L190 91 L320 67 L500 91 L620 138 L785 138 L785 162 L620 162 L500 209 L320 233 L190 209 L120 162 L35 162 Z" fill="url(#exhaustRed)" opacity=".9"/><path d="M120 138 L190 91 L190 209 L120 162 Z M320 67 L320 233 M500 91 L500 209 L620 162 L620 138" fill="none" stroke="#fecaca" strokeWidth="2" opacity=".8"/><path d="M35 150 H785" stroke="#fff" strokeDasharray="5 7" strokeWidth="1" opacity=".25"/><g fill="#f4f4f5" fontSize="12" fontWeight="600" textAnchor="middle"><text x="75" y="118">Rura</text><text x="215" y="47">Rozbieżny</text><text x="400" y="35">Komora</text><text x="555" y="47">Zbieżny</text><text x="710" y="118">Wylot</text></g><g fill="#d4d4d8" fontSize="11" textAnchor="middle"><text x="75" y="194">{result.lengths[0]} mm</text><text x="215" y="260">{result.lengths[1]} mm</text><text x="400" y="274">{result.lengths[2]} mm</text><text x="555" y="260">{result.lengths[3]} mm</text><text x="710" y="194">{result.lengths[4]} mm</text></g></svg></div>
        <div className="mt-5 flex items-center justify-between gap-4"><div><h3 className="font-bold">Rozwinięcie sekcji</h3><p className="mt-1 text-xs text-zinc-500">Udziały długości w modelu.</p></div><button onClick={()=>setShowDeveloped(v=>!v)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/5">{showDeveloped?"Ukryj rozwinięcie":"Pokaż rozwinięcie"}</button></div>
        {showDeveloped&&<div className="mt-4 space-y-3">{segments.map((segment,i)=><div key={segment.name}><div className="mb-1 flex justify-between gap-3 text-xs"><span className="text-zinc-300">{segment.name}</span><span className="font-bold text-white">{segment.length} mm</span></div><div className="h-3 overflow-hidden rounded-full bg-white/5"><div className="h-full rounded-full" style={{width:(segment.length/result.totalLength*100)+"%",background:segment.color}}/></div></div>)}</div>}
        </section>
        <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[.04] p-5"><h2 className="font-bold text-amber-200">Ważne</h2><p className="mt-2 text-sm leading-6 text-zinc-300">To edukacyjny model poglądowy, a nie inżynierski projekt do produkcji. Rzeczywista geometria wymaga obliczeń uwzględniających fazy rozrządu, temperaturę pracy, przekroje, kąty stożków i testów na stanowisku. Nie wykonuj części wyłącznie na podstawie tych wyników.</p></section>
      </div>
    </div>
  </div></main>;
}
