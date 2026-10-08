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
 const [yaw,setYaw]=useState(-28);
 const [pitch,setPitch]=useState(18);
 const [bend,setBend]=useState(0);
 const [dragging,setDragging]=useState(false);
 const [lastPointerX,setLastPointerX]=useState(0);
 const [lastPointerY,setLastPointerY]=useState(0);
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
 const seg:Array<[string,number,number,number]>=[["Rura wlotowa",r.header,r.d1,r.d1],["Dyfuzor 1",r.l1,r.d1,r.d2],["Dyfuzor 2",r.l2,r.d2,r.d3],["Dyfuzor 3",r.l3,r.d3,r.dmax],["Belly",r.belly,r.dmax,r.dmax],["Przeciwstożek",r.baffle,r.dmax,r.stinger],["Stinger",r.stingerLength,r.stinger,r.stinger]];
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
      <div className="border-b border-white/10 px-5 py-4"><div className="flex items-center justify-between"><div><h2 className="font-bold">Geometria montażowa</h2><p className="mt-1 text-xs text-zinc-500">Suwak wygina cały układ jak typowy rogal 2T.</p></div><span className="font-mono text-xs text-zinc-400">{bend}°</span></div><input aria-label="Stopień wygięcia wydechu" type="range" min="0" max="180" value={bend} onChange={e=>setBend(Number(e.target.value))} className="mt-4 w-full accent-red-500"/></div>
      <div className="border-b border-white/10 px-5 py-4"><h2 className="font-bold">Podgląd 3D układu wydechowego</h2><p className="mt-1 text-xs text-zinc-500">Przestrzenny model rurowy: przeciągaj w poziomie i pionie, aby obracać kamerę. Suwak steruje rzeczywistą krzywizną osi wydechu.</p></div>
      <div className="overflow-hidden p-3 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.07),transparent_60%)]">
        <svg viewBox="0 0 1100 520" className="h-auto w-full select-none touch-none" aria-label="Interaktywny przestrzenny model wydechu 2T"
          style={{cursor:dragging?"grabbing":"grab"}}
          onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setDragging(true);setLastPointerX(e.clientX);setLastPointerY(e.clientY)}}
          onPointerMove={e=>{if(!dragging)return;const dx=e.clientX-lastPointerX,dy=e.clientY-lastPointerY;setLastPointerX(e.clientX);setLastPointerY(e.clientY);setYaw(v=>v+dx*.75);setPitch(v=>Math.max(-75,Math.min(75,v-dy*.55)))}}
          onPointerUp={e=>{e.currentTarget.releasePointerCapture(e.pointerId);setDragging(false)}}
          onPointerCancel={()=>setDragging(false)}>
          <defs>
            <linearGradient id="metal3d" x1="0" x2="1"><stop offset="0" stopColor="#17171a"/><stop offset=".2" stopColor="#8b8b91"/><stop offset=".42" stopColor="#f4f4f5"/><stop offset=".62" stopColor="#6b6b72"/><stop offset=".82" stopColor="#b9b9bf"/><stop offset="1" stopColor="#202024"/></linearGradient>
            <linearGradient id="hot3d" x1="0" x2="1"><stop offset="0" stopColor="#450a0a"/><stop offset=".28" stopColor="#b91c1c"/><stop offset=".55" stopColor="#fb5b32"/><stop offset=".78" stopColor="#991b1b"/><stop offset="1" stopColor="#3f0b0b"/></linearGradient>
            <radialGradient id="ground"><stop offset="0" stopColor="rgba(0,0,0,.45)"/><stop offset="1" stopColor="rgba(0,0,0,0)"/></radialGradient>
          </defs>
          <ellipse cx="550" cy="420" rx="455" ry="45" fill="url(#ground)"/>
          {(()=>{
            const scale=780/Math.max(r.total,1);
            const seg=[["Header",r.header,r.d1,r.d1],["Diffuser 1",r.l1,r.d1,r.d2],["Diffuser 2",r.l2,r.d2,r.d3],["Diffuser 3",r.l3,r.d3,r.dmax],["Belly",r.belly,r.dmax,r.dmax],["Baffle",r.baffle,r.dmax,r.stinger],["Stinger",r.stingerLength,r.stinger,r.stinger]] as [string,number,number,number][];
            const totalPx=780,bendRad=bend*Math.PI/180;
            const pathPoint=(s:number)=>{
              const u=Math.max(0,Math.min(1,s/totalPx)),steps=Math.max(8,Math.ceil(s/22)),ds=s/steps;
              let x=0,y=0;
              for(let j=0;j<steps;j++){const q=(j+.5)/steps,e=q*q*(3-2*q),h=bendRad*e;x+=Math.cos(h)*ds;y+=Math.sin(h)*ds;}
              const q=Math.max(.0001,Math.min(.9999,u)),e=q*q*(3-2*q),h=bendRad*e;
              return [x,y,0,Math.cos(h),Math.sin(h),0] as const;
            };
            const rot=(x:number,y:number,z:number)=>{
              const ay=rad(yaw),ap=rad(pitch),x1=x*Math.cos(ay)-z*Math.sin(ay),z1=x*Math.sin(ay)+z*Math.cos(ay),y2=y*Math.cos(ap)-z1*Math.sin(ap),z2=y*Math.sin(ap)+z1*Math.cos(ap);
              return [x1,y2,z2] as const;
            };
            const project=(x:number,y:number,z:number)=>{
              const p=rot(x,y,z),depth=980/(980-p[2]);
              return [550+p[0]*depth,285-p[1]*depth,depth,p[2]] as const;
            };
            const ring=(s:number,d:number)=>{
              const [cx,cy,cz,tx,ty]=pathPoint(s),side=[-ty,tx,0] as const,up=[0,0,1] as const,rr=d*.55;
              return Array.from({length:18},(_,n)=>{const t=n*Math.PI*2/18;return [cx+side[0]*Math.cos(t)*rr+up[0]*Math.sin(t)*rr,cy+side[1]*Math.cos(t)*rr+up[1]*Math.sin(t)*rr,cz+side[2]*Math.cos(t)*rr+up[2]*Math.sin(t)*rr] as const});
            };
            let x=0;
            return seg.map(([name,len,a,b],idx)=>{
              const w=Math.max(26,len*scale),s1=x,s2=x+w;x=s2;
              const p=ring(s1,a),q=ring(s2,b),mid=(s1+s2)/2,mp=pathPoint(mid);
              const faces=q.map((pt,k)=>{const nk=(k+1)%q.length,p0=p[k],p1=p[nk],q0=q[k],q1=q[nk],A=project(p0[0],p0[1],p0[2]),B=project(p1[0],p1[1],p1[2]),C=project(q1[0],q1[1],q1[2]),D=project(q0[0],q0[1],q0[2]),z=(A[2]+B[2]+C[2]+D[2])/4,light=.2+.8*Math.max(0,Math.cos(k*Math.PI*2/18-.8));return {k,pts:`${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]} ${D[0]},${D[1]}`,z,light}});
              return <g key={name}>{faces.sort((a,b)=>a.z-b.z).map(f=><polygon key={f.k} points={f.pts} fill={idx===4?"url(#hot3d)":"url(#metal3d)"} opacity={Math.min(1,.56+f.light*.44)} stroke="rgba(0,0,0,.32)" strokeWidth=".7"/>)}<ellipse cx={project(mp[0],mp[1],0)[0]} cy={project(mp[0],mp[1],0)[1]+62} rx="34" ry="7" fill="rgba(0,0,0,.16)"/></g>
            });
          })()}
          <text x="550" y="475" textAnchor="middle" fill="rgba(255,255,255,.42)" fontSize="11">przeciągnij ↕ ↔ • obrót kamery</text>
        </svg>
      </div>    </div><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-bold">Wymiary do wykonania</h2><div className="mt-4 overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-sm"><thead className="bg-white/[.04] text-xs text-zinc-500"><tr><th className="px-3 py-3 text-left">Sekcja</th><th className="px-3 py-3 text-right">Długość</th><th className="px-3 py-3 text-right">Ø pocz.</th><th className="px-3 py-3 text-right">Ø końc.</th></tr></thead><tbody>{seg.map(s=><tr key={String(s[0])} className="border-t border-white/10"><td className="px-3 py-3 font-medium">{s[0]}</td><td className="px-3 py-3 text-right font-mono">{round(Number(s[1]))} mm</td><td className="px-3 py-3 text-right font-mono">{round(Number(s[2]))}</td><td className="px-3 py-3 text-right font-mono">{round(Number(s[3]))}</td></tr>)}</tbody></table></div></div>
     <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-bold">Kontrola</h2><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-zinc-500">Długość strojenia</span><b>{round(r.tuned)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">Rura wlotowa</span><b>{round(r.header)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">Stinger</span><b>Ø {round(r.stinger)} × {round(r.stingerLength)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">EGT</span><b>{round(i.egt)}°C</b></div></div><div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-xs leading-5 text-zinc-300"><b className="text-white">Ważne:</b> to model akustyczny i proporcjonalny punktu startowego. Port timing, temperatura, kształt kanału, króciec, tłumik i straty przepływu zmieniają rzeczywisty wynik.</div></div></div>
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5"><h2 className="font-bold">Model i założenia</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Długość akustyczna korzysta z przedziału od otwarcia portu do docelowego powrotu fali. Prędkość fali jest przybliżana przez a = √(γRT). Geometria stożków, belly i stinger są parametryczne, dlatego wynik jest punktem startowym do dalszego strojenia.</p><p className="mt-3 text-xs text-zinc-600">Model nie jest pełną symulacją 1D gas-dynamics: temperatura wzdłuż układu, straty, korekta efektywnej długości, tłumik i dokładny kształt portu wymagają dalszej walidacji.</p></div>
   </section>
  </div>
 </div></main>;
}
