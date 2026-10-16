#!/usr/bin/env node
'use strict';
/**
 * do-gio.cjs — tính GIỜ LÀM VIỆC từ sổ hook (HOOK-EVENTS.ndjson), AI tự tính, không hỏi người.
 *
 * *** LUẬT ĐO (chủ dự án chốt, thay cách cũ "ước tay") ***
 *  1. Ranh giới một KHỐI làm việc: mở bằng lệnh "nạp context" (đọc từ USAGE.md — cột prompt),
 *     đóng bằng lần ghi bàn giao (tệp khớp lenhKichHoat.banGiao) hoặc lần "nạp context" kế tiếp.
 *  2. Khoảng giữa bàn giao → "nạp context" kế tiếp KHÔNG phải giờ làm việc — trừ đi.
 *  3. Không xác định được ranh giới bằng mốc lệnh thì dùng NGƯỠNG GỘP CỤM 30 phút làm dự phòng.
 *  4. KHÔNG suy giờ từ token.
 *
 * ⚠️ GIỚI HẠN: hook chỉ bắt lượt gọi công cụ. Khối mở đầu/kết thúc bằng việc đọc thuần thì phần đó
 *    không có mốc ⇒ số đo là CẬN DƯỚI. Số không đo được thì ghi là không đo được.
 *
 * Vì sao đổi: ước tay nhớ được phần "đang làm gì" nhưng quên phần đọc và đối chiếu — đo thật một
 * phiên ra 263 phút trong khi ước tay 180. Số đo khó bịa hơn số ước.
 *
 * Dùng: node Log/do-gio.cjs [--tu YYYY-MM-DD] [--den YYYY-MM-DD] [--phien <8 ký tự>] [--json]
 */
const H = require('./_harness-config.cjs');
const args = process.argv.slice(2);
const gt = (t) => { const i = args.indexOf(t); return i === -1 ? null : args[i + 1]; };
const tu = gt('--tu'), den = gt('--den'), phien = gt('--phien');
const NGUONG_CUM = 30;

const ev = H.ndjson(H.tep('HOOK_EVENTS')).map((e) => ({ t: Date.parse(e.ts), s: String(e.sessionId || '').slice(0, 8), tool: e.toolName, d: String(e.detail || '') })).filter((e) => isFinite(e.t));
if (!ev.length) { console.log('=== do-gio ===\n  (chưa có HOOK-EVENTS — hook log-tool-event chưa ghi gì, hoặc chưa cài)'); process.exit(0); }
ev.sort((a, b) => a.t - b.t);

// Mốc "nạp context" từ USAGE.md: | ts | session | model | ... | prompt |
const reNap = new RegExp((H.C.lenhKichHoat || {}).napContext || 'nạp context', 'i');
const reBanGiao = new RegExp((H.C.lenhKichHoat || {}).banGiao || 'BANGIAO|HANDOFF', 'i');
const mocNap = [];
for (const l of H.doc(H.tep('USAGE')).split(/\r?\n/)) {
  const c = l.split('|').map((x) => x.trim());
  if (c.length < 9 || !/^\d{4}-\d{2}-\d{2}T/.test(c[1])) continue;
  if (reNap.test(c[c.length - 2])) mocNap.push({ t: Date.parse(c[1]), s: c[2].slice(0, 8) });
}
const locNgay = (t) => (!tu || new Date(t).toISOString().slice(0, 10) >= tu) && (!den || new Date(t).toISOString().slice(0, 10) <= den);
const theoPhien = new Map();
for (const e of ev) { if (phien && e.s !== phien) continue; if (!locNgay(e.t)) continue; if (!theoPhien.has(e.s)) theoPhien.set(e.s, []); theoPhien.get(e.s).push(e); }

const ketQua = [];
for (const [s, ds] of theoPhien) {
  const nap = mocNap.filter((m) => m.s === s).map((m) => m.t).sort((a, b) => a - b);
  const khoi = [];
  if (nap.length) {
    // Khối theo mốc lệnh: từ mỗi "nạp context" tới bàn giao (Write tệp khớp) hoặc mốc nạp kế.
    for (let i = 0; i < nap.length; i++) {
      const batDau = nap[i], gioiHan = nap[i + 1] || Infinity;
      const trong = ds.filter((e) => e.t >= batDau - 60000 && e.t < gioiHan);
      if (!trong.length) continue;
      const bg = trong.find((e) => /Write|Edit/.test(e.tool) && reBanGiao.test(e.d));
      const ketThuc = bg ? bg.t : trong[trong.length - 1].t;
      khoi.push({ cach: 'moc-lenh', batDau, ketThuc, luot: trong.filter((e) => e.t <= ketThuc).length, coBanGiao: !!bg });
    }
    const truocNap = ds.filter((e) => e.t < nap[0] - 60000);
    if (truocNap.length) khoi.unshift(...gopCum(truocNap).map((k) => ({ ...k, cach: 'cum-30p (trước mốc nạp đầu)' })));
  } else khoi.push(...gopCum(ds).map((k) => ({ ...k, cach: 'cum-30p (không có mốc nạp context)' })));
  const phut = khoi.reduce((a, k) => a + (k.ketThuc - k.batDau) / 60000, 0);
  ketQua.push({ phien: s, soLuot: ds.length, soKhoi: khoi.length, phut: Math.round(phut * 10) / 10, khoi });
}
function gopCum(ds) {
  const ra = []; let dau = ds[0].t, truoc = ds[0].t, n = 1;
  for (const e of ds.slice(1).concat([{ t: Infinity }])) {
    if (e.t - truoc > NGUONG_CUM * 60000) { ra.push({ batDau: dau, ketThuc: truoc, luot: n }); dau = e.t; n = 0; }
    truoc = e.t; n++;
  }
  return ra;
}
if (args.includes('--json')) { console.log(JSON.stringify(ketQua, null, 2)); process.exit(0); }
console.log('=== do-gio — giờ làm việc từ HOOK-EVENTS (cận dưới) ===\n');
let tong = 0;
for (const k of ketQua) {
  tong += k.phut;
  console.log(`  phiên ${k.phien}: ${k.phut} phút · ${k.soLuot} lượt gọi · ${k.soKhoi} khối`);
  k.khoi.forEach((b) => console.log(`     ${new Date(b.batDau).toISOString().slice(0, 16)}Z → ${new Date(b.ketThuc).toISOString().slice(11, 16)}Z  ${Math.round((b.ketThuc - b.batDau) / 60000)} phút · ${b.luot} lượt · ${b.cach}${b.coBanGiao ? ' · có bàn giao' : ''}`));
}
console.log(`\n  Tổng: ${Math.round(tong)} phút (${(tong / 60).toFixed(1)} giờ)`);
console.log('  ⚠️ CẬN DƯỚI: khoảng đọc/nghĩ/gõ không để lại mốc hook. Khối "cum-30p" là dự phòng khi thiếu mốc lệnh.');
