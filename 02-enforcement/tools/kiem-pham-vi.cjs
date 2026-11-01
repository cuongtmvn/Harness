#!/usr/bin/env node
'use strict';
/**
 * kiem-pham-vi.cjs — CỔNG PHẠM VI: "mọi mục tiêu chủ dự án nêu đã giao chưa?"
 *
 * *** VÌ SAO ***
 * Mọi cổng khác đo THỨ ĐÃ KHAI — task đã khai, story đã viết, ca kiểm đã có. Không cổng nào
 * đo THỨ CHỦ DỰ ÁN ĐÃ YÊU CẦU. Và chỗ nguy nhất là vòng khép kín: AI chọn phạm vi Round →
 * AI viết task theo phạm vi đó → cổng đo task → xanh. Cổng này đo từ MỘT NGUỒN AI KHÔNG ĐƯỢC
 * SỬA: danh mục mục tiêu, nguyên văn chủ dự án (Instructions/PHAM-VI-MVP.json).
 *
 * BỐN PHÉP KIỂM
 *  ① mọi mục có trangThai hợp lệ: xong | dang-lam | chua-lam | khong-lam-nua
 *  ② `xong` phải có BẰNG CHỨNG CÓ THẬT: đường HTTP tìm được trong mã (config › route) và tệp
 *     kiểm tồn tại trên đĩa — không có phép này thì đổi một chữ thành "xong" là mục tiêu "đã giao"
 *  ③ chua-lam / dang-lam phải khai conThieu ≥40 ký tự ("chưa làm" ≠ "không làm nữa")
 *  ④ HOÃN sang Round sau / BỎ phải có chữ ký chủ dự án: huynhDuyet nguyên văn ≥20 ký tự
 *
 * Dùng: node Log/kiem-pham-vi.cjs [--truoc-prod] [--cho-phep-chua-giao]
 * Mã thoát: 0 mọi mục đã giao · 1 còn mục chưa giao (cảnh báo, in rõ) · 2 CHẶN
 *   --truoc-prod       : còn mục chưa giao mà chưa có chữ ký ⇒ 2 (CHẶN ĐẨY)
 *   --cho-phep-chua-giao: chỉ dùng trong cổng Bước (m) — mã 1 vẫn là 1, cổng Bước đọc thành cảnh báo
 */
const H = require('./_harness-config.cjs');
const { fs, path } = H;
const CHU = H.vai.chu, AI = H.vai.ai;
const KHAI = H.tep('PHAM_VI');
const HOP_LE = new Set(['xong', 'dang-lam', 'chua-lam', 'khong-lam-nua']);
if (!fs.existsSync(KHAI)) { console.error(`🛑 Thiếu ${H.rel(KHAI)} — không có danh mục mục tiêu. Bước 0 phải tạo nó từ nguyên văn ${CHU}.`); process.exit(2); }
const khai = H.docJson(KHAI, null);
if (!khai || !Array.isArray(khai.mucTieu)) { console.error(`🛑 ${H.rel(KHAI)} hỏng hoặc thiếu mảng mucTieu.`); process.exit(2); }

// Đường HTTP có thật trong mã.
const duongThat = new Set();
const thuRoute = H.P((H.C.route || {}).thuMuc || 'App/routes');
const reRoute = H.re((H.C.route || {}).khuon, 'g');
let demRoute = 0;
if (fs.existsSync(thuRoute) && reRoute) {
  const quet = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) quet(p); else if (H.laMaCode(H.rel(p))) { demRoute++; for (const m of fs.readFileSync(p, 'utf8').matchAll(reRoute)) duongThat.add(m[1]); } } };
  quet(thuRoute);
}

const chan = [], chuaGiao = [];
console.log(`=== CỔNG PHẠM VI — MVP ${khai.mvp || '?'} ===`);
console.log(`  Nguồn mục tiêu: ${khai.nguonMucTieu || '(chưa ghi)'} · ${khai.mucTieu.length} mục · ${duongThat.size} đường HTTP tìm thấy trong ${demRoute} tệp\n`);
if (!khai.mucTieu.length) console.log('  (danh mục rỗng — Bước 0 chưa chép mục tiêu nào)');

for (const m of khai.mucTieu) {
  const tt = String(m.trangThai || '');
  if (!HOP_LE.has(tt)) { chan.push(`${m.id}: trangThai "${tt || '(trống)'}" không hợp lệ (${[...HOP_LE].join(' | ')})`); continue; }
  if (!String(m.nguyenVan || '').trim()) chan.push(`${m.id}: thiếu nguyenVan — mục tiêu phải là NGUYÊN VĂN ${CHU}, không phải diễn đạt lại của ${AI}.`);
  if (m.round || m.hoanSang) {
    if (String(m.huynhDuyet || '').trim().length < 20) chan.push(`🔴 ${m.id} bị HOÃN sang "${m.round || m.hoanSang}" mà KHÔNG có huynhDuyet (nguyên văn ≥20 ký tự). Hoãn một mục tiêu là ĐỔI PHẠM VI — điều dừng 3. ${AI} không tự ký.`);
  }
  if (tt === 'xong') {
    const bc = m.bangChung || {};
    const duong = [...(bc.duong || []), ...(bc.diemCuoi || [])];
    const tep = bc.tep || [];
    if (!duong.length && !tep.length) { chan.push(`🔴 ${m.id} khai "xong" mà KHÔNG có bằng chứng nào (bangChung.duong / diemCuoi / tep). Đổi một chữ thành "xong" không làm tính năng xuất hiện.`); continue; }
    const duongMa = duong.filter((d) => !duongThat.has(d));
    const tepMat = tep.filter((t) => !fs.existsSync(H.P(t)));
    if (duongMa.length) chan.push(`🔴 ${m.id} khai "xong" nhưng ${duongMa.length} đường KHÔNG CÓ trong mã (${H.rel(thuRoute)}): ${duongMa.join(', ')}`);
    if (tepMat.length) chan.push(`🔴 ${m.id} khai "xong" nhưng ${tepMat.length} tệp kiểm KHÔNG CÓ trên đĩa: ${tepMat.join(', ')} — bẫy c1.`);
    if (!duongMa.length && !tepMat.length) console.log(`  ✅ ${m.id}  xong      — ${duong.length} đường · ${tep.length} tệp kiểm, đều có thật`);
  } else if (tt === 'khong-lam-nua') {
    const ky = String(m.huynhDuyet || '').trim();
    if (ky.length < 20) chan.push(`🔴 ${m.id} khai "khong-lam-nua" mà KHÔNG có nguyên văn ${CHU}. Bỏ một mục tiêu là quyết định của ${CHU}.`);
    else console.log(`  ⚪ ${m.id}  bỏ hẳn    — ${CHU} duyệt: "${ky.slice(0, 54)}…"`);
  } else {
    const ct = String(m.conThieu || '').trim();
    if (ct.length < 40) chan.push(`🔴 ${m.id} ở trạng thái "${tt}" mà conThieu chỉ ${ct.length} ký tự (cần ≥40). "Chưa làm" và "không làm nữa" là HAI câu khác nhau.`);
    else { console.log(`  🔴 ${m.id}  ${tt.padEnd(9)} — CHƯA GIAO: ${ct.slice(0, 60)}…`); chuaGiao.push(m.id); }
  }
}

console.log();
if (chan.length) {
  console.log('🛑 CHẶN:'); chan.forEach((c) => console.log(`   · ${c}`));
  console.log('\n📋 XONG NGHĨA LÀ GÌ:');
  console.log('   · Mỗi mục có trạng thái hợp lệ, nguyên văn chủ dự án, và "xong" có BẰNG CHỨNG CÓ THẬT.');
  console.log(`   · Hoãn hoặc bỏ một mục ⇒ PHẢI có NGUYÊN VĂN ${CHU}. ⛔ ${AI} KHÔNG tự sửa tệp phạm vi để cổng xanh — điều dừng 3.`);
  process.exit(2);
}
if (chuaGiao.length) {
  console.log(`⚠️  CÒN ${chuaGiao.length} MỤC TIÊU CHƯA GIAO: ${chuaGiao.join(', ')}`);
  console.log('   Đây không phải lỗi — nhưng phải NHÌN THẤY ĐƯỢC ở mọi lần đóng Bước và mọi lần đẩy production.');
  if (process.argv.includes('--truoc-prod')) {
    const chuaKy = chuaGiao.filter((id) => String((khai.mucTieu.find((x) => x.id === id) || {}).huynhDuyet || '').trim().length < 20);
    if (chuaKy.length) {
      console.log(`\n🛑 CHẶN ĐẨY PRODUCTION — ${chuaKy.length} mục tiêu chưa giao và CHƯA có chữ ký ${CHU}: ${chuaKy.join(', ')}`);
      console.log('\n📋 XONG NGHĨA LÀ GÌ — chọn ĐÚNG MỘT: (a) làm nốt mục đó rồi đẩy; (b) chủ dự án nói rõ "hoãn mục này" ⇒ ghi NGUYÊN VĂN vào huynhDuyet.');
      console.log(`   Giao từng phần là bình thường; giao từng phần mà người đặt hàng không hay thì không.`);
      process.exit(2);
    }
    console.log(`\n   ✅ Mọi mục chưa giao đều CÓ chữ ký ${CHU} — được phép đẩy từng phần.`);
  }
  process.exit(1);
}
console.log(`✅ PHẠM VI: mọi mục tiêu ${CHU} nêu đều ĐÃ GIAO, và bằng chứng có thật.`);
process.exit(0);
