import { NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Brak konfiguracji Supabase." }, { status: 500 });
  }

  const body = await request.json();
  const { username, email, password } = body;

  if (!username || !email || !password) {
    return NextResponse.json({ error: "Uzupełnij wszystkie pola." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Hasło musi mieć co najmniej 8 znaków." }, { status: 400 });
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: supabaseKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, data: { username } }),
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    return NextResponse.json({ error: data.msg ?? data.error_description ?? "Nie udało się utworzyć konta." }, { status: response.status });
  }

  const result = NextResponse.json({ ok: true, needsConfirmation: !data.access_token });
  if (data.access_token) {
    result.cookies.set("motohub_access_token", data.access_token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  }
  return result;
}
