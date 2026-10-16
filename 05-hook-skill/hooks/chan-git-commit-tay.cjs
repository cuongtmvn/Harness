#!/usr/bin/env node
'use strict';
/*
 * PreToolUse hook — CHẶN `git commit` gõ tay, buộc mọi commit đi qua skill day-git.
 *
 * *** VÌ SAO ***
 * Luật "cấm gõ tay git commit" viết rõ, nằm trong file tự nạp mọi phiên — và vẫn bị vượt nhiều lần:
 * gộp nhầm file của phiên khác, thông điệp commit mô tả sai nội dung. Mọi biện pháp "nhớ đừng làm X"
 * đều cùng loại với thứ vừa hỏng; hook là loại khác về chất: nó không cần ai nhớ.
 *
 * *** KHÔNG PHẢI BỨC TƯỜNG — CÓ CHỦ Ý ***
 * Có đường đi qua bằng cờ #QUA-DAY-GIT, có ghi vết. Một bức tường không kẽ hở mời gọi AI đổi cách
 * gõ cho lọt mà không tự thấy đó là lách. Thiết kế là gờ giảm tốc + sổ ghi vết: đi vòng thì được,
 * nhưng phải CỐ Ý, và mọi lần đi vòng đều để lại chữ để chủ dự án đọc lại.
 *
 * *** HAI ĐƯỜNG, HAI DẤU — đừng dùng chung ***
 *  · #DAY-GIT-BUOC-3  + MỐC hợp lệ (Log/.moc-day-git.json, vân tay git write-tree khớp vùng staged,
 *                       ≤15 phút, 3 cổng = 0)  ⇒ đường ĐÚNG, ghi vết `qua-skill`
 *  · #QUA-DAY-GIT     ⇒ CỐ Ý đi vòng, ghi vết `di-vong` — dòng chủ dự án cần soi
 * Dấu một mình KHÔNG đủ: dấu nói ý định, mốc nói việc đã làm. Một dấu hiệu người làm tự tạo ra được
 * không chứng minh được việc đã làm.
 *
 * Fail-closed ở nhánh mốc: mọi trục trặc đọc mốc ⇒ rơi xuống nhánh CHẶN. Mọi lỗi nội tại khác ⇒ cho
 * qua (exit 0) nhưng ghi `hook-loi` — hook hỏng không được làm tê liệt phiên, cũng không được im lặng.
 */
const K = require('./_hook-chung.cjs');
const { execSync } = require('child_process');
const SO = K.tepLog('CHAN_GIT', 'CHAN-GIT-COMMIT.ndjson');
const MOC = K.tepLog('MOC_DAY_GIT', '.moc-day-git.json');
const QUA_SKILL = /#\s*DAY-GIT-BUOC-3/i;
const CO_DI_VONG = /#\s*QUA-DAY-GIT/i;
// `git` + cờ tuỳ ý + `commit`; ký tự trước `git` là đầu chuỗi hoặc dấu ngắt lệnh — `echo "git commit"` không khớp.
const LA_COMMIT = /(^|[;&|(\n]|\s)git\s+(-[^\s]+(\s+[^\s-][^\s]*)?\s+)*commit(\s|$)/;

K.docStdin((hook) => {
  if (!hook) { K.ghiSo(SO, { ts: new Date().toISOString(), loai: 'hook-loi', vi: 'stdin không phải JSON' }); return process.exit(0); }
  const ten = hook.tool_name || '';
  if (ten !== 'Bash' && ten !== 'PowerShell') return process.exit(0);
  const lenh = String((hook.tool_input || {}).command || '');
  if (!LA_COMMIT.test(lenh)) return process.exit(0);
  const phien = String(hook.session_id || '').slice(0, 8);
  const gon = lenh.replace(/\s+/g, ' ').trim().slice(0, 300);

  let mocHopLe = null;
  try {
    const m = JSON.parse(K.fs.readFileSync(MOC, 'utf8'));
    const tuoi = (Date.now() - Date.parse(m.ts)) / 60000;
    const cayNay = execSync('git write-tree', { cwd: K.GOC, encoding: 'utf8' }).trim();
    const coStaged = execSync('git diff --cached --name-only', { cwd: K.GOC, encoding: 'utf8' }).trim();
    if (QUA_SKILL.test(lenh) && m.vanTay === cayNay && coStaged && tuoi >= 0 && tuoi <= 15 && Object.values(m.cong || {}).every((x) => x === 0)) mocHopLe = { vanTay: m.vanTay, tuoiPhut: Math.round(tuoi * 10) / 10 };
  } catch { /* không có mốc / mốc hỏng ⇒ rơi xuống nhánh CHẶN */ }

  if (mocHopLe) { K.ghiSo(SO, { ts: new Date().toISOString(), phien, loai: 'qua-skill', lenh: gon, vanTay: mocHopLe.vanTay, tuoiMocPhut: mocHopLe.tuoiPhut }); return process.exit(0); }
  if (CO_DI_VONG.test(lenh)) { K.ghiSo(SO, { ts: new Date().toISOString(), phien, loai: 'di-vong', lenh: gon, ghiChu: 'Cắm cờ #QUA-DAY-GIT — CỐ Ý đi vòng qua skill day-git. ⚠️ Có thể khớp nhầm lệnh chỉ NHẮC TÊN cờ — đọc kèm trường lenh.' }); return process.exit(0); }
  K.ghiSo(SO, { ts: new Date().toISOString(), phien, loai: 'chan', lenh: gon });
  K.chan([
    '🛑 CHẶN — `git commit` gõ tay. Luật: PLAYBOOK §0.5 — mọi commit đi qua skill day-git.',
    '',
    'Repo có thể chạy NHIỀU PHIÊN SONG SONG: vùng staged là tài nguyên dùng chung, `git add -A` + commit',
    'của phiên này quét luôn file phiên khác đang sửa dở. Và thông điệp commit mô tả sai nội dung còn',
    'tệ hơn gộp nhầm — nó làm hỏng bản ghi lịch sử dùng để rà về sau.',
    '',
    'PHẢI LÀM: chạy skill day-git (5 bước có kiểm chứng: C1-C4 · W1-W4 · 3 cổng · mốc · #DAY-GIT-BUOC-3).',
    'Thiếu mốc hợp lệ (Log/.moc-day-git.json, ≤15 phút, đúng vùng staged) thì dấu #DAY-GIT-BUOC-3 KHÔNG đủ.',
    '',
    `Nếu ${K.vai.chu} đã ĐÍCH THÂN yêu cầu commit tay cho ca này: thêm #QUA-DAY-GIT vào lệnh. Việc đi vòng`,
    `được ghi vết vào ${K.LOG}/CHAN-GIT-COMMIT.ndjson. ⛔ ${K.vai.ai} KHÔNG tự cắm cờ đó chỉ để cho lệnh chạy — đó là lách luật.`,
  ].join('\n'));
});
