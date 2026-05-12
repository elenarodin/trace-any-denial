import type { FailurePatternDefinition, FailurePatternId } from "../logic/types";

export const FAILURE_PATTERNS: Record<FailurePatternId, FailurePatternDefinition> = {
  cross_system_denial_lineage_break: {
    id: "cross_system_denial_lineage_break",
    name: "Cross system denial lineage break",
    meaning:
      "The denial decision is fragmented across more than three operational systems with no shared decision identifier.",
    whyItMatters:
      "Audit, appeals, and legal cannot stitch the path back together without manual reconciliation, which is slow and error prone under deadline.",
    remediation:
      "Introduce a persistent decision ID minted at intake and propagated to model service, policy engine, workflow platform, ticketing, and audit log.",
  },
  model_to_policy_version_drift: {
    id: "model_to_policy_version_drift",
    name: "Model to policy version drift",
    meaning:
      "The model version and the policy rule version applied at decision time are not bound to the same decision event.",
    whyItMatters:
      "When a denial is challenged months later, the team can show today's rule but not the rule that actually applied at decision time. That gap is what loses appeals.",
    remediation:
      "Stamp model version, policy rule version, and rule hash onto the immutable decision event. Treat policy rules as versioned artifacts, not live config.",
  },
  override_provenance_fracture: {
    id: "override_provenance_fracture",
    name: "Override provenance fracture",
    meaning:
      "A human override exists, but the reason and reviewer identity live outside the model inference event, typically in notes or ticketing.",
    whyItMatters:
      "The final decision looks unattributed in the lineage. Reviewers cannot defend why they overrode the model, and CMS exposure increases.",
    remediation:
      "Capture override reason, reviewer ID, and timestamp on the same decision record as the model inference. Free text notes are not a substitute.",
  },
  human_review_orphaning: {
    id: "human_review_orphaning",
    name: "Human review orphaning",
    meaning:
      "Reviewer action is recorded in the workflow platform but never linked back to the model inference that triggered the review.",
    whyItMatters:
      "From the model side, the review never happened. From the workflow side, the model's recommendation is invisible. Neither system can answer the audit question alone.",
    remediation:
      "Bidirectional linkage: workflow platform stores model decision ID; model service stores reviewer action ID. Reconcile in the decision timeline service.",
  },
  appeals_replay_failure: {
    id: "appeals_replay_failure",
    name: "Appeals replay failure",
    meaning:
      "The organization cannot reproduce the model output given the original input, model version, and policy rule that applied at the time of denial.",
    whyItMatters:
      "Appeals are decided on whether the original denial was defensible. If the team cannot replay the decision, they default to overturning or settling.",
    remediation:
      "Persist input snapshot, feature payload, model version, and policy rule version. Provide a replay endpoint that loads the exact decision state.",
  },
  audit_log_stitching_gap: {
    id: "audit_log_stitching_gap",
    name: "Audit log stitching gap",
    meaning:
      "There is no single queryable audit timeline that orders the decision events. Logs exist but require cross-system reconstruction.",
    whyItMatters:
      "Time-to-evidence is the metric that matters under CMS or internal audit pressure. Stitching by hand turns a 10 minute task into a 2 day task.",
    remediation:
      "Materialize a queryable audit timeline keyed by decision ID. Order by event time. Include model, policy, reviewer, override, and final decision events.",
  },
  input_snapshot_loss: {
    id: "input_snapshot_loss",
    name: "Input snapshot loss",
    meaning:
      "The exact input the model saw at decision time is not retained. Upstream sources may have mutated since then.",
    whyItMatters:
      "Without the original input, every replay is contextually wrong. The team is reconstructing a different decision than the one that was made.",
    remediation:
      "Store an immutable input snapshot or a content addressable hash of the input. Bind it to the decision ID.",
  },
  feature_payload_invisibility: {
    id: "feature_payload_invisibility",
    name: "Feature payload invisibility",
    meaning:
      "The feature vector that the model consumed is not retrievable. Only the raw input or only the output is kept.",
    whyItMatters:
      "Engineering cannot explain why the model produced its recommendation. That blocks defensibility, drift analysis, and override calibration.",
    remediation:
      "Persist the feature payload alongside the model inference event. Include feature store version and transformation hashes.",
  },
  reviewer_identity_gap: {
    id: "reviewer_identity_gap",
    name: "Reviewer identity gap",
    meaning:
      "The human reviewer who approved or overrode the denial is not identified on the decision record.",
    whyItMatters:
      "Workforce controls and BAA scoped access depend on identifying the actor. An unattributed clinical decision is hard to defend.",
    remediation:
      "Require authenticated reviewer identity on every override and approval. Persist reviewer ID and role on the decision event.",
  },
  downstream_decision_filter_not_captured: {
    id: "downstream_decision_filter_not_captured",
    name: "Downstream decision filter not captured",
    meaning:
      "A downstream rule or plan specific filter modified the model output before the final denial, but the modification is not recorded.",
    whyItMatters:
      "The final denial does not match the model output, and no event explains the difference. Members and auditors see an inconsistency the team cannot account for.",
    remediation:
      "Treat every downstream filter as a decision event. Record rule ID, version, input, and output. Make the final denial a function of an explicit chain.",
  },
};

export const FAILURE_PATTERN_LIST: FailurePatternDefinition[] = Object.values(FAILURE_PATTERNS);
