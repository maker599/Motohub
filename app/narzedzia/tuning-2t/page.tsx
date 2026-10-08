"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteNav from "../../SiteNav";

type Inputs={bore:number;stroke:number;rpm:number;carb:number;airTemp:number;pressure:number;altitude:number;reedArea:number;intakeLength:number;exhaustArea:number;exhaustTemp:number;};
const defaults:any={bore:54,stroke:54,rpm:9000,carb:24,airTemp:20,pressure:1013,altitude:0,reedArea:520,intakeLength:90,exhaustArea:620,exhaustTemp:650,exhaustProfile:"stock"};
const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
const n=(v:number,d=1)=>Number(v.toFixed(d));
function calc(i:Inputs){
 const bore=Math.max(1,i.bore),stroke=Math.max(1,i.stroke),rpm=Math.max(1,i.rpm);
 const disp=Math.PI/4*bore*bore*stroke/1000,sweptL=disp/1000,T=i.airTemp+273.15,R=287.05;
 const rho=Math.max(.2,(i.pressure*100)/(R*T)),sound=Math.sqrt(1.4*R*T),meanPiston=2*stroke*rpm/60/1000;
 const carbArea=Math.PI*Math.pow(Math.max(1,i.carb)/2,2),carbFlowIndex=carbArea*Math.sqrt(rho),carbVelocityIndex=(sweptL*rpm/120)/(carbArea/1e-6);
 const pulseHz=rpm/120,reedLoading=i.reedArea>0?(sweptL*rpm/120)/(i.reedArea/1e-6):0;
 const intakeWave=(sound/(4*Math.max(20,i.intakeLength)/1000))/pulseHz,exhaustDemand=i.exhaustArea>0?(sweptL*rpm/120)/(i.exhaustArea/1e-6):0;
 const densityPct=(rho/1.204)*100,pressureFactor=i.pressure/1013.25,airMassIndex=densityPct*pressureFactor;
 const rpmBand=clamp(1-Math.abs(rpm-10500)/6500,.55,1);
 const carbFactor=clamp(0.92+Math.min(.12,Math.max(0,carbFlowIndex-4)/60),.88,1.04);
 const airFactor=clamp(.94+Math.min(.08,(airMassIndex-85)/250),.88,1.02);
 const exhaustBase={stock:.175,sport:.235,race:.285}[i.exhaustProfile];
 const exhaustPeak={stock:7500,sport:9500,race:11500}[i.exhaustProfile];
 const exhaustWidth={stock:6500,sport:5200,race:4200}[i.exhaustProfile];
 const exhaustFactor=clamp(1-(Math.abs(rpm-exhaustPeak)/exhaustWidth)*.12,.86,1);
 const sizeFactor=clamp(Math.pow(disp/125,.18),.72,1.12);
 const powerHp=disp*exhaustBase*rpmBand*carbFactor*airFactor*exhaustFactor*sizeFactor;
 const torqueNm=powerHp*745.7/(rpm*2*Math.PI/60);
 const powerKw=powerHp/1.35962;
 const volumetricEfficiency=clamp(.58+(powerHp/disp)*.55,.42,.96);
 const imep=clamp(torqueNm*4*Math.PI/(disp/1e6*1e5),4.8,12.5);
 return {disp,rho,sound,meanPiston,carbArea,carbFlowIndex,carbVelocityIndex,pulseHz,reedLoading,intakeWave,exhaustDemand,densityPct,pressureFactor,airMassIndex,volumetricEfficiency,imep,torqueNm,powerKw,powerHp};
}
function Meter({value,min,max,label}:{value:number;min:number;max:number;label:string}){const p=clamp((value-min)/(max-min)*100,0,100);return <div><div className="mb-1 flex justify-between text-xs text-zinc-400"><span>{label}</span><span>{n(value,1)}</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-red-500" style={{width:p+"%"}}/></div></div>}

export default function Tuning2T(){
 const [i,setI]=useState(defaults),[profile,setProfile]=useState<"street"|"sport"|"race">("sport");
 const set=(k:keyof typeof defaults,v:string)=>setI(x=>({...x,[k]:Number(v)||0})),r=useMemo(()=>calc(i),[i]);
 const profileData={street:{rpm:7000,desc:"szerszy zakres i spokojniejsza charakterystyka"},sport:{rpm:9000,desc:"środek między zakresem a mocą szczytową"},race:{rpm:11000,desc:"priorytet wysokich obrotów"}}[profile];
 const fields=[["bore","Średnica cylindra","mm"],["stroke","Skok tłoka","mm"],["rpm","RPM","obr/min"],["carb","Średnica gaźnika","mm"],["reedArea","Pow. zaworu","mm²"],["intakeLength","Dł. dolotu","mm"],["exhaustArea","Pow. wydechu","mm²"],["exhaustTemp","Temp. spalin","°C"],["airTemp","Temp. powietrza","°C"],["pressure","Ciśnienie","hPa"],["altitude","Wysokość","m"]] as const;
 return <main className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto max-w-7xl px-4 py-5"><SiteNav/><div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-bold uppercase tracking-[.22em] text-red-400">Narzędzia / 2T</div><h1 className="mt-1 text-3xl font-black">Analizator tuningu 2T</h1><p className="mt-2 max-w-3xl text-sm text-zinc-400">Geometria, przepływ, warunki atmosferyczne i orientacyjna estymacja osiągów zależna od wybranego typu wydechu.</p></div><Link href="/narzedzia" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">← Narzędzia</Link></div>
 <div className="mt-6 grid gap-4 lg:grid-cols-[330px_1fr]"><section className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><h2 className="font-bold">Parametry</h2><div className="mt-4 grid grid-cols-2 gap-3">{fields.map(([k,l,u])=><label key={k} className="text-xs text-zinc-400">{l}<span className="mt-1 flex items-center gap-1"><input type="number" value={i[k]} onChange={e=>set(k,e.target.value)} className="w-full min-w-0 rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-sm text-white outline-none focus:border-red-500/50"/><span className="text-[10px] text-zinc-600">{u}</span></span></label>)}</div><h2 className="mt-6 font-bold">Wydech</h2><div className="mt-2 grid grid-cols-3 gap-2">{(["stock","sport","race"] as const).map(x=><button type="button" key={x} onClick={()=>setI(v=>({...v,exhaustProfile:x}))} className={`rounded-lg px-2 py-2 text-xs ${i.exhaustProfile===x?"bg-red-500 text-white":"bg-white/5 text-zinc-400"}`}>{x==="stock"?"Seryjny":x==="sport"?"Sport":"Race"}</button>)}</div><p className="mt-2 text-xs text-zinc-500">Szacunkowy wpływ charakterystyki wydechu na napełnianie cylindra. To model porównawczy, nie wynik z hamowni.</p><h2 className="mt-6 font-bold">Profil</h2><div className="mt-2 grid grid-cols-3 gap-2">{(["street","sport","race"] as const).map(x=><button type="button" key={x} onClick={()=>setProfile(x)} className={`rounded-lg px-2 py-2 text-xs ${profile===x?"bg-red-500 text-white":"bg-white/5 text-zinc-400"}`}>{x==="street"?"Street":x==="sport"?"Sport":"Race"}</button>)}</div><p className="mt-2 text-xs text-zinc-500">{profileData.desc}; punkt odniesienia {profileData.rpm.toLocaleString("pl-PL")} RPM.</p></section>
 <div className="space-y-4">
 <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="text-xs text-zinc-500">Pojemność</div><div className="mt-1 text-2xl font-black">{n(r.disp,1)} cm³</div></div><div className="rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4"><div className="text-xs text-zinc-500">Est. moc</div><div className="mt-1 text-2xl font-black">{n(r.powerKw,1)} kW</div><div className="text-xs text-zinc-400">{n(r.powerHp,1)} KM</div></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="text-xs text-zinc-500">Moment</div><div className="mt-1 text-2xl font-black">{n(r.torqueNm,1)} Nm</div></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="text-xs text-zinc-500">VE modelu</div><div className="mt-1 text-2xl font-black">{n(r.volumetricEfficiency*100,1)}%</div></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="text-xs text-zinc-500">Gęstość powietrza</div><div className="mt-1 text-2xl font-black">{n(r.rho,3)}</div><div className="text-xs text-zinc-500">kg/m³</div></div></section>
 <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[.04] p-4"><h2 className="font-bold">Ważne: estymacja mocy</h2><p className="mt-2 text-sm text-zinc-300">To model orientacyjny. Typ wydechu zmienia szacowaną moc względem bazowego wariantu seryjnego. Nie zastępuje pomiaru z hamowni i nie należy traktować wyniku jako deklarowanej mocy silnika.</p></section>
 <section className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><h2 className="font-bold">Dolot</h2><div className="mt-4 space-y-4"><Meter label="Indeks prędkości gaźnika" value={r.carbVelocityIndex} min={0} max={250}/><Meter label="Indeks przepływu" value={r.carbFlowIndex} min={0} max={80}/><Meter label="Obciążenie zaworu" value={r.reedLoading} min={0} max={300}/><Meter label="Indeks fali dolotu" value={r.intakeWave} min={0} max={1000}/></div></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><h2 className="font-bold">Wydech</h2><div className="mt-4 space-y-4"><Meter label="Zapotrzebowanie wydechu" value={r.exhaustDemand} min={0} max={250}/><Meter label="Faza efektywna" value={r.portTime*360} min={0} max={360}/><Meter label="Częstotliwość impulsów" value={r.pulseHz} min={0} max={150}/><Meter label="Temperatura spalin" value={i.exhaustTemp} min={300} max={900}/></div></div></section>
 <section className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-bold">Warunki atmosferyczne</h2><p className="text-xs text-zinc-500">Zmiana gęstości powietrza zmienia warunki porównania.</p></div><div className="rounded-lg bg-white/5 px-3 py-2 text-sm">Indeks masy powietrza: <b>{n(r.airMassIndex,1)}%</b></div></div><div className="mt-4 h-5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-red-500" style={{width:clamp(r.airMassIndex,0,140)/1.4+"%"}}/></div></section>
 </div></div></div></main>;
}