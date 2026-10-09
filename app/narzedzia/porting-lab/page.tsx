"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteNav from "../../SiteNav";

type Engine = "AM6" | "Derbi D50B0" | "Piaggio Hi-Per2" | "Minarelli poziomy" | "Minarelli pionowy" | "Peugeot 2T" | "Honda Dio AF18/AF27" | "Simson M5x1";
type Port = { id:string; label:string; width:string; height:string; top:string; color:string };
const engines:Engine[]=["AM6","Derbi D50B0","Piaggio Hi-Per2","Minarelli poziomy","Minarelli pionowy","Peugeot 2T","Honda Dio AF18/AF27","Simson M5x1"];
const catalogue = [
 {brand:"Airsal",name:"Sport / Racing — rodzina AM6",engine:"AM6",data:"SKU zależne od wersji",source:"Wymaga karty technicznej dokładnego SKU"},
 {brand:"Barikit",name:"Sport / Racing — rodzina AM6",engine:"AM6",data:"SKU zależne od wersji",source:"Wymaga karty technicznej dokładnego SKU"},
 {brand:"Stage6",name:"Streetrace / Racing — rodzina AM6",engine:"AM6",data:"SKU zależne od wersji",source:"Wymaga karty technicznej dokładnego SKU"},
 {brand:"Airsal",name:"Sport / Racing — D50B0",engine:"Derbi D50B0",data:"SKU zależne od wersji",source:"Wymaga karty technicznej dokładnego SKU"},
 {brand:"Top Performances",name:"Sport / Racing — D50B0",engine:"Derbi D50B0",data:"SKU zależne od wersji",source:"Wymaga karty technicznej dokładnego SKU"},
 {brand:"Polini",name:"Sport / Racing — skuter 2T",engine:"Piaggio Hi-Per2",data:"Wiele wariantów",source:"Wymaga karty technicznej dokładnego SKU"},
 {brand:"Malossi",name:"Sport / Racing — skuter 2T",engine:"Piaggio Hi-Per2",data:"Wiele wariantów",source:"Wymaga karty technicznej dokładnego SKU"},
 {brand:"Stage6",name:"Sport — Minarelli horizontal",engine:"Minarelli poziomy",data:"Wiele wariantów",source:"Wymaga karty technicznej dokładnego SKU"},
 {brand:"Malossi",name:"Sport — Minarelli vertical",engine:"Minarelli pionowy",data:"Wiele wariantów",source:"Wymaga karty technicznej dokładnego SKU"},
 {brand:"Polini",name:"Sport — Peugeot 2T",engine:"Peugeot 2T",data:"Wersje zależne od silnika",source:"Wymaga karty technicznej dokładnego SKU"},
 {brand:"Malossi",name:"Sport — Honda Dio",engine:"Honda Dio AF18/AF27",data:"Wersje zależne od kodu silnika",source:"Wymaga karty technicznej dokładnego SKU"},
 {brand:"MZA / aftermarket",name:"Cylinder — Simson M5x1",engine:"Simson M5x1",data:"Wiele wariantów",source:"Wymaga dokumentacji dokładnego cylindra"}
] as const;
const basePorts:Port[]=[
 {id:"exhaust",label:"Wydech",width:"24",height:"16",top:"34",color:"#ef4444"},
 {id:"transfer",label:"Transfery",width:"11",height:"10",top:"54",color:"#f59e0b"},
 {id:"intake",label:"Dolot / boost",width:"10",height:"8",top:"68",color:"#a78bfa"}
];
const cls="mt-1 w-full rounded-lg border border-white/10 bg-[#090b10] px-3 py-2.5 text-sm text-white outline-none focus:border-red-500";
function Numeric({label,value,onChange,unit="mm",min=0,max=200}:{label:string;value:string;onChange:(v:string)=>void;unit?:string;min?:number;max?:number}){
 return <label className="block text-xs text-zinc-400">{label}<div className="relative"><input className={cls+" pr-12"} inputMode="decimal" value={value} onChange={e=>onChange(e.target.value)} /><span className="absolute right-3 top-3 text-[10px] text-zinc-500">{unit}</span></div></label>;
}
function CylinderView({bore,deck,ports,selected}:{bore:number;deck:number;ports:Port[];selected:string}){
 const scale=Math.max(1,Math.min(4,260/Math.max(bore,20)));
 const w=bore*scale, h=deck*scale, x=350-w/2, y=28;
 const portRect=(p:Port)=>{const pw=Math.min(w*.85,Math.max(2,Number(p.width)||2)*scale),ph=Math.min(h*.65,Math.max(2,Number(p.height)||2)*scale),py=y+Math.max(0,Math.min(deck-(Number(p.top)||0),deck-(Number(p.top)||0)-Number(p.height||0)))*scale;return {x:350-pw/2,y:Math.max(y+3,Math.min(y+h-ph,py)),w:pw,h:ph};};
 return <svg viewBox="0 0 700 390" className="w-full" role="img" aria-label="Przekrój koncepcyjny cylindra, skala poglądowa na podstawie wpisanych pomiarów">
 <defs><linearGradient id="sleeve" x1="0" x2="1"><stop offset="0" stopColor="#27272a"/><stop offset=".2" stopColor="#a1a1aa"/><stop offset=".48" stopColor="#52525b"/><stop offset=".72" stopColor="#d4d4d8"/><stop offset="1" stopColor="#27272a"/></linearGradient><linearGradient id="inner" x1="0" x2="1"><stop offset="0" stopColor="#030712"/><stop offset=".5" stopColor="#111827"/><stop offset="1" stopColor="#030712"/></linearGradient></defs>
 <path d={`M ${x-28} ${y} H ${x+w+28} V ${y+h+10} H ${x-28} Z`} fill="#18181b" stroke="#52525b" strokeWidth="2"/>
 <rect x={x} y={y} width={w} height={h} rx="3" fill="url(#sleeve)" stroke="#d4d4d8" strokeWidth="2"/>
 <rect x={x+8} y={y+5} width={Math.max(1,w-16)} height={Math.max(1,h-10)} fill="url(#inner)" stroke="#27272a" strokeWidth="1"/>
 {ports.map(p=>{const r=portRect(p),is=selected===p.id;return <g key={p.id}><rect x={r.x} y={r.y} width={r.w} height={r.h} rx={Math.min(8,r.h/3)} fill={p.color} fillOpacity={is ? 0.85 : 0.4} stroke={p.color} strokeWidth={is?3:1.4}/>{is&&<path d={`M ${r.x+r.w+5} ${r.y+r.h/2} H 500`} stroke={p.color} strokeWidth="2" strokeDasharray="4 3"/ >}</g>})}
 <g fill="#e4e4e7" fontSize="12"><text x="28" y="25" fill="#f87171" fontWeight="700">PRZEKRÓJ SCHEMATYCZNY</text><text x="28" y="44" fill="#a1a1aa">Położenie portów wg wpisanych danych</text><text x="28" y="350" fill="#a1a1aa">Bore: {bore.toFixed(1)} mm</text><text x="28" y="368" fill="#a1a1aa">Odcinek referencyjny: {deck.toFixed(1)} mm</text><text x="520" y="350" fill="#fca5a5">Nie jest to skan cylindra</text><text x="520" y="368" fill="#a1a1aa">ani szablon obróbki.</text></g>
 <path d={`M ${x} ${y-9} V ${y-19} M ${x+w} ${y-9} V ${y-19} M ${x} ${y-15} H ${x+w}`} stroke="#f87171" strokeWidth="1.5"/><text x="350" y={y-23} textAnchor="middle" fill="#fca5a5" fontSize="12">średnica wpisana: {bore} mm</text>
 </svg>;
}
export default function PortingLabPage(){
 const [engine,setEngine]=useState<Engine>("AM6");
 const [brand,setBrand]=useState("Stage6");
 const [cylinder,setCylinder]=useState("Sport / Racing — rodzina AM6");
 const [sku,setSku]=useState("");
 const [source,setSource]=useState("");
 const [bore,setBore]=useState("47.6");
 const [deck,setDeck]=useState("60");
 const [stroke,setStroke]=useState("39");
 const [rod,setRod]=useState("85");
 const [goal,setGoal]=useState("Trwałość / szeroki zakres");
 const [selected,setSelected]=useState("exhaust");
 const [ports,setPorts]=useState<Port[]>(basePorts);
 const [notes,setNotes]=useState("");
 const [checks,setChecks]=useState<string[]>([]);
 const [showLibrary,setShowLibrary]=useState(false);
 const matching=useMemo(()=>catalogue.filter(c=>c.engine===engine),[engine]);
 const port=ports.find(p=>p.id===selected)??ports[0];
 const updatePort=(id:string,key:"width"|"height"|"top",value:string)=>setPorts(old=>old.map(p=>p.id===id?{...p,[key]:value}:p));
 const finite=(v:string)=>{const n=Number(v.replace(",","."));return Number.isFinite(n)&&v.trim()!==""?n:null;};
 const area=(p:Port)=>{const w=finite(p.width),h=finite(p.height);return w!==null&&h!==null&&w>0&&h>0?(w*h).toFixed(1):"—";};
 const exportPlan=()=>{const text=["MOTOHUB PORTING LAB — karta pomiarów","Platforma: "+engine,"Producent/profil: "+brand+" / "+cylinder,"SKU: "+(sku||"nie podano"),"Źródło dokumentacji: "+(source||"nie podano"),"Cel: "+goal,"Bore: "+bore+" mm; długość referencyjna: "+deck+" mm; skok: "+stroke+" mm; korbowód: "+rod+" mm","POMIARY WPISANE PRZEZ UŻYTKOWNIKA (nie są zaleceniami obróbki):",...ports.map(p=>p.label+": szer. "+p.width+" mm; wys. "+p.height+" mm; położenie odniesienia "+p.top+" mm; pole prostokątne orientacyjne "+area(p)+" mm²"),"Notatki: "+notes,"Schemat jest wizualizacją poglądową. Nie zawiera zaleceń usuwania materiału ani docelowych wymiarów frezowania."].join("\n");const blob=new Blob([text],{type:"text/plain;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="motohub-porting-pomiary.txt";a.click();URL.revokeObjectURL(url);};
 const selectedLibrary=matching.find(c=>c.brand===brand&&c.name===cylinder)??matching[0];
 return <main className="min-h-screen bg-[#080808] text-white"><div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8"><SiteNav/>
 <header className="mt-7 flex flex-wrap items-start justify-between gap-4"><div><Link href="/narzedzia" className="text-sm text-zinc-500 hover:text-white">← Wszystkie narzędzia</Link><p className="mt-4 text-xs font-black uppercase tracking-[.3em] text-red-500">MotoHub / 2T engineering</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">Porting Lab <span className="text-red-500">2T</span></h1><p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">Interaktywny model przekroju cylindra i karta pomiarów. Ustaw własne wymiary, obserwuj zmianę geometrii na rysunku i eksportuj dane projektu.</p></div><div className="flex gap-2"><button onClick={()=>window.print()} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm hover:border-red-500/50">Drukuj / PDF</button><button onClick={exportPlan} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold hover:bg-red-500">Eksportuj kartę</button></div></header>
 <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(245px,.78fr)_minmax(420px,1.45fr)_minmax(245px,.78fr)]">
 <section className="rounded-2xl border border-white/10 bg-[#111] p-4"><h2 className="font-bold">01 / Silnik i cylinder</h2><div className="mt-4 space-y-4">
 <label className="block text-xs text-zinc-400">Platforma<select className={cls} value={engine} onChange={e=>{const v=e.target.value as Engine;setEngine(v);const first=catalogue.find(c=>c.engine===v);if(first){setBrand(first.brand);setCylinder(first.name)}setSku("");}}>{engines.map(e=><option key={e}>{e}</option>)}</select></label>
 <label className="block text-xs text-zinc-400">Producent / rodzina<select className={cls} value={brand} onChange={e=>{setBrand(e.target.value);const c=matching.find(x=>x.brand===e.target.value);if(c)setCylinder(c.name)}}>{Array.from(new Set(matching.map(c=>c.brand))).map(x=><option key={x}>{x}</option>)}</select></label>
 <label className="block text-xs text-zinc-400">Profil katalogowy<select className={cls} value={cylinder} onChange={e=>setCylinder(e.target.value)}>{matching.map(c=><option key={c.name} value={c.name}>{c.name}</option>)}</select></label>
 <label className="block text-xs text-zinc-400">SKU / numer katalogowy<input className={cls} value={sku} onChange={e=>setSku(e.target.value)} placeholder="Wpisz dokładny numer"/></label>
 <label className="block text-xs text-zinc-400">Źródło specyfikacji<input className={cls} value={source} onChange={e=>setSource(e.target.value)} placeholder="Instrukcja producenta / strona"/></label>
 <label className="block text-xs text-zinc-400">Cel projektu<select className={cls} value={goal} onChange={e=>setGoal(e.target.value)}><option>Trwałość / szeroki zakres</option><option>Środek obrotów</option><option>Projekt torowy</option><option>Przywrócenie stanu fabrycznego</option></select></label>
 <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3"><p className="text-xs font-bold text-red-300">Źródło danych</p><p className="mt-1 text-xs leading-5 text-zinc-400">{selectedLibrary?.source??"Dane do potwierdzenia dla dokładnego SKU"}. Nie wpisujemy wymiarów katalogowych bez wiarygodnej dokumentacji konkretnej wersji.</p></div>
 </div></section>
 <div className="space-y-4">
 <section className="rounded-2xl border border-white/10 bg-[#111] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">02 / Przekrój geometryczny</h2><p className="mt-1 text-xs text-zinc-500">Czerwono-czarny widok techniczny • wartości z formularza</p></div><span className="rounded-full border border-red-500/30 px-3 py-1 text-[10px] font-bold text-red-300">MODEL KONCEPCYJNY</span></div><div className="mt-3 rounded-xl border border-white/5 bg-[#080b10] p-2"><CylinderView bore={finite(bore)??47.6} deck={finite(deck)??60} ports={ports} selected={selected}/></div><div className="mt-3 grid grid-cols-3 gap-2">{ports.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} className={"rounded-lg border p-3 text-left "+(selected===p.id?"border-red-500/60 bg-red-500/10":"border-white/10 bg-black/20")}><span className="block text-xs font-bold" style={{color:p.color}}>{p.label}</span><span className="mt-1 block text-[10px] text-zinc-500">{p.width} × {p.height} mm</span></button>)}</div></section>
 <section className="rounded-2xl border border-white/10 bg-[#111] p-4"><h2 className="font-bold">03 / Parametry i pomiary</h2><p className="mt-1 text-xs leading-5 text-zinc-500">Wpisz dane zmierzone lub podane w instrukcji. Model aktualizuje rysunek; nie wyznacza docelowego cięcia.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Numeric label="Średnica cylindra" value={bore} onChange={setBore}/><Numeric label="Długość odniesienia" value={deck} onChange={setDeck}/><Numeric label="Skok wału" value={stroke} onChange={setStroke}/><Numeric label="Długość korbowodu" value={rod} onChange={setRod}/></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><Numeric label={"Szerokość — "+port.label} value={port.width} onChange={v=>updatePort(port.id,"width",v)} max={100}/><Numeric label="Wysokość portu" value={port.height} onChange={v=>updatePort(port.id,"height",v)} max={100}/><Numeric label="Położenie od punktu odniesienia" value={port.top} onChange={v=>updatePort(port.id,"top",v)} max={200}/></div><div className="mt-4 grid gap-3 sm:grid-cols-3">{ports.map(p=><div key={p.id} className="rounded-xl border border-white/5 bg-black/20 p-3"><p className="text-xs font-bold" style={{color:p.color}}>{p.label}</p><p className="mt-2 text-lg font-black">{area(p)} <span className="text-xs font-normal text-zinc-500">mm²*</span></p><p className="text-[10px] leading-4 text-zinc-500">* Pole prostokąta width × height, tylko orientacyjnie; nie jest rzeczywistym polem portu.</p></div>)}</div></section>
 <section className="rounded-2xl border border-white/10 bg-[#111] p-4"><h2 className="font-bold">04 / Notatki i karta projektu</h2><textarea className={cls+" mt-3 min-h-28"} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Stan cylindra, pomiary, uwagi do weryfikacji, pytania dla specjalisty…"/><div className="mt-3 flex flex-wrap gap-2"><button onClick={exportPlan} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold hover:bg-red-500">Pobierz kartę pomiarów</button><button onClick={()=>{setPorts(basePorts);setBore("47.6");setDeck("60");setStroke("39");setRod("85")}} className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:border-red-500/40">Przywróć przykładowy widok</button></div></section>
 </div>
 <aside className="space-y-4"><section className="rounded-2xl border border-white/10 bg-[#111] p-4"><h2 className="font-bold">05 / Biblioteka platform</h2><p className="mt-1 text-xs leading-5 text-zinc-500">Lista rodzin i producentów do wyboru. Nie jest kompletnym katalogiem rynku, a wpis nie oznacza potwierdzonej kompatybilności ani wymiarów.</p><button onClick={()=>setShowLibrary(v=>!v)} className="mt-3 w-full rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10">{showLibrary?"Ukryj katalog":"Pokaż wpisy katalogowe ("+catalogue.length+")"}</button>{showLibrary&&<div className="mt-3 max-h-80 space-y-2 overflow-auto">{catalogue.map((c,i)=><button key={i} onClick={()=>{setEngine(c.engine as Engine);setBrand(c.brand);setCylinder(c.name);setSku("");}} className="w-full rounded-lg border border-white/5 bg-black/20 p-3 text-left hover:border-red-500/30"><span className="block text-xs font-bold">{c.brand}</span><span className="mt-1 block text-xs text-zinc-300">{c.name}</span><span className="mt-1 block text-[10px] text-zinc-500">{c.data}</span></button>)}</div>}</section>
 <section className="rounded-2xl border border-white/10 bg-[#111] p-4"><h2 className="font-bold">06 / Lista kontroli</h2><p className="mt-1 text-xs text-zinc-500">Przygotowanie dokumentacji przed konsultacją.</p><div className="mt-3 space-y-3">{["Potwierdzono dokładny kod silnika i SKU cylindra","Zapisano źródło dokumentacji producenta","Oddzielono pomiary rzeczywiste od przykładowych","Zanotowano stan tłoka, pierścieni i cylindra","Plan zweryfikuje doświadczony specjalista 2T"].map((x,i)=><label key={x} className="flex gap-2 text-xs leading-5 text-zinc-300"><input type="checkbox" checked={checks.includes(String(i))} onChange={e=>setChecks(old=>e.target.checked?[...old,String(i)]:old.filter(v=>v!==String(i)))} className="mt-1 accent-red-500"/>{x}</label>)}</div></section>
 <section className="rounded-2xl border border-red-500/20 bg-red-500/[.04] p-4"><h2 className="text-sm font-bold text-red-200">Ważne ograniczenie</h2><p className="mt-2 text-xs leading-5 text-zinc-400">Nie pokazujemy automatycznych „milimetrów do zebrania”. Do wiarygodnego projektu potrzebne są pomiary konkretnej sztuki, geometria tłoka i korbowodu, grubość tulei, kształt kanałów oraz dokumentacja producenta. Błędna obróbka może zniszczyć cylinder lub doprowadzić do awarii. Rysunek nie jest skanem 3D ani szablonem frezowania.</p></section>
 <section className="rounded-2xl border border-white/10 bg-[#111] p-4"><h2 className="font-bold">Więcej narzędzi</h2><Link href="/narzedzia/setupy-2t" className="mt-3 block rounded-lg border border-white/10 px-3 py-2.5 text-center text-xs font-bold hover:border-red-500/40">Baza setupów 2T →</Link><Link href="/narzedzia/tuning-2t" className="mt-2 block rounded-lg border border-white/10 px-3 py-2.5 text-center text-xs font-bold hover:border-red-500/40">Symulator mocy →</Link></section></aside>
 </div></div><style jsx global>{`@media print{body,main{background:#fff!important;color:#111!important}button,a,nav{display:none!important}section{break-inside:avoid;background:#fff!important;border-color:#bbb!important}p,h1,h2,h3,label,span,td{color:#111!important}input,textarea{color:#111!important;border-color:#aaa!important}}`}</style></main>;
}
