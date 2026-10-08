"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteNav from "../../SiteNav";

type Inputs={bore:number;stroke:number;rpm:number;carb:number;reedArea:number;intakeLength:number;exhaustArea:number;exhaustTemp:number;};
type ExhaustProfile="stock"|"sport"|"race";
const defaults={bore:54,stroke:54,rpm:9000,carb:24,reedArea:520,intakeLength:90,exhaustArea:620,exhaustTemp:650,exhaustProfile:"stock" as ExhaustProfile};
const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
const n=(v:number,d=1)=>Number(v.toFixed(d));
function calc(i:Inputs){
 const bore=Math.max(1,i.bore),stroke=Math.max(1,i.stroke),rpm=Math.max(1,i.rpm);
 const disp=Math.PI/4*bore*bore*stroke/1000,sweptL=disp/1000,rho=1.204,sound=Math.sqrt(1.4*287.05*293.15),meanPiston=2*stroke*rpm/60/1000;
 const carbArea=Math.PI*Math.pow(Math.max(1,i.carb)/2,2),carbFlowIndex=carbArea*Math.sqrt(rho),carbVelocityIndex=(sweptL*rpm/120)/(carbArea/1e-6);
 const pulseHz=rpm/120,reedLoading=i.reedArea>0?(sweptL*rpm/120)/(i.reedArea/1e-6):0;
 const intakeWave=(sound/(4*Math.max(20,i.intakeLength)/1000))/pulseHz,exhaustDemand=i.exhaustArea>0?(sweptL*rpm/120)/(i.exhaustArea/1e-6):0;
 const airMassIndex=100;
 const exhaustBase={stock:.175,sport:.235,race:.285}[i.exhaustProfile];
 const exhaustPeak={stock:7200,sport:9300,race:11500}[i.exhaustProfile];
 const exhaustWidth={stock:5600,sport:5000,race:4200}[i.exhaustProfile];
 const peakDistance=Math.abs(rpm-exhaustPeak);
 const rpmBand=clamp(1-peakDistance/(exhaustWidth*1.55),.48,1);
 const targetCarb={stock:24,sport:30,race:34}[i.exhaustProfile];
 const carbRatio=i.carb/targetCarb;
 const carbFactor=clamp(1-0.13*Math.pow(Math.log(Math.max(.35,carbRatio))/Math.log(1.45),2),.78,1.04);
 const carbCapacity=clamp(carbFlowIndex/(Math.PI*Math.pow(targetCarb/2,2)*Math.sqrt(1.204)),.55,1.35);
 const highRpmNeed=clamp((rpm-exhaustPeak+1800)/1800,0,1);
 const carbHighRpmBonus=clamp(1+(carbCapacity-1)*.10*highRpmNeed,.92,1.04);
 const airFactor=1;
 const reedTarget={stock:430,sport:520,race:650}[i.exhaustProfile];
 const reedRatio=i.reedArea/Math.max(1,reedTarget);
 const reedFactor=clamp(1-0.08*Math.pow(Math.log(Math.max(.5,reedRatio))/Math.log(1.5),2),.86,1.02);
 const intakeTarget={stock:120,sport:105,race:90}[i.exhaustProfile];
 const intakeRatio=Math.max(.5,i.intakeLength/Math.max(1,intakeTarget));
 const intakeFactor=clamp(1-0.07*Math.pow(Math.log(intakeRatio)/Math.log(1.5),2),.86,1.02);
 const exhaustTarget={stock:560,sport:700,race:850}[i.exhaustProfile];
 const exhaustRatio=Math.max(.5,i.exhaustArea/Math.max(1,exhaustTarget));
 const exhaustAreaFactor=clamp(1-0.09*Math.pow(Math.log(exhaustRatio)/Math.log(1.5),2),.84,1.03);
 const tempTarget={stock:600,sport:650,race:700}[i.exhaustProfile];
 const tempFactor=clamp(1-0.025*Math.pow((i.exhaustTemp-tempTarget)/150,2),.94,1);
 const exhaustFactor=clamp(1-(peakDistance/exhaustWidth)*.10,.82,1);
 const sizeFactor=clamp(Math.pow(disp/125,.18),.72,1.12);
 const powerHp=disp*exhaustBase*rpmBand*carbFactor*carbHighRpmBonus*airFactor*reedFactor*intakeFactor*exhaustAreaFactor*tempFactor*exhaustFactor*sizeFactor;
 const torqueNm=powerHp*745.7/(rpm*2*Math.PI/60);
 const powerKw=powerHp/1.35962;
 const volumetricEfficiency=clamp(.58+(powerHp/disp)*.55,.42,.96);
 const imep=clamp(torqueNm*4*Math.PI/(disp/1e6*1e5),4.8,12.5);
 return {disp,rho,sound,meanPiston,carbArea,carbFlowIndex,carbVelocityIndex,pulseHz,reedLoading,intakeWave,exhaustDemand,airMassIndex,volumetricEfficiency,imep,torqueNm,powerKw,powerHp,carbFactor,reedFactor,intakeFactor,exhaustAreaFactor,tempFactor};
}
function PowerChart({i}:{i:typeof defaults}){const points=Array.from({length:17},(_,k)=>{const rpm=5500+k*500;const r=calc({...i,rpm});return {rpm,power:r.powerHp};});const max=Math.max(...points.map(p=>p.power));const w=760,h=270,pad=38;const sx=(v:number)=>pad+(v-5500)/(13500-5500)*(w-pad*1.5);const sy=(v:number)=>h-pad-(v/Math.max(10,max*1.12))*(h-pad*1.6);const path=points.map((p,n)=>`${n?"L":"M"} ${sx(p.rpm).toFixed(1)} ${sy(p.power).toFixed(1)}`).join(" ");return <section className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-bold">Wykres mocy</h2><p className="text-xs text-zinc-500">Orientacyjna krzywa mocy względem obrotów dla aktualnych parametrów.</p></div><div className="text-sm text-zinc-400">Peak: <b className="text-white">{n(max,1)} KM</b></div></div><div className="mt-4 overflow-x-auto"><svg viewBox={`0 0 ${w} ${h}`} className="min-w-[680px] w-full" role="img" aria-label="Wykres mocy względem RPM"><line x1={pad} y1={h-pad} x2={w-pad/2} y2={h-pad} stroke="currentColor" className="text-white/15"/><line x1={pad} y1={pad/2} x2={pad} y2={h-pad} stroke="currentColor" className="text-white/15"/>{[5500,6500,7500,8500,9500,10500,11500,12500,13500].map(v=><text key={v} x={sx(v)} y={h-14} textAnchor="middle" className="fill-zinc-500 text-[11px]">{v/1000}k</text>)}<path d={path} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="text-red-500"/>{points.map(p=><circle key={p.rpm} cx={sx(p.rpm)} cy={sy(p.power)} r="3" className="fill-red-500"/>)}</svg></div></section>}
function Meter({value,min,max,label}:{value:number;min:number;max:number;label:string}){const p=clamp((value-min)/(max-min)*100,0,100);return <div><div className="mb-1 flex justify-between text-xs text-zinc-400"><span>{label}</span><span>{n(value,1)}</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-red-500" style={{width:p+"%"}}/></div></div>}

export default function Tuning2T(){
 const [i,setI]=useState(defaults),[profile,setProfile]=useState<"street"|"sport"|"race">("sport");
 const set=(k:keyof typeof defaults,v:string)=>setI(x=>({...x,[k]:k==="exhaustProfile"?v:Number(v)||0})),r=useMemo(()=>calc(i),[i]);
 const profileData={street:{rpm:7000,desc:"szerszy zakres i spokojniejsza charakterystyka"},sport:{rpm:9000,desc:"środek między zakresem a mocą szczytową"},race:{rpm:11000,desc:"priorytet wysokich obrotów"}}[profile];
 const fields=[["bore","Średnica cylindra","mm"],["stroke","Skok tłoka","mm"],["rpm","RPM","obr/min"],["carb","Średnica gaźnika","mm"],["reedArea","Pow. zaworu","mm²"],["intakeLength","Dł. dolotu","mm"],["exhaustArea","Pow. wydechu","mm²"],["exhaustTemp","Temp. spalin","°C"]] as const;
 return <main className="min-h-screen bg-zinc-950 text-white"><div className="mx-auto max-w-7xl px-4 py-5"><SiteNav/><div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><div className="text-xs font-bold uppercase tracking-[.22em] text-red-400">Narzędzia / 2T</div><h1 className="mt-1 text-3xl font-black">Analizator tuningu 2T</h1><p className="mt-2 max-w-3xl text-sm text-zinc-400">Geometria, przepływ i orientacyjna estymacja osiągów zależna od wybranego typu wydechu.</p></div><Link href="/narzedzia" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">← Narzędzia</Link></div>
 <div className="mt-6 grid gap-4 lg:grid-cols-[330px_1fr]"><section className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><h2 className="font-bold">Parametry</h2><div className="mt-4 grid grid-cols-2 gap-3">{fields.map(([k,l,u])=><label key={k} className="text-xs text-zinc-400">{l}<span className="mt-1 flex items-center gap-1"><input type="number" value={i[k]} onChange={e=>set(k,e.target.value)} className="w-full min-w-0 rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-sm text-white outline-none focus:border-red-500/50"/><span className="text-[10px] text-zinc-600">{u}</span></span></label>)}</div><h2 className="mt-6 font-bold">Wydech</h2><div className="mt-2 grid grid-cols-3 gap-2">{(["stock","sport","race"] as const).map(x=><button type="button" key={x} onClick={()=>setI(v=>({...v,exhaustProfile:x}))} className={`rounded-lg px-2 py-2 text-xs ${i.exhaustProfile===x?"bg-red-500 text-white":"bg-white/5 text-zinc-400"}`}>{x==="stock"?"Seryjny":x==="sport"?"Sport":"Race"}</button>)}</div><p className="mt-2 text-xs text-zinc-500">Szacunkowy wpływ charakterystyki wydechu na napełnianie cylindra. To model porównawczy, nie wynik z hamowni.</p><h2 className="mt-6 font-bold">Profil</h2><div className="mt-2 grid grid-cols-3 gap-2">{(["street","sport","race"] as const).map(x=><button type="button" key={x} onClick={()=>setProfile(x)} className={`rounded-lg px-2 py-2 text-xs ${profile===x?"bg-red-500 text-white":"bg-white/5 text-zinc-400"}`}>{x==="street"?"Street":x==="sport"?"Sport":"Race"}</button>)}</div><p className="mt-2 text-xs text-zinc-500">{profileData.desc}; punkt odniesienia {profileData.rpm.toLocaleString("pl-PL")} RPM.</p></section>
 <div className="space-y-4">
 <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="text-xs text-zinc-500">Pojemność</div><div className="mt-1 text-2xl font-black">{n(r.disp,1)} cm³</div></div><div className="rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4"><div className="text-xs text-zinc-500">Est. moc</div><div className="mt-1 text-2xl font-black">{n(r.powerKw,1)} kW</div><div className="text-xs text-zinc-400">{n(r.powerHp,1)} KM</div></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="text-xs text-zinc-500">Moment</div><div className="mt-1 text-2xl font-black">{n(r.torqueNm,1)} Nm</div></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="text-xs text-zinc-500">VE modelu</div><div className="mt-1 text-2xl font-black">{n(r.volumetricEfficiency*100,1)}%</div></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="text-xs text-zinc-500">Gęstość powietrza</div><div className="mt-1 text-2xl font-black">{n(r.rho,3)}</div><div className="text-xs text-zinc-500">kg/m³</div></div></section>
  <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[.04] p-4"><h2 className="font-bold">Ważne: estymacja mocy</h2><p className="mt-2 text-sm text-zinc-300">To model orientacyjny. Typ wydechu zmienia szacowaną moc względem bazowego wariantu seryjnego. Nie zastępuje pomiaru z hamowni i nie należy traktować wyniku jako deklarowanej mocy silnika.</p></section>
 <section className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><h2 className="font-bold">Dolot</h2><div className="mt-4 space-y-4"><Meter label="Indeks prędkości gaźnika" value={r.carbVelocityIndex} min={0} max={250}/><Meter label="Indeks przepływu" value={r.carbFlowIndex} min={0} max={80}/><Meter label="Obciążenie zaworu" value={r.reedLoading} min={0} max={300}/><Meter label="Indeks fali dolotu" value={r.intakeWave} min={0} max={1000}/></div></div><div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><h2 className="font-bold">Wydech</h2><div className="mt-4 space-y-4"><Meter label="Zapotrzebowanie wydechu" value={r.exhaustDemand} min={0} max={250}/><Meter label="Dopasowanie pow. wydechu" value={r.exhaustAreaFactor*100} min={80} max={105}/><Meter label="Częstotliwość impulsów" value={r.pulseHz} min={0} max={150}/><Meter label="Temperatura spalin" value={i.exhaustTemp} min={300} max={900}/></div></div></section>
  <PowerChart i={i}/>
  <section className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><h2 className="font-bold">Jak czytać wynik</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Krzywa jest syntetycznym modelem porównawczym opartym na uproszczonych współczynnikach, a nie pomiarem ani zweryfikowaną symulacją przepływu. Używaj jej do porównywania zmian w obrębie tego samego modelu; nie traktuj wartości KM/Nm jako przewidywania rzeczywistych osiągów.</p></section>
 </div></div></div></main>;
}