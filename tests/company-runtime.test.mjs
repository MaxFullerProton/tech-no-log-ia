import assert from "node:assert/strict";
import test, { after } from "node:test";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));
const mockId = "\0company-cloudflare-workers-mock";
const vite = await createServer({ appType: "custom", configFile: false, root, resolve: { alias: { "@": root } }, plugins: [{ name: "cloudflare-workers-mock", resolveId(id) { return id === "cloudflare:workers" ? mockId : null; }, load(id) { return id === mockId ? "export const env = {};" : null; } }], server: { middlewareMode: true, hmr: false } });
after(async () => { await vite.close(); });

test("compiles a deterministic executable plan without external AI cost", async () => {
  const { compileDeterministicPlan } = await vite.ssrLoadModule("/lib/company-config.ts");
  const first = compileDeterministicPlan("Create a measurable client outcome", "Start with one reversible move");
  const second = compileDeterministicPlan("Create a measurable client outcome", "Start with one reversible move");
  assert.deepEqual(first, second);
  assert.equal(first.steps.length, 5);
  assert.ok(first.successCriteria.length >= 4);
});

test("records only the consequential intake choices and identifies open decisions", async () => {
  const { compileIntakePlan } = await vite.ssrLoadModule("/lib/company-config.ts");
  const plan = compileIntakePlan("Deliver a paid company diagnostic", "Founder meeting", {
    stage: "new_idea", customer: "small_business", offer: "paid_diagnostic",
    data: "unknown", autonomy: "draft_for_review", channel: "unknown",
  });
  assert.match(plan.summary, /Decisões abertas: data, channel/);
  assert.match(plan.summary, /paid_diagnostic/);
  assert.ok(plan.guardrails.some((item) => item.includes("não aprova venda")));
});

test("fails closed when runtime is bound to another Company", async () => {
  const { readCompanyGatewayConfig } = await vite.ssrLoadModule("/lib/company-gateway.ts");
  assert.throws(() => readCompanyGatewayConfig({ COMPANY_GATEWAY_URL: "https://example.supabase.co/functions/v1/company-runtime-gateway", COMPANY_GATEWAY_SECRET: "s".repeat(48), COMPANY_GATEWAY_PROJECT_ID: "appgprj_1234567890abcdef", COMPANY_GATEWAY_COMPANY_KEY: "another_company" }), (error) => error.code === "GATEWAY_COMPANY_MISMATCH");
});
