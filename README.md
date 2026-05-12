# Trace Any Denial Diagnostic

An architecture exposure simulator for payer AI denial workflows. The user selects or enters a denial scenario, and the app evaluates whether the organization could reconstruct the full decision path under audit pressure.

This is a demo artifact for sales conversations, not a SaaS product. Synthetic data only. No real payer data, no compliance claims.

## What it does

- Four prebuilt synthetic scenarios from real payer workflows: prior authorization, claims AI, UR nurse review, appeals replay
- Editable diagnostic inputs that map to the actual lineage events: model version, input snapshot, feature payload, policy rule version, reviewer identity, override storage, audit log, appeals linkage
- Deterministic rule based diagnostic engine that detects named architecture failure patterns
- Trace status, traceability map (timeline), failure pattern cards, executive summary, and a remediation path

The emotional reaction the artifact is designed to produce: "We actually cannot reconstruct this denial path cleanly."

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- No backend, no database, no LLM. Local synthetic data and a deterministic engine.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To produce a static build:

```bash
npm run build
npm run preview
```

## Demo flow (3 minute sales conversation)

1. Open the app. The "Appeals replay failure" scenario is preselected.
2. Read the scenario summary and operational impact.
3. Click **Run diagnostic**.
4. The report shows the overall trace status, a timeline with red/yellow/green steps, named failure patterns with evidence, executive summary, and a remediation path.
5. Switch to "Utilization management nurse review" or "Claims AI denial" to show how the failure patterns shift with different lineage gaps.

## Project layout

```
src/
  components/
    ScenarioSelector.tsx
    DiagnosticForm.tsx
    TraceTimeline.tsx
    FailurePatternCard.tsx
    DiagnosticReport.tsx
    RemediationPlan.tsx
  data/
    scenarios.ts
    failurePatterns.ts
  logic/
    diagnosticEngine.ts
    types.ts
  App.tsx
  main.tsx
  index.css
```

## Scope

v0.1 covers:

- Scenario selection
- Editable diagnostic inputs with realistic defaults
- Run diagnostic
- Trace status, timeline, failure patterns, buyer findings, remediation path

Out of scope for v0.1:

- Login, accounts, database, backend
- PDF export, CRM, analytics
- LLM integration
- Customer data upload
- Admin panel, payments, scheduling

## Disclaimers

- All scenarios and IDs are synthetic.
- The app is not a compliance checklist and does not claim CMS certification or HIPAA validation.
- Output is intended for engineering and architecture conversations with payer technology buyers.
