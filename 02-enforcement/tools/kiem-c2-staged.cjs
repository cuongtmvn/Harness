#!/usr/bin/env node
'use strict';
/*
 * kiem-c2-staged.cjs — cổng `c2` (change coupling) TRƯỚC khi commit.
 *
 * VÌ SAO CÓ CÔNG CỤ NÀY
 *   Hỏi đúng một câu trước khi commit: "mã đang staged có đổi không? Nếu có, tài liệu LIÊN QUAN
 *   đã nằm trong cùng change set chưa?" Đo sau (doc-health c2) chỉ thấy lịch sử đã hỏng;
 *   cổng này chặn ngay lúc còn sửa được.
 *   "Liên quan" KHÔNG do AI tự đặt danh sách (đã thử, và đó là đoán): tra từ chính RTM —
 *     tệp mã → dòng RTM có tệp đó ở cột Code/Test
 *        → RTM  (chính dòng đó phải cập nhật)
 *        → SPEC (nếu cột Story có mã story)
 *        → ARCH (nếu cột Nguồn có mã quyết định kiến trúc)
 *   KHÔNG đòi SCOPE: đó là phạm vi cấp cao, sửa một AC không bắt buộc đổi SCOPE.
 *
 * ⚠️ TRÙNG LẶP CÓ Ý THỨC: luật này cài ở HAI nơi — doc-health.cjs (đo cả lịch sử git, ra chỉ số c2)
 *    và tệp này (kiểm cái SẮP commit). Sửa một bên PHẢI sửa bên kia — `--tu-kiem` đối chiếu 2 bên trên cùng HEAD.
 * ⚠️ Giới hạn: tệp mã mà KHÔNG dòng RTM nào trỏ tới thì cổng KHÔNG kết luận được — đó là lỗ c4
 *    (mồ côi ngược), không phải trượt c2. Gộp vào trượt là chẩn đoán sai bệnh.
 *
 * Chạy: node Log/kiem-c2-staged.cjs            (kiểm vùng đang staged)
 *       node Log/kiem-c2-staged.cjs --tu-kiem  (đối chiếu với doc-health.cjs trên HEAD)
 * Mã thoát: 0 đạt / không áp dụng / không tra được · 2 THIẾU tài liệu liên quan (CHẶN) · 1 không xác minh được
 */
const H = require('./_harness-config.cjs');
const { fs } = H;

const RTM = H.tep('RTM');
const RTM_REL = H.rel(RTM), SPEC_REL = H.rel(H.tep('SPEC')), ARCH_REL = H.rel(H.tep('ARCH'));
const RE_STORY = H.re(H.C.ma.story) || /US-\d+/;
const RE_QD = H.re(H.C.ma.quyetDinh);

if (!fs.existsSync(RTM)) {
  console.log(`🛑 Thiếu tệp bắt buộc: ${RTM_REL} — không có RTM thì không tra được "tài liệu liên quan" (fail-closed).`);
  process.exit(2);
}
if (H.git('rev-parse --is-inside-work-tree').trim() !== 'true') {
  console.log('❓ Thư mục dự án chưa phải kho git — không có vùng staged để kiểm.');
  process.exit(1);
}

// --- đọc RTM (CÙNG cách với doc-health.cjs) ------------------------------------
const rtmDong = fs.readFileSync(RTM, 'utf8').split(/\r?\n/)
  .filter((l) => /^\|\s*\d+[a-z]?\s*\|/.test(l.trim()))
  .map((l) => { const c = l.trim().split('|'); return { so: (c[1] || '').trim(), nguon: (c[2] || '').trim(), story: (c[4] || '').trim(), testCode: (c[6] || '').trim() }; });

function taiLieuLienQuan(f) {
  const short = f.replace(new RegExp('^' + H.C.thuMuc.app + '/'), ''), base = f.split('/').pop();
  const hit = rtmDong.filter((r) => r.testCode && (r.testCode.includes(short) || r.testCode.includes(base)));
  const docs = new Set();
  for (const r of hit) {
    docs.add(RTM_REL);
    if (RE_STORY.test(r.story)) docs.add(SPEC_REL);
    if (RE_QD && RE_QD.test(r.nguon)) docs.add(ARCH_REL);
  }
  return { hit, docs };
}

/** Chấm một tập tệp bất kỳ → {phanQuyet, ma, can, thieu, moCoi} */
function cham(files) {
  const ma = files.filter(H.laMaCode);
  if (!ma.length) return { phanQuyet: 'khong-cham-ma', ma: [], can: [], thieu: [], moCoi: [] };
  const can = new Set(); const moCoi = [];
  for (const f of ma) {
    const { hit, docs } = taiLieuLienQuan(f);
    if (!hit.length) { moCoi.push(f); continue; }
    docs.forEach((d) => can.add(d));
  }
  if (!can.size) return { phanQuyet: 'khong-tra-duoc', ma, can: [], thieu: [], moCoi };
  const thieu = [...can].filter((d) => !files.includes(d));
  return { phanQuyet: thieu.length ? 'thieu' : 'coupled', ma, can: [...can], thieu, moCoi };
}

// --- chế độ tự kiểm: đối chiếu với doc-health.cjs trên HEAD ---------------------
if (process.argv.includes('--tu-kiem')) {
  const head = H.git('rev-parse --short HEAD').trim();
  if (!head) { console.log('❓ Kho git chưa có commit nào — chưa có dữ liệu để đối chiếu.'); process.exit(1); }
  const files = H.git('show --stat --name-only --format="" HEAD').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  const r = cham(files);
  const json = H.docJson(H.tep('DOC_HEALTH'), null);
  if (!json || !json.c2) {
    console.log(`❓ Chưa có ${H.rel(H.tep('DOC_HEALTH'))} (hoặc thiếu c2) — chạy doc-health.cjs trước rồi mới đối chiếu được.`);
    process.exit(1);
  }
  const c2 = json.c2;
  const ben2 = (c2.commitThieuTaiLieu || []).find((x) => head.startsWith(x.commit));
  const kq2 = ben2 ? 'thieu' : ((c2.commitKhongTraDuoc || []).find((x) => head.startsWith(x.commit)) ? 'khong-tra-duoc' : 'coupled/khong-cham-ma');
  console.log(`HEAD ${head}`);
  console.log(`  tệp này         : ${r.phanQuyet}${r.thieu.length ? ' (' + r.thieu.join(', ') + ')' : ''}`);
  console.log(`  doc-health.cjs  : ${kq2}${ben2 ? ' (' + ben2.thieu.join(', ') + ')' : ''}`);
  const khop = (r.phanQuyet === 'thieu') === (kq2 === 'thieu');
  console.log(khop ? '  => 2 bên KHỚP' : '  => 🔴 2 BÊN LỆCH — luật đã trôi, phải đồng bộ lại hai tệp');
  console.log('  ⚠️ Lưu ý: tệp này tra RTM HIỆN HÀNH, doc-health tra RTM TẠI THỜI ĐIỂM commit — HEAD vừa commit thì hai bản trùng nhau.');
  process.exit(khop ? 0 : 1);
}

// --- chế độ thường: kiểm vùng đang staged ---------------------------------------
const staged = H.git('diff --cached --name-only').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
if (!staged.length) { console.log('c2: chưa stage gì — không có gì để kiểm.'); process.exit(0); }
const r = cham(staged);

console.log('=== Cổng c2 — tài liệu liên quan có trong cùng change set không? ===');
if (r.phanQuyet === 'khong-cham-ma') {
  console.log(`  Không có tệp mã (${H.C.thuMuc.app}/**.{${(H.C.maCode.duoi || []).join(',')}}) trong vùng staged.`);
  console.log('  => KHÔNG ÁP DỤNG c2. Đi tiếp.');
  process.exit(0);
}
console.log(`  Tệp mã staged         : ${r.ma.length}`);
if (r.moCoi.length) {
  console.log(`  ⚠️ ${r.moCoi.length} tệp KHÔNG dòng RTM nào trỏ tới (lỗ c4 mồ côi ngược, KHÔNG phải trượt c2):`);
  r.moCoi.forEach((f) => console.log(`       - ${f}`));
}
if (r.phanQuyet === 'khong-tra-duoc') {
  console.log('  => KHÔNG TRA ĐƯỢC. Không kết luận đạt/trượt.');
  console.log(`     Báo ${H.vai.chu}: mã này chưa được truy vết trong RTM. Hỏi có nên thêm dòng RTM không.`);
  process.exit(0);
}
console.log(`  RTM nói liên quan     : ${r.can.map((d) => d.split('/').pop()).join(', ')}`);
if (r.phanQuyet === 'coupled') {
  console.log('  => ✅ ĐẠT c2 — đủ tài liệu liên quan trong cùng change set.');
  process.exit(0);
}
console.log(`  🔴 THIẾU              : ${r.thieu.map((d) => d.split('/').pop()).join(', ')}`);
console.log(`  => CHƯA ĐẠT c2. Báo ${H.vai.chu}; ${H.vai.ai} KHÔNG tự sửa tài liệu cho có để làm đẹp chỉ số.`);
process.exit(2);
