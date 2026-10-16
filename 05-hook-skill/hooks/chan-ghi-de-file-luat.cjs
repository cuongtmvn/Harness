#!/usr/bin/env node
'use strict';
/*
 * PreToolUse hook — CHẶN GHI ĐÈ TOÀN BỘ một file luật đang tồn tại.
 *
 * *** VÌ SAO ***
 * Dọn file luật bằng cách ghi đè 100% bằng nội dung dựng lại từ trí nhớ ⇒ mất 13 luật im lặng, gồm
 * chính luật chống tô hồng. Không test nào đỏ, không cổng nào kêu. kiem-luat.cjs chỉ PHÁT HIỆN SAU
 * khi đã mất; hook là lớp PHÒNG — mạnh hơn mọi lớp phát hiện, vì thứ không xảy ra thì không cần đi tìm.
 *
 * GÁC FILE NÀO: tepLuat.danhSach + tepLuat.haTangGac trong harness.config.json, CỘNG mọi `file` trong
 * sổ đăng ký luật — luật mới neo vào file mới thì file đó tự động được gác.
 * CHẶN: Write đè file ĐANG TỒN TẠI · `> file` · `tee file` · `cp/mv X file` · `sed -i` · `truncate`.
 * CHO: Edit (cách đúng — sửa từng khối) · đọc · `>>` nối thêm · grep/diff · Write lên file CHƯA tồn tại.
 * Đi vòng có chủ ý: #GHI-DE-CO-Y — ghi vết.
 */
const K = require('./_hook-chung.cjs');
const SO = K.tepLog('CHAN_GHI_DE', 'CHAN-GHI-DE-LUAT.ndjson');
const CO_DI_VONG = /#\s*GHI-DE-CO-Y/i;
const chuan = (p) => String(p || '').replace(/\\/g, '/').toLowerCase();

function danhSachGac() {
  const ds = new Set();
  const them = (f) => f && ds.add(chuan(K.path.join(K.GOC, f)));
  ((K.C.tepLuat || {}).danhSach || []).forEach(them);
  ((K.C.tepLuat || {}).haTangGac || []).forEach(them);
  try {
    const so = JSON.parse(K.fs.readFileSync(K.path.join(K.GOC, (K.C.thuMuc || {}).luat || 'Instructions', ((K.C.tep || {}).luat || {}).LUAT_DANGKY || 'LUAT-DANGKY.json'), 'utf8'));
    for (const r of (so.luat || [])) if (r && r.file) them(r.file);
  } catch { K.ghiSo(SO, { ts: new Date().toISOString(), loai: 'hook-loi', vi: 'không đọc được sổ đăng ký luật' }); }
  return ds;
}
function bichMucTieu(lenh, ds) {
  const tim = [];
  for (const tuyetDoi of ds) {
    const ten = tuyetDoi.split('/').pop();
    if (!lenh.toLowerCase().includes(ten)) continue;
    const t = ten.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const duong = `(?:[^\\s"'|;&><]*\\/)?${t}`;
    const khuon = [
      new RegExp(`(^|[^>])>\\s*["']?${duong}`, 'i'),
      new RegExp(`\\btee\\b(?!\\s+-a\\b)[^|;&]*?["']?${duong}`, 'i'),
      new RegExp(`\\b(cp|mv|install)\\b[^|;&]*\\s["']?${duong}["']?\\s*(;|&|\\||$)`, 'i'),
      new RegExp(`\\bsed\\b[^|;&]*\\s-i[^|;&]*${duong}`, 'i'),
      new RegExp(`\\btruncate\\b[^|;&]*${duong}`, 'i'),
      new RegExp(`\\b(Set-Content|Out-File)\\b[^|;&]*${duong}`, 'i'),
    ];
    if (khuon.some((k) => k.test(lenh))) tim.push(ten);
  }
  return tim;
}
K.docStdin((hook) => {
  if (!hook) { K.ghiSo(SO, { ts: new Date().toISOString(), loai: 'hook-loi', vi: 'stdin không phải JSON' }); return process.exit(0); }
  const ten = hook.tool_name || '', vao = hook.tool_input || {};
  const phien = String(hook.session_id || '').slice(0, 8);
  const ds = danhSachGac();
  let mucTieu = null, kieu = null;
  if (ten === 'Write') {
    const f = chuan(K.path.resolve(K.GOC, vao.file_path || ''));
    if (ds.has(f) && K.fs.existsSync(f)) { mucTieu = K.path.basename(f); kieu = 'Write đè'; }
  } else if (ten === 'Bash' || ten === 'PowerShell') {
    const tim = bichMucTieu(String(vao.command || ''), ds);
    if (tim.length) { mucTieu = tim.join(', '); kieu = 'lệnh shell ghi đè'; }
  }
  if (!mucTieu) return process.exit(0);
  const gon = ten === 'Write' ? String(vao.file_path || '') : String(vao.command || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  if (CO_DI_VONG.test(JSON.stringify(vao))) { K.ghiSo(SO, { ts: new Date().toISOString(), phien, loai: 'di-vong', kieu, mucTieu, chiTiet: gon }); return process.exit(0); }
  K.ghiSo(SO, { ts: new Date().toISOString(), phien, loai: 'chan', kieu, mucTieu, chiTiet: gon });
  K.chan([
    `🛑 CHẶN — ghi đè file luật: ${mucTieu}  (${kieu}). Luật: OPERATING-MODEL §8 — sửa file luật là một phép REFACTOR.`,
    '',
    'VÌ SAO: ghi đè file luật bằng nội dung dựng lại từ trí nhớ ⇒ mất luật im lặng. Cái gì không nhớ tới',
    'thì biến mất, và không có gì kêu.',
    '',
    'PHẢI LÀM: dùng Edit sửa TỪNG KHỐI. Trước đó kiểm kê `git show HEAD:<file>`; sau đó truy MỌI dòng xoá',
    `bằng git diff, rồi chạy node ${K.LOG}/kiem-luat.cjs.`,
    '',
    `Nếu ${K.vai.chu} đã ĐÍCH THÂN duyệt việc ghi đè này: thêm #GHI-DE-CO-Y vào lệnh/nội dung. Mọi lần đi vòng ghi vết ở ${K.LOG}/CHAN-GHI-DE-LUAT.ndjson.`,
  ].join('\n'));
});
