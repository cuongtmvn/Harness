'use strict';
/*
 * _ban-do.cjs — BẢN ĐỒ CHÉP TỆP harness → dự án, dùng chung cho cai-dat.cjs (cài mới) và
 * 08-update/cap-nhat.cjs (nâng cấp). Một bản đồ ở một chỗ: cài và nâng cấp không bao giờ lệch nhau.
 *
 * Mỗi mục: { tu, den, bienDoi, nhom }
 *   nhom = 'luat'    tài liệu luật — harness đổi thì dự án nên nhận (tepLuat)
 *          'cong-cu' công cụ .cjs / hook / skill — harness đổi thì dự án nên nhận
 *          'mau'     mẫu máy đọc (_MAU.json) — như cong-cu
 *          'rieng'   tệp dự án tự điền (config, CLAUDE.md, artefact mẫu, bảng dây cương…) — harness đổi
 *                    thì CHỈ BÁO, không ghi đè
 *          'so'      sổ ghi trạng thái (ndjson, TASKLIST) — không bao giờ ghi đè, chỉ chép khi thiếu
 */
const fs = require('fs');
const path = require('path');
const ls = (d, loc) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => !loc || loc.test(f)) : []);
const thayTen = (ten) => (ten ? (s) => s.replace(/<TÊN DỰ ÁN>/g, ten) : null);

const SO_CAU_HINH = ['LEASH-BANG.json', 'PHAM-VI-MVP.json', 'PHU-MOI-TRUONG.json', 'LUAT-DANGKY.json'];

function banDo(HARNESS, GOC, C, ten) {
  const TM = C.thuMuc;
  const LUAT = path.join(GOC, TM.luat), OUT = path.join(GOC, TM.output), LOG = path.join(GOC, TM.log);
  const ds = [];
  const them = (tu, den, bienDoi, nhom) => ds.push({ tu, den, bienDoi: bienDoi || null, nhom });

  them(path.join(HARNESS, 'harness.config.json'), path.join(GOC, 'harness.config.json'), ten ? (s) => s.replace('"ten": "<TÊN DỰ ÁN>"', `"ten": ${JSON.stringify(ten)}`) : null, 'rieng');
  them(path.join(HARNESS, 'CLAUDE.template.md'), path.join(GOC, 'CLAUDE.md'), thayTen(ten), 'rieng');

  // 2.0: luật chung theo nhánh B1–B5 (00-rules) + luật pipeline (01-pipeline, testing/) → Instructions/; steps/ → Instructions/checklist/
  const MD = /^(?!README\.md$).+\.md$/;
  for (const d of ['00-rules', '01-pipeline', path.join('01-pipeline', 'testing')]) for (const f of ls(path.join(HARNESS, d), MD)) them(path.join(HARNESS, d, f), path.join(LUAT, f), null, 'luat');
  for (const f of ls(path.join(HARNESS, '01-pipeline', 'steps'), /\.md$/)) them(path.join(HARNESS, '01-pipeline', 'steps', f), path.join(LUAT, 'checklist', f), null, 'luat');
  for (const f of SO_CAU_HINH) them(path.join(HARNESS, '03-records', f), path.join(LUAT, f), null, 'rieng');

  for (const f of ls(path.join(HARNESS, '01-pipeline', 'templates'), /\.md$/)) them(path.join(HARNESS, '01-pipeline', 'templates', f), path.join(OUT, f), thayTen(ten), 'rieng');

  for (const f of ls(path.join(HARNESS, '02-enforcement/tools'), /\.cjs$/)) them(path.join(HARNESS, '02-enforcement/tools', f), path.join(LOG, f), null, 'cong-cu');
  them(path.join(HARNESS, '02-enforcement/tools', 'day-len-may-chu.template.sh'), path.join(LOG, 'day-len-may-chu.sh'), null, 'rieng');
  for (const f of ls(path.join(HARNESS, '03-records'), /\.(ndjson|md|json)$/).filter((f) => !SO_CAU_HINH.includes(f))) them(path.join(HARNESS, '03-records', f), path.join(LOG, f), null, 'so');
  for (const d of ['cong-buoc', 'khai-round']) them(path.join(HARNESS, '03-records', d, '_MAU.json'), path.join(LOG, d, '_MAU.json'), null, 'mau');

  them(path.join(HARNESS, '02-enforcement', 'settings.json'), path.join(GOC, '.claude', 'settings.json'), null, 'rieng');
  for (const f of ls(path.join(HARNESS, '02-enforcement', 'hooks'), /\.cjs$/)) them(path.join(HARNESS, '02-enforcement', 'hooks', f), path.join(GOC, '.claude', 'hooks', f), null, 'cong-cu');
  const SK = path.join(HARNESS, '02-enforcement', 'skills');
  for (const d of ls(SK).filter((d) => fs.statSync(path.join(SK, d)).isDirectory()))
    for (const f of ls(path.join(SK, d))) if (fs.statSync(path.join(SK, d, f)).isFile()) them(path.join(SK, d, f), path.join(GOC, '.claude', 'skills', d, f), null, 'cong-cu');
  for (const f of ls(path.join(HARNESS, '02-enforcement', 'agents'), /\.md$/)) them(path.join(HARNESS, '02-enforcement', 'agents', f), path.join(GOC, '.claude', 'agents', f), thayTen(ten), 'rieng');
  // pack theo loại dự án: harness.config.json › duAn.packs (tên cũ 1.x: duAn.goi) = ["desktop", "desktop-tauri", ...] → Instructions/packs/<loại>/
  for (const g of ((C.duAn || {}).packs || (C.duAn || {}).goi || [])) {
    const G = path.join(HARNESS, '09-packs', g);
    if (!fs.existsSync(G)) continue;
    for (const f of ls(G)) if (fs.statSync(path.join(G, f)).isFile()) them(path.join(G, f), path.join(LUAT, 'packs', g, f), null, 'luat');
  }
  return ds;
}

// 2.0: băm bỏ ký tự CR — tệp lấy ra lại bằng git (CRLF ↔ LF) không bị coi là 'dự án tự sửa'. bamTho = cách băm 1.x (byte thô),
// khop() nhận cả hai để bảng kê ghi từ 1.x vẫn so đúng.
const h16 = (buf) => require('crypto').createHash('sha256').update(buf).digest('hex').slice(0, 16);
const bamTho = (tep) => h16(fs.readFileSync(tep));
const bam = (tep) => h16(Buffer.from(fs.readFileSync(tep, 'latin1').replace(/\r/g, ''), 'latin1'));
const khop = (tep, ghi) => !!ghi && (ghi === bam(tep) || ghi === bamTho(tep));
const noiDung = (m) => { const s = fs.readFileSync(m.tu, 'utf8'); return m.bienDoi ? m.bienDoi(s) : s; };
const docVersion = (HARNESS) => { try { return fs.readFileSync(path.join(HARNESS, 'VERSION'), 'utf8').trim(); } catch { return '0.0.0'; } };
const soSanhVersion = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); } return 0; };

module.exports = { banDo, bam, bamTho, khop, noiDung, docVersion, soSanhVersion, ls, SO_CAU_HINH, TEN_MANIFEST: '.harness-manifest.json' };
