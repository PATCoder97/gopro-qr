import './style.css';
import { loadConfig, commandAt, validateConfig, DRAFT_KEY } from './config.js';
import { renderQR } from './qr.js';
const canvas = document.querySelector('#public-qr');
const error = document.querySelector('#scan-error');
const isDraft = new URLSearchParams(location.search).get('preview') === 'draft';
if (isDraft) {
  document.body.classList.add('preview-draft');
  const banner = document.createElement('div'); banner.className='draft-banner';
  banner.textContent='Bản nháp trên trình duyệt này · Chưa xuất bản';
  const link = document.createElement('a'); link.href=`${import.meta.env.BASE_URL}admin/`; link.textContent='Về quản trị';
  banner.append(link); document.body.append(banner);
}
let config;
let last = '';
async function draw() {
  if (!config || document.hidden) return;
  const command = commandAt(config);
  if (command === last) return;
  await renderQR(canvas, command);
  last = command;
  canvas.hidden = false;
  error.hidden = true;
}
async function refresh() {
  try {
    if (isDraft) {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (!draft) throw new Error('Chưa có bản nháp. Hãy lưu bản nháp trong trang quản trị.');
      config = validateConfig(JSON.parse(draft));
    } else config = await loadConfig(import.meta.env.BASE_URL);
    await draw();
  } catch (err) {
    // Keep the last successfully loaded QR during transient network failures.
    if (!last) { canvas.hidden = true; error.textContent = err.message; error.hidden = false; }
  }
}
refresh();
setInterval(() => draw().catch(() => {}), 1000);
setInterval(refresh, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
