import { NextResponse } from "next/server";
import { getMotorcycleBySlug } from "@/app/lib/motorcycles";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const result = await getMotorcycleBySlug(slug);
    if (!result.item) return NextResponse.json({ error: "Nie znaleziono motocykla." }, { status: 404 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Nie udało się pobrać motocykla." }, { status: 502 });
  }
}
