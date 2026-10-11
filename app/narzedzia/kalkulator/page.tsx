'use client';

import { useMemo, useState } from "react";
import SiteNav from "../../SiteNav";
import FieldHelp from "../FieldHelp";
import ToolOverlay from "../ToolOverlay";
import ExhaustModel3D from "./ExhaustModel3D";

type Inputs = {
  bore:number; stroke:number; cylinders:number; rpm:number; exhaustOpen:number; exhaustClose:number; targetReturn:number;
  exhaustPortDiameter:number; exhaustPortHeight:number; headerDiameter:number; egt:number; gamma:number;
  diffuser1:number; diffuser2:number; diffuser3:number; baffleAngle:number; bellyRatio:number;
  stingerRatio:number; stingerLengthRatio:number; wall:number;
};
type ExhaustEffect = "seryjny" | "sport" | "race" | "high-end";
type ExhaustShape = Pick<Inputs, "diffuser1" | "diffuser2" | "diffuser3" | "baffleAngle" | "bellyRatio" | "stingerRatio" | "stingerLengthRatio">;
const EFFECTS: Array<{ id: ExhaustEffect; name: string; spread: number; note: string; shape: ExhaustShape }> = [
 {id:"seryjny",name:"Seryjny",spread:.14,note:"szeroki, spokojny zakres",shape:{diffuser1:7,diffuser2:6,diffuser3:5,baffleAngle:12,bellyRatio:2.2,stingerRatio:.62,stingerLengthRatio:12}},
 {id:"sport",name:"Sport",spread:.10,note:"szersze pasmo do codziennej jazdy",shape:{diffuser1:8,diffuser2:7,diffuser3:6,baffleAngle:13,bellyRatio:2.5,stingerRatio:.60,stingerLengthRatio:11}},
 {id:"race",name:"Race",spread:.07,note:"węższe pasmo i mocniejszy charakter",shape:{diffuser1:10,diffuser2:8,diffuser3:7,baffleAngle:15,bellyRatio:2.8,stingerRatio:.58,stingerLengthRatio:10}},
 {id:"high-end",name:"High End",spread:.05,note:"wąskie pasmo pod wysokie obroty",shape:{diffuser1:12,diffuser2:9,diffuser3:8,baffleAngle:17,bellyRatio:3,stingerRatio:.56,stingerLengthRatio:9}},
];
const defaults:Inputs={
  bore:54,stroke:54,cylinders:1,rpm:9000,exhaustOpen:190,exhaustClose:550,targetReturn:500,
  exhaustPortDiameter:28,exhaustPortHeight:24,headerDiameter:28,egt:650,gamma:1.35,
  ...EFFECTS[1].shape,wall:1
};
const round=(v:number,d=1)=>Number.isFinite(v)?Number(v.toFixed(d)).toLocaleString("pl-PL"):"—";
const rad=(v:number)=>v*Math.PI/180;
const cone=(a:number,b:number,included:number)=>Math.abs(b-a)/2/Math.tan(rad(Math.max(1,Math.min(170,included))/2));
const conePattern=(length:number,d1:number,d2:number)=>{
 const r1=d1/2,r2=d2/2,d=Math.abs(r2-r1),slant=Math.hypot(length,r2-r1);
 if(d<0.001) return {kind:"cylinder",slant,outer:0,inner:0,angle:360,flatLength:length,flatWidth:Math.PI*d1};
 const outer=slant*r2/d,inner=slant*r1/d,angle=2*Math.PI*d/slant*180/Math.PI;
 return {kind:"cone",slant,outer,inner,angle,flatLength:slant,flatWidth:angle/360*2*Math.PI*outer};
};
const label=(a:string,u:string,tip?:string)=><span className="mb-2 flex items-center justify-between text-xs font-medium text-zinc-400"><span className="flex items-center gap-1.5">{a}{tip&&<FieldHelp text={tip} />}</span><span className="text-zinc-600">{u}</span></span>;

type Pattern = { name:string; type:string; length?:number; width?:number; detail?:string; slant?:number; outer?:number; inner?:number; angle?:number; flatLength?:number; flatWidth?:number };

export default function ToolsPage(){
 const [i,setI]=useState(defaults);
 const [effect,setEffect]=useState<ExhaustEffect>("sport");
 const [bend2,setBend2]=useState(42);
 const chamberSweep=Math.round(Math.min(90,Math.max(0,bend2*0.9)));
 const setEffectProfile=(next:ExhaustEffect)=>{
  const selectedEffect=EFFECTS.find((item)=>item.id===next);
  if(!selectedEffect) return;
  setEffect(next);
  setI(current=>({...current,...selectedEffect.shape}));
 };
 const responseBand=EFFECTS.find((item)=>item.id===effect)?.spread??.1;
 const resonanceLow=Number.isFinite(i.rpm)&&i.rpm>0?Math.round(i.rpm*(1-responseBand)):0;
 const resonanceHigh=Number.isFinite(i.rpm)&&i.rpm>0?Math.round(i.rpm*(1+responseBand)):0;
 const setupIssues:string[]=[];
 if(i.bore<=0||i.stroke<=0||i.cylinders<=0) setupIssues.push("Średnica, skok i liczba cylindrów muszą być większe od zera.");
 if(i.rpm<=0) setupIssues.push("Obroty szczytu mocy muszą być większe od zera.");
 if(i.exhaustClose<=i.exhaustOpen) setupIssues.push("Kąt zamknięcia wydechu musi wypadać po kącie otwarcia.");
 if(i.targetReturn<=i.exhaustOpen||i.targetReturn>=i.exhaustClose) setupIssues.push("Powrót fali powinien wypadać między otwarciem a zamknięciem wydechu.");
 if(i.exhaustPortDiameter<=0||i.exhaustPortHeight<=0||i.headerDiameter<=0) setupIssues.push("Średnice i wysokość portu oraz średnica headera muszą być większe od zera.");
 if(i.egt<=-273.15||i.gamma<=0) setupIssues.push("Temperatura EGT i wykładnik γ muszą mieć poprawne wartości.");
 if([i.diffuser1,i.diffuser2,i.diffuser3,i.baffleAngle].some((angle)=>angle<=0||angle>=180)) setupIssues.push("Kąty stożków muszą mieścić się między 0° a 180°.");
 if(i.bellyRatio<=0||i.stingerRatio<=0||i.stingerLengthRatio<=0||i.wall<=0) setupIssues.push("Proporcje komory i grubość blachy muszą być większe od zera.");
 const setupValid=setupIssues.length===0;
 const set=(k:keyof Inputs,v:string)=>{const parsed=Number(v);setI(x=>({...x,[k]:v===""?0:(Number.isFinite(parsed)?Math.max(-100000,Math.min(100000,parsed)):0)}));};
 const r=useMemo(()=>{
  const wave=Math.sqrt(Math.max(.1,i.gamma)*287*Math.max(1,i.egt+273.15));
  const available=Math.max(20,Math.min(i.targetReturn,i.exhaustClose)-i.exhaustOpen);
  const tuned=wave*available/(12*Math.max(1,i.rpm))*1000;
  const d1=Math.max(1,i.headerDiameter||i.exhaustPortDiameter),d2=d1*Math.sqrt(1.55),d3=d1*Math.sqrt(3.35),dmax=d1*Math.max(1.1,i.bellyRatio);
  const l1=cone(d1,d2,i.diffuser1),l2=cone(d2,d3,i.diffuser2),l3=cone(d3,dmax,i.diffuser3);
  const belly=Math.max(20,tuned*.10),stinger=Math.max(3,dmax*i.stingerRatio), baffle=cone(dmax,stinger,i.baffleAngle);
  const stingerLength=stinger*Math.max(3,i.stingerLengthRatio), header=Math.max(30,tuned-l1-l2-l3-belly-baffle);
  const portArea=Math.PI*Math.pow(i.exhaustPortDiameter/2,2),portRectArea=Math.max(0,i.exhaustPortDiameter*i.exhaustPortHeight);
  const effectivePortArea=Math.max(portArea,portRectArea),bellyAreaRatio=(dmax/d1)**2,stingerAreaRatio=(stinger/dmax)**2,total=header+l1+l2+l3+belly+baffle+stingerLength,balance=tuned-total;
  return {wave,available,tuned,d1,d2,d3,dmax,l1,l2,l3,belly,baffle,stinger,stingerLength,header,
    disp:Math.PI/4*Math.max(0,i.bore)**2*Math.max(0,i.stroke)*Math.max(0,i.cylinders)/1000,ratio:(dmax/d1)**2,portArea,effectivePortArea,bellyAreaRatio,stingerAreaRatio,total,balance};
 },[i]);
 const [hoverPattern,setHoverPattern]=useState<string|null>(null);
 const patterns=useMemo<Pattern[]>(()=>[
  {name:"Rura wlotowa",type:"prostokąt",length:r.header,width:Math.PI*r.d1,detail:"Długość osiowa × obwód Ø"},
  {name:"Dyfuzor 1",type:"wycinek stożka",...conePattern(r.l1,r.d1,r.d2)},
  {name:"Dyfuzor 2",type:"wycinek stożka",...conePattern(r.l2,r.d2,r.d3)},
  {name:"Dyfuzor 3",type:"wycinek stożka",...conePattern(r.l3,r.d3,r.dmax)},
  {name:"Belly",type:"prostokąt",length:r.belly,width:Math.PI*r.dmax,detail:"Długość osiowa × obwód Ø"},
  {name:"Przeciwstożek",type:"wycinek stożka",...conePattern(r.baffle,r.dmax,r.stinger)},
  {name:"Stinger",type:"prostokąt",length:r.stingerLength,width:Math.PI*r.stinger,detail:"Długość osiowa × obwód Ø"},
], [r]);
  const seg=useMemo<Array<[string,number,number,number]>>(()=>[
  ["Rura wlotowa",r.header,r.d1,r.d1],
  ["Dyfuzor 1",r.l1,r.d1,r.d2],
  ["Dyfuzor 2",r.l2,r.d2,r.d3],
  ["Dyfuzor 3",r.l3,r.d3,r.dmax],
  ["Belly",r.belly,r.dmax,r.dmax],
  ["Przeciwstożek",r.baffle,r.dmax,r.stinger],
   ["Stinger",r.stingerLength,r.stinger,r.stinger]
  ],[r]);
 const profile=useMemo(()=>{
  const total=Math.max(r.total,1);
  const n=240;
  const pts:{x:number;y:number;w:number;s:number}[]=[];
  const visualWidthFactor=1.18;
  const widthAt=(s:number)=>{
   let acc=0;
   for(const [,len,a,b] of seg){
    if(s<=acc+len){
     const t=(s-acc)/Math.max(len,1);
     return ((a+(b-a)*t)/2)*visualWidthFactor;
    }
    acc+=len;
   }
   return r.stinger*.88*visualWidthFactor;
  };

  // The header always makes a smooth 180° turn so the chamber runs back from the cylinder.
  const elbowAngle=rad(180);
  const elbowLen=Math.min(total*.12,Math.max(45,total*.08));
  const elbowRadius=Math.max(35,elbowLen/elbowAngle);
  const headerLen=Math.max(30,r.header*.22);
  const firstEnd=headerLen+elbowLen;
  const chamberStart=firstEnd;
  const bodyLen=Math.max(1,total-chamberStart);
  const packTurn=rad(chamberSweep);
  const arcRadius=packTurn>0.001?bodyLen/packTurn:0;

  for(let k=0;k<=n;k++){
   const s=total*k/n;
    let x:number,y:number;
   if(s<=headerLen){
     x=s;y=0;
   }else if(s<=firstEnd){
    const q=(s-headerLen)/Math.max(elbowLen,1);
    const a=elbowAngle*q;
    x=headerLen+elbowRadius*Math.sin(a);
    y=-elbowRadius*(1-Math.cos(a));
   }else{
    const q=(s-chamberStart)/bodyLen;
    const ex=headerLen+elbowRadius*Math.sin(elbowAngle);
    const ey=-elbowRadius*(1-Math.cos(elbowAngle));
    const finalAngle=elbowAngle;
    const sweptAngle=packTurn*q;
    if(packTurn>0.001){
     x=ex+arcRadius*(Math.sin(finalAngle+sweptAngle)-Math.sin(finalAngle));
     y=ey+arcRadius*(Math.cos(finalAngle+sweptAngle)-Math.cos(finalAngle));
    }else{
     x=ex+bodyLen*q*Math.cos(finalAngle);
     y=ey-bodyLen*q*Math.sin(finalAngle);
    }
   }
   pts.push({x,y,w:widthAt(s),s});
  }

  const minX=Math.min(...pts.map(p=>p.x-p.w))-55,maxX=Math.max(...pts.map(p=>p.x+p.w))+55;
  const minY=Math.min(...pts.map(p=>p.y-p.w))-55,maxY=Math.max(...pts.map(p=>p.y+p.w))+55;
  const pad=48;
  const scale=Math.min(1180/Math.max(maxX-minX,1),560/Math.max(maxY-minY,1));
  const tx=(x:number)=>Number((pad+(x-minX)*scale).toFixed(3));
  const yOffset=55;
  const ty=(y:number)=>Number((pad+(maxY-y)*scale+yOffset).toFixed(3));
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
  const flange=(()=>{
   const p=pts[0],next=pts[1];
   const dx=next.x-p.x,dy=next.y-p.y,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
   const fw=Math.max(11,p.w*1.22),fh=Math.max(7,p.w*.38);
   const cX=tx(p.x),cY=ty(p.y);
   return {
    x1:tx(p.x+nx*fw),y1:ty(p.y+ny*fw),x2:tx(p.x-nx*fw),y2:ty(p.y-ny*fw),
    bx1:tx(p.x+nx*fw+dx/l*fh),by1:ty(p.y+ny*fw+dy/l*fh),
    bx2:tx(p.x-nx*fw+dx/l*fh),by2:ty(p.y-ny*fw+dy/l*fh),
    cx:cX,cy:cY
   };
  })();
  const viewWidth=Number(((maxX-minX)*scale+pad*2).toFixed(3));
  const viewHeight=Number(((maxY-minY)*scale+pad*2+yOffset*2).toFixed(3));
  return {
   outline,center,seams,flange,scale,viewWidth,viewHeight,
   samples:pts.map((point)=>({x:point.x,y:point.y,radius:point.w/visualWidthFactor,s:point.s})),
   seamDistances:seamPoints.slice(0,-1),
   viewBox:`0 0 ${viewWidth} ${viewHeight}`
  };
 },[r,chamberSweep,seg]);
 return <main className="min-h-screen bg-[#090909] text-white"><div className="mx-auto max-w-7xl px-5 py-5 lg:px-8"><SiteNav/>
  <ToolOverlay active="exhaust" title="2T Exhaust Lab" description="Zaawansowany kalkulator geometrii komory rezonansowej 2T. Długość strojoną liczy z czasu otwarcia portu, temperatury gazów i obrotów docelowych, a następnie rozkłada ją na sekcje stożkowe."><b className="text-red-200">Projekt wstępny</b><br/>Nie zastępuje pomiarów i testów na hamowni.</ToolOverlay>
  <div className="mt-8 rounded-2xl border border-white/10 bg-white/[.025] p-4"><div className="flex gap-3"><span className="mt-0.5 text-zinc-400">✦</span><div><p className="text-sm font-bold">Wskazówki do ustawiania parametrów</p><p className="mt-1 text-xs leading-5 text-zinc-400">Najedź na znak <b className="text-zinc-200">?</b> przy parametrze, aby zobaczyć co oznacza i jak go zmierzyć. Każda zmiana od razu aktualizuje geometrię, rozwinięcia blach i podgląd wydechu.</p></div></div></div>
  <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(380px,420px)_minmax(0,1fr)]">
   <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold">Parametry silnika</h2><p className="mt-1 text-xs text-zinc-500">Najlepiej wpisywać wartości zmierzone.</p></div><button onClick={()=>{setI(defaults);setEffect("sport");setBend2(42);}} className="text-xs text-zinc-500 hover:text-white">Reset</button></div>
    <div className="mt-5 space-y-4">
     <label>{label("Średnica cylindra","mm","Średnica tłoka/cylindra. Zmierz średnicówką lub suwmiarką w cylindrze, najlepiej w kilku kierunkach i wysokościach.")}<input type="number" value={i.bore || ""} onChange={e=>set("bore",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none focus:border-red-500/60"/></label>
     <label>{label("Skok tłoka","mm","Odległość, jaką tłok pokonuje między GMP i DMP. Zmierz lub odczytaj ze specyfikacji silnika.")}<input type="number" value={i.stroke || ""} onChange={e=>set("stroke",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none focus:border-red-500/60"/></label>
     <label>{label("Liczba cylindrów","szt.","Liczba cylindrów silnika. Wpisz 1 dla singla, 2 dla dwucylindrowego itd.")}<input type="number" value={i.cylinders || ""} onChange={e=>set("cylinders",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none focus:border-red-500/60"/></label>
     <label>{label("Obroty szczytu mocy","rpm","Docelowe obroty, przy których chcesz uzyskać szczyt działania komory. Najlepiej z wykresu hamowni.")}<input type="number" value={i.rpm || ""} onChange={e=>set("rpm",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none focus:border-red-500/60"/></label>
     <div className="rounded-2xl border border-red-500/20 bg-red-500/[.045] p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Charakter wydechu</p>
      <div className="mt-3 grid grid-cols-2 gap-2">{EFFECTS.map((item)=><button key={item.id} type="button" aria-pressed={effect===item.id} onClick={()=>setEffectProfile(item.id)} className={`rounded-xl border px-3 py-2.5 text-left transition ${effect===item.id?"border-red-400/50 bg-red-400/10 text-white":"border-white/10 bg-black/20 text-zinc-400 hover:text-white"}`}><b className="block text-xs">{item.name}</b><span className="mt-1 block text-[10px] text-zinc-500">{item.note}</span></button>)}</div>
      <p className="mt-3 text-[11px] leading-5 text-zinc-500">Wybór ustawia bazowe kąty stożków i proporcje komory. Możesz je później skorygować w ustawieniach zaawansowanych.</p>
     </div>
     <div className="grid grid-cols-2 gap-3"><label>{label("Otwarcie wydechu","° CA","Kąt otwarcia okna wydechowego mierzony względem położenia wału. Najpewniej sprawdzić czujnikiem zegarowym i tarczą stopniową.")}<input type="number" value={i.exhaustOpen || ""} onChange={e=>set("exhaustOpen",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none"/></label><label>{label("Zamknięcie","° CA","Kąt, przy którym okno wydechowe się zamyka. Mierz tak samo jak otwarcie, obracając wał i zaznaczając moment zasłonięcia okna.")}<input type="number" value={i.exhaustClose || ""} onChange={e=>set("exhaustClose",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none" /></label></div>
     <label>{label("Docelowy powrót fali","° CA","Docelowy moment, w którym odbita fala ma wrócić do cylindra. To parametr strojenia modelu, a nie bezpośredni wymiar blachy.")}<input type="number" value={i.targetReturn || ""} onChange={e=>set("targetReturn",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none" /></label>
     <div className="grid grid-cols-2 gap-3"><label>{label("Śr. portu","mm","Przybliżona średnica zastępcza kanału/wyjścia wydechowego. Zmierz szerokość i wysokość okna, jeśli ma nieregularny kształt, i traktuj wynik jako średnicę zastępczą.")}<input type="number" step=".1" value={i.exhaustPortDiameter || ""} onChange={e=>set("exhaustPortDiameter",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white" /></label><label>{label("Wysokość portu","mm","Wysokość okna wydechowego. Zmierz od górnej do dolnej krawędzi okna w osi cylindra.")}<input type="number" step=".1" value={i.exhaustPortHeight || ""} onChange={e=>set("exhaustPortHeight",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white" /></label></div>
     <label>{label("Średnica headera","mm","Średnica wewnętrzna rury tuż za flanszą/wyjściem z cylindra. Zmierz średnicę wewnętrzną suwmiarką.")}<input type="number" step=".1" value={i.headerDiameter || ""} onChange={e=>set("headerDiameter",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white" /></label>
     <div className="grid grid-cols-2 gap-3"><label>{label("EGT","°C","Temperatura gazów spalinowych używana do przybliżenia prędkości fali. W praktyce korzystaj z pomiaru EGT w znanym miejscu układu.")}<input type="number" value={i.egt || ""} onChange={e=>set("egt",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none" /></label><label>{label("Wykładnik γ","–","Wykładnik adiabaty gazu używany w uproszczonym modelu prędkości dźwięku. Dla dokładniejszych obliczeń powinien wynikać z przyjętego modelu gazu i temperatury.")}<input type="number" step=".01" value={i.gamma || ""} onChange={e=>set("gamma",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-white outline-none" /></label></div>
     <details className="border-t border-white/10 pt-4"><summary className="cursor-pointer text-xs font-semibold text-zinc-300">Geometria i materiał <span className="text-zinc-600">· ustawienia zaawansowane</span></summary><div className="mt-4 space-y-3"><p className="text-[10px] leading-4 text-zinc-500">Charakter wydechu ustawia wartości startowe. Zmień je tylko wtedy, gdy masz własny projekt lub konkretne pomiary.</p><div className="grid grid-cols-3 gap-2"><label>{label("D1","°","Kąt rozwarcia pierwszego dyfuzora. Mierz kąt zawarty stożka, nie kąt jednej ścianki względem osi.")}<input type="number" step=".1" value={i.diffuser1 || ""} onChange={e=>set("diffuser1",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white"/></label><label>{label("D2","°","Kąt rozwarcia drugiego dyfuzora. Ustaw na podstawie geometrii, którą chcesz wykonać i zmierz pełny kąt stożka.")}<input type="number" step=".1" value={i.diffuser2 || ""} onChange={e=>set("diffuser2",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white"/></label><label>{label("D3","°","Kąt rozwarcia trzeciego dyfuzora. Jest to pełny kąt zawarty danego odcinka stożkowego.")}<input type="number" step=".1" value={i.diffuser3 || ""} onChange={e=>set("diffuser3",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white"/></label></div><div className="mt-3 grid grid-cols-2 gap-3"><label>{label("Kąt przeciwstożka","°","Pełny kąt zawarty przeciwstożka. Zbyt duży kąt może pogarszać zachowanie odbicia i przepływ, dlatego traktuj go jako parametr strojenia.")}<input type="number" step=".1" value={i.baffleAngle || ""} onChange={e=>set("baffleAngle",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label><label>{label("Belly / header","×","Stosunek średnicy maksymalnej belly do średnicy headera. Nie jest to wymiar do zmierzenia jednym przyrządem — wynika z obu średnic.")}<input type="number" step=".05" value={i.bellyRatio || ""} onChange={e=>set("bellyRatio",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label></div>
     <div className="mt-3 grid grid-cols-2 gap-3"><label>{label("Stinger / Dmax","×","Stosunek średnicy stinger'a do maksymalnej średnicy komory. Zmierz oba wewnętrzne średnice i podziel Dstinger przez Dmax.")}<input type="number" step=".01" value={i.stingerRatio || ""} onChange={e=>set("stingerRatio",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label><label>{label("Stinger / Ø","×","Długość stinger'a wyrażona jako wielokrotność jego średnicy. Zmierz długość osiową stinger'a i podziel przez jego średnicę.")}<input type="number" step=".5" value={i.stingerLengthRatio || ""} onChange={e=>set("stingerLengthRatio",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label></div>
      <div className="mt-3"><label>{label("Grubość blachy","mm","Grubość blachy, z której wykonujesz elementy komory. Zmierz mikrometrem lub sprawdź deklarowaną grubość materiału.")}<input type="number" step=".1" value={i.wall || ""} onChange={e=>set("wall",e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.04] px-3 py-2 text-white" /></label></div></div></details>
    </div>
   </section>
   <section className="space-y-5">
    {!setupValid&&<div role="alert" className="rounded-2xl border border-amber-400/25 bg-amber-400/[.06] p-4 text-xs leading-5 text-amber-100"><b>Sprawdź parametry:</b> {setupIssues.join(" ")} Wyniki poniżej pojawią się po poprawieniu pól.</div>}
    <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-5">{[["Pojemność",setupValid?round(r.disp,1)+" cm³":"—"],["Rezonans · zakres",setupValid&&i.rpm>0?`${resonanceLow.toLocaleString("pl-PL")}–${resonanceHigh.toLocaleString("pl-PL")} rpm`:"—"],["Punkt szczytu",setupValid&&i.rpm>0?`${Math.round(i.rpm).toLocaleString("pl-PL")} rpm`:"—"],["Długość strojona",setupValid?round(r.tuned,1)+" mm":"—"],["Średnica maks.",setupValid?round(r.dmax,1)+" mm":"—"]].map(x=><div key={x[0]} className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs text-zinc-500">{x[0]}</p><p className="mt-1 text-xl font-black">{x[1]}</p></div>)}</div>
    <p className="-mt-3 px-1 text-[11px] leading-5 text-zinc-500">Zakres rezonansu jest orientacyjny: wyliczony wokół zadanych obrotów szczytu, z pasmem zależnym od wybranego charakteru ({Math.round(responseBand*100)}%). Wymaga strojenia i potwierdzenia na hamowni.</p>
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]">
      <div className="border-b border-white/10 px-5 py-5">
       <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-red-400">Układ wydechu</p><h2 className="mt-1 font-bold">Stałe kolanko przy cylindrze</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-zinc-500">Rura wykonuje stały zawrót 180° przy króćcu, a komora biegnie dalej w stronę tyłu motocykla. Jedyny suwak ustawia łagodny łuk komory.</p></div>
        <div className="rounded-xl border border-white/10 bg-white/[.03] px-3 py-2 text-right"><p className="text-[9px] uppercase tracking-widest text-zinc-600">Kolanko stałe</p><p className="font-mono text-lg font-black">180°</p></div>
       </div>
       <div className="mt-4 grid gap-3">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
         <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Łuk komory</p><p className="mt-1 text-sm font-semibold">Dopasowanie przebiegu do ramy</p></div><span className="rounded-lg bg-white/[.06] px-2 py-1 font-mono text-lg font-black">{Math.min(100,bend2)}%</span></div>
         <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400">Kąt łuku głównej komory <FieldHelp text="Steruje zawinięciem głównej komory i stinger'a. Kolanko 180° przy cylindrze pozostaje stałe. Większy kąt mocniej zawija koniec rury." /></div>
         <input aria-label="Wygięcie głównej komory wydechowej" type="range" min="0" max="100" value={Math.min(100,bend2)} onChange={e=>setBend2(Number(e.target.value))} className="mt-2 w-full accent-red-500"/>
         <div className="mt-2 flex justify-between text-[10px] text-zinc-600"><span>0% prawie prosto</span><span>50%</span><span>100% mocniejszy łuk</span></div>
        </div>
       </div>
      </div>
      <div className="border-b border-white/10 px-5 py-4"><h2 className="font-bold">Podgląd 2D komory</h2><p className="mt-1 text-xs text-zinc-500">Widać stały zawrót przy cylindrze, rozszerzający się dyfuzor, belly, przeciwstożek i wąski stinger. Suwak zmienia wyłącznie łuk głównej komory.</p></div>
      <div className="overflow-hidden p-2 bg-[radial-gradient(circle_at_center,rgba(255,255,255,.07),transparent_65%)]">
       <div className="relative min-h-[380px] overflow-hidden rounded-2xl border border-white/10 bg-[#070707]">
        <svg viewBox={profile.viewBox} preserveAspectRatio="xMidYMid meet" className="h-auto max-h-[390px] w-full" role="img" aria-label="Dwuwymiarowy schemat komory rezonansowej 2T">
         <defs>
          <linearGradient id="pipeMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d7d9dc"/><stop offset=".22" stopColor="#6f7278"/><stop offset=".5" stopColor="#222428"/><stop offset=".78" stopColor="#85888e"/><stop offset="1" stopColor="#17181b"/></linearGradient>
          <linearGradient id="bellyHot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9b2920"/><stop offset=".45" stopColor="#e55335"/><stop offset="1" stopColor="#4c0e0c"/></linearGradient>
          <filter id="pipeShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="10" stdDeviation="8" floodColor="#000" floodOpacity=".65"/></filter>
         </defs>
         <rect width="100%" height="100%" fill="#070707"/>
         <polyline points={profile.outline} fill="url(#pipeMetal)" stroke="#080808" strokeWidth="3" strokeLinejoin="round" filter="url(#pipeShadow)"/>
         <polyline points={profile.outline} fill="none" stroke="#d9dadd" strokeOpacity=".22" strokeWidth="1.2"/>
         <line x1={profile.flange.x1} y1={profile.flange.y1} x2={profile.flange.x2} y2={profile.flange.y2} stroke="#b9bcc1" strokeWidth="7" strokeLinecap="round"/>
         <line x1={profile.flange.bx1} y1={profile.flange.by1} x2={profile.flange.bx2} y2={profile.flange.by2} stroke="#55585d" strokeWidth="5" strokeLinecap="round"/>
         <circle cx={profile.flange.cx} cy={profile.flange.cy} r="4" fill="#111"/>
         <polyline points={profile.center} fill="none" stroke="#fff" strokeOpacity=".14" strokeDasharray="5 7" strokeWidth="1"/>
         {profile.seams.map((s,n)=><line key={n} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#050505" strokeOpacity=".65" strokeWidth="2"/>)}
         <text x="42" y="34" fill="#777" fontSize="12" fontFamily="system-ui" letterSpacing="2">2T EXPANSION CHAMBER</text>
         <text x="42" y="52" fill="#555" fontSize="10" fontFamily="system-ui">Ø rośnie do belly, następnie maleje do przeciwstożka / stinger</text>
         </svg>
        <div className="pointer-events-none absolute right-4 top-4 rounded-xl border border-white/10 bg-black/55 px-3 py-2 backdrop-blur-sm">
         <p className="text-[10px] font-bold uppercase tracking-[.18em] text-zinc-500">2T Chamber</p>
         <p className="mt-1 text-xs text-zinc-300">Kolanko: 180° · łuk komory: {chamberSweep}° · długość: {round(r.total)} mm</p>
        </div>
       </div>
      <div className="border-b border-white/10 px-5 py-4"><h2 className="font-bold">Model 3D komory rezonansowej</h2><p className="mt-1 text-xs leading-5 text-zinc-500">Model pokazuje komorę z kolankiem, spawanymi sekcjami i stingerem, bez osobnego tłumika.</p></div>
      <div className="p-2"><ExhaustModel3D samples={profile.samples} seams={profile.seamDistances} wall={i.wall} /></div>
      </div>    </div><div className="grid gap-5 lg:grid-cols-2"><div className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-bold">Rozwinięcia blach do wycięcia</h2><p className="mt-1 text-xs text-zinc-500">Dla prostych sekcji pokazuję rzeczywiste wymiary rozwinięcia przed walcowaniem i stożkowaniem, a nie samą długość osiową.</p><div className="mt-4 overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[760px] text-sm"><thead className="bg-white/[.04] text-[11px] text-zinc-500"><tr><th className="px-3 py-3 text-left">Detal</th><th className="px-3 py-3 text-left">Typ rozwinięcia</th><th className="px-3 py-3 text-right">Dł. osiowa</th><th className="px-3 py-3 text-right">Szer. blachy</th><th className="px-3 py-3 text-right">D1</th><th className="px-3 py-3 text-right">D2</th><th className="px-3 py-3 text-right">Skos / kąt</th></tr></thead><tbody>
                 {patterns.map((p) => {
                  const s = seg.find((x) => x[0] === p.name);
                  return (
                    <tr key={p.name} onMouseEnter={()=>setHoverPattern(p.name)} onMouseLeave={()=>setHoverPattern(null)} className="border-t border-white/10 transition-colors hover:bg-white/[.045] cursor-crosshair">
                      <td className="px-3 py-3 font-medium">{p.name}</td>
                      <td className="px-3 py-3 text-xs text-zinc-500">{p.type}</td>
                      <td className="px-3 py-3 text-right font-mono">{round(p.length ?? p.slant ?? 0)} mm</td>
                      <td className="px-3 py-3 text-right font-mono">{round(p.width ?? p.flatWidth ?? 0)} mm</td>
                      <td className="px-3 py-3 text-right font-mono">{s ? round(s[2]) : "—"}</td>
                      <td className="px-3 py-3 text-right font-mono">{s ? round(s[3]) : "—"}</td>
                      <td className="px-3 py-3 text-right font-mono">{p.angle ? round(p.angle) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody></table></div>
      {hoverPattern && (()=>{const p=patterns.find((x)=>x.name===hoverPattern); if(!p) return null;
        const isCone=p.type==="wycinek stożka";
        const L=Number(p.length??p.slant??0), W=Number(p.width??p.flatWidth??0);
        const hit=seg.find((x)=>x[0]===p.name), d1=Number(hit?.[2]??0), d2=Number(hit?.[3]??0);
        const sl=Number(p.slant??L), ro=Number(p.outer??0), ri=Number(p.inner??0), ang=Number(p.angle??0);
        const fmt=(v:number)=>round(v,1);
        const dim=(x1:number,y1:number,x2:number,y2:number,labelText:string)=><g><line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f87171" strokeWidth="1.2"/><line x1={x1-4} y1={y1-4} x2={x1+4} y2={y1+4} stroke="#f87171"/><line x1={x2-4} y1={y2-4} x2={x2+4} y2={y2+4} stroke="#f87171"/><text x={(x1+x2)/2} y={(y1+y2)/2-7} textAnchor="middle" fill="#fca5a5" fontSize="11" fontFamily="monospace">{labelText}</text></g>;
        const sectorPath=(()=>{const cx=260,cy=228,scale=Math.min(150/Math.max(ro,1),200/Math.max(ro,1));const rO=ro*scale,rI=ri*scale;const a0=-ang/2*Math.PI/180,a1=ang/2*Math.PI/180;const x0=cx+rO*Math.cos(a0),y0=cy+rO*Math.sin(a0),x1=cx+rO*Math.cos(a1),y1=cy+rO*Math.sin(a1),ix1=cx+rI*Math.cos(a1),iy1=cy+rI*Math.sin(a1),ix0=cx+rI*Math.cos(a0),iy0=cy+rI*Math.sin(a0);return `M ${x0} ${y0} A ${rO} ${rO} 0 ${ang>180?1:0} 1 ${x1} ${y1} L ${ix1} ${iy1} A ${rI} ${rI} 0 ${ang>180?1:0} 0 ${ix0} ${iy0} Z`;})();
        return <div className="pointer-events-none fixed bottom-6 right-6 z-50 w-[470px] rounded-2xl border border-white/15 bg-[#101010]/95 p-4 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-red-400">Podgląd rozwinięcia 1:1</p><p className="mt-1 text-sm font-bold">{p.name}</p></div><span className="text-[10px] text-zinc-500">wymiary do wycięcia</span></div>
          <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-[#070707] p-2">
            <svg viewBox="0 0 520 330" className="h-64 w-full">
              <defs><linearGradient id="patternMetal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#b9bcc0"/><stop offset=".5" stopColor="#3b3d40"/><stop offset="1" stopColor="#777a7e"/></linearGradient></defs>
              <rect width="520" height="330" fill="#070707"/>
              {isCone ? <>
                <path d={sectorPath} fill="url(#patternMetal)" stroke="#e5e7eb" strokeWidth="2"/>
                <line x1="260" y1="228" x2="260" y2="78" stroke="#f87171" strokeDasharray="5 4"/>
                <line x1="260" y1="228" x2="260" y2="110" stroke="#f87171" strokeDasharray="5 4"/>
                <text x="268" y="96" fill="#fca5a5" fontSize="11" fontFamily="monospace">R2 {fmt(ro)} mm</text>
                <text x="268" y="128" fill="#fca5a5" fontSize="11" fontFamily="monospace">R1 {fmt(ri)} mm</text>
                <text x="260" y="315" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily="monospace">wycinek pierścienia • α {fmt(ang)}° • tworząca {fmt(sl)} mm</text>
                <text x="30" y="24" fill="#777" fontSize="10">ROZWINIĘCIE STOŻKA</text>
                {dim(78,255,442,255,`szer. po łuku ${fmt(W)} mm`)}
                <text x="35" y="295" fill="#777" fontSize="10">D1 {fmt(d1)} mm</text><text x="395" y="295" fill="#777" fontSize="10">D2 {fmt(d2)} mm</text>
              </> : <>
                <rect x="95" y="80" width="330" height="135" rx="2" fill="url(#patternMetal)" stroke="#e5e7eb" strokeWidth="2"/>
                {dim(95,240,425,240,`długość ${fmt(L)} mm`)}
                {dim(455,80,455,215,`szerokość ${fmt(W)} mm`)}
                <text x="260" y="150" textAnchor="middle" fill="#aaa" fontSize="12" fontFamily="monospace">ROZW. PROSTOKĄTNE</text>
                <text x="30" y="24" fill="#777" fontSize="10">BLANK DO WALCOWANIA</text>
                <text x="35" y="295" fill="#777" fontSize="10">dł. osiowa = {fmt(L)} mm</text><text x="300" y="295" fill="#777" fontSize="10">obwód = {fmt(W)} mm</text>
              </>}
            </svg>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
            {isCone ? <><div className="rounded-lg bg-white/[.04] p-2"><span className="text-zinc-500">D1 → D2</span><br/><b>{fmt(d1)} → {fmt(d2)} mm</b></div><div className="rounded-lg bg-white/[.04] p-2"><span className="text-zinc-500">Tworząca</span><br/><b>{fmt(sl)} mm</b></div><div className="rounded-lg bg-white/[.04] p-2"><span className="text-zinc-500">R wewn.</span><br/><b>{fmt(ri)} mm</b></div><div className="rounded-lg bg-white/[.04] p-2"><span className="text-zinc-500">R zewn. / α</span><br/><b>{fmt(ro)} mm / {fmt(ang)}°</b></div></> : <><div className="rounded-lg bg-white/[.04] p-2"><span className="text-zinc-500">Długość osiowa</span><br/><b>{fmt(L)} mm</b></div><div className="rounded-lg bg-white/[.04] p-2"><span className="text-zinc-500">Szerokość blanku</span><br/><b>{fmt(W)} mm</b></div></>}
          </div>
          <p className="mt-2 text-[9px] leading-4 text-zinc-600">{isCone?"To jest rzeczywisty rozwój stożka ściętego: wycinek pierścienia, nie trójkąt. Wymiary są liczone z D1, D2 i długości osiowej.":"Blank ma wymiar długość osiowa × obwód. Zakład spawalniczy i kerf można dodać jako osobną korektę."}</p>
        </div>})()}
      <div className="mt-3 rounded-xl border border-amber-500/15 bg-amber-500/[.05] p-3 text-[11px] leading-5 text-amber-200/80">To są wymiary rozwinięć dla prostych odcinków: prostokątów i wycinków stożków. Zakład na spawanie, kerf lasera oraz korektę po walcowaniu dodaj osobno. Kolanko nie jest tu udawane jako prostokąt — dla blachy wymaga osobnego rozwinięcia segmentowanego albo gotowego kolanka.</div></div>
     <div className="rounded-3xl border border-white/10 bg-white/[.035] p-5"><h2 className="font-bold">Kontrola</h2><div className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><span className="text-zinc-500">Długość strojenia</span><b>{round(r.tuned)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">Rura wlotowa</span><b>{round(r.header)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">Stinger</span><b>Ø {round(r.stinger)} × {round(r.stingerLength)} mm</b></div><div className="flex justify-between"><span className="text-zinc-500">EGT</span><b>{round(i.egt)}°C</b></div></div><div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/[.06] p-4 text-xs leading-5 text-zinc-300"><b className="text-white">Ważne:</b> to model akustyczny i proporcjonalny punktu startowego. Port timing, temperatura, kształt kanału, króciec, tłumik i straty przepływu zmieniają rzeczywisty wynik.</div></div></div>
    <div className="rounded-3xl border border-white/10 bg-black/20 p-5"><h2 className="font-bold">Model i założenia</h2><p className="mt-2 text-sm leading-6 text-zinc-400">Długość akustyczna jest tu traktowana jako model orientacyjny. Rzeczywista długość strojenia zależy m.in. od temperatury wzdłuż wydechu, prędkości dźwięku, korekty efektywnej długości oraz geometrii portu. Rozwinięcia blach są geometrią wykonawczą dla przyjętych wymiarów, ale nie są certyfikowanym projektem silnika.</p><p className="mt-3 text-xs text-zinc-600">Model nie jest pełną symulacją 1D gas-dynamics: temperatura wzdłuż układu, straty, korekta efektywnej długości, tłumik i dokładny kształt portu wymagają dalszej walidacji.</p></div>
   </section>

  </div>
 </div></main>;
}
