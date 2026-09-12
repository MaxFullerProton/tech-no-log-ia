export const FRESHNESS_MS = 12 * 60 * 1000;

export function allowedTarget(value) {
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password && !u.port && !u.search && !u.hash &&
      /^[a-z0-9-]+\.premiumlife\.chatgpt\.site$/.test(u.hostname) && u.pathname === '/';
  } catch { return false; }
}

export function classifyResponse(status, location = '', text = '') {
  if ([401, 403].includes(status) || (status >= 300 && status < 400 && /signin|login|oauth|auth\.|chatgpt\.com/i.test(location)) ||
      (status === 200 && /<title[^>]*>[^<]*(sign in|log in|entrar|authentication)/i.test(text))) {
    return { status: 'unknown', code: 'ACCESS_PROTECTED', detail: 'A verificação encontrou a proteção de acesso. O funcionamento interno ainda não foi verificado.', next_action: 'Conectar um teste autenticado ao fluxo desta aplicação.' };
  }
  if (status >= 200 && status < 300) return { status: 'healthy', code: 'HTTP_OK', detail: 'O endereço respondeu à consulta HTTP. Esta evidência cobre disponibilidade externa; não comprova as entregas internas.', next_action: 'Conectar verificações do processamento e da entrega para ampliar a cobertura.' };
  if (status === 429) return { status: 'warning', code: 'RATE_LIMIT', detail: 'O endereço limitou as consultas (HTTP 429).', next_action: 'Verificar limites do serviço e frequência das requisições.' };
  if (status >= 300 && status < 400) return { status: 'unknown', code: 'REDIRECT', detail: 'O endereço redirecionou a consulta. O destino não foi acessado por este teste.', next_action: 'Conferir o endereço canônico e o redirecionamento.' };
  return { status: 'critical', code: status === 404 ? 'HTTP_NOT_FOUND' : 'HTTP_ERROR', detail: `O endereço devolveu HTTP ${status}.`, next_action: status === 404 ? 'Conferir publicação e endereço da aplicação.' : 'Investigar a aplicação e os registros do serviço no horário da ocorrência.' };
}

export async function probe(target, fetcher = fetch) {
  const started = Date.now();
  if (!target.url) return { status: 'unknown', code: 'NO_PUBLISHED_URL', detail: 'Nenhum endereço publicado estava disponível na última conferência do cadastro.', next_action: 'Publicar a aplicação e atualizar seu cadastro de monitoramento.', http_status: null, latency_ms: null, attempts: 0 };
  if (!allowedTarget(target.url)) return { status: 'unknown', code: 'INVALID_TARGET', detail: 'O endereço está fora dos destinos permitidos para este monitor.', next_action: 'Revisar o cadastro antes de executar a consulta.', http_status: null, latency_ms: null, attempts: 0 };
  let last;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const response = await fetcher(target.url, { method: 'GET', redirect: 'manual', signal: AbortSignal.timeout(attempt === 1 ? 6000 : 4000), headers: { 'user-agent': 'TechNOLogIA-Monitor/1.0', 'accept': 'text/html', 'cache-control': 'no-cache' } });
      // A bounded sample identifies sign-in pages without retaining site content.
      const reader = response.body?.getReader();
      let sample = '';
      if (reader) { try { const chunk = await reader.read(); if (chunk.value) sample = new TextDecoder().decode(chunk.value.slice(0, 8192)); } finally { await reader.cancel().catch(() => {}); } }
      last = { ...classifyResponse(response.status, response.headers.get('location') || '', sample), http_status: response.status, latency_ms: Date.now() - started, attempts: attempt };
      if (last.status !== 'critical' || response.status < 500) break;
    } catch {
      last = { status: 'critical', code: 'CONNECTION_FAILED', detail: 'A consulta falhou por conexão ou prazo excedido. A causa interna ainda não foi confirmada.', next_action: 'Verificar domínio, disponibilidade da aplicação e registros do serviço.', http_status: null, latency_ms: Date.now() - started, attempts: attempt };
    }
  }
  return last;
}

export function effectiveStatus(target, now = Date.now()) {
  const observed = Date.parse(target.checked_at || '');
  if (!Number.isFinite(observed) || observed > now + 30000 || now - observed > FRESHNESS_MS) return 'unknown';
  return target.status;
}
