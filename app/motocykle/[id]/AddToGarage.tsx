"use client";
import { useState } from "react";

export default function AddToGarage({ slug, defaultYear }: { slug: string; defaultYear: number }) {
  const [status, setStatus] = useState("");
  const [year, setYear] = useState(String(defaultYear));
  const [color, setColor] = useState("Czarny");
  const colors = [
    { name: "Czarny", hex: "#18181b" }, { name: "Biały", hex: "#f4f4f5" },
    { name: "Czerwony", hex: "#dc2626" }, { name: "Niebieski", hex: "#2563eb" },
    { name: "Szary", hex: "#71717a" }, { name: "Zielony", hex: "#16a34a" },
    { name: "Pomarańczowy", hex: "#f97316" }, { name: "Żółty", hex: "#eab308" },
  ];

  async function add() {
    setStatus("Dodawanie...");
    const r = await fetch("/api/garage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, model_year: Number(year), color }),
    });
    const data = await r.json();
    if (r.ok) setStatus("Dodano do garażu ✓");
    else if (r.status === 401) window.location.href = "/logowanie";
    else setStatus(data.error ?? "Nie udało się dodać.");
  }

  return <div className="mt-7 space-y-4">
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Rocznik</span>
        <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-red-500/40">
          {Array.from({ length: 21 }, (_, i) => defaultYear - 10 + i).map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500">Kolor</span>
        <div className="flex flex-wrap gap-2">
          {colors.map((c) => <button type="button" key={c.name} title={c.name} aria-label={c.name} onClick={() => setColor(c.name)} className={`h-9 w-9 rounded-full border-2 transition hover:scale-105 ${color === c.name ? "border-white ring-2 ring-red-500/60 ring-offset-2 ring-offset-[#090909]" : "border-white/20"}`} style={{ backgroundColor: c.hex }} />)}
        </div>
        <p className="mt-2 text-xs text-zinc-500">Wybrany: <span className="text-zinc-300">{color}</span></p>
      </label>
    </div>
    <button onClick={add} className="rounded-full bg-red-500 px-6 py-3 font-bold transition hover:bg-red-400">{status === "Dodawanie..." ? status : "Dodaj do garażu"}</button>
    {status && status !== "Dodawanie..." && <p className="text-sm text-zinc-400">{status}</p>}
  </div>;
}
