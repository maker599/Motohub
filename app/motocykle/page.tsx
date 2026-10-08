"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SiteNav from "../SiteNav";

import { bikes } from "./motorcycles";



const types = ["Naked", "Sport", "Adventure", "Touring", "Enduro", "MX", "Cruiser"];

const previewImages: Record<string, string> = {
  "yamaha-mt07": "https://mcn-images.bauersecure.com/wp-images/292866/822x548/2025-yamaha-mt-07-08.jpg",
  "yamaha-mt09": "https://soymotero.net/wp-content/uploads/2025/12/Yamaha-MT-09-Y-AMT-2026-1.jpg",
  "yamaha-yz125": "https://img.stcrm.it/images/38344826/HOR_STD/800x/2025-yamaha-yz125lc-eu-icon_blue-studio-002-03.jpg",
  "yamaha-yz250": "https://cloudfront-us-east-1.images.arcpublishing.com/octane/BMDGOMSLGFF7XDLBL5DVCTON6Y.jpg",
  "yamaha-r7": "https://www.2ri.de/Images/Big/8/News_2025-Yamaha-YZF-R7f.jpg",
  "yamaha-tenere700": "https://d1uzk9o9cg136f.cloudfront.net/f/16782548/rc/2025/03/13/df0f4760e9535b827361846bccdaae76de9f7f89_xlarge.jpg",
  "honda-cbr650r": "https://images.motoren-toerisme.be/2023-12/2024_honda_cbr650r_01.jpg?auto=format&fit=max&h=1024&ixlib=php-1.1.0&q=65&s=fb115bd4baa892ecb6fa8426b97f8e10",
  "honda-crf250r": "https://cdn.shopify.com/s/files/1/0578/8722/8063/files/25-honda-crf250r_red_rhp.jpg?v=1748897017",
  "honda-crf450r": "https://www.konenygard.fi/assets/ProductCatalog/199/SilverShop_Page_Product-198253/honda-CRF450R-2025-6.webp",
  "honda-rebel500": "https://global.honda/content/dam/site/global-jp/news-new/cq_img/2025/02/2250206-rebel500/web/2250206-rebel500_004L.jpg",
  "suzuki-gsx8r": "https://actionbike.fr/uploads/pictures/modele_218628995/_xl_image.jpg",
  "suzuki-gsx8s": "https://moto.suzuki.es/storage/images/a39xfm5kebwqc7dsorrrdbp2lgcfothbkxxwt0pp.jpg",
  "suzuki-vstrom800": "https://www.motorrad-bilder.at/slideshows/291/023935/V-Strom_8005.jpg",
  "kawasaki-z900": "https://storage.kawasaki.eu/public/kawasaki.eu/en-EU/model/25ZR900S_40SBK1DRF3CG_A.jpg",
  "kawasaki-ninja650": "https://www.kawasaki.de/content/dam/products/pim/studio/s/Resource_312886_25EX650P_S_44SGN1DRF3CG_A.jpg",
  "kawasaki-zx6r": "https://www.kawasaki.no/content/dam/products/pim/studio/nin/Resource_317568_25MY_Ninja_ZX-6R_Performance_GN2_Front.jpg",
  "kawasaki-kx450": "https://content2.kawasaki.com/ContentStorage/CKM/Products/5437/3c4e13a5-f2be-4e1f-83d3-63e5f645437b.jpg",
  "ktm-125-duke": "https://www.braeuer-shop.de/wp-content/uploads/PHO_BIKE_90_RE_MY24-KTM-125-DUKE-ORANGE-90-RIGHT-2_SALL_AEPI_V1-1.png",
  "ktm-890-adventure": "https://azwecdnepstoragewebsiteuploads.azureedge.net/PHO_BIKE_90_REVO_890-ADVENTURE-Black-MY23-90-Front-Right_%23SALL_%23AEPI_%23V1.png",
  "kawasaki-kx250": "https://storage.kawasaki.eu/public/kawasaki.eu/en-EU/racingNews/25KX252E_201GN1DRS3CG_A_STU%20%283%29.004.jpg",
  "ktm-390-duke": "https://www.flash-team.cz/editor/image/eshop_products_other_pictures/34460/F4303Y1_l.png",
  "ktm-300-exc": "https://images5.1000ps.net/images_bikekat/2025/1-KTM/222-300_EXC/003-638550785726064979-ktm-300-exc.jpg?format=webp&height=571&mode=crop&scale=both&width=920",
  "suzuki-hayabusa": "https://cdn.imweb.me/upload/S201810155bc458fdaf30f/5b44c58c5c39f.jpg",
  "honda-cb500-hornet": "https://images5.1000ps.net/g-000319-g_W3196080_7-honda-cb500-hornet-638701963740955250.jpg",
  "kawasaki-ninja500": "https://www.kawasaki.co.uk/content/dam/products/pim/studio/Resource_309269_25EX500G_242GY1DRF3CG_A.jpg/_jcr_content/renditions/cq5dam.web.1280.1280.png",
  "bmw-f900gs": "https://images5.1000ps.net/images_bikekat/2025/7-BMW/12168-F_900_GS/001-638729815265184971-bmw-f-900-gs.jpg?bgcolor=rgba_39_42_44_0&format=webp&height=664&mode=pad&quality=80&scale=both&trim.percentpadding=1&trim.threshold=80&width=1168",
  "husqvarna-te300": "https://www.ktm-berlin.de/wp-content/uploads/PHO_BIKE_90_RE_TE-300-MY2025-90-right_SALL_AEPI_V1.png",
  "husqvarna-svartpilen401": "https://images5.1000ps.net/images_bikekat/2025/42-Husqvarna/8783-Svartpilen_401/005-638720363677107910-husqvarna-svartpilen-401.jpg",
  "gasgas-ec300": "https://images5.1000ps.net/images_bikekat/2025/8-GASGAS/1351-EC_300/002-638551737335372480-gasgas-ec-300.jpg?bgcolor=rgba_39_42_44_0&format=webp&height=664&mode=pad&quality=80&scale=both&trim.percentpadding=1&trim.threshold=80&width=1168",
  "beta-rx300": "https://www.almamoto.it/wp-content/uploads/2024/06/nuovo-beta-rx-300-2t-my-2025.jpg",
  "aprilia-rs660": "https://www.motorrad-bilder.at/slideshows/291/023799/002_aprilia_rs660_2025.jpg",
  "ducati-monster": "https://images5.1000ps.net/images_bikekat/2025/5-Ducati/10402-Monster/013-638761504417645342-ducati-monster.jpg?bgcolor=rgba_39_42_44_0&format=webp&height=828&mode=pad&quality=80&scale=both&width=1472",
  "ducati-panigale-v2": "https://www.v-twins.com.au/cdn/shop/files/Panigale-V2-MY25-360_0017_it-18.webp?v=1733455225&width=1622",
  "beta-rr300": "https://betamotorcycles.co.nz/wp-content/uploads/2024/10/RR-300-X-Pro-1.png",
  "tm-en300": "https://bike.net/res/media/img/orig/ref/6bf/168474.jpg",
  "aprilia-tuareg660": "https://cdn-listino.inmoto.it/2025/3/11/Aprilia_Tuareg_660_1f0b86499a.jpg",
  "bmw-r1300gs": "https://www.2ri.de/Images/Big/0/BMW_R1300GS_2025_76315.jpg",
  "bmw-s1000rr": "https://www.2ri.de/Images/Big/8/News_2025-BMW-S1000RR5.jpg",
  "triumph-streettriple": "https://images5.1000ps.net/images_bikekat/2025/37-Triumph/8883-Street_Triple_765_R/007-638874913276231594-triumph-street-triple-765-r.jpg?format=webp&height=566&mode=crop&width=920",
  "triumph-tiger900": "https://images.motoren-toerisme.be/2023-12/2024_triumph_tiger900gtpro_01.jpg?auto=format%2Ccompres&fill=solid&fit=fill&h=880&ixlib=php-1.1.0&q=75&s=0625fb78b95aa6e25a18421dfb3f6cda&w=1320",
  "yamaha-r3": "https://soymotero.net/wp-content/uploads/2024/10/Yamaha-YZF-R3-2025-1.jpg",
  "yamaha-r1": "https://d1uzk9o9cg136f.cloudfront.net/f/16782548/rc/2025/03/14/8bd2842d0c1c2c66407c5afe32e311a8e998a699.jpg",
  "honda-cb650r": "https://d1uzk9o9cg136f.cloudfront.net/f/16782548/rc/2024/12/20/e35df9a78398247a708a75dabd962751f012ca37.jpg",
};

function getPreviewImage(id: string) {
  return previewImages[id];
}

const brands = ["Yamaha", "Honda", "Suzuki", "BMW", "Kawasaki", "Ducati", "KTM", "Husqvarna", "GasGas", "Beta", "TM Racing", "Aprilia", "Triumph"];

export default function MotorcyclesPage() {
  const [query, setQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  function toggle(value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((current) => current.includes(value) ? current.filter((x) => x !== value) : [...current, value]);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bikes.filter((bike) => {
      const matchesQuery = !q || `${bike.brand} ${bike.model} ${bike.type}`.toLowerCase().includes(q);
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(bike.type);
      const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(bike.brand);
      return matchesQuery && matchesType && matchesBrand;
    });
  }, [query, selectedTypes, selectedBrands]);

  function clearFilters() {
    setQuery("");
    setSelectedTypes([]);
    setSelectedBrands([]);
  }

  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <SiteNav />
        <header className="py-16">
          <p className="text-sm font-bold uppercase tracking-[.25em] text-red-500">Katalog</p>
          <h1 className="mt-3 text-5xl font-black tracking-tight">Znajdź swój motocykl.</h1>
          <p className="mt-4 max-w-2xl text-zinc-400">Przeglądaj modele, porównuj parametry i odkrywaj maszyny, które pasują do Twojego stylu jazdy.</p>
        </header>

        <section>
          <div className="rounded-2xl border border-white/10 bg-white/[.035] p-2 shadow-xl shadow-black/20 backdrop-blur">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
              <div className="relative min-w-0 flex-1">
                <input aria-label="Szukaj motocykla" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj marki lub modelu..." className="w-full rounded-xl border border-transparent bg-black/20 px-4 py-3 pl-10 text-sm outline-none placeholder:text-zinc-600 focus:border-red-500/40 focus:bg-black/30" />
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">⌕</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="group relative">
                  <button type="button" className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${selectedTypes.length ? "border-red-500/40 bg-red-500/10 text-white" : "border-white/10 bg-white/[.03] text-zinc-300 hover:bg-white/[.07]"}`}>Typ{selectedTypes.length ? ` · ${selectedTypes.length}` : ""} <span className="ml-2 text-zinc-500">⌄</span></button>
                  <div className="invisible absolute right-0 top-full z-20 mt-2 w-52 translate-y-1 rounded-2xl border border-white/10 bg-[#111] p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {types.map((type) => <label key={type} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/[.06]"><input type="checkbox" checked={selectedTypes.includes(type)} onChange={() => toggle(type, setSelectedTypes)} className="h-4 w-4 accent-red-500" />{type}</label>)}
                  </div>
                </div>
                <div className="group relative">
                  <button type="button" className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${selectedBrands.length ? "border-red-500/40 bg-red-500/10 text-white" : "border-white/10 bg-white/[.03] text-zinc-300 hover:bg-white/[.07]"}`}>Marka{selectedBrands.length ? ` · ${selectedBrands.length}` : ""} <span className="ml-2 text-zinc-500">⌄</span></button>
                  <div className="invisible absolute right-0 top-full z-20 mt-2 w-52 translate-y-1 rounded-2xl border border-white/10 bg-[#111] p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    {brands.map((brand) => <label key={brand} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/[.06]"><input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggle(brand, setSelectedBrands)} className="h-4 w-4 accent-red-500" />{brand}</label>)}
                  </div>
                </div>
                {(selectedTypes.length > 0 || selectedBrands.length > 0 || query) && <button onClick={clearFilters} className="rounded-xl px-3 py-3 text-sm font-semibold text-zinc-500 transition hover:bg-white/[.05] hover:text-white">Wyczyść</button>}
              </div>
            </div>
          </div>

          <div className="mb-5 mt-5 flex items-center justify-between">
            <p className="text-sm text-zinc-500"><span className="font-semibold text-zinc-300">{filtered.length}</span> {filtered.length === 1 ? "motocykl" : "motocykli"}</p>
            {(selectedTypes.length > 0 || selectedBrands.length > 0 || query) && <p className="text-xs text-zinc-600">Aktywne filtry</p>}
          </div>
          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[.02] p-12 text-center">
              <p className="text-lg font-bold">Brak wyników</p>
              <p className="mt-2 text-sm text-zinc-500">Zmień filtry albo wyszukiwaną frazę.</p>
              <button onClick={clearFilters} className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black">Wyczyść filtry</button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((bike) => (
                <Link key={bike.id} href={"/motocykle/"+bike.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.03] transition hover:-translate-y-1 hover:border-red-500/30">
                  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-900"><img src={getPreviewImage(bike.id)} alt={`${bike.brand} ${bike.model}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /><div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5"><span className="rounded-full bg-black/50 px-3 py-1 text-xs text-zinc-300">{bike.type}</span></div></div>
                  <div className="p-5"><p className="text-xs font-bold uppercase tracking-wider text-red-400">{bike.brand}</p><h2 className="mt-1 text-xl font-bold">{bike.model}</h2><div className="mt-4 grid grid-cols-2 gap-2 text-xs text-zinc-500"><span>{bike.engine}</span><span>{bike.power}</span><span>{bike.year}</span><span>Sprawdź →</span></div></div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
