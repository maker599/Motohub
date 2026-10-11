import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("motohub_access_token")?.value;
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_ANON_KEY;

  if (accessToken && url && key) {
    try {
      await fetch(`${url}/auth/v1/logout?scope=local`, {
        method: "POST",
        headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      });
    } catch {
      // Local cookies are still cleared when Supabase is unavailable.
    }
  }

  cookieStore.delete("motohub_access_token");
  cookieStore.delete("motohub_refresh_token");
  return NextResponse.json({ ok: true });
}
