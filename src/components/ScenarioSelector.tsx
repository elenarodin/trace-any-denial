import type { Scenario } from "../logic/types";

interface Props {
  scenarios: Scenario[];
  selectedId: Scenario["id"];
  onSelect: (id: Scenario["id"]) => void;
}

export function ScenarioSelector({ scenarios, selectedId, onSelect }: Props) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wider text-ink-400 mb-3">
        Scenario
      </div>
      <div className="grid grid-cols-2 gap-2">
        {scenarios.map((s) => {
          const active = s.id === selectedId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={[
                "text-left rounded-md border px-3 py-2 transition-colors",
                active
                  ? "border-ink-800 bg-ink-900 text-white"
                  : "border-ink-200 bg-white text-ink-800 hover:border-ink-400",
              ].join(" ")}
            >
              <div className="text-[11px] uppercase tracking-wider opacity-70">
                {s.shortLabel}
              </div>
              <div className="text-sm font-medium leading-snug mt-0.5">
                {s.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
