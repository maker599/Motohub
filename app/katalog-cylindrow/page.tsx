"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, ChangeEvent } from "react";

type CatalogItem = {
  id: string;
  manufacturer: string;
  model: string;
  engine: string;
  capacity: string;
  className: string;
  year: string;
  partNumber: string;
  sourceUrl: string;
  sourceType: "Producent" | "Serwis" | "Pomiar użytkownika" | "Inne";
  verification: "Niezweryfikowane" | "Sprawdzone źródło" | "Zweryfikowane przez specjalistę";
  notes: string;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "motohub-cylinder-catalog-v1";
const PREFILL_KEY = "motohub-cylinder-prefill-v1";
const emptyForm = {
  manufacturer: "", model: "", engine: "", capacity: "", className: "", year: "",
  partNumber: "", sourceUrl: "", sourceType: "Producent" as CatalogItem["sourceType"],
  verification: "Niezweryfikowane" as CatalogItem["verification"], notes: "",
};

function makeId() {
  return `cyl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function validateCatalog(value: unknown): CatalogItem[] | null {
  if (!Array.isArray(value)) return null;
  return value.filter((row) => row && typeof row === "object" && typeof row.manufacturer === "string" && typeof row.model === "string")
    .map((row) => ({
      id: typeof row.id === "string" ? row.id : makeId(),
      manufacturer: String(row.manufacturer || ""),
      model: String(row.model || ""),
      engine: String(row.engine || ""),
      capacity: String(row.capacity || ""),
      className: String(row.className || ""),
      year: String(row.year || ""),
      partNumber: String(row.partNumber || ""),
      sourceUrl: String(row.sourceUrl || ""),
      sourceType: ["Producent", "Serwis", "Pomiar użytkownika", "Inne"].includes(row.sourceType) ? row.sourceType : "Inne",
      verification: ["Niezweryfikowane", "Sprawdzone źródło", "Zweryfikowane przez specjalistę"].includes(row.verification) ? row.verification : "Niezweryfikowane",
      notes: String(row.notes || ""),
      createdAt: typeof row.createdAt === "string" ? row.createdAt : new Date().toISOString(),
      updatedAt: typeof row.updatedAt === "string" ? row.updatedAt : new Date().toISOString(),
    }));
}

export default function KatalogCylindrowPage() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("Wszystkie");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = validateCatalog(JSON.parse(raw));
        if (parsed) setItems(parsed);
      }
    } catch {
      setNotice("Nie udało się odczytać katalogu z tej przeglądarki.");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      setNotice("Nie można zapisać katalogu w przeglądarce. Wyeksportuj kopię JSON.");
    }
  }, [items, loaded]);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pl");
    return items.filter((item) => {
      const searchable = [item.manufacturer, item.model, item.engine, item.capacity, item.className, item.year, item.partNumber, item.sourceUrl].join(" ").toLocaleLowerCase("pl");
      return (!term || searchable.includes(term)) && (verificationFilter === "Wszystkie" || item.verification === verificationFilter);
    }).sort((a, b) => a.manufacturer.localeCompare(b.manufacturer, "pl") || a.model.localeCompare(b.model, "pl"));
  }, [items, query, verificationFilter]);

  const startNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
    setNotice("");
  };

  const editItem = (item: CatalogItem) => {
    const { id, createdAt, updatedAt, ...values } = item;
    setEditingId(id);
    setForm(values);
    setShowForm(true);
    setNotice("");
  };

  const saveItem = () => {
    if (!form.manufacturer.trim() || !form.model.trim()) {
      setNotice("Podaj przynajmniej producenta i dokładne oznaczenie modelu.");
      return;
    }
    if (form.sourceUrl.trim()) {
      try {
        const url = new URL(form.sourceUrl);
        if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("invalid");
      } catch {
        setNotice("Link do źródła musi być poprawnym adresem HTTP lub HTTPS.");
        return;
      }
    }
    const now = new Date().toISOString();
    setItems((current) => {
      if (editingId) return current.map((item) => item.id === editingId ? { ...item, ...form, updatedAt: now } : item);
      return [{ ...form, id: makeId(), createdAt: now, updatedAt: now }, ...current];
    });
    setShowForm(false);
    setEditingId(null);
    setNotice("Zapisano wpis katalogu w tej przeglądarce. Pamiętaj: status weryfikacji ustawia użytkownik.");
  };

  const removeItem = (id: string) => {
    if (!window.confirm("Usunąć ten wpis z lokalnego katalogu?")) return;
    setItems((current) => current.filter((item) => item.id !== id));
    setNotice("Usunięto wpis.");
  };

  const useItem = (item: CatalogItem) => {
    const prefill = {
      manufacturer: item.manufacturer,
      model: item.model,
      engine: item.engine,
      capacity: item.capacity,
      className: item.className,
      year: item.year,
      serial: item.partNumber,
      sourceUrl: item.sourceUrl,
      notes: item.notes,
    };
    window.localStorage.setItem(PREFILL_KEY, JSON.stringify(prefill));
    window.location.href = "/analiza-cylindra";
  };

  const exportCatalog = () => {
    const blob = new Blob([JSON.stringify({ schemaVersion: 1, exportedAt: new Date().toISOString(), items }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `motohub-katalog-cylindrow-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Wyeksportowano katalog. Plik JSON zawiera wpisy i statusy weryfikacji.");
  };

  const importCatalog = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const rows = validateCatalog(Array.isArray(parsed) ? parsed : parsed?.items);
      if (!rows) throw new Error("invalid");
      const now = new Date().toISOString();
      setItems((current) => {
        const byId = new Map(current.map((item) => [item.id, item]));
        rows.forEach((item) => byId.set(item.id, { ...item, updatedAt: now }));
        return Array.from(byId.values());
      });
      setNotice(`Zaimportowano ${rows.length} wpisów. Sprawdź pochodzenie danych po imporcie.`);
    } catch {
      setNotice("Plik ma nieprawidłowy format. Wybierz eksport katalogu MotoHub w formacie JSON.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-6 text-white sm:px-8 sm:py-9">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-sm font-semibold text-red-400 hover:text-red-300">← Powrót do MotoHub</Link>
          <Link href="/analiza-cylindra" className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.05]">Otwórz kartę pomiarów →</Link>
        </div>
        <header className="mt-8 max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">MotoHub · baza części</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Katalog cylindrów</h1>
          <p className="mt-4 text-base leading-7 text-zinc-400">Twórz własny katalog konkretnych wariantów, dołączaj źródła i oznaczaj poziom weryfikacji. Wpis można przenieść do karty pomiarów jednym kliknięciem. Katalog jest obecnie lokalny dla tej przeglądarki — nie jest globalną bazą producentów.</p>
        </header>

        <div className="mt-7 flex flex-wrap gap-3">
          <button type="button" onClick={startNew} className="rounded-full bg-red-500 px-5 py-3 text-sm font-bold hover:bg-red-400">+ Dodaj wariant</button>
          <button type="button" onClick={exportCatalog} className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold hover:bg-white/[0.08]">Eksportuj katalog JSON</button>
          <button type="button" onClick={() => fileRef.current?.click()} className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold hover:bg-white/[0.08]">Importuj katalog JSON</button>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={importCatalog} className="hidden" />
        </div>

        {notice && <p role="status" className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300">{notice}</p>}

        {showForm && (
          <section className="mt-6 rounded-3xl border border-red-500/20 bg-white/[0.03] p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-red-400">Karta katalogowa</p><h2 className="mt-2 text-xl font-bold">{editingId ? "Edytuj wariant" : "Nowy wariant cylindra"}</h2></div><button type="button" onClick={() => setShowForm(false)} className="text-sm text-zinc-400 hover:text-white">Zamknij</button></div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {([
                ["manufacturer", "Producent", "Wymagane"],
                ["model", "Model / oznaczenie", "Wymagane"],
                ["engine", "Kod silnika / model motocykla", "Kod silnika"],
                ["capacity", "Pojemność", "cm³"],
                ["className", "Klasa / wariant", "Dokładna klasa"],
                ["year", "Rok / rewizja", "Rok lub rewizja"],
                ["partNumber", "Numer części", "OEM / producenta"],
                ["sourceUrl", "Adres dokumentacji", "https://…"],
              ] as const).map(([key, label, placeholder]) => <label key={key} className="block"><span className="mb-2 block text-sm text-zinc-300">{label}</span><input value={form[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} placeholder={placeholder} className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-red-500/60" /></label>)}
              <label className="block"><span className="mb-2 block text-sm text-zinc-300">Typ źródła</span><select value={form.sourceType} onChange={(e) => setForm((current) => ({ ...current, sourceType: e.target.value as CatalogItem["sourceType"] }))} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm"><option>Producent</option><option>Serwis</option><option>Pomiar użytkownika</option><option>Inne</option></select></label>
              <label className="block"><span className="mb-2 block text-sm text-zinc-300">Status weryfikacji</span><select value={form.verification} onChange={(e) => setForm((current) => ({ ...current, verification: e.target.value as CatalogItem["verification"] }))} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm"><option>Niezweryfikowane</option><option>Sprawdzone źródło</option><option>Zweryfikowane przez specjalistę</option></select></label>
            </div>
            <label className="mt-4 block"><span className="mb-2 block text-sm text-zinc-300">Uwagi / zakres dokumentacji</span><textarea value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} rows={3} placeholder="Co dokładnie potwierdza dokumentacja? Jakie informacje pozostają nieznane?" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-red-500/60" /></label>
            <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm leading-6 text-amber-100/90">Status weryfikacji jest deklaracją użytkownika, a nie automatycznym certyfikatem. Dodawaj tylko źródła, które rzeczywiście dotyczą tego wariantu.</div>
            <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={saveItem} className="rounded-full bg-red-500 px-5 py-3 text-sm font-bold hover:bg-red-400">Zapisz wariant</button><button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-white/10 px-5 py-3 text-sm text-zinc-300">Anuluj</button></div>
          </section>
        )}

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
          <div className="grid gap-4 md:grid-cols-[1fr_260px]">
            <label className="block"><span className="mb-2 block text-sm text-zinc-300">Szukaj w katalogu</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Producent, model, pojemność, klasa, numer części…" className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none placeholder:text-zinc-600 focus:border-red-500/60" /></label>
            <label className="block"><span className="mb-2 block text-sm text-zinc-300">Weryfikacja</span><select value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value)} className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm"><option>Wszystkie</option><option>Niezweryfikowane</option><option>Sprawdzone źródło</option><option>Zweryfikowane przez specjalistę</option></select></label>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-zinc-500"><span>{items.length} wpisów w katalogu</span><span>·</span><span>{filtered.length} pasujących wyników</span></div>

          {filtered.length === 0 ? <div className="mt-6 rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center"><div className="text-lg font-bold">{items.length === 0 ? "Katalog jest pusty" : "Brak wyników"}</div><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-500">{items.length === 0 ? "Dodaj pierwszy wariant i dołącz dokumentację. Nie wypełniamy katalogu wymyślonymi specyfikacjami." : "Zmień frazę wyszukiwania albo filtr weryfikacji."}</p></div> : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {filtered.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-red-400">{item.manufacturer}</p><h3 className="mt-1 text-xl font-bold">{item.model}</h3><p className="mt-1 text-sm text-zinc-400">{[item.engine, item.capacity ? item.capacity + " cm³" : "", item.className, item.year].filter(Boolean).join(" · ") || "Brak dodatkowych danych"}</p></div><span className={`rounded-full border px-3 py-1 text-xs ${item.verification === "Niezweryfikowane" ? "border-amber-400/20 bg-amber-400/[0.06] text-amber-200" : "border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-200"}`}>{item.verification}</span></div>
                  {item.partNumber && <p className="mt-3 text-xs text-zinc-500">Nr części: {item.partNumber}</p>}
                  {item.notes && <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-400">{item.notes}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button type="button" onClick={() => useItem(item)} className="rounded-full bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-200">Użyj w karcie pomiarów</button>
                    <button type="button" onClick={() => editItem(item)} className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/[0.05]">Edytuj</button>
                    {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/[0.05]">Otwórz źródło ↗</a>}
                    <button type="button" onClick={() => removeItem(item.id)} className="rounded-full px-3 py-2 text-xs text-zinc-500 hover:text-red-300">Usuń</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <p className="mt-6 text-xs leading-5 text-zinc-600">Dane przechowywane lokalnie w tej przeglądarce. Importuj tylko zaufane pliki. Brak wpisu nie oznacza, że dany cylinder nie istnieje; status weryfikacji nie jest niezależnym potwierdzeniem.</p>
      </div>
    </main>
  );
}
