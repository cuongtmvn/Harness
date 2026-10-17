#!/usr/bin/env node
'use strict';
/**
 * kiem-harness.cjs — CỔNG CÀI ĐẶT: harness đã lắp ĐỦ và ĐÚNG vào dự án này chưa?
 *
 * Chạy ngay sau khi cài, và bất cứ lúc nào nghi "cổng có đang gác không". Ba nhóm:
 *  ① cấu hình hợp lệ (khoá bắt buộc, regex parse được, placeholder <...> còn sót ở chỗ máy dùng)
 *  ② công cụ · hook · skill · sổ có mặt, và settings.json trỏ tới hook CÓ THẬT
 *  ③ sổ đăng ký luật sạch (--mat --trung), bảng dây cương không rỗng
 * Mã thoát: 0 đủ · 2 thiếu (liệt kê). Không tự sửa gì.
 */
const H = require('./_harness-config.cjs');
const { fs, path } = H;
const { execSync } = require('child_process');
const loi = [], canh = [];
const C = H.C;
const can = (dk, msg) => { if (!dk) loi.push(msg); };

// ① cấu hình
for (const k of ['duAn', 'vaiTro', 'thuMuc', 'tep', 'tepLuat', 'maTask', 'ma', 'maCode', 'kiemThu', 'reviewPolicy', 'congRaRieng', 'dayGit', 'moiTruong']) can(C[k], `harness.config.json thiếu khoá "${k}"`);
for (const [k, v] of Object.entries(C.ma || {})) if (k !== '_doc') H.re(v);
for (let n = 0; n <= 10; n++) { const v = ((C.reviewPolicy || {}).buoc || {})[String(n)]; can(['moi-round', 'round-dau', 'khong'].includes(v), `reviewPolicy.buoc["${n}"] = "${v}" không hợp lệ`); }
if (/^<.*>$/.test(String((C.duAn || {}).ten || ''))) canh.push('duAn.ten còn là chỗ trống <...> — điền tên dự án');
for (const mt of ['uat', 'production']) { const o = (C.moiTruong || {})[mt] || {}; if (/^<.*>/.test(String(o.dauHieu || '')) || /<.*>/.test(String(o.diaChi || ''))) canh.push(`moiTruong.${mt} còn chỗ trống <...> — kiem-phu-moi-truong và cong-uat-truoc-prod sẽ không kiểm được đúng`); }

// ② tệp có mặt
const log = C.thuMuc.log, luat = C.thuMuc.luat, out = C.thuMuc.output;
for (const d of [log, luat, out, C.thuMuc.app]) can(fs.existsSync(H.P(d)), `Thiếu thư mục ${d}/`);
const CONG_CU = ['_harness-config.cjs', 'gate-check.cjs', 'rtm-check.cjs', 'doc-health.cjs', 'cho-quyet.cjs', 'kiem-luat.cjs', 'kiem-backlog.cjs', 'kiem-pham-vi.cjs', 'kiem-phu-moi-truong.cjs', 'cong-uat-truoc-prod.cjs', 'kiem-c2-staged.cjs', 'kiem-khoa-lo.cjs', 'check-telemetry-gaps.cjs', 'do-gio.cjs', 'moc-day-git.cjs', 'ghi-vet-day-git.cjs', 'kiem-day-git.cjs'];
for (const f of CONG_CU) can(fs.existsSync(H.P(log, f)), `Thiếu công cụ ${log}/${f}`);
for (const f of ['PLAYBOOK', 'PHASEGATE', 'OPERATING_MODEL', 'RUNBOOK', 'REVIEW_POLICY', 'TRACEABILITY', 'LUAT_DANGKY', 'LEASH', 'PHAM_VI', 'PHU_MOI_TRUONG']) can(fs.existsSync(H.tep(f)), `Thiếu ${H.rel(H.tep(f))}`);
for (const f of ['RTM', 'SPEC', 'SCOPE', 'BACKLOG', 'DEVBOOK', 'TELEMETRY', 'RISK', 'ARCH', 'SITUAT']) if (!fs.existsSync(H.tep(f))) canh.push(`Chưa có ${H.rel(H.tep(f))} — các cổng đọc tệp này sẽ báo "chưa có dữ liệu" (bình thường trước Bước tương ứng)`);
can(fs.existsSync(H.tep('TASKLIST')), `Thiếu ${H.rel(H.tep('TASKLIST'))}`);
can(fs.existsSync(H.P(log, C.tep.log.CONG_BUOC, '_MAU.json')), `Thiếu mẫu ${log}/${C.tep.log.CONG_BUOC}/_MAU.json`);
can(fs.existsSync(H.P(log, C.tep.log.KHAI_ROUND, '_MAU.json')), `Thiếu mẫu ${log}/${C.tep.log.KHAI_ROUND}/_MAU.json`);
can(fs.existsSync(H.P('CLAUDE.md')), 'Thiếu CLAUDE.md ở gốc dự án (trí nhớ dự án tự nạp mọi phiên)');
can(fs.existsSync(H.P('.claude', 'skills', 'day-git', 'SKILL.md')), 'Thiếu .claude/skills/day-git/SKILL.md');
const st = H.docJson('.claude/settings.json', null);
can(st, 'Thiếu/hỏng .claude/settings.json');
if (st && st.hooks) {
  const lenh = [];
  for (const nhom of Object.values(st.hooks)) for (const m of nhom) for (const h of (m.hooks || [])) lenh.push(h.command || '');
  for (const l of lenh) { const m = l.match(/\.claude\/hooks\/([\w\-.]+\.cjs)/); if (m) can(fs.existsSync(H.P('.claude', 'hooks', m[1])), `settings.json trỏ hook KHÔNG TỒN TẠI: ${m[1]}`); }
  for (const h of ['chan-git-commit-tay.cjs', 'chan-ghi-de-file-luat.cjs', 'log-tool-event.cjs']) can(lenh.some((l) => l.includes(h)), `settings.json chưa cắm hook ${h} — Skill để NẠP, Hook để CHẶN`);
} else if (st) loi.push('.claude/settings.json không có khối hooks');
for (const f of (C.tepLuat || {}).danhSach || []) if (!fs.existsSync(H.P(f))) canh.push(`tepLuat.danhSach trỏ tệp chưa có: ${f}`);
for (const f of (C.tepLuat || {}).haTangGac || []) can(fs.existsSync(H.P(f)), `tepLuat.haTangGac trỏ tệp KHÔNG tồn tại: ${f} — hạ tầng gác luật phải có thật`);
if (!H.git('rev-parse --is-inside-work-tree').trim()) loi.push('Không phải kho git — c2 và R8 không đo được; đưa mã vào git TRƯỚC khi bắt đầu sửa (chỉ số lịch sử không đo ngược được)');
else if (!(C.dayGit || {}).mocGoc) canh.push('dayGit.mocGoc trống — đặt bằng commit đầu tiên sau khi cài để kiem-day-git bắt đầu soi');
if (!fs.existsSync(H.P('.harness-manifest.json'))) canh.push('Chưa có .harness-manifest.json — cap-nhat.cjs không biết tệp nào dự án đã sửa; đăng ký: node <Harness>/08-cap-nhat/cap-nhat.cjs . --dang-ky');
for (const s of ['cap-nhat-harness', 'dua-vao-harness']) if (!fs.existsSync(H.P('.claude', 'skills', s, 'SKILL.md'))) canh.push(`Chưa có .claude/skills/${s}/SKILL.md (harness ≥ 1.1.0) — chạy cap-nhat.cjs --ap-dung để nhận`);

// ③ sổ luật · dây cương
if (fs.existsSync(H.P(log, 'kiem-luat.cjs'))) { try { execSync(`node ${JSON.stringify(H.P(log, 'kiem-luat.cjs'))} --mat --trung`, { cwd: H.ROOT, stdio: 'pipe' }); } catch (e) { loi.push('kiem-luat --mat --trung ĐỎ — sổ đăng ký luật lệch với file luật (xem node Log/kiem-luat.cjs)'); } }
const lb = H.docJson(H.tep('LEASH'), null);
can(lb && lb.muc && Object.keys(lb.muc).length, 'LEASH-BANG.json rỗng — cổng dây cương sẽ CHẶN mọi task có --muc (fail-closed)');

console.log(`=== kiem-harness — ${C.duAn && C.duAn.ten} ===`);
console.log(`  Gốc: ${H.ROOT}`);
if (canh.length) { console.log(`\n⚠️  ${canh.length} cảnh báo:`); canh.forEach((c) => console.log(`   · ${c}`)); }
if (loi.length) { console.log(`\n🛑 ${loi.length} chỗ THIẾU — harness chưa gác được:`); loi.forEach((l) => console.log(`   · ${l}`)); process.exit(2); }
console.log('\n✅ HARNESS ĐỦ: cấu hình hợp lệ · công cụ/hook/skill/sổ có mặt · sổ luật sạch.');
console.log('   Việc tiếp: đặt dayGit.mocGoc sau commit đầu · chép mục tiêu vào PHAM-VI-MVP.json (Bước 0).');
