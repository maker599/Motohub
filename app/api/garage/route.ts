import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

async function session() {
  const token = (await cookies()).get("motohub_access_token")?.value;
  if (!token || !supabaseUrl || !supabaseKey) return null;
  const r = await fetch(`${supabaseUrl}/auth/v1/user`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!r.ok) return null;
  return { token, user: await r.json() };
}

export async function GET() {
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: "Brak konfiguracji Supabase." }, { status: 500 });
  const s = await session();
  if (!s) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });
  const r = await fetch(`${supabaseUrl}/rest/v1/garage_motorcycles?select=id,nickname,mileage,notes,created_at,motorcycles(id,slug,brand,model,year,engine_cc,power_hp,motorcycle_type,image_url)&user_id=eq.${s.user.id}&order=created_at.desc`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${s.token}` }, cache: "no-store" });
  const data = await r.json();
  if (!r.ok) return NextResponse.json({ error: "Nie udało się pobrać garażu." }, { status: r.status });
  return NextResponse.json({ items: data });
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: "Brak konfiguracji Supabase." }, { status: 500 });
  const s = await session();
  if (!s) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });
  const { slug, nickname, mileage, notes } = await request.json();
  if (!slug) return NextResponse.json({ error: "Brak motocykla." }, { status: 400 });
  const bike = await fetch(`${supabaseUrl}/rest/v1/motorcycles?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`, { headers: { apikey: supabaseKey, Authorization: `Bearer ${s.token}` }, cache: "no-store" });
  const bikes = await bike.json();
  const motorcycleId = bikes?.[0]?.id;
  if (!motorcycleId) return NextResponse.json({ error: "Nie znaleziono motocykla." }, { status: 404 });
  const r = await fetch(`${supabaseUrl}/rest/v1/garage_motorcycles`, {
    method: "POST",
    headers: { apikey: supabaseKey, Authorization: `Bearer ${s.token}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ user_id: s.user.id, motorcycle_id: motorcycleId, nickname: nickname || null, mileage: mileage || null, notes: notes || null })
  });
  const data = await r.json();
  if (!r.ok) return NextResponse.json({ error: data?.message ?? "Nie udało się dodać motocykla." }, { status: r.status });
  return NextResponse.json({ item: data?.[0] ?? data }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: "Brak konfiguracji Supabase." }, { status: 500 });
  const s = await session();
  if (!s) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "Brak wpisu." }, { status: 400 });
  const r = await fetch(`${supabaseUrl}/rest/v1/garage_motorcycles?id=eq.${encodeURIComponent(id)}&user_id=eq.${s.user.id}`, { method: "DELETE", headers: { apikey: supabaseKey, Authorization: `Bearer ${s.token}` } });
  if (!r.ok) return NextResponse.json({ error: "Nie udało się usunąć motocykla." }, { status: r.status });
  return NextResponse.json({ ok: true });
}
