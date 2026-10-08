"use client";
import { useState } from "react";

export default function AddToGarage({ slug }: { slug: string }) {
  const [status, setStatus] = useState("");
  async function add() {
    setStatus("Dodawanie...");
    const r = await fetch("/api/garage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug }) });
    const data = await r.json();
    if (r.ok) setStatus("Dodano do garażu ✓");
    else if (r.status === 401) window.location.href = "/logowanie";
    else setStatus(data.error ?? "Nie udało się dodać.");
  }
  return <div className="mt-7"><button onClick={add} className="rounded-full bg-red-500 px-6 py-3 font-bold">{status === "Dodawanie..." ? status : "Dodaj do garażu"}</button>{status && status !== "Dodawanie..." && <p className="mt-3 text-sm text-zinc-400">{status}</p>}</div>;
}
