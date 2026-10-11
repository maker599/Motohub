"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getCompatibleCylinders, recommendSetup } from "../narzedzia/setupRecommendations";
import type { SetupEngine } from "../narzedzia/setupCatalog";
import { productCatalog, productCatalogUpdated, productCategoryLabels } from "./productCatalog";

type SetupPart = {
  category?: string;
  brand?: string;
  name?: string;
  priceEur?: number;
  url?: string;
  includedInCylinder?: boolean;
  keepExisting?: boolean;
  requiresFitmentCheck?: boolean;
};

type SavedSetup = {
  id: string;
  name: string;
  engine: string;
  setup: {
    cylinder?: { brand?: string; name?: string; priceEur?: number; url?: string };
    parts?: SetupPart[];
  };
};

type Offer = { id: string; store: string; price: number; currency: "PLN" | "EUR"; url: string };
type CartLine = {
  id: string;
  category: string;
  brand: string;
  name: string;
  includedInCylinder: boolean;
  keepExisting: boolean;
  requiresFitmentCheck: boolean;
  fitmentConfirmed: boolean;
  purchase: boolean;
  quantity: number;
  offers: Offer[];
  selectedOfferId: string;
  catalogNote?: string;
};
type ShoppingList = { id: string; name: string; items: CartLine[]; exchange_rate: number; shipping_by_store: Record<string, number>; updated_at: string };
type OfferDraft = { store: string; price: string; currency: "PLN" | "EUR"; url: string };
type NewItemDraft = { category: string; brand: string; name: string };

const defaultRate = 4.3775;
const localListsKey = "motohub-shopping-lists";
const categoryLabels: Record<string, string> = {
  cylinder: "Cylinder", crankshaft: "Wał korbowy", bearings: "Łożyska i uszczelniacze", carburetor: "Gaźnik",
  intakeManifold: "Króciec dolotowy", reed: "Membrana", exhaust: "Wydech", clutch: "Sprzęgło",
  ignition: "Zapłon", airFilter: "Filtr powietrza", waterPump: "Pompa wody",
  ...productCategoryLabels,
};
const catalogSetupChoices: Array<[SetupEngine, string]> = [
  ["Minarelli AM6", "airsal-cast-70"], ["Minarelli AM6", "stage6-bigracing-77"], ["Minarelli AM6", "stage6-rt-70"],
  ["Derbi D50B0", "derbi-mf70-cast"], ["Derbi D50B0", "derbi-bigracing77"], ["Derbi D50B0", "derbi-rt70"],
  ["Derbi D50B1", "derbi-mf70-cast"], ["Derbi D50B1", "derbi-streetrace77"], ["Derbi D50B1", "derbi-bigracing77"],
];
const catalogSetups: SavedSetup[] = catalogSetupChoices.flatMap(([engine, cylinderId]) => {
  if (!getCompatibleCylinders(engine).some((item) => item.id === cylinderId)) return [];
  const recommendation = recommendSetup(engine, cylinderId);
  if (!recommendation) return [];
  return [{
    id: `catalog:${engine}:${cylinderId}`,
    name: `${recommendation.cylinder.brand} ${recommendation.cylinder.name}`,
    engine,
    setup: { cylinder: recommendation.cylinder, parts: recommendation.parts },
  }];
});
const money = (amount: number, currency: "PLN" | "EUR") => new Intl.NumberFormat("pl-PL", { style: "currency", currency, maximumFractionDigits: currency === "PLN" ? 2 : 2 }).format(amount);
const makeId = () => crypto.randomUUID();

function readLocalLists(): ShoppingList[] {
  try {
    const lists = JSON.parse(localStorage.getItem(localListsKey) ?? "[]");
    return Array.isArray(lists) ? lists as ShoppingList[] : [];
  } catch {
    return [];
  }
}

function writeLocalLists(lists: ShoppingList[]) {
  localStorage.setItem(localListsKey, JSON.stringify(lists));
}

function storeFromUrl(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Oferta katalogowa";
  }
}

function makeLine(category: string, brand: string, name: string, priceEur: number, url = "", flags: Partial<CartLine> = {}): CartLine {
  const id = makeId();
  const initialOffer: Offer = { id: makeId(), store: url ? storeFromUrl(url) : "Oferta katalogowa", price: priceEur, currency: "EUR", url };
  return {
    id,
    category,
    brand,
    name,
    includedInCylinder: Boolean(flags.includedInCylinder),
    keepExisting: Boolean(flags.keepExisting),
    requiresFitmentCheck: Boolean(flags.requiresFitmentCheck),
    fitmentConfirmed: Boolean(flags.fitmentConfirmed),
    purchase: !flags.includedInCylinder && !flags.keepExisting && !flags.requiresFitmentCheck && priceEur > 0,
    quantity: 1,
    offers: priceEur > 0 ? [initialOffer] : [],
    selectedOfferId: priceEur > 0 ? initialOffer.id : "",
  };
}

function linesFromSetup(setup: SavedSetup): CartLine[] {
  const lines: CartLine[] = [];
  if (setup.setup.cylinder) lines.push(makeLine("cylinder", setup.setup.cylinder.brand ?? "", setup.setup.cylinder.name ?? "Cylinder", setup.setup.cylinder.priceEur ?? 0, setup.setup.cylinder.url));
  for (const part of setup.setup.parts ?? []) {
    if (part.keepExisting || part.includedInCylinder) continue;
    lines.push(makeLine(part.category ?? "other", part.brand ?? "", part.name ?? "Część", part.priceEur ?? 0, part.url, part));
  }
  return lines;
}

function lineFromCatalog(product: (typeof productCatalog)[number]): CartLine {
  const offerId = makeId();
  const requiresFitmentCheck = Boolean(product.fitmentCheck);
  return {
    id: makeId(), category: product.category, brand: product.brand, name: product.name,
    includedInCylinder: false, keepExisting: false, requiresFitmentCheck, fitmentConfirmed: false,
    purchase: !requiresFitmentCheck, quantity: 1,
    offers: [{ id: offerId, store: product.store, price: product.pricePln, currency: "PLN", url: product.url }],
    selectedOfferId: offerId, catalogNote: product.note,
  };
}

function csvCell(value: string | number) {
  const text = String(value);
  const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText.replaceAll('"', '""')}"`;
}

export default function ShoppingPlanner() {
  const [setups, setSetups] = useState<SavedSetup[]>([]);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [setupId, setSetupId] = useState("");
  const [listId, setListId] = useState("");
  const [listName, setListName] = useState("");
  const [lines, setLines] = useState<CartLine[]>([]);
  const [exchangeRate, setExchangeRate] = useState(String(defaultRate));
  const [shippingByStore, setShippingByStore] = useState<Record<string, number>>({});
  const [query, setQuery] = useState("");
  const [catalogQuery, setCatalogQuery] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("all");
  const [filter, setFilter] = useState<"all" | "buy" | "check" | "owned">("all");
  const [drafts, setDrafts] = useState<Record<string, OfferDraft>>({});
  const [newItem, setNewItem] = useState<NewItemDraft>({ category: "other", brand: "", name: "" });
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  function initializePlanner(savedLists: ShoppingList[]) {
    setLists(savedLists);
    setListId("");
    setListName("");
    setSetupId("");
    setLines([]);
    setExchangeRate(String(defaultRate));
    setShippingByStore({});
    setDrafts({});
    setStatus("Wybierz zapisaną listę lub setup, aby rozpocząć.");
  }

  useEffect(() => {
    let active = true;
    async function loadPlanner() {
      try {
        const authResponse = await fetch("/api/auth/me", { cache: "no-store" });
        const authData = await authResponse.json();
        const signedIn = Boolean(authData.user);
        if (!signedIn) {
          if (active) {
            setAuthenticated(false);
            setSetups(catalogSetups);
            initializePlanner(readLocalLists());
          }
          return;
        }

        const [setupResponse, listResponse] = await Promise.all([
          fetch("/api/setups", { cache: "no-store" }),
          fetch("/api/shopping", { cache: "no-store" }),
        ]);
        const setupData = await setupResponse.json();
        const listData = await listResponse.json();
        if (!active) return;
        setAuthenticated(true);
        const savedSetups = setupResponse.ok && Array.isArray(setupData.items) ? setupData.items : [];
        setSetups([...savedSetups, ...catalogSetups]);
        const savedLists = listResponse.ok && Array.isArray(listData.items) ? listData.items : [];
        initializePlanner(savedLists);
        if (!listResponse.ok) setError(listData.error ?? "Nie udało się pobrać list zakupowych.");
        if (!setupResponse.ok) setError(setupData.error ?? "Nie udało się pobrać setupów.");
      } catch {
        if (active) {
          setAuthenticated(false);
          setSetups(catalogSetups);
          initializePlanner(readLocalLists());
          setStatus("Tryb lokalny: listy zapisują się w tej przeglądarce.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadPlanner();
    return () => { active = false; };
  }, []);

  const rateValue = Number.parseFloat(exchangeRate.replace(",", "."));
  const rateValid = Number.isFinite(rateValue) && rateValue > 0 && rateValue <= 100;
  const rate = rateValid ? rateValue : defaultRate;
  const updateLine = (id: string, update: (line: CartLine) => CartLine) => setLines((current) => current.map((line) => line.id === id ? update(line) : line));
  const stores = useMemo(() => Array.from(new Set(lines.filter((line) => line.purchase).map((line) => line.offers.find((offer) => offer.id === line.selectedOfferId)?.store ?? "Bez sprzedawcy"))).sort((a, b) => a.localeCompare(b, "pl")), [lines]);

  const visibleLines = lines.filter((line) => {
    const text = `${line.category} ${line.brand} ${line.name}`.toLocaleLowerCase("pl");
    const matchesQuery = !query.trim() || text.includes(query.trim().toLocaleLowerCase("pl"));
    const matchesFilter = filter === "all" || (filter === "buy" && line.purchase) || (filter === "check" && line.requiresFitmentCheck) || (filter === "owned" && (line.keepExisting || line.includedInCylinder));
    return matchesQuery && matchesFilter;
  });
  const purchasableLines = lines.filter((line) => line.purchase);
  const hasAlternativeOffers = purchasableLines.some((line) => line.offers.length > 1);
  const subtotalPln = purchasableLines.reduce((sum, line) => {
    const offer = line.offers.find((item) => item.id === line.selectedOfferId) ?? line.offers[0];
    return sum + (offer ? (offer.currency === "EUR" ? offer.price * rate : offer.price) * line.quantity : 0);
  }, 0);
  const shippingTotal = stores.reduce((sum, store) => sum + (Number(shippingByStore[store]) || 0), 0);
  const cheapestTotalPln = purchasableLines.reduce((sum, line) => {
    const cheapest = line.offers.reduce<Offer | null>((current, offer) => {
      if (!current) return offer;
      const currentValue = current.currency === "EUR" ? current.price * rate : current.price;
      const offerValue = offer.currency === "EUR" ? offer.price * rate : offer.price;
      return offerValue < currentValue ? offer : current;
    }, null);
    return sum + (cheapest ? (cheapest.currency === "EUR" ? cheapest.price * rate : cheapest.price) * line.quantity : 0);
  }, 0);
  const matchingProducts = productCatalog.filter((product) => {
    const searchText = `${product.name} ${product.brand} ${productCategoryLabels[product.category] ?? product.category} ${product.note ?? ""}`.toLocaleLowerCase("pl");
    const searchTerms = catalogQuery.trim().toLocaleLowerCase("pl").split(/\s+/).filter(Boolean);
    return (catalogCategory === "all" || product.category === catalogCategory) && searchTerms.every((term) => searchText.includes(term));
  });

  function addSetupToList() {
    const setup = setups.find((item) => item.id === setupId);
    if (!setup) return;
    const importedLines = linesFromSetup(setup);
    setLines((current) => [...current, ...importedLines]);
    if (!listName.trim()) setListName(`${setup.name} · zakupy`.slice(0, 100));
    setStatus(`Dodano ${importedLines.length} pozycji z setupu „${setup.name}” do bieżącej listy.`);
    setError("");
  }

  function addCatalogProduct(product: (typeof productCatalog)[number]) {
    setLines((current) => [...current, lineFromCatalog(product)]);
    setStatus(`Dodano „${product.name}” do listy. ${product.fitmentCheck ? "Potwierdź dopasowanie przed zakupem." : "Oferta jest gotowa do koszyka."}`);
    setError("");
  }

  async function clearList() {
    if (saving || !window.confirm("Usunąć wszystkie pozycje z tej listy? Nazwa listy i sam zapis zostaną zachowane.")) return;
    if (!listId) {
      setLines([]);
      setShippingByStore({});
      setDrafts({});
      setStatus("Wyczyszczono bieżącą listę. Zapisz ją, aby zachować pustą listę.");
      setError("");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const nextRate = rateValid ? rate : defaultRate;
      const name = listName.trim() || lists.find((list) => list.id === listId)?.name || "Lista zakupowa";
      if (!authenticated) {
        const existing = readLocalLists().find((item) => item.id === listId);
        if (!existing) throw new Error("Nie znaleziono zapisanej listy w tej przeglądarce.");
        const saved: ShoppingList = { ...existing, name, items: [], exchange_rate: nextRate, shipping_by_store: {}, updated_at: new Date().toISOString() };
        const nextLists = [saved, ...readLocalLists().filter((item) => item.id !== saved.id)];
        writeLocalLists(nextLists);
        setLists(nextLists);
        setListName(saved.name);
      } else {
        const response = await fetch("/api/shopping", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: listId, name, items: [], exchangeRate: nextRate, shippingByStore: {} }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Nie udało się wyczyścić listy.");
        const saved: ShoppingList = { ...data.item, items: [], exchange_rate: data.item.exchange_rate, shipping_by_store: {} };
        setLists((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
        setListName(saved.name);
      }
      setLines([]);
      setExchangeRate(String(nextRate));
      setShippingByStore({});
      setDrafts({});
      setStatus("Wyczyszczono pozycje i koszty wysyłki. Zapis listy został zachowany.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się wyczyścić listy.");
    } finally {
      setSaving(false);
    }
  }

  function loadList(id: string) {
    const list = lists.find((item) => item.id === id);
    if (!list) {
      setListId("");
      setListName("");
      setLines([]);
      setExchangeRate(String(defaultRate));
      setShippingByStore({});
      setDrafts({});
      return;
    }
    setListId(list.id);
    setListName(list.name);
    setLines(list.items);
    setExchangeRate(String(list.exchange_rate));
    setShippingByStore(list.shipping_by_store ?? {});
    setStatus(`Wczytano listę „${list.name}”.`);
    setError("");
  }

  function addCustomItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newItem.name.trim();
    if (name.length < 2) return;
    setLines((current) => [...current, makeLine(newItem.category, newItem.brand.trim().slice(0, 80), name.slice(0, 120), 0)]);
    setNewItem({ ...newItem, brand: "", name: "" });
    setStatus("Dodano własną pozycję. Dodaj do niej ofertę, aby uwzględnić ją w koszyku.");
  }

  async function saveList() {
    if (saving) return;
    if (!rateValid) {
      setError("Kurs EUR/PLN musi być liczbą większą od 0 i nie większą niż 100.");
      return;
    }
    if (!listName.trim()) {
      setError("Nadaj nazwę liście.");
      return;
    }
    setSaving(true);
    setError("");
    setStatus("");
    try {
      if (!authenticated) {
        const saved: ShoppingList = {
          id: listId || makeId(),
          name: listName.trim(),
          items: lines,
          exchange_rate: rate,
          shipping_by_store: shippingByStore,
          updated_at: new Date().toISOString(),
        };
        const nextLists = [saved, ...readLocalLists().filter((item) => item.id !== saved.id)];
        writeLocalLists(nextLists);
        setListId(saved.id);
        setLists(nextLists);
        setStatus("Lista zapisana w tej przeglądarce. Zaloguj się, aby synchronizować ją z kontem.");
        return;
      }
      const response = await fetch("/api/shopping", {
        method: listId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(listId ? { id: listId } : {}), name: listName.trim(), items: lines, exchangeRate: rate, shippingByStore }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się zapisać listy.");
      const saved: ShoppingList = { ...data.item, items: data.item.items, exchange_rate: data.item.exchange_rate, shipping_by_store: data.item.shipping_by_store };
      setListId(saved.id);
      setLists((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setStatus("Lista zakupowa zapisana na koncie.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się zapisać listy.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteList() {
    if (!listId || saving) return;
    setSaving(true);
    setError("");
    try {
      if (!authenticated) {
        const nextLists = readLocalLists().filter((list) => list.id !== listId);
        writeLocalLists(nextLists);
        setLists(nextLists);
        setListId("");
        setListName("");
        setLines([]);
        setStatus("Lista została usunięta z tej przeglądarki.");
        return;
      }
      const response = await fetch("/api/shopping", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: listId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się usunąć listy.");
      setLists((current) => current.filter((list) => list.id !== listId));
      setListId("");
      setListName("");
      setLines([]);
      setStatus("Lista została usunięta.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się usunąć listy.");
    } finally {
      setSaving(false);
    }
  }

  function exportCsv() {
    const rows: (string | number)[][] = [["Kategoria", "Marka", "Produkt", "Sklep", "Cena", "Waluta", "Ilość", "Razem PLN", "Link", "Status"]];
    for (const line of lines) {
      const offer = line.offers.find((item) => item.id === line.selectedOfferId) ?? line.offers[0];
      const total = offer ? (offer.currency === "EUR" ? offer.price * rate : offer.price) * line.quantity : 0;
      rows.push([categoryLabels[line.category] ?? line.category, line.brand, line.name, offer?.store ?? "", offer?.price ?? 0, offer?.currency ?? "", line.quantity, total.toFixed(2), offer?.url ?? "", line.purchase ? "Do kupienia" : line.includedInCylinder ? "W zestawie" : line.keepExisting ? "Pozostaw" : "Do weryfikacji"]);
    }
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(listName || "motohub-zakupy").replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const inputClass = "w-full rounded-lg border border-white/10 bg-[#101010] px-3 py-2.5 text-xs text-white outline-none focus:border-red-400/40";

  if (loading) return <div className="py-20 text-center text-sm text-zinc-500">Wczytywanie setupów i list zakupowych…</div>;

  return (
    <>
    <div className="shopping-screen-only grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <section className="shopping-controls border-b border-white/10 pb-6">
          <div className="mb-4"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-300">Lista zakupowa</p><h2 className="mt-1 text-lg font-bold">Lista i źródło części</h2></div>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
            <label className="text-[10px] font-semibold text-zinc-500">Otwórz zapisaną listę<select className={`${inputClass} mt-1`} value={listId} onChange={(event) => loadList(event.target.value)}><option value="">Nowa lista…</option>{lists.map((list) => <option key={list.id} value={list.id}>{list.name} · {new Date(list.updated_at).toLocaleDateString("pl-PL")}</option>)}</select></label>
            <label className="text-[10px] font-semibold text-zinc-500">Setup do importu<select className={`${inputClass} mt-1 md:min-w-64`} value={setupId} onChange={(event) => setSetupId(event.target.value)}><option value="">Wybierz setup…</option>{setups.map((setup) => <option key={setup.id} value={setup.id}>{setup.name} · {setup.engine}</option>)}</select></label>
            <div className="flex items-end"><button type="button" disabled={!setupId} onClick={addSetupToList} className="w-full rounded-lg border border-red-400/30 px-4 py-2.5 text-xs font-bold text-red-200 transition hover:bg-red-500/10 disabled:opacity-40 md:w-auto">Dodaj setup do listy</button></div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
            <label className="text-[10px] font-semibold text-zinc-500">Nazwa listy<input maxLength={100} className={`${inputClass} mt-1`} value={listName} onChange={(event) => setListName(event.target.value)} placeholder="np. Setup AM6 · etap 1" /></label>
            <label className="text-[10px] font-semibold text-zinc-500">Kurs EUR → PLN<input inputMode="decimal" className={`${inputClass} mt-1`} value={exchangeRate} onChange={(event) => setExchangeRate(event.target.value)} /></label>
          </div>
          {!rateValid && <p role="alert" className="mt-2 text-[10px] text-amber-200">Wpisz prawidłowy kurs, aby poprawnie policzyć i zapisać listę.</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => void saveList()} disabled={saving || !rateValid} className="rounded-lg bg-red-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-400 disabled:opacity-40">{saving ? "Zapisywanie…" : listId ? "Zapisz zmiany" : "Zapisz listę"}</button>
            <button type="button" onClick={exportCsv} disabled={lines.length === 0} className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-40">Eksport CSV</button>
            <button type="button" onClick={() => window.print()} disabled={purchasableLines.length === 0} className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white disabled:opacity-40">Eksport PDF</button>
            <button type="button" onClick={() => void clearList()} disabled={saving || lines.length === 0 || !rateValid} className="rounded-lg border border-white/10 px-3 py-2.5 text-xs font-semibold text-zinc-400 hover:text-red-200 disabled:opacity-40">Wyczyść listę</button>
            {listId && <button type="button" onClick={() => void deleteList()} disabled={saving} className="ml-auto rounded-lg px-3 py-2.5 text-xs font-semibold text-zinc-500 hover:text-red-300">Usuń listę</button>}
          </div>
          {error && <p role="alert" className="mt-3 text-xs text-red-300">{error}</p>}
          {status && <p role="status" className="mt-3 text-xs text-emerald-300">{status}</p>}
          {!authenticated && <p className="mt-3 text-[10px] leading-4 text-zinc-500">Tryb lokalny. Listy pozostają na tym urządzeniu. <Link href="/logowanie" className="font-semibold text-red-200 underline underline-offset-2">Zaloguj się, aby synchronizować z profilem.</Link></p>}
          {setups.length === 0 && <p className="mt-3 text-xs text-amber-200/70">Brak setupów w profilu i katalogu.</p>}
        </section>

        <section className="py-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-300">Pozycje</p><h2 className="mt-1 text-xl font-black">Lista części <span className="text-sm font-medium text-zinc-500">{purchasableLines.length} do kupienia / {lines.length} wszystkich</span></h2></div>
            <label className="text-[10px] text-zinc-500"><span className="sr-only">Szukaj części</span><input className={`${inputClass} min-w-48`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj części…" /></label>
          </div>
          <details className="shopping-screen-only mt-4 border-y border-white/[.07] py-3">
            <summary className="cursor-pointer text-xs font-semibold text-zinc-400 hover:text-white">Dodaj własną część</summary>
            <form onSubmit={addCustomItem} className="mt-3 grid gap-2 sm:grid-cols-[140px_1fr_1.5fr_auto]">
            <select aria-label="Kategoria części" value={newItem.category} onChange={(event) => setNewItem({ ...newItem, category: event.target.value })} className={inputClass}>{[["other", "Inna część"], ...Object.entries(categoryLabels)].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
            <input aria-label="Marka części" value={newItem.brand} onChange={(event) => setNewItem({ ...newItem, brand: event.target.value })} maxLength={80} placeholder="Marka · opcjonalnie" className={inputClass} />
            <input aria-label="Nazwa części" required minLength={2} maxLength={120} value={newItem.name} onChange={(event) => setNewItem({ ...newItem, name: event.target.value })} placeholder="Dodaj część spoza katalogu…" className={inputClass} />
            <button type="submit" className="rounded-lg border border-white/10 px-3 py-2.5 text-xs font-bold text-zinc-300 hover:text-white">Dodaj pozycję</button>
            </form>
          </details>
          <details className="shopping-catalog mt-3 border-y border-white/[.07] py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3"><span><span className="block text-xs font-bold text-zinc-200">Katalog części</span><span className="mt-1 block text-[10px] text-zinc-500">{productCatalog.length} ofert · {matchingProducts.length} pasujących wyników</span></span><span className="text-lg text-zinc-500">+</span></summary>
            <div className="mt-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-300">Oferty sklepowe</p><h3 className="mt-1 text-base font-bold">{matchingProducts.length} wyników</h3></div>
              <label className="text-[10px] text-zinc-500"><span className="sr-only">Szukaj w katalogu części</span><input className={`${inputClass} min-w-48`} value={catalogQuery} onChange={(event) => setCatalogQuery(event.target.value)} placeholder="Szukaj nazwy, marki, modelu…" /></label>
            </div>
            <label className="mt-3 block max-w-sm text-[10px] font-semibold text-zinc-500">Kategoria<select className={`${inputClass} mt-1`} value={catalogCategory} onChange={(event) => setCatalogCategory(event.target.value)}><option value="all">Wszystkie kategorie</option>{Object.entries(productCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <div className="mt-3 max-h-[520px] space-y-2 overflow-y-auto pr-1">
              {matchingProducts.length === 0 ? <p className="py-8 text-center text-xs text-zinc-500">Brak produktów pasujących do wyszukiwania.</p> : matchingProducts.map((product) => <article key={product.id} className="grid gap-2 border-b border-white/[.06] py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0"><p className="text-[9px] font-semibold text-zinc-500">{productCategoryLabels[product.category]} · {product.brand}</p><h4 className="mt-1 text-xs font-semibold text-zinc-200">{product.name}</h4>{product.note && <p className="mt-1 text-[10px] leading-4 text-amber-100/60">{product.note}</p>}<p className="mt-1 text-[9px] text-zinc-600">Cena snapshot · {productCatalogUpdated}</p></div>
                <div className="flex items-center gap-3 sm:justify-end"><span className="shrink-0 text-xs font-bold text-zinc-200">{money(product.pricePln, "PLN")}</span><a href={product.url} target="_blank" rel="noreferrer" className="shrink-0 text-[10px] font-semibold text-red-200 underline underline-offset-2">{product.store} ↗</a><button type="button" onClick={() => addCatalogProduct(product)} className="shrink-0 rounded-md border border-red-400/30 px-3 py-2 text-[10px] font-bold text-red-100 hover:bg-red-500/10">Dodaj</button></div>
              </article>)}
            </div>
            <p className="mt-3 text-[9px] leading-4 text-zinc-600">Ceny i dostępność są migawką z podanej daty. Przed zakupem potwierdź aktualną ofertę i zgodność z modelem, rocznikiem oraz wymiarami.</p>
            </div>
          </details>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Filtr listy zakupowej">{([ ["all", "Wszystkie"], ["buy", "Do kupienia"], ["check", "Do weryfikacji"], ["owned", "W zestawie / posiadane"] ] as const).map(([value, label]) => <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)} className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold ${filter === value ? "border-red-400/30 bg-red-500/10 text-red-100" : "border-white/10 text-zinc-500 hover:text-white"}`}>{label}</button>)}</div>
          {lines.length === 0 ? <div className="border-b border-white/10 py-14 text-center"><p className="text-sm font-semibold text-zinc-300">Lista jest pusta</p><p className="mt-2 text-xs text-zinc-500">Wybierz setup z katalogu lub profilu albo dodaj własną pozycję.</p><Link href="/narzedzia/kreator-setupu" className="mt-4 inline-block text-xs font-bold text-red-200 underline underline-offset-4">Otwórz kreator setupu</Link></div> : visibleLines.length === 0 ? <p className="border-b border-white/10 py-10 text-center text-xs text-zinc-500">Brak pozycji dla tych filtrów.</p> : <div className="mt-4 space-y-3">
            {visibleLines.map((line) => {
              const chosenOffer = line.offers.find((offer) => offer.id === line.selectedOfferId) ?? line.offers[0];
              const chosenPrice = chosenOffer ? (chosenOffer.currency === "EUR" ? chosenOffer.price * rate : chosenOffer.price) * line.quantity : 0;
              const draft = drafts[line.id] ?? { store: "", price: "", currency: "EUR" as const, url: "" };
              return <article key={line.id} className="border-b border-white/10 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <input aria-label={`Dodaj ${line.name} do koszyka`} type="checkbox" checked={line.purchase} disabled={line.includedInCylinder || line.keepExisting || (line.requiresFitmentCheck && !line.fitmentConfirmed) || line.offers.length === 0} onChange={(event) => updateLine(line.id, (item) => ({ ...item, purchase: event.target.checked }))} className="mt-1 h-4 w-4 accent-red-500" />
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{categoryLabels[line.category] ?? line.category}</p>
                      <h3 className="mt-1 text-sm font-bold text-zinc-100">{line.brand ? `${line.brand} · ` : ""}{line.name}</h3>
                      <p className="mt-1 text-[10px] text-zinc-500">{line.includedInCylinder ? "W zestawie z cylindrem" : line.keepExisting ? "Pozostaw część po kontroli" : line.requiresFitmentCheck ? line.fitmentConfirmed ? "Dopasowanie sprawdzone przez Ciebie" : "Wymaga weryfikacji przed zakupem" : line.offers.length === 0 ? "Dodaj ofertę, aby doliczyć do koszyka" : `${line.offers.length} ${line.offers.length === 1 ? "oferta" : "oferty"}`}</p>
                      {line.catalogNote && <p className="mt-1 text-[10px] leading-4 text-amber-100/60">{line.catalogNote}</p>}
                    </div>
                    <button type="button" aria-label={`Usuń pozycję ${line.name}`} onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))} className="shrink-0 text-lg leading-none text-zinc-600 hover:text-red-300">×</button>
                  </div>
                  <div className="flex items-center gap-2"><label className="text-[9px] text-zinc-600">Ilość<input aria-label={`Ilość: ${line.name}`} type="number" min="1" max="99" step="1" value={line.quantity} onChange={(event) => updateLine(line.id, (item) => ({ ...item, quantity: Math.max(1, Math.min(99, Number(event.target.value) || 1)) }))} className="ml-2 w-16 rounded border border-white/10 bg-[#101010] px-2 py-1.5 text-center text-xs text-white" /></label><label className="text-[9px] text-zinc-600">Cena oferty<input aria-label={`Cena wybranej oferty: ${line.name}`} readOnly value={chosenOffer ? money(chosenOffer.price, chosenOffer.currency) : "—"} className="ml-2 w-28 rounded border border-white/10 bg-[#101010] px-2 py-1.5 text-right text-xs text-white" /></label><span className="min-w-24 text-right text-xs font-bold text-zinc-200">{line.purchase ? money(chosenPrice, "PLN") : "—"}</span></div>
                </div>
                {line.offers.length > 0 && <div className="ml-7 mt-3 grid gap-1 sm:grid-cols-2">
                  {line.offers.map((offer) => {
                    const pricePln = (offer.currency === "EUR" ? offer.price * rate : offer.price) * line.quantity;
                    return <div key={offer.id} className={`flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 ${line.selectedOfferId === offer.id ? "border-red-400/25 bg-red-500/[.06]" : "border-white/[.06] bg-white/[.015]"}`}><input type="radio" name={`offer-${line.id}`} aria-label={`Wybierz ofertę ${offer.store}`} checked={line.selectedOfferId === offer.id} onChange={() => updateLine(line.id, (item) => ({ ...item, selectedOfferId: offer.id }))} className="h-3.5 w-3.5 accent-red-500" /><span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-zinc-300">{offer.store}</span><span className="shrink-0 text-[10px] text-zinc-400">{money(offer.price, offer.currency)}{line.purchase ? ` · ${money(pricePln, "PLN")}` : ""}</span>{offer.url.startsWith("http://") || offer.url.startsWith("https://") ? <a href={offer.url} target="_blank" rel="noreferrer" className="shrink-0 text-[9px] font-semibold text-red-200 underline underline-offset-2">Sklep ↗</a> : null}<button type="button" aria-label={`Usuń ofertę ${offer.store}`} onClick={() => updateLine(line.id, (item) => { const offers = item.offers.filter((entry) => entry.id !== offer.id); return { ...item, offers, selectedOfferId: item.selectedOfferId === offer.id ? offers[0]?.id ?? "" : item.selectedOfferId, purchase: offers.length > 0 && item.purchase }; })} className="shrink-0 px-1 text-zinc-600 hover:text-red-300">×</button></div>;
                  })}
                </div>}
                {line.requiresFitmentCheck && <label className="ml-7 mt-2 flex items-start gap-2 text-[10px] leading-4 text-amber-200/70"><input type="checkbox" checked={line.fitmentConfirmed} onChange={(event) => updateLine(line.id, (item) => ({ ...item, fitmentConfirmed: event.target.checked, purchase: event.target.checked ? item.purchase : false }))} className="mt-0.5 h-3.5 w-3.5 accent-amber-400" />Potwierdziłem dopasowanie dokładnego wymiaru i kodu silnika. {line.fitmentConfirmed ? "Możesz zaznaczyć pozycję do koszyka." : "Po weryfikacji odblokuje się dodanie do koszyka."}</label>}
                <details className="ml-7 mt-2"><summary className="cursor-pointer text-[10px] font-semibold text-zinc-500 hover:text-zinc-300">Dodaj inną ofertę tego samego produktu</summary><div className="mt-2 grid gap-2 sm:grid-cols-[1fr_100px_90px_1.4fr_auto]">
                  <input value={draft.store} onChange={(event) => setDrafts((current) => ({ ...current, [line.id]: { ...draft, store: event.target.value } }))} placeholder="Sklep" aria-label="Sklep" className={inputClass} />
                  <input type="number" min="0" step="0.01" value={draft.price} onChange={(event) => setDrafts((current) => ({ ...current, [line.id]: { ...draft, price: event.target.value } }))} placeholder="Cena" aria-label="Cena oferty" className={inputClass} />
                  <select aria-label="Waluta oferty" value={draft.currency} onChange={(event) => setDrafts((current) => ({ ...current, [line.id]: { ...draft, currency: event.target.value as "PLN" | "EUR" } }))} className={inputClass}><option value="EUR">EUR</option><option value="PLN">PLN</option></select>
                  <input type="url" value={draft.url} onChange={(event) => setDrafts((current) => ({ ...current, [line.id]: { ...draft, url: event.target.value } }))} placeholder="Link do dokładnie tej części" aria-label="Link do produktu" className={inputClass} />
                  <button type="button" onClick={() => {
                    const price = Number(draft.price.replace(",", "."));
                    if (!draft.store.trim() || !Number.isFinite(price) || price < 0) return;
                    const offer = { id: makeId(), store: draft.store.trim().slice(0, 80), price, currency: draft.currency, url: draft.url.trim() };
                    updateLine(line.id, (item) => ({ ...item, offers: [...item.offers, offer], selectedOfferId: offer.id }));
                    setDrafts((current) => ({ ...current, [line.id]: { store: "", price: "", currency: draft.currency, url: "" } }));
                  }} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 hover:text-white">Dodaj</button>
                </div><p className="mt-2 text-[9px] text-zinc-600">Dodaj tylko ofertę tego samego produktu i wariantu; ceny i dostępność sprawdzaj bezpośrednio w sklepie.</p></details>
              </article>;
            })}
          </div>}
        </section>
      </div>

      <aside className="self-start border-t border-red-400/30 pt-5 xl:sticky xl:top-5 xl:border-t-0 xl:border-l xl:pl-6">
        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-red-300">Koszyk</p><h2 className="mt-2 text-2xl font-black">{money(subtotalPln + shippingTotal, "PLN")}</h2><p className="mt-1 text-xs text-zinc-500">części {money(subtotalPln, "PLN")} + wysyłka {money(shippingTotal, "PLN")}</p>
        <div className="mt-5 border-y border-white/10 py-4"><div className="flex justify-between text-xs text-zinc-400"><span>Do kupienia</span><span>{purchasableLines.length} pozycji</span></div>{hasAlternativeOffers && <><div className="mt-2 flex justify-between text-xs text-zinc-400"><span>Najniższa suma ofert</span><span>{money(cheapestTotalPln, "PLN")}</span></div><p className="mt-2 text-[10px] leading-4 text-zinc-600">Oszczędność względem wybranych ofert: {money(Math.max(0, subtotalPln - cheapestTotalPln), "PLN")}</p></>}</div>
        <section className="mt-5"><h3 className="text-xs font-bold text-zinc-300">Koszty wysyłki per sklep</h3>{stores.length === 0 ? <p className="mt-2 text-[10px] text-zinc-600">Zaznacz pozycje do kupienia i przypisz im oferty.</p> : <div className="mt-2 space-y-2">{stores.map((store) => {
          const storeSum = purchasableLines.reduce((sum, line) => {
            const offer = line.offers.find((item) => item.id === line.selectedOfferId);
            if (!offer || offer.store !== store) return sum;
            return sum + (offer.currency === "EUR" ? offer.price * rate : offer.price) * line.quantity;
          }, 0);
          return <div key={store} className="border-b border-white/[.06] py-2"><div className="flex justify-between gap-2"><span className="truncate text-[10px] font-semibold text-zinc-300">{store}</span><span className="text-[10px] text-zinc-500">{money(storeSum, "PLN")}</span></div><label className="mt-2 flex items-center justify-between text-[10px] text-zinc-600">Wysyłka · PLN<input type="number" min="0" step="0.01" value={shippingByStore[store] ?? ""} onChange={(event) => setShippingByStore((current) => ({ ...current, [store]: Math.max(0, Number(event.target.value) || 0) }))} className="w-24 rounded border border-white/10 bg-[#101010] px-2 py-1.5 text-right text-xs text-white" /></label></div>;
        })}</div>}</section>
        <div className="mt-5 border-t border-white/10 pt-4"><p className="text-[10px] leading-5 text-zinc-600">Drobne materiały, narzędzia i płyny dodaj jako własne pozycje. Ceny z katalogu są snapshotami, nie ofertami na żywo. Wysyłkę, dostępność, wariant Euro, montaż i zgodność części zawsze potwierdź w sklepie.</p></div>
      </aside>
    </div>
    <section className="shopping-pdf-only">
      <header className="shopping-print-header">
        <div className="shopping-print-brand-block"><p className="shopping-print-brand">MOTOHUB</p><p className="shopping-print-subtitle">KOSZTORYS CZĘŚCI</p></div>
        <div className="shopping-print-meta"><h1>{listName || "Lista zakupowa"}</h1><p>Wygenerowano: {new Date().toLocaleDateString("pl-PL")}</p><p>{purchasableLines.length} pozycji do zakupu</p>{purchasableLines.some((line) => line.offers.find((offer) => offer.id === line.selectedOfferId)?.currency === "EUR") && <p>Kurs EUR/PLN: {rate.toFixed(4)}</p>}</div>
      </header>
      {purchasableLines.length === 0 ? <p>Brak pozycji zaznaczonych do zakupu.</p> : <>
        <table className="shopping-pdf-table">
          <thead><tr><th>Pozycja</th><th>Sklep</th><th>Ilość</th><th>Cena / szt.</th><th>Wartość</th></tr></thead>
          <tbody>{purchasableLines.map((line) => {
            const offer = line.offers.find((item) => item.id === line.selectedOfferId) ?? line.offers[0];
            const unitPricePln = offer ? (offer.currency === "EUR" ? offer.price * rate : offer.price) : 0;
            return <tr key={line.id}>
              <td><span className="shopping-pdf-category">{categoryLabels[line.category] ?? line.category}</span><strong>{line.brand ? `${line.brand} · ` : ""}{line.name}</strong></td>
              <td>{offer?.url ? <a href={offer.url}>{offer.store}</a> : offer?.store ?? "—"}</td>
              <td>{line.quantity}</td>
              <td>{money(unitPricePln, "PLN")}</td>
              <td>{money(unitPricePln * line.quantity, "PLN")}</td>
            </tr>;
          })}</tbody>
        </table>
        <div className="shopping-pdf-summary">
          <div><span>Części</span><span>{money(subtotalPln, "PLN")}</span></div>
          {stores.filter((store) => (Number(shippingByStore[store]) || 0) > 0).map((store) => <div key={store}><span>Wysyłka · {store}</span><span>{money(Number(shippingByStore[store]), "PLN")}</span></div>)}
          <div className="shopping-pdf-total"><strong>Razem</strong><strong>{money(subtotalPln + shippingTotal, "PLN")}</strong></div>
        </div>
        <p className="shopping-pdf-footnote">Ceny i dostępność mogą ulec zmianie. Przed zakupem potwierdź ofertę i koszt wysyłki w sklepie.</p>
      </>}
    </section>
    </>
  );
}