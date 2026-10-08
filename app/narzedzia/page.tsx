'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteNav from "../SiteNav";

type Inputs = {
  bore:number; stroke:number; cylinders:number; rpm:number; exhaustOpen:number; exhaustClose:number; targetReturn:number;
  exhaustPortDiameter:number; exhaustPortHeight:number; headerDiameter:number; egt:number; gamma:number;
  diffuser1:number; diffuser2:number; diffuser3:number; baffleAngle:number; bellyRatio:number;
  stingerRatio:number; stingerLengthRatio:number; silencerCore:number; wall:number;
};
const defaults:Inputs={
  bore:54,stroke:54,cylinders:1,rpm:9000,exhaustOpen:190,exhaustClose:550,targetReturn:500,
  exhaustPortDiameter:28,exhaustPortHeight:24,headerDiameter:28,egt:650,gamma:1.35,
  diffuser1:5,diffuser2:7,diffuser3:9,baffleAngle:11,bellyRatio:2.5,stingerRatio:.60,
  stingerLengthRatio:12,silencerCore:18,wall:1
};
const round=(v:number,d=1)=>Number(v.toFixed(d));
const rad=(v:number)=>v*Math.PI/180;
const cone=(a:number,b:number,included:number)=>Math.abs(b-a)/2/Math.tan(rad(included/2));
const coneOld=(a:number,b:number,angle:number)=>Math.abs(b-a)/2/Math.tan(rad(angle));
const label=(a:string,u:string)=><span className="mb-2 flex items-center justify-between text-xs font-medium text-zinc-400"><span>{a}</span><span className="text-zinc-600">{u}</span></span>;

export default function ToolsPage(){
 const [i,setI]=useState(defaults);
 const set=(k:keyof Inputs,v:string)=>setI(x=>({...x,[k]:Number(v)||0}));
 const r=useMemo(()=>{
  const wave=Math.sqrt(Math.max(.1,i.gamma)*287*(i.egt+273.15));
  const available=Math.max(20,i.targetReturn-i.exhaustOpen);
  const tuned=wave*available/(12*Math.max(1,i.rpm))*1000;
  const d1=Math.max(1,i.headerDiameter||i.exhaustPortDiameter),d2=d1*Math.sqrt(1.55),d3=d1*Math.sqrt(3.35),dmax=d1*Math.max(1.1,i.bellyRatio);
  const l1=cone(d1,d2,i.diffuser1),l2=cone(d2,d3,i.diffuser2),l3=cone(d3,dmax,i.diffuser3);
  const belly=Math.max(20,tuned*.10),stinger=Math.max(3,dmax*i.stingerRatio), baffle=cone(dmax,stinger,i.baffleAngle);
  const stingerLength=stinger*Math.max(3,i.stingerLengthRatio), header=Math.max(30,tuned-l1-l2-l3-belly-baffle);
  const portArea=Math.PI*Math.pow(i.exhaustPortDiameter/2,2),portRectArea=Math.max(0,i.exhaustPortDiameter*i.exhaustPortHeight);
  const effectivePortArea=Math.max(portArea,portRectArea),bellyAreaRatio=(dmax/d1)**2,stingerAreaRatio=(stinger/dmax)**2,total=header+l1+l2+l3+belly+baffle+stingerLength,balance=tuned-total;
  return {wave,available,tuned,d1,d2,d3,dmax,l1,l2,l3,belly,baffle,stinger,stingerLength,header,
    disp:Math.PI/4*i.bore*i.bore*i.stroke*i.cylinders/1000,ratio:(dmax/d1)**2,portArea,effectivePortArea,bellyAreaRatio,stingerAreaRatio,total,balance};
 },[i]);
 const seg:Array<[string,number,number,number]>=[["Rura wlotowa",r.header,r.d1,r.d1],["Dyfuzor 1",r.l1,r.d1,r.d2],["Dyfuzor 2",r.l2,r.d2,r.d3],["Dyfuzor 3",r.l3,r.d3,r.dmax],["Belly",r.belly,r.dmax,r.dmax],["Przeciwstożek",r.baffle,r.dmax,r.stinger],["Stinger",r.stingerLength,r.stinger,r.stinger]];
 return <main className="min-h-screen bg-[#090909] text-white"><div className="mx-auto max-w-7xl px-5 py-5 lg:px-8"><SiteNav/>
  <div className="mt-8"><Link href="/" className="text-sm text-zinc-500 hover:text-white">← MotoHub</Link>
   <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.3em] text-red-500">MotoHub / Narzędzia</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">2T Exhaust Lab</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">Zaawansowany kalkulator geometrii komory rezonansowej 2T. Długość strojoną liczy z czasu otwarcia portu, temperatury gazów i obrotów docelowych, a następnie rozkłada ją na sekcje stożkowe.</p></div><div className="rounded-2xl border border-amber-500/20 bg-amber-500/[.06] px-4 py-3 text-xs leading-5 text-amber-200"><b>Projekt wstępny</b><br/>Nie zastępuje pomiarów i testów na hamowni.</div></div>
  </div>
  <div className="mt-8 grid gap-5 xl:grid-cols-[360px_1fr]">
   <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold">Parametry silnika</h2><p className="mt-1 text-xs text-zinc-500">Najlepiej wpisywać wartości zmierzone.</p></div><button onClick={()=>setI(defaults)} className="text-xs text-zinc-500 hover:text-white">Reset</button></div>
    <div className="mt-5 space-y-4">
     <label>{label("Średnica cylindra","mm")}<input type="number" value={i.bore} onChange={e=>set("bore",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none focus:border-red-500/60"/></label>
     <label>{label("Skok tłoka","mm")}<input type="number" value={i.stroke} onChange={e=>set("stroke",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none focus:border-red-500/60"/></label>
     <label>{label("Liczba cylindrów","szt.")}<input type="number" value={i.cylinders} onChange={e=>set("cylinders",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none focus:border-red-500/60"/></label>
     <label>{label("Obroty szczytu mocy","rpm")}<input type="number" value={i.rpm} onChange={e=>set("rpm",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none focus:border-red-500/60"/></label>
     <div className="grid grid-cols-2 gap-3"><label>{label("Otwarcie wydechu","° CA")}<input type="number" value={i.exhaustOpen} onChange={e=>set("exhaustOpen",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none"/></label><label>{label("Zamknięcie","° CA")}<input type="number" value={i.exhaustClose} onChange={e=>set("exhaustClose",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none" /></label></div>
     <label>{label("Docelowy powrót fali","° CA")}<input type="number" value={i.targetReturn} onChange={e=>set("targetReturn",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none" /></label>
     <div className="grid grid-cols-2 gap-3"><label>{label("Śr. portu","mm")}<input type="number" step=".1" value={i.exhaustPortDiameter} onChange={e=>set("exhaustPortDiameter",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white" /></label><label>{label("Wysokość portu","mm")}<input type="number" step=".1" value={i.exhaustPortHeight} onChange={e=>set("exhaustPortHeight",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white" /></label></div>
     <label>{label("Średnica headera","mm")}<input type="number" step=".1" value={i.headerDiameter} onChange={e=>set("headerDiameter",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white" /></label>
     <div className="grid grid-cols-2 gap-3"><label>{label("EGT","°C")}<input type="number" value={i.egt} onChange={e=>set("egt",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none" /></label><label>{label("Wykładnik γ","–")}<input type="number" step=".01" value={i.gamma} onChange={e=>set("gamma",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none" /></label></div>
     <div className="border-t border-white/10 pt-4"><p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Geometria stożków</p><div className="grid grid-cols-3 gap-2"><label>{label("D1","°")}<input type="number" step=".1" value={i.diffuser1} onChange={e=>set("diffuser1",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white"/></label><label>{label("D2","°")}<input type="number" step=".1" value={i.diffuser2} onChange={e=>set("diffuser2",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white"/></label><label>{label("D3","°")}<input type="number" step=".1" value={i.diffuser3} onChange={e=>set("diffuser3",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white"/></label></div><div className="mt-3 grid grid-cols-2 gap-3"><label>{label("Kąt przeciwstożka","°")}<input type="number" step=".1" value={i.baffleAngle} onChange={e=>set("baffleAngle",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label><label>{label("Belly / header","×")}<input type="number" step=".05" value={i.bellyRatio} onChange={e=>set("bellyRatio",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label></div>
     <div className="mt-3 grid grid-cols-2 gap-3"><label>{label("Stinger / Dmax","×")}<input type="number" step=".01" value={i.stingerRatio} onChange={e=>set("stingerRatio",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label><label>{label("Stinger / Ø","×")}<input type="number" step=".5" value={i.stingerLengthRatio} onChange={e=>set("stingerLengthRatio",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label></div>
     <div className="mt-3 grid grid-cols-2 gap-3"><label>{label("Rdzeń tłumika","mm")}<input type="number" step=".5" value={i.silencerCore} onChange={e=>set("silencerCore",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label><label>{label("Ścianka","mm")}<input type="number" step=".1" value={i.wall} onChange={e=>set("wall",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label></div></div>
    </div>
   </section>
   <section className="space-y-5"><div className="grid gap-3 sm:grid-cols-4">{[["Pojemność",round(r.disp,1)+" cm³"],["Prędkość fali",round(r.wave)+" m/s"],["Długość strojona",round(r.tuned,1)+" mm"],["Dmax / D1",round(r.ratio,2)+"×"]].map(x=><div key={x[0]} className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs text-zinc-500">{x[0]}</p><p className="mt-1 text-xl font-black">{x[1]}</p></div>)}</div>
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]">
      <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold">Podgląd 3D układu wydechowego</h2><p className="mt-1 text-xs text-zinc-500">Proporcjonalny model stożków z perspektywą. Suwak zmienia kąt kamery.</p></div><input aria-label="Kąt widoku 3D" type="range" min="-65" max="65" defaultValue="28" className="w-32 accent-red-500" /></div>
      <div className="overflow-x-auto p-3 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.07),transparent_60%)]">
        <svg viewBox="0 0 1100 360" className="min-w-[850px] w-full" aria-label="Trójwymiarowy model wydechu 2T">
          <defs><linearGradient id="metal3d" x1="0" x2="1"><stop offset="0" stopColor="#3f3f46"/><stop offset=".45" stopColor="#e4e4e7"/><stop offset=".72" stopColor="#71717a"/><stop offset="1" stopColor="#27272a"/></linearGradient><linearGradient id="hot3d" x1="0" x2="1"><stop offset="0" stopColor="#7f1d1d"/><stop offset=".5" stopColor="#ef4444"/><stop offset="1" stopColor="#991b1b"/></linearGradient></defs>
          <ellipse cx="560" cy="305" rx="430" ry="26" fill="rgba(0,0,0,.38)"/>
          {(()=>{let x=40;const scale=920/Math.max(r.total,1);const seg=[["Header",r.header,r.d1,r.d1],["Diffuser 1",r.l1,r.d1,r.d2],["Diffuser 2",r.l2,r.d2,r.d3],["Diffuser 3",r.l3,r.d3,r.dmax],["Belly",r.belly,r.dmax,r.dmax],["Baffle",r.baffle,r.dmax,r.stinger],["Stinger",r.stingerLength,r.stinger,r.stinger]] as [string,number,number,number][];return seg.map(([name,len,a,b],idx)=>{const w=Math.max(35,len*scale),x1=x,x2=x+w;const rr=(xx:number,d:number)=>Array.from({length:12},(_,n)=>{const t=n*Math.PI*2/12,y=Math.cos(t)*d/2,z=Math.sin(t)*d/2;return [xx,y,z] as const});const p=rr(x1,a),q=rr(x2,b);x=x2;return <g key={name}>{q.map((pt,k)=>{const n=q[(k+1)%12],p0=p[k],n0=p[(k+1)%12];const sx=(v:number,y:number)=>v+y*1.55,sy=(y:number,z:number)=>215+y*.48-z*1.55;return <polygon key={k} points={sx(p0[0],p0[1])+","+sy(p0[1],p0[2])+" "+sx(n0[0],n0[1])+","+sy(n0[1],n0[2])+" "+sx(n[0],n[1])+","+sy(n[1],n[2])+" "+sx(pt[0],pt[1])+","+sy(pt[1],pt[2])} fill={idx===4?"url(#hot3d)":"url(#metal3d)"} opacity={k<6?.96:.58} stroke="rgba(0,0,0,.22)" strokeWidth=".8"/>})}<text x={(x1+x2)/2} y="335" textAnchor="middle" fill="rgba(255,255,255,.55)" fontSize="10">{name}</text></g>})})()}
          <line x1="45" y1="270" x2="1050" y2="270" stroke="rgba(255,255,255,.08)"/>
        </svg>
      </div>
    </div><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-bold">Wymiary do wykonania</h2><div className="mt-4 overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-sm"><thead className="bg-white/[.04] text-xs text-zinc-500"><tr><th className="px-3 py-3 text-left">Sekcja</th><th className="px-3 py-3 text-right">Długość</th><th className="px-3 py-3 text-right">Ø pocz.</th><th className="px-3 py-3 text-right">Ø końc.</th></tr></thead><tbody>{seg.map(s=><tr key={String(s[0])} className="border-t border-white/10"><td className="px-3 py-3 font-medium">{s[0]}</td><td className="px-3 py-3 text-right font-mono">{round(Number(s[1]))} mm</td><td className="px-3 py-3 text-right font-mono">{round(Number(s[2]))}</td><td className="px-3 py-3 text-right font-mono">{round(Number(s[3]))}</td></tr>)}</tbody></table></div></div>
     <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-bold">Kontrola</h2><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-zinc-500">Długość strojenia</span><b>{round(r.tuned)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">Rura wlotowa</span><b>{round(r.header)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">Stinger</span><b>Ø {round(r.stinger)} × {round(r.stingerLength)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">EGT</span><b>{round(i.egt)}°C</b></div></div><div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-xs leading-5 text-zinc-300"><b className="text-white">Ważne:</b> to model akustyczny i proporcjonalny punktu startowego. Port timing, temperatura, kształt kanału, króciec, tłumik i straty przepływu zmieniają rzeczywisty wynik.</div></div></div>
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5"><h2 className="font-bold">Model i założenia</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Długość akustyczna korzysta z przedziału od otwarcia portu do docelowego powrotu fali. Prędkość fali jest przybliżana przez a = √(γRT). Geometria stożków, belly i stinger są parametryczne, dlatego wynik jest punktem startowym do dalszego strojenia.</p><p className="mt-3 text-xs text-zinc-600">Model nie jest pełną symulacją 1D gas-dynamics: temperatura wzdłuż układu, straty, korekta efektywnej długości, tłumik i dokładny kształt portu wymagają dalszej walidacji.</p></div>
   </section>
  </div>
 </div></main>;
}
