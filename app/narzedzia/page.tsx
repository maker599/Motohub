import Link from "next/link";
import SiteNav from "../SiteNav";

const modules = [
  { href: "/narzedzia/porting-lab", tag: "NOWE · LAB 2T", title: "Porting Lab 2T", desc: "Interaktywny przekrój cylindra, edytowalne pomiary geometrii, biblioteka rodzin cylindrów, checklista oraz eksport karty projektu." },
  { href: "/narzedzia/tuning-2t", tag: "SYMULATOR", title: "Moc i obroty 2T", desc: "Parametry cylindra, przykładowe presety AM6, Derbi, skuterów i Simsona oraz model porównawczy mocy." },
  { href: "/narzedzia/setupy-2t", tag: "BAZA", title: "Baza setupów 2T", desc: "Platformy AM6, Derbi D50B0, Piaggio Hi-Per2, Minarelli poziomy i Simson; przykładowe części oraz kontrola kompatybilności." },
  
  { href: "/narzedzia/kalkulator", tag: "KALKULATOR", title: "Kalkulator wydechu", desc: "Projekt geometrii komory rezonansowej, wymiary sekcji i eksport rysunku do wydruku." },
];

export default function ToolsPage() {
  return <main className="min-h-screen bg-[#090909] text-white"><div className="mx-auto max-w-7xl px-5 py-5 lg:px-8"><SiteNav />
    <section className="mt-12"><p className="text-xs font-black uppercase tracking-[.3em] text-red-500">MotoHub / Narzędzia</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Narzędzia</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Wybierz moduł. Każde narzędzie działa osobno i ma własny ekran roboczy.</p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">{modules.map((module) => <Link key={module.href} href={module.href} className={`group rounded-3xl border p-6 transition hover:-translate-y-1 hover:bg-white/[.055] ${module.href === "/narzedzia/porting-lab" ? "border-red-500/50 bg-red-950/20 shadow-[0_0_32px_rgba(220,38,38,0.08)]" : "border-white/10 bg-white/[.035] hover:border-red-500/30"}`}>
        <div className="flex items-start justify-between gap-5"><div><span className="text-[10px] font-black uppercase tracking-[.25em] text-red-500">{module.tag}</span><h2 className="mt-3 text-2xl font-black">{module.title}</h2><p className="mt-2 max-w-md text-sm leading-6 text-zinc-400">{module.desc}</p></div><span className="text-2xl text-zinc-600 transition group-hover:translate-x-1 group-hover:text-white">→</span></div>
      </Link>)}</div>
    </section>
  </div></main>;
}