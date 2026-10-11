"use client";

import Link from "next/link";
import AuthNav from "./AuthNav";

export default function SiteNav() {
  return (
    <nav className="relative z-50 flex flex-wrap items-center justify-between gap-2 overflow-visible rounded-2xl border border-white/10 bg-[#111315]/90 px-3 py-3 shadow-lg shadow-black/30 backdrop-blur-xl">
      <Link href="/" className="shrink-0 text-xl font-black tracking-tight text-white transition hover:text-red-300">MOTO<span className="text-red-500">HUB</span></Link>
      <div className="hidden min-w-0 items-center gap-0.5 rounded-xl border border-white/8 bg-black/20 p-1 text-xs lg:flex">
        <Link href="/motocykle" className="whitespace-nowrap rounded-lg px-2 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Motocykle</Link>
        <Link href="/garaz" className="whitespace-nowrap rounded-lg px-2 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Garaż</Link>
        <Link href="/zakupy" className="whitespace-nowrap rounded-lg px-2 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Zakupy</Link>
        <div className="group relative z-[60]">
          <Link href="/narzedzia" className="inline-flex whitespace-nowrap items-center gap-1 rounded-lg px-2 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-300">
            Narzędzia 2T <span aria-hidden="true" className="text-[10px] transition group-hover:rotate-180">⌄</span>
          </Link>
          <div className="invisible absolute left-0 top-full z-[70] w-72 translate-y-1 pt-2 opacity-0 transition duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <div className="rounded-2xl border border-white/10 bg-[#111315]/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl">
              <Link href="/narzedzia/kalkulator" className="block rounded-xl px-3 py-2.5 transition hover:bg-white/[.07] focus-visible:bg-white/[.07] focus-visible:outline-none">
                <span className="block text-sm font-semibold text-white">2T Exhaust Lab</span><span className="mt-1 block text-[11px] text-zinc-500">Projekt wydechu rezonansowego</span>
              </Link>
              <Link href="/narzedzia/tuning-2t" className="block rounded-xl px-3 py-2.5 transition hover:bg-white/[.07] focus-visible:bg-white/[.07] focus-visible:outline-none">
                <span className="block text-sm font-semibold text-white">Analizator tuningu 2T</span><span className="mt-1 block text-[11px] text-zinc-500">Moc, dolot, cylinder i pasmo wydechu</span>
              </Link>
              <Link href="/narzedzia/porting-2t" className="block rounded-xl px-3 py-2.5 transition hover:bg-white/[.07] focus-visible:bg-white/[.07] focus-visible:outline-none">
                <span className="block text-sm font-semibold text-white">Porting kalkulator</span><span className="mt-1 block text-[11px] text-zinc-500">Uniwersalny model obróbki cylindra 2T</span>
              </Link>
              <Link href="/narzedzia/kreator-setupu" className="block rounded-xl px-3 py-2.5 transition hover:bg-white/[.07] focus-visible:bg-white/[.07] focus-visible:outline-none">
                <span className="block text-sm font-semibold text-white">Kreator setupu 2T</span><span className="mt-1 block text-[11px] text-zinc-500">Dobór cylindra, części i kosztu zestawu</span>
              </Link>
              <Link href="/narzedzia/porownywarka-setupow" className="block rounded-xl px-3 py-2.5 transition hover:bg-white/[.07] focus-visible:bg-white/[.07] focus-visible:outline-none">
                <span className="block text-sm font-semibold text-white">Porównywarka setupów</span><span className="mt-1 block text-[11px] text-zinc-500">Koszt, moc, pasmo i części</span>
              </Link>
            </div>
          </div>
        </div>
        <Link href="/spolecznosc" className="whitespace-nowrap rounded-lg px-2 py-2 text-zinc-400 transition hover:bg-white/5 hover:text-white">Społeczność</Link>
        <Link href="/profil" className="whitespace-nowrap rounded-lg px-2 py-2 text-zinc-400 transition hover:text-white">Profil</Link>
      </div>
      <div className="flex shrink-0 items-center gap-2"><AuthNav /></div>
      <div className="flex basis-full items-center justify-around border-t border-white/[.06] pt-2 lg:hidden">
        <Link href="/garaz" className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white">Garaż</Link>
        <Link href="/narzedzia" className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white">Narzędzia</Link>
        <Link href="/zakupy" className="rounded-lg px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white">Zakupy</Link>
      </div>
    </nav>
  );
}
