#!/usr/bin/env node
'use strict';
/*
 * moc-day-git.cjs — sinh MỐC cho hook chan-git-commit-tay.cjs. Bước cuối của Bước 2 skill day-git.
 *
 * *** VÌ SAO LÀ MỐC, KHÔNG PHẢI MỘT DẤU GÕ TAY ***
 * Một dấu hiệu mà người làm TỰ TẠO RA ĐƯỢC không chứng minh được việc người ấy đã làm — nó là
 * mật khẩu, không phải bằng chứng. Mốc ở đây chỉ sinh ra khi ba cổng THẬT SỰ chạy và xanh, ngay
 * trong tiến trình này, và dán vào vân tay `git write-tree` của đúng vùng staged. Đổi một byte
 * trong vùng staged ⇒ vân tay lệch ⇒ mốc chết. Hết hạn 15 phút. Vùng staged rỗng ⇒ không mốc.
 * ⇒ Muốn "giả" mốc thì phải chạy đúng ba cổng trên đúng vùng staged — tức là làm đúng việc.
 *
 * ⛔ Không commit hộ, không chạm settings.json, không gỡ cờ #QUA-DAY-GIT (gờ giảm tốc có ghi vết
 *    vẫn còn cho ca chủ dự án đích thân cho phép).
 */
const H = require('./_harness-config.cjs');
const { fs, path } = H;
const { execSync } = require('child_process');
const MOC = H.tep('MOC_DAY_GIT');
// Chế độ KHO (chủ dự án duyệt 19/10/2026): ở chính kho GlobalHarness (có tệp .kho-globalharness) không có RTM của dự án
// nên cổng c2 đỏ mãi — thay bằng cổng kho kiem-kho-phat-hanh.cjs (VERSION tăng · CHANGELOG có mục · bản cài thử = bản
// commit · cài thử dự án trống xanh). Dự án vẫn chạy đủ 3 cổng cũ.
const LA_KHO = fs.existsSync(path.join(H.ROOT, '.kho-globalharness'));
const CONG = LA_KHO
  ? [['kiem-luat', 'kiem-luat.cjs'], ['kiem-khoa-lo', 'kiem-khoa-lo.cjs'], ['kho-phat-hanh', 'kiem-kho-phat-hanh.cjs']]
  : [['kiem-luat', 'kiem-luat.cjs'], ['kiem-khoa-lo', 'kiem-khoa-lo.cjs'], ['c2', 'kiem-c2-staged.cjs']];
const chay = (f) => { try { execSync(`node ${JSON.stringify(path.join(__dirname, f))}`, { cwd: H.ROOT, stdio: ['ignore', 'pipe', 'pipe'] }); return 0; } catch (e) { return typeof e.status === 'number' ? e.status : -1; } };
const staged = H.git('diff --cached --name-only').split('\n').filter(Boolean);
console.log('=== moc-day-git ===');
console.log(`  Vùng staged : ${staged.length} tệp${LA_KHO ? ' · CHẾ ĐỘ KHO (cổng kho thay c2)' : ''}`);
if (!staged.length) { console.log('\n🛑 Vùng staged RỖNG — KHÔNG ghi mốc. Mốc chứng nhận "ba cổng đã soi ĐÚNG tập tệp này"; tập rỗng thì không có gì để chứng nhận — và một mốc rỗng sẽ cho qua MỌI commit.'); process.exit(2); }
const kq = {};
for (const [ten, f] of CONG) { kq[ten] = chay(f); console.log(`  ${kq[ten] === 0 ? '✅' : '🔴'} ${ten.padEnd(14)} mã thoát: ${kq[ten]}`); }
if (!Object.values(kq).every((m) => m === 0)) { console.log('\n🛑 Có cổng KHÔNG xanh — KHÔNG ghi mốc. Sửa GỐC chỗ cổng kêu; không sửa tài liệu/test cho cổng đẹp lên.'); process.exit(2); }
const vanTay = H.git('write-tree').trim();
if (!vanTay) { console.log('\n🛑 Không lấy được vân tay index (git write-tree) — không ghi mốc.'); process.exit(2); }
fs.mkdirSync(path.dirname(MOC), { recursive: true });
fs.writeFileSync(MOC, JSON.stringify({ ts: new Date().toISOString(), vanTay, soTep: staged.length, cong: kq, cheDo: LA_KHO ? 'kho' : 'du-an', cach: 'Sinh sau khi 3 cổng chạy THẬT và xanh trên đúng vùng staged có vân tay này. Hết hạn 15 phút.' }, null, 2) + '\n', 'utf8');
console.log(`\n✅ Đã ghi mốc — vân tay index: ${vanTay.slice(0, 12)}… (hiệu lực 15 phút). Đổi vùng staged ⇒ mốc hết hiệu lực, chạy lại.`);
