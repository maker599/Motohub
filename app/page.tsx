import Link from "next/link";
import SiteNav from "./SiteNav";

const quickLinks = [
  { number: "01", eyebrow: "KATALOG", title: "Odkryj motocykle", description: "Przeglądaj modele, poznawaj specyfikacje i znajdź maszynę dla siebie.", href: "/motocykle", icon: "↗" },
  { number: "02", eyebrow: "TWÓJ ŚWIAT", title: "Mój garaż", description: "Zbierz swoje motocykle w jednym miejscu i personalizuj swoją kolekcję.", href: "/garaz", icon: "⌁" },
  { number: "03", eyebrow: "WORKSHOP", title: "Narzędzia", description: "Przejdź do Tuning 2T albo projektuj geometrię wydechu.", href: "/narzedzia", icon: "⌘" },
  { number: "04", eyebrow: "COMMUNITY", title: "Społeczność", description: "Dziel się pasją i sprawdzaj, co publikują inni motocykliści.", href: "/spolecznosc", icon: "↗" },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#08090b] text-white">
      <div className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_24%,rgba(220,38,38,0.20),transparent_34%),radial-gradient(ellipse_at_8%_58%,rgba(255,255,255,0.055),transparent_30%)]" />
        <div className="mx-auto max-w-7xl px-5 pt-5 sm:px-8">
          <SiteNav />
          <section className="relative grid min-h-[590px] items-center gap-10 pb-16 pt-16 lg:grid-cols-[1.02fr_.98fr] lg:pb-24 lg:pt-20">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/[0.08] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.2em] text-red-300">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,.9)]" />
                Platforma dla motocyklistów
              </div>
              <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[.93] tracking-[-.055em] sm:text-7xl xl:text-[5.6rem]">
                TWOJA PASJA.<br />TWÓJ <span className="text-red-500">MOTOHUB.</span>
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
                Katalog motocykli, własny garaż i narzędzia dla tych, którzy chcą wiedzieć o swojej maszynie więcej.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/motocykle" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-3.5 text-sm font-extrabold transition hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400">
                  Przeglądaj motocykle <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/garaz" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[.035] px-6 py-3.5 text-sm font-bold transition hover:border-white/30 hover:bg-white/[.07]">
                  Otwórz garaż <span aria-hidden="true">→</span>
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold uppercase tracking-[.16em] text-zinc-500">
                <span>Motocykle</span><span className="text-red-500">/</span><span>Garaż</span><span className="text-red-500">/</span><span>Warsztat</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[590px] lg:ml-auto">
              <div aria-hidden="true" className="absolute inset-8 rounded-full bg-red-600/20 blur-[90px]" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#111216] p-3 shadow-2xl shadow-black/50">
                <div className="relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[1.45rem] border border-white/[.06] bg-[linear-gradient(135deg,#202126_0%,#111216_48%,#08090b_100%)] p-6 sm:min-h-[430px] sm:p-8">
                  <div aria-hidden="true" className="absolute inset-0 opacity-70" style={{ backgroundImage: "linear-gradient(125deg, transparent 0 48%, rgba(239,68,68,.12) 48.2%, transparent 48.7%), radial-gradient(ellipse at 65% 48%, rgba(220,38,38,.22), transparent 38%)" }} />
                  <div className="relative flex items-start justify-between gap-4">
                    <div><p className="text-[10px] font-black uppercase tracking-[.3em] text-zinc-500">MOTOHUB / 001</p><p className="mt-2 text-sm font-bold text-zinc-200">RIDE YOUR WAY</p></div>
                    <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-zinc-400">Est. for riders</span>
                  </div>
                  <div className="relative my-8 flex flex-1 items-center justify-center">
                    <svg viewBox="0 0 560 300" role="img" aria-label="Stylizowana ilustracja sportowego motocykla" className="w-full max-w-[520px] drop-shadow-[0_22px_28px_rgba(0,0,0,.7)]">
                      <defs><linearGradient id="bike-red" x1="0" x2="1"><stop offset="0%" stopColor="#7f1d1d"/><stop offset="48%" stopColor="#ef4444"/><stop offset="100%" stopColor="#991b1b"/></linearGradient><linearGradient id="bike-metal" x1="0" x2="1"><stop offset="0%" stopColor="#3f3f46"/><stop offset="50%" stopColor="#d4d4d8"/><stop offset="100%" stopColor="#52525b"/></linearGradient></defs>
                      <ellipse cx="278" cy="255" rx="220" ry="15" fill="#000" opacity=".48"/>
                      <circle cx="150" cy="218" r="62" fill="#09090b" stroke="#52525b" strokeWidth="5"/><circle cx="150" cy="218" r="43" fill="none" stroke="#27272a" strokeWidth="9"/><circle cx="150" cy="218" r="7" fill="#a1a1aa"/>
                      <circle cx="423" cy="218" r="62" fill="#09090b" stroke="#52525b" strokeWidth="5"/><circle cx="423" cy="218" r="43" fill="none" stroke="#27272a" strokeWidth="9"/><circle cx="423" cy="218" r="7" fill="#a1a1aa"/>
                      <path d="M150 218 L230 153 L321 218 L258 218 L230 153 L183 145 L150 218" fill="none" stroke="url(#bike-metal)" strokeWidth="11" strokeLinejoin="round"/>
                      <path d="M321 218 L373 153 L423 218" fill="none" stroke="url(#bike-metal)" strokeWidth="10" strokeLinejoin="round"/>
                      <path d="M183 145 L225 112 L301 112 L346 142 L373 153 L321 169 L269 156 L230 153" fill="url(#bike-red)" stroke="#f87171" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M225 112 L245 88 L298 88 L319 112 Z" fill="#18181b" stroke="#71717a" strokeWidth="3"/>
                      <path d="M249 88 L262 75 L303 75 L319 88" fill="none" stroke="#a1a1aa" strokeWidth="5" strokeLinecap="round"/>
                      <path d="M346 142 L375 124 L403 128 L423 218" fill="none" stroke="#71717a" strokeWidth="8" strokeLinecap="round"/>
                      <path d="M373 153 L392 135 L416 141" fill="none" stroke="#d4d4d8" strokeWidth="5" strokeLinecap="round"/>
                      <path d="M183 145 L163 123 L185 118 L213 136" fill="#27272a" stroke="#71717a" strokeWidth="3"/>
                      <path d="M274 158 L305 160 L328 190 L299 204 L270 189 Z" fill="#27272a" stroke="#52525b" strokeWidth="3"/>
                      <path d="M269 189 L250 218 M299 204 L321 218" stroke="#a1a1aa" strokeWidth="8" strokeLinecap="round"/>
                      <path d="M184 145 L205 151 L226 142" fill="none" stroke="#fca5a5" strokeWidth="4" strokeLinecap="round"/>
                      <path d="M352 142 L370 146 L383 159" fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round"/>
                      <path d="M205 151 L183 192 L150 218 M183 192 L230 218" fill="none" stroke="#52525b" strokeWidth="4"/>
                    </svg>
                  </div>
                  <div className="relative flex items-end justify-between gap-4 border-t border-white/10 pt-5">
                    <div><p className="text-[10px] font-bold uppercase tracking-[.25em] text-red-400">Twoje miejsce</p><p className="mt-1 text-xl font-black tracking-tight sm:text-2xl">ODKRYWAJ. BUDUJ. JEDŹ.</p></div>
                    <span className="text-3xl font-light text-red-500">↗</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-2 hidden rounded-xl border border-white/10 bg-[#151519] px-4 py-3 shadow-xl sm:block">
                <p className="text-[9px] font-bold uppercase tracking-[.2em] text-zinc-500">Twoja motocyklowa baza</p><p className="mt-1 text-sm font-extrabold">Wszystko w jednym miejscu</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="border-y border-white/[.07] bg-[#0d0e11]">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-[11px] font-black uppercase tracking-[.28em] text-red-500">Szybki dostęp</p><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Twój dashboard.</h2></div>
            <p className="max-w-md text-sm leading-6 text-zinc-500">Wybierz sekcję i wróć do tego, co najważniejsze.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="group flex min-h-[235px] flex-col rounded-2xl border border-white/[.08] bg-white/[.025] p-5 transition duration-200 hover:-translate-y-1 hover:border-red-500/40 hover:bg-white/[.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                <div className="flex items-center justify-between"><span className="text-[10px] font-black tracking-[.24em] text-zinc-500">{item.number} / {item.eyebrow}</span><span className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-lg text-zinc-400 transition group-hover:border-red-500/30 group-hover:text-red-400">{item.icon}</span></div>
                <h3 className="mt-8 text-xl font-extrabold tracking-tight">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{item.description}</p>
                <span className="mt-auto pt-5 text-xs font-extrabold text-red-400">Otwórz sekcję <span className="inline-block transition group-hover:translate-x-1">→</span></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#111216] p-7 sm:p-10 lg:p-14">
          <div aria-hidden="true" className="absolute -right-12 -top-24 h-72 w-72 rounded-full bg-red-600/15 blur-[80px]" />
          <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl"><p className="text-[10px] font-black uppercase tracking-[.28em] text-red-500">Dla tych, których ciągnie na trasę</p><h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Zacznij od swojej maszyny.</h2><p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400 sm:text-base">Poznaj katalog, dodaj motocykl do garażu albo zajrzyj do warsztatu z narzędziami MotoHub.</p></div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col xl:flex-row">
              <Link href="/motocykle" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-extrabold transition hover:bg-red-500">Katalog motocykli ↗</Link>
              <Link href="/narzedzia" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-bold transition hover:bg-white/[.06]">Otwórz narzędzia →</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[.07]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-8"><p>© 2026 MotoHub. Zbudowane z pasji do motocykli.</p><p className="font-semibold uppercase tracking-[.2em]">Ride your way.</p></div>
      </footer>
    </main>
  );
}
