"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import SiteNav from "../../SiteNav";
import FieldHelp from "../FieldHelp";
import ToolOverlay from "../ToolOverlay";

type TuningInputs = {
  engineName: string;
  cylinderName: string;
  baseBore: number;
  fittedBore: number;
  stroke: number;
  rod: number;
  cylinders: number;
  maxRpm: number;
  targetRpm: number;
  exhaustDuration: number;
  transferDuration: number;
  clearanceVolume: number;
  carbName: string;
  carbDiameter: number;
  airVelocity: number;
  flowCoefficient: number;
  deliveryRatio: number;
  induction: string;
  exhaustName: string;
  pipeRpmLow: number;
  pipeRpmHigh: number;
  ambientC: number;
  pressureKpa: number;
  bmepLow: number;
  bmepHigh: number;
  useDyno: boolean;
  dynoPowerHp: number;
  dynoRpm: number;
  dynoUncertainty: number;
};

const initial: TuningInputs = {
  engineName: "Silnik 2T · baza własna", cylinderName: "Cylinder 2T · wpisz model",
  baseBore: 54, fittedBore: 54, stroke: 54, rod: 105, cylinders: 1,
  maxRpm: 13000, targetRpm: 8500, exhaustDuration: 190, transferDuration: 128, clearanceVolume: 6,
  carbName: "Gaźnik 28 mm · wpisz model", carbDiameter: 28, airVelocity: 60, flowCoefficient: 0.7,
  deliveryRatio: 1.1, induction: "Reed valve", exhaustName: "Komora rozprężna · wpisz model",
  pipeRpmLow: 8500, pipeRpmHigh: 11500, ambientC: 20, pressureKpa: 101.3,
  bmepLow: 6.5, bmepHigh: 10, useDyno: false, dynoPowerHp: 0, dynoRpm: 10000, dynoUncertainty: 10,
};

const FIELD_HELP: Record<string, string> = {
  "base-engine-name": "Nazwa opisowa bazy silnika. Odczytaj oznaczenie z karteru lub dokumentacji; sama nazwa nie wpływa na obliczenia.",
  "base-bore": "Średnica cylindra bazowego przed montażem zestawu. Zmierz średnicówką lub odczytaj z dokumentacji wału/karterów.",
  "engine-stroke": "Skok tłoka od GMP do DMP. Odczytaj specyfikację wału albo zmierz czujnikiem zegarowym przy pełnym obrocie wału.",
  "rod-length": "Odległość między osiami sworznia tłoka i czopa korbowodu. Odczytaj kartę wału lub zmierz rozstaw osi po rozebraniu wału.",
  "engine-cylinders": "Liczba cylindrów silnika. Odczytaj z konstrukcji lub dokumentacji.",
  "cylinder-name": "Nazwa opisowa zestawu. Odczytaj z odlewu, pudełka lub dokumentacji; obliczenia wykorzystują osobno wpisane wymiary.",
  "fitted-bore": "Średnica cylindra po montażu. Zmierz średnicówką w kilku kierunkach i na kilku wysokościach; wpisz średnicę roboczą, nie sam rozmiar tłoka.",
  "exhaust-duration": "Czas otwarcia wydechu w stopniach wału. Zmierz tarczą stopniową i czujnikiem zegarowym przy krawędzi okna lub odczytaj zweryfikowaną specyfikację cylindra.",
  "transfer-duration": "Czas otwarcia transferów w stopniach wału. Zmierz tak samo jak wydech, obserwując moment odsłonięcia okna transferowego.",
  "clearance-volume": "Objętość komory spalania przy tłoku w GMP. Zmierz przez otwór świecy biuretą z płytką uszczelniającą komorę; wpisz cm³.",
  "carb-name": "Nazwa opisowa gaźnika. Odczytaj producenta i model z korpusu; obliczenia opierają się na zmierzonej gardzieli.",
  "carb-diameter": "Średnica najmniejszego przekroju gardzieli, nie średnica króćca ani zewnętrznego wlotu. Zmierz średnicówką lub suwmiarką wewnętrzną.",
  "induction-type": "Typ układu sterującego dopływem mieszanki. Rozpoznaj po konstrukcji: membrana, sterowanie tłokiem, zawór obrotowy lub wtrysk.",
  "air-velocity": "Założona średnia prędkość przepływu w gardzieli używana w modelu granicy przepustowości. To wartość modelowa; dobierz z pomiaru przepływu lub sprawdź kilka scenariuszy.",
  "flow-coefficient": "Współczynnik uwzględniający straty w gardzieli i dolocie (0–1). Odczytaj z pomiaru przepływowego lub dokumentacji; bez danych pozostaje założeniem modelu.",
  "delivery-ratio": "Stosunek świeżego ładunku dostarczonego podczas cyklu do pojemności skokowej. Odczytaj z modelu wymiany ładunku albo pomiaru stanowiskowego; zmień wartość, by porównać scenariusze.",
  "exhaust-name": "Nazwa opisowa wydechu. Odczytaj z oznaczenia producenta; zakres pracy poniżej wprowadź z dokumentacji lub pomiaru.",
  "pipe-rpm-low": "Dolna granica użytecznego pasma obrotów tej komory. Odczytaj z dokumentacji albo wykresu mocy/momentu z hamowni.",
  "pipe-rpm-high": "Górna granica użytecznego pasma komory. Odczytaj z dokumentacji lub z końca zakresu, w którym wykres hamowni utrzymuje użyteczną moc.",
  "target-rpm": "Obroty, dla których pokazany jest scenariusz mocy. Ustal z oczekiwanego punktu pracy lub wybierz szczyt z wykresu hamowni; nie przekraczaj limitu silnika.",
  "max-rpm": "Maksymalne obroty dopuszczone w tej konfiguracji. Odczytaj limit zapłonu/ECU albo zweryfikowany limit mechaniczny; nie traktuj go jako zalecenia do przekraczania bezpiecznych obrotów.",
  "bmep-low": "Dolne założenie średniego ciśnienia użytecznego w barach, które tworzy dolny scenariusz mocy. To nie jest bezpośredni pomiar z suwmiarki; wyprowadź z momentu na hamowni albo przyjmij jako założenie i porównaj zakresy.",
  "bmep-high": "Górne założenie średniego ciśnienia użytecznego w barach. Wyprowadź z momentu z hamowni lub traktuj jako optymistyczny scenariusz; nie jest gwarantowaną mocą.",
  "dyno-power": "Moc zmierzona na hamowni w wybranym punkcie. Odczytaj z wykresu lub raportu; użyj tej samej konwencji mocy (na wale albo kole) przy porównaniu.",
  "dyno-rpm": "Obroty odpowiadające wpisanej mocy bazowej. Odczytaj z tego samego punktu wykresu hamowni.",
  "dyno-uncertainty": "Przyjęta niepewność punktu kalibracyjnego w procentach. Oszacuj z rozrzutu powtórzonych pomiarów albo dokładności stanowiska.",
  "ambient-temperature": "Temperatura powietrza na wlocie, wpływająca na jego gęstość. Odczytaj z czujnika przy filtrze/airboxie podczas pomiaru.",
  "ambient-pressure": "Ciśnienie bezwzględne otoczenia w kPa. Odczytaj z barometru lub raportu hamowni; ciśnienie atmosferyczne nie jest tym samym co ciśnienie doładowania.",
};

const fmt = (n: number, digits = 1) => Number.isFinite(n)
  ? n.toLocaleString("pl-PL", { minimumFractionDigits: digits, maximumFractionDigits: digits })
  : "—";

function NumberField({
  id, label, unit, value, onChange, min = 0, max, step = "0.1",
}: {
  id: string; label: string; unit: string; value: number; onChange: (raw: string) => void;
  min?: number; max?: number; step?: string;
}) {
  return <label htmlFor={id} className="block">
    <span className="mb-2 flex items-center justify-between gap-2 text-xs text-zinc-400"><span className="flex min-w-0 items-center">{label}<FieldHelp text={FIELD_HELP[id]} /></span><span className="shrink-0 text-zinc-600">{unit}</span></span>
    <input id={id} type="number" inputMode="decimal" min={min} max={max} step={step} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-400/70" />
  </label>;
}

function TextField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (value: string) => void }) {
  return <label htmlFor={id} className="block">
    <span className="mb-2 flex items-center text-xs text-zinc-400">{label}<FieldHelp text={FIELD_HELP[id]} /></span>
    <input id={id} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-400/70" />
  </label>;
}

function SelectField({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label htmlFor={id} className="block">
    <span className="mb-2 flex items-center text-xs text-zinc-400">{label}<FieldHelp text={FIELD_HELP[id]} /></span>
    <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-white/10 bg-[#101010] px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-400/70">{options.map((option) => <option key={option}>{option}</option>)}</select>
  </label>;
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
    <h2 className="font-bold">{title}</h2>{hint && <p className="mt-1 text-xs leading-5 text-zinc-500">{hint}</p>}
    <div className="mt-4 space-y-4">{children}</div>
  </section>;
}

export default function Tuning2TStudio() {
  const [v, setV] = useState(initial);
  const update = <K extends keyof TuningInputs>(key: K, raw: string) => setV((current) => ({
    ...current,
    [key]: typeof current[key] === "string" ? raw : raw === "" ? 0 : Number(raw),
  }));

  const result = useMemo(() => {
    const errors: string[] = [];
    const numeric = [v.baseBore, v.fittedBore, v.stroke, v.rod, v.cylinders, v.maxRpm, v.targetRpm,
      v.exhaustDuration, v.transferDuration, v.clearanceVolume, v.carbDiameter, v.airVelocity,
      v.flowCoefficient, v.deliveryRatio, v.pipeRpmLow, v.pipeRpmHigh, v.ambientC, v.pressureKpa,
      v.bmepLow, v.bmepHigh, v.dynoPowerHp, v.dynoRpm, v.dynoUncertainty];
    if (!numeric.every(Number.isFinite)) errors.push("Uzupełnij pola liczbowe poprawnymi wartościami.");
    if (v.baseBore <= 0 || v.fittedBore <= 0 || v.stroke <= 0) errors.push("Średnice i skok muszą być większe od zera.");
    if (v.rod <= v.stroke / 2) errors.push("Długość korbowodu musi być większa niż promień wykorbienia.");
    if (v.cylinders < 1 || !Number.isInteger(v.cylinders)) errors.push("Liczba cylindrów musi być dodatnią liczbą całkowitą.");
    if (v.targetRpm <= 0 || v.maxRpm <= 0 || v.targetRpm > v.maxRpm) errors.push("RPM szczytu musi być dodatnie i nie może przekraczać limitu obrotów silnika.");
    if (v.exhaustDuration <= 0 || v.exhaustDuration >= 360 || v.transferDuration <= 0 || v.transferDuration >= 360) errors.push("Czasy otwarcia portów muszą mieścić się między 0° a 360°.");
    if (v.transferDuration >= v.exhaustDuration) errors.push("Transfer nie może otwierać się przed portem wydechowym w tym symetrycznym modelu.");
    if (v.clearanceVolume <= 0) errors.push("Objętość komory spalania musi być większa od zera.");
    if (v.carbDiameter <= 0 || v.airVelocity <= 0 || v.flowCoefficient <= 0 || v.flowCoefficient > 1 || v.deliveryRatio <= 0) errors.push("Sprawdź parametry przepływu gaźnika.");
    if (v.pipeRpmLow <= 0 || v.pipeRpmHigh <= v.pipeRpmLow) errors.push("Zakres RPM wydechu musi mieć dodatnią dolną i większą górną granicę.");
    if (v.pressureKpa <= 0 || v.ambientC <= -273.15) errors.push("Warunki otoczenia są poza zakresem fizycznym.");
    if (!v.useDyno && (v.bmepLow <= 0 || v.bmepHigh < v.bmepLow)) errors.push("Zakres BMEP musi być dodatni, a górna granica nie mniejsza od dolnej.");
    if (v.useDyno && (v.dynoPowerHp <= 0 || v.dynoRpm <= 0 || v.dynoUncertainty < 0 || v.dynoUncertainty >= 100)) errors.push("Wpisz dodatni wynik hamowni i RPM oraz niepewność od 0 do 99%.");

    const baseDisplacementCc = Math.PI / 4 * v.baseBore ** 2 * v.stroke * v.cylinders / 1000;
    const displacementCc = Math.PI / 4 * v.fittedBore ** 2 * v.stroke * v.cylinders / 1000;
    const displacementL = displacementCc / 1000;
    const meanPistonSpeed = 2 * v.stroke * v.targetRpm / 60000;
    const rodRatio = v.rod / v.stroke;
    const crankRadius = v.stroke / 2;
    const closingAngle = (360 - v.exhaustDuration) / 2;
    const angleRad = closingAngle * Math.PI / 180;
    const underRod = Math.max(0, v.rod ** 2 - (crankRadius * Math.sin(angleRad)) ** 2);
    const pistonDropAtExhaustClose = crankRadius * (1 - Math.cos(angleRad)) + v.rod - Math.sqrt(underRod);
    const areaMm2 = Math.PI / 4 * v.fittedBore ** 2;
    const trappedVolumeCc = v.clearanceVolume + areaMm2 * pistonDropAtExhaustClose / 1000;
    const trappedCompressionRatio = trappedVolumeCc / v.clearanceVolume;
    const geometricCompressionRatio = (displacementCc / v.cylinders + v.clearanceVolume) / v.clearanceVolume;
    const blowdown = (v.exhaustDuration - v.transferDuration) / 2;
    const airDensity = v.pressureKpa * 1000 / (287.05 * (v.ambientC + 273.15));
    const densityFactor = airDensity / 1.204;
    const requestedAirFlow = displacementCc / 1_000_000 * v.targetRpm / 60 * v.deliveryRatio;
    const carbArea = Math.PI / 4 * (v.carbDiameter / 1000) ** 2;
    const carbAirFlow = carbArea * v.airVelocity * v.flowCoefficient;
    const carbFlowRatio = carbAirFlow / requestedAirFlow;
    const carbPowerFactor = Math.min(1, carbFlowRatio);
    const pipeInBand = v.targetRpm >= v.pipeRpmLow && v.targetRpm <= v.pipeRpmHigh;
    const pipeDistance = pipeInBand ? 0 : Math.min(Math.abs(v.targetRpm - v.pipeRpmLow), Math.abs(v.targetRpm - v.pipeRpmHigh));
    const basePowerKw = v.dynoPowerHp / 1.359621617;
    const measuredBmep = v.useDyno && baseDisplacementCc > 0 && v.dynoRpm > 0
      ? basePowerKw * 600 / ((baseDisplacementCc / 1000) * v.dynoRpm) : 0;
    const bmepLow = v.useDyno ? measuredBmep * (1 - v.dynoUncertainty / 100) : v.bmepLow;
    const bmepHigh = v.useDyno ? measuredBmep * (1 + v.dynoUncertainty / 100) : v.bmepHigh;
    const powerLowKw = bmepLow * displacementL * v.targetRpm / 600 * densityFactor * carbPowerFactor;
    const powerHighKw = bmepHigh * displacementL * v.targetRpm / 600 * densityFactor * carbPowerFactor;
    const torqueLow = powerLowKw * 9549.2966 / Math.max(v.targetRpm, 1);
    const torqueHigh = powerHighKw * 9549.2966 / Math.max(v.targetRpm, 1);
    const valid = errors.length === 0;
    return {
      errors, valid, baseDisplacementCc, displacementCc, meanPistonSpeed, rodRatio, trappedCompressionRatio,
      geometricCompressionRatio, blowdown, airDensity, densityFactor, requestedAirFlow, carbAirFlow, carbFlowRatio,
      carbPowerFactor, pipeInBand, pipeDistance, measuredBmep, bmepLow, bmepHigh, powerLowKw, powerHighKw,
      powerLowHp: powerLowKw * 1.359621617, powerHighHp: powerHighKw * 1.359621617, torqueLow, torqueHigh,
    };
  }, [v]);

  return <main className="min-h-screen bg-[#090909] text-white">
    <div className="mx-auto max-w-7xl px-5 py-5 lg:px-8">
      <SiteNav />
      <ToolOverlay active="tuning" title="Analizator tuningu 2T" description="Zestaw bazę silnika z cylindrem, gaźnikiem i wydechem. Zobacz zakres mocy przy wybranych RPM, kontrolę wydajności dolotu i zgodność zakresu komory. Własne nazwy części nie zastępują ich zmierzonych parametrów."><b className="text-red-200">Szacunek scenariuszowy, nie wynik hamowni</b><br />Model liczy moc z BMEP, pojemności, RPM, gęstości powietrza i uproszczonej granicy przepływu gaźnika. Dopasowanie wydechu pokazuje osobno.</ToolOverlay>

      <div className="mt-7 grid gap-5 xl:grid-cols-[390px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <Section title="01 · Baza silnika" hint="Wymiary wału i karterów, które pozostają w konfiguracji.">
            <TextField id="base-engine-name" label="Silnik bazowy" value={v.engineName} onChange={(value) => update("engineName", value)} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField id="base-bore" label="Średnica bazowa" unit="mm" min={1} step="0.01" value={v.baseBore} onChange={(raw) => update("baseBore", raw)} />
              <NumberField id="engine-stroke" label="Skok wału" unit="mm" min={1} step="0.01" value={v.stroke} onChange={(raw) => update("stroke", raw)} />
              <NumberField id="rod-length" label="Korbowód · osie" unit="mm" min={1} step="0.1" value={v.rod} onChange={(raw) => update("rod", raw)} />
              <NumberField id="engine-cylinders" label="Liczba cylindrów" unit="szt." min={1} step="1" value={v.cylinders} onChange={(raw) => update("cylinders", raw)} />
            </div>
            <p className="rounded-xl border border-white/5 bg-black/20 p-3 text-[11px] leading-5 text-zinc-500">Baza ma nazwę opisową. Moc i pojemność wynikają z pól liczbowych, nie z wyboru marki silnika.</p>
          </Section>

          <Section title="02 · Założony cylinder" hint="Wpisz bore, timingi i komorę z dokumentacji lub własnego pomiaru.">
            <TextField id="cylinder-name" label="Marka / model cylindra" value={v.cylinderName} onChange={(value) => update("cylinderName", value)} />
            <NumberField id="fitted-bore" label="Średnica cylindra po montażu" unit="mm" min={1} step="0.01" value={v.fittedBore} onChange={(raw) => update("fittedBore", raw)} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField id="exhaust-duration" label="Czas wydechu" unit="° wału" min={1} max={359} step="0.1" value={v.exhaustDuration} onChange={(raw) => update("exhaustDuration", raw)} />
              <NumberField id="transfer-duration" label="Czas transferów" unit="° wału" min={1} max={359} step="0.1" value={v.transferDuration} onChange={(raw) => update("transferDuration", raw)} />
            </div>
            <NumberField id="clearance-volume" label="Objętość komory przy GMP" unit="cm³" min={0.1} step="0.1" value={v.clearanceVolume} onChange={(raw) => update("clearanceVolume", raw)} />
            <p className="rounded-xl border border-white/5 bg-black/20 p-3 text-[11px] leading-5 text-zinc-500">Pojemność liczy się z bore cylindra i skoku wału. Stopień sprężania uwięzionego ładunku wykorzystuje zamknięcie wydechu oraz kinematykę korbowodu.</p>
          </Section>

          <Section title="03 · Gaźnik i dolot" hint="Średnica gardzieli daje przybliżony przepływ; nie wyznacza dyszy ani składu mieszanki.">
            <TextField id="carb-name" label="Marka / model gaźnika" value={v.carbName} onChange={(value) => update("carbName", value)} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField id="carb-diameter" label="Średnica gardzieli" unit="mm" min={1} step="0.1" value={v.carbDiameter} onChange={(raw) => update("carbDiameter", raw)} />
              <SelectField id="induction-type" label="Typ dolotu" value={v.induction} options={["Reed valve", "Tłokowy", "Zawór rotacyjny", "Wtrysk", "Inny"]} onChange={(value) => update("induction", value)} />
            </div>
            <details className="rounded-xl border border-white/10 bg-black/15 p-3">
              <summary className="cursor-pointer text-xs font-semibold text-zinc-300">Założenia przepływu gaźnika</summary>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <NumberField id="air-velocity" label="Prędkość modelowa w gardzieli" unit="m/s" min={1} step="1" value={v.airVelocity} onChange={(raw) => update("airVelocity", raw)} />
                <NumberField id="flow-coefficient" label="Współczynnik przepływu" unit="0–1" min={0.01} max={1} step="0.01" value={v.flowCoefficient} onChange={(raw) => update("flowCoefficient", raw)} />
                <div className="col-span-2"><NumberField id="delivery-ratio" label="Względny przepływ ładunku" unit="× pojemność / obrót" min={0.1} step="0.05" value={v.deliveryRatio} onChange={(raw) => update("deliveryRatio", raw)} /></div>
              </div>
            </details>
          </Section>

          <Section title="04 · Wydech i zakres pracy" hint="Wpisz znane RPM użytecznego zakresu konkretnej komory, np. z dokumentacji lub pomiaru.">
            <TextField id="exhaust-name" label="Marka / model wydechu" value={v.exhaustName} onChange={(value) => update("exhaustName", value)} />
            <div className="grid grid-cols-2 gap-3">
              <NumberField id="pipe-rpm-low" label="Początek pasma" unit="rpm" min={1} step="100" value={v.pipeRpmLow} onChange={(raw) => update("pipeRpmLow", raw)} />
              <NumberField id="pipe-rpm-high" label="Koniec pasma" unit="rpm" min={1} step="100" value={v.pipeRpmHigh} onChange={(raw) => update("pipeRpmHigh", raw)} />
              <NumberField id="target-rpm" label="RPM ocenianego szczytu" unit="rpm" min={1} step="100" value={v.targetRpm} onChange={(raw) => update("targetRpm", raw)} />
              <NumberField id="max-rpm" label="Limit obrotów silnika" unit="rpm" min={1} step="100" value={v.maxRpm} onChange={(raw) => update("maxRpm", raw)} />
            </div>
          </Section>

          <Section title="05 · Założenie mocy i warunki" hint="Użyj szerokiego zakresu scenariuszowego albo skalibruj punkt odniesienia wynikiem z hamowni.">
            <div className="grid grid-cols-2 gap-2" role="group" aria-label="Źródło założenia mocy">
              <button type="button" title="Wprowadź dolne i górne założenie BMEP, aby zobaczyć zakres scenariuszowy mocy." aria-pressed={!v.useDyno} onClick={() => setV((current) => ({ ...current, useDyno: false }))} className={`rounded-xl border p-3 text-left text-xs font-semibold ${!v.useDyno ? "border-orange-300/40 bg-orange-300/10 text-orange-100" : "border-white/10 text-zinc-500"}`}>Zakres BMEP</button>
              <button type="button" title="Skalibruj wynik modelem mocy bazowej i RPM zmierzonym na hamowni." aria-pressed={v.useDyno} onClick={() => setV((current) => ({ ...current, useDyno: true }))} className={`rounded-xl border p-3 text-left text-xs font-semibold ${v.useDyno ? "border-orange-300/40 bg-orange-300/10 text-orange-100" : "border-white/10 text-zinc-500"}`}>Kalibracja hamownią</button>
            </div>
            {!v.useDyno ? <div className="grid grid-cols-2 gap-3">
              <NumberField id="bmep-low" label="BMEP · dolny scenariusz" unit="bar" min={0.1} step="0.1" value={v.bmepLow} onChange={(raw) => update("bmepLow", raw)} />
              <NumberField id="bmep-high" label="BMEP · górny scenariusz" unit="bar" min={0.1} step="0.1" value={v.bmepHigh} onChange={(raw) => update("bmepHigh", raw)} />
            </div> : <>
              <div className="grid grid-cols-2 gap-3">
                <NumberField id="dyno-power" label="Moc bazowa z hamowni" unit="hp" min={0.1} step="0.1" value={v.dynoPowerHp} onChange={(raw) => update("dynoPowerHp", raw)} />
                <NumberField id="dyno-rpm" label="RPM pomiaru mocy" unit="rpm" min={1} step="100" value={v.dynoRpm} onChange={(raw) => update("dynoRpm", raw)} />
              </div>
              <NumberField id="dyno-uncertainty" label="Zakres niepewności kalibracji" unit="%" min={0} max={99} step="1" value={v.dynoUncertainty} onChange={(raw) => update("dynoUncertainty", raw)} />
            </>}
            <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
              <NumberField id="ambient-temperature" label="Temperatura powietrza" unit="°C" min={-40} step="0.5" value={v.ambientC} onChange={(raw) => update("ambientC", raw)} />
              <NumberField id="ambient-pressure" label="Ciśnienie atmosferyczne" unit="kPa" min={1} step="0.1" value={v.pressureKpa} onChange={(raw) => update("pressureKpa", raw)} />
            </div>
          </Section>
        </aside>

        <section className="min-w-0 space-y-5">
          {result.valid ? <>
            <div className="rounded-3xl border border-orange-300/20 bg-gradient-to-br from-orange-300/[.10] to-white/[.025] p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.24em] text-orange-200">Moc scenariuszowa przy {fmt(v.targetRpm, 0)} rpm</p><h2 className="mt-3 text-4xl font-black tabular-nums sm:text-6xl">{fmt(result.powerLowHp, 1)}–{fmt(result.powerHighHp, 1)} <span className="text-2xl text-orange-100/75 sm:text-3xl">hp</span></h2><p className="mt-2 text-sm text-zinc-400">{fmt(result.powerLowKw, 1)}–{fmt(result.powerHighKw, 1)} kW · wał korbowy · szacowane {fmt(result.torqueLow, 1)}–{fmt(result.torqueHigh, 1)} Nm</p></div>
                <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3"><p className="text-xs text-zinc-500">BMEP modelu</p><p className="mt-1 font-mono text-lg font-bold">{fmt(result.bmepLow, 2)}–{fmt(result.bmepHigh, 2)} bar</p><p className="text-[10px] text-zinc-500">{v.useDyno ? "wyprowadzone z punktu hamowni" : "zakres przyjęty przez użytkownika"}</p></div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-200" style={{ width: `${Math.max(8, Math.min(100, result.carbPowerFactor * 100))}%` }} /></div>
              <p className="mt-2 text-xs leading-5 text-zinc-500">Zakres wynika z BMEP × pojemność × RPM. Model koryguje limit przepływu gaźnika i gęstość powietrza; nie dopisuje automatycznego „zysku” za samą markę części.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {[
                ["Pojemność z cylindrem", `${fmt(result.displacementCc, 1)} cm³`],
                ["Średnia prędkość tłoka", `${fmt(result.meanPistonSpeed, 1)} m/s`],
                ["Sprężanie uwięzionego ładunku", `${fmt(result.trappedCompressionRatio, 2)}:1`],
                ["Blowdown", `${fmt(result.blowdown, 1)}°`],
              ].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.035] p-4"><p className="text-xs leading-5 text-zinc-500">{label}</p><p className="mt-2 text-xl font-black tabular-nums">{value}</p></div>)}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
                <h2 className="font-bold">Dopasowanie gaźnika</h2>
                <p className="mt-1 text-xs text-zinc-500">{v.carbName} · {v.induction}</p>
                <dl className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-zinc-500">Szacowany przepływ gardzieli</dt><dd className="font-mono">{fmt(result.carbAirFlow * 1000, 1)} l/s</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-zinc-500">Przepływ wymagany w modelu</dt><dd className="font-mono">{fmt(result.requestedAirFlow * 1000, 1)} l/s</dd></div>
                  <div className="flex justify-between gap-3 border-t border-white/10 pt-3"><dt className="text-zinc-300">Pojemność przepływu / zapotrzebowanie</dt><dd className={`font-mono font-bold ${result.carbFlowRatio >= 1 ? "text-emerald-300" : "text-amber-200"}`}>{fmt(result.carbFlowRatio * 100, 0)}%</dd></div>
                </dl>
                <p className="mt-4 rounded-xl bg-black/25 p-3 text-[11px] leading-5 text-zinc-500">Przepływ modelowy = pole gardzieli × prędkość × współczynnik. Nie uwzględnia sygnału podciśnienia, pulsacji, przepływu zaworu ani strojenia dysz.</p>
              </section>

              <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
                <h2 className="font-bold">Dopasowanie wydechu</h2>
                <p className="mt-1 text-xs text-zinc-500">{v.exhaustName}</p>
                <div className={`mt-5 rounded-2xl border p-4 ${result.pipeInBand ? "border-emerald-300/20 bg-emerald-300/[.06]" : "border-amber-300/20 bg-amber-300/[.06]"}`}>
                  <p className={`text-sm font-bold ${result.pipeInBand ? "text-emerald-200" : "text-amber-100"}`}>{result.pipeInBand ? "RPM szczytu wewnątrz zakresu komory" : "RPM szczytu poza zakresem komory"}</p>
                  <p className="mt-2 font-mono text-sm">Komora: {fmt(v.pipeRpmLow, 0)}–{fmt(v.pipeRpmHigh, 0)} rpm · cel: {fmt(v.targetRpm, 0)} rpm</p>
                  {!result.pipeInBand && <p className="mt-2 text-xs leading-5 text-zinc-400">Cel jest oddalony o {fmt(result.pipeDistance, 0)} rpm od podanego pasma. Sprawdź założone RPM wydechu lub dobierz komorę do szczytu silnika.</p>}
                </div>
                <p className="mt-4 text-[11px] leading-5 text-zinc-500">Zakres pasma pochodzi z danych części lub pomiaru użytkownika. Sam opis modelu nie wystarcza do wyliczenia rezonansu; pomocniczy projekt komory jest w 2T Exhaust Lab.</p>
                <Link href="/narzedzia/kalkulator" className="mt-3 inline-flex text-xs font-semibold text-orange-200 underline decoration-orange-200/30 underline-offset-4 hover:text-white">Otwórz 2T Exhaust Lab →</Link>
              </section>
            </div>

            <section className="rounded-3xl border border-white/10 bg-white/[.035] p-5">
              <h2 className="font-bold">Kontrola konfiguracji</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl bg-black/25 p-4"><p className="text-xs text-zinc-500">Założony cylinder · {v.cylinderName}</p><p className="mt-1 font-semibold">{fmt(v.fittedBore, 2)} × {fmt(v.stroke, 2)} mm · {fmt(result.displacementCc, 1)} cm³</p><p className="mt-1 text-xs text-zinc-500">{v.engineName}: {fmt(v.baseBore, 2)} × {fmt(v.stroke, 2)} mm · {fmt(result.baseDisplacementCc, 1)} cm³</p></div>
                <div className="rounded-xl bg-black/25 p-4"><p className="text-xs text-zinc-500">Limit mechaniczny</p><p className={`mt-1 font-semibold ${v.targetRpm <= v.maxRpm ? "text-emerald-200" : "text-amber-200"}`}>{fmt(v.targetRpm, 0)} / {fmt(v.maxRpm, 0)} rpm</p><p className="mt-1 text-xs text-zinc-500">Korbowód / skok: {fmt(result.rodRatio, 2)}× · gęstość powietrza: {fmt(result.densityFactor * 100, 1)}% normy</p></div>
              </div>
              {result.meanPistonSpeed > 16 && <p className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/[.04] p-3 text-xs leading-5 text-amber-100">Średnia prędkość tłoka przekracza 16 m/s. Sprawdź limit korbowodu, smarowanie, tłoka i producenta cylindra dla tych obrotów.</p>}
            </section>
          </> : <div role="alert" className="rounded-3xl border border-amber-300/20 bg-amber-300/[.05] p-5 text-sm leading-6 text-amber-100">{result.errors.map((error) => <p key={error}>{error}</p>)}</div>}

          <details className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <summary className="cursor-pointer font-bold">Wzory, kalibracja i granice szacunku</summary>
            <div className="mt-4 grid gap-5 text-xs leading-5 text-zinc-400 lg:grid-cols-3">
              <div><h3 className="font-bold text-zinc-200">Moc</h3><p className="mt-2">Dla 2T: P[kW] = BMEP[bar] × Vd[L] × RPM / 600. Domyślny zakres 6,5–10 bar jest scenariuszem; możesz go zmienić. Punkt z hamowni wyznacza BMEP z bazowego bore, skoku i obrotów, a następnie stosuje zadaną niepewność.</p></div>
              <div><h3 className="font-bold text-zinc-200">Cylinder i dolot</h3><p className="mt-2">Pojemność wynika z bore, skoku i liczby cylindrów. Przepływ gaźnika jest granicą z uproszczonego modelu gardzieli i ogranicza zakres mocy tylko wtedy, gdy oszacowany przepływ nie wystarcza. Nie zastępuje pomiaru przepływu ani strojenia paliwa.</p></div>
              <div><h3 className="font-bold text-zinc-200">Skąd ograniczenia</h3><p className="mt-2">Timingi, pola portów i geometria wydechu silnie zmieniają wymianę ładunku. Pełna prognoza wymaga modelu przepływu i walidacji hamownią; ten panel nie przewiduje zysku z marki części ani krzywej momentu pomiędzy RPM szczytu.</p><p className="mt-2"><a className="text-orange-200 underline decoration-orange-200/30 underline-offset-2" href="https://api.pageplace.de/preview/DT0400.9781351406468_A31717914/preview-9781351406468_A31717914.pdf" target="_blank" rel="noreferrer">The Two-Stroke Cycle Engine · BMEP i moc</a><br /><a className="text-orange-200 underline decoration-orange-200/30 underline-offset-2" href="https://vuir.vu.edu.au/18232/" target="_blank" rel="noreferrer">Model wymiany ładunku · Victoria University</a></p></div>
            </div>
          </details>

          <Link href="/narzedzia/porting-2t" className="block rounded-3xl border border-cyan-500/20 bg-cyan-500/[.05] p-5 transition hover:bg-cyan-500/[.09]"><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Geometria cylindra</p><h2 className="mt-1 text-xl font-bold">Porting kalkulator →</h2><p className="mt-2 text-sm text-zinc-400">Przenieś średnicę i zmierzone timingi do symulatora portów 2T.</p></Link>
        </section>
      </div>
    </div>
  </main>;
}
