import { NextResponse } from "next/server";
import { getSupabaseSession } from "@/app/lib/supabase-session";

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const bucket = "community-attachments";
const maxFileSize = 8 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);

async function getSession() {
  if (!supabaseUrl || !supabaseKey) return { error: NextResponse.json({ error: "Załączniki wymagają konfiguracji Supabase Storage." }, { status: 503 }) };
  const session = await getSupabaseSession();
  if (!session) return { error: NextResponse.json({ error: "Zaloguj się, aby dodawać załączniki." }, { status: 401 }) };
  return { session };
}

export async function POST(request: Request) {
  try {
    const access = await getSession();
    if ("error" in access) return access.error;
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Wybierz plik do załączenia." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Dozwolone są obrazy JPG, PNG, WebP, GIF oraz pliki PDF." }, { status: 415 });
    if (file.size < 1 || file.size > maxFileSize) return NextResponse.json({ error: "Plik musi mieć maksymalnie 8 MB." }, { status: 413 });
    if (file.name.trim().length < 1 || file.name.length > 180) return NextResponse.json({ error: "Nazwa pliku jest nieprawidłowa lub zbyt długa." }, { status: 400 });

    const path = `${access.session.user.id}/${crypto.randomUUID()}`;
    const uploadResponse = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
      method: "POST",
      headers: {
        apikey: supabaseKey!,
        Authorization: `Bearer ${access.session.token}`,
        "Content-Type": file.type,
        "x-upsert": "false",
      },
      body: file,
      cache: "no-store",
    });
    if (!uploadResponse.ok) return NextResponse.json({ error: "Nie udało się przesłać pliku do Supabase Storage." }, { status: uploadResponse.status });
    return NextResponse.json({ attachment: { path, name: file.name.trim(), content_type: file.type, size: file.size } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase Storage." }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  try {
    const access = await getSession();
    if ("error" in access) return access.error;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Nieprawidłowy plik." }, { status: 400 });
    }
    const path = body && typeof body === "object" && "path" in body ? body.path : null;
    const pathPattern = new RegExp(`^${access.session.user.id}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`, "i");
    if (typeof path !== "string" || !pathPattern.test(path)) return NextResponse.json({ error: "Nieprawidłowy plik." }, { status: 400 });

    const response = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}`, {
      method: "DELETE",
      headers: { apikey: supabaseKey!, Authorization: `Bearer ${access.session.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prefixes: [path] }),
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "Nie udało się usunąć pliku." }, { status: response.status });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase Storage." }, { status: 502 });
  }
}