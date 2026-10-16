#!/usr/bin/env node
'use strict';
/**
 * cong-uat-truoc-prod.cjs — CỔNG UAT → PRODUCTION.
 *
 * Luật: duyệt xong UAT (ít nhất ĐÓNG được Bước 9) mới đẩy production, trừ ngoại lệ chủ dự án ký.
 * Vì sao phải là cổng máy chứ không phải một dòng luật: một bản từng được đẩy lên môi trường thật
 * khi Bước 9 chưa hề chạy, và không cổng nào chặn — vì luật lúc đó chưa có cơ chế. Luật không có
 * cơ chế cưỡng chế là luật trang trí.
 *
 * Dùng: node Log/cong-uat-truoc-prod.cjs [--mvp nn] [--round Rk] [--ngoai-le "<lý do ≥25>" --huynh-xac-nhan <hôm nay>]
 * Mã thoát: 0 được phép đẩy · 2 CHẶN. ⛔ Hai cờ ngoại lệ là CHỮ KÝ của chủ dự án — AI không tự cắm.
 */
const H = require('./_harness-config.cjs');
const { fs, path } = H;
const CHU = H.vai.chu, AI = H.vai.ai;
const args = process.argv.slice(2);
const lay = (t) => { const i = args.indexOf(t); return i >= 0 ? args[i + 1] : null; };
const NGOAI_LE = lay('--ngoai-le'), XAC_NHAN = lay('--huynh-xac-nhan');
let mvp = lay('--mvp'), round = lay('--round');
const ghi = H.ndjson(H.tep('PHASE_GATE_LOG'));
if (!mvp || !round) for (let i = ghi.length - 1; i >= 0; i--) if (ghi[i].mvp) { mvp = mvp || ghi[i].mvp; round = round || ghi[i].round || 'R1'; break; }
const MT = H.C.moiTruong || {};
console.log('════ CỔNG UAT → PRODUCTION ════');
console.log(`  MVP ${mvp || '?'} · Round ${round || '?'}`);
console.log(`  ${(MT.uat || {}).ten || 'UAT'} = ${(MT.uat || {}).diaChi || '?'}  ·  ${(MT.production || {}).ten || 'PRODUCTION'} = ${(MT.production || {}).diaChi || '?'}\n`);
if (!mvp) { console.log('🔴 CHẶN — không biết đang ở MVP nào (PHASE-GATE-LOG rỗng, không có --mvp). Chưa có Bước nào đóng thì không có gì để đẩy.'); process.exit(2); }

const daDong = (m, r, b) => ghi.some((g) => String(g.mvp) === String(m) && String(g.buoc) === String(b) && (r === null || String(g.round || 'R1') === String(r)) && g.ketQua === 'qua' && g.dongLuc);
let dat = false, vi = '';
if (daDong(mvp, round, 9)) { dat = true; vi = `Bước 9 của ${round} ĐÃ ĐÓNG (bản ghi "qua")`; }
else {
  const khai = H.docJson(path.join(H.P(H.C.thuMuc.log, H.C.tep.log.KHAI_ROUND), `${mvp}-${round}.json`), null);
  const b9 = khai && Array.isArray(khai.buoc) ? khai.buoc.find((x) => String(x.so) === '9') : null;
  if (b9 && b9.trangThai === 'ke-thua') {
    if (daDong(mvp, null, 9)) { dat = true; const r = ghi.filter((g) => String(g.mvp) === String(mvp) && String(g.buoc) === '9' && g.ketQua === 'qua').pop(); vi = `${round} khai Bước 9 = "ke-thua", và Round ${r.round || 'R1'} ĐÃ đóng Bước 9 thật`; }
    else vi = `${round} khai Bước 9 = "ke-thua" nhưng KHÔNG round nào của MVP ${mvp} từng đóng Bước 9 ⇒ kế thừa một thứ CHƯA TỪNG TỒN TẠI.`;
  } else if (b9) vi = `${round} khai Bước 9 = "${b9.trangThai}", và Bước 9 CHƯA ĐÓNG. Lý do đã khai: ${String(b9.lyDo || '').slice(0, 160)}`;
  else vi = `Bước 9 của ${round} chưa đóng, và không đọc được bảng khai Round.`;
}
if (dat) { console.log(`✅ ĐƯỢC PHÉP ĐẨY — ${vi}`); process.exit(0); }
console.log(`🔴 CHẶN — ${vi}\n`);
console.log('📋 XONG NGHĨA LÀ GÌ: Bước 9 (SIT/UAT) của Round hiện tại ĐÓNG được — tức chủ dự án đã nghiệm thu UAT, rồi `node Log/gate-check.cjs --buoc 9 --mvp ' + mvp + (round ? ' --round ' + round : '') + '` xanh. HOẶC Round khai Bước 9 = "ke-thua" VÀ có round trước đã đóng Bước 9 thật.\n');
if (!NGOAI_LE) {
  console.log('🚪 ĐƯỜNG NGOẠI LỆ — chỉ khi muốn thử nhanh MỘT tính năng:');
  console.log('   --ngoai-le "<lý do thật ≥25 ký tự>" --huynh-xac-nhan <YYYY-MM-DD hôm nay>');
  console.log(`   ⛔ ${AI} KHÔNG ĐƯỢC TỰ CẮM hai cờ này — chúng là chữ ký của ${CHU}, không phải tham số kỹ thuật.`);
  process.exit(2);
}
const loi = [];
if (String(NGOAI_LE).trim().length < 25) loi.push('--ngoai-le phải nêu lý do THẬT (≥25 ký tự)');
if (!XAC_NHAN || !/^\d{4}-\d{2}-\d{2}$/.test(XAC_NHAN)) loi.push('--huynh-xac-nhan <YYYY-MM-DD> thiếu hoặc sai dạng');
else { const hnay = new Date().toISOString().slice(0, 10); if (XAC_NHAN !== hnay) loi.push(`--huynh-xac-nhan phải là NGÀY HÔM NAY (${hnay}), nhận "${XAC_NHAN}" — xác nhận cũ không dùng lại được`); }
if (loi.length) { console.log('🔴 Cờ ngoại lệ KHÔNG hợp lệ:'); loi.forEach((l) => console.log('   · ' + l)); process.exit(2); }
const fVet = H.tep('NGOAI_LE_PROD');
fs.mkdirSync(path.dirname(fVet), { recursive: true });
fs.appendFileSync(fVet, JSON.stringify({ luc: new Date().toISOString(), mvp, round, lyDoChan: vi.split('\n')[0], ngoaiLe: NGOAI_LE, huynhXacNhan: XAC_NHAN }) + '\n');
console.log(`⚠️  ĐI ĐƯỜNG NGOẠI LỆ — ${CHU} xác nhận ${XAC_NHAN}. Lý do: ${NGOAI_LE}`);
console.log(`    Đã ghi vết vào ${H.rel(fVet)}. ⚠️ Bước 9 VẪN CHƯA XONG — nợ này không được coi là đã trả.`);
process.exit(0);
