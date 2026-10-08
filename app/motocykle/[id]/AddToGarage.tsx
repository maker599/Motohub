"use client";
import { useState } from "react";

export default function AddToGarage({ slug, defaultYear }: { slug: string; defaultYear: number }) {
  const [status, setStatus] = useState("");
  const [year, setYear] = useState(String(defaultYear));
  const [color, setColor] = useState("Czarny");
  const colors = ["Czarny", "Biały", "Czerwony", "Niebieski", "Szary", "Zielony", "Pomarańczowy", "Żółty"];

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
        <select value={color} onChange={(e) => setColor(e.target.value)} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-red-500/40">
          {colors.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
    </div>
    <button onClick={add} className="rounded-full bg-red-500 px-6 py-3 font-bold transition hover:bg-red-400">{status === "Dodawanie..." ? status : "Dodaj do garażu"}</button>
    {status && status !== "Dodawanie..." && <p className="text-sm text-zinc-400">{status}</p>}
  </div>;
}
