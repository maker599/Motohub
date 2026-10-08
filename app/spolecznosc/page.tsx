"use client";

import { useEffect, useState } from "react";
import SiteNav from "../SiteNav";

type Post = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: { username?: string | null } | null;
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  async function loadPosts() {
    setLoading(true);
    setError("");
    const response = await fetch("/api/community/posts", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      setError(data?.error ?? "Nie udało się pobrać postów.");
      setPosts([]);
    } else {
      setPosts(data.posts ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  async function addPost(event: React.FormEvent) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || publishing) return;

    setPublishing(true);
    setError("");

    const response = await fetch("/api/community/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data?.error ?? "Nie udało się opublikować posta.");
    } else {
      setDraft("");
      await loadPosts();
    }

    setPublishing(false);
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
        <SiteNav />

        <section className="py-10">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[.25em] text-red-500">Społeczność</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Co słychać na trasie?</h1>
            <p className="mt-3 max-w-2xl text-zinc-500">
              Miejsce na motocykle, garażowe projekty, trasy i pytania innych motocyklistów.
            </p>
          </div>

          <form onSubmit={addPost} className="rounded-3xl border border-white/10 bg-white/[.035] p-4">
            <div className="flex gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-500/15 font-black text-red-400">
                Ty
              </div>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Napisz coś dla społeczności..."
                rows={3}
                maxLength={2000}
                className="min-w-0 flex-1 resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500/50"
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-600">{draft.length}/2000</span>
              <button
                type="submit"
                disabled={!draft.trim() || publishing}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {publishing ? "Publikowanie..." : "Opublikuj"}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="mt-5 space-y-4">
            {loading ? (
              <div className="rounded-3xl border border-white/10 p-10 text-center text-sm text-zinc-600">
                Ładowanie postów...
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[.04] text-2xl">+</div>
                <h2 className="mt-5 text-lg font-bold">Brak postów</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
                  Społeczność jest jeszcze pusta. Napisz pierwszy post.
                </p>
              </div>
            ) : (
              posts.map((post) => {
                const username = post.profiles?.username || "Użytkownik";
                const initial = username.charAt(0).toUpperCase();

                return (
                  <article key={post.id} className="rounded-3xl border border-white/10 bg-white/[.03] p-5 sm:p-6">
                    <div className="flex items-start gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 font-black">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold">{username}</p>
                        <p className="text-xs text-zinc-600">
                          {new Date(post.created_at).toLocaleString("pl-PL")}
                        </p>
                      </div>
                    </div>
                    <p className="mt-5 whitespace-pre-wrap leading-7 text-zinc-300">{post.content}</p>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
