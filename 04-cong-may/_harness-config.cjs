#!/usr/bin/env node
'use strict';
/*
 * _harness-config.cjs — BỘ NẠP CẤU HÌNH dùng chung cho mọi công cụ của harness.
 *
 * Mọi công cụ trong Log/*.cjs và .claude/hooks/*.cjs đều `require` tệp này thay vì
 * tự gõ cứng đường dẫn. Lý do: một đường dẫn gõ cứng ở 20 chỗ là 20 chỗ trôi khi dự án
 * đổi tên thư mục — và trôi im lặng (cổng vẫn "chạy", chỉ là không gác gì).
 *
 * Cách tìm gốc dự án: đi ngược từ thư mục chứa tệp này (rồi từ cwd) cho tới khi gặp
 * `harness.config.json`. Có thể ép bằng biến môi trường HARNESS_ROOT.
 *
 * API:
 *   const H = require('./_harness-config.cjs');
 *   H.ROOT            gốc dự án (tuyệt đối)
 *   H.C               cấu hình đã parse
 *   H.P(...seg)       path.join(ROOT, ...seg)
 *   H.tep('RTM')      đường dẫn tuyệt đối của artefact theo KHOÁ (tìm trong output/log/luat)
 *   H.rel(p)          đường dẫn tương đối từ ROOT, dấu /
 *   H.doc(p)          đọc tệp (tuyệt đối hoặc tương đối ROOT), lỗi ⇒ ''
 *   H.docJson(p, mđ)  đọc JSON, lỗi ⇒ mặc định
 *   H.ndjson(p)       đọc ndjson ⇒ mảng (dòng hỏng bị bỏ, có đếm)
 *   H.git(cmd)        chạy git ở ROOT, lỗi ⇒ ''
 *   H.re(chuoi, co)   dựng RegExp từ chuỗi trong config (chuỗi rỗng ⇒ null)
 *   H.vai             { chu, ai }
 *   H.laMaCode(f)     tệp có phải mã sản phẩm theo config không
 *
 * ⛔ Fail-closed: không tìm thấy config ⇒ in lỗi rõ và thoát mã 2. Không rơi về mặc định
 *    ngầm — một bảng mặc định lặng lẽ là đúng thứ khiến cổng gác nhầm chỗ mà không ai kêu.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TEN_CONFIG = 'harness.config.json';

function timGoc() {
  const ungVien = [];
  if (process.env.HARNESS_ROOT) ungVien.push(path.resolve(process.env.HARNESS_ROOT));
  if (process.env.CLAUDE_PROJECT_DIR) ungVien.push(path.resolve(process.env.CLAUDE_PROJECT_DIR));
  for (const batDau of [__dirname, process.cwd()]) {
    let d = path.resolve(batDau);
    for (let i = 0; i < 8; i++) {
      ungVien.push(d);
      const cha = path.dirname(d);
      if (cha === d) break;
      d = cha;
    }
  }
  for (const d of ungVien) {
    if (fs.existsSync(path.join(d, TEN_CONFIG))) return d;
  }
  return null;
}

const ROOT = timGoc();
if (!ROOT) {
  console.error(`🛑 KHÔNG TÌM THẤY ${TEN_CONFIG} — công cụ harness không biết gốc dự án ở đâu.`);
  console.error('   Đặt harness.config.json ở gốc dự án, hoặc đặt biến môi trường HARNESS_ROOT.');
  console.error('   ⛔ Không suy đoán đường dẫn — dừng tại đây (fail-closed).');
  process.exit(2);
}

let C;
try {
  C = JSON.parse(fs.readFileSync(path.join(ROOT, TEN_CONFIG), 'utf8'));
} catch (e) {
  console.error(`🛑 ${TEN_CONFIG} hỏng cú pháp JSON: ${e.message}`);
  process.exit(2);
}

const P = (...seg) => path.join(ROOT, ...seg);
const rel = (p) => path.relative(ROOT, path.isAbsolute(p) ? p : P(p)).replace(/\\/g, '/');

function tep(khoa) {
  const t = C.tep || {};
  const tm = C.thuMuc || {};
  if (t.output && t.output[khoa]) return P(tm.output || 'Output', t.output[khoa]);
  if (t.log && t.log[khoa]) return P(tm.log || 'Log', t.log[khoa]);
  if (t.luat && t.luat[khoa]) return P(tm.luat || 'Instructions', t.luat[khoa]);
  throw new Error(`Khoá tệp "${khoa}" không có trong harness.config.json › tep`);
}

function doc(p) {
  try { return fs.readFileSync(path.isAbsolute(p) ? p : P(p), 'utf8'); } catch { return ''; }
}
function docJson(p, macDinh) {
  try { return JSON.parse(fs.readFileSync(path.isAbsolute(p) ? p : P(p), 'utf8')); } catch { return macDinh; }
}
function ndjson(p) {
  const ra = []; let hong = 0;
  for (const l of doc(p).split(/\r?\n/)) {
    if (!l.trim()) continue;
    try { ra.push(JSON.parse(l)); } catch { hong++; }
  }
  if (hong) ra._hong = hong;
  return ra;
}
function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  } catch { return ''; }
}
function re(chuoi, co) {
  if (!chuoi || !String(chuoi).trim()) return null;
  try { return new RegExp(chuoi, co || ''); } catch (e) {
    console.error(`🛑 Regex trong harness.config.json không hợp lệ: ${chuoi} — ${e.message}`);
    process.exit(2);
  }
}
function laMaCode(f) {
  const mc = C.maCode || {};
  const duoi = (mc.duoi || []).map((d) => d.toLowerCase());
  const boQua = mc.boQua || [];
  const chuan = String(f).replace(/\\/g, '/');
  if (!chuan.startsWith((C.thuMuc && C.thuMuc.app ? C.thuMuc.app : 'App') + '/')) return false;
  if (boQua.some((b) => chuan.includes(b))) return false;
  const d = chuan.split('.').pop().toLowerCase();
  return duoi.includes(d);
}

const vai = { chu: (C.vaiTro && C.vaiTro.chu) || 'Chủ dự án', ai: (C.vaiTro && C.vaiTro.ai) || 'AI' };

module.exports = { ROOT, C, P, tep, rel, doc, docJson, ndjson, git, re, laMaCode, vai, fs, path };
