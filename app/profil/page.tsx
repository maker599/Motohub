"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteNav from "../SiteNav";

type User = { id: string; email: string; username: string | null };
type GarageItem = { id: string };

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [garageCount, setGarageCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/garage", { cache: "no-store" }).then((r) => r.ok ? r.json() : { items: [] }),
    ]).then(([auth, garage]) => {
      setUser(auth.user ?? null);
      setGarageCount(Array.isArray(garage.items) ? garage.items.length : 0);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <main className="min-h-screen bg-[#090909] px-6 py-6 text-white"><div className="mx-auto max-w-7xl"><SiteNav /><div className="py-24 text-center text-zinc-500">Ładowanie profilu...</div></div></main>;

  if (!user) return <main className="min-h-screen bg-[#090909] px-6 py-6 text-white"><div className="mx-auto max-w-7xl"><SiteNav /><div className="mx-auto max-w-xl py-24 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">🔒</div><h1 className="mt-6 text-3xl font-black">Zaloguj się, aby zobaczyć profil</h1><p className="mt-3 text-zinc-500">Tutaj znajdziesz swoje konto, garaż i najważniejsze skróty.</p><Link href="/logowanie" className="mt-7 inline-block rounded-full bg-red-500 px-7 py-3 font-bold">Zaloguj się</Link></div></div></main>;

  const username = user.username || user.email.split("@")[0];
  const initial = username.slice(0, 1).toUpperCase();

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-6 text-white">
      <div className="mx-auto max-w-7xl">
        <SiteNav />
        <section className="py-12 lg:py-16">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-500/10 via-white/[.03] to-transparent p-7 sm:p-10">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />
            <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-red-500 text-3xl font-black shadow-xl shadow-red-500/10">{initial}</div>
                <div><p className="text-sm font-bold uppercase tracking-[.2em] text-red-400">Mój profil</p><h1 className="mt-1 text-4xl font-black tracking-tight">{username}</h1><p className="mt-2 text-sm text-zinc-500">{user.email}</p></div>
              </div>
              <Link href="/garaz" className="rounded-full bg-white px-6 py-3 text-center text-sm font-bold text-black transition hover:bg-zinc-200">Otwórz garaż →</Link>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[.03] p-6"><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">W garażu</p><p className="mt-3 text-3xl font-black">{garageCount}</p><p className="mt-1 text-sm text-zinc-600">motocykli</p></div>
            <div className="rounded-3xl border border-white/10 bg-white/[.03] p-6"><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Konto</p><p className="mt-3 text-3xl font-black">Aktywne</p><p className="mt-1 text-sm text-zinc-600">MotoHub</p></div>
            <div className="rounded-3xl border border-white/10 bg-white/[.03] p-6"><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Status</p><p className="mt-3 text-3xl font-black text-red-400">Rider</p><p className="mt-1 text-sm text-zinc-600">członek społeczności</p></div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Link href="/motocykle" className="group rounded-3xl border border-white/10 bg-white/[.03] p-7 transition hover:-translate-y-1 hover:border-red-500/30">
              <p className="text-sm font-bold text-red-400">Katalog</p><h2 className="mt-2 text-2xl font-black">Znajdź motocykl</h2><p className="mt-2 text-zinc-500">Przeglądaj modele i dodawaj swoje maszyny do garażu.</p><span className="mt-6 inline-block font-bold text-white">Przejdź do katalogu →</span>
            </Link>
            <Link href="/spolecznosc" className="group rounded-3xl border border-white/10 bg-white/[.03] p-7 transition hover:-translate-y-1 hover:border-red-500/30">
              <p className="text-sm font-bold text-red-400">Społeczność</p><h2 className="mt-2 text-2xl font-black">Poznaj innych riderów</h2><p className="mt-2 text-zinc-500">Sprawdź, co dzieje się w MotoHub i dołącz do rozmowy.</p><span className="mt-6 inline-block font-bold text-white">Otwórz społeczność →</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
