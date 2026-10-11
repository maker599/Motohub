import Link from "next/link";
import { Suspense } from "react";
import SiteNav from "../../SiteNav";

type SharedSetup = {
  name: string;
  engine: string;
  goal: string;
  setup: {
    bike?: string;
    year?: string;
    totalPln?: number;
    totalEur?: number;
    cylinder?: { brand?: string; name?: string; displacement?: string; power?: [number, number]; rpm?: [number, number] };
    parts?: { category?: string; brand?: string; name?: string; priceEur?: number; url?: string; includedInCylinder?: boolean; keepExisting?: boolean; requiresFitmentCheck?: boolean }[];
  };
};

const goals: Record<string, string> = { daily: "Trwały daily", sport: "Sport", race: "Racing", track: "Tor / high-end" };
const categories: Record<string, string> = { crankshaft: "Wał korbowy", bearings: "Łożyska", carburetor: "Gaźnik", intakeManifold: "Króciec", reed: "Membrana", exhaust: "Wydech", clutch: "Sprzęgło", ignition: "Zapłon", airFilter: "Filtr powietrza", waterPump: "Pompa wody" };

async function getSharedSetup(token: string): Promise<SharedSetup | null> {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/get_shared_setup`, {
      method: "POST",
      headers: { apikey: supabaseKey, "Content-Type": "application/json" },
      body: JSON.stringify({ p_token: token }),
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as SharedSetup | null;
  } catch {
    return null;
  }
}

async function SharedSetupContent({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const setup = await getSharedSetup(token);

  return (
    <main className="min-h-screen bg-[#090909] px-5 py-5 text-white sm:px-8">
      <div className="mx-auto max-w-5xl"><SiteNav />
        {!setup ? <section className="py-24 text-center"><p className="text-xs font-bold uppercase tracking-[.2em] text-red-300">Udostępniony setup</p><h1 className="mt-3 text-3xl font-black">Ten link jest niedostępny</h1><p className="mt-3 text-sm text-zinc-500">Właściciel mógł wyłączyć udostępnianie albo usunąć konfigurację.</p><Link href="/narzedzia/kreator-setupu" className="mt-6 inline-block rounded-lg bg-red-500 px-4 py-2.5 text-sm font-bold">Otwórz kreator</Link></section> : <>
          <header className="border-b border-white/10 py-10"><p className="text-xs font-bold uppercase tracking-[.2em] text-red-300">Udostępniona konfiguracja · {setup.engine}</p><h1 className="mt-3 text-3xl font-black sm:text-4xl">{setup.name}</h1><p className="mt-2 text-sm text-zinc-400">{goals[setup.goal] ?? setup.goal}{setup.setup.bike ? ` · ${setup.setup.bike}${setup.setup.year ? ` · ${setup.setup.year}` : ""}` : ""}</p></header>
          <section className="grid gap-4 py-6 sm:grid-cols-3"><div className="border-l-2 border-red-400 pl-4"><p className="text-[10px] uppercase tracking-wider text-zinc-500">Cylinder</p><p className="mt-1 font-bold">{setup.setup.cylinder?.brand} {setup.setup.cylinder?.name}</p><p className="text-xs text-zinc-500">{setup.setup.cylinder?.displacement}</p></div><div className="border-l-2 border-white/15 pl-4"><p className="text-[10px] uppercase tracking-wider text-zinc-500">Koszt orientacyjny</p><p className="mt-1 font-bold">{typeof setup.setup.totalPln === "number" ? new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(setup.setup.totalPln) : "Nie podano"}</p></div><div className="border-l-2 border-white/15 pl-4"><p className="text-[10px] uppercase tracking-wider text-zinc-500">Potencjał cylindra</p><p className="mt-1 font-bold">{setup.setup.cylinder?.power?.join("–") ?? "—"} KM</p><p className="text-xs text-zinc-500">{setup.setup.cylinder?.rpm?.join("–") ?? "—"} obr./min</p></div></section>
          <section className="border-t border-white/10 py-6"><div className="flex items-baseline justify-between"><h2 className="text-lg font-bold">Lista części</h2><span className="text-xs text-zinc-500">{setup.setup.parts?.length ?? 0} pozycji</span></div><div className="mt-4 divide-y divide-white/[.07] border-y border-white/[.07]">{setup.setup.parts?.map((part, index) => <div key={`${part.category}-${index}`} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="text-xs font-semibold">{categories[part.category ?? ""] ?? part.category} · {part.brand}</p><p className="mt-1 text-xs text-zinc-500">{part.name}{part.includedInCylinder ? " · w zestawie cylindra" : part.keepExisting ? " · pozostaw / skontroluj" : part.requiresFitmentCheck ? " · potwierdź zgodność" : ""}</p></div><a href={part.url || undefined} target="_blank" rel="noreferrer" className="text-xs font-semibold text-red-200 underline underline-offset-4">{part.url ? "Karta części ↗" : part.includedInCylinder ? "W zestawie" : "—"}</a></div>)}</div><p className="mt-4 text-[11px] leading-5 text-zinc-600">Ceny i zgodność mają charakter orientacyjny. Przed zakupem sprawdź rocznik, wariant silnika i numer części u sprzedawcy.</p></section>
          <Link href="/narzedzia/kreator-setupu" className="inline-block rounded-lg bg-red-500 px-4 py-2.5 text-xs font-bold">Zbuduj własny setup</Link>
        </>}
      </div>
    </main>
  );
}

function SharedSetupFallback() {
  return <main className="min-h-screen bg-[#090909] px-5 py-5 text-white sm:px-8"><div className="mx-auto max-w-5xl"><Link href="/" className="text-xl font-black">MOTO<span className="text-red-500">HUB</span></Link><p className="py-24 text-center text-sm text-zinc-500">Wczytywanie udostępnionego setupu…</p></div></main>;
}

export default function SharedSetupPage(props: { params: Promise<{ token: string }> }) {
  return <Suspense fallback={<SharedSetupFallback />}><SharedSetupContent params={props.params} /></Suspense>;
}