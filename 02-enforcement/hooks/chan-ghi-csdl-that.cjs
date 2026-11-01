#!/usr/bin/env node
'use strict';
/*
 * PreToolUse hook — CHẶN lệnh GHI vào CSDL THẬT khi CHƯA CÓ BẢN SAO LƯU MỚI.
 *
 * *** VÌ SAO ***
 * Hai ca cùng khuôn: chạy kịch bản khởi tạo lên CSDL thật trước khi sao lưu, vi phạm ranh giới do chính
 * AI viết vài giờ trước; và một kịch bản gõ cứng id theo phỏng đoán đã khoá nhầm tài khoản thật —
 * khôi phục được chỉ vì khoá là thao tác đảo ngược. Thứ AI BIẾT không dự đoán được thứ AI LÀM.
 *
 * NÓ ĐÒI GÌ: lệnh có ý định GHI vào CSDL thật chỉ chạy khi có bản sao lưu thật, mới trong hạn
 * (config › csdlThat.hanSaoLuuPhut). Cắm cờ suông không đủ — hook tự tìm tệp sao lưu và đọc giờ sửa.
 *
 * ⚠️ GIỚI HẠN: hook chỉ nhìn thấy CHUỖI LỆNH. Nó không thấy câu SQL nằm trong một tệp .py chạy bằng
 * `python thu.py`. Hook thu hẹp cửa, không đóng kín — lớp bù đúng chỗ là hàng rào trong chính lớp
 * kết nối CSDL của ứng dụng.
 * Không có csdlThat.khuon trong config ⇒ hook không làm gì.
 */
const K = require('./_hook-chung.cjs');
const SO = K.tepLog('CHAN_CSDL', 'CHAN-CSDL-THAT.ndjson');
const CFG = K.C.csdlThat || {};
const KHUON_THAT = (CFG.khuon || []).map((s) => K.re(s, 'i')).filter(Boolean);
const KHUON_PROD = K.re(CFG.khuonProd, 'i');
const KICH_BAN = K.re(CFG.kichBanNguy, 'i');
const Y_DINH_GHI = /\b(DELETE|UPDATE|INSERT|REPLACE|DROP|ALTER|TRUNCATE|VACUUM|CREATE\s+TABLE|--lam-that)\b/i;
const CHI_DOC = /\b(SELECT|PRAGMA|\.schema|\.tables|mode=ro)\b/i;
const CO_DI_VONG = /#\s*DA-SAO-LUU/i;
const HAN = Number(CFG.hanSaoLuuPhut || 120);

function tuoiSaoLuu() {
  try {
    const thu = K.path.join(K.GOC, CFG.thuMucSaoLuu || '');
    const reBak = K.re(CFG.khuonSaoLuu, 'i');
    if (!reBak) return null;
    const ds = K.fs.readdirSync(thu).filter((f) => reBak.test(f)).map((f) => { const t = K.fs.statSync(K.path.join(thu, f)); return { f, ms: t.mtimeMs, byte: t.size }; }).filter((x) => x.byte > 0).sort((a, b) => b.ms - a.ms);
    return ds.length ? { phut: (Date.now() - ds[0].ms) / 60000, ten: ds[0].f } : null;
  } catch { return null; }
}
K.docStdin((hook) => {
  if (!hook) return process.exit(0);
  if (!KHUON_THAT.length && !KHUON_PROD && !KICH_BAN) return process.exit(0);
  const ten = hook.tool_name || '';
  if (ten !== 'Bash' && ten !== 'PowerShell') return process.exit(0);
  const lenh = String((hook.tool_input || {}).command || '');
  const phien = String(hook.session_id || '').slice(0, 8);
  const gon = lenh.replace(/\s+/g, ' ').trim().slice(0, 300);
  const chamProd = KHUON_PROD && KHUON_PROD.test(lenh);
  const chamThat = KHUON_THAT.some((r) => r.test(lenh));
  const chayKichBan = KICH_BAN && KICH_BAN.test(lenh);
  const coYGhi = Y_DINH_GHI.test(lenh);
  if (chamProd && (coYGhi || chayKichBan)) {
    if (CO_DI_VONG.test(lenh)) { K.ghiSo(SO, { ts: new Date().toISOString(), phien, loai: 'di-vong-prod', lenh: gon }); return process.exit(0); }
    K.ghiSo(SO, { ts: new Date().toISOString(), phien, loai: 'chan-prod', lenh: gon });
    return K.chan(['🛑 CHẶN — lệnh GHI thẳng vào CSDL PRODUCTION. Dữ liệu NGƯỜI THẬT, không hoàn lại được — điều dừng 6.', 'Đường đúng: đường ống đẩy production (tự sao lưu và ĐỐI CHỨNG bản sao).', `Nếu ${K.vai.chu} ĐÍCH THÂN yêu cầu: thêm #DA-SAO-LUU và nêu rõ đã sao lưu ở đâu.`].join('\n'));
  }
  if (!(chamThat || chayKichBan)) return process.exit(0);
  if (!coYGhi && !chayKichBan) return process.exit(0);
  if (!chayKichBan && CHI_DOC.test(lenh) && !coYGhi) return process.exit(0);
  const sl = tuoiSaoLuu();
  if (sl && sl.phut <= HAN) { K.ghiSo(SO, { ts: new Date().toISOString(), phien, loai: 'cho-qua', lenh: gon, saoLuu: sl.ten, tuoiPhut: Math.round(sl.phut) }); return process.exit(0); }
  K.ghiSo(SO, { ts: new Date().toISOString(), phien, loai: 'chan', lenh: gon, saoLuu: sl ? sl.ten : null, tuoiPhut: sl ? Math.round(sl.phut) : null });
  K.chan([
    '🛑 CHẶN — lệnh GHI vào CSDL THẬT mà CHƯA có bản sao lưu mới.',
    sl ? `Bản sao lưu mới nhất: ${sl.ten} — đã ${Math.round(sl.phut)} phút (hạn ${HAN} phút).` : `KHÔNG tìm thấy bản sao lưu nào theo khuôn ${CFG.khuonSaoLuu} trong ${CFG.thuMucSaoLuu}.`,
    '',
    'PHẢI LÀM TRƯỚC: sao lưu CSDL thật (CSDL có WAL ⇒ checkpoint trước khi chép).',
    '⚠️ Cắm cờ #DA-SAO-LUU KHÔNG đủ ở đây — hook tự tìm tệp sao lưu và đọc giờ sửa. Không có bản sao lưu thật thì không có đường qua.',
  ].join('\n'));
});
