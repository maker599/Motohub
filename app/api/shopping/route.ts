import { NextResponse } from "next/server";
import { getSupabaseSession } from "@/app/lib/supabase-session";

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_ANON_KEY;

function unavailable() {
  return NextResponse.json({ error: "Brak konfiguracji Supabase." }, { status: 500 });
}

function headers(token: string) {
  return { apikey: supabaseKey!, Authorization: `Bearer ${token}` };
}

async function readBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function validId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validItems(items: unknown[]) {
  if (items.length > 200) return false;
  return items.every((value) => {
    if (!isObject(value)) return false;
    const line = value;
    if (typeof line.id !== "string" || line.id.length > 80 || typeof line.name !== "string" || line.name.length < 2 || line.name.length > 120) return false;
    if (typeof line.category !== "string" || line.category.length > 80 || typeof line.brand !== "string" || line.brand.length > 80) return false;
    if (!["includedInCylinder", "keepExisting", "requiresFitmentCheck", "fitmentConfirmed", "purchase"].every((key) => typeof line[key] === "boolean")) return false;
    if (typeof line.quantity !== "number" || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 99) return false;
    if (!Array.isArray(line.offers) || line.offers.length > 20) return false;
    if (line.purchase && (line.includedInCylinder || line.keepExisting || line.offers.length === 0 || (line.requiresFitmentCheck && !line.fitmentConfirmed))) return false;
    if (typeof line.selectedOfferId !== "string" || line.selectedOfferId.length > 80) return false;
    if (line.selectedOfferId && !line.offers.some((offer) => isObject(offer) && offer.id === line.selectedOfferId)) return false;
    if (line.purchase && (!line.selectedOfferId || !line.offers.some((offer) => isObject(offer) && offer.id === line.selectedOfferId))) return false;
    return line.offers.every((offer) => {
      if (!isObject(offer)) return false;
      if (typeof offer.id !== "string" || offer.id.length > 80 || typeof offer.store !== "string" || offer.store.length < 1 || offer.store.length > 80) return false;
      if (typeof offer.price !== "number" || !Number.isFinite(offer.price) || offer.price < 0 || offer.price > 10_000_000) return false;
      if (offer.currency !== "PLN" && offer.currency !== "EUR") return false;
      if (typeof offer.url !== "string" || offer.url.length > 2048) return false;
      return !offer.url || /^https?:\/\//i.test(offer.url);
    });
  });
}

function validateList(body: Record<string, unknown>) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const items = body.items;
  const exchangeRate = Number(body.exchangeRate);
  const shippingByStore = body.shippingByStore;
  if (name.length < 1 || name.length > 100) return { error: "Nazwa listy musi mieć od 1 do 100 znaków." };
  if (!Array.isArray(items) || !validItems(items) || JSON.stringify(items).length > 100_000) return { error: "Lista zakupowa jest nieprawidłowa lub zbyt duża." };
  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0 || exchangeRate > 100) return { error: "Podaj prawidłowy kurs EUR/PLN." };
  if (!isObject(shippingByStore) || Object.entries(shippingByStore).length > 20 || JSON.stringify(shippingByStore).length > 5_000 || Object.entries(shippingByStore).some(([store, cost]) => store.length > 80 || typeof cost !== "number" || !Number.isFinite(cost) || cost < 0 || cost > 1_000_000)) return { error: "Koszty wysyłki są nieprawidłowe." };
  return { value: { name, items, exchangeRate, shippingByStore } };
}

export async function GET() {
  if (!supabaseUrl || !supabaseKey) return unavailable();
  try {
    const session = await getSupabaseSession();
    if (!session) return NextResponse.json({ error: "Zaloguj się, aby korzystać z zapisanych list." }, { status: 401 });
    const response = await fetch(`${supabaseUrl}/rest/v1/shopping_lists?select=id,name,items,exchange_rate,shipping_by_store,created_at,updated_at&user_id=eq.${encodeURIComponent(session.user.id)}&order=updated_at.desc`, {
      headers: headers(session.token),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Nie udało się pobrać list zakupowych." }, { status: response.status });
    return NextResponse.json({ items: data });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) return unavailable();
  try {
    const session = await getSupabaseSession();
    if (!session) return NextResponse.json({ error: "Zaloguj się, aby zapisać listę." }, { status: 401 });
    const body = await readBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Nieprawidłowa lista zakupowa." }, { status: 400 });
    const validated = validateList(body);
    if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });
    const response = await fetch(`${supabaseUrl}/rest/v1/shopping_lists`, {
      method: "POST",
      headers: { ...headers(session.token), "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ user_id: session.user.id, name: validated.value!.name, items: validated.value!.items, exchange_rate: validated.value!.exchangeRate, shipping_by_store: validated.value!.shippingByStore }),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Nie udało się zapisać listy zakupowej." }, { status: response.status });
    return NextResponse.json({ item: data?.[0] ?? data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  if (!supabaseUrl || !supabaseKey) return unavailable();
  try {
    const session = await getSupabaseSession();
    if (!session) return NextResponse.json({ error: "Zaloguj się, aby zapisać listę." }, { status: 401 });
    const body = await readBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Nieprawidłowa lista zakupowa." }, { status: 400 });
    const id = typeof body.id === "string" ? body.id.trim() : "";
    if (!validId(id)) return NextResponse.json({ error: "Nieprawidłowy identyfikator listy." }, { status: 400 });
    const validated = validateList(body);
    if (validated.error) return NextResponse.json({ error: validated.error }, { status: 400 });
    const response = await fetch(`${supabaseUrl}/rest/v1/shopping_lists?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(session.user.id)}&select=id,name,items,exchange_rate,shipping_by_store,created_at,updated_at`, {
      method: "PATCH",
      headers: { ...headers(session.token), "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ name: validated.value!.name, items: validated.value!.items, exchange_rate: validated.value!.exchangeRate, shipping_by_store: validated.value!.shippingByStore, updated_at: new Date().toISOString() }),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Nie udało się zaktualizować listy." }, { status: response.status });
    if (!data?.[0]) return NextResponse.json({ error: "Nie znaleziono listy." }, { status: 404 });
    return NextResponse.json({ item: data[0] });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  if (!supabaseUrl || !supabaseKey) return unavailable();
  try {
    const session = await getSupabaseSession();
    if (!session) return NextResponse.json({ error: "Zaloguj się, aby usunąć listę." }, { status: 401 });
    const body = await readBody(request);
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!validId(id)) return NextResponse.json({ error: "Nieprawidłowy identyfikator listy." }, { status: 400 });
    const response = await fetch(`${supabaseUrl}/rest/v1/shopping_lists?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(session.user.id)}`, {
      method: "DELETE",
      headers: headers(session.token),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "Nie udało się usunąć listy." }, { status: response.status });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}