export const DEFAULT_COMMAND = 'mVoMPRES="3,TUAN-7820"mVr1080p30e1!NfW0oT261016093704';
export const DRAFT_KEY = 'gopro-qr-draft-v1';
export function validateConfig(value) {
  if (!value || value.version !== 1 || typeof value.command !== 'string' || !value.command.trim()) {
    throw new Error('Cấu hình không hợp lệ: cần version 1 và lệnh GoPro.');
  }
  if (value.command.length > 1200 || /[^\x20-\x7e\n\r]/.test(value.command)) {
    throw new Error('Lệnh cần dùng ký tự ASCII và tối đa 1.200 ký tự.');
  }
  if (typeof value.syncTime !== 'boolean') throw new Error('Thiếu tùy chọn đồng bộ thời gian.');
  if (value.syncTime && /oT\d{12}(?:\.\d+)?(?:oTI\d+)?/g.test(value.command) === false) {
    // A live clock may also be added to a command that has no fixed timestamp.
    if (/oT/.test(value.command)) throw new Error('Định dạng thời gian trong lệnh không hợp lệ.');
  }
  return { version: 1, command: value.command.trim(), syncTime: value.syncTime, editor: value.editor ?? null };
}
export function commandAt(config, date = new Date()) {
  if (!config.syncTime) return config.command;
  const stamp = [date.getFullYear() % 100, date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()]
    .map(n => String(n).padStart(2, '0')).join('');
  return config.command.replace(/oT\d{12}(?:\.\d+)?(?:oTI\d+)?/g, '') + 'oT' + stamp;
}
export function parseCommand(input) {
  const text = input.trim();
  if (!/^https?:\/\//i.test(text)) return text;
  const url = new URL(text);
  const command = url.searchParams.get('cmd');
  if (!command) throw new Error('Liên kết chưa có tham số cmd.');
  return command;
}
export async function loadConfig(base) {
  const response = await fetch(`${base}config.json`, { cache: 'no-store' });
  if (!response.ok) throw new Error('Không tải được cấu hình QR. Vui lòng tải lại trang.');
  return validateConfig(await response.json());
}
export function encodeContent(value) {
  return btoa(Array.from(new TextEncoder().encode(JSON.stringify(value, null, 2) + '\n'), byte => String.fromCharCode(byte)).join(''));
}
