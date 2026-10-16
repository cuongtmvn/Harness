#!/usr/bin/env node
'use strict';
/**
 * kiem-phu-moi-truong.cjs — CỔNG PHỦ MÔI TRƯỜNG: "phép đo này chạy Ở ĐÂU?"
 *
 * *** VÌ SAO ***
 * Mọi cổng khác đếm SỐ CA. Không cổng nào đếm NƠI CHẠY. Một phép đo đúng, chạy nhầm môi trường,
 * vẫn là không đo — mà nó làm mọi con số đẹp lên. Và tệ hơn "không đo": một chỗ trống thì người
 * ta còn thấy trống; một chỗ được lấp bằng thứ đo nhầm chỗ thì không ai đi tìm nữa.
 * (Ca thật: hàng chục ca trình duyệt trong kho, tất cả trỏ 127.0.0.1 — môi trường thật chưa từng
 * bị một trình duyệt chạm vào, suốt nhiều tháng, không cổng nào đỏ.)
 *
 * BA PHÉP KIỂM — phép ② mới là phép chống gian
 *  ① ô trống phải khai lý do ≥60 ký tự ("chưa ai đo" và "không thể đo" là hai câu khác nhau)
 *  ② tệp khai phải CÓ THẬT và THỰC SỰ nhắc tới môi trường đó (config › moiTruong.<x>.dauHieu)
 *  ③ tệp bắn tới production mà không ô nào khai ⇒ cảnh báo (mồ côi ngược)
 *
 * ⛔ KHÔNG tự suy môi trường bằng cách quét mã: quét chuỗi đếm nhầm tệp chỉ NHẮC tên miền trong
 *    dữ liệu thử. Và quan trọng hơn: bắt KHAI thì người viết PHẢI trả lời câu "kiểm ở đâu".
 * Mã thoát: 0 sạch · 2 CHẶN.
 */
const H = require('./_harness-config.cjs');
const { fs, path } = H;
const KHAI = H.tep('PHU_MOI_TRUONG');
const DAI_LY_DO = 60;
if (!fs.existsSync(KHAI)) { console.error(`🔴 Thiếu ${H.rel(KHAI)} — không có bảng khai để đối chiếu.`); process.exit(2); }
const khai = H.docJson(KHAI, null);
if (!khai || !Array.isArray(khai.o)) { console.error(`🔴 ${H.rel(KHAI)} hỏng hoặc thiếu mảng "o".`); process.exit(2); }

const MT = H.C.moiTruong || {};
const dauHieu = {};
for (const [k, v] of Object.entries(MT)) if (v && typeof v === 'object' && v.dauHieu && !/^<.*>$/.test(v.dauHieu)) dauHieu[k] = H.re(v.dauHieu);

const loi = [], canhBao = [], daKhai = new Set();
console.log('=== CỔNG PHỦ MÔI TRƯỜNG — "phép đo này chạy Ở ĐÂU?" ===\n');
for (const o of khai.o) {
  const ten = `${o.moiTruong} × ${o.tang}`;
  const tep = o.boiTep || [];
  if (!tep.length) {
    const lyDo = String(o.lyDo || '').trim();
    if (lyDo.length < DAI_LY_DO) loi.push(`Ô "${ten}" TRỐNG mà lý do chỉ ${lyDo.length} ký tự (cần ≥${DAI_LY_DO}). "Chưa ai đo" và "không thể đo" là HAI câu khác nhau.`);
    else console.log(`  ⚪ ${ten.padEnd(28)} TRỐNG — có lý do (${lyDo.length} ký tự)`);
    continue;
  }
  const thieu = [], khongTro = [];
  for (const t of tep) {
    const p = H.P(t);
    if (!fs.existsSync(p)) { thieu.push(t); continue; }
    daKhai.add(t.replace(/\\/g, '/'));
    const dh = dauHieu[o.moiTruong];
    if (dh && !dh.test(fs.readFileSync(p, 'utf8'))) khongTro.push(t);
  }
  if (thieu.length) loi.push(`Ô "${ten}" khai ${thieu.length} tệp KHÔNG CÓ trên đĩa: ${thieu.join(', ')} — bẫy c1: một ô ghi tên tệp đã xoá vẫn trông như đã phủ.`);
  if (khongTro.length) loi.push(`Ô "${ten}" khai ${khongTro.join(', ')} nhưng các tệp đó KHÔNG hề nhắc tới ${o.moiTruong} (dấu hiệu: ${MT[o.moiTruong] && MT[o.moiTruong].dauHieu}) — lời khai không khớp mã.`);
  if (!dauHieu[o.moiTruong]) canhBao.push(`Môi trường "${o.moiTruong}" chưa khai dauHieu trong harness.config.json ⇒ phép ② không kiểm được cho ô "${ten}".`);
  if (!thieu.length && !khongTro.length) console.log(`  ✅ ${ten.padEnd(28)} ${tep.length} tệp — đều có thật${dauHieu[o.moiTruong] ? ' và đúng môi trường' : ''}`);
}
// ③ mồ côi ngược — tệp bắn tới production mà không ô nào khai
const reProd = dauHieu.production;
if (reProd) {
  const ungVien = [];
  for (const tm of [H.C.thuMuc.tests, H.C.thuMuc.log]) {
    const d = H.P(tm);
    if (!fs.existsSync(d)) continue;
    for (const f of fs.readdirSync(d)) {
      const rel = `${tm}/${f}`.replace(/\\/g, '/');
      if (daKhai.has(rel) || !/\.(py|js|ts|cjs|mjs)$/.test(f)) continue;
      let ma = ''; try { ma = fs.readFileSync(path.join(d, f), 'utf8'); } catch { continue; }
      if (reProd.test(ma) && /https?:\/\//.test(ma)) ungVien.push(rel);
    }
  }
  if (ungVien.length) canhBao.push(`${ungVien.length} tệp có vẻ bắn tới PRODUCTION mà không ô nào khai: ${ungVien.join(', ')}`);
}
console.log();
if (canhBao.length) { console.log('⚠️  CẢNH BÁO (không chặn):'); canhBao.forEach((c) => console.log(`   · ${c}`)); console.log(); }
if (loi.length) {
  console.log('🔴 CHẶN:'); loi.forEach((l) => console.log(`   · ${l}`));
  console.log('\n📋 XONG NGHĨA LÀ GÌ: mỗi ô (môi trường × tầng đo) hoặc có tệp CÓ THẬT và ĐÚNG môi trường, hoặc khai lý do ≥60 ký tự. ⛔ KHÔNG sửa bảng khai cho xanh — ô trống là một SỰ THẬT cần nhìn thấy.');
  process.exit(2);
}
console.log('✅ PHỦ MÔI TRƯỜNG: SẠCH — mọi ô đều có tệp thật, hoặc có lý do thật.');
console.log('⚠️  Xanh nghĩa là LỜI KHAI KHỚP MÃ. Nó không nói các phép đo đó ĐỦ hay ĐÚNG.');
process.exit(0);
