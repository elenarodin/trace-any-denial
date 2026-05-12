export type ScenarioType =
  | "prior_authorization"
  | "claims_ai"
  | "ur_nurse_review"
  | "appeals_replay";

export type StorageLocation =
  | "decision_service"
  | "model_registry"
  | "feature_store"
  | "data_warehouse"
  | "workflow_platform"
  | "ticketing_system"
  | "vendor_platform"
  | "notes_field"
  | "scattered_logs"
  | "spreadsheet"
  | "unknown";

export interface ScenarioInputs {
  scenarioType: ScenarioType;
  modelOutput: string;
  decisionId: string;
  modelVersion: string;
  inputSnapshotAvailable: boolean;
  featurePayloadAvailable: boolean;
  policyRuleVersion: string;
  humanReviewerId: string;
  overrideReason: string;
  overrideStorage: StorageLocation;
  auditLogEntry: boolean;
  workflowSystem: string;
  ticketingSystem: string;
  appealsLinkage: boolean;
  reconstructWithin10Minutes: boolean;
  knownSystemsInvolved: string[];
  recordsStorage: StorageLocation[];
}

export interface Scenario {
  id: ScenarioType;
  name: string;
  shortLabel: string;
  summary: string;
  buyerPain: string;
  defaults: ScenarioInputs;
}

export type TraceStatus =
  | "traceable"
  | "partially_traceable"
  | "trace_failure_likely"
  | "audit_replay_failure_likely";

export type StepStatus = "green" | "yellow" | "red";

export type TimelineStepKey =
  | "input_received"
  | "model_inference"
  | "policy_rule_applied"
  | "human_review"
  | "override"
  | "final_denial"
  | "audit_log"
  | "appeals_replay";

export interface TimelineStep {
  key: TimelineStepKey;
  label: string;
  status: StepStatus;
  note: string;
}

export type FailurePatternId =
  | "cross_system_denial_lineage_break"
  | "model_to_policy_version_drift"
  | "override_provenance_fracture"
  | "human_review_orphaning"
  | "appeals_replay_failure"
  | "audit_log_stitching_gap"
  | "input_snapshot_loss"
  | "feature_payload_invisibility"
  | "reviewer_identity_gap"
  | "downstream_decision_filter_not_captured";

export interface FailurePatternDefinition {
  id: FailurePatternId;
  name: string;
  meaning: string;
  whyItMatters: string;
  remediation: string;
}

export interface DetectedFailurePattern extends FailurePatternDefinition {
  evidence: string;
}

export interface BuyerFinding {
  id: string;
  text: string;
}

export interface RemediationStep {
  id: string;
  label: string;
  detail: string;
}

export interface DiagnosticReport {
  status: TraceStatus;
  statusReason: string;
  timeline: TimelineStep[];
  patterns: DetectedFailurePattern[];
  findings: BuyerFinding[];
  remediation: RemediationStep[];
}
