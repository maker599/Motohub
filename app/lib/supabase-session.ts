import { cookies } from "next/headers";

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: { username?: string };
};

export type SupabaseSession = {
  url: string;
  key: string;
  token: string;
  user: SupabaseUser;
};

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getSupabaseSession(): Promise<SupabaseSession | null> {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const cookieStore = await cookies();
  let token = cookieStore.get("motohub_access_token")?.value;
  const refreshToken = cookieStore.get("motohub_refresh_token")?.value;
  if (!token && !refreshToken) return null;

  let userResponse = token
    ? await fetchWithTimeout(`${url}/auth/v1/user`, {
        headers: { apikey: key, Authorization: `Bearer ${token}` },
      })
    : null;

  if ((!userResponse || !userResponse.ok) && refreshToken) {
    const refreshResponse = await fetchWithTimeout(`${url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (refreshResponse.ok) {
      const refreshed = (await refreshResponse.json()) as { access_token?: string; refresh_token?: string };
      token = refreshed.access_token;
      if (token) {
        cookieStore.set("motohub_access_token", token, cookieOptions);
        if (refreshed.refresh_token) cookieStore.set("motohub_refresh_token", refreshed.refresh_token, cookieOptions);
        userResponse = await fetchWithTimeout(`${url}/auth/v1/user`, {
          headers: { apikey: key, Authorization: `Bearer ${token}` },
        });
      }
    }
  }

  if (!token || !userResponse?.ok) return null;
  const user = (await userResponse.json()) as SupabaseUser;
  return { url, key, token, user };
}

