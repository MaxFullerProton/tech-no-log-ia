import test from 'node:test';
import assert from 'node:assert/strict';
import {allowedTarget,classifyResponse,probe,effectiveStatus,FRESHNESS_MS} from '../supabase/functions/technologia-monitor/core.mjs';

test('private access is unknown and never a healthy Company',()=>{
 for(const status of [401,403])assert.equal(classifyResponse(status).status,'unknown');
 assert.equal(classifyResponse(302,'https://auth.openai.com/login').code,'ACCESS_PROTECTED');
 assert.equal(classifyResponse(200,'','<html><title>Sign in to ChatGPT</title>').status,'unknown');
});
test('stale healthy evidence expires to unknown',()=>{
 const now=Date.now();assert.equal(effectiveStatus({status:'healthy',checked_at:new Date(now-FRESHNESS_MS-1).toISOString()},now),'unknown');
 assert.equal(effectiveStatus({status:'healthy',checked_at:new Date(now).toISOString()},now),'healthy');
});
test('requests remain restricted to known Sites hosts without private endpoints or redirects',()=>{
 assert.equal(allowedTarget('https://cura-care-runtime.premiumlife.chatgpt.site/'),true);
 for(const url of ['http://cura-care-runtime.premiumlife.chatgpt.site/','https://127.0.0.1/','https://example.com/','https://a.premiumlife.chatgpt.site.evil.com/','https://a.premiumlife.chatgpt.site/?token=x','https://user:pass@a.premiumlife.chatgpt.site/','https://a.premiumlife.chatgpt.site/api/delete'])assert.equal(allowedTarget(url),false);
});
test('failed queries retry once and report the observed outcome',async()=>{
 let calls=0;const r=await probe({url:'https://cura-care-runtime.premiumlife.chatgpt.site/'},async(_url,options)=>{calls++;assert.equal(options.redirect,'manual');return new Response('temporary',{status:calls===1?503:200});});
 assert.equal(calls,2);assert.equal(r.status,'healthy');assert.equal(r.attempts,2);
});
test('persistent connection failure produces bounded evidence without guessing the cause',async()=>{
 let calls=0;const r=await probe({url:'https://cura-care-runtime.premiumlife.chatgpt.site/'},async()=>{calls++;throw new Error('private-secret');});
 assert.equal(calls,2);assert.equal(r.status,'critical');assert.equal(r.code,'CONNECTION_FAILED');assert.ok(!r.detail.includes('private-secret'));
});
test('no published address never triggers a request',async()=>{
 const r=await probe({url:null},async()=>{throw new Error('must not run');});assert.equal(r.status,'unknown');assert.equal(r.attempts,0);
});
