import { NextResponse } from "next/server";

export async function POST() {
  const result = NextResponse.json({ ok: true });

  result.cookies.set("motohub_access_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  result.cookies.set("motohub_refresh_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return result;
}
