"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SiteNav from "../SiteNav";

type User = { id: string; email: string; username: string | null };
type SavedSetup = {
  id: string;
  name: string;
  engine: string;
  goal: string;
  setup: {
    bike?: string;
    year?: string;
    cylinder?: { brand?: string; name?: string; displacement?: string; power?: [number, number]; rpm?: [number, number] };
    totalPln?: number;
    parts?: { category?: string; brand?: string; name?: string; keepExisting?: boolean; requiresFitmentCheck?: boolean }[];
  };
  created_at: string;
  share_token: string | null;
};

const setupGoalLabels: Record<string, string> = {
  daily: "Trwały daily",
  sport: "Sport",
  race: "Racing",
  track: "Tor / high-end",
};
const setupCategoryLabels: Record<string, string> = {
  crankshaft: "Wał korbowy", bearings: "Łożyska", carburetor: "Gaźnik", intakeManifold: "Króciec",
  reed: "Membrana", exhaust: "Wydech", clutch: "Sprzęgło", ignition: "Zapłon", airFilter: "Filtr powietrza", waterPump: "Pompa wody",
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [garageCount, setGarageCount] = useState(0);
  const [setups, setSetups] = useState<SavedSetup[]>([]);
  const [deletingSetupId, setDeletingSetupId] = useState("");
  const [selectedSetupIds, setSelectedSetupIds] = useState<string[]>([]);
  const [sharingSetupId, setSharingSetupId] = useState("");
  const [shareMessages, setShareMessages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const [authResponse, garageResponse, setupsResponse] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/garage", { cache: "no-store" }),
          fetch("/api/setups", { cache: "no-store" }),
        ]);
        const auth = await authResponse.json();
        const garage = garageResponse.ok ? await garageResponse.json() : { items: [] };
        const savedSetups = setupsResponse.ok ? await setupsResponse.json() : { items: [] };
        if (!active) return;
        setUser(auth.user ?? null);
        setGarageCount(Array.isArray(garage.items) ? garage.items.length : 0);
        setSetups(Array.isArray(savedSetups.items) ? savedSetups.items : []);
        if (!garageResponse.ok && garageResponse.status !== 401) setError(garage.error ?? "Nie udało się wczytać garażu.");
        if (!setupsResponse.ok && setupsResponse.status !== 401) setError("Nie udało się wczytać zapisanych setupów.");
      } catch {
        if (active) setError("Nie udało się połączyć z serwerem.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();
    return () => { active = false; };
  }, []);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Nie udało się wylogować.");
      router.replace("/");
      router.refresh();
    } catch {
      setError("Nie udało się wylogować. Spróbuj ponownie.");
    } finally {
      setLoggingOut(false);
    }
  }

  async function deleteSetup(id: string) {
    if (deletingSetupId) return;
    setDeletingSetupId(id);
    setError("");
    try {
      const response = await fetch("/api/setups", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się usunąć setupu.");
      setSetups((current) => current.filter((setup) => setup.id !== id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Nie udało się usunąć setupu.");
    } finally {
      setDeletingSetupId("");
    }
  }

  function toggleSetupComparison(id: string) {
    setSelectedSetupIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : current.length < 3 ? [...current, id] : current);
  }

  async function toggleSetupSharing(setup: SavedSetup) {
    if (sharingSetupId) return;
    setSharingSetupId(setup.id);
    setShareMessages((current) => ({ ...current, [setup.id]: "" }));
    try {
      const response = await fetch("/api/setups", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: setup.id, shared: !setup.share_token }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się zmienić udostępniania.");
      setSetups((current) => current.map((item) => item.id === setup.id ? { ...item, share_token: data.item.share_token } : item));
      if (data.item.share_token) {
        const shareUrl = `${window.location.origin}/setup/${data.item.share_token}`;
        try {
          await navigator.clipboard.writeText(shareUrl);
          setShareMessages((current) => ({ ...current, [setup.id]: "Link skopiowany do schowka." }));
        } catch {
          setShareMessages((current) => ({ ...current, [setup.id]: "Link gotowy. Otwórz go lub skopiuj z paska adresu." }));
        }
      } else {
        setShareMessages((current) => ({ ...current, [setup.id]: "Publiczny link został wyłączony." }));
      }
    } catch (caught) {
      setShareMessages((current) => ({ ...current, [setup.id]: caught instanceof Error ? caught.message : "Nie udało się zmienić udostępniania." }));
    } finally {
      setSharingSetupId("");
    }
  }

  if (loading) return <main className="min-h-screen bg-[#090909] px-6 py-6 text-white"><div className="mx-auto max-w-7xl"><SiteNav /><div className="py-24 text-center text-zinc-500">Ładowanie profilu...</div></div></main>;

  if (!user) return <main className="min-h-screen bg-[#090909] px-6 py-6 text-white"><div className="mx-auto max-w-7xl"><SiteNav /><div className="mx-auto max-w-xl py-24 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-2xl">🔒</div><h1 className="mt-6 text-3xl font-black">Zaloguj się, aby zobaczyć profil</h1><p className="mt-3 text-zinc-500">Tutaj znajdziesz swoje konto, garaż i najważniejsze skróty.</p><Link href="/logowanie" className="mt-7 inline-block rounded-full bg-red-500 px-7 py-3 font-bold">Zaloguj się</Link></div></div></main>;

  const username = user.username || user.email.split("@")[0];
  const initial = username.slice(0, 1).toUpperCase();

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-6 text-white">
      <div className="mx-auto max-w-7xl">
        <SiteNav />
        <section className="py-12 lg:py-16">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-red-500/10 via-white/[.03] to-transparent p-7 sm:p-10">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-red-500/10 blur-3xl" />
            <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-red-500 text-3xl font-black shadow-xl shadow-red-500/10">{initial}</div>
                <div><p className="text-sm font-bold uppercase tracking-[.2em] text-red-400">Mój profil</p><h1 className="mt-1 text-4xl font-black tracking-tight">{username}</h1><p className="mt-2 text-sm text-zinc-500">{user.email}</p></div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/garaz" className="rounded-full bg-white px-6 py-3 text-center text-sm font-bold text-black transition hover:bg-zinc-200">Otwórz garaż →</Link>
                <button type="button" onClick={logout} disabled={loggingOut} className="rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-zinc-300 transition hover:bg-white/5 disabled:opacity-50">{loggingOut ? "Wylogowywanie..." : "Wyloguj się"}</button>
              </div>
            </div>
          </div>

          {error && <p role="alert" className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/[.06] px-4 py-3 text-sm text-red-200">{error}</p>}

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[.03] p-6"><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">W garażu</p><p className="mt-3 text-3xl font-black">{garageCount}</p><p className="mt-1 text-sm text-zinc-600">motocykli</p></div>
            <div className="rounded-3xl border border-white/10 bg-white/[.03] p-6"><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Konto</p><p className="mt-3 text-3xl font-black">Aktywne</p><p className="mt-1 text-sm text-zinc-600">MotoHub</p></div>
            <div className="rounded-3xl border border-white/10 bg-white/[.03] p-6"><p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Status</p><p className="mt-3 text-3xl font-black text-red-400">Rider</p><p className="mt-1 text-sm text-zinc-600">członek społeczności</p></div>
          </div>

          <section className="mt-10 rounded-3xl border border-white/10 bg-white/[.03] p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-red-400">Twoje konfiguracje</p><h2 className="mt-2 text-2xl font-black">Zapisane setupy 2T</h2><p className="mt-2 text-sm text-zinc-500">Lista części, wybrany silnik i koszt zapisane z kreatora.</p></div><Link href="/narzedzia/kreator-setupu" className="rounded-full border border-red-400/25 px-4 py-2 text-xs font-bold text-red-200 transition hover:bg-red-500/10">Otwórz kreator →</Link></div>
            {selectedSetupIds.length > 0 && <section className="mt-5 overflow-hidden rounded-xl border border-red-400/20 bg-black/25">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.07] px-4 py-3"><div><h3 className="text-sm font-bold">Porównanie setupów</h3><p className="mt-1 text-[10px] text-zinc-500">Zestawienie części, osiągów i orientacyjnego kosztu · maks. 3 konfiguracje</p></div><button type="button" onClick={() => setSelectedSetupIds([])} className="text-xs font-semibold text-zinc-500 hover:text-white">Wyczyść</button></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-xs"><thead><tr className="border-b border-white/[.06]"><th className="w-40 px-4 py-3 text-[10px] font-semibold uppercase text-zinc-500">Parametr</th>{setups.filter((setup) => selectedSetupIds.includes(setup.id)).map((setup) => <th key={setup.id} className="min-w-44 px-4 py-3 font-bold text-zinc-200">{setup.name}</th>)}</tr></thead><tbody>
                {[
                  ["Silnik", (setup: SavedSetup) => setup.engine],
                  ["Cel", (setup: SavedSetup) => setupGoalLabels[setup.goal] ?? setup.goal],
                  ["Cylinder", (setup: SavedSetup) => `${setup.setup.cylinder?.brand ?? ""} ${setup.setup.cylinder?.name ?? "—"}`],
                  ["Pojemność", (setup: SavedSetup) => setup.setup.cylinder?.displacement ?? "—"],
                  ["Moc · KM", (setup: SavedSetup) => setup.setup.cylinder?.power?.join("–") ?? "—"],
                  ["Pasmo · obr./min", (setup: SavedSetup) => setup.setup.cylinder?.rpm?.join("–") ?? "—"],
                  ["Koszt · PLN", (setup: SavedSetup) => typeof setup.setup.totalPln === "number" ? new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(setup.setup.totalPln) : "—"],
                  ["Liczba części", (setup: SavedSetup) => `${(setup.setup.parts?.length ?? 0) + (setup.setup.cylinder ? 1 : 0)}`],
                  ...Object.entries(setupCategoryLabels).map(([category, label]) => [label, (setup: SavedSetup) => {
                    const part = setup.setup.parts?.find((item) => item.category === category);
                    return part ? `${part.brand ?? ""} ${part.name ?? ""}${part.keepExisting ? " · pozostaw" : part.requiresFitmentCheck ? " · sprawdź" : ""}` : "—";
                  }] as [string, (setup: SavedSetup) => string]),
                ].map(([label, getValue]) => <tr key={label as string} className="border-b border-white/[.04] last:border-0"><th className="px-4 py-2.5 text-[10px] font-medium text-zinc-500">{label as string}</th>{setups.filter((setup) => selectedSetupIds.includes(setup.id)).map((setup) => <td key={setup.id} className="px-4 py-2.5 text-zinc-300">{(getValue as (setup: SavedSetup) => string)(setup)}</td>)}</tr>)}
              </tbody></table></div>
            </section>}
            {setups.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-white/10 bg-black/15 px-5 py-8 text-center"><p className="text-sm font-semibold text-zinc-300">Nie masz jeszcze zapisanych setupów.</p><p className="mt-1 text-xs text-zinc-500">Ułóż konfigurację i zapisz ją z podsumowania kreatora.</p><Link href="/narzedzia/kreator-setupu" className="mt-4 inline-block text-xs font-bold text-red-200 underline underline-offset-4">Przejdź do kreatora</Link></div> : <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {setups.map((saved) => <article key={saved.id} className="rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3"><div><span className="rounded-full border border-red-400/20 bg-red-500/[.07] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-red-200">{saved.engine}</span><h3 className="mt-3 text-base font-bold">{saved.name}</h3><p className="mt-1 text-[11px] text-zinc-500">{saved.setup?.bike ? `${saved.setup.bike}${saved.setup.year ? ` · ${saved.setup.year}` : ""} · ` : ""}{saved.setup?.cylinder?.brand} {saved.setup?.cylinder?.name}</p></div><button type="button" onClick={() => deleteSetup(saved.id)} disabled={Boolean(deletingSetupId)} aria-label={`Usuń setup ${saved.name}`} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-zinc-400 transition hover:border-red-400/30 hover:text-red-200 disabled:opacity-50">{deletingSetupId === saved.id ? "Usuwanie…" : "Usuń"}</button></div>
                <div className="mt-4 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white/[.035] p-3"><p className="text-[9px] uppercase tracking-wider text-zinc-600">Części w zestawie</p><p className="mt-1 text-lg font-black">{(saved.setup?.parts?.length ?? 0) + (saved.setup?.cylinder ? 1 : 0)}</p></div><div className="rounded-xl bg-white/[.035] p-3"><p className="text-[9px] uppercase tracking-wider text-zinc-600">Orientacyjny koszt</p><p className="mt-1 text-lg font-black">{typeof saved.setup?.totalPln === "number" ? new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(saved.setup.totalPln) : "—"}</p></div></div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-600"><span>Cel: {setupGoalLabels[saved.goal] ?? saved.goal}</span><span>{new Date(saved.created_at).toLocaleDateString("pl-PL")}</span></div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/[.06] pt-3"><label className="flex items-center gap-2 text-[10px] font-semibold text-zinc-400"><input type="checkbox" checked={selectedSetupIds.includes(saved.id)} disabled={!selectedSetupIds.includes(saved.id) && selectedSetupIds.length >= 3} onChange={() => toggleSetupComparison(saved.id)} className="h-4 w-4 accent-red-500" />Porównaj {selectedSetupIds.length >= 3 && !selectedSetupIds.includes(saved.id) ? "· limit 3" : ""}</label><button type="button" onClick={() => void toggleSetupSharing(saved)} disabled={sharingSetupId === saved.id} className="text-[10px] font-semibold text-red-200 transition hover:text-white disabled:opacity-50">{sharingSetupId === saved.id ? "Aktualizacja…" : saved.share_token ? "Wyłącz link" : "Utwórz link publiczny"}</button></div>
                {saved.share_token && <Link href={`/setup/${saved.share_token}`} target="_blank" className="mt-2 block break-all text-[10px] text-zinc-500 underline decoration-white/20 underline-offset-2">motohub/setup/{saved.share_token}</Link>}
                {shareMessages[saved.id] && <p role="status" className="mt-2 text-[10px] text-emerald-300/80">{shareMessages[saved.id]}</p>}
                <details className="mt-3 rounded-xl border border-white/[.06] bg-white/[.02] p-3"><summary className="cursor-pointer text-[11px] font-semibold text-zinc-300">Pokaż części</summary><ul className="mt-3 space-y-2">{saved.setup?.parts?.map((part, index) => <li key={`${part.category}-${index}`} className="text-[10px] text-zinc-400"><b className="text-zinc-300">{part.brand}</b> · {part.name}{part.keepExisting ? " · pozostaw / skontroluj" : part.requiresFitmentCheck ? " · potwierdź zgodność przed zakupem" : ""}</li>)}</ul></details>
              </article>)}
            </div>}
          </section>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <Link href="/motocykle" className="group rounded-3xl border border-white/10 bg-white/[.03] p-7 transition hover:-translate-y-1 hover:border-red-500/30">
              <p className="text-sm font-bold text-red-400">Katalog</p><h2 className="mt-2 text-2xl font-black">Znajdź motocykl</h2><p className="mt-2 text-zinc-500">Przeglądaj modele i dodawaj swoje maszyny do garażu.</p><span className="mt-6 inline-block font-bold text-white">Przejdź do katalogu →</span>
            </Link>
            <Link href="/spolecznosc" className="group rounded-3xl border border-white/10 bg-white/[.03] p-7 transition hover:-translate-y-1 hover:border-red-500/30">
              <p className="text-sm font-bold text-red-400">Społeczność</p><h2 className="mt-2 text-2xl font-black">Poznaj innych riderów</h2><p className="mt-2 text-zinc-500">Sprawdź, co dzieje się w MotoHub i dołącz do rozmowy.</p><span className="mt-6 inline-block font-bold text-white">Otwórz społeczność →</span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
