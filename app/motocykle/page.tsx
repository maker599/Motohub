"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteNav from "../SiteNav";

const bikes = [
  { id:"yamaha-mt07", brand:"Yamaha", model:"MT-07", year:2025, engine:"689 cm³", type:"Naked", power:"73 KM" },
  { id:"honda-cbr650r", brand:"Honda", model:"CBR650R", year:2025, engine:"649 cm³", type:"Sport", power:"95 KM" },
  { id:"bmw-r1300gs", brand:"BMW", model:"R 1300 GS", year:2025, engine:"1 300 cm³", type:"Adventure", power:"145 KM" },
  { id:"kawasaki-z900", brand:"Kawasaki", model:"Z900", year:2025, engine:"948 cm³", type:"Naked", power:"125 KM" },
  { id:"ducati-monster", brand:"Ducati", model:"Monster", year:2025, engine:"937 cm³", type:"Naked", power:"111 KM" },
  { id:"ktm-890-adventure", brand:"KTM", model:"890 Adventure", year:2024, engine:"889 cm³", type:"Adventure", power:"105 KM" },
];

const types = ["Naked", "Sport", "Adventure", "Touring"];
const brands = ["Yamaha", "Honda", "BMW", "Kawasaki", "Ducati", "KTM"];

export default function MotorcyclesPage() {
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  function toggle(value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((current) => current.includes(value) ? current.filter((x) => x !== value) : [...current, value]);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bikes.filter((bike) => {
      const matchesQuery = !q || `${bike.brand} ${bike.model} ${bike.type}`.toLowerCase().includes(q);
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(bike.type);
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(bike.brand);
      return matchesQuery && matchesType && matchesBrand;
    });
  }, [query, selectedTypes, selectedBrands]);

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

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[.03] p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Filtry</h2>
              {(selectedTypes.length > 0 || selectedBrands.length > 0 || query) && (
                <button onClick={clearFilters} className="text-xs font-bold text-red-400 hover:text-red-300">Wyczyść</button>
              )}
            </div>
            <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-zinc-500">Typ</label>
            <div className="mt-3 space-y-2">
              {types.map((type) => (
                <label key={type} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm text-zinc-300 hover:bg-white/[.04]">
                  <input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggle(type, setSelectedTypes)} className="h-4 w-4 accent-red-500" />
                  {type}
                </label>
              ))}
            </div>
            <label className="mt-7 block text-xs font-bold uppercase tracking-wider text-zinc-500">Marka</label>
            <div className="mt-3 space-y-2">
              {brands.map((brand) => (
                <label key={brand} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm text-zinc-300 hover:bg-white/[.04]">
                  <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggle(brand, setSelectedBrands)} className="h-4 w-4 accent-red-500" />
                  {brand}
                </label>
              ))}
            </div>
          </aside>

          <section>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
              <input aria-label="Szukaj motocykla" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj marki lub modelu..." className="w-full rounded-2xl border border-white/10 bg-white/[.04] px-5 py-4 text-sm outline-none placeholder:text-zinc-600 focus:border-red-500/50" />
              <button onClick={() => setQuery(query.trim())} className="rounded-2xl bg-red-500 px-6 py-4 text-sm font-bold hover:bg-red-400">Szukaj</button>
            </div>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-zinc-500">{filtered.length} {filtered.length === 1 ? "motocykl" : "motocykli"}</p>
              {(selectedTypes.length > 0 || selectedBrands.length > 0 || query) && <p className="text-xs text-zinc-600">Aktywne filtry</p>}
            </div>
            {filtered.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/[.02] p-12 text-center">
                <p className="text-lg font-bold">Brak wyników</p>
                <p className="mt-2 text-sm text-zinc-500">Zmień filtry albo wyszukiwaną frazę.</p>
                <button onClick={clearFilters} className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black">Wyczyść filtry</button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((bike) => (
                  <Link key={bike.id} href={"/motocykle/"+bike.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.03] transition hover:-translate-y-1 hover:border-red-500/30">
                    <div className="flex aspect-[16/10] items-end bg-gradient-to-br from-zinc-700 via-zinc-900 to-black p-5">
                      <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-zinc-300">{bike.type}</span>
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-bold uppercase tracking-wider text-red-400">{bike.brand}</p>
                      <h2 className="mt-1 text-xl font-bold">{bike.model}</h2>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-500">
                        <span>{bike.engine}</span><span>{bike.power}</span><span>{bike.year}</span><span>Sprawdź →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
