import './style.css';
import { setupLabs, ownerCommand, overlayCommand, SAMPLE_COMMAND } from './labs.js';
import { setupControls } from './controls.js';
import { loadConfig, validateConfig, parseCommand, commandAt, DEFAULT_COMMAND, DRAFT_KEY } from './config.js';
import { renderQR } from './qr.js';
import { publishConfig } from './github.js';
const $ = selector => document.querySelector(selector);
const base = import.meta.env.BASE_URL;
let mode = 'form', generated = '', valid = false, drawing = false, pending = null, toastTimer, publishing = false;
const controls = setupControls(base, command => { generated = command; });
controls.defaults();
const labs = setupLabs();
function toast(message) {
  $('#toast').textContent=message; $('#toast').hidden=false;
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>{$('#toast').hidden=true;},3500);
}
function currentConfig() {
  let command;
  if (mode === 'raw') command = parseCommand($('#raw-command').value);
  else {
    if ($('#np').checked && /["\\]/.test($('#newpres').value)) throw new Error('Tên preset không được chứa dấu nháy kép hoặc gạch chéo ngược.');
    controls.refresh();
    const fixed = $('#fixed-time').value.trim();
    if (!$('#sync-time').checked && fixed && !/^\d{12}$/.test(fixed)) throw new Error('Thời gian cố định cần đúng 12 chữ số YYMMDDhhmmss.');
    command = labs.command() + generated + (!$('#sync-time').checked && fixed ? 'oT' + fixed : '');
  }
  return validateConfig({ version:1, command, syncTime:$('#sync-time').checked,
    editor: mode === 'form' ? { ...controls.snapshot(), fixedTime:$('#fixed-time').value, labs:labs.snapshot() } : null });
}
async function drawLatest(command) {
  pending = command;
  if (drawing) return;
  drawing = true;
  try {
    while (pending !== null) { const next = pending; pending = null; await renderQR($('#preview-qr'), next); }
  } finally { drawing = false; }
}
async function refresh() {
  try {
    const config = currentConfig();
    const command = commandAt(config);
    $('#command-output').textContent = command;
    await drawLatest(command);
    valid = true; $('#qr-error').hidden = true; $('#preview-qr').hidden = false;
  } catch (err) {
    valid = false; $('#qr-error').textContent = err.message; $('#qr-error').hidden = false; $('#preview-qr').hidden = true;
  }
  for (const id of ['publish-button','download-qr','save-draft','preview-page','copy-command']) $(`#${id}`).disabled = !valid || (id === 'publish-button' && publishing);
}
function setMode(next) {
  mode = next;
  $('#form-editor').hidden = next !== 'form'; $('#raw-editor').hidden = next !== 'raw';
  for (const type of ['form','raw']) {
    $(`#${type}-mode`).classList.toggle('active', next===type);
    $(`#${type}-mode`).setAttribute('aria-pressed', String(next===type));
  }
}
function apply(config) {
  $('#sync-time').checked = config.syncTime;
  labs.restore(config.editor?.labs);
  if (config.editor?.fields) {
    controls.restore(config.editor); controls.syncSelects();
    $('#fixed-time').value = config.editor.fixedTime ?? ''; setMode('form');
  } else if (config.command === DEFAULT_COMMAND) {
    controls.defaults(); $('#fixed-time').value='261016134705'; setMode('form');
  } else { $('#raw-command').value=config.command; setMode('raw'); }
  refresh();
}
document.querySelectorAll('[data-quick]').forEach(button => { button.onclick = () => {
  try {
    const state = labs.snapshot(), type = button.dataset.quick;
    const commands = {
      sample: () => SAMPLE_COMMAND,
      time: () => 'oT261016134705',
      owner: () => ownerCommand({ ...state, ownerMode: state.ownerMode === 'clear' ? 'clear' : 'set' }),
      overlay: () => overlayCommand({ ...state, overlayMode: state.overlayMode === 'clear' ? 'clear' : 'set' }),
      qrdr: () => 'oMQRDR=1', video: () => 'mVr1080p30', photo: () => 'mP', start: () => '!S', stop: () => '!E',
    };
    $('#raw-command').value = commands[type]();
    $('#sync-time').checked = type === 'time' || type === 'sample';
    setMode('raw'); refresh();
    toast('Đã tạo mẫu QR. Chỉnh lệnh tại ô nhập hoặc quay lại Chọn thông số để chỉnh biểu mẫu.');
  } catch (err) { toast(err.message); }
}; });
$('#raw-mode').onclick=()=>{
  try { $('#raw-command').value=currentConfig().command; setMode('raw'); refresh(); } catch(err){toast(err.message);}
};
$('#form-mode').onclick=()=>{setMode('form');refresh();};
for (const event of ['input','change']) $('.intro-card').addEventListener(event, ()=> {refresh();});
// Source image handlers update their internal state before this listener runs.
$('#camera-controls').addEventListener('click', event => {
  if (event.target.closest('#ICONS_IMG, #LCD')) { controls.syncSelects(); refresh(); }
});
function saveDraft() {
  const config=currentConfig();localStorage.setItem(DRAFT_KEY, JSON.stringify(config));
  $('#draft-status').textContent='Đã lưu bản nháp trên trình duyệt này. Chưa xuất bản.';return config;
}
$('#save-draft').onclick=()=>{try{saveDraft();toast('Đã lưu bản nháp.');}catch(err){toast(err.message);}};
$('#reset-default').onclick=()=>{
  apply({version:1, command:DEFAULT_COMMAND, syncTime:true, editor:null});
  $('#draft-status').textContent='Đã khôi phục mặc định. Chưa xuất bản.';
};
$('#preview-page').onclick=()=>{
  try {saveDraft();window.open(`${base}?preview=draft`, '_blank', 'noopener');}catch(err){toast(err.message);}
};
$('#copy-command').onclick=async()=>{try{await navigator.clipboard.writeText($('#command-output').textContent);toast('Đã sao chép lệnh GoPro.');}catch{toast('Không thể truy cập clipboard. Bạn có thể chọn và sao chép lệnh.');}};
$('#download-qr').onclick=()=>{
  const a=document.createElement('a');a.download='gopro-qr.png';a.href=$('#preview-qr').toDataURL('image/png');a.click();
};
$('#publish-form').addEventListener('submit', async event=>{
  event.preventDefault();
  const button=$('#publish-button'), result=$('#publish-result');
  try {
    const config=currentConfig();
    publishing=true;button.disabled=true;button.textContent='Đang xuất bản…';result.hidden=true;
    const repository=$('#repository').value.trim(), branch=$('#branch').value.trim();
    await publishConfig({repository,branch,token:$('#github-token').value.trim(),config});
    result.classList.remove('error');
    result.textContent='Đã lưu cấu hình vào GitHub. Đợi workflow Pages hoàn tất để QR công khai được cập nhật. ';
    const link=document.createElement('a');link.href=`https://github.com/${repository}/actions`;link.target='_blank';link.rel='noopener';link.textContent='Xem tiến trình ↗';result.append(link);
    $('#draft-status').textContent='Đã gửi cấu hình lên GitHub. Đang chờ triển khai.';
  }catch(err){result.classList.add('error');result.textContent=err.message;}
  finally{publishing=false;$('#github-token').value='';button.textContent='Xuất bản cấu hình ↗';button.disabled=!valid;result.hidden=false;}
});
$('#repository').addEventListener('input',()=>{
  const repo=$('#repository').value.trim();if(/^[\w.-]+\/[\w.-]+$/.test(repo))$('#actions-link').href=`https://github.com/${repo}/actions`;
});
async function initialize() {
try {
  const config=await loadConfig(base);
  const draft=localStorage.getItem(DRAFT_KEY);
  if(draft){try{apply(validateConfig(JSON.parse(draft)));$('#draft-status').textContent='Đang chỉnh bản nháp đã lưu trên trình duyệt này.';}catch{apply(config);}}
  else apply(config);
}catch(err){
  $('#load-error').textContent=err.message+' Đang hiển thị bản mặc định; kiểm tra cấu hình trước khi xuất bản.';$('#load-error').hidden=false;await refresh();
}
}
initialize();
setInterval(()=>{if($('#sync-time').checked&&!document.hidden)refresh();},1000);
