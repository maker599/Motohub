"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function AuthNav() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setReady(false);
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { user: null })
      .then((data) => setLoggedIn(Boolean(data.user)))
      .catch(() => setLoggedIn(false))
      .finally(() => setReady(true));
  }, [pathname]);

  if (!ready) return <div className="h-10 w-24" aria-hidden="true" />;

  return loggedIn ? (
    <Link href="/profil" className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white transition hover:border-red-500/30 hover:bg-white/10">
      Mój profil
    </Link>
  ) : (
    <>
      <Link href="/logowanie" className="rounded-full px-3 py-2 text-sm font-semibold text-zinc-300 transition hover:text-white">Zaloguj</Link>
      <Link href="/rejestracja" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-zinc-200">Dołącz</Link>
    </>
  );
}
