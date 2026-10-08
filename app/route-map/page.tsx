"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Clipboard,
  Code2,
  FolderGit2,
  Gauge,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";

type Locale = "en" | "pt" | "es" | "fr";
type ModeKey = "repositories" | "custom" | "tools";

type RouteCopy = {
  title: string;
  description: string;
  driver: string;
  bestFor: string;
  tradeoff: string;
  firstTest: string;
};

type Dictionary = {
  language: string;
  back: string;
  kicker: string;
  title: string;
  lead: string;
  promise: string;
  intakeKicker: string;
  intakeTitle: string;
  intakeLead: string;
  projectName: string;
  projectPlaceholder: string;
  brief: string;
  briefPlaceholder: string;
  startingPoint: string;
  startingChoices: Array<[string, string]>;
  mapRoutes: string;
  privacy: string;
  resultsKicker: string;
  resultsTitle: string;
  resultsLead: string;
  findings: string;
  signal: string;
  boundary: string;
  validation: string;
  recommended: string;
  score: string;
  choose: string;
  selected: string;
  driver: string;
  bestFor: string;
  tradeoff: string;
  firstTest: string;
  decisionKicker: string;
  decisionTitle: string;
  decisionBody: string;
  copyBrief: string;
  copied: string;
  copyFallback: string;
  analysisNote: string;
  defaultSignal: string;
  defaultBoundary: string;
  defaultValidation: string;
  modes: Record<ModeKey, RouteCopy>;
};

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    language: "Language",
    back: "Back to Tech.No.LOG.IA",
    kicker: "SKILL 01 / AI FIRST ROUTE MAP",
    title: "Create the project. Compare the ways to make it real.",
    lead: "A project is not a technology choice yet. It is a delivery decision: what deserves custom code, what can stand on proven repositories, and what should be composed from tools that already work.",
    promise: "One brief. Three viable routes. A decision you can explain.",
    intakeKicker: "START WITH THE OUTCOME",
    intakeTitle: "What do you want to create?",
    intakeLead: "Describe the job, the user, and the change the system should produce. The route map compares the three build strategies before the team commits to one.",
    projectName: "Project name",
    projectPlaceholder: "e.g. AI concierge for customer success",
    brief: "Project brief",
    briefPlaceholder: "What should this project do, for whom, and what is already in place? Include data, integrations, speed, or compliance constraints if they matter.",
    startingPoint: "Starting point",
    startingChoices: [["new", "New product"], ["existing", "Existing operation"], ["legacy", "System to transform"]],
    mapRoutes: "Map the three routes",
    privacy: "This first scan runs in the browser. Nothing in this brief is sent from this page.",
    resultsKicker: "FIRST ROUTE SCAN",
    resultsTitle: "Three ways to make it real.",
    resultsLead: "Each route is viable. The score shows fit with this brief—not a promise, a live marketplace search, or a substitute for technical diligence.",
    findings: "What the first scan surfaced",
    signal: "System signal",
    boundary: "Decision boundary",
    validation: "First validation",
    recommended: "Recommended starting route",
    score: "Fit score",
    choose: "Choose this route",
    selected: "Selected route",
    driver: "Why it fits",
    bestFor: "Best when",
    tradeoff: "Trade-off to manage",
    firstTest: "First test",
    decisionKicker: "PROJECT DECISION CARD",
    decisionTitle: "Turn the choice into an implementable brief.",
    decisionBody: "A good recommendation names the route, the constraint it protects, and the smallest proof needed before investing further.",
    copyBrief: "Copy implementation brief",
    copied: "Brief copied",
    copyFallback: "Select and copy the brief from this page.",
    analysisNote: "Next, Tech.No.LOG.IA validates specific repositories, vendors, licenses, security, integration effort, and the total cost of ownership for the chosen route.",
    defaultSignal: "A clear first workflow is still the strongest starting point.",
    defaultBoundary: "Keep the first release reversible and measurable.",
    defaultValidation: "Prototype one real user path before scaling the system.",
    modes: {
      repositories: { title: "Start from proven repositories", description: "Use mature open-source building blocks and adapt the last mile to the business.", driver: "Accelerates common product patterns without surrendering control of the core.", bestFor: "The product has a recognizable pattern: portal, dashboard, marketplace, CRM, workflow, or agent shell.", tradeoff: "Repository maturity, licensing, maintenance, and integration quality still need validation.", firstTest: "Shortlist 3 maintained repositories and run the critical path locally." },
      custom: { title: "Build the system from scratch", description: "Design the architecture and interaction model around the company’s unique advantage.", driver: "Protects differentiated workflows, sensitive data boundaries, and unusual integrations.", bestFor: "The core logic, experience, or compliance model is truly proprietary.", tradeoff: "More discovery and engineering time are needed before the first production release.", firstTest: "Prototype the riskiest user decision and data boundary with a thin vertical slice." },
      tools: { title: "Compose existing tools", description: "Connect best-in-class products, APIs, and automations into one AI-first operating flow.", driver: "Reaches a useful workflow quickly when the work is already served well by the market.", bestFor: "The value is orchestration, adoption, and speed—not inventing a new technical primitive.", tradeoff: "Vendor lock-in, pricing, data movement, and experience gaps must remain visible.", firstTest: "Run the workflow with real inputs across two candidate tool stacks." },
    },
  },
  pt: {
    language: "Idioma",
    back: "Voltar para Tech.No.LOG.IA",
    kicker: "SKILL 01 / AI FIRST ROUTE MAP",
    title: "Crie o projeto. Compare os caminhos para torná-lo real.",
    lead: "Um projeto ainda não é uma escolha de tecnologia. É uma decisão de entrega: o que merece código sob medida, o que pode nascer de repositórios consolidados e o que deve ser composto com ferramentas que já funcionam.",
    promise: "Um brief. Três rotas viáveis. Uma decisão que você consegue explicar.",
    intakeKicker: "COMECE PELO RESULTADO",
    intakeTitle: "O que você quer criar?",
    intakeLead: "Descreva o trabalho, o usuário e a mudança que o sistema deve gerar. O Route Map compara as três estratégias antes de a equipe se comprometer com uma delas.",
    projectName: "Nome do projeto",
    projectPlaceholder: "Ex.: concierge de IA para customer success",
    brief: "Brief do projeto",
    briefPlaceholder: "O que este projeto deve fazer, para quem, e o que já existe? Inclua dados, integrações, velocidade ou restrições de compliance se forem relevantes.",
    startingPoint: "Ponto de partida",
    startingChoices: [["new", "Produto novo"], ["existing", "Operação existente"], ["legacy", "Sistema para transformar"]],
    mapRoutes: "Mapear as três rotas",
    privacy: "Essa primeira leitura acontece no navegador. Nenhum dado deste brief é enviado por esta página.",
    resultsKicker: "PRIMEIRA LEITURA DE ROTAS",
    resultsTitle: "Três formas de tornar isso real.",
    resultsLead: "Todas as rotas são possíveis. A pontuação mostra aderência ao brief — não é promessa, busca ao vivo no mercado ou substituto de diligência técnica.",
    findings: "O que a primeira leitura mostrou",
    signal: "Sinal do sistema",
    boundary: "Limite da decisão",
    validation: "Primeira validação",
    recommended: "Rota inicial recomendada",
    score: "Aderência",
    choose: "Escolher esta rota",
    selected: "Rota selecionada",
    driver: "Por que faz sentido",
    bestFor: "Melhor quando",
    tradeoff: "Trade-off para gerir",
    firstTest: "Primeiro teste",
    decisionKicker: "CARTÃO DE DECISÃO DO PROJETO",
    decisionTitle: "Transforme a escolha em um brief implementável.",
    decisionBody: "Uma boa recomendação nomeia a rota, a restrição que ela protege e a menor prova necessária antes de investir mais.",
    copyBrief: "Copiar brief de implementação",
    copied: "Brief copiado",
    copyFallback: "Selecione e copie o brief nesta página.",
    analysisNote: "Depois, a Tech.No.LOG.IA valida repositórios, fornecedores, licenças, segurança, esforço de integração e custo total de propriedade para a rota escolhida.",
    defaultSignal: "Um primeiro fluxo claro ainda é o ponto de partida mais forte.",
    defaultBoundary: "Mantenha o primeiro lançamento reversível e mensurável.",
    defaultValidation: "Prototipe uma jornada real de usuário antes de escalar o sistema.",
    modes: {
      repositories: { title: "Começar por repositórios consolidados", description: "Use blocos open source maduros e adapte a última milha ao negócio.", driver: "Acelera padrões de produto comuns sem entregar o controle do núcleo.", bestFor: "O produto tem um padrão reconhecível: portal, dashboard, marketplace, CRM, workflow ou interface de agente.", tradeoff: "Maturidade, licença, manutenção e qualidade de integração do repositório ainda precisam ser validadas.", firstTest: "Selecione 3 repositórios mantidos e execute o caminho crítico localmente." },
      custom: { title: "Construir o sistema do zero", description: "Desenhe a arquitetura e o modelo de interação em torno da vantagem única da empresa.", driver: "Protege fluxos diferenciados, limites de dados sensíveis e integrações fora do padrão.", bestFor: "A lógica central, a experiência ou a regra de compliance são realmente proprietárias.", tradeoff: "Exige mais descoberta e tempo de engenharia antes do primeiro release em produção.", firstTest: "Prototipe a decisão de usuário e o limite de dados mais arriscados em uma fatia vertical." },
      tools: { title: "Compor ferramentas existentes", description: "Conecte produtos, APIs e automações líderes em um fluxo operacional AI first.", driver: "Chega rápido a um fluxo útil quando o mercado já atende bem ao trabalho.", bestFor: "O valor está em orquestração, adoção e velocidade — não em inventar uma nova primitiva técnica.", tradeoff: "Lock-in, preço, movimentação de dados e lacunas da experiência precisam continuar visíveis.", firstTest: "Execute o fluxo com entradas reais em duas combinações candidatas de ferramentas." },
    },
  },
  es: {
    language: "Idioma", back: "Volver a Tech.No.LOG.IA", kicker: "SKILL 01 / AI FIRST ROUTE MAP", title: "Crea el proyecto. Compara los caminos para hacerlo real.", lead: "Un proyecto todavía no es una decisión tecnológica. Es una decisión de entrega: qué merece código a medida, qué puede partir de repositorios consolidados y qué debe componerse con herramientas que ya funcionan.", promise: "Un brief. Tres rutas viables. Una decisión que puedes explicar.", intakeKicker: "EMPIEZA POR EL RESULTADO", intakeTitle: "¿Qué quieres crear?", intakeLead: "Describe el trabajo, el usuario y el cambio que el sistema debe producir. El Route Map compara las tres estrategias antes de que el equipo se comprometa con una.", projectName: "Nombre del proyecto", projectPlaceholder: "Ej.: concierge de IA para customer success", brief: "Brief del proyecto", briefPlaceholder: "¿Qué debe hacer este proyecto, para quién y qué ya existe? Incluye datos, integraciones, velocidad o límites de compliance si importan.", startingPoint: "Punto de partida", startingChoices: [["new", "Producto nuevo"], ["existing", "Operación existente"], ["legacy", "Sistema para transformar"]], mapRoutes: "Mapear las tres rutas", privacy: "Esta primera lectura ocurre en el navegador. Ningún dato de este brief sale de esta página.", resultsKicker: "PRIMER MAPA DE RUTAS", resultsTitle: "Tres formas de hacerlo real.", resultsLead: "Cada ruta es viable. La puntuación muestra el encaje con este brief; no es una promesa, una búsqueda de mercado en vivo ni un sustituto de la diligencia técnica.", findings: "Lo que reveló la primera lectura", signal: "Señal del sistema", boundary: "Límite de decisión", validation: "Primera validación", recommended: "Ruta inicial recomendada", score: "Encaje", choose: "Elegir esta ruta", selected: "Ruta seleccionada", driver: "Por qué encaja", bestFor: "Mejor cuando", tradeoff: "Trade-off a gestionar", firstTest: "Primera prueba", decisionKicker: "TARJETA DE DECISIÓN DEL PROYECTO", decisionTitle: "Convierte la elección en un brief implementable.", decisionBody: "Una buena recomendación nombra la ruta, el límite que protege y la prueba mínima necesaria antes de invertir más.", copyBrief: "Copiar brief de implementación", copied: "Brief copiado", copyFallback: "Selecciona y copia el brief desde esta página.", analysisNote: "Después, Tech.No.LOG.IA valida repositorios, proveedores, licencias, seguridad, esfuerzo de integración y costo total de propiedad para la ruta elegida.", defaultSignal: "Un primer flujo claro sigue siendo el mejor punto de partida.", defaultBoundary: "Mantén el primer lanzamiento reversible y medible.", defaultValidation: "Prototipa un recorrido real de usuario antes de escalar el sistema.", modes: {
      repositories: { title: "Empezar con repositorios probados", description: "Usa bloques open source maduros y adapta la última milla al negocio.", driver: "Acelera patrones de producto comunes sin ceder el control del núcleo.", bestFor: "El producto tiene un patrón reconocible: portal, dashboard, marketplace, CRM, workflow o interfaz de agente.", tradeoff: "La madurez, licencia, mantenimiento e integración del repositorio todavía deben validarse.", firstTest: "Selecciona 3 repositorios mantenidos y ejecuta la ruta crítica localmente." },
      custom: { title: "Construir el sistema desde cero", description: "Diseña la arquitectura y la interacción alrededor de la ventaja única de la empresa.", driver: "Protege flujos diferenciados, límites de datos sensibles e integraciones inusuales.", bestFor: "La lógica central, la experiencia o la regla de compliance son realmente propietarias.", tradeoff: "Requiere más descubrimiento y tiempo de ingeniería antes del primer release de producción.", firstTest: "Prototipa la decisión de usuario y el límite de datos más riesgoso en una capa vertical." },
      tools: { title: "Componer herramientas existentes", description: "Conecta productos, APIs y automatizaciones líderes en un flujo AI first.", driver: "Llega rápido a un flujo útil cuando el mercado ya sirve bien al trabajo.", bestFor: "El valor está en la orquestación, adopción y velocidad, no en inventar una nueva primitiva técnica.", tradeoff: "El lock-in, precio, movimiento de datos y vacíos de experiencia deben seguir visibles.", firstTest: "Ejecuta el flujo con entradas reales en dos combinaciones candidatas de herramientas." },
    },
  },
  fr: {
    language: "Langue", back: "Retour à Tech.No.LOG.IA", kicker: "SKILL 01 / AI FIRST ROUTE MAP", title: "Créez le projet. Comparez les chemins pour le rendre réel.", lead: "Un projet n’est pas encore un choix technologique. C’est une décision de livraison : ce qui mérite du code sur mesure, ce qui peut partir de dépôts éprouvés et ce qui doit être composé avec des outils déjà efficaces.", promise: "Un brief. Trois routes viables. Une décision que vous pouvez expliquer.", intakeKicker: "COMMENCEZ PAR LE RÉSULTAT", intakeTitle: "Que voulez-vous créer ?", intakeLead: "Décrivez le travail, l’utilisateur et le changement que le système doit produire. Le Route Map compare les trois stratégies avant que l’équipe ne s’engage.", projectName: "Nom du projet", projectPlaceholder: "Ex. : concierge IA pour customer success", brief: "Brief du projet", briefPlaceholder: "Que doit faire ce projet, pour qui, et qu’est-ce qui existe déjà ? Incluez données, intégrations, vitesse ou contraintes de conformité si elles comptent.", startingPoint: "Point de départ", startingChoices: [["new", "Nouveau produit"], ["existing", "Opération existante"], ["legacy", "Système à transformer"]], mapRoutes: "Cartographier les trois routes", privacy: "Cette première lecture s’exécute dans le navigateur. Aucune donnée de ce brief ne quitte cette page.", resultsKicker: "PREMIÈRE CARTE DES ROUTES", resultsTitle: "Trois façons de le rendre réel.", resultsLead: "Chaque route est viable. Le score montre l’adéquation avec ce brief : ce n’est ni une promesse, ni une recherche de marché en direct, ni un remplacement de la diligence technique.", findings: "Ce que la première lecture a révélé", signal: "Signal système", boundary: "Limite de décision", validation: "Première validation", recommended: "Route initiale recommandée", score: "Adéquation", choose: "Choisir cette route", selected: "Route sélectionnée", driver: "Pourquoi cela convient", bestFor: "Idéal lorsque", tradeoff: "Arbitrage à gérer", firstTest: "Premier test", decisionKicker: "CARTE DE DÉCISION DU PROJET", decisionTitle: "Transformez le choix en brief implémentable.", decisionBody: "Une bonne recommandation nomme la route, la contrainte qu’elle protège et la plus petite preuve nécessaire avant d’investir davantage.", copyBrief: "Copier le brief d’implémentation", copied: "Brief copié", copyFallback: "Sélectionnez et copiez le brief depuis cette page.", analysisNote: "Ensuite, Tech.No.LOG.IA valide dépôts, fournisseurs, licences, sécurité, effort d’intégration et coût total de possession pour la route choisie.", defaultSignal: "Un premier flux clair reste le meilleur point de départ.", defaultBoundary: "Gardez la première livraison réversible et mesurable.", defaultValidation: "Prototypiez un parcours utilisateur réel avant de faire évoluer le système.", modes: {
      repositories: { title: "Partir de dépôts éprouvés", description: "Utilisez des briques open source matures et adaptez le dernier kilomètre au métier.", driver: "Accélère les modèles de produit courants sans céder le contrôle du noyau.", bestFor: "Le produit suit un modèle reconnaissable : portail, tableau de bord, marketplace, CRM, workflow ou interface d’agent.", tradeoff: "La maturité, la licence, la maintenance et l’intégration du dépôt doivent encore être validées.", firstTest: "Présélectionnez 3 dépôts maintenus et exécutez le chemin critique localement." },
      custom: { title: "Construire le système sur mesure", description: "Concevez l’architecture et l’interaction autour de l’avantage unique de l’entreprise.", driver: "Protège les flux différenciés, les limites de données sensibles et les intégrations atypiques.", bestFor: "La logique centrale, l’expérience ou la règle de conformité sont réellement propriétaires.", tradeoff: "Demande davantage de découverte et de temps d’ingénierie avant la première mise en production.", firstTest: "Prototypiez la décision utilisateur et la limite de données la plus risquée dans une tranche verticale." },
      tools: { title: "Composer des outils existants", description: "Connectez produits, API et automatisations de référence dans un flux AI first.", driver: "Atteint rapidement un flux utile lorsque le marché répond déjà bien au besoin.", bestFor: "La valeur est dans l’orchestration, l’adoption et la vitesse, pas dans l’invention d’une nouvelle primitive technique.", tradeoff: "Le verrouillage fournisseur, les prix, le mouvement des données et les lacunes d’expérience doivent rester visibles.", firstTest: "Exécutez le flux avec de vraies entrées sur deux piles d’outils candidates." },
    },
  },
};

const modeOrder: ModeKey[] = ["repositories", "custom", "tools"];
const visual = {
  repositories: { Icon: FolderGit2, number: "01" },
  custom: { Icon: Code2, number: "02" },
  tools: { Icon: Wrench, number: "03" },
} as const;

type Analysis = {
  scores: Record<ModeKey, number>;
  recommended: ModeKey;
  findings: Array<{ label: "signal" | "boundary" | "validation"; value: string }>;
};

function hasAny(source: string, terms: string[]) {
  return terms.some((term) => source.includes(term));
}

function firstLine(value: string) {
  return value.split(/[.!?\n]/)[0]?.trim().slice(0, 155);
}

function makeAnalysis(projectName: string, brief: string, startingPoint: string, copy: Dictionary): Analysis {
  const source = `${projectName} ${brief} ${startingPoint}`.toLowerCase();
  const commonPattern = hasAny(source, ["dashboard", "portal", "marketplace", "crm", "booking", "schedule", "workflow", "agent", "chat", "support"]);
  const differentiated = hasAny(source, ["proprietary", "custom", "unique", "differentiated", "internal", "exclusive", "proprietária", "diferenciado", "interno", "único"]);
  const sensitive = hasAny(source, ["health", "finance", "bank", "security", "compliance", "legal", "sensitive", "legacy", "saúde", "finan", "seguran", "juríd", "conform"]);
  const orchestration = hasAny(source, ["integration", "automate", "sales", "marketing", "email", "forms", "slack", "notion", "zapier", "integra", "automação", "vendas", "formular", "correo"]);
  const speed = hasAny(source, ["fast", "quick", "mvp", "pilot", "test", "rapid", "ráp", "piloto", "prueba"]);

  const scores = {
    repositories: Math.min(96, 47 + (commonPattern ? 24 : 0) + (speed ? 12 : 0) + (startingPoint === "new" ? 5 : 0) - (sensitive ? 8 : 0)),
    custom: Math.min(96, 45 + (differentiated ? 24 : 0) + (sensitive ? 22 : 0) + (startingPoint === "legacy" ? 12 : 0) + (commonPattern ? -4 : 0)),
    tools: Math.min(96, 43 + (orchestration ? 25 : 0) + (speed ? 15 : 0) + (startingPoint === "existing" ? 8 : 0) - (sensitive ? 9 : 0)),
  } as Record<ModeKey, number>;

  const recommended = modeOrder.reduce((best, key) => scores[key] > scores[best] ? key : best, "repositories");
  const signal = firstLine(brief);

  return {
    scores,
    recommended,
    findings: [
      { label: "signal", value: signal || copy.defaultSignal },
      { label: "boundary", value: sensitive ? copy.modes.custom.driver : copy.defaultBoundary },
      { label: "validation", value: copy.modes[recommended].firstTest || copy.defaultValidation },
    ],
  };
}

export default function RouteMapPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [projectName, setProjectName] = useState("");
  const [brief, setBrief] = useState("");
  const [startingPoint, setStartingPoint] = useState("new");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [selectedMode, setSelectedMode] = useState<ModeKey>("repositories");
  const [copyNotice, setCopyNotice] = useState("");
  const copy = dictionaries[locale];

  const selectedRoute = useMemo(() => copy.modes[selectedMode], [copy, selectedMode]);
  const selectedScore = analysis?.scores[selectedMode] ?? 0;

  function mapRoutes(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = makeAnalysis(projectName, brief, startingPoint, copy);
    setAnalysis(next);
    setSelectedMode(next.recommended);
    setCopyNotice("");
  }

  async function copyImplementationBrief() {
    const mode = copy.modes[selectedMode];
    const output = [
      `Tech.No.LOG.IA / AI First Route Map`,
      `Project: ${projectName || "Untitled project"}`,
      `Selected route: ${mode.title}`,
      `Fit score: ${selectedScore}/100`,
      `Why it fits: ${mode.driver}`,
      `First test: ${mode.firstTest}`,
      `Project brief: ${brief || copy.defaultSignal}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(output);
      setCopyNotice(copy.copied);
    } catch {
      setCopyNotice(copy.copyFallback);
    }
  }

  return <main className="route-map" lang={locale}>
    <header className="route-nav">
      <Link href="/" className="route-brand" aria-label="Tech.No.LOG.IA"><span className="route-mark" aria-hidden="true"><i/><i/><i/></span><span>Tech.No.LOG.<em>IA</em></span></Link>
      <div className="route-nav-right"><Link href="/" className="route-back"><ArrowLeft size={15}/>{copy.back}</Link><div className="route-language" aria-label={copy.language}>{(["en", "pt", "es", "fr"] as Locale[]).map((item) => <button key={item} type="button" aria-pressed={locale === item} onClick={() => setLocale(item)}>{item.toUpperCase()}</button>)}</div></div>
    </header>

    <section className="route-hero" aria-labelledby="route-title">
      <div><p className="route-kicker"><Sparkles size={14}/>{copy.kicker}</p><h1 id="route-title">{copy.title.split(". ").map((part, index) => <span key={part}>{index === 1 ? <em>{part}</em> : part}{index === 0 && "."}<br/></span>)}</h1></div>
      <div className="route-hero-note"><p>{copy.lead}</p><strong><Gauge size={16}/>{copy.promise}</strong></div>
    </section>

    <section className="route-workbench" aria-labelledby="intake-title">
      <div className="route-intake-intro"><p className="route-kicker">{copy.intakeKicker}</p><h2 id="intake-title">{copy.intakeTitle}</h2><p>{copy.intakeLead}</p><div className="route-route-key"><span><FolderGit2 size={15}/>01</span><span><Code2 size={15}/>02</span><span><Wrench size={15}/>03</span></div></div>
      <form className="route-form" onSubmit={mapRoutes}>
        <label><span>{copy.projectName}</span><input required value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder={copy.projectPlaceholder}/></label>
        <label><span>{copy.brief}</span><textarea required value={brief} onChange={(event) => setBrief(event.target.value)} placeholder={copy.briefPlaceholder} rows={5}/></label>
        <fieldset><legend>{copy.startingPoint}</legend><div className="route-starting-options">{copy.startingChoices.map(([id, label]) => <button key={id} type="button" className={startingPoint === id ? "active" : ""} aria-pressed={startingPoint === id} onClick={() => setStartingPoint(id)}>{label}</button>)}</div></fieldset>
        <button className="route-submit" type="submit">{copy.mapRoutes}<ArrowUpRight size={18}/></button>
        <p className="route-privacy"><ShieldCheck size={14}/>{copy.privacy}</p>
      </form>
    </section>

    {analysis && <section className="route-results" aria-live="polite" aria-labelledby="results-title">
      <div className="route-results-head"><div><p className="route-kicker">{copy.resultsKicker}</p><h2 id="results-title">{copy.resultsTitle}</h2></div><p>{copy.resultsLead}</p></div>

      <div className="route-findings"><div className="route-findings-head"><Search size={17}/><span>{copy.findings}</span></div>{analysis.findings.map((item) => <article key={item.label}><span>{copy[item.label]}</span><p>{item.value}</p></article>)}</div>

      <div className="route-options">{modeOrder.map((key) => {
        const mode = copy.modes[key];
        const { Icon, number } = visual[key];
        const isSelected = selectedMode === key;
        const isRecommended = analysis.recommended === key;
        return <article key={key} className={`route-option ${isSelected ? "selected" : ""} ${isRecommended ? "recommended" : ""}`}>
          <div className="route-option-top"><span>{number}</span><Icon size={22}/>{isRecommended && <b><Check size={13}/>{copy.recommended}</b>}</div>
          <h3>{mode.title}</h3><p className="route-option-description">{mode.description}</p>
          <div className="route-score"><span>{copy.score}</span><strong>{analysis.scores[key]}<small>/100</small></strong><i><i style={{ width: `${analysis.scores[key]}%` }}/></i></div>
          <dl><div><dt>{copy.driver}</dt><dd>{mode.driver}</dd></div><div><dt>{copy.bestFor}</dt><dd>{mode.bestFor}</dd></div><div><dt>{copy.tradeoff}</dt><dd>{mode.tradeoff}</dd></div><div><dt>{copy.firstTest}</dt><dd>{mode.firstTest}</dd></div></dl>
          <button type="button" onClick={() => { setSelectedMode(key); setCopyNotice(""); }} aria-pressed={isSelected}>{isSelected ? copy.selected : copy.choose}<ArrowUpRight size={15}/></button>
        </article>;
      })}</div>

      <aside className="route-decision"><div><p className="route-kicker">{copy.decisionKicker}</p><h2>{copy.decisionTitle}</h2><p>{copy.decisionBody}</p></div><div className="route-decision-choice"><span>{copy.selected}</span><h3>{selectedRoute.title}</h3><p>{copy.firstTest}: {selectedRoute.firstTest}</p><button type="button" onClick={() => { void copyImplementationBrief(); }}><Clipboard size={16}/>{copyNotice || copy.copyBrief}</button></div></aside>
      <p className="route-analysis-note"><Layers3 size={16}/>{copy.analysisNote}</p>
    </section>}
  </main>;
}
