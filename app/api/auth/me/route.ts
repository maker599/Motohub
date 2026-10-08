import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const token = (await cookies()).get("motohub_access_token")?.value;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!token || !url || !key) return NextResponse.json({ user: null });

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ user: null });
  const user = await response.json();
  return NextResponse.json({ user: { id: user.id, email: user.email, username: user.user_metadata?.username ?? null } });
}
