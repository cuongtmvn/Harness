#!/usr/bin/env node
'use strict';
/*
 * gate-check.cjs — CỔNG PHASE GATE của harness. Bốn chế độ:
 *
 *   node Log/gate-check.cjs --mo-round R<k> --mvp <nn> [--ghi] [--hoi-to "lý do khai bù"]
 *   node Log/gate-check.cjs --buoc <n> --mvp <nn> [--round R<k>] [--ghi]
 *   node Log/gate-check.cjs --dong-mvp <nn> [--ghi]
 *   node Log/gate-check.cjs <taskId> [--deliverable BUILD] [--muc <mục dây cương>]
 *                           [--huynh-xac-nhan <YYYY-MM-DD>] [--nguon-xac-nhan huynh-tu-chay|huynh-noi-trong-phien]
 *                           [--trich-loi-huynh "..."] [--before <DOC-HEALTH.json đầu Bước>] [--che-do-review-cuoi]
 *
 * Mã thoát: 0 = qua · 2 = CHẶN (không được tự sửa cho qua, báo chủ dự án) · 1 = dùng sai.
 * `--ghi` CHỈ ghi khi qua cổng — không lưu một lần đóng không có thật.
 *
 * *** VÌ SAO CỔNG NÀY TỒN TẠI — bốn bài học tổng quát ***
 *  1. Cổng máy chỉ kiểm KẾ TOÁN (task ✅ · telemetry · thứ tự). Cổng xanh ≠ Bước đạt —
 *     còn phải đối chiếu "Done khi". Cổng tự in khối "XONG NGHĨA LÀ GÌ" khi đỏ.
 *  2. Luật không có phép kiểm thì không sống: mọi mục cổng VÀO/RA đều phải có bản khai
 *     máy đọc được (điều kiện f), và mọi mục chỉ là "văn bản" trước đây đều đã bị vượt.
 *  3. Một cổng bị vượt mà không có hậu quả sẽ bị vượt tiếp ⇒ đóng sai thứ tự thì bản ghi
 *     bị huỷ hiệu lực (ketQua: "huy"), và thứ tự là điều kiện (e).
 *  4. Chỗ nào cổng được NỚI thì AI được lợi ⇒ mỗi chỗ nới phải SIẾT bù bằng lời khai bắt
 *     buộc (năm loại bằng chứng · nợ đã ghi · khai Round trước khi biết kết quả).
 *
 * ⛔ Đây là HẠ TẦNG GÁC LUẬT — AI không được sửa/tắt/nới (điều dừng 5).
 */
const H = require('./_harness-config.cjs');
const { fs, path } = H;
const { execSync } = require('child_process');

const CHU = H.vai.chu, AI = H.vai.ai;
const LOG = H.P(H.C.thuMuc.log);
const TOOL = (ten) => JSON.stringify(path.join(__dirname, ten));
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i === -1 ? null : args[i + 1]; };
const co = (name) => args.includes(name);

const fGateLog = H.tep('PHASE_GATE_LOG');
const thuCongBuoc = H.P(H.C.thuMuc.log, H.C.tep.log.CONG_BUOC);
const thuKhaiRound = H.P(H.C.thuMuc.log, H.C.tep.log.KHAI_ROUND);

function docGateLog() { return H.ndjson(fGateLog); }
function ghiGateLog(obj) {
  fs.mkdirSync(path.dirname(fGateLog), { recursive: true });
  fs.appendFileSync(fGateLog, JSON.stringify(obj) + '\n', 'utf8');
}
function chayLay(lenh) {
  // Chạy một lệnh, trả { ma, out } — đọc stdout cả khi thoát khác 0.
  try {
    const out = execSync(lenh, { cwd: H.ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
    return { ma: 0, out };
  } catch (e) {
    return { ma: typeof e.status === 'number' ? e.status : -1, out: (e.stdout || '') + (e.stderr || '') };
  }
}

// ============================================================================
// MỞ ROUND — khai đủ 11 Bước TRƯỚC khi chạy.
// Round được bắt đầu ở Bước bất kỳ; đổi lại phải khai cham / khong-cham / ke-thua cho
// cả 11 Bước, hai trạng thái sau bắt buộc lý do, kèm moVi (mở vì khoảng cách nào).
// Khai lúc MỞ — tức TRƯỚC khi biết kết quả — nên lời khai mới có giá trị đối chiếu.
// ============================================================================
if (co('--mo-round')) {
  const round = flag('--mo-round');
  const mvp = flag('--mvp');
  if (!round || !/^R\d+$/.test(round) || !mvp) {
    console.error('❌ Dùng: node Log/gate-check.cjs --mo-round R<k> --mvp <nn> [--ghi] [--hoi-to "..."]');
    process.exit(1);
  }
  const fKhai = path.join(thuKhaiRound, `${mvp}-${round}.json`);
  console.log(`=== MỞ ROUND — MVP ${mvp}, ${round} ===`);
  console.log(`  Bảng khai: ${H.rel(fKhai)}`);
  if (!fs.existsSync(fKhai)) {
    console.error(`\n🛑 KHÔNG MỞ ĐƯỢC ${round} — chưa có bảng khai.`);
    console.error(`   Tạo ${H.rel(fKhai)} theo mẫu ${H.rel(path.join(thuKhaiRound, '_MAU.json'))}: khai ĐỦ 11 Bước (0-10),`);
    console.error('   mỗi Bước một trạng thái "cham" | "khong-cham" (kèm lyDo) | "ke-thua" (kèm lyDo), và "moVi".');
    process.exit(2);
  }
  const khai = H.docJson(fKhai, null);
  if (!khai) { console.error('\n🛑 Bảng khai hỏng — không đọc được JSON.'); process.exit(2); }
  const HOP_LE = ['cham', 'khong-cham', 'ke-thua'];
  const loi = [];
  const bang = new Map();
  (Array.isArray(khai.buoc) ? khai.buoc : []).forEach((b) => bang.set(String(b.so), b));
  for (let n = 0; n <= 10; n++) {
    const b = bang.get(String(n));
    if (!b) { loi.push(`Bước ${n}: CHƯA KHAI`); continue; }
    if (!HOP_LE.includes(b.trangThai)) { loi.push(`Bước ${n}: trạng thái "${b.trangThai}" không hợp lệ`); continue; }
    if (!String(b.lyDo || '').trim()) {
      loi.push(`Bước ${n}: "${b.trangThai}" mà KHÔNG có lyDo — kể cả "cham" cũng phải ghi VIỆC CỤ THỂ sẽ làm. Lời khai trống thì không đối chiếu được.`);
    }
  }
  if (!String(khai.moVi || '').trim()) loi.push('Thiếu "moVi" — Round này mở vì KHOẢNG CÁCH NÀO của Round trước.');
  const dem = { cham: 0, 'khong-cham': 0, 'ke-thua': 0 };
  bang.forEach((b) => { if (dem[b.trangThai] !== undefined) dem[b.trangThai]++; });
  console.log(`  Đã khai: ${bang.size}/11 · chạm ${dem.cham} · không chạm ${dem['khong-cham']} · kế thừa ${dem['ke-thua']}`);
  const hoiTo = flag('--hoi-to');
  if (hoiTo) console.log(`  ⚠️  KHAI BÙ (hồi tố): ${hoiTo}`);
  if (loi.length) {
    console.log(`\n🛑 KHÔNG MỞ ĐƯỢC ${round} — ${loi.length} chỗ chưa đạt:`);
    loi.forEach((l) => console.log('   - ' + l));
    process.exit(2);
  }
  console.log(`\n✅ ${round} ĐỦ ĐIỀU KIỆN MỞ — 11/11 Bước đã khai trạng thái kèm việc.`);
  if (co('--ghi')) {
    ghiGateLog({
      loai: 'mo-round', mvp, round, moVi: khai.moVi,
      buoc: Array.from(bang.values()).map((b) => ({ so: String(b.so), trangThai: b.trangThai, lyDo: b.lyDo || '' })),
      hoiTo: hoiTo || null, moLuc: new Date().toISOString(),
    });
    console.log(`   📝 Đã ghi bản ghi MỞ ROUND vào ${H.rel(fGateLog)}`);
  } else console.log('   (Thêm --ghi để lưu bản ghi mở Round.)');
  process.exit(0);
}

// ============================================================================
// ĐÓNG MVP — nghĩa vụ "đủ 11 Bước" thuộc về MVP, không thuộc về Round.
// Mỗi Bước phải rơi vào ĐÚNG MỘT trong ba: ✅ đã đóng · ⚠️ kế thừa (MỌI Round đều khai
// ke-thua — qua được nhưng là NỢ CÓ CHỦ Ý) · 🛑 chưa chạy (CHẶN).
// ============================================================================
if (co('--dong-mvp')) {
  const mvp = flag('--dong-mvp');
  if (!mvp) { console.error('❌ Dùng: node Log/gate-check.cjs --dong-mvp <nn> [--ghi]'); process.exit(1); }
  console.log(`=== ĐÓNG MVP ${mvp} — 11 Bước có chạy đủ không? ===`);
  const daDong = new Map();
  docGateLog().forEach((g) => {
    if (['mo-round', 'xac-nhan-A+', 'dong-mvp'].includes(g.loai)) return;
    if (String(g.mvp) !== String(mvp) || g.ketQua !== 'qua') return;
    const k = String(g.buoc);
    if (!daDong.has(k)) daDong.set(k, []);
    daDong.get(k).push(g.round || 'R1');
  });
  const khaiTheoBuoc = new Map();
  const cacRound = [];
  if (fs.existsSync(thuKhaiRound)) {
    fs.readdirSync(thuKhaiRound).filter((f) => f.startsWith(`${mvp}-`) && f.endsWith('.json')).forEach((f) => {
      const kr = H.docJson(path.join(thuKhaiRound, f), null);
      if (!kr) return;
      cacRound.push(kr.round || f);
      (kr.buoc || []).forEach((b) => {
        const k = String(b.so);
        if (!khaiTheoBuoc.has(k)) khaiTheoBuoc.set(k, []);
        khaiTheoBuoc.get(k).push({ round: kr.round || f, trangThai: b.trangThai, lyDo: b.lyDo || '' });
      });
    });
  }
  console.log(`  Round có bảng khai: ${cacRound.length ? cacRound.join(', ') : '(không có — R1 ngầm định)'}\n`);
  const chan = [], keThua = [];
  for (let n = 0; n <= 10; n++) {
    const k = String(n);
    const dong = daDong.get(k) || [];
    const khai = khaiTheoBuoc.get(k) || [];
    if (dong.length) { console.log(`  ✅ Bước ${k.padStart(2)} — đã đóng ở ${dong.join(', ')}`); continue; }
    const kt = khai.filter((x) => x.trangThai === 'ke-thua');
    if (khai.length && kt.length === khai.length) {
      console.log(`  ⚠️  Bước ${k.padStart(2)} — KẾ THỪA, chưa chạy ở MVP ${mvp}`);
      keThua.push(`Bước ${n}: kế thừa (${kt.map((x) => x.round).join(', ')}) — ${kt[0].lyDo.slice(0, 160)}`);
      continue;
    }
    const moTa = khai.length ? khai.map((x) => `${x.round}:${x.trangThai}`).join(', ') : 'không Round nào khai';
    console.log(`  🛑 Bước ${k.padStart(2)} — CHƯA CHẠY  (${moTa})`);
    chan.push(`Bước ${n} chưa có bản ghi đóng nào ở MVP ${mvp}` + (kt.length ? `, và chỉ ${kt.length}/${khai.length} Round khai "ke-thua" — phải MỌI Round mới được miễn` : ', và không Round nào khai "ke-thua"') + `. ⛔ MVP phải chạy đủ 11 Bước (PLAYBOOK §0.1).`);
  }
  console.log('');
  if (keThua.length) {
    console.log(`⚠️  ${keThua.length} Bước KẾ THỪA — qua được, nhưng là NỢ CÓ CHỦ Ý, không phải việc đã làm:`);
    keThua.forEach((x) => console.log('   - ' + x));
    console.log('');
  }
  if (chan.length) {
    console.log(`🛑 MVP ${mvp} CHƯA ĐÓNG ĐƯỢC — ${chan.length} Bước chưa chạy:`);
    chan.forEach((c) => console.log('   - ' + c));
    process.exit(2);
  }
  const cq = chayLay(`node ${TOOL('cho-quyet.cjs')} --den-han --dong-mvp --mvp ${mvp}`);
  process.stdout.write(cq.out);
  if (cq.ma === 2) { console.log(`\n🛑 MVP ${mvp} CHƯA ĐÓNG ĐƯỢC — có điểm CHỜ ${CHU} QUYẾT mang cờ CHẶN.`); process.exit(2); }
  const pv = chayLay(`node ${TOOL('kiem-pham-vi.cjs')}`);
  process.stdout.write(pv.out);
  if (pv.ma === 2) { console.log(`\n🛑 MVP ${mvp} CHƯA ĐÓNG ĐƯỢC — cổng phạm vi CHẶN (lời khai hỏng hoặc hoãn không chữ ký).`); process.exit(2); }
  if (pv.ma === 1) console.log(`\n⚠️  Còn mục tiêu CHƯA GIAO — đóng MVP được chỉ khi ${CHU} đã ký hoãn cho từng mục (xem trên).`);
  console.log(`\n✅ MVP ${mvp} ĐỦ ĐIỀU KIỆN ĐÓNG — 11/11 Bước đã chạy hoặc kế thừa có khai.`);
  console.log('⚠️  Cổng này chỉ kiểm ĐỦ BƯỚC — không kiểm chất lượng từng Bước (việc của cổng cấp Bước + "Done khi").');
  if (co('--ghi')) {
    ghiGateLog({ loai: 'dong-mvp', mvp, ketQua: 'qua', soBuocDaDong: 11 - keThua.length, soBuocKeThua: keThua.length, keThua, dongLuc: new Date().toISOString() });
    console.log(`   📝 Đã ghi bản ghi ĐÓNG MVP vào ${H.rel(fGateLog)}`);
  } else console.log('   (Thêm --ghi để lưu bản ghi đóng MVP.)');
  process.exit(0);
}

// ============================================================================
// CỔNG CẤP BƯỚC — 13 điều kiện (0)(a)…(m)
// ============================================================================
if (co('--buoc')) {
  const soBuoc = flag('--buoc');
  const mvp = flag('--mvp');
  const round = flag('--round') || null;
  const ghi = co('--ghi');
  if (!soBuoc || !/^\d+$/.test(soBuoc) || Number(soBuoc) > 10 || !mvp) {
    console.error('❌ Dùng: node Log/gate-check.cjs --buoc <0-10> --mvp <nn> [--round R<k>] [--ghi]');
    process.exit(1);
  }
  const tienTo = H.C.maTask.tienTo || 'MVP_';
  const reBuoc = new RegExp('^' + tienTo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + mvp + '\\.' + soBuoc + '[a-z]?\\.' + (round ? round + '\\.' : ''));
  console.log(`=== Phase Gate CẤP BƯỚC — MVP ${mvp}, Bước ${soBuoc}${round ? `, ${round}` : ''} ===`);
  console.log(`  Khớp mã task: ${tienTo}${mvp}.${soBuoc}[a-z?].${round ? round + '.' : ''}*`);

  const chan = [], canhBao = [];
  const gateLog = docGateLog();

  // ---------- (0) Round đã mở ----------
  let daMo = null;
  if (round && round !== 'R1') {
    gateLog.forEach((g) => { if (g.loai === 'mo-round' && String(g.mvp) === String(mvp) && String(g.round) === String(round)) daMo = g; });
    if (!daMo) {
      chan.push(`(0) ${round} CHƯA ĐƯỢC MỞ — không có bản ghi "mo-round". Chạy: node Log/gate-check.cjs --mo-round ${round} --mvp ${mvp} --ghi`);
      console.log(`\n(0) ⛔ ${round} chưa được mở.`);
    } else {
      const b = (daMo.buoc || []).find((x) => String(x.so) === String(soBuoc));
      console.log(`\n(0) ✅ ${round} đã mở${daMo.hoiTo ? ' (khai bù)' : ''} — Bước ${soBuoc} khai là: ${b ? b.trangThai : '(chưa khai)'}`);
      if (b && b.trangThai !== 'cham') canhBao.push(`(0) Bước ${soBuoc} được khai "${b.trangThai}" lúc mở ${round}. Đóng một Bước đã khai không chạm thì PHẢI tự soi: phạm vi Round đã đổi?`);
    }
  } else console.log('\n(0) — Round 1 ngầm định, không đòi bản ghi mở.');

  // ---------- Đọc task ----------
  const tasks = [];
  H.doc(H.tep('TASKLIST')).split(/\r?\n/).forEach((l) => {
    const m = /^\|\s*\*{0,2}`([^`]+)`/.exec(l);
    if (!m) return;
    const id = m[1];
    if (!reBuoc.test(id)) return;
    if (!round && /\.R\d+\./.test(id)) return;
    const cot = l.split('|');
    tasks.push({ id, trangThai: (cot[cot.length - 2] || '').trim() });
  });
  if (!tasks.length) {
    console.log(`\n⚠️  Không tìm thấy task nào khớp trong ${H.rel(H.tep('TASKLIST'))}.`);
    console.log('   Bước này CHƯA MỞ — không có gì để đóng. (Vào Bước là phải chẻ việc — PLAYBOOK §0.2.)');
    process.exit(2);
  }

  // ---------- (a) ----------
  const RE_GAC = /(gác lại|gac lai|để sau|de sau|ngoài phạm vi|ngoai pham vi|bỏ hẳn|đã BỎ|hoãn|ke-thua|kế thừa)/i;
  const dauO = (t) => (t || '').trim().replace(/^\*+/, '').trim();
  const laXong = (t) => dauO(t).startsWith('✅');
  const laTreoRo = (t) => /^(🔒|🔄|⏸️|⛔|⬜)/.test(dauO(t));
  const xong = tasks.filter((x) => laXong(x.trangThai));
  const gacLai = tasks.filter((x) => !laXong(x.trangThai) && !laTreoRo(x.trangThai) && RE_GAC.test(x.trangThai));
  const treo = tasks.filter((x) => !laXong(x.trangThai) && (laTreoRo(x.trangThai) || !RE_GAC.test(x.trangThai)));
  console.log(`\n(a) Task cấp 3: ${tasks.length} tổng · ${xong.length} ✅ · ${gacLai.length} gác lại có lý do · ${treo.length} còn treo`);
  if (treo.length) {
    chan.push(`(a) ${treo.length} task chưa ✅ và KHÔNG ghi lý do gác lại.`);
    treo.slice(0, 8).forEach((x) => console.log(`     - ${x.id} → ${x.trangThai.slice(0, 90)}`));
  } else console.log('    ✅ Không còn task treo.');

  // ---------- (b) bằng chứng chạy thật — NĂM LOẠI ----------
  const KHUON = {
    'http': [/HTTP\s*\d{3}/i, 'mã HTTP đo được từ một lần chạy thật'],
    'sql': [/(PRAGMA\s|IntegrityError|constraint failed|rowcount|sqlite3\.|UNIQUE|FOREIGN KEY)/i, 'kết quả câu lệnh SQL chạy thật'],
    'ma-thoat': [/(ma thoat|mã thoát)\s*:?\s*-?\d/i, 'mã thoát của một cổng/lệnh đã chạy'],
    'doi-chieu-tep': [/(requirements|package\.json|git ls-files|git log|KHONG CO|KHÔNG CÓ)/i, 'đối chiếu tệp / kho mã'],
    'nguoi-quyet': [new RegExp(`(nguyen van|nguyên văn|${CHU} chot|${CHU} chốt|${CHU} quyết)`, 'i'), 'nguyên văn quyết định của người'],
  };
  const coProof = new Set(), loaiCua = new Map(), khaiHong = [];
  H.ndjson(H.tep('PROOF_LOG')).forEach((ev) => {
    if (!ev.taskId) return;
    const noi = String(ev.output || '');
    if (/HTTP\s*\d{3}/i.test(noi)) { coProof.add(ev.taskId); loaiCua.set(ev.taskId, 'http'); return; }
    const loai = ev.loaiBangChung;
    if (!loai) return;
    if (!KHUON[loai]) { khaiHong.push(`${ev.taskId}: loaiBangChung="${loai}" không có trong danh sách`); return; }
    if (!ev.lyDoKhongHttp || String(ev.lyDoKhongHttp).trim().length < 30) { khaiHong.push(`${ev.taskId}: khai loại "${loai}" nhưng thiếu "lyDoKhongHttp" (≥30 ký tự)`); return; }
    if (!KHUON[loai][0].test(noi)) { khaiHong.push(`${ev.taskId}: khai loại "${loai}" nhưng nội dung không chứa dấu hiệu của ${KHUON[loai][1]}`); return; }
    coProof.add(ev.taskId); loaiCua.set(ev.taskId, loai);
  });
  if (khaiHong.length) { chan.push(`(b) ${khaiHong.length} dòng bằng chứng khai loại KHÁC http nhưng khai KHÔNG HỢP LỆ.`); khaiHong.forEach((x) => console.log(`     🔴 ${x}`)); }
  const laBuild = (id) => /\.BUILD\./i.test(id);
  const buildThieu = xong.filter((x) => laBuild(x.id) && !coProof.has(x.id));
  const khacThieu = xong.filter((x) => !laBuild(x.id) && !coProof.has(x.id));
  console.log(`\n(b) Bằng chứng chạy thật: ${xong.filter((x) => coProof.has(x.id)).length}/${xong.length} task ✅ có bằng chứng`);
  if (buildThieu.length) { chan.push(`(b) ${buildThieu.length} task .BUILD. đã ✅ nhưng KHÔNG có bằng chứng trong ${H.rel(H.tep('PROOF_LOG'))}.`); buildThieu.forEach((x) => console.log(`     - ${x.id}`)); }
  else console.log('    ✅ Mọi task .BUILD. đã ✅ đều có bằng chứng.');
  if (khacThieu.length) canhBao.push(`(b) ${khacThieu.length} task ✅ không mang ".BUILD." và không có bằng chứng — cổng KHÔNG tự biết chúng có sinh mã chạy được không, PHẢI tự soi: ${khacThieu.map((x) => x.id).join(', ')}`);

  // ---------- (c) c2 ----------
  { const r = chayLay(`node ${TOOL('kiem-c2-staged.cjs')}`);
    if (r.ma === 0) console.log('\n(c) ✅ c2 (staged): qua.');
    else if (r.ma === 2) chan.push('(c) c2 (staged): thiếu tài liệu liên quan trong cùng change set.');
    else canhBao.push(`(c) c2 (staged) thoát mã ${r.ma} — kiểm tay, không tự đoán.`); }

  // ---------- (d) telemetry ----------
  { const r = chayLay(`node ${TOOL('check-telemetry-gaps.cjs')}`);
    const dong = r.out.split(/\r?\n/).map((l) => l.trim());
    const thieu = xong.filter((x) => dong.includes(`- ${x.id}`));
    console.log(`\n(d) Telemetry: ${xong.length - thieu.length}/${xong.length} task ✅ đã có log`);
    if (r.ma === -1) canhBao.push('(d) Không chạy được check-telemetry-gaps.cjs — kiểm tay.');
    else if (thieu.length) chan.push(`(d) ${thieu.length} task ✅ chưa có dòng telemetry: ${thieu.map((x) => x.id).join(', ')}`);
    else console.log('    ✅ Không task nào thiếu log.'); }

  // ---------- (e) thứ tự ----------
  const khaiTrangThai = new Map();
  if (round) {
    const kr = H.docJson(path.join(thuKhaiRound, `${mvp}-${round}.json`), null);
    if (kr) (kr.buoc || []).forEach((b) => khaiTrangThai.set(String(b.so), String(b.trangThai || '')));
  }
  {
    const daDong = new Map();
    gateLog.forEach((g) => {
      if (['mo-round', 'xac-nhan-A+', 'dong-mvp'].includes(g.loai)) return;
      if (String(g.mvp) !== String(mvp) || String(g.round || 'R1') !== String(round || 'R1')) return;
      const k = String(g.buoc); const cu = daDong.get(k);
      if (!cu || String(g.dongLuc) > String(cu.dongLuc)) daDong.set(k, g);
    });
    const thieu = [], boQua = [];
    for (let t = 0; t < Number(soBuoc); t++) {
      const tt = khaiTrangThai.get(String(t));
      if (tt === 'khong-cham' || tt === 'ke-thua') { boQua.push(`${t}(${tt})`); continue; }
      const g = daDong.get(String(t));
      if (!g || g.ketQua !== 'qua') thieu.push(t);
    }
    if (boQua.length) { console.log(`\n(e) ⏭️  Bỏ qua ${boQua.length} Bước theo bảng khai ${round}: ${boQua.join(', ')}`); canhBao.push(`(e) ${boQua.length} Bước không đòi bản ghi đóng vì bảng khai ${round} tuyên bố không chạm / kế thừa: ${boQua.join(', ')} — phạm vi đã khai lúc MỞ Round, không phải việc đã làm.`); }
    if (thieu.length) { chan.push(`(e) THỨ TỰ: Bước ${thieu.join(', ')} chưa đóng — không được đóng Bước ${soBuoc} trước chúng.`); console.log(`\n(e) ⛔ Thứ tự: còn ${thieu.length} Bước phía trước chưa đóng — ${thieu.join(', ')}`); }
    else console.log(`\n(e) ✅ Thứ tự: mọi Bước trước ${soBuoc} đều đã đóng (hoặc khai không chạm).`);
  }

  // ---------- (f) bản khai cổng ----------
  let congKhai = null;
  const fCong = round ? path.join(thuCongBuoc, `${mvp}-${round}-B${soBuoc}.json`) : path.join(thuCongBuoc, `${mvp}-B${soBuoc}.json`);
  const CAN = ['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'R1', 'R2', 'R3', 'R5', 'R6', 'R7', 'R8'];
  if (!fs.existsSync(fCong)) {
    chan.push(`(f) THIẾU BẢN KHAI CỔNG: ${H.rel(fCong)}. Chép từ ${H.rel(path.join(thuCongBuoc, '_MAU.json'))}, khai 13 mục V1-V6 + R1,R2,R3,R5,R6,R7,R8.`);
    console.log(`\n(f) ⛔ Cổng vào/ra: thiếu ${H.rel(fCong)}`);
  } else {
    congKhai = H.docJson(fCong, null);
    if (!congKhai) { chan.push(`(f) Bản khai cổng ${H.rel(fCong)} không đọc được.`); console.log('\n(f) ⛔ file hỏng'); }
    else {
      const thieuMuc = CAN.filter((m) => !congKhai[m] || typeof congKhai[m].dat === 'undefined');
      const khongDat = CAN.filter((m) => congKhai[m] && congKhai[m].dat === false && !String(congKhai[m].lyDo || '').trim());
      if (thieuMuc.length) { chan.push(`(f) Bản khai THIẾU ${thieuMuc.length} mục: ${thieuMuc.join(', ')} — mỗi mục {dat, canCu}; dat:false bắt buộc lyDo.`); console.log(`\n(f) ⛔ thiếu ${thieuMuc.join(', ')}`); }
      else if (khongDat.length) { chan.push(`(f) Mục KHÔNG ĐẠT mà không ghi lý do: ${khongDat.join(', ')}.`); console.log(`\n(f) ⛔ ${khongDat.join(', ')} không đạt, chưa ghi lý do`); }
      else {
        const no = CAN.filter((m) => congKhai[m].dat === false);
        console.log(`\n(f) ✅ Bản khai đủ 13 mục` + (no.length ? ` — ${no.length} mục KHÔNG ĐẠT có lý do: ${no.join(', ')}` : '') + (congKhai._khaiBu ? ' · ⚠️ KHAI BÙ' : ''));
        if (no.length) canhBao.push(`(f) ${no.length} mục cổng không đạt nhưng có lý do — NỢ ĐÃ GHI, không phải việc đã làm: ${no.join(', ')}`);
      }
    }
  }

  // ---------- (g) R5 → V2 ----------
  {
    const soTruoc = Number(soBuoc) - 1;
    const ttTruoc = khaiTrangThai.get(String(soTruoc));
    if (soTruoc < 0) console.log('\n(g) — Bước 0 không có Bước trước.');
    else if (ttTruoc === 'khong-cham' || ttTruoc === 'ke-thua') console.log(`\n(g) — Bước ${soTruoc} khai "${ttTruoc}" ở ${round}, không có R5 để kế thừa.`);
    else {
      const fTruoc = round ? path.join(thuCongBuoc, `${mvp}-${round}-B${soTruoc}.json`) : path.join(thuCongBuoc, `${mvp}-B${soTruoc}.json`);
      const kt = H.docJson(fTruoc, {});
      const r5 = String(((kt || {}).R5 || {}).canCu || '');
      if (!r5.trim()) canhBao.push(`(g) Không đối chiếu được R5 của Bước ${soTruoc} — bản khai thiếu hoặc R5 rỗng. Vòng RTM KHÔNG được kiểm ở lần đóng này.`);
      else {
        const keThua = congKhai && congKhai.V2 && Array.isArray(congKhai.V2.keThua) ? congKhai.V2.keThua.filter((x) => String(x || '').trim()) : null;
        if (!keThua || !keThua.length) { chan.push(`(g) VÒNG RTM HỞ: Bước ${soTruoc} đã ghi R5, nhưng V2 của Bước ${soBuoc} không có mảng "keThua". Mỗi phần tử = MỘT ràng buộc mang sang (hoặc ghi rõ vì sao không mang gì).`); console.log(`\n(g) ⛔ V2 chưa khai "keThua" từ R5 của Bước ${soTruoc}`); }
        else {
          const tach = (s) => new Set(String(s).toLowerCase().replace(/[^a-zà-ỹ0-9_\-]+/gi, ' ').split(/\s+/).filter((w) => w.length >= 5));
          const a = tach(r5), chung = [...tach(keThua.join(' '))].filter((w) => a.has(w));
          console.log(`\n(g) ✅ Vòng RTM: V2 khai ${keThua.length} ràng buộc kế thừa · ${chung.length} từ khoá trùng với R5 Bước ${soTruoc}`);
          if (!chung.length) canhBao.push(`(g) "V2.keThua" có 0 từ khoá chung với R5 của Bước ${soTruoc} — hoặc diễn đạt lại hoàn toàn, hoặc chép sang chuyện khác. Máy không phân biệt được, phải tự đọc lại.`);
        }
      }
    }
  }

  // ---------- (h) R7 — bộ 7 chỉ số ----------
  {
    const r = chayLay(`node ${TOOL('doc-health.cjs')}`);
    const fDH = H.tep('DOC_HEALTH');
    if (r.ma === -1 || !fs.existsSync(fDH)) { chan.push('(h) R7: KHÔNG chạy được doc-health.cjs — bộ 7 chỉ số không đo được lúc đóng Bước. Fail-closed: không đo được = CHẶN.'); console.log('\n(h) ⛔ R7: doc-health không chạy được'); }
    else {
      const r7 = String(((congKhai || {}).R7 || {}).canCu || '');
      const thieuMa = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'].filter((c) => !r7.includes(c));
      if (thieuMa.length) { chan.push(`(h) R7 khai THIẾU ${thieuMa.length}/7 chỉ số: ${thieuMa.join(', ')}. Dán số thật của cả 7 vào R7.canCu; không đo được thì ghi rõ kèm lý do, không bịa.`); console.log(`\n(h) ⛔ R7: khai thiếu ${thieuMa.join(', ')}`); }
      else {
        const thu = H.P(H.C.thuMuc.log, H.C.tep.log.DOC_HEALTH_THEO_BUOC);
        try { fs.mkdirSync(thu, { recursive: true }); fs.copyFileSync(fDH, path.join(thu, `${mvp}-${round || 'R1'}-B${soBuoc}.json`)); } catch { /* lưu bản chụp hỏng không làm sập cổng */ }
        console.log(`\n(h) ✅ R7: doc-health chạy được, bản khai dẫn đủ 7 chỉ số · bản chụp lưu ${H.rel(thu)}/`);
      }
    }
  }

  // ---------- (i) R8 — đã đẩy git ----------
  {
    const gac = (H.C.thuMuc.gacGit || []).map((d) => `"${d}"`).join(' ');
    const bung = H.git(`status --porcelain -- ${gac}`);
    const doDang = bung.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const r8 = (congKhai || {}).R8 || {};
    const coNo = r8.dat === false && String(r8.lyDo || '').trim();
    if (doDang.length && coNo) { console.log(`\n(i) ⚠️  R8: ${doDang.length} file chưa commit, nhưng đã khai NỢ có lý do`); canhBao.push(`(i) R8 khai NỢ: "${r8.lyDo}". Còn ${doDang.length} file chưa vào commit: ${doDang.map((l) => l.replace(/^\S+\s+/, '')).join(', ')}. Bản ghi đóng trỏ tới trạng thái KHÔNG dựng lại được đầy đủ từ git.`); }
    else if (doDang.length) { chan.push(`(i) R8 CHƯA ĐẨY GIT: ${doDang.length} file trong ${(H.C.thuMuc.gacGit || []).join('·')} chưa vào commit. Chạy skill day-git (⛔ cấm gõ tay git commit). File của PHIÊN KHÁC thì không commit hộ — khai R8:{dat:false,lyDo}. File: ` + doDang.slice(0, 12).map((l) => l.replace(/^\S+\s+/, '')).join(', ') + (doDang.length > 12 ? ` … +${doDang.length - 12}` : '')); console.log(`\n(i) ⛔ R8: ${doDang.length} file chưa commit`); }
    else console.log('\n(i) ✅ R8: thư mục gác sạch — việc của Bước đã vào commit.');
  }

  // ---------- (j) sổ chờ quyết ----------
  {
    const r = chayLay(`node ${TOOL('cho-quyet.cjs')} --den-han --buoc ${soBuoc} --mvp ${mvp}${round ? ` --round ${round}` : ''}`);
    console.log(`\n(j) Điểm chờ ${CHU} quyết:`); process.stdout.write(r.out);
    if (r.ma === 2) chan.push(`(j) Có điểm CHỜ ${CHU} QUYẾT đến hạn mang cờ CHẶN — ${AI} KHÔNG được tự đóng: node Log/cho-quyet.cjs --da-quyet <id> "nguyên văn".`);
    else if (r.ma !== 0) canhBao.push(`(j) Không chạy được cho-quyet.cjs (mã ${r.ma}) — kiểm tay.`);
  }

  // ---------- (k) rtm-check ----------
  {
    const r = chayLay(`node ${TOOL('rtm-check.cjs')}`);
    if (r.ma === 0) { console.log('\n(k) ✅ rtm-check: PASS.'); if (/GAP/.test(r.out)) process.stdout.write(r.out); }
    else { console.log('\n(k) rtm-check:'); process.stdout.write(r.out); chan.push(`(k) rtm-check KHÔNG PASS (mã ${r.ma}) — story mồ côi, lệch số ca test, hoặc tệp test không được RTM nhắc. ⛔ ${AI} không sửa RTM cho chỉ số đẹp lên — trình danh sách thiếu, ${CHU} quyết.`); }
  }

  // ---------- (l) review theo chính sách ----------
  {
    const rp = H.C.reviewPolicy || {};
    const yeuCau = (rp.buoc && rp.buoc[String(soBuoc)]) || rp.macDinh || 'round-dau';
    const laRoundDau = !round || round === 'R1';
    const v4 = (congKhai || {}).V4 || {}, v6 = (congKhai || {}).V6 || {};
    const doiThietKe = v4.doiThietKe === true || v6.doiThietKe === true;
    let canDocLap = yeuCau === 'moi-round' || (yeuCau === 'round-dau' && (laRoundDau || doiThietKe));
    const r3 = (congKhai || {}).R3 || {};
    console.log(`\n(l) Review: chính sách Bước ${soBuoc} = "${yeuCau}" · ${laRoundDau ? 'Round đầu' : round}${doiThietKe ? ' · V4/V6 khai doiThietKe' : ''} ⇒ ${canDocLap ? 'PHẢI độc lập' : 'tự soi được'}`);
    if (canDocLap && congKhai) {
      const loi = [];
      if (r3.lopReview !== 'doc-lap') loi.push(`R3.lopReview phải là "doc-lap" (đang: "${r3.lopReview || '(trống)'}")`);
      if (!String(r3.nguoiReview || '').trim()) loi.push('thiếu R3.nguoiReview');
      if (!Array.isArray(r3.phatHien)) loi.push('R3.phatHien phải là MẢNG (0 phát hiện thì để [] và nói đã soi gì trong canCu)');
      if (String(r3.quyetDinh || '').trim().length < 20) loi.push(`R3.quyetDinh phải là NGUYÊN VĂN ${CHU} quyết (≥20 ký tự)`);
      if (loi.length) chan.push(`(l) REVIEW ĐỘC LẬP bắt buộc ở Bước này mà bản khai chưa đủ: ${loi.join(' · ')}. (REVIEW-POLICY.md)`);
      else console.log(`    ✅ R3 độc lập: ${r3.nguoiReview} · ${r3.phatHien.length} phát hiện · ${CHU} đã quyết.`);
    }
  }

  // ---------- (m) cổng RA riêng của Bước ----------
  {
    const ds = ((H.C.congRaRieng || {})[String(soBuoc)]) || [];
    if (!ds.length) console.log(`\n(m) — Bước ${soBuoc} không có cổng RA riêng trong harness.config.json.`);
    else ds.forEach((lenh) => {
      const r = chayLay(lenh);
      if (r.ma === 0) console.log(`\n(m) ✅ cổng riêng: ${lenh}`);
      else if (r.ma === 1 && /--cho-phep-chua-giao/.test(lenh)) { console.log(`\n(m) ⚠️ cổng riêng: ${lenh} — còn mục chưa giao (cảnh báo):`); process.stdout.write(r.out); canhBao.push(`(m) ${lenh}: còn mục tiêu chưa giao — phải nhìn thấy được ở mọi lần đóng Bước.`); }
      else { console.log(`\n(m) ⛔ cổng riêng ĐỎ (mã ${r.ma}): ${lenh}`); process.stdout.write(r.out); chan.push(`(m) Cổng RA riêng của Bước ${soBuoc} đỏ: ${lenh} (mã ${r.ma}).`); }
    });
  }

  // ---------- Kết luận ----------
  console.log('');
  canhBao.forEach((c) => console.log('⚠️  ' + c));
  if (chan.length) {
    console.log(`\n🛑 BƯỚC ${soBuoc} CHƯA ĐÓNG ĐƯỢC — ${chan.length} điều kiện chưa đạt:`);
    chan.forEach((c) => console.log('   - ' + c));
    const NGHIA = {
      '(0)': 'Round có bản ghi "mo-round" trong PHASE-GATE-LOG, bảng khai đủ 11 Bước kèm việc.',
      '(a)': 'MỌI task cấp 3 của Bước hoặc bắt đầu bằng ✅, hoặc GHI RÕ lý do gác lại. "Chưa làm" và "cố ý không làm" là hai thứ khác nhau.',
      '(b)': 'Mỗi task .BUILD. đã ✅ có dòng trong PROOF-LOG đúng một trong năm loại bằng chứng (PHASEGATE §6). Không gõ tay con số vào.',
      '(c)': 'node Log/kiem-c2-staged.cjs thoát 0 — tài liệu RTM nói là liên quan đã nằm trong cùng change set.',
      '(d)': 'Mỗi task ✅ có dòng **[mã]** trong TELEMETRY.',
      '(e)': 'Mọi Bước trước có bản ghi đóng "qua" — trừ Bước mà bảng khai Round tuyên bố khong-cham/ke-thua.',
      '(f)': 'Có file cong-buoc/<mvp>[-<round>]-B<n>.json khai đủ 13 mục; mỗi mục {dat, canCu}; dat:false thì bắt buộc lyDo.',
      '(g)': 'V2.keThua là mảng không rỗng, mỗi phần tử là MỘT ràng buộc từ R5 Bước trước. Máy chỉ kiểm có/không và từ khoá — không phân biệt kế thừa thật với chép cho có.',
      '(h)': 'node Log/doc-health.cjs chạy được, VÀ R7.canCu dẫn số thật đủ 7 mã c1..c7 (không đo được thì ghi rõ kèm lý do).',
      '(i)': 'git status trên thư mục gác rỗng. File của PHIÊN KHÁC thì không commit hộ — khai R8:{dat:false, lyDo}.',
      '(j)': `Mọi điểm chờ quyết đến hạn mang cờ chặn đã được ${CHU} quyết bằng nguyên văn. ${AI} không tự đóng.`,
      '(k)': `node Log/rtm-check.cjs thoát 0. ${AI} KHÔNG sửa RTM cho chỉ số đẹp lên — trình danh sách, ${CHU} quyết.`,
      '(l)': `R3.lopReview = "doc-lap", có nguoiReview, phatHien là mảng, quyetDinh là nguyên văn ${CHU}. Xem REVIEW-POLICY.md.`,
      '(m)': 'Mọi lệnh trong harness.config.json › congRaRieng[<n>] thoát 0. Sửa GỐC chỗ cổng kêu, không sửa sổ cho cổng xanh.',
    };
    console.log('\n📋 XONG NGHĨA LÀ GÌ — tiêu chí đạt của từng điều kiện đang chặn:');
    const daIn = new Set();
    chan.forEach((c) => { const m = String(c).match(/^\((\w)\)/); const k = m ? `(${m[1]})` : null; if (k && NGHIA[k] && !daIn.has(k)) { daIn.add(k); console.log(`   ${k} ${NGHIA[k]}`); } });
    console.log('\n   ⚠️ Cổng này chỉ kiểm KẾ TOÁN. Qua đủ 13 điều kiện KHÔNG có nghĩa Bước ĐẠT —');
    console.log('      còn phải đối chiếu "Done khi" của Bước đó trong PLAYBOOK.md.');
    if (ghi) console.log('\n   (KHÔNG ghi bản ghi đóng — không lưu một lần đóng không có thật.)');
    process.exit(2);
  }
  console.log(`\n✅ BƯỚC ${soBuoc} ĐỦ 13 ĐIỀU KIỆN MÁY. Còn phải đối chiếu "Done khi" (PLAYBOOK.md) trước khi coi là ĐẠT.`);
  if (ghi) {
    ghiGateLog({ mvp, buoc: soBuoc, round: round || 'R1', ketQua: 'qua', soTask: tasks.length, soXong: xong.length, soGacLai: gacLai.length, soCoBangChung: xong.filter((x) => coProof.has(x.id)).length, canhBao, taskIds: tasks.map((x) => x.id), dongLuc: new Date().toISOString() });
    console.log(`   📝 Đã ghi bản ghi đóng Bước vào ${H.rel(fGateLog)}`);
  } else console.log('   (Thêm --ghi để lưu bản ghi đóng Bước.)');
  process.exit(0);
}

// ============================================================================
// CỔNG CẤP TASK — dây cương · telemetry · doc-health (so snapshot) · c2 · chạy được thật
// ============================================================================
const taskId = args[0];
if (!taskId || taskId.startsWith('--')) {
  console.error('❌ Thiếu taskId. Xem cách dùng ở đầu tệp.');
  process.exit(1);
}
const deliverable = flag('--deliverable');
const huynhXacNhan = flag('--huynh-xac-nhan');
const nguonXacNhan = flag('--nguon-xac-nhan') || 'huynh-tu-chay';
const trichLoi = flag('--trich-loi-huynh');
const beforePath = flag('--before');
const muc = flag('--muc');
const reviewCuoi = co('--che-do-review-cuoi');
const failed = [], canXacNhanSau = [];

// Bảng dây cương — ĐỌC THẲNG từ LEASH-BANG.json. Fail-closed: đọc không được thì CHẶN,
// không rơi về bảng mặc định — bảng mặc định lặng lẽ là đúng thứ khiến A+ thành A mà không ai kêu.
const LEASH = (() => {
  const j = H.docJson(H.tep('LEASH'), null);
  if (!j || !j.muc || !Object.keys(j.muc).length) {
    console.error(`🛑 KHÔNG ĐỌC ĐƯỢC BẢNG DÂY CƯƠNG (${H.rel(H.tep('LEASH'))}) hoặc bảng rỗng. Không suy đoán mức tự hành — dừng.`);
    process.exit(2);
  }
  const b = {}; for (const [ma, o] of Object.entries(j.muc)) b[ma] = o.leash; return b;
})();
if (muc) {
  const leash = LEASH[muc];
  if (!leash) console.log(`⚠️  Mục "${muc}" không có trong bảng dây cương — đối chiếu tay LEASH-BANG.json trước khi đi tiếp (không đoán).`);
  else if (leash === 'A+' && !huynhXacNhan && reviewCuoi) { canXacNhanSau.push(`${taskId} (mục ${muc}, A+) — xây xong trong chế độ review-cuối, CHƯA có xác nhận ${CHU}. Chỉ đánh 🔒.`); console.log(`⚠️  Leash A+ (mục ${muc}) — chế độ review-cuối: CHO QUA cổng, nhưng "${taskId}" chỉ được đánh 🔒 chờ ${CHU}.`); }
  else if (leash === 'A+' && !huynhXacNhan) failed.push(`Leash: mục "${muc}" = A+ — bắt buộc cờ --huynh-xac-nhan <YYYY-MM-DD>, đang thiếu. ⛔ ${AI} KHÔNG được tự cắm cờ này.`);
  else if (leash === 'A+') {
    console.log(`✅ Leash A+ (mục ${muc}) — có xác nhận ${CHU}: ${huynhXacNhan}`);
    ghiGateLog({ loai: 'xac-nhan-A+', taskId, muc, leash, ngayHuynhXacNhan: huynhXacNhan, nguon: nguonXacNhan, trichLoiHuynh: trichLoi || null, luc: new Date().toISOString() });
    console.log(`   📝 Đã ghi bản ghi XÁC NHẬN A+ (nguồn: ${nguonXacNhan}).` + (nguonXacNhan !== 'huynh-tu-chay' ? ` ⚠️ Nguồn không phải ${CHU} tự chạy — ${AI} ghi hộ, đọc đúng mức độ đó.` : ''));
    console.log('   ⚠️ Bản ghi này KHÔNG chống giả mạo — nó chuyển "không dấu vết" thành "có dấu vết", không phải chữ ký.');
  } else console.log(`✅ Leash A (mục ${muc}) — tự chạy được.`);
} else console.log('⚠️  Không truyền --muc — bỏ qua lớp dây cương (không suy đoán mục nào).');

// Telemetry
{ const r = chayLay(`node ${TOOL('check-telemetry-gaps.cjs')}`);
  if (r.out.split(/\r?\n/).some((l) => l.trim() === `- ${taskId}`)) failed.push(`Telemetry: "${taskId}" nằm trong danh sách THIẾU LOG.`);
  else console.log(`✅ Telemetry: "${taskId}" không nằm trong danh sách thiếu log.`); }

// Doc-health so snapshot
if (beforePath) {
  const before = H.docJson(beforePath, null), after = H.docJson(H.tep('DOC_HEALTH'), null);
  if (!before) failed.push(`Doc-health: không đọc được snapshot --before "${beforePath}".`);
  else if (!after) failed.push('Doc-health: chưa có DOC-HEALTH.json — chạy node Log/doc-health.cjs trước.');
  else {
    const truoc = failed.length;
    ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'].forEach((c) => {
      const b = before[c] && typeof before[c].tiLe === 'number' ? before[c].tiLe : null;
      const a = after[c] && typeof after[c].tiLe === 'number' ? after[c].tiLe : null;
      if (b !== null && a !== null && a < b) failed.push(`Doc-health: ${c} tụt từ ${b}% xuống ${a}% — không tự cho qua, cần giải thích lý do.`);
    });
    if (failed.length === truoc) console.log('✅ Doc-health: không chỉ số nào tụt so với snapshot --before.');
  }
} else console.log('⚠️  Doc-health: không có --before, bỏ qua lớp này.');

// c2 staged
{ const r = chayLay(`node ${TOOL('kiem-c2-staged.cjs')}`);
  if (r.ma === 0) console.log('✅ c2 (staged): qua (đạt / không chạm mã / không tra được).');
  else if (r.ma === 2) failed.push('c2 (staged): THIẾU tài liệu liên quan — không tự giải thích cho qua; sửa tài liệu THẬT hoặc dừng hỏi ' + CHU + '.');
  else console.log(`⚠️  c2 (staged) thoát mã ${r.ma} — kiểm tay.`); }

// Chạy được thật
if (deliverable === 'BUILD') {
  const co = H.ndjson(H.tep('PROOF_LOG')).some((ev) => ev.taskId === taskId && (/HTTP\s*\d{3}/.test(ev.output || '') || (ev.loaiBangChung && ev.lyDoKhongHttp && String(ev.lyDoKhongHttp).length >= 30)));
  if (!co) failed.push(`Chạy được thật: "${taskId}" (BUILD) chưa có dòng bằng chứng hợp lệ trong ${H.rel(H.tep('PROOF_LOG'))} — KHÔNG được đánh ✅.`);
  else console.log(`✅ Chạy được thật: "${taskId}" có bằng chứng.`);
}

console.log('');
if (canXacNhanSau.length) { console.log(`🔒 CẦN ${CHU} XÁC NHẬN (chế độ review-cuối):`); canXacNhanSau.forEach((x) => console.log('   -', x)); }
if (failed.length) { console.log(`🛑 GATE CHẶN — ${failed.length} lớp chưa qua:`); failed.forEach((f) => console.log('   -', f)); process.exit(2); }
console.log(canXacNhanSau.length ? `✅ GATE QUA (có điều kiện) — "${taskId}" chỉ đánh 🔒, KHÔNG đánh ✅.` : `✅ GATE QUA — "${taskId}" đủ điều kiện đánh dấu xong.`);
process.exit(0);
