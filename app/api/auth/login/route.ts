import { NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Brak konfiguracji Supabase." }, { status: 500 });
  }

  const body = await request.json();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) {
    return NextResponse.json({ error: "Podaj email i hasło." }, { status: 400 });
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: supabaseKey, "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data.error_code === "email_not_confirmed"
      ? "Potwierdź adres email przed zalogowaniem."
      : data.error_description ?? data.msg ?? "Nieprawidłowy email lub hasło.";
    return NextResponse.json({ error: message }, { status: 401 });
  }

  const result = NextResponse.json({ ok: true });
  result.cookies.set("motohub_access_token", data.access_token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: data.expires_in ?? 3600,
  });
  return result;
}
