# MotoHub

Polskojęzyczna aplikacja dla motocyklistów z katalogiem motocykli, garażem użytkownika, społecznością i narzędziami do silników 2T. Projekt używa Next.js App Router, React, TypeScript i Tailwind CSS.

## Uruchomienie lokalne

Wymagane: Node.js 22 lub nowszy oraz npm.

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Otwórz http://localhost:3000. Bez konfiguracji Supabase katalog i społeczność pokazują dane demonstracyjne; kalkulatory działają lokalnie w przeglądarce.

## Supabase

Aby włączyć konta, garaż, katalog z bazy i publikowanie postów oraz komentarzy:

1. Utwórz projekt Supabase.
2. W pliku `.env.local` ustaw `SUPABASE_URL` oraz `SUPABASE_ANON_KEY`.
3. Wykonaj [supabase/schema.sql](supabase/schema.sql) w SQL Editor projektu.

Karty cylindrów z 2T Exhaust Lab są na razie zapisywane w `localStorage` tej przeglądarki. Można je wyeksportować do pliku JSON.

## Główne strony

- `/` — strona startowa
- `/motocykle` — katalog i filtry
- `/garaz` — garaż zalogowanego użytkownika
- `/spolecznosc` — wpisy i komentarze
- `/narzedzia/kalkulator` — 2T Exhaust Lab i karty cylindrów
- `/narzedzia/tuning-2t` — analizator parametrów silnika 2T
- `/logowanie`, `/rejestracja`, `/profil` — konto użytkownika

## Kontrola i kompilacja

```powershell
npm run lint
npm run build
npm start
```

GitHub Actions uruchamia lint i build przy zmianach na `main` oraz przy pull requestach.
