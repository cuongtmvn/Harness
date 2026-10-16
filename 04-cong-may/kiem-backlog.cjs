#!/usr/bin/env node
'use strict';
/**
 * kiem-backlog.cjs — RTM ↔ Product Backlog ánh xạ HAI CHIỀU. Cổng RA riêng của Bước 1.
 *
 * *** VÌ SAO ***
 * Cổng phạm vi gác MỤC TIÊU; nhưng một mục tiêu vỡ ra thành nhiều TÍNH NĂNG, và nếu không
 * sổ nào giữ tầng tính năng thì một tính năng có thể được xây, đo, đóng Bước, lên môi trường
 * thật mà không nằm trong bất kỳ danh mục nào. Luật: hết Bước 1, mọi tính năng (chức năng
 * lẫn phi chức năng) của MVP/Round đã nằm trong Backlog với mã PB-xxx, và mọi dòng RTM có
 * story phải trỏ về một mã PB.
 *
 * ⚠️ GIỚI HẠN: chỉ chứng minh HAI SỔ KHỚP NHAU. Hai sổ cùng thiếu một tính năng thì vẫn xanh.
 * Mã thoát: 0 sạch · 2 CHẶN.
 */
const H = require('./_harness-config.cjs');
const { fs } = H;
const AI = H.vai.ai;
const RTM = H.tep('RTM'), BL = H.tep('BACKLOG');
for (const p of [RTM, BL]) if (!fs.existsSync(p)) { console.error(`🛑 Không thấy tệp: ${H.rel(p)}`); process.exit(2); }

const reStory = H.re(H.C.ma.story || 'US-\\d+');
const reBL = H.re('(' + (H.C.ma.backlog || 'PB-\\d{3}') + ')', 'g');
const rtm = H.doc(RTM), bl = H.doc(BL);

const dongRtm = rtm.split(/\r?\n/).filter((x) => /^\|\s*\d+[a-z]?\s*\|/.test(x));
const thieuMa = [], pbTrongRtm = new Set();
for (const x of dongRtm) {
  const o = x.split('|');
  if (o.length < 6) continue;
  const cotStory = o[4] || '';
  const ma = cotStory.match(reBL) || [];
  ma.forEach((m) => pbTrongRtm.add(m));
  // Chỉ đòi mã PB ở dòng CÓ story. Dòng hạ tầng/quy trình không phải tính năng — bắt nó khai
  // một mã tính năng là ép một câu trả lời sai cho một câu hỏi không đặt ra.
  if (reStory.test(cotStory) && !ma.length) thieuMa.push(`#${(o[1] || '').trim()} — ${cotStory.trim().slice(0, 60)}`);
}
const pbTrongBl = new Set((bl.match(reBL) || []));
const blThieuRtm = [...pbTrongBl].filter((m) => !pbTrongRtm.has(m)).sort();
const rtmThieuBl = [...pbTrongRtm].filter((m) => !pbTrongBl.has(m)).sort();

console.log('=== kiem-backlog — RTM ↔ Product Backlog ===');
console.log(`  Dòng truy vết RTM : ${dongRtm.length}`);
console.log(`  Mã PB trong BACKLOG: ${pbTrongBl.size} · trong RTM: ${pbTrongRtm.size}`);
let hong = false;
if (!dongRtm.length && !pbTrongBl.size) { console.log('\n  (chưa có dữ liệu — RTM 0 dòng và Backlog 0 mã PB)'); }
if (thieuMa.length) { hong = true; console.log(`\n  🔴 ${thieuMa.length} dòng RTM có story mà KHÔNG khai mã PB-:`); thieuMa.slice(0, 15).forEach((x) => console.log(`     - ${x}`)); if (thieuMa.length > 15) console.log(`     … và ${thieuMa.length - 15} dòng nữa`); }
if (blThieuRtm.length) { hong = true; console.log(`\n  🔴 ${blThieuRtm.length} mục Backlog KHÔNG dòng RTM nào nhắc: ${blThieuRtm.slice(0, 12).join(', ')}`); console.log('     ⇒ Không trả lời được "mục này xử lý ở đâu, ra bản phát hành nào". Mục CHƯA làm thì để ở §ⓑ (việc hoãn) với mã BL-, không mã PB-.'); }
if (rtmThieuBl.length) { hong = true; console.log(`\n  🔴 ${rtmThieuBl.length} mã PB có trong RTM mà KHÔNG có trong Backlog: ${rtmThieuBl.slice(0, 12).join(', ')}`); console.log('     ⇒ RTM trỏ tới một mục không tồn tại — bẫy c1.'); }
console.log('\n  ⚠️ Giới hạn: phép kiểm chỉ bắt HAI SỔ LỆCH NHAU. Hai sổ cùng thiếu một tính năng thì vẫn xanh.');
if (hong) { console.log(`\n🛑 KIỂM BACKLOG: CÓ VẤN ĐỀ — ${AI} không sửa sổ cho xanh; trình danh sách, chủ dự án quyết.`); process.exit(2); }
console.log('\n✅ KIỂM BACKLOG: SẠCH — ánh xạ hai chiều đầy đủ');
process.exit(0);
