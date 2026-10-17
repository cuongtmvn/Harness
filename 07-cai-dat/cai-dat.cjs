#!/usr/bin/env node
'use strict';
/**
 * cai-dat.cjs — LẮP HARNESS VÀO MỘT DỰ ÁN MỚI.
 *
 * Dùng:  node <Harness>/07-cai-dat/cai-dat.cjs <đường-dẫn-dự-án> [--ten "Tên dự án"] [--ghi-de] [--kho]
 *   --ten     điền duAn.ten vào harness.config.json
 *   --ghi-de  ghi đè tệp đã có (mặc định: KHÔNG — tệp có sẵn được giữ, liệt kê ra)
 *   --kho     không chạy kiem-harness sau khi chép
 *
 * Chép gì đi đâu: xem 07-cai-dat/_ban-do.cjs (bản đồ dùng chung với 08-cap-nhat/cap-nhat.cjs).
 * Sau khi chép, ghi <gốc>/.harness-manifest.json: bản harness + mã băm từng tệp lúc cài — cơ sở để
 * cap-nhat.cjs sau này biết tệp nào dự án đã tự sửa (không ghi đè), tệp nào cập nhật thẳng được.
 * Không bao giờ xoá gì. Không chạy git. Không sửa .gitignore (chỉ in gợi ý).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const B = require('./_ban-do.cjs');

const HARNESS = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const dich = args.find((a) => !a.startsWith('--'));
const ten = (() => { const i = args.indexOf('--ten'); return i === -1 ? null : args[i + 1]; })();
const GHI_DE = args.includes('--ghi-de');
if (!dich) { console.error('Dùng: node cai-dat.cjs <đường-dẫn-dự-án> [--ten "Tên"] [--ghi-de] [--kho]'); process.exit(1); }
const GOC = path.resolve(dich);
fs.mkdirSync(GOC, { recursive: true });

const C = JSON.parse(fs.readFileSync(path.join(HARNESS, 'harness.config.json'), 'utf8'));
const TM = C.thuMuc;
const daChep = [], boQua = [];
const rel = (p) => path.relative(GOC, p).split(path.sep).join('/');
const manifest = { harnessVersion: B.docVersion(HARNESS), harnessPath: HARNESS, harnessRepo: 'https://github.com/cuongtmvn/Harness.git', ngayCai: new Date().toISOString().slice(0, 10), tep: {} };

for (const m of B.banDo(HARNESS, GOC, C, ten)) {
  if (!fs.existsSync(m.tu)) { console.warn(`  ⚠️ nguồn không có: ${path.relative(HARNESS, m.tu)}`); continue; }
  const nguon = B.bam(m.tu);
  if (fs.existsSync(m.den) && !GHI_DE) {
    boQua.push(rel(m.den));
    manifest.tep[rel(m.den)] = { nguon, dich: B.bam(m.den), nhom: m.nhom, giu: true };
    continue;
  }
  fs.mkdirSync(path.dirname(m.den), { recursive: true });
  fs.writeFileSync(m.den, B.noiDung(m), 'utf8');
  daChep.push(rel(m.den));
  manifest.tep[rel(m.den)] = { nguon, dich: B.bam(m.den), nhom: m.nhom };
}
if (boQua.includes('.claude/settings.json')) {
  const den = path.join(GOC, '.claude', 'settings.harness.json');
  fs.copyFileSync(path.join(HARNESS, '05-hook-skill', 'settings.json'), den);
  console.log('  ⚠️ .claude/settings.json đã có — chép thành settings.harness.json, hãy GỘP khối hooks + permissions bằng tay.');
}
fs.mkdirSync(path.join(GOC, TM.log, 'doc-health-theo-buoc'), { recursive: true });
fs.mkdirSync(path.join(GOC, TM.tests), { recursive: true });
fs.writeFileSync(path.join(GOC, B.TEN_MANIFEST), JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log(`=== cai-dat harness ${manifest.harnessVersion} → ${GOC} ===`);
console.log(`  Đã chép: ${daChep.length} tệp` + (boQua.length ? ` · Giữ nguyên (đã có): ${boQua.length}` : '') + ` · bảng kê: ${B.TEN_MANIFEST}`);
if (boQua.length) boQua.forEach((f) => console.log(`     · giữ: ${f}`));
console.log('\n📌 VIỆC TIẾP THEO (không tự động, cố ý):');
console.log('  1. Sửa harness.config.json: duAn · moiTruong (địa chỉ, dauHieu) · kiemThu (lệnh test) · route (regex đường HTTP) · csdlThat · maCode.duoi');
console.log('  2. Sửa CLAUDE.md: bối cảnh 1 dòng · kiến trúc không được phá · vùng cấm · dữ liệu nhạy');
console.log('  3. Kho git chưa có thì `git init` + commit đầu tiên (qua skill day-git) — c2 không đo ngược được; rồi đặt dayGit.mocGoc = commit đó');
console.log('  4. Thêm vào .gitignore: Log/.moc-day-git.json · Log/doc-health-theo-buoc/ (tuỳ) · *.db · .env  — ⛔ KHÔNG ignore .harness-manifest.json (commit nó)');
console.log('  5. Bước 0: chép NGUYÊN VĂN mục tiêu chủ dự án vào Instructions/PHAM-VI-MVP.json trước khi viết SCOPE');
console.log(`  6. Đăng ký dự án vào ${path.join(HARNESS, '08-cap-nhat', 'DU-AN-DANG-KY.json')} (tên · đường dẫn · loại · bản ${manifest.harnessVersion})`);
if (!args.includes('--kho')) {
  console.log(`\n--- node ${TM.log}/kiem-harness.cjs ---`);
  try { console.log(execSync(`node ${JSON.stringify(path.join(GOC, TM.log, 'kiem-harness.cjs'))}`, { cwd: GOC, encoding: 'utf8', env: { ...process.env, HARNESS_ROOT: GOC } })); }
  catch (e) { console.log((e.stdout || '') + (e.stderr || '')); console.log('  (kiem-harness đỏ — xử lý từng dòng trên; thường là chỗ trống <...> trong config hoặc chưa có git)'); }
}
