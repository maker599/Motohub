"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router=useRouter(); const [username,setUsername]=useState(""); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(e:FormEvent){e.preventDefault();setLoading(true);setError("");
    const r=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username,email,password})});
    const data=await r.json();setLoading(false);
    if(!r.ok){setError(data.error??"Nie udało się utworzyć konta.");return;}
    if(data.needsConfirmation){router.push("/logowanie?registered=1");}else{router.push("/garaz");router.refresh();}
  }
  return <main className="flex min-h-screen items-center justify-center bg-[#090909] px-6 text-white"><div className="w-full max-w-md"><Link href="/" className="text-2xl font-black">MOTO<span className="text-red-500">HUB</span></Link><div className="mt-8 rounded-3xl border border-white/10 bg-white/[.03] p-8"><h1 className="text-3xl font-black">Dołącz do MotoHub.</h1><p className="mt-2 text-sm text-zinc-500">Stwórz konto i zacznij budować swój garaż.</p><form onSubmit={submit} className="mt-8 space-y-4"><input required value={username} onChange={e=>setUsername(e.target.value)} placeholder="Nazwa użytkownika" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 outline-none focus:border-red-500/50"/><input required value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 outline-none focus:border-red-500/50"/><input required minLength={8} value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Hasło (min. 8 znaków)" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-4 outline-none focus:border-red-500/50"/>{error&&<p className="text-sm text-red-400">{error}</p>}<button disabled={loading} className="w-full rounded-2xl bg-red-500 py-4 font-bold disabled:opacity-50">{loading?"Tworzenie...":"Utwórz konto"}</button></form><p className="mt-6 text-center text-sm text-zinc-500">Masz już konto? <Link href="/logowanie" className="text-white">Zaloguj się</Link></p></div></div></main>;
}