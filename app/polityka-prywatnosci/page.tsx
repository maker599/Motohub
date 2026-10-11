import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <Link href="/" className="mb-8 inline-block text-sm font-semibold text-red-400 transition hover:text-red-300">← Powrót do MotoHub</Link>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/20 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">MotoHub</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Polityka prywatności</h1>

          <div className="mt-8 space-y-8 text-base leading-8 text-zinc-300">
            <section>
              <h2 className="text-2xl font-bold text-white">1. Administrator danych</h2>
              <p>Administratorem danych osobowych użytkowników serwisu MotoHub jest właściciel strony, z którym można skontaktować się za pośrednictwem adresu e-mail podanego w formularzu kontaktowym lub na stronie profilu serwisu. W przypadku braku formularza kontaktowego należy użyć adresu e-mail wskazanego w sekcji kontaktowej projektu.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">2. Jakie dane zbieramy</h2>
              <p>W ramach rejestracji i korzystania z serwisu możemy zbierać dane takie jak: adres e-mail, hasło zapisane w formie zabezpieczonej przez system uwierzytelniania, nazwa użytkownika, dane profilowe, informacje o garażu, wpisach społecznościowych, ustawieniach, preferencjach oraz dane techniczne związane z korzystaniem z serwisu.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">3. Cel przetwarzania danych</h2>
              <p>Dane osobowe przetwarzane są w celu: utworzenia i obsługi konta użytkownika, zapewnienia bezpieczeństwa logowania, dostarczania funkcji społecznościowych, personalizacji usług, poprawy działania platformy, ochrony przed nadużyciami oraz realizacji usług technicznych i wsparcia użytkownika.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">4. Podstawy prawne</h2>
              <p>Przetwarzanie danych odbywa się na podstawie art. 6 ust. 1 lit. b RODO w zakresie realizacji umowy/warunków korzystania z serwisu oraz art. 6 ust. 1 lit. f RODO w zakresie uzasadnionego interesu administratora w zapewnieniu bezpieczeństwa, stabilności i funkcjonalności serwisu. W zakresie niektórych danych, w tym ciasteczek technicznych, podstawą może być również konieczność świadczenia usługi.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">5. Pliki cookies</h2>
              <p>Serwis wykorzystuje pliki cookies techniczne do utrzymywania sesji logowania, zapamiętywania preferencji użytkownika oraz zapewniana poprawnego działania aplikacji. Cookie są przechowywane w przeglądarce i mogą być usunięte w każdej chwili w ustawieniach przeglądarki. Szczegółowe informacje zawiera <Link href="/cookies" className="text-red-400 underline underline-offset-4">Polityka cookies</Link>.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">6. Odbiorcy danych</h2>
              <p>Dane użytkowników mogą być przetwarzane przez zewnętrzne usługi techniczne wspierające działanie serwisu, takie jak dostawcy chmury, infrastruktury aplikacyjnej, systemy uwierzytelniania oraz narzędzia do analizy i bezpieczeństwa. W przypadku korzystania z usług zewnętrznych, partnerzyści są zobowiązani do ochrony danych zgodnie z obowiązującymi przepisami.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">7. Okres przechowywania</h2>
              <p>Dane osobowe przechowywane są tak długo, jak jest to niezbędne do świadczenia usług, obsługi konta oraz zgodności z obowiązującymi przepisami. Po usunięciu konta lub wygaśnięciu potrzeby przetwarzania dane mogą zostać usunięte lub zanonimizowane, z zastrzeżeniem obowiązków prawnych.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">8. Prawa użytkownika</h2>
              <p>Użytkownik ma prawo do: dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia danych, wniesienia sprzeciwu oraz cofnięcia zgody w zakresie, w którym została ona udzielona. W celu skorzystania z tych praw użytkownik może skontaktować się z administratorem serwisu.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">9. Usunięcie konta</h2>
              <p>Użytkownik może w każdej chwili usunąć swoje konto za pośrednictwem ustawień profilu lub skontaktować się z administratorem w celu złożenia prośby o usunięcie danych. Po usunięciu konta zapisane treści użytkownika mogą zostać usunięte, z wyjątkiem danych wymaganych do spełnienia obowiązków prawnych lub zapewnienia bezpieczeństwa.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">10. Zmiany polityki</h2>
              <p>Polityka prywatności może być aktualizowana w związku z rozwojem funkcjonalności serwisu lub zmianami przepisów. O istotnych zmianach użytkownicy zostaną poinformowani w sposób adekwatny do zakresu aktualizacji.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
