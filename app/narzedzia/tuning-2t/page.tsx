"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteNav from "../../SiteNav";

type Inputs={
 bore:number; stroke:number; rpm:number; carb:number; airTemp:number; pressure:number; altitude:number;
 portDuration:number; reedArea:number; intakeLength:number; exhaustArea:number; exhaustTemp:number;
};

const defaults:Inputs={
 bore:54,stroke:54,rpm:9000,carb:24,airTemp:20,pressure:1013,altitude:0,
 portDuration:188,reedArea:520,intakeLength:90,exhaustArea:620,exhaustTemp:650
};

const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
const n=(v:number,d=1)=>Number(v.toFixed(d));

function calc(i:Inputs){
 const bore=Math.max(1,i.bore), stroke=Math.max(1,i.stroke), rpm=Math.max(1,i.rpm);
 const disp=Math.PI/4*bore*bore*stroke/1000;
 const sweptL=disp/1000;
 const T=i.airTemp+273.15;
 const R=287.05;
 const rho=Math.max(.2,(i.pressure*100)/(R*T));
 const sound=Math.sqrt(1.4*R*T);
 const meanPiston=2*stroke*rpm/60/1000;
 const carbArea=Math.PI*Math.pow(Math.max(1,i.carb)/2,2);
 const carbFlowIndex=carbArea*Math.sqrt(rho);
 const carbVelocityIndex=(sweptL*rpm/120)/(carbArea/1e6);
 const portTime=(360-i.portDuration)/360;
 const pulseHz=rpm/120;
 const reedLoading=i.reedArea>0?(sweptL*rpm/120)/(i.reedArea/1e6):0;
 const intakeWave=(sound/(4*Math.max(20,i.intakeLength)/1000))/pulseHz;
 const exhaustDemand=i.exhaustArea>0?(sweptL*rpm/120)/(i.exhaustArea/1e6):0;
 const densityPct=(rho/1.204)*100;
 const altitudeFactor=Math.pow(Math.max(.2,1-i.altitude/9000),5.255);
 const pressureFactor=i.pressure/1013.25;
 const airMassIndex=densityPct*pressureFactor;
 return {disp,rho,sound,meanPiston,carbArea,carbFlowIndex,carbVelocityIndex,portTime,pulseHz,reedLoading,intakeWave,exhaustDemand,densityPct,altitudeFactor,pressureFactor,airMassIndex};
}

function Meter({value,min,max,label}:{value:number;min:number;max:number;label:string}){
 const p=clamp((value-min)/(max-min)*100,0,100);
 return <div>
  <div className="mb-1 flex justify-between text-xs text-zinc-400"><span>{label}</span><span>{n(value,1)}</span></div>
  <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-red-500" style={{width:p+"%"}}/></div>
 </div>
}

export default function Tuning2T(){
 const [i,setI]=useState(defaults);
 const [profile,setProfile]=useState<"street"|"sport"|"race">("sport");
 const set=(k:keyof Inputs,v:string)=>setI(x=>({...x,[k]:Number(v)||0}));
 const r=useMemo(()=>calc(i),[i]);
 const profileData={
  street:{rpm:7000,desc:"szerszy zakres i spokojniejsza charakterystyka"},
  sport:{rpm:9000,desc:"środek między zakresem a mocą szczytową"},
  race:{rpm:11000,desc:"priorytet wysokich obrotów"}
 }[profile];

 return <main className="min-h-screen bg-zinc-950 text-white">
  <div className="mx-auto max-w-7xl px-4 py-5">
   <SiteNav/>
   <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
    <div><div className="text-xs font-bold uppercase tracking-[.22em] text-red-400">Narzędzia / 2T</div><h1 className="mt-1 text-3xl font-black">Analizator tuningu 2T</h1><p className="mt-2 max-w-3xl text-sm text-zinc-400">Zaawansowana analiza geometrii, przepływu, warunków atmosferycznych i zakresu pracy silnika.</p></div>
    <Link href="/narzedzia" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5">← Wszystkie narzędzia</Link>
   </div>

   <div className="mt-6 grid gap-4 lg:grid-cols-[330px_1fr]">
    <section className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
     <h2 className="font-bold">Geometria silnika</h2>
     <div className="mt-4 grid grid-cols-2 gap-3">
      {([["bore","Średnica cylindra","mm"],["stroke","Skok tłoka","mm"],["rpm","RPM","obr/min"],["carb","Średnica gaźnika","mm"],["portDuration","Czas wydechu","°"],["reedArea","Pow. zaworu","mm²"],["intakeLength","Dł. dolotu","mm"],["exhaustArea","Pow. wydechu","mm²"],["exhaustTemp","Temp. spalin","°C"],["airTemp","Temp. powietrza","°C"],["pressure","Ciśnienie","hPa"],["altitude","Wysokość","m"]] as const).map(([k,l,u])=>
       <label key={k} className="text-xs text-zinc-400">{l}<span className="mt-1 flex items-center gap-1"><input type="number" value={i[k]} onChange={e=>set(k,e.target.value)} className="w-full min-w-0 rounded-lg border border-white/10 bg-black/20 px-2 py-2 text-sm text-white outline-none focus:border-red-500/50"/><span className="text-[10px] text-zinc-600">{u}</span></span></label>
      )}
     </div>
     <h2 className="mt-6 font-bold">Profil pracy</h2>
     <div className="mt-2 grid grid-cols-3 gap-2">{(["street","sport","race"] as const).map(x=><button type="button" key={x} onClick={()=>setProfile(x)} className={`rounded-lg px-2 py-2 text-xs ${profile===x?"bg-red-500 text-white":"bg-white/5 text-zinc-400"}`}>{x==="street"?"Street":x==="sport"?"Sport":"Race"}</button>)}</div>
     <p className="mt-2 text-xs text-zinc-500">{profileData.desc}; punkt odniesienia: {profileData.rpm.toLocaleString("pl-PL")} RPM.</p>
    </section>

    <div className="space-y-4">
     <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="text-xs text-zinc-500">Pojemność</div><div className="mt-1 text-2xl font-black">{n(r.disp,1)} cm³</div></div>
      <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="text-xs text-zinc-500">Gęstość powietrza</div><div className="mt-1 text-2xl font-black">{n(r.rho,3)} kg/m³</div></div>
      <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="text-xs text-zinc-500">Prędkość dźwięku</div><div className="mt-1 text-2xl font-black">{n(r.sound,0)} m/s</div></div>
      <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><div className="text-xs text-zinc-500">Średnia prędkość tłoka</div><div className="mt-1 text-2xl font-black">{n(r.meanPiston,1)} m/s</div></div>
     </section>

     <section className="grid gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><h2 className="font-bold">Analiza dolotu</h2><div className="mt-4 space-y-4"><Meter label="Indeks prędkości w gaźniku" value={r.carbVelocityIndex} min={0} max={250}/><Meter label="Indeks przepływu gaźnika" value={r.carbFlowIndex} min={0} max={80}/><Meter label="Obciążenie zaworu" value={r.reedLoading} min={0} max={300}/><Meter label="Indeks długości fali dolotu" value={r.intakeWave} min={0} max={1000}/></div></div>
      <div className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><h2 className="font-bold">Analiza wydechu</h2><div className="mt-4 space-y-4"><Meter label="Indeks zapotrzebowania wydechu" value={r.exhaustDemand} min={0} max={250}/><Meter label="Czas efektywnej fazy" value={r.portTime*360} min={0} max={360}/><Meter label="Częstotliwość impulsów" value={r.pulseHz} min={0} max={150}/><Meter label="Temperatura spalin" value={i.exhaustTemp} min={300} max={900}/></div></div>
     </section>

     <section className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-bold">Warunki atmosferyczne</h2><p className="text-xs text-zinc-500">Model gęstości powietrza — wynik służy do porównywania konfiguracji, nie jest gotową nastawą.</p></div><div className="rounded-lg bg-white/5 px-3 py-2 text-sm">Indeks masy powietrza: <b>{n(r.airMassIndex,1)}%</b></div></div>
      <div className="mt-4 h-5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-red-500" style={{width:clamp(r.airMassIndex,0,140)/1.4+"%"}}/></div>
      <div className="mt-2 flex justify-between text-[11px] text-zinc-600"><span>mniej gęste</span><span>warunki odniesienia</span><span>gęstsze</span></div>
     </section>

     <section className="rounded-2xl border border-red-500/20 bg-red-500/[.04] p-4">
      <h2 className="font-bold">Interpretacja</h2>
      <ul className="mt-3 space-y-2 text-sm text-zinc-300">
       <li>• Pojemność wynika z geometrii cylindra; zmiana średnicy lub skoku wpływa na całe zapotrzebowanie objętościowe.</li>
       <li>• Większa średnica gaźnika zmniejsza ograniczenie przepływu, ale sama średnica nie określa optymalnej charakterystyki silnika.</li>
       <li>• Wzrost temperatury i spadek ciśnienia zmieniają gęstość powietrza, więc dwie identyczne konfiguracje mogą pracować w innych warunkach.</li>
       <li>• Czas otwarcia wydechu, powierzchnia kanałów i zakres RPM powinny być analizowane razem, a nie jako pojedyncza liczba.</li>
      </ul>
     </section>
    </div>
   </div>
  </div>
 </main>;
}
