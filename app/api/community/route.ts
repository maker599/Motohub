import { connection, NextResponse } from "next/server";
import { getSupabaseSession, type SupabaseUser } from "@/app/lib/supabase-session";

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const postSelection = "id,user_id,post_type,title,content,attachments,shared_setup_token,created_at,profiles(username),comments(id,content,created_at,profiles(username)),post_reactions(id,user_id,reaction_type)";
const attachmentTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);
const maxAttachmentBytes = 8 * 1024 * 1024;

type RawProfile = { username?: string | null } | null | Array<{ username?: string | null }>;
type RawComment = { id: string; user_id?: string | null; content: string; created_at: string; profiles?: RawProfile };
type RawReaction = { id: string; user_id: string; reaction_type: string };
type RawAttachment = { path: string; name: string; content_type: string; size: number };
type RawPost = {
  id: string;
  user_id: string;
  post_type?: "post" | "thread";
  title?: string | null;
  content: string;
  attachments?: RawAttachment[];
  shared_setup_token?: string | null;
  created_at: string;
  profiles?: RawProfile;
  comments?: RawComment[];
  post_reactions?: RawReaction[];
};

function first<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function username(profile: RawProfile | undefined, fallback = "Rider") {
  return first(profile)?.username?.trim() || fallback;
}

function presentComment(comment: RawComment) {
  return {
    id: comment.id,
    authorId: comment.user_id ?? null,
    content: comment.content,
    created_at: comment.created_at,
    author: username(comment.profiles),
  };
}

function presentPost(post: RawPost, userId?: string | null, fallback = "Rider") {
  const reactions = { like: 0, love: 0, wrench: 0, fire: 0 };
  for (const reaction of post.post_reactions ?? []) {
    if (reaction.reaction_type in reactions) reactions[reaction.reaction_type as keyof typeof reactions] += 1;
  }
  return {
    id: post.id,
    authorId: post.user_id,
    kind: post.post_type ?? "post",
    title: post.title ?? "",
    content: post.content,
    created_at: post.created_at,
    author: username(post.profiles, fallback),
    comments: (post.comments ?? []).map(presentComment),
    attachments: (post.attachments ?? []).map((attachment) => ({
      ...attachment,
      url: `${supabaseUrl}/storage/v1/object/public/community-attachments/${attachment.path.split("/").map(encodeURIComponent).join("/")}`,
    })),
    sharedSetupToken: post.shared_setup_token ?? null,
    setupUrl: post.shared_setup_token ? `/setup/${post.shared_setup_token}` : null,
    reactionCounts: reactions,
    myReaction: (post.post_reactions ?? []).find((reaction) => reaction.user_id === userId)?.reaction_type ?? null,
  };
}

function userName(user: SupabaseUser) {
  return user.user_metadata?.username?.trim() || user.email?.split("@")[0] || "Rider";
}

const demoPosts = [
  { id: "demo-1", content: "W końcu odebrałem swoją MT-07. Teraz czas na pierwsze dłuższe trasy!", created_at: "2026-10-09T08:00:00.000Z", author: "Michał", motorcycle: "Yamaha MT-07", comments: [] },
  { id: "demo-2", content: "Macie jakieś polecane trasy na weekend? Chętnie zrobię 300–400 km.", created_at: "2026-10-09T05:00:00.000Z", author: "Kuba", motorcycle: "BMW R 1300 GS", comments: [] },
  { id: "demo-3", content: "Pierwszy sezon i coraz bardziej rozumiem, dlaczego wszyscy mówią, że jazda uzależnia.", created_at: "2026-10-08T10:00:00.000Z", author: "Ola", motorcycle: "Honda CBR650R", comments: [] },
];

async function readBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validAttachments(value: unknown, userId: string): RawAttachment[] | null {
  if (!Array.isArray(value) || value.length > 5) return null;
  const pathPattern = new RegExp(`^${userId}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`, "i");
  const attachments: RawAttachment[] = [];
  for (const valueItem of value) {
    if (!isObject(valueItem)) return null;
    const { path, name, content_type: contentType, size } = valueItem;
    if (typeof path !== "string" || !pathPattern.test(path)) return null;
    if (typeof name !== "string" || name.trim().length < 1 || name.length > 180) return null;
    if (typeof contentType !== "string" || !attachmentTypes.has(contentType)) return null;
    if (typeof size !== "number" || !Number.isInteger(size) || size < 1 || size > maxAttachmentBytes) return null;
    attachments.push({ path, name: name.trim(), content_type: contentType, size });
  }
  return attachments;
}

export async function GET() {
  await connection();
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ items: demoPosts, demoMode: true });

  try {
    const session = await getSupabaseSession();
    const response = await fetch(
      `${supabaseUrl}/rest/v1/posts?select=${postSelection}&order=created_at.desc&limit=100`,
      { headers: { apikey: supabaseKey, ...(session ? { Authorization: `Bearer ${session.token}` } : {}) }, cache: "no-store" },
    );
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: "Nie udało się pobrać wpisów społeczności." }, { status: response.status });
    return NextResponse.json({ items: (data as RawPost[]).map((post) => presentPost(post, session?.user.id)), demoMode: false });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) return NextResponse.json({ error: "Publikowanie wymaga konfiguracji Supabase." }, { status: 503 });

  try {
    const session = await getSupabaseSession();
    if (!session) return NextResponse.json({ error: "Zaloguj się, aby opublikować wpis." }, { status: 401 });

    const body = await readBody(request);
    if (!isObject(body)) return NextResponse.json({ error: "Nieprawidłowa treść wpisu." }, { status: 400 });
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) return NextResponse.json({ error: "Wpis nie może być pusty." }, { status: 400 });
    if (content.length > 2000) return NextResponse.json({ error: "Wpis może mieć maksymalnie 2000 znaków." }, { status: 400 });
    const postType = body.kind === "thread" ? "thread" : body.kind === "post" || body.kind === undefined ? "post" : null;
    if (!postType) return NextResponse.json({ error: "Nieznany rodzaj publikacji." }, { status: 400 });
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (postType === "thread" && (title.length < 2 || title.length > 120)) return NextResponse.json({ error: "Tytuł wątku musi mieć od 2 do 120 znaków." }, { status: 400 });
    if (postType === "post" && title && (title.length < 2 || title.length > 120)) return NextResponse.json({ error: "Tytuł może mieć maksymalnie 120 znaków." }, { status: 400 });
    const attachments = validAttachments(body.attachments ?? [], session.user.id);
    if (!attachments) return NextResponse.json({ error: "Załączniki są nieprawidłowe. Dołącz maksymalnie 5 plików do 8 MB." }, { status: 400 });
    const sharedSetupToken = body.sharedSetupToken === undefined || body.sharedSetupToken === null || body.sharedSetupToken === "" ? null : typeof body.sharedSetupToken === "string" ? body.sharedSetupToken : null;
    if (body.sharedSetupToken && !sharedSetupToken) return NextResponse.json({ error: "Nieprawidłowy token setupu." }, { status: 400 });
    if (sharedSetupToken) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sharedSetupToken)) return NextResponse.json({ error: "Nieprawidłowy token setupu." }, { status: 400 });
      const setupResponse = await fetch(`${supabaseUrl}/rest/v1/saved_setups?select=id&user_id=eq.${encodeURIComponent(session.user.id)}&share_token=eq.${encodeURIComponent(sharedSetupToken)}`, {
        headers: { apikey: supabaseKey, Authorization: `Bearer ${session.token}` }, cache: "no-store",
      });
      const setups = await setupResponse.json();
      if (!setupResponse.ok) return NextResponse.json({ error: "Nie udało się zweryfikować setupu." }, { status: setupResponse.status });
      if (!Array.isArray(setups) || setups.length === 0) return NextResponse.json({ error: "Możesz udostępnić tylko własny setup z aktywnym linkiem publicznym." }, { status: 400 });
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/posts?select=${postSelection}`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({ user_id: session.user.id, post_type: postType, title: title || null, content, attachments, shared_setup_token: sharedSetupToken }),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data?.message ?? "Nie udało się opublikować wpisu." }, { status: response.status });

    const post = Array.isArray(data) ? data[0] : data;
    return NextResponse.json({ item: presentPost(post as RawPost, session.user.id, userName(session.user)) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Nie udało się połączyć z Supabase." }, { status: 502 });
  }
}
