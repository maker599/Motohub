/**
 * Model fizyki gaźnika 2T: aerodynamika, przepływ płynów (Bernoulli),
 * precyzyjne równania zasilania obwodów oraz baza scenariuszy warsztatowych.
 */

export type CarbModelPreset = {
  id: string;
  name: string;
  carbType: "round-slide" | "flat-slide" | "simple";
  boreDiameter: number; // mm
  mainJet: number; // kaliber np. 85
  pilotJet: number; // kaliber np. 45
  atomizerDiameter: number; // mm, np. 2.62 dla AN 262
  needleName: string;
  needleClip: number; // 1-5 (1: góra/ubogo, 5: dół/bogato)
  slideCutaway: number; // 30, 40, 50 (kąt ścięcia)
  idleScrewTurns: number; // obroty śruby jałowej (unoszenie suwaka)
  mixtureScrewTurns: number; // obroty śruby mieszanki (np. 1.5)
  mixtureScrewType: "air" | "fuel"; // powietrza (po str. filtra) lub paliwa (po str. silnika)
  description: string;
};

export type NeedleProfile = {
  name: string;
  shaftDiameter: number; // mm (np. 2.50)
  tipDiameter: number; // mm (np. 1.40)
  straightLength: number; // mm (długość części walcowej)
  taperLength: number; // mm (długość stożka)
  description: string;
};

export const NEEDLE_PROFILES: Record<string, NeedleProfile> = {
  W7: {
    name: "Dell'Orto W7",
    shaftDiameter: 2.50,
    tipDiameter: 1.40,
    straightLength: 22.0,
    taperLength: 20.0,
    description: "Standardowa iglica uniwersalna (Dell'Orto PHBG). Zrównoważony profil średniego zakresu.",
  },
  W9: {
    name: "Dell'Orto W9",
    shaftDiameter: 2.50,
    tipDiameter: 1.20,
    straightLength: 24.0,
    taperLength: 22.0,
    description: "Cieńszy czubek, bogatsza w zakresie 1/2 - 3/4 gazu. Dobre napełnienie przed wejściem w rezonans.",
  },
  W16: {
    name: "Dell'Orto W16",
    shaftDiameter: 2.50,
    tipDiameter: 1.00,
    straightLength: 20.0,
    taperLength: 24.0,
    description: "Bardzo agresywny ostry stożek, wyścigowy profil. Daje dużą dawkę paliwa przy szybkim otwarciu.",
  },
  W25: {
    name: "Dell'Orto W25",
    shaftDiameter: 2.52,
    tipDiameter: 1.60,
    straightLength: 23.0,
    taperLength: 18.0,
    description: "Grubszy czubek, łagodny stożek. Uboższa w średnim zakresie, dobra dla oszczędności.",
  },
  JJH: {
    name: "Keihin/PWK JJH",
    shaftDiameter: 2.44,
    tipDiameter: 1.15,
    straightLength: 21.0,
    taperLength: 23.0,
    description: "Popularna iglica do gaźników płaskoprzepustnicowych PWK 21/24/28.",
  },
};

export const CARB_PRESETS: CarbModelPreset[] = [
  {
    id: "phbg-19-black",
    name: "Dell'Orto PHBG 19 Black Edition",
    carbType: "round-slide",
    boreDiameter: 19,
    mainJet: 85,
    pilotJet: 45,
    atomizerDiameter: 2.62,
    needleName: "W7",
    needleClip: 3,
    slideCutaway: 40,
    idleScrewTurns: 1.5,
    mixtureScrewTurns: 1.5,
    mixtureScrewType: "air",
    description: "Najpopularniejszy gaźnik do silników Derbi D50B0 / Minarelli AM6 (50–70cc). Śruba powietrza od strony filtra.",
  },
  {
    id: "phbg-21-racing",
    name: "Dell'Orto PHBG 21 Racing",
    carbType: "round-slide",
    boreDiameter: 21,
    mainJet: 94,
    pilotJet: 48,
    atomizerDiameter: 2.62,
    needleName: "W9",
    needleClip: 3,
    slideCutaway: 40,
    idleScrewTurns: 1.5,
    mixtureScrewTurns: 1.75,
    mixtureScrewType: "air",
    description: "Nastaw pod cylindry 70cc Sport/Racing (np. Stage6 Streetrace, Polini Corsa). Większa gardziel 21 mm.",
  },
  {
    id: "pwk-24-polini",
    name: "Polini / Stage6 PWK 24 Flat-Slide",
    carbType: "flat-slide",
    boreDiameter: 24,
    mainJet: 105,
    pilotJet: 38,
    atomizerDiameter: 2.66,
    needleName: "JJH",
    needleClip: 3,
    slideCutaway: 30,
    idleScrewTurns: 1.5,
    mixtureScrewTurns: 1.5,
    mixtureScrewType: "fuel",
    description: "Płaska przepustnica (D-slide/flat), gardziel 24 mm. Śruba mieszanki paliwowa po stronie cylindra.",
  },
  {
    id: "pwk-28-racing",
    name: "PWK 28 Racing",
    carbType: "flat-slide",
    boreDiameter: 28,
    mainJet: 122,
    pilotJet: 42,
    atomizerDiameter: 2.66,
    needleName: "JJH",
    needleClip: 3,
    slideCutaway: 30,
    idleScrewTurns: 1.5,
    mixtureScrewTurns: 1.5,
    mixtureScrewType: "fuel",
    description: "Duży gaźnik do silników 80cc–90cc Big Bore. Bardzo wysoki przepływ powietrza i paliwa.",
  },
  {
    id: "sha-14-12",
    name: "Dell'Orto SHA 14/12 (Moped)",
    carbType: "simple",
    boreDiameter: 14,
    mainJet: 62,
    pilotJet: 35,
    atomizerDiameter: 2.55,
    needleName: "W7",
    needleClip: 3,
    slideCutaway: 30,
    idleScrewTurns: 1.2,
    mixtureScrewTurns: 1.0,
    mixtureScrewType: "air",
    description: "Prosty gaźnik seryjny mopedowy (np. Puch, Tomos). Brak regulowanej iglicy stożkowej.",
  },
];

export type CarbState = {
  // Gaźnik
  boreDiameter: number;
  mainJet: number;
  pilotJet: number;
  atomizerDiameter: number;
  needleName: string;
  needleClip: number; // 1..5 (1: góra/najubożej, 5: dół/najbogaciej)
  slideCutaway: number; // 30..50
  idleScrewTurns: number; // 0.5..3.0
  mixtureScrewTurns: number; // 0.25..4.0
  mixtureScrewType: "air" | "fuel";
  chokeEngaged: boolean;
  floatLevelOffset: number; // mm (-2 do +2 od bazy)

  // Silnik i otoczenie
  displacementCc: number; // np. 50 lub 70
  throttle: number; // 0..1 (otwarcie manetki)
  ambientTempC: number; // -10..40 °C
  altitudeM: number; // 0..2000 m
  airFilterType: "airbox" | "sponge" | "cone-open";
};

export type FlowAnalysis = {
  slideLiftMm: number;
  effectiveThroatAreaMm2: number;
  airDensityKgM3: number;
  airVelocityMs: number;
  airMassFlowGPerSec: number;
  venturiVacuumKPa: number;

  // Przepływy paliwa (g/s)
  pilotFuelFlow: number;
  needleAnnulusAreaMm2: number;
  needleFuelFlow: number;
  mainJetAreaMm2: number;
  effectiveMainCircuitAreaMm2: number;
  chokeFuelFlow: number;
  totalFuelFlow: number;

  // Udział obwodów w dawce (% sumy)
  pilotSharePct: number;
  needleSharePct: number;
  mainSharePct: number;

  // Skład mieszanki
  afr: number;
  lambda: number;
  condition: "extremely-lean" | "lean" | "optimal" | "rich" | "extremely-rich";
  conditionLabel: string;
  sparkPlugColor: string; // hex color for plug preview
  sparkPlugText: string;

  // Dynamika silnika
  combustionEfficiency: number; // 0..1
  engineRpm: number;
  isFourStroking: boolean;
  isBoggingDown: boolean;
  powerOutputHp: number;
};

// Struktura Scenariusza Warsztatowego (Wyzwania tuningowego)
export type WorkshopScenario = {
  id: string;
  title: string;
  category: "Iglica & Środek" | "Dysza Główna" | "Bieg Jałowy" | "Tuning & Dolot" | "Pogoda";
  difficulty: "Łatwy" | "Średni" | "Zaawansowany";
  symptom: string;
  goal: string;
  hint: string;
  initialPatch: Partial<CarbState>;
  checkSolution: (state: CarbState, analysis: FlowAnalysis) => { solved: boolean; feedback: string };
};

export const WORKSHOP_SCENARIOS: WorkshopScenario[] = [
  {
    id: "lean-mid-needle",
    title: "Dziura i dławienie przy 1/2 gazu (Za chuda iglica)",
    category: "Iglica & Środek",
    difficulty: "Łatwy",
    symptom: "Silnik ładnie odpala i jedzie na wolnych, ale przy przyspieszaniu na 1/2 gazu dławi się ('buhhh'), traci ciąg i dopiero na pełnym gazie z trudem odżywa.",
    goal: "Przestaw zabezpieczenie (klips) na iglicy tak, aby w zakresie 50% gazu uzyskać optymalny AFR (12.2 - 13.0).",
    hint: "Klips jest obecnie na rowku 1 (najwyższym) – iglica wisi za głęboko w rozpylaczu. Opuść klips o 2–3 rowki w dół (na rowek 3 lub 4), aby unieść iglicę i wzbogacić dawkę!",
    initialPatch: {
      boreDiameter: 19,
      mainJet: 85,
      pilotJet: 45,
      needleName: "W7",
      needleClip: 1, // rowek 1 (najwyższy = najchudszy)
      mixtureScrewTurns: 1.5,
      mixtureScrewType: "air",
      throttle: 0.5,
    },
    checkSolution: (state, analysis) => {
      const midAfr = evaluateCarbFlow({ ...state, throttle: 0.5 }).afr;
      if (state.needleClip >= 3 && state.needleClip <= 4 && midAfr >= 12.0 && midAfr <= 13.2) {
        return {
          solved: true,
          feedback: `Świetnie! Klips na rowku ${state.needleClip} podniósł iglicę. AFR przy 1/2 gazu wynosi idealne ${midAfr.toFixed(1)}:1. Silnik wkręca się bez dziury!`,
        };
      }
      if (state.needleClip < 3) {
        return { solved: false, feedback: `Klips wciąż za wysoko (rowek ${state.needleClip}). AFR przy 50% wynosi ${midAfr.toFixed(1)} (za ubogo). Opuść klips na rowek 3 lub 4.` };
      }
      return { solved: false, feedback: `Klips za nisko (rowek ${state.needleClip}) – silnik jest teraz za bogaty (${midAfr.toFixed(1)} AFR). Ustaw rowek 3 lub 4.` };
    },
  },
  {
    id: "rich-mid-needle",
    title: "Przerywanie i zalewanie przy stałej jeździe (Klips za nisko)",
    category: "Iglica & Środek",
    difficulty: "Łatwy",
    symptom: "Podczas spokojnej jazdy miejskiej na 40-60% gazu silnik terkocze, czterosuwuje ('d-d-d'), dymi i szarpie. Dopiero przy pełnym gazie przepala nadmiar paliwa.",
    goal: "Zuboż średni zakres iglicy, aby silnik nie zalewał przy 50% otwarcia przepustnicy.",
    hint: "Klips jest na samym dole (rowek 5), przez co iglica jest maksymalnie wyciągnięta. Podnieś klips w górę na rowek 2 lub 3, aby opuścić iglicę głębiej w rozpylacz.",
    initialPatch: {
      boreDiameter: 19,
      mainJet: 85,
      pilotJet: 45,
      needleName: "W7",
      needleClip: 5, // rowek 5 (najniższy = najbogatszy)
      mixtureScrewTurns: 1.5,
      mixtureScrewType: "air",
      throttle: 0.5,
    },
    checkSolution: (state) => {
      const midAfr = evaluateCarbFlow({ ...state, throttle: 0.5 }).afr;
      if (state.needleClip <= 3 && state.needleClip >= 2 && midAfr >= 12.1 && midAfr <= 13.2) {
        return {
          solved: true,
          feedback: `Brawo! Podniesienie klipsa na rowek ${state.needleClip} zubożyło średni zakres do ${midAfr.toFixed(1)} AFR. Czterosuwowanie zniknęło!`,
        };
      }
      return { solved: false, feedback: `Wciąż za bogato przy 50% gazu (${midAfr.toFixed(1)} AFR). Podnieś klips na rowek 2 lub 3.` };
    },
  },
  {
    id: "rich-main-fourstroke",
    title: "Czterosuwowanie na pełnym gazie (Przelana dysza główna)",
    category: "Dysza Główna",
    difficulty: "Średni",
    symptom: "Na 1/4 i 1/2 gazu motocykl idzie płynnie, ale po odkręceniu manetki do oporu (100% WOT) silnik przerywa ('d-d-d-braap'), pluje niespaloną mieszanką i nie osiąga rezonansu.",
    goal: "Dobierz właściwą dyszę główną (MJ), aby silnik osiągnął optymalne 12.2 - 12.9 AFR na pełnym gazie.",
    hint: "Wkręcona jest dysza główna #122 – o wiele za duża dla seryjnego cylindra 50cc. Zmień dyszę główną na #85–#88.",
    initialPatch: {
      boreDiameter: 19,
      mainJet: 122,
      pilotJet: 45,
      needleName: "W7",
      needleClip: 3,
      throttle: 1.0,
    },
    checkSolution: (state) => {
      const wotAfr = evaluateCarbFlow({ ...state, throttle: 1.0 }).afr;
      if (state.mainJet >= 82 && state.mainJet <= 89 && wotAfr >= 12.0 && wotAfr <= 13.2) {
        return {
          solved: true,
          feedback: `Idealnie! Dysza #${state.mainJet} dała perfekcyjne ${wotAfr.toFixed(1)}:1 AFR na pełnym gazie. Silnik czysto wchodzi w rezonans!`,
        };
      }
      if (state.mainJet > 89) {
        return { solved: false, feedback: `Dysza #${state.mainJet} jest wciąż za duża (${wotAfr.toFixed(1)} AFR). Silnik nadal czterosuwuje. Załóż #85–#88.` };
      }
      return { solved: false, feedback: `Dysza #${state.mainJet} jest za mała (${wotAfr.toFixed(1)} AFR). Ryzyko zatarcia! Ustaw #85–#88.` };
    },
  },
  {
    id: "lean-main-danger",
    title: "Zagrożenie zatarciem na WOT (Za mała dysza główna)",
    category: "Dysza Główna",
    difficulty: "Średni",
    symptom: "Na pełnym gazie silnik traci moc, robi się nienaturalnie gorący, a świeca jest kredowobiała. Dłuższa jazda grozi wypaleniem denka tłoka!",
    goal: "Wzbogać dawkę na pełnym gazie (100% WOT) do bezpiecznego poziomu 12.0 - 12.8 AFR.",
    hint: "W gaźniku siedzi dysza MJ zaledwie #68. Załóż bezpieczną dyszę główną z przedziału #85–#90.",
    initialPatch: {
      boreDiameter: 19,
      mainJet: 68,
      pilotJet: 45,
      needleName: "W7",
      needleClip: 3,
      throttle: 1.0,
    },
    checkSolution: (state) => {
      const wotAfr = evaluateCarbFlow({ ...state, throttle: 1.0 }).afr;
      if (state.mainJet >= 84 && state.mainJet <= 92 && wotAfr >= 12.0 && wotAfr <= 13.1) {
        return {
          solved: true,
          feedback: `Bezpiecznie! Zwiększenie dyszy do #${state.mainJet} obniżyło temperaturę spalin i ustaliło AFR na ${wotAfr.toFixed(1)}:1. Tłok jest bezpieczny!`,
        };
      }
      return { solved: false, feedback: `Dysza #${state.mainJet} wciąż za mała (${wotAfr.toFixed(1)} AFR). Zwiększ dyszę główną do #85-#90.` };
    },
  },
  {
    id: "hanging-idle-lean",
    title: "Zawieszanie obrotów po odpuszczeniu gazu (Za ubogi pilot)",
    category: "Bieg Jałowy",
    difficulty: "Średni",
    symptom: "Po puszczeniu manetki silnik nie schodzi od razu do 1400 RPM, tylko wyje na 4000 RPM przez kilka sekund i dopiero powoli opada.",
    goal: "Dostrój śrubę mieszanki i dyszę pilotową, aby silnik natychmiast wracał do stabilnych wolnych obrotów.",
    hint: "Śruba powietrza jest wykręcona aż na 3.75 obrotu, a dysza pilotowa to za mała #32. Załóż dyszę pilotową #42-#45 i wkręć śrubę powietrza na 1.5 obrotu!",
    initialPatch: {
      pilotJet: 32,
      mixtureScrewTurns: 3.75,
      mixtureScrewType: "air",
      idleScrewTurns: 2.2,
      throttle: 0.0,
    },
    checkSolution: (state) => {
      const idleAfr = evaluateCarbFlow({ ...state, throttle: 0.0 }).afr;
      if (state.pilotJet >= 42 && state.mixtureScrewTurns >= 1.2 && state.mixtureScrewTurns <= 2.2 && idleAfr >= 12.0 && idleAfr <= 13.2) {
        return {
          solved: true,
          feedback: `Sukces! Dysza pilotowa #${state.pilotJet} i śruba na ${state.mixtureScrewTurns.toFixed(2)} obr. ustabilizowały bieg jałowy (${idleAfr.toFixed(1)} AFR). Silnik nie wisi na obrotach!`,
        };
      }
      return { solved: false, feedback: `Obwód pilotowy jest wciąż za ubogi (${idleAfr.toFixed(1)} AFR). Załóż dyszę pilotową #42-#45 i wkręć śrubę powietrza na 1.5 obr.` };
    },
  },
  {
    id: "flooding-idle-rich",
    title: "Gaśnięcie na światłach i zalewanie świecy (Przelany dół)",
    category: "Bieg Jałowy",
    difficulty: "Łatwy",
    symptom: "Na wolnych obrotach silnik powoli traci obroty, dymi i po 15 sekundach gaśnie z zalania świecy. Trzeba go odpalać z pełnym gazem.",
    goal: "Skoryguj dawkę biegu jałowego (AFR ~12.5) i ustabilizuj obroty jałowe.",
    hint: "Za duża dysza pilotowa (#55) oraz wkręcona prawie do zera śruba powietrza (0.5 obr.). Załóż dyszę pilotową #42–#45 i wykręć śrubę powietrza na 1.5 obrotu.",
    initialPatch: {
      pilotJet: 55,
      mixtureScrewTurns: 0.5,
      mixtureScrewType: "air",
      idleScrewTurns: 1.0,
      throttle: 0.0,
    },
    checkSolution: (state) => {
      const idleAfr = evaluateCarbFlow({ ...state, throttle: 0.0 }).afr;
      if (state.pilotJet <= 48 && state.pilotJet >= 40 && state.mixtureScrewTurns >= 1.2 && state.mixtureScrewTurns <= 2.0) {
        return {
          solved: true,
          feedback: `Wyregulowano! Na wolnych obrotach jest teraz ${idleAfr.toFixed(1)} AFR. Silnik trzyma równe obroty i nie okopca świecy.`,
        };
      }
      return { solved: false, feedback: `Na biegu jałowym wciąż za bogato (${idleAfr.toFixed(1)} AFR). Zmniejsz dyszę pilotową do #45 i wykręć śrubę powietrza na 1.5 obr.` };
    },
  },
  {
    id: "tuning-70cc-exhaust",
    title: "Strojenie po montażu cylindra 70cc i wydechu sportowego",
    category: "Tuning & Dolot",
    difficulty: "Zaawansowany",
    symptom: "Zamontowano cylinder 70cc i sportowy wydech rezonansowy, ale gaźnik ma nastawy seryjne z 50cc. Silnik dusi się i przegrzewa przy każdym otwarciu gazu.",
    goal: "Przestrój gaźnik pod 70cc: zwiększ dyszę główną (MJ), opuść klips iglicy oraz zwiększ dyszę pilotową.",
    hint: "Dla 70cc załóż dyszę główną #92–#98, klips iglicy na rowku 3 lub 4 (iglica W9), oraz dyszę pilotową #48.",
    initialPatch: {
      displacementCc: 70,
      mainJet: 82,
      pilotJet: 40,
      needleName: "W7",
      needleClip: 2,
      airFilterType: "sponge",
      throttle: 0.75,
    },
    checkSolution: (state) => {
      const wotAfr = evaluateCarbFlow({ ...state, throttle: 1.0 }).afr;
      const midAfr = evaluateCarbFlow({ ...state, throttle: 0.5 }).afr;
      if (state.mainJet >= 92 && state.mainJet <= 100 && state.needleClip >= 3 && state.pilotJet >= 45) {
        return {
          solved: true,
          feedback: `Perfekcyjny setup pod 70cc! Dysza #${state.mainJet} i iglica klips ${state.needleClip} dają idealną krzywą mocy (WOT: ${wotAfr.toFixed(1)} AFR, 1/2: ${midAfr.toFixed(1)} AFR).`,
        };
      }
      return { solved: false, feedback: `Dla 70cc wciąż brakuje paliwa. Zwiększ dyszę główną do #94-#98 i opuść klips iglicy na rowek 3 lub 4.` };
    },
  },
  {
    id: "winter-freezing-air",
    title: "Zimowa jazda przy -5°C (Gęste zimne powietrze)",
    category: "Pogoda",
    difficulty: "Średni",
    symptom: "Gaźnik był idealnie zestrojony w upalne lato (+30°C). Przy -5°C silnik stracił wigor, a pod obciążeniem słychać dzwonienie (detonację z ubóstwa).",
    goal: "Skompensuj wyższą gęstość zimnego powietrza i przywróć bezpieczny AFR na mrozie.",
    hint: "Zimne powietrze niesie znacznie więcej tlenu. Zwiększ dyszę główną o 4–6 numerów (z #82 na #88-#92) i opuść klips na iglicy o 1 rowek w dół.",
    initialPatch: {
      ambientTempC: -5,
      mainJet: 82,
      needleClip: 2,
      throttle: 0.8,
    },
    checkSolution: (state) => {
      const wotAfr = evaluateCarbFlow({ ...state, throttle: 1.0 }).afr;
      if (state.mainJet >= 88 && state.needleClip >= 3 && wotAfr >= 12.0 && wotAfr <= 13.0) {
        return {
          solved: true,
          feedback: `Świetna kompensacja zimowa! Zwiększenie dyszy do #${state.mainJet} zrównoważyło gęste powietrze -5°C (${wotAfr.toFixed(1)} AFR).`,
        };
      }
      return { solved: false, feedback: `Na mrozie -5°C wciąż za ubogo (${wotAfr.toFixed(1)} AFR). Daj większą dyszę główną (#88-#92) i opuść klips iglicy.` };
    },
  },
  {
    id: "mountain-altitude-pass",
    title: "Wyprawa w wysokie góry (1500 m n.p.m. - Rzadkie powietrze)",
    category: "Pogoda",
    difficulty: "Średni",
    symptom: "Na przełęczy górskiej (1500 m n.p.m.) silnik zalewa się, dymi, nie chce wkręcać się na obroty i spala dwa razy więcej paliwa.",
    goal: "Dostosuj gaźnik do niskiego ciśnienia tlenu na wysokości 1500 m.",
    hint: "W górach powietrze jest rzadsze. Zmniejsz dyszę główną o 4–6 numerów (z #95 na #86-#88) i wykręć śrubę powietrza o 1/2 obrotu.",
    initialPatch: {
      altitudeM: 1500,
      mainJet: 95,
      mixtureScrewTurns: 1.2,
      throttle: 0.75,
    },
    checkSolution: (state) => {
      const wotAfr = evaluateCarbFlow({ ...state, throttle: 1.0 }).afr;
      if (state.mainJet <= 88 && state.mixtureScrewTurns >= 1.5 && wotAfr >= 12.0 && wotAfr <= 13.1) {
        return {
          solved: true,
          feedback: `Doskonale! Zmniejszenie dyszy głównej do #${state.mainJet} skompensowało rzadkie powietrze na 1500 m n.p.m. (${wotAfr.toFixed(1)} AFR).`,
        };
      }
      return { solved: false, feedback: `W górach silnik wciąż dostaje za dużo paliwa (${wotAfr.toFixed(1)} AFR). Zmniejsz dyszę główną do #85-#88.` };
    },
  },
  {
    id: "open-cone-racing-filter",
    title: "Montaż otwartego filtra stożkowego bez zmiany dyszy",
    category: "Tuning & Dolot",
    difficulty: "Średni",
    symptom: "Zdjęto puszkę filtra (airbox) i zamontowano otwarty stożek racing. Silnik natychmiast zubożał, dławi się przy dodaniu gazu i nie ma mocy.",
    goal: "Dostosuj zasilanie gaźnika do znacznie większego przepływu powietrza filtra stożkowego.",
    hint: "Otwarty filtr wymaga podniesienia dyszy głównej o 8–12 numerów (z #82 do #92–#96) oraz opuszczenia klipsa iglicy o 1 rowek w dół.",
    initialPatch: {
      airFilterType: "cone-open",
      mainJet: 82,
      needleClip: 2,
      pilotJet: 42,
      throttle: 0.5,
    },
    checkSolution: (state) => {
      const wotAfr = evaluateCarbFlow({ ...state, throttle: 1.0 }).afr;
      const midAfr = evaluateCarbFlow({ ...state, throttle: 0.5 }).afr;
      if (state.mainJet >= 92 && state.mainJet <= 100 && state.needleClip >= 3) {
        return {
          solved: true,
          feedback: `Wyśmienicie! Otwarty stożek otrzymał właściwe paliwo (MJ #${state.mainJet}, klips ${state.needleClip}). AFR wynosi ${wotAfr.toFixed(1)}:1.`,
        };
      }
      return { solved: false, feedback: `Stożek wpuszcza za dużo powietrza na tych dyszach (${midAfr.toFixed(1)} AFR). Zwiększ dyszę główną do #94 i opuść klips na rowek 3 lub 4.` };
    },
  },
  {
    id: "sponge-filter-clog",
    title: "Zatykający się gąbkowy filtr powietrza (Brudny filtr)",
    category: "Tuning & Dolot",
    difficulty: "Łatwy",
    symptom: "Po sezonie bez czyszczenia filtra silnik zaczął być ospały, dymi na bogate i nie chce osiągać pełnych obrotów. Spalanie oleju wzmożone.",
    goal: "Zasymuluj zmianę z zatkanego filtra gąbkowego na nowy lub stożkowy i dobierz dyszę do nowego przepływu powietrza.",
    hint: "Zatykający się filtr ogranicza przepływ powietrza — symuluj to małą dyszą i filtrem 'airbox'. Po oczyszczeniu (cone-open) musisz dobierać bogatszą dyszę.",
    initialPatch: {
      airFilterType: "airbox",
      mainJet: 78,
      pilotJet: 42,
      needleClip: 4,
      throttle: 0.8,
    },
    checkSolution: (state) => {
      const wotAfr = evaluateCarbFlow({ ...state, throttle: 1.0 }).afr;
      if ((state.airFilterType === "cone-open" || state.airFilterType === "sponge") && state.mainJet >= 85 && state.mainJet <= 95 && wotAfr >= 12.0 && wotAfr <= 13.2) {
        return {
          solved: true,
          feedback: `Brawo! Po zmianie filtra dobrana dysza #${state.mainJet} daje idealne ${wotAfr.toFixed(1)} AFR. Silnik oddycha i pracuje czysto!`,
        };
      }
      return { solved: false, feedback: `Zmień filtr na sprawny i dobierz dyszę do właściwego przepływu (AFR teraz: ${wotAfr.toFixed(1)}).` };
    },
  },
  {
    id: "float-level-flood",
    title: "Przelany gaźnik — za wysoki poziom paliwa w komorze pływakowej",
    category: "Bieg Jałowy",
    difficulty: "Zaawansowany",
    symptom: "Z gaźnika kapie paliwo, silnik stale jest za bogaty niezależnie od nastawów śruby. Świeca moczy się w benzynie po 30 sekundach jałowego biegu.",
    goal: "Skoryguj poziom paliwa (offset pływaka) i dostrój śrubę mieszanki tak, aby silnik nie zalewał świecy na biegu jałowym.",
    hint: "Zbyt wysoki poziom paliwa w komorze (floatLevelOffset > 0) podnosi ciśnienie i przelewa mieszankę. Ustaw offset na -1 do 0 i wyreguluj śrubę powietrza.",
    initialPatch: {
      floatLevelOffset: 2,
      mixtureScrewTurns: 3.2,
      mixtureScrewType: "air",
      pilotJet: 48,
      throttle: 0.0,
    },
    checkSolution: (state) => {
      const idleAfr = evaluateCarbFlow({ ...state, throttle: 0.0 }).afr;
      if (state.floatLevelOffset <= 0 && state.mixtureScrewTurns >= 1.2 && state.mixtureScrewTurns <= 2.2 && idleAfr >= 12.0 && idleAfr <= 13.5) {
        return {
          solved: true,
          feedback: `Naprawione! Korekta poziomu pływaka (${state.floatLevelOffset} mm) i śruba ${state.mixtureScrewTurns.toFixed(2)} obr. dają ${idleAfr.toFixed(1)} AFR. Silnik nie zalewa!`,
        };
      }
      return { solved: false, feedback: `Paliwo wciąż przelewa komorę (AFR ${idleAfr.toFixed(1)}). Obniż poziom pływaka (floatOffset do -1 lub 0) i wkręć śrubę powietrza.` };
    },
  },
  {
    id: "choke-stuck-warmup",
    title: "Zapomniany ssak (choke) — silnik nie chce wyłączyć ssania",
    category: "Bieg Jałowy",
    difficulty: "Łatwy",
    symptom: "Silnik odpalono na zimno z ssaniem, ale po 5 minutach jazdy nadal jest aktywny. Silnik miękko, dymi na czarno, mocno pali paliwo i nie osiąga obrotów.",
    goal: "Wyłącz ssanie i przywróć normalny bieg jałowy regulując śrubą mieszanki i dyszę pilotową.",
    hint: "Ssanie (choke) wzbogaca mieszankę o blisko 35%. Wyłącz je (chokeEngaged = false) i ewentualnie wkręć śrubę powietrza o pół obrotu, żeby skompensować bogaty start.",
    initialPatch: {
      chokeEngaged: true,
      mixtureScrewTurns: 2.5,
      idleScrewTurns: 1.0,
      throttle: 0.05,
    },
    checkSolution: (state) => {
      const idleAfr = evaluateCarbFlow({ ...state, throttle: 0.0 }).afr;
      if (!state.chokeEngaged && idleAfr >= 12.0 && idleAfr <= 13.5) {
        return {
          solved: true,
          feedback: `Prawidłowo! Ssanie wyłączone, bieg jałowy ${idleAfr.toFixed(1)} AFR. Silnik pracuje stabilnie po rozgrzaniu.`,
        };
      }
      return { solved: false, feedback: !state.chokeEngaged ? `Ssanie wyłączone, ale regulacja biegu jałowego wymaga korekty (${idleAfr.toFixed(1)} AFR).` : `Ssanie nadal aktywne — wyłącz je po rozgrzaniu silnika!` };
    },
  },
  {
    id: "big-bore-88cc-tune",
    title: "Przebudowa na 88cc Big Bore — kompleksowe strojenie gaźnika",
    category: "Tuning & Dolot",
    difficulty: "Zaawansowany",
    symptom: "Zamontowano cylinder 88cc Big Bore Stage6 Streetrace z wałem 45mm. Gaźnik PHBG 21 ma seryjne dysze pod 50cc. Silnik kaszle, dławi i grozi zatarciem.",
    goal: "Dobierz dyszę główną, pilotową, klips iglicy i gaźnik (gardziel ≥21mm) do cylindra 88cc. Osiągnij bezpieczne AFR < 13.0 na WOT.",
    hint: "Cylinder 88cc wymaga dyszy głównej #102-#115 i klipsa iglicy na rowku 3-4. Gaźnik 21mm jest graniczny — 24mm lub 28mm da pełny potencjał. Dysza pilotowa powinna być #48-#52.",
    initialPatch: {
      displacementCc: 88,
      boreDiameter: 21,
      mainJet: 88,
      pilotJet: 45,
      needleName: "W7",
      needleClip: 2,
      airFilterType: "sponge",
      throttle: 1.0,
    },
    checkSolution: (state) => {
      const wotAfr = evaluateCarbFlow({ ...state, throttle: 1.0 }).afr;
      const midAfr = evaluateCarbFlow({ ...state, throttle: 0.5 }).afr;
      if (state.mainJet >= 102 && state.pilotJet >= 48 && state.needleClip >= 3 && state.boreDiameter >= 21 && wotAfr >= 11.5 && wotAfr <= 13.2) {
        return {
          solved: true,
          feedback: `88cc poprawnie zestrojony! Dysza #${state.mainJet} + pilot #${state.pilotJet} + klips ${state.needleClip} dają bezpieczne ${wotAfr.toFixed(1)} AFR WOT i ${midAfr.toFixed(1)} AFR w połowie gazu.`,
        };
      }
      if (wotAfr > 14.5) return { solved: false, feedback: `Zbyt ubogo na 88cc! WOT ${wotAfr.toFixed(1)} AFR — groźba zatarcia tłoka. Zwiększ dyszę główną do #105-#115.` };
      return { solved: false, feedback: `Dysza #${state.mainJet} za mała dla 88cc (${wotAfr.toFixed(1)} AFR WOT). Dobierz dyszę #102-#115 i klips iglicy 3-4.` };
    },
  },
];

/**
 * Gęstość powietrza na podstawie temperatury i wysokości
 */
export function calculateAirDensity(tempC: number, altitudeM: number): number {
  const p0 = 101325; // Pa
  const tKelvin = 273.15 + tempC;
  const pressure = p0 * Math.exp(-altitudeM / 8434);
  const R_specific = 287.058; // J/(kg·K)
  return pressure / (R_specific * tKelvin);
}

/**
 * Obliczenie fizyki gaźnika w danym punkcie otwarcia i konfiguracji
 */
export function evaluateCarbFlow(state: CarbState): FlowAnalysis {
  const {
    boreDiameter,
    mainJet,
    pilotJet,
    atomizerDiameter,
    needleName,
    needleClip,
    slideCutaway,
    idleScrewTurns,
    mixtureScrewTurns,
    mixtureScrewType,
    chokeEngaged,
    floatLevelOffset,
    displacementCc,
    throttle,
    ambientTempC,
    altitudeM,
    airFilterType,
  } = state;

  const needle = NEEDLE_PROFILES[needleName] ?? NEEDLE_PROFILES.W7;
  const airDensity = calculateAirDensity(ambientTempC, altitudeM);

  // 1. Uniesienie suwaka (Slide Lift)
  const idleLift = Math.max(0.6, Math.min(3.2, 0.4 + idleScrewTurns * 0.7));
  const fullLift = boreDiameter;
  const slideLiftMm = idleLift + throttle * (fullLift - idleLift);
  const throttleEffectiveFraction = slideLiftMm / fullLift;

  // Restrykcja filtra powietrza
  const filterResistance = airFilterType === "airbox" ? 0.90 : airFilterType === "sponge" ? 0.96 : 1.0;

  // 2. Pole przekroju gardzieli (Venturi throat area)
  const cutawayFactor = 1.0 + (slideCutaway - 40) * 0.008 * Math.max(0, 1 - throttle * 3);
  const baseThroatArea = Math.min(
    Math.PI * Math.pow(boreDiameter / 2, 2),
    boreDiameter * slideLiftMm * 1.15 * cutawayFactor
  );
  const effectiveThroatAreaMm2 = Math.max(3.0, baseThroatArea);

  // 3. Obroty i Przepływ powietrza
  const maxEngineRpm = displacementCc > 75 ? 12500 : 13500;
  const baseIdleRpm = 1350 + (idleLift - 0.8) * 550;
  const theoreticalRpm = baseIdleRpm + Math.pow(throttle, 1.1) * (maxEngineRpm - baseIdleRpm);

  // Przepływ objętościowy i masowy powietrza
  const volumetricEfficiency = 0.75 + throttle * 0.35;
  const airVolumeFlowM3S = (displacementCc * 1e-6) * (theoreticalRpm / 60) * volumetricEfficiency * filterResistance;
  const airMassFlowGPerSec = airVolumeFlowM3S * airDensity * 1000;

  // Prędkość w gardzieli (m/s) i podciśnienie Venturiego (kPa)
  const throatAreaM2 = effectiveThroatAreaMm2 * 1e-6;
  const airVelocityMs = Math.min(130, airVolumeFlowM3S / Math.max(1e-7, throatAreaM2));
  const venturiVacuumKPa = Math.max(0.05, 0.5 * airDensity * Math.pow(airVelocityMs, 2) * 0.001);

  // Współczynnik poziomu paliwa w komorze
  const floatFactor = 1.0 + floatLevelOffset * 0.04;

  // 4. OBWÓD WOLNYCH OBROTÓW (PILOT CIRCUIT)
  const pilotWeight = Math.exp(-Math.pow(throttle / 0.18, 1.8));

  let screwFactor = 1.0;
  if (mixtureScrewType === "air") {
    // Śruba powietrza (od filtra): wykręcenie zubaża
    screwFactor = 2.0 / (0.5 + mixtureScrewTurns);
  } else {
    // Śruba paliwa (od silnika): wykręcenie wzbogaca
    screwFactor = 0.25 + 0.5 * mixtureScrewTurns;
  }

  const pilotJetFactor = Math.pow(pilotJet / 45, 1.85);
  const cutawayMixtureFactor = 1.0 - (slideCutaway - 40) * 0.008 * Math.max(0, 1 - throttle * 3);
  const basePilotFuelRate = (airMassFlowGPerSec / 12.55) * pilotWeight;
  const pilotFuelFlow = basePilotFuelRate * pilotJetFactor * screwFactor * cutawayMixtureFactor * floatFactor;

  // 5. UKŁAD IGLICY I ROZPYLACZA (MID-RANGE 15% - 75% GAZU)
  // Waga obwodu iglicy: krzywa z maksimum wokół 45-55% otwarcia
  const needleWeight = Math.sin(Math.PI * Math.min(1.0, Math.pow(throttle, 0.72)));

  // Klips iglicy: 1 = góra (najubożej), 5 = dół (najbogaciej)
  // Wyraźny, odczuwalny wpływ: każdy rowek zmienia dawkę o ~13.5%
  const clipFactor = 1.0 + (needleClip - 3) * 0.135;

  const clipOffsetMm = (needleClip - 3) * 0.95;
  const needleLiftMm = Math.max(0, slideLiftMm + clipOffsetMm);
  let currentNeedleDiameter = needle.shaftDiameter;
  if (needleLiftMm > needle.straightLength * 0.45) {
    const taperProgress = Math.min(1.0, (needleLiftMm - needle.straightLength * 0.45) / needle.taperLength);
    currentNeedleDiameter = needle.shaftDiameter - taperProgress * (needle.shaftDiameter - needle.tipDiameter);
  }
  const atomizerArea = Math.PI * Math.pow(atomizerDiameter / 2, 2);
  const needleCrossSection = Math.PI * Math.pow(Math.max(0, currentNeedleDiameter) / 2, 2);
  const needleAnnulusAreaMm2 = Math.max(0.01, atomizerArea - needleCrossSection);

  const baselineAnnulusArea = Math.PI * Math.pow(2.62 / 2, 2) - Math.PI * Math.pow(1.95 / 2, 2);
  const needleGeometryFactor = Math.pow(needleAnnulusAreaMm2 / baselineAnnulusArea, 0.9);

  const baseNeedleFuelRate = (airMassFlowGPerSec / 12.5) * needleWeight * (1.0 - 0.4 * Math.pow(throttle, 2));
  const needleFuelFlow = baseNeedleFuelRate * clipFactor * needleGeometryFactor * floatFactor;

  // 6. DYSZA GŁÓWNA (MAIN JET - DOMINUJE 75% - 100% GAZU)
  const mainWeight = Math.pow(throttle, 1.8);
  const mainJetDiameterMm = mainJet / 100;
  const mainJetAreaMm2 = Math.PI * Math.pow(mainJetDiameterMm / 2, 2);
  const mainJetFactor = Math.pow(mainJet / 85, 2.05);

  const baseMainFuelRate = (airMassFlowGPerSec / 12.5) * mainWeight;
  const mainJetFuelFlow = baseMainFuelRate * mainJetFactor * floatFactor;

  const effectiveMainCircuitAreaMm2 = (mainJetAreaMm2 * needleAnnulusAreaMm2) /
    Math.sqrt(Math.pow(mainJetAreaMm2, 2) + Math.pow(needleAnnulusAreaMm2, 2));

  // 7. OBWÓD SSANIA (CHOKE)
  const chokeFuelFlow = chokeEngaged ? (airMassFlowGPerSec / 12.5) * 0.38 : 0.0;

  // 8. SUMARYCZNY PRZEPŁYW PALIWA (G/S)
  const totalFuelFlow = Math.max(0.005, pilotFuelFlow + needleFuelFlow + mainJetFuelFlow + chokeFuelFlow);

  const pilotSharePct = Math.min(100, (pilotFuelFlow / totalFuelFlow) * 100);
  const needleSharePct = Math.min(100 - pilotSharePct, (needleFuelFlow / totalFuelFlow) * 100);
  const mainSharePct = Math.max(0, 100 - pilotSharePct - needleSharePct);

  // 9. OBLICZENIE AIR-FUEL RATIO (AFR) & LAMBDA
  const weatherDensityRatio = airDensity / 1.187;
  let rawAfr = (airMassFlowGPerSec / totalFuelFlow) * Math.pow(weatherDensityRatio, 0.5);
  rawAfr = Math.max(8.0, Math.min(19.0, rawAfr));
  const lambda = rawAfr / 14.7;

  // 10. STAN MIESZANKI I ŚWIECA ZAPŁONOWA
  let condition: FlowAnalysis["condition"] = "optimal";
  let conditionLabel = "Mieszanka optymalna (Maksymalna moc)";
  let sparkPlugColor = "#6e3f19"; // ciemna czekolada
  let sparkPlugText = "Idealna ciemna czekolada / kawa z mlekiem. Prawidłowy skład!";

  if (rawAfr > 15.0) {
    condition = "extremely-lean";
    conditionLabel = "Krytycznie uboga (Ryzyko stopienia denka tłoka i zatarcia!)";
    sparkPlugColor = "#f4f4f5"; // kredowo-biała
    sparkPlugText = "Kredowo-biała, widoczne przegrzanie elektrody. NATYCHMIAST WZBOGAĆ!";
  } else if (rawAfr > 13.5) {
    condition = "lean";
    conditionLabel = "Zbyt uboga (Wysoka temperatura EGT, spadek mocy)";
    sparkPlugColor = "#c4b5a0"; // szaro-beżowa
    sparkPlugText = "Jasnoszara / beżowa. Za mało paliwa w tym zakresie.";
  } else if (rawAfr >= 12.0 && rawAfr <= 13.2) {
    condition = "optimal";
    conditionLabel = "Optymalna dla silnika 2T (Maks. moc i bezpieczeństwo)";
    sparkPlugColor = "#6e3f19"; // ciemna czekolada
    sparkPlugText = "Idealna ciemna czekolada. Właściwa temperatura spalania.";
  } else if (rawAfr >= 10.8) {
    condition = "rich";
    conditionLabel = "Bogata / Bezpieczna (Dobre chłodzenie wewnętrzne)";
    sparkPlugColor = "#38291f"; // ciemny brąz
    sparkPlugText = "Ciemnobrązowa z suchym nalotem. Bezpiecznie, lekki spadek obrotów.";
  } else {
    condition = "extremely-rich";
    conditionLabel = "Skrajnie bogata (Zalewanie, czterosuwowanie, dym)";
    sparkPlugColor = "#111215"; // czarna mokra
    sparkPlugText = "Czarna, mokra od niedopalonej benzyny i oleju. Zalewa świecę.";
  }

  // 11. SPRAWNOŚĆ SPALANIA I DYNAMIKA SILNIKA 2T
  const afrDelta = rawAfr - 12.6;
  const combustionEfficiency = Math.max(0.2, Math.exp(-Math.pow(afrDelta, 2) / 4.2));

  const isFourStroking = rawAfr < 10.8 && throttle > 0.25;
  const isBoggingDown = rawAfr > 14.8 && throttle > 0.2;

  let actualRpm = theoreticalRpm;
  if (isFourStroking) {
    actualRpm *= 0.65;
  } else if (isBoggingDown) {
    actualRpm *= 0.50;
  } else {
    actualRpm = baseIdleRpm + (theoreticalRpm - baseIdleRpm) * (0.65 + 0.35 * combustionEfficiency);
  }

  const maxBhp = displacementCc > 75 ? 18.0 : displacementCc > 65 ? 12.5 : 7.2;
  const powerOutputHp = Math.max(0.2, (actualRpm / maxEngineRpm) * maxBhp * combustionEfficiency * Math.max(0.1, throttle));

  return {
    slideLiftMm,
    effectiveThroatAreaMm2,
    airDensityKgM3: airDensity,
    airVelocityMs,
    airMassFlowGPerSec,
    venturiVacuumKPa,
    pilotFuelFlow,
    needleAnnulusAreaMm2,
    needleFuelFlow,
    mainJetAreaMm2,
    effectiveMainCircuitAreaMm2,
    chokeFuelFlow,
    totalFuelFlow,
    pilotSharePct,
    needleSharePct,
    mainSharePct,
    afr: rawAfr,
    lambda,
    condition,
    conditionLabel,
    sparkPlugColor,
    sparkPlugText,
    combustionEfficiency,
    engineRpm: Math.round(actualRpm),
    isFourStroking,
    isBoggingDown,
    powerOutputHp,
  };
}

/**
 * Wygenerowanie pełnej krzywej AFR dla całego zakresu manetki (0..100% gazu)
 */
export function generateAfrCurve(
  state: CarbState,
  steps = 50
): Array<{ throttlePct: number; afr: number; pilotPct: number; needlePct: number; mainPct: number }> {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const throttle = i / steps;
    const testState = { ...state, throttle };
    const res = evaluateCarbFlow(testState);
    points.push({
      throttlePct: Math.round(throttle * 100),
      afr: Number(res.afr.toFixed(2)),
      pilotPct: Number(res.pilotSharePct.toFixed(1)),
      needlePct: Number(res.needleSharePct.toFixed(1)),
      mainPct: Number(res.mainSharePct.toFixed(1)),
    });
  }
  return points;
}
