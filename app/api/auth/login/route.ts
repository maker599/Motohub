import { NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Brak konfiguracji Supabase w Vercel." }, { status: 500 });
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
      const message =
        data.error_code === "email_not_confirmed"
          ? "Potwierdź adres email przed zalogowaniem."
          : data.error_description ?? data.msg ?? "Nieprawidłowy email lub hasło.";
      return NextResponse.json({ error: message }, { status: 401 });
    }

    if (!data.access_token) {
      return NextResponse.json({ error: "Supabase nie zwrócił tokenu logowania." }, { status: 502 });
    }

    const result = NextResponse.json({ ok: true });
    result.cookies.set("motohub_access_token", data.access_token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    if (data.refresh_token) {\n      result.cookies.set("motohub_refresh_token", data.refresh_token, {\n        httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30,\n      });\n    }\n    return result;
  } catch {
    return NextResponse.json(
      { error: "Nie udało się połączyć z Supabase. Sprawdź konfigurację Vercel." },
      { status: 502 }
    );
  }
}
