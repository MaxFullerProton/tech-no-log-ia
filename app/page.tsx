"use client";
import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import {Activity,ArrowUpRight,CheckCircle2,ChevronRight,CircleHelp,CircuitBoard,Clock3,RefreshCw,Search,ShieldCheck,TriangleAlert,Boxes,BrainCircuit,Database,GitFork,Orbit,Workflow} from 'lucide-react';
import {Tabs,TabsList,TabsTrigger,TabsContent} from '@/components/ui/tabs';
import Link from 'next/link';
import {Sheet,SheetContent,SheetHeader,SheetTitle,SheetDescription} from '@/components/ui/sheet';
import {Table,TableHeader,TableBody,TableHead,TableRow,TableCell} from '@/components/ui/table';
import './monitor.css';

type Target={id:string;name:string;url:string|null;kind:string;status:string;effective_status:string;checked_at:string|null;catalog_verified_at:string;code:string|null;detail:string|null;next_action:string|null;http_status:number|null;latency_ms:number|null;stale:boolean;owner_label:string;last_observation_id:string|null};
type Incident={id:string;target_id:string;status:string;severity:string;code:string;detail:string;next_action:string;opened_at:string;last_seen_at:string;resolved_at:string|null;owner_label:string};
type Observation={id:string;checked_at:string;status:string;code:string;http_status:number|null;latency_ms:number|null;attempts:number};
type Run={id:string;source:string;status:string;started_at:string;completed_at:string|null;checked_count:number};
type Action={id:string;incident_id:string;note:string;created_at:string};
type Data={targets:Target[];incidents:Incident[];runs:Run[];actions:Action[];server_time:string;monitoring:{last_scheduled_at:string|null;interval_minutes:number;freshness_minutes:number}};
const labels:Record<string,string>={healthy:'Resposta OK',warning:'Atenção',critical:'Falha detectada',unknown:'Não verificado',open:'Aberta',acknowledged:'Em análise',resolved:'Recuperada'};
function date(v:string|null){return v?new Date(v).toLocaleString('pt-BR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit',timeZone:'America/Sao_Paulo'}):'Sem registro';}
function Status({value,label}:{value:string;label?:string}){return <span className={`status-tag state-${value}`}><span aria-hidden="true"/>{label||labels[value]||value}</span>;}
async function api(path='',body?:unknown){const r=await fetch('/api/monitor'+path,{cache:'no-store',...(body?{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}:{})});const d=await r.json();if(!r.ok)throw new Error(d.error||'Não foi possível consultar o monitor.');return d;}
export function MonitorPage(){
 const [data,setData]=useState<Data|null>(null),[error,setError]=useState(''),[notice,setNotice]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 const [search,setSearch]=useState(''),[filter,setFilter]=useState('all'),[kind,setKind]=useState('all'),[selected,setSelected]=useState<string|null>(null),[history,setHistory]=useState<Observation[]>([]),[historyError,setHistoryError]=useState(''),[note,setNote]=useState('');
 const pending=useRef<{fingerprint:string;id:string}|null>(null);
 const load=useCallback(async()=>{try{setData(await api());setError('');}catch(e){setError(e instanceof Error?e.message:'Monitor indisponível.');}finally{setLoading(false);}},[]);
 useEffect(()=>{const first=window.setTimeout(()=>void load(),0);const id=window.setInterval(()=>void load(),60000);return()=>{window.clearTimeout(first);window.clearInterval(id);};},[load]);
 useEffect(()=>{if(!selected)return;let current=true;api('?target_id='+encodeURIComponent(selected)).then(d=>{if(current)setHistory(d.observations);}).catch(()=>{if(current)setHistoryError('O histórico não pôde ser consultado.');});return()=>{current=false;};},[selected,data?.server_time]);
 function selectTarget(id:string|null){setSelected(id);setNote('');setHistory([]);setHistoryError('');}
 const targets=useMemo(()=>data?.targets.map(t=>({...t,effective_status:error?'unknown':t.effective_status}))||[],[data,error]);
 const shown=targets.filter(t=>(kind==='all'||t.kind===kind)&&(filter==='all'||t.effective_status===filter)&&t.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()));
 const chosen=targets.find(t=>t.id===selected),active=data?.incidents.filter(i=>i.status!=='resolved')||[],incident=active.find(i=>i.target_id===selected);
 const scheduler=data?.monitoring.last_scheduled_at;
 const schedulerFresh=!!scheduler&&!error&&!!data?.server_time&&Date.parse(data.server_time)-Date.parse(scheduler)<12*60000;
 async function check(id?:string){setBusy(true);setNotice('');try{const result=await api('',{action:'check',...(id?{target_id:id}:{})});setNotice(result.busy?'Uma consulta já está em andamento. Os resultados serão atualizados.':`${result.checked_count} aplicação(ões) conferida(s). Evidências registradas.`);await load();}catch(e){setError(e instanceof Error?e.message:'A consulta não terminou.');}finally{setBusy(false);}}
 async function acknowledge(){if(!incident)return;setBusy(true);const fingerprint=incident.id+note.trim();if(pending.current?.fingerprint!==fingerprint)pending.current={fingerprint,id:'ack:'+crypto.randomUUID()};try{await api('',{action:'acknowledge',incident_id:incident.id,note:note.trim(),operation_id:pending.current.id});pending.current=null;setNote('');setNotice('Acompanhamento registrado. A ocorrência continua aberta até a recuperação ser verificada.');await load();}catch(e){setError(e instanceof Error?e.message:'A anotação não foi salva.');}finally{setBusy(false);}}
 return <main className="control">
  <header className="control-nav"><Link className="control-brand" href="/"><span className="brand-icon"><CircuitBoard size={22}/></span>Tech.NO-Log.IA</Link><div className="nav-links"><span>Premium Life Valley</span><a href="/blueprints">Planos tecnológicos <ArrowUpRight size={15}/></a></div></header>
  <div className="control-body">
   <div className="control-title"><div><p className="overline">CENTRAL DE OPERAÇÕES</p><h1>Operação à vista.</h1><p className="intro">Localize falhas. Acompanhe a correção. Confira a recuperação.</p></div><button className="primary-action" onClick={()=>void check()} disabled={busy||loading}><RefreshCw size={17} className={busy?'spinning':''}/>{busy?'Verificando…':'Verificar agora'}</button></div>
   <div className={`collection-line ${schedulerFresh?'':'collection-pending'}`}><Activity size={16}/><strong>{schedulerFresh?'Coleta automática ativa':'Coleta automática sem evidência recente'}</strong><span>A cada 5 minutos · última coleta: {date(scheduler||null)}</span></div>
   {error&&<div className="monitor-error" role="alert"><TriangleAlert size={20}/><div><strong>Não foi possível confirmar o estado atual</strong><p>{error}</p><button onClick={()=>void load()}>Tentar consultar novamente</button></div></div>}
   {notice&&<p className="monitor-notice" role="status">{notice}</p>}
   <section className="metric-grid" aria-label="Resumo do monitoramento">
    {[{label:'Aplicações cadastradas',value:targets.length,icon:<CircuitBoard size={20}/>,tone:'neutral',sub:'Companies e espaços individuais'},{label:'Falhas detectadas',value:targets.filter(t=>t.effective_status==='critical').length,icon:<TriangleAlert size={20}/>,tone:'critical',sub:`${active.length} ocorrência(s) em acompanhamento`},{label:'Sem confirmação',value:targets.filter(t=>t.effective_status==='unknown').length,icon:<CircleHelp size={20}/>,tone:'unknown',sub:'Acesso protegido, sem teste ou dado vencido'},{label:'Resposta externa OK',value:targets.filter(t=>t.effective_status==='healthy').length,icon:<CheckCircle2 size={20}/>,tone:'healthy',sub:'Disponibilidade HTTP verificada'}].map(m=><article className={`metric-card metric-${m.tone}`} key={m.label}><div><span>{m.label}</span>{m.icon}</div><strong>{loading?'—':m.value}</strong><p>{m.sub}</p></article>)}
   </section>
   <Tabs defaultValue="applications" className="operations-tabs"><TabsList className="operations-tab-list"><TabsTrigger value="applications">Aplicações</TabsTrigger><TabsTrigger value="incidents">Ocorrências {active.length>0&&<span className="tab-count">{active.length}</span>}</TabsTrigger><TabsTrigger value="history">Histórico de coletas</TabsTrigger></TabsList>
    <TabsContent value="applications">
     <div className="inventory-panel"><div className="inventory-top"><div><h2>Onde está o problema?</h2><p>Clique em uma aplicação para ver o sinal, a evidência e a próxima ação.</p></div><span className="small-meta">{shown.length} de {targets.length}</span></div>
      <div className="monitor-filters"><label className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar aplicação" aria-label="Buscar aplicação"/></label><label className="filter-select">Estado<select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">Todos</option><option value="critical">Falha detectada</option><option value="warning">Atenção</option><option value="unknown">Não verificado</option><option value="healthy">Resposta OK</option></select></label><label className="filter-select">Grupo<select value={kind} onChange={e=>setKind(e.target.value)}><option value="all">Todos</option><option value="company">Companies</option><option value="client">My Valleys</option></select></label></div>
      <Table className="monitor-table"><TableHeader><TableRow><TableHead>Aplicação</TableHead><TableHead>Disponibilidade externa</TableHead><TableHead className="hide-small">Fluxo interno</TableHead><TableHead className="hide-small">Última verificação</TableHead><TableHead><span className="sr-only">Detalhes</span></TableHead></TableRow></TableHeader><TableBody>
       {shown.map(t=><TableRow key={t.id}><TableCell><button className="target-name" onClick={()=>selectTarget(t.id)}><span className={`target-icon ${t.kind==='client'?'is-client':''}`}>{t.name.replace(/^My Valley · /,'').slice(0,1)}</span><span><strong>{t.name}</strong><small>{t.url?'Endereço cadastrado':'Sem endereço publicado no cadastro'}</small></span></button></TableCell><TableCell><Status value={t.effective_status}/>{t.code==='ACCESS_PROTECTED'&&<small className="status-caption">Acesso protegido</small>}{t.stale&&<small className="status-caption">Evidência vencida</small>}</TableCell><TableCell className="hide-small"><span className="not-connected">Ainda não conectado</span></TableCell><TableCell className="hide-small"><span className="table-date">{date(t.checked_at)}</span></TableCell><TableCell><button className="icon-button" aria-label={`Ver detalhes de ${t.name}`} onClick={()=>selectTarget(t.id)}><ChevronRight size={18}/></button></TableCell></TableRow>)}
      </TableBody></Table>
      {loading&&<p className="monitor-empty">Consultando aplicações e evidências…</p>}{!loading&&!shown.length&&<p className="monitor-empty">{data?'Nenhuma aplicação corresponde aos filtros.':'Aguardando uma consulta válida ao monitor.'}</p>}
     </div>
     <div className="coverage-note"><ShieldCheck size={21}/><p><strong>Cobertura atual: disponibilidade externa.</strong> Dados, agentes, processamento e entrega ainda precisam de testes próprios. Uma resposta HTTP correta não torna a Company inteira operacional.</p></div>
    </TabsContent>
    <TabsContent value="incidents"><section className="inventory-panel"><div className="inventory-top"><div><h2>Ocorrências e recuperação</h2><p>Uma anotação registra o acompanhamento. A recuperação exige duas verificações externas bem-sucedidas consecutivas.</p></div></div><div className="incident-list">{data?.incidents.map(i=><button className="incident-card" key={i.id} onClick={()=>selectTarget(i.target_id)}><div><Status value={i.status} label={labels[i.status]}/><small>{date(i.opened_at)}</small></div><h3>{targets.find(t=>t.id===i.target_id)?.name||i.target_id}</h3><p>{i.detail}</p><span>{i.next_action}</span><div className="incident-owner">Responsável: {i.owner_label}<ChevronRight size={16}/></div></button>)}{!data?.incidents.length&&<p className="monitor-empty">Nenhuma ocorrência registrada{data?' nas verificações realizadas.':'.'} Aplicações sem evidência permanecem como não verificadas.</p>}</div></section></TabsContent>
    <TabsContent value="history"><section className="inventory-panel"><div className="inventory-top"><div><h2>Evidência de execução</h2><p>Últimas 20 coletas. Horários de Brasília.</p></div></div><Table className="monitor-table"><TableHeader><TableRow><TableHead>Início</TableHead><TableHead>Origem</TableHead><TableHead>Resultado</TableHead><TableHead>Aplicações</TableHead></TableRow></TableHeader><TableBody>{data?.runs.map(r=><TableRow key={r.id}><TableCell>{date(r.started_at)}</TableCell><TableCell>{r.source==='scheduled'?'Automática':r.source==='verification'?'Validação':'Solicitada no painel'}</TableCell><TableCell><Status value={r.status==='completed'?'healthy':r.status==='failed'?'critical':'unknown'} label={r.status==='completed'?'Coleta concluída':r.status==='failed'?'Coleta falhou':'Em andamento'}/></TableCell><TableCell>{r.checked_count}</TableCell></TableRow>)}</TableBody></Table>{!data?.runs.length&&<p className="monitor-empty">Nenhuma coleta registrada.</p>}</section></TabsContent>
   </Tabs>
   <div className="control-footer"><span><Clock3 size={14}/> Painel consultado: {date(data?.server_time||null)}</span><span>Falhas e ausência de evidência têm estados distintos.</span></div>
  </div>
  <Sheet open={!!selected} onOpenChange={open=>{if(!open)selectTarget(null);}}><SheetContent className="monitor-sheet"><SheetHeader><p className="overline">DIAGNÓSTICO DA APLICAÇÃO</p><SheetTitle>{chosen?.name}</SheetTitle><SheetDescription>Disponibilidade, evidências e acompanhamento técnico.</SheetDescription></SheetHeader>{chosen&&<div className="sheet-body"><Status value={chosen.effective_status}/><div className="signal-box"><h3>Sinal observado</h3><p>{chosen.detail||'Nenhuma verificação registrada para esta aplicação.'}</p><span>Conferido em {date(chosen.checked_at)}</span></div><div className="next-action"><p className="overline">PRÓXIMA AÇÃO</p><p>{chosen.next_action||'Executar a primeira verificação.'}</p><span>Responsável: {chosen.owner_label}</span></div><div className="diagnostic-grid"><div><span>Resposta HTTP</span><strong>{chosen.http_status??'—'}</strong></div><div><span>Tempo da consulta</span><strong>{chosen.latency_ms!==null?`${chosen.latency_ms} ms`:'—'}</strong></div></div>{chosen.url&&<a className="target-url" href={chosen.url} target="_blank" rel="noreferrer">Abrir aplicação <ArrowUpRight size={16}/></a>}<button className="primary-action" disabled={busy} onClick={()=>void check(chosen.id)}><RefreshCw size={16} className={busy?'spinning':''}/>{busy?'Verificando…':'Verificar esta aplicação'}</button><div className="internal-gap"><CircleHelp size={18}/><p><strong>Fluxo interno não instrumentado.</strong> Esta consulta ainda não testa autenticação do cliente, banco, agentes ou entregáveis.</p></div>{incident&&<div className="follow-up"><h3>Acompanhar ocorrência</h3><Status value={incident.status}/><label>O que está sendo feito?<textarea value={note} onChange={e=>setNote(e.target.value)} minLength={5} maxLength={2000} placeholder="Registre a investigação, responsável ou ação executada."/></label><button className="secondary-action" disabled={busy||note.trim().length<5} onClick={()=>void acknowledge()}>Registrar acompanhamento</button>{data?.actions.filter(a=>a.incident_id===incident.id).map(a=><div className="action-entry" key={a.id}><small>{date(a.created_at)}</small><p>{a.note}</p></div>)}</div>}<h3 className="history-heading">Últimas verificações</h3>{historyError&&<p role="alert">{historyError}</p>}<div className="check-history">{history.map(h=><div key={h.id}><Status value={h.status}/><span>{date(h.checked_at)} · {h.attempts} tentativa(s)</span></div>)}</div><p className="evidence-id">Evidência: {chosen.last_observation_id||'ainda não registrada'}</p></div>}</SheetContent></Sheet>
 </main>;
}

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

export default function Home() {
  const [locale, setLocale] = useState<Locale>("pt");
  const [modeIndex, setModeIndex] = useState(0);
  const content = languageCopy[locale];
  const mode = content.modes[modeIndex];
  const ModeIcon = mode.Icon;
  return <main className="tech-landing" lang={languages.find(item => item.id === locale)?.htmlLang}>
    <header className="tech-nav">
      <Link href="/" className="tech-brand" aria-label="Tech.No.LOG.IA"><span className="tech-mark" aria-hidden="true"><i/><i/><i/></span><span>Tech.No.LOG.<em>IA</em></span></Link>
      <nav aria-label="Primary navigation"><a href="#sistema">{content.nav[0]}</a><a href="#capacidades">{content.nav[1]}</a><a href="#metodo">{content.nav[2]}</a></nav>
      <div className="tech-nav-actions"><div className="tech-language" aria-label={content.language}>{languages.map(item => <button key={item.id} type="button" aria-pressed={locale === item.id} onClick={() => setLocale(item.id)} title={item.name}>{item.short}</button>)}</div><Link className="tech-nav-cta" href="/blueprints">{content.workspace} <ArrowUpRight size={15}/></Link></div>
    </header>
    <section className="tech-hero" aria-labelledby="tech-title">
      <p className="tech-kicker">TECHNOLOGY OPERATING COMPANY <span>•</span> SÃO PAULO / GLOBAL</p>
      <h1 id="tech-title">{content.hero[0]}<br/><span>{content.hero[1]}</span><br/>{content.hero[2]}</h1>
      <div className="tech-hero-bottom"><p>{content.lead}</p><a href="#sistema" className="tech-text-link">{content.explore} <ChevronRight size={18}/></a></div>
      <div className="tech-grid-orbit" aria-hidden="true"><span/><span/><span/><span/><span/></div>
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
