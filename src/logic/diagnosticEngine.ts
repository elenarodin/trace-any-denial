import { FAILURE_PATTERNS } from "../data/failurePatterns";
import type {
  BuyerFinding,
  DetectedFailurePattern,
  DiagnosticReport,
  RemediationStep,
  ScenarioInputs,
  StepStatus,
  TimelineStep,
  TraceStatus,
} from "./types";

const NOTES_OR_TICKETING = new Set(["notes_field", "ticketing_system", "spreadsheet", "unknown"]);

function isMissing(value: string | undefined | null): boolean {
  return !value || value.trim().length === 0;
}

function distinctSystemCount(inputs: ScenarioInputs): number {
  const systems = (inputs.knownSystemsInvolved ?? []).map((s) => s.trim()).filter(Boolean);
  return new Set(systems).size;
}

interface PatternHit {
  id: keyof typeof FAILURE_PATTERNS;
  evidence: string;
}

function detectPatterns(inputs: ScenarioInputs): PatternHit[] {
  const hits: PatternHit[] = [];

  if (isMissing(inputs.modelVersion)) {
    hits.push({
      id: "model_to_policy_version_drift",
      evidence: "Model version is not recorded on the decision event.",
    });
  }

  if (isMissing(inputs.policyRuleVersion)) {
    if (!hits.some((h) => h.id === "model_to_policy_version_drift")) {
      hits.push({
        id: "model_to_policy_version_drift",
        evidence: "Policy rule version is not bound to the model inference event.",
      });
    } else {
      hits[hits.length - 1].evidence +=
        " Policy rule version is also missing from the decision record.";
    }
  }

  if (!inputs.inputSnapshotAvailable) {
    hits.push({
      id: "input_snapshot_loss",
      evidence: "Original input snapshot is not retained or referenceable by hash.",
    });
  }

  if (!inputs.featurePayloadAvailable) {
    hits.push({
      id: "feature_payload_invisibility",
      evidence: "Feature payload consumed by the model is not retrievable.",
    });
  }

  const overrideExists = !isMissing(inputs.overrideReason);
  if (overrideExists && NOTES_OR_TICKETING.has(inputs.overrideStorage)) {
    hits.push({
      id: "override_provenance_fracture",
      evidence: `Override reason is stored in ${humanizeStorage(
        inputs.overrideStorage,
      )} rather than on the decision event.`,
    });
  }

  if (isMissing(inputs.humanReviewerId)) {
    hits.push({
      id: "reviewer_identity_gap",
      evidence: "No authenticated reviewer identity is attached to the decision.",
    });
  }

  if (overrideExists && !isMissing(inputs.humanReviewerId) && NOTES_OR_TICKETING.has(inputs.overrideStorage)) {
    hits.push({
      id: "human_review_orphaning",
      evidence:
        "Reviewer action is recorded in the workflow side, but is not linked to the model inference event.",
    });
  }

  if (!inputs.auditLogEntry) {
    hits.push({
      id: "audit_log_stitching_gap",
      evidence:
        "No queryable audit timeline event was emitted for this decision. Reconstruction requires cross system stitching.",
    });
  }

  if (!inputs.appealsLinkage) {
    hits.push({
      id: "appeals_replay_failure",
      evidence:
        "Appeals workflow has no link back to the original decision state. The decision cannot be replayed deterministically.",
    });
  }

  if (distinctSystemCount(inputs) > 3) {
    hits.push({
      id: "cross_system_denial_lineage_break",
      evidence: `Decision lineage spans ${distinctSystemCount(
        inputs,
      )} systems with no shared decision identifier.`,
    });
  }

  if (
    inputs.scenarioType === "claims_ai" &&
    (inputs.recordsStorage.includes("workflow_platform") ||
      inputs.recordsStorage.includes("vendor_platform"))
  ) {
    hits.push({
      id: "downstream_decision_filter_not_captured",
      evidence:
        "Downstream payment rules in the claims platform can modify the model output without a recorded decision event.",
    });
  }

  return dedupe(hits);
}

function dedupe(hits: PatternHit[]): PatternHit[] {
  const seen = new Map<string, PatternHit>();
  for (const hit of hits) {
    const existing = seen.get(hit.id);
    if (!existing) {
      seen.set(hit.id, { ...hit });
    } else {
      existing.evidence = `${existing.evidence} ${hit.evidence}`.trim();
    }
  }
  return Array.from(seen.values());
}

function humanizeStorage(loc: ScenarioInputs["overrideStorage"]): string {
  switch (loc) {
    case "decision_service":
      return "the decision service";
    case "model_registry":
      return "the model registry";
    case "feature_store":
      return "the feature store";
    case "data_warehouse":
      return "the data warehouse";
    case "workflow_platform":
      return "the workflow platform";
    case "ticketing_system":
      return "the ticketing system";
    case "vendor_platform":
      return "a vendor platform";
    case "notes_field":
      return "a free text notes field";
    case "scattered_logs":
      return "scattered application logs";
    case "spreadsheet":
      return "a spreadsheet";
    case "unknown":
      return "an unidentified system";
  }
}

function buildTimeline(inputs: ScenarioInputs, hitIds: Set<string>): TimelineStep[] {
  const overrideExists = !isMissing(inputs.overrideReason);

  const inputStep: TimelineStep = {
    key: "input_received",
    label: "Input received",
    status: inputs.inputSnapshotAvailable ? "green" : "red",
    note: inputs.inputSnapshotAvailable
      ? "Input snapshot retained."
      : "No immutable input snapshot. Replay is contextually wrong by default.",
  };

  const inferenceStatus: StepStatus = isMissing(inputs.modelVersion)
    ? "red"
    : inputs.featurePayloadAvailable
      ? "green"
      : "yellow";
  const inferenceNote = isMissing(inputs.modelVersion)
    ? "Model version not recorded on the decision event."
    : inputs.featurePayloadAvailable
      ? "Model version and feature payload bound to the decision."
      : "Model version recorded, but feature payload is not retrievable.";
  const inferenceStep: TimelineStep = {
    key: "model_inference",
    label: "Model inference",
    status: inferenceStatus,
    note: inferenceNote,
  };

  const policyStatus: StepStatus = isMissing(inputs.policyRuleVersion) ? "red" : "green";
  const policyStep: TimelineStep = {
    key: "policy_rule_applied",
    label: "Policy rule applied",
    status: policyStatus,
    note: isMissing(inputs.policyRuleVersion)
      ? "Policy rule version not stamped onto the decision."
      : `Policy rule ${inputs.policyRuleVersion} bound to decision.`,
  };

  const reviewStatus: StepStatus = isMissing(inputs.humanReviewerId)
    ? "red"
    : NOTES_OR_TICKETING.has(inputs.overrideStorage) && overrideExists
      ? "yellow"
      : "green";
  const reviewNote = isMissing(inputs.humanReviewerId)
    ? "No authenticated reviewer identity captured."
    : NOTES_OR_TICKETING.has(inputs.overrideStorage) && overrideExists
      ? "Reviewer identified, but reviewer action lives outside the decision event."
      : "Reviewer identity captured on the decision.";
  const reviewStep: TimelineStep = {
    key: "human_review",
    label: "Human review",
    status: reviewStatus,
    note: reviewNote,
  };

  const overrideStep: TimelineStep = {
    key: "override",
    label: "Override",
    status: !overrideExists
      ? "green"
      : NOTES_OR_TICKETING.has(inputs.overrideStorage)
        ? "red"
        : "yellow",
    note: !overrideExists
      ? "No override applied."
      : NOTES_OR_TICKETING.has(inputs.overrideStorage)
        ? `Override reason in ${humanizeStorage(inputs.overrideStorage)}, not in the decision lineage.`
        : `Override reason captured in ${humanizeStorage(inputs.overrideStorage)}.`,
  };

  const finalStep: TimelineStep = {
    key: "final_denial",
    label: "Final denial",
    status: hitIds.has("downstream_decision_filter_not_captured") ? "yellow" : "green",
    note: hitIds.has("downstream_decision_filter_not_captured")
      ? "Final denial may differ from model output without a recorded reason."
      : "Final denial recorded.",
  };

  const auditStep: TimelineStep = {
    key: "audit_log",
    label: "Audit log",
    status: inputs.auditLogEntry
      ? hitIds.has("audit_log_stitching_gap")
        ? "yellow"
        : "green"
      : "red",
    note: inputs.auditLogEntry
      ? "Audit event present, but timeline is not single source of truth."
      : "No queryable audit timeline event for this decision.",
  };

  const replayStep: TimelineStep = {
    key: "appeals_replay",
    label: "Appeals replay",
    status: inputs.appealsLinkage && inputs.inputSnapshotAvailable && !isMissing(inputs.modelVersion)
      ? "green"
      : inputs.appealsLinkage
        ? "yellow"
        : "red",
    note: inputs.appealsLinkage
      ? inputs.inputSnapshotAvailable && !isMissing(inputs.modelVersion)
        ? "Appeals replay supported from original decision state."
        : "Appeals linkage exists, but input snapshot or model version is missing."
      : "Appeals workflow is not linked to the original decision state.",
  };

  return [
    inputStep,
    inferenceStep,
    policyStep,
    reviewStep,
    overrideStep,
    finalStep,
    auditStep,
    replayStep,
  ];
}

function deriveStatus(inputs: ScenarioInputs, timeline: TimelineStep[]): {
  status: TraceStatus;
  reason: string;
} {
  const reds = timeline.filter((s) => s.status === "red").length;
  const yellows = timeline.filter((s) => s.status === "yellow").length;

  if (!inputs.reconstructWithin10Minutes) {
    if (reds >= 3 || (!inputs.inputSnapshotAvailable && isMissing(inputs.modelVersion))) {
      return {
        status: "audit_replay_failure_likely",
        reason:
          "Multiple lineage gaps and missing replay state. The decision cannot be reproduced under audit pressure.",
      };
    }
    return {
      status: "trace_failure_likely",
      reason:
        "The team cannot reconstruct the denial path within 10 minutes. Critical lineage events live outside the decision record.",
    };
  }

  if (reds === 0 && yellows === 0) {
    return {
      status: "traceable",
      reason: "Decision lineage is bound end to end. Replay and audit are supported.",
    };
  }

  return {
    status: "partially_traceable",
    reason: "Most of the lineage is intact, but specific events are not bound to the decision.",
  };
}

function buildFindings(patterns: DetectedFailurePattern[]): BuyerFinding[] {
  const findings: BuyerFinding[] = [];
  const seen = new Set<string>();
  const push = (id: string, text: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    findings.push({ id, text });
  };

  for (const p of patterns) {
    if (findings.length >= 5) break;
    switch (p.id) {
      case "input_snapshot_loss":
        push(
          p.id,
          "Input snapshot is unavailable. The team cannot reliably replay the decision under audit pressure, so every appeal replay is a different decision than the one that was made.",
        );
        break;
      case "model_to_policy_version_drift":
        push(
          p.id,
          "Policy rule version is not tied to the model inference event. The organization may know what rule exists today, but not what rule was applied when the denial occurred.",
        );
        break;
      case "override_provenance_fracture":
        push(
          p.id,
          "Reviewer override is stored outside the denial lineage. The final decision is hard to defend during appeal or audit because the reason for override is not on the decision record.",
        );
        break;
      case "feature_payload_invisibility":
        push(
          p.id,
          "Feature payload consumed by the model is not retrievable. Engineering cannot explain why the model produced its recommendation, which blocks defensibility and override calibration.",
        );
        break;
      case "audit_log_stitching_gap":
        push(
          p.id,
          "There is no single queryable audit timeline. Time-to-evidence depends on cross system reconstruction, which fails under deadline.",
        );
        break;
      case "appeals_replay_failure":
        push(
          p.id,
          "Appeals workflow cannot replay the original decision state. Operationally this looks like a precision problem, but it is a traceability problem.",
        );
        break;
      case "human_review_orphaning":
        push(
          p.id,
          "Reviewer action is captured in the workflow platform but never linked back to the model inference. Neither system can answer the audit question alone.",
        );
        break;
      case "reviewer_identity_gap":
        push(
          p.id,
          "No authenticated reviewer identity is attached to the decision. An unattributed clinical decision is hard to defend under workforce controls and BAA scope.",
        );
        break;
      case "cross_system_denial_lineage_break":
        push(
          p.id,
          "Denial lineage is fragmented across multiple operational systems with no shared decision identifier. Reconciliation is manual and slow under deadline.",
        );
        break;
      case "downstream_decision_filter_not_captured":
        push(
          p.id,
          "A downstream filter can modify the model output before the final denial, but the modification is not recorded as an event. Members and auditors see an inconsistency the team cannot account for.",
        );
        break;
    }
  }

  if (findings.length === 0) {
    findings.push({
      id: "baseline",
      text: "Decision lineage is bound end to end for this scenario. Replay and audit are supported under the assumed inputs.",
    });
  }
  return findings.slice(0, 5);
}

function buildRemediation(patterns: DetectedFailurePattern[]): RemediationStep[] {
  const ids = new Set(patterns.map((p) => p.id));
  const all: RemediationStep[] = [
    {
      id: "decision_id",
      label: "Create persistent decision ID across workflow",
      detail:
        "Mint a decision ID at intake. Propagate to model service, policy engine, workflow platform, ticketing, and audit log. This is the join key for everything below.",
    },
    {
      id: "model_version",
      label: "Attach model version to every inference event",
      detail:
        "Every model output writes an event with model version, feature store version, and feature transformation hashes.",
    },
    {
      id: "input_snapshot",
      label: "Store immutable input snapshot or reference hash",
      detail:
        "Persist the input the model saw, or a content addressable hash that points to it, bound to the decision ID.",
    },
    {
      id: "policy_version",
      label: "Capture policy rule version at decision time",
      detail:
        "Treat policy rules as versioned artifacts. Stamp the rule version and rule hash onto the decision event.",
    },
    {
      id: "override_lineage",
      label: "Link human reviewer action and override reason",
      detail:
        "Reviewer ID, override reason, and timestamp on the same decision record as the model inference. Free text notes are not a substitute.",
    },
    {
      id: "audit_timeline",
      label: "Create queryable audit timeline",
      detail:
        "Materialize a timeline keyed by decision ID. Order by event time. Include model, policy, reviewer, override, downstream filter, and final decision events.",
    },
    {
      id: "appeals_replay",
      label: "Support appeals replay from original decision state",
      detail:
        "Provide a replay endpoint that loads input snapshot, feature payload, model version, and policy rule version, and reproduces the original output.",
    },
  ];

  const priority = new Map<string, number>([
    ["decision_id", ids.has("cross_system_denial_lineage_break") ? 0 : 5],
    ["model_version", ids.has("model_to_policy_version_drift") ? 1 : 6],
    ["input_snapshot", ids.has("input_snapshot_loss") ? 1 : 6],
    ["policy_version", ids.has("model_to_policy_version_drift") ? 1 : 6],
    ["override_lineage", ids.has("override_provenance_fracture") || ids.has("human_review_orphaning") ? 1 : 6],
    ["audit_timeline", ids.has("audit_log_stitching_gap") ? 2 : 6],
    ["appeals_replay", ids.has("appeals_replay_failure") ? 2 : 6],
  ]);

  return [...all].sort((a, b) => (priority.get(a.id) ?? 9) - (priority.get(b.id) ?? 9));
}

export function runDiagnostic(inputs: ScenarioInputs): DiagnosticReport {
  const hits = detectPatterns(inputs);
  const detected: DetectedFailurePattern[] = hits.map((h) => ({
    ...FAILURE_PATTERNS[h.id],
    evidence: h.evidence,
  }));
  const hitIds = new Set(hits.map((h) => h.id));
  const timeline = buildTimeline(inputs, hitIds);
  const { status, reason } = deriveStatus(inputs, timeline);
  const findings = buildFindings(detected);
  const remediation = buildRemediation(detected);

  return {
    status,
    statusReason: reason,
    timeline,
    patterns: detected,
    findings,
    remediation,
  };
}
