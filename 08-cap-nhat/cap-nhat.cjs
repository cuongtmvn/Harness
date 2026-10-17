#!/usr/bin/env node
'use strict';
/**
 * cap-nhat.cjs — KÉO BẢN HARNESS MỚI VỀ MỘT DỰ ÁN ĐÃ CÀI (cơ chế 2: harness → dự án).
 *
 * Dùng:  node <Harness>/08-cap-nhat/cap-nhat.cjs <đường-dẫn-dự-án> [--ap-dung] [--dang-ky] [--kho]
 *   (không cờ)  CHỈ BÁO: tệp nào sẽ cập nhật, tệp nào xung đột, tệp nào thiếu. Không ghi gì.
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
const B = require('../07-cai-dat/_ban-do.cjs');

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

const ket = { capNhat: [], xungDot: [], thieu: [], mauDoi: [], trung: [], rieng: [], khongDoi: 0, tuSua: [] };
for (const m of B.banDo(HARNESS, GOC, C, ten)) {
  if (!fs.existsSync(m.tu)) continue;
  const r = rel(m.den), nguon = B.bam(m.tu), co = fs.existsSync(m.den), rec = mf.tep[r];
  const dichNow = co ? B.bam(m.den) : null;
  if (DANG_KY) {
    if (!co) ket.thieu.push(m);
    else if (dichNow === require('crypto').createHash('sha256').update(B.noiDung(m)).digest('hex').slice(0, 16)) ket.trung.push(r);
    else ket.rieng.push(r);
    mf.tep[r] = { nguon, dich: dichNow, nhom: m.nhom, ...(co ? {} : { thieu: true }) };
    continue;
  }
  if (!co) { ket.thieu.push(m); continue; }
  if (!rec) { mf.tep[r] = { nguon, dich: dichNow, nhom: m.nhom, giu: true }; ket.rieng.push(r); continue; }
  if (nguon === rec.nguon) { ket.khongDoi++; if (dichNow !== rec.dich && m.nhom !== 'so') ket.tuSua.push(r); continue; }
  if (m.nhom === 'so') { ket.khongDoi++; continue; }
  if (m.nhom === 'rieng') { ket.mauDoi.push(m); continue; }
  if (dichNow === rec.dich) ket.capNhat.push(m); else ket.xungDot.push(m);
}

const in_ = (tieuDe, ds, fmt) => { if (!ds.length) return; console.log(`\n${tieuDe} (${ds.length}):`); ds.forEach((x) => console.log('   · ' + (fmt ? fmt(x) : x))); };
console.log(`=== cap-nhat harness: dự án đang dùng ${mf.harnessVersion} · harness hiện có ${BAN_MOI} · ${GOC} ===`);
if (DANG_KY) {
  in_('✅ Tệp TRÙNG harness (nhận cập nhật thẳng sau này)', ket.trung);
  in_('✏️ Tệp KHÁC harness — ghi nhận là bản riêng của dự án (không ghi đè)', ket.rieng);
  in_('⬜ Tệp harness có mà dự án THIẾU', ket.thieu, (m) => rel(m.den));
  mf.harnessVersion = BAN_MOI; mf.harnessPath = HARNESS; mf.ngayDangKy = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(TEP_MF, JSON.stringify(mf, null, 2) + '\n', 'utf8');
  console.log(`\n📝 Đã ghi ${B.TEN_MANIFEST} (bản ${BAN_MOI}). Tệp thiếu chưa chép — chạy lại với --ap-dung nếu muốn.`);
  console.log(`   Ghi dự án vào ${path.join(HARNESS, '08-cap-nhat', 'DU-AN-DANG-KY.json')}.`);
  process.exit(0);
}
in_('⬆️ CẬP NHẬT ĐƯỢC — harness đổi, dự án chưa sửa', ket.capNhat, (m) => rel(m.den));
in_('⬜ THIẾU — harness có, dự án chưa có', ket.thieu, (m) => rel(m.den));
in_('📄 MẪU ĐỔI — tệp dự án tự điền, harness đổi mẫu: xem diff rồi gộp tay nếu cần', ket.mauDoi, (m) => `${rel(m.den)}   ← ${path.relative(HARNESS, m.tu)}`);
in_('⛔ XUNG ĐỘT — harness đổi VÀ dự án đã sửa riêng: KHÔNG ghi đè', ket.xungDot, (m) => `${rel(m.den)}\n       git diff --no-index ${JSON.stringify(m.den)} ${JSON.stringify(m.tu)}`);
if (ket.rieng.length) console.log(`\n(ghi nhận ${ket.rieng.length} tệp có trong dự án nhưng chưa có trong bảng kê — coi là bản riêng)`);
console.log(`\nKhông đổi: ${ket.khongDoi} tệp` + (ket.tuSua.length ? ` — trong đó dự án tự sửa ${ket.tuSua.length} tệp (harness chưa đổi nên không chạm; sau này harness đổi sẽ thành xung đột): ${ket.tuSua.join(' · ')}` : '') + '.');

if (AP_DUNG) {
  let n = 0;
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
  console.log('   Việc tiếp: đọc CHANGELOG.md mục bản mới (mục BẮT BUỘC phải làm) · ghi Dev Book "đã cập nhật harness bản ' + BAN_MOI + '" · đẩy git qua skill day-git · cập nhật DU-AN-DANG-KY.json.');
  if (!args.includes('--kho')) {
    const kh = path.join(GOC, C.thuMuc.log, 'kiem-harness.cjs');
    if (fs.existsSync(kh)) { console.log(`\n--- node ${C.thuMuc.log}/kiem-harness.cjs ---`); try { console.log(execSync(`node ${JSON.stringify(kh)}`, { cwd: GOC, encoding: 'utf8' })); } catch (e) { console.log((e.stdout || '') + (e.stderr || '')); } }
  }
} else if (ket.capNhat.length || ket.thieu.length) {
  console.log('\nChưa ghi gì. Áp dụng: thêm --ap-dung.');
}
process.exit(ket.xungDot.length ? 2 : 0);
