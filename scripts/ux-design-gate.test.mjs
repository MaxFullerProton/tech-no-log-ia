import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,mkdirSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {REQUIRED_IDS,sourceFingerprint,validateAudit} from './ux-design-gate.mjs';
function fixture() {
 const root=mkdtempSync(join(tmpdir(),'ux-gate-test-'));execFileSync('git',['init','-q'],{cwd:root});
 mkdirSync(join(root,'docs/ux/evidence'),{recursive:true});writeFileSync(join(root,'product.txt'),'SYNTHETIC TEST PRODUCT');
 const content='SYNTHETIC TEST EVIDENCE — never a production approval';writeFileSync(join(root,'docs/ux/evidence/test.txt'),content);
 const evidence={path:'docs/ux/evidence/test.txt',sha256:createHash('sha256').update(content).digest('hex'),description:'Synthetic fixture'};
 const now=new Date(Date.now()-1000).toISOString();
 const audit={policy_version:'1.0',decision:'APPROVED',company:'Fixture',product:'Fixture',author:'Fixture author',source_fingerprint:sourceFingerprint(root),
 context:{status:'CONFIRMED',market:'Fixture',audience:'Fixture',devices:'Fixture',territories:'Fixture',languages:'Fixture',success_criteria:'Fixture',benchmarks:[{source:'Fixture',observation:'Fixture',reviewed_at:now,evidence}],critical_journeys:[{name:'Fixture',acceptance_criteria:'Fixture',result:'PASS',evidence:[evidence]}]},
 principles:REQUIRED_IDS.map(id=>({id,context_application:'Fixture',acceptance_criteria:'Fixture',reviewer:'Reviewer',reviewed_at:now,result:'PASS',evidence:[evidence]})),
 approvals:Object.fromEntries(['ux','technology','product'].map(role=>[role,{result:'APPROVED',reviewer:'Fixture '+role,reviewed_at:now}]))};
 return {root,audit,evidence};
}
function scenario(name,mutate,expectPass=false){test(name,()=>{const f=fixture();try{mutate(f);const errors=validateAudit(f.audit,f.root);expectPass?assert.deepEqual(errors,[]):assert.ok(errors.length>0);}finally{rmSync(f.root,{recursive:true,force:true});}});}
scenario('complete synthetic dossier passes mechanical validation',()=>{},true);
scenario('unverified product is blocked',f=>f.audit.principles[0].result='UNVERIFIED');
scenario('missing principle is blocked',f=>f.audit.principles.pop());
scenario('duplicate principle is blocked',f=>f.audit.principles.push(f.audit.principles[0]));
scenario('non-applicability without independent review is blocked',f=>f.audit.principles[0].result='NA_JUSTIFIED');
scenario('justified independently reviewed non-applicability can pass',f=>Object.assign(f.audit.principles[0],{result:'NA_JUSTIFIED',justification:'Fixture has no incomplete workflow',independent_reviewer:'Independent fixture reviewer'}),true);
scenario('evidence modified after review is blocked',f=>writeFileSync(join(f.root,f.evidence.path),'changed'));
scenario('source modified after review is blocked',f=>writeFileSync(join(f.root,'product.txt'),'changed'));
scenario('missing evidence is blocked',f=>f.audit.principles[0].evidence=[]);
scenario('missing market context is blocked',f=>delete f.audit.context.audience);
scenario('unconfirmed market hypothesis is blocked',f=>f.audit.context.status='PROPOSED');
scenario('missing final approval is blocked',f=>delete f.audit.approvals.product);
scenario('self-approved UX is blocked',f=>f.audit.approvals.ux.reviewer=f.audit.author);
scenario('wrong policy version is blocked',f=>f.audit.policy_version='0.9');
scenario('failed essential journey is blocked',f=>f.audit.context.critical_journeys[0].result='FAIL');
scenario('path traversal evidence is blocked',f=>f.audit.principles[0].evidence=[{...f.evidence,path:'../secret'}]);
