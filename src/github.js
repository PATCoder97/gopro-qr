import { encodeContent } from './config.js';
export async function publishConfig({ repository, branch, token, config, fetcher = fetch }) {
  if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repository)) throw new Error('Repository cần có dạng owner/repository.');
  if (!branch.trim()) throw new Error('Nhập tên nhánh triển khai.');
  const url = `https://api.github.com/repos/${repository}/contents/public/config.json`;
  const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' };
  const current = await fetcher(`${url}?ref=${encodeURIComponent(branch)}`, { headers, cache: 'no-store' });
  let sha;
  if (current.ok) sha = (await current.json()).sha;
  else if (current.status !== 404) throw apiError(current.status);
  const response = await fetcher(url, {
    method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Cập nhật cấu hình QR GoPro', content: encodeContent(config), branch, ...(sha ? { sha } : {}) }),
  });
  if (!response.ok) throw apiError(response.status);
  return response.json();
}
function apiError(status) {
  const errors = {
    401:'Token GitHub không hợp lệ hoặc đã hết hạn.',
    403:'Token chưa có quyền Contents: Read and write, hoặc GitHub đang giới hạn truy cập.',
    404:'Không tìm thấy repository / nhánh, hoặc token chưa được cấp quyền truy cập.',
    409:'Cấu hình vừa được người khác cập nhật. Vui lòng xuất bản lại.',
    422:'GitHub từ chối ghi: kiểm tra nhánh triển khai và quy tắc bảo vệ nhánh.',
  };
  return new Error(errors[status] || `Không thể xuất bản cấu hình (HTTP ${status}).`);
}
