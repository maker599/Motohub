import Link from "next/link";
import SiteNav from "../../SiteNav";
import ToolOverlay from "../ToolOverlay";
import CarbSimulator from "./CarbSimulator";

export default function CarburetorSimulatorPage() {
  return (
    <main className="min-h-screen bg-[#07080a] text-white">
      <div className="mx-auto max-w-[1720px] px-3.5 py-4 sm:px-6 lg:px-8">
        <SiteNav />

        <ToolOverlay
          active="carb"
          title="Symulator regulacji gaźnika 2T"
          description="Interaktywny symulator przepływów, zasilania i aerodynamiki gaźnika dwusuwowego. Kręć śrubami regulacyjnymi, przestawiaj klips iglicy, dobieraj dysze i badaj skład mieszanki (AFR) oraz reakcję silnika na manetkę gazu."
        >
          <div className="text-xs leading-5">
            <span className="font-bold text-red-200">Silnik fizyczny w czasie rzeczywistym:</span>
            <br />
            Równanie ciągłości i efekt Venturiego (Bernoulli), geometria iglicy i rozpylacza, obwód jałowy oraz dynamiczny dźwięk i wykres AFR 2T.
          </div>
        </ToolOverlay>

        {/* GŁÓWNY SYMULATOR */}
        <div className="mt-8">
          <CarbSimulator />
        </div>

        {/* PRZEWODNIK WARSZTATOWY I SZYBKA ŚCIĄGAWKA */}
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border border-white/10 bg-white/[.025] p-6 shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400">01 / Złota zasada</p>
            <h3 className="mt-2 text-lg font-black text-white">Kolejność strojenia gaźnika 2T</h3>
            <ol className="mt-4 list-decimal space-y-2.5 pl-4 text-xs leading-6 text-zinc-300 marker:font-bold marker:text-red-400">
              <li>
                <b>Zacznij od dyszy głównej (WOT 3/4-100%):</b> Zawsze ustaw najpierw obwód pełnego gazu od bezpiecznie bogatej dyszy, aby zabezpieczyć silnik przed zatarciem pod pełnym obciążeniem.
              </li>
              <li>
                <b>Dopasuj iglicę i rozpylacz (1/4-3/4 gazu):</b> Ustaw rowek klipsa iglicy (1-5). Sprawdź płynne wkręcanie bez dławienia i bez czterosuwowania.
              </li>
              <li>
                <b>Wyreguluj śrubę mieszanki i dyszę pilotową (0-1/4):</b> Na rozgrzanym silniku szukaj najwyższych stabilnych obrotów i czystej reakcji na nagłe dodanie gazu.
              </li>
              <li>
                <b>Skoryguj obroty jałowe śrubą oporową suwaka:</b> Ustal bazowe ~1500 RPM.
              </li>
            </ol>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[.025] p-6 shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">02 / Diagnostyka</p>
            <h3 className="mt-2 text-lg font-black text-white">Objawy i natychmiastowe kroki</h3>
            <div className="mt-4 space-y-3 text-xs leading-5 text-zinc-300">
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <b className="text-amber-200">Czterosuwuje (d-d-d-braaap) na pełnym gazie:</b>
                <p className="mt-1 text-zinc-400">Za bogata mieszanka (AFR &lt; 11). Zmniejsz dyszę główną o 2–4 numery.</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <b className="text-sky-200">Dusi się (&quot;buhhh&quot;) przy otwarciu manetki:</b>
                <p className="mt-1 text-zinc-400">Zbyt uboga mieszanka. Opuść klips iglicy w dół (wzbogacenie) lub wkręć śrubę powietrza.</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <b className="text-red-200">Silnik wisi na obrotach po puszczeniu gazu:</b>
                <p className="mt-1 text-zinc-400">Za ubogi obwód pilotowy lub nieszczelność dolotu / uszczelniaczy wału.</p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[.025] p-6 shadow-lg">
            <p className="text-[10px] font-black uppercase tracking-widest text-sky-400">03 / Warsztat</p>
            <h3 className="mt-2 text-lg font-black text-white">Śruba powietrza vs śruba paliwa</h3>
            <p className="mt-3 text-xs leading-6 text-zinc-300">
              Kierunek kręcenia zależy od tego, po której stronie korpusu gaźnika umieszczona jest śrubka regulacyjna:
            </p>
            <ul className="mt-3 space-y-2 text-xs text-zinc-300">
              <li className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <span className="font-bold text-sky-300">Śruba po stronie filtra (np. Dell&apos;Orto PHBG):</span>
                <br />
                To <b>śruba powietrza (Air Screw)</b>. Wykręcanie dodaje powietrza (zubaża). Wkręcanie wzbogaca.
              </li>
              <li className="rounded-xl border border-white/5 bg-black/30 p-2.5">
                <span className="font-bold text-amber-300">Śruba po stronie cylindra (np. PWK / Mikuni):</span>
                <br />
                To <b>śruba paliwa (Fuel Screw)</b>. Wykręcanie dodaje paliwa (wzbogaca). Wkręcanie zubaża.
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-white/[.07] flex justify-between items-center">
              <span className="text-[11px] text-zinc-400">Kalkulator wydechu:</span>
              <Link href="/narzedzia/kalkulator" className="text-xs font-bold text-red-300 hover:text-white">
                Otwórz 2T Exhaust Lab ↗
              </Link>
            </div>
          </section>
        </div>

        <p className="mt-8 text-center text-[11px] text-zinc-600">
          Symulator ma charakter dydaktyczno-warsztatowy. Ostateczne zestrojenie zawsze weryfikuj w rzeczywistym pojeździe, kontrolując temperaturę silnika, kolor świecy i zachowanie pod pełnym obciążeniem.
        </p>
      </div>
    </main>
  );
}