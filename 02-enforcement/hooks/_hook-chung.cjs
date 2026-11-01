'use strict';
/*
 * _hook-chung.cjs — phần dùng chung cho mọi hook: tìm gốc dự án, đọc config, đọc stdin, ghi sổ,
 * trả quyết định deny. Hook KHÔNG require Log/_harness-config.cjs (tệp đó thoát mã 2 khi thiếu
 * config, mà hook thì không được làm tê liệt phiên) — hook đọc config trực tiếp và nuốt lỗi.
 */
const fs = require('fs');
const path = require('path');

const GOC = process.env.CLAUDE_PROJECT_DIR || process.cwd();
let C = {};
try { C = JSON.parse(fs.readFileSync(path.join(GOC, 'harness.config.json'), 'utf8')); } catch { C = {}; }
const LOG = (C.thuMuc && C.thuMuc.log) || 'Log';
const tepLog = (khoa, macDinh) => path.join(GOC, LOG, (C.tep && C.tep.log && C.tep.log[khoa]) || macDinh);

function docStdin(cb) {
  let vao = '';
  process.stdin.on('data', (d) => { vao += d; });
  process.stdin.on('end', () => { let hook = {}; try { hook = JSON.parse(vao || '{}'); } catch { hook = null; } cb(hook); });
}
function ghiSo(tep, ban) {
  try { fs.mkdirSync(path.dirname(tep), { recursive: true }); fs.appendFileSync(tep, JSON.stringify(ban) + '\n'); } catch { /* sổ hỏng cũng không được chặn phiên */ }
}
function chan(lyDo) {
  // Hai lớp cùng lúc: JSON permissionDecision (chính thức) + exit 2 & stderr (dự phòng).
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: lyDo } }));
  process.stderr.write(lyDo + '\n');
  process.exit(2);
}
const re = (s, co) => { try { return s ? new RegExp(s, co || '') : null; } catch { return null; } };
const vai = { chu: (C.vaiTro && C.vaiTro.chu) || 'Chủ dự án', ai: (C.vaiTro && C.vaiTro.ai) || 'AI' };

module.exports = { fs, path, GOC, C, LOG, tepLog, docStdin, ghiSo, chan, re, vai };
