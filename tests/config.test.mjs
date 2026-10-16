import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { DEFAULT_COMMAND, validateConfig, commandAt, parseCommand, encodeContent } from '../src/config.js';
import { publishConfig } from '../src/github.js';
const config = JSON.parse(await readFile(new URL('../public/config.json', import.meta.url), 'utf8'));
test('public default preserves camera settings and synchronizes time',()=>{
  assert.equal(validateConfig(config).command, DEFAULT_COMMAND);
  assert.equal(config.syncTime, true);
  assert.equal(commandAt(config, new Date(2026,9,16,9,37,4)), DEFAULT_COMMAND);
  assert.equal(commandAt(config, new Date(2026,9,16,9,37,7)), DEFAULT_COMMAND.replace('093704', '093707'));
  assert.equal(commandAt({...config, syncTime:false}), DEFAULT_COMMAND);
});
test('imports complete URLs including escaped special characters',()=>{
  const command = 'mVoMPRES="3,A+B& #100%"';
  assert.equal(parseCommand('https://gopro.github.io/labs/control/set/?cmd='+encodeURIComponent(command)),command);
  assert.equal(parseCommand(DEFAULT_COMMAND),DEFAULT_COMMAND);
  assert.throws(()=>parseCommand('https://example.com/'));
});
test('live time replaces fixed timestamp while preserving settings',()=>{
  const date = new Date(2026,9,16,9,37,4);
  assert.equal(commandAt({...config,syncTime:true},date),DEFAULT_COMMAND);
  assert.equal(commandAt({...config,command:'mV',syncTime:true},date),'mVoT261016093704');
  assert.equal(commandAt({...config,command:'mVoT261016093704.100oTI12345',syncTime:true},date),'mVoT261016093704');
});
test('rejects empty, non-ASCII, oversized or invalid config',()=>{
  for(const invalid of [null,{}, {...config,version:2},{...config,command:''},{...config,command:'Tiếng Việt'},{...config,command:'x'.repeat(1201)},{...config,syncTime:'yes'}]) assert.throws(()=>validateConfig(invalid));
});
test('UTF-8 GitHub content is encoded without corruption',()=>{
  const value={...config,note:'Cấu hình'};
  assert.deepEqual(JSON.parse(Buffer.from(encodeContent(value),'base64').toString('utf8')),value);
});
test('publish uses latest blob SHA and correct branch; credentials stay in headers',async()=>{
  const calls=[];
  const fetcher=async(url,options)=>{calls.push({url,options});return calls.length===1?Response.json({sha:'current-sha'}):Response.json({commit:{sha:'new-sha'}});};
  await publishConfig({repository:'owner/repo',branch:'main',token:'test-secret',config,fetcher});
  assert.equal(calls.length,2);assert.match(calls[0].url,/ref=main/);
  assert.equal(calls[1].options.headers.Authorization,'Bearer test-secret');
  const body=JSON.parse(calls[1].options.body);
  assert.equal(body.sha,'current-sha');assert.equal(body.branch,'main');
  assert.deepEqual(JSON.parse(Buffer.from(body.content,'base64').toString('utf8')),config);
  assert.ok(!calls[1].url.includes('test-secret'));assert.ok(!calls[1].options.body.includes('test-secret'));
});
test('publish conflict does not silently overwrite concurrent edits',async()=>{
  let calls=0;
  await assert.rejects(()=>publishConfig({repository:'owner/repo',branch:'main',token:'secret',config,
    fetcher:async()=>++calls===1?Response.json({sha:'old'}):new Response('',{status:409})}),/người khác/);
});
test('unauthorized requests do not attempt writes',async()=>{
  let calls=0;
  await assert.rejects(()=>publishConfig({repository:'owner/repo',branch:'main',token:'secret',config,
    fetcher:async()=>{calls++;return new Response('',{status:401});}}),/Token/);
  assert.equal(calls,1);
});
