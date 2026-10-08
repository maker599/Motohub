'use client';

import { useMemo, useState } from "react";
import SiteNav from "../SiteNav";

type Oil={
 producer:string; name:string; type:string; base:string; flash:string; jaso:string; api:string; iso:string;
 v40:string; v100:string; density:string; pour:string; tbn:string; ash:string; notes:string; source:string;
};

const oils:Oil[]=[
 {producer:"Motul",name:"710 2T",type:"2T • syntetyczny",base:"100% syntetyczny • Ester",flash:"116°C",jaso:"FD",api:"TC",iso:"L-EGD",v40:"70.2",v100:"10.9",density:"0.877",pour:"-57°C",tbn:"2.1",ash:"—",notes:"High-performance; karta 2025",source:"Motul TDS"},
 {producer:"Motul",name:"800 Factory Line Off Road 2T",type:"2T • racing",base:"100% syntetyczny • Ester Core",flash:"252°C",jaso:"—",api:"—",iso:"—",v40:"120.2",v100:"15.5",density:"0.911",pour:"—",tbn:"—",ash:"—",notes:"Racing / motocross",source:"Motul TDS"},
 {producer:"Motul",name:"800 Factory Line Road Racing 2T",type:"2T • racing",base:"100% syntetyczny • Ester Core",flash:"274°C",jaso:"—",api:"—",iso:"—",v40:"152.0",v100:"18.7",density:"0.926",pour:"—",tbn:"—",ash:"—",notes:"Road racing / Grand Prix",source:"Motul TDS"},
 {producer:"Castrol",name:"POWER1 2T",type:"2T",base:"półsyntetyczny",flash:"73°C",jaso:"FD",api:"TC",iso:"L-EGD",v40:"36.1",v100:"6.9",density:"0.862",pour:"-42°C",tbn:"—",ash:"—",notes:"Clean Burn Formula",source:"Castrol PDS"},
 {producer:"Castrol",name:"POWER1 2T",type:"2T • karta alternatywna",base:"—",flash:"66°C",jaso:"FD",api:"TC",iso:"L-EGD",v40:"36.14",v100:"25.4",density:"0.862",pour:"-42°C",tbn:"—",ash:"—",notes:"Osobna karta produktu/rynek",source:"Castrol PDS"},
 {producer:"Castrol",name:"POWER1 Racing 2T",type:"2T • racing",base:"syntetyczny",flash:"73°C",jaso:"FD",api:"TC+",iso:"L-EGD",v40:"43",v100:"22.0",density:"0.870",pour:"-36°C",tbn:"—",ash:"—",notes:"Dane z karty produktu",source:"Castrol PDS"},
 {producer:"Castrol",name:"POWER1 Scooter 2T",type:"2T • scooter",base:"—",flash:"—",jaso:"FD",api:"TC+",iso:"L-EGD",v40:"78.6",v100:"9.67",density:"0.890",pour:"—",tbn:"—",ash:"—",notes:"Specyfikacja dla skuterów",source:"Castrol"},
 {producer:"Castrol",name:"POWER1 ULTIMATE 2T",type:"2T",base:"—",flash:"—",jaso:"FD",api:"TC",iso:"L-EGD",v40:"—",v100:"—",density:"—",pour:"—",tbn:"—",ash:"—",notes:"Specyfikacje: API TC / ISO-L-EGD / JASO FD",source:"Castrol"},
 {producer:"Putoline",name:"TT Scooter",type:"2T • scooter",base:"syntetyczny",flash:"122°C",jaso:"FD",api:"TC",iso:"L-EGD",v40:"38.70",v100:"7.10",density:"0.866",pour:"-45°C",tbn:"1.4",ash:"—",notes:"Low smoke / clean burning",source:"Putoline"},
 {producer:"Putoline",name:"TT Scooter +",type:"2T • scooter",base:"—",flash:"84°C",jaso:"FD",api:"TC+",iso:"L-EGD",v40:"48.00",v100:"8.90",density:"0.879",pour:"-45°C",tbn:"2.9",ash:"0.12%",notes:"Low Smoke",source:"Putoline"},
 {producer:"Putoline",name:"TT Sport",type:"2T • road",base:"syntetyczny",flash:"122°C",jaso:"FD",api:"TC",iso:"L-EGD",v40:"38.70",v100:"7.10",density:"0.866",pour:"-45°C",tbn:"1.4",ash:"—",notes:"Normal / high-performance road",source:"Putoline"},
 {producer:"Putoline",name:"S2",type:"2T • road/off-road",base:"półsyntetyczny",flash:"100°C PM",jaso:"FD",api:"TC",iso:"L-EGD",v40:"64.60",v100:"9.50",density:"0.870",pour:"-24°C",tbn:"1.4",ash:"0.14%",notes:"Road, off-road, scooters, ATVs",source:"Putoline"},
 {producer:"Putoline",name:"Classic Scooter",type:"2T • classic scooter",base:"—",flash:"100°C PM / 116°C COC",jaso:"FD",api:"TC",iso:"L-EGD",v40:"64.60",v100:"9.50",density:"0.869",pour:"-24°C",tbn:"1.4",ash:"0.14%",notes:"Lambretta / Vespa / klasyczne skutery",source:"Putoline"},
];

const filters=["Wszystkie","JASO FD","API TC","ISO-L-EGD","Racing","Scooter","Syntetyczny","Półsyntetyczny"];

export default function Oils2TPage(){
 const [q,setQ]=useState("");
 const [filter,setFilter]=useState("Wszystkie");
 const [sort,setSort]=useState("flash-desc");
 const shown=useMemo(()=>{
  const data=oils.filter(o=>{
   const hay=(o.producer+" "+o.name+" "+o.type+" "+o.base+" "+o.notes).toLowerCase();
   const ok=filter==="Wszystkie"||
    (filter==="JASO FD"&&o.jaso==="FD")||(filter==="API TC"&&o.api.includes("TC"))||
    (filter==="ISO-L-EGD"&&o.iso==="L-EGD")||(filter==="Racing"&&o.type.toLowerCase().includes("racing"))||
    (filter==="Scooter"&&o.type.toLowerCase().includes("scooter"))||
    (filter==="Syntetyczny"&&o.base.toLowerCase().includes("syntetycz"))||
    (filter==="Półsyntetyczny"&&o.base.toLowerCase().includes("półsyntety"));
   return ok&&hay.includes(q.toLowerCase());
  });
  return [...data].sort((a,b)=>{
   if(sort==="flash-asc") return parseFloat(a.flash)-parseFloat(b.flash);
   if(sort==="name") return (a.producer+" "+a.name).localeCompare(b.producer+" "+b.name);
   return parseFloat(b.flash)-parseFloat(a.flash);
  });
 },[q,filter,sort]);
 return <main className="min-h-screen bg-[#050505] text-zinc-100">
  <SiteNav/>
  <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-24 md:px-6">
   <div className="mb-6">
    <a href="/narzedzia" className="text-xs text-zinc-500 hover:text-zinc-300">← Narzędzia</a>
    <p className="mt-6 text-[10px] font-bold uppercase tracking-[.22em] text-red-400">Narzędzia / baza danych</p>
    <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Oleje 2T</h1>
    <p className="mt-3 max-w-4xl text-sm leading-6 text-zinc-400">Zbiór parametrów technicznych deklarowanych przez producentów. Pierwsza kolumna liczbowa to temperatura zapłonu — pozostałe dane pomagają porównywać karty techniczne bez tworzenia rankingu „najlepszego” oleju.</p>
   </div>
   <div className="rounded-3xl border border-white/10 bg-white/[.025] p-4 md:p-5">
    <div className="mb-4 grid gap-2 md:grid-cols-[1fr_190px_170px]">
     <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Szukaj producenta, produktu, typu..." className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none placeholder:text-zinc-600 focus:border-red-500/40"/>
     <select value={filter} onChange={e=>setFilter(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none">{filters.map(f=><option key={f}>{f}</option>)}</select>
     <select value={sort} onChange={e=>setSort(e.target.value)} className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm outline-none">
      <option value="flash-desc">Flash: malejąco</option><option value="flash-asc">Flash: rosnąco</option><option value="name">Producent / nazwa</option>
     </select>
    </div>
    <div className="overflow-x-auto rounded-2xl border border-white/10">
     <table className="min-w-[1700px] w-full text-left text-xs">
      <thead className="bg-white/[.05] text-zinc-500"><tr>
       {["Temp. zapłonu","Producent","Produkt","Typ","Baza / rodzaj","JASO","API","ISO","ν 40°C","ν 100°C","Gęstość","Temp. płynięcia","TBN","Popiół","Uwagi"].map(h=><th key={h} className="px-3 py-3 whitespace-nowrap">{h}</th>)}
      </tr></thead>
      <tbody>{shown.map((o,n)=><tr key={o.producer+o.name+n} className="border-t border-white/[.06] hover:bg-white/[.025]">
       <td className="px-3 py-3 font-black text-zinc-100">{o.flash}</td><td className="px-3 py-3 font-medium">{o.producer}</td><td className="px-3 py-3 font-bold text-white">{o.name}</td><td className="px-3 py-3 text-zinc-400">{o.type}</td><td className="px-3 py-3 text-zinc-400">{o.base}</td>
       <td className="px-3 py-3">{o.jaso}</td><td className="px-3 py-3">{o.api}</td><td className="px-3 py-3">{o.iso}</td><td className="px-3 py-3 text-zinc-400">{o.v40}</td><td className="px-3 py-3 text-zinc-400">{o.v100}</td><td className="px-3 py-3 text-zinc-400">{o.density}</td><td className="px-3 py-3 text-zinc-400">{o.pour}</td><td className="px-3 py-3 text-zinc-400">{o.tbn}</td><td className="px-3 py-3 text-zinc-400">{o.ash}</td><td className="max-w-[300px] px-3 py-3 leading-5 text-zinc-500">{o.notes}</td>
      </tr>)}{shown.length===0&&<tr><td colSpan={15} className="px-4 py-12 text-center text-zinc-600">Brak wyników.</td></tr>}</tbody>
     </table>
    </div>
    <div className="mt-4 grid gap-3 md:grid-cols-3">
     <div className="rounded-xl border border-white/10 bg-black/15 p-3 text-xs leading-5 text-zinc-500"><b className="text-zinc-300">Temperatura zapłonu</b><br/>Parametr laboratoryjny. Nie oznacza temperatury spalania oleju w cylindrze.</div>
     <div className="rounded-xl border border-white/10 bg-black/15 p-3 text-xs leading-5 text-zinc-500"><b className="text-zinc-300">Lepkość ν</b><br/>mm²/s (cSt), zawsze przy określonej temperaturze. Metoda badania ma znaczenie.</div>
     <div className="rounded-xl border border-white/10 bg-black/15 p-3 text-xs leading-5 text-zinc-500"><b className="text-zinc-300">Brak danych</b><br/>„—” oznacza brak wartości w wykorzystanej karcie technicznej, a nie zero.</div>
    </div>
   </div>
  </div>
 </main>;
}
