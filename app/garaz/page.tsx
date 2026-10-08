"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteNav from "../SiteNav";

type Item = { id:string; nickname:string|null; mileage:number|null; motorcycles:{brand:string;model:string;year:number;engine_cc:number|null;power_hp:number|null;motorcycle_type:string|null}|null };

export default function GaragePage() {
  const [items,setItems]=useState<Item[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  useEffect(()=>{ fetch("/api/garage").then(async r=>{const d=await r.json(); if(!r.ok)setError(d.error??"Nie udało się pobrać garażu."); else setItems(d.items??[]); setLoading(false);}).catch(()=>{setError("Nie udało się połączyć z serwerem.");setLoading(false);}); },[]);
  async function remove(id:string){const r=await fetch("/api/garage",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});if(r.ok)setItems(x=>x.filter(i=>i.id!==id));}
  return <main className="min-h-screen bg-[#090909] text-white"><div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
    <nav className="flex items-center justify-between border-b border-white/10 pb-5"><Link href="/" className="text-2xl font-black">MOTO<span className="text-red-500">HUB</span></Link><Link href="/motocykle" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black">Katalog</Link></nav>
    <section className="py-16"><p className="text-sm font-bold uppercase tracking-[.25em] text-red-500">Twój garaż</p><h1 className="mt-3 text-5xl font-black">Twoje maszyny.</h1>
    {loading?<p className="mt-8 text-zinc-500">Ładowanie garażu...</p>:error?<div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-6"><p className="text-red-300">{error}</p><Link href="/logowanie" className="mt-4 inline-block text-sm font-bold underline">Przejdź do logowania</Link></div>:items.length===0?<div className="mt-10 rounded-[2rem] border border-dashed border-white/15 bg-white/[.02] p-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl text-red-400">+</div><h2 className="mt-5 text-xl font-bold">Twój garaż jest pusty</h2><p className="mt-2 text-sm text-zinc-500">Otwórz katalog i dodaj pierwszy motocykl.</p><Link href="/motocykle" className="mt-6 inline-block rounded-full bg-red-500 px-6 py-3 font-bold">Przeglądaj motocykle</Link></div>:<div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{items.map(i=><article key={i.id} className="rounded-3xl border border-white/10 bg-white/[.03] p-6"><p className="text-xs uppercase tracking-widest text-red-400">{i.motorcycles?.motorcycle_type??"Motocykl"}</p><h2 className="mt-2 text-2xl font-black">{i.motorcycles?.brand} {i.motorcycles?.model}</h2><p className="mt-2 text-sm text-zinc-500">{i.motorcycles?.year} · {i.motorcycles?.engine_cc??"—"} cm³ · {i.motorcycles?.power_hp??"—"} KM</p>{i.nickname&&<p className="mt-4 text-sm text-zinc-300">Nazwa: {i.nickname}</p>}{i.mileage!=null&&<p className="mt-1 text-sm text-zinc-400">Przebieg: {i.mileage.toLocaleString("pl-PL")} km</p>}<button onClick={()=>remove(i.id)} className="mt-6 text-sm font-bold text-red-400">Usuń z garażu</button></article>)}</div>}
    </section></div></main>;
}