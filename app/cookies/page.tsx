import Link from "next/link";

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <Link href="/" className="mb-8 inline-block text-sm font-semibold text-red-400 transition hover:text-red-300">← Powrót do MotoHub</Link>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/20 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">MotoHub</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Polityka cookies</h1>

          <div className="mt-8 space-y-8 text-base leading-8 text-zinc-300">
            <section>
              <h2 className="text-2xl font-bold text-white">1. Czym są cookies</h2>
              <p>Cookies to małe pliki tekstowe zapisywane w przeglądarce użytkownika, które umożliwiają rozpoznawanie urządzenia i utrzymywanie sesji podczas korzystania z serwisu.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">2. Cookies używane w serwisie</h2>
              <p>W MotoHub stosujemy cookies techniczne, które są niezbędne do działania strony, w tym sesji logowania, zapamiętywania zalogowanego użytkownika oraz prawidłowego działania formularzy i funkcji serwisu. W przyszłości mogą pojawić się także cookies analityczne lub funkcjonalne, a ich użycie będzie opisywane w tej polityce.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">3. Dlaczego używamy cookies</h2>
              <p>Cookies są wykorzystywane przede wszystkim do utrzymania sesji użytkownika, poprawnego logowania, bezpieczeństwa konta, zapamiętywania preferencji, a także zapewnienia płynności działania platformy.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">4. Zarządzanie cookies</h2>
              <p>Użytkownik może w każdej chwili usunąć pliki cookies lub ograniczyć ich zapis w ustawieniach przeglądarki. Warto jednak pamiętać, że wyłączenie części cookies może wpłynąć na poprawność działania logowania, profilu użytkownika i funkcji serwisu.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">5. Cookies a prywatność</h2>
              <p>Cookies techniczne są używane wyłącznie w zakresie niezbędnym do działania aplikacji i nie służą do profilowania użytkownika w celach marketingowych. Dodatkowe informacje o przetwarzaniu danych użytkownika znajdują się w <Link href="/polityka-prywatnosci" className="text-red-400 underline underline-offset-4">Polityce prywatności</Link>.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
