import Link from "next/link";

export default function GaragePage() {
  return <main className="min-h-screen bg-[#090909] text-white"><div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
    <nav className="flex items-center justify-between border-b border-white/10 pb-5"><Link href="/" className="text-2xl font-black">MOTO<span className="text-red-500">HUB</span></Link><Link href="/rejestracja" className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black">Załóż konto</Link></nav>
    <section className="py-20"><p className="text-sm font-bold uppercase tracking-[.25em] text-red-500">Twój garaż</p><h1 className="mt-3 text-5xl font-black">Miejsce na Twoje maszyny.</h1><p className="mt-5 max-w-xl text-zinc-400">Po zalogowaniu dodasz motocykle, przebieg, modyfikacje i zdjęcia. Tutaj wszystko będzie pod ręką.</p>
    <div className="mt-10 rounded-[2rem] border border-dashed border-white/15 bg-white/[.02] p-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl text-red-400">+</div><h2 className="mt-5 text-xl font-bold">Twój garaż jest pusty</h2><p className="mt-2 text-sm text-zinc-500">Zaloguj się, żeby dodać pierwszy motocykl.</p><Link href="/logowanie" className="mt-6 inline-block rounded-full bg-red-500 px-6 py-3 font-bold">Zaloguj się</Link></div></section>
  </div></main>;
}
