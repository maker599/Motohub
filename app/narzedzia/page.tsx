'use client';

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
 const canvasRef=useRef<HTMLCanvasElement|null>(null);
 const set=(k:keyof Inputs,v:string)=>setI(x=>({...x,[k]:v===""?0:Number(v)}));
 useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;
  const ctx=canvas.getContext("2d");if(!ctx)return;
  const W=canvas.width,H=canvas.height;
  const DPR=Math.min(2,window.devicePixelRatio||1);
  const resize=()=>{const box=canvas.getBoundingClientRect();canvas.width=Math.max(900,Math.floor(box.width*DPR));canvas.height=Math.max(420,Math.floor(box.width*.46*DPR));};
  resize();
  const draw=()=>{
    const w=canvas.width,h=canvas.height;
    ctx.clearRect(0,0,w,h);
    const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,"#080808");bg.addColorStop(.65,"#101010");bg.addColorStop(1,"#050505");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    const segs=[["Header",r.header,r.d1,r.d1],["Diffuser 1",r.l1,r.d1,r.d2],["Diffuser 2",r.l2,r.d2,r.d3],["Diffuser 3",r.l3,r.d3,r.dmax],["Belly",r.belly,r.dmax,r.dmax],["Baffle",r.baffle,r.dmax,r.stinger],["Stinger",r.stingerLength,r.stinger,r.stinger]] as [string,number,number,number][];
    const total=r.total, samples=150, sides=24, bendRad=rad(bend), pathScale=760/Math.max(total,1);
    const pts:{x:number;y:number;z:number;tx:number;ty:number}[]=[];
    for(let n=0;n<=samples;n++){
      const s=total*n/samples, u=s/Math.max(total,1);
      let x=0,y=0,steps=Math.max(4,Math.ceil(n? s/12:1)),ds=s/steps;
      for(let j=0;j<steps;j++){const q=(j+.5)/steps;const heading=bendRad*q; x+=Math.cos(heading)*ds;y+=Math.sin(heading)*ds;}
      const heading=bendRad*u;pts.push({x:x*pathScale,y:y*pathScale,z:0,tx:Math.cos(heading),ty:Math.sin(heading)});
    }
    const ay=rad(yaw),ap=rad(pitch);
    const transform=(x:number,y:number,z:number)=>{
      const x1=x*Math.cos(ay)-z*Math.sin(ay),z1=x*Math.sin(ay)+z*Math.cos(ay);
      const y1=y*Math.cos(ap)-z1*Math.sin(ap),z2=y*Math.sin(ap)+z1*Math.cos(ap);
      const cam=1150,den=Math.max(300,cam-z2),sc=cam/den;
      return {x:w*.5+x1*sc,y:h*.52-y1*sc,z:z2};
    };
    const mesh:{p:{x:number;y:number;z:number}[];depth:number;seg:number}[]=[];
    const sampleRadius=(s:number)=>{
      let acc=0;
      for(let k=0;k<segs.length;k++){const len=segs[k][1];if(s<=acc+len){const t=(s-acc)/Math.max(len,1),a=segs[k][2],b=segs[k][3];return (a+(b-a)*t)*.62}acc+=len;}
      return r.stinger*.62;
    };
    for(let n=0;n<=samples;n++){
      const c0=pts[n],side={x:-c0.ty,y:c0.tx},up={x:0,y:0};
      const ring=[];
      const rr=sampleRadius(total*n/samples);
      for(let k=0;k<sides;k++){const t=k*Math.PI*2/sides;ring.push(transform(c0.x+side.x*Math.cos(t)*rr,c0.y+side.y*Math.cos(t)*rr,Math.sin(t)*rr));}
      if(n>0)for(let k=0;k<sides;k++){const q=(k+1)%sides,a=mesh.length?ring[k]:ring[k],prevRing=(mesh as any)._lastRing; if(prevRing){const A=prevRing[k],B=prevRing[q],C=ring[q],D=ring[k];mesh.push({p:[A,B,C,D],depth:(A.z+B.z+C.z+D.z)/4,seg:0});}}
      (mesh as any)._lastRing=ring;
    }
    delete (mesh as any)._lastRing;
    let boundaries:number[]=[];let acc=0;for(const g of segs){acc+=g[1];boundaries.push(acc/total*samples);}
    const ordered=mesh.map((f,idx)=>({f,idx})).sort((a,b)=>a.f.depth-b.f.depth);
    for(const item of ordered){
      const f=item.f, q=f.p;
      const cx=(q[0].x+q[1].x+q[2].x+q[3].x)/4,cy=(q[0].y+q[1].y+q[2].y+q[3].y)/4;
      const edge={x:q[1].x-q[0].x,y:q[1].y-q[0].y},cross={x:q[3].x-q[0].x,y:q[3].y-q[0].y};
      const nz=edge.x*cross.y-edge.y*cross.x;const light=Math.max(.08,Math.min(1,.35+nz/Math.max(1,Math.hypot(edge.x,edge.y)*Math.hypot(cross.x,cross.y))));
      const sIndex=Math.floor(item.idx/sides),midS=(sIndex+.5)/samples;
      let segIdx=0;while(segIdx<boundaries.length&&midS>boundaries[segIdx])segIdx++;
      const hot=segIdx===4;
      const g=ctx.createLinearGradient(q[0].x,q[0].y,q[2].x,q[2].y);
      if(hot){g.addColorStop(0,`rgba(65,10,8,${.75+.2*light})`);g.addColorStop(.45,`rgba(226,61,35,${.7+.25*light})`);g.addColorStop(1,"rgba(55,8,8,.9)");}
      else{g.addColorStop(0,`rgba(30,31,35,${.95})`);g.addColorStop(.35,`rgba(205,207,212,${.35+.45*light})`);g.addColorStop(.6,`rgba(90,92,98,${.8})`);g.addColorStop(1,`rgba(18,19,22,.98)`);}
      ctx.beginPath();ctx.moveTo(q[0].x,q[0].y);for(let k=1;k<q.length;k++)ctx.lineTo(q[k].x,q[k].y);ctx.closePath();ctx.fillStyle=g;ctx.fill();ctx.strokeStyle="rgba(0,0,0,.42)";ctx.lineWidth=.7;ctx.stroke();
    }
    ctx.fillStyle="rgba(255,255,255,.35)";ctx.font="12px system-ui";ctx.textAlign="center";ctx.fillText("Interaktywny model bryłowy • 3 osie obrotu • geometria zależna od suwaka",w/2,h-22);
  };
  draw();
  const ro=()=>{resize();draw()};window.addEventListener("resize",ro);return()=>window.removeEventListener("resize",ro);
 },[r,bend,yaw,pitch]);
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
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#070707]">
          <canvas ref={canvasRef} width={1400} height={650} className="h-auto w-full touch-none select-none"
            aria-label="Pełny interaktywny model 3D wydechu 2T"
            style={{cursor:dragging?"grabbing":"grab"}}
            onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setDragging(true);setLastPointerX(e.clientX);setLastPointerY(e.clientY)}}
            onPointerMove={e=>{if(!dragging)return;const dx=e.clientX-lastPointerX,dy=e.clientY-lastPointerY;setLastPointerX(e.clientX);setLastPointerY(e.clientY);setYaw(v=>v+dx*.55);setPitch(v=>Math.max(-82,Math.min(82,v-dy*.55)))}}
            onPointerUp={e=>{e.currentTarget.releasePointerCapture(e.pointerId);setDragging(false)}}
            onPointerCancel={()=>setDragging(false)}
            onDoubleClick={()=>{setYaw(-28);setPitch(18)}} />
          <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[.18em] text-zinc-500">3D Exhaust Lab</p>
            <p className="mt-1 text-xs text-zinc-300">LPM: {Math.round(r.total)} mm · Rogal: {bend}°</p>
          </div>
          <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/55 px-3 py-1.5 text-[10px] text-zinc-500 backdrop-blur-sm">drag ↔ ↕ · double click = widok domyślny</div>
        </div>
      </div>    </div><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-bold">Wymiary do wykonania</h2><div className="mt-4 overflow-hidden rounded-2xl border border-white/10"><table className="w-full text-sm"><thead className="bg-white/[.04] text-xs text-zinc-500"><tr><th className="px-3 py-3 text-left">Sekcja</th><th className="px-3 py-3 text-right">Długość</th><th className="px-3 py-3 text-right">Ø pocz.</th><th className="px-3 py-3 text-right">Ø końc.</th></tr></thead><tbody>{seg.map(s=><tr key={String(s[0])} className="border-t border-white/10"><td className="px-3 py-3 font-medium">{s[0]}</td><td className="px-3 py-3 text-right font-mono">{round(Number(s[1]))} mm</td><td className="px-3 py-3 text-right font-mono">{round(Number(s[2]))}</td><td className="px-3 py-3 text-right font-mono">{round(Number(s[3]))}</td></tr>)}</tbody></table></div></div>
     <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-bold">Kontrola</h2><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-zinc-500">Długość strojenia</span><b>{round(r.tuned)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">Rura wlotowa</span><b>{round(r.header)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">Stinger</span><b>Ø {round(r.stinger)} × {round(r.stingerLength)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">EGT</span><b>{round(i.egt)}°C</b></div></div><div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-xs leading-5 text-zinc-300"><b className="text-white">Ważne:</b> to model akustyczny i proporcjonalny punktu startowego. Port timing, temperatura, kształt kanału, króciec, tłumik i straty przepływu zmieniają rzeczywisty wynik.</div></div></div>
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5"><h2 className="font-bold">Model i założenia</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Długość akustyczna korzysta z przedziału od otwarcia portu do docelowego powrotu fali. Prędkość fali jest przybliżana przez a = √(γRT). Geometria stożków, belly i stinger są parametryczne, dlatego wynik jest punktem startowym do dalszego strojenia.</p><p className="mt-3 text-xs text-zinc-600">Model nie jest pełną symulacją 1D gas-dynamics: temperatura wzdłuż układu, straty, korekta efektywnej długości, tłumik i dokładny kształt portu wymagają dalszej walidacji.</p></div>
   </section>
  </div>
 </div></main>;
}
