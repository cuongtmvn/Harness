#!/usr/bin/env node
'use strict';
/*
 * check-telemetry-gaps.cjs — tìm HỐ TELEMETRY: task đánh dấu xong trong TASKLIST mà TELEMETRY chưa có dòng log.
 *
 * VÌ SAO CÓ CÔNG CỤ NÀY
 *   "Làm rồi nhưng quên log" không tự lộ ra — nó chỉ lộ khi tổng kết, lúc đã quá muộn để nhớ
 *   mình đã tiêu bao nhiêu. Cổng này soát tự động mỗi lần đóng Bước.
 *   Bài học về DỤNG CỤ: regex nhận mã task từng bỏ sót IM LẶNG cả một họ mã (chữ cái đầu không khớp,
 *   mã bọc `**` in đậm) — không báo lỗi, không báo thiếu, chỉ "không thấy". Vì thế tiền tố mã lấy từ
 *   config, và dòng bảng tiêu đề bị loại tường minh.
 *
 * ⚠️ Giới hạn khai thẳng
 *   - Chỉ kiểm CÓ dòng log hay không, không kiểm dòng log có đúng giờ/đúng token không.
 *   - "Xong" = ô trạng thái (ô CUỐI) BẮT ĐẦU bằng ✅. Tìm chuỗi con ✅ ở giữa là đọc nhầm
 *     ("🔒 Chưa đánh ✅" không phải xong).
 *
 * Chạy: node Log/check-telemetry-gaps.cjs
 * Mã thoát: 0 sạch · 2 có task thiếu log (CHẶN) · 1 không xác minh được (thiếu tệp)
 */
const H = require('./_harness-config.cjs');
const { fs } = H;

const TASKLIST = H.tep('TASKLIST');
const TELEMETRY = H.tep('TELEMETRY');
const TIEN_TO = H.C.maTask.tienTo;
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const thieuTep = [TASKLIST, TELEMETRY].filter((t) => !fs.existsSync(t));
if (thieuTep.length) {
  console.log(`🛑 Thiếu tệp bắt buộc: ${thieuTep.map(H.rel).join(', ')} — không đối chiếu được (fail-closed).`);
  process.exit(2);
}
const tasklistMd = fs.readFileSync(TASKLIST, 'utf8');
const telemetryMd = fs.readFileSync(TELEMETRY, 'utf8');

function wilson(k, n, z = 1.96) {
  if (!n) return null;
  const p = k / n, d = 1 + z * z / n, tam = p + z * z / (2 * n);
  const bien = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
  return [Math.max(0, (tam - bien) / d), Math.min(1, (tam + bien) / d)].map((x) => (x * 100).toFixed(1));
}

// ---- Bước 1: rút mã task đã đánh dấu xong trong TASKLIST ----------------------------
// Dòng bảng: | `<mã>` | <loại> | <việc> | <ai> | <trạng thái> |   (mã có thể bọc thêm `**`).
// Mỗi task giữ thêm alias từ "(log cũ: `<id>`+`<id2>`)" — mã đổi tên hồi tố nhưng log cũ vẫn
// giữ mã gốc; log tìm thấy dưới TÊN CŨ thì coi là đã log, không báo giả.
const reMa = new RegExp('^\\|\\s*\\*{0,2}`?(' + escRe(TIEN_TO) + '[\\w.]*)`?\\*{0,2}');
const reAlias = new RegExp('`(' + escRe(TIEN_TO) + '[\\w.]*)`', 'g');
const doneTasks = [];
let tongTask = 0;
tasklistMd.split(/\r?\n/).forEach((line) => {
  const m = line.trim().match(reMa);
  if (!m) return;
  tongTask++;
  const cells = line.trim().replace(/^\|/, '').replace(/\|\s*$/, '').split('|').map((s) => s.trim());
  const trangThai = (cells[cells.length - 1] || '').replace(/^\*+/, '').trim();
  if (!trangThai.startsWith('✅')) return;                     // ⛔ không tìm chuỗi con ✅ ở giữa
  const aliases = [];
  const oldRef = line.match(/\(log cũ:\s*([^)]+)\)/);
  if (oldRef) for (const t of oldRef[1].matchAll(reAlias)) aliases.push(t[1]);
  doneTasks.push({ id: m[1], aliases });
});

// ---- Bước 2: rút mọi mã task trong `**[...]**` của TELEMETRY --------------------------
// Bracket đơn `**[A]**` hoặc gộp `**[A + B / C, D]**` — tách theo +, /, ,
const loggedIds = new Set();
const reTienTo = new RegExp('^' + escRe(TIEN_TO) + '[\\w.]*$');
for (const m of telemetryMd.matchAll(/\*\*\[([^\]]+)\]/g)) {
  m[1].split(/[+/,]/).forEach((tok) => {
    const id = tok.trim().split(/\s/)[0];
    if (reTienTo.test(id)) loggedIds.add(id);
  });
}

// ---- Bước 3: đối chiếu (thoả nếu mã mới HOẶC bất kỳ alias "log cũ" nào có log) --------
const missing = doneTasks.filter(({ id, aliases }) => !loggedIds.has(id) && !aliases.some((a) => loggedIds.has(a)));
const uniqueDone = [...new Set(doneTasks.map((t) => t.id))];
const uniqueMissing = [...new Set(missing.map((t) => t.id))];
const daLog = uniqueDone.length - uniqueMissing.length;

console.log(`=== check-telemetry-gaps — ${H.rel(TASKLIST)} ↔ ${H.rel(TELEMETRY)} ===`);
if (!tongTask) {
  console.log(`  ⚠️ TASKLIST chưa có dòng task nào mang tiền tố "${TIEN_TO}" — chưa có dữ liệu.`);
  process.exit(0);
}
console.log(`  Task trong TASKLIST: ${tongTask} · đánh dấu ✅ xong: ${uniqueDone.length}`);
if (!uniqueDone.length) {
  console.log('  ⚠️ Chưa task nào đánh dấu xong — chưa có gì để đối chiếu.');
  process.exit(0);
}
const w = wilson(daLog, uniqueDone.length);
console.log(`  Đã có log tương ứng: ${daLog}/${uniqueDone.length} = ${(daLog / uniqueDone.length * 100).toFixed(1)}% [${w[0]}–${w[1]}%]${uniqueDone.length < 10 ? '  ⚠️ MẪU QUÁ NHỎ' : ''}`);
console.log(`  Thiếu log (làm rồi nhưng chưa log): ${uniqueMissing.length}`);
if (uniqueMissing.length) {
  console.log('\n  ⚠️ DANH SÁCH TASK THIẾU LOG:');
  uniqueMissing.forEach((id) => console.log('     -', id));
  console.log(`\n  ⛔ ${H.vai.ai} ghi log thật (giờ đo từ hook, không ước), không đánh dấu ✅ trước rồi log sau.`);
  process.exit(2);
}
console.log('\n  ✅ Không có hố telemetry — mọi task ✅ đều đã có dòng log.');
process.exit(0);
