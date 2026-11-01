#!/usr/bin/env node
'use strict';
/*
 * cho-quyet.cjs — SỔ ĐIỂM CHỜ CHỦ DỰ ÁN QUYẾT, bung ra ĐÚNG LÚC chứ không dồn một đống.
 *
 * *** VÌ SAO ***
 * Thứ AI không tự quyết được trước nay đi vào hai chỗ, cả hai đều hỏng: nói trong một tin
 * nhắn (trôi theo hội thoại, phiên sau không ai biết) · ghi vào bàn giao (nằm im, không gì
 * bung ra đúng lúc cần quyết). Khác biệt cốt lõi so với một danh sách việc: mỗi mục mang
 * ĐIỀU KIỆN BUNG, và cổng tự bung mục đến hạn. Mục chưa đến lúc thì IM LẶNG — dồn hết ra
 * mọi lúc thì người ta ngừng đọc, y như một cổng lúc nào cũng đỏ.
 *
 * ⛔ LUẬT CỨNG — AI KHÔNG ĐƯỢC TỰ ĐÓNG MỘT MỤC. `--da-quyet` phải kèm NGUYÊN VĂN chủ dự án.
 *    Chỗ nào AI vừa là người ghi nợ vừa là người xoá nợ thì sổ đó vô nghĩa.
 *
 * Dùng:
 *   node Log/cho-quyet.cjs                              — liệt kê mọi mục còn chờ
 *   node Log/cho-quyet.cjs --den-han --buoc 8 --mvp 01 [--round R2]
 *   node Log/cho-quyet.cjs --den-han --dong-mvp --mvp 01
 *   node Log/cho-quyet.cjs --den-han --su-kien "mời người dùng thật"
 *   node Log/cho-quyet.cjs --them '<json>'              — thêm một mục
 *   node Log/cho-quyet.cjs --da-quyet <id> "nguyên văn chủ dự án quyết"
 *
 * Mã thoát: 0 bình thường · 2 khi --den-han gặp mục ĐẾN HẠN mang cờ chan:true · 1 dùng sai.
 */
const H = require('./_harness-config.cjs');
const { fs, path } = H;
const CHU = H.vai.chu, AI = H.vai.ai;
const SO = H.tep('CHO_QUYET');
const args = process.argv.slice(2);
const co = (t) => args.includes(t);
const gt = (t) => { const i = args.indexOf(t); return i === -1 ? null : args[i + 1]; };

const doc = () => H.ndjson(SO);
function ghi(ds) { fs.mkdirSync(path.dirname(SO), { recursive: true }); fs.writeFileSync(SO, ds.map((x) => JSON.stringify(x)).join('\n') + '\n', 'utf8'); }

function denHan(m, bc) {
  const k = m.khiNao || {};
  if (k.loai === 'luon') return true;
  if (k.loai === 'su-kien') return bc.suKien ? String(k.suKien || '').toLowerCase().includes(String(bc.suKien).toLowerCase().slice(0, 20)) : false;
  if (k.loai === 'buoc') {
    if (bc.buoc === undefined || bc.buoc === null) return false;
    if (String(k.buoc) !== String(bc.buoc)) return false;
    if (k.mvp && bc.mvp && String(k.mvp) !== String(bc.mvp)) return false;
    if (k.round && bc.round && String(k.round) !== String(bc.round)) return false;
    return true;
  }
  if (k.loai === 'moi-buoc') return bc.buoc !== undefined && bc.buoc !== null;
  if (k.loai === 'dong-mvp') return !!bc.dongMvp && (!k.mvp || String(k.mvp) === String(bc.mvp));
  return false;
}
function in1(m) {
  console.log(`  ${m.chan ? '🛑' : '🔔'} [${m.id}] ${m.moTa}`);
  console.log(`       · Vì sao ${AI} không tự quyết: ${m.viSao}`);
  console.log(`       · Gật thì sao / lắc thì sao: ${m.heQua}`);
  if (m.deXuat) console.log(`       · ${AI} nghiêng về: ${m.deXuat}`);
  console.log(`       · Đóng bằng: node Log/cho-quyet.cjs --da-quyet ${m.id} "..."`);
}

if (co('--them')) {
  let m;
  try { m = JSON.parse(gt('--them')); } catch (e) { console.error(`❌ JSON hỏng: ${e.message}`); process.exit(1); }
  for (const t of ['id', 'moTa', 'viSao', 'heQua', 'khiNao']) if (!m[t]) { console.error(`❌ Thiếu trường bắt buộc "${t}".`); process.exit(1); }
  if (!['luon', 'su-kien', 'buoc', 'moi-buoc', 'dong-mvp'].includes((m.khiNao || {}).loai)) { console.error('❌ khiNao.loai phải là: luon | su-kien | buoc | moi-buoc | dong-mvp'); process.exit(1); }
  const ds = doc();
  if (ds.some((x) => x.id === m.id)) { console.error(`❌ Trùng id "${m.id}".`); process.exit(1); }
  m.trangThai = 'cho'; m.chan = !!m.chan; m.taoLuc = new Date().toISOString();
  fs.mkdirSync(path.dirname(SO), { recursive: true });
  fs.appendFileSync(SO, JSON.stringify(m) + '\n', 'utf8');
  console.log(`✅ Đã ghi mục chờ quyết "${m.id}" — tự bung khi: ${JSON.stringify(m.khiNao)}`);
  process.exit(0);
}

if (co('--da-quyet')) {
  const id = gt('--da-quyet');
  const loi = args[args.indexOf('--da-quyet') + 2];
  if (!id || !loi || !String(loi).trim()) { console.error(`❌ Dùng: --da-quyet <id> "nguyên văn ${CHU} quyết" — ⛔ BẮT BUỘC nguyên văn, ${AI} không tự đóng.`); process.exit(1); }
  // Một cái cờ KHÔNG BAO GIỜ là lời của người. Ca thật: gọi sai cú pháp, chuỗi "--nguyen-van" rơi vào
  // vị trí nguyên văn và được ghi vào sổ như lời chủ dự án — cổng xanh, sổ sai, không gì báo.
  if (String(loi).trim().startsWith('--')) { console.error(`❌ Nguyên văn không được là một CỜ: "${loi}". Cú pháp: --da-quyet <id> "nguyên văn"`); process.exit(1); }
  if (String(loi).trim().length < 10) { console.error(`❌ Nguyên văn quá ngắn (${String(loi).trim().length} ký tự) — nghi là chép cho có.`); process.exit(1); }
  const ds = doc();
  const m = ds.find((x) => x.id === id);
  if (!m) { console.error(`❌ Không có mục "${id}".`); process.exit(1); }
  if (m.trangThai === 'da-quyet') { console.error(`⚠️  "${id}" đã đóng trước đó.`); process.exit(0); }
  m.trangThai = 'da-quyet'; m.quyetDinh = String(loi); m.quyetLuc = new Date().toISOString();
  ghi(ds);
  console.log(`✅ Đóng "${id}" — ${CHU} quyết: "${loi}"`);
  console.log(`   📌 Nhớ: quyết định này phải có mặt trong DEVBOOK (nếu là bài học) hoặc artefact liên quan.`);
  process.exit(0);
}

if (co('--den-han')) {
  const bc = { buoc: gt('--buoc'), mvp: gt('--mvp'), round: gt('--round'), suKien: gt('--su-kien'), dongMvp: co('--dong-mvp') };
  const cho = doc().filter((m) => m.trangThai !== 'da-quyet');
  const toi = cho.filter((m) => denHan(m, bc));
  if (!toi.length) { console.log(`  (không có mục chờ quyết nào đến hạn ở bối cảnh này · còn ${cho.length} mục chờ ở nơi khác)`); process.exit(0); }
  console.log(`\n🔔 ${toi.length} ĐIỂM CHỜ ${CHU} QUYẾT — ĐẾN HẠN ĐÚNG LÚC NÀY:`);
  toi.forEach(in1);
  const chan = toi.filter((m) => m.chan);
  if (chan.length) {
    console.log(`\n  🛑 ${chan.length} mục mang cờ CHẶN — đi tiếp mà chưa có quyết định thì việc làm ra hoặc KHÔNG AN TOÀN, hoặc VÔ NGHĨA nếu quyết định đi hướng khác.`);
    process.exit(2);
  }
  process.exit(0);
}

{
  const ds = doc();
  const cho = ds.filter((m) => m.trangThai !== 'da-quyet');
  console.log(`=== SỔ CHỜ ${CHU} QUYẾT ===`);
  console.log(`  Còn chờ: ${cho.length} · Đã quyết: ${ds.length - cho.length}\n`);
  if (!cho.length) console.log('  ✅ Không còn mục nào chờ.');
  cho.forEach((m) => {
    const k = m.khiNao || {};
    const luc = k.loai === 'buoc' ? `Bước ${k.buoc}${k.mvp ? ` MVP ${k.mvp}` : ''}${k.round ? ` ${k.round}` : ''}`
      : k.loai === 'moi-buoc' ? 'mỗi lần đóng Bước' : k.loai === 'dong-mvp' ? `đóng MVP ${k.mvp || ''}` : k.loai === 'su-kien' ? `sự kiện: ${k.suKien}` : 'luôn';
    console.log(`  ${m.chan ? '🛑' : '🔔'} [${m.id}]  bung khi: ${luc}`);
    console.log(`       ${m.moTa}`);
  });
  console.log(`\n  ⛔ ${AI} không được tự đóng mục nào — --da-quyet bắt buộc kèm nguyên văn ${CHU}.`);
  process.exit(0);
}
