#!/usr/bin/env node
'use strict';
/**
 * ghi-vet-day-git.cjs — GHI VẾT MÁY ĐỌC ĐƯỢC cho kỷ luật day-git. Chạy SAU commit (Bước 5 của skill).
 *
 * Một kỷ luật không để lại dấu vết thì không phân biệt được với việc không có kỷ luật nào.
 * Tệp này chạy lại bốn cổng trên cây mã ĐÃ COMMIT rồi ghi mã thoát + HEAD ⇒ dấu vết nói "cây mã
 * đã commit CÓ qua bốn cổng hay không" — dựng lại được bất cứ lúc nào bằng git checkout <hash>.
 * Đo trạng thái kiểm lại được, không đo trí nhớ của người làm. Vết chỉ ghi khi mọi thứ đẹp thì nó
 * không còn là vết, nó là quảng cáo — nên vết ghi cả khi cổng đỏ.
 *
 * Dùng: node Log/ghi-vet-day-git.cjs [--xem]
 */
const H = require('./_harness-config.cjs');
const { fs, path } = H;
const { execSync } = require('child_process');
const SO = H.tep('DAYGIT_LOG');
const CHI_XEM = process.argv.includes('--xem');
// Chế độ KHO (chủ dự án duyệt 19/10/2026 "duyệt chế độ kho"): ở chính kho GlobalHarness (có .kho-globalharness) không có
// RTM / Output của dự án ⇒ c2, rtm-check đỏ mãi. Thay bằng cổng kho chạy trên bản ĐÃ COMMIT (kiem-kho-phat-hanh --sau-commit).
const LA_KHO = fs.existsSync(path.join(H.ROOT, '.kho-globalharness'));
const CONG = LA_KHO
  ? [['kiem-luat', 'kiem-luat.cjs'], ['kiem-khoa-lo', 'kiem-khoa-lo.cjs'], ['kho-sau-commit', 'kiem-kho-phat-hanh.cjs', '--sau-commit']]
  : [['kiem-luat', 'kiem-luat.cjs'], ['kiem-khoa-lo', 'kiem-khoa-lo.cjs'], ['c2', 'kiem-c2-staged.cjs'], ['rtm-check', 'rtm-check.cjs']];
const chay = (f, thamSo) => { try { execSync(`node ${JSON.stringify(path.join(__dirname, f))}${thamSo ? ' ' + thamSo : ''}`, { cwd: H.ROOT, stdio: ['ignore', 'pipe', 'pipe'] }); return 0; } catch (e) { return typeof e.status === 'number' ? e.status : -1; } };
const head = H.git('rev-parse HEAD').trim();
if (!head) { console.error('🔴 Không có commit nào (hoặc không phải kho git) — không có gì để ghi vết.'); process.exit(1); }
const tieuDe = H.git('log -1 --pretty=%s').trim();
const files = H.git('show --name-only --format="" HEAD').split('\n').filter(Boolean);
const reGac = new RegExp('^(' + (H.C.thuMuc.gacGit || []).join('|') + ')/');
const kq = {};
for (const [ten, f, thamSo] of CONG) kq[ten] = chay(f, thamSo);
const daQua = Object.values(kq).every((m) => m === 0);
const dong = { ts: new Date().toISOString(), commit: head, tieuDe, soFile: files.length, chamGac: files.filter((f) => reGac.test(f)).length, cong: kq, daQua, cheDo: LA_KHO ? 'kho' : 'du-an', cach: `chạy lại ${CONG.length} cổng trên cây mã ĐÃ COMMIT; dựng lại được bằng git checkout <commit>` };
console.log('=== ghi-vet-day-git ===');
console.log(`  commit : ${head.slice(0, 7)}  ${tieuDe.slice(0, 60)}`);
console.log(`  file   : ${files.length}  (chạm thư mục gác: ${dong.chamGac})`);
for (const [ten, ma] of Object.entries(kq)) console.log(`  ${ma === 0 ? '✅' : '🔴'} ${ten.padEnd(14)} mã thoát: ${ma}`);
if (CHI_XEM) { console.log('\n👁️ --xem — không ghi.'); process.exit(daQua ? 0 : 2); }
fs.mkdirSync(path.dirname(SO), { recursive: true });
fs.appendFileSync(SO, JSON.stringify(dong) + '\n', 'utf8');
console.log(`\n${daQua ? '✅' : '🔴'} Đã ghi vết vào ${H.rel(SO)}` + (daQua ? '' : ' — có cổng KHÔNG xanh; vết ghi ĐÚNG SỰ THẬT.'));
process.exit(daQua ? 0 : 2);
