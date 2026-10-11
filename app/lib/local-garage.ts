import type { Motorcycle } from "./motorcycles";

const garageKey = "motohub-local-garage";
const serviceKey = "motohub-local-service-records";

export type LocalGarageBike = {
  id: string;
  nickname: string | null;
  mileage: number | null;
  motorcycles: Motorcycle;
};

export type LocalServiceRecord = {
  id: string;
  garageId: string;
  service_type: string;
  title: string;
  service_date: string;
  mileage: number | null;
  cost: number | null;
  next_due_date: string | null;
  next_due_mileage: number | null;
  notes: string | null;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}

export function readLocalGarage(): LocalGarageBike[] {
  const items = readJson<LocalGarageBike[]>(garageKey, []);
  return Array.isArray(items) ? items : [];
}

export function addLocalGarageBike(motorcycle: Motorcycle) {
  const items = readLocalGarage();
  const existing = items.find((item) => item.motorcycles.slug === motorcycle.slug);
  if (existing) return { item: existing, added: false };
  const item: LocalGarageBike = { id: `local:${crypto.randomUUID()}`, nickname: null, mileage: null, motorcycles: motorcycle };
  localStorage.setItem(garageKey, JSON.stringify([item, ...items]));
  return { item, added: true };
}

export function removeLocalGarageBike(id: string) {
  localStorage.setItem(garageKey, JSON.stringify(readLocalGarage().filter((item) => item.id !== id)));
  localStorage.setItem(serviceKey, JSON.stringify(readLocalServiceRecords().filter((record) => record.garageId !== id)));
}

export function readLocalServiceRecords(garageId?: string): LocalServiceRecord[] {
  const records = readJson<LocalServiceRecord[]>(serviceKey, []);
  if (!Array.isArray(records)) return [];
  return garageId ? records.filter((record) => record.garageId === garageId) : records;
}

export function addLocalServiceRecord(record: Omit<LocalServiceRecord, "id">) {
  const item: LocalServiceRecord = { ...record, id: `local-service:${crypto.randomUUID()}` };
  localStorage.setItem(serviceKey, JSON.stringify([item, ...readLocalServiceRecords()]));
  return item;
}

export function removeLocalServiceRecord(id: string) {
  localStorage.setItem(serviceKey, JSON.stringify(readLocalServiceRecords().filter((record) => record.id !== id)));
}

export function updateLocalGarageMileage(id: string, mileage: number) {
  const items = readLocalGarage().map((item) => item.id === id ? { ...item, mileage } : item);
  localStorage.setItem(garageKey, JSON.stringify(items));
}