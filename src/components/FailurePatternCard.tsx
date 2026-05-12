import type { DetectedFailurePattern } from "../logic/types";

interface Props {
  pattern: DetectedFailurePattern;
}

export function FailurePatternCard({ pattern }: Props) {
  return (
    <article className="rounded-md border border-ink-200 bg-white p-4 shadow-card">
      <header className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-ink-900 leading-snug">
          {pattern.name}
        </h4>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-trace-red bg-trace-redSoft px-1.5 py-0.5 rounded">
          Detected
        </span>
      </header>
      <dl className="mt-3 space-y-2.5 text-sm">
        <Row label="What it means">{pattern.meaning}</Row>
        <Row label="Why it matters">{pattern.whyItMatters}</Row>
        <Row label="Evidence">{pattern.evidence}</Row>
        <Row label="Remediation direction">{pattern.remediation}</Row>
      </dl>
    </article>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-ink-700 leading-relaxed">{children}</dd>
    </div>
  );
}
