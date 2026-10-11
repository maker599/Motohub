export type CatalogProduct = {
  id: string;
  category: string;
  brand: string;
  name: string;
  pricePln: number;
  store: string;
  url: string;
  fitmentCheck?: boolean;
  note?: string;
};

export const productCategoryLabels: Record<string, string> = {
  brakePads: "Hamulce · klocki",
  brakeDiscs: "Hamulce · tarcze",
  brakeCalipers: "Hamulce · zaciski",
  filtersAir: "Filtry · powietrza",
  filtersFuel: "Filtry · paliwa",
  oils2T: "Oleje · mieszanka 2T",
  suspension: "Zawieszenie",
  plastics: "Supermoto · owiewki",
  chains: "Napęd · łańcuchy",
  chainCare: "Napęd · konserwacja",
  clutchParts: "Sprzęgło",
  sparkPlugs: "Silnik · świece",
  batteries: "Elektryka · akumulatory",
};

export const productCatalogUpdated = "2026-10-09";

export const productCatalog: CatalogProduct[] = [
  { id: "pad-beta-rr50", category: "brakePads", brand: "FA367/2TT", name: "Klocki hamulcowe do Beta 50/125 RR", pricePln: 14, store: "Gmoto.pl", url: "https://gmoto.pl/klocki-hamulca-przod-do-beta-50-125-rr,135157.html", fitmentCheck: true, note: "Sprawdź kod klocka, zacisk i rocznik." },
  { id: "disc-derbi-senda", category: "brakeDiscs", brand: "HLP", name: "Tarcza hamulcowa 180 mm, Derbi Senda R/SR", pricePln: 89, store: "Gmoto.pl", url: "https://gmoto.pl/tarcza-hamulcowa-hlp-derbi-senda-50-r-1997-senda-50-sr-2001-180x62x38-ng089,3084970.html", fitmentCheck: true, note: "Zweryfikuj średnicę, rozstaw śrub oraz rocznik." },
  { id: "caliper-derbi-ajp", category: "brakeCalipers", brand: "101 Octane", name: "Zacisk hamulcowy AJP, Senda/RCR/MRX/DT", pricePln: 137.12, store: "Gmoto.pl", url: "https://gmoto.pl/zacisk-hamulcowy-senda-rcr-motorhispania-mrx-dt-uklad-ajp-101-octane,312463.html", fitmentCheck: true, note: "Wymagany zgodny układ AJP i mocowanie." },
  { id: "caliper-derbi-rear", category: "brakeCalipers", brand: "101 Octane", name: "Zacisk tylny Aprilia RX/SX, Derbi Senda, Gilera RCR/SMT", pricePln: 285.89, store: "Gmoto.pl", url: "https://gmoto.pl/zacisk-hamulcowy-tyl-oem-aprilia-rx-sx-derbi-senda-gilera-rcr-smt-50-101-octane,312468.html", fitmentCheck: true, note: "Sprawdź jarzmo, mocowanie i średnicę tarczy." },
  { id: "filter-air-2t", category: "filtersAir", brand: "Gmoto", name: "Wkład filtra powietrza do 2T", pricePln: 12.66, store: "Gmoto.pl", url: "https://gmoto.pl/wklad-filtra-powietrza,57140.html", fitmentCheck: true, note: "Porównaj kształt i wymiary starego wkładu." },
  { id: "filter-air-cone35", category: "filtersAir", brand: "MCN", name: "Filtr stożkowy, króciec 35 mm", pricePln: 19.88, store: "Gmoto.pl", url: "https://gmoto.pl/filtr-stozkowy-d35-mcn,140226.html", fitmentCheck: true, note: "Zmierz króciec gaźnika i sprawdź miejsce montażu." },
  { id: "filter-air-foam38", category: "filtersAir", brand: "Gmoto", name: "Filtr powietrza gąbkowy prosty 38 mm", pricePln: 27.49, store: "Gmoto.pl", url: "https://gmoto.pl/filtr-powietrza-gabkowy-prosty-38mm,316857.html", fitmentCheck: true, note: "Zmierz króciec; filtr gąbkowy wymaga regularnego serwisu." },
  { id: "filter-fuel6", category: "filtersFuel", brand: "Gmoto", name: "Filtr paliwa", pricePln: 5, store: "Gmoto.pl", url: "https://gmoto.pl/filtr-paliwa,58204.html", fitmentCheck: true, note: "Dobierz średnicę do przewodu paliwa." },
  { id: "filter-fuel8", category: "filtersFuel", brand: "Gmoto", name: "Filtr paliwa 8 mm", pricePln: 8.35, store: "Gmoto.pl", url: "https://gmoto.pl/filtr-paliwa-8mm,681029.html", fitmentCheck: true, note: "Potwierdź średnicę króćców." },
  { id: "oil-motul-710", category: "oils2T", brand: "Motul", name: "710 2T, olej syntetyczny 1 L", pricePln: 69, store: "Gmoto.pl", url: "https://gmoto.pl/motul-710-2t-ester-blend-1l-olej-silnikowy-syntetyczny,23280.html", note: "Dozowanie i zgodność sprawdź w instrukcji silnika." },
  { id: "oil-motul-510", category: "oils2T", brand: "Motul", name: "510 2T, olej półsyntetyczny 1 L", pricePln: 52.25, store: "Gmoto.pl", url: "https://gmoto.pl/motul-510-2t-1l-olej-silnikowy-polsyntetyczny,23288.html", note: "Dozowanie i zgodność sprawdź w instrukcji silnika." },
  { id: "oil-motul-800", category: "oils2T", brand: "Motul", name: "800 2T Off Road, olej syntetyczny 1 L", pricePln: 157.36, store: "Gmoto.pl", url: "https://gmoto.pl/motul-800-2t-off-road-factory-line-1l-olej-silnikowy-syntetyczny,23279.html", note: "Dozowanie i zgodność sprawdź w instrukcji silnika." },
  { id: "suspension-shock-romet", category: "suspension", brand: "Gmoto", name: "Amortyzator tylny, komplet Romet", pricePln: 178.60, store: "Gmoto.pl", url: "https://gmoto.pl/amortyzator-tyl-komplet-org-romet,206108.html", fitmentCheck: true, note: "Oferta modelowa Romet; sprawdź długość i mocowania." },
  { id: "suspension-head-bearings", category: "suspension", brand: "Gmoto", name: "Łożyska główki ramy, Romet", pricePln: 13.99, store: "Gmoto.pl", url: "https://gmoto.pl/wianki-lozyska-sztycy-glowki-ramy-romet,76963.html", fitmentCheck: true, note: "Oferta modelowa Romet." },
  { id: "suspension-fork-seal", category: "suspension", brand: "Gmoto", name: "Uszczelniacz lagi 35×47×7/12 mm, MZ ETZ", pricePln: 12.52, store: "Gmoto.pl", url: "https://gmoto.pl/uszczelniacz-lag-amortyzatora-przod-etz-35x47x712,81269.html", fitmentCheck: true, note: "Sprawdź wymiary uszczelniacza i średnicę lagi." },
  { id: "plastic-derbi-headlight", category: "plastics", brand: "Derbi/Gilera", name: "Owiewka reflektora biała, Senda DRD 10–17 / RCR-SMT 11–17", pricePln: 118.99, store: "Mieloch.pl", url: "https://mieloch.pl/oslona-owiewka-plastik-reflektora-biala-derbi-senda-drd-10-17-gilera-rcr-smt-11-17", fitmentCheck: true, note: "Sprawdź generację, mocowania i kolor." },
  { id: "plastic-derbi-rad-left", category: "plastics", brand: "Derbi/Gilera", name: "Osłona chłodnicy lewa niebieska, Senda DRD / RCR-SMT", pricePln: 183.11, store: "Mieloch.pl", url: "https://mieloch.pl/oslona-owiewka-plastik-chlodnicy-lewa-niebieska-derbi-senda-drd-10-17-gilera-rcr-smt-11-17", fitmentCheck: true, note: "Sprawdź generację, stronę i kolor." },
  { id: "chain-ybn-415h", category: "chains", brand: "YBN", name: "Łańcuch 415H, 118 ogniw", pricePln: 31.47, store: "Gmoto.pl", url: "https://gmoto.pl/lancuch-ybn-415h-118-ogniw,73480.html", fitmentCheck: true, note: "Zweryfikuj podziałkę i długość dla zestawu zębatek." },
  { id: "chain-did-428", category: "chains", brand: "DID", name: "Łańcuch 428 AD, 120 ogniw", pricePln: 69.21, store: "Gmoto.pl", url: "https://gmoto.pl/lancuch-napedowy-did,77004.html", fitmentCheck: true, note: "Zweryfikuj podziałkę i długość dla zestawu zębatek." },
  { id: "chain-lube-motul", category: "chainCare", brand: "Motul", name: "C2 Chain Lube, smar do łańcucha 400 ml", pricePln: 50.10, store: "Gmoto.pl", url: "https://gmoto.pl/motul-chain-lube-road-400ml-smar-do-lancucha-w-aerozolu,78433.html" },
  { id: "clutch-am6-discs", category: "clutchParts", brand: "Gmoto", name: "Tarcze sprzęgła AM6, komplet 4 szt.", pricePln: 34.17, store: "Gmoto.pl", url: "https://gmoto.pl/tarcze-sprzegla-kpl-am6-4-sztuki,63366.html", fitmentCheck: true, note: "Potwierdź wersję sprzęgła i liczbę tarcz." },
  { id: "spark-ngk-br9es", category: "sparkPlugs", brand: "NGK", name: "Świeca zapłonowa BR9ES", pricePln: 17.96, store: "Gmoto.pl", url: "https://gmoto.pl/ngk-swieca-br9es,477.html", fitmentCheck: true, note: "Sprawdź ciepłotę, gwint i zalecenie producenta silnika." },
  { id: "spark-ngk-br8hs", category: "sparkPlugs", brand: "NGK", name: "Świeca zapłonowa BR8HS", pricePln: 16.72, store: "Gmoto.pl", url: "https://gmoto.pl/ngk-swieca-br8hs,246.html", fitmentCheck: true, note: "Sprawdź ciepłotę, gwint i zalecenie producenta silnika." },
  { id: "battery-hlp-5ah", category: "batteries", brand: "HLP", name: "Akumulator żelowy 12 V 5 Ah YTX5L-BS", pricePln: 59, store: "Gmoto.pl", url: "https://gmoto.pl/akumulator-zelowy-12v-5ah-hlp-htx5l-bs-ytx5l-bs,2959847.html", fitmentCheck: true, note: "Sprawdź wymiary, bieguny i parametry wymagane przez motocykl." },
];