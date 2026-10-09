"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Measurements = {
  manufacturer: string;
  model: string;
  capacity: string;
  className: string;
  source: string;
  bore: string;
  stroke: string;
  cylinderHeight: string;
  linerThickness: string;
  notes: string;
};

const empty: Measurements = {
  manufacturer: "",
  model: "",
  capacity: "",
  className: "",
  source: "",
  bore: "",
  stroke: "",
  cylinderHeight: "",
  linerThickness: "",
  notes: "",
};

export default function CylinderAnalysisPage() {
  const [data, setData] = useState<Measurements>(empty);
  const [submitted, setSubmitted] = useState(false);
  const [unit, setUnit] = useState("mm");

  const fields = useMemo(
    () => [
      { key: "manufacturer", label: "Producent", placeholder: "np. producent cylindra" },
      { key: "model", label: "Model / oznaczenie", placeholder: "Dokładne oznaczenie części" },
      { key: "capacity", label: "Pojemność", placeholder: "np. 125 cm³" },
      { key: "className", label: "Klasa / wariant", placeholder: "Oznaczenie klasy lub wersji" },
      { key: "source", label: "Źródło danych", placeholder: "Link do dokumentacji lub numer instrukcji" },
      { key: "bore", label: "Średnica cylindra", placeholder: "Wartość z pomiaru" },
      { key: "stroke", label: "Skok tłoka", placeholder: "Wartość z dokumentacji lub pomiaru" },
      { key: "cylinderHeight", label: "Wysokość cylindra", placeholder: "Wartość z pomiaru" },
      { key: "linerThickness", label: "Grubość tulei", placeholder: "Wartość z pomiaru, jeśli dotyczy" },
    ],
    [],
  );

  const update = (key: keyof Measurements, value: string) => {
    setData((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
  };

  const filledMeasurements = [data.bore, data.stroke, data.cylinderHeight, data.linerThickness].filter(
    (value) => value.trim() !== "",
  ).length;

  return (
    <main className="min-h-screen bg-[#090909] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-semibold text-red-400 hover:text-red-300">← Powrót do MotoHub</Link>
        <header className="mt-8 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">MotoHub · warsztat</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Analiza cylindra</h1>
          <p className="mt-4 text-base leading-7 text-zinc-400">
            Wybierz wariant części i dodaj dane z dokumentacji lub własnych pomiarów. System uporządkuje informacje
            i przygotuje podgląd poglądowy. Nie będzie zgadywać brakujących wymiarów ani przedstawiać ilustracji
            jako zweryfikowanego projektu obróbki.
          </p>
        </header>

        <div className="mt-9 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-bold">Dane części i pomiary</h2>
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                Jednostka
                <select value={unit} onChange={(event) => setUnit(event.target.value)} className="rounded-xl border border-white/10 bg-zinc-900 px-3 py-2 text-white">
                  <option value="mm">mm</option>
                  <option value="in">cale</option>
                </select>
              </label>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-2 block text-sm font-medium text-zinc-300">{field.label}</span>
                  <input
                    value={data[field.key as keyof Measurements]}
                    onChange={(event) => update(field.key as keyof Measurements, event.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-red-500/60"
                  />
                </label>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-zinc-300">Notatki / sposób pomiaru</span>
              <textarea
                value={data.notes}
                onChange={(event) => update("notes", event.target.value)}
                rows={3}
                placeholder="Opisz przyrząd pomiarowy, miejsce pomiaru i ewentualną niepewność."
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500/60"
              />
            </label>

            <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-100/90">
              Wartości wpisane ręcznie są oznaczane jako dane użytkownika, a nie jako dane producenta. Przed użyciem
              technicznym należy je niezależnie sprawdzić. Nie generujemy instrukcji skrawania ani szablonu z
              wymiarami usuwania materiału.
            </div>

            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="mt-5 rounded-full bg-red-500 px-6 py-3 font-bold text-white transition hover:bg-red-400"
            >
              Przygotuj podgląd danych
            </button>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900 to-black p-5 sm:p-7">
            <h2 className="text-xl font-bold">Podgląd poglądowy</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Schemat służy do orientacji i nie odwzorowuje rzeczywistej geometrii ani tolerancji konkretnej części.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/50 p-4">
              <svg viewBox="0 0 320 280" role="img" aria-label="Poglądowy, nieprzeznaczony do obróbki schemat cylindra" className="w-full">
                <defs>
                  <linearGradient id="cylinderMetal" x1="0" x2="1">
                    <stop offset="0%" stopColor="#52525b" />
                    <stop offset="45%" stopColor="#d4d4d8" />
                    <stop offset="100%" stopColor="#3f3f46" />
                  </linearGradient>
                </defs>
                <path d="M88 36 L232 36 L220 224 Q160 244 100 224 Z" fill="url(#cylinderMetal)" stroke="#e4e4e7" strokeWidth="1.5" />
                <path d="M111 48 L209 48 L199 210 Q160 222 121 210 Z" fill="#090909" stroke="#71717a" strokeWidth="1.5" />
                <path d="M91 105 L118 105 L118 146 L94 146 Z" fill="#ef4444" fillOpacity=".7" stroke="#fca5a5" />
                <path d="M202 124 L229 124 L226 160 L201 160 Z" fill="#ef4444" fillOpacity=".7" stroke="#fca5a5" />
                <path d="M160 18 L160 252" stroke="#71717a" strokeDasharray="4 5" />
                <path d="M74 36 L74 224 M68 36 L80 36 M68 224 L80 224" stroke="#a1a1aa" strokeWidth="1.2" fill="none" />
                <text x="160" y="266" fill="#a1a1aa" fontSize="10" textAnchor="middle">SCHEMAT POGLĄDOWY</text>
              </svg>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-zinc-500">Uzupełnione pomiary</p>
                <p className="mt-1 text-2xl font-black">{filledMeasurements}/4</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs text-zinc-500">Jednostka</p>
                <p className="mt-1 text-2xl font-black">{unit}</p>
              </div>
            </div>

            {submitted && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="font-bold">Podsumowanie wpisu</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-zinc-500">Producent</dt><dd className="text-right">{data.manufacturer || "Nie podano"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-zinc-500">Model</dt><dd className="text-right">{data.model || "Nie podano"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-zinc-500">Pojemność</dt><dd className="text-right">{data.capacity || "Nie podano"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-zinc-500">Klasa</dt><dd className="text-right">{data.className || "Nie podano"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-zinc-500">Źródło</dt><dd className="text-right">{data.source || "Brak źródła"}</dd></div>
                </dl>
                <p className="mt-3 text-xs leading-5 text-zinc-500">
                  Ten podgląd nie zapisuje jeszcze danych do bazy ani nie potwierdza ich poprawności.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
