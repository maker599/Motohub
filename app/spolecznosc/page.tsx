"use client";

import { useMemo, useState } from "react";
import SiteNav from "../SiteNav";

type Post = {
  id: number;
  name: string;
  initials: string;
  bike: string;
  category: string;
  text: string;
  time: string;
  likes: number;
  comments: number;
  liked?: boolean;
};

const initialPosts: Post[] = [
  { id: 1, name: "Michał", initials: "M", bike: "Yamaha MT-07", category: "Motocykle", text: "W końcu odebrałem swoją MT-07. Teraz czas na pierwsze dłuższe trasy!", time: "2h", likes: 24, comments: 6 },
  { id: 2, name: "Kuba", initials: "K", bike: "BMW R 1300 GS", category: "Trasy", text: "Macie jakieś polecane trasy na weekend? Chętnie zrobię 300–400 km.", time: "5h", likes: 18, comments: 9 },
  { id: 3, name: "Ola", initials: "O", bike: "Honda CBR650R", category: "Ogólne", text: "Pierwszy sezon i coraz bardziej rozumiem, dlaczego wszyscy mówią, że jazda uzależnia.", time: "1d", likes: 31, comments: 12 },
  { id: 4, name: "Bartek", initials: "B", bike: "KTM 300 EXC", category: "Warsztat", text: "Mały update z garażu — motocykl po serwisie i w końcu gotowy na sezon.", time: "1d", likes: 15, comments: 4 },
];

const categories = ["Wszystkie", "Ogólne", "Motocykle", "Warsztat", "Trasy", "Pytania"];

export default function CommunityPage() {
  const [posts, setPosts] = useState(initialPosts);
  const [category, setCategory] = useState("Wszystkie");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const visiblePosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = category === "Wszystkie" || post.category === category;
      const matchesQuery = !q || [post.name, post.bike, post.text, post.category].some((value) => value.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [posts, category, query]);

  function toggleLike(id: number) {
    setPosts((current) => current.map((post) => post.id === id
      ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
      : post));
  }

  function addPost(event: React.FormEvent) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setPosts((current) => [{
      id: Date.now(),
      name: "Ty",
      initials: "T",
      bike: "Twój motocykl",
      category: "Ogólne",
      text,
      time: "teraz",
      likes: 0,
      comments: 0,
    }, ...current]);
    setDraft("");
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <SiteNav />

        <section className="grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div>
            <div className="mb-8">
              <p className="text-sm font-bold uppercase tracking-[.25em] text-red-500">Społeczność</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Co słychać na trasie?</h1>
              <p className="mt-3 max-w-2xl text-zinc-500">Miejsce na motocykle, garażowe projekty, trasy i pytania innych motocyklistów.</p>
            </div>

            <form onSubmit={addPost} className="mb-5 rounded-3xl border border-white/10 bg-white/[.035] p-4">
              <div className="flex gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-red-500/15 font-black text-red-400">T</div>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Napisz coś dla społeczności..."
                  rows={3}
                  className="min-w-0 flex-1 resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500/50"
                />
              </div>
              <div className="mt-3 flex items-center justify-end">
                <button type="submit" disabled={!draft.trim()} className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40">Opublikuj</button>
              </div>
            </form>

            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${category === item ? "border-red-500/40 bg-red-500 text-white" : "border-white/10 bg-white/[.03] text-zinc-400 hover:bg-white/[.07] hover:text-white"}`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mb-5">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Szukaj w postach..."
                className="w-full rounded-2xl border border-white/10 bg-white/[.03] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500/50"
              />
            </div>

            <div className="space-y-4">
              {visiblePosts.map((post) => (
                <article key={post.id} className="rounded-3xl border border-white/10 bg-white/[.03] p-5 transition hover:border-white/15 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 font-black">{post.initials}</div>
                      <div className="min-w-0">
                        <p className="font-bold">{post.name}</p>
                        <p className="truncate text-xs text-zinc-500">{post.bike} · {post.category}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-zinc-600">{post.time}</span>
                  </div>
                  <p className="mt-5 leading-7 text-zinc-300">{post.text}</p>
                  <div className="mt-5 flex items-center gap-2 border-t border-white/5 pt-4">
                    <button type="button" onClick={() => toggleLike(post.id)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${post.liked ? "bg-red-500/15 text-red-400" : "text-zinc-500 hover:bg-white/5 hover:text-white"}`}>
                      {post.liked ? "♥" : "♡"} {post.likes}
                    </button>
                    <button type="button" className="rounded-xl px-3 py-2 text-xs font-bold text-zinc-500 hover:bg-white/5 hover:text-white">💬 {post.comments}</button>
                    <button type="button" className="ml-auto rounded-xl px-3 py-2 text-xs font-bold text-zinc-600 hover:bg-white/5 hover:text-white">Udostępnij</button>
                  </div>
                </article>
              ))}
              {visiblePosts.length === 0 && (
                <div className="rounded-3xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">Brak postów pasujących do filtrów.</div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Popularne teraz</p>
              <div className="mt-4 space-y-4">
                {[
                  ["Weekendowe trasy", "24 posty"],
                  ["Projekty 2T", "18 postów"],
                  ["Pierwszy motocykl", "12 postów"],
                ].map(([title, count], index) => (
                  <div key={title} className="flex gap-3">
                    <span className="text-sm font-black text-red-500">0{index + 1}</span>
                    <div><p className="text-sm font-bold">{title}</p><p className="mt-1 text-xs text-zinc-600">{count}</p></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[.03] p-5">
              <p className="text-xs font-bold uppercase tracking-[.2em] text-zinc-500">Aktywność</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-black/20 p-4"><p className="text-2xl font-black">128</p><p className="mt-1 text-xs text-zinc-600">członków</p></div>
                <div className="rounded-2xl bg-black/20 p-4"><p className="text-2xl font-black">46</p><p className="mt-1 text-xs text-zinc-600">postów</p></div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
