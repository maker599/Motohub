"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type Measurement = {
  id: string;
  name: string;
  value: string;
  unit: string;
  method: string;
  source: string;
  uncertainty: string;
  measuredAt: string;
};

type Project = {
  schemaVersion: 1;
  updatedAt: string;
  part: {
    manufacturer: string;
    model: string;
    engine: string;
    capacity: string;
    className: string;
    year: string;
    serial: string;
    sourceUrl: string;
    notes: string;
  };
  measurements: Measurement[];
};

const STORAGE_KEY = "motohub-cylinder-project-v1";

const blankProject: Project = {
  schemaVersion: 1,
  updatedAt: "",
  part: {
    manufacturer: "",
    model: "",
    engine: "",
    capacity: "",
    className: "",
    year: "",
    serial: "",
    sourceUrl: "",
    notes: "",
  },
  measurements: [],
};

const measurementCatalog = [
  { name: "Średnica cylindra", unit: "mm", hint: "Średnica zmierzona przyrządem o znanej dokładności" },
  { name: "Skok tłoka", unit: "mm", hint: "Wartość z dokumentacji lub niezależnego pomiaru" },
  { name: "Wysokość cylindra", unit: "mm", hint: "Opisz dokładnie punkty bazowe pomiaru" },
  { name: "Grubość tulei", unit: "mm", hint: "Zaznacz miejsce pomiaru i metodę" },
  { name: "Luz tłok–cylinder", unit: "mm", hint: "Wartość z dokumentacji serwisowej lub pomiaru specjalisty" },
  { name: "Masa tłoka", unit: "g", hint: "Z podaniem, czy osprzęt jest zamontowany" },
];

function newId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function numberOrNull(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function safeProject(value: unknown): Project | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<Project>;
  if (item.schemaVersion !== 1 || !item.part || !Array.isArray(item.measurements)) return null;
  const part = item.part as Partial<Project["part"]>;
  const stringOrEmpty = (value: unknown) => typeof value === "string" ? value : "";
  return {
    schemaVersion: 1,
    updatedAt: stringOrEmpty(item.updatedAt),
    part: {
      manufacturer: stringOrEmpty(part.manufacturer),
      model: stringOrEmpty(part.model),
      engine: stringOrEmpty(part.engine),
      capacity: stringOrEmpty(part.capacity),
      className: stringOrEmpty(part.className),
      year: stringOrEmpty(part.year),
      serial: stringOrEmpty(part.serial),
      sourceUrl: stringOrEmpty(part.sourceUrl),
      notes: stringOrEmpty(part.notes),
    },
    measurements: item.measurements.filter((m): m is Measurement => !!m && typeof m === "object" && typeof (m as Measurement).name === "string").map((m) => ({
      id: stringOrEmpty(m.id) || newId(),
      name: stringOrEmpty(m.name),
      value: stringOrEmpty(m.value),
      unit: stringOrEmpty(m.unit) || "mm",
      method: stringOrEmpty(m.method),
      source: stringOrEmpty(m.source),
      uncertainty: stringOrEmpty(m.uncertainty),
      measuredAt: stringOrEmpty(m.measuredAt),
    })),
  };
}

export default function CylinderAnalysisPage() {
  const [project, setProject] = useState<Project>(blankProject);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const [newMeasurement, setNewMeasurement] = useState({ name: measurementCatalog[0].name, value: "", unit: "mm", method: "Pomiar użytkownika", source: "", uncertainty: "" });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      let nextProject: Project = blankProject;
      if (saved) {
        const parsed = safeProject(JSON.parse(saved));
        if (parsed) nextProject = parsed;
      }
      const prefillRaw = window.localStorage.getItem("motohub-cylinder-prefill-v1");
      if (prefillRaw) {
        const prefill = JSON.parse(prefillRaw) as Partial<Project["part"]>;
        nextProject = {
          ...nextProject,
          part: {
            ...nextProject.part,
            manufacturer: typeof prefill.manufacturer === "string" ? prefill.manufacturer : nextProject.part.manufacturer,
            model: typeof prefill.model === "string" ? prefill.model : nextProject.part.model,
            engine: typeof prefill.engine === "string" ? prefill.engine : nextProject.part.engine,
            capacity: typeof prefill.capacity === "string" ? prefill.capacity : nextProject.part.capacity,
            className: typeof prefill.className === "string" ? prefill.className : nextProject.part.className,
            year: typeof prefill.year === "string" ? prefill.year : nextProject.part.year,
            serial: typeof prefill.serial === "string" ? prefill.serial : nextProject.part.serial,
            sourceUrl: typeof prefill.sourceUrl === "string" ? prefill.sourceUrl : nextProject.part.sourceUrl,
            notes: typeof prefill.notes === "string" ? prefill.notes : nextProject.part.notes,
          },
        };
        window.localStorage.removeItem("motohub-cylinder-prefill-v1");
        setNotice("Dane części przeniesiono z katalogu. Sprawdź je przed dodaniem pomiarów.");
      }
      setProject(nextProject);
    } catch {
      setNotice("Nie udało się odczytać lokalnego szkicu lub danych z katalogu. Możesz rozpocząć nowy projekt.");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      const next = { ...project, updatedAt: new Date().toISOString() };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      setNotice("Przeglądarka nie pozwoliła zapisać szkicu lokalnie. Wyeksportuj kopię JSON.");
    }
  }, [project, loaded]);

  const updatePart = (key: keyof Project["part"], value: string) => {
    setProject((current) => ({ ...current, part: { ...current.part, [key]: value } }));
    setNotice("");
  };

  const addMeasurement = () => {
    if (!newMeasurement.name.trim() || !newMeasurement.value.trim()) {
      setNotice("Wpisz nazwę i wartość pomiaru.");
      return;
    }
    if (numberOrNull(newMeasurement.value) === null) {
      setNotice("Wartość musi być dodatnią liczbą. Użyj kropki lub przecinka dziesiętnego.");
      return;
    }
    const row: Measurement = { ...newMeasurement, id: newId(), measuredAt: new Date().toISOString() };
    setProject((current) => ({ ...current, measurements: [...current.measurements, row] }));
    setNewMeasurement({ name: measurementCatalog[0].name, value: "", unit: "mm", method: "Pomiar użytkownika", source: "", uncertainty: "" });
    setNotice("Dodano pomiar do bieżącego projektu.");
  };

  const updateMeasurement = (id: string, key: keyof Measurement, value: string) => {
    setProject((current) => ({ ...current, measurements: current.measurements.map((m) => m.id === id ? { ...m, [key]: value } : m) }));
  };

  const removeMeasurement = (id: string) => {
    setProject((current) => ({ ...current, measurements: current.measurements.filter((m) => m.id !== id) }));
  };

  const exportProject = () => {
    const payload = JSON.stringify({ ...project, updatedAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `motohub-cylinder-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Eksport JSON przygotowany. Zachowaj plik jako kopię projektu.");
  };

  const importProject = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = safeProject(JSON.parse(await file.text()));
      if (!parsed) throw new Error("invalid schema");
      setProject(parsed);
      setNotice("Projekt zaimportowany. Sprawdź pochodzenie i poprawność danych.");
    } catch {
      setNotice("Nie można zaimportować pliku. Wybierz poprawny eksport MotoHub JSON.");
    } finally {
      event.target.value = "";
    }
  };

  const clearProject = () => {
    if (!window.confirm("Usunąć bieżący projekt z tej przeglądarki? Najpierw wyeksportuj kopię, jeśli jej potrzebujesz.")) return;
    setProject({ ...blankProject, part: { ...blankProject.part }, measurements: [] });
    setNotice("Wyczyszczono bieżący projekt.");
  };

  const bore = useMemo(() => project.measurements.find((m) => /średnica cylindra/i.test(m.name) && m.unit === "mm"), [project.measurements]);
  const height = useMemo(() => project.measurements.find((m) => /wysokość cylindra/i.test(m.name) && m.unit === "mm"), [project.measurements]);
  const boreValue = numberOrNull(bore?.value || "");
  const heightValue = numberOrNull(height?.value || "");
  const visualScale = boreValue && heightValue ? Math.min(1.35, Math.max(0.55, (heightValue / boreValue) / 3.2)) : 1;
  const measuredCount = project.measurements.length;
  const sourceCount = project.measurements.filter((m) => m.source.trim() !== "").length;
  const withUncertainty = project.measurements.filter((m) => m.uncertainty.trim() !== "").length;

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-6 text-white sm:px-8 sm:py-9">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-sm font-semibold text-red-400 transition hover:text-red-300">← Powrót do MotoHub</Link>
          <Link href="/katalog-cylindrow" className="text-sm font-semibold text-zinc-300 transition hover:text-white">Katalog cylindrów →</Link>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">Warsztat · wersja robocza</span>
        </div>

        <header className="mt-8 max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">MotoHub · dokumentacja techniczna</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Karta cylindra</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400">
            Utwórz kartę konkretnej części, zapisuj pomiary wraz z metodą, źródłem i niepewnością, a następnie wyeksportuj
            uporządkowany projekt. Wizualizacja pokazuje wyłącznie schemat poglądowy — nie jest skanem 3D, projektem CAD
            ani szablonem obróbki.
          </p>
        </header>

        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={exportProject} className="rounded-full bg-red-500 px-5 py-3 text-sm font-bold transition hover:bg-red-400">Eksportuj projekt JSON</button>
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.08]">Importuj JSON</button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={importProject} className="hidden" />
          <button type="button" onClick={clearProject} className="rounded-full border border-white/10 px-5 py-3 text-sm text-zinc-400 transition hover:border-red-400/40 hover:text-red-300">Wyczyść projekt</button>
        </div>

        {notice && <p role="status" className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">{notice}</p>}

        <div className="mt-6 grid items-start gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div><p className="text-xs font-bold uppercase tracking-widest text-red-400">01 / Identyfikacja</p><h2 className="mt-2 text-xl font-bold">Dane cylindra</h2></div>
                <span className="text-xs text-zinc-500">Nie zgadujemy brakujących danych</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {([
                  ["manufacturer", "Producent", "Producent części"],
                  ["model", "Model / oznaczenie", "Dokładne oznaczenie wariantu"],
                  ["engine", "Silnik / model motocykla", "Model, kod silnika"],
                  ["capacity", "Pojemność", "cm³"],
                  ["className", "Klasa / wariant", "Oznaczenie z dokumentacji"],
                  ["year", "Rok / wersja", "Rok produkcji lub rewizja"],
                  ["serial", "Numer części / seryjny", "Jeśli występuje"],
                  ["sourceUrl", "Link do dokumentacji", "https://…"],
                ] as const).map(([key, label, placeholder]) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-sm font-medium text-zinc-300">{label}</span>
                    <input value={project.part[key]} onChange={(e) => updatePart(key, e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-red-500/60" />
                  </label>
                ))}
              </div>
              <label className="mt-4 block"><span className="mb-2 block text-sm font-medium text-zinc-300">Uwagi identyfikacyjne</span><textarea value={project.part.notes} onChange={(e) => updatePart("notes", e.target.value)} rows={3} placeholder="Wersja, stan części, ślady zużycia, warunki pomiaru…" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-red-500/60" /></label>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
              <div className="mb-5"><p className="text-xs font-bold uppercase tracking-widest text-red-400">02 / Rejestr</p><h2 className="mt-2 text-xl font-bold">Dodaj pomiar</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Zapisuj każdą wartość osobno i podawaj, skąd pochodzi. Samo wpisanie liczby nie potwierdza jej dokładności.</p></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-sm text-zinc-300">Parametr</span><select value={newMeasurement.name} onChange={(e) => { const option = measurementCatalog.find((x) => x.name === e.target.value); setNewMeasurement((m) => ({ ...m, name: e.target.value, unit: option?.unit || m.unit })); }} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm">{measurementCatalog.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}<option value="Inny parametr">Inny parametr</option></select></label>
                <label className="block"><span className="mb-2 block text-sm text-zinc-300">Wartość</span><div className="flex gap-2"><input value={newMeasurement.value} onChange={(e) => setNewMeasurement((m) => ({ ...m, value: e.target.value }))} inputMode="decimal" placeholder="Wpisz zmierzoną wartość" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-red-500/60" /><input aria-label="Jednostka pomiaru" value={newMeasurement.unit} onChange={(e) => setNewMeasurement((m) => ({ ...m, unit: e.target.value }))} className="w-20 rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-sm outline-none focus:border-red-500/60" /></div></label>
                <label className="block"><span className="mb-2 block text-sm text-zinc-300">Pochodzenie</span><select value={newMeasurement.method} onChange={(e) => setNewMeasurement((m) => ({ ...m, method: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm"><option>Pomiar użytkownika</option><option>Dokumentacja producenta</option><option>Dokumentacja serwisowa</option><option>Laboratorium / specjalista</option><option>Wartość orientacyjna — niezweryfikowana</option></select></label>
                <label className="block"><span className="mb-2 block text-sm text-zinc-300">Źródło / opis przyrządu</span><input value={newMeasurement.source} onChange={(e) => setNewMeasurement((m) => ({ ...m, source: e.target.value }))} placeholder="Link, instrukcja, przyrząd i metoda" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-red-500/60" /></label>
                <label className="block sm:col-span-2"><span className="mb-2 block text-sm text-zinc-300">Niepewność / tolerancja podana w źródle</span><input value={newMeasurement.uncertainty} onChange={(e) => setNewMeasurement((m) => ({ ...m, uncertainty: e.target.value }))} placeholder="Np. dokładność przyrządu lub tolerancja z dokumentacji; nie zgaduj" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-red-500/60" /></label>
              </div>
              <button type="button" onClick={addMeasurement} className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-200">Dodaj do rejestru</button>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-red-400">03 / Historia</p><h2 className="mt-2 text-xl font-bold">Rejestr pomiarów</h2></div><span className="text-sm text-zinc-500">{measuredCount} {measuredCount === 1 ? "wpis" : "wpisów"}</span></div>
              {project.measurements.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">Nie dodano jeszcze pomiarów. Wpisy pojawią się tutaj.</div> : (
                <div className="mt-5 space-y-3">
                  {project.measurements.map((m, index) => (
                    <article key={m.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs text-zinc-500">Pomiar {index + 1} · {m.method}</p><h3 className="mt-1 font-bold">{m.name}</h3></div><button type="button" onClick={() => removeMeasurement(m.id)} className="text-xs text-zinc-500 hover:text-red-300">Usuń</button></div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <label className="text-xs text-zinc-500">Wartość<input value={m.value} onChange={(e) => updateMeasurement(m.id, "value", e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white" /></label>
                        <label className="text-xs text-zinc-500">Jednostka<input value={m.unit} onChange={(e) => updateMeasurement(m.id, "unit", e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white" /></label>
                        <label className="text-xs text-zinc-500">Źródło / metoda<input value={m.source} onChange={(e) => updateMeasurement(m.id, "source", e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white" /></label>
                        <label className="text-xs text-zinc-500">Niepewność / tolerancja<input value={m.uncertainty} onChange={(e) => updateMeasurement(m.id, "uncertainty", e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white" /></label>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6 xl:sticky xl:top-6">
            <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-red-400">04 / Podgląd</p>
              <h2 className="mt-2 text-xl font-bold">Schemat cylindra</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Kształt jest ilustracyjny. Wysokość rysunku może zmienić się po wpisaniu pomiaru, ale obraz nie odtwarza dokładnej geometrii części.</p>
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/50 p-3 sm:p-5">
                <svg viewBox="0 0 360 360" role="img" aria-label="Ilustracyjny przekrój cylindra, nie do wykonania obróbki" className="w-full">
                  <defs><linearGradient id="metal" x1="0" x2="1"><stop offset="0%" stopColor="#3f3f46" /><stop offset="30%" stopColor="#d4d4d8" /><stop offset="65%" stopColor="#71717a" /><stop offset="100%" stopColor="#27272a" /></linearGradient></defs>
                  <g transform={`translate(0 ${(1 - visualScale) * 30})`}>
                    <path d="M95 48 L265 48 L250 286 Q180 311 110 286 Z" fill="url(#metal)" stroke="#e4e4e7" strokeWidth="1.5" />
                    <path d="M121 62 L239 62 L228 270 Q180 286 132 270 Z" fill="#090909" stroke="#a1a1aa" strokeWidth="1.5" />
                    <path d="M98 133 L126 133 L126 175 L101 175 Z" fill="#ef4444" fillOpacity=".65" stroke="#fca5a5" />
                    <path d="M234 151 L260 151 L257 190 L231 190 Z" fill="#ef4444" fillOpacity=".65" stroke="#fca5a5" />
                    <path d="M180 24 L180 323" stroke="#71717a" strokeDasharray="5 6" />
                  </g>
                  <path d="M74 48 L74 286 M67 48 L81 48 M67 286 L81 286" stroke="#a1a1aa" fill="none" />
                  <text x="60" y="165" fill="#a1a1aa" fontSize="10" textAnchor="middle" transform="rotate(-90 60 165)">{heightValue ? `H: ${heightValue} mm` : "WYSOKOŚĆ"}</text>
                  <path d="M121 331 L239 331 M121 325 L121 337 M239 325 L239 337" stroke="#a1a1aa" fill="none" />
                  <text x="180" y="348" fill="#a1a1aa" fontSize="10" textAnchor="middle">{boreValue ? `Ø ${boreValue} mm` : "ŚREDNICA"}</text>
                  <text x="180" y="15" fill="#f87171" fontSize="10" fontWeight="bold" textAnchor="middle">PODGLĄD POGLĄDOWY</text>
                </svg>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><p className="text-xs text-zinc-500">Pomiary</p><p className="mt-1 text-2xl font-black">{measuredCount}</p></div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><p className="text-xs text-zinc-500">Ze źródłem</p><p className="mt-1 text-2xl font-black">{sourceCount}</p></div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3"><p className="text-xs text-zinc-500">Z niepewnością</p><p className="mt-1 text-2xl font-black">{withUncertainty}</p></div>
              </div>
              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-100/90">
                <strong>Ważne:</strong> ten schemat nie jest skalibrowanym rysunkiem technicznym i nie może służyć jako szablon skrawania. Nie generujemy niezweryfikowanych wymiarów usuwania materiału.
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-red-400">05 / Kontrola jakości</p>
              <h2 className="mt-2 text-xl font-bold">Gotowość danych</h2>
              <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                {[
                  ["Identyfikacja części", Boolean(project.part.manufacturer.trim() && project.part.model.trim())],
                  ["Podano źródło dokumentacji", Boolean(project.part.sourceUrl.trim()) || sourceCount > 0],
                  ["Wprowadzono pomiary", measuredCount > 0],
                  ["Pomiary opisane źródłem", sourceCount === measuredCount && measuredCount > 0],
                  ["Podano niepewność", withUncertainty === measuredCount && measuredCount > 0],
                ].map(([label, done]) => <li key={String(label)} className="flex items-center gap-3"><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${done ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-zinc-500"}`}>{done ? "✓" : "—"}</span><span>{label}</span></li>)}
              </ul>
              <p className="mt-4 text-xs leading-5 text-zinc-500">Wskaźnik porządkuje dokumentację; nie certyfikuje poprawności wymiarów ani bezpieczeństwa części.</p>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
              <h2 className="text-lg font-bold">Jak pracować z kartą</h2>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-zinc-400">
                <li>Zidentyfikuj dokładny model i wariant części.</li>
                <li>Przepisz dane z dokumentacji producenta i dodaj własne pomiary osobno.</li>
                <li>Zapisz metodę, źródło i niepewność — nie wpisuj przypuszczeń jako faktów.</li>
                <li>Eksportuj JSON i przechowuj kopię razem z dokumentacją.</li>
                <li>Przed jakąkolwiek obróbką zweryfikuj projekt z dokumentacją producenta i wykwalifikowanym specjalistą.</li>
              </ol>
              <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-5 text-zinc-500">Dane tej wersji są przechowywane lokalnie w przeglądarce oraz w pliku eksportu. Nie ma jeszcze wspólnej bazy, automatycznego wyszukiwania dokumentacji ani synchronizacji kont.</p>
            </section>
          </div>
        </div>
        <footer className="mt-10 border-t border-white/10 py-6 text-xs text-zinc-600">MotoHub · Karta cylindra · Wersja robocza. Schemat nie zastępuje dokumentacji technicznej.</footer>
      </div>
    </main>
  );
}
