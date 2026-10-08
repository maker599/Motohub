"use client";

import Link from "next/link";
import AuthNav from "./AuthNav";

export default function SiteNav() {
 return <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-lg shadow-black/20 backdrop-blur">
  <Link href="/" className="shrink-0 text-xl font-black tracking-tight">MOTO<span className="text-red-500">HUB</span></Link>
  <div className="flex flex-wrap items-center gap-1 rounded-xl bg-black/20 p-1 text-sm">
   <Link href="/motocykle" className="rounded-lg px-3 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Motocykle</Link>
   <Link href="/garaz" className="rounded-lg px-3 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Garaż</Link>
   <div className="group relative">
    <Link href="/narzedzia" className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-2 font-medium text-white transition hover:bg-white/15">Narzędzia <span className="text-[10px] text-zinc-500">▼</span></Link>
    <div className="invisible absolute left-0 top-full z-50 w-64 translate-y-1 pt-2 opacity-0 transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
      <div className="rounded-2xl border border-white/10 bg-[#111] p-2 shadow-2xl shadow-black/40">
        <Link href="/narzedzia/tuning-2t" className="block rounded-xl px-3 py-3 hover:bg-white/[.06]"><span className="block text-sm font-semibold text-white">Tuning 2T</span><span className="mt-1 block text-xs text-zinc-500">Analiza i charakterystyka silnika</span></Link>
        <Link href="/narzedzia/kalkulator" className="mt-1 block rounded-xl px-3 py-3 hover:bg-white/[.06]"><span className="block text-sm font-semibold text-white">Kalkulator wydechu</span><span className="mt-1 block text-xs text-zinc-500">Geometria komory rezonansowej</span></Link>
      </div>
    </div>
   </div>
   <Link href="/spolecznosc" className="rounded-lg px-3 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Społeczność</Link>
   <Link href="/profil" className="rounded-lg px-3 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Profil</Link>
  </div>
  <div className="flex shrink-0 items-center gap-2"><AuthNav /></div>
 </nav>;
}