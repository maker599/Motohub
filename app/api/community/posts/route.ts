import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

async function getSession() {
  const token = (await cookies()).get("motohub_access_token")?.value;
  if (!token || !supabaseUrl || !supabaseKey) return null;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) return null;
  return { token, user: await response.json() };
}

export async function GET() {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Brak konfiguracji Supabase." }, { status: 500 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Zaloguj się." }, { status: 401 });

  const response = await fetch(
    `${supabaseUrl}/rest/v1/posts?select=id,user_id,content,created_at,profiles(username)&order=created_at.desc`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.token}`,
      },
      cache: "no-store",
    },
  );

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data?.message ?? "Nie udało się pobrać postów." }, { status: response.status });
  }

  return NextResponse.json({ posts: data });
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Brak konfiguracji Supabase." }, { status: 500 });
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Zaloguj się, aby publikować." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const content = typeof body?.content === "string" ? body.content.trim() : "";

  if (!content) return NextResponse.json({ error: "Post nie może być pusty." }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: "Post może mieć maksymalnie 2000 znaków." }, { status: 400 });

  const response = await fetch(`${supabaseUrl}/rest/v1/posts`, {
    method: "POST",
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${session.token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ user_id: session.user.id, content }),
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data?.message ?? "Nie udało się opublikować posta." }, { status: response.status });
  }

  return NextResponse.json({ post: data?.[0] ?? data }, { status: 201 });
}
