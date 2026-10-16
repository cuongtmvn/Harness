#!/usr/bin/env node
'use strict';
/*
 * PostToolUse hook — chạy SAU mỗi Edit/Write. Nếu file vừa sửa là FILE LUẬT thì tự chạy
 * kiem-luat.cjs --mat. Chạy bất kể AI nghĩ gì — lớp không phụ thuộc trí nhớ.
 * ⛔ Hạ tầng gác luật — AI không được sửa/tắt (điều dừng 5).
 */
const K = require('./_hook-chung.cjs');
const { execSync } = require('child_process');
let vao = '';
try { vao = K.fs.readFileSync(0, 'utf8'); } catch { process.exit(0); }
const LUAT = ((K.C.tepLuat || {}).danhSach || []).map((f) => f.split('/').pop());
if (!LUAT.length || !LUAT.some((f) => vao.includes(f))) process.exit(0);
try { execSync(`node ${JSON.stringify(K.path.join(K.GOC, K.LOG, 'kiem-luat.cjs'))} --mat`, { cwd: K.GOC, stdio: 'pipe', encoding: 'utf8' }); }
catch (e) { console.error('\n🛑 KIEM-LUAT: vừa sửa file luật và CÓ LUẬT BỊ MẤT\n' + (e.stdout || '') + `\nTruy lại từng luật mất, hoặc đánh dấu đã bỏ TƯỜNG MINH trong sổ (điều dừng 5 — hỏi ${K.vai.chu}).\n`); }
process.exit(0);
