import Link from "next/link";
import AddToGarage from "./AddToGarage";

const bikes: Record<string, {brand:string; model:string; year:number; engine:string; power:string; type:string; weight:string}> = {
  "yamaha-mt07": {brand:"Yamaha",model:"MT-07",year:2025,engine:"689 cm³",power:"73 KM",type:"Naked",weight:"183 kg"},
  "honda-cbr650r": {brand:"Honda",model:"CBR650R",year:2025,engine:"649 cm³",power:"95 KM",type:"Sport",weight:"209 kg"},
  "bmw-r1300gs": {brand:"BMW",model:"R 1300 GS",year:2025,engine:"1 300 cm³",power:"145 KM",type:"Adventure",weight:"237 kg"},
  "kawasaki-z900": {brand:"Kawasaki",model:"Z900",year:2025,engine:"948 cm³",power:"125 KM",type:"Naked",weight:"213 kg"},
  "ducati-monster": {brand:"Ducati",model:"Monster",year:2025,engine:"937 cm³",power:"111 KM",type:"Naked",weight:"179 kg"},
  "ktm-890-adventure": {brand:"KTM",model:"890 Adventure",year:2024,engine:"889 cm³",power:"105 KM",type:"Adventure",weight:"215 kg"},
};

export default async function BikePage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const bike=bikes[id] ?? bikes["yamaha-mt07"];
  return <main className="min-h-screen bg-[#090909] text-white"><div className="mx-auto max-w-6xl px-6 py-6 lg:px-8">
    <Link href="/motocykle" className="text-sm text-zinc-500 hover:text-white">← Wróć do katalogu</Link>
    <div className="mt-8 grid gap-8 lg:grid-cols-2">
      <div className="aspect-[4/3] rounded-[2rem] bg-gradient-to-br from-zinc-700 via-zinc-900 to-black" />
      <div className="py-4"><p className="text-sm font-bold uppercase tracking-[.25em] text-red-500">{bike.brand}</p><h1 className="mt-2 text-5xl font-black">{bike.model}</h1><p className="mt-4 text-zinc-400">{bike.type} · {bike.year}</p>
      <div className="mt-10 grid grid-cols-2 gap-3">{[["Silnik",bike.engine],["Moc",bike.power],["Masa",bike.weight],["Rok",String(bike.year)]].map(([a,b])=><div key={a} className="rounded-2xl border border-white/10 bg-white/[.03] p-5"><p className="text-xs text-zinc-500">{a}</p><p className="mt-1 text-lg font-bold">{b}</p></div>)}</div>
      <AddToGarage slug={id} /></div>
    </div>
  </div></main>;
}
