import Link from "next/link";
import AuthNav from "./AuthNav";
import SiteNav from "./SiteNav";

const features = [
  { title: "Znajdź motocykl", text: "Przeglądaj motocykle i odkrywaj modele dopasowane do Twoich zainteresowań.", href: "/motocykle" },
  { title: "Twój garaż", text: "Zbieraj swoje motocykle w jednym miejscu i buduj własny wirtualny garaż.", href: "/garaz" },
  { title: "Społeczność", text: "Dziel się zajawką, poznawaj innych motocyklistów i rozmawiaj o motocyklach.", href: "/spolecznosc" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(239,68,68,0.16),transparent_32%),radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.06),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <SiteNav />

          <div className="grid min-h-[620px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400"><span className="h-2 w-2 rounded-full bg-red-500" />Miejsce dla motocyklistów</div>
              <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.04em] sm:text-6xl lg:text-8xl">Twoja pasja.<br />Twój <span className="text-red-500">MotoHub.</span></h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-zinc-400">Odkrywaj motocykle, buduj swój garaż i poznawaj ludzi, którzy mają tę samą zajawkę. Wszystko w jednym miejscu.</p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link href="/motocykle" className="rounded-full bg-red-500 px-7 py-4 text-center font-bold text-white transition hover:bg-red-400">Odkryj motocykle</Link>
                <Link href="/rejestracja" className="rounded-full border border-white/15 bg-white/5 px-7 py-4 text-center font-bold text-white transition hover:bg-white/10">Stwórz konto</Link>
              </div>
            </div>

            <div className="relative hidden min-h-[420px] lg:block">
              <div className="absolute right-0 top-1/2 h-[390px] w-[390px] -translate-y-1/2 rounded-full bg-red-500/10 blur-3xl" />
              <div className="absolute right-8 top-1/2 w-[430px] -translate-y-1/2 rotate-[-6deg] rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-800 to-zinc-950 p-3 shadow-2xl">
                <div className="flex aspect-[4/5] items-end overflow-hidden rounded-[1.5rem] bg-[linear-gradient(145deg,#27272a,#090909)] p-8">
                  <div><p className="text-sm font-semibold uppercase tracking-[0.25em] text-red-400">Ride your way</p><p className="mt-3 text-5xl font-black tracking-tight">RIDE.<br />SHARE.<br />REPEAT.</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0d0d0d]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="mb-12 max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">MotoHub</p><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Wszystko, czego potrzebujesz.</h2></div>
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <Link key={feature.title} href={feature.href} className="group rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-1 hover:border-red-500/30 hover:bg-white/[0.05]">
                <div className="mb-16 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/10 text-sm font-black text-red-400">0{index + 1}</div>
                <h3 className="text-2xl font-bold">{feature.title}</h3><p className="mt-3 leading-7 text-zinc-400">{feature.text}</p><span className="mt-7 inline-block text-sm font-bold text-red-400 transition group-hover:translate-x-1">Sprawdź →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900 to-[#101010] p-8 sm:p-12 lg:p-16">
          <div className="max-w-2xl"><p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">Gotowy?</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Wskakuj do MotoHub.</h2><p className="mt-5 leading-7 text-zinc-400">Załóż konto i zacznij budować swoje miejsce w świecie motocykli.</p><Link href="/rejestracja" className="mt-8 inline-block rounded-full bg-white px-7 py-4 font-bold text-black transition hover:bg-zinc-200">Zacznij teraz</Link></div>
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between lg:px-8"><p>© 2026 MotoHub. Zbudowane z pasji do motocykli.</p><p className="text-zinc-600">Ride your way.</p></div>
      </footer>
    </main>
  );
}
