import { useId } from "react";

type FieldHelpProps = { text: string };

export default function FieldHelp({ text }: FieldHelpProps) {
  const tooltipId = useId();
  return (
    <span
      tabIndex={0}
      role="note"
      aria-label={text}
      aria-describedby={tooltipId}
      title={text}
      className="group/help relative ml-1 inline-flex h-4 w-4 shrink-0 cursor-help items-center justify-center rounded-full border border-white/20 text-[9px] font-bold text-zinc-400 outline-none transition hover:border-cyan-300/60 hover:text-cyan-200 focus-visible:border-cyan-300 focus-visible:text-cyan-100"
    >
      <span aria-hidden="true">?</span>
      <span id={tooltipId} role="tooltip" className="pointer-events-none invisible absolute bottom-full left-0 z-[80] mb-2 w-64 max-w-[calc(100vw-3rem)] rounded-xl border border-white/15 bg-[#111820] px-3 py-2.5 text-left text-[11px] font-normal leading-5 text-zinc-200 opacity-0 shadow-2xl transition group-hover/help:visible group-hover/help:opacity-100 group-focus/help:visible group-focus/help:opacity-100">
        {text}
      </span>
    </span>
  );
}
