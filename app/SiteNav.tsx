"use client";

import Link from "next/link";
import AuthNav from "./AuthNav";

export default function SiteNav() {
  return (
    <nav className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-lg shadow-black/20 backdrop-blur">
      <Link href="/" className="shrink-0 text-xl font-black tracking-tight">MOTO<span className="text-red-500">HUB</span></Link>
      <div className="hidden items-center gap-1 rounded-xl bg-black/20 p-1 text-sm md:flex">
        <Link href="/motocykle" className="rounded-lg px-4 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Motocykle</Link>
        <Link href="/garaz" className="rounded-lg px-4 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Garaż</Link>
        <Link href="/narzedzia" className="rounded-lg bg-white/5 px-4 py-2 text-zinc-300 transition hover:text-white">Narzędzia</Link>
        <Link href="/spolecznosc" className="rounded-lg px-4 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Społeczność</Link>
        <Link href="/profil" className="rounded-lg px-4 py-2 text-zinc-400 transition hover:text-white">Profil</Link>
      </div>
      <div className="flex shrink-0 items-center gap-2"><AuthNav /></div>
    </nav>
  );
}
