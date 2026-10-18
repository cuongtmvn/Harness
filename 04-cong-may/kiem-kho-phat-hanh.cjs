#!/usr/bin/env node
'use strict';
/*
 * kiem-kho-phat-hanh.cjs — CỔNG KHO, thay cổng c2 khi moc-day-git chạy ở CHÍNH KHO GlobalHarness.
 *
 * *** VÌ SAO ***
 * Cổng c2 (kiem-c2-staged) tra "tài liệu liên quan" trong Output/RTM.md của một DỰ ÁN. Kho GlobalHarness không
 * phải dự án, không có RTM ⇒ c2 đỏ mãi, skill day-git không cấp được mốc ⇒ chỉ còn lối đi vòng / làm tay.
 * Chủ dự án duyệt 19/10/2026 ("duyệt chế độ kho"): ở kho, thay c2 bằng các việc skill dua-vao-harness vốn bắt
 * buộc nhưng trước đây làm tay — nay chạy bằng máy, trên đúng tập tệp sắp commit:
 *   (1) VERSION đã tăng so với bản trên origin/main;
 *   (2) CHANGELOG.md có mục "## <VERSION> —";
 *   (3) không có tệp đã theo dõi bị sửa mà CHƯA staged, không có tệp chưa theo dõi trong các thư mục bộ cài chép
 *       (để bản cài thử = bản sắp commit);
 *   (4) cài thử vào thư mục trống: cai-dat.cjs → git init → Log/kiem-harness.cjs xanh → Log/kiem-luat.cjs --mat --trung xanh.
 * Chỉ chạy ở kho (có tệp đánh dấu .kho-globalharness ở gốc). Dự án vẫn chạy c2 như cũ.
 * Thoát 0 = xanh · 2 = đỏ (fail-closed: không đo được ⇒ đỏ).
 */
const H = require('./_harness-config.cjs');
const { fs, path } = H;
const os = require('os');
const { execSync } = require('child_process');

const loi = [];
const ok = (s) => console.log('  ✅ ' + s);
const sai = (s) => { loi.push(s); console.log('  🔴 ' + s); };

if (!fs.existsSync(path.join(H.ROOT, '.kho-globalharness'))) { console.log('🛑 Không phải kho GlobalHarness (thiếu .kho-globalharness) — cổng này chỉ dùng ở kho.'); process.exit(2); }
// --sau-commit: ghi-vet-day-git gọi SAU commit — đo trên bản ĐÃ COMMIT (HEAD) thay vì vùng staged; bỏ phép so VERSION
// với origin/main (đã đo trước commit; sau khi đẩy thì hai bản bằng nhau là đúng).
const SAU = process.argv.includes('--sau-commit');
const BAN = SAU ? 'HEAD:' : ':';
console.log(`=== kiem-kho-phat-hanh — cổng kho GlobalHarness${SAU ? ' (sau commit, đo trên HEAD)' : ''} ===`);

// (1) VERSION tăng
const so = (v) => String(v || '').trim().split('.').map((x) => parseInt(x, 10));
const lonHon = (a, b) => { for (let i = 0; i < 3; i++) { if ((a[i] || 0) !== (b[i] || 0)) return (a[i] || 0) > (b[i] || 0); } return false; };
const banMoi = H.git(`show ${BAN}VERSION`).trim(); // bản ĐÃ STAGED (sắp commit) hoặc HEAD (sau commit)
if (!banMoi) sai(`Không đọc được VERSION (${SAU ? 'HEAD' : 'vùng staged'}).`);
else if (SAU) ok(`VERSION ở HEAD: ${banMoi} (phép so với origin/main đã chạy trước commit)`);
else {
  const banCu = H.git('show origin/main:VERSION').trim();
  if (!banCu) sai('Không đọc được VERSION trên origin/main (chưa fetch?) — không đo được ⇒ đỏ.');
  else if (!lonHon(so(banMoi), so(banCu))) sai(`VERSION không tăng: staged ${banMoi} · origin/main ${banCu}.`);
  else ok(`VERSION tăng: ${banCu} → ${banMoi}`);
}

// (2) CHANGELOG có mục của bản mới
const cl = H.git(`show ${BAN}CHANGELOG.md`);
if (banMoi && new RegExp('^## ' + banMoi.replace(/\./g, '\\.') + ' — ', 'm').test(cl)) ok(`CHANGELOG.md có mục "## ${banMoi} — …"`);
else sai(`CHANGELOG.md (${SAU ? 'HEAD' : 'staged'}) không có mục "## ${banMoi} — …".`);

// (3) bản cài thử = bản sắp commit (hoặc = HEAD khi sau commit)
const chuaStaged = H.git(SAU ? 'diff HEAD --name-only' : 'diff --name-only').split('\n').filter(Boolean);
if (chuaStaged.length) sai(`Có tệp đã theo dõi khác ${SAU ? 'HEAD' : 'vùng staged'} (bản cài thử sẽ khác bản commit): ${chuaStaged.join(', ')}`);
else ok(`Không có tệp đã theo dõi khác ${SAU ? 'HEAD' : 'vùng staged'}`);
const THU_MUC_CAI = /^(0[0-9]-[^/]+|CLAUDE\.template\.md|VERSION|harness\.config\.json)(\/|$)/;
const chuaTheoDoi = H.git('ls-files --others --exclude-standard').split('\n').filter(Boolean).filter((f) => THU_MUC_CAI.test(f));
if (chuaTheoDoi.length) sai(`Có tệp chưa theo dõi trong thư mục bộ cài chép (sẽ vào bản cài thử nhưng không vào commit): ${chuaTheoDoi.join(', ')}`);
else ok('Không có tệp chưa theo dõi trong thư mục bộ cài chép');

// (4) cài thử vào thư mục trống
const tam = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-thu-'));
const chay = (lenh, cwd) => { try { execSync(lenh, { cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }); return 0; } catch (e) { return typeof e.status === 'number' ? e.status : -1; } };
try {
  const m1 = chay(`node ${JSON.stringify(path.join(H.ROOT, '07-cai-dat', 'cai-dat.cjs'))} ${JSON.stringify(tam)} --ten "Thu nghiem" --kho`, H.ROOT);
  if (m1 !== 0) sai(`cai-dat.cjs vào thư mục trống thoát ${m1}.`);
  else {
    chay('git init -q', tam);
    const m2 = chay('node Log/kiem-harness.cjs', tam);
    if (m2 === 0) ok('Cài thử: Log/kiem-harness.cjs xanh'); else sai(`Cài thử: Log/kiem-harness.cjs thoát ${m2}.`);
    const m3 = chay('node Log/kiem-luat.cjs --mat --trung', tam);
    if (m3 === 0) ok('Cài thử: Log/kiem-luat.cjs --mat --trung xanh'); else sai(`Cài thử: Log/kiem-luat.cjs --mat --trung thoát ${m3}.`);
  }
} finally {
  try { fs.rmSync(tam, { recursive: true, force: true }); } catch { /* thư mục tạm, xoá không được cũng không chặn */ }
}

if (loi.length) { console.log(`\n🛑 CỔNG KHO ĐỎ — ${loi.length} lỗi. Sửa gốc, không sửa VERSION / CHANGELOG cho cổng đẹp lên.`); process.exit(2); }
console.log('\n✅ CỔNG KHO XANH.');
