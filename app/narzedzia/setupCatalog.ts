export type SetupGoal = "daily" | "sport" | "race" | "track";
export type SetupEngine = "Minarelli AM6" | "Derbi D50B0" | "Derbi D50B1";
export type Tier = "daily" | "sport" | "racing" | "high-end";
export type PartCategory = "crankshaft" | "bearings" | "carburetor" | "intakeManifold" | "reed" | "exhaust" | "clutch" | "ignition" | "airFilter" | "waterPump";

export type CylinderOption = {
  id: string;
  brand: string;
  name: string;
  displacement: string;
  material: string;
  tier: Tier;
  priceEur: number;
  power: [number, number];
  rpm: [number, number];
  note: string;
  sourceNote: string;
  url: string;
  recommendedCrankshaft?: string;
  recommendedBearings?: string;
  recommendedExhaust?: string;
  compatibleEngines?: SetupEngine[];
};

export type PartOption = {
  id: string;
  category: PartCategory;
  brand: string;
  name: string;
  tier: Tier;
  priceEur: number;
  detail: string;
  keepExisting?: boolean;
  includedInCylinder?: boolean;
  requiresFitmentCheck?: boolean;
  url?: string;
};

export const goals: Array<{ id: SetupGoal; title: string; detail: string; recommendedCylinder: string }> = [
  { id: "daily", title: "Trwały daily", detail: "Szerokie użyteczne pasmo i prostszy serwis.", recommendedCylinder: "airsal-cast-70" },
  { id: "sport", title: "Sport 70/80", detail: "Więcej przyspieszenia, nadal z rozsądną obsługą.", recommendedCylinder: "top-performances-70" },
  { id: "race", title: "Racing", detail: "Wyższe obroty i mocniejszy osprzęt.", recommendedCylinder: "stage6-bigracing-77" },
  { id: "track", title: "High-end / tor", detail: "Maksymalny potencjał, częstsza kontrola i serwis.", recommendedCylinder: "stage6-rt-70" },
];

// Price snapshots from linked European retailer listings, before shipping. The UI converts them to PLN with an editable rate.
export const cylinders: CylinderOption[] = [
  {
    id: "motoforce-sport-70", brand: "MotoForce Racing", name: "Sport 70 cc · żeliwo", displacement: "70 cc", material: "Żeliwo · tłok 2-pierścieniowy",
    tier: "sport", priceEur: 82.5, power: [8, 11], rpm: [8000, 10500], note: "Budżetowy cylinder 70 cc do codziennego AM6; sprawdź zestaw z gaźnikiem i wydechem sportowym.",
    sourceNote: "Moc i obroty są orientacyjnym zakresem dla klasy zestawu, nie wynikiem pomiaru tego motocykla.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-motoforce-racing-70cc-cast-iron-minarelli-am6-199305",
  },
  {
    id: "airsal-cast-70", brand: "Airsal", name: "Sport 70 cc · żeliwo", displacement: "70 cc", material: "Żeliwo · 2 pierścienie",
    tier: "sport", priceEur: 145, power: [8, 11], rpm: [8500, 10500], note: "Trwały wariant o mocnym środku; sprzedawca dopuszcza seryjny lub touringowy wydech.",
    sourceNote: "Zakres mocy jest szacunkiem dla poprawnie zestrojonego zestawu.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-airsal-sport-70cc-cast-iron-minarelli-am6-66886",
  },
  {
    id: "airsal-alu-70", brand: "Airsal", name: "Sport 70 cc · aluminium", displacement: "ok. 72–73 cc", material: "Aluminium · powłoka Nikasil",
    tier: "sport", priceEur: 147, power: [9, 12], rpm: [9000, 11000], note: "Lekki cylinder sportowy; producent zestawu zaleca większy gaźnik i sportowy wydech.",
    sourceNote: "Zakres mocy jest szacunkiem dla poprawnie zestrojonego zestawu.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-airsal-sport-70cc-aluminium-minarelli-am6-18056",
  },
  {
    id: "top-performances-70", brand: "Top Performances", name: "Sport 70 cc", displacement: "73,5 cc", material: "Żeliwo · 2 pierścienie",
    tier: "sport", priceEur: 192, power: [10, 12], rpm: [8500, 11000], note: "Momentowy zestaw do codziennej jazdy; sklep zaleca gaźnik 19–21 mm i sportowy wydech.",
    sourceNote: "Sprzedawca podaje około 10–12 KM dla dopasowanego zestawu.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-top-performances-sport-70cc-cast-iron-am6-23341",
  },
  {
    id: "stage6-streetrace-50", brand: "Stage6", name: "Streetrace 50 cc", displacement: "50 cc", material: "Żeliwo · żeliwny zamiennik sportowy",
    tier: "daily", priceEur: 179, power: [7, 9], rpm: [8000, 10500], note: "Pozostaje przy 50 cc; dobry wybór, gdy priorytetem jest prostszy serwis i zachowanie pojemności.",
    sourceNote: "Sprzedawca podaje około 8 KM; wynik zależy od reszty silnika.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-stage6-50cc-streetrace-cast-iron-minarelli-am6-62080",
  },
  {
    id: "stage6-streetrace-77", brand: "Stage6", name: "Streetrace 77 cc", displacement: "77 cc", material: "Żeliwo · 2 pierścienie",
    tier: "sport", priceEur: 249, power: [10, 14], rpm: [8500, 11500], note: "Większa pojemność i solidny cylinder. Dobierz wał, gaźnik oraz wydech do konkretnego rocznika silnika.",
    sourceNote: "Zakres mocy jest szacunkiem dla poprawnie zestrojonego zestawu.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-stage6-77cc-streetrace-minarelli-am6-70810",
  },
  {
    id: "stage6-bigracing-77", brand: "Stage6", name: "Big Racing 77 cc", displacement: "77 cc", material: "Aluminium · 1 pierścień",
    tier: "racing", priceEur: 248, power: [15, 20], rpm: [10500, 13500], note: "Cylinder racing z mostkowanym wydechem; wymaga dopasowanego wału, dolotu i komory.",
    sourceNote: "Zakres mocy jest szacunkiem, nie wynikiem pomiaru tego konkretnego motocykla.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-stage6-big-racing-77cc-am6-67881",
  },
  {
    id: "airsal-xtreme-80", brand: "Airsal", name: "XTreme 80 cc", displacement: "ok. 80 cc", material: "Aluminium · powłoka Nikasil",
    tier: "racing", priceEur: 257, power: [15, 20], rpm: [10500, 14000], note: "Seryjny skok wału, 6 kanałów transferowych i mostkowany wydech; producent zaleca mocny osprzęt.",
    sourceNote: "Zakres mocy jest szacunkiem dla poprawnie zestrojonego zestawu.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-airsal-xtrem-80cc-minarelli-am6-107619",
  },
  {
    id: "malossi-mhr-replica-80", brand: "Malossi", name: "MHR Replica 80 cc", displacement: "77 cc", material: "Aluminium · powłoka Nikasil · 2 pierścienie",
    tier: "racing", priceEur: 328, power: [10, 14], rpm: [9000, 12000], note: "Replika MHR z szerokim pasmem; dobierz wydech, wał i gaźnik według wersji silnika.",
    sourceNote: "Sprzedawca szacuje około 10–14 KM zależnie od konfiguracji.", url: "https://www.maxiscoot.com/en/product/cylinder-malossi-mhr-replica-79cc-aluminium-minarelli-am6-23422",
  },
  {
    id: "stage6-rt-70", brand: "Stage6 R/T", name: "R/T 70 cc", displacement: "ok. 70 cc", material: "Aluminium · głowica modularna",
    tier: "high-end", priceEur: 399, power: [20, 24], rpm: [12500, 14500], note: "Wymaga wału, gaźnika, sprzęgła i wydechu klasy high-end; wariant wyczynowy.",
    sourceNote: "Na karcie hamowni Stage6 referencyjny zestaw R/T osiągnął 23,69 KM; inna konfiguracja części może dać inny wynik.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-stage6-r-t-70-am6-255518",
  },
  {
    id: "malossi-mhr-team-79", brand: "Malossi", name: "MHR Team 79 cc", displacement: "79 cc", material: "Aluminium · powłoka Nikasil · 1 pierścień",
    tier: "high-end", priceEur: 364, power: [18, 22], rpm: [11500, 14000], note: "Wyścigowy zestaw wymagający dużego gaźnika, wydechu racing/high-end i wzmocnionego wału.",
    sourceNote: "Sprzedawca podaje około 22 KM przy około 12 000 obr./min dla dopasowanego zestawu.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-malossi-mhr-team-79cc-aluminium-minarelli-am6-23130",
  },
  {
    id: "mvt-ironmax-75-am6", brand: "MVT", name: "Iron Max 75 cc · żeliwo", displacement: "75 cc", material: "Żeliwo · tłok 2-pierścieniowy",
    tier: "sport", priceEur: 138, power: [10, 14], rpm: [8500, 11500], note: "Momentowy cylinder do codziennej jazdy. Ma seryjny skok wału; MVT zaleca gaźnik 21–24 mm i wzmocniony wał jako zapas trwałości.",
    sourceNote: "14 KM to deklaracja sprzedawcy dla właściwie dobranego zestawu; wynik zależy od osprzętu i strojenia.", url: "https://mvt-parts.com/en/iron-max-cylinder-kit/224-mvt-im10-cylinder-kit-mvt-iron-max-75cc-minarelli-am6-3701674304360", compatibleEngines: ["Minarelli AM6"],
  },
  {
    id: "stage6-streetrace-88-am6", brand: "Stage6 Streetrace", name: "88 cc · żeliwo · długi skok", displacement: "88 cc", material: "Żeliwo · tłok 2-pierścieniowy",
    tier: "racing", priceEur: 298, power: [15, 20], rpm: [9000, 12500], note: "Trwała wersja Streetrace. Do 88 cc wymaga wału 45 mm / korbowodu 90 mm i obróbki skrzyni korbowej.",
    sourceNote: "Zakres orientacyjny kompletnego zestawu; karta Stage6 opisuje cylinder jako Streetrace z żeliwa.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-stage6-86-88cc-streetrace-cast-iron-minarelli-am6-70811", recommendedCrankshaft: "stage6-hpc45-am6", recommendedExhaust: "stage6-rt-exhaust-80-90-am6", compatibleEngines: ["Minarelli AM6"],
  },
  {
    id: "stage6-bigracing-88-am6", brand: "Stage6 Big Racing", name: "88 cc · aluminium · długi skok", displacement: "88 cc", material: "Aluminium · tłok Vertex 1-pierścieniowy",
    tier: "high-end", priceEur: 332, power: [23, 27], rpm: [10500, 14500], note: "Prawdziwy Big Racing, nie Streetrace: wymaga wału 45 mm / korbowodu 90 mm, dłuższych szpilek i obróbki karterów. Stage6 zmierzył 27 KM w swojej konfiguracji.",
    sourceNote: "27 KM i 13,6 Nm to wynik hamowni Stage6 dla konkretnego osprzętu, a nie gwarantowany wynik każdego silnika.", url: "https://stage6-racing.com/en/product/cylinder-kit-stage6-big-racing-86cc-88cc-stroke-45mm-am6/", recommendedCrankshaft: "stage6-hpc45-am6", recommendedExhaust: "stage6-rt-exhaust-80-90-am6", compatibleEngines: ["Minarelli AM6"],
  },
  {
    id: "top-performances-86-am6", brand: "Top Performances", name: "Top Alu 86 cc · pakiet z wałem 44 mm", displacement: "86 cc", material: "Aluminium · cylinder + wał w zestawie",
    tier: "high-end", priceEur: 434, power: [22, 25], rpm: [10500, 15000], note: "Cena dotyczy pakietu T9924240: cylinder, głowica, tłok, uszczelki, wał 44 mm i łożyska wału. Wymaga dopasowanego wydechu oraz dużego gaźnika.",
    sourceNote: "24–25 KM to deklaracja sprzedawcy dla kompletnego, poprawnie zestrojonego zestawu.", url: "https://www.maxiscoot.com/en/product/tuning-kit-top-performances-86cc-am6-24631", recommendedCrankshaft: "top-86-am6-crank-included", recommendedExhaust: "stage6-rt-exhaust-80-90-am6", compatibleEngines: ["Minarelli AM6"],
  },
  {
    id: "italkit-95-am6", brand: "Italkit", name: "94–95 cc · pakiet wyścigowy z wałem", displacement: "ok. 94–95 cc", material: "Aluminium · głowica 2-częściowa",
    tier: "high-end", priceEur: 445, power: [24, 31], rpm: [10500, 15000], note: "Pakiet K.44.952.G14: cylinder 52 mm, skok 44 mm, wał i osprzęt montażowy. Producent kataloguje go jako 94 cc; nazwa handlowa bywa zaokrąglana do 95 cc.",
    sourceNote: "Zakres mocy jest szacunkiem dla całego silnika po obróbce i strojeniu; nie jest deklaracją hamowni.", url: "https://www.motorecambiosvferrer.es/kit-equipo-y-ciguenal/kit-cilindro-ciguenal-italkit-k44952g14.html", recommendedCrankshaft: "italkit-95-am6-crank-included", recommendedExhaust: "stage6-rt-exhaust-80-90-am6", compatibleEngines: ["Minarelli AM6"],
  },
  {
    id: "bidalot-rf70-am6", brand: "Bidalot Racing Factory", name: "RF70 WR · 70 cc", displacement: "70 cc", material: "Aluminium · Nikasil · 7 transferów",
    tier: "high-end", priceEur: 349, power: [18, 23], rpm: [11000, 14500], note: "Wyścigowy cylinder RF-WR na seryjny skok i korbowód. Wymaga wzmocnionego wału, gaźnika około 24 mm lub większego oraz mocnego sprzęgła.",
    sourceNote: "Zakres orientacyjny kompletnego zestawu; karta Bidalot potwierdza geometrię i klasę High-end.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-bidalot-rf70wr-minarelli-am6-77923", recommendedCrankshaft: "stage6-hpc", compatibleEngines: ["Minarelli AM6"],
  },
  {
    id: "bidalot-rf90-am6", brand: "Bidalot Racing Factory", name: "RF90 WR · 90 cc", displacement: "90 cc", material: "Aluminium · Nikasil · tłok 50,5 mm",
    tier: "high-end", priceEur: 449, power: [25, 32], rpm: [11000, 15000], note: "Wymaga wału 44,9 mm / korbowodu 90 mm, odpowiedniego sworznia 13 mm i obróbki karterów. Dobierz dedykowany wydech RF90/96.",
    sourceNote: "Zakres orientacyjny dla kompletnego silnika; sprawdź instrukcję RF dla sworznia, wału i kołnierza.", url: "https://www.maxiscoot.com/fr/produit/kit-cylindre-bidalot-racing-factory-90-wr-minarelli-am6-77696", recommendedCrankshaft: "bidalot-rf90-am6-crank", recommendedExhaust: "bidalot-rf90-am6-exhaust", compatibleEngines: ["Minarelli AM6"],
  },
  {
    id: "2fast-80-am6", brand: "2Fast", name: "80 cc · skok 44,9 mm", displacement: "80 cc", material: "Aluminium · Nikasil · głowica modularna",
    tier: "high-end", priceEur: 489, power: [22, 29], rpm: [11000, 15000], note: "Wymaga wału 44,9 mm / korbowodu 90 mm, szpilek 102 mm, gaźnika 28 mm i zapłonu rotorowego. To zestaw wyścigowy, nie drogowy.",
    sourceNote: "Zakres szacunkowy dla dopasowanego silnika; użyj instrukcji 2Fast do ustawienia squishu i stopnia sprężania.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-2fast-80cc-stroke-44.9mm-minarelli-am6-79731", recommendedCrankshaft: "2fast-449-am6-crank", recommendedExhaust: "stage6-rt-exhaust-80-90-am6", compatibleEngines: ["Minarelli AM6"],
  },
  {
    id: "2fast-100-am6", brand: "2Fast", name: "100 cc · Big Bore", displacement: "100 cc", material: "Aluminium · Nikasil · zestaw wyścigowy",
    tier: "high-end", priceEur: 534.29, power: [25, 34], rpm: [10500, 15000], note: "Wymaga wału 47 mm / korbowodu 95 mm, sworznia 14 mm, frezowania karterów i szpilek 116 mm; cylinder nie ma homologacji.",
    sourceNote: "Zakres mocy jest orientacyjny dla kompletnego, zestrojonego silnika. Karta produktu wymaga specjalnego wydechu i dolotu.", url: "https://www.dam-sport.net/en/cylinder-kit-2fast-100cc-am6.html", recommendedCrankshaft: "2fast-47-am6-crank", recommendedExhaust: "2fast-100-am6-exhaust", compatibleEngines: ["Minarelli AM6"],
  },
  {
    id: "stage6-rt-95-am6", brand: "Stage6 R/T", name: "R/T Big Bore 95 cc · sworzeń 14 mm", displacement: "95 cc", material: "Aluminium · chromowana gładź · głowica modularna",
    tier: "high-end", priceEur: 459, power: [27, 34], rpm: [10500, 15000], note: "Wymaga wału R/T 44 mm / korbowodu 90 mm / sworznia 14 mm, obróbki karterów i kontroli paliwa. Stage6 rekomenduje wydech R/T 80–90.",
    sourceNote: "Około 30 KM i więcej jest możliwe wyłącznie z odpowiednim osprzętem; wynik zależy od konfiguracji i strojenia.", url: "https://www.maxiscoot.com/en/product/cylinder-kit-stage6-r-t-big-bore-95cc-14mm-pin-minarelli-am6-66610", recommendedCrankshaft: "stage6-rt-95-am6-crank", recommendedExhaust: "stage6-rt-exhaust-80-90-am6", compatibleEngines: ["Minarelli AM6"],
  },
];

export const categoryLabels: Record<PartCategory, { title: string; helper: string }> = {
  crankshaft: { title: "Wał korbowy", helper: "Przy seryjnym wale wybierz kontrolę i pomiar. Mocniejsze cylindry wymagają wału odpowiedniego do obrotów i skoku." },
  bearings: { title: "Łożyska i uszczelniacze wału", helper: "Wymieniaj przy rozpoławianiu silnika lub zużyciu. Dobierz wymiary do czopów wybranego wału; zestawy mogą zawierać inne elementy." },
  carburetor: { title: "Gaźnik i dolot", helper: "Dobierz średnicę gaźnika do cylindra, króćca i poziomu obrotów; po montażu ustaw dyszę." },
  intakeManifold: { title: "Króciec dolotowy", helper: "Sprawdź średnicę połączenia od strony gaźnika, kąt ustawienia i miejsce w ramie." },
  reed: { title: "Membrana", helper: "Zostaw seryjną przy łagodnym zestawie albo dobierz zawór do przepływu i dolotu." },
  exhaust: { title: "Wydech", helper: "Pasmo komory musi odpowiadać timingom i obrotom cylindra. Sprawdź też wariant mocowania dla ramy." },
  clutch: { title: "Sprzęgło", helper: "Przy wzroście momentu sprawdź poślizg i sprężyny; wzmocniony pakiet nie dodaje mocy sam w sobie." },
  ignition: { title: "Zapłon", helper: "Wersje zapłonu zależą m.in. od rocznika i instalacji elektrycznej motocykla." },
  airFilter: { title: "Filtr powietrza", helper: "Filtr otwarty wymaga ponownego strojenia gaźnika; seryjna puszka często daje lepszą ochronę i ciszę." },
  waterPump: { title: "Pompa wody", helper: "High-flow to opcja dla większego obciążenia cieplnego; nie zastępuje sprawnej chłodnicy i kontroli temperatury." },
};

export const partCatalog: Record<PartCategory, PartOption[]> = {
  crankshaft: [
    { id: "keep-crank", category: "crankshaft", brand: "Seryjny", name: "Pozostaw po kontroli luzów", tier: "daily", priceEur: 0, detail: "Nie jest to nowa część. Użyj tylko po sprawdzeniu łożysk, korbowodu i bicia.", keepExisting: true },
    { id: "doppler-endurance", category: "crankshaft", brand: "Doppler", name: "Endurance · skok seryjny 39 mm", tier: "racing", priceEur: 164, detail: "Wzmocniony pełny wał do 50/70 cc i wysokich obrotów. Oferta wskazuje łożysko sworznia tłoka, ale łożyska główne zamawiaj osobno.", url: "https://www.maxiscoot.com/en/product/crankshaft-doppler-endurance-am6-27219" },
    { id: "stage6-hpc", category: "crankshaft", brand: "Stage6", name: "HPC MK2 · 39 mm / korbowód 85 mm", tier: "racing", priceEur: 225, detail: "Czopy 20/20 mm; w zestawie są dwa łożyska główne 6204 C3 i łożysko sworznia tłoka. Uszczelniacze kupuje się osobno.", url: "https://www.maxiscoot.com/en/product/crankshaft-stage6-hpc-mk2-am6-76649" },
    { id: "stage6-rt-crank", category: "crankshaft", brand: "Stage6 R/T", name: "R/T · 39 mm / korbowód 85 mm", tier: "high-end", priceEur: 211, detail: "Wał o czopach 20/20 mm. Łożyska główne dobierz osobno do wymiaru 20 mm; wał zawiera łożysko sworznia tłoka.", url: "https://www.maxiscoot.com/en/product/crankshaft-stage6-r-t-am6-255845" },
    { id: "top-86-am6-crank-included", category: "crankshaft", brand: "Top Performances", name: "44 mm · wał dołączony do pakietu Top 86", tier: "high-end", priceEur: 0, detail: "Wał i łożyska są już ujęte w cenie pakietu Top Performances T9924240.", includedInCylinder: true },
    { id: "stage6-hpc45-am6", category: "crankshaft", brand: "Stage6 HPC", name: "45 mm / korbowód 90 mm · AM6", tier: "high-end", priceEur: 219, detail: "Wał do cylindrów Stage6 88 cc Streetrace i Big Racing; wymaga szpilek 118 mm oraz kontroli/obróbki przejścia korbowodu.", url: "https://www.maxiscoot.com/en/product/crankshaft-stage6-hpc-45mm-stroke-90mm-connecting-rod-am6-80730" },
    { id: "italkit-95-am6-crank-included", category: "crankshaft", brand: "Italkit", name: "44 mm / korbowód 85 mm · wał w pakiecie", tier: "high-end", priceEur: 0, detail: "Wał jest elementem pakietu Italkit K.44.952.G14; sprawdź zestaw łożysk i uszczelniaczy przed montażem.", includedInCylinder: true },
    { id: "bidalot-rf90-am6-crank", category: "crankshaft", brand: "Bidalot RF", name: "44,9 mm / korbowód 90 mm · sworzeń 13 mm", tier: "high-end", priceEur: 236, detail: "Wał do RF90 WR AM6. Potwierdź średnicę sworznia, czopy oraz wymagane łożyska przed zakupem.", url: "https://www.maxiscoot.com/en/product/crankshaft-bidalot-rf-44%2C9mm-stroke-90mm-conrod-am6-68861" },
    { id: "stage6-rt-95-am6-crank", category: "crankshaft", brand: "Stage6 R/T", name: "44 mm / korbowód 90 mm · sworzeń 14 mm", tier: "high-end", priceEur: 257, detail: "Wał wymagany przez cylinder Stage6 R/T 95 AM6. Ma czopy 20 mm; dobierz łożyska C3 20 mm i sprawdź sworzeń 14 mm.", url: "https://www.maxiscoot.com/en/product/crankshaft-stage6-r-t-44mm-stroke-90mm-conrod-am6-282316" },
    { id: "2fast-449-am6-crank", category: "crankshaft", brand: "2Fast", name: "44,9 mm / korbowód 90 mm · AM6", tier: "high-end", priceEur: 445, detail: "Długi wał do zestawu 2Fast 80 AM6. Potwierdź pasowanie tłoka 12 mm i obróbkę karterów.", url: "https://www.maxiscoot.com/en/product/crankshaft-2fast-44%2C9mm-stroke-90mm-conrod-am6-86379" },
    { id: "2fast-47-am6-crank", category: "crankshaft", brand: "2Fast", name: "47 mm / korbowód 95 mm · AM6", tier: "high-end", priceEur: 439, detail: "Wał opracowany do 2Fast 100 AM6; wymaga łożysk głównych 20 mm (6204) i obróbki karterów.", url: "https://www.maxiscoot.com/en/product/crankshaft-2fast-47mm-stroke-95mm-conrod-am6-65849" },
  ],
  bearings: [
    { id: "keep-bearings", category: "bearings", brand: "Obecne", name: "Nie kupuj, jeśli silnik nie jest rozpoławiany i stan jest dobry", tier: "daily", priceEur: 0, detail: "Przy rozpoławianiu silnika zaleca się montaż nowych łożysk i uszczelniaczy.", keepExisting: true },
    { id: "motoforce-bearings", category: "bearings", brand: "MotoForce", name: "Łożyska + uszczelniacze AM6 · wymiar OEM", tier: "sport", priceEur: 21.5, detail: "Komplet zawiera dwa łożyska i dwa uszczelniacze; oferta podaje wymiar OEM 17 mm. Potwierdź czopy wału przed zakupem.", url: "https://www.maxiscoot.com/en/product/crankshaft-bearing-set-am6-30909" },
    { id: "stage6-rt-bearings", category: "bearings", brand: "Stage6 R/T", name: "Łożyska C3 · stalowy koszyk 20 mm AM6", tier: "high-end", priceEur: 35, detail: "Zestaw do wału z czopami 20 mm, zawiera łożyska i uszczelniacze FKM. Zweryfikuj wymiary przed zakupem.", url: "https://www.maxiscoot.com/en/product/crankshaft-bearing-set-stage6-r-t-c3-steel-20mm-am6-245515" },
  ],
  carburetor: [
    { id: "keep-carb", category: "carburetor", brand: "Seryjny", name: "Pozostaw po kontroli i regulacji", tier: "daily", priceEur: 0, detail: "Nie jest to nowa część. Sprawdź przepływ i dobierz dyszę do cylindra oraz filtra.", keepExisting: true },
    { id: "motoforce-phbg19", category: "carburetor", brand: "MotoForce", name: "PHBG 19 mm · ssanie ręczne", tier: "sport", priceEur: 39.5, detail: "Budżetowa opcja dla umiarkowanego zestawu; przed zakupem sprawdź króciec, linkę gazu, ssanie i zestaw dysz.", url: "https://www.maxiscoot.com/en/product/carburetor-phbg-19-motoforce-cable-lever-choke-81586" },
    { id: "dellorto-21", category: "carburetor", brand: "Dell’Orto", name: "PHBG DS 21 mm", tier: "sport", priceEur: 80.5, detail: "Popularny rozmiar do zestawów sportowych; sprawdź króciec, linkę i dostępne dysze.", url: "https://www.maxiscoot.com/de/kaufen/vergaser-dellorto-21mm-phbg-ds-29542" },
    { id: "motoforce-pwk24", category: "carburetor", brand: "MotoForce Racing", name: "PWK 24 mm · Neochrome", tier: "racing", priceEur: 53, detail: "Większy przepływ do zestawów racing; wymaga króćca o właściwej średnicy i precyzyjnego strojenia dysz.", url: "https://www.maxiscoot.com/en/product/carburetor-pwk-24-motoforce-racing-neochrome-282745" },
    { id: "stage6-pwk28", category: "carburetor", brand: "Stage6 R/T", name: "PWK 28 mm", tier: "high-end", priceEur: 139, detail: "Gaźnik dużego przepływu do zestawów racing/high-end; wymaga właściwego króćca i strojenia.", url: "https://www.maxiscoot.com/en/product/carburetor-pwk-stage6-r-t-47437?varid=38681" },
    { id: "dellorto-phbg19-ds", category: "carburetor", brand: "Dell'Orto", name: "PHBG 19 DS · okrągła przepustnica", tier: "sport", priceEur: 69.9, detail: "Oryginalny Dell'Orto 19mm z regulowaną pompą przyspieszającą i igłą W7. Popularny w zestawach do 70cc.", url: "https://www.maxiscoot.com/en/product/carburetor-dellorto-phbg-19-ds-round-slide-19mm-27459" },
    { id: "dellorto-phbg21-ds", category: "carburetor", brand: "Dell'Orto", name: "PHBG 21 DS · ssanie automatyczne", tier: "sport", priceEur: 85, detail: "21mm wariant z automatycznym ssaniem; często polecany do Stage6 70-77cc i podobnych cylindrów.", url: "https://www.maxiscoot.com/en/product/carburetor-dellorto-phbg-21-ds-round-slide-21mm-23405" },
    { id: "mikuni-tm24", category: "carburetor", brand: "Mikuni", name: "TM24 · płaska przepustnica 24 mm", tier: "racing", priceEur: 112, detail: "Płaskoprzepustnicowy gaźnik japoński ze strojonym śrubowcem paliwa. Użyj z króćcem 24mm i dyszami Mikuni.", url: "https://www.maxiscoot.com/en/product/carburetor-mikuni-tm-24-flat-slide-24mm-46726" },
    { id: "polini-cp19", category: "carburetor", brand: "Polini", name: "CP 19 · okrągła przepustnica", tier: "sport", priceEur: 55, detail: "Włoski gaźnik okrągłoprzepustnicowy 19mm. Prosty w regulacji, polecany do zestawów sport 50-70cc.", url: "https://www.maxiscoot.com/en/product/carburetor-polini-cp-19-round-slide-26614" },
    { id: "keihin-pe28", category: "carburetor", brand: "Keihin", name: "PE 28 · okrągła przepustnica 28 mm", tier: "racing", priceEur: 95, detail: "Popularna 28mm gardziel do mocnych setupów. Sprawdź króciec, igłę i zestaw dysz Keihin.", url: "https://www.maxiscoot.com/en/product/carburetor-keihin-pe-28-round-slide-28mm-61985" },
  ],
  intakeManifold: [
    { id: "keep-intake", category: "intakeManifold", brand: "Obecny", name: "Zostaw, jeśli pasuje szczelnie do gaźnika", tier: "daily", priceEur: 0, detail: "Sprawdź pęknięcia gumy, średnicę króćca i opaski; nieszczelny dolot może uszkodzić silnik.", keepExisting: true },
    { id: "top-perf-manifold", category: "intakeManifold", brand: "Top Performances", name: "Obrotowy 360° · 35 mm PWK / VHST", tier: "racing", priceEur: 37.5, detail: "Podstawa AM6/Derbi z regulowanym gumowym łącznikiem; przeznaczony m.in. do gaźników PWK z przyłączem 35 mm.", url: "https://www.maxiscoot.com/en/product/intake-manifold-top-performances-360-35mm-pwk-vhst-am6-derbi-47561" },
  ],
  reed: [
    { id: "keep-reed", category: "reed", brand: "Seryjna", name: "Zostaw po kontroli listków", tier: "daily", priceEur: 0, detail: "Nie jest to nowa część; wymień pęknięte lub nieszczelne listki.", keepExisting: true },
    { id: "malossi-vl6", category: "reed", brand: "Malossi", name: "VL6 AM6 · Derbi E2/E3", tier: "sport", priceEur: 36.5, detail: "Zawór membranowy do AM6; przed zakupem porównaj rozstaw i kształt z obudową silnika.", url: "https://www.maxiscoot.com/en/product/reed-valve-malossi-vl6-am6-derbi-27249" },
    { id: "stage6-vforce", category: "reed", brand: "Stage6 / Moto Tassinari", name: "VForce 3 AM6", tier: "racing", priceEur: 99, detail: "8 listków z włókna węglowego; producent zaleca do mocnych cylindrów i gaźnika PWK.", url: "https://www.maxiscoot.com/en/product/vforce-3-reed-valve-am6-stage6-54545" },
    { id: "stage6-rt-reed", category: "reed", brand: "Stage6 R/T", name: "Zawór membranowy Viton AM6", tier: "high-end", priceEur: 65, detail: "Zawór do dolotu Stage6 R/T; dobierz króciec i uszczelkę do obudowy.", url: "https://www.maxiscoot.com/en/product/reed-valve-stage6-r-t-viton-am6-derbi-25415" },
    { id: "polini-reed-am6", category: "reed", brand: "Polini", name: "Reed Valve AM6 · włókno węglowe", tier: "racing", priceEur: 42, detail: "Karbon-carbon membrana Polini do AM6. Dobra alternatywa dla VForce, lepsza odpowiedź na zmiany obrotów.", url: "https://www.maxiscoot.com/en/product/reed-valve-polini-carbon-am6-26235" },
    { id: "top-perf-reed-carbon", category: "reed", brand: "Top Performances", name: "Reed Carbon AM6 · listki carbon", tier: "racing", priceEur: 38, detail: "Membrana z listkami z węgla grafitowego; tańsza alternatywa dla VForce w zestawach mid-race.", url: "https://www.maxiscoot.com/en/product/reed-valve-top-performances-carbon-am6-42697" },
    { id: "boyesen-supercooler", category: "reed", brand: "Boyesen", name: "RAD Valve AM6 · listek Power Reed", tier: "high-end", priceEur: 89, detail: "Wielopłatkowy zawór Boyesen RAD Valve do AM6. Bardzo szeroki przepływ, doskonały do mocnych cylindrów. Sprawdź króciec.", url: "https://www.maxiscoot.com/en/product/reed-valve-boyesen-rad-valve-am6-derbi-296830" },
  ],
  exhaust: [
    { id: "keep-exhaust", category: "exhaust", brand: "Seryjny", name: "Zostaw seryjny wydech", tier: "daily", priceEur: 0, detail: "Nie jest to nowa część; przy zmianie cylindra zwykle ogranicza osiągi.", keepExisting: true },
    { id: "yasuni-r2", category: "exhaust", brand: "Yasuni", name: "R2 AM6 / Derbi", tier: "sport", priceEur: 247, detail: "Wydech sport/midrace do 50–70 cc. Dopasuj wersję mocowania do ramy i sprawdź homologację.", url: "https://www.maxiscoot.com/en/product/exhaust-yasuni-r2-am6-derbi-red-301451" },
    { id: "voca-rookie", category: "exhaust", brand: "Voca Racing", name: "Rookie 50/70 cc · AM6", tier: "racing", priceEur: 205, detail: "Nisko prowadzona komora do 50/70 cc; listing podaje brak tłumika w zestawie. Homologacja dotyczy wersji z restryktorem — sprawdź kompletację i wariant mocowania.", url: "https://www.maxiscoot.com/en/product/exhaust-voca-rookie-50-70cc-am6-298710" },
    { id: "yasuni-r3", category: "exhaust", brand: "Yasuni", name: "R3 AM6 / Derbi", tier: "racing", priceEur: 313, detail: "Wyższe pasmo niż R2; potwierdź położenie komory, wariant ramy i homologację.", url: "https://www.maxiscoot.com/en/product/exhaust-yasuni-r3-am6-derbi-orange-301439" },
    { id: "stage6-rt-exhaust", category: "exhaust", brand: "Stage6 R/T", name: "R/T 70–80 cc AM6", tier: "high-end", priceEur: 399, detail: "Wydech high-end do 70–80 cc AM6, low-mount, bez homologacji.", url: "https://www.maxiscoot.com/en/product/exhaust-stage6-r-t-70-80-am6-blue-309590" },
    { id: "stage6-rt-exhaust-80-90-am6", category: "exhaust", brand: "Stage6 R/T", name: "R/T 80–90 cc · AM6", tier: "high-end", priceEur: 454, detail: "Wydech high-end, który Stage6 wskazuje do Big Racing 88, Streetrace 88 i Top Alu 86. Wersja low-mount; sprawdź miejsce w ramie.", url: "https://stage6-racing.com/en/product/exhaust-stage6-r-t-80-90-am6-black-red/" },
    { id: "bidalot-rf90-am6-exhaust", category: "exhaust", brand: "Bidalot Racing Factory", name: "RF90/96-WR · AM6", tier: "high-end", priceEur: 410, detail: "Komora przeznaczona do cylindrów Bidalot RF90/96-WR. Potwierdź rocznik, stronę prowadzenia i kołnierz.", url: "https://www.bidalot.fr/pieces-racing-pro1/1261-echappement-rf9096-wr-mina-am.html" },
    { id: "2fast-100-am6-exhaust", category: "exhaust", brand: "2Fast", name: "100 cc · AM6", tier: "high-end", priceEur: 467, detail: "Wydech do projektu 2Fast 100 AM6; zweryfikuj wersję mocowania i kołnierz cylindra.", url: "https://www.scooter-attack.com/en/product/exhaust-2fast-100cc-minarelli-am6-66967" },
  ],
  clutch: [
    { id: "keep-clutch", category: "clutch", brand: "Seryjne", name: "Zostaw po kontroli", tier: "daily", priceEur: 0, detail: "Nie jest to nowa część; wymień lub wzmocnij, jeśli sprzęgło się ślizga.", keepExisting: true },
    { id: "top-perf-4disc", category: "clutch", brand: "Top Performances", name: "Komplet 4 tarcz AM6", tier: "sport", priceEur: 45, detail: "Zestaw tarcz do AM6; sprawdź grubość, sprężyny i stan kosza. Nie zastępuje prawidłowego doboru sprężyn.", url: "https://www.maxiscoot.com/en/product/clutch-discs-4-discs-top-performances-minarelli-am6-27076" },
    { id: "top-perf-clutch", category: "clutch", brand: "Top Performances", name: "TPR · komplet tarcz i sprężyn", tier: "racing", priceEur: 72.5, detail: "Wzmocnione tarcze, sprężyny i elementy sprzęgła do zestawów sport/racing.", url: "https://www.maxiscoot.com/en/product/clutch-kit-incl.-discs-top-performances-tpr-minarelli-am6-227232" },
    { id: "stage6-rt-clutch", category: "clutch", brand: "Stage6 R/T", name: "Sprzęgło 5-tarczowe MK2 AM6", tier: "high-end", priceEur: 82.5, detail: "Wielotarczowy pakiet do wyczynowych zestawów AM6.", url: "https://stage6-racing.com/en/product/clutch-discs-5-discs-stage6-r-t-minarelli-am6/" },
  ],
  ignition: [
    { id: "keep-ignition", category: "ignition", brand: "Seryjny", name: "Zostaw seryjny zapłon", tier: "daily", priceEur: 0, detail: "Nie jest to nowa część. Sprawdź wariant CDI, statora i instalacji dla rocznika.", keepExisting: true },
    { id: "top-perf-cdi", category: "ignition", brand: "Top Performances", name: "CDI + cewka 3-przewodowa AM6", tier: "sport", priceEur: 51, detail: "Moduł CDI z cewką; przed zakupem sprawdź liczbę przewodów i zgodność z instalacją konkretnego rocznika.", url: "https://www.maxiscoot.com/en/product/cdi-coil-3-wires-top-performances-am6-derbi-euro-2-3-21212" },
    { id: "mvt-premium", category: "ignition", brand: "MVT", name: "Premium z oświetleniem · AM6", tier: "racing", priceEur: 217, detail: "Zapłon wewnętrzny z zasilaniem oświetlenia; potwierdź zgodność z rocznikiem przed zakupem.", url: "https://www.maxiscoot.com/en/product/ignition-mvt-premium-with-lighting-am6-31475" },
    { id: "mvt-dd", category: "ignition", brand: "MVT", name: "Digital Direct · AM6 po 2003", tier: "high-end", priceEur: 247, detail: "Cyfrowa krzywa zapłonu i zasilanie oświetlenia; istnieją różne wersje dla roczników.", url: "https://www.maxiscoot.com/en/product/ignition-mvt-digital-direct-am6-after-2003-27927" },
  ],
  airFilter: [
    { id: "keep-airbox", category: "airFilter", brand: "Seryjny", name: "Pozostaw seryjną puszkę", tier: "daily", priceEur: 0, detail: "Nie jest to nowa część. Wyczyść i po zmianie dolotu ponownie ustaw gaźnik.", keepExisting: true },
    { id: "malossi-e17", category: "airFilter", brand: "Malossi", name: "E17 · króciec 32/38 mm PHBG/PHBL", tier: "sport", priceEur: 27, detail: "Filtr otwarty do określonych średnic gaźnika; zmierz króciec i ponownie dostrój gaźnik po montażu.", url: "https://www.maxiscoot.com/en/product/air-filter-malossi-e17-32-38mm-phbg-phbl-straight-33531" },
    { id: "stage6-filter", category: "airFilter", brand: "Stage6", name: "Racing Filter · krótki PHBG", tier: "racing", priceEur: 27, detail: "Filtr otwarty; sprawdź średnicę króćca i zwiększ dawkę paliwa po montażu.", url: "https://www.maxiscoot.com/en/product/racing-air-filter-stage6-short-35mm-phva-phbg-red-23509" },
    { id: "stage6-pwk-filter", category: "airFilter", brand: "Stage6", name: "Racing Filter · 28–50 mm z redukcjami", tier: "racing", priceEur: 35, detail: "Filtr z adapterami dla króćców 28–50 mm; oferta wymienia gaźniki PWK. Po montażu ponownie dostrój gaźnik.", url: "https://www.maxiscoot.com/en/product/racing-air-filter-stage6-28-50mm-black-249955" },
  ],
  waterPump: [
    { id: "keep-pump", category: "waterPump", brand: "Seryjna", name: "Pozostaw sprawną pompę", tier: "daily", priceEur: 0, detail: "Nie jest to nowa część. Najpierw sprawdź obieg, szczelność, chłodnicę i temperaturę.", keepExisting: true },
    { id: "stage6-pump", category: "waterPump", brand: "Stage6", name: "High Flow AM6", tier: "racing", priceEur: 74, detail: "Zestaw pompy o zwiększonym przepływie; opcjonalny dodatek do mocno obciążonego silnika.", url: "https://www.maxiscoot.com/en/product/water-pump-high-flow-stage6-yellow-am6-256400" },
  ],
};

export const categoryOrder: PartCategory[] = ["crankshaft", "bearings", "carburetor", "intakeManifold", "reed", "exhaust", "clutch", "ignition", "airFilter", "waterPump"];

export const defaultPartsByGoal: Record<SetupGoal, Record<PartCategory, string>> = {
  daily: { crankshaft: "keep-crank", bearings: "keep-bearings", carburetor: "motoforce-phbg19", intakeManifold: "keep-intake", reed: "keep-reed", exhaust: "yasuni-r2", clutch: "keep-clutch", ignition: "keep-ignition", airFilter: "keep-airbox", waterPump: "keep-pump" },
  sport: { crankshaft: "keep-crank", bearings: "keep-bearings", carburetor: "dellorto-21", intakeManifold: "keep-intake", reed: "keep-reed", exhaust: "yasuni-r2", clutch: "keep-clutch", ignition: "keep-ignition", airFilter: "keep-airbox", waterPump: "keep-pump" },
  race: { crankshaft: "stage6-hpc", bearings: "keep-bearings", carburetor: "stage6-pwk28", intakeManifold: "top-perf-manifold", reed: "stage6-vforce", exhaust: "yasuni-r3", clutch: "top-perf-clutch", ignition: "keep-ignition", airFilter: "stage6-pwk-filter", waterPump: "keep-pump" },
  track: { crankshaft: "stage6-rt-crank", bearings: "stage6-rt-bearings", carburetor: "stage6-pwk28", intakeManifold: "top-perf-manifold", reed: "stage6-rt-reed", exhaust: "stage6-rt-exhaust", clutch: "stage6-rt-clutch", ignition: "mvt-dd", airFilter: "stage6-pwk-filter", waterPump: "stage6-pump" },
};

export const goalsByTier: Record<Tier, SetupGoal> = { daily: "daily", sport: "sport", racing: "race", "high-end": "track" };
export const tierRank: Record<Tier, number> = { daily: 0, sport: 1, racing: 2, "high-end": 3 };
export const tierLabels: Record<Tier, string> = { daily: "Daily", sport: "Sport", racing: "Racing", "high-end": "High-end" };
