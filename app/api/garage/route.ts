import { NextResponse } from "next/server";
import { getSupabaseSession } from "@/app/lib/supabase-session";

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_ANON_KEY;

function unavailable() {
  return NextResponse.json({ error: "Brak konfiguracji Supabase." }, { status: 500 });
}

function unauthorized() {
  return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });
}

async function readBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function GET() {
  if (!supabaseUrl || !supabaseKey) return unavailable();

  try {
    const session = await getSupabaseSession();
    if (!session) return unauthorized();

    const response = await fetch(
      `${supabaseUrl}/rest/v1/garage_motorcycles?select=id,nickname,mileage,notes,created_at,motorcycles(id,slug,brand,model,year,engine_cc,power_hp,motorcycle_type,image_url)&user_id=eq.${encodeURIComponent(session.user.id)}&order=created_at.desc`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${session.token}` },
        cache: "no-store",
      },
    );
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Nie udało się pobrać garażu." }, { status: response.status });
    return NextResponse.json({ items: data });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) return unavailable();

  try {
    const session = await getSupabaseSession();
    if (!session) return unauthorized();

    const body = await readBody(request);
    const slug = typeof body?.slug === "string" ? body.slug.trim() : "";
    if (!slug) return NextResponse.json({ error: "Brak motocykla." }, { status: 400 });

    const bikeResponse = await fetch(
      `${supabaseUrl}/rest/v1/motorcycles?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`,
      {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${session.token}` },
        cache: "no-store",
      },
    );
    if (!bikeResponse.ok) return NextResponse.json({ error: "Nie udało się sprawdzić motocykla." }, { status: bikeResponse.status });
    const bikes = await bikeResponse.json();
    const motorcycleId = bikes?.[0]?.id;
    if (!motorcycleId) return NextResponse.json({ error: "Nie znaleziono motocykla." }, { status: 404 });

    const response = await fetch(`${supabaseUrl}/rest/v1/garage_motorcycles`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ user_id: session.user.id, motorcycle_id: motorcycleId }),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) {
      const message = data?.code === "23505" ? "Ten motocykl jest już w Twoim garażu." : data?.message ?? "Nie udało się dodać motocykla.";
      return NextResponse.json({ error: message }, { status: response.status });
    }
    return NextResponse.json({ item: data?.[0] ?? data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  if (!supabaseUrl || !supabaseKey) return unavailable();

  try {
    const session = await getSupabaseSession();
    if (!session) return unauthorized();

    const body = await readBody(request);
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!id) return NextResponse.json({ error: "Brak wpisu." }, { status: 400 });

    const response = await fetch(
      `${supabaseUrl}/rest/v1/garage_motorcycles?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(session.user.id)}`,
      {
        method: "DELETE",
        headers: { apikey: supabaseKey, Authorization: `Bearer ${session.token}` },
        cache: "no-store",
      },
    );
    if (!response.ok) return NextResponse.json({ error: "Nie udało się usunąć motocykla." }, { status: response.status });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}
