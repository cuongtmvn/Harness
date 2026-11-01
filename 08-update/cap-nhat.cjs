#!/usr/bin/env node
'use strict';
/**
 * cap-nhat.cjs — KÉO BẢN HARNESS MỚI VỀ MỘT DỰ ÁN ĐÃ CÀI (cơ chế 2: harness → dự án).
 *
 * Dùng:  node <Harness>/08-update/cap-nhat.cjs <đường-dẫn-dự-án> [--ap-dung] [--dang-ky] [--kho]
 *   (không cờ)  XEM TRƯỚC (dry run) — CHỈ BÁO: tệp nào sẽ cập nhật, tệp nào xung đột, tệp nào thiếu. Không ghi gì.
 *   --ap-dung   ghi thật các tệp "cập nhật được" + "thiếu"; tệp xung đột vẫn KHÔNG ghi đè.
 *   --dang-ky   dự án chưa có .harness-manifest.json (cài tay / bản cũ): dựng bảng kê từ trạng thái hiện tại,
 *               liệt kê tệp trùng harness / tệp khác / tệp thiếu. Không ghi đè tệp nào.
 *   --kho       không chạy kiem-harness sau khi áp dụng.
 *
 * Luật so sánh (mã băm trong .harness-manifest.json do cai-dat.cjs ghi lúc cài):
 *   nguon = băm tệp NGUỒN trong harness lúc cài · dich = băm tệp ĐÍCH trong dự án lúc cài
 *   harness chưa đổi (băm nguồn hiện tại == nguon)        ⇒ không làm gì, kể cả dự án đã sửa
 *   harness đổi, dự án chưa sửa (băm đích hiện tại == dich) ⇒ CẬP NHẬT ĐƯỢC
 *   harness đổi, dự án đã sửa                               ⇒ XUNG ĐỘT: in lệnh xem diff, Huynh gộp tay
 *   nhóm 'so' (sổ ghi)                                      ⇒ không bao giờ ghi đè, chỉ chép khi thiếu
 *   nhóm 'rieng' (config, CLAUDE.md, mẫu artefact…)          ⇒ harness đổi thì chỉ BÁO "mẫu đổi", không ghi đè
 * ⛔ Không chạy git. Không xoá tệp. Thoát 0 nếu không có xung đột, 2 nếu có xung đột hoặc thiếu bảng kê.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const B = require('../07-install/_ban-do.cjs');

const HARNESS = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const dich = args.find((a) => !a.startsWith('--'));
if (!dich) { console.error('Dùng: node cap-nhat.cjs <đường-dẫn-dự-án> [--ap-dung] [--dang-ky] [--kho]'); process.exit(1); }
const GOC = path.resolve(dich);
const AP_DUNG = args.includes('--ap-dung'), DANG_KY = args.includes('--dang-ky');
const rel = (p) => path.relative(GOC, p).split(path.sep).join('/');
const TEP_MF = path.join(GOC, B.TEN_MANIFEST);
const BAN_MOI = B.docVersion(HARNESS);

let Cda = null;
try { Cda = JSON.parse(fs.readFileSync(path.join(GOC, 'harness.config.json'), 'utf8')); } catch { /* chưa cài */ }
const C = Cda || JSON.parse(fs.readFileSync(path.join(HARNESS, 'harness.config.json'), 'utf8'));
const ten = Cda && Cda.duAn && !/^<.*>$/.test(Cda.duAn.ten || '') ? Cda.duAn.ten : null;

let mf = null;
try { mf = JSON.parse(fs.readFileSync(TEP_MF, 'utf8')); } catch { mf = null; }
if (!mf && !DANG_KY) {
  console.log(`🛑 ${GOC} chưa có ${B.TEN_MANIFEST} (cài tay hoặc bản harness cũ).`);
  console.log(`   Đăng ký lần đầu: node ${path.relative(process.cwd(), __filename)} ${JSON.stringify(dich)} --dang-ky`);
  process.exit(2);
}
if (!mf) mf = { harnessVersion: '0.0.0', harnessPath: HARNESS, harnessRepo: 'https://github.com/cuongtmvn/Harness.git', ngayCai: null, tep: {} };

// 2.0 — `--da-gop <tệp>`: chủ dự án đã gộp tay một tệp "mẫu đổi" hoặc "xung đột" ⇒ ghi nhận băm nguồn + đích hiện tại,
// bỏ cờ mauDoiChuaGop. Không ghi tệp nào khác.
const iGop = args.indexOf('--da-gop');
if (iGop !== -1) {
  const r = String(args[iGop + 1] || '').split(path.sep).join('/');
  const m = B.banDo(HARNESS, GOC, C, ten).find((x) => rel(x.den) === r);
  if (!r || !m || !mf.tep[r] || !fs.existsSync(m.den)) { console.error(`🛑 --da-gop: không thấy "${r}" trong bảng kê / bản đồ chép.`); process.exit(1); }
  const { mauDoiChuaGop, ...giu } = mf.tep[r];
  mf.tep[r] = { ...giu, nguon: B.bam(m.tu), dich: B.bam(m.den), daGop: new Date().toISOString().slice(0, 10) };
  fs.writeFileSync(TEP_MF, JSON.stringify(mf, null, 2) + '\n', 'utf8');
  console.log(`✅ Ghi nhận đã gộp: ${r}${mauDoiChuaGop ? ` (mẫu đổi từ bản ${mauDoiChuaGop})` : ''}.`);
  process.exit(0);
}

// ---- di trú đổi tên khi nâng từ bản cũ hơn (vd 1.x → 2.0): tệp dự án đổi tên theo 08-update/doi-ten.json.
// Đổi tên giữ nguyên nội dung dự án (kể cả phần dự án tự sửa) ⇒ không mất gì; bảng kê chuyển khoá theo.
// Xem trước: so sánh như thể đã đổi tên. Áp dụng: đổi tên thật + thay tên cũ → mới trong config / sổ luật / CLAUDE.md.
const LUAT_DIR = (C.thuMuc && C.thuMuc.luat) || 'Instructions';
const doiTen = []; // [{ cu, moi, ban }] đường dẫn tương đối từ gốc dự án
try {
  const DT = JSON.parse(fs.readFileSync(path.join(HARNESS, '08-update', 'doi-ten.json'), 'utf8'));
  for (const d of DT.doiTen || []) if (!DANG_KY && B.soSanhVersion(mf.harnessVersion, d.ban) < 0)
    for (const [cu, moi] of Object.entries(d.tep)) doiTen.push({ cu: cu.replace('{luat}', LUAT_DIR), moi: moi.replace('{luat}', LUAT_DIR), ban: d.ban });
} catch { /* không có bản đồ đổi tên */ }
const daDoi = {}; // rel mới → rel cũ (còn chờ đổi)
const ketDoi = [];
for (const d of doiTen) {
  const cu = path.join(GOC, d.cu), moi = path.join(GOC, d.moi);
  if (!fs.existsSync(cu) || fs.existsSync(moi)) continue;
  const laThuMuc = fs.statSync(cu).isDirectory();
  const ds = laThuMuc ? fs.readdirSync(cu, { recursive: true }).map(String).filter((f) => fs.statSync(path.join(cu, f)).isFile()).map((f) => [path.join(d.cu, f), path.join(d.moi, f)]) : [[d.cu, d.moi]];
  for (const [c, m] of ds) daDoi[m.split(path.sep).join('/')] = c.split(path.sep).join('/');
  ketDoi.push(d);
}
const thuc = (r) => (daDoi[r] ? daDoi[r] : r); // đường dẫn đang có thật trên đĩa (trước khi đổi tên)

const ket = { capNhat: [], xungDot: [], thieu: [], mauDoi: [], trung: [], rieng: [], khongDoi: 0, tuSua: [] };
for (const m of B.banDo(HARNESS, GOC, C, ten)) {
  if (!fs.existsSync(m.tu)) continue;
  const r = rel(m.den), rThuc = thuc(r), denThuc = path.join(GOC, rThuc);
  const nguon = B.bam(m.tu), co = fs.existsSync(denThuc), rec = mf.tep[r] || mf.tep[rThuc];
  const dichNow = co ? B.bam(denThuc) : null;
  if (DANG_KY) {
    if (!co) ket.thieu.push(m);
    else if (dichNow === require('crypto').createHash('sha256').update(B.noiDung(m)).digest('hex').slice(0, 16)) ket.trung.push(r);
    else ket.rieng.push(r);
    mf.tep[r] = { nguon, dich: dichNow, nhom: m.nhom, ...(co ? {} : { thieu: true }), ...(ket.rieng.includes(r) ? { rieng: true } : {}) };
    continue;
  }
  if (!co) { ket.thieu.push(m); continue; }
  if (!rec) { mf.tep[r] = { nguon, dich: dichNow, nhom: m.nhom, giu: true }; ket.rieng.push(r); continue; }
  if (B.khop(m.tu, rec.nguon)) { ket.khongDoi++; if (!B.khop(denThuc, rec.dich) && m.nhom !== 'so') ket.tuSua.push(r); continue; }
  if (m.nhom === 'so') { ket.khongDoi++; continue; }
  if (m.nhom === 'rieng') { ket.mauDoi.push(m); continue; }
  // rec.rieng: lúc --dang-ky tệp đã khác harness (bản riêng của dự án) ⇒ harness đổi thì luôn là xung đột, không ghi đè
  if (B.khop(denThuc, rec.dich) && !rec.rieng) ket.capNhat.push(m); else ket.xungDot.push(m);
}

const in_ = (tieuDe, ds, fmt) => { if (!ds.length) return; console.log(`\n${tieuDe} (${ds.length}):`); ds.forEach((x) => console.log('   · ' + (fmt ? fmt(x) : x))); };
console.log(`=== cap-nhat: ProjectHarness đang dùng ${mf.harnessVersion} · GlobalHarness hiện có ${BAN_MOI} · ${GOC} ===`);
if (DANG_KY) {
  in_('✅ Tệp TRÙNG harness (nhận cập nhật thẳng sau này)', ket.trung);
  in_('✏️ Tệp KHÁC harness — ghi nhận là bản riêng của dự án (không ghi đè)', ket.rieng);
  in_('⬜ Tệp harness có mà dự án THIẾU', ket.thieu, (m) => rel(m.den));
  mf.harnessVersion = BAN_MOI; mf.harnessPath = HARNESS; mf.ngayDangKy = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(TEP_MF, JSON.stringify(mf, null, 2) + '\n', 'utf8');
  console.log(`\n📝 Đã ghi ${B.TEN_MANIFEST} (bản ${BAN_MOI}). Tệp thiếu chưa chép — chạy lại với --ap-dung nếu muốn.`);
  console.log(`   Ghi dự án vào ${path.join(HARNESS, '08-update', 'DU-AN-DANG-KY.json')}.`);
  process.exit(0);
}
in_('🔀 ĐỔI TÊN — bố cục bản mới (giữ nguyên nội dung dự án, bảng kê chuyển theo)', ketDoi, (d) => `${d.cu} → ${d.moi}   (bản ${d.ban})`);
// Thay tên cũ → mới: config, sổ luật, CLAUDE.md và mọi tệp luật dự án khai ở tepLuat.danhSach (kể cả luật riêng).
const TEP_THAY = [...new Set(['harness.config.json', `${LUAT_DIR}/LUAT-DANGKY.json`, 'CLAUDE.md', ...(((C.tepLuat || {}).danhSach) || [])])]
  .filter((t) => !ketDoi.some((d) => d.cu === t));
if (ketDoi.length) console.log(`   Kèm thay tên cũ → mới trong: ${TEP_THAY.join(' · ')} — chỉ đường dẫn đầy đủ (${LUAT_DIR}/<tên>), tên trong \`…\`, và giá trị JSON đúng bằng tên; không đổi nội dung khác.`);
in_('⬆️ CẬP NHẬT ĐƯỢC — harness đổi, dự án chưa sửa', ket.capNhat, (m) => rel(m.den));
in_('⬜ THIẾU — harness có, dự án chưa có', ket.thieu, (m) => rel(m.den));
in_('📄 MẪU ĐỔI — tệp dự án tự điền, harness đổi mẫu: xem diff rồi gộp tay nếu cần', ket.mauDoi, (m) => `${rel(m.den)}   ← ${path.relative(HARNESS, m.tu)}`);
in_('⛔ XUNG ĐỘT — harness đổi VÀ dự án đã sửa riêng: KHÔNG ghi đè', ket.xungDot, (m) => `${rel(m.den)}\n       git diff --no-index ${JSON.stringify(path.join(GOC, thuc(rel(m.den))))} ${JSON.stringify(m.tu)}`);
if (ket.rieng.length) console.log(`\n(ghi nhận ${ket.rieng.length} tệp có trong dự án nhưng chưa có trong bảng kê — coi là bản riêng)`);
console.log(`\nKhông đổi: ${ket.khongDoi} tệp` + (ket.tuSua.length ? ` — trong đó dự án tự sửa ${ket.tuSua.length} tệp (harness chưa đổi nên không chạm; sau này harness đổi sẽ thành xung đột): ${ket.tuSua.join(' · ')}` : '') + '.');

if (AP_DUNG) {
  let n = 0;
  // đổi tên trước, rồi mới ghi nội dung mới vào đường dẫn mới
  for (const d of ketDoi) {
    fs.mkdirSync(path.dirname(path.join(GOC, d.moi)), { recursive: true });
    fs.renameSync(path.join(GOC, d.cu), path.join(GOC, d.moi));
  }
  for (const [moi, cu] of Object.entries(daDoi)) if (mf.tep[cu]) { mf.tep[moi] = mf.tep[cu]; delete mf.tep[cu]; }
  if (ketDoi.length) {
    const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for (const t0 of TEP_THAY) {
      const t = t0; const p = path.join(GOC, t); if (!fs.existsSync(p)) continue;
      let s = fs.readFileSync(p, 'utf8'); const truoc = s;
      for (const d of ketDoi) {
        const cu = path.basename(d.cu), moi = path.basename(d.moi);
        // (1) đường dẫn đầy đủ: Instructions/PLAYBOOK.md · Instructions/goi/…  (2) tên trong backtick: `PLAYBOOK.md`
        // (3) giá trị JSON đúng bằng tên: "PLAYBOOK.md"  (4) riêng thư mục goi: khoá JSON "goi": → "packs":
        s = s.replace(new RegExp(`(?<![\\w-])${esc(d.cu)}(?![\\w-])`, 'g'), d.moi)
          .replace(new RegExp('`' + esc(cu) + '`', 'g'), '`' + moi + '`')
          .replace(new RegExp(`"${esc(cu)}"`, 'g'), `"${moi}"`);
        if (cu === 'goi') s = s.replace(/"goi"(\s*):/g, '"packs"$1:');
      }
      if (s !== truoc) { fs.writeFileSync(p, s, 'utf8'); if (mf.tep[t]) mf.tep[t].dich = B.bam(p); console.log(`   ✏️ ${t}: đã thay tên tệp cũ → mới`); }
    }
    console.log(`🔀 Đã đổi tên ${ketDoi.length} mục theo bố cục bản ${BAN_MOI}.`);
  }
  for (const m of [...ket.capNhat, ...ket.thieu]) {
    fs.mkdirSync(path.dirname(m.den), { recursive: true });
    fs.writeFileSync(m.den, B.noiDung(m), 'utf8');
    mf.tep[rel(m.den)] = { nguon: B.bam(m.tu), dich: B.bam(m.den), nhom: m.nhom };
    n++;
  }
  for (const m of ket.mauDoi) mf.tep[rel(m.den)] = { ...mf.tep[rel(m.den)], nguon: B.bam(m.tu), mauDoiChuaGop: BAN_MOI };
  mf.harnessVersion = BAN_MOI; mf.harnessPath = HARNESS; mf.ngayCapNhat = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(TEP_MF, JSON.stringify(mf, null, 2) + '\n', 'utf8');
  console.log(`\n✅ Đã ghi ${n} tệp · bảng kê lên bản ${BAN_MOI}.` + (ket.xungDot.length ? ` ${ket.xungDot.length} tệp xung đột để nguyên — bảng kê vẫn giữ mã băm cũ cho chúng.` : ''));
  console.log('   Việc tiếp: đọc CHANGELOG.md mục bản mới (mục BẮT BUỘC phải làm) · ghi Dev Book "đã cập nhật ProjectHarness lên GlobalHarness bản ' + BAN_MOI + '" · đẩy git qua skill day-git · cập nhật DU-AN-DANG-KY.json.');
  if (!args.includes('--kho')) {
    const kh = path.join(GOC, C.thuMuc.log, 'kiem-harness.cjs');
    if (fs.existsSync(kh)) { console.log(`\n--- node ${C.thuMuc.log}/kiem-harness.cjs ---`); try { console.log(execSync(`node ${JSON.stringify(kh)}`, { cwd: GOC, encoding: 'utf8' })); } catch (e) { console.log((e.stdout || '') + (e.stderr || '')); console.log('🛑 kiem-harness ĐỎ sau khi áp dụng — sửa trước khi dùng (mã thoát 2).'); process.exitCode = 2; } }
  }
} else if (ket.capNhat.length || ket.thieu.length) {
  console.log('\nĐây là bản XEM TRƯỚC — chưa ghi gì. Áp dụng: thêm --ap-dung.');
}
process.exit(ket.xungDot.length || process.exitCode === 2 ? 2 : 0);
