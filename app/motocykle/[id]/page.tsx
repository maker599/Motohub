import Link from "next/link";
import AddToGarage from "./AddToGarage";
import SiteNav from "../../SiteNav";
import { bikes } from "../motorcycles";

export const instant = false;

const descriptions: Record<string, string> = {
  Naked: "Uniwersalny motocykl drogowy nastawiony na zwinność, prostotę i codzienną jazdę.",
  Sport: "Sportowa konstrukcja drogowa z naciskiem na prowadzenie, hamowanie i osiągi.",
  Adventure: "Wszechstronny motocykl do dłuższych tras i jazdy po zróżnicowanych nawierzchniach.",
  Enduro: "Lekka konstrukcja terenowa przeznaczona do jazdy poza asfaltem.",
  MX: "Motocykl motocrossowy zaprojektowany do jazdy po zamkniętym torze.",
  Cruiser: "Drogowy motocykl o spokojniejszej ergonomii i charakterystycznym stylu.",
  Touring: "Motocykl nastawiony na komfort i pokonywanie dłuższych tras.",
};

export default async function BikePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bike = bikes.find((item) => item.id === id);

  if (!bike) {
    return <main className="min-h-screen bg-[#090909] text-white"><div className="mx-auto max-w-6xl px-5 py-5 lg:px-8"><SiteNav /><div className="mt-16 rounded-3xl border border-white/10 p-8"><h1 className="text-3xl font-black">Nie znaleziono motocykla</h1><Link href="/motocykle" className="mt-4 inline-block text-red-400">← Wróć do katalogu</Link></div></div></main>;
  }

  return <main className="min-h-screen bg-[#090909] text-white">
    <div className="mx-auto max-w-6xl px-5 py-5 lg:px-8">
      <SiteNav />
      <Link href="/motocykle" className="mt-7 inline-block text-sm text-zinc-500 hover:text-white">← Wróć do katalogu</Link>
      <div className="mt-6 grid gap-7 lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-700/70 via-zinc-900 to-black p-8 shadow-2xl shadow-black/30">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
          <div className="relative flex min-h-[430px] items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[.3em] text-red-500">{bike.brand}</p>
              <p className="mt-2 text-6xl font-black tracking-tighter sm:text-7xl">{bike.model}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300">{bike.type}</span>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300">{bike.year}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7">
          <p className="text-sm leading-6 text-zinc-400">{descriptions[bike.type] ?? "Motocykl drogowy z katalogu MotoHub."}</p>
          <div className="mt-7 grid grid-cols-2 gap-3">
            {[["Silnik", bike.engine], ["Moc", bike.power], ["Typ", bike.type], ["Rok", String(bike.year)]].map(([label, value]) =>
              <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-5"><p className="text-xs text-zinc-500">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>
            )}
          </div>
          <AddToGarage slug={id} defaultYear={bike.year} />
          <Link href="/narzedzia" className="mt-3 block rounded-2xl border border-white/10 bg-white/[.03] p-4 transition hover:border-red-500/30 hover:bg-white/[.05]"><p className="text-sm font-bold">🔧 2T Exhaust Lab</p><p className="mt-1 text-xs text-zinc-500">Zaawansowany kalkulator geometrii komory rezonansowej.</p></Link>
        </div>
      </div>
    </div>
  </main>;
}
