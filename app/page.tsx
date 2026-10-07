"use client";
import {useState} from "react";
import {Activity,ArrowUpRight,ChevronRight,ShieldCheck,Boxes,BrainCircuit,Database,GitFork,Orbit,Workflow} from "lucide-react";
import Link from "next/link";
import Image from "next/image";


const languages = [
  { id: "pt", short: "PT", name: "Português", htmlLang: "pt-BR" },
  { id: "en", short: "EN", name: "English", htmlLang: "en" },
  { id: "es", short: "ES", name: "Español", htmlLang: "es" },
  { id: "fr", short: "FR", name: "Français", htmlLang: "fr" },
] as const;
type Locale = (typeof languages)[number]["id"];

const languageCopy = {
  pt: {
    nav: ["Sistema", "Capacidades", "Método"], workspace: "Abrir workspace", language: "Idioma",
    hero: ["Tecnologia que", "ganha forma e", "move o trabalho."], lead: "Tech.No.LOG.IA transforma contexto disperso em sistemas claros: decisões rastreáveis, implementações reversíveis e sinais que orientam o próximo ciclo.", explore: "Ver o sistema",
    core: "O NÚCLEO OPERACIONAL", coreTitle: ["Não é um painel.", "É um sistema que", "conecta."], coreLead: "Escolha uma camada para explorar como a Tech.No.LOG.IA transforma sinais em trabalho verificável.",
    modes: [
      { label: "01 / SINAIS", action: "Mapear", title: "Veja a operação antes de automatizar.", body: "Mapeie pessoas, processos, dados e sistemas que já movem o trabalho. O ponto de partida é a realidade, não uma promessa de IA.", inputs: ["Decisões recorrentes", "Sistemas existentes", "Fricções e handoffs"], outputs: ["Mapa de sinais", "Restrições explícitas", "Prioridade de ciclo"], Icon: Orbit },
      { label: "02 / BLUEPRINT", action: "Projetar", title: "Transforme complexidade em uma arquitetura legível.", body: "Converta o que foi observado em uma escolha tecnológica delimitada: o que conectar, o que manter humano e como comprovar valor.", inputs: ["Sinais qualificados", "Critérios de sucesso", "Limites de autonomia"], outputs: ["Blueprint operacional", "Plano reversível", "Responsáveis visíveis"], Icon: GitFork },
      { label: "03 / RUNTIME", action: "Operar", title: "Coloque o sistema para aprender em produção.", body: "A execução começa pequena, guarda evidências e deixa claro quando o próximo movimento é seguro.", inputs: ["Ação aprovada", "Responsável definido", "Evidência esperada"], outputs: ["Ciclo executável", "Trilha de evidências", "Próxima decisão"], Icon: Workflow },
    ],
    inputs: "ENTRADAS", outputs: "SAÍDAS", engine: "ORGANIZA\nDECIDE\nEVIDENCIA", start: "Começar um blueprint", demo: "Demonstração conceitual — cada ciclo é definido com o seu contexto, equipes e limites.",
    capabilities: "CAPACIDADES", capabilityTitle: ["Da intenção ao", "sinal real."],
    cards: [
      ["01", "Mapear o agora", "Traga negócio, tecnologia e pessoas para uma única leitura operacional.", Database],
      ["02", "Desenhar o próximo ciclo", "Defina a menor decisão reversível que produz uma mudança observável.", BrainCircuit],
      ["03", "Operar com evidência", "Registre o que mudou, o que não mudou e onde a operação precisa de atenção.", Activity],
      ["04", "Manter a visibilidade", "Acompanhe disponibilidade e ocorrências sem confundir resposta técnica com sucesso do todo.", ShieldCheck],
    ],
    method: "COMO O TRABALHO AVANÇA", methodTitle: ["Menos teatro de inovação.", "Mais arquitetura em movimento."],
    steps: [["01", "Capturar", "O contexto que sua operação já produz vira o ponto de partida."], ["02", "Estruturar", "A decisão, seus limites e seus critérios ficam explícitos."], ["03", "Executar", "O menor passo seguro acontece com um responsável definido."], ["04", "Evidenciar", "O resultado informa o ciclo seguinte e preserva a memória."]],
    cta: "COMECE PELO QUE JÁ É REAL", ctaTitle: ["A próxima tecnologia", "da sua operação começa", "com uma", "boa leitura."], create: "Criar um blueprint", monitor: "Abrir centro de operações", footer: "Um runtime para decisões tecnológicas que precisam funcionar no mundo real."
  },
  en: {
    nav: ["System", "Capabilities", "Method"], workspace: "Open workspace", language: "Language",
    hero: ["Technology that", "takes shape and", "moves the work."], lead: "Tech.No.LOG.IA turns scattered context into clear systems: traceable decisions, reversible implementations, and signals that shape the next cycle.", explore: "Explore the system",
    core: "THE OPERATING CORE", coreTitle: ["Not a dashboard.", "A system that", "connects."], coreLead: "Choose a layer to see how Tech.No.LOG.IA turns signals into verifiable work.",
    modes: [
      { label: "01 / SIGNALS", action: "Map", title: "See the operation before automating it.", body: "Map the people, processes, data, and systems already moving the work. Reality—not an AI promise—is the starting point.", inputs: ["Recurring decisions", "Existing systems", "Friction and handoffs"], outputs: ["Signal map", "Explicit constraints", "Cycle priority"], Icon: Orbit },
      { label: "02 / BLUEPRINT", action: "Design", title: "Turn complexity into readable architecture.", body: "Convert what you observe into a bounded technology choice: what to connect, what stays human, and how value will be proven.", inputs: ["Qualified signals", "Success criteria", "Autonomy limits"], outputs: ["Operating blueprint", "Reversible plan", "Visible owners"], Icon: GitFork },
      { label: "03 / RUNTIME", action: "Operate", title: "Let the system learn in production.", body: "Execution starts small, preserves evidence, and makes the next safe move clear.", inputs: ["Approved action", "Defined owner", "Expected evidence"], outputs: ["Executable cycle", "Evidence trail", "Next decision"], Icon: Workflow },
    ],
    inputs: "INPUTS", outputs: "OUTPUTS", engine: "ORGANIZE\nDECIDE\nEVIDENCE", start: "Start a blueprint", demo: "Conceptual demonstration — every cycle is shaped around your context, teams, and limits.",
    capabilities: "CAPABILITIES", capabilityTitle: ["From intent to", "real signal."],
    cards: [
      ["01", "Map the present", "Bring business, technology, and people into a single operational reading.", Database],
      ["02", "Design the next cycle", "Define the smallest reversible decision that can produce an observable change.", BrainCircuit],
      ["03", "Operate with evidence", "Record what changed, what did not, and where the operation needs attention.", Activity],
      ["04", "Keep visibility", "Track availability and incidents without mistaking technical response for whole-system success.", ShieldCheck],
    ],
    method: "HOW THE WORK MOVES", methodTitle: ["Less innovation theatre.", "More architecture in motion."],
    steps: [["01", "Capture", "The context your operation already produces becomes the starting point."], ["02", "Structure", "The decision, its limits, and its criteria are made explicit."], ["03", "Execute", "The smallest safe step happens with a named owner."], ["04", "Evidence", "The result informs the next cycle and preserves the memory."]],
    cta: "START WITH WHAT IS ALREADY REAL", ctaTitle: ["Your operation’s next", "technology begins", "with a", "good reading."], create: "Create a blueprint", monitor: "Open operations center", footer: "A runtime for technology decisions that need to work in the real world."
  },
  es: {
    nav: ["Sistema", "Capacidades", "Método"], workspace: "Abrir espacio de trabajo", language: "Idioma",
    hero: ["Tecnología que", "toma forma y", "mueve el trabajo."], lead: "Tech.No.LOG.IA convierte el contexto disperso en sistemas claros: decisiones trazables, implementaciones reversibles y señales que orientan el próximo ciclo.", explore: "Ver el sistema",
    core: "EL NÚCLEO OPERATIVO", coreTitle: ["No es un panel.", "Es un sistema que", "conecta."], coreLead: "Elige una capa para ver cómo Tech.No.LOG.IA convierte señales en trabajo verificable.",
    modes: [
      { label: "01 / SEÑALES", action: "Mapear", title: "Ve la operación antes de automatizar.", body: "Mapea a las personas, procesos, datos y sistemas que ya mueven el trabajo. El punto de partida es la realidad, no una promesa de IA.", inputs: ["Decisiones recurrentes", "Sistemas existentes", "Fricciones y entregas"], outputs: ["Mapa de señales", "Restricciones explícitas", "Prioridad del ciclo"], Icon: Orbit },
      { label: "02 / BLUEPRINT", action: "Diseñar", title: "Convierte la complejidad en una arquitectura legible.", body: "Convierte lo observado en una decisión tecnológica delimitada: qué conectar, qué mantener humano y cómo demostrar valor.", inputs: ["Señales calificadas", "Criterios de éxito", "Límites de autonomía"], outputs: ["Blueprint operativo", "Plan reversible", "Responsables visibles"], Icon: GitFork },
      { label: "03 / RUNTIME", action: "Operar", title: "Haz que el sistema aprenda en producción.", body: "La ejecución comienza pequeña, conserva evidencia y aclara cuál es el próximo movimiento seguro.", inputs: ["Acción aprobada", "Responsable definido", "Evidencia esperada"], outputs: ["Ciclo ejecutable", "Rastro de evidencia", "Próxima decisión"], Icon: Workflow },
    ],
    inputs: "ENTRADAS", outputs: "SALIDAS", engine: "ORGANIZA\nDECIDE\nEVIDENCIA", start: "Empezar un blueprint", demo: "Demostración conceptual — cada ciclo se define según tu contexto, equipos y límites.",
    capabilities: "CAPACIDADES", capabilityTitle: ["De la intención a", "la señal real."],
    cards: [
      ["01", "Mapear el presente", "Reúne negocio, tecnología y personas en una única lectura operativa.", Database],
      ["02", "Diseñar el próximo ciclo", "Define la decisión reversible más pequeña que pueda generar un cambio observable.", BrainCircuit],
      ["03", "Operar con evidencia", "Registra qué cambió, qué no cambió y dónde la operación necesita atención.", Activity],
      ["04", "Mantener la visibilidad", "Sigue disponibilidad e incidencias sin confundir respuesta técnica con éxito del sistema completo.", ShieldCheck],
    ],
    method: "CÓMO AVANZA EL TRABAJO", methodTitle: ["Menos teatro de innovación.", "Más arquitectura en movimiento."],
    steps: [["01", "Capturar", "El contexto que ya produce tu operación se convierte en el punto de partida."], ["02", "Estructurar", "La decisión, sus límites y sus criterios se vuelven explícitos."], ["03", "Ejecutar", "El paso seguro más pequeño ocurre con un responsable definido."], ["04", "Evidenciar", "El resultado informa el siguiente ciclo y conserva la memoria."]],
    cta: "EMPIEZA POR LO QUE YA ES REAL", ctaTitle: ["La próxima tecnología", "de tu operación empieza", "con una", "buena lectura."], create: "Crear un blueprint", monitor: "Abrir centro de operaciones", footer: "Un runtime para decisiones tecnológicas que necesitan funcionar en el mundo real."
  },
  fr: {
    nav: ["Système", "Capacités", "Méthode"], workspace: "Ouvrir l’espace de travail", language: "Langue",
    hero: ["Une technologie qui", "prend forme et", "fait avancer le travail."], lead: "Tech.No.LOG.IA transforme un contexte dispersé en systèmes clairs : décisions traçables, implémentations réversibles et signaux qui orientent le cycle suivant.", explore: "Voir le système",
    core: "LE NOYAU OPÉRATIONNEL", coreTitle: ["Pas un tableau de bord.", "Un système qui", "relie."], coreLead: "Choisissez une couche pour voir comment Tech.No.LOG.IA transforme des signaux en travail vérifiable.",
    modes: [
      { label: "01 / SIGNAUX", action: "Cartographier", title: "Voyez l’opération avant de l’automatiser.", body: "Cartographiez les personnes, processus, données et systèmes qui font déjà avancer le travail. Le point de départ est la réalité, pas une promesse d’IA.", inputs: ["Décisions récurrentes", "Systèmes existants", "Frictions et transferts"], outputs: ["Carte des signaux", "Contraintes explicites", "Priorité de cycle"], Icon: Orbit },
      { label: "02 / BLUEPRINT", action: "Concevoir", title: "Transformez la complexité en architecture lisible.", body: "Transformez ce qui est observé en un choix technologique délimité : quoi connecter, quoi garder humain et comment prouver la valeur.", inputs: ["Signaux qualifiés", "Critères de réussite", "Limites d’autonomie"], outputs: ["Blueprint opérationnel", "Plan réversible", "Responsables visibles"], Icon: GitFork },
      { label: "03 / RUNTIME", action: "Opérer", title: "Faites apprendre le système en production.", body: "L’exécution commence petit, conserve les preuves et rend le prochain mouvement sûr évident.", inputs: ["Action approuvée", "Responsable défini", "Preuve attendue"], outputs: ["Cycle exécutable", "Piste de preuves", "Décision suivante"], Icon: Workflow },
    ],
    inputs: "ENTRÉES", outputs: "SORTIES", engine: "ORGANISE\nDÉCIDE\nPROUVE", start: "Démarrer un blueprint", demo: "Démonstration conceptuelle — chaque cycle est défini avec votre contexte, vos équipes et vos limites.",
    capabilities: "CAPACITÉS", capabilityTitle: ["De l’intention au", "signal réel."],
    cards: [
      ["01", "Cartographier le présent", "Réunissez activité, technologie et personnes dans une lecture opérationnelle unique.", Database],
      ["02", "Concevoir le cycle suivant", "Définissez la plus petite décision réversible qui peut produire un changement observable.", BrainCircuit],
      ["03", "Opérer avec des preuves", "Consignez ce qui a changé, ce qui n’a pas changé et où l’opération requiert de l’attention.", Activity],
      ["04", "Garder la visibilité", "Suivez disponibilité et incidents sans confondre réponse technique et réussite du système entier.", ShieldCheck],
    ],
    method: "COMMENT LE TRAVAIL AVANCE", methodTitle: ["Moins de théâtre de l’innovation.", "Plus d’architecture en mouvement."],
    steps: [["01", "Capturer", "Le contexte que votre opération produit déjà devient le point de départ."], ["02", "Structurer", "La décision, ses limites et ses critères deviennent explicites."], ["03", "Exécuter", "La plus petite étape sûre est réalisée avec un responsable identifié."], ["04", "Prouver", "Le résultat informe le cycle suivant et préserve la mémoire."]],
    cta: "COMMENCEZ PAR CE QUI EST DÉJÀ RÉEL", ctaTitle: ["La prochaine technologie", "de votre opération commence", "par une", "bonne lecture."], create: "Créer un blueprint", monitor: "Ouvrir le centre d’opérations", footer: "Un runtime pour des décisions technologiques qui doivent fonctionner dans le monde réel."
  },
} as const;

const productCopy = {
  pt: { kicker:"NASCIDA NO SILICON VALLEY · CONSTRUÍDA PARA O MUNDO", hero:["Faça qualquer empresa", "AI first.", "Comece pelo que importa."], lead:"De uma empresa já pronta a um serviço, sistema ou produto ainda por construir: a Tech.No.LOG.IA descobre o que deve se tornar AI first e cria o caminho para isso acontecer.", explore:"Conheça o primeiro produto", imageAlt:"Fundadores caminhando em um campus de tecnologia no Silicon Valley ao entardecer", productKicker:"O PRIMEIRO PRODUTO", productTitle:["AI First", "Prototyping"], productBody:"Antes de escrever uma linha de código, encontramos o problema tecnológico real, avaliamos o que já funciona no mercado e entregamos um protótipo ou um plano que sua empresa pode colocar de pé.", deliverables:["Mapa de oportunidade de IA", "Protótipo funcional", "Caminho build, buy ou integrate", "Blueprint de implementação"], plansKicker:"A PLATAFORMA DE PRODUTOS", plansTitle:"Três produtos para tornar qualquer operação AI first.", plans:[["01", "AI First Prototyping", "Diagnóstico, escolhas tecnológicas e um protótipo que torna a próxima decisão concreta.", "PRIMEIRO PRODUTO"], ["02", "AI First Build", "Arquitetura, integrações e construção do sistema que a empresa decidiu colocar em produção.", "PRÓXIMO"], ["03", "AI First Transformation", "Agentes, dados e operações conectadas para transformar a empresa inteira de dentro para fora.", "PRÓXIMO"]] },
  en: { kicker:"BORN IN SILICON VALLEY · BUILT FOR THE WORLD", hero:["Make any company", "AI first.", "Start where it matters."], lead:"From an established company to a service, system, or product yet to be built: Tech.No.LOG.IA finds what should become AI first and creates the path to make it real.", explore:"Meet the first product", imageAlt:"Founders walking through a Silicon Valley technology campus at dusk", productKicker:"THE FIRST PRODUCT", productTitle:["AI First", "Prototyping"], productBody:"Before writing a line of code, we find the actual technology need, assess what already works in the market, and deliver a prototype or a plan your company can put into motion.", deliverables:["AI opportunity map", "Working prototype", "Build, buy, or integrate path", "Implementation blueprint"], plansKicker:"THE PRODUCT PLATFORM", plansTitle:"Three products to make any operation AI first.", plans:[["01", "AI First Prototyping", "Diagnosis, technology choices, and a prototype that makes the next decision tangible.", "FIRST PRODUCT"], ["02", "AI First Build", "Architecture, integrations, and the system build your company has chosen to put into production.", "NEXT"], ["03", "AI First Transformation", "Agents, data, and connected operations that transform the entire company from the inside out.", "NEXT"]] },
  es: { kicker:"NACIDA EN SILICON VALLEY · CREADA PARA EL MUNDO", hero:["Haz que cualquier empresa", "sea AI first.", "Empieza por lo que importa."], lead:"Desde una empresa consolidada hasta un servicio, sistema o producto por construir: Tech.No.LOG.IA descubre qué debe volverse AI first y crea el camino para hacerlo realidad.", explore:"Conoce el primer producto", imageAlt:"Fundadores caminando por un campus tecnológico de Silicon Valley al atardecer", productKicker:"EL PRIMER PRODUCTO", productTitle:["AI First", "Prototyping"], productBody:"Antes de escribir una línea de código, encontramos la necesidad tecnológica real, evaluamos lo que ya funciona en el mercado y entregamos un prototipo o un plan que tu empresa puede poner en marcha.", deliverables:["Mapa de oportunidad de IA", "Prototipo funcional", "Ruta de construir, comprar o integrar", "Blueprint de implementación"], plansKicker:"LA PLATAFORMA DE PRODUCTOS", plansTitle:"Tres productos para hacer que cualquier operación sea AI first.", plans:[["01", "AI First Prototyping", "Diagnóstico, decisiones tecnológicas y un prototipo que hace tangible la siguiente decisión.", "PRIMER PRODUCTO"], ["02", "AI First Build", "Arquitectura, integraciones y construcción del sistema que tu empresa decidió llevar a producción.", "PRÓXIMO"], ["03", "AI First Transformation", "Agentes, datos y operaciones conectadas que transforman a toda la empresa desde dentro.", "PRÓXIMO"]] },
  fr: { kicker:"NÉE DANS LA SILICON VALLEY · CONÇUE POUR LE MONDE", hero:["Faites de toute entreprise", "une entreprise AI first.", "Commencez là où cela compte."], lead:"D’une entreprise établie à un service, système ou produit à construire : Tech.No.LOG.IA identifie ce qui doit devenir AI first et crée le chemin pour le rendre réel.", explore:"Découvrir le premier produit", imageAlt:"Fondateurs marchant dans un campus technologique de la Silicon Valley au crépuscule", productKicker:"LE PREMIER PRODUIT", productTitle:["AI First", "Prototyping"], productBody:"Avant d’écrire une ligne de code, nous trouvons le besoin technologique réel, évaluons ce qui fonctionne déjà sur le marché et livrons un prototype ou un plan que votre entreprise peut mettre en œuvre.", deliverables:["Carte d’opportunité IA", "Prototype fonctionnel", "Parcours construire, acheter ou intégrer", "Blueprint d’implémentation"], plansKicker:"LA PLATEFORME PRODUIT", plansTitle:"Trois produits pour rendre toute opération AI first.", plans:[["01", "AI First Prototyping", "Diagnostic, choix technologiques et prototype qui rend la prochaine décision concrète.", "PREMIER PRODUIT"], ["02", "AI First Build", "Architecture, intégrations et construction du système que votre entreprise a choisi de mettre en production.", "SUIVANT"], ["03", "AI First Transformation", "Agents, données et opérations connectées pour transformer l’entreprise entière de l’intérieur.", "SUIVANT"]] },
} as const;

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");
  const [modeIndex, setModeIndex] = useState(0);
  const content = languageCopy[locale];
  const products = productCopy[locale];
  const mode = content.modes[modeIndex];
  const ModeIcon = mode.Icon;
  return <main className="tech-landing" lang={languages.find(item => item.id === locale)?.htmlLang}>
    <header className="tech-nav">
      <Link href="/" className="tech-brand" aria-label="Tech.No.LOG.IA"><span className="tech-mark" aria-hidden="true"><i/><i/><i/></span><span>Tech.No.LOG.<em>IA</em></span></Link>
      <nav aria-label="Primary navigation"><a href="#sistema">{content.nav[0]}</a><a href="#capacidades">{content.nav[1]}</a><a href="#metodo">{content.nav[2]}</a></nav>
      <div className="tech-nav-actions"><div className="tech-language" aria-label={content.language}>{languages.map(item => <button key={item.id} type="button" aria-pressed={locale === item.id} onClick={() => setLocale(item.id)} title={item.name}>{item.short}</button>)}</div><Link className="tech-nav-cta" href="/blueprints">{content.workspace} <ArrowUpRight size={15}/></Link></div>
    </header>
    <section className="tech-hero" aria-labelledby="tech-title">
      <div className="tech-hero-visual"><Image src="/images/silicon-valley-hero.png" alt={products.imageAlt} fill priority sizes="(max-width: 680px) 100vw, 51vw"/></div>
      <p className="tech-kicker">{products.kicker}</p>
      <h1 id="tech-title">{products.hero[0]}<br/><span>{products.hero[1]}</span><br/>{products.hero[2]}</h1>
      <div className="tech-hero-bottom"><p>{products.lead}</p><a href="#products" className="tech-text-link">{products.explore} <ChevronRight size={18}/></a></div>
      <div className="tech-grid-orbit" aria-hidden="true"><span/><span/><span/><span/><span/></div>
    </section>
    <section id="products" className="tech-product-launch" aria-labelledby="product-title">
      <div className="tech-product-feature"><p className="tech-kicker">{products.productKicker}</p><h2 id="product-title">{products.productTitle[0]}<br/><em>{products.productTitle[1]}</em></h2><p>{products.productBody}</p><Link href="/blueprints" className="tech-primary-link">{content.workspace} <ArrowUpRight size={18}/></Link></div>
      <div className="tech-deliverables"><p className="tech-kicker">DELIVERABLES</p>{products.deliverables.map((item,index)=><div key={item}><span>{String(index+1).padStart(2,"0")}</span><strong>{item}</strong></div>)}</div>
      <div className="tech-product-grid"><div className="tech-product-grid-head"><p className="tech-kicker">{products.plansKicker}</p><h2>{products.plansTitle}</h2></div>{products.plans.map(([number,title,body,status])=><article key={number} className={number==="01"?"is-current":""}><div><span>{number}</span><b>{status}</b></div><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>
    <section id="sistema" className="tech-system" aria-labelledby="system-title">
      <div className="tech-section-head"><p className="tech-kicker">{content.core}</p><h2 id="system-title">{content.coreTitle[0]}<br/>{content.coreTitle[1]} <em>{content.coreTitle[2]}</em></h2><p>{content.coreLead}</p></div>
      <div className="tech-system-stage">
        <div className="tech-mode-tabs" role="tablist" aria-label={content.core}>{content.modes.map((item, index) => <button key={item.label} role="tab" aria-selected={modeIndex === index} className={modeIndex === index ? "active" : ""} onClick={() => setModeIndex(index)}><span>{item.label}</span><b>{item.action}</b></button>)}</div>
        <article className="tech-flow-card" aria-live="polite">
          <div className="tech-flow-copy"><span className="tech-flow-icon"><ModeIcon size={21}/></span><p className="tech-kicker">{mode.label}</p><h3>{mode.title}</h3><p>{mode.body}</p><Link href="/blueprints" className="tech-card-link">{content.start} <ArrowUpRight size={17}/></Link></div>
          <div className="tech-flow-map" aria-label={content.demo}>
            <div className="tech-flow-column inputs"><span>{content.inputs}</span>{mode.inputs.map((item, index) => <div key={item}><i>{String(index + 1).padStart(2, "0")}</i>{item}</div>)}</div>
            <div className="tech-engine"><div><Boxes size={29}/><strong>Tech.<br/>No.LOG.<em>IA</em></strong></div><span>{content.engine}</span></div>
            <div className="tech-flow-column outputs"><span>{content.outputs}</span>{mode.outputs.map((item, index) => <div key={item}><i>{String(index + 1).padStart(2, "0")}</i>{item}</div>)}</div>
          </div>
          <p className="tech-demo-note">{content.demo}</p>
        </article>
      </div>
    </section>
    <section id="capacidades" className="tech-capabilities" aria-labelledby="capabilities-title">
      <div><p className="tech-kicker">{content.capabilities}</p><h2 id="capabilities-title">{content.capabilityTitle[0]}<br/><em>{content.capabilityTitle[1]}</em></h2></div>
      <div className="tech-capability-list">{content.cards.map(([number, title, description, Icon]) => <article key={number}><div><span>{number}</span><Icon size={25}/></div><h3>{title}</h3><p>{description}</p></article>)}</div>
    </section>
    <section id="metodo" className="tech-method" aria-labelledby="method-title">
      <div className="tech-method-intro"><p className="tech-kicker">{content.method}</p><h2 id="method-title">{content.methodTitle[0]}<br/><em>{content.methodTitle[1]}</em></h2></div>
      <ol>{content.steps.map(([number, title, description]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
    </section>
    <section className="tech-cta" aria-labelledby="cta-title"><div><p className="tech-kicker">{content.cta}</p><h2 id="cta-title">{content.ctaTitle[0]}<br/>{content.ctaTitle[1]}<br/>{content.ctaTitle[2]} <em>{content.ctaTitle[3]}</em></h2></div><div className="tech-cta-actions"><Link href="/blueprints" className="tech-primary-link">{content.create} <ArrowUpRight size={18}/></Link><Link href="/monitor" className="tech-secondary-link">{content.monitor} <ArrowUpRight size={17}/></Link></div></section>
    <footer className="tech-footer"><Link href="/" className="tech-brand"><span className="tech-mark" aria-hidden="true"><i/><i/><i/></span><span>Tech.No.LOG.<em>IA</em></span></Link><p>{content.footer}</p><span>© 2026 Tech.No.LOG.IA</span></footer>
  </main>;
}
