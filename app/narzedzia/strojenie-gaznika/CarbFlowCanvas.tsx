"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import type { CarbState, FlowAnalysis } from "./carbPhysics";

type Hotspot = {
  id: "idle" | "mixture" | "needle" | "atomizer" | "main" | "pilot";
  name: string;
  desc: string;
  x: number;
  y: number;
  r: number;
};

type Props = {
  state: CarbState;
  analysis: FlowAnalysis;
  onUpdateState: (patch: Partial<CarbState>) => void;
  onFocusComponent?: (componentId: "mixture" | "idle" | "needle" | "main" | "pilot") => void;
};

type AirParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  opacity: number;
};

type FuelDroplet = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  source: "pilot" | "main";
  alpha: number;
};

export default function CarbFlowCanvas({
  state,
  analysis,
  onUpdateState,
  onFocusComponent,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [showOverlays, setShowOverlays] = useState({
    airParticles: true,
    fuelSpray: true,
    labels: true,
    heatMap: true,
  });

  const airParticlesRef = useRef<AirParticle[]>([]);
  const fuelDropletsRef = useRef<FuelDroplet[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const airParticles: AirParticle[] = [];
    for (let i = 0; i < 160; i++) {
      airParticles.push({
        x: Math.random() * 920,
        y: 190 + Math.random() * 80,
        vx: 2.5 + Math.random() * 3,
        vy: (Math.random() - 0.5) * 0.4,
        life: Math.random() * 100,
        maxLife: 50 + Math.random() * 80,
        size: 1.5 + Math.random() * 1.8,
        opacity: 0.3 + Math.random() * 0.6,
      });
    }
    airParticlesRef.current = airParticles;
  }, []);

  // Hotspoty na przekroju gaźnika
  const hotspots: Hotspot[] = useMemo(() => [
    {
      id: "idle",
      name: "Śruba oporowa jałowego (Idle Speed)",
      desc: "Ustala minimalne uniesienie suwaka i bazowe RPM",
      x: 395,
      y: 175,
      r: 22,
    },
    {
      id: "mixture",
      name: state.mixtureScrewType === "air" ? "Śruba powietrza (Air Screw)" : "Śruba paliwa (Fuel Screw)",
      desc: `${state.mixtureScrewTurns.toFixed(2)} obr. od oporu`,
      x: state.mixtureScrewType === "air" ? 340 : 580,
      y: 285,
      r: 20,
    },
    {
      id: "needle",
      name: `Iglica stożkowa ${state.needleName}`,
      desc: `Rowek klipsa: ${state.needleClip}/5 · Główny wpływ 1/4 - 3/4 gazu`,
      x: 460,
      y: 130,
      r: 26,
    },
    {
      id: "atomizer",
      name: `Rozpylacz Ø${state.atomizerDiameter} mm`,
      desc: "Prowadzi iglicę i podaje emulsję z komory pływakowej",
      x: 460,
      y: 265,
      r: 18,
    },
    {
      id: "main",
      name: `Dysza Główna #${state.mainJet}`,
      desc: "Decyduje o zasilaniu przy 75-100% otwarcia przepustnicy",
      x: 460,
      y: 435,
      r: 22,
    },
    {
      id: "pilot",
      name: `Dysza Wolnych Obrotów #${state.pilotJet}`,
      desc: "Zasila kanał biegu jałowego i otwory progresji",
      x: 375,
      y: 330,
      r: 18,
    },
  ], [state]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 920 / rect.width;
    const scaleY = 540 / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    for (const h of hotspots) {
      const dist = Math.hypot(clickX - h.x, clickY - h.y);
      if (dist <= h.r + 6) {
        if (onFocusComponent) {
          if (h.id === "idle" || h.id === "mixture" || h.id === "needle" || h.id === "main" || h.id === "pilot") {
            onFocusComponent(h.id);
          }
        }
        break;
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = 920 / rect.width;
    const scaleY = 540 / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let found: string | null = null;
    for (const h of hotspots) {
      const dist = Math.hypot(mouseX - h.x, mouseY - h.y);
      if (dist <= h.r + 6) {
        found = h.id;
        break;
      }
    }
    setHoveredHotspot(found);
  };

  // Główna pętla renderingu 60 FPS
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;
      timeRef.current += 1;
      const t = timeRef.current;

      const width = 920;
      const height = 540;

      // 1. Tło: Carbon / Obsidian Darkroom
      ctx.fillStyle = "#07080a";
      ctx.fillRect(0, 0, width, height);

      // Siatka inżynieryjna
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const step = 25;
      for (let x = 0; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Pozycjonowanie geometrii gaźnika
      const yCenter = 225;
      const xThroatCenter = 460;
      const boreRadius = (state.boreDiameter / 2) * 2.85; // px
      const topWallY = yCenter - boreRadius;
      const bottomWallY = yCenter + boreRadius;

      // Uniesienie suwaka
      const maxSlideTravel = boreRadius * 1.88;
      const slideLiftPx = (analysis.slideLiftMm / state.boreDiameter) * maxSlideTravel;
      const slideBottomY = bottomWallY - slideLiftPx;
      const slideTopY = slideBottomY - 145;
      const slideX = xThroatCenter - 22;
      const slideWidth = 44;

      // 3. Bernoulli Vacuum Heatmap
      if (showOverlays.heatMap) {
        const vacuumIntensity = Math.min(0.38, analysis.venturiVacuumKPa * 0.08);
        const heatGrad = ctx.createRadialGradient(
          xThroatCenter,
          bottomWallY - slideLiftPx * 0.5,
          10,
          xThroatCenter,
          yCenter,
          130
        );
        heatGrad.addColorStop(0, `rgba(6, 182, 212, ${vacuumIntensity})`);
        heatGrad.addColorStop(0.5, `rgba(14, 165, 233, ${vacuumIntensity * 0.4})`);
        heatGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = heatGrad;
        ctx.fillRect(280, topWallY - 20, 360, bottomWallY - topWallY + 40);
      }

      // 4. Masywny Korpus Aluminiowy Gaźnika (Metal CNC / Cast finish)
      const gradAlloy = ctx.createLinearGradient(0, 30, 0, 520);
      gradAlloy.addColorStop(0, "#2c3039");
      gradAlloy.addColorStop(0.15, "#1f2229");
      gradAlloy.addColorStop(0.5, "#15181e");
      gradAlloy.addColorStop(0.8, "#101216");
      gradAlloy.addColorStop(1, "#0a0b0e");

      ctx.fillStyle = gradAlloy;
      ctx.strokeStyle = "#474d5a";
      ctx.lineWidth = 2.5;

      // Górny odlew korpusu z wieżą suwaka
      ctx.beginPath();
      ctx.moveTo(35, yCenter - boreRadius - 40);
      ctx.quadraticCurveTo(220, topWallY - 14, slideX - 14, topWallY);
      // Wieża suwaka
      ctx.lineTo(slideX - 14, 52);
      ctx.lineTo(slideX + slideWidth + 14, 52);
      ctx.lineTo(slideX + slideWidth + 14, topWallY);
      ctx.quadraticCurveTo(680, topWallY - 10, 885, yCenter - boreRadius - 26);
      ctx.lineTo(885, 20);
      ctx.lineTo(35, 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Dolny odlew korpusu z kołnierzem
      ctx.beginPath();
      ctx.moveTo(35, yCenter + boreRadius + 40);
      ctx.quadraticCurveTo(220, bottomWallY + 14, xThroatCenter - 65, bottomWallY);
      ctx.lineTo(xThroatCenter + 65, bottomWallY);
      ctx.quadraticCurveTo(680, bottomWallY + 10, 885, yCenter + boreRadius + 26);
      ctx.lineTo(885, 530);
      ctx.lineTo(35, 530);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wnętrze gardzieli Venturiego
      const gradBore = ctx.createLinearGradient(0, topWallY, 0, bottomWallY);
      gradBore.addColorStop(0, "#050608");
      gradBore.addColorStop(0.5, "#0e1015");
      gradBore.addColorStop(1, "#050608");

      ctx.fillStyle = gradBore;
      ctx.beginPath();
      ctx.moveTo(35, yCenter - boreRadius - 40);
      ctx.quadraticCurveTo(220, topWallY - 14, xThroatCenter - 45, topWallY);
      ctx.lineTo(xThroatCenter + 45, topWallY);
      ctx.quadraticCurveTo(680, topWallY - 10, 885, yCenter - boreRadius - 26);
      ctx.lineTo(885, yCenter + boreRadius + 26);
      ctx.quadraticCurveTo(680, bottomWallY + 10, xThroatCenter + 45, bottomWallY);
      ctx.lineTo(xThroatCenter - 45, bottomWallY);
      ctx.quadraticCurveTo(220, bottomWallY + 14, 35, yCenter + boreRadius + 40);
      ctx.closePath();
      ctx.fill();

      // Flansza wlotowa (Bellmouth z rowkami pod opaskę filtra)
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(40, yCenter, 8, boreRadius + 38, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(65, yCenter, 6, boreRadius + 28, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Oznaczenie odlewu korpusu
      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.font = "bold 9px monospace";
      ctx.fillText(`DELLORTO PHBG ${state.boreDiameter}`, 130, yCenter - boreRadius - 24);

      // Flansza wylotowa do króćca (z gumowym łącznikiem i opaską)
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(880, yCenter, 8, boreRadius + 24, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Opaska zaciskowa króćca (Hose clamp ze śrubą)
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(840, yCenter, boreRadius + 18, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(835, yCenter - boreRadius - 22, 12, 8);

      // Oś gardzieli
      ctx.strokeStyle = "rgba(239, 68, 68, 0.2)";
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(35, yCenter);
      ctx.lineTo(885, yCenter);
      ctx.stroke();
      ctx.setLineDash([]);

      // 5. Pokrywa komory suwaka (Top Cap) z regulacją linki M6
      ctx.fillStyle = "#334155";
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(slideX - 18, 44, slideWidth + 36, 12, [4, 4, 0, 0]);
      ctx.fill();
      ctx.stroke();

      // Śruby M4 pokrywy
      ctx.fillStyle = "#94a3b8";
      ctx.beginPath();
      ctx.arc(slideX - 8, 50, 2.5, 0, Math.PI * 2);
      ctx.arc(slideX + slideWidth + 8, 50, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Wieżyczka regulacji linki (Brass cable adjuster tower & locknut)
      ctx.fillStyle = "#eab308";
      ctx.fillRect(xThroatCenter - 6, 26, 12, 18);
      // Radełkowana nakrętka kontrująca
      ctx.fillStyle = "#ca8a04";
      ctx.fillRect(xThroatCenter - 8, 36, 16, 6);
      // Czarny gumowy kapturek przeciwkurzowy (Rubber boot)
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.roundRect(xThroatCenter - 7, 10, 14, 18, 3);
      ctx.fill();

      // 6. Komora Pływakowa (Float Bowl) & Paliwo
      const bowlTopY = bottomWallY + 68;
      const bowlBottomY = 495;
      const bowlLeft = 265;
      const bowlRight = 655;

      // Miska komory
      const gradBowl = ctx.createLinearGradient(0, bowlTopY, 0, bowlBottomY);
      gradBowl.addColorStop(0, "#14171f");
      gradBowl.addColorStop(0.7, "#0c0e13");
      gradBowl.addColorStop(1, "#07080b");

      ctx.fillStyle = gradBowl;
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(bowlLeft, bowlTopY, bowlRight - bowlLeft, bowlBottomY - bowlTopY, [6, 6, 26, 26]);
      ctx.fill();
      ctx.stroke();

      // Czerwona uszczelka fibrowa
      ctx.fillStyle = "#991b1b";
      ctx.fillRect(bowlLeft + 2, bowlTopY - 4, bowlRight - bowlLeft - 4, 6);

      // Centralna mosiężna śruba spustowa komory (Bowl plug hex nut M14)
      ctx.fillStyle = "#eab308";
      ctx.strokeStyle = "#854d0e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(xThroatCenter - 22, bowlBottomY - 2, 44, 18, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#b45309";
      ctx.fillRect(xThroatCenter - 22, bowlBottomY - 4, 44, 3); // uszczelka fibrowa pod śrubą

      // Rurka przelewowa komory (Brass overflow standpipe)
      ctx.strokeStyle = "#ca8a04";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bowlRight - 35, bowlBottomY + 12);
      ctx.lineTo(bowlRight - 35, bowlTopY + 28);
      ctx.stroke();

      // Poziom paliwa (Benzyna 98 z falowaniem od RPM)
      const baseFuelHeightY = bowlTopY + 46 - state.floatLevelOffset * 4.5;
      const rpmVibe = Math.sin(t * 0.35) * Math.min(2.8, analysis.engineRpm / 3200);
      const fuelLevelY = baseFuelHeightY + rpmVibe;

      const gradGas = ctx.createLinearGradient(0, fuelLevelY, 0, bowlBottomY);
      gradGas.addColorStop(0, "rgba(245, 158, 11, 0.65)");
      gradGas.addColorStop(0.4, "rgba(217, 119, 6, 0.72)");
      gradGas.addColorStop(1, "rgba(180, 83, 9, 0.85)");

      ctx.fillStyle = gradGas;
      ctx.beginPath();
      ctx.moveTo(bowlLeft + 6, fuelLevelY);
      for (let fx = bowlLeft + 6; fx <= bowlRight - 6; fx += 14) {
        const wave = Math.sin((fx + t * 4) * 0.055) * (1.1 + analysis.engineRpm / 5000);
        ctx.lineTo(fx, fuelLevelY + wave);
      }
      ctx.lineTo(bowlRight - 6, bowlBottomY - 8);
      ctx.lineTo(bowlLeft + 6, bowlBottomY - 8);
      ctx.closePath();
      ctx.fill();

      // Połysk lustra benzyny
      ctx.strokeStyle = "rgba(254, 240, 138, 0.85)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(bowlLeft + 6, fuelLevelY);
      ctx.lineTo(bowlRight - 6, fuelLevelY);
      ctx.stroke();

      // Pływaki (Hollow floats)
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#64748b";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(bowlLeft + 20, fuelLevelY - 14, 70, 36, 8);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.roundRect(bowlRight - 90, fuelLevelY - 14, 70, 36, 8);
      ctx.fill();
      ctx.stroke();

      // Oś wahacza pływaka i zaworek iglicowy (Float arm & Viton valve)
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(bowlLeft + 60, fuelLevelY - 3);
      ctx.lineTo(xThroatCenter - 55, fuelLevelY - 24);
      ctx.lineTo(bowlRight - 60, fuelLevelY - 3);
      ctx.stroke();

      ctx.fillStyle = "#f8fafc";
      ctx.beginPath();
      ctx.moveTo(xThroatCenter - 58, fuelLevelY - 24);
      ctx.lineTo(xThroatCenter - 52, fuelLevelY - 24);
      ctx.lineTo(xThroatCenter - 55, fuelLevelY - 36);
      ctx.closePath();
      ctx.fill();

      // 7. Mosiężny Rozpylacz (Atomizer) & Dysza Główna (Main Jet)
      const atomizerX = xThroatCenter - 7;
      const atomizerWidth = 14;
      const atomizerTopY = bottomWallY - 16;
      const atomizerBottomY = bowlBottomY - 36;

      const gradBrass = ctx.createLinearGradient(atomizerX, 0, atomizerX + atomizerWidth, 0);
      gradBrass.addColorStop(0, "#ca8a04");
      gradBrass.addColorStop(0.35, "#fef08a");
      gradBrass.addColorStop(0.7, "#eab308");
      gradBrass.addColorStop(1, "#854d0e");

      ctx.fillStyle = gradBrass;
      ctx.strokeStyle = "#713f12";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(atomizerX, atomizerTopY, atomizerWidth, atomizerBottomY - atomizerTopY, [2, 2, 0, 0]);
      ctx.fill();
      ctx.stroke();

      // Wnętrze rozpylacza (studzienka)
      ctx.fillStyle = "#120e09";
      ctx.fillRect(atomizerX + 3.2, atomizerTopY, atomizerWidth - 6.4, atomizerBottomY - atomizerTopY);

      // Kanał powietrza hamującego (Main air bleed duct) łączący kielich z rozpylaczem
      ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(160, yCenter + boreRadius + 14);
      ctx.lineTo(atomizerX - 10, bottomWallY + 28);
      ctx.lineTo(atomizerX, bottomWallY + 28);
      ctx.stroke();

      // Pęcherzyki emulsji w kanale rozpylacza
      if (analysis.needleFuelFlow > 0.0005) {
        ctx.fillStyle = "rgba(254, 240, 138, 0.75)";
        for (let b = 0; b < 6; b++) {
          const by = bottomWallY + 20 + ((t * 2 + b * 28) % (bowlTopY - bottomWallY + 40));
          ctx.beginPath();
          ctx.arc(xThroatCenter + (b % 2 === 0 ? -1.5 : 1.5), by, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Otwory napowietrzające w rurce emulsyjnej
      ctx.fillStyle = "#fef08a";
      for (let hy = bottomWallY + 22; hy < bowlTopY + 20; hy += 18) {
        ctx.beginPath();
        ctx.arc(atomizerX + 2.5, hy, 1.6, 0, Math.PI * 2);
        ctx.arc(atomizerX + atomizerWidth - 2.5, hy, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dysza Główna (Main Jet)
      ctx.fillStyle = gradBrass;
      ctx.strokeStyle = "#713f12";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(atomizerX - 6, atomizerBottomY - 8, atomizerWidth + 12, 26, 4);
      ctx.fill();
      ctx.stroke();

      // Otwór dyszy głównej
      const mjHoleW = Math.max(2, (state.mainJet / 100) * 3.6);
      ctx.fillStyle = "#000000";
      ctx.fillRect(atomizerX + (atomizerWidth - mjHoleW) / 2, atomizerBottomY - 4, mjHoleW, 18);

      // Grawer rozmiaru dyszy
      ctx.fillStyle = "#3f2005";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`#${state.mainJet}`, xThroatCenter, atomizerBottomY + 10);

      // 8. Obwód Wolnych Obrotów (Pilot Jet & Mixture Screw)
      const pilotX = xThroatCenter - 85;
      const pilotY = bottomWallY + 46;

      ctx.fillStyle = gradBrass;
      ctx.strokeStyle = "#713f12";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(pilotX - 6, pilotY, 13, 38, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#2e1804";
      ctx.font = "bold 8px monospace";
      ctx.fillText(`#${state.pilotJet}`, pilotX + 0.5, pilotY + 22);

      // Kanalik pilotowy i otworek biegu jałowego
      ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pilotX + 0.5, pilotY);
      ctx.lineTo(pilotX + 0.5, bottomWallY + 4);
      ctx.lineTo(slideX + slideWidth + 15, bottomWallY + 4);
      ctx.lineTo(slideX + slideWidth + 15, bottomWallY - 2);
      ctx.stroke();

      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(slideX + slideWidth + 15, bottomWallY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Śruba regulacji mieszanki (Mixture screw)
      const isAir = state.mixtureScrewType === "air";
      const mixScrewX = isAir ? slideX - 98 : slideX + slideWidth + 82;
      const mixScrewY = bottomWallY + 12;

      ctx.fillStyle = "#374151";
      ctx.fillRect(mixScrewX - 12, mixScrewY - 8, 24, 16);

      const screwExtension = (state.mixtureScrewTurns / 4.0) * 14;
      const screwPinX = isAir ? mixScrewX + screwExtension : mixScrewX - screwExtension;

      ctx.fillStyle = gradBrass;
      ctx.strokeStyle = "#713f12";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(mixScrewX - (isAir ? 14 : 2), mixScrewY - 6, 16, 12);
      if (isAir) {
        ctx.moveTo(mixScrewX + 2, mixScrewY - 5);
        ctx.lineTo(screwPinX + 16, mixScrewY);
        ctx.lineTo(mixScrewX + 2, mixScrewY + 5);
      } else {
        ctx.moveTo(mixScrewX - 2, mixScrewY - 5);
        ctx.lineTo(screwPinX - 16, mixScrewY);
        ctx.lineTo(mixScrewX - 2, mixScrewY + 5);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Nacięcie na śrubokręt płaski
      const screwAngle = (state.mixtureScrewTurns * Math.PI * 2) % Math.PI;
      ctx.save();
      ctx.translate(mixScrewX - (isAir ? 12 : -12), mixScrewY);
      ctx.rotate(screwAngle);
      ctx.strokeStyle = "#18181b";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(5, 0);
      ctx.stroke();
      ctx.restore();

      // 9. Śruba Regulacji Obrotów Biegu Jałowego (Idle Speed Screw)
      const idleScrewX = slideX - 38;
      const idleScrewY = slideBottomY + 18;

      ctx.save();
      ctx.translate(idleScrewX, idleScrewY);
      ctx.rotate(-0.36);
      ctx.fillStyle = "#64748b";
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;
      ctx.fillRect(-24, -5, 36, 10);
      ctx.strokeRect(-24, -5, 36, 10);

      ctx.beginPath();
      ctx.moveTo(12, -5);
      ctx.lineTo(21, 0);
      ctx.lineTo(12, 5);
      ctx.closePath();
      ctx.fillStyle = "#cbd5e1";
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let sx = -18; sx < 8; sx += 4.5) {
        ctx.moveTo(sx, -7);
        ctx.lineTo(sx + 2.5, 7);
      }
      ctx.stroke();
      ctx.restore();

      // 10. Suwak Przepustnicy (Throttle Slide & Cutaway)
      const gradSlide = ctx.createLinearGradient(slideX, 0, slideX + slideWidth, 0);
      gradSlide.addColorStop(0, "#475569");
      gradSlide.addColorStop(0.2, "#cbd5e1");
      gradSlide.addColorStop(0.7, "#94a3b8");
      gradSlide.addColorStop(1, "#334155");

      ctx.fillStyle = gradSlide;
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 2;

      const cutawayH = (state.slideCutaway / 50) * 19;
      ctx.beginPath();
      ctx.moveTo(slideX, slideTopY);
      ctx.lineTo(slideX + slideWidth, slideTopY);
      ctx.lineTo(slideX + slideWidth, slideBottomY);
      ctx.lineTo(slideX + 16, slideBottomY);
      ctx.lineTo(slideX, slideBottomY - cutawayH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Sprężyna powrotna suwaka (Ściska się wraz z unoszeniem suwaka!)
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      const springTop = 56;
      const springBottom = slideTopY;
      const springCoils = 7;
      const springPitch = (springBottom - springTop) / springCoils;
      ctx.moveTo(xThroatCenter, springTop);
      for (let sc = 0; sc < springCoils; sc++) {
        const sy1 = springTop + sc * springPitch;
        const sy2 = sy1 + springPitch * 0.5;
        const sy3 = sy1 + springPitch;
        ctx.lineTo(xThroatCenter - 13, sy2);
        ctx.lineTo(xThroatCenter + 13, sy3);
      }
      ctx.stroke();

      // Linka gazu
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xThroatCenter, springBottom);
      ctx.lineTo(xThroatCenter, 22);
      ctx.stroke();

      // 11. IGLICA STOŻKOWA (JET NEEDLE) Z FIZYCZNYM PRZESUNIĘCIEM KLIPSA
      // Klips 1 = najwyższy rowek -> iglica wisi najgłębiej w rozpylaczu
      // Klips 5 = najniższy rowek -> iglica uniesiona najwyżej z rozpylacza
      // Każdy rowek klipsa przesuwa iglicę o 5.5 piksela w pionie!
      const clipVisualShift = (state.needleClip - 3) * 5.5; // px
      const needleHolderY = slideBottomY - 26 - clipVisualShift;
      const needleTopY = needleHolderY - 32;
      const needleTipY = bottomWallY + 76 - clipVisualShift;
      const needleX = xThroatCenter;

      // 5 laserowych rowków na iglicy
      ctx.strokeStyle = "#27272a";
      ctx.lineWidth = 1.4;
      for (let slot = 1; slot <= 5; slot++) {
        const slotY = needleTopY + slot * 4.6;
        ctx.beginPath();
        ctx.moveTo(needleX - 4.5, slotY);
        ctx.lineTo(needleX + 4.5, slotY);
        ctx.stroke();

        // Czerwony seger (E-clip) zatrzaśnięty w wybranym rowku
        if (slot === state.needleClip) {
          ctx.fillStyle = "#ef4444";
          ctx.strokeStyle = "#f87171";
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.roundRect(needleX - 7.5, slotY - 2, 15, 4.2, 1.8);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Trzonek i szlifowany stożek iglicy
      const gradNeedle = ctx.createLinearGradient(needleX - 3, 0, needleX + 3, 0);
      gradNeedle.addColorStop(0, "#f8fafc");
      gradNeedle.addColorStop(0.5, "#ffffff");
      gradNeedle.addColorStop(1, "#94a3b8");

      ctx.fillStyle = gradNeedle;
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(needleX - 2.6, needleTopY);
      ctx.lineTo(needleX + 2.6, needleTopY);
      const taperStartY = needleHolderY + 38;
      ctx.lineTo(needleX + 2.6, taperStartY);
      ctx.lineTo(needleX + 1.15, needleTipY);
      ctx.lineTo(needleX - 1.15, needleTipY);
      ctx.lineTo(needleX - 2.6, taperStartY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 12. Cząsteczki Przepływu Powietrza
      if (showOverlays.airParticles) {
        const particles = airParticlesRef.current;
        const speedMult = Math.max(0.7, analysis.airVelocityMs / 13);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx * speedMult;
          p.y += p.vy;

          if (p.x > 340 && p.x < 580) {
            const availableGap = bottomWallY - slideBottomY;
            const targetY = bottomWallY - availableGap * 0.5 + Math.sin(p.life) * availableGap * 0.35;
            p.y += (targetY - p.y) * 0.12;
            p.vx = 8.5 + speedMult * 1.9;
          } else {
            p.vx = 2.8 + speedMult * 0.45;
          }

          p.life += 1;
          if (p.life > p.maxLife || p.x > 875) {
            p.x = 45 + Math.random() * 30;
            p.y = topWallY + 8 + Math.random() * (bottomWallY - topWallY - 16);
            p.life = 0;
            p.vx = 2.5 + Math.random() * 2;
          }

          ctx.fillStyle = `rgba(56, 189, 248, ${p.opacity * 0.9})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(186, 230, 253, ${p.opacity * 0.45})`;
          ctx.lineWidth = p.size * 0.75;
          ctx.beginPath();
          ctx.moveTo(p.x - p.vx * 3.4, p.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      }

      // 13. Atomizacja i Rozpylenie Paliwa (Fuel Spray Plume)
      if (showOverlays.fuelSpray) {
        const droplets = fuelDropletsRef.current;

        if (analysis.needleFuelFlow > 0.001) {
          const sprayRate = Math.min(8, Math.max(1, Math.round(analysis.needleFuelFlow * 65)));
          for (let s = 0; s < sprayRate; s++) {
            droplets.push({
              x: xThroatCenter + (Math.random() - 0.5) * 6,
              y: atomizerTopY - 2,
              vx: 4.5 + Math.random() * (analysis.airVelocityMs * 0.13),
              vy: (Math.random() - 0.5) * 2.4,
              life: 0,
              maxLife: 35 + Math.random() * 35,
              size: analysis.afr < 11 ? 2.6 : analysis.afr > 14 ? 1.0 : 1.7,
              source: "main",
              alpha: 0.9,
            });
          }
        }

        if (analysis.pilotFuelFlow > 0.0005) {
          const pilotHoleX = slideX + slideWidth + 15;
          for (let ps = 0; ps < 2; ps++) {
            droplets.push({
              x: pilotHoleX,
              y: bottomWallY - 2,
              vx: 3 + Math.random() * 4,
              vy: -0.7 - Math.random() * 1.5,
              life: 0,
              maxLife: 32 + Math.random() * 24,
              size: 1.3,
              source: "pilot",
              alpha: 0.85,
            });
          }
        }

        let dropletFill = "rgba(245, 158, 11, 0.85)";
        if (analysis.afr > 14.5) {
          dropletFill = "rgba(147, 197, 253, 0.65)";
        } else if (analysis.afr < 11.0) {
          dropletFill = "rgba(239, 68, 68, 0.92)";
        }

        ctx.fillStyle = dropletFill;
        for (let dIdx = droplets.length - 1; dIdx >= 0; dIdx--) {
          const d = droplets[dIdx];
          d.x += d.vx;
          d.y += d.vy;
          d.life += 1;
          d.alpha = Math.max(0, 1 - d.life / d.maxLife);

          if (d.life > d.maxLife || d.x > 875) {
            droplets.splice(dIdx, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // Chmura aerozolu paliwowego
        const sprayCloudGrad = ctx.createRadialGradient(
          xThroatCenter + 70,
          yCenter,
          8,
          xThroatCenter + 140,
          yCenter,
          150
        );
        const sprayDensity = Math.min(0.48, analysis.totalFuelFlow * 8.5);
        sprayCloudGrad.addColorStop(0, `rgba(245, 158, 11, ${sprayDensity})`);
        sprayCloudGrad.addColorStop(0.55, `rgba(217, 119, 6, ${sprayDensity * 0.35})`);
        sprayCloudGrad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = sprayCloudGrad;
        ctx.fillRect(xThroatCenter, topWallY, 420, bottomWallY - topWallY);
      }

      // 14. Interaktywne Hotspoty z podświetleniem
      for (const h of hotspots) {
        const isHovered = hoveredHotspot === h.id;
        ctx.strokeStyle = isHovered ? "#38bdf8" : "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = isHovered ? 2 : 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        if (isHovered) {
          ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
          ctx.beginPath();
          ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 15. Etykiety i Linie
      if (showOverlays.labels) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";

        ctx.fillStyle = "#38bdf8";
        ctx.fillText("← FILTR POWIETRZA", 130, yCenter - boreRadius - 48);

        ctx.fillStyle = "#f87171";
        ctx.fillText("DO SILNIKA →", 750, yCenter - boreRadius - 34);

        ctx.fillStyle = "#e2e8f0";
        ctx.fillText(`SUWAK [${Math.round(state.throttle * 100)}%]`, xThroatCenter, 40);

        ctx.fillStyle = "#fde047";
        ctx.fillText(`IGLICA ${state.needleName} · ROWEK ${state.needleClip}`, xThroatCenter, slideTopY - 12);

        ctx.fillStyle = "#fbbf24";
        const mixLabelX = isAir ? slideX - 98 : slideX + slideWidth + 82;
        ctx.fillText(
          `ŚRUBA ${isAir ? "POWIETRZA" : "PALIWA"}: ${state.mixtureScrewTurns.toFixed(2)} OBR.`,
          mixLabelX,
          bottomWallY + 36
        );

        ctx.fillStyle = "#94a3b8";
        ctx.fillText("ŚRUBA JAŁOWEGO", slideX - 92, slideBottomY - 14);

        ctx.fillStyle = "#d97706";
        ctx.fillText("KOMORA PŁYWAKOWA", xThroatCenter, bowlBottomY - 12);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state, analysis, showOverlays, hoveredHotspot, hotspots]);

  return (
    <div
      ref={containerRef}
      className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#07080a] shadow-[0_20px_70px_rgba(0,0,0,0.85)] transition hover:border-red-500/30"
    >
      {/* Pasek narzędziowy / telemetry header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[.08] bg-[#0c0e13]/90 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              PRZEKRÓJ TECHNICZNY 2T · CAD X-RAY
            </span>
            <span className="ml-2 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
              Gardziel Ø{state.boreDiameter} mm
            </span>
          </div>
        </div>

        {/* Przełączniki warstw */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setShowOverlays((p) => ({ ...p, airParticles: !p.airParticles }))}
            className={`rounded-lg border px-2 py-0.5 text-[10.5px] font-semibold transition ${
              showOverlays.airParticles
                ? "border-sky-500/40 bg-sky-500/15 text-sky-200"
                : "border-white/5 bg-white/5 text-zinc-500"
            }`}
          >
            Powietrze
          </button>
          <button
            type="button"
            onClick={() => setShowOverlays((p) => ({ ...p, fuelSpray: !p.fuelSpray }))}
            className={`rounded-lg border px-2 py-0.5 text-[10.5px] font-semibold transition ${
              showOverlays.fuelSpray
                ? "border-amber-500/40 bg-amber-500/15 text-amber-200"
                : "border-white/5 bg-white/5 text-zinc-500"
            }`}
          >
            Atomizacja
          </button>
          <button
            type="button"
            onClick={() => setShowOverlays((p) => ({ ...p, heatMap: !p.heatMap }))}
            className={`rounded-lg border px-2 py-0.5 text-[10.5px] font-semibold transition ${
              showOverlays.heatMap
                ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-200"
                : "border-white/5 bg-white/5 text-zinc-500"
            }`}
          >
            Podciśnienie
          </button>
          <button
            type="button"
            onClick={() => setShowOverlays((p) => ({ ...p, labels: !p.labels }))}
            className={`rounded-lg border px-2 py-0.5 text-[10.5px] font-semibold transition ${
              showOverlays.labels
                ? "border-red-500/40 bg-red-500/15 text-red-200"
                : "border-white/5 bg-white/5 text-zinc-500"
            }`}
          >
            Podpisy
          </button>
        </div>
      </div>

      {/* Kontener Canvas */}
      <div className="relative aspect-[920/540] w-full min-h-[360px] sm:min-h-[440px] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={920}
          height={540}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoveredHotspot(null)}
          className="h-full w-full cursor-crosshair object-contain"
        />

        {/* Pływające wskaźniki telemetryczne HUD */}
        <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-black/70 p-3 text-[10.5px] font-mono shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between gap-5">
            <span className="text-zinc-400">Prędkość w gardzieli:</span>
            <span className="font-bold text-sky-400">{analysis.airVelocityMs.toFixed(1)} m/s</span>
          </div>
          <div className="flex items-center justify-between gap-5">
            <span className="text-zinc-400">Podciśnienie Venturiego:</span>
            <span className="font-bold text-amber-400">{analysis.venturiVacuumKPa.toFixed(2)} kPa</span>
          </div>
          <div className="flex items-center justify-between gap-5">
            <span className="text-zinc-400">Szczelina iglicy:</span>
            <span className="font-bold text-zinc-200">{analysis.needleAnnulusAreaMm2.toFixed(3)} mm²</span>
          </div>
          <div className="flex items-center justify-between gap-5">
            <span className="text-zinc-400">Przepływ paliwa:</span>
            <span className="font-bold text-rose-400">{(analysis.totalFuelFlow * 60).toFixed(2)} g/min</span>
          </div>
        </div>

        {/* Wskaźnik stanu mieszanki */}
        <div className="pointer-events-none absolute right-4 top-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/70 px-3.5 py-1.5 text-xs font-bold shadow-2xl backdrop-blur-md">
          <span
            className="size-2.5 rounded-full shadow-[0_0_8px_currentColor]"
            style={{
              color:
                analysis.condition === "optimal"
                  ? "#10b981"
                  : analysis.condition === "rich"
                  ? "#f59e0b"
                  : analysis.condition === "lean"
                  ? "#f97316"
                  : "#ef4444",
              backgroundColor: "currentColor",
            }}
          />
          <span className="text-white text-[11px]">{analysis.conditionLabel}</span>
        </div>

        {/* Podpowiedź po najechaniu na hotspot */}
        {hoveredHotspot && (
          <div className="pointer-events-none absolute bottom-4 right-4 max-w-xs rounded-2xl border border-sky-400/30 bg-black/85 p-3 text-xs shadow-2xl backdrop-blur-md">
            <p className="font-bold text-sky-300">
              {hotspots.find((h: Hotspot) => h.id === hoveredHotspot)?.name}
            </p>
            <p className="mt-1 text-[10.5px] leading-4 text-zinc-300">
              {hotspots.find((h: Hotspot) => h.id === hoveredHotspot)?.desc}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
