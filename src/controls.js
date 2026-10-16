import markup from './vendor/controls.html?raw';
import { createEngine } from './vendor/engine.js';
const translations = {
  'Camera Mode:':'Chế độ camera', 'Video Resolution:':'Độ phân giải video', 'FPS Video:':'Tốc độ khung hình (FPS)',
  'Hypersmooth:':'Chống rung HyperSmooth', 'Lens:':'Ống kính', 'Zoom:':'Thu phóng', 'Burst Style:':'Kiểu chụp liên tiếp',
  'TimeWarp Speed:':'Tốc độ TimeWarp', 'Timelapse Interval:':'Khoảng cách Timelapse', 'Nightlapse Interval:':'Khoảng cách Nightlapse',
  'Shutter:':'Màn trập', 'Hindsight':'Ghi trước Hindsight', 'Duration':'Thời lượng ghi', 'Photo Properties:':'Định dạng ảnh',
  'Wind Reduction:':'Giảm tiếng gió', 'Custom Named Presets':'Đặt tên preset', 'Preset name:':'Tên preset:',
  'delete custom preset':'Xóa preset', 'Spot Metering':'Đo sáng điểm', 'Disable Spot':'Tắt đo sáng điểm',
  'Exposure Lock 3s after scan (to avoid locking on the QR Code)':'Khóa phơi sáng sau 3 giây (tránh đo sáng vào mã QR)',
  'Spot Meter Coord (x,y):':'Tọa độ đo sáng (x,y):', 'Protune Controls':'Thiết lập Protune', 'Protune Reset:':'Đặt lại Protune:',
  'Protune Color:':'Màu Protune', 'Color Depth:':'Độ sâu màu', 'Bit rate:':'Bitrate', 'White Balance:':'Cân bằng trắng',
  'ISO Min:':'ISO tối thiểu', 'ISO Max:':'ISO tối đa', 'Lock Shutter:':'Góc màn trập', 'Sharpness:':'Độ sắc nét',
  'RAW Audio:':'Âm thanh RAW', 'EV Compensation:':'Bù phơi sáng (EV)', 'Camera Preferences':'Tùy chọn camera',
  'GPS:':'GPS', 'Voice Control:':'Điều khiển giọng nói', 'Quick Capture:':'Quay nhanh', 'Default Mode:':'Chế độ khởi động',
  'Beep Volume:':'Âm lượng bíp', 'Display Brightness:':'Độ sáng màn hình', 'LEDs On:':'Đèn LED', 'Orientation Lock:':'Khóa hướng',
  'Camera Auto Off:':'Tự tắt camera', 'Screen Auto Off:':'Tự tắt màn hình', 'WiFi Connections:':'Kết nối Wi-Fi',
  'Voice Language:':'Ngôn ngữ giọng nói', 'Delayed Actions':'Hành động hẹn giờ', 'Additional Commands:':'Lệnh bổ sung:',
  'Click to select the preferred icon:':'Chọn biểu tượng preset:', 'Start Capture:':'Bắt đầu ghi', 'End Capture:':'Kết thúc ghi',
  'Shutdown and capture in:':'Tắt máy và bắt đầu ghi sau:', 'End capture after:':'Kết thúc ghi sau:',
  'Start via Motion Detection:':'Ghi khi phát hiện chuyển động:', 'Start at GPS Velocity (km/h):':'Ghi theo tốc độ GPS (km/h):',
  'hours':'giờ', 'mins':'phút', 'secs':'giây', 'or':'hoặc', 'at camera time:':'vào giờ camera:',
  '(format 24hr HH:MM)':'(định dạng 24 giờ HH:MM)', 'minutes after':'phút sau', 'sunrise':'bình minh', 'sunset':'hoàng hôn',
  'e.g. -30 for mins before (requires GPS)':'ví dụ -30 là trước 30 phút (cần GPS)',
  'e.g. -45 for mins before (requires GPS)':'ví dụ -45 là trước 45 phút (cần GPS)',
  'start':'bắt đầu', 'end sensitivity (1-9)':'độ nhạy kết thúc (1–9)', 'Delay start:':'Trì hoãn bắt đầu:',
  'seconds to get out of the shot.':'giây để rời khỏi khung hình.', 'Mask motion:':'Học chuyển động nền:',
  'seconds to learn background motion.':'giây để học chuyển động nền.', 'Hold time:':'Tiếp tục ghi:',
  'seconds to capture after motion stops.':'giây sau khi chuyển động dừng.',
  'start speed':'tốc độ bắt đầu', 'end speed':'tốc độ kết thúc', 'seconds)':'giây)',
  'in 1 sec':'Sau 1 giây', 'in 3 secs':'Sau 3 giây', 'in 30 secs':'Sau 30 giây',
  'End after 5 secs':'Sau 5 giây', 'End after 10 secs':'Sau 10 giây', 'End after 1 min':'Sau 1 phút', 'End after 10 min':'Sau 10 phút',
  'Performance':'Hiệu năng', 'Endurance':'Tiết kiệm pin', 'Stationary':'Cố định', 'Photo':'Chụp ảnh', 'Burst':'Chụp liên tiếp',
  'Night':'Chụp đêm', 'JPEG only':'Chỉ JPEG', 'Raw + JPEG':'RAW + JPEG', 'Enable Wide':'Bật góc rộng',
  'Enable Superview':'Bật Superview', 'Enable MSV':'Bật MSV', 'Enable MHV':'Bật MHV', 'Disable MLM':'Tắt Max Lens Mod',
  '1 mins':'1 phút', '2 mins':'2 phút', '3 mins':'3 phút', '5 mins':'5 phút', '15 mins':'15 phút', '30 mins':'30 phút',
  'not set':'Không thay đổi', 'Off':'Tắt', 'On':'Bật', 'off':'Tắt', 'on':'Bật', 'Auto':'Tự động', 'auto':'Tự động',
  'Wide':'Góc rộng', 'Narrow':'Góc hẹp', 'Linear':'Tuyến tính', 'High':'Cao', 'Medium':'Trung bình', 'Low':'Thấp',
  'Standard':'Tiêu chuẩn', 'Natural':'Tự nhiên', 'Vibrant':'Rực rỡ', 'Flat':'Phẳng', 'Last Used':'Lần dùng gần nhất',
  'All Off':'Tắt tất cả', 'Rear Only':'Chỉ phía sau', 'All On':'Bật tất cả', 'Never':'Không bao giờ',
  'Unlocked':'Không khóa', 'Repeat Command':'Lặp lại lệnh', 'Now':'Ngay lập tức',
};
function translateText(text) {
  const trim = text.trim();
  return translations[trim] ? text.replace(trim, translations[trim]) : text;
}
export function setupControls(base, onCommand) {
  const root = document.querySelector('#camera-controls');
  root.innerHTML = markup.replaceAll('__BASE__', base);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) walker.currentNode.textContent = translateText(walker.currentNode.textContent);
  root.querySelector('#noteMODE').textContent = 'Camera cần có preset riêng cho từng chế độ timelapse / nightlapse dạng video và ảnh. Nếu lệnh chưa chuyển được chế độ, hãy tạo preset tương ứng trên camera trước.';
  root.querySelector('#newpres').maxLength = 16;
  for (const input of root.querySelectorAll('input[type=text]')) {
    input.setAttribute('aria-label', ({ newpres:'Tên preset', addcmd:'Lệnh bổ sung',
      starthrs:'Giờ chờ bắt đầu', startmins:'Phút chờ bắt đầu', startsecs:'Giây chờ bắt đầu',
      time:'Giờ bắt đầu HH:MM', endhrs:'Giờ chờ kết thúc', endmins:'Phút chờ kết thúc', endsecs:'Giây chờ kết thúc',
      endtime:'Giờ kết thúc HH:MM', risemins:'Phút sau bình minh', setmins:'Phút sau hoàng hôn',
      mstart:'Độ nhạy bắt đầu', mend:'Độ nhạy kết thúc', dhold:'Trì hoãn ghi', mmhold:'Thời gian học nền',
      mhold:'Thời gian giữ ghi', vstart:'Tốc độ bắt đầu', vend:'Tốc độ kết thúc', vhold:'Thời gian giữ theo GPS',
    })[input.id] || input.id);
  }
  const selects = [];
  const names = [...new Set([...root.querySelectorAll('input[type=radio]')].map(x => x.name))];
  for (const name of names) {
    const radios = [...root.querySelectorAll('input[type=radio]')].filter(x => x.name === name);
    const parent = radios[0].parentElement;
    const title = name === 'mode' ? 'Chế độ camera' : (parent.querySelector('b')?.textContent.trim() || name);
    const field = document.createElement('label');
    field.className = 'control-label';
    field.textContent = title;
    const select = document.createElement('select');
    select.id = `select-${name}`;
    field.htmlFor = select.id;
    for (const radio of radios) {
      const label = root.querySelector(`label[for="${radio.id}"]`);
      const option = document.createElement('option');
      option.value = radio.id;
      if (label) for (const sup of label.querySelectorAll('sup')) sup.textContent = ` (${sup.textContent})`;
      option.textContent = label?.textContent.replace(/\s+/g,' ').trim() || radio.value;
      option.selected = radio.checked;
      select.append(option);
      label?.remove();
    }
    const hidden = document.createElement('div');
    hidden.hidden = true;
    hidden.append(...radios);
    parent.replaceChildren(field, select, hidden);
    select.addEventListener('change', () => { document.getElementById(select.value).checked = true; });
    selects.push({ select, radios });
  }
  const engine = createEngine(onCommand);
  // Accessible alternatives to the source's pointer-only image selectors.
  const iconLabel = document.createElement('label');
  iconLabel.className = 'icon-picker';
  iconLabel.textContent = 'Biểu tượng preset (0–32):';
  const icon = document.createElement('input');
  icon.type = 'number'; icon.min = '0'; icon.max = '32'; icon.value = '3'; icon.id = 'preset-icon';
  iconLabel.append(icon);
  root.querySelector('#ICONS').prepend(iconLabel);
  icon.addEventListener('input', () => {
    const state = engine.snapshot(); state.icon = Math.max(0,Math.min(32,Number(icon.value)||0)); engine.restore(state);
  });
  const spot = document.createElement('div');
  spot.className = 'icon-picker';
  spot.innerHTML = '<label for="spot-x">X (%)</label><input id="spot-x" type="number" min="10" max="90" value="50"><label for="spot-y">Y (%)</label><input id="spot-y" type="number" min="10" max="90" value="50">';
  root.querySelector('#spotMeter').prepend(spot);
  spot.addEventListener('input', () => {const state=engine.snapshot();state.spot=[Number(root.querySelector('#spot-x').value),Number(root.querySelector('#spot-y').value)];engine.restore(state);});
  function syncSelects() {
    for (const { select, radios } of selects) select.value = radios.find(x => x.checked)?.id || '';
    icon.value = engine.snapshot().icon;
    const coords = engine.snapshot().spot;
    root.querySelector('#spot-x').value = coords[0]; root.querySelector('#spot-y').value = coords[1];
  }
  return { ...engine, syncSelects, defaults() {
    root.querySelectorAll('input').forEach(input => {
      if (input.type === 'radio' || input.type === 'checkbox') input.checked = input.defaultChecked;
      else input.value = input.defaultValue;
    });
    for (const id of ['m1','r1','p3','eis2','f1','np']) root.querySelector(`#${id}`).checked = true;
    root.querySelector('#newpres').value = 'TUAN-7820';
    const state = engine.snapshot(); state.icon = 3; state.spot=[50,50]; engine.restore(state);
    syncSelects();
  } };
}
