"use client";

import { useState } from "react";
import { addLocalServiceRecord, readLocalServiceRecords, removeLocalServiceRecord } from "../lib/local-garage";

type ServiceRecord = {
  id: string;
  service_type: string;
  title: string;
  service_date: string;
  mileage: number | null;
  cost: number | null;
  next_due_date: string | null;
  next_due_mileage: number | null;
  notes: string | null;
};

type Props = {
  garageId: string;
  motorcycleName: string;
  mileage: number | null;
  onMileageChange: (mileage: number) => void;
};

const emptyForm = { serviceType: "Przegląd", title: "", serviceDate: new Date().toISOString().slice(0, 10), mileage: "", cost: "", nextDueDate: "", nextDueMileage: "", notes: "" };
const currency = new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 });

function getReminder(record: ServiceRecord, currentMileage: number | null) {
  const today = new Date().toISOString().slice(0, 10);
  const daysUntilDate = record.next_due_date ? Math.ceil((Date.parse(`${record.next_due_date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000) : null;
  const kmUntilService = record.next_due_mileage != null && currentMileage != null ? record.next_due_mileage - currentMileage : null;
  if (daysUntilDate != null && daysUntilDate <= 0 || kmUntilService != null && kmUntilService <= 0) return "Termin minął";
  if (daysUntilDate != null && daysUntilDate <= 30 || kmUntilService != null && kmUntilService <= 500) return "Zbliża się termin";
  return "";
}

export default function ServiceLogPanel({ garageId, motorcycleName, mileage, onMileageChange }: Props) {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function loadRecords() {
    if (loaded || loading) return;
    if (garageId.startsWith("local:")) {
      setRecords(readLocalServiceRecords(garageId));
      setLoaded(true);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/garage/service?garageId=${encodeURIComponent(garageId)}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się pobrać historii serwisu.");
      setRecords(Array.isArray(data.items) ? data.items : []);
      setLoaded(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się połączyć z serwerem.");
    } finally {
      setLoading(false);
    }
  }

  async function saveRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setStatus("");
    try {
      if (garageId.startsWith("local:")) {
        const record = addLocalServiceRecord({
          garageId,
          service_type: form.serviceType,
          title: form.title.trim(),
          service_date: form.serviceDate,
          mileage: form.mileage ? Number(form.mileage) : null,
          cost: form.cost ? Number(form.cost) : null,
          next_due_date: form.nextDueDate || null,
          next_due_mileage: form.nextDueMileage ? Number(form.nextDueMileage) : null,
          notes: form.notes.trim() || null,
        });
        setRecords((current) => [record, ...current].sort((a, b) => b.service_date.localeCompare(a.service_date)));
        if (form.mileage && Number(form.mileage) > (mileage ?? 0)) onMileageChange(Number(form.mileage));
        setForm({ ...emptyForm, serviceDate: new Date().toISOString().slice(0, 10) });
        setStatus("Wpis zapisany lokalnie w tej przeglądarce.");
        return;
      }
      const response = await fetch("/api/garage/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, garageId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się zapisać wpisu.");
      setRecords((current) => [data.item, ...current].sort((a, b) => b.service_date.localeCompare(a.service_date)));
      if (form.mileage && Number(form.mileage) > (mileage ?? 0)) onMileageChange(Number(form.mileage));
      setForm({ ...emptyForm, serviceDate: new Date().toISOString().slice(0, 10) });
      setStatus("Wpis dodany do historii.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się połączyć z serwerem.");
    } finally {
      setSaving(false);
    }
  }

  async function removeRecord(id: string) {
    try {
      if (id.startsWith("local-service:")) {
        removeLocalServiceRecord(id);
        setRecords((current) => current.filter((record) => record.id !== id));
        return;
      }
      const response = await fetch("/api/garage/service", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się usunąć wpisu.");
      setRecords((current) => current.filter((record) => record.id !== id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się usunąć wpisu.");
    }
  }

  const fieldClass = "w-full rounded-lg border border-white/10 bg-[#101010] px-3 py-2.5 text-xs text-white outline-none focus:border-red-400/40";
  const totalServiceCost = records.reduce((sum, record) => sum + (record.cost ?? 0), 0);

  return (
    <details className="mt-4 rounded-xl border border-white/[.08] bg-black/20" onToggle={(event) => { if (event.currentTarget.open) void loadRecords(); }}>
      <summary className="cursor-pointer px-4 py-3 text-xs font-bold text-zinc-200">Historia serwisu <span className="ml-1 font-normal text-zinc-500">· {records.length} wpisów</span></summary>
      <div className="border-t border-white/[.06] p-4">
        <p className="text-[11px] text-zinc-500">{motorcycleName} · aktualny przebieg {mileage == null ? "nieuzupełniony" : `${mileage.toLocaleString("pl-PL")} km`} · zarejestrowane wydatki {currency.format(totalServiceCost)}</p>
        <form onSubmit={saveRecord} className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-[10px] text-zinc-500">Rodzaj<select className={`${fieldClass} mt-1`} value={form.serviceType} onChange={(event) => setForm({ ...form, serviceType: event.target.value })}>{["Przegląd", "Olej", "Silnik", "Napęd", "Hamulce", "Opony", "Inne"].map((type) => <option key={type}>{type}</option>)}</select></label>
          <label className="text-[10px] text-zinc-500">Co zostało zrobione<input required minLength={2} maxLength={120} className={`${fieldClass} mt-1`} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="np. Olej + filtr" /></label>
          <label className="text-[10px] text-zinc-500">Data<input required type="date" className={`${fieldClass} mt-1`} value={form.serviceDate} onChange={(event) => setForm({ ...form, serviceDate: event.target.value })} /></label>
          <label className="text-[10px] text-zinc-500">Przebieg · km<input type="number" min="0" step="1" className={`${fieldClass} mt-1`} value={form.mileage} onChange={(event) => setForm({ ...form, mileage: event.target.value })} placeholder={mileage == null ? "np. 12500" : mileage.toString()} /></label>
          <label className="text-[10px] text-zinc-500">Koszt · PLN<input type="number" min="0" step="0.01" className={`${fieldClass} mt-1`} value={form.cost} onChange={(event) => setForm({ ...form, cost: event.target.value })} placeholder="np. 240" /></label>
          <label className="text-[10px] text-zinc-500">Następny serwis · km<input type="number" min="0" step="1" className={`${fieldClass} mt-1`} value={form.nextDueMileage} onChange={(event) => setForm({ ...form, nextDueMileage: event.target.value })} placeholder="opcjonalnie" /></label>
          <label className="text-[10px] text-zinc-500">Następny serwis · data<input type="date" className={`${fieldClass} mt-1`} value={form.nextDueDate} onChange={(event) => setForm({ ...form, nextDueDate: event.target.value })} /></label>
          <label className="text-[10px] text-zinc-500 sm:col-span-2">Notatka<textarea maxLength={1000} className={`${fieldClass} mt-1 min-h-10`} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Części, wykonawca, uwagi…" /></label>
          <button type="submit" disabled={saving} className="self-end rounded-lg bg-red-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-400 disabled:opacity-50">{saving ? "Zapisywanie…" : "Dodaj wpis"}</button>
        </form>
        {error && <p role="alert" className="mt-3 text-xs text-red-300">{error}</p>}
        {status && <p role="status" className="mt-3 text-xs text-emerald-300">{status}</p>}
        {loading ? <p className="mt-4 text-xs text-zinc-500">Wczytywanie historii…</p> : records.length > 0 ? <ol className="mt-4 divide-y divide-white/[.06] border-t border-white/[.06]">
          {records.map((record) => {
            const reminder = getReminder(record, mileage);
            return <li key={record.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
              <div className="min-w-0"><p className="text-xs font-semibold text-zinc-200">{record.title} <span className="font-normal text-zinc-500">· {record.service_type}</span>{reminder && <span className={`ml-2 text-[9px] font-bold ${reminder === "Termin minął" ? "text-red-300" : "text-amber-200"}`}>{reminder}</span>}</p><p className="mt-1 text-[10px] text-zinc-500">{new Date(`${record.service_date}T00:00:00`).toLocaleDateString("pl-PL")}{record.mileage != null ? ` · ${record.mileage.toLocaleString("pl-PL")} km` : ""}{record.cost != null ? ` · ${currency.format(record.cost)}` : ""}</p>{record.notes && <p className="mt-1 text-[10px] leading-4 text-zinc-500">{record.notes}</p>}<p className="mt-1 text-[10px] text-red-200/70">{record.next_due_mileage != null ? `Kolejny przy ${record.next_due_mileage.toLocaleString("pl-PL")} km` : ""}{record.next_due_mileage != null && record.next_due_date ? " · " : ""}{record.next_due_date ? new Date(`${record.next_due_date}T00:00:00`).toLocaleDateString("pl-PL") : ""}</p></div>
            <button type="button" onClick={() => void removeRecord(record.id)} className="shrink-0 text-[10px] font-semibold text-zinc-600 hover:text-red-300">Usuń</button>
            </li>;
          })}
        </ol> : loaded ? <p className="mt-4 border-t border-white/[.06] pt-4 text-xs text-zinc-500">Brak wpisów. Dodaj pierwszy przegląd lub naprawę.</p> : null}
      </div>
    </details>
  );
}