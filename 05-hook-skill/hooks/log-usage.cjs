#!/usr/bin/env node
'use strict';
/*
 * Stop hook — ghi 1 dòng token usage vào Log/USAGE.md mỗi lượt AI trả lời xong, kèm prompt gần nhất
 * (cắt 60 ký tự). Dữ liệu thô để đối soát telemetry; cột prompt là nơi do-gio.cjs tìm mốc "nạp context".
 * ⚠️ Giới hạn đã biết: chỉ lấy usage của bước suy luận CUỐI trong lượt, bỏ sót các bước gọi công cụ
 *    trước đó ⇒ con số là CẬN DƯỚI. Không dùng số này làm giờ làm việc.
 */
const K = require('./_hook-chung.cjs');
K.docStdin((hook) => {
  try {
    if (!hook) return;
    const tp = hook.transcript_path;
    if (!tp || !K.fs.existsSync(tp)) return;
    const lines = K.fs.readFileSync(tp, 'utf8').trim().split('\n');
    let lastA = null, lastPrompt = '';
    for (let i = lines.length - 1; i >= 0; i--) {
      let o; try { o = JSON.parse(lines[i]); } catch { continue; }
      if (!lastA && o.type === 'assistant' && o.message && o.message.usage) lastA = o;
      if (!lastPrompt && o.type === 'user' && o.origin && o.origin.kind === 'human' && o.message && Array.isArray(o.message.content)) { const tb = o.message.content.find((c) => c.type === 'text' && c.text); if (tb) lastPrompt = tb.text; }
      if (lastA && lastPrompt) break;
    }
    if (!lastA) return;
    const u = lastA.message.usage, ts = lastA.timestamp || new Date().toISOString();
    const sid = String(hook.session_id || lastA.sessionId || '').slice(0, 8);
    const out = K.tepLog('USAGE', 'USAGE.md');
    K.fs.mkdirSync(K.path.dirname(out), { recursive: true });
    if (!K.fs.existsSync(out)) K.fs.writeFileSync(out, '# USAGE — Token usage tự động (mỗi lượt)\n\n> Sinh bởi Stop hook log-usage.cjs. Dữ liệu thô, cận dưới. Cột cuối là prompt gần nhất (60 ký tự) — do-gio.cjs tìm mốc "nạp context" ở đây.\n\n| Timestamp (UTC) | Session | Model | Input | Cache create | Cache read | Output | Prompt gần nhất |\n|---|---|---|---|---|---|---|---|\n');
    if (K.fs.readFileSync(out, 'utf8').includes(`| ${ts} | ${sid} |`)) return;
    const task = lastPrompt.replace(/\s+/g, ' ').trim().slice(0, 60).replace(/\|/g, '\\|');
    K.fs.appendFileSync(out, `| ${ts} | ${sid} | ${lastA.message.model || ''} | ${u.input_tokens || 0} | ${u.cache_creation_input_tokens || 0} | ${u.cache_read_input_tokens || 0} | ${u.output_tokens || 0} | ${task} |\n`);
  } catch { /* nuốt */ }
});
