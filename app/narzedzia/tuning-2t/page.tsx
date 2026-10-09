"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteNav from "../../SiteNav";

type TuneInputs = {
  bore:number; stroke:number; cylinders:number; rod:number; rpm:number;
  exhaustDuration:number; transferDuration:number; torque:number;
  clearanceVolume:number; ambientC:number; pressure:number;
};
const initial:TuneInputs={bore:54,stroke:54,cylinders:1,rod:105,rpm:9000,exhaustDuration:190,transferDuration:128,torque:12,clearanceVolume:8,ambientC:20,pressure:101.3};
const fmt=(n:number,d=1)=>Number.isFinite(n)?n.toLocaleString("pl-PL",{maximumFractionDigits:d,minimumFractionDigits:d}):"—";

export default function Tuning2TPage(){
 const [v,setV]=useState<TuneInputs>(initial);
 const [showNotes,setShowNotes]=useState(false);
 const update=(key:keyof TuneInputs,value:string)=>setV(s=>({...s,[key]:value===""?0:Number(value)}));
 const r=useMemo(()=>{
  const bore=Math.max(0,v.bore),stroke=Math.max(0,v.stroke),cyl=Math.max(0,v.cylinders),rpm=Math.max(0,v.rpm);
  const swept=Math.PI/4*bore*bore*stroke/1000;
  const total=swept*cyl;
  const meanPiston=2*stroke*rpm/60000;
  const rodRatio=v.rod>0? v.rod/stroke:0;
  const geometricCR=v.clearanceVolume>0?(Math.PI/4*bore*bore*stroke/1000+v.clearanceVolume)/v.clearanceVolume:0;
  const power=v.torque*rpm/9549.2966;
  const specificPower=total>0?power*1000/total:0;
  const exhaustBlowdown=Math.max(0,(v.exhaustDuration-v.transferDuration)/2);
  const kelvin=v.ambientC+273.15;
  const density=(v.pressure*1000)/(287.05*Math.max(1,kelvin));
  const densityRatio=density/1.204;
  return {swept,total,meanPiston,rodRatio,geometricCR,power,specificPower,exhaustBlowdown,density,densityRatio};
 },[v]);
 const field=(key:keyof TuneInputs,label:string,unit:string,step="1")=><label key={key} className="block"><span className="mb-2 flex items-center justify-between gap-2 text-xs text-zinc-400"><span>{label}</span><span className="text-zinc-600">{unit}</span></span><input type="number" min="0" step={step} value={v[key]} onChange={e=>update(key,e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none focus:border-red-500/60"/></label>;
 return <main className="min-h-screen bg-[#090909] text-white"><div className="mx-auto max-w-7xl px-5 py-5 lg:px-8"><SiteNav/>
  <div className="mt-8"><Link href="/narzedzia/kalkulator" className="text-sm text-zinc-500 hover:text-white">← Wróć do 2T Exhaust Lab</Link>
   <header className="mt-5 max-w-4xl"><p className="text-xs font-black uppercase tracking-[.3em] text-red-500">MotoHub / silniki dwusuwowe</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-6xl">Analizator tuningu 2T</h1><p className="mt-4 text-base leading-7 text-zinc-400">Panel obliczeń kontrolnych dla geometrii, prędkości tłoka, timingów, sprężania i warunków otoczenia. Wyniki aktualizują się na bieżąco i pomagają porównywać konfiguracje — nie są prognozą mocy ani gotową specyfikacją do obróbki.</p></header>
  </div>
  <div className="mt-8 grid gap-5 xl:grid-cols-[360px_1fr]">
   <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><div className="flex items-center justify-between"><h2 className="font-bold">Parametry wejściowe</h2><button onClick={()=>setV(initial)} className="text-xs text-zinc-500 hover:text-white">Reset</button></div>
    <div className="mt-5 space-y-4">{field("bore","Średnica cylindra","mm","0.1")}{field("stroke","Skok tłoka","mm","0.1")}{field("cylinders","Liczba cylindrów","szt.","1")}{field("rod","Długość korbowodu","mm","0.1")}{field("rpm","Obroty analizowane","rpm","100")}{field("exhaustDuration","Czas otwarcia wydechu","° wału","1")}{field("transferDuration","Czas otwarcia transferów","° wału","1")}{field("torque","Moment obrotowy","Nm","0.1")}{field("clearanceVolume","Objętość komory przy GMP","cm³","0.1")}
     <div className="border-t border-white/10 pt-4"><p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Warunki otoczenia</p><div className="grid grid-cols-2 gap-3">{field("ambientC","Temperatura","°C","0.5")}{field("pressure","Ciśnienie","kPa","0.1")}</div></div>
   </div></section>
   <section className="space-y-5"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
    {[["Pojemność skokowa",fmt(r.total,2)+" cm³"],["Średnia prędkość tłoka",fmt(r.meanPiston,2)+" m/s"],["Stosunek korbowodu do skoku",fmt(r.rodRatio,2)+"×"],["Geometryczny stopień sprężania",r.geometricCR>0?fmt(r.geometricCR,2)+":1":"—"],["Moc z wpisanego momentu",fmt(r.power,2)+" kW"],["Moc jednostkowa",fmt(r.specificPower,1)+" kW/l"]].map(([label,value])=><div key={label} className="rounded-2xl border border-white/10 bg-white/[.035] p-5"><p className="text-xs text-zinc-500">{label}</p><p className="mt-2 text-2xl font-black">{value}</p></div>)}
   </div>
   <div className="grid gap-5 lg:grid-cols-2"><div className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-bold">Kontrola rozrządu</h2><div className="mt-4 space-y-4"><div className="flex items-center justify-between gap-3"><span className="text-sm text-zinc-400">Różnica wydech–transfer</span><b className="font-mono">{fmt(r.exhaustBlowdown,1)}°</b></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-red-500" style={{width:`${Math.min(100,Math.max(0,r.exhaustBlowdown/60*100))}%`}}/></div><p className="text-xs leading-5 text-zinc-500">Wartość to prosta różnica połowy podanych czasów trwania. Nie uwzględnia kształtu kanałów, asymetrii ani rzeczywistego przebiegu przepływu.</p></div></div>
    <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-bold">Warunki powietrza</h2><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/[.04] p-3"><p className="text-xs text-zinc-500">Gęstość idealizowana</p><p className="mt-1 font-mono font-bold">{fmt(r.density,3)} kg/m³</p></div><div className="rounded-xl bg-white/[.04] p-3"><p className="text-xs text-zinc-500">Względem 20°C / 101,3 kPa</p><p className="mt-1 font-mono font-bold">{fmt(r.densityRatio*100,1)}%</p></div></div><p className="mt-3 text-xs leading-5 text-zinc-500">Model gazu idealnego bez korekt wilgotności, temperatury dolotu w ruchu i strat w układzie.</p></div></div>
   <div className="rounded-3xl border border-amber-500/20 bg-amber-500/[.05] p-5"><h2 className="font-bold text-amber-100">Jak interpretować wyniki</h2><p className="mt-2 text-sm leading-6 text-zinc-300">Moc wyświetlana jest obliczona wyłącznie z momentu i obrotów: P = M × n / 9549. To nie jest przewidywana moc silnika. Geometryczny stopień sprężania używa podanej objętości przy GMP i nie jest stopniem sprężania uwięzionego ładunku.</p><button onClick={()=>setShowNotes(s=>!s)} className="mt-4 text-sm font-semibold text-red-300 hover:text-red-200">{showNotes?"Ukryj założenia −":"Pokaż założenia +"}</button>{showNotes&&<ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-400"><li>Wszystkie wymiary wejściowe wpisuj z wiarygodnej dokumentacji lub pomiaru i zachowuj jednostki.</li><li>Wyniki zależą od jakości danych; obliczenia nie zastępują pomiarów ani walidacji na stanowisku.</li><li>Nie używaj tych wartości jako samodzielnych instrukcji do frezowania portów lub wykonywania części.</li></ul>}</div>
   <Link href="/narzedzia/kalkulator#warsztat-cylindra" className="block rounded-3xl border border-red-500/20 bg-red-500/[.06] p-5 transition hover:bg-red-500/[.09]"><p className="text-xs font-bold uppercase tracking-widest text-red-400">Wspólny warsztat</p><h2 className="mt-1 text-xl font-bold">Karty i katalog cylindrów →</h2><p className="mt-2 text-sm text-zinc-400">Przejdź do 2T Exhaust Lab, aby zapisywać karty pomiarowe i wczytywać je do obliczeń.</p></Link>
   </section>
  </div>
 </div></main>;
}
