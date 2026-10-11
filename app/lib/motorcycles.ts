export type Motorcycle = {
  id: string;
  slug: string;
  brand: string;
  model: string;
  year: number;
  engine_cc: number | null;
  power_hp: number | null;
  motorcycle_type: string | null;
  image_url: string | null;
  weight_kg?: number | null;
  description?: string | null;
};

export const demoMotorcycles: Motorcycle[] = [
  { id: "yamaha-mt07", slug: "yamaha-mt07", brand: "Yamaha", model: "MT-07", year: 2025, engine_cc: 689, power_hp: 73, motorcycle_type: "Naked", image_url: null, weight_kg: 183, description: "Lekki i wszechstronny naked z charakterystycznym silnikiem CP2." },
  { id: "honda-cbr650r", slug: "honda-cbr650r", brand: "Honda", model: "CBR650R", year: 2025, engine_cc: 649, power_hp: 95, motorcycle_type: "Sport", image_url: null, weight_kg: 209, description: "Czterocylindrowy sportowiec łączący codzienną użyteczność z charakterem CBR." },
  { id: "bmw-r1300gs", slug: "bmw-r1300gs", brand: "BMW", model: "R 1300 GS", year: 2025, engine_cc: 1300, power_hp: 145, motorcycle_type: "Adventure", image_url: null, weight_kg: 237, description: "Duży adventure do długich tras i jazdy w zróżnicowanym terenie." },
  { id: "kawasaki-z900", slug: "kawasaki-z900", brand: "Kawasaki", model: "Z900", year: 2025, engine_cc: 948, power_hp: 125, motorcycle_type: "Naked", image_url: null, weight_kg: 213, description: "Mocny naked z czterocylindrowym silnikiem i sportowym charakterem." },
  { id: "ducati-monster", slug: "ducati-monster", brand: "Ducati", model: "Monster", year: 2025, engine_cc: 937, power_hp: 111, motorcycle_type: "Naked", image_url: null, weight_kg: 179, description: "Lekki, dynamiczny naked o charakterystycznym włoskim charakterze." },
  { id: "ktm-890-adventure", slug: "ktm-890-adventure", brand: "KTM", model: "890 Adventure", year: 2024, engine_cc: 889, power_hp: 105, motorcycle_type: "Adventure", image_url: null, weight_kg: 215, description: "Wszechstronny adventure nastawiony na długie trasy i jazdę poza asfaltem." },
];

const motorcycleColumns = "id,slug,brand,model,year,engine_cc,power_hp,motorcycle_type,image_url";

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

export async function listMotorcycles(): Promise<{ items: Motorcycle[]; demoMode: boolean }> {
  const config = supabaseConfig();
  if (!config) return { items: demoMotorcycles, demoMode: true };

  const response = await fetch(`${config.url}/rest/v1/motorcycles?select=${motorcycleColumns}&order=brand.asc,model.asc`, {
    headers: { apikey: config.key },
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Nie udało się pobrać katalogu motocykli z Supabase.");
  return { items: (await response.json()) as Motorcycle[], demoMode: false };
}

export async function getMotorcycleBySlug(slug: string): Promise<{ item: Motorcycle | null; demoMode: boolean }> {
  const config = supabaseConfig();
  if (!config) {
    return { item: demoMotorcycles.find((bike) => bike.slug === slug) ?? null, demoMode: true };
  }

  const response = await fetch(`${config.url}/rest/v1/motorcycles?select=${motorcycleColumns}&slug=eq.${encodeURIComponent(slug)}&limit=1`, {
    headers: { apikey: config.key },
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Nie udało się pobrać motocykla z Supabase.");
  const items = (await response.json()) as Motorcycle[];
  return { item: items[0] ?? null, demoMode: false };
}
