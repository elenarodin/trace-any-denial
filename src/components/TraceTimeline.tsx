import type { TimelineStep } from "../logic/types";

interface Props {
  steps: TimelineStep[];
}

const STATUS_LABEL: Record<TimelineStep["status"], string> = {
  green: "Traceable",
  yellow: "Partial",
  red: "Broken",
};

const DOT: Record<TimelineStep["status"], string> = {
  green: "bg-trace-green",
  yellow: "bg-trace-yellow",
  red: "bg-trace-red",
};

const RING: Record<TimelineStep["status"], string> = {
  green: "ring-trace-green/30",
  yellow: "ring-trace-yellow/30",
  red: "ring-trace-red/30",
};

const TEXT: Record<TimelineStep["status"], string> = {
  green: "text-trace-green",
  yellow: "text-trace-yellow",
  red: "text-trace-red",
};

export function TraceTimeline({ steps }: Props) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-ink-400 mb-3">
        Traceability map
      </div>
      <ol className="relative">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-ink-100" aria-hidden />
        {steps.map((s, idx) => (
          <li key={s.key} className="relative pl-6 pb-4 last:pb-0">
            <span
              className={[
                "absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full ring-4",
                DOT[s.status],
                RING[s.status],
              ].join(" ")}
              aria-hidden
            />
            <div className="flex items-baseline justify-between gap-3">
              <div className="text-sm font-semibold text-ink-800">
                <span className="text-ink-300 mr-1.5 text-xs font-medium">
                  {String(idx + 1).padStart(2, "0")}
                </span>
                {s.label}
              </div>
              <div className={`text-[11px] font-semibold uppercase tracking-wider ${TEXT[s.status]}`}>
                {STATUS_LABEL[s.status]}
              </div>
            </div>
            <p className="mt-0.5 text-sm text-ink-500 leading-relaxed">{s.note}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
