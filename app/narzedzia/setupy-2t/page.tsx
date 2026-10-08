"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteNav from "../../SiteNav";

type Level = "seryjny" | "sport" | "wyścig";
type Platform = "AM6" | "Derbi D50B0" | "Piaggio Hi-Per2" | "Minarelli poziomy" | "Simson M5x1" | "uniwersalny";
type Setup = {
  id: string; name: string; level: Level; platform: Platform; displacement: string;
  use: string; character: string; parts: { group: string; examples: string; purpose: string }[];
  checks: string[]; caveat: string;
};

const setups: Setup[] = [
  {
    id: "am6-oem", name: "AM6 — odświeżenie serii", level: "seryjny", platform: "AM6", displacement: "50 cm³",
    use: "Ulica / niezawodność", character: "Przewidywalna praca w zakresie przewidzianym przez producenta.",
    parts: [
      { group: "Cylinder i tłok", examples: "OEM lub zestaw serwisowy o wymiarze zgodnym z pomiarem", purpose: "Przywrócenie kompresji i prawidłowych luzów." },
      { group: "Dolot", examples: "Fabryczny airbox, seryjny króciec i zawór membranowy", purpose: "Powtarzalny dolot i filtracja." },
      { group: "Zasilanie", examples: "Gaźnik w specyfikacji konkretnego modelu; dysze według instrukcji", purpose: "Punkt odniesienia do poprawnego strojenia." },
      { group: "Napęd", examples: "Tarcze sprzęgła i sprężyny o specyfikacji OEM", purpose: "Prawidłowe przenoszenie momentu." }
    ],
    checks: ["Pomiar cylindra i tłoka przed zakupem", "Test szczelności skrzyni korbowej", "Kontrola pompy oleju / układu smarowania", "Sprawdzenie chłodzenia i stanu łożysk"],
    caveat: "To plan serwisowy, nie lista części pasująca do każdego motocykla z AM6. Rocznik i osprzęt mogą się różnić."
  },
  {
    id: "am6-sport", name: "AM6 — sportowy zestaw drogowy", level: "sport", platform: "AM6", displacement: "zależnie od homologowanego zestawu",
    use: "Projekt drogowy zgodny z przepisami", character: "Cel: użyteczny środek obrotów bez zakładania konkretnej mocy.",
    parts: [
      { group: "Cylinder", examples: "Przykładowe rodziny: Top Performances Black Trophy, Airsal Sport — tylko wariant wskazany do AM6", purpose: "Inna charakterystyka i pojemność zależnie od wybranego SKU." },
      { group: "Wydech", examples: "Tecnigas, Yasuni lub Stage6 — wyłącznie model przeznaczony do danego cylindra i podwozia", purpose: "Zakres rezonansu musi pasować do rozrządu cylindra." },
      { group: "Gaźnik i dolot", examples: "Dell'Orto PHBG / odpowiednik w zakresie zaleconym przez producenta zestawu", purpose: "Dobór i strojenie do filtra, wydechu i cylindra." },
      { group: "Sprzęgło", examples: "Nowe sprężyny lub zestaw sprzęgła zgodny z AM6 i deklarowanym momentem", purpose: "Ograniczenie poślizgu po zmianie charakterystyki." }
    ],
    checks: ["Potwierdź numer katalogowy i średnicę sworznia", "Zweryfikuj głowicę, uszczelki i chłodzenie", "Po zmianach wykonaj strojenie gaźnika", "Sprawdź zgodność z przepisami drogowymi"],
    caveat: "Nazwy marek to przykłady rodzin produktów, nie gwarancja kompatybilności. Nie kupuj po samej nazwie marki lub pojemności."
  },
  {
    id: "derbi-service", name: "Derbi D50B0 — serwis i baza", level: "seryjny", platform: "Derbi D50B0", displacement: "50 cm³",
    use: "Ulica / baza do dalszej diagnostyki", character: "Najpierw przywrócenie szczelności, kompresji i prawidłowego zasilania.",
    parts: [
      { group: "Cylinder", examples: "OEM lub zestaw serwisowy jawnie opisany jako Derbi D50B0", purpose: "Wymiar dobierany po pomiarze, nie tylko po oznaczeniu silnika." },
      { group: "Gaźnik", examples: "Dell'Orto lub osprzęt fabryczny — identyfikuj po modelu gaźnika", purpose: "Utrzymanie poprawnego zasilania i punktu odniesienia." },
      { group: "Zapłon", examples: "Fabryczny układ CDI/stator zgodny z rocznikiem", purpose: "Uniknięcie problemów z wiązką i krzywą zapłonu." },
      { group: "Uszczelnienia", examples: "Uszczelniacze wału i komplet uszczelek do dokładnego wariantu silnika", purpose: "Szczelność skrzyni korbowej jest kluczowa w 2T." }
    ],
    checks: ["Odczytaj kod silnika i rocznik", "Porównaj rozstawy i numery OEM", "Sprawdź stan wału i łożysk", "Wykonaj test szczelności przed strojeniem"],
    caveat: "Derbi D50B0 i starsze rodziny Derbi nie są wymienne w ciemno. Potwierdź dokładny kod silnika."
  },
  {
    id: "piaggio-sport", name: "Skuter Piaggio Hi-Per2 — zestaw uliczny", level: "sport", platform: "Piaggio Hi-Per2", displacement: "50 cm³ lub zestaw zgodny z karterami",
    use: "Skuter / codzienna jazda", character: "Cały układ napędowy CVT ma znaczenie równie duże jak silnik.",
    parts: [
      { group: "Cylinder", examples: "Malossi Sport / Polini Sport — wyłącznie kit dla konkretnej wersji Piaggio", purpose: "Sprawdź chłodzenie powietrzem/cieczą i średnicę sworznia." },
      { group: "Wydech", examples: "Yasuni Z / Tecnigas Next-R jako przykładowe rodziny do weryfikacji aplikacji", purpose: "Charakterystyka wydechu musi współgrać z cylindrem." },
      { group: "Gaźnik i filtr", examples: "Seryjny airbox i gaźnik lub wariant wskazany w dokumentacji zestawu", purpose: "Filtr otwarty wymaga osobnego strojenia i może pogorszyć użyteczność." },
      { group: "CVT", examples: "Pasek w prawidłowym wymiarze, rolki i sprężyny dobrane po testach", purpose: "Dopasowanie obrotów pracy przekładni, bez uniwersalnej masy rolek." }
    ],
    checks: ["Potwierdź kod silnika i chłodzenie", "Zweryfikuj mocowanie wydechu i miejsce na ramie", "Sprawdź pasek, sprzęgło i dzwon", "Nie kopiuj ustawień rolek z innego skutera"],
    caveat: "Nazwa Hi-Per2 obejmuje różne konfiguracje. Rocznik, chłodzenie i wersja karterów wpływają na dobór."
  },
  {
    id: "minarelli-horizontal", name: "Minarelli poziomy — baza skuterowa", level: "seryjny", platform: "Minarelli poziomy", displacement: "50 cm³",
    use: "Skuter / serwis lub projekt sportowy", character: "Dobra baza do porównywania części, ale najpierw identyfikacja wersji silnika.",
    parts: [
      { group: "Cylinder", examples: "Airsal, Malossi, Polini — katalog musi wskazywać dokładny Minarelli horizontal i chłodzenie", purpose: "Zgodność z rozstawem szpilek, skokiem i sworzniem." },
      { group: "Wydech", examples: "Yasuni, Tecnigas, Stage6 — konkretny model dopasowany do zestawu", purpose: "Mocowanie i zakres pracy muszą odpowiadać aplikacji." },
      { group: "Przekładnia", examples: "Pasek, rolki, wariator i sprzęgło dla konkretnej wersji", purpose: "CVT ustawia silnik w użytecznym zakresie obrotów." },
      { group: "Wał", examples: "Wał OEM lub wzmacniany zgodny ze skokiem, korbowodem i łożyskami", purpose: "Weryfikacja geometrii oraz dopuszczalnych obrotów." }
    ],
    checks: ["Ustal poziomy/pionowy i chłodzenie", "Zweryfikuj numer katalogowy każdej części", "Sprawdź luz i stan łożysk wału", "Strojenie wykonuj po jednej zmianie naraz"],
    caveat: "Minarelli poziomy nie oznacza automatycznie kompatybilności z pionowym ani z każdą wersją chłodzenia."
  },
  {
    id: "simson", name: "Simson M5x1 — odnowienie klasyka", level: "seryjny", platform: "Simson M5x1", displacement: "50 cm³",
    use: "Klasyk / zachowanie fabrycznego charakteru", character: "Najpierw stan techniczny, szczelność i zgodność z oryginalną specyfikacją.",
    parts: [
      { group: "Cylinder i tłok", examples: "Części serwisowe do dokładnego wariantu M531/M541/M542", purpose: "Kontrola wymiaru, luzu i zgodności z cylindrem." },
      { group: "Zapłon", examples: "Oryginalny układ po kontroli albo zestaw zapłonu jawnie przeznaczony do danego modelu", purpose: "Poprawny moment zapłonu i niezawodność." },
      { group: "Gaźnik", examples: "BVF w odpowiednim wariancie lub zestaw wskazany przez producenta", purpose: "Fabryczna konfiguracja jest punktem odniesienia." },
      { group: "Wydech", examples: "Wydech o wymiarach zgodnych z modelem i przepisami", purpose: "Zachowanie właściwej charakterystyki i montażu." }
    ],
    checks: ["Rozróżnij kod silnika i wersję osprzętu", "Sprawdź wał, łożyska i uszczelniacze", "Ustaw zapłon według dokumentacji", "Sprawdź lokalne wymogi dotyczące pojazdu zabytkowego"],
    caveat: "M5x1 to rodzina oznaczeń, a nie jeden identyczny silnik. Potwierdź dokładny wariant."
  },
  {
    id: "custom", name: "Projekt własny — dane zamiast zgadywania", level: "wyścig", platform: "uniwersalny", displacement: "według pomiarów",
    use: "Warsztat / tor po weryfikacji", character: "Konfiguracja budowana na wymiarach, dokumentacji i wynikach pomiarów.",
    parts: [
      { group: "Geometria", examples: "Bore, stroke, długość korbowodu, squish i kąty portów", purpose: "Punkt wyjścia do oceny kompatybilności i zakresu obrotów." },
      { group: "Cylinder i wydech", examples: "Zestaw z kartą techniczną plus komora dopasowana do timingów", purpose: "Nie dobieraj wydechu wyłącznie po pojemności." },
      { group: "Zasilanie", examples: "Gaźnik, membrana i dolot dobrane do przepływu oraz dokumentacji", purpose: "Weryfikacja na hamowni i kontrola temperatur." },
      { group: "Dół silnika", examples: "Wał, korbowód, łożyska i sprzęgło o potwierdzonych parametrach", purpose: "Wszystkie elementy muszą wytrzymać zakładane obciążenia." }
    ],
    checks: ["Zapisz źródło każdego wymiaru", "Sprawdź luzy montażowe", "Weryfikuj smarowanie i chłodzenie", "Dokumentuj zmiany i pomiary"],
    caveat: "To karta planowania projektu, a nie instrukcja doboru ekstremalnych ustawień ani deklaracja osiągów."
  }
];

const labels: Record<Level, string> = { seryjny: "Serwis / OEM", sport: "Sport", wyścig: "Projekt / tor" };
const platforms = ["wszystkie", "AM6", "Derbi D50B0", "Piaggio Hi-Per2", "Minarelli poziomy", "Simson M5x1", "uniwersalny"] as const;

export default function SetupsPage() {
  const [level, setLevel] = useState("wszystkie");
  const [platform, setPlatform] = useState<(typeof platforms)[number]>("wszystkie");
  const [query, setQuery] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>(["am6-sport"]);
  const shown = useMemo(() => setups.filter(s =>
    (level === "wszystkie" || s.level === level) &&
    (platform === "wszystkie" || s.platform === platform) &&
    (s.name + " " + s.platform + " " + s.displacement + " " + s.use + " " + s.character + " " + s.parts.map(p => p.group + " " + p.examples + " " + p.purpose).join(" ") + " " + s.checks.join(" ")).toLowerCase().includes(query.toLowerCase())
  ), [level, platform, query]);

  return <main className="min-h-screen bg-[#090909] text-white"><div className="mx-auto max-w-7xl px-5 py-5 lg:px-8"><SiteNav />
    <div className="mt-8"><Link href="/narzedzia" className="text-sm text-zinc-500 hover:text-white">← Narzędzia</Link><p className="mt-5 text-xs font-black uppercase tracking-[.3em] text-red-500">MotoHub / Warsztat 2T</p><h1 className="mt-2 text-4xl font-black sm:text-5xl">Baza setupów 2T</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">Karty platform silnikowych, przykładowe rodziny części i listy kontrolne. Przykłady pomagają rozpocząć research — przed zakupem sprawdź dokładny numer katalogowy i dokumentację konkretnej wersji silnika.</p></div>
    <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-white/[.035] p-4 md:grid-cols-[1fr_auto]"><label className="text-xs text-zinc-400">Szukaj silnika, części lub producenta<input value={query} onChange={e => setQuery(e.target.value)} placeholder="np. AM6, Yasuni, cylinder, wał…" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-red-500/50" /></label><div className="flex flex-wrap items-end gap-2">{[["wszystkie", "Wszystkie"], ["seryjny", "Serwis/OEM"], ["sport", "Sport"], ["wyścig", "Projekt/tor"]].map(([v, t]) => <button key={v} type="button" onClick={() => setLevel(v)} className={"rounded-xl border px-3 py-3 text-xs font-semibold " + (level === v ? "border-red-500/40 bg-red-500/15 text-red-200" : "border-white/10 text-zinc-400 hover:text-white")}>{t}</button>)}</div><label className="text-xs text-zinc-400 md:col-span-2">Platforma silnika<select value={platform} onChange={e => setPlatform(e.target.value as (typeof platforms)[number])} className="mt-2 w-full rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-white">{platforms.map(p => <option key={p} value={p}>{p === "wszystkie" ? "Wszystkie platformy" : p}</option>)}</select></label></div>
    <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-zinc-500"><span>{shown.length} kart platform / konfiguracji</span><span>{saved.length} zapisanych w bieżącej sesji</span></div>
    <div className="mt-4 grid gap-4 xl:grid-cols-2">{shown.map(s => <article key={s.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><span className="rounded-lg border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-400">{labels[s.level]}</span><span className="rounded-lg bg-red-500/10 px-2 py-1 text-[10px] font-bold text-red-200">{s.platform}</span></div><h2 className="mt-3 text-xl font-bold">{s.name}</h2><p className="mt-1 text-xs text-zinc-500">{s.displacement} · {s.use}</p></div><button type="button" onClick={() => setSaved(v => v.includes(s.id) ? v.filter(x => x !== s.id) : [...v, s.id])} className={"rounded-xl border px-3 py-2 text-xs font-semibold " + (saved.includes(s.id) ? "border-red-500/40 bg-red-500/10 text-red-200" : "border-white/10 text-zinc-400 hover:text-white")}>{saved.includes(s.id) ? "✓ Zapisano" : "☆ Zapisz"}</button></div>
      <p className="mt-4 text-sm leading-6 text-zinc-300">{s.character}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{s.parts.slice(0, 2).map(p => <div key={p.group} className="rounded-xl bg-black/25 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-red-300">{p.group}</p><p className="mt-2 text-xs leading-5 text-zinc-300">{p.examples}</p></div>)}</div>
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setExpanded(v => v.includes(s.id) ? v.filter(x => x !== s.id) : [...v, s.id])} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5">{expanded.includes(s.id) ? "Ukryj szczegóły ↑" : "Części i lista kontrolna ↓"}</button><span className="self-center text-[10px] text-zinc-600">Przykłady wymagają sprawdzenia SKU</span></div>
      {expanded.includes(s.id) && <div className="mt-4 border-t border-white/10 pt-4"><h3 className="text-sm font-bold">Przykładowe elementy zestawu</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{s.parts.map(p => <div key={p.group} className="rounded-xl border border-white/5 p-3"><p className="text-xs font-bold text-zinc-200">{p.group}</p><p className="mt-1 text-xs leading-5 text-zinc-400">{p.examples}</p><p className="mt-2 text-[11px] leading-5 text-zinc-600">{p.purpose}</p></div>)}</div><h3 className="mt-5 text-sm font-bold">Lista kontrolna</h3><ul className="mt-2 grid gap-2 sm:grid-cols-2">{s.checks.map(c => <li key={c} className="flex gap-2 text-xs leading-5 text-zinc-400"><span className="text-red-400">✓</span>{c}</li>)}</ul><p className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[.04] p-3 text-xs leading-5 text-amber-100/80">{s.caveat}</p></div>}
    </article>)}</div>
    {shown.length === 0 && <div className="mt-5 rounded-2xl border border-white/10 p-8 text-center text-sm text-zinc-500">Brak wyników. Zmień frazę lub filtry.</div>}
    <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/[.04] p-4 text-xs leading-5 text-amber-100/80"><b>Uwaga:</b> nazwy producentów i serii są przykładami do dalszego sprawdzenia, nie potwierdzeniem dopasowania. Numery katalogowe, rocznik, kod silnika, chłodzenie, skok, średnica sworznia i wymagania homologacyjne mają pierwszeństwo. Model wykresu w symulatorze nie jest pomiarem z hamowni.</div>
    <div className="mt-5 flex flex-wrap gap-3"><Link href="/narzedzia/kalkulator" className="rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-400">Kalkulator wydechu →</Link><Link href="/narzedzia/tuning-2t" className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-zinc-300 hover:bg-white/5">Analizator 2T →</Link></div>
  </div></main>;
}
