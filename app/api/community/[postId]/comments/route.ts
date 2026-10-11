import { NextResponse } from "next/server";
import { getSupabaseSession, type SupabaseUser } from "@/app/lib/supabase-session";

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

function userName(user: SupabaseUser) {
  return user.user_metadata?.username?.trim() || user.email?.split("@")[0] || "Rider";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: "Komentowanie wymaga konfiguracji Supabase." }, { status: 503 });

  try {
    const session = await getSupabaseSession();
    if (!session) return NextResponse.json({ error: "Zaloguj się, aby dodać komentarz." }, { status: 401 });

    const { postId } = await params;
    const body = await readBody(request);
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    if (!content) return NextResponse.json({ error: "Komentarz nie może być pusty." }, { status: 400 });
    if (content.length > 1000) return NextResponse.json({ error: "Komentarz może mieć maksymalnie 1000 znaków." }, { status: 400 });

    const response = await fetch(`${supabaseUrl}/rest/v1/comments?select=id,user_id,content,created_at`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ post_id: postId, user_id: session.user.id, content }),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.message ?? "Nie udało się dodać komentarza." }, { status: response.status });

    const comment = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ item: { ...comment, author: userName(session.user), authorId: session.user.id } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Edycja komentarza wymaga konfiguracji Supabase." }, { status: 503 });
  }

  try {
    const session = await getSupabaseSession();
    if (!session) {
      return NextResponse.json({ error: "Zaloguj się, aby edytować komentarz." }, { status: 401 });
    }

    const { postId } = await params;
    if (!uuidPattern.test(postId)) {
      return NextResponse.json({ error: "Nieprawidłowy identyfikator wpisu." }, { status: 400 });
    }

    const body = await readBody(request);
    if (!isObject(body)) {
      return NextResponse.json({ error: "Nieprawidłowy formularz edycji komentarza." }, { status: 400 });
    }

    const commentId = typeof body.commentId === "string" ? body.commentId : null;
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!commentId || !uuidPattern.test(commentId)) {
      return NextResponse.json({ error: "Nieprawidłowy identyfikator komentarza." }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: "Komentarz nie może być pusty." }, { status: 400 });
    }
    if (content.length > 1000) {
      return NextResponse.json({ error: "Komentarz może mieć maksymalnie 1000 znaków." }, { status: 400 });
    }

    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/comments?id=eq.${encodeURIComponent(commentId)}&select=id,user_id,post_id`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });
    const checkData = await checkResponse.json();
    if (!checkResponse.ok) {
      return NextResponse.json({ error: "Nie udało się pobrać komentarza do edycji." }, { status: checkResponse.status });
    }
    const existing = Array.isArray(checkData) ? checkData[0] : null;
    if (!existing) {
      return NextResponse.json({ error: "Nie znaleziono komentarza." }, { status: 404 });
    }
    if (existing.user_id !== session.user.id) {
      return NextResponse.json({ error: "Nie masz uprawnień do edycji tego komentarza." }, { status: 403 });
    }
    if (existing.post_id !== postId) {
      return NextResponse.json({ error: "Komentarz nie należy do tego wpisu." }, { status: 400 });
    }

    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/comments?id=eq.${encodeURIComponent(commentId)}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
      cache: "no-store",
    });
    const updateData = await updateResponse.json();
    if (!updateResponse.ok) {
      return NextResponse.json({ error: updateData?.message ?? "Nie udało się zaktualizować komentarza." }, { status: updateResponse.status });
    }

    return NextResponse.json({ ok: true, item: Array.isArray(updateData) ? updateData[0] : updateData });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Usuwanie komentarza wymaga konfiguracji Supabase." }, { status: 503 });
  }

  try {
    const session = await getSupabaseSession();
    if (!session) {
      return NextResponse.json({ error: "Zaloguj się, aby usunąć komentarz." }, { status: 401 });
    }

    const { postId } = await params;
    const body = await readBody(request);
    const commentId = isObject(body) && typeof body.commentId === "string" ? body.commentId : null;
    if (!commentId || !uuidPattern.test(commentId)) {
      return NextResponse.json({ error: "Nieprawidłowy identyfikator komentarza." }, { status: 400 });
    }

    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/comments?id=eq.${encodeURIComponent(commentId)}&select=id,user_id,post_id`, {
      headers: { apikey: supabaseKey, Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });
    const checkData = await checkResponse.json();
    if (!checkResponse.ok) {
      return NextResponse.json({ error: "Nie udało się pobrać komentarza do usunięcia." }, { status: checkResponse.status });
    }

    const existing = Array.isArray(checkData) ? checkData[0] : null;
    if (!existing) {
      return NextResponse.json({ error: "Nie znaleziono komentarza." }, { status: 404 });
    }
    if (existing.user_id !== session.user.id) {
      return NextResponse.json({ error: "Nie masz uprawnień do usunięcia tego komentarza." }, { status: 403 });
    }
    if (existing.post_id !== postId) {
      return NextResponse.json({ error: "Komentarz nie należy do tego wpisu." }, { status: 400 });
    }

    const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/comments?id=eq.${encodeURIComponent(commentId)}`, {
      method: "DELETE",
      headers: { apikey: supabaseKey, Authorization: `Bearer ${session.token}` },
      cache: "no-store",
    });

    if (!deleteResponse.ok) {
      const errorBody = await deleteResponse.json().catch(() => ({}));
      return NextResponse.json({ error: errorBody?.message ?? "Nie udało się usunąć komentarza." }, { status: deleteResponse.status });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}
