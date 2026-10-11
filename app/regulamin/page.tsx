import Link from "next/link";

export default function RegulaminPage() {
  return (
    <main className="min-h-screen bg-[#090909] text-white">
      <div className="mx-auto max-w-4xl px-6 py-16 lg:px-8">
        <Link href="/" className="mb-8 inline-block text-sm font-semibold text-red-400 transition hover:text-red-300">← Powrót do MotoHub</Link>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-black/20 sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-red-500">MotoHub</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Regulamin</h1>

          <div className="mt-8 space-y-8 text-base leading-8 text-zinc-300">
            <section>
              <h2 className="text-2xl font-bold text-white">1. Postanowienia ogólne</h2>
              <p>Regulamin określa zasady korzystania z platformy MotoHub, w tym dostęp do treści, kont użytkownika, funkcji społecznościowych, narzędzi 2T oraz usług związanych z garażem i ustawieniami motocykli.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">2. Rejestracja i konto użytkownika</h2>
              <p>Użytkownik zobowiązuje się do podania prawdziwych danych podczas rejestracji oraz do utrzymywania ich w aktualności. Konto jest przypisane do konkretnego użytkownika i służy do korzystania z funkcji personalizowanych oraz zapisu danych, takich jak garaż, ustawienia, wpisy i profile.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">3. Odpowiedzialność użytkownika</h2>
              <p>Użytkownik odpowiada za treści publikowane w ramach profilu, komentarzy, postów i materiałów udostępnianych na platformie. Zabronione jest publikowanie treści naruszających prawa innych osób, zawierających groźby, spam, dezinformację lub materiały niezgodne z prawem.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">4. Zasady korzystania z narzędzi i danych</h2>
              <p>Użytkownik może korzystać z kalkulatorów i narzędzi dostępnych w ramach serwisu wyłącznie w celach informacyjnych i edukacyjnych. Wyniki takich narzędzi mają charakter orientacyjny i nie zastępują profesjonalnej analizy technicznej, pomiarów laboratoryjnych ani konsultacji z mechanikiem lub specjalistą.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">5. Prywatność i bezpieczeństwo</h2>
              <p>Platforma przetwarza dane użytkownika w celu świadczenia usług, utrzymania bezpieczeństwa, zapewnienia poprawnego działania funkcji logowania oraz obsługi konta. Szczegółowe informacje znajdują się w <Link href="/polityka-prywatnosci" className="text-red-400 underline underline-offset-4">Polityce prywatności</Link>.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">6. Pliki cookies</h2>
              <p>Serwis wykorzystuje pliki cookies techniczne niezbędne do działania logowania, sesji użytkownika oraz poprawnego działania platformy. Więcej informacji znajduje się w <Link href="/cookies" className="text-red-400 underline underline-offset-4">Polityce cookies</Link>.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">7. Zmiany regulaminu</h2>
              <p>Administracja zastrzega sobie prawo do aktualizacji regulaminu w razie potrzeby, w szczególności w związku z rozwojem usług, wymogami bezpieczeństwa lub zmianami przepisów prawa.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white">8. Kontakt</h2>
              <p>W przypadku pytań dotyczących regulaminu, danych osobowych lub funkcji serwisu można skontaktować się z administratorem strony poprzez adres e-mail wskazany w polityce prywatności lub formularz kontaktowy dostępny na platformie.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
