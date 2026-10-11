import { connection, NextResponse } from "next/server";
import { listMotorcycles } from "@/app/lib/motorcycles";

export async function GET() {
  try {
    await connection();
    return NextResponse.json(await listMotorcycles());
  } catch {
    return NextResponse.json({ error: "Nie udało się pobrać katalogu motocykli." }, { status: 502 });
  }
}
