import { z } from "zod";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { getGatewayCapabilities } from "@/lib/company-gateway";
import { advanceEngagement, createEngagement, listEngagements } from "@/lib/company-runtime";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const compileSchema = z.object({ action: z.literal("compile"), goal: z.string().trim().min(12).max(2000), context: z.string().trim().max(4000).default(""), authorizationReference: z.string().trim().min(4).max(160) });
const advanceSchema = z.object({ action: z.literal("advance"), engagementId: z.string().uuid(), expectedVersion: z.number().int().positive(), stepId: z.string().regex(/^[a-z][a-z0-9_-]{1,63}$/) });
const actionSchema = z.discriminatedUnion("action", [compileSchema, advanceSchema]);

function operationId(request: Request) {
  const value = request.headers.get("idempotency-key")?.trim() ?? "";
  return /^[A-Za-z0-9_.:-]{8,200}$/.test(value) ? value : null;
}

function errorResponse(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "RUNTIME_ERROR";
  const status = code.includes("CAS_CONFLICT") || code === "IDEMPOTENCY_CONFLICT" ? 409 : code.includes("AUTH") || code.includes("OPERATOR") ? 403 : code.includes("GATEWAY_") ? 503 : 400;
  return Response.json({ error: error instanceof Error ? error.message : "The Company runtime could not complete the request.", code }, { status });
}

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in with ChatGPT to open this private workspace." }, { status: 401 });
  const requested = new URL(request.url).searchParams.get("scope") === "operator" ? "operator" : "own";
  try {
    const capabilities = await getGatewayCapabilities(user);
    const scope = requested === "operator" && capabilities.operator ? "operator" : "own";
    return Response.json({ engagements: await listEngagements(user, scope), operator: capabilities.operator, scope });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in with ChatGPT to operate this Company." }, { status: 401 });
  const id = operationId(request);
  if (!id) return Response.json({ error: "A valid idempotency key is required." }, { status: 400 });
  const length = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(length) && length > 65_536) return Response.json({ error: "Request is too large." }, { status: 413 });
  let raw: unknown;
  try { const text = await request.text(); if (text.length > 65_536) throw new Error("too large"); raw = JSON.parse(text); }
  catch { return Response.json({ error: "Request body must be valid JSON within 64 KiB." }, { status: 400 }); }
  const parsed = actionSchema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "The Company action is invalid." }, { status: 400 });
  try {
    if (parsed.data.action === "compile") return Response.json(await createEngagement(user, id, parsed.data), { status: 201 });
    return Response.json(await advanceEngagement(user, id, parsed.data));
  } catch (error) { return errorResponse(error); }
}
