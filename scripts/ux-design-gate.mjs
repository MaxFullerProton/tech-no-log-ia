import {readFileSync, existsSync, realpathSync} from 'node:fs';
import {resolve, relative, isAbsolute} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

export const REQUIRED_IDS = Array.from({length:26},(_,i)=>`UX${String(i+1).padStart(2,'0')}`);
const digest = content => createHash('sha256').update(content).digest('hex');
export function sourceFingerprint(root=process.cwd()) {
  const paths=execFileSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{cwd:root,encoding:'utf8'}).split('\0').filter(Boolean);
  const hash=createHash('sha256');
  for(const path of [...new Set(paths)].sort()) {
    // The dossier and evidence can change without changing the audited product.
    if(path.startsWith('docs/ux/')) continue;
    const full=resolve(root,path);
    hash.update(path+'\0');
    hash.update(existsSync(full)?readFileSync(full):'DELETED');hash.update('\0');
  }
  return hash.digest('hex');
}
const filled=value=>typeof value==='string' && value.trim().length>0 && !/^(TODO|TBD|PENDING|__________)$/i.test(value.trim());
const past=value=>typeof value==='string' && Number.isFinite(Date.parse(value)) && Date.parse(value)<=Date.now();
function evidenceErrors(ref,root,label) {
  const errors=[];
  if(!ref || !filled(ref.path) || !/^[a-f0-9]{64}$/.test(ref.sha256??'')) return [`${label}: local evidence path and SHA-256 required`];
  const file=resolve(root,ref.path), rel=relative(root,file);
  if(isAbsolute(ref.path)||rel.startsWith('..')||!existsSync(file)) return [`${label}: missing or out-of-project evidence`];
  const actual=relative(realpathSync(root),realpathSync(file));
  if(actual.startsWith('..')||isAbsolute(actual)) return [`${label}: evidence escapes the project`];
  try { if(digest(readFileSync(file))!==ref.sha256) errors.push(`${label}: evidence checksum mismatch`); }
  catch { errors.push(`${label}: evidence is not a readable file`); }
  if(!filled(ref.description)) errors.push(`${label}: evidence description required`);
  return errors;
}
export function validateAudit(audit,root=process.cwd()) {
  const errors=[];
  if(audit.policy_version!=='1.0') errors.push('policy_version must be 1.0');
  if(audit.decision!=='APPROVED') errors.push('release decision is not APPROVED');
  if(audit.source_fingerprint!==sourceFingerprint(root)) errors.push('audit does not match the current source fingerprint');
  if(!filled(audit.product)||!filled(audit.company)||!filled(audit.author)) errors.push('product, company and author required');
  const context=audit.context??{};
  if(context.status!=='CONFIRMED') errors.push('market and user context has not been confirmed');
  for(const key of ['market','audience','devices','territories','languages','success_criteria']) if(!filled(context[key])) errors.push(`context.${key} required`);
  if(!Array.isArray(context.critical_journeys)||context.critical_journeys.length===0) errors.push('critical journeys required');
  else for(const [i,j] of context.critical_journeys.entries()) {
    if(!filled(j.name)||!filled(j.acceptance_criteria)||j.result!=='PASS') errors.push(`journey ${i+1} lacks passing acceptance evidence`);
    if(!Array.isArray(j.evidence)||!j.evidence.length) errors.push(`journey ${i+1}: evidence required`);
    else j.evidence.forEach((e,k)=>errors.push(...evidenceErrors(e,root,`journey ${i+1} evidence ${k+1}`)));
  }
  if(!Array.isArray(context.benchmarks)||context.benchmarks.length===0) errors.push('market benchmark with verified references required');
  else for(const b of context.benchmarks) {
    if(!filled(b.source)||!filled(b.observation)||!past(b.reviewed_at)) errors.push('benchmark source, observation and review date required');
    errors.push(...evidenceErrors(b.evidence,root,'benchmark'));
  }
  const items=Array.isArray(audit.principles)?audit.principles:[];
  const seen=new Set();
  for(const item of items) {
    if(seen.has(item.id)) errors.push(`duplicate principle ${item.id}`);seen.add(item.id);
    if(!filled(item.context_application)||!filled(item.acceptance_criteria)) errors.push(`${item.id}: contextual application and acceptance criteria required`);
    if(!filled(item.reviewer)||!past(item.reviewed_at)) errors.push(`${item.id}: reviewer and valid review date required`);
    if(item.result==='NA_JUSTIFIED') {
      if(!filled(item.justification)||!filled(item.independent_reviewer)||item.independent_reviewer===audit.author||item.independent_reviewer===item.reviewer) errors.push(`${item.id}: non-applicability requires justification and independent review`);
    } else if(item.result==='PASS') {
      if(!Array.isArray(item.evidence)||!item.evidence.length) errors.push(`${item.id}: evidence required`);
      else item.evidence.forEach((e,k)=>errors.push(...evidenceErrors(e,root,`${item.id} evidence ${k+1}`)));
    } else errors.push(`${item.id}: ${item.result??'UNVERIFIED'} blocks release`);
  }
  for(const id of REQUIRED_IDS) if(!seen.has(id)) errors.push(`missing principle ${id}`);
  for(const role of ['ux','technology','product']) {
    const approval=audit.approvals?.[role];
    if(approval?.result!=='APPROVED'||!filled(approval?.reviewer)||!past(approval?.reviewed_at)) errors.push(`${role} approval missing`);
  }
  if(audit.approvals?.ux?.reviewer===audit.author) errors.push('UX approval must not be solely self-approved by the author');
  // These checks establish dossier completeness and version consistency, not independent usability certification.
  return errors;
}
if(process.argv[1] && resolve(process.argv[1])===resolve(new URL(import.meta.url).pathname)) {
  try {
    if(process.argv.includes('--fingerprint')) console.log(sourceFingerprint());
    else {
      const path=resolve(process.cwd(),'docs/ux/audit.json');
      if(!existsSync(path)) throw new Error('Missing docs/ux/audit.json. Run the UX evaluation before release.');
      const errors=validateAudit(JSON.parse(readFileSync(path,'utf8')));
      if(errors.length) {console.error(`UX RELEASE BLOCKED (${errors.length} findings)\n${errors.map(e=>'- '+e).join('\n')}`);process.exitCode=1;}
      else console.log('UX dossier checks passed for this source. Human UX review and existing technical gates remain mandatory.');
    }
  } catch(error) {console.error(`UX RELEASE BLOCKED: ${error.message}`);process.exitCode=1;}
}
