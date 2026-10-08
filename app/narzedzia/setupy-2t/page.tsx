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
    id: "am6-top-86", name: "AM6 / Top Performances 86 — karta projektu", level: "wyścig", platform: "AM6", displacement: "klasa ok. 86 cm³ — potwierdź konkretny kit",
    use: "Projekt torowy / warsztat", character: "Duży zestaw wymaga traktowania cylindra, wału, wydechu i skrzyni korbowej jako jednego projektu.",
    parts: [
      { group: "Cylinder", examples: "Top Performances / TPR — wyszukaj dokładny zestaw przeznaczony do AM6; sama nazwa 86 nie potwierdza wersji", purpose: "Zweryfikuj rzeczywistą pojemność, średnicę, skok i dokumentację producenta." },
      { group: "Wał i dół silnika", examples: "Wał i korbowód z potwierdzoną zgodnością z konkretnym zestawem; łożyska i uszczelniacze dobrane do aplikacji", purpose: "Weryfikacja geometrii, luzów i zakresu pracy przez specjalistę." },
      { group: "Wydech", examples: "Komora high-end dedykowana do danego cylindra i ramy", purpose: "Mocowanie i charakterystyka muszą odpowiadać dokumentacji cylindra." },
      { group: "Osprzęt", examples: "Gaźnik, membrana, zapłon i sprzęgło wskazane w dokumentacji zestawu", purpose: "Nie zakładaj uniwersalnych ustawień ani kompatybilności między producentami." }
    ],
    checks: ["Potwierdź SKU, rocznik i bazę silnika", "Poproś specjalistę o kontrolę karterów i luzów", "Zweryfikuj chłodzenie, smarowanie i zapłon", "Ustal przeznaczenie torowe i wymagania bezpieczeństwa"],
    caveat: "Karta koncepcyjna do planowania zakupów. Nie potwierdza, że konkretny zestaw Top Performances 86 pasuje do każdego AM6."
  },
  {
    id: "am6-stage6-88", name: "AM6 / Stage6 — projekt klasy 88", level: "wyścig", platform: "AM6", displacement: "klasa ok. 88 cm³ — do weryfikacji",
    use: "Projekt high-end / tor", character: "Najpierw identyfikacja dokładnego cylindra i jego karty technicznej; oznaczenie pojemności nie wystarcza do doboru reszty.",
    parts: [
      { group: "Cylinder", examples: "Stage6 R/T lub inna seria wyłącznie wtedy, gdy katalog producenta potwierdza konkretny zestaw i platformę", purpose: "Nie przypisuj serii Stage6 R/T automatycznie do pojemności 88 cm³." },
      { group: "Wał", examples: "Zestaw wału / korbowodu rekomendowany dla wybranego cylindra", purpose: "Zgodność skoku, długości korbowodu, sworznia i luzów montażowych." },
      { group: "Wydech i dolot", examples: "Komora, króciec, membrana i gaźnik z potwierdzoną aplikacją", purpose: "Cały przepływ i rezonans powinny być oceniane jako system." },
      { group: "Zapłon i sprzęgło", examples: "Komponenty dobrane według limitów i dokumentacji zestawu", purpose: "Kontrola kompatybilności elektrycznej i przenoszenia obciążenia." }
    ],
    checks: ["Zweryfikuj numer katalogowy przed zakupem", "Potwierdź zgodność zestawu z karterami AM6", "Zleć pomiar montażowy i kontrolę luzów", "Wyniki weryfikuj na hamowni przez fachowca"],
    caveat: "To nazwa klasy projektu, a nie twierdzenie, że Stage6 ma uniwersalny kit 88 cm³ pasujący do AM6."
  },
  {
    id: "derbi-italkit", name: "Derbi D50B0 / Italkit — high-end", level: "wyścig", platform: "Derbi D50B0", displacement: "według konkretnego zestawu",
    use: "Projekt torowy / specjalistyczny", character: "Konfiguracja zależy od dokładnej rodziny Italkit, kodu silnika i dostępnych elementów towarzyszących.",
    parts: [
      { group: "Cylinder", examples: "Italkit — wybierz konkretny kit wyraźnie katalogowany do D50B0; nie przenoś specyfikacji AM6", purpose: "Potwierdź średnicę, skok, głowicę i zawartość zestawu." },
      { group: "Wał i łożyska", examples: "Komponenty przewidziane przez producenta zestawu lub wyspecjalizowany warsztat", purpose: "Weryfikacja obciążeń i geometrii całego dołu silnika." },
      { group: "Wydech", examples: "Wydech pod konkretny cylinder i kąty portów", purpose: "Kształt komory musi być dopasowany do konkretnej specyfikacji." },
      { group: "Zasilanie i zapłon", examples: "Gaźnik, membrana i zapłon wskazane dla wybranej wersji", purpose: "Ustawienia zależą od części, paliwa i pomiarów; nie kopiuj gotowych wartości." }
    ],
    checks: ["Sprawdź, czy kit jest dokładnie dla D50B0", "Porównaj instrukcję i numery katalogowe", "Skontroluj chłodzenie i szczelność", "Przeprowadź walidację w warsztacie"],
    caveat: "Italkit ma różne rodziny i aplikacje. Ta karta nie potwierdza dostępności ani dopasowania konkretnego zestawu."
  },
  {
    id: "scooter-88", name: "Skuter 2T / klasa 88 — projekt big bore", level: "wyścig", platform: "Piaggio Hi-Per2", displacement: "klasa 80–90 cm³ — zależnie od zestawu",
    use: "Skuter torowy / projekt custom", character: "Przy skuterze trzeba zweryfikować nie tylko silnik, ale też przekładnię CVT, mocowania i chłodzenie.",
    parts: [
      { group: "Cylinder", examples: "Stage6, Malossi, Polini lub Italkit — tylko konkretne SKU dla wskazanego silnika i chłodzenia", purpose: "Nie wszystkie serie producentów występują w każdej pojemności i platformie." },
      { group: "Wał i kartery", examples: "Wał i obróbka tylko według dokumentacji konkretnego zestawu", purpose: "Kontrola prześwitów i geometrii przez wyspecjalizowany warsztat." },
      { group: "Wydech", examples: "Komora do konkretnego cylindra, mocowania i ramy", purpose: "Sprawdź miejsce, temperaturę i kompatybilność z osłonami." },
      { group: "CVT", examples: "Warianty paska, wariatora i sprzęgła dobrane do aplikacji", purpose: "Elementy napędu muszą być kompatybilne i sprawdzone pod obciążeniem." }
    ],
    checks: ["Potwierdź wersję Hi-Per2 i chłodzenie", "Sprawdź mocowania i prześwity", "Zleć kontrolę wału i karterów", "Nie traktuj ustawień CVT z innego skutera jako recepty"],
    caveat: "Przykładowa klasa pojemności do katalogu projektów; dobór części wymaga dokładnej identyfikacji silnika."
  },
  {
    id: "am6-95", name: "AM6 / klasa 90–95 — custom big bore", level: "wyścig", platform: "AM6", displacement: "90–95 cm³ — tylko jeśli potwierdza to konkretny projekt",
    use: "Custom / tor, po konsultacji z warsztatem", character: "Nie jest to standardowy uniwersalny zestaw. Wymiary, dostępność części i zakres prac zależą od konkretnego projektu.",
    parts: [
      { group: "Cylinder / tuleja", examples: "Wyłącznie kompletny, udokumentowany zestaw dla określonej bazy; ewentualna obróbka tylko według projektu specjalisty", purpose: "Pojemność wynika z rzeczywistych wymiarów cylindra i skoku." },
      { group: "Wał i dół silnika", examples: "Projektowane jako zgodny komplet: wał, korbowód, łożyska i kartery", purpose: "Wymaga weryfikacji wytrzymałości i geometrii, nie doboru na podstawie samej nazwy." },
      { group: "Wydech i zasilanie", examples: "Wykonane lub dobrane pod dokumentację konkretnego cylindra", purpose: "Nie istnieje jedna konfiguracja pasująca do wszystkich projektów 90–95 cm³." },
      { group: "Chłodzenie i bezpieczeństwo", examples: "Układ chłodzenia, smarowanie, hamulce i podwozie ocenione do przeznaczenia pojazdu", purpose: "Zmiana obciążeń wymaga całościowej oceny pojazdu." }
    ],
    checks: ["Poproś o pisemną specyfikację i listę części", "Potwierdź wymiary i dostępność komponentów", "Zleć ocenę projektu wyspecjalizowanemu warsztatowi", "Używaj tylko w odpowiednim, zgodnym z przepisami środowisku"],
    caveat: "Nie przedstawiam 90–95 cm³ jako gotowego, katalogowego kitu AM6. To karta projektu custom, wymagającego potwierdzonych danych."
  },
  {
    id: "minarelli-stage6", name: "Minarelli poziomy / Stage6 Sport-Pro — sport", level: "sport", platform: "Minarelli poziomy", displacement: "według konkretnego cylindra",
    use: "Skuter / projekt sportowy", character: "Łagodniejsza karta porównawcza przed przejściem do konfiguracji high-end.",
    parts: [
      { group: "Cylinder", examples: "Stage6 Sport Pro / seria dostępna dla konkretnej wersji Minarelli horizontal", purpose: "Sprawdź kod aplikacji, chłodzenie i zawartość opakowania." },
      { group: "Wydech", examples: "Wydech sportowy zgodny z wybranym cylindrem i ramą", purpose: "Unikaj łączenia części tylko dlatego, że mają tę samą markę." },
      { group: "Gaźnik i dolot", examples: "Gaźnik i airbox zgodne z zaleceniami zestawu", purpose: "Po zmianie części potrzebna jest kontrola strojenia." },
      { group: "CVT", examples: "Pasek, wariator i sprzęgło o specyfikacji dla danego skutera", purpose: "Weryfikacja dopasowania i stanu napędu." }
    ],
    checks: ["Ustal kod silnika i chłodzenie", "Sprawdź numer katalogowy Stage6", "Zweryfikuj wydech i mocowania", "Zadbaj o serwis CVT"],
    caveat: "Stage6 Sport Pro to nazwa serii spotykana w różnych aplikacjach; nie zakładaj, że każdy wariant pasuje do każdego Minarelli."
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
