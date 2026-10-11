import Link from "next/link";

type ToolId = "exhaust" | "tuning" | "porting" | "setup" | "carb";

const tools: Array<{ id: ToolId; href: string; label: string }> = [
  { id: "exhaust", href: "/narzedzia/kalkulator", label: "Projekt wydechu" },
  { id: "tuning", href: "/narzedzia/tuning-2t", label: "Analizator tuningu" },
  { id: "porting", href: "/narzedzia/porting-2t", label: "Porting cylindra" },
  { id: "setup", href: "/narzedzia/kreator-setupu", label: "Kreator setupu" },
  { id: "carb", href: "/narzedzia/strojenie-gaznika", label: "Symulator gaźnika" },
];

export default function ToolOverlay({
  active,
  title,
  description,
  children,
}: {
  active: ToolId;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative isolate mt-8 overflow-hidden rounded-[2rem] border border-red-500/20 bg-[#101010] px-5 py-6 shadow-2xl shadow-black/20 sm:px-8 sm:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{ background: "radial-gradient(ellipse at 12% 0%, rgba(239,68,68,.2), transparent 48%), linear-gradient(125deg, rgba(127,29,29,.13), transparent 58%)" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-red-500/[.08] blur-3xl" />

      <div className="relative z-10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[.28em] text-red-300">MotoHub / Narzędzia 2T</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-300/80">{description}</p>
          </div>
          {children ? <div className="max-w-md rounded-2xl border border-red-400/15 bg-black/25 px-4 py-3 text-xs leading-5 text-zinc-300">{children}</div> : null}
        </div>

        <nav aria-label="Narzędzia 2T" className="mt-7 grid gap-2 rounded-2xl border border-white/[.07] bg-black/25 p-1.5 sm:grid-cols-2 xl:grid-cols-5">
          {tools.map((tool) => {
            const selected = active === tool.id;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                aria-current={selected ? "page" : undefined}
                className={`rounded-xl px-3 py-2.5 text-center text-xs font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-300 ${selected ? "border border-red-400/25 bg-red-500/15 text-white shadow-lg shadow-red-950/20" : "border border-transparent text-zinc-400 hover:border-white/10 hover:bg-white/[.05] hover:text-white"}`}
              >
                {tool.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );
}
