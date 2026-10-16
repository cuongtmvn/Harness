#!/usr/bin/env node
'use strict';
/*
 * kiem-luat.cjs — BỘ TEST CHO TÀI LIỆU LUẬT.
 *
 * *** VÌ SAO ***
 * Mã có test, số liệu có công cụ đối soát, còn LUẬT thì không có gì cả — nên một lần dọn
 * file luật từ trí nhớ đã làm mất 13 luật im lặng: không test nào đỏ, không cổng nào chặn.
 * Cái gì không nhớ tới thì biến mất, và không có gì kêu.
 *
 * NĂM CHẾ ĐỘ — mỗi chế độ bắt một loại lỗi khác nhau:
 *   --diff     dòng BỊ XOÁ khỏi file luật so với HEAD — bắt buộc đọc, KHÔNG chặn (so với HEAD
 *              nên chỉ sạch sau commit; chặn thì thành vòng luẩn quẩn và cổng sẽ bị vượt thường xuyên —
 *              một cổng bị vượt thường xuyên còn tệ hơn không có cổng: nó dạy người ta vượt)
 *   --mat      luật `song` trong sổ còn tồn tại trong file (so neo sau khi gộp khoảng trắng —
 *              KHÔNG bỏ dấu, không bỏ hoa/thường, không so gần đúng) — CHẶN
 *   --dongbo   file luật bị sửa trong vùng staged mà sổ đăng ký không đổi — CHẶN
 *   --trung    id trong sổ có duy nhất không — CHẶN (toàn bộ truy vết luật đứng trên giả định id duy nhất)
 *   --trangtri luật có cơ chế cưỡng chế THẬT hay chỉ là nếp làm — BÁO SỐ, không chặn
 *   --dabo     cơ chế ĐÃ BỎ (khai trong sổ: trangthai "da-bo") mà file luật vẫn nhắc không nhãn — cảnh báo
 * Không tham số = chạy hết.
 *
 * Mã thoát: 0 sạch · 2 có vấn đề (CHẶN) · 1 dùng sai.
 * ⛔ Hạ tầng gác luật — AI không được sửa/tắt/nới (điều dừng 5).
 */
const H = require('./_harness-config.cjs');
const { fs, path } = H;
const CHU = H.vai.chu, AI = H.vai.ai;
const SO = H.tep('LUAT_DANGKY');
const FILE_LUAT = (H.C.tepLuat && H.C.tepLuat.danhSach) || [];

const laDongCoNghia = (s) => { const t = s.trim(); if (!t) return false; if (/^[-|`>#*_\s]+$/.test(t)) return false; return t.length >= 12; };
const gop = (s) => String(s).replace(/\s+/g, ' ').trim();
const chuaNeo = (noiDung, neo) => noiDung.includes(neo) || gop(noiDung).includes(gop(neo));
function docSo() {
  if (!fs.existsSync(SO)) return { thieu: true };
  try { return JSON.parse(fs.readFileSync(SO, 'utf8')); } catch (e) { return { hong: e.message }; }
}

function cheDoDiff() {
  console.log('=== (1) --diff : dòng bị XOÁ khỏi file luật ===');
  let tong = 0; const chiTiet = [];
  for (const f of FILE_LUAT) {
    if (!fs.existsSync(H.P(f))) continue;
    const d = H.git(`diff HEAD -- "${f}"`);
    if (!d) continue;
    const xoa = d.split(/\r?\n/).filter((l) => l.startsWith('-') && !l.startsWith('---')).map((l) => l.slice(1)).filter(laDongCoNghia);
    if (xoa.length) { tong += xoa.length; chiTiet.push({ f, xoa }); }
  }
  if (!tong) { console.log('  ✅ Không dòng luật nào bị xoá so với HEAD.\n'); return 0; }
  console.log(`  ⚠️  ${tong} dòng có nội dung bị xoá khỏi ${chiTiet.length} file luật. PHẢI trả lời từng dòng: "nay nằm ở đâu?" hoặc "bỏ có chủ ý vì sao?"\n`);
  for (const { f, xoa } of chiTiet) {
    console.log(`  📄 ${f} — ${xoa.length} dòng:`);
    xoa.slice(0, 40).forEach((l) => console.log(`     - ${l.trim().slice(0, 110)}`));
    if (xoa.length > 40) console.log(`     … còn ${xoa.length - 40} dòng (git diff để xem đủ)`);
  }
  console.log('  📖 BẮT BUỘC ĐỌC HẾT — nhưng KHÔNG chặn (lý do ở đầu tệp).\n');
  return 0;
}

function cheDoMat() {
  console.log('=== (2) --mat : luật trong sổ còn trong file không ===');
  const so = docSo();
  if (so.thieu) { console.log(`  ⚠️  Chưa có sổ đăng ký (${H.rel(SO)}) — chế độ --diff là lớp bảo vệ DUY NHẤT.\n`); return 0; }
  if (so.hong) { console.log(`  🛑 Sổ hỏng JSON: ${so.hong}\n`); return 2; }
  const luat = Array.isArray(so.luat) ? so.luat : [];
  const song = luat.filter((r) => r.trangthai === 'song');
  const mat = [], saiFile = [];
  for (const r of song) {
    const p = H.P(r.file || '');
    if (!r.file || !fs.existsSync(p)) { saiFile.push(r); continue; }
    if (!r.neo || !chuaNeo(fs.readFileSync(p, 'utf8'), r.neo)) mat.push(r);
  }
  console.log(`  Tổng: ${luat.length} luật · sống: ${song.length} · đã bỏ có chủ ý: ${luat.length - song.length}`);
  if (saiFile.length) { console.log(`  🛑 ${saiFile.length} luật trỏ tới file KHÔNG TỒN TẠI:`); saiFile.forEach((r) => console.log(`     - ${r.id} → ${r.file}`)); }
  if (mat.length) {
    console.log(`  🛑 ${mat.length} luật MẤT — không tìm thấy neo trong file:`);
    mat.forEach((r) => console.log(`     - ${r.id} | ${r.file} | neo: "${String(r.neo).slice(0, 60)}"`));
    console.log(`     Bỏ một luật phải TƯỜNG MINH: trangthai "da-bo" + lyDoBo + aiDuyet. ⛔ ${AI} không tự đổi — điều dừng 5.`);
  }
  if (!mat.length && !saiFile.length) console.log('  ✅ Mọi luật sống đều còn trong file của nó.');
  console.log('');
  return mat.length || saiFile.length ? 2 : 0;
}

function cheDoDongBo() {
  console.log('=== (3) --dongbo : sửa file luật mà quên cập nhật sổ ===');
  const staged = H.git('diff --cached --name-only').split(/\r?\n/).filter(Boolean);
  const luatDoi = staged.filter((f) => FILE_LUAT.includes(f));
  const soDoi = staged.includes(H.rel(SO));
  if (!luatDoi.length) { console.log('  ✅ Vùng staged không chạm file luật nào.\n'); return 0; }
  console.log(`  File luật bị sửa: ${luatDoi.join(', ')}`);
  if (soDoi) { console.log('  ✅ Sổ đăng ký cũng có trong cùng đợt.\n'); return 0; }
  if (!fs.existsSync(SO)) { console.log('  ⚠️  Chưa có sổ đăng ký — chưa chặn được.\n'); return 0; }
  console.log('  🛑 Sổ đăng ký KHÔNG đổi trong khi file luật có đổi. Sửa luật thì sổ phải đổi theo — thêm luật, đổi vị trí, hoặc đánh dấu đã bỏ. (Cùng khuôn cổng c2: mã↔tài liệu; đây là luật↔sổ.)\n');
  return 2;
}

function cheDoTrung() {
  console.log('=== (4) --trung : id trong sổ có DUY NHẤT không ===');
  const so = docSo();
  if (so.thieu) { console.log('  ⚠️  Chưa có sổ đăng ký — bỏ qua.\n'); return 0; }
  if (so.hong) { console.log(`  🛑 Sổ hỏng JSON: ${so.hong}\n`); return 2; }
  const luat = Array.isArray(so.luat) ? so.luat : [];
  const dem = new Map();
  for (const r of luat) { const id = r && r.id ? String(r.id) : '(thiếu id)'; dem.set(id, (dem.get(id) || 0) + 1); }
  const trung = [...dem.entries()].filter(([, n]) => n > 1);
  const thieuId = luat.filter((r) => !r || !r.id).length;
  console.log(`  Tổng bản ghi: ${luat.length} · id duy nhất: ${dem.size}`);
  if (thieuId) console.log(`  🛑 ${thieuId} bản ghi KHÔNG có trường id.`);
  if (trung.length) {
    console.log(`  🛑 ${trung.length} id bị TRÙNG:`);
    trung.forEach(([id, n]) => { console.log(`     - ${id} (${n} lần):`); luat.filter((r) => r && String(r.id) === id).forEach((r) => console.log(`         · ${(r.tomtat || '').slice(0, 70)} [${r.file}]`)); });
    console.log('     Hai luật cùng id thì mọi tra cứu theo id trả về NHẦM LUẬT, và trả về im lặng.\n');
    return 2;
  }
  if (thieuId) { console.log(''); return 2; }
  console.log('  ✅ Mọi id đều duy nhất.\n');
  return 0;
}

function cheDoTrangTri() {
  console.log('=== (5) --trangtri : luật có cơ chế cưỡng chế THẬT hay chỉ là nếp làm ===');
  const so = docSo();
  if (so.thieu) { console.log('  ⚠️  Chưa có sổ đăng ký — bỏ qua.\n'); return 0; }
  if (so.hong) { console.log(`  🛑 Sổ hỏng: ${so.hong}\n`); return 2; }
  const RONG_NGHIA = [/^CLAUDE\.md tự nạp\.?$/i, /^tự nạp mọi phiên\.?$/i, /^nếp làm\.?$/i, /^kỷ luật(\s|$)/i, /^không có\.?$/i, /^chưa có\.?$/i];
  // ⚠️ Thứ tự đuôi: dài trước ngắn — `js` đứng trước `json` thì "LEASH-BANG.json" bị cắt thành ".js" và
  //    tệp có thật bị xếp vào "trang trí". Phép thử ngược đã bắt được đúng lỗi này.
  const KHUON_FILE = /([\w.\-/]+\.(cjs|json|js|py|sh|ya?ml|ps1))/g;
  const KHUON_LENH = /(\b(pytest|npm |node |bash |git |hook|PostToolUse|PreToolUse|CI)\b|gate-check|kiem-[a-z\-]+|cho-quyet|rtm-check|doc-health|moc-day-git|--mo-round|--dong-mvp|điều kiện \([a-m0]\)|cổng \([a-m0]\))/i;
  const KHUON_CONG_NGUOI = /(day-git|chốt C[1-4]|cảnh báo W[1-4]|cổng (VÀO|RA|dây cương|đối chứng|máy|A)|huynh-xac-nhan|Phase Gate|điều kiện \([a-m0]\)|bản khai cổng|khai Round|Dev Book|mục V[1-6]|mục R[1-8]|Bước \d|Tester|mã thoát)/i;
  const song = (Array.isArray(so.luat) ? so.luat : []).filter((r) => r.trangthai === 'song');
  const trangTri = [], congNguoi = [], coMay = [];
  for (const r of song) {
    const cq = String(r.cochequuongche || '').trim();
    if (!cq || RONG_NGHIA.some((re) => re.test(cq))) { trangTri.push([r, cq || '(TRỐNG)']); continue; }
    const cacFile = [...cq.matchAll(KHUON_FILE)].map((m) => m[1]);
    const coFileThat = cacFile.some((f) => { const ten = f.split('/').pop(); return fs.existsSync(H.P(f)) || fs.existsSync(H.P(H.C.thuMuc.log, ten)) || fs.existsSync(H.P('.claude', 'hooks', ten)) || fs.existsSync(H.P(H.C.thuMuc.luat, ten)); });
    if (coFileThat || KHUON_LENH.test(cq)) coMay.push(r);
    else if (KHUON_CONG_NGUOI.test(cq)) congNguoi.push([r, cq]);
    else trangTri.push([r, cq]);
  }
  const pc = (n) => (song.length ? (n / song.length * 100).toFixed(1) + '%' : '0%');
  console.log(`  Luật sống: ${song.length}`);
  console.log(`  🔑 MÁY tự chạy — trỏ tới file/lệnh CÓ THẬT   : ${coMay.length} (${pc(coMay.length)})`);
  console.log(`  🟡 CỔNG NGƯỜI — quy trình/checklist có thật : ${congNguoi.length} (${pc(congNguoi.length)})`);
  console.log(`  🔴 TRANG TRÍ  — chỉ "tự nạp" / không có gì  : ${trangTri.length} (${pc(trangTri.length)})`);
  if (trangTri.length) {
    console.log(`\n  🔴 TRANG TRÍ — thứ DUY NHẤT gác là kỷ luật của ${AI}:`);
    trangTri.forEach(([r, cq]) => console.log(`     - ${String(r.id).padEnd(14)} | ${String(cq).slice(0, 72)}`));
    console.log('\n  ⚠️  SỐ THEO DÕI, không phải cổng chặn: luật máy hoá được ⇒ dựng phép kiểm; luật bản chất là phán đoán ⇒ ghi thẳng "dựa vào kỷ luật", đừng ghi như thể đã có gì gác.');
  }
  console.log('');
  return 0;
}

function cheDoDaBo() {
  console.log('=== (6) --dabo : cơ chế ĐÃ BỎ mà file luật vẫn trình bày như đang chạy ===');
  const so = docSo();
  if (so.thieu || so.hong) { console.log('  ⚠️  Không đọc được sổ — bỏ qua.\n'); return 0; }
  // Cụm từ nhận diện lấy từ chính sổ: luật trangthai "da-bo" có trường `cumNhanDien` (mảng chuỗi).
  const daBo = (so.luat || []).filter((r) => r.trangthai === 'da-bo' && Array.isArray(r.cumNhanDien) && r.cumNhanDien.length);
  if (!daBo.length) { console.log('  (sổ chưa có luật da-bo nào khai cumNhanDien — không có gì để soi)\n'); return 0; }
  const NHAN = /(ĐÃ BỎ|đã bỏ|KHÔNG áp dụng|lịch sử|thay cách cũ|không còn)/;
  const NHIN = 6; const canh = [];
  for (const f of FILE_LUAT) {
    if (!fs.existsSync(H.P(f))) continue;
    const dong = fs.readFileSync(H.P(f), 'utf8').split(/\r?\n/);
    let muc = '';
    dong.forEach((l, i) => {
      if (/^#{1,3}\s/.test(l)) muc = l;
      for (const r of daBo) for (const cum of r.cumNhanDien) {
        if (!l.includes(cum)) continue;
        const quanh = dong.slice(Math.max(0, i - NHIN), i + 1 + NHIN).join(' ') + ' ' + muc;
        if (!NHAN.test(quanh)) canh.push(`${f}:${i + 1} — "${cum}" (${r.id}) không có nhãn ĐÃ BỎ trong khối`);
      }
    });
  }
  if (canh.length) { console.log(`  ⚠️  ${canh.length} chỗ nhắc cơ chế đã bỏ mà KHÔNG có nhãn:`); canh.forEach((c) => console.log(`     - ${c}`)); console.log(`     Cảnh báo, không chặn — nhưng một dòng không nhãn là một lần ${AI} có thể thi hành luật đã chết.\n`); return 0; }
  console.log('  ✅ Mọi chỗ nhắc cơ chế đã bỏ đều mang nhãn.\n');
  return 0;
}

const args = process.argv.slice(2);
const hop = ['--diff', '--mat', '--dongbo', '--trung', '--trangtri', '--dabo'];
const la = args.filter((a) => a.startsWith('--'));
if (la.some((a) => !hop.includes(a))) { console.error(`Dùng: node Log/kiem-luat.cjs [${hop.join('|')}]  (không tham số = chạy hết)`); process.exit(1); }
console.log('=== KIEM-LUAT — bộ test cho tài liệu luật ===\n');
const chay = la.length ? la : hop;
let ma = 0;
if (chay.includes('--diff')) ma = Math.max(ma, cheDoDiff());
if (chay.includes('--mat')) ma = Math.max(ma, cheDoMat());
if (chay.includes('--dongbo')) ma = Math.max(ma, cheDoDongBo());
if (chay.includes('--trung')) ma = Math.max(ma, cheDoTrung());
if (chay.includes('--trangtri')) ma = Math.max(ma, cheDoTrangTri());
if (chay.includes('--dabo')) ma = Math.max(ma, cheDoDaBo());
console.log(ma === 0 ? '✅ KIỂM LUẬT: SẠCH' : '🛑 KIỂM LUẬT: CÓ VẤN ĐỀ — không được đi tiếp khi chưa xử lý');
process.exit(ma);
