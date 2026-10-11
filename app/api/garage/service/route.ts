import { NextResponse } from "next/server";
import { getSupabaseSession } from "@/app/lib/supabase-session";

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const serviceTypes = new Set(["Przegląd", "Olej", "Silnik", "Napęd", "Hamulce", "Opony", "Inne"]);

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

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export async function GET(request: Request) {
  if (!supabaseUrl || !supabaseKey) return unavailable();

  try {
    const session = await getSupabaseSession();
    if (!session) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });

    const garageId = new URL(request.url).searchParams.get("garageId")?.trim() ?? "";
    if (!/^[0-9a-f-]{36}$/i.test(garageId)) return NextResponse.json({ error: "Nieprawidłowy motocykl." }, { status: 400 });
    const response = await fetch(
      `${supabaseUrl}/rest/v1/service_records?select=id,service_type,title,service_date,mileage,cost,next_due_date,next_due_mileage,notes,created_at&garage_motorcycle_id=eq.${encodeURIComponent(garageId)}&user_id=eq.${encodeURIComponent(session.user.id)}&order=service_date.desc,created_at.desc`,
      { headers: headers(session.token), cache: "no-store" },
    );
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Nie udało się pobrać historii serwisu." }, { status: response.status });
    return NextResponse.json({ items: data });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) return unavailable();

  try {
    const session = await getSupabaseSession();
    if (!session) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });

    const body = await readBody(request);
    const garageId = typeof body?.garageId === "string" ? body.garageId.trim() : "";
    const serviceType = typeof body?.serviceType === "string" ? body.serviceType : "";
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const serviceDate = typeof body?.serviceDate === "string" ? body.serviceDate : "";
    const mileage = body?.mileage === "" || body?.mileage == null ? null : Number(body.mileage);
    const cost = body?.cost === "" || body?.cost == null ? null : Number(body.cost);
    const nextDueMileage = body?.nextDueMileage === "" || body?.nextDueMileage == null ? null : Number(body.nextDueMileage);
    const nextDueDate = typeof body?.nextDueDate === "string" && body.nextDueDate ? body.nextDueDate : null;
    const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

    if (!/^[0-9a-f-]{36}$/i.test(garageId)) return NextResponse.json({ error: "Wybierz motocykl z garażu." }, { status: 400 });
    if (!serviceTypes.has(serviceType)) return NextResponse.json({ error: "Wybierz rodzaj serwisu." }, { status: 400 });
    if (title.length < 2 || title.length > 120) return NextResponse.json({ error: "Opis musi mieć od 2 do 120 znaków." }, { status: 400 });
    if (!validDate(serviceDate)) return NextResponse.json({ error: "Podaj prawidłową datę serwisu." }, { status: 400 });
    if (mileage !== null && (!Number.isInteger(mileage) || mileage < 0 || mileage > 10_000_000)) return NextResponse.json({ error: "Przebieg musi być prawidłową liczbą kilometrów." }, { status: 400 });
    if (cost !== null && (!Number.isFinite(cost) || cost < 0 || cost > 10_000_000)) return NextResponse.json({ error: "Koszt musi być prawidłową kwotą." }, { status: 400 });
    if (nextDueMileage !== null && (!Number.isInteger(nextDueMileage) || nextDueMileage < 0 || nextDueMileage > 10_000_000)) return NextResponse.json({ error: "Podaj prawidłowy przebieg następnego serwisu." }, { status: 400 });
    if (nextDueDate && !validDate(nextDueDate)) return NextResponse.json({ error: "Podaj prawidłową datę następnego serwisu." }, { status: 400 });
    if (notes.length > 1000) return NextResponse.json({ error: "Notatka może mieć maksymalnie 1000 znaków." }, { status: 400 });

    const ownerCheck = await fetch(
      `${supabaseUrl}/rest/v1/garage_motorcycles?select=id,mileage&id=eq.${encodeURIComponent(garageId)}&user_id=eq.${encodeURIComponent(session.user.id)}&limit=1`,
      { headers: headers(session.token), cache: "no-store" },
    );
    const garageItems = await ownerCheck.json();
    if (!ownerCheck.ok) return NextResponse.json({ error: "Nie udało się sprawdzić motocykla." }, { status: ownerCheck.status });
    if (!garageItems?.[0]) return NextResponse.json({ error: "Nie znaleziono motocykla w Twoim garażu." }, { status: 404 });

    const response = await fetch(`${supabaseUrl}/rest/v1/service_records`, {
      method: "POST",
      headers: { ...headers(session.token), "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify({
        user_id: session.user.id,
        garage_motorcycle_id: garageId,
        service_type: serviceType,
        title,
        service_date: serviceDate,
        mileage,
        cost,
        next_due_date: nextDueDate,
        next_due_mileage: nextDueMileage,
        notes: notes || null,
      }),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Nie udało się zapisać wpisu serwisowego." }, { status: response.status });

    if (mileage !== null && (garageItems[0].mileage == null || mileage > garageItems[0].mileage)) {
      await fetch(`${supabaseUrl}/rest/v1/garage_motorcycles?id=eq.${encodeURIComponent(garageId)}&user_id=eq.${encodeURIComponent(session.user.id)}`, {
        method: "PATCH",
        headers: { ...headers(session.token), "Content-Type": "application/json" },
        body: JSON.stringify({ mileage }),
        cache: "no-store",
      });
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
    if (!session) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });
    const body = await readBody(request);
    const id = typeof body?.id === "string" ? body.id.trim() : "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Nieprawidłowy wpis serwisowy." }, { status: 400 });
    const response = await fetch(`${supabaseUrl}/rest/v1/service_records?id=eq.${encodeURIComponent(id)}&user_id=eq.${encodeURIComponent(session.user.id)}`, {
      method: "DELETE",
      headers: headers(session.token),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "Nie udało się usunąć wpisu." }, { status: response.status });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}