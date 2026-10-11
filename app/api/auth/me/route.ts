import { connection, NextResponse } from "next/server";
import { getSupabaseSession } from "@/app/lib/supabase-session";

export async function GET() {
  try {
    await connection();
    const session = await getSupabaseSession();
    if (!session) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email ?? "",
        username: session.user.user_metadata?.username ?? null,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
