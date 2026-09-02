"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { companyConfig } from "@/lib/company-config";

type Plan = {
  summary: string;
  outcome: string;
  deliverables: string[];
  steps: Array<{ id: string; title: string; action: string }>;
  successCriteria: string[];
  guardrails: string[];
};

type Engagement = {
  id: string;
  status: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  goal: string;
  context: string;
  plan: Plan;
  completedStepIds: string[];
};

type RuntimeResponse = {
  engagements: Engagement[];
  operator: boolean;
  scope: "own" | "operator";
};

function operationId(prefix: string) {
  return `${prefix}:${crypto.randomUUID()}`;
}

async function readJson(response: Response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(typeof payload.error === "string" ? payload.error : "The request could not be completed.");
  }
  return payload;
}

export default function Home() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [operator, setOperator] = useState(false);
  const [scope, setScope] = useState<"own" | "operator">("own");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const pendingCompile = useRef<{ fingerprint: string; id: string } | null>(null);

  const load = useCallback(async (nextScope: "own" | "operator" = scope) => {
    setLoading(true);
    setError("");
    try {
      const data = (await readJson(await fetch(`/api/runtime?scope=${nextScope}`, { cache: "no-store" }))) as RuntimeResponse;
      setEngagements(data.engagements);
      setOperator(data.operator);
      setScope(data.scope);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to load the workspace.");
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    const task = window.setTimeout(() => { void load("own"); }, 0);
    return () => window.clearTimeout(task);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function compile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setWorking(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const goal = String(form.get("goal") ?? "").trim();
    const context = String(form.get("context") ?? "").trim();
    const authorizationReference = String(form.get("authorizationReference") ?? "").trim();
    const fingerprint = JSON.stringify({ goal, context, authorizationReference });
    if (!pendingCompile.current || pendingCompile.current.fingerprint !== fingerprint) {
      pendingCompile.current = { fingerprint, id: operationId("compile") };
    }
    try {
      await readJson(await fetch("/api/runtime", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": pendingCompile.current.id },
        body: JSON.stringify({ action: "compile", goal, context, authorizationReference }),
      }));
      pendingCompile.current = null;
      event.currentTarget.reset();
      setNotice("Your operating plan was created and recorded.");
      await load(scope);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to create the plan.");
    } finally {
      setWorking(false);
    }
  }

  async function completeStep(engagement: Engagement, stepId: string) {
    setWorking(true);
    setError("");
    setNotice("");
    try {
      await readJson(await fetch("/api/runtime", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": `advance:${engagement.id}:${engagement.version}:${stepId}`,
        },
        body: JSON.stringify({ action: "advance", engagementId: engagement.id, expectedVersion: engagement.version, stepId }),
      }));
      setNotice("Progress and evidence trail updated.");
      await load(scope);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update progress.");
      await load(scope);
    } finally {
      setWorking(false);
    }
  }

  const activeCount = useMemo(() => engagements.filter((item) => item.status !== "completed").length, [engagements]);

  return (
    <main>
      <header className="nav">
        <a href="#top" className="brand">{companyConfig.name}</a>
        <span className="environment">CONNECTED NOW_TEST</span>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">{companyConfig.category}</p>
        <h1>{companyConfig.promise}</h1>
        <p className="lede">{companyConfig.description}</p>
        <div className="proof-row">
          <span>Private workspace</span><span>Company-isolated data</span><span>Audited actions</span><span>No checkout</span>
        </div>
      </section>

      <section className="workspace" aria-label={`${companyConfig.name} client workspace`}>
        <div className="workspace-head">
          <div><p className="eyebrow">CLIENT RUNTIME</p><h2>Turn intent into an executable path.</h2></div>
          <div className="metrics"><strong>{activeCount}</strong><span>active plans</span></div>
        </div>

        {operator && <div className="scope-switch" role="group" aria-label="Workspace scope">
          <button className={scope === "own" ? "active" : ""} onClick={() => void load("own")}>My records</button>
          <button className={scope === "operator" ? "active" : ""} onClick={() => void load("operator")}>Operator queue</button>
        </div>}

        {error && <p className="alert error">{error}</p>}
        {notice && <p className="alert success">{notice}</p>}

        <div className="workspace-grid">
          <form className="intake" onSubmit={compile}>
            <h3>Start a {companyConfig.engagementLabel}</h3>
            <label>{companyConfig.goalLabel}<textarea name="goal" minLength={12} maxLength={2000} required placeholder={companyConfig.goalPlaceholder} /></label>
            <label>Useful context <textarea name="context" maxLength={4000} placeholder="Constraints, current state and what has already been tried." /></label>
            <label>Authorization reference <input name="authorizationReference" minLength={4} maxLength={160} required placeholder="Consent, mandate or engagement reference" /></label>
            <p className="guardrail">{companyConfig.inputGuardrail}</p>
            <button disabled={working}>{working ? "Recording…" : `Create ${companyConfig.deliverableLabel}`}</button>
          </form>

          <div className="records" aria-live="polite">
            {loading ? <p className="empty">Loading your private workspace…</p> : engagements.length === 0 ? <p className="empty">No plans yet. Create the first one from a real intent.</p> : engagements.map((engagement) => (
              <article className="record" key={engagement.id}>
                <div className="record-head"><span>{engagement.status}</span><small>v{engagement.version} · {engagement.id.slice(0, 8)}</small></div>
                <h3>{engagement.plan.outcome}</h3>
                <p>{engagement.plan.summary}</p>
                <div className="deliverables"><strong>{companyConfig.deliverableLabel}</strong>{engagement.plan.deliverables.map((item) => <span key={item}>{item}</span>)}</div>
                <ol className="steps">{engagement.plan.steps.map((step) => {
                  const done = engagement.completedStepIds.includes(step.id);
                  return <li key={step.id} className={done ? "done" : ""}><div><strong>{step.title}</strong><p>{step.action}</p></div><button disabled={done || working || scope === "operator"} onClick={() => void completeStep(engagement, step.id)}>{done ? "Completed" : "Record complete"}</button></li>;
                })}</ol>
                <div className="criteria"><strong>Success criteria</strong>{engagement.plan.successCriteria.map((item) => <span key={item}>{item}</span>)}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="principles">
        {companyConfig.principles.map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></article>)}
      </section>

      <footer><strong>{companyConfig.name}</strong><span>{companyConfig.footer}</span></footer>
    </main>
  );
}
