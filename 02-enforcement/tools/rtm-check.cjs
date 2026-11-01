#!/usr/bin/env node
'use strict';
/*
 * rtm-check.cjs — kiểm sức khoẻ MA TRẬN TRUY VẾT (RTM) hai chiều.
 *
 * VÌ SAO CÓ CÔNG CỤ NÀY
 *   Một ma trận truy vết không tự kiểm thì chính nó là thứ mất truy vết đầu tiên — và mất
 *   IM LẶNG: bộ test tăng gấp ba, RTM vẫn kể chuyện cũ, không ai thấy cho tới khi tình cờ đối chiếu.
 *   Lỗ hay nằm ở CHIỀU KHÔNG AI NHÌN: ai cũng kiểm RTM → test, không ai kiểm SPEC → RTM.
 *
 * KIỂM 7 THỨ
 *   1. Số ca test RTM khai (nếu có khai theo tệp) có khớp số ca THẬT máy đếm được không
 *   2. Tệp test trên đĩa có được RTM nhắc tới không (mồ côi chiều ngược)
 *   3. Ô Code/Test có trỏ tới tệp CÓ THẬT không (chống bẫy c1: tên tệp đã xoá vẫn làm số đẹp)
 *   4. Dòng còn nhãn "mồ côi" mà chưa được xác nhận là chấp nhận được
 *   5. Dòng khai đã build mà cột Code/Test để trống
 *   6. Story có trong SPEC mà KHÔNG dòng RTM nào trỏ tới (chiều SPEC → RTM)
 *   7. Ô TRỐNG ở cột UAT/SIT — chuỗi truy vết bị đứt giữa chừng (ghi "— chưa có ca" là hợp lệ, trống thì không)
 *
 * ⚠️ Giới hạn khai thẳng
 *   - Chỉ kiểm tệp có TỒN TẠI, không kiểm tệp đó có thật sự kiểm thứ dòng RTM nói không.
 *   - Số ca THẬT chỉ có khi lệnh `kiemThu.lenhDemCa` chạy được; không chạy được thì khai
 *     "không đếm được bằng máy" và coi là KHÔNG XÁC MINH ĐƯỢC (mã thoát 1), không PASS.
 *
 * Chạy: node Log/rtm-check.cjs
 * Mã thoát: 0 sạch · 2 có GAP (CHẶN) · 1 không xác minh được (thiếu tệp bắt buộc / không đếm được ca)
 */
const H = require('./_harness-config.cjs');
const { fs, path } = H;
const { execSync } = require('child_process');

const RTM = H.tep('RTM');
const SPEC = H.tep('SPEC');
const THU_MUC_TESTS = H.P(H.C.thuMuc.tests);
const THU_MUC_APP = H.P(H.C.thuMuc.app);
const KT = H.C.kiemThu;
const RE_STORY_G = H.re(H.C.ma.story, 'g') || /US-\d+/g;
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const RE_TEN_TEP_TEST = new RegExp(escRe(KT.tienToTepTest) + '[\\w-]+' + escRe(KT.duoiTepTest), 'g');
const DUOI_MA = (H.C.maCode.duoi || []).map((d) => d.toLowerCase());

if (!fs.existsSync(RTM)) {
  console.log(`🛑 Thiếu tệp bắt buộc: ${H.rel(RTM)} — không có RTM thì không có gì để kiểm (fail-closed).`);
  process.exit(2);
}
const noiDung = fs.readFileSync(RTM, 'utf8');
const loi = [];
const canhBao = [];
const khongXacMinh = [];

const dongRTM = noiDung.split(/\r?\n/).map((l) => l.trim()).filter((l) => /^\|\s*\d+[a-z]?\s*\|/.test(l));
const oCua = (l) => l.split('|');                                   // [1]=# … [6]=Code/Test [7]=UAT [8]=Work item
const oBoc = (l) => l.replace(/^\|/, '').replace(/\|\s*$/, '').split('|').map((s) => s.trim()); // không lệ thuộc `|` đóng

// --- Tệp test & tệp mã có thật trên đĩa -----------------------------------------
const fileTest = (() => {
  try { return fs.readdirSync(THU_MUC_TESTS).filter((f) => f.startsWith(KT.tienToTepTest) && f.endsWith(KT.duoiTepTest)); }
  catch { return null; }
})();
const tepMaThat = new Set();
(function quet(d) {
  let ds; try { ds = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
  for (const e of ds) {
    const p = path.join(d, e.name); const r = H.rel(p);
    if ((H.C.maCode.boQua || []).some((b) => (r + '/').includes(b))) continue;
    if (e.isDirectory()) quet(p);
    else { tepMaThat.add(r); tepMaThat.add(e.name); }
  }
})(THU_MUC_APP);
if (!H.rel(THU_MUC_TESTS).startsWith(H.rel(THU_MUC_APP) + '/')) {   // thư mục test nằm NGOÀI thư mục mã
  try { for (const f of fs.readdirSync(THU_MUC_TESTS)) { tepMaThat.add(H.rel(path.join(THU_MUC_TESTS, f))); tepMaThat.add(f); } } catch { /* chưa có */ }
}

// --- 1. Số ca test: RTM khai (theo tệp, nếu có) vs máy đếm ---------------------------
// Số THẬT đếm bằng lệnh của bộ kiểm thử (vd pytest --collect-only), KHÔNG đếm `def test_`
// bằng regex — một hàm có thể sinh nhiều ca (parametrize). Lệnh không chạy ⇒ KHÔNG bịa.
function demCaTestThat() {
  if (!KT.lenhDemCa || !KT.khuonSoCa) return { so: null, lyDo: 'config kiemThu.lenhDemCa/khuonSoCa trống' };
  try {
    const ra = execSync(KT.lenhDemCa, { cwd: THU_MUC_APP, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
    const m = ra.match(new RegExp(KT.khuonSoCa));
    return m ? { so: parseInt(m[1], 10) } : { so: null, lyDo: `đầu ra của "${KT.lenhDemCa}" không khớp khuôn ${KT.khuonSoCa}` };
  } catch (e) {
    const ra = ((e.stdout || '') + (e.stderr || '')).toString();
    const m = ra.match(new RegExp(KT.khuonSoCa));
    if (m) return { so: parseInt(m[1], 10) };     // một số bộ test trả mã ≠0 khi 0 ca nhưng vẫn in số
    return { so: null, lyDo: `lệnh "${KT.lenhDemCa}" không chạy được: ${(ra.trim().split(/\r?\n/).pop() || e.message).slice(0, 120)}` };
  }
}
// RTM có thể khai số ca THEO TỆP ở một bảng phụ: `| test_x.py | 12 | …`. Ô có lịch sử sửa
// (`~~215~~ ~~224~~ **228**`) thì BỎ SẠCH mọi đoạn gạch trước rồi lấy số còn lại — công cụ
// đọc tài liệu phải chịu được lịch sử sửa, vì lệ của tài liệu là "gạch đi, không xoá".
const dongKhaiTheoTep = noiDung.split(/\r?\n/).filter((d) => d.trim().startsWith('|') && new RegExp('^' + escRe(KT.tienToTepTest) + '[\\w-]+' + escRe(KT.duoiTepTest) + '$').test((d.split('|')[1] || '').replace(/`/g, '').trim()));
const trongRTM = dongKhaiTheoTep.reduce((t, d) => {
  const sach = (d.split('|')[2] || '').replace(/~~[^~]*~~/g, '');
  const so = sach.match(/(\d+)/);
  return t + (so ? parseInt(so[1], 10) : 0);
}, 0);
let thatSu = { so: null, lyDo: 'chưa đếm' };
if (fileTest === null) {
  canhBao.push(`Chưa có thư mục test ${H.rel(THU_MUC_TESTS)} — bỏ qua phép đếm ca (chưa có dữ liệu).`);
} else if (!fileTest.length) {
  canhBao.push('Thư mục test chưa có tệp test nào — bỏ qua phép đếm ca (chưa có dữ liệu).');
} else {
  thatSu = demCaTestThat();
  if (thatSu.so === null) {
    khongXacMinh.push(`Không đếm được số ca test bằng máy (${thatSu.lyDo}). Chỉ đếm được ${fileTest.length} TỆP test — ⛔ không bịa số ca.`);
  } else if (dongKhaiTheoTep.length && trongRTM !== thatSu.so) {
    loi.push(`Số ca test LỆCH: RTM khai ${trongRTM}, máy đếm ${thatSu.so} (lệch ${Math.abs(thatSu.so - trongRTM)})`);
  } else if (!dongKhaiTheoTep.length) {
    canhBao.push(`RTM không khai số ca theo tệp (bảng phụ "| ${KT.tienToTepTest}x${KT.duoiTepTest} | <số ca> |") — chỉ so TỆP, không so SỐ CA. Máy đếm được ${thatSu.so} ca.`);
  }
}

// --- 2. Tệp test trên đĩa mà RTM không nhắc -----------------------------------------
const khongNhac = (fileTest || []).filter((f) => !noiDung.includes(f));
if (khongNhac.length) loi.push(`Tệp test KHÔNG được RTM nhắc tới: ${khongNhac.join(', ')}`);

// --- 3. Ô Code/Test trỏ tới tệp KHÔNG tồn tại (bẫy c1) ------------------------------
{
  const reTep = new RegExp('[\\w./-]+\\.(' + [...new Set([...DUOI_MA, KT.duoiTepTest.replace(/^\./, '')])].map(escRe).join('|') + ')\\b', 'g');
  const hong = [];
  for (const l of dongRTM) {
    const o = (oCua(l)[6] || '').trim();
    if (!o || /^[—-]/.test(o)) continue;
    const ten = [...new Set((o.replace(/~~[^~]*~~/g, '').match(reTep) || []))];
    const mat = ten.filter((t) => {
      const chuan = t.replace(/^`|`$/g, '');
      return !tepMaThat.has(chuan) && !tepMaThat.has(path.basename(chuan));
    });
    if (mat.length) hong.push(`${oCua(l)[1].trim()}: ${mat.join(', ')}`);
  }
  if (hong.length) {
    loi.push(`${hong.length} dòng có ô Code/Test trỏ tới tệp KHÔNG TỒN TẠI dưới ${H.C.thuMuc.app}/ hoặc ${H.C.thuMuc.tests}/ (tên tệp đã xoá vẫn làm chỉ số đẹp lên):`);
    hong.forEach((h) => loi.push(`    ${h}`));
  }
}

// --- 4. Dòng còn nhãn "mồ côi" chưa được xác nhận ----------------------------------
const dongMoCoi = dongRTM.filter((l) => /mồ côi/.test(l) && !/mồ côi\s*—\s*chấp nhận|Đã đóng|xác nhận/.test(l));
if (dongMoCoi.length) {
  loi.push(`Còn ${dongMoCoi.length} dòng MỒ CÔI chưa được ${H.vai.chu} xác nhận là chấp nhận được:`);
  dongMoCoi.forEach((l) => loi.push(`    ${oCua(l)[1].trim()}: ${(oCua(l)[3] || '').trim().slice(0, 60)}`));
}

// --- 5. Dòng khai đã build mà cột Code/Test để trống --------------------------------
const deTrong = dongRTM.filter((l) => {
  const c = oBoc(l);
  if (c.length < 6) return false;
  const van = (c[4] || '').replace(/ch(ư|u)a\s+(build|có\s+code|xây)/gi, '');
  return /✅|có code|đã build|đã xây/i.test(van) && !c[5];
});
if (deTrong.length) canhBao.push(`${deTrong.length} dòng khai là đã build nhưng cột Code/Test để trống: ${deTrong.map((l) => oCua(l)[1].trim()).join(', ')}`);

// --- 6. Story trong SPEC mà KHÔNG dòng RTM nào trỏ tới (chiều SPEC → RTM) -----------
if (fs.existsSync(SPEC)) {
  const spec = fs.readFileSync(SPEC, 'utf8');
  // Chỉ lấy story có ĐỊNH NGHĨA thật: tiêu đề `### US-xx` hoặc ô đầu bảng `| US-xx |` — không lấy mọi lần nhắc tên.
  const reDinhNghia = new RegExp('^(?:#+\\s*|\\|\\s*\\*{0,2}`?)(' + (H.C.ma.story || 'US-\\d+') + ')\\b', 'gm');
  const coDinhNghia = [...new Set([...spec.matchAll(reDinhNghia)].map((m) => m[1]))];
  const trongRTMset = new Set(dongRTM.flatMap((l) => [...l.matchAll(RE_STORY_G)].map((m) => m[0])));
  const moCoiSpec = coDinhNghia.filter((u) => !trongRTMset.has(u));
  if (moCoiSpec.length) loi.push(`Story có trong SPEC nhưng KHÔNG dòng RTM nào trỏ tới: ${moCoiSpec.join(', ')}`);
  if (!coDinhNghia.length) canhBao.push(`SPEC chưa định nghĩa story nào (khuôn ${H.C.ma.story}) — chưa có dữ liệu cho chiều SPEC → RTM.`);
} else {
  khongXacMinh.push(`Thiếu ${H.rel(SPEC)} — không kiểm được chiều SPEC → RTM.`);
}

// --- 7. Ô trống ở cột UAT/SIT ------------------------------------------------------
{
  const trongUAT = dongRTM.filter((l) => { const c = oBoc(l); return c.length >= 8 && c[6] === ''; });
  if (trongUAT.length) loi.push(`${trongUAT.length} dòng để TRỐNG ô UAT/SIT (dòng ${trongUAT.map((l) => oCua(l)[1].trim()).join(', ')}) — phải ghi mã ca, hoặc ghi "— chưa có ca" để nó hiện ra là một khoản nợ, không được trống im lặng`);
}

// --- Báo cáo ----------------------------------------------------------------------
console.log(`=== rtm-check — ${H.rel(RTM)} ===`);
if (!dongRTM.length) console.log('  ⚠️ RTM chưa có dòng truy vết nào — chưa có dữ liệu.');
console.log(`  Dòng truy vết: ${dongRTM.length}`);
console.log(`  Ca test:       RTM khai ${dongKhaiTheoTep.length ? trongRTM : '— (không khai theo tệp)'} · máy đếm ${thatSu.so ?? 'không đếm được'}`);
console.log(`  Tệp test:      ${fileTest ? fileTest.length : 0} trên đĩa · ${fileTest ? fileTest.length - khongNhac.length : 0} được RTM nhắc`);
console.log(`  Dòng mồ côi:   ${dongMoCoi.length} chưa xác nhận`);
console.log('');
canhBao.forEach((c) => console.log(`  ⚠️  ${c}`));
khongXacMinh.forEach((c) => console.log(`  ❓  ${c}`));
if (loi.length) {
  console.log('  🔴 GAP:');
  loi.forEach((l) => console.log(`     ${l}`));
  console.log('');
  console.log(`  ⛔ ${H.vai.ai} không được sửa RTM hay test cho chỉ số đẹp lên — báo ${H.vai.chu}.`);
  process.exit(2);
}
if (khongXacMinh.length) {
  console.log('  ❓ KHÔNG XÁC MINH ĐƯỢC — không có GAP nhìn thấy, nhưng có phép kiểm chưa chạy được. Không coi là PASS.');
  process.exit(1);
}
console.log('  ✅ PASS — không có GAP');
console.log('  ⚠️ Lưu ý: công cụ chỉ kiểm tệp có TỒN TẠI, không kiểm tệp có thật sự kiểm đúng thứ dòng RTM nói.');
process.exit(0);
