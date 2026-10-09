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
function CylinderView({bore,deck,stroke,rod,angle,ports,selected}:{bore:number;deck:number;stroke:number;rod:number;angle:number;ports:Port[];selected:string}){
 const safeBore=Math.max(20,Math.min(120,bore||47.6));
 const safeDeck=Math.max(20,Math.min(180,deck||60));
 const safeStroke=Math.max(10,Math.min(100,stroke||39));
 const safeRod=Math.max(safeStroke/2+1,Math.min(180,rod||85));
 const scale=Math.min(4.2,330/Math.max(safeDeck,safeBore*1.5));
 const innerW=safeBore*scale, wall=4*scale, outerW=innerW+2*wall;
 const cylH=safeDeck*scale, x=380-outerW/2, y=65;
 const theta=angle*Math.PI/180, r=safeStroke/2;
 const travel=r*(1-Math.cos(theta))+safeRod-Math.sqrt(Math.max(0,safeRod*safeRod-Math.pow(r*Math.sin(theta),2)));
 const pistonY=y+Math.max(0,Math.min(safeDeck-safeStroke*.08,travel))*scale;
 const portRect=(p:Port)=>{
   const pw=Math.max(0,Math.min(innerW*.92,(finitePort(p.width))*scale));
   const ph=Math.max(0,Math.min(cylH*.7,(finitePort(p.height))*scale));
   const topMm=finitePort(p.top);
   const py=y+Math.max(0,Math.min(safeDeck-(ph/scale),topMm))*scale;
   return {x:380-pw/2,y:py,w:pw,h:ph};
 };
 return <svg viewBox="0 0 760 500" className="w-full" role="img" aria-label="Parametryczny przekrój cylindra 2T z tłokiem; proporcje wynikają z wpisanych pomiarów">
 <defs>
  <linearGradient id="metalWall" x1="0" x2="1"><stop offset="0" stopColor="#3f3f46"/><stop offset=".22" stopColor="#d4d4d8"/><stop offset=".5" stopColor="#71717a"/><stop offset=".78" stopColor="#e4e4e7"/><stop offset="1" stopColor="#3f3f46"/></linearGradient>
  <linearGradient id="pistonMetal" x1="0" x2="1"><stop offset="0" stopColor="#71717a"/><stop offset=".25" stopColor="#f4f4f5"/><stop offset=".65" stopColor="#a1a1aa"/><stop offset="1" stopColor="#52525b"/></linearGradient>
  <linearGradient id="boreDark" x1="0" x2="1"><stop offset="0" stopColor="#09090b"/><stop offset=".5" stopColor="#18181b"/><stop offset="1" stopColor="#09090b"/></linearGradient>
 </defs>
 <rect x="1" y="1" width="758" height="498" rx="12" fill="#080b10" stroke="#27272a"/>
 <g fill="#e4e4e7" fontSize="12"><text x="22" y="26" fill="#f87171" fontWeight="800" letterSpacing="1.5">PARAMETRYCZNY PRZEKRÓJ 2D</text><text x="22" y="45" fill="#a1a1aa">Wymiary z formularza • widok schematyczny, nie skan konkretnej części</text></g>
 <path d={`M ${x-24} ${y-7} H ${x+outerW+24} V ${y+cylH+18} H ${x+outerW+8} V ${y+8} H ${x-8} V ${y+cylH+18} H ${x-24} Z`} fill="#27272a" stroke="#52525b" strokeWidth="1.5"/>
 <rect x={x} y={y} width={wall} height={cylH} fill="url(#metalWall)" stroke="#d4d4d8" strokeWidth="1"/>
 <rect x={x+wall+innerW} y={y} width={wall} height={cylH} fill="url(#metalWall)" stroke="#d4d4d8" strokeWidth="1"/>
 <rect x={x+wall} y={y} width={innerW} height={cylH} fill="url(#boreDark)" stroke="#52525b" strokeWidth="1"/>
 {ports.map(p=>{const q=portRect(p),is=selected===p.id;return <g key={p.id}><rect x={x+wall-1} y={q.y} width={wall+2} height={q.h} fill={p.color} fillOpacity={is ? 0.95 : 0.65} stroke={p.color} strokeWidth={is?2.5:1}/><rect x={x+wall+innerW-1} y={q.y} width={wall+2} height={q.h} fill={p.color} fillOpacity={is?.95:.65} stroke={p.color} strokeWidth={is?2.5:1}/><path d={`M ${x+wall+innerW+wall+8} ${q.y+q.h/2} H 555`} stroke={p.color} strokeWidth={is?2:1} strokeDasharray="4 4"/><text x="565" y={q.y+q.h/2+4} fontSize="11" fill={p.color}>{p.label}</text></g>})}
 <g>
  <rect x={x+wall+2} y={pistonY} width={Math.max(2,innerW-4)} height={Math.max(8,Math.min(30*scale,cylH*.16))} rx="2" fill="url(#pistonMetal)" stroke="#e4e4e7" strokeWidth="1.2"/>
  <path d={`M ${x+wall+4} ${pistonY+5} H ${x+outerW-wall-4} M ${x+wall+4} ${pistonY+9} H ${x+outerW-wall-4}`} stroke="#27272a" strokeWidth="1.2"/>
  <text x={x+outerW+18} y={Math.max(y+16,Math.min(y+cylH-8,pistonY+12))} fontSize="11" fill="#fafafa">Tłok</text>
 </g>
 <path d={`M ${x} ${y-13} V ${y-22} M ${x+outerW} ${y-13} V ${y-22} M ${x} ${y-18} H ${x+outerW}`} stroke="#f87171" strokeWidth="1.4"/>
 <text x={x+outerW/2} y={y-27} textAnchor="middle" fontSize="11" fill="#fca5a5">Bore: {safeBore.toFixed(1)} mm</text>
 <path d={`M ${x+outerW+26} ${y} H ${x+outerW+36} M ${x+outerW+31} ${y} V ${y+cylH} M ${x+outerW+26} ${y+cylH} H ${x+outerW+36}`} stroke="#a1a1aa" strokeWidth="1"/>
 <text x="22" y="430" fontSize="11" fill="#d4d4d8">Skok: {safeStroke.toFixed(1)} mm</text>
 <text x="22" y="448" fontSize="11" fill="#d4d4d8">Korbowód: {safeRod.toFixed(1)} mm</text>
 <text x="22" y="466" fontSize="11" fill="#d4d4d8">Kąt wału: {angle}°</text>
 <text x="22" y="484" fontSize="10" fill="#71717a">Położenie tłoka obliczone kinematycznie; porty pokazane według wpisanych pomiarów.</text>
 <text x="565" y="455" fontSize="11" fill="#fca5a5">Uwaga</text><text x="565" y="472" fontSize="10" fill="#a1a1aa">Nie jest to</text><text x="565" y="485" fontSize="10" fill="#a1a1aa">szablon obróbki.</text>
 </svg>;
}
function finitePort(value:string){const n=Number(String(value).replace(",","."));return Number.isFinite(n)?Math.max(0,Math.min(300,n)):0;}

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
 const [angle,setAngle]=useState(90);
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
 <section className="rounded-2xl border border-white/10 bg-[#111] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold">02 / Przekrój geometryczny</h2><p className="mt-1 text-xs text-zinc-500">Czerwono-czarny widok techniczny • wartości z formularza</p></div><span className="rounded-full border border-red-500/30 px-3 py-1 text-[10px] font-bold text-red-300">MODEL KONCEPCYJNY</span></div><div className="mt-3 rounded-xl border border-white/5 bg-[#080b10] p-2"><CylinderView bore={finite(bore)??47.6} deck={finite(deck)??60} stroke={finite(stroke)??39} rod={finite(rod)??85} angle={angle} ports={ports} selected={selected}/></div><div className="mt-3 grid grid-cols-3 gap-2">{ports.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} className={"rounded-lg border p-3 text-left "+(selected===p.id?"border-red-500/60 bg-red-500/10":"border-white/10 bg-black/20")}><span className="block text-xs font-bold" style={{color:p.color}}>{p.label}</span><span className="mt-1 block text-[10px] text-zinc-500">{p.width} × {p.height} mm</span></button>)}</div><div className="mt-3 rounded-lg border border-white/5 bg-black/20 p-3"><div className="flex items-center justify-between gap-3 text-xs"><label htmlFor="crank-angle" className="text-zinc-300">Obrót wału / pozycja tłoka</label><span className="font-bold text-red-300">{angle}°</span></div><input id="crank-angle" type="range" min="0" max="360" step="1" value={angle} onChange={e=>setAngle(Number(e.target.value))} className="mt-3 w-full accent-red-500"/><div className="flex justify-between text-[10px] text-zinc-500"><span>0° • GMP</span><span>180° • DMP</span><span>360° • GMP</span></div></div></section>
 <section className="rounded-2xl border border-white/10 bg-[#111] p-4"><h2 className="font-bold">03 / Parametry i pomiary</h2><p className="mt-1 text-xs leading-5 text-zinc-500">Wpisz dane zmierzone lub podane w instrukcji. Model aktualizuje rysunek; nie wyznacza docelowego cięcia.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Numeric label="Średnica cylindra" value={bore} onChange={setBore}/><Numeric label="Długość odniesienia" value={deck} onChange={setDeck}/><Numeric label="Skok wału" value={stroke} onChange={setStroke}/><Numeric label="Długość korbowodu" value={rod} onChange={setRod}/></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><Numeric label={"Szerokość — "+port.label} value={port.width} onChange={v=>updatePort(port.id,"width",v)} max={100}/><Numeric label="Wysokość portu" value={port.height} onChange={v=>updatePort(port.id,"height",v)} max={100}/><Numeric label="Położenie od punktu odniesienia" value={port.top} onChange={v=>updatePort(port.id,"top",v)} max={200}/></div><div className="mt-4 grid gap-3 sm:grid-cols-3">{ports.map(p=><div key={p.id} className="rounded-xl border border-white/5 bg-black/20 p-3"><p className="text-xs font-bold" style={{color:p.color}}>{p.label}</p><p className="mt-2 text-lg font-black">{area(p)} <span className="text-xs font-normal text-zinc-500">mm²*</span></p><p className="text-[10px] leading-4 text-zinc-500">* Pole prostokąta width × height, tylko orientacyjnie; nie jest rzeczywistym polem portu.</p></div>)}</div></section>
 <section className="rounded-2xl border border-white/10 bg-[#111] p-4"><h2 className="font-bold">04 / Notatki i karta projektu</h2><textarea className={cls+" mt-3 min-h-28"} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Stan cylindra, pomiary, uwagi do weryfikacji, pytania dla specjalisty…"/><div className="mt-3 flex flex-wrap gap-2"><button onClick={exportPlan} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold hover:bg-red-500">Pobierz kartę pomiarów</button><button onClick={()=>{setPorts(basePorts);setBore("47.6");setDeck("60");setStroke("39");setRod("85");setAngle(90)}} className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:border-red-500/40">Przywróć przykładowy widok</button></div></section>
 </div>
 <aside className="space-y-4"><section className="rounded-2xl border border-white/10 bg-[#111] p-4"><h2 className="font-bold">05 / Biblioteka platform</h2><p className="mt-1 text-xs leading-5 text-zinc-500">Lista rodzin i producentów do wyboru. Nie jest kompletnym katalogiem rynku, a wpis nie oznacza potwierdzonej kompatybilności ani wymiarów.</p><button onClick={()=>setShowLibrary(v=>!v)} className="mt-3 w-full rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10">{showLibrary?"Ukryj katalog":"Pokaż wpisy katalogowe ("+catalogue.length+")"}</button>{showLibrary&&<div className="mt-3 max-h-80 space-y-2 overflow-auto">{catalogue.map((c,i)=><button key={i} onClick={()=>{setEngine(c.engine as Engine);setBrand(c.brand);setCylinder(c.name);setSku("");}} className="w-full rounded-lg border border-white/5 bg-black/20 p-3 text-left hover:border-red-500/30"><span className="block text-xs font-bold">{c.brand}</span><span className="mt-1 block text-xs text-zinc-300">{c.name}</span><span className="mt-1 block text-[10px] text-zinc-500">{c.data}</span></button>)}</div>}</section>
 <section className="rounded-2xl border border-white/10 bg-[#111] p-4"><h2 className="font-bold">06 / Lista kontroli</h2><p className="mt-1 text-xs text-zinc-500">Przygotowanie dokumentacji przed konsultacją.</p><div className="mt-3 space-y-3">{["Potwierdzono dokładny kod silnika i SKU cylindra","Zapisano źródło dokumentacji producenta","Oddzielono pomiary rzeczywiste od przykładowych","Zanotowano stan tłoka, pierścieni i cylindra","Plan zweryfikuje doświadczony specjalista 2T"].map((x,i)=><label key={x} className="flex gap-2 text-xs leading-5 text-zinc-300"><input type="checkbox" checked={checks.includes(String(i))} onChange={e=>setChecks(old=>e.target.checked?[...old,String(i)]:old.filter(v=>v!==String(i)))} className="mt-1 accent-red-500"/>{x}</label>)}</div></section>
 <section className="rounded-2xl border border-red-500/20 bg-red-500/[.04] p-4"><h2 className="text-sm font-bold text-red-200">Ważne ograniczenie</h2><p className="mt-2 text-xs leading-5 text-zinc-400">Nie pokazujemy automatycznych „milimetrów do zebrania”. Do wiarygodnego projektu potrzebne są pomiary konkretnej sztuki, geometria tłoka i korbowodu, grubość tulei, kształt kanałów oraz dokumentacja producenta. Błędna obróbka może zniszczyć cylinder lub doprowadzić do awarii. Rysunek nie jest skanem 3D ani szablonem frezowania.</p></section>
 <section className="rounded-2xl border border-white/10 bg-[#111] p-4"><h2 className="font-bold">Więcej narzędzi</h2><Link href="/narzedzia/setupy-2t" className="mt-3 block rounded-lg border border-white/10 px-3 py-2.5 text-center text-xs font-bold hover:border-red-500/40">Baza setupów 2T →</Link><Link href="/narzedzia/tuning-2t" className="mt-2 block rounded-lg border border-white/10 px-3 py-2.5 text-center text-xs font-bold hover:border-red-500/40">Symulator mocy →</Link></section></aside>
 </div></div><style jsx global>{`@media print{body,main{background:#fff!important;color:#111!important}button,a,nav{display:none!important}section{break-inside:avoid;background:#fff!important;border-color:#bbb!important}p,h1,h2,h3,label,span,td{color:#111!important}input,textarea{color:#111!important;border-color:#aaa!important}}`}</style></main>;
}
