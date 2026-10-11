"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AddToGarage from "./AddToGarage";
import SiteNav from "../../SiteNav";
import type { Motorcycle } from "../../lib/motorcycles";

export default function BikeDetails({ id }: { id: string }) {
  const [result, setResult] = useState<{ slug: string; bike: Motorcycle | null; error: string; demoMode: boolean } | null>(null);

  useEffect(() => {
    let active = true;

    fetch(`/api/motorcycles/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 404) {
          if (active) setResult({ slug: id, bike: null, error: "", demoMode: false });
          return;
        }
        if (!response.ok) throw new Error(data.error ?? "Nie udało się pobrać motocykla.");
        if (active) setResult({ slug: id, bike: data.item ?? null, error: "", demoMode: Boolean(data.demoMode) });
      })
      .catch((cause: unknown) => {
        if (active) setResult({ slug: id, bike: null, error: cause instanceof Error ? cause.message : "Nie udało się połączyć z serwerem.", demoMode: false });
      });

    return () => { active = false; };
  }, [id]);

  const loading = result?.slug !== id;
  const bike = result?.slug === id ? result.bike : null;
  const error = result?.slug === id ? result.error : "";
  const demoMode = result?.slug === id && result.demoMode;

  return <main className="min-h-screen bg-[#090909] text-white">
    <div className="mx-auto max-w-6xl px-5 py-5 lg:px-8">
      <SiteNav />
      <Link href="/motocykle" className="mt-7 inline-block text-sm text-zinc-500 hover:text-white">← Wróć do katalogu</Link>
      {loading ? (
        <div className="mt-6 grid gap-7 lg:grid-cols-2"><div className="min-h-[430px] animate-pulse rounded-[2rem] border border-white/10 bg-white/[.03]"/><div className="min-h-[430px] animate-pulse rounded-[2rem] border border-white/10 bg-white/[.03]"/></div>
      ) : error || !bike ? (
        <div role="alert" className="mt-8 rounded-3xl border border-white/10 bg-white/[.03] p-8">
          <p className="text-sm font-bold uppercase tracking-widest text-red-400">{error ? "Nie udało się wczytać motocykla" : "Nie znaleziono motocykla"}</p>
          <p className="mt-3 text-zinc-400">{error || "Ten model nie znajduje się w katalogu."}</p>
          <Link href="/motocykle" className="mt-6 inline-block rounded-full bg-white px-5 py-3 text-sm font-bold text-black">Wróć do katalogu</Link>
        </div>
      ) : (
        <>
          {demoMode && <p className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/[.06] px-4 py-3 text-sm text-amber-200">Dane demonstracyjne. Po skonfigurowaniu Supabase zostaną zastąpione katalogiem z bazy.</p>}
          <div className="mt-6 grid gap-7 lg:grid-cols-[1.05fr_.95fr]">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-700/70 via-zinc-900 to-black p-8 shadow-2xl shadow-black/30">
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
              <div className="relative flex h-full min-h-[430px] items-end">
                <div><p className="text-xs font-black uppercase tracking-[.3em] text-red-500">{bike.brand}</p><p className="mt-2 text-6xl font-black tracking-tighter sm:text-7xl">{bike.model}</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300">{bike.motorcycle_type ?? "Motocykl"}</span><span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300">{bike.year}</span></div></div>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7">
              <p className="text-sm leading-6 text-zinc-400">{bike.description ?? `${bike.brand} ${bike.model} z rocznika ${bike.year}.`}</p>
              <div className="mt-7 grid grid-cols-2 gap-3">{[["Silnik", bike.engine_cc != null ? `${bike.engine_cc.toLocaleString("pl-PL")} cm³` : "—"], ["Moc", bike.power_hp != null ? `${bike.power_hp} KM` : "—"], ["Masa", bike.weight_kg != null ? `${bike.weight_kg} kg` : "—"], ["Rok", String(bike.year)]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-5"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>)}</div>
              <AddToGarage motorcycle={bike} />
              <Link href="/narzedzia/kalkulator" className="mt-3 block rounded-2xl border border-white/10 bg-white/[.03] p-4 transition hover:border-red-500/30 hover:bg-white/[.05]"><p className="text-sm font-bold">🔧 2T Exhaust Lab</p><p className="mt-1 text-xs text-zinc-500">Zaawansowany kalkulator geometrii komory rezonansowej.</p></Link>
            </div>
          </div>
        </>
      )}
    </div>
  </main>;
}
