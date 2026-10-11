import { NextResponse } from "next/server";
import { getSupabaseSession } from "@/app/lib/supabase-session";

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const reactionTypes = new Set(["like", "love", "wrench", "fire"]);
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function readBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function authorize(request: Request, params: Promise<{ postId: string }>) {
  if (!supabaseUrl || !supabaseKey) return { response: NextResponse.json({ error: "Reakcje wymagają konfiguracji Supabase." }, { status: 503 }) };
  const session = await getSupabaseSession();
  if (!session) return { response: NextResponse.json({ error: "Zaloguj się, aby reagować na wpisy." }, { status: 401 }) };
  const { postId } = await params;
  if (!uuidPattern.test(postId)) return { response: NextResponse.json({ error: "Nieprawidłowy identyfikator wpisu." }, { status: 400 }) };
  return { session, postId };
}

export async function POST(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const access = await authorize(request, params);
    if ("response" in access) return access.response;
    const body = await readBody(request);
    if (!body || typeof body !== "object" || !reactionTypes.has(body.type)) {
      return NextResponse.json({ error: "Wybierz prawidłową reakcję." }, { status: 400 });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/post_reactions?on_conflict=post_id%2Cuser_id&select=id,post_id,user_id,reaction_type`, {
      method: "POST",
      headers: {
        apikey: supabaseKey!,
        Authorization: `Bearer ${access.session.token}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify({ post_id: access.postId, user_id: access.session.user.id, reaction_type: body.type }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return NextResponse.json({ error: "Nie udało się zapisać reakcji." }, { status: response.status });
    return NextResponse.json({ item: Array.isArray(data) ? data[0] : data });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ postId: string }> }) {
  try {
    const access = await authorize(request, params);
    if ("response" in access) return access.response;
    const response = await fetch(`${supabaseUrl}/rest/v1/post_reactions?post_id=eq.${encodeURIComponent(access.postId)}&user_id=eq.${encodeURIComponent(access.session.user.id)}`, {
      method: "DELETE",
      headers: { apikey: supabaseKey!, Authorization: `Bearer ${access.session.token}` },
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "Nie udało się usunąć reakcji." }, { status: response.status });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}