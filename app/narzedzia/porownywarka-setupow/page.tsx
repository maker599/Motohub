import SiteNav from "../../SiteNav";
import SetupComparisonTool from "./SetupComparisonTool";

export default function SetupComparisonPage() {
  return <main className="min-h-screen bg-[#090909] px-5 py-5 text-white sm:px-8"><div className="mx-auto max-w-7xl"><SiteNav /><header className="border-b border-white/10 py-9 sm:py-12"><p className="text-xs font-bold uppercase tracking-[.2em] text-red-300">MotoHub · konfiguracje</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Porównywarka setupów</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">Zestaw dwa silniki i polecane części według katalogu. Porównaj koszt, klasę, moc i pasmo pracy bez logowania.</p></header><section className="py-6"><SetupComparisonTool /></section></div></main>;
}