import SiteNav from "../SiteNav";
import ShoppingPlanner from "./ShoppingPlanner";

export default function ShoppingPage() {
  return (
    <main className="shopping-print min-h-screen bg-[#090909] px-5 py-5 text-white sm:px-8">
      <div className="mx-auto max-w-7xl"><SiteNav />
        <header className="shopping-page-intro border-b border-white/10 py-9 sm:py-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-red-300">MotoHub · zakupy</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Planer części</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Porównaj oferty dla zapisanej konfiguracji, policz koszt dostawy z kilku sklepów i zachowaj listę zakupową przy swoim koncie.</p></header>
        <section className="py-6"><ShoppingPlanner /></section>
      </div>
    </main>
  );
}