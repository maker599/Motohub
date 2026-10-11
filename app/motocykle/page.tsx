"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteNav from "../SiteNav";
import type { Motorcycle } from "../lib/motorcycles";

export default function MotorcyclesPage() {
  const [bikes, setBikes] = useState<Motorcycle[]>([]);
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);
  const types = useMemo(() => Array.from(new Set(bikes.map((bike) => bike.motorcycle_type).filter((type): type is string => Boolean(type))).values()).sort(), [bikes]);
  const brands = useMemo(() => Array.from(new Set(bikes.map((bike) => bike.brand))).sort((a, b) => a.localeCompare(b, "pl")), [bikes]);

  useEffect(() => {
    let active = true;

    fetch("/api/motorcycles", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Nie udało się pobrać katalogu.");
        if (active) {
          setBikes(Array.isArray(data.items) ? data.items : []);
          setDemoMode(Boolean(data.demoMode));
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Nie udało się połączyć z serwerem.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  function toggle(value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((current) => current.includes(value) ? current.filter((x) => x !== value) : [...current, value]);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bikes.filter((bike) => {
      const matchesQuery = !q || `${bike.brand} ${bike.model} ${bike.motorcycle_type ?? ""}`.toLowerCase().includes(q);
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(bike.motorcycle_type ?? "");
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(bike.brand);
      return matchesQuery && matchesType && matchesBrand;
    });
  }, [bikes, query, selectedTypes, selectedBrands]);

  function clearFilters() {
    setQuery("");
    setSelectedTypes([]);
    setSelectedBrands([]);
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <SiteNav />
        <header className="py-16">
          <p className="text-sm font-bold uppercase tracking-[.25em] text-red-500">Katalog</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">Znajdź swój motocykl.</h1>
          <p className="mt-4 max-w-2xl text-zinc-400">Przeglądaj modele, porównuj parametry i odkrywaj maszyny, które pasują do Twojego stylu jazdy.</p>
        </header>

        {demoMode && <p className="mb-5 rounded-2xl border border-amber-500/20 bg-amber-500/[.06] px-4 py-3 text-sm text-amber-200">Katalog demonstracyjny. Po skonfigurowaniu Supabase pokażą się zapisane tam motocykle.</p>}
        {error && <p role="alert" className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/[.06] px-4 py-3 text-sm text-red-200">{error}</p>}

        <section>
          <div className="rounded-2xl border border-white/10 bg-white/[.035] p-2 shadow-xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <input aria-label="Szukaj motocykla" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj marki lub modelu..." className="w-full rounded-xl border border-transparent bg-black/20 px-4 py-3 pl-10 text-sm outline-none placeholder:text-zinc-600 focus:border-red-500/40 focus:bg-black/30" />
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">⌕</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="group relative">
                  <button type="button" className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${selectedTypes.length ? "border-red-500/40 bg-red-500/10 text-white" : "border-white/10 bg-white/[.03] text-zinc-300 hover:bg-white/[.07]"}`}>Typ{selectedTypes.length ? ` · ${selectedTypes.length}` : ""} <span className="ml-2 text-zinc-500">⌄</span></button>
                  <div className="invisible absolute right-0 top-full z-20 mt-2 w-52 translate-y-1 rounded-2xl border border-white/10 bg-[#111] p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {types.map((type) => <label key={type} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/[.06]"><input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggle(type, setSelectedTypes)} className="h-4 w-4 accent-red-500" />{type}</label>)}
                  </div>
                </div>
                <div className="group relative">
                  <button type="button" className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${selectedBrands.length ? "border-red-500/40 bg-red-500/10 text-white" : "border-white/10 bg-white/[.03] text-zinc-300 hover:bg-white/[.07]"}`}>Marka{selectedBrands.length ? ` · ${selectedBrands.length}` : ""} <span className="ml-2 text-zinc-500">⌄</span></button>
                  <div className="invisible absolute right-0 top-full z-20 mt-2 w-52 translate-y-1 rounded-2xl border border-white/10 bg-[#111] p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {brands.map((brand) => <label key={brand} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/[.06]"><input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggle(brand, setSelectedBrands)} className="h-4 w-4 accent-red-500" />{brand}</label>)}
                  </div>
                </div>
                {(selectedTypes.length > 0 || selectedBrands.length > 0 || query) && <button onClick={clearFilters} className="rounded-xl px-3 py-3 text-sm font-semibold text-zinc-500 transition hover:bg-white/[.05] hover:text-white">Wyczyść</button>}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/[.03]" />)}</div>
          ) : error ? null : (
            <>
              <div className="mb-5 mt-5 flex items-center justify-between">
                <p className="text-sm text-zinc-500"><span className="font-semibold text-zinc-300">{filtered.length}</span> {filtered.length === 1 ? "motocykl" : "motocykli"}</p>
                {(selectedTypes.length > 0 || selectedBrands.length > 0 || query) && <p className="text-xs text-zinc-600">Aktywne filtry</p>}
              </div>
              {filtered.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/[.02] p-12 text-center">
                  <p className="text-lg font-bold">{bikes.length ? "Brak wyników" : "Katalog jest pusty"}</p>
                  <p className="mt-2 text-sm text-zinc-500">{bikes.length ? "Zmień filtry albo wyszukiwaną frazę." : "Dodaj motocykle w tabeli motorcycles w Supabase."}</p>
                  {(selectedTypes.length > 0 || selectedBrands.length > 0 || query) && <button onClick={clearFilters} className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black">Wyczyść filtry</button>}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((bike) => (
                    <Link key={bike.slug} href={`/motocykle/${encodeURIComponent(bike.slug)}`} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.03] transition hover:-translate-y-1 hover:border-red-500/30">
                      <div className="flex aspect-[16/10] items-end bg-gradient-to-br from-zinc-700 via-zinc-900 to-black p-5"><span className="rounded-full bg-black/50 px-3 py-1 text-xs text-zinc-300">{bike.motorcycle_type ?? "Motocykl"}</span></div>
                      <div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-red-400">{bike.brand}</p><h2 className="mt-1 text-xl font-bold">{bike.model}</h2><div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-500"><span>{bike.engine_cc ?? "—"} cm³</span><span>{bike.power_hp ?? "—"} KM</span><span>{bike.year}</span><span>Sprawdź →</span></div></div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
