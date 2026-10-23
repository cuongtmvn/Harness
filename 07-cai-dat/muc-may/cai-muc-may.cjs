#!/usr/bin/env node
'use strict';
/**
 * cai-muc-may.cjs — LẮP LỚP GÁC MỨC MÁY cho GlobalHarness (một lần mỗi máy; chạy lại không sinh trùng).
 *
 * Dùng:  node <Harness>/07-cai-dat/muc-may/cai-muc-may.cjs [--ap-dung]
 *   (không cờ)  XEM TRƯỚC — chỉ in việc sẽ làm, không ghi gì.
 *   --ap-dung   ghi thật (sao lưu tệp cũ vào ~/.claude/backups/ trước khi ghi).
 *
 * Làm hai việc ở ~/.claude (lớp người dùng của Claude Code — áp MỌI dự án trên máy):
 *   1. settings.json › hooks.SessionStart: thêm (hoặc sửa lệnh của) hook trỏ THẲNG vào
 *      <Harness>/07-cai-dat/muc-may/kiem-project-harness.cjs — kho đổi là máy nhận, không có bản chép để lệch.
 *      Hook khác giữ nguyên.
 *   2. CLAUDE.md: chèn / thay khối luật `khoi-claude-md.md` giữa hai mốc <!-- GLOBALHARNESS_START/END -->.
 *      Khối cũ không có mốc (cài tay, bắt đầu bằng "## Harness — luật mức máy") được thay luôn.
 *
 * *** VÌ SAO *** — xem đầu tệp kiem-project-harness.cjs. Bộ cài dự án (cai-dat.cjs) KHÔNG chép thư mục này.
 * Phiên cloud / điện thoại không có ~/.claude của máy ⇒ dùng skill claude.ai ở skill-claude-ai/ (chủ dự án tải lên).
 * Không chạy git. Thoát 0 = xong / không có gì phải làm · 2 = lỗi (JSON hỏng, thiếu tệp nguồn).
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const AP_DUNG = process.argv.includes('--ap-dung');
const HARNESS = path.resolve(__dirname, '..', '..');
const HARNESS_POSIX = HARNESS.split(path.sep).join('/');
const NHA = path.join(os.homedir(), '.claude');
const TEP_SETTINGS = path.join(NHA, 'settings.json');
const TEP_CLAUDE = path.join(NHA, 'CLAUDE.md');
const HOOK = path.join(__dirname, 'kiem-project-harness.cjs');
const LENH = `node "${HARNESS_POSIX}/07-cai-dat/muc-may/kiem-project-harness.cjs" 2>/dev/null || true`;
const MOC_DAU = '<!-- GLOBALHARNESS_START -->', MOC_CUOI = '<!-- GLOBALHARNESS_END -->';

const viec = [];
const loi = (s) => { console.error('🛑 ' + s); process.exit(2); };
if (!fs.existsSync(HOOK)) loi(`Thiếu ${HOOK}`);

// 1. settings.json
let st = {};
if (fs.existsSync(TEP_SETTINGS)) { try { st = JSON.parse(fs.readFileSync(TEP_SETTINGS, 'utf8')); } catch (e) { loi(`${TEP_SETTINGS} hỏng JSON — sửa tay trước: ${e.message}`); } }
st.hooks = st.hooks || {};
const nhom = (st.hooks.SessionStart = st.hooks.SessionStart || []);
let daCo = null;
for (const g of nhom) for (const h of g.hooks || []) if (/kiem-project-harness\.cjs/.test(h.command || '')) daCo = h;
if (daCo && daCo.command === LENH) console.log('  ✅ settings.json: hook SessionStart đã đúng');
else {
  if (daCo) daCo.command = LENH;
  else nhom.push({ hooks: [{ type: 'command', command: LENH, statusMessage: 'Kiểm dự án đã có ProjectHarness chưa...', timeout: 5 }] });
  viec.push({ tep: TEP_SETTINGS, noiDung: JSON.stringify(st, null, 2) + '\n' });
  console.log(`  ✏️ settings.json: ${daCo ? 'sửa lệnh' : 'thêm'} hook SessionStart → ${LENH}`);
}

// 2. CLAUDE.md
const khoi = MOC_DAU + '\n' + fs.readFileSync(path.join(__dirname, 'khoi-claude-md.md'), 'utf8').replace(/\{\{HARNESS_POSIX\}\}/g, HARNESS_POSIX).replace(/\{\{HARNESS\}\}/g, HARNESS).trimEnd() + '\n' + MOC_CUOI;
const cu = fs.existsSync(TEP_CLAUDE) ? fs.readFileSync(TEP_CLAUDE, 'utf8') : '';
let moi;
const iDau = cu.indexOf(MOC_DAU), iCuoi = cu.indexOf(MOC_CUOI);
if (iDau !== -1 && iCuoi > iDau) moi = cu.slice(0, iDau) + khoi + cu.slice(iCuoi + MOC_CUOI.length);
else {
  // Khối cài tay không mốc: từ tiêu đề tới tiêu đề "## " kế tiếp / mốc "<!-- " kế tiếp / hết tệp.
  const m = cu.match(/^## Harness — luật mức máy[\s\S]*?(?=^## |^<!-- |(?![\s\S]))/m);
  moi = m ? cu.replace(m[0], khoi + '\n\n') : khoi + '\n\n' + cu;
}
if (moi === cu) console.log('  ✅ CLAUDE.md: khối luật mức máy đã đúng');
else { viec.push({ tep: TEP_CLAUDE, noiDung: moi }); console.log(`  ✏️ CLAUDE.md: ${cu.includes(MOC_DAU) ? 'thay' : 'chèn'} khối luật mức máy (mốc ${MOC_DAU})`); }

if (!viec.length) { console.log('\n✅ Mức máy đã lắp đủ — không có gì phải làm.'); process.exit(0); }
if (!AP_DUNG) { console.log('\n(xem trước — chưa ghi gì; chạy lại với --ap-dung để ghi)'); process.exit(0); }

const sl = path.join(NHA, 'backups');
fs.mkdirSync(sl, { recursive: true });
const dau = new Date().toISOString().replace(/[:.]/g, '-');
for (const v of viec) {
  if (fs.existsSync(v.tep)) fs.copyFileSync(v.tep, path.join(sl, `${path.basename(v.tep)}.${dau}.truoc-cai-muc-may.bak`));
  fs.writeFileSync(v.tep, v.noiDung, 'utf8');
  console.log(`  💾 đã ghi ${v.tep} (bản cũ ở ${sl})`);
}
console.log('\n✅ Đã lắp mức máy. Hook SessionStart có tác dụng từ phiên Claude Code KẾ TIẾP.');
