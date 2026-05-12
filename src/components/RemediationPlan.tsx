import type { RemediationStep } from "../logic/types";

interface Props {
  steps: RemediationStep[];
}

export function RemediationPlan({ steps }: Props) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-ink-400 mb-3">
        Recommended remediation path
      </div>
      <ol className="space-y-3">
        {steps.map((s, idx) => (
          <li
            key={s.id}
            className="rounded-md border border-ink-200 bg-white p-4 shadow-card"
          >
            <div className="flex items-baseline gap-3">
              <span className="text-xs font-semibold text-ink-300 tabular-nums">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="text-sm font-semibold text-ink-900">{s.label}</div>
                <p className="mt-1 text-sm text-ink-500 leading-relaxed">{s.detail}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
