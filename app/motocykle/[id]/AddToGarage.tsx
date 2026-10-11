"use client";
import { useState } from "react";
import { addLocalGarageBike } from "../../lib/local-garage";
import type { Motorcycle } from "../../lib/motorcycles";

export default function AddToGarage({ motorcycle }: { motorcycle: Motorcycle }) {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  async function add() {
    if (loading) return;
    setLoading(true);
    setStatus("Dodawanie...");
    try {
      const authResponse = await fetch("/api/auth/me", { cache: "no-store" });
      const authData = await authResponse.json();
      if (!authData.user) {
        const result = addLocalGarageBike(motorcycle);
        setStatus(result.added ? "Dodano do garażu w tej przeglądarce." : "Ten motocykl jest już w lokalnym garażu.");
        return;
      }
      const response = await fetch("/api/garage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: motorcycle.slug }) });
      const data = await response.json();
      if (response.ok) setStatus("Dodano do garażu ✓");
      else if (response.status === 401 || data.error === "Brak konfiguracji Supabase.") {
        const result = addLocalGarageBike(motorcycle);
        setStatus(result.added ? "Dodano do garażu w tej przeglądarce." : "Ten motocykl jest już w lokalnym garażu.");
      }
      else setStatus(data.error ?? "Nie udało się dodać.");
    } catch {
      try {
        const result = addLocalGarageBike(motorcycle);
        setStatus(result.added ? "Brak połączenia. Motocykl zapisano lokalnie w tej przeglądarce." : "Motocykl jest już w lokalnym garażu.");
      } catch {
        setStatus("Nie udało się zapisać motocykla.");
      }
    } finally {
      setLoading(false);
    }
  }
  return <div className="mt-7"><button onClick={add} disabled={loading} className="rounded-full bg-red-500 px-6 py-3 font-bold disabled:opacity-50">{loading ? "Dodawanie..." : "Dodaj do garażu"}</button>{status && !loading && <p role="status" className="mt-3 text-sm text-zinc-400">{status}</p>}</div>;
}
