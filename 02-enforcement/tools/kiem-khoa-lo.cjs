#!/usr/bin/env node
'use strict';
/*
 * kiem-khoa-lo.cjs — quét vùng staged (hoặc toàn kho) tìm chuỗi có DẠNG KHOÁ BÍ MẬT.
 *
 * VÌ SAO CÓ CÔNG CỤ NÀY
 *   Mọi quy tắc "khoá đọc từ biến môi trường · tệp khoá ngoài kho · không in log" đều là NẾP LÀM —
 *   không có gì cưỡng chế. Chỉ phép quét trước khi commit là thi hành được bằng máy.
 *   Luật không có phép kiểm thì không sống.
 *
 * ⚠️ Giới hạn khai thẳng: đây là phép dò theo KHUÔN, không phải phép chứng minh. Nó bắt được khoá
 *   dán nguyên văn — thứ hay xảy ra nhất — nhưng KHÔNG bắt được khoá đã mã hoá, chia nhỏ, hay đặt
 *   tên lạ. Xanh = *không thấy khuôn quen*, ⛔ không có nghĩa *chắc chắn không lộ*.
 *
 * Dùng:
 *   node Log/kiem-khoa-lo.cjs            → quét vùng STAGED (dùng trong quy trình đẩy git)
 *   node Log/kiem-khoa-lo.cjs --toan-bo  → quét toàn bộ tệp git đang theo dõi
 * Mã thoát: 0 sạch · 2 CÓ NGHI VẤN ⇒ CHẶN · 1 không xác minh được (không phải kho git)
 */
const H = require('./_harness-config.cjs');
const { fs, path } = H;

const TOAN_BO = process.argv.includes('--toan-bo');

// Khuôn khoá thật của các nhà cung cấp phổ biến + khuôn gán chuỗi dài vào biến tên nghe như khoá.
const KHUON = [
  { ten: 'khoá API Anthropic',   re: /sk-ant-[A-Za-z0-9_\-]{20,}/ },
  { ten: 'khoá OpenAI',          re: /\bsk-[A-Za-z0-9]{32,}\b/ },
  { ten: 'client secret Google', re: /GOCSPX-[A-Za-z0-9_\-]{20,}/ },
  { ten: 'khoá riêng PEM',       re: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { ten: 'token GitHub',         re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/ },
  { ten: 'AWS access key',       re: /\bAKIA[0-9A-Z]{16}\b/ },
  { ten: 'gán khoá vào biến',    re: /(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*["'][A-Za-z0-9_\-\/+]{24,}["']/i },
];

// Chỗ được phép chứa khuôn: chính tệp này, thư mục bỏ qua theo config, tệp nhị phân theo đuôi.
const TEP_NAY = H.rel(__filename);
const BO_QUA_THU_MUC = H.C.maCode.boQua || [];
const RE_NHI_PHAN = /\.(png|jpe?g|gif|webp|ico|pdf|zip|gz|7z|rar|db|sqlite3?|db-wal|db-shm|woff2?|ttf|eot|mp[34]|exe|dll|so|pyc)$/i;
const boQua = (f) => f === TEP_NAY || BO_QUA_THU_MUC.some((b) => (f + '/').includes(b)) || RE_NHI_PHAN.test(f);

if (H.git('rev-parse --is-inside-work-tree').trim() !== 'true') {
  console.log('❓ Thư mục dự án chưa phải kho git — không có vùng staged/tệp theo dõi để quét. Không xác minh được.');
  process.exit(1);
}
const files = H.git(TOAN_BO ? 'ls-files' : 'diff --cached --name-only --diff-filter=ACM')
  .split(/\r?\n/).filter(Boolean).filter((f) => !boQua(f));

const nghiVan = [];
for (const f of files) {
  let noi;
  try { noi = fs.readFileSync(path.join(H.ROOT, f), 'utf8'); } catch { continue; }
  if (noi.includes('\u0000')) continue;                     // tệp nhị phân không có đuôi quen
  noi.split(/\r?\n/).forEach((dong, i) => {
    for (const k of KHUON) {
      const m = k.re.exec(dong);
      if (!m) continue;
      // CHE phần giữa: báo cáo không được in nguyên văn khoá ra màn hình/log.
      const lo = m[0].length > 14 ? m[0].slice(0, 8) + '…(che)…' + m[0].slice(-4) : '…(che)…';
      nghiVan.push({ file: f, dong: i + 1, loai: k.ten, mau: lo });
      break;
    }
  });
}

console.log(`=== kiem-khoa-lo — ${TOAN_BO ? 'TOÀN BỘ' : 'vùng STAGED'}: ${files.length} tệp ===`);
if (!files.length) console.log(`  ⚠️ ${TOAN_BO ? 'Kho chưa theo dõi tệp nào' : 'Chưa stage tệp nào'} — chưa có dữ liệu để quét.`);
if (!nghiVan.length) {
  console.log('  ✅ Không thấy chuỗi nào khớp khuôn khoá bí mật.');
  console.log('  ⚠️ Xanh = không thấy khuôn quen, KHÔNG phải bằng chứng "chắc chắn không lộ".');
  process.exit(0);
}
console.log(`  🛑 ${nghiVan.length} chỗ NGHI VẤN — CHẶN, không commit:`);
nghiVan.forEach((n) => console.log(`     ${n.file}:${n.dong} — ${n.loai} — ${n.mau}`));
console.log('\n  Xử: gỡ khoá khỏi mã, đưa vào biến môi trường,');
console.log(`  và ⛔ COI NHƯ KHOÁ ĐÓ ĐÃ LỘ — phải xoay vòng, không chỉ xoá dòng. ${H.vai.ai} không tự quyết "khoá này không quan trọng".`);
process.exit(2);
