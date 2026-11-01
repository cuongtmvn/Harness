#!/usr/bin/env node
'use strict';
/*
 * doc-health.cjs — đo 7 CHỈ SỐ SỨC KHOẺ TÀI LIỆU (c1…c7), ghi ra JSON để dashboard/cổng đọc.
 *
 * VÌ SAO CÓ CÔNG CỤ NÀY
 *   Bộ tài liệu không tự nói nó đã trôi khỏi mã nguồn. Ba lỗ (truy vết mất, quyết định chỉ
 *   tồn tại trong lịch sử chat, cơ chế chết trong mã) đều từng được tìm ra DO MAY, không do cơ
 *   chế. Bộ chỉ số này biến "tình cờ phát hiện" thành "đo được định kỳ". Chạy bằng Node (không
 *   chạy trong trình duyệt) vì `c2` bắt buộc đọc lịch sử git.
 *
 * LUẬT ĐO (không nới)
 *   1. Mọi tỉ lệ PHẢI kèm khoảng tin cậy Wilson 95%. Cấm công bố tỉ lệ trần.
 *   2. Mẫu nhỏ (n < 10) phải tự báo "mẫu quá nhỏ": 100% của n=3 không phân biệt được với 50%.
 *   3. Chỉ số không đo được ⇒ ghi `null` + lý do. Tuyệt đối không bịa số cho đủ 7/7.
 *   4. Ô truy vết phải TRỎ TỚI THỨ CÓ THẬT — một ô ghi tên tệp đã bị xoá vẫn làm chỉ số đẹp lên.
 *   5. Chỉ số đo LỊCH SỬ (c2, c6) không đo ngược được — chuẩn bị trước khi thay đổi xảy ra.
 *
 * ⚠️ Giới hạn khai thẳng
 *   - c3 chỉ đếm điểm lệch ĐÃ ĐƯỢC GHI NHẬN; điểm lệch chưa ai phát hiện thì không đếm được.
 *   - c4 chiều ngược chỉ đo được khi `docHealth.c4.ngonNgu` là ngôn ngữ công cụ hiểu (python);
 *     ngôn ngữ khác thì khai "không đo được bằng máy", không bịa.
 *   - c5 đếm PHÁT HIỆN, không đếm LƯỢT: "đã review mà không tìm ra gì" là bằng chứng đã mở tệp,
 *     không phải bằng chứng review.
 *   - c7 là phép đo HÀNH VI — công cụ này CHỈ ĐỌC LẠI kết quả đã chạy thật, không tự chấm.
 *
 * Chạy: node Log/doc-health.cjs
 * Ra:   tệp `DOC_HEALTH` trong thư mục log (+ báo cáo ra màn hình). Mã thoát 0 (đo xong) · 2 (thiếu config).
 */
const H = require('./_harness-config.cjs');
const { fs, path } = H;

const THU_MUC_OUTPUT = H.P(H.C.thuMuc.output);
const THU_MUC_APP = H.P(H.C.thuMuc.app);
const THU_MUC_TESTS = H.P(H.C.thuMuc.tests);
const RE_STORY = H.re(H.C.ma.story) || /US-\d+/;
const RE_QD = H.re(H.C.ma.quyetDinh, 'g');
const RE_RUIRO = H.re(H.C.ma.ruiRo);
const RE_TEST_FILE = new RegExp('(?:^|[^\\w])(' + H.C.kiemThu.tienToTepTest.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  + '[\\w-]+' + H.C.kiemThu.duoiTepTest.replace(/\./g, '\\.') + ')', 'g');
const NGUONG_CAO = H.C.docHealth.nguongRuiRoCao;
const MO_COI = /mồ côi/;
const MO_COI_CHAP_NHAN = /mồ côi\s*—\s*chấp nhận|Đã đóng|xác nhận/;

// --- Wilson 95% ---------------------------------------------------------------
// Dùng Wilson chứ KHÔNG dùng sai số chuẩn thông thường: với k=n (100%) hay k=0,
// công thức thông thường cho khoảng rộng bằng 0 — tức nói dối rằng ta chắc chắn.
function wilson(k, n, z = 1.96) {
  if (!n) return null;
  const p = k / n, d = 1 + z * z / n;
  const tam = p + z * z / (2 * n);
  const bien = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n));
  return [Math.max(0, (tam - bien) / d), Math.min(1, (tam + bien) / d)];
}
const pc = (x) => (x == null ? null : +(x * 100).toFixed(1));
function tiLe(k, n, ghiChu = '') {
  const w = wilson(k, n);
  return {
    tuSo: k, mauSo: n,
    tiLe: n ? pc(k / n) : null,
    khoangTinCay: w ? [pc(w[0]), pc(w[1])] : null,
    mauQuaNho: n > 0 && n < 10,
    chuaCoDuLieu: n === 0 ? true : undefined,
    ghiChu: ghiChu || undefined,
  };
}

// --- Đọc RTM ------------------------------------------------------------------
// Cột sau split('|'): [1]=# · [2]=Nguồn · [3]=Nội dung · [4]=Story · [5]=Trạng thái ·
//                     [6]=Code/Test · [7]=UAT/SIT · [8]=Work item
function parseRtmDong(noiDung) {
  return noiDung.split(/\r?\n/)
    .filter((l) => /^\|\s*\d+[a-z]?\s*\|/.test(l.trim()))
    .map((l) => {
      const c = l.trim().split('|');
      return {
        so: (c[1] || '').trim(), nguon: (c[2] || '').trim(), story: (c[4] || '').trim(),
        trangThai: (c[5] || '').trim(), testCode: (c[6] || '').trim(), uat: (c[7] || '').trim(),
        workItem: (c[8] || '').trim(), tho: l,
      };
    });
}
const RTM_REL = H.rel(H.tep('RTM'));
const rtmNoiDung = H.doc(H.tep('RTM'));
const rtmDong = parseRtmDong(rtmNoiDung);
const coWorkItemThat = (wi) => !!wi && !wi.startsWith('⬜') && !wi.startsWith('—');

// Tệp test và tệp nguồn CÓ THẬT trên đĩa — bằng chứng, không phải lời khai.
const fileTest = (() => {
  try {
    return fs.readdirSync(THU_MUC_TESTS)
      .filter((f) => f.startsWith(H.C.kiemThu.tienToTepTest) && f.endsWith(H.C.kiemThu.duoiTepTest));
  } catch { return []; }
})();
const fileNguon = (() => {
  const ra = [];
  const quet = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      const r = H.rel(p);
      if ((H.C.maCode.boQua || []).some((b) => (r + '/').includes(b))) continue;
      if (e.isDirectory()) quet(p);
      else if (H.laMaCode(r)) ra.push(path.relative(THU_MUC_APP, p).replace(/\\/g, '/'));
    }
  };
  try { quet(THU_MUC_APP); } catch { /* chưa có thư mục mã */ }
  return ra;
})();
const tenFileThat = new Set([...fileTest, ...fileNguon.map((f) => path.basename(f))]);
// Một ô Code/Test CÓ BẰNG CHỨNG khi nó nhắc tới một tệp CÓ THẬT. Ghi mã kế hoạch (WBS)
// hay tên tệp đã xoá thì KHÔNG tính — đúng bẫy c1.
function coBangChung(o) {
  if (!o) return false;
  for (const t of tenFileThat) if (o.includes(t)) return true;
  return false;
}
// Ô bắt đầu bằng `—` / `⬜` là KHAI chưa build (hợp lệ) — không phải ô trỏ tới thứ không có thật.
const oCoGhiMaKhongThat = (o) => !!o && !/^[—⬜-]/.test(o) && !coBangChung(o);

// =============================================================================
// c1 — Traceability coverage
// =============================================================================
// Mẫu số = hàng ĐÃ BUILD (có bằng chứng trỏ tới mã/test có thật), KHÔNG phải mọi hàng.
// Dự án cuốn chiếu: hàng chưa tới lượt build sẽ luôn kéo chỉ số xuống và số ra đánh lừa.
// Tử số bắt buộc CẢ BA mắt xích: Story + Work item thật + Code/Test.
const c1_coBC = rtmDong.filter((r) => coBangChung(r.testCode));
const c1_khongThat = rtmDong.filter((r) => oCoGhiMaKhongThat(r.testCode));
const c1_coStory = c1_coBC.filter((r) => RE_STORY.test(r.story) && !MO_COI.test(r.story) && coWorkItemThat(r.workItem));
const c1_thieuWorkItem = c1_coBC.filter((r) => RE_STORY.test(r.story) && !MO_COI.test(r.story) && !coWorkItemThat(r.workItem));
const c1 = {
  ten: 'Traceability coverage',
  ...tiLe(c1_coStory.length, c1_coBC.length,
    'Mẫu số = hàng có bằng chứng trỏ tới tệp CÓ THẬT trên đĩa. Tử số bắt buộc CẢ BA: Story + Work item thật + Code/Test. '
    + 'Đã loại ' + (rtmDong.length - c1_coBC.length) + '/' + rtmDong.length + ' hàng chưa build.'),
  tongHangRTM: rtmDong.length,
  hangBiLoai: rtmDong.length - c1_coBC.length,
  hangOGhiThuKhongCoThat: c1_khongThat.map((r) => ({ dong: r.so, o: r.testCode.slice(0, 60) })),
  hangThieuWorkItem: c1_thieuWorkItem.map((r) => r.so),
  tiLeTho: rtmDong.length ? pc(c1_coStory.length / rtmDong.length) : null,
};

// =============================================================================
// c2 — Change coupling (git)
// =============================================================================
// "Liên quan" KHÔNG do AI tự đặt danh sách — tra từ chính RTM:
//     tệp mã đổi → dòng RTM có tệp đó ở cột Code/Test
//        → RTM  (chính dòng đó phải cập nhật)
//        → SPEC (nếu cột Story có mã story)
//        → ARCH (nếu cột Nguồn có mã quyết định)
// BA phán quyết: coupled · thiếu · không-tra-được (không dòng RTM nào trỏ tới ⇒ KHÔNG tính
// vào mẫu số — đó là lỗ c4 mồ côi ngược, không phải trượt c2. Gộp vào trượt là chẩn đoán sai bệnh).
// ⚠️ Chấm commit CŨ phải dùng RTM TẠI THỜI ĐIỂM commit đó (git show <hash>:RTM), không dùng bản
// hiện hành — nếu không là đo NGƯỢC (dùng dữ liệu tương lai đo lại quá khứ).
// ⚠️ Luật này cài ở HAI nơi (đây và kiem-c2-staged.cjs). Sửa một bên PHẢI sửa bên kia —
//    đối chiếu bằng `node Log/kiem-c2-staged.cjs --tu-kiem`.
const SPEC_REL = H.rel(H.tep('SPEC'));
const ARCH_REL = H.rel(H.tep('ARCH'));
function taiLieuLienQuan(f, hangRtm) {
  const short = f.replace(new RegExp('^' + H.C.thuMuc.app + '/'), ''), base = f.split('/').pop();
  const hit = hangRtm.filter((r) => r.testCode && (r.testCode.includes(short) || r.testCode.includes(base)));
  const docs = new Set();
  for (const r of hit) {
    docs.add(RTM_REL);
    if (RE_STORY.test(r.story)) docs.add(SPEC_REL);
    if (RE_QD && new RegExp(RE_QD.source).test(r.nguon)) docs.add(ARCH_REL);
  }
  return { hit, docs };
}

let c2;
{
  const LOAI_TRU = H.C.docHealth.c2LoaiTru || [];
  const laGit = H.git('rev-parse --is-inside-work-tree').trim() === 'true';
  const hashes = laGit ? H.git('log --format=%H').trim().split(/\r?\n/).filter(Boolean) : [];
  if (!laGit) {
    c2 = { ten: 'Change coupling', tiLe: null, chuaCoDuLieu: true, lyDo: 'Thư mục dự án chưa phải kho git — c2 đo lịch sử commit, không có lịch sử thì không đo được.' };
  } else if (!hashes.length) {
    c2 = { ten: 'Change coupling', tiLe: null, chuaCoDuLieu: true, lyDo: 'Kho git chưa có commit nào.' };
  } else {
    let chamMa = 0, chamCa = 0;
    const bo = [], khongTraDuoc = [], commitThieu = [];
    for (const h of hashes) {
      const files = H.git(`show --stat --name-only --format="" ${h}`).split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
      const ma = files.filter(H.laMaCode);
      if (!ma.length) continue;
      if (LOAI_TRU.some((x) => h.startsWith(x))) { bo.push(h.slice(0, 7)); continue; }
      const rtmLucDo = H.git(`show ${h}:${RTM_REL}`);          // '' nếu RTM chưa tồn tại lúc đó
      const hangRtmLucDo = parseRtmDong(rtmLucDo);
      const can = new Set(); let soMoCoi = 0;
      for (const f of ma) {
        const { hit, docs } = taiLieuLienQuan(f, hangRtmLucDo);
        if (!hit.length) { soMoCoi++; continue; }
        docs.forEach((d) => can.add(d));
      }
      if (!can.size) { khongTraDuoc.push({ commit: h.slice(0, 7), soFileMa: ma.length }); continue; }
      chamMa++;
      const thieu = [...can].filter((d) => !files.includes(d));
      if (!thieu.length) chamCa++;
      else commitThieu.push({ commit: h.slice(0, 7), thieu, soFileKhongTraDuoc: soMoCoi });
    }
    c2 = {
      ten: 'Change coupling',
      ...tiLe(chamCa, chamMa,
        'Tài liệu "liên quan" tra từ RTM (cột Code/Test → Story/Nguồn), KHÔNG đếm bất kỳ .md nào. '
        + 'Đã loại ' + bo.length + ' commit theo config (' + bo.join(', ') + ') và '
        + khongTraDuoc.length + ' commit không tra được dòng RTM nào.'),
      commitBiLoai: bo,
      commitKhongTraDuoc: khongTraDuoc,
      commitThieuTaiLieu: commitThieu,
      // Độ nhạy: công bố kèm "nếu bỏ điều kiện ARCH" để thấy kết quả không phụ thuộc một lựa chọn duy nhất.
      tiLeNeuBoDieuKienARCH: chamMa
        ? pc((chamCa + commitThieu.filter((x) => x.thieu.length === 1 && x.thieu[0] === ARCH_REL).length) / chamMa)
        : null,
      canhBao: 'KHÔNG đo ngược được: chỉ nói về giai đoạn mã đã nằm trong git. '
        + khongTraDuoc.length + ' commit bị loại khỏi mẫu số vì không dòng RTM nào trỏ tới tệp mã của nó — đó là lỗ c4 (mồ côi ngược), không phải trượt c2.',
    };
  }
}

// =============================================================================
// c3 — Freshness: TỒN KHO điểm lệch đã ghi nhận (không phải tốc độ sửa)
// =============================================================================
// Đếm theo CẶP gạch bỏ `~~…~~` (1 cặp = 1 điểm) và các nhãn đính chính. Giữ ở dạng tồn kho
// THÔ: đã thử tự phân loại "đã đóng / còn mở" bằng regex và bỏ — không đáng tin.
const MAU_LECH = /đính chính|ĐÍNH CHÍNH|đã bị huỷ|ĐÃ BỊ HUỶ|không còn hiệu lực|~~[^~]+~~/g;
const fileTaiLieu = (() => {
  try { return fs.readdirSync(THU_MUC_OUTPUT).filter((f) => f.endsWith('.md')); } catch { return []; }
})();
const c3_theoFile = fileTaiLieu.map((f) => ({ file: f, soChoLech: (H.doc(path.join(THU_MUC_OUTPUT, f)).match(MAU_LECH) || []).length }))
  .filter((x) => x.soChoLech > 0).sort((a, b) => b.soChoLech - a.soChoLech);
const c3 = {
  ten: 'Freshness — tồn kho tài liệu đang/đã ghi nhận lệch (thô, chưa phân loại mở/đóng)',
  soChoLechDaBiet: c3_theoFile.reduce((t, x) => t + x.soChoLech, 0),
  soFileCoChoLech: c3_theoFile.length,
  tongFile: fileTaiLieu.length,
  chuaCoDuLieu: fileTaiLieu.length === 0 ? true : undefined,
  theoFile: c3_theoFile.slice(0, 8),
  khongDoDuoc: 'Điểm lệch CHƯA TỪNG được phát hiện/ghi nhận — theo định nghĩa không đếm được thứ chưa biết nó tồn tại. "Thời gian tồn tại trước khi sửa" (tốc độ) cũng không đo được vì dữ liệu không ghi mốc bắt đầu lệch.',
  doiChieu: 'Phải đọc kèm c1/c2: bộ tài liệu KHÔNG có dòng đính chính nào có thể là rất tươi, hoặc CHƯA AI TỪNG KIỂM. Con số này là CẬN TRÊN của số sự kiện lệch (một sự kiện có thể bị đếm nhiều lần nếu được trích dẫn lại nhiều chỗ).',
};

// =============================================================================
// c4 — Orphan rate (hai chiều)
// =============================================================================
const c4_xuoi = rtmDong.filter((r) => MO_COI.test(r.tho) && !MO_COI_CHAP_NHAN.test(r.tho));

// Chiều ngược = CƠ CHẾ CHẾT: module tồn tại trong mã nhưng KHÔNG đường nào từ điểm vào chạy tới.
// Đo bằng đồ thị import — chỉ làm được với ngôn ngữ công cụ hiểu. Ngôn ngữ khác: khai không đo được.
const DIEM_VAO = (H.C.docHealth.c4 && H.C.docHealth.c4.diemVao) || [];
const NGON_NGU_C4 = (H.C.docHealth.c4 && H.C.docHealth.c4.ngonNgu) || 'none';
const TESTS_REL_APP = path.relative(THU_MUC_APP, THU_MUC_TESTS).replace(/\\/g, '/');
let c4;
if (NGON_NGU_C4 === 'python') {
  const filePy = fileNguon.filter((f) => f.endsWith('.py'));
  function nhapKhauCua(f) {
    let n; try { n = fs.readFileSync(path.join(THU_MUC_APP, f), 'utf8'); } catch { return []; }
    const ra = new Set();
    const them = (duong) => { for (const ung of [duong + '.py', duong + '/__init__.py']) if (filePy.includes(ung)) ra.add(ung); };
    const thuMuc = path.dirname(f) === '.' ? '' : path.dirname(f) + '/';
    // `from PKG import a, b` → PKG.py, PKG/__init__.py, VÀ PKG/a.py, PKG/b.py (bỏ vế sau thì
    // route nằm trong gói sẽ bị chấm nhầm là cơ chế chết — số ra vô lý thì nghi DỤNG CỤ trước).
    for (const m of n.matchAll(/^\s*from\s+(\.?)([a-zA-Z_][\w.]*)\s+import\s+([^\n#]+)/gm)) {
      const goc = (m[1] ? thuMuc : '') + m[2].replace(/\./g, '/');
      them(goc);
      for (const ten of m[3].split(',')) {
        const t = ten.trim().split(/\s+as\s+/)[0].trim().replace(/[()]/g, '');
        if (/^[a-zA-Z_]\w*$/.test(t)) them(goc + '/' + t);
      }
    }
    for (const m of n.matchAll(/^\s*import\s+([a-zA-Z_][\w.]*)/gm)) them(m[1].replace(/\./g, '/'));
    return [...ra];
  }
  const toiDuoc = new Set();
  const hangDoi = DIEM_VAO.filter((f) => filePy.includes(f));
  while (hangDoi.length) {
    const f = hangDoi.shift();
    if (toiDuoc.has(f)) continue;
    toiDuoc.add(f);
    hangDoi.push(...nhapKhauCua(f));
  }
  // Công cụ chạy tay (có `__main__`) không phải cơ chế chết — có điểm vào riêng là dòng lệnh.
  const laCongCuChayTay = (f) => { try { return /if\s+__name__\s*==\s*["']__main__["']/.test(fs.readFileSync(path.join(THU_MUC_APP, f), 'utf8')); } catch { return false; } };
  const ungVien = filePy.filter((f) => !(TESTS_REL_APP && f.startsWith(TESTS_REL_APP + '/')) && path.basename(f) !== '__init__.py');
  const khongToi = ungVien.filter((f) => !toiDuoc.has(f));
  const congCu = khongToi.filter(laCongCuChayTay);
  const chet = khongToi.filter((f) => !laCongCuChayTay(f));
  const diemVaoCoThat = DIEM_VAO.filter((f) => filePy.includes(f));
  c4 = {
    ten: 'Orphan rate',
    moCoiXuoi: { so: c4_xuoi.length, tong: rtmDong.length, nghia: 'Yêu cầu CÓ mà không truy được xuống mã/test — đã hứa mà chưa làm', dong: c4_xuoi.map((r) => r.so) },
    moCoiNguoc: {
      so: chet.length, tong: ungVien.length, nghia: 'CƠ CHẾ CHẾT — module tồn tại nhưng không đường nào từ điểm vào chạy tới',
      file: chet, congCuChayTay: congCu, diemVao: DIEM_VAO, diemVaoCoThat, toiDuoc: toiDuoc.size,
      canhBao: diemVaoCoThat.length ? undefined : 'Không điểm vào nào trong config tồn tại trên đĩa ⇒ mọi module đều "không tới được" — số này là LỖI DỤNG CỤ, không phải sự thật. Sửa docHealth.c4.diemVao.',
    },
    ...tiLe(c4_xuoi.length + chet.length, rtmDong.length + ungVien.length,
      'Gộp hai chiều — càng THẤP càng tốt. Chiều ngược đo bằng đồ thị import từ điểm vào (' + DIEM_VAO.join(', ') + ').'),
    khongDoDuocBangMay: 'Vế "module quan trọng không có TÀI LIỆU GIẢI THÍCH" chỉ đo được khi bản đồ module nêu tên tệp thực thi; công cụ này đo vế gần nhất máy đo được là CƠ CHẾ CHẾT.',
  };
} else {
  c4 = {
    ten: 'Orphan rate',
    moCoiXuoi: { so: c4_xuoi.length, tong: rtmDong.length, nghia: 'Yêu cầu CÓ mà không truy được xuống mã/test — đã hứa mà chưa làm', dong: c4_xuoi.map((r) => r.so) },
    moCoiNguoc: { so: null, khongDoDuocBangMay: `docHealth.c4.ngonNgu = "${NGON_NGU_C4}" — công cụ chỉ dựng đồ thị import cho python. Chiều ngược (cơ chế chết) KHÔNG đo được bằng máy; không bịa.` },
    ...tiLe(c4_xuoi.length, rtmDong.length, 'CHỈ chiều xuôi — chiều ngược không đo được bằng máy với ngôn ngữ này.'),
  };
}

// =============================================================================
// c5 — Review evidence
// =============================================================================
// Hai nguồn bằng chứng, đều là PHÁT HIỆN có thật chứ không phải lượt:
//   (a) Dev Book: dòng đủ 3 cột phán xử cuối (phát hiện ra sao · sửa thế nào · vì sao quan trọng)
//       — gắn với Bước ở cột thứ 3.
//   (b) Bản ghi cổng Bước (`cong-buoc/*-B<n>.json`) có R3 với `nguoiReview` + mảng `phatHien` KHÔNG rỗng.
// Artefact của Bước nào có bằng chứng ở Bước đó thì tính là "có dấu vết review/phê duyệt".
const BUOC_ARTIFACT = {
  0: ['SCOPE'], 1: ['SPEC'], 2: ['MODULEMAP'], 3: ['ARCH'], 4: ['WBS'], 5: ['EST'],
  6: ['RISK', 'DELEGATION'], 7: ['DOR'], 8: ['DEVBOOK'], 9: ['SITUAT'], 10: ['RTM', 'TELEMETRY', 'WEEKLY'],
};
const tenTepTheoKhoa = (k) => (H.C.tep.output || {})[k];
const dbDong = H.doc(H.tep('DEVBOOK')).split(/\r?\n/)
  .filter((l) => /^\|\s*\d+\s*\|/.test(l.trim()))
  .map((l) => l.trim().replace(/^\|/, '').replace(/\|\s*$/, '').split('|').map((s) => s.trim()));
const dbDayDu = dbDong.filter((c) => c.length >= 6 && c.slice(-3).every((x) => x));
const buocCoBangChung = new Set();
dbDayDu.forEach((c) => { const b = parseInt(c[2], 10); if (!Number.isNaN(b)) buocCoBangChung.add(b); });
const congBuocDir = H.P(H.C.thuMuc.log, H.C.tep.log.CONG_BUOC);
const congBuocR3 = [];
try {
  for (const f of fs.readdirSync(congBuocDir).filter((f) => /-B\d+\.json$/.test(f))) {
    const j = H.docJson(path.join(congBuocDir, f), null);
    if (!j || !j.R3) continue;
    const b = parseInt((j.buoc != null ? String(j.buoc) : (f.match(/-B(\d+)\.json$/) || [])[1]), 10);
    const phatHien = Array.isArray(j.R3.phatHien) ? j.R3.phatHien.filter((x) => String(x).trim()) : [];
    const hopLe = !!j.R3.nguoiReview && phatHien.length > 0;
    congBuocR3.push({ tep: f, buoc: b, lopReview: j.R3.lopReview || null, hopLe, soPhatHien: phatHien.length });
    if (hopLe && !Number.isNaN(b)) buocCoBangChung.add(b);
  }
} catch { /* chưa có thư mục cong-buoc */ }
const fileCoPheDuyetCapBuoc = new Set();
for (const [b, khoas] of Object.entries(BUOC_ARTIFACT)) {
  if (buocCoBangChung.has(+b)) khoas.map(tenTepTheoKhoa).filter(Boolean).forEach((t) => fileCoPheDuyetCapBuoc.add(t));
}
const c5 = {
  ten: 'Review evidence',
  ...tiLe(fileTaiLieu.filter((f) => fileCoPheDuyetCapBuoc.has(f)).length, fileTaiLieu.length,
    'Artefact có dấu vết review THẬT: Bước của nó có phát hiện ghi trong Dev Book (đủ cột phán xử) HOẶC bản ghi cổng Bước R3 có người review + phát hiện. Đếm PHÁT HIỆN, không đếm lượt.'),
  devBook: { tongDong: dbDong.length, dongDuCotPhanXu: dbDayDu.length, nghia: 'Mỗi dòng = một PHÁT HIỆN có thật, không phải một lượt review' },
  congBuocR3: { tong: congBuocR3.length, hopLe: congBuocR3.filter((x) => x.hopLe).length, khongHopLe: congBuocR3.filter((x) => !x.hopLe).map((x) => x.tep) },
  buocCoBangChung: [...buocCoBangChung].sort((a, b) => a - b),
  fileKhongCoDauVet: fileTaiLieu.filter((f) => !fileCoPheDuyetCapBuoc.has(f)),
  fileKhongThuocBuocNao: fileTaiLieu.filter((f) => !Object.values(BUOC_ARTIFACT).flat().map(tenTepTheoKhoa).includes(f)),
};

// =============================================================================
// c6 — Decision coverage
// =============================================================================
// Mẫu số gồm HAI nhóm: rủi ro mức cao (L×I ≥ ngưỡng) VÀ thay đổi kiến trúc (dòng ARCH có mã quyết định).
// ⚠️ Mẫu nhận diện mã quyết định lấy từ config `ma.quyetDinh` — đặt họ mã mới mà không sửa config
//    thì công cụ quay ra tố cáo chính công việc vừa làm (bài học lặp lại).
const riskNoiDung = H.doc(H.tep('RISK'));
function chiSoCotLxI(md) {
  const header = md.split(/\r?\n/).find((l) => /^\|/.test(l.trim()) && /L\s*[×x*]\s*I/i.test(l));
  if (!header) return null;
  const cells = header.trim().split('|');
  for (let i = 0; i < cells.length; i++) if (/L\s*[×x*]\s*I/i.test(cells[i])) return i;
  return null;
}
const COT_LXI = chiSoCotLxI(riskNoiDung);
const riskDong = RE_RUIRO ? riskNoiDung.split(/\r?\n/)
  .filter((l) => new RegExp('^\\|\\s*(' + RE_RUIRO.source + ')\\s*\\|').test(l.trim()))
  .map((l) => {
    const c = l.trim().split('|');
    const oLxI = COT_LXI != null ? (c[COT_LXI] || '') : (c[6] || '');
    return { ma: (c[1] || '').trim(), noiDung: (c[2] || '').trim(), li: parseInt(((oLxI.match(/(\d+)/) || [])[1]) || '0', 10), tho: l };
  }) : [];
const riskCao = riskDong.filter((r) => r.li >= NGUONG_CAO);
const coQuyetDinh = (r) => !!RE_QD && new RegExp(RE_QD.source).test(r.tho);
const kienTrucDong = RE_QD ? H.doc(H.tep('ARCH')).split(/\r?\n/)
  .filter((l) => new RegExp('\\*\\*(' + RE_QD.source + ')').test(l))
  .map((l) => ({ ma: (l.match(new RegExp(RE_QD.source)) || [''])[0], tho: l })) : [];
const hangMucC6 = [
  ...riskCao.map((r) => ({ nhom: 'rui-ro-cao', ma: r.ma, noiDung: r.noiDung, tho: r.tho })),
  ...kienTrucDong.map((k) => ({ nhom: 'kien-truc', ma: k.ma, noiDung: k.ma, tho: k.tho })),
];
const maQuyetDinh = RE_QD ? [...new Set(fileTaiLieu.map((f) => H.doc(path.join(THU_MUC_OUTPUT, f))).join('\n').match(RE_QD) || [])].sort() : [];
const c6 = {
  ten: 'Decision coverage',
  ...tiLe(hangMucC6.filter(coQuyetDinh).length, hangMucC6.length,
    'Mẫu số gồm CẢ 2 nhóm: rủi ro mức cao (L×I ≥ ' + NGUONG_CAO + ') VÀ thay đổi kiến trúc (dòng có **mã quyết định** trong ARCH).'),
  cotLxI: COT_LXI != null ? COT_LXI : 'không thấy tiêu đề L×I — dùng cột 6 theo mặc định',
  soRuiRo: riskDong.length, soRuiRoCao: riskCao.length, soThayDoiKienTruc: kienTrucDong.length,
  maQuyetDinhHienCo: maQuyetDinh,
  hangMucThieuQuyetDinh: hangMucC6.filter((h) => !coQuyetDinh(h)).map((h) => ({ nhom: h.nhom, ma: h.ma, noiDung: h.noiDung.slice(0, 70) })),
  dauHieuLo: 'Một quy tắc nghiệp vụ đang chi phối thiết kế nhưng CHỈ tồn tại trong lịch sử chat.',
  luuY: 'Dòng kiến trúc được định nghĩa kèm mã ngay từ đầu nên luôn "có quyết định" — đếm vào mẫu số vẫn đúng, chỉ là không khó.',
};

// =============================================================================
// c7 — Retrieval quality (phép đo HÀNH VI — chỉ đọc lại kết quả đã chạy thật)
// =============================================================================
const c7Tep = H.tep('C7_KET_QUA');
const c7Kq = H.docJson(c7Tep, null);
const c7 = (c7Kq && Number.isInteger(c7Kq.soO) && Number.isInteger(c7Kq.soODung)) ? {
  ten: 'Retrieval quality',
  ...tiLe(c7Kq.soODung, c7Kq.soO, 'ĐỘ PHỦ NGUỒN (spec/code/test/quyết định) — mỗi câu hỏi chấm 4 ô. Đọc THẬT từ ' + H.rel(c7Tep) + '.'),
  doLuc: c7Kq.doLuc || null, soCauHoi: c7Kq.soCauHoi || null, ghiChu: c7Kq.ghiChu || undefined, nguonThat: H.rel(c7Tep),
  bayRieng: 'Người soạn câu hỏi BIẾT tài liệu nằm đâu ⇒ vô tình chỉ hỏi những câu tra được. Câu hỏi nên do NGƯỜI KHÁC soạn.',
} : {
  ten: 'Retrieval quality', tiLe: null, chuaDo: true,
  lyDo: 'Khác hẳn 6 chỉ số kia: đây là phép đo HÀNH VI, phải dựng bộ câu hỏi và CHẠY THẬT, rồi ghi kết quả vào ' + H.rel(c7Tep) + ' dạng {"doLuc","soCauHoi","soO","soODung","ghiChu"}.',
  canGi: 'Bộ ~10–15 câu hỏi đã biết đáp án → tra trong bộ tài liệu → chấm 4 ô nguồn/câu → Wilson.',
  bayRieng: 'Người soạn câu hỏi BIẾT tài liệu nằm đâu ⇒ vô tình chỉ hỏi những câu tra được. Câu hỏi nên do NGƯỜI KHÁC soạn.',
};

// --- Ghi ra -------------------------------------------------------------------
const ketQua = {
  doLuc: new Date().toISOString(),
  nguon: 'node ' + H.rel(__filename),
  duAn: (H.C.duAn && H.C.duAn.ten) || null,
  canhBaoChung: 'Mọi tỉ lệ đều kèm khoảng tin cậy Wilson 95%. Tỉ lệ có `mauQuaNho:true` thì con số KHÔNG phân biệt được tốt/xấu — đừng đọc một mình. '
    + `${H.vai.ai} không được sửa tài liệu hay test để chỉ số đẹp lên.`,
  c1, c2, c3, c4, c5, c6, c7,
};
const tepRa = H.tep('DOC_HEALTH');
fs.mkdirSync(path.dirname(tepRa), { recursive: true });
fs.writeFileSync(tepRa, JSON.stringify(ketQua, null, 2), 'utf8');

// --- Báo cáo ------------------------------------------------------------------
const d = (x) => x.tiLe == null
  ? (x.chuaCoDuLieu ? 'chưa có dữ liệu' : 'chưa đo')
  : `${x.tiLe}%  [${x.khoangTinCay[0]}–${x.khoangTinCay[1]}%]  n=${x.mauSo}${x.mauQuaNho ? '  ⚠️ MẪU QUÁ NHỎ' : ''}`;
console.log(`=== doc-health — 7 chỉ số sức khoẻ tài liệu${ketQua.duAn ? ' · ' + ketQua.duAn : ''} ===\n`);
console.log(`  c1 Traceability   : ${d(c1)}`);
console.log(`                      (tính thô trên cả ${c1.tongHangRTM} hàng = ${c1.tiLeTho == null ? '—' : c1.tiLeTho + '%'} — con số ĐÁNH LỪA, đã loại ${c1.hangBiLoai} hàng chưa build)`);
if (c1.hangOGhiThuKhongCoThat.length) console.log(`                      ⚠️ ${c1.hangOGhiThuKhongCoThat.length} ô Code/Test có ghi nhưng KHÔNG trỏ tới tệp có thật: dòng ${c1.hangOGhiThuKhongCoThat.map((x) => x.dong).join(', ')}`);
if (c1.hangThieuWorkItem.length) console.log(`                      ⚠️ ${c1.hangThieuWorkItem.length} hàng có mã/test nhưng thiếu Work item thật: dòng ${c1.hangThieuWorkItem.join(', ')}`);
console.log(`  c2 Change coupling: ${d(c2)}${c2.lyDo ? ' — ' + c2.lyDo : ''}`);
if (c2.commitKhongTraDuoc && c2.commitKhongTraDuoc.length) console.log(`                      → ${c2.commitKhongTraDuoc.length} commit KHÔNG TRA ĐƯỢC (loại khỏi mẫu số): ${c2.commitKhongTraDuoc.map((x) => x.commit).join(', ')}`);
if (c2.commitThieuTaiLieu && c2.commitThieuTaiLieu.length) c2.commitThieuTaiLieu.forEach((x) => console.log(`                      → ${x.commit} THIẾU: ${x.thieu.map((t) => t.split('/').pop()).join(', ')}`));
if (c2.canhBao) console.log(`                      ⚠️ ${c2.canhBao}`);
console.log(`  c3 Freshness      : ${c3.chuaCoDuLieu ? 'chưa có dữ liệu (thư mục tài liệu trống)' : `${c3.soChoLechDaBiet} chỗ đã biết là lệch (cận trên), trên ${c3.soFileCoChoLech}/${c3.tongFile} tệp`}`);
console.log(`                      ⚠️ KHÔNG đo được: ${c3.khongDoDuoc}`);
console.log(`  c4 Orphan rate    : ${d(c4)}`);
if (c4.moCoiNguoc.so == null) {
  console.log(`                      xuôi ${c4.moCoiXuoi.so}/${c4.moCoiXuoi.tong} · ngược: ⚠️ ${c4.moCoiNguoc.khongDoDuocBangMay}`);
} else {
  console.log(`                      xuôi ${c4.moCoiXuoi.so}/${c4.moCoiXuoi.tong} · ngược ${c4.moCoiNguoc.so}/${c4.moCoiNguoc.tong}  (đồ thị import từ ${c4.moCoiNguoc.diemVao.join(', ')}, tới được ${c4.moCoiNguoc.toiDuoc} module)`);
  if (c4.moCoiNguoc.canhBao) console.log(`                      🔴 ${c4.moCoiNguoc.canhBao}`);
  if (c4.moCoiNguoc.so) console.log(`                      🔴 CƠ CHẾ CHẾT: ${c4.moCoiNguoc.file.join(', ')}`);
  if (c4.moCoiNguoc.congCuChayTay.length) console.log(`                      ${c4.moCoiNguoc.congCuChayTay.length} công cụ chạy tay (có __main__, không tính là chết): ${c4.moCoiNguoc.congCuChayTay.join(', ')}`);
  console.log(`                      ⚠️ ${c4.khongDoDuocBangMay}`);
}
console.log(`  c5 Review evidence: ${d(c5)}`);
console.log(`                      Dev Book ${c5.devBook.dongDuCotPhanXu}/${c5.devBook.tongDong} dòng đủ cột phán xử · cổng Bước R3 hợp lệ ${c5.congBuocR3.hopLe}/${c5.congBuocR3.tong} (đếm PHÁT HIỆN, không đếm lượt)`);
if (c5.fileKhongCoDauVet.length) console.log(`                      ⚠️ không có dấu vết review: ${c5.fileKhongCoDauVet.join(', ')}`);
if (c5.fileKhongThuocBuocNao.length) console.log(`                      📌 tệp không thuộc Bước nào trong bảng ánh xạ (không thể có phê duyệt cấp Bước): ${c5.fileKhongThuocBuocNao.join(', ')}`);
console.log(`  c6 Decision cover : ${d(c6)}`);
console.log(`                      mẫu số = ${c6.soRuiRoCao} rủi ro cao (trong ${c6.soRuiRo}) + ${c6.soThayDoiKienTruc} thay đổi kiến trúc | mã quyết định hiện có: ${c6.maQuyetDinhHienCo.join(', ') || '—'}`);
if (c6.hangMucThieuQuyetDinh.length) console.log(`                      🔴 THIẾU quyết định: ${c6.hangMucThieuQuyetDinh.map((r) => `${r.nhom}:${r.ma}`).join(', ')}`);
console.log(`  c7 Retrieval      : ${c7.tiLe == null ? 'CHƯA ĐO — ' + c7.lyDo : d(c7) + '  (đọc thật từ ' + c7.nguonThat + ')'}`);
console.log('');
console.log(`  📄 ${H.rel(tepRa)}`);
console.log('  ⚠️ Chỉ số có "MẪU QUÁ NHỎ" thì tỉ lệ KHÔNG dùng một mình được — phải đọc kèm khoảng tin cậy.');
process.exit(0);
