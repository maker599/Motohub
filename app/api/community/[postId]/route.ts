import { NextResponse } from "next/server";
import { getSupabaseSession } from "@/app/lib/supabase-session";

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function readBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Edycja wpisu wymaga konfiguracji Supabase." }, { status: 503 });
  }

  try {
    const session = await getSupabaseSession();
    if (!session) {
      return NextResponse.json({ error: "Zaloguj się, aby edytować wpis." }, { status: 401 });
    }

    const { postId } = await params;
    if (!uuidPattern.test(postId)) {
      return NextResponse.json({ error: "Nieprawidłowy identyfikator wpisu." }, { status: 400 });
    }

    const body = await readBody(request);
    if (!isObject(body)) {
      return NextResponse.json({ error: "Nieprawidłowy formularz edycji." }, { status: 400 });
    }

    const content = typeof body.content === "string" ? body.content.trim() : "";
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const kind = body.kind === "thread" ? "thread" : "post";

    if (!content) {
      return NextResponse.json({ error: "Treść wpisu nie może być pusta." }, { status: 400 });
    }
    if (content.length > 2000) {
      return NextResponse.json({ error: "Wpis może mieć maksymalnie 2000 znaków." }, { status: 400 });
    }

    if (kind === "thread") {
      if (title.length < 2 || title.length > 120) {
        return NextResponse.json({ error: "Tytuł wątku musi mieć od 2 do 120 znaków." }, { status: 400 });
      }
    } else if (title && (title.length < 2 || title.length > 120)) {
      return NextResponse.json({ error: "Tytuł może mieć maksymalnie 120 znaków." }, { status: 400 });
    }

    const existingResponse = await fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${encodeURIComponent(postId)}&select=id,user_id,content,title,post_type`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });
    const existingData = await existingResponse.json();
    if (!existingResponse.ok) {
      return NextResponse.json({ error: "Nie udało się pobrać wpisu do edycji." }, { status: existingResponse.status });
    }
    const existing = Array.isArray(existingData) ? existingData[0] : null;
    if (!existing) {
      return NextResponse.json({ error: "Nie znaleziono wpisu." }, { status: 404 });
    }
    if (existing.user_id !== session.user.id) {
      return NextResponse.json({ error: "Nie masz uprawnień do edycji tego wpisu." }, { status: 403 });
    }

    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${encodeURIComponent(postId)}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        post_type: kind,
        title: kind === "thread" ? title : title || null,
        content,
      }),
      cache: "no-store",
    });

    const updatedData = await updateResponse.json();
    if (!updateResponse.ok) {
      return NextResponse.json({ error: updatedData?.message ?? "Nie udało się zapisać zmian." }, { status: updateResponse.status });
    }

    return NextResponse.json({ ok: true, item: Array.isArray(updatedData) ? updatedData[0] : updatedData });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ postId: string }> }) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Usunięcie wpisu wymaga konfiguracji Supabase." }, { status: 503 });
  }

  try {
    const session = await getSupabaseSession();
    if (!session) {
      return NextResponse.json({ error: "Zaloguj się, aby usunąć wpis." }, { status: 401 });
    }

    const { postId } = await params;
    if (!uuidPattern.test(postId)) {
      return NextResponse.json({ error: "Nieprawidłowy identyfikator wpisu." }, { status: 400 });
    }

    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${encodeURIComponent(postId)}&select=id,user_id`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });
    const checkData = await checkResponse.json();
    if (!checkResponse.ok) {
      return NextResponse.json({ error: "Nie udało się pobrać wpisu do usunięcia." }, { status: checkResponse.status });
    }

    const existing = Array.isArray(checkData) ? checkData[0] : null;
    if (!existing) {
      return NextResponse.json({ error: "Nie znaleziono wpisu." }, { status: 404 });
    }
    if (existing.user_id !== session.user.id) {
      return NextResponse.json({ error: "Nie masz uprawnień do usunięcia tego wpisu." }, { status: 403 });
    }

    const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/posts?id=eq.${encodeURIComponent(postId)}&select=id`, {
      method: "DELETE",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.token}`,
        Prefer: "return=representation",
      },
      cache: "no-store",
    });

    if (!deleteResponse.ok) {
      const errorBody = await deleteResponse.json().catch(() => ({}));
      return NextResponse.json({ error: errorBody?.message ?? "Nie udało się usunąć wpisu." }, { status: deleteResponse.status });
    }

    const deletedRows = await deleteResponse.json().catch(() => []);
    if (!Array.isArray(deletedRows) || deletedRows.length === 0) {
      return NextResponse.json({ error: "Supabase nie usunął wpisu. Zastosuj najnowszą migrację uprawnień społeczności." }, { status: 409 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}
