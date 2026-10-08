"use client";

import { useState } from "react";
import SiteNav from "../SiteNav";

export default function CommunityPage() {
  const [draft, setDraft] = useState("");

  function addPost(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim()) return;
    setDraft("");
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
                T
              </div>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Napisz coś dla społeczności..."
                rows={3}
                className="min-w-0 flex-1 resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-red-500/50"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={!draft.trim()}
                className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Opublikuj
              </button>
            </div>
          </form>

          <div className="mt-5 rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/[.04] text-2xl">
              +
            </div>
            <h2 className="mt-5 text-lg font-bold">Brak postów</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
              Społeczność jest jeszcze pusta. Pierwszy prawdziwy post pojawi się tutaj po podłączeniu zapisu do bazy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
