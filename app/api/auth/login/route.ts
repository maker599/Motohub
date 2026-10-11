import { NextResponse } from "next/server";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

function fetchErrorCode(cause: unknown): string | null {
  if (!cause || typeof cause !== "object" || !("cause" in cause)) return null;
  const nested = cause.cause;
  if (!nested || typeof nested !== "object" || !("code" in nested)) return null;
  return typeof nested.code === "string" && /^[A-Z0-9_]+$/.test(nested.code) ? nested.code : null;
}

export async function POST(request: Request) {
  let email = "";
  try {
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Brak konfiguracji Supabase w Vercel." }, { status: 500 });
    }

    const body = await request.json();
    email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Podaj email i hasło." }, { status: 400 });
    }

    let response: Response;
    try {
      response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: supabaseKey, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
    } catch (cause) {
      const timedOut = cause instanceof Error && cause.name === "TimeoutError";
      const code = fetchErrorCode(cause);
      console.error("[auth/login] Supabase request failed", { timedOut, errorName: cause instanceof Error ? cause.name : "unknown", code });
      const error = timedOut
        ? "Supabase nie odpowiedział w ciągu 10 sekund. Sprawdź adres projektu i jego dostępność."
        : code === "EACCES"
          ? "System lub firewall blokuje połączenia wychodzące Node.js. Zezwól na dostęp sieciowy dla node.exe i uruchom ponownie serwer."
          : code === "ENOTFOUND"
            ? "Nie można znaleźć hosta Supabase. Sprawdź SUPABASE_URL w .env.local."
            : code === "ECONNREFUSED"
              ? "Połączenie z Supabase zostało odrzucone. Sprawdź adres projektu i ewentualny firewall/proxy."
              : `Serwer nie może połączyć się z Supabase. Sprawdź URL projektu i połączenie sieciowe.${code ? ` Kod: ${code}.` : ""}`;
      return NextResponse.json({ error }, { status: 502 });
    }

    let data: Record<string, unknown>;
    try {
      data = await response.json();
    } catch {
      console.error("[auth/login] Supabase returned a non-JSON response", { status: response.status });
      return NextResponse.json({ error: `Supabase zwrócił nieprawidłową odpowiedź (HTTP ${response.status}). Sprawdź URL projektu.` }, { status: 502 });
    }

    if (!response.ok) {
      const message =
        data.error_code === "email_not_confirmed"
          ? "Potwierdź adres email przed zalogowaniem."
          : typeof data.error_description === "string" ? data.error_description
            : typeof data.msg === "string" ? data.msg
              : "Nieprawidłowy email lub hasło.";
      return NextResponse.json({ error: message }, { status: 401 });
    }

    const accessToken = typeof data.access_token === "string" ? data.access_token : null;
    const refreshToken = typeof data.refresh_token === "string" ? data.refresh_token : null;

    if (!accessToken) {
      return NextResponse.json({ error: "Supabase nie zwrócił tokenu logowania." }, { status: 502 });
    }

    const result = NextResponse.json({ ok: true });

    result.cookies.set("motohub_access_token", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    if (refreshToken) {
      result.cookies.set("motohub_refresh_token", refreshToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    return result;
  } catch (cause) {
    console.error("[auth/login] Request handling failed", { errorName: cause instanceof Error ? cause.name : "unknown", hasEmail: Boolean(email) });
    return NextResponse.json({ error: "Nie udało się obsłużyć logowania. Sprawdź dane formularza i logi serwera." }, { status: 500 });
  }
}
