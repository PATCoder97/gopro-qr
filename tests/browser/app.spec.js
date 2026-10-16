import { test, expect } from '@playwright/test';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { DEFAULT_COMMAND } from '../../src/config.js';
async function decode(page, selector) {
  const dataURL = await page.locator(selector).evaluate(canvas=>canvas.toDataURL('image/png'));
  const png=PNG.sync.read(Buffer.from(dataURL.split(',')[1],'base64'));
  return jsQR(new Uint8ClampedArray(png.data),png.width,png.height)?.data;
}
test('public page displays only QR with exact raw command, not a URL',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.locator('#public-qr')).toBeVisible();
  await expect.poll(()=>decode(page,'#public-qr')).toBe(DEFAULT_COMMAND);
  await expect(page.locator('body')).toHaveText('');expect(errors).toEqual([]);
});
test('admin default and changed settings decode correctly',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/admin');await expect(page.locator('#command-output')).toHaveText(DEFAULT_COMMAND);
  expect(await decode(page,'#preview-qr')).toBe(DEFAULT_COMMAND);
  await page.locator('#select-res').selectOption('r6');
  await expect(page.locator('#command-output')).toContainText('r4p30');
  await page.locator('#newpres').fill('NEW-PRESET');
  await expect(page.locator('#command-output')).toContainText('3,NEW-PRESET');
  await page.locator('#preset-icon').fill('5');
  await expect(page.locator('#command-output')).toContainText('5,NEW-PRESET');
  expect(await decode(page,'#preview-qr')).toContain('r4p30');expect(errors).toEqual([]);
});
test('local draft survives reload but never changes public page',async({page,context})=>{
  await page.goto('/admin/');await expect(page.locator('#command-output')).toHaveText(DEFAULT_COMMAND);
  await page.locator('#select-res').selectOption('r6');await page.locator('#save-draft').click();
  await page.reload();await expect(page.locator('#command-output')).toContainText('r4p30');
  const publicPage=await context.newPage();await publicPage.goto('/');
  await expect.poll(()=>decode(publicPage,'#public-qr')).toBe(DEFAULT_COMMAND);
  await publicPage.goto('/?preview=draft');await expect(publicPage.locator('.draft-banner')).toBeVisible();
  await expect.poll(()=>decode(publicPage,'#public-qr')).toContain('r4p30');
});
test('raw URL import, empty input guard and PNG download',async({page})=>{
  await page.goto('/admin/');await expect(page.locator('#command-output')).toHaveText(DEFAULT_COMMAND);
  await page.locator('#raw-mode').click();
  await page.locator('#raw-command').fill('https://gopro.github.io/labs/control/set/?cmd='+encodeURIComponent('mVr4p60'));
  await expect(page.locator('#command-output')).toHaveText('mVr4p60');
  const download=page.waitForEvent('download');await page.locator('#download-qr').click();expect((await download).suggestedFilename()).toBe('gopro-qr.png');
  await page.locator('#raw-command').fill('');await expect(page.locator('#qr-error')).toBeVisible();await expect(page.locator('#publish-button')).toBeDisabled();
});
test('publishing writes config with mock GitHub API and clears token',async({page})=>{
  let saved;
  await page.route('https://api.github.com/**',async route=>{
    if(route.request().method()==='GET')return route.fulfill({json:{sha:'old-sha'}});
    saved=route.request().postDataJSON();await route.fulfill({json:{commit:{sha:'new-sha'}}});
  });
  await page.goto('/admin/');await expect(page.locator('#command-output')).toHaveText(DEFAULT_COMMAND);
  await page.locator('#github-token').fill('test-token-123');await page.locator('#publish-button').click();
  await expect(page.locator('#publish-result')).toContainText('Đã lưu');
  expect(saved.sha).toBe('old-sha');expect(JSON.parse(Buffer.from(saved.content,'base64').toString()).command).toBe(DEFAULT_COMMAND);
  await expect(page.locator('#github-token')).toHaveValue('');
  expect(await page.evaluate(()=>JSON.stringify({...localStorage,...sessionStorage}))).not.toContain('test-token-123');
});
test('live time updates and preset/Protune/photo/action controls run without errors',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date('2026-10-16T09:37:04')});
  await page.goto('/admin/');await expect(page.locator('#command-output')).toHaveText(DEFAULT_COMMAND);
  await page.locator('#sync-time').check();const before=await page.locator('#command-output').textContent();
  await page.clock.fastForward(3000);await expect(page.locator('#command-output')).not.toHaveText(before);
  await page.locator('#pt').check();await page.locator('#select-ptc').selectOption('ptc3');
  await expect(page.locator('#command-output')).toContainText('cF');
  await page.locator('#select-mode').selectOption('m19');await expect(page.locator('#select-pfov')).toBeVisible();
  await page.locator('#select-mode').selectOption('m13');await expect(page.locator('#select-fpswarp')).toBeVisible();
  await page.locator('#actions').check();await page.locator('#startsecs').fill('10');
  await expect(page.locator('#command-output')).toContainText('!10S');
  expect(errors).toEqual([]);
});
for(const width of [320,390,1280])test(`responsive layout ${width}px has no page overflow`,async({page})=>{
  await page.setViewportSize({width,height:800});await page.goto('/admin/');await expect(page.locator('#command-output')).toHaveText(DEFAULT_COMMAND);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`test-results/admin-${width}.png`,fullPage:true});
  await page.goto('/');await expect(page.locator('#public-qr')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
