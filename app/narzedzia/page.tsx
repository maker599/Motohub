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
const label=(a:string,u:string)=><span className="mb-2 flex items-center justify-between text-xs font-medium text-zinc-400"><span>{a}</span><span className="text-zinc-600">{u}</span></span>;

export default function ToolsPage(){
 const [i,setI]=useState(defaults);
 const [bend,setBend]=useState(0);
 const set=(k:keyof Inputs,v:string)=>setI(x=>({...x,[k]:v===""?0:Number(v)}));
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
 const seg:Array<[string,number,number,number]>=[
  ["Rura wlotowa",r.header,r.d1,r.d1],
  ["Dyfuzor 1",r.l1,r.d1,r.d2],
  ["Dyfuzor 2",r.l2,r.d2,r.d3],
  ["Dyfuzor 3",r.l3,r.d3,r.dmax],
  ["Belly",r.belly,r.dmax,r.dmax],
  ["Przeciwstożek",r.baffle,r.dmax,r.stinger],
  ["Stinger",r.stingerLength,r.stinger,r.stinger]
 ];
 const profile=useMemo(()=>{
  const total=Math.max(r.total,1);
  const n=220;
  const pts:{x:number;y:number;w:number;s:number}[]=[];
  const widthAt=(s:number)=>{
   let acc=0;
   for(const [,len,a,b] of seg){
    if(s<=acc+len){
     const t=(s-acc)/Math.max(len,1);
     return (a+(b-a)*t)*.88;
    }
    acc+=len;
   }
   return r.stinger*.88;
  };

  // Realistic 2T layout: the cylinder-side header wraps down and back in a
  // compact U before the expansion chamber continues away from the cylinder.
  const uLen=Math.min(total*.30,Math.max(110,total*.24));
  const uRadius=Math.max(45,uLen/2);
  const bodyStart=uLen;
  const bodyLen=Math.max(1,total-bodyStart);
  for(let k=0;k<=n;k++){
   const s=total*k/n;
   let x:number,y:number;
   if(s<=uLen){
    const t=s/uLen;
    const a=Math.PI*t;
    x=uRadius*(1-Math.cos(a));
    y=-uRadius*Math.sin(a);
   }else{
    const q=(s-bodyStart)/bodyLen;
    x=2*uRadius + bodyLen*q;
    y=0;
   }
   pts.push({x,y,w:widthAt(s),s});
  }

  const minX=Math.min(...pts.map(p=>p.x-p.w)),maxX=Math.max(...pts.map(p=>p.x+p.w));
  const minY=Math.min(...pts.map(p=>p.y-p.w)),maxY=Math.max(...pts.map(p=>p.y+p.w));
  const pad=80;
  const scale=Math.min(1180/Math.max(maxX-minX,1),560/Math.max(maxY-minY,1));
  const tx=(x:number)=>pad+(x-minX)*scale;
  const ty=(y:number)=>pad+(maxY-y)*scale;
  const outlineTop:string[]=[];
  const outlineBottom:string[]=[];
  for(let k=0;k<pts.length;k++){
   const p=pts[k],prev=pts[Math.max(0,k-1)],next=pts[Math.min(n,k+1)];
   const dx=next.x-prev.x,dy=next.y-prev.y,len=Math.hypot(dx,dy)||1;
   const nx=-dy/len,ny=dx/len;
   outlineTop.push(`${tx(p.x+nx*p.w)},${ty(p.y+ny*p.w)}`);
   outlineBottom.push(`${tx(p.x-nx*p.w)},${ty(p.y-ny*p.w)}`);
  }
  const outline=[...outlineTop,...outlineBottom.reverse()].join(" ");
  const center=pts.map(p=>`${tx(p.x)},${ty(p.y)}`).join(" ");
  const seamPoints:number[]=[];
  let acc=0;
  for(const [,len] of seg){acc+=len;seamPoints.push(acc);}
  const seams=seamPoints.slice(0,-1).map(s=>{
   const k=Math.round(s/total*n),p=pts[k],prev=pts[Math.max(0,k-1)],next=pts[Math.min(n,k+1)];
   const dx=next.x-prev.x,dy=next.y-prev.y,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
   return {x1:tx(p.x+nx*p.w),y1:ty(p.y+ny*p.w),x2:tx(p.x-nx*p.w),y2:ty(p.y-ny*p.w)};
  });
  return {outline,center,seams,viewBox:`0 0 ${Math.max(1320,(maxX-minX)*scale+pad*2)} ${Math.max(700,(maxY-minY)*scale+pad*2)}`};
 },[r,bend]);
 return <main className="min-h-screen bg-[#090909] text-white"><div className="mx-auto max-w-7xl px-5 py-5 lg:px-8"><SiteNav/>
  <div className="mt-8"><Link href="/" className="text-sm text-zinc-500 hover:text-white">← MotoHub</Link>
   <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[.3em] text-red-500">MotoHub / Narzędzia</p><h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">2T Exhaust Lab</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">Zaawansowany kalkulator geometrii komory rezonansowej 2T. Długość strojoną liczy z czasu otwarcia portu, temperatury gazów i obrotów docelowych, a następnie rozkłada ją na sekcje stożkowe.</p></div><div className="rounded-2xl border border-amber-500/20 bg-amber-500/[.06] px-4 py-3 text-xs leading-5 text-amber-200"><b>Projekt wstępny</b><br/>Nie zastępuje pomiarów i testów na hamowni.</div></div>
  </div>
  <div className="mt-8 grid gap-5 xl:grid-cols-[360px_1fr]">
   <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold">Parametry silnika</h2><p className="mt-1 text-xs text-zinc-500">Najlepiej wpisywać wartości zmierzone.</p></div><button onClick={()=>setI(defaults)} className="text-xs text-zinc-500 hover:text-white">Reset</button></div>
    <div className="mt-5 space-y-4">
     <label>{label("Średnica cylindra","mm")}<input type="number" value={i.bore || ""} onChange={e=>set("bore",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none focus:border-red-500/60"/></label>
     <label>{label("Skok tłoka","mm")}<input type="number" value={i.stroke || ""} onChange={e=>set("stroke",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none focus:border-red-500/60"/></label>
     <label>{label("Liczba cylindrów","szt.")}<input type="number" value={i.cylinders || ""} onChange={e=>set("cylinders",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none focus:border-red-500/60"/></label>
     <label>{label("Obroty szczytu mocy","rpm")}<input type="number" value={i.rpm || ""} onChange={e=>set("rpm",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none focus:border-red-500/60"/></label>
     <div className="grid grid-cols-2 gap-3"><label>{label("Otwarcie wydechu","° CA")}<input type="number" value={i.exhaustOpen || ""} onChange={e=>set("exhaustOpen",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none"/></label><label>{label("Zamknięcie","° CA")}<input type="number" value={i.exhaustClose || ""} onChange={e=>set("exhaustClose",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none" /></label></div>
     <label>{label("Docelowy powrót fali","° CA")}<input type="number" value={i.targetReturn || ""} onChange={e=>set("targetReturn",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none" /></label>
     <div className="grid grid-cols-2 gap-3"><label>{label("Śr. portu","mm")}<input type="number" step=".1" value={i.exhaustPortDiameter || ""} onChange={e=>set("exhaustPortDiameter",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white" /></label><label>{label("Wysokość portu","mm")}<input type="number" step=".1" value={i.exhaustPortHeight || ""} onChange={e=>set("exhaustPortHeight",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white" /></label></div>
     <label>{label("Średnica headera","mm")}<input type="number" step=".1" value={i.headerDiameter || ""} onChange={e=>set("headerDiameter",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white" /></label>
     <div className="grid grid-cols-2 gap-3"><label>{label("EGT","°C")}<input type="number" value={i.egt || ""} onChange={e=>set("egt",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none" /></label><label>{label("Wykładnik γ","–")}<input type="number" step=".01" value={i.gamma || ""} onChange={e=>set("gamma",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none" /></label></div>
     <div className="border-t border-white/10 pt-4"><p className="mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500">Geometria stożków</p><div className="grid grid-cols-3 gap-2"><label>{label("D1","°")}<input type="number" step=".1" value={i.diffuser1 || ""} onChange={e=>set("diffuser1",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white"/></label><label>{label("D2","°")}<input type="number" step=".1" value={i.diffuser2 || ""} onChange={e=>set("diffuser2",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white"/></label><label>{label("D3","°")}<input type="number" step=".1" value={i.diffuser3 || ""} onChange={e=>set("diffuser3",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white"/></label></div><div className="mt-3 grid grid-cols-2 gap-3"><label>{label("Kąt przeciwstożka","°")}<input type="number" step=".1" value={i.baffleAngle || ""} onChange={e=>set("baffleAngle",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label><label>{label("Belly / header","×")}<input type="number" step=".05" value={i.bellyRatio || ""} onChange={e=>set("bellyRatio",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label></div>
     <div className="mt-3 grid grid-cols-2 gap-3"><label>{label("Stinger / Dmax","×")}<input type="number" step=".01" value={i.stingerRatio || ""} onChange={e=>set("stingerRatio",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label><label>{label("Stinger / Ø","×")}<input type="number" step=".5" value={i.stingerLengthRatio || ""} onChange={e=>set("stingerLengthRatio",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label></div>
     <div className="mt-3 grid grid-cols-2 gap-3"><label>{label("Rdzeń tłumika","mm")}<input type="number" step=".5" value={i.silencerCore || ""} onChange={e=>set("silencerCore",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label><label>{label("Ścianka","mm")}<input type="number" step=".1" value={i.wall || ""} onChange={e=>set("wall",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label></div></div>
    </div>
   </section>
   <section className="space-y-5"><div className="grid gap-3 sm:grid-cols-4">{[["Pojemność",round(r.disp,1)+" cm³"],["Prędkość fali",round(r.wave)+" m/s"],["Długość strojona",round(r.tuned,1)+" mm"],["Dmax / D1",round(r.ratio,2)+"×"]].map(x=><div key={x[0]} className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs text-zinc-500">{x[0]}</p><p className="mt-1 text-xl font-black">{x[1]}</p></div>)}</div>
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]">
      <div className="border-b border-white/10 px-5 py-4"><div className="flex items-center justify-between"><div><h2 className="font-bold">Geometria montażowa</h2><p className="mt-1 text-xs text-zinc-500">Suwak reguluje ciasność układu; część przy cylindrze zawija się w kompaktowe U, a belly wychodzi z powrotem wzdłuż osi.</p></div><span className="font-mono text-xs text-zinc-400">{bend}°</span></div><input aria-label="Stopień wygięcia wydechu" type="range" min="0" max="90" value={Math.min(90,bend)} onChange={e=>setBend(Number(e.target.value))} className="mt-4 w-full accent-red-500"/></div>
      <div className="border-b border-white/10 px-5 py-4"><h2 className="font-bold">Podgląd 2D komory</h2><p className="mt-1 text-xs text-zinc-500">Widok warsztatowy inspirowany typowymi komorami 2T: header przy cylindrze zawija się w U, potem profil przechodzi przez belly i wraca do przeciwstożka oraz stinger.</p></div>
      <div className="overflow-hidden p-2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.07),transparent_65%)]">
       <div className="relative min-h-[620px] overflow-hidden rounded-2xl border border-white/10 bg-[#070707]">
        <svg viewBox={profile.viewBox} className="h-auto min-h-[620px] w-full" role="img" aria-label="Dwuwymiarowy schemat komory rezonansowej 2T">
         <defs>
          <linearGradient id="pipeMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d7d9dc"/><stop offset=".22" stopColor="#6f7278"/><stop offset=".5" stopColor="#222428"/><stop offset=".78" stopColor="#85888e"/><stop offset="1" stopColor="#17181b"/></linearGradient>
          <linearGradient id="bellyHot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9b2920"/><stop offset=".45" stopColor="#e55335"/><stop offset="1" stopColor="#4c0e0c"/></linearGradient>
          <filter id="pipeShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity=".65"/></filter>
         </defs>
         <rect width="100%" height="100%" fill="#070707"/>
         <polyline points={profile.outline} fill="url(#pipeMetal)" stroke="#080808" strokeWidth="3" strokeLinejoin="round" filter="url(#pipeShadow)"/>
         <polyline points={profile.outline} fill="none" stroke="#d9dadd" strokeOpacity=".22" strokeWidth="1.2"/>
         <polyline points={profile.center} fill="none" stroke="#fff" strokeOpacity=".14" strokeDasharray="5 7" strokeWidth="1"/>
         {profile.seams.map((s,n)=><line key={n} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#050505" strokeOpacity=".65" strokeWidth="2"/>)}
         <text x="42" y="34" fill="#777" fontSize="12" fontFamily="system-ui" letterSpacing="2">2T EXPANSION CHAMBER</text>
         <text x="42" y="52" fill="#555" fontSize="10" fontFamily="system-ui">Ø rośnie do belly, następnie maleje do przeciwstożka / stinger</text>
        </svg>
        <div className="pointer-events-none absolute right-4 top-4 rounded-xl border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-sm">
         <p className="text-[10px] font-bold uppercase tracking-[.18em] text-zinc-500">2T Chamber</p>
         <p className="mt-1 text-xs text-zinc-300">U-bend: {Math.min(90,bend)}° · LPM: {Math.round(r.total)} mm</p>
        </div>
       </div>
      </div>    </div><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-bold">Wymiary do wykonania</h2><p className="mt-1 text-xs text-zinc-500">Cięciwa zmienia się wraz z wygięciem — przy 0° jest równa długości osi, a przy 90° pokazuje wymiar wynikający z łuku sekcji.</p><div className="mt-4 overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-sm"><thead className="bg-white/[.04] text-xs text-zinc-500"><tr><th className="px-3 py-3 text-left">Sekcja</th><th className="px-3 py-3 text-right">Łuk osi</th><th className="px-3 py-3 text-right">Cięciwa</th><th className="px-3 py-3 text-right">Ø pocz.</th><th className="px-3 py-3 text-right">Ø końc.</th></tr></thead><tbody>{seg.map(s=>{const bendRad=rad(Math.min(90,Math.max(0,bend))); const theta=bendRad*Number(s[1])/Math.max(r.total,1); const chord=theta<.0001?Number(s[1]):2*(r.total/Math.max(bendRad,.0001))*Math.sin(theta/2);return <tr key={String(s[0])} className="border-t border-white/10"><td className="px-3 py-3 font-medium">{s[0]}</td><td className="px-3 py-3 text-right font-mono">{round(Number(s[1]))} mm</td><td className="px-3 py-3 text-right font-mono">{round(chord)} mm</td><td className="px-3 py-3 text-right font-mono">{round(Number(s[2]))}</td><td className="px-3 py-3 text-right font-mono">{round(Number(s[3]))}</td></tr>})}</tbody></table></div></div>
     <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-bold">Kontrola</h2><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-zinc-500">Długość strojenia</span><b>{round(r.tuned)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">Rura wlotowa</span><b>{round(r.header)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">Stinger</span><b>Ø {round(r.stinger)} × {round(r.stingerLength)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">EGT</span><b>{round(i.egt)}°C</b></div></div><div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-xs leading-5 text-zinc-300"><b className="text-white">Ważne:</b> to model akustyczny i proporcjonalny punktu startowego. Port timing, temperatura, kształt kanału, króciec, tłumik i straty przepływu zmieniają rzeczywisty wynik.</div></div></div>
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5"><h2 className="font-bold">Model i założenia</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Długość akustyczna korzysta z przedziału od otwarcia portu do docelowego powrotu fali. Prędkość fali jest przybliżana przez a = √(γRT). Geometria stożków, belly i stinger są parametryczne, dlatego wynik jest punktem startowym do dalszego strojenia.</p><p className="mt-3 text-xs text-zinc-600">Model nie jest pełną symulacją 1D gas-dynamics: temperatura wzdłuż układu, straty, korekta efektywnej długości, tłumik i dokładny kształt portu wymagają dalszej walidacji.</p></div>
   </section>
  </div>
 </div></main>;
}
