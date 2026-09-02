import { z } from "zod";
import type { GatewayActor, GatewayRecord } from "./company-gateway";
import { gatewayRecordSchema, requestCompanyGateway } from "./company-gateway";
import { compileDeterministicPlan } from "./company-config";

const engagementPayloadSchema = z.object({
  goal: z.string().min(12).max(2000),
  context: z.string().max(4000),
  authorizationReference: z.string().min(4).max(160),
  plan: z.object({
    summary: z.string(), outcome: z.string(), deliverables: z.array(z.string()),
    steps: z.array(z.object({ id: z.string(), title: z.string(), action: z.string() })),
    successCriteria: z.array(z.string()), guardrails: z.array(z.string()),
  }),
  completedStepIds: z.array(z.string()),
});

const recordDataSchema = z.object({ record: gatewayRecordSchema, replayed: z.boolean().optional() });
const createDataSchema = z.object({ record: gatewayRecordSchema, created: z.boolean(), replayed: z.boolean().optional() });
const listDataSchema = z.object({ records: z.array(gatewayRecordSchema), has_more: z.boolean().optional().default(false), next_cursor: z.string().nullable().optional().default(null) });

export function mapEngagement(record: GatewayRecord) {
  if (record.record_type !== "engagement") throw new Error("The gateway returned the wrong Company record type.");
  return { id: record.id, status: record.status, version: record.version, createdAt: record.created_at, updatedAt: record.updated_at, ...engagementPayloadSchema.parse(record.payload) };
}

export async function listEngagements(actor: GatewayActor, scope: "own" | "operator") {
  const records: GatewayRecord[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 100; page += 1) {
    const response = await requestCompanyGateway(actor, { action: "list", scope, record_type: "engagement", order: "updated_desc", limit: 200, ...(cursor ? { cursor } : {}) });
    const data = listDataSchema.parse(response.data);
    records.push(...data.records);
    if (!data.has_more || !data.next_cursor) break;
    cursor = data.next_cursor;
  }
  return records.map(mapEngagement);
}

export async function createEngagement(actor: GatewayActor, operationId: string, input: { goal: string; context: string; authorizationReference: string }) {
  const payload = engagementPayloadSchema.parse({ ...input, plan: compileDeterministicPlan(input.goal, input.context), completedStepIds: [] });
  const response = await requestCompanyGateway(actor, {
    action: "create", scope: "own", record_type: "engagement", status: "active",
    idempotency_key: `engagement:${operationId}`.slice(0, 200), operation_id: operationId, payload,
    event: { idempotency_key: `event:${operationId}`.slice(0, 200), status: "recorded", payload: { eventName: "engagement_created", operationId } },
  });
  const data = createDataSchema.parse(response.data);
  return { engagement: mapEngagement(data.record), replayed: data.replayed ?? !data.created };
}

export async function advanceEngagement(actor: GatewayActor, operationId: string, input: { engagementId: string; expectedVersion: number; stepId: string }) {
  const currentResponse = await requestCompanyGateway(actor, { action: "get", scope: "own", record_type: "engagement", record_id: input.engagementId });
  const current = recordDataSchema.parse(currentResponse.data).record;
  const payload = engagementPayloadSchema.parse(current.payload);
  const validSteps = new Set(payload.plan.steps.map((step) => step.id));
  if (!validSteps.has(input.stepId)) throw new Error("The requested execution step does not exist.");
  const completedStepIds = [...new Set([...payload.completedStepIds, input.stepId])];
  const status = completedStepIds.length === payload.plan.steps.length ? "completed" : "active";
  const response = await requestCompanyGateway(actor, {
    action: "update", scope: "own", record_type: "engagement", record_id: input.engagementId,
    expected_version: input.expectedVersion, operation_id: operationId, status,
    payload: { ...payload, completedStepIds },
    event: { idempotency_key: `event:${operationId}`.slice(0, 200), status: "recorded", payload: { eventName: "engagement_step_completed", operationId, stepId: input.stepId, resultingStatus: status } },
  });
  const data = recordDataSchema.parse(response.data);
  return { engagement: mapEngagement(data.record), replayed: data.replayed ?? false };
}
