export const companyConfig = {
  key: "tech_no_log_ia",
  name: "Tech.NO-Log.IA",
  category: "TECHNOLOGY OPERATING COMPANY",
  promise: "Turn a technology intent into a grounded operating blueprint and reversible implementation path.",
  description: "A private workspace for technology decisions, architecture boundaries, execution evidence and adaptation.",
  engagementLabel: "technology mandate",
  deliverableLabel: "Technology Operating Blueprint",
  goalLabel: "What technology outcome must become operational?",
  goalPlaceholder: "Describe the capability, current constraints and observable success criteria.",
  inputGuardrail: "Do not submit passwords, tokens, private keys, production secrets or proprietary source code. Use sanitized architecture context only.",
  planLens: "Translate the capability into a bounded architecture decision, reversible implementation sequence and verifiable operating evidence.",
  principles: [
    "Every deliverable begins from a persisted client intent.",
    "Every action has an owner-visible completion record.",
    "Every update is idempotent, versioned and Company-isolated.",
    "No payment, regulated fulfillment or hidden external action is implied.",
  ],
  footer: "Private connected candidate · Production and sales not authorized",
} as const;

export const intakeChoices = {
  stage: ["new_idea", "existing_company", "market_research"],
  customer: ["consumer", "professional", "small_business", "enterprise", "unknown"],
  offer: ["paid_diagnostic", "managed_service", "subscription", "unknown"],
  data: ["none", "contact", "financial", "sensitive", "unknown"],
  autonomy: ["draft_for_review", "recommend", "execute_with_approval", "unknown"],
  channel: ["meeting", "website", "outbound", "partner", "unknown"],
} as const;

export type CompanyIntake = {
  [K in keyof typeof intakeChoices]: (typeof intakeChoices)[K][number];
};

export function compileIntakePlan(goal: string, context: string, intake: CompanyIntake) {
  const base = compileDeterministicPlan(goal, context);
  const unknowns = Object.entries(intake).filter(([, value]) => value === "unknown").map(([key]) => key);
  return {
    ...base,
    summary: `Intake registrado: etapa ${intake.stage}, cliente ${intake.customer}, oferta ${intake.offer}, dados ${intake.data}, autonomia ${intake.autonomy}, canal ${intake.channel}. ${unknowns.length ? `Decisões abertas: ${unknowns.join(", ")}.` : "As escolhas ainda exigem validação de mercado."} ${base.summary}`,
    deliverables: ["Brief de entrada e decisões abertas", ...base.deliverables],
    guardrails: [...base.guardrails, "Este brief não aprova venda, deploy nem autonomia externa."],
  };
}

export function compileDeterministicPlan(goal: string, context: string) {
  const normalizedGoal = goal.trim().replace(/\s+/g, " ");
  const normalizedContext = context.trim().replace(/\s+/g, " ");
  return {
    summary: `${companyConfig.planLens} ${normalizedContext ? `Relevant context: ${normalizedContext}` : "The first cycle will establish the missing baseline."}`,
    outcome: normalizedGoal,
    deliverables: [companyConfig.deliverableLabel, "Decision record", "Execution evidence", "Adaptation checkpoint"],
    steps: [
      { id: "baseline", title: "Freeze the baseline", action: "Record the current state, constraints and the first observable signal." },
      { id: "decision", title: "Make the bounded decision", action: `Apply the ${companyConfig.name} lens and record the selected path plus rejected alternatives.` },
      { id: "execute", title: "Execute the first move", action: "Complete the smallest reversible action that can produce a real signal." },
      { id: "evidence", title: "Capture evidence", action: "Record what changed, what did not change and the evidence supporting that conclusion." },
      { id: "adapt", title: "Adapt the next cycle", action: "Preserve the history, update the plan and choose the next action from observed reality." },
    ],
    successCriteria: ["A baseline is explicit", "A decision is traceable", "At least one action is completed", "Evidence changes the next cycle"],
    guardrails: [companyConfig.inputGuardrail, "Human review remains responsible for consequential decisions."],
  };
}
