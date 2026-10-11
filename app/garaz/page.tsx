"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SiteNav from "../SiteNav";
import { readLocalGarage, removeLocalGarageBike, updateLocalGarageMileage, type LocalGarageBike } from "../lib/local-garage";
import ServiceLogPanel from "./ServiceLogPanel";

type Item = LocalGarageBike;

export default function GaragePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);
  const [localMode, setLocalMode] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadGarage() {
      try {
        const authResponse = await fetch("/api/auth/me", { cache: "no-store" });
        const authData = await authResponse.json();
        if (!authData.user) {
          if (active) {
            setItems(readLocalGarage());
            setLocalMode(true);
          }
          return;
        }
        const response = await fetch("/api/garage", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401 || data.error === "Brak konfiguracji Supabase.") {
            if (active) {
              setItems(readLocalGarage());
              setLocalMode(true);
            }
          } else if (active) setError(data.error ?? "Nie udało się pobrać garażu.");
          return;
        }
        if (active) {
          const localItems = readLocalGarage();
          const remoteSlugs = new Set((data.items ?? []).map((item: Item) => item.motorcycles?.slug));
          const additionalLocalItems = localItems.filter((item) => !remoteSlugs.has(item.motorcycles.slug));
          setItems([...(data.items ?? []), ...additionalLocalItems]);
          setLocalMode(additionalLocalItems.length > 0);
        }
      } catch {
        if (active) {
          setItems(readLocalGarage());
          setLocalMode(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadGarage();
    return () => { active = false; };
  }, []);

  async function remove(id: string) {
    setRemoving(id);
    setError("");
    try {
      if (id.startsWith("local:")) {
        removeLocalGarageBike(id);
        setItems((current) => current.filter((item) => item.id !== id));
        return;
      }
      const response = await fetch("/api/garage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (response.ok) setItems((current) => current.filter((item) => item.id !== id));
      else setError(data.error ?? "Nie udało się usunąć motocykla.");
    } catch {
      setError("Nie udało się połączyć z serwerem.");
    } finally {
      setRemoving(null);
    }
  }

  const stats = useMemo(() => ({
    count: items.length,
    horsepower: items.reduce((sum, item) => sum + (item.motorcycles?.power_hp ?? 0), 0),
    mileage: items.reduce((sum, item) => sum + (item.mileage ?? 0), 0),
  }), [items]);

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <SiteNav />

        <section className="py-12 md:py-16">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[.25em] text-red-500">Twój garaż</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Twoje maszyny.</h1>
              <p className="mt-3 max-w-xl text-zinc-500">
                Wszystkie motocykle, które masz na oku i które należą do Twojej kolekcji.
              </p>
            </div>
            <Link href="/motocykle" className="inline-flex w-fit items-center rounded-full bg-red-500 px-5 py-3 text-sm font-bold transition hover:bg-red-400">
              + Dodaj motocykl
            </Link>
          </div>

          {loading ? (
            <div className="mt-10 grid gap-3 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/[.03]" />
              ))}
            </div>
          ) : error ? (
            <div className="mt-10 rounded-3xl border border-red-500/20 bg-red-500/[.06] p-6">
              <p className="font-semibold text-red-300">{error}</p>
              <Link href="/logowanie" className="mt-4 inline-block text-sm font-bold underline underline-offset-4">Przejdź do logowania</Link>
            </div>
          ) : (
            <>
              {localMode && <p className="mt-5 rounded-xl border border-amber-300/15 bg-amber-300/[.035] px-4 py-3 text-xs leading-5 text-amber-100/75">Garaż lokalny: dane zapisują się w tej przeglądarce. Zaloguj się i skonfiguruj Supabase, aby synchronizować je między urządzeniami.</p>}
              <div className="mt-10 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Motocykle</p>
                  <p className="mt-2 text-3xl font-black">{stats.count}</p>
                  <p className="mt-1 text-sm text-zinc-600">w Twoim garażu</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Łączna moc</p>
                  <p className="mt-2 text-3xl font-black">{stats.horsepower || "—"} <span className="text-base text-zinc-500">KM</span></p>
                  <p className="mt-1 text-sm text-zinc-600">dla zapisanych maszyn</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">Łączny przebieg</p>
                  <p className="mt-2 text-3xl font-black">{stats.mileage ? stats.mileage.toLocaleString("pl-PL") : "—"} <span className="text-base text-zinc-500">km</span></p>
                  <p className="mt-1 text-sm text-zinc-600">uzupełnionych danych</p>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="mt-6 rounded-[2rem] border border-dashed border-white/15 bg-white/[.02] p-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-2xl text-red-400">+</div>
                  <h2 className="mt-5 text-xl font-bold">Twój garaż jest pusty</h2>
                  <p className="mt-2 text-sm text-zinc-500">Otwórz katalog i dodaj pierwszy motocykl.</p>
                  <Link href="/motocykle" className="mt-6 inline-block rounded-full bg-red-500 px-6 py-3 font-bold transition hover:bg-red-400">Przeglądaj motocykle</Link>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item) => {
                    const bike = item.motorcycles;
                    return (
                      <article key={item.id} className="group overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[.03] transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[.05]">
                        <div className="flex h-28 items-end justify-between bg-gradient-to-br from-white/[.08] to-transparent p-5">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[.2em] text-red-400">{bike?.motorcycle_type ?? "Motocykl"}</p>
                            <h2 className="mt-1 text-2xl font-black">{bike?.brand ?? "Nieznana marka"} {bike?.model ?? ""}</h2>
                          </div>
                          <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-bold text-zinc-400">{bike?.year ?? "—"}</span>
                        </div>
                        <div className="p-5">
                          {item.nickname && <p className="mb-4 text-sm font-medium text-zinc-300">„{item.nickname}”</p>}
                          <div className="grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-black/20 py-3">
                            <div className="px-3 text-center"><p className="text-xs text-zinc-600">Silnik</p><p className="mt-1 text-sm font-bold">{bike?.engine_cc ?? "—"} <span className="font-normal text-zinc-600">cc</span></p></div>
                            <div className="px-3 text-center"><p className="text-xs text-zinc-600">Moc</p><p className="mt-1 text-sm font-bold">{bike?.power_hp ?? "—"} <span className="font-normal text-zinc-600">KM</span></p></div>
                            <div className="px-3 text-center"><p className="text-xs text-zinc-600">Przebieg</p><p className="mt-1 text-sm font-bold">{item.mileage != null ? item.mileage.toLocaleString("pl-PL") : "—"}</p></div>
                          </div>
                          <ServiceLogPanel garageId={item.id} motorcycleName={`${bike?.brand ?? ""} ${bike?.model ?? "Motocykl"}`} mileage={item.mileage} onMileageChange={(mileage) => { setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, mileage } : entry)); if (item.id.startsWith("local:")) updateLocalGarageMileage(item.id, mileage); }} />
                          <div className="mt-5 flex items-center justify-between gap-3">
                            {bike?.slug ? <Link href={`/motocykle/${encodeURIComponent(bike.slug)}`} className="text-sm font-bold text-white transition hover:text-red-400">Zobacz motocykl →</Link> : <span />}
                            <button onClick={() => remove(item.id)} disabled={removing === item.id} className="text-sm font-semibold text-zinc-600 transition hover:text-red-400 disabled:opacity-50">
                              {removing === item.id ? "Usuwanie..." : "Usuń"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
