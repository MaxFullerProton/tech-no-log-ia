"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Cloud,
  Code2,
  Database,
  FileText,
  GitFork,
  LayoutTemplate,
  LockKeyhole,
  Rocket,
  ServerCog,
  Sparkles,
} from "lucide-react";

type Locale = "en" | "pt" | "es" | "fr";

type Option = { id: string; label: string; copy: string };
type Scenario = {
  name: string; badge: string; delivery: string; investment: string; monthly: string;
  subscribe: string; adapt: string; build: string; accent: string;
};
type Copy = {
  backToSite: string; eyebrow: string; title: string; intro: string; localOnly: string;
  step: string; previous: string; continue: string; prepareReport: string; startAgain: string;
  reviewQuestions: string; skip: string;
  vision: { title: string; copy: string; label: string; placeholder: string };
  scope: { title: string; copy: string; options: Option[] };
  startingPoint: { title: string; copy: string; options: Option[] };
  systems: { title: string; copy: string; label: string; placeholder: string };
  constraints: { title: string; copy: string; sensitivity: string; timeline: string; sensitivityOptions: Option[]; timelineOptions: Option[] };
  decision: { title: string; copy: string; checklist: string[] };
  blueprint: { label: string; title: string; preliminary: string; product: string; users: string; estate: string; systems: string; delivery: string; architecture: string; architectureValue: string; pending: string };
  report: { eyebrow: string; title: string; copy: string; choices: string; subscribe: string; adapt: string; build: string; delivery: string; investment: string; monthly: string; notice: string; nextTitle: string; nextCopy: string };
  scenarios: Scenario[];
};

const copy: Record<Locale, Copy> = {
  en: {
    backToSite: "Back to site", eyebrow: "AI-first solution planning", title: "Prototype Desk",
    intro: "Turn an idea into a decision-ready product and infrastructure proposal.",
    localOnly: "Prototype mode · Answers stay in this browser", step: "Step", previous: "Back",
    continue: "Continue", prepareReport: "Prepare proposal", startAgain: "Start again",
    reviewQuestions: "Review answers", skip: "Skip for now",
    vision: { title: "What must become possible?", copy: "Describe the outcome — not the tool. We will use it to frame the first product flow.", label: "Project ambition", placeholder: "Example: Give operations a workspace that resolves customer requests with AI assistance." },
    scope: { title: "Who needs the first useful experience?", copy: "The first user changes the product surface, permissions and success metrics.", options: [
      { id: "customer", label: "Customers", copy: "Self-service, conversion or support journey." },
      { id: "operator", label: "Operators", copy: "A focused workspace for decisions and execution." },
      { id: "team", label: "Internal teams", copy: "Shared workflows, knowledge and automation." },
    ] },
    startingPoint: { title: "What are we transforming?", copy: "The proposal should respect the reality already in place — or the freedom of a new product.", options: [
      { id: "new", label: "A new product", copy: "A focused AI-first proposition from zero." },
      { id: "existing", label: "An existing operation", copy: "Improve a live service, process or team workflow." },
      { id: "legacy", label: "A legacy system", copy: "Modernize a critical system without losing continuity." },
    ] },
    systems: { title: "Which systems must be part of the story?", copy: "Name tools, databases, channels or repositories. A real discovery phase will validate every connection.", label: "Known systems and constraints", placeholder: "Example: HubSpot, WhatsApp, PostgreSQL, internal knowledge base, GitHub…" },
    constraints: { title: "Set the operating guardrails.", copy: "These two signals calibrate the level of architecture, governance and delivery plan.", sensitivity: "Data and risk", timeline: "Desired delivery horizon", sensitivityOptions: [
      { id: "standard", label: "Standard", copy: "Common business data; conventional controls." },
      { id: "sensitive", label: "Sensitive / regulated", copy: "Privacy, auditability or approval needs." },
    ], timelineOptions: [
      { id: "prototype", label: "Prototype soon", copy: "Validate a critical flow in weeks." },
      { id: "planned", label: "Planned launch", copy: "Build a reliable initial operating product." },
      { id: "strategic", label: "Strategic platform", copy: "Prepare a durable foundation for scale." },
    ] },
    decision: { title: "Turn discovery into a build decision.", copy: "The desk now frames the possible routes: subscribe to what is mature, adapt what is proven, and build what creates advantage.", checklist: ["Product flow and user focus", "Existing estate and integration hypotheses", "Risk and delivery posture", "Three investment scenarios"] },
    blueprint: { label: "Living blueprint", title: "Your preliminary technical map", preliminary: "Hypothesis — validated research comes next", product: "Product outcome", users: "First users", estate: "Starting point", systems: "Systems to investigate", delivery: "Delivery posture", architecture: "Initial architecture", architectureValue: "Web workspace · secure API · data store · AI gateway · observability", pending: "Discovery pending" },
    report: { eyebrow: "Decision proposal · V0", title: "Three ways to make it real.", copy: "A transparent starting point for a technical proposal — not a disguised final quote.", choices: "Subscribe · Adapt · Build", subscribe: "Subscribe", adapt: "Adapt", build: "Build", delivery: "Indicative delivery", investment: "Indicative build investment", monthly: "Indicative monthly run cost", notice: "Planning bands are illustrative, in BRL, and exclude taxes, third-party licenses and unknown integration work. The live research stage validates vendors, cloud pricing, constraints, sources and commercial scope before any proposal is final.", nextTitle: "What makes the proposal real", nextCopy: "The next phase researches SaaS vendors, repository candidates, infrastructure options, pricing, compliance and implementation risks — with sources and assumptions attached to every recommendation." },
    scenarios: [
      { name: "Prototype", badge: "Validate the core", delivery: "4–6 weeks", investment: "R$ 25k–60k", monthly: "R$ 500–2k", subscribe: "Essential managed services", adapt: "Starter kit or proven repository", build: "One critical product flow", accent: "lime" },
      { name: "Recommended", badge: "Launch with confidence", delivery: "8–12 weeks", investment: "R$ 80k–180k", monthly: "R$ 2k–8k", subscribe: "Managed infrastructure and observability", adapt: "Mature modules and integrations", build: "Distinct workflows and operational logic", accent: "blue" },
      { name: "Scale", badge: "Operate as a platform", delivery: "4–6 months", investment: "R$ 220k–450k", monthly: "R$ 10k–30k", subscribe: "Enterprise controls where needed", adapt: "Approved platform components", build: "Proprietary core, governance and AI layer", accent: "paper" },
    ],
  },
  pt: {
    backToSite: "Voltar ao site", eyebrow: "Planejamento de solução AI-first", title: "Prototype Desk",
    intro: "Transforme uma ideia em uma proposta de produto e infraestrutura pronta para decisão.",
    localOnly: "Modo protótipo · Respostas ficam neste navegador", step: "Etapa", previous: "Voltar",
    continue: "Continuar", prepareReport: "Preparar proposta", startAgain: "Começar de novo",
    reviewQuestions: "Revisar respostas", skip: "Pular por enquanto",
    vision: { title: "O que precisa se tornar possível?", copy: "Descreva o resultado — não a ferramenta. Usaremos isso para definir o primeiro fluxo do produto.", label: "Ambição do projeto", placeholder: "Exemplo: Dar à operação um workspace que resolva pedidos de clientes com ajuda de IA." },
    scope: { title: "Quem precisa da primeira experiência útil?", copy: "O primeiro usuário define a superfície do produto, permissões e métricas de sucesso.", options: [
      { id: "customer", label: "Clientes", copy: "Jornada de autoatendimento, conversão ou suporte." },
      { id: "operator", label: "Operadores", copy: "Workspace focado em decisão e execução." },
      { id: "team", label: "Times internos", copy: "Fluxos compartilhados, conhecimento e automação." },
    ] },
    startingPoint: { title: "O que vamos transformar?", copy: "A proposta respeita a realidade que já existe — ou a liberdade de um novo produto.", options: [
      { id: "new", label: "Um produto novo", copy: "Uma proposta AI-first focada, criada do zero." },
      { id: "existing", label: "Uma operação existente", copy: "Melhorar um serviço, processo ou fluxo já em uso." },
      { id: "legacy", label: "Um sistema legado", copy: "Modernizar um sistema crítico sem perder continuidade." },
    ] },
    systems: { title: "Quais sistemas precisam fazer parte da história?", copy: "Liste ferramentas, bancos, canais ou repositórios. A descoberta real valida cada conexão.", label: "Sistemas e restrições conhecidos", placeholder: "Exemplo: HubSpot, WhatsApp, PostgreSQL, base interna, GitHub…" },
    constraints: { title: "Defina os limites de operação.", copy: "Esses sinais calibram arquitetura, governança e plano de entrega.", sensitivity: "Dados e risco", timeline: "Horizonte desejado", sensitivityOptions: [
      { id: "standard", label: "Padrão", copy: "Dados comuns de negócio; controles convencionais." },
      { id: "sensitive", label: "Sensíveis / regulados", copy: "Privacidade, auditoria ou aprovações necessárias." },
    ], timelineOptions: [
      { id: "prototype", label: "Protótipo em breve", copy: "Validar um fluxo crítico em semanas." },
      { id: "planned", label: "Lançamento planejado", copy: "Construir um produto inicial confiável." },
      { id: "strategic", label: "Plataforma estratégica", copy: "Preparar uma base durável para escala." },
    ] },
    decision: { title: "Transforme descoberta em decisão de construção.", copy: "Agora definimos as rotas: assinar o que já está maduro, adaptar o que é comprovado e construir o que gera vantagem.", checklist: ["Fluxo de produto e foco do usuário", "Hipóteses de integrações e cenário atual", "Postura de risco e entrega", "Três cenários de investimento"] },
    blueprint: { label: "Planta viva", title: "Seu mapa técnico preliminar", preliminary: "Hipótese — a pesquisa validada vem a seguir", product: "Resultado do produto", users: "Primeiros usuários", estate: "Ponto de partida", systems: "Sistemas a investigar", delivery: "Postura de entrega", architecture: "Arquitetura inicial", architectureValue: "Workspace web · API segura · dados · gateway de IA · observabilidade", pending: "Descoberta pendente" },
    report: { eyebrow: "Proposta de decisão · V0", title: "Três formas de tornar isso real.", copy: "Um ponto de partida transparente para proposta técnica — não um orçamento final disfarçado.", choices: "Assinar · Adaptar · Construir", subscribe: "Assinar", adapt: "Adaptar", build: "Construir", delivery: "Entrega indicativa", investment: "Investimento indicativo de construção", monthly: "Custo mensal indicativo", notice: "As faixas são ilustrativas, em BRL, e não incluem impostos, licenças de terceiros ou integrações desconhecidas. A pesquisa ao vivo valida fornecedores, preços de cloud, restrições, fontes e escopo comercial antes de qualquer proposta final.", nextTitle: "O que torna a proposta real", nextCopy: "A próxima etapa pesquisa SaaS, candidatos de repositórios, infraestrutura, preços, compliance e riscos de implementação — com fontes e premissas anexadas a cada recomendação." },
    scenarios: [
      { name: "Protótipo", badge: "Validar o essencial", delivery: "4–6 semanas", investment: "R$ 25k–60k", monthly: "R$ 500–2k", subscribe: "Serviços gerenciados essenciais", adapt: "Starter kit ou repositório comprovado", build: "Um fluxo crítico do produto", accent: "lime" },
      { name: "Recomendado", badge: "Lançar com confiança", delivery: "8–12 semanas", investment: "R$ 80k–180k", monthly: "R$ 2k–8k", subscribe: "Infraestrutura gerenciada e observabilidade", adapt: "Módulos e integrações maduros", build: "Fluxos distintos e lógica operacional", accent: "blue" },
      { name: "Escala", badge: "Operar como plataforma", delivery: "4–6 meses", investment: "R$ 220k–450k", monthly: "R$ 10k–30k", subscribe: "Controles enterprise quando necessário", adapt: "Componentes aprovados de plataforma", build: "Núcleo proprietário, governança e IA", accent: "paper" },
    ],
  },
  es: {
    backToSite: "Volver al sitio", eyebrow: "Planificación de soluciones AI-first", title: "Prototype Desk",
    intro: "Convierte una idea en una propuesta de producto e infraestructura lista para decidir.",
    localOnly: "Modo prototipo · Las respuestas permanecen en este navegador", step: "Paso", previous: "Atrás",
    continue: "Continuar", prepareReport: "Preparar propuesta", startAgain: "Empezar de nuevo",
    reviewQuestions: "Revisar respuestas", skip: "Omitir por ahora",
    vision: { title: "¿Qué debe volverse posible?", copy: "Describe el resultado — no la herramienta. Lo usaremos para definir el primer flujo de producto.", label: "Ambición del proyecto", placeholder: "Ejemplo: Dar a operaciones un espacio que resuelva solicitudes de clientes con IA." },
    scope: { title: "¿Quién necesita la primera experiencia útil?", copy: "El primer usuario cambia la superficie del producto, los permisos y las métricas de éxito.", options: [
      { id: "customer", label: "Clientes", copy: "Autoservicio, conversión o recorrido de soporte." },
      { id: "operator", label: "Operadores", copy: "Un espacio enfocado en decisiones y ejecución." },
      { id: "team", label: "Equipos internos", copy: "Flujos compartidos, conocimiento y automatización." },
    ] },
    startingPoint: { title: "¿Qué estamos transformando?", copy: "La propuesta respeta la realidad existente — o la libertad de un producto nuevo.", options: [
      { id: "new", label: "Un producto nuevo", copy: "Una propuesta AI-first enfocada desde cero." },
      { id: "existing", label: "Una operación existente", copy: "Mejorar un servicio, proceso o flujo activo." },
      { id: "legacy", label: "Un sistema heredado", copy: "Modernizar un sistema crítico sin perder continuidad." },
    ] },
    systems: { title: "¿Qué sistemas deben ser parte de la historia?", copy: "Nombra herramientas, bases de datos, canales o repositorios. La investigación real valida cada conexión.", label: "Sistemas y restricciones conocidos", placeholder: "Ejemplo: HubSpot, WhatsApp, PostgreSQL, base interna, GitHub…" },
    constraints: { title: "Define los límites operativos.", copy: "Estas señales calibran arquitectura, gobierno y plan de entrega.", sensitivity: "Datos y riesgo", timeline: "Horizonte de entrega", sensitivityOptions: [
      { id: "standard", label: "Estándar", copy: "Datos comerciales comunes; controles convencionales." },
      { id: "sensitive", label: "Sensibles / regulados", copy: "Privacidad, auditoría o aprobaciones necesarias." },
    ], timelineOptions: [
      { id: "prototype", label: "Prototipo pronto", copy: "Validar un flujo crítico en semanas." },
      { id: "planned", label: "Lanzamiento planificado", copy: "Construir un producto inicial confiable." },
      { id: "strategic", label: "Plataforma estratégica", copy: "Preparar una base duradera para escalar." },
    ] },
    decision: { title: "Convierte el descubrimiento en una decisión de construcción.", copy: "Ahora se enmarcan las rutas: suscribir lo maduro, adaptar lo probado y construir lo que crea ventaja.", checklist: ["Flujo de producto y foco de usuario", "Hipótesis de sistemas e integración", "Postura de riesgo y entrega", "Tres escenarios de inversión"] },
    blueprint: { label: "Plano vivo", title: "Tu mapa técnico preliminar", preliminary: "Hipótesis — la investigación validada viene después", product: "Resultado del producto", users: "Primeros usuarios", estate: "Punto de partida", systems: "Sistemas por investigar", delivery: "Postura de entrega", architecture: "Arquitectura inicial", architectureValue: "Espacio web · API segura · datos · gateway de IA · observabilidad", pending: "Descubrimiento pendiente" },
    report: { eyebrow: "Propuesta de decisión · V0", title: "Tres formas de hacerlo real.", copy: "Un punto de partida transparente para una propuesta técnica — no una cotización final disfrazada.", choices: "Suscribir · Adaptar · Construir", subscribe: "Suscribir", adapt: "Adaptar", build: "Construir", delivery: "Entrega indicativa", investment: "Inversión indicativa de construcción", monthly: "Costo mensual indicativo", notice: "Los rangos son ilustrativos, en BRL, y excluyen impuestos, licencias de terceros e integraciones desconocidas. La investigación en vivo valida proveedores, precios de nube, restricciones, fuentes y alcance comercial antes de cualquier propuesta final.", nextTitle: "Qué hace real la propuesta", nextCopy: "La siguiente fase investiga SaaS, candidatos de repositorios, infraestructura, precios, cumplimiento y riesgos de implementación — con fuentes y supuestos adjuntos a cada recomendación." },
    scenarios: [
      { name: "Prototipo", badge: "Validar el núcleo", delivery: "4–6 semanas", investment: "R$ 25k–60k", monthly: "R$ 500–2k", subscribe: "Servicios gestionados esenciales", adapt: "Starter kit o repositorio probado", build: "Un flujo crítico de producto", accent: "lime" },
      { name: "Recomendado", badge: "Lanzar con confianza", delivery: "8–12 semanas", investment: "R$ 80k–180k", monthly: "R$ 2k–8k", subscribe: "Infraestructura gestionada y observabilidad", adapt: "Módulos e integraciones maduros", build: "Flujos distintivos y lógica operativa", accent: "blue" },
      { name: "Escala", badge: "Operar como plataforma", delivery: "4–6 meses", investment: "R$ 220k–450k", monthly: "R$ 10k–30k", subscribe: "Controles empresariales cuando se necesiten", adapt: "Componentes de plataforma aprobados", build: "Núcleo propio, gobierno y capa de IA", accent: "paper" },
    ],
  },
  fr: {
    backToSite: "Retour au site", eyebrow: "Planification de solution AI-first", title: "Prototype Desk",
    intro: "Transformez une idée en proposition produit et infrastructure prête à décider.",
    localOnly: "Mode prototype · Les réponses restent dans ce navigateur", step: "Étape", previous: "Retour",
    continue: "Continuer", prepareReport: "Préparer la proposition", startAgain: "Recommencer",
    reviewQuestions: "Revoir les réponses", skip: "Passer pour l’instant",
    vision: { title: "Qu’est-ce qui doit devenir possible ?", copy: "Décrivez le résultat — pas l’outil. Nous l’utiliserons pour cadrer le premier flux produit.", label: "Ambition du projet", placeholder: "Exemple : Donner aux opérations un espace qui résout les demandes clients avec l’aide de l’IA." },
    scope: { title: "Qui a besoin de la première expérience utile ?", copy: "Le premier utilisateur change la surface produit, les autorisations et les métriques de succès.", options: [
      { id: "customer", label: "Clients", copy: "Libre-service, conversion ou parcours de support." },
      { id: "operator", label: "Opérateurs", copy: "Un espace ciblé pour décider et exécuter." },
      { id: "team", label: "Équipes internes", copy: "Flux partagés, connaissances et automatisation." },
    ] },
    startingPoint: { title: "Que transformons-nous ?", copy: "La proposition respecte la réalité existante — ou la liberté d’un nouveau produit.", options: [
      { id: "new", label: "Un nouveau produit", copy: "Une proposition AI-first ciblée, créée de zéro." },
      { id: "existing", label: "Une opération existante", copy: "Améliorer un service, processus ou flux déjà actif." },
      { id: "legacy", label: "Un système existant", copy: "Moderniser un système critique sans perdre la continuité." },
    ] },
    systems: { title: "Quels systèmes doivent faire partie de l’histoire ?", copy: "Nommez outils, bases de données, canaux ou dépôts. La découverte réelle validera chaque connexion.", label: "Systèmes et contraintes connus", placeholder: "Exemple : HubSpot, WhatsApp, PostgreSQL, base interne, GitHub…" },
    constraints: { title: "Fixez les garde-fous opérationnels.", copy: "Ces signaux calibrent le niveau d’architecture, de gouvernance et le plan de livraison.", sensitivity: "Données et risque", timeline: "Horizon de livraison", sensitivityOptions: [
      { id: "standard", label: "Standard", copy: "Données métier courantes ; contrôles conventionnels." },
      { id: "sensitive", label: "Sensibles / réglementées", copy: "Besoins de confidentialité, d’audit ou d’approbation." },
    ], timelineOptions: [
      { id: "prototype", label: "Prototype bientôt", copy: "Valider un flux critique en quelques semaines." },
      { id: "planned", label: "Lancement planifié", copy: "Construire un produit initial fiable." },
      { id: "strategic", label: "Plateforme stratégique", copy: "Préparer une base durable pour l’échelle." },
    ] },
    decision: { title: "Transformez la découverte en décision de construction.", copy: "Le desk cadre les routes : s’abonner à ce qui est mûr, adapter ce qui est éprouvé et construire ce qui crée l’avantage.", checklist: ["Flux produit et utilisateur cible", "Hypothèses d’intégration et d’existant", "Posture de risque et de livraison", "Trois scénarios d’investissement"] },
    blueprint: { label: "Plan vivant", title: "Votre carte technique préliminaire", preliminary: "Hypothèse — la recherche validée vient ensuite", product: "Résultat produit", users: "Premiers utilisateurs", estate: "Point de départ", systems: "Systèmes à étudier", delivery: "Posture de livraison", architecture: "Architecture initiale", architectureValue: "Espace web · API sécurisée · données · passerelle IA · observabilité", pending: "Découverte en attente" },
    report: { eyebrow: "Proposition de décision · V0", title: "Trois façons de la rendre réelle.", copy: "Un point de départ transparent pour une proposition technique — pas un devis final déguisé.", choices: "S’abonner · Adapter · Construire", subscribe: "S’abonner", adapt: "Adapter", build: "Construire", delivery: "Livraison indicative", investment: "Investissement de construction indicatif", monthly: "Coût mensuel indicatif", notice: "Les fourchettes sont illustratives, en BRL, et excluent taxes, licences tierces et intégrations inconnues. La recherche en direct valide fournisseurs, prix cloud, contraintes, sources et périmètre commercial avant toute proposition finale.", nextTitle: "Ce qui rend la proposition réelle", nextCopy: "La phase suivante étudie SaaS, dépôts candidats, infrastructure, tarifs, conformité et risques d’implémentation — avec les sources et hypothèses attachées à chaque recommandation." },
    scenarios: [
      { name: "Prototype", badge: "Valider le cœur", delivery: "4–6 semaines", investment: "R$ 25k–60k", monthly: "R$ 500–2k", subscribe: "Services gérés essentiels", adapt: "Starter kit ou dépôt éprouvé", build: "Un flux produit critique", accent: "lime" },
      { name: "Recommandé", badge: "Lancer avec confiance", delivery: "8–12 semaines", investment: "R$ 80k–180k", monthly: "R$ 2k–8k", subscribe: "Infrastructure gérée et observabilité", adapt: "Modules et intégrations matures", build: "Flux distinctifs et logique opérationnelle", accent: "blue" },
      { name: "Échelle", badge: "Opérer comme une plateforme", delivery: "4–6 mois", investment: "R$ 220k–450k", monthly: "R$ 10k–30k", subscribe: "Contrôles entreprise lorsque nécessaire", adapt: "Composants de plateforme approuvés", build: "Cœur propriétaire, gouvernance et couche IA", accent: "paper" },
    ],
  },
};

const stageIcons = [Sparkles, LayoutTemplate, GitFork, Database, LockKeyhole, FileText];

export default function PrototypeDesk() {
  const [locale, setLocale] = useState<Locale>("en");
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState({ vision: "", scope: "", startingPoint: "", systems: "", sensitivity: "", timeline: "" });
  const c = copy[locale];
  const stageNames = useMemo(() => [c.vision.title, c.scope.title, c.startingPoint.title, c.systems.title, c.constraints.title, c.decision.title], [c]);
  const selectedScope = c.scope.options.find((option) => option.id === answers.scope)?.label;
  const selectedStartingPoint = c.startingPoint.options.find((option) => option.id === answers.startingPoint)?.label;
  const selectedTimeline = c.constraints.timelineOptions.find((option) => option.id === answers.timeline)?.label;
  const canContinue = step === 0 ? answers.vision.trim().length >= 5 : step === 1 ? Boolean(answers.scope) : step === 2 ? Boolean(answers.startingPoint) : step === 4 ? Boolean(answers.sensitivity && answers.timeline) : true;

  function advance() {
    if (step === stageNames.length - 1) setFinished(true);
    else setStep((current) => current + 1);
  }

  function reset() {
    setStep(0);
    setFinished(false);
    setAnswers({ vision: "", scope: "", startingPoint: "", systems: "", sensitivity: "", timeline: "" });
  }

  return (
    <main className="prototype-desk">
      <header className="prototype-nav">
        <Link href="/" className="prototype-back"><ArrowLeft size={15} /> {c.backToSite}</Link>
        <div className="prototype-brand"><span>TECH.NO</span><b>LOG.IA</b><i>®</i></div>
        <div className="prototype-languages" aria-label="Language">
          {(["en", "pt", "es", "fr"] as Locale[]).map((language) => <button key={language} type="button" onClick={() => setLocale(language)} className={locale === language ? "active" : ""}>{language}</button>)}
        </div>
      </header>

      {!finished ? (
        <section className="prototype-shell">
          <aside className="prototype-film" aria-label="Discovery stages">
            <div className="prototype-film-top"><span>{c.eyebrow}</span><strong>{c.title}</strong><p>{c.intro}</p></div>
            <ol>
              {stageNames.map((name, index) => {
                const Icon = stageIcons[index];
                return <li key={name} className={index === step ? "active" : index < step ? "complete" : ""}><span>{String(index + 1).padStart(2, "0")}</span><Icon size={15} /><em>{name}</em></li>;
              })}
            </ol>
            <p className="local-note"><LockKeyhole size={14} /> {c.localOnly}</p>
          </aside>

          <section className="prototype-stage">
            <div className="prototype-step-count"><span>{c.step} {String(step + 1).padStart(2, "0")}</span><span>{String(stageNames.length).padStart(2, "0")}</span></div>
            {step === 0 && <Question title={c.vision.title} copy={c.vision.copy}><label className="prototype-field"><span>{c.vision.label}</span><textarea autoFocus value={answers.vision} onChange={(event) => setAnswers({ ...answers, vision: event.target.value })} placeholder={c.vision.placeholder} rows={5} /></label></Question>}
            {step === 1 && <Question title={c.scope.title} copy={c.scope.copy}><OptionList options={c.scope.options} value={answers.scope} onChange={(scope) => setAnswers({ ...answers, scope })} /></Question>}
            {step === 2 && <Question title={c.startingPoint.title} copy={c.startingPoint.copy}><OptionList options={c.startingPoint.options} value={answers.startingPoint} onChange={(startingPoint) => setAnswers({ ...answers, startingPoint })} /></Question>}
            {step === 3 && <Question title={c.systems.title} copy={c.systems.copy}><label className="prototype-field"><span>{c.systems.label}</span><textarea autoFocus value={answers.systems} onChange={(event) => setAnswers({ ...answers, systems: event.target.value })} placeholder={c.systems.placeholder} rows={5} /></label></Question>}
            {step === 4 && <Question title={c.constraints.title} copy={c.constraints.copy}>
              <div className="constraint-group"><span>{c.constraints.sensitivity}</span><OptionList compact options={c.constraints.sensitivityOptions} value={answers.sensitivity} onChange={(sensitivity) => setAnswers({ ...answers, sensitivity })} /></div>
              <div className="constraint-group"><span>{c.constraints.timeline}</span><OptionList compact options={c.constraints.timelineOptions} value={answers.timeline} onChange={(timeline) => setAnswers({ ...answers, timeline })} /></div>
            </Question>}
            {step === 5 && <Question title={c.decision.title} copy={c.decision.copy}><ul className="decision-checklist">{c.decision.checklist.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul></Question>}
            <div className="prototype-actions">
              <button type="button" className="ghost-button" disabled={step === 0} onClick={() => setStep((current) => Math.max(0, current - 1))}><ArrowLeft size={16} />{c.previous}</button>
              {step === 3 && !answers.systems && <button type="button" className="text-button" onClick={advance}>{c.skip}</button>}
              <button type="button" className="primary-button" disabled={!canContinue} onClick={advance}>{step === stageNames.length - 1 ? c.prepareReport : c.continue}<ArrowRight size={16} /></button>
            </div>
          </section>

          <aside className="prototype-blueprint">
            <div className="blueprint-head"><span>{c.blueprint.label}</span><span className="blueprint-status">{c.blueprint.preliminary}</span></div>
            <h2>{c.blueprint.title}</h2>
            <div className="blueprint-grid">
              <BlueprintRow icon={<Sparkles size={15} />} label={c.blueprint.product} value={answers.vision || c.blueprint.pending} />
              <BlueprintRow icon={<LayoutTemplate size={15} />} label={c.blueprint.users} value={selectedScope || c.blueprint.pending} />
              <BlueprintRow icon={<GitFork size={15} />} label={c.blueprint.estate} value={selectedStartingPoint || c.blueprint.pending} />
              <BlueprintRow icon={<Database size={15} />} label={c.blueprint.systems} value={answers.systems || c.blueprint.pending} />
              <BlueprintRow icon={<Rocket size={15} />} label={c.blueprint.delivery} value={selectedTimeline || c.blueprint.pending} />
              <BlueprintRow icon={<ServerCog size={15} />} label={c.blueprint.architecture} value={c.blueprint.architectureValue} />
            </div>
          </aside>
        </section>
      ) : (
        <section className="prototype-report">
          <div className="report-hero"><span>{c.report.eyebrow}</span><h1>{c.report.title}</h1><p>{c.report.copy}</p><div className="report-project"><Sparkles size={16} /><strong>{answers.vision || c.blueprint.pending}</strong><small>{c.report.choices}</small></div></div>
          <div className="proposal-grid">
            {c.scenarios.map((scenario) => <article key={scenario.name} className={`proposal-card ${scenario.accent}`}>
              <div><span>{scenario.badge}</span><h2>{scenario.name}</h2></div>
              <dl><div><dt>{c.report.delivery}</dt><dd>{scenario.delivery}</dd></div><div><dt>{c.report.investment}</dt><dd>{scenario.investment}</dd></div><div><dt>{c.report.monthly}</dt><dd>{scenario.monthly}</dd></div></dl>
              <ul><li><Cloud size={15} /><span><b>{c.report.subscribe}</b>{scenario.subscribe}</span></li><li><GitFork size={15} /><span><b>{c.report.adapt}</b>{scenario.adapt}</span></li><li><Code2 size={15} /><span><b>{c.report.build}</b>{scenario.build}</span></li></ul>
            </article>)}
          </div>
          <p className="report-notice"><LockKeyhole size={16} />{c.report.notice}</p>
          <section className="report-next"><FileText size={22} /><div><h2>{c.report.nextTitle}</h2><p>{c.report.nextCopy}</p></div></section>
          <div className="report-actions"><button type="button" className="ghost-button" onClick={() => setFinished(false)}><ArrowLeft size={16} />{c.reviewQuestions}</button><button type="button" className="primary-button" onClick={reset}>{c.startAgain}<ArrowRight size={16} /></button></div>
        </section>
      )}
    </main>
  );
}

function Question({ title, copy: description, children }: { title: string; copy: string; children: React.ReactNode }) {
  return <div className="prototype-question"><p>{description}</p><h1>{title}</h1><div className="question-content">{children}</div></div>;
}

function OptionList({ options, value, onChange, compact = false }: { options: Option[]; value: string; onChange: (value: string) => void; compact?: boolean }) {
  return <div className={compact ? "option-list compact" : "option-list"}>{options.map((option) => <button type="button" key={option.id} onClick={() => onChange(option.id)} className={value === option.id ? "selected" : ""}><span><b>{option.label}</b><small>{option.copy}</small></span>{value === option.id && <Check size={17} />}</button>)}</div>;
}

function BlueprintRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="blueprint-row"><span className="blueprint-icon">{icon}</span><div><small>{label}</small><p>{value}</p></div></div>;
}
