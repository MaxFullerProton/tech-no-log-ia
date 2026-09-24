"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
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
    const formElement = event.currentTarget;
    setWorking(true);
    setError("");
    setNotice("");
    const form = new FormData(event.currentTarget);
    const goal = String(form.get("goal") ?? "").trim();
    const context = String(form.get("context") ?? "").trim();
    const authorizationReference = String(form.get("authorizationReference") ?? "").trim();
    const intake = {
      stage: String(form.get("stage")), customer: String(form.get("customer")), offer: String(form.get("offer")),
      data: String(form.get("data") || "unknown"), autonomy: String(form.get("autonomy") || "unknown"), channel: String(form.get("channel") || "unknown"),
    };
    const fingerprint = JSON.stringify({ goal, context, authorizationReference, intake });
    if (!pendingCompile.current || pendingCompile.current.fingerprint !== fingerprint) {
      pendingCompile.current = { fingerprint, id: operationId("compile") };
    }
    try {
      await readJson(await fetch("/api/runtime", {
        method: "POST",
        headers: { "content-type": "application/json", "idempotency-key": pendingCompile.current.id },
        body: JSON.stringify({ action: "compile", goal, context, authorizationReference, intake }),
      }));
      pendingCompile.current = null;
      formElement.reset();
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
        <Link href="/" className="brand">{companyConfig.name} · Central de operações</Link>
        <span className="environment">PLANEJAMENTO</span>
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
            <h3>Registre uma oportunidade</h3>
            <label>{companyConfig.goalLabel}<textarea name="goal" minLength={12} maxLength={2000} required placeholder={companyConfig.goalPlaceholder} /></label>
            <label>Qual é o ponto de partida?<select name="stage" required defaultValue="new_idea"><option value="new_idea">Ideia nova</option><option value="existing_company">Empresa ou produto existente</option><option value="market_research">Pesquisa de mercado</option></select></label>
            <label>Quem deve pagar?<select name="customer" required defaultValue="unknown"><option value="unknown">Ainda não sei</option><option value="consumer">Consumidor</option><option value="professional">Profissional</option><option value="small_business">Pequena empresa</option><option value="enterprise">Empresa grande</option></select></label>
            <label>Qual primeira oferta faz sentido?<select name="offer" required defaultValue="unknown"><option value="unknown">Ainda não sei</option><option value="paid_diagnostic">Diagnóstico pago</option><option value="managed_service">Serviço operado</option><option value="subscription">Assinatura de software</option></select></label>
            <details className="intake-extra"><summary>Mais detalhes, se você já souber</summary>
              <label>Dados necessários<select name="data" defaultValue="unknown"><option value="unknown">A definir</option><option value="none">Sem dados pessoais</option><option value="contact">Contato e comercial</option><option value="financial">Financeiros</option><option value="sensitive">Sensíveis</option></select></label>
              <label>Papel da IA<select name="autonomy" defaultValue="unknown"><option value="unknown">A definir</option><option value="draft_for_review">Rascunha para aprovação</option><option value="recommend">Recomenda</option><option value="execute_with_approval">Executa com aprovação</option></select></label>
              <label>Primeiro canal de aquisição<select name="channel" defaultValue="unknown"><option value="unknown">A testar</option><option value="meeting">Reunião ou carteira</option><option value="website">Site e inbound</option><option value="outbound">Prospecção</option><option value="partner">Parceiro</option></select></label>
            </details>
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
