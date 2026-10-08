import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function GET() {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get("motohub_access_token")?.value;
  const refreshToken = cookieStore.get("motohub_refresh_token")?.value;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;

  if (!url || !key || (!accessToken && !refreshToken)) {
    return NextResponse.json({ user: null });
  }

  let response = accessToken
    ? await fetch(`${url}/auth/v1/user`, {
        headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      })
    : null;

  let refreshed: { access_token?: string; refresh_token?: string } | null = null;

  if ((!response || !response.ok) && refreshToken) {
    const refreshResponse = await fetch(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    });

    if (refreshResponse.ok) {
      refreshed = await refreshResponse.json();
      accessToken = refreshed?.access_token;
      if (accessToken) {
        response = await fetch(`${url}/auth/v1/user`, {
          headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        });
      }
    }
  }

  if (!response?.ok) return NextResponse.json({ user: null });

  const user = await response.json();
  const result = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username ?? null,
    },
  });

  if (refreshed?.access_token) {
    result.cookies.set("motohub_access_token", refreshed.access_token, cookieOptions);
  }
  if (refreshed?.refresh_token) {
    result.cookies.set("motohub_refresh_token", refreshed.refresh_token, cookieOptions);
  }

  return result;
}
