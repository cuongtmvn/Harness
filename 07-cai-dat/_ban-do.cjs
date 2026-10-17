'use strict';
/*
 * _ban-do.cjs — BẢN ĐỒ CHÉP TỆP harness → dự án, dùng chung cho cai-dat.cjs (cài mới) và
 * 08-cap-nhat/cap-nhat.cjs (nâng cấp). Một bản đồ ở một chỗ: cài và nâng cấp không bao giờ lệch nhau.
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

  for (const d of ['00-nguyen-tac', '01-playbook', '03-kiem-thu']) for (const f of ls(path.join(HARNESS, d), /\.md$/)) them(path.join(HARNESS, d, f), path.join(LUAT, f), null, 'luat');
  for (const f of ls(path.join(HARNESS, '01-playbook', 'checklist'), /\.md$/)) them(path.join(HARNESS, '01-playbook', 'checklist', f), path.join(LUAT, 'checklist', f), null, 'luat');
  them(path.join(HARNESS, '02-truy-vet', 'TRACEABILITY.md'), path.join(LUAT, 'TRACEABILITY.md'), null, 'luat');
  for (const f of SO_CAU_HINH) them(path.join(HARNESS, '06-so-ghi', f), path.join(LUAT, f), null, 'rieng');

  for (const f of ls(path.join(HARNESS, '02-truy-vet', 'templates'), /\.md$/)) them(path.join(HARNESS, '02-truy-vet', 'templates', f), path.join(OUT, f), thayTen(ten), 'rieng');

  for (const f of ls(path.join(HARNESS, '04-cong-may'), /\.cjs$/)) them(path.join(HARNESS, '04-cong-may', f), path.join(LOG, f), null, 'cong-cu');
  them(path.join(HARNESS, '04-cong-may', 'day-len-may-chu.template.sh'), path.join(LOG, 'day-len-may-chu.sh'), null, 'rieng');
  for (const f of ls(path.join(HARNESS, '06-so-ghi'), /\.(ndjson|md|json)$/).filter((f) => !SO_CAU_HINH.includes(f))) them(path.join(HARNESS, '06-so-ghi', f), path.join(LOG, f), null, 'so');
  for (const d of ['cong-buoc', 'khai-round']) them(path.join(HARNESS, '06-so-ghi', d, '_MAU.json'), path.join(LOG, d, '_MAU.json'), null, 'mau');

  them(path.join(HARNESS, '05-hook-skill', 'settings.json'), path.join(GOC, '.claude', 'settings.json'), null, 'rieng');
  for (const f of ls(path.join(HARNESS, '05-hook-skill', 'hooks'), /\.cjs$/)) them(path.join(HARNESS, '05-hook-skill', 'hooks', f), path.join(GOC, '.claude', 'hooks', f), null, 'cong-cu');
  const SK = path.join(HARNESS, '05-hook-skill', 'skills');
  for (const d of ls(SK).filter((d) => fs.statSync(path.join(SK, d)).isDirectory()))
    for (const f of ls(path.join(SK, d))) if (fs.statSync(path.join(SK, d, f)).isFile()) them(path.join(SK, d, f), path.join(GOC, '.claude', 'skills', d, f), null, 'cong-cu');
  for (const f of ls(path.join(HARNESS, '05-hook-skill', 'agents'), /\.md$/)) them(path.join(HARNESS, '05-hook-skill', 'agents', f), path.join(GOC, '.claude', 'agents', f), thayTen(ten), 'rieng');
  // gói theo loại dự án: harness.config.json › duAn.goi = ["desktop", "desktop-tauri", ...] → Instructions/goi/<loại>/
  for (const g of ((C.duAn || {}).goi || [])) {
    const G = path.join(HARNESS, '09-goi', g);
    if (!fs.existsSync(G)) continue;
    for (const f of ls(G)) if (fs.statSync(path.join(G, f)).isFile()) them(path.join(G, f), path.join(LUAT, 'goi', g, f), null, 'luat');
  }
  return ds;
}

const bam = (tep) => require('crypto').createHash('sha256').update(fs.readFileSync(tep)).digest('hex').slice(0, 16);
const noiDung = (m) => { const s = fs.readFileSync(m.tu, 'utf8'); return m.bienDoi ? m.bienDoi(s) : s; };
const docVersion = (HARNESS) => { try { return fs.readFileSync(path.join(HARNESS, 'VERSION'), 'utf8').trim(); } catch { return '0.0.0'; } };
const soSanhVersion = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); } return 0; };

module.exports = { banDo, bam, noiDung, docVersion, soSanhVersion, ls, SO_CAU_HINH, TEN_MANIFEST: '.harness-manifest.json' };
