import Link from "next/link";

const bikes = [
  { id:"yamaha-mt07", brand:"Yamaha", model:"MT-07", year:2025, engine:"689 cm³", type:"Naked", power:"73 KM" },
  { id:"honda-cbr650r", brand:"Honda", model:"CBR650R", year:2025, engine:"649 cm³", type:"Sport", power:"95 KM" },
  { id:"bmw-r1300gs", brand:"BMW", model:"R 1300 GS", year:2025, engine:"1 300 cm³", type:"Adventure", power:"145 KM" },
  { id:"kawasaki-z900", brand:"Kawasaki", model:"Z900", year:2025, engine:"948 cm³", type:"Naked", power:"125 KM" },
  { id:"ducati-monster", brand:"Ducati", model:"Monster", year:2025, engine:"937 cm³", type:"Naked", power:"111 KM" },
  { id:"ktm-890-adventure", brand:"KTM", model:"890 Adventure", year:2024, engine:"889 cm³", type:"Adventure", power:"105 KM" },
];

export default function MotorcyclesPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <nav className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link href="/" className="text-2xl font-black">MOTO<span className="text-red-500">HUB</span></Link>
          <div className="flex gap-5 text-sm text-zinc-400">
            <Link href="/motocykle" className="text-white">Motocykle</Link>
            <Link href="/garaz">Garaż</Link>
            <Link href="/spolecznosc">Społeczność</Link>
          </div>
          <Link href="/rejestracja" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black">Dołącz</Link>
        </nav>

        <header className="py-16">
          <p className="text-sm font-bold uppercase tracking-[.25em] text-red-500">Katalog</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">Znajdź swój motocykl.</h1>
          <p className="mt-4 max-w-2xl text-zinc-400">Przeglądaj modele, porównuj parametry i odkrywaj maszyny, które pasują do Twojego stylu jazdy.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <aside className="h-fit rounded-3xl border border-white/10 bg-white/[.03] p-5">
            <h2 className="font-bold">Filtry</h2>
            <label className="mt-6 block text-xs font-bold uppercase tracking-wider text-zinc-500">Typ</label>
            <div className="mt-3 space-y-2 text-sm text-zinc-300">
              <p>○ Naked</p><p>○ Sport</p><p>○ Adventure</p><p>○ Touring</p>
            </div>
            <label className="mt-7 block text-xs font-bold uppercase tracking-wider text-zinc-500">Marka</label>
            <div className="mt-3 space-y-2 text-sm text-zinc-300">
              <p>□ Yamaha</p><p>□ Honda</p><p>□ BMW</p><p>□ Kawasaki</p><p>□ Ducati</p>
            </div>
          </aside>

          <section>
            <div className="mb-5 flex flex-col gap-3 sm:flex-row">
              <input aria-label="Szukaj motocykla" placeholder="Szukaj marki lub modelu..." className="w-full rounded-2xl border border-white/10 bg-white/[.04] px-5 py-4 text-sm outline-none placeholder:text-zinc-600 focus:border-red-500/50" />
              <button className="rounded-2xl bg-red-500 px-6 py-4 text-sm font-bold hover:bg-red-400">Szukaj</button>
            </div>
            <p className="mb-5 text-sm text-zinc-500">{bikes.length} motocykli</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {bikes.map((bike) => (
                <Link key={bike.id} href={"/motocykle/"+bike.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.03] transition hover:-translate-y-1 hover:border-red-500/30">
                  <div className="flex aspect-[16/10] items-end bg-gradient-to-br from-zinc-700 via-zinc-900 to-black p-5">
                    <span className="rounded-full bg-black/50 px-3 py-1 text-xs text-zinc-300">{bike.type}</span>
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-red-400">{bike.brand}</p>
                    <h2 className="mt-1 text-xl font-bold">{bike.model}</h2>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-500">
                      <span>{bike.engine}</span><span>{bike.power}</span><span>{bike.year}</span><span>Sprawdź →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
