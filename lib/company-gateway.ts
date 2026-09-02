import { env } from "cloudflare:workers";
import { z } from "zod";
import type { ChatGPTUser } from "@/app/chatgpt-auth";
import { companyConfig } from "@/lib/company-config";

const gatewaySuccessSchema = z.object({
  ok: z.literal(true),
  request_id: z.string().min(1),
  action: z.string().min(1),
  company_key: z.string().min(1),
  capabilities: z.unknown(),
  data: z.unknown(),
});

const gatewayFailureSchema = z.object({
  ok: z.literal(false),
  request_id: z.string().min(1),
  action: z.string().min(1),
  error_code: z.string().min(1),
  message: z.string().min(1),
});

const gatewayEnvelopeSchema = z.discriminatedUnion("ok", [
  gatewaySuccessSchema,
  gatewayFailureSchema,
]);

export const gatewayOwnerSchema = z.object({
  human_id: z.string().uuid(),
  email: z.string().email(),
  display_name: z.string().nullable().optional(),
  status: z.string().min(1),
});

export const gatewayRecordSchema = z.object({
  id: z.string().uuid(),
  human_id: z.string().uuid(),
  record_type: z.string().min(1),
  parent_record_id: z.string().uuid().nullable().optional(),
  idempotency_key: z.string().nullable().optional(),
  status: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  created_at: z.string().min(1),
  updated_at: z.string().min(1),
  version: z.number().int().positive().optional().default(1),
  owner: gatewayOwnerSchema.optional(),
});

export type GatewayRecord = z.infer<typeof gatewayRecordSchema>;

export const gatewayCapabilitiesSchema = z.object({
  operator: z.boolean(),
  scopes: z.array(z.enum(["own", "operator"])),
  actions: z.array(z.string()),
});

export type GatewayCapabilities = z.infer<typeof gatewayCapabilitiesSchema>;

export type GatewayActor = Pick<ChatGPTUser, "id" | "email" | "displayName">;

export type GatewayRequest = {
  action:
    | "capabilities"
    | "list"
    | "get"
    | "create"
    | "create_for_parent_owner"
    | "update"
    | "snapshot";
  scope?: "own" | "operator";
  record_type?: string;
  record_id?: string;
  parent_record_id?: string | null;
  target_human_id?: string;
  idempotency_key?: string;
  operation_id?: string;
  expected_version?: number;
  expected_updated_at?: string;
  event?: {
    idempotency_key: string;
    status?: string;
    payload: Record<string, unknown>;
  };
  status?: string;
  payload?: Record<string, unknown>;
  limit?: number;
  order?: "created_desc" | "updated_desc";
  cursor?: string;
  expected_parent_version?: number;
  expected_parent_updated_at?: string;
  allowed_parent_statuses?: string[];
};

export type GatewayMutationEvent = {
  status?: string;
  payload: Record<string, unknown>;
};

export type GatewayMutationResult = {
  record: GatewayRecord;
  event: GatewayRecord;
  created: boolean;
  replayed: boolean;
};

export type GatewayConfig = {
  url: string;
  secret: string;
  projectId: string;
  companyKey: string;
};

export class CompanyGatewayError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "CompanyGatewayError";
  }
}

function requiredEnvironmentValue(
  runtime: Record<string, unknown>,
  name: string,
): string {
  const value = String(runtime[name] ?? "").trim();
  if (!value) {
    throw new CompanyGatewayError(
      "GATEWAY_NOT_CONFIGURED",
      `Missing server runtime value: ${name}.`,
    );
  }
  return value;
}

export function readCompanyGatewayConfig(
  runtime = env as unknown as Record<string, unknown>,
): GatewayConfig {
  const urlValue = requiredEnvironmentValue(runtime, "COMPANY_GATEWAY_URL");
  const secret = requiredEnvironmentValue(runtime, "COMPANY_GATEWAY_SECRET");
  const projectId = requiredEnvironmentValue(
    runtime,
    "COMPANY_GATEWAY_PROJECT_ID",
  );
  const companyKey = requiredEnvironmentValue(
    runtime,
    "COMPANY_GATEWAY_COMPANY_KEY",
  );

  let url: URL;
  try {
    url = new URL(urlValue);
  } catch {
    throw new CompanyGatewayError(
      "GATEWAY_NOT_CONFIGURED",
      "COMPANY_GATEWAY_URL is not a valid URL.",
    );
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hash
  ) {
    throw new CompanyGatewayError(
      "GATEWAY_NOT_CONFIGURED",
      "COMPANY_GATEWAY_URL must be a credential-free HTTPS URL.",
    );
  }
  if (!/^appgprj_[a-z0-9]+$/.test(projectId)) {
    throw new CompanyGatewayError(
      "GATEWAY_NOT_CONFIGURED",
      "COMPANY_GATEWAY_PROJECT_ID is invalid.",
    );
  }
  if (secret.length < 32 || secret.length > 512) {
    throw new CompanyGatewayError(
      "GATEWAY_NOT_CONFIGURED",
      "COMPANY_GATEWAY_SECRET has an invalid length.",
    );
  }
  if (companyKey !== companyConfig.key) {
    throw new CompanyGatewayError(
      "GATEWAY_COMPANY_MISMATCH",
      `This runtime is not bound to the ${companyConfig.name} Company.`,
    );
  }

  return { url: url.toString(), secret, projectId, companyKey };
}

export async function requestCompanyGatewayWithConfig(
  config: GatewayConfig,
  actor: GatewayActor,
  request: GatewayRequest,
  fetcher: typeof fetch = fetch,
) {
  const requestId = crypto.randomUUID();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let response: Response;
  try {
    response = await fetcher(config.url, {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.secret}`,
        "content-type": "application/json",
        "x-site-project-id": config.projectId,
      },
      body: JSON.stringify({
        ...request,
        request_id: requestId,
        actor: {
          subject: actor.id,
          email: actor.email,
          display_name: actor.displayName,
        },
      }),
      redirect: "error",
      signal: controller.signal,
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    throw new CompanyGatewayError(
      timedOut ? "GATEWAY_TIMEOUT" : "GATEWAY_UNAVAILABLE",
      timedOut ? "The Company gateway timed out." : "The Company gateway is unavailable.",
      true,
    );
  } finally {
    clearTimeout(timeout);
  }

  let responseText: string;
  try {
    responseText = await response.text();
  } catch {
    throw new CompanyGatewayError(
      "GATEWAY_UNAVAILABLE",
      "The Company gateway response could not be read.",
      true,
    );
  }
  if (responseText.length > 1_500_000) {
    throw new CompanyGatewayError(
      "GATEWAY_INVALID_RESPONSE",
      "The Company gateway returned an oversized response.",
    );
  }

  let rawEnvelope: unknown;
  try {
    rawEnvelope = JSON.parse(responseText);
  } catch {
    throw new CompanyGatewayError(
      "GATEWAY_INVALID_RESPONSE",
      "The Company gateway returned invalid JSON.",
    );
  }

  const parsed = gatewayEnvelopeSchema.safeParse(rawEnvelope);
  if (!parsed.success) {
    if (!response.ok) {
      throw new CompanyGatewayError(
        response.status === 401 || response.status === 403
          ? "GATEWAY_AUTH_FAILED"
          : "GATEWAY_UPSTREAM_ERROR",
        "The Company gateway rejected the server request.",
        response.status >= 500,
      );
    }
    throw new CompanyGatewayError(
      "GATEWAY_INVALID_RESPONSE",
      "The Company gateway response did not match its contract.",
    );
  }
  if (!parsed.data.ok) {
    throw new CompanyGatewayError(
      parsed.data.error_code,
      parsed.data.message,
      parsed.data.error_code === "INTERNAL_ERROR",
    );
  }
  if (!response.ok) {
    throw new CompanyGatewayError(
      "GATEWAY_INVALID_RESPONSE",
      "The Company gateway returned success with a failing HTTP status.",
    );
  }
  if (parsed.data.company_key !== config.companyKey) {
    throw new CompanyGatewayError(
      "GATEWAY_COMPANY_MISMATCH",
      "The Company gateway returned data for a different Company.",
    );
  }

  return parsed.data;
}

export async function requestCompanyGateway(
  actor: GatewayActor,
  request: GatewayRequest,
) {
  return requestCompanyGatewayWithConfig(
    readCompanyGatewayConfig(),
    actor,
    request,
  );
}

const mutationReceiptSchema = z.object({
  operation_id: z.string().min(8).optional(),
  replayed: z.boolean().optional(),
}).passthrough();

const mutationDataSchema = z.object({
  record: gatewayRecordSchema,
  event: gatewayRecordSchema.optional(),
  event_record: gatewayRecordSchema.optional(),
  created: z.boolean().optional(),
  replayed: z.boolean().optional(),
  receipt: mutationReceiptSchema.optional(),
});

export async function mutateCompanyRecord(input: {
  actor: GatewayActor;
  action: "create" | "create_for_parent_owner" | "update";
  scope: "own" | "operator";
  recordType: string;
  operationId: string;
  recordId?: string;
  parentRecordId?: string | null;
  expectedVersion?: number;
  expectedUpdatedAt?: string;
  status?: string;
  payload?: Record<string, unknown>;
  event: GatewayMutationEvent;
}): Promise<GatewayMutationResult> {
  const response = await requestCompanyGateway(input.actor, {
    action: input.action,
    scope: input.scope,
    record_type: input.recordType,
    operation_id: input.operationId,
    ...(input.recordId ? { record_id: input.recordId } : {}),
    ...(input.parentRecordId !== undefined
      ? { parent_record_id: input.parentRecordId }
      : {}),
    ...(input.expectedUpdatedAt
      ? { expected_updated_at: input.expectedUpdatedAt }
      : {}),
    ...(input.expectedVersion
      ? { expected_version: input.expectedVersion }
      : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.payload ? { payload: input.payload } : {}),
    event: {
      idempotency_key: `event:${input.operationId}`.slice(0, 200),
      status: input.event.status ?? "recorded",
      payload: input.event.payload,
    },
  });
  const parsed = mutationDataSchema.safeParse(response.data);
  if (!parsed.success) {
    throw new CompanyGatewayError(
      "GATEWAY_INVALID_RESPONSE",
      "The Company gateway returned an invalid atomic mutation response.",
    );
  }
  const event = parsed.data.event ?? parsed.data.event_record;
  if (!event || event.record_type !== "event") {
    throw new CompanyGatewayError(
      "GATEWAY_INVALID_RESPONSE",
      "The Company gateway mutation is missing its atomic event.",
    );
  }
  if (parsed.data.record.record_type !== input.recordType) {
    throw new CompanyGatewayError(
      "GATEWAY_INVALID_RESPONSE",
      "The Company gateway mutated a different record type.",
    );
  }
  return {
    record: parsed.data.record,
    event,
    created: parsed.data.created ?? input.action !== "update",
    replayed: parsed.data.replayed ?? parsed.data.receipt?.replayed ?? false,
  };
}

export async function getGatewayCapabilities(
  actor: GatewayActor,
): Promise<GatewayCapabilities> {
  const response = await requestCompanyGateway(actor, {
    action: "capabilities",
    scope: "own",
  });
  return gatewayCapabilitiesSchema.parse(response.data);
}
