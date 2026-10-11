"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import SiteNav from "../SiteNav";

type User = { id: string; email: string; username: string | null };
type Comment = { id: string; authorId: string | null; content: string; created_at: string; author: string };
type ReactionType = "like" | "love" | "wrench" | "fire";
type ReactionCounts = Record<ReactionType, number>;
type Attachment = { path: string; name: string; content_type: string; size: number; url: string };
type UploadedAttachment = Omit<Attachment, "url">;
type SharedSetup = { id: string; name: string; engine: string; share_token: string };
type Post = {
  id: string;
  authorId: string | null;
  kind: "post" | "thread";
  title: string;
  content: string;
  created_at: string;
  author: string;
  comments: Comment[];
  attachments: Attachment[];
  sharedSetupToken: string | null;
  setupUrl?: string | null;
  reactionCounts: ReactionCounts;
  myReaction: ReactionType | null;
  motorcycle?: string;
};

const allowedAttachmentTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);
const maxAttachmentSize = 8 * 1024 * 1024;
const maxAttachments = 5;
const reactionOptions: Array<{ type: ReactionType; label: string }> = [
  { type: "like", label: "Przydatne" },
  { type: "love", label: "Serce" },
  { type: "wrench", label: "Warsztat" },
  { type: "fire", label: "Ogień" },
];
const emptyReactionCounts: ReactionCounts = { like: 0, love: 0, wrench: 0, fire: 0 };

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function normalizePost(post: Post): Post {
  return {
    ...post,
    kind: post.kind ?? "post",
    title: post.title ?? "",
    comments: post.comments ?? [],
    attachments: post.attachments ?? [],
    sharedSetupToken: post.sharedSetupToken ?? null,
    setupUrl: post.setupUrl ?? (post.sharedSetupToken ? `/setup/${post.sharedSetupToken}` : null),
    reactionCounts: { ...emptyReactionCounts, ...post.reactionCounts },
    myReaction: post.myReaction ?? null,
  };
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sharedSetups, setSharedSetups] = useState<SharedSetup[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [title, setTitle] = useState("");
  const [postKind, setPostKind] = useState<"post" | "thread">("post");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sharedSetupToken, setSharedSetupToken] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentingId, setCommentingId] = useState<string | null>(null);
  const [reactingId, setReactingId] = useState<string | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDraft, setEditDraft] = useState("");
  const [savingPostId, setSavingPostId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editCommentDraft, setEditCommentDraft] = useState("");
  const [savingCommentId, setSavingCommentId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "post" | "comment"; postId: string; commentId?: string } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCommunity() {
      try {
        const [feedResponse, authResponse] = await Promise.all([
          fetch("/api/community", { cache: "no-store" }),
          fetch("/api/auth/me", { cache: "no-store" }),
        ]);
        const [feed, auth] = await Promise.all([feedResponse.json(), authResponse.json()]);
        if (!feedResponse.ok) throw new Error(feed.error ?? "Nie udało się pobrać społeczności.");
        if (!active) return;
        setPosts(Array.isArray(feed.items) ? (feed.items as Post[]).map(normalizePost) : []);
        setDemoMode(Boolean(feed.demoMode));
        setUser(auth.user ?? null);
        if (auth.user) {
          const setupResponse = await fetch("/api/setups", { cache: "no-store" });
          const setupData = await setupResponse.json();
          if (setupResponse.ok && Array.isArray(setupData.items)) {
            setSharedSetups(setupData.items.filter((setup: SharedSetup) => Boolean(setup.share_token)));
          }
        }
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Nie udało się połączyć z serwerem.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadCommunity();
    return () => { active = false; };
  }, []);

  async function publish(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim() || (postKind === "thread" && !title.trim()) || publishing || demoMode) return;
    setPublishing(true);
    setPublishStatus("");
    setError("");
    const uploaded: UploadedAttachment[] = [];
    try {
      for (const [index, file] of selectedFiles.entries()) {
        setPublishStatus(`Przesyłanie załącznika ${index + 1}/${selectedFiles.length}…`);
        const form = new FormData();
        form.append("file", file);
        const uploadResponse = await fetch("/api/community/attachments", { method: "POST", body: form });
        const uploadData = await uploadResponse.json();
        if (!uploadResponse.ok) throw new Error(uploadData.error ?? "Nie udało się przesłać załącznika.");
        uploaded.push(uploadData.attachment as UploadedAttachment);
      }
      setPublishStatus("Publikowanie…");
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: postKind,
          title: postKind === "thread" ? title : null,
          content: draft,
          attachments: uploaded,
          sharedSetupToken: sharedSetupToken || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się opublikować wpisu.");
      setPosts((current) => [normalizePost(data.item as Post), ...current]);
      setDraft("");
      setTitle("");
      setPostKind("post");
      setSelectedFiles([]);
      setSharedSetupToken("");
      setPublishStatus("");
    } catch (cause) {
      if (uploaded.length > 0) {
        await Promise.allSettled(uploaded.map((attachment) => fetch("/api/community/attachments", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: attachment.path }),
        })));
      }
      setError(cause instanceof Error ? cause.message : "Nie udało się opublikować wpisu.");
      setPublishStatus("");
    } finally {
      setPublishing(false);
    }
  }

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (selectedFiles.length + incoming.length > maxAttachments) {
      setError(`Możesz dodać maksymalnie ${maxAttachments} załączników.`);
      return;
    }
    const invalid = incoming.find((file) => !allowedAttachmentTypes.has(file.type) || file.size > maxAttachmentSize || file.size === 0);
    if (invalid) {
      setError(`${invalid.name}: dołącz JPG, PNG, WebP, GIF lub PDF do 8 MB.`);
      return;
    }
    setError("");
    setSelectedFiles((current) => [...current, ...incoming]);
  }

  async function comment(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault();
    const content = commentDrafts[postId]?.trim();
    if (!content || commentingId) return;
    setCommentingId(postId);
    setError("");
    try {
      const response = await fetch(`/api/community/${encodeURIComponent(postId)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się dodać komentarza.");
      setPosts((current) => current.map((post) => post.id === postId ? { ...post, comments: [...post.comments, data.item] } : post));
      setCommentDrafts((current) => ({ ...current, [postId]: "" }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się dodać komentarza.");
    } finally {
      setCommentingId(null);
    }
  }

  async function react(post: Post, type: ReactionType) {
    if (!user || reactingId) return;
    const nextReaction = post.myReaction === type ? null : type;
    setReactingId(post.id);
    setError("");
    try {
      const response = await fetch(`/api/community/${encodeURIComponent(post.id)}/reactions`, {
        method: nextReaction ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        ...(nextReaction ? { body: JSON.stringify({ type: nextReaction }) } : {}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się zapisać reakcji.");
      setPosts((current) => current.map((item) => {
        if (item.id !== post.id) return item;
        const reactionCounts = { ...item.reactionCounts };
        if (item.myReaction) reactionCounts[item.myReaction] = Math.max(0, reactionCounts[item.myReaction] - 1);
        if (nextReaction) reactionCounts[nextReaction] += 1;
        return { ...item, reactionCounts, myReaction: nextReaction };
      }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się zapisać reakcji.");
    } finally {
      setReactingId(null);
    }
  }

  function startEditing(post: Post) {
    setEditingPostId(post.id);
    setEditTitle(post.kind === "thread" ? post.title : "");
    setEditDraft(post.content);
    setError("");
  }

  async function saveEditedPost(post: Post) {
    if (!user || savingPostId || !editDraft.trim()) return;
    setSavingPostId(post.id);
    setError("");
    try {
      const response = await fetch(`/api/community/${encodeURIComponent(post.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: post.kind,
          title: post.kind === "thread" ? editTitle : post.title,
          content: editDraft,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się zapisać zmian.");
      setPosts((current) => current.map((item) => item.id === post.id ? { ...item, title: post.kind === "thread" ? editTitle.trim() : item.title, content: editDraft.trim() } : item));
      setEditingPostId(null);
      setEditTitle("");
      setEditDraft("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się zapisać zmian.");
    } finally {
      setSavingPostId(null);
    }
  }

  async function deletePost(postId: string) {
    if (!user) return;
    setError("");
    try {
      const response = await fetch(`/api/community/${encodeURIComponent(postId)}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się usunąć wpisu.");
      setPosts((current) => current.filter((post) => post.id !== postId));
      if (editingPostId === postId) {
        setEditingPostId(null);
        setEditTitle("");
        setEditDraft("");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się usunąć wpisu.");
    } finally {
      setConfirmDelete(null);
    }
  }

  function startEditingComment(comment: Comment) {
    setEditingCommentId(comment.id);
    setEditCommentDraft(comment.content);
    setError("");
  }

  async function saveEditedComment(postId: string, comment: Comment) {
    if (!user || savingCommentId || !editCommentDraft.trim()) return;
    setSavingCommentId(comment.id);
    setError("");
    try {
      const response = await fetch(`/api/community/${encodeURIComponent(postId)}/comments`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: comment.id, content: editCommentDraft }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się zapisać komentarza.");
      setPosts((current) => current.map((post) => post.id === postId ? {
        ...post,
        comments: post.comments.map((item) => item.id === comment.id ? { ...item, content: editCommentDraft.trim() } : item),
      } : post));
      setEditingCommentId(null);
      setEditCommentDraft("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się zapisać komentarza.");
    } finally {
      setSavingCommentId(null);
    }
  }

  async function deleteComment(postId: string, commentId: string) {
    if (!user) return;
    setError("");
    try {
      const response = await fetch(`/api/community/${encodeURIComponent(postId)}/comments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Nie udało się usunąć komentarza.");
      setPosts((current) => current.map((post) => post.id === postId ? { ...post, comments: post.comments.filter((comment) => comment.id !== commentId) } : post));
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
        setEditCommentDraft("");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nie udało się usunąć komentarza.");
    } finally {
      setConfirmDelete(null);
    }
  }

  const confirmDeleteBody = confirmDelete ? (confirmDelete.type === "post" ? "ten wpis" : "ten komentarz") : "";

  return <main className="min-h-screen bg-[#090909] text-white"><div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8"><SiteNav />
    <header className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.18),transparent_25%),linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-2xl shadow-black/20 sm:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[.26em] text-red-400">Społeczność</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Rozmowy z trasy i warsztatu</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">Wpisy, pytania i konfiguracje motocykli od ludzi, którzy kochają wolność, dźwięk i technikę.</p>
    </header>

    {demoMode && <p className="my-5 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">Widok demonstracyjny. Publikowanie wymaga aktywnej konfiguracji Supabase.</p>}
    {error && <p role="alert" className="my-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}

    {user && !demoMode ? <form onSubmit={publish} className="my-6 rounded-[2rem] border border-white/10 bg-white/[0.02] p-4 shadow-xl shadow-black/10 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-xl border border-white/10 bg-black/20 p-1" aria-label="Rodzaj publikacji">
          {([ ["post", "Wpis"], ["thread", "Wątek"] ] as const).map(([kind, label]) => <button key={kind} type="button" aria-pressed={postKind === kind} onClick={() => setPostKind(kind)} className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${postKind === kind ? "bg-white/10 text-white shadow-inner shadow-black/20" : "text-zinc-400 hover:text-white"}`}>{label}</button>)}
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">{draft.length}/2000</span>
      </div>
      {postKind === "thread" && <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} minLength={2} required placeholder="Tytuł wątku" aria-label="Tytuł wątku" className="mt-4 w-full border-b border-white/10 bg-transparent pb-3 text-base font-bold text-white outline-none placeholder:text-zinc-600 focus:border-red-400" />}
      <textarea id="community-post" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} rows={4} required placeholder={postKind === "thread" ? "Opisz temat i rozpocznij dyskusję…" : "Napisz, co dzieje się w Twoim motocyklowym świecie…"} className="mt-4 w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-400" />
      {selectedFiles.length > 0 && <ul className="mt-4 divide-y divide-white/[.07] overflow-hidden rounded-2xl border border-white/10 bg-black/20">{selectedFiles.map((file, index) => <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 px-3 py-2.5 text-xs"><span className="min-w-0 truncate text-zinc-300">{file.name} <span className="text-zinc-600">{formatSize(file.size)}</span></span><button type="button" aria-label={`Usuń załącznik ${file.name}`} onClick={() => setSelectedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} className="rounded-md border border-white/10 px-2 py-1 text-zinc-400 transition hover:border-red-300 hover:text-red-200">Usuń</button></li>)}</ul>}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-white/[.07] pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white">Dodaj załączniki<input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" onChange={addFiles} disabled={publishing} className="sr-only" /></label>
          <span className="text-[10px] text-zinc-500">{selectedFiles.length}/{maxAttachments} · 8 MB / plik</span>
          <label className="sr-only" htmlFor="community-setup">Udostępniony setup</label>
          <select id="community-setup" value={sharedSetupToken} onChange={(event) => setSharedSetupToken(event.target.value)} disabled={sharedSetups.length === 0 || publishing} className="max-w-64 rounded-xl border border-white/10 bg-[#101010] px-2.5 py-2 text-xs text-zinc-300 disabled:text-zinc-600">
            <option value="">Dołącz setup…</option>{sharedSetups.map((setup) => <option key={setup.id} value={setup.share_token}>{setup.name} · {setup.engine}</option>)}
          </select>
          {sharedSetups.length === 0 && <Link href="/profil" className="text-[10px] font-medium text-zinc-500 underline underline-offset-2 hover:text-white">Zarządzaj setupami</Link>}
        </div>
        <button disabled={publishing || !draft.trim() || (postKind === "thread" && !title.trim())} className="rounded-xl bg-red-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50">{publishing ? publishStatus || "Publikowanie…" : postKind === "thread" ? "Rozpocznij wątek" : "Opublikuj wpis"}</button>
      </div>
    </form> : !loading && !user ? <div className="my-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4"><p className="text-sm text-zinc-400">Zaloguj się, aby publikować, komentować i reagować.</p><Link href="/logowanie" className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-200 transition hover:bg-red-500/15">Zaloguj się</Link></div> : null}

    {loading ? <div className="mt-6 space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-40 animate-pulse rounded-[2rem] border border-white/10 bg-white/[0.02]" />)}</div> : posts.length === 0 ? (
      <div className="mt-6 rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center"><h2 className="text-base font-bold">Brak publikacji</h2><p className="mt-2 text-sm text-zinc-500">Wpisy i wątki pojawią się tutaj.</p></div>
    ) : <div className="mt-6 space-y-4">{posts.map((post) => <article key={post.id} className="rounded-[2rem] border border-white/10 bg-white/[0.02] p-4 shadow-xl shadow-black/10 sm:p-5">
      <div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-bold text-white">{post.author}</p><span className="text-[10px] text-zinc-600">·</span><span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-red-300">{post.kind === "thread" ? "Wątek" : "Wpis"}</span></div>{post.motorcycle && <p className="mt-1 text-xs text-zinc-500">{post.motorcycle}</p>}</div><time className="shrink-0 text-[10px] text-zinc-500" dateTime={post.created_at}>{formatDate(post.created_at)}</time></div>
      {post.title && <h2 className="mt-4 text-xl font-bold text-white">{post.title}</h2>}
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{post.content}</p>
      {post.attachments.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{post.attachments.map((attachment) => attachment.content_type.startsWith("image/") ? <a key={attachment.path} href={attachment.url} target="_blank" rel="noreferrer" aria-label={`Otwórz załączone zdjęcie ${attachment.name}`} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"><div role="img" aria-label={attachment.name} className="aspect-[16/10] bg-cover bg-center" style={{ backgroundImage: `url("${attachment.url}")` }} /></a> : <a key={attachment.path} href={attachment.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-3 text-xs transition hover:border-white/20"><span className="rounded-md bg-red-500/10 px-2 py-1 font-bold text-red-300">PDF</span><span className="min-w-0 flex-1 truncate text-zinc-200">{attachment.name}</span><span className="text-zinc-500">{formatSize(attachment.size)}</span></a>)}</div>}
      {post.sharedSetupToken && <Link href={post.setupUrl ?? `/setup/${post.sharedSetupToken}`} className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 transition hover:bg-red-500/10"><span><span className="block text-[9px] font-bold uppercase tracking-[0.18em] text-red-300">Udostępniony setup</span><span className="mt-1 block text-xs font-semibold text-zinc-200">Otwórz konfigurację motocykla</span></span><span aria-hidden="true" className="text-zinc-500">↗</span></Link>}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/[.07] pt-3">
        {reactionOptions.map(({ type, label }) => <button key={type} type="button" aria-pressed={post.myReaction === type} disabled={!user || reactingId === post.id || demoMode} onClick={() => void react(post, type)} className={`rounded-xl border px-2.5 py-1.5 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${post.myReaction === type ? "border-red-400/40 bg-red-500/10 text-red-100" : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white"}`}>{label} · {post.reactionCounts[type] ?? 0}</button>)}
        <span className="ml-auto text-[10px] text-zinc-500">Komentarze · {post.comments.length}</span>
        {user && post.authorId === user.id && <div className="ml-2 flex items-center gap-2">
          <button type="button" onClick={() => startEditing(post)} className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-[10px] font-semibold text-zinc-300 transition hover:border-white/20 hover:text-white">Edytuj</button>
          <button type="button" onClick={() => setConfirmDelete({ type: "post", postId: post.id })} className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[10px] font-semibold text-red-200 transition hover:bg-red-500/15">Usuń</button>
        </div>}
      </div>
      {editingPostId === post.id && <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        {post.kind === "thread" && <input value={editTitle} onChange={(event) => setEditTitle(event.target.value)} maxLength={120} placeholder="Tytuł wątku" className="w-full border-b border-white/10 bg-transparent pb-2 text-sm font-bold text-white outline-none placeholder:text-zinc-600 focus:border-red-400" />}
        <textarea value={editDraft} onChange={(event) => setEditDraft(event.target.value)} rows={4} maxLength={2000} className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-black/20 p-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-400" placeholder="Zmień treść wpisu…" />
        <div className="mt-3 flex items-center justify-end gap-2">
          <button type="button" onClick={() => setEditingPostId(null)} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-[10px] font-semibold text-zinc-300 transition hover:text-white">Anuluj</button>
          <button type="button" disabled={savingPostId === post.id || !editDraft.trim() || (post.kind === "thread" && editTitle.trim().length < 2)} onClick={() => void saveEditedPost(post)} className="rounded-lg bg-red-500 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50">{savingPostId === post.id ? "Zapisuje…" : "Zapisz"}</button>
        </div>
      </div>}
      <div className="mt-4">
        {post.comments.length > 0 && <div className="space-y-3">{post.comments.map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold tracking-[0.12em] text-zinc-400 uppercase">{item.author} <span className="ml-2 font-normal normal-case text-zinc-600">{formatDate(item.created_at)}</span></p>
            {user && item.authorId === user.id && <div className="flex items-center gap-2">
              <button type="button" onClick={() => startEditingComment(item)} className="text-[10px] font-semibold text-zinc-300 transition hover:text-white">Edytuj</button>
              <button type="button" onClick={() => setConfirmDelete({ type: "comment", postId: post.id, commentId: item.id })} className="text-[10px] font-semibold text-red-300 transition hover:text-red-200">Usuń</button>
            </div>}
          </div>
          {editingCommentId === item.id ? <div className="mt-2">
            <textarea value={editCommentDraft} onChange={(event) => setEditCommentDraft(event.target.value)} rows={3} maxLength={1000} className="w-full resize-y rounded-xl border border-white/10 bg-black/20 p-2 text-xs leading-5 text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-red-400" />
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setEditingCommentId(null)} className="rounded-lg border border-white/10 bg-white/[0.02] px-2.5 py-1.5 text-[10px] font-semibold text-zinc-300 hover:text-white">Anuluj</button>
              <button type="button" disabled={savingCommentId === item.id || !editCommentDraft.trim()} onClick={() => void saveEditedComment(post.id, item)} className="rounded-lg bg-red-500 px-2.5 py-1.5 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{savingCommentId === item.id ? "Zapisuje…" : "Zapisz"}</button>
            </div>
          </div> : <p className="mt-2 whitespace-pre-wrap text-xs leading-6 text-zinc-300">{item.content}</p>}
        </div>)}</div>}
        {user && !demoMode ? <form onSubmit={(event) => comment(event, post.id)} className="mt-3 flex gap-2"><input aria-label={`Komentarz do wpisu ${post.author}`} value={commentDrafts[post.id] ?? ""} onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))} maxLength={1000} placeholder="Napisz komentarz…" className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-red-400"/><button disabled={commentingId === post.id || !commentDrafts[post.id]?.trim()} className="rounded-xl bg-red-500 px-3 py-2.5 text-xs font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50">{commentingId === post.id ? "…" : "Wyślij"}</button></form> : null}
      </div>
    </article>)}</div>}

    {confirmDelete && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-[#111315] p-6 shadow-2xl shadow-black/60">
        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-red-400">Potwierdzenie</p>
        <h3 className="mt-3 text-2xl font-black text-white">Usunąć {confirmDeleteBody}?</h3>
        <p className="mt-3 text-sm leading-6 text-zinc-400">Tej operacji nie da się cofnąć. Jeśli usuniesz {confirmDeleteBody}, cała treść zostanie trwale usunięta.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => setConfirmDelete(null)} className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-xs font-semibold text-zinc-300 transition hover:text-white">Anuluj</button>
          <button type="button" onClick={() => {
            if (confirmDelete.type === "post") {
              void deletePost(confirmDelete.postId);
            } else if (confirmDelete.commentId) {
              void deleteComment(confirmDelete.postId, confirmDelete.commentId);
            }
          }} className="rounded-xl bg-red-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-400">Tak, usuń</button>
        </div>
      </div>
    </div>}
  </div></main>;
}
