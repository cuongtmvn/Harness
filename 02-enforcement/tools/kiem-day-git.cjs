#!/usr/bin/env node
'use strict';
/**
 * kiem-day-git.cjs — CỔNG ĐỐI CHIẾU: mỗi commit chạm thư mục gác có vết day-git không?
 *
 * ghi-vet-day-git.cjs chỉ GHI. Nếu không có gì đối chiếu thì quên gọi nó là không ai biết.
 * Tệp này duyệt git log từ mốc gốc (harness.config.json › dayGit.mocGoc), tìm mọi commit chạm
 * thư mục gác, đòi mỗi commit có một dòng vết với mọi cổng = 0.
 *
 * ⚠️ Nợ cũ đóng băng theo mốc, không truy ngược: commit trước mốc không có vết vì cơ chế chưa tồn
 *    tại; đòi chúng là cổng đỏ vĩnh viễn, và cổng đỏ vĩnh viễn thì không ai đọc.
 * ⛔ Không dời mốc để né một commit thiếu vết — đó là xoá nợ bằng cách đổi thước đo.
 * Mã thoát: 0 đủ vết · 2 thiếu vết / vết đỏ · 1 không chạy được.
 */
const H = require('./_harness-config.cjs');
const MOC = (H.C.dayGit || {}).mocGoc;
if (!MOC) { console.log('=== kiem-day-git ===\n  ⚠️  Chưa đặt dayGit.mocGoc trong harness.config.json — đặt bằng commit đầu tiên SAU khi cài harness. Bỏ qua.'); process.exit(0); }
const ds = H.git(`log ${MOC}..HEAD --pretty=%H`).split('\n').filter(Boolean);
if (!ds.length && !H.git(`rev-parse --verify ${MOC}`)) { console.error(`🔴 Mốc ${MOC} không có trong lịch sử (rebase/amend?). Kiểm tay.`); process.exit(1); }
const vet = new Map();
H.ndjson(H.tep('DAYGIT_LOG')).forEach((o) => { if (o.commit) vet.set(o.commit, o); });
const reGac = new RegExp('^(' + (H.C.thuMuc.gacGit || []).join('|') + ')/');
const thieu = [], doR = [];
let soXet = 0;
for (const c of ds) {
  const f = H.git(`show --name-only --format="" ${c}`).split('\n').filter(Boolean);
  if (!f.some((x) => reGac.test(x))) continue;
  soXet++;
  const v = vet.get(c), td = H.git(`log -1 --pretty=%s ${c}`).trim().slice(0, 58);
  if (!v) thieu.push(`${c.slice(0, 7)}  ${td}`); else if (!v.daQua) doR.push(`${c.slice(0, 7)}  ${td}  →  ${JSON.stringify(v.cong)}`);
}
console.log('=== kiem-day-git ===');
console.log(`  Soi từ mốc ${MOC} · commit chạm thư mục gác: ${soXet} · có vết: ${soXet - thieu.length}`);
if (thieu.length) { console.log(`\n🔴 ${thieu.length} commit KHÔNG có vết:`); thieu.forEach((d) => console.log(`     · ${d}`)); console.log('   📋 XONG NGHĨA LÀ GÌ: sau mỗi commit chạy node Log/ghi-vet-day-git.cjs. ⛔ Không dời mocGoc để né.'); }
if (doR.length) { console.log(`\n🔴 ${doR.length} commit có vết nhưng CỔNG ĐỎ:`); doR.forEach((d) => console.log(`     · ${d}`)); }
if (!thieu.length && !doR.length) console.log('\n✅ PASS — mọi commit chạm thư mục gác đều có vết xanh. ⚠️ Vết chứng minh cây mã đã commit qua được cổng; không chứng minh cổng chạy TRƯỚC khi commit.');
process.exit(thieu.length || doR.length ? 2 : 0);
