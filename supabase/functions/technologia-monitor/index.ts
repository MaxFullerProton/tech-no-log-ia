import { probe, effectiveStatus } from './core.mjs';
import { TOKEN_SHA256 } from './token-hash.ts';

const base = Deno.env.get('SUPABASE_URL')!;
const secret = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}').default;

async function authorized(request: Request) {
  const value = request.headers.get('authorization') || '';
  if (!value.startsWith('Bearer ') || value.length > 256) return false;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value.slice(7)));
  const hex = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2,'0')).join('');
  let mismatch = hex.length ^ TOKEN_SHA256.length;
  for (let i=0; i<hex.length; i++) mismatch |= hex.charCodeAt(i) ^ TOKEN_SHA256.charCodeAt(i);
  return mismatch === 0;
}

async function db(path: string, method = 'GET', body?: unknown, prefer?: string) {
  const response = await fetch(`${base}/rest/v1/${path}`, { method,
    headers: { apikey: secret, authorization: `Bearer ${secret}`, 'content-type': 'application/json', ...(prefer ? {prefer} : {}) },
    ...(body !== undefined ? {body: JSON.stringify(body)} : {}), signal: AbortSignal.timeout(10000) });
  if (!response.ok) { console.error('monitor_storage_error', response.status, path.split('?')[0]); throw new Error('STORAGE_UNAVAILABLE'); }
  return response.status===204 ? null : response.json();
}

async function summary() {
  const [targets,incidents,runs,actions] = await Promise.all([
    db('tech_monitor_targets?select=*&order=name&limit=100'),
    db('tech_monitor_incidents?select=*&order=opened_at.desc&limit=100'),
    db('tech_monitor_runs?select=*&order=started_at.desc&limit=20'),
    db('tech_monitor_actions?select=*&order=created_at.desc&limit=100')
  ]);
  const now = Date.now();
  const normalized = targets.map((t: any) => ({...t, effective_status: effectiveStatus(t, now), stale: effectiveStatus(t,now)==='unknown' && t.status!=='unknown'}));
  const latestScheduled = runs.find((r: any)=>r.source==='scheduled' && r.status==='completed');
  return {targets:normalized, incidents, runs, actions, server_time:new Date(now).toISOString(),
    monitoring:{interval_minutes:5, freshness_minutes:12, last_scheduled_at:latestScheduled?.completed_at || null,
      scope:'Disponibilidade HTTP externa, histórico de ocorrências e evidências. Fluxos internos exigem instrumentação adicional.'}};
}

async function check(body: any) {
  const targetId = body.target_id || null;
  if (targetId && !/^[A-Za-z0-9_-]{5,120}$/.test(targetId)) return reply({error:'INVALID_TARGET'},400);
  const targets = await db(`tech_monitor_targets?select=*&order=name&limit=100${targetId ? '&id=eq.'+encodeURIComponent(targetId):''}`);
  if (!targets.length) return reply({error:'TARGET_NOT_FOUND'},404);
  const source = ['scheduled','verification'].includes(body.source) ? body.source : 'manual';
  const run = await db('rpc/tech_monitor_begin','POST',{p_source:source,p_target_id:targetId});
  if (run.busy) return reply({busy:true,message:'Já existe uma verificação em andamento ou recém-iniciada.'},202);
  let cursor=0, completed=0;
  try {
    await Promise.all(Array.from({length:Math.min(4,targets.length)},async()=>{
      while(cursor<targets.length) {
        const target=targets[cursor++];
        const checkedAt=new Date().toISOString();
        const result=await probe(target);
        await db('rpc/tech_monitor_record','POST',{p_run_id:run.id,p_target_id:target.id,p_status:result.status,p_code:result.code,
          p_detail:result.detail,p_next_action:result.next_action,p_http_status:result.http_status,p_latency_ms:result.latency_ms,
          p_attempts:result.attempts,p_checked_at:checkedAt});
        completed++;
      }
    }));
    await db(`tech_monitor_runs?id=eq.${run.id}`,'PATCH',{completed_at:new Date().toISOString(),status:'completed',checked_count:completed});
    return reply({run_id:run.id,checked_count:completed,status:'completed'});
  } catch {
    await db(`tech_monitor_runs?id=eq.${run.id}`,'PATCH',{completed_at:new Date().toISOString(),status:'failed',checked_count:completed,error_code:'CHECK_OR_STORAGE_FAILED'}).catch(()=>{});
    return reply({error:'CHECK_OR_STORAGE_FAILED',run_id:run.id,checked_count:completed},503);
  }
}

function reply(data: unknown,status=200) {return Response.json(data,{status,headers:{'cache-control':'no-store'}});}

Deno.serve(async(request: Request)=>{
  if (!await authorized(request)) return reply({error:'UNAUTHORIZED'},401);
  try {
    if(request.method==='GET') {
      const url=new URL(request.url); const id=url.searchParams.get('target_id');
      if(id) {
        if(!/^[A-Za-z0-9_-]{5,120}$/.test(id)) return reply({error:'INVALID_TARGET'},400);
        return reply({observations:await db(`tech_monitor_observations?target_id=eq.${encodeURIComponent(id)}&order=checked_at.desc&limit=40`)});
      }
      return reply(await summary());
    }
    if(request.method!=='POST') return reply({error:'METHOD_NOT_ALLOWED'},405);
    const raw=await request.text(); if(raw.length>8192) return reply({error:'BODY_TOO_LARGE'},413);
    let body; try {body=JSON.parse(raw);} catch{return reply({error:'INVALID_JSON'},400);}
    if(body.action==='check') return await check(body);
    if(body.action==='acknowledge') {
      if(!/^[0-9a-f-]{36}$/.test(body.incident_id||'') || typeof body.note!=='string' || body.note.trim().length<5 || body.note.length>2000 || typeof body.actor!=='string' || typeof body.operation_id!=='string') return reply({error:'INVALID_ACTION'},400);
      return reply(await db('rpc/tech_monitor_ack','POST',{p_incident_id:body.incident_id,p_operation_id:body.operation_id,p_actor:body.actor.slice(0,160),p_note:body.note.trim()}));
    }
    return reply({error:'INVALID_ACTION'},400);
  } catch {return reply({error:'MONITOR_UNAVAILABLE'},503);}
});
