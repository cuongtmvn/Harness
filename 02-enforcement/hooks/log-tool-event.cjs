#!/usr/bin/env node
'use strict';
/*
 * PostToolUse hook — ghi 1 dòng CHỈ APPEND vào Log/HOOK-EVENTS.ndjson cho MỖI lần gọi công cụ.
 * Không phụ thuộc AI có nhớ báo "bắt đầu/xong task" hay không (nghi thức tự khai đã thất bại nhiều lần).
 * Mục đích: có mốc giờ thật cho MỌI hoạt động — do-gio.cjs tính giờ từ đây. Việc gán "khúc này thuộc
 * task nào" làm SAU, tách khỏi lúc đang làm.
 * An toàn nhiều phiên song song: chỉ appendFileSync, không bao giờ đọc lại rồi ghi đè cả file.
 * Không bao giờ throw / exit khác 0.
 */
const K = require('./_hook-chung.cjs');
K.docStdin((hook) => {
  try {
    if (!hook) return process.exit(0);
    const toolName = hook.tool_name || 'unknown';
    const ti = hook.tool_input || {};
    let detail = '';
    if (toolName === 'Bash' || toolName === 'PowerShell') detail = String(ti.command || '').replace(/\s+/g, ' ').trim().slice(0, 100);
    else if (['Edit', 'Write', 'Read', 'NotebookEdit'].includes(toolName)) detail = ti.file_path || '';
    else if (['Glob', 'Grep'].includes(toolName)) detail = ti.pattern || '';
    else detail = JSON.stringify(ti).slice(0, 100);
    K.ghiSo(K.tepLog('HOOK_EVENTS', 'HOOK-EVENTS.ndjson'), { ts: new Date().toISOString(), sessionId: String(hook.session_id || process.env.CLAUDE_CODE_SESSION_ID || '').slice(0, 8), toolName, detail });
  } catch { /* nuốt mọi lỗi */ }
  process.exit(0);
});
