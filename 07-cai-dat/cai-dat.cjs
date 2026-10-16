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
 * Chép gì đi đâu (xem README.md §Bản đồ):
 *   harness.config.json · CLAUDE.md                 → <gốc>
 *   00-nguyen-tac/* · 01-playbook/* · 02-truy-vet/TRACEABILITY.md · 03-kiem-thu/*   → Instructions/ (+ Instructions/checklist/)
 *   02-truy-vet/templates/*                          → Output/
 *   04-cong-may/*.cjs · day-len-may-chu.template.sh  → Log/ (sh bỏ đuôi .template)
 *   05-hook-skill/settings.json · hooks/ · skills/   → .claude/
 *   06-so-ghi: LEASH-BANG · PHAM-VI-MVP · PHU-MOI-TRUONG · LUAT-DANGKY → Instructions/ ; còn lại → Log/
 * Không bao giờ xoá gì. Không chạy git. Không sửa .gitignore (chỉ in gợi ý).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
function chep(tu, den, bienDoi) {
  if (!fs.existsSync(tu)) { console.warn(`  ⚠️ nguồn không có: ${path.relative(HARNESS, tu)}`); return; }
  if (fs.existsSync(den) && !GHI_DE) { boQua.push(path.relative(GOC, den)); return; }
  fs.mkdirSync(path.dirname(den), { recursive: true });
  if (bienDoi) fs.writeFileSync(den, bienDoi(fs.readFileSync(tu, 'utf8')), 'utf8'); else fs.copyFileSync(tu, den);
  daChep.push(path.relative(GOC, den));
}
const ls = (d, loc) => fs.existsSync(d) ? fs.readdirSync(d).filter((f) => !loc || loc.test(f)) : [];

// gốc
chep(path.join(HARNESS, 'harness.config.json'), path.join(GOC, 'harness.config.json'), (s) => ten ? s.replace('"ten": "<TÊN DỰ ÁN>"', `"ten": ${JSON.stringify(ten)}`) : s);
chep(path.join(HARNESS, 'CLAUDE.template.md'), path.join(GOC, 'CLAUDE.md'), (s) => ten ? s.replace(/<TÊN DỰ ÁN>/g, ten) : s);
// Instructions
const LUAT = path.join(GOC, TM.luat);
for (const d of ['00-nguyen-tac', '01-playbook', '03-kiem-thu']) for (const f of ls(path.join(HARNESS, d), /\.md$/)) chep(path.join(HARNESS, d, f), path.join(LUAT, f));
for (const f of ls(path.join(HARNESS, '01-playbook', 'checklist'), /\.md$/)) chep(path.join(HARNESS, '01-playbook', 'checklist', f), path.join(LUAT, 'checklist', f));
chep(path.join(HARNESS, '02-truy-vet', 'TRACEABILITY.md'), path.join(LUAT, 'TRACEABILITY.md'));
for (const f of ['LEASH-BANG.json', 'PHAM-VI-MVP.json', 'PHU-MOI-TRUONG.json', 'LUAT-DANGKY.json']) chep(path.join(HARNESS, '06-so-ghi', f), path.join(LUAT, f));
// Output
const OUT = path.join(GOC, TM.output);
for (const f of ls(path.join(HARNESS, '02-truy-vet', 'templates'), /\.md$/)) chep(path.join(HARNESS, '02-truy-vet', 'templates', f), path.join(OUT, f), (s) => ten ? s.replace(/<TÊN DỰ ÁN>/g, ten) : s);
// Log
const LOG = path.join(GOC, TM.log);
for (const f of ls(path.join(HARNESS, '04-cong-may'), /\.cjs$/)) chep(path.join(HARNESS, '04-cong-may', f), path.join(LOG, f));
chep(path.join(HARNESS, '04-cong-may', 'day-len-may-chu.template.sh'), path.join(LOG, 'day-len-may-chu.sh'));
for (const f of ls(path.join(HARNESS, '06-so-ghi'), /\.(ndjson|md|json)$/).filter((f) => !['LEASH-BANG.json', 'PHAM-VI-MVP.json', 'PHU-MOI-TRUONG.json', 'LUAT-DANGKY.json'].includes(f))) chep(path.join(HARNESS, '06-so-ghi', f), path.join(LOG, f));
for (const d of ['cong-buoc', 'khai-round']) chep(path.join(HARNESS, '06-so-ghi', d, '_MAU.json'), path.join(LOG, d, '_MAU.json'));
fs.mkdirSync(path.join(LOG, 'doc-health-theo-buoc'), { recursive: true });
// .claude
chep(path.join(HARNESS, '05-hook-skill', 'settings.json'), path.join(GOC, '.claude', 'settings.json'));
if (boQua.includes(path.join('.claude', 'settings.json'))) { chep(path.join(HARNESS, '05-hook-skill', 'settings.json'), path.join(GOC, '.claude', 'settings.harness.json')); console.log('  ⚠️ .claude/settings.json đã có — chép thành settings.harness.json, hãy GỘP khối hooks + permissions bằng tay.'); }
for (const f of ls(path.join(HARNESS, '05-hook-skill', 'hooks'), /\.cjs$/)) chep(path.join(HARNESS, '05-hook-skill', 'hooks', f), path.join(GOC, '.claude', 'hooks', f));
chep(path.join(HARNESS, '05-hook-skill', 'skills', 'day-git', 'SKILL.md'), path.join(GOC, '.claude', 'skills', 'day-git', 'SKILL.md'));
// App
fs.mkdirSync(path.join(GOC, TM.tests), { recursive: true });

console.log(`=== cai-dat harness → ${GOC} ===`);
console.log(`  Đã chép: ${daChep.length} tệp` + (boQua.length ? ` · Giữ nguyên (đã có): ${boQua.length}` : ''));
if (boQua.length) boQua.forEach((f) => console.log(`     · giữ: ${f}`));
console.log('\n📌 VIỆC TIẾP THEO (không tự động, cố ý):');
console.log('  1. Sửa harness.config.json: duAn · moiTruong (địa chỉ, dauHieu) · kiemThu (lệnh test) · route (regex đường HTTP) · csdlThat · maCode.duoi');
console.log('  2. Sửa CLAUDE.md: bối cảnh 1 dòng · kiến trúc không được phá · vùng cấm · dữ liệu nhạy');
console.log('  3. Kho git chưa có thì `git init` + commit đầu tiên (qua skill day-git) — c2 không đo ngược được; rồi đặt dayGit.mocGoc = commit đó');
console.log('  4. Thêm vào .gitignore: Log/.moc-day-git.json · Log/doc-health-theo-buoc/ (tuỳ) · *.db · .env');
console.log('  5. Bước 0: chép NGUYÊN VĂN mục tiêu chủ dự án vào Instructions/PHAM-VI-MVP.json trước khi viết SCOPE');
if (!args.includes('--kho')) {
  console.log('\n--- node Log/kiem-harness.cjs ---');
  try { console.log(execSync(`node ${JSON.stringify(path.join(LOG, 'kiem-harness.cjs'))}`, { cwd: GOC, encoding: 'utf8', env: { ...process.env, HARNESS_ROOT: GOC } })); }
  catch (e) { console.log((e.stdout || '') + (e.stderr || '')); console.log('  (kiem-harness đỏ — xử lý từng dòng trên; thường là chỗ trống <...> trong config hoặc chưa có git)'); }
}
