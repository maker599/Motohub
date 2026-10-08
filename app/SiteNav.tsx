"use client";

import Link from "next/link";
import AuthNav from "./AuthNav";

const tools=[
 {href:"/narzedzia",label:"Wszystkie narzędzia"},
 {href:"/narzedzia/tuning-2t",label:"Tuning 2T"},
 {href:"/narzedzia",label:"Wydech 2T"},
];

export default function SiteNav() {
 return <nav className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 shadow-lg shadow-black/20 backdrop-blur">
  <Link href="/" className="shrink-0 text-xl font-black tracking-tight">MOTO<span className="text-red-500">HUB</span></Link>
  <div className="hidden items-center gap-1 rounded-xl bg-black/20 p-1 text-sm md:flex">
   <Link href="/motocykle" className="rounded-lg px-4 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Motocykle</Link>
   <div className="group relative">
    <Link href="/narzedzia" className="block rounded-lg bg-white/5 px-4 py-2 text-zinc-300 transition hover:text-white">Narzędzia</Link>
    <div className="invisible absolute left-0 top-full z-50 mt-2 w-48 rounded-xl border border-white/10 bg-zinc-950 p-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
     {tools.map(t=><Link key={t.href+t.label} href={t.href} className="block rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white">{t.label}</Link>)}
    </div>
   </div>
   <Link href="/garaz" className="rounded-lg px-4 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Garaż</Link>
   <Link href="/spolecznosc" className="rounded-lg px-4 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Społeczność</Link>
   <Link href="/profil" className="rounded-lg px-4 py-2 text-zinc-400 transition hover:text-white">Profil</Link>
  </div>
  <div className="flex shrink-0 items-center gap-2"><AuthNav /></div>
 </nav>;
}
