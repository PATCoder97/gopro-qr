# GoPro QR

Web tĩnh dùng GoPro Labs, triển khai trực tiếp lên GitHub Pages.

- `/`: hiển thị QR công khai, hướng dẫn quét và lưu ý xử phạt khi không tuân thủ
  cấu hình gây dung lượng video cao; không có nút quản trị hay thông số.
- `/admin/` (hoặc `/admin`): chỉnh thông số, xem trước, nhập lệnh/URL,
  tải PNG, lưu bản nháp và xuất bản cấu hình.
- Cấu hình mặc định giữ các thông số đã yêu cầu và bật đồng bộ giờ hiện tại.
  Mốc thời gian trong lệnh gốc dưới đây được thay bằng giờ thiết bị khi tạo QR:

```text
!MOWNR="Labs7820\nScan QR to settings\nVNW0014732"oMBRNO=10oMBURN="(0,20)[BRyyyy/mm/dd HH:MM:SS AA]"mVoMPRES="3,TUAN-7820"mVr1080p30e1!NfW0oT261016134705
```

QR chứa **lệnh GoPro trực tiếp**, không phải URL. Camera phải cài firmware
GoPro Labs phù hợp; thông số hỗ trợ tùy dòng máy. Các chỉ báo 10/11/12/13
trong danh sách theo trang mẫu, không tự kiểm tra khả năng camera.

## Chạy local

Cần Node.js 20.19+ hoặc 22+.

```bash
npm ci
npm run dev
```

Mở URL Vite in ra, thêm `/admin/` để chỉnh cấu hình.

```bash
npm test
npm run test:e2e
npm run build
npm run preview
```

Lần đầu chạy browser tests: `npx playwright install chromium`.

## GitHub Pages

1. Đẩy source lên nhánh `main` của repository.
2. Trong repo, mở **Settings → Pages → Build and deployment → Source**,
   chọn **GitHub Actions**. **Bước này bắt buộc trước lần chạy workflow đầu tiên.**
3. Workflow `.github/workflows/deploy.yml` chạy khi push `main`, hoặc chọn
   **Actions → Deploy GitHub Pages → Run workflow**.
4. Đợi job deploy thành công. Với repo hiện tại, địa chỉ dự kiến:
   - QR: `https://patcoder97.github.io/gopro-qr/`
   - Admin: `https://patcoder97.github.io/gopro-qr/admin/`

Nếu bước **Configure Pages** báo `HttpError: Not Found`, repository chưa được bật
Pages hoặc Source chưa chọn GitHub Actions. Mở
[Settings → Pages](https://github.com/PATCoder97/gopro-qr/settings/pages), chọn đúng
Source, rồi chạy lại workflow. `GITHUB_TOKEN` mặc định không thể tự bật Pages lần đầu;
chỉ thêm `enablement: true` sẽ không giải quyết được thiếu quyền này.

Workflow dùng runner `ubuntu-24.04` cố định và các action chạy Node.js 24,
tránh thay đổi từ `ubuntu-latest` và cảnh báo action Node.js 20. Node.js dùng để
build ứng dụng vẫn là phiên bản 22.

Workflow tự lấy base path từ GitHub Pages, hỗ trợ project Pages,
user/organization Pages và custom domain. Không cần cấu hình URL asset thủ công.
Nếu đổi nhánh, sửa `on.push.branches` trong workflow và nhập đúng nhánh ở admin.

## Cách cập nhật QR cho tất cả người dùng

### Xuất bản ngay trên admin

1. Chỉnh thông số hoặc nhập nguyên lệnh/URL GoPro Labs.
2. Kiểm tra QR xem trước. Có thể tải PNG hoặc mở bản nháp.
3. Nhập repository, nhánh `main`, và một **fine-grained personal access token**
   cấp cho đúng repository, quyền **Contents: Read and write**.
4. Bấm **Xuất bản cấu hình**. Web ghi `public/config.json` bằng GitHub Contents API;
   commit đó kích hoạt workflow Pages.
5. Mở **Xem GitHub Actions** và đợi deployment hoàn tất. API ghi file thành công
   chưa đồng nghĩa Pages đã deploy. Trang quét đang mở tải lại cấu hình mỗi 60 giây
   hoặc khi quay lại tab; CDN có thể cần thêm thời gian để cập nhật.

Admin là trang tĩnh công khai, không có tài khoản/mật khẩu riêng.
Quyền ghi được GitHub kiểm tra bằng token. Token nằm trong bộ nhớ khi gửi,
không ghi vào localStorage/sessionStorage, không đưa vào config, và ô token
được xóa sau mỗi lần gửi. Không dùng token quyền rộng hoặc chèn token vào source.
Nhánh có quy tắc bắt buộc PR có thể chặn ghi trực tiếp; khi đó chỉnh config qua PR.

### Cập nhật qua Git

Chỉnh `public/config.json`, giữ `version: 1`, rồi commit và push `main`.
Có thể đặt `editor: null` nếu chỉ chỉnh `command`.

### Bản nháp và thời gian

- **Lưu bản nháp** chỉ lưu trên trình duyệt đang dùng. Không cập nhật QR công khai.
- **Mở bản nháp** mở `?preview=draft`, đọc bản nháp trên cùng trình duyệt.
  URL này không chia sẻ được cấu hình sang thiết bị khác.
- Mặc định `syncTime: true`: QR dùng giờ hiện tại trên thiết bị mở trang và cập nhật mỗi giây.
  Nếu tắt đồng bộ, có thể dùng thời gian cố định; mốc gốc là `oT261016134705` (16/10/2026 13:47:05).
- Bật **Đồng bộ giờ hiện tại** để QR thay thời gian mỗi giây, theo giờ địa phương
  của thiết bị đang mở trang quét. Khi dùng, nên bảo đảm giờ thiết bị chính xác.
- **Về mặc định** thay cấu hình đang chỉnh; chỉ thay QR công khai sau khi xuất bản.

## Cấu trúc

- `src/public.js`: trang quét tối giản, tải cấu hình dùng chung.
- `src/admin.js`: bản nháp, xem trước và thao tác xuất bản.
- `src/vendor/`: điều khiển/bộ tạo lệnh GoPro Labs được chuyển thành module;
  giữ mã lệnh và điều kiện hiển thị của trang gốc.
- `src/github.js`: đọc SHA mới nhất, cập nhật config qua GitHub API, báo lỗi xung đột.
- `public/config.json`: cấu hình chung, được kiểm tra trước mỗi build.
- `.github/workflows/deploy.yml`: kiểm thử, build và deploy Pages.

Xem [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) cho nguồn và giấy phép GoPro Labs.
Tham khảo [GoPro QR Control](https://gopro.github.io/labs/control/custom/),
[GitHub Contents API](https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents)
và [Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Owner, overlay ngày giờ và QR cơ bản

Trong `/admin/`, phần **Chủ sở hữu & ngày giờ trên video** bổ sung:

- `OWNR`: giữ nguyên, ghi hoặc xóa thông tin chủ sở hữu. Nhập nhiều dòng bằng
  Enter hoặc `\n`; tối đa 64 ký tự ASCII không dấu. Thông tin lưu lâu dài trong camera.
- `BURN`: giữ nguyên, bật hoặc tắt overlay; chọn vị trí, kích thước và khoảng cách
  mép. Có thể chọn `yyyy/mm/dd` hoặc `dd/mm/yyyy`; `HH:MM:SS` là giờ 24 tiếng,
  thêm `AA` để dùng AM/PM. Overlay dùng giờ camera, nên đồng bộ giờ trước khi quay.
- Mặc định overlay chỉ có hiệu lực trong phiên bật máy. Bật **Lưu overlay lâu dài**
  để dùng `!M`; chọn **Tắt overlay** và bật lưu lâu dài để xóa overlay đã lưu.
  **Không thay đổi** chỉ bỏ lệnh khỏi QR, không xóa cài đặt trên camera.
- Các tùy chọn được lưu cùng bản nháp và cấu hình xuất bản.

**Tạo QR cơ bản** có mẫu đầy đủ TUAN-7820 + owner + ngày giờ như yêu cầu,
hoặc QR riêng cho đồng bộ giờ, owner, overlay, video 1080p30, chụp ảnh, bắt đầu/dừng ghi.
Có mẫu `oMQRDR=1` cho phép quét khi đang quay; quét mẫu này trước khi ghi nếu muốn dừng bằng QR.
Mẫu nhanh chuyển sang ô nhập lệnh để có thể sửa trực tiếp. QR owner/overlay riêng
lấy nội dung từ các ô tương ứng; các QR cơ bản khác chỉ thay đổi chức năng đã chọn.
Mẫu đầy đủ bật đồng bộ giờ hiện tại và dùng owner `Labs7820`, overlay ngày giờ cùng preset TUAN-7820.
Cấu hình mặc định của trang quét và nút **Về mặc định** đã bao gồm owner và overlay này.

Overlay ghi chữ trực tiếp vào hình ảnh, không thể gỡ khỏi video đã quay.
Theo tài liệu GoPro Labs, HERO10–13 chỉ hỗ trợ overlay ở 8-bit, 4K 16:9 tới 30fps,
2.7K tới 60fps, 1080p tới 120fps; khả năng thực tế còn tùy camera/firmware.
Mẫu không tự ép độ sâu màu: chọn 8-bit trên camera hoặc trong Protune khi cần.
Tham khảo [Owner](https://gopro.github.io/labs/control/owner/),
[Overlay](https://gopro.github.io/labs/control/overlays/),
[Extensions](https://gopro.github.io/labs/control/extensions/) và
[ngôn ngữ lệnh](https://gopro.github.io/labs/control/tech/).
