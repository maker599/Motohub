"use client";

type PortProjectionProps = {
  currentArc: number;
  bottomArc: number;
  targetArc: number;
  cutDepth: number;
  currentRoof: number;
  targetRoof: number;
  portHeight: number;
  count: number;
};

const fmt = (value: number, digits = 2) => value.toLocaleString("pl-PL", { maximumFractionDigits: digits, minimumFractionDigits: digits });

export default function PortProjection({ currentArc, bottomArc, targetArc, cutDepth, currentRoof, targetRoof, portHeight, count }: PortProjectionProps) {
  const center = 292;
  const scaleX = Math.min(3.2, 240 / Math.max(1, currentArc, bottomArc, targetArc));
  const currentHalf = currentArc * scaleX / 2;
  const bottomHalf = bottomArc * scaleX / 2;
  const targetHalf = targetArc * scaleX / 2;
  const currentY = 250;
  const deltaY = Math.min(122, Math.abs(cutDepth) * 12);
  const targetY = cutDepth > 0 ? currentY - deltaY : cutDepth < 0 ? currentY + deltaY : currentY;
  const verticalScale = Math.min(7, 122 / Math.max(12, portHeight + Math.max(0, cutDepth)));
  const portBottomY = currentY + portHeight * verticalScale;
  const targetPortBottomY = targetY + (portHeight + Math.max(0, cutDepth)) * verticalScale;
  const cutShape = `${center - targetHalf},${targetY} ${center + targetHalf},${targetY} ${center + currentHalf},${currentY} ${center - currentHalf},${currentY}`;
  const currentOpening = `${center - currentHalf},${currentY} ${center + currentHalf},${currentY} ${center + bottomHalf},${portBottomY} ${center - bottomHalf},${portBottomY}`;

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0b0d10] p-3 sm:p-4">
      <svg viewBox="0 0 900 390" role="img" aria-labelledby="projection-title projection-description" className="min-w-[720px] w-full">
        <title id="projection-title">Rzuty portu z obszarem obróbki</title>
        <desc id="projection-description">Rozwinięcie ściany cylindra pokazuje czerwone pole materiału do zebrania oraz szerokość i wysokość portu.</desc>
        <defs>
          <pattern id="projection-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#222a30" strokeWidth=".7" />
          </pattern>
          <pattern id="projection-cut" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="9" height="9" fill="#f34e3b" fillOpacity=".35" />
            <line x1="0" y1="0" x2="0" y2="9" stroke="#ffb0a4" strokeWidth="2" />
          </pattern>
        </defs>
        <rect x="20" y="35" width="550" height="325" rx="14" fill="#0f1317" stroke="#283139" />
        <rect x="20" y="35" width="550" height="325" rx="14" fill="url(#projection-grid)" />
        <text x="42" y="63" fill="#cbd5e1" fontSize="12" fontWeight="700" letterSpacing="1.3">ROZWINIĘCIE ŚCIANY CYLINDRA</text>
        <text x="42" y="83" fill="#71717a" fontSize="10">widok od strony kanału · skala ilustracyjna, wymiary liczbowe są podane obok</text>
        <path d={`M${currentOpening} Z`} fill="#050708" stroke="#8a959d" strokeWidth="1.5" />
        {cutDepth > 0 && <polygon points={cutShape} fill="url(#projection-cut)" stroke="#ff8877" strokeWidth="1.5" />}
        <line x1={center - targetHalf} y1={targetY} x2={center + targetHalf} y2={targetY} stroke={cutDepth > 0 ? "#fecaca" : "#67e8f9"} strokeWidth="2" strokeDasharray={cutDepth > 0 ? undefined : "6 4"} />
        <line x1={center - targetHalf} y1={targetY - 12} x2={center + targetHalf} y2={targetY - 12} stroke="#67e8f9" />
        <line x1={center - targetHalf} y1={targetY - 17} x2={center - targetHalf} y2={targetY - 7} stroke="#67e8f9" />
        <line x1={center + targetHalf} y1={targetY - 17} x2={center + targetHalf} y2={targetY - 7} stroke="#67e8f9" />
        <text x={center} y={Math.max(99, targetY - 22)} fill="#a5f3fc" fontSize="11" textAnchor="middle">łuk przy dachu docelowym {fmt(targetArc)} mm</text>
        <text x="548" y="302" fill="#a1a1aa" fontSize="10" textAnchor="end">łuk dolnej krawędzi obecnego okna {fmt(bottomArc)} mm</text>
        <line x1="520" y1={Math.min(currentY, targetY)} x2="520" y2={Math.max(currentY, targetY)} stroke="#fda4af" strokeWidth="1.5" />
        <line x1="514" y1={currentY} x2="526" y2={currentY} stroke="#fda4af" />
        <line x1="514" y1={targetY} x2="526" y2={targetY} stroke="#fda4af" />
        <text x="531" y={(currentY + targetY) / 2 + 4} fill="#fecaca" fontSize="11">{fmt(Math.abs(cutDepth))} mm</text>
        <text x="42" y="325" fill="#a1a1aa" fontSize="10">obecny dach {fmt(currentRoof)} mm od bloku</text>
        <text x="42" y="342" fill="#a1a1aa" fontSize="10">dach po obróbce {fmt(targetRoof)} mm od bloku</text>
        <text x="350" y="342" fill="#71717a" fontSize="10">czerwony szraf = materiał do zebrania</text>

        <rect x="594" y="35" width="286" height="325" rx="14" fill="#0f1317" stroke="#283139" />
        <text x="616" y="63" fill="#cbd5e1" fontSize="12" fontWeight="700" letterSpacing="1.2">RZUT BOCZNY</text>
        <text x="616" y="83" fill="#71717a" fontSize="10">wysokość okna i nowy dach</text>
        <path d={`M676 ${currentY - 93} H800 V${Math.min(324, targetPortBottomY)} H676 Z`} fill="#171d22" stroke="#53616b" />
        <rect x="715" y={Math.min(currentY, targetY)} width="48" height={Math.max(2, Math.abs(currentY - targetY))} fill={cutDepth > 0 ? "url(#projection-cut)" : "transparent"} stroke={cutDepth > 0 ? "#ff8877" : "transparent"} />
        <rect x="715" y={currentY} width="48" height={Math.max(8, portBottomY - currentY)} fill="#050708" stroke="#8a959d" />
        <line x1="782" y1={Math.min(currentY, targetY)} x2="782" y2={Math.max(currentY, targetY)} stroke="#fda4af" strokeWidth="1.5" />
        <line x1="776" y1={currentY} x2="788" y2={currentY} stroke="#fda4af" />
        <line x1="776" y1={targetY} x2="788" y2={targetY} stroke="#fda4af" />
        <text x="792" y={(currentY + targetY) / 2 + 4} fill="#fecaca" fontSize="10">Δ {fmt(Math.abs(cutDepth))} mm</text>
        <line x1="699" y1={currentY} x2="699" y2={portBottomY} stroke="#67e8f9" />
        <line x1="694" y1={currentY} x2="704" y2={currentY} stroke="#67e8f9" />
        <line x1="694" y1={portBottomY} x2="704" y2={portBottomY} stroke="#67e8f9" />
        <text x="616" y="342" fill="#a1a1aa" fontSize="10">okno obecne · {count} × {fmt(portHeight)} mm</text>
      </svg>
    </div>
  );
}
