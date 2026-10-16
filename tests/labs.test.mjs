import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LABS_DEFAULTS, SAMPLE_COMMAND, ownerCommand, overlayCommand } from '../src/labs.js';
import { validateConfig, commandAt } from '../src/config.js';
test('sample matches requested Labs payload, including literal line separators', () => {
  assert.equal(ownerCommand({ ...LABS_DEFAULTS, ownerMode:'set' }), '!MOWNR="Labs782\\nScan QR to settings\\nVNW0014732"');
  assert.equal(overlayCommand({ ...LABS_DEFAULTS, overlayMode:'set' }), 'oMBRNO=10oMBURN="(0,20)[BRyyyy/mm/dd HH:MM:SS AA]"');
  assert.equal(SAMPLE_COMMAND, 'mVoMPRES="3,TUAN-7820"mVr1080p30e1!NfW0' + ownerCommand({...LABS_DEFAULTS,ownerMode:'set'}) + 'g0' + overlayCommand({...LABS_DEFAULTS,overlayMode:'set'}));
});
test('keep, clear and permanent storage have explicit commands', () => {
  assert.equal(ownerCommand(LABS_DEFAULTS), '');
  assert.equal(overlayCommand(LABS_DEFAULTS), '');
  assert.equal(ownerCommand({...LABS_DEFAULTS,ownerMode:'clear'}), '!MOWNR=""');
  assert.equal(overlayCommand({...LABS_DEFAULTS,overlayMode:'clear'}), 'oMBURN=""');
  assert.equal(overlayCommand({...LABS_DEFAULTS,overlayMode:'clear',permanent:true}), '!MBURN=""');
  assert.match(overlayCommand({...LABS_DEFAULTS,overlayMode:'set',permanent:true}), /^!MBRNO=10!MBURN=/);
});
test('rejects command injection, unsupported text and invalid geometry', () => {
  for (const owner of ['a"!S"', 'Tiếng Việt', 'bad\\q', '', 'x'.repeat(65)]) assert.throws(()=>ownerCommand({...LABS_DEFAULTS,ownerMode:'set',owner}));
  for (const patch of [{height:'-1'},{width:'201'},{offset:''},{offset:'1.5'},{position:'XX'},{text:'[BRbad]'},{date:'"!S'},{date:'',time:''}]) assert.throws(()=>overlayCommand({...LABS_DEFAULTS,overlayMode:'set',...patch}));
});
test('sync clock preserves timestamp-looking owner and overlay text', () => {
  const command = '!MOWNR="oT261016093704 PhotoTeam"oMBURN="(0,20)[BRoT261016093704]"oT261016093704';
  const config=validateConfig({version:1,command,syncTime:true});
  assert.equal(commandAt(config,new Date(2026,9,17,12,13,14)), command.replace(/oT\d{12}$/, 'oT261017121314'));
});
