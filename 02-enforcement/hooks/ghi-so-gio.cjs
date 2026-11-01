#!/usr/bin/env node
'use strict';
/*
 * Hook SessionStart · UserPromptSubmit · Stop · SessionEnd — SỔ GIỜ của dự án (bản 2.0).
 * Ghi đúng một dòng mỗi sự kiện vào Log/so-gio/<sessionId>.ndjson: { ts, suKien, sessionId, may, moiTruong }.
 * ⛔ KHÔNG ghi nội dung prompt, câu trả lời hay tên tệp — chỉ siêu dữ liệu thời gian.
 * Mỗi phiên một tệp ⇒ nhiều thiết bị (PC, điện thoại, cloud) cùng đẩy git không đụng nhau.
 * Phiên cloud nhận ra bằng biến CLAUDE_CODE_REMOTE=true (tài liệu hooks của Claude Code).
 * do-gio.cjs tính giờ từ sổ này: AI chạy (prompt → Stop) tính đủ; quãng Stop → prompt kế tính khi ≤ ngưỡng nghỉ, quá ngưỡng loại cả quãng.
 * Không bao giờ throw / exit khác 0 — hook ghi sổ không được làm tê liệt phiên.
 */
const os = require('os');
const K = require('./_hook-chung.cjs');
K.docStdin((hook) => {
  try {
    if (!hook) return process.exit(0);
    const ten = { SessionStart: 'bat-dau', UserPromptSubmit: 'prompt', Stop: 'xong', SessionEnd: 'ket-thuc' }[hook.hook_event_name];
    const sid = String(hook.session_id || process.env.CLAUDE_CODE_SESSION_ID || '').replace(/[^\w-]/g, '');
    if (!ten || !sid) return process.exit(0);
    const ban = { ts: new Date().toISOString(), suKien: ten, sessionId: sid, may: os.hostname(), moiTruong: process.env.CLAUDE_CODE_REMOTE === 'true' ? 'cloud' : 'may' };
    if (ten === 'bat-dau' && hook.source) ban.nguon = String(hook.source).slice(0, 12);
    if (ten === 'ket-thuc' && hook.reason) ban.lyDo = String(hook.reason).slice(0, 24);
    K.ghiSo(K.path.join(K.GOC, K.LOG, 'so-gio', `${sid}.ndjson`), ban);
  } catch { /* nuốt mọi lỗi */ }
  process.exit(0);
});
