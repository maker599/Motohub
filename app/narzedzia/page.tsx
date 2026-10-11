import Link from "next/link";
import SiteNav from "../SiteNav";

const tools = [
  {
    href: "/narzedzia/kalkulator",
    number: "01",
    title: "2T Exhaust Lab",
    eyebrow: "Projektowanie wydechu",
    description: "Oblicz długość strojoną i geometrię sekcji komory rezonansowej. Zobacz profil układu oraz rozwinięcia blach.",
  },
  {
    href: "/narzedzia/tuning-2t",
    number: "02",
    title: "Analizator tuningu 2T",
    eyebrow: "Parametry silnika",
    description: "Oszacuj zakres mocy, przepływ gaźnika, timingi cylindra i dopasowanie pasma wydechu.",
  },
  {
    href: "/narzedzia/porting-2t",
    number: "03",
    title: "Porting kalkulator",
    eyebrow: "Geometria obróbki cylindra",
    description: "Wprowadź wymiary cylindra, ustaw układ portów i obejrzyj plan obróbki na modelu 3D.",
  },
  {
    href: "/narzedzia/kreator-setupu",
    number: "04",
    title: "Kreator setupu 2T",
    eyebrow: "Dobór części do silnika",
    description: "Wybierz cel i silnik, porównaj kompatybilne cylindry, dobierz osprzęt i zobacz listę oraz koszt setupu.",
  },
  {
    href: "/narzedzia/porownywarka-setupow",
    number: "05",
    title: "Porównywarka setupów",
    eyebrow: "Dwa zestawy obok siebie",
    description: "Zestaw dwa polecane setupy i porównaj części, klasę, szacowaną moc, pasmo obrotów oraz koszt.",
  },
  {
    href: "/narzedzia/strojenie-gaznika",
    number: "06",
    title: "Symulator gaźnika 2T",
    eyebrow: "Symulator regulacji i przepływów",
    description: "Kręć śrubami regulacyjnymi, zmieniaj dysze i iglicę. Obserwuj animowane przepływy w czasie rzeczywistym, wykres AFR i reakcję silnika na manetkę.",
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-7xl px-5 py-5 lg:px-8">
        <SiteNav />
        <header className="relative isolate mt-10 overflow-hidden rounded-[2rem] border border-red-500/20 bg-[#101010] px-6 py-7 sm:px-9 sm:py-9">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 12% 0%, rgba(239,68,68,.19), transparent 48%), linear-gradient(125deg, rgba(127,29,29,.13), transparent 58%)" }} />
          <div className="relative z-10 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[.3em] text-red-300">MotoHub / warsztat</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Narzędzia 2T</h1>
            <p className="mt-4 text-base leading-7 text-zinc-300/80">Kalkulatory i symulatory do projektowania wydechu, strojenia silnika oraz planowania obróbki cylindra.</p>
          </div>
        </header>

        <section aria-label="Dostępne narzędzia 2T" className="mt-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group relative isolate flex min-h-72 flex-col overflow-hidden rounded-3xl border border-red-500/20 bg-[#101010] p-6 transition hover:-translate-y-1 hover:border-red-400/40">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70 transition group-hover:opacity-100" style={{ background: "radial-gradient(ellipse at 8% 0%, rgba(239,68,68,.17), transparent 52%), linear-gradient(145deg, rgba(127,29,29,.1), transparent 62%)" }} />
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-red-500/[.07] blur-3xl transition group-hover:bg-red-500/[.12]" />
              <div className="relative z-10 flex flex-1 flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-[.2em] text-zinc-500">{tool.number}</span>
                  <span className="text-xl text-zinc-500 transition group-hover:translate-x-1 group-hover:text-white" aria-hidden="true">↗</span>
                </div>
                <div className="mt-auto pt-12">
                  <p className="text-[10px] font-bold uppercase tracking-[.2em] text-red-300">{tool.eyebrow}</p>
                  <h2 className="mt-2 text-2xl font-black">{tool.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{tool.description}</p>
                  <span className="mt-6 inline-flex rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-zinc-200 transition group-hover:border-red-300/30 group-hover:bg-red-500/15 group-hover:text-white">Otwórz narzędzie</span>
                </div>
              </div>
            </Link>
          ))}
        </section>
        <p className="mt-6 max-w-4xl text-xs leading-5 text-zinc-600">Wyniki zależą od poprawności wpisanych pomiarów. Modele geometrii pomagają planować warianty, ale nie zastępują pomiaru cylindra, dokumentacji ani kontroli po obróbce.</p>
      </div>
    </main>
  );
}
