import Link from "next/link";
import AddToGarage from "./AddToGarage";
import SiteNav from "../../SiteNav";

export const instant = false;

const bikes: Record<string, {brand:string; model:string; year:number; engine:string; power:string; type:string; weight:string; description:string}> = {
  "yamaha-mt07": {brand:"Yamaha",model:"MT-07",year:2025,engine:"689 cm³",power:"73 KM",type:"Naked",weight:"183 kg",description:"Lekki i wszechstronny naked z charakterystycznym silnikiem CP2."},
  "honda-cbr650r": {brand:"Honda",model:"CBR650R",year:2025,engine:"649 cm³",power:"95 KM",type:"Sport",weight:"209 kg",description:"Czterocylindrowy sportowiec łączący codzienną użyteczność z charakterem CBR."},
  "bmw-r1300gs": {brand:"BMW",model:"R 1300 GS",year:2025,engine:"1 300 cm³",power:"145 KM",type:"Adventure",weight:"237 kg",description:"Duży adventure do długich tras i jazdy w zróżnicowanym terenie."},
  "kawasaki-z900": {brand:"Kawasaki",model:"Z900",year:2025,engine:"948 cm³",power:"125 KM",type:"Naked",weight:"213 kg",description:"Mocny naked z czterocylindrowym silnikiem i sportowym charakterem."},
  "ducati-monster": {brand:"Ducati",model:"Monster",year:2025,engine:"937 cm³",power:"111 KM",type:"Naked",weight:"179 kg",description:"Lekki, dynamiczny naked o charakterystycznym włoskim charakterze."},
  "ktm-890-adventure": {brand:"KTM",model:"890 Adventure",year:2024,engine:"889 cm³",power:"105 KM",type:"Adventure",weight:"215 kg",description:"Wszechstronny adventure nastawiony na długie trasy i jazdę poza asfaltem."},
};

export default async function BikePage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const bike=bikes[id] ?? bikes["yamaha-mt07"];
  return <main className="min-h-screen bg-[#090909] text-white">
    <div className="mx-auto max-w-6xl px-5 py-5 lg:px-8">
      <SiteNav />
      <Link href="/motocykle" className="mt-7 inline-block text-sm text-zinc-500 hover:text-white">← Wróć do katalogu</Link>
      <div className="mt-6 grid gap-7 lg:grid-cols-[1.05fr_.95fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-700/70 via-zinc-900 to-black p-8 shadow-2xl shadow-black/30">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-red-500/10 blur-3xl" />
          <div className="relative flex h-full min-h-[430px] items-end">
            <div><p className="text-xs font-black uppercase tracking-[.3em] text-red-500">{bike.brand}</p><p className="mt-2 text-6xl font-black tracking-tighter sm:text-7xl">{bike.model}</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300">{bike.type}</span><span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-zinc-300">{bike.year}</span></div></div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/[.035] p-7">
          <p className="text-sm leading-6 text-zinc-400">{bike.description}</p>
          <div className="mt-7 grid grid-cols-2 gap-3">{[["Silnik",bike.engine],["Moc",bike.power],["Masa",bike.weight],["Rok",String(bike.year)]].map(([a,b])=><div key={a} className="rounded-2xl border border-white/10 bg-black/20 p-5"><p className="text-xs text-zinc-500">{a}</p><p className="mt-1 text-xl font-black">{b}</p></div>)}</div>
          <AddToGarage slug={id} defaultYear={bike.year} />
          <Link href="/narzedzia" className="mt-3 block rounded-2xl border border-white/10 bg-white/[.03] p-4 transition hover:border-red-500/30 hover:bg-white/[.05]"><p className="text-sm font-bold">🔧 2T Exhaust Lab</p><p className="mt-1 text-xs text-zinc-500">Zaawansowany kalkulator geometrii komory rezonansowej.</p></Link>
        </div>
      </div>
    </div>
  </main>;
}
