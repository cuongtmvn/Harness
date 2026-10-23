#!/usr/bin/env node
'use strict';
/*
 * kiem-project-harness.cjs — SessionStart hook MỨC MÁY (~/.claude/settings.json), chạy ở MỌI dự án trên máy.
 * Cài bằng: node <Harness>/07-cai-dat/muc-may/cai-muc-may.cjs --ap-dung. Bộ cài dự án KHÔNG chép tệp này.
 *
 * *** VÌ SAO ***
 * Mọi cơ chế nhắc của GlobalHarness (hook nhac-cap-nhat-harness, kiem-harness, lệnh "nạp context") nằm BÊN TRONG
 * ProjectHarness. Dự án chưa cài ProjectHarness thì không có gì trỏ về GlobalHarness ⇒ AI nạp bộ luật chép tay
 * và tưởng đó là harness hiện hành. Ca thật 23/10/2026: AIAutoNews (sinh trên điện thoại 16/10, chép tay harness
 * Thiên Số, hậu tố -AN) — "nạp context" đọc luật cũ, không biết GlobalHarness 1.6.3.
 * Huynh: "đệ cần phải điều khiển lại để các dự án tiếp theo không bị lỗi này".
 *
 * Làm gì: thư mục dự án KHÔNG có .harness-manifest.json ⇒ bơm cảnh báo vào ngữ cảnh AI + hiện cho chủ dự án.
 * Im lặng khi: là chính kho GlobalHarness · đã có bảng kê (hook nhac-cap-nhat-harness của ProjectHarness lo phần
 * còn lại) · không phải dự án (không có .git, không có CLAUDE.md). Không sửa gì, không bao giờ thoát khác 0.
 * Đường dẫn kho suy từ vị trí tệp này (<kho>/07-cai-dat/muc-may/) ⇒ settings trỏ thẳng vào kho, kho đổi là máy nhận.
 */
const fs = require('fs');
const path = require('path');

const HARNESS = path.resolve(__dirname, '..', '..');
const REPO = 'https://github.com/cuongtmvn/Harness.git';
const GOC = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const co = (p) => { try { return fs.existsSync(path.join(GOC, p)); } catch { return false; } };
const cung = (a, b) => path.resolve(a).toLowerCase().replace(/[\\/]+$/, '') === path.resolve(b).toLowerCase().replace(/[\\/]+$/, '');

function xuat(loi, ngan) {
  if (loi) process.stdout.write(JSON.stringify({
    systemMessage: ngan,
    hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: loi },
  }));
  process.exit(0);
}

try {
  if (cung(GOC, HARNESS)) xuat();
  if (co('.harness-manifest.json')) xuat();
  if (!co('.git') && !co('CLAUDE.md')) xuat();

  let ban = '(không đọc được VERSION)';
  try { ban = fs.readFileSync(path.join(HARNESS, 'VERSION'), 'utf8').trim(); } catch { /* kho không đọc được */ }

  // Dự án đã đăng ký với ghi chú ngoại lệ (banDangDung không phải số bản — ví dụ Thiên Số) ⇒ chỉ nhắc theo ghi chú.
  let dk = null;
  try {
    const so = JSON.parse(fs.readFileSync(path.join(HARNESS, '08-cap-nhat', 'DU-AN-DANG-KY.json'), 'utf8'));
    dk = (so.duAn || []).find((d) => d.duongDan && cung(d.duongDan, GOC)) || null;
  } catch { /* sổ không đọc được ⇒ coi như chưa đăng ký */ }
  if (dk && !/^\d+\.\d+\.\d+$/.test(String(dk.banDangDung || ''))) {
    xuat(`🧭 Dự án "${dk.ten}" đăng ký ở GlobalHarness (${HARNESS}, bản ${ban}) với NGOẠI LỆ, không có .harness-manifest.json: ${dk.banDangDung}. Làm theo ghi chú trong 08-cap-nhat/DU-AN-DANG-KY.json; ⛔ không chạy cap-nhat.cjs --ap-dung ở đây khi chủ dự án chưa bảo.`,
      `🧭 ${dk.ten}: dự án ngoại lệ của GlobalHarness ${ban}`);
  }

  const chepTay = ['Log/gate-check.cjs', 'Instructions'].some(co) || (() => {
    try { return /harness|PLAYBOOK/i.test(fs.readFileSync(path.join(GOC, 'CLAUDE.md'), 'utf8')); } catch { return false; }
  })();
  const loai = chepTay
    ? 'Dự án CÓ bộ luật/harness chép tay nhưng KHÔNG phải ProjectHarness cài từ GlobalHarness (không có bảng kê) ⇒ bộ luật đó có thể lạc hậu; ⛔ không coi nó là harness hiện hành. Đề xuất DI TRÚ: cài thử vào thư mục tạm để so bố cục, liệt kê dữ liệu dự án cần chuyển, trình kế hoạch.'
    : 'Dự án CHƯA có harness ⇒ đề xuất CÀI: `node ' + HARNESS.split(path.sep).join('/') + '/07-cai-dat/cai-dat.cjs . --ten "<tên>"` rồi điền harness.config.json + CLAUDE.md theo README §6 của GlobalHarness.';
  xuat([
    `⚠️ CHƯA CÓ ProjectHarness tại ${GOC} (thiếu .harness-manifest.json). GlobalHarness = ${HARNESS} (repo ${REPO}), bản ${ban}.`,
    loai,
    'Bắt buộc: khi chủ dự án nói "nạp context" (hay bắt đầu việc bất kỳ), BÁO ĐIỀU NÀY ĐẦU TIÊN, đọc CLAUDE.md + README.md + CHANGELOG.md (mục trên cùng) của GlobalHarness, rồi mới nạp context dự án.',
    '⛔ Không mở/đóng Bước, không chạy cổng của bộ luật chép tay như thể là harness hiện hành; ⛔ không tự cài/di trú khi chủ dự án chưa gật (đụng hạ tầng gác luật = điều dừng 5). Dự án là ngoại lệ có chủ ý thì ghi vào 08-cap-nhat/DU-AN-DANG-KY.json.',
  ].join('\n'), `⚠️ Dự án chưa có ProjectHarness — GlobalHarness ${ban} chưa được cài`);
} catch { process.exit(0); }
