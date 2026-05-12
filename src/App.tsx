import { useMemo, useState } from "react";
import { ScenarioSelector } from "./components/ScenarioSelector";
import { DiagnosticForm } from "./components/DiagnosticForm";
import { DiagnosticReportView } from "./components/DiagnosticReport";
import { SCENARIOS, SCENARIO_BY_ID } from "./data/scenarios";
import { runDiagnostic } from "./logic/diagnosticEngine";
import type { DiagnosticReport, ScenarioInputs, ScenarioType } from "./logic/types";

export function App() {
  const [selectedId, setSelectedId] = useState<ScenarioType>("appeals_replay");
  const [inputs, setInputs] = useState<ScenarioInputs>(
    SCENARIO_BY_ID["appeals_replay"].defaults,
  );
  const [report, setReport] = useState<DiagnosticReport | null>(null);

  const scenario = useMemo(() => SCENARIO_BY_ID[selectedId], [selectedId]);

  const handleSelect = (id: ScenarioType) => {
    setSelectedId(id);
    setInputs(SCENARIO_BY_ID[id].defaults);
    setReport(null);
  };

  const handleReset = () => {
    setInputs(SCENARIO_BY_ID[selectedId].defaults);
    setReport(null);
  };

  const handleRun = () => {
    setReport(runDiagnostic(inputs));
  };

  return (
    <div className="min-h-full bg-ink-25">
      <header className="border-b border-ink-100 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-5 flex items-baseline justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-400">
              Kombocode · Diagnostic
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-ink-900 tracking-tight">
              Trace Any Denial Diagnostic
            </h1>
            <p className="mt-1 text-sm text-ink-500 max-w-2xl">
              See whether a payer AI denial decision can be reconstructed under audit pressure.
            </p>
          </div>
          <div className="hidden md:block text-right text-[11px] text-ink-400 leading-relaxed max-w-[280px]">
            Synthetic scenarios. No real payer data. Architecture exposure diagnostic for engineering teams.
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 xl:col-span-4 space-y-6">
          <Panel>
            <ScenarioSelector
              scenarios={SCENARIOS}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
            <div className="mt-5 rounded-md bg-ink-25 border border-ink-100 p-4">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                Scenario summary
              </div>
              <div className="mt-1.5 text-sm font-medium text-ink-900">
                {scenario.name}
              </div>
              <p className="mt-1 text-sm text-ink-600 leading-relaxed">
                {scenario.summary}
              </p>
              <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
                Operational impact
              </div>
              <p className="mt-1 text-sm text-ink-600 leading-relaxed">
                {scenario.buyerPain}
              </p>
            </div>
          </Panel>

          <Panel>
            <div className="flex items-baseline justify-between mb-4">
              <div className="text-xs font-medium uppercase tracking-wider text-ink-400">
                Diagnostic inputs
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-medium text-ink-500 hover:text-ink-800 underline-offset-2 hover:underline"
              >
                Reset to scenario defaults
              </button>
            </div>
            <DiagnosticForm inputs={inputs} onChange={setInputs} onRun={handleRun} />
          </Panel>
        </section>

        <section className="lg:col-span-7 xl:col-span-8">
          {report ? (
            <DiagnosticReportView report={report} />
          ) : (
            <EmptyState onRun={handleRun} />
          )}
        </section>
      </main>

      <footer className="border-t border-ink-100 bg-white">
        <div className="mx-auto max-w-[1280px] px-6 py-4 text-[11px] text-ink-400 flex items-center justify-between">
          <span>Kombocode LLC · Trace Any Denial Diagnostic v0.1</span>
          <span>Synthetic data only. Not a compliance certification tool.</span>
        </div>
      </footer>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-5 shadow-card">
      {children}
    </div>
  );
}

function EmptyState({ onRun }: { onRun: () => void }) {
  return (
    <div className="rounded-md border border-dashed border-ink-200 bg-white p-10 text-center shadow-card">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
        Diagnostic
      </div>
      <h3 className="mt-2 text-lg font-semibold text-ink-900">
        Run the diagnostic to expose trace gaps
      </h3>
      <p className="mt-2 text-sm text-ink-500 max-w-md mx-auto leading-relaxed">
        Select a scenario, review the prefilled inputs, and run the diagnostic to see whether the denial path can be reconstructed end to end within 10 minutes.
      </p>
      <button
        type="button"
        onClick={onRun}
        className="mt-5 rounded-md bg-ink-900 px-4 py-2 text-sm font-semibold text-white hover:bg-ink-800 transition-colors"
      >
        Run diagnostic
      </button>
    </div>
  );
}
