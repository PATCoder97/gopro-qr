// Syntax follows gopro/labs docs/control/{owner,overlays}.
export const SAMPLE_COMMAND = 'mVoMPRES="3,TUAN-7820"mVr1080p30e1!NfW0!MOWNR="Labs782\\nScan QR to settings\\nVNW0014732"g0oMBRNO=10oMBURN="(0,20)[BRyyyy/mm/dd HH:MM:SS AA]"';
export const LABS_DEFAULTS = {
  ownerMode: 'keep', owner: 'Labs782\nScan QR to settings\nVNW0014732',
  overlayMode: 'keep', permanent: false, position: 'BR', width: '0', height: '20', offset: '10',
  date: 'yyyy/mm/dd', time: 'HH:MM:SS AA', text: '',
};
function quoted(text, label) {
  // Labs uses literal backslash-n for line breaks, not JSON escaping.
  const value = String(text).replace(/\r\n?/g, '\n').replaceAll('\n', '\\n');
  if (/[^\x20-\x7e]/.test(value) || /"/.test(value) || /\\(?!n)/.test(value)) {
    throw new Error(`${label}: dùng ký tự không dấu, không có dấu nháy kép; xuống dòng bằng Enter hoặc \\n.`);
  }
  return value;
}
function integer(value, min, max, label) {
  if (!/^\d+$/.test(String(value)) || Number(value) < min || Number(value) > max) throw new Error(`${label}: nhập số nguyên ${min}–${max}.`);
  return Number(value);
}
export function ownerCommand(state) {
  if (state.ownerMode === 'keep') return '';
  if (state.ownerMode === 'clear') return '!MOWNR=""';
  if (state.ownerMode !== 'set' || !state.owner.trim()) throw new Error('Nhập thông tin chủ sở hữu.');
  const owner = quoted(state.owner, 'Chủ sở hữu');
  if (owner.length > 64) throw new Error('Thông tin chủ sở hữu tối đa 64 ký tự (mỗi \\n tính 2 ký tự).');
  return `!MOWNR="${owner}"`;
}
export function overlayCommand(state) {
  if (state.overlayMode === 'keep') return '';
  const prefix = state.permanent ? '!M' : 'oM';
  if (state.overlayMode === 'clear') return `${prefix}BURN=""`;
  if (state.overlayMode !== 'set' || !['TL','TC','TR','ML','MR','BL','BC','BR'].includes(state.position)) throw new Error('Vị trí overlay không hợp lệ.');
  const width = integer(state.width, 0, 200, 'Chiều ngang');
  const height = integer(state.height, 0, 200, 'Chiều cao');
  const offset = integer(state.offset, 10, 150, 'Khoảng cách mép');
  const content = [state.date, state.time].filter(Boolean).join(' ');
  const text = quoted(state.text, 'Chữ overlay');
  const format = quoted(content, 'Định dạng ngày giờ');
  if (/[\[\]]/.test(text + format)) throw new Error('Nội dung overlay không được chứa dấu [ hoặc ].');
  if (!text && !format) throw new Error('Nhập chữ hoặc định dạng ngày giờ cho overlay.');
  return `${prefix}BRNO=${offset}${prefix}BURN="(${width},${height})${text}[${state.position}${format}]"`;
}
export function setupLabs() {
  const root = document.querySelector('#labs-controls');
  const fields = [...root.querySelectorAll('[data-labs]')];
  const snapshot = () => Object.fromEntries(fields.map(input => [input.dataset.labs, input.type === 'checkbox' ? input.checked : input.value]));
  function restore(value = {}) {
    const state = { ...LABS_DEFAULTS, ...value };
    for (const input of fields) {
      if (input.type === 'checkbox') input.checked = state[input.dataset.labs] === true;
      else input.value = state[input.dataset.labs];
    }
  }
  restore();
  return { snapshot, restore, command() { const state = snapshot(); return ownerCommand(state) + overlayCommand(state); } };
}
