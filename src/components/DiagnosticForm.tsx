import type { ScenarioInputs, StorageLocation } from "../logic/types";

interface Props {
  inputs: ScenarioInputs;
  onChange: (next: ScenarioInputs) => void;
  onRun: () => void;
}

const STORAGE_OPTIONS: { value: StorageLocation; label: string }[] = [
  { value: "decision_service", label: "Decision service" },
  { value: "model_registry", label: "Model registry" },
  { value: "feature_store", label: "Feature store" },
  { value: "data_warehouse", label: "Data warehouse" },
  { value: "workflow_platform", label: "Workflow platform" },
  { value: "ticketing_system", label: "Ticketing system" },
  { value: "vendor_platform", label: "Vendor platform" },
  { value: "notes_field", label: "Free text notes field" },
  { value: "scattered_logs", label: "Scattered application logs" },
  { value: "spreadsheet", label: "Spreadsheet" },
  { value: "unknown", label: "Unknown" },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] font-medium uppercase tracking-wider text-ink-400 mb-1">
      {children}
    </label>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

const inputClass =
  "w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-800 placeholder:text-ink-300 focus:border-ink-600 focus:outline-none focus:ring-1 focus:ring-ink-600";

export function DiagnosticForm({ inputs, onChange, onRun }: Props) {
  const set = <K extends keyof ScenarioInputs>(key: K, value: ScenarioInputs[K]) => {
    onChange({ ...inputs, [key]: value });
  };

  const toggleSystem = (system: string) => {
    const trimmed = system.trim();
    if (!trimmed) return;
    if (inputs.knownSystemsInvolved.includes(trimmed)) {
      set(
        "knownSystemsInvolved",
        inputs.knownSystemsInvolved.filter((s) => s !== trimmed),
      );
    } else {
      set("knownSystemsInvolved", [...inputs.knownSystemsInvolved, trimmed]);
    }
  };

  const handleSystemsChange = (raw: string) => {
    const list = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    set("knownSystemsInvolved", list);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4">
        <Field>
          <Label>Decision ID</Label>
          <input
            className={inputClass}
            value={inputs.decisionId}
            onChange={(e) => set("decisionId", e.target.value)}
            placeholder="DCN-..."
          />
        </Field>

        <Field>
          <Label>Model output or recommendation</Label>
          <textarea
            className={`${inputClass} min-h-[64px]`}
            value={inputs.modelOutput}
            onChange={(e) => set("modelOutput", e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Label>Model version</Label>
            <input
              className={inputClass}
              value={inputs.modelVersion}
              onChange={(e) => set("modelVersion", e.target.value)}
              placeholder="leave blank to simulate gap"
            />
          </Field>
          <Field>
            <Label>Policy rule version</Label>
            <input
              className={inputClass}
              value={inputs.policyRuleVersion}
              onChange={(e) => set("policyRuleVersion", e.target.value)}
              placeholder="leave blank to simulate gap"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Label>Input snapshot available</Label>
            <ToggleRow
              value={inputs.inputSnapshotAvailable}
              onChange={(v) => set("inputSnapshotAvailable", v)}
            />
          </Field>
          <Field>
            <Label>Feature payload available</Label>
            <ToggleRow
              value={inputs.featurePayloadAvailable}
              onChange={(v) => set("featurePayloadAvailable", v)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Label>Human reviewer ID</Label>
            <input
              className={inputClass}
              value={inputs.humanReviewerId}
              onChange={(e) => set("humanReviewerId", e.target.value)}
              placeholder="RV-..."
            />
          </Field>
          <Field>
            <Label>Override reason</Label>
            <input
              className={inputClass}
              value={inputs.overrideReason}
              onChange={(e) => set("overrideReason", e.target.value)}
              placeholder="leave blank if none"
            />
          </Field>
        </div>

        <Field>
          <Label>Override stored in</Label>
          <select
            className={inputClass}
            value={inputs.overrideStorage}
            onChange={(e) => set("overrideStorage", e.target.value as StorageLocation)}
          >
            {STORAGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Label>Workflow system</Label>
            <input
              className={inputClass}
              value={inputs.workflowSystem}
              onChange={(e) => set("workflowSystem", e.target.value)}
            />
          </Field>
          <Field>
            <Label>Ticketing or notes system</Label>
            <input
              className={inputClass}
              value={inputs.ticketingSystem}
              onChange={(e) => set("ticketingSystem", e.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <Label>Audit log entry emitted</Label>
            <ToggleRow
              value={inputs.auditLogEntry}
              onChange={(v) => set("auditLogEntry", v)}
            />
          </Field>
          <Field>
            <Label>Appeals workflow linked to decision</Label>
            <ToggleRow
              value={inputs.appealsLinkage}
              onChange={(v) => set("appealsLinkage", v)}
            />
          </Field>
        </div>

        <Field>
          <Label>Can decision be reconstructed within 10 minutes</Label>
          <ToggleRow
            value={inputs.reconstructWithin10Minutes}
            onChange={(v) => set("reconstructWithin10Minutes", v)}
          />
        </Field>

        <Field>
          <Label>Known systems involved</Label>
          <input
            className={inputClass}
            value={inputs.knownSystemsInvolved.join(", ")}
            onChange={(e) => handleSystemsChange(e.target.value)}
            placeholder="comma separated"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {inputs.knownSystemsInvolved.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSystem(s)}
                className="text-[11px] rounded-full border border-ink-200 bg-ink-25 px-2 py-0.5 text-ink-600 hover:border-ink-400"
                title="Click to remove"
              >
                {s}
              </button>
            ))}
          </div>
        </Field>
      </div>

      <button
        type="button"
        onClick={onRun}
        className="w-full rounded-md bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-ink-800 transition-colors"
      >
        Run diagnostic
      </button>
    </div>
  );
}

function ToggleRow({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-ink-200 overflow-hidden">
      <button
        type="button"
        onClick={() => onChange(true)}
        className={[
          "px-3 py-1.5 text-xs font-medium transition-colors",
          value ? "bg-ink-900 text-white" : "bg-white text-ink-500 hover:bg-ink-25",
        ].join(" ")}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={[
          "px-3 py-1.5 text-xs font-medium transition-colors border-l border-ink-200",
          !value ? "bg-ink-900 text-white" : "bg-white text-ink-500 hover:bg-ink-25",
        ].join(" ")}
      >
        No
      </button>
    </div>
  );
}
