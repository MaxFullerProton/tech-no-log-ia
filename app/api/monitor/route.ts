import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {z} from 'zod';

export const dynamic='force-dynamic';
export const runtime='edge';
const action=z.discriminatedUnion('action',[
  z.object({action:z.literal('check'),target_id:z.string().regex(/^[A-Za-z0-9_-]{5,120}$/).optional()}),
  z.object({action:z.literal('acknowledge'),incident_id:z.string().uuid(),note:z.string().trim().min(5).max(2000),operation_id:z.string().min(8).max(200)})
]);

async function handle(request:Request) {
  const user=await getChatGPTUser();
  if(!user) return Response.json({error:'Entre na sua conta para abrir o painel.'},{status:401});
  // This internal surface remains behind the existing owner-only Sites policy.
  const config=env as unknown as Record<string,string>;
  if(!config.MONITOR_URL || !config.MONITOR_TOKEN) return Response.json({error:'O monitor ainda não está conectado.',code:'NOT_CONFIGURED'},{status:503});
  const origin=request.headers.get('origin');
  if(request.method==='POST' && origin && origin!==new URL(request.url).origin) return Response.json({error:'Origem da solicitação inválida.'},{status:403});
  const url=new URL(config.MONITOR_URL);
  let body;
  if(request.method==='POST') {
    const raw=await request.text(); if(raw.length>8192)return Response.json({error:'Solicitação muito grande.'},{status:413});
    let input;try{input=JSON.parse(raw);}catch{return Response.json({error:'Solicitação inválida.'},{status:400});}
    const parsed=action.safeParse(input);if(!parsed.success)return Response.json({error:'Revise os campos da solicitação.'},{status:400});
    body={...parsed.data,source:'manual',actor:user.id};
  } else {
    const id=new URL(request.url).searchParams.get('target_id');
    if(id && !/^[A-Za-z0-9_-]{5,120}$/.test(id))return Response.json({error:'Aplicação inválida.'},{status:400});
    if(id)url.searchParams.set('target_id',id);
  }
  try {
    const response=await fetch(url,{method:request.method,headers:{authorization:`Bearer ${config.MONITOR_TOKEN}`,'content-type':'application/json'},
      ...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(request.method==='POST'?125000:15000)});
    const data=await response.json();
    if(!response.ok)return Response.json({error:'Não foi possível concluir a consulta. A última informação não deve ser tratada como atual.',code:data.error || 'MONITOR_UNAVAILABLE'},{status:response.status===401?503:response.status});
    return Response.json(data,{status:response.status,headers:{'cache-control':'private, no-store'}});
  } catch{return Response.json({error:'O monitor não respondeu. O estado atual das aplicações é desconhecido.',code:'MONITOR_UNAVAILABLE'},{status:503});}
}
export const GET=handle;
export const POST=handle;
