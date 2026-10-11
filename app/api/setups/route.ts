import { NextResponse } from "next/server";
import { getSupabaseSession } from "@/app/lib/supabase-session";

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const engines = new Set(["Minarelli AM6", "Derbi D50B0", "Derbi D50B1"]);
const goals = new Set(["daily", "sport", "race", "track"]);

function unavailable() {
  return NextResponse.json({ error: "Brak konfiguracji Supabase." }, { status: 500 });
}

function unauthorized() {
  return NextResponse.json({ error: "Zaloguj się, aby zarządzać zapisanymi setupami." }, { status: 401 });
}

async function readBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function headers(token: string) {
  return { apikey: supabaseKey!, Authorization: `Bearer ${token}` };
}

export async function GET() {
  if (!supabaseUrl || !supabaseKey) return unavailable();

  try {
    const session = await getSupabaseSession();
    if (!session) return unauthorized();

    const response = await fetch(
      `${supabaseUrl}/rest/v1/saved_setups?select=id,name,engine,goal,setup,created_at,share_token&user_id=eq.${encodeURIComponent(session.user.id)}&order=created_at.desc`,
      { headers: headers(session.token), cache: "no-store" },
    );
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Nie udało się pobrać zapisanych setupów." }, { status: response.status });
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
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const engine = typeof body?.engine === "string" ? body.engine : "";
    const goal = typeof body?.goal === "string" ? body.goal : "";
    const setup = body?.setup;
    if (name.length < 1 || name.length > 100) return NextResponse.json({ error: "Nazwa setupu musi mieć od 1 do 100 znaków." }, { status: 400 });
    if (!engines.has(engine)) return NextResponse.json({ error: "Nieznana rodzina silnika." }, { status: 400 });
    if (!goals.has(goal)) return NextResponse.json({ error: "Nieznany cel setupu." }, { status: 400 });
    if (!setup || typeof setup !== "object" || Array.isArray(setup) || JSON.stringify(setup).length > 50_000) {
      return NextResponse.json({ error: "Podsumowanie setupu jest nieprawidłowe lub zbyt duże." }, { status: 400 });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/saved_setups`, {
      method: "POST",
      headers: { ...headers(session.token), "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({ user_id: session.user.id, name, engine, goal, setup }),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Nie udało się zapisać setupu." }, { status: response.status });
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
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: "Nieprawidłowy identyfikator setupu." }, { status: 400 });
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/saved_setups?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(session.user.id)}`,
      { method: "DELETE", headers: headers(session.token), cache: "no-store" },
    );
    if (!response.ok) return NextResponse.json({ error: "Nie udało się usunąć setupu." }, { status: response.status });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  if (!supabaseUrl || !supabaseKey) return unavailable();

  try {
    const session = await getSupabaseSession();
    if (!session) return unauthorized();
    const body = await readBody(request);
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: "Nieprawidłowy identyfikator setupu." }, { status: 400 });
    }
    if (typeof body?.shared !== "boolean") return NextResponse.json({ error: "Brak prawidłowego stanu udostępniania." }, { status: 400 });

    const response = await fetch(
      `${supabaseUrl}/rest/v1/saved_setups?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(session.user.id)}&select=id,share_token`,
      {
        method: "PATCH",
        headers: { ...headers(session.token), "Content-Type": "application/json", Prefer: "return=representation" },
        body: JSON.stringify({ share_token: body.shared ? crypto.randomUUID() : null }),
        cache: "no-store",
      },
    );
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Nie udało się zmienić udostępniania setupu." }, { status: response.status });
    if (!data?.[0]) return NextResponse.json({ error: "Nie znaleziono setupu." }, { status: 404 });
    return NextResponse.json({ item: data[0] });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}
