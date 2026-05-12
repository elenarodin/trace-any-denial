import type { DiagnosticReport, TraceStatus } from "../logic/types";
import { TraceTimeline } from "./TraceTimeline";
import { FailurePatternCard } from "./FailurePatternCard";
import { RemediationPlan } from "./RemediationPlan";

interface Props {
  report: DiagnosticReport;
}

const STATUS_LABEL: Record<TraceStatus, string> = {
  traceable: "Traceable",
  partially_traceable: "Partially traceable",
  trace_failure_likely: "Trace failure likely",
  audit_replay_failure_likely: "Audit replay failure likely",
};

const STATUS_TONE: Record<
  TraceStatus,
  { bg: string; border: string; text: string; dot: string }
> = {
  traceable: {
    bg: "bg-trace-greenSoft",
    border: "border-trace-green/40",
    text: "text-trace-green",
    dot: "bg-trace-green",
  },
  partially_traceable: {
    bg: "bg-trace-yellowSoft",
    border: "border-trace-yellow/40",
    text: "text-trace-yellow",
    dot: "bg-trace-yellow",
  },
  trace_failure_likely: {
    bg: "bg-trace-redSoft",
    border: "border-trace-red/40",
    text: "text-trace-red",
    dot: "bg-trace-red",
  },
  audit_replay_failure_likely: {
    bg: "bg-trace-redSoft",
    border: "border-trace-red/40",
    text: "text-trace-red",
    dot: "bg-trace-red",
  },
};

export function DiagnosticReportView({ report }: Props) {
  const tone = STATUS_TONE[report.status];

  return (
    <div className="space-y-8">
      <section
        className={[
          "rounded-md border p-5",
          tone.bg,
          tone.border,
        ].join(" ")}
      >
        <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">
          Overall trace status
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${tone.dot}`} aria-hidden />
          <h2 className={`text-xl font-semibold ${tone.text}`}>
            {STATUS_LABEL[report.status]}
          </h2>
        </div>
        <p className="mt-2 text-sm text-ink-700 leading-relaxed max-w-2xl">
          {report.statusReason}
        </p>
      </section>

      <section className="rounded-md border border-ink-200 bg-white p-5 shadow-card">
        <TraceTimeline steps={report.timeline} />
      </section>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-ink-400">
              Failure patterns detected
            </div>
            <p className="text-xs text-ink-400 mt-0.5">
              Named architecture failure modes triggered by the inputs.
            </p>
          </div>
          <div className="text-xs font-semibold text-ink-500 tabular-nums">
            {report.patterns.length} pattern
            {report.patterns.length === 1 ? "" : "s"}
          </div>
        </div>
        {report.patterns.length === 0 ? (
          <div className="rounded-md border border-ink-200 bg-white p-4 text-sm text-ink-500 shadow-card">
            No architecture failure patterns triggered by the supplied inputs.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {report.patterns.map((p) => (
              <FailurePatternCard key={p.id} pattern={p} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="text-xs font-medium uppercase tracking-wider text-ink-400 mb-3">
          Executive summary
        </div>
        <ul className="space-y-2.5">
          {report.findings.map((f) => (
            <li
              key={f.id}
              className="rounded-md border border-ink-200 bg-white p-4 text-sm text-ink-700 leading-relaxed shadow-card"
            >
              {f.text}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <RemediationPlan steps={report.remediation} />
      </section>
    </div>
  );
}
