#!/usr/bin/env node
// Cổng máy riêng của dự án (L-CONG-01). Cổng = goc + stt × khoi + độ lệch của việc (khối `congMay` trong harness.config.json).
// `stt` = số thứ tự cố định của dự án trong sổ đăng ký GlobalHarness (08-update/DU-AN-DANG-KY.json): cấp một lần lúc cài, không đổi, không dùng lại.
//   node Log/cong-du-an.cjs              bảng cổng của dự án, đối chiếu sổ đăng ký
//   node Log/cong-du-an.cjs --cong cdp   chỉ in số cổng (dùng trong kịch bản)
//   node Log/cong-du-an.cjs --trong cdp  thoát 0 nếu cổng rảnh, 2 nếu có tiến trình đang nghe
// Thoát 2 khi: thiếu cấu hình · `stt` lệch sổ hoặc trùng dự án khác · tên việc lạ · cổng đang bận.
// Không đọc được sổ (máy khác, phiên đám mây) ⇒ báo, không chặn.
const net = require('net');
const H = require('./_harness-config.cjs');

const dung = (m) => { console.error('cong-du-an: ' + m); process.exit(2); };
const c = H.C.congMay;
if (!c) dung('harness.config.json chưa có khối congMay — thêm { "stt": <số trong sổ đăng ký>, "goc": 20000, "khoi": 100, "viec": { "dev": 0, "cdp": 22 } }');
if (!Number.isInteger(c.stt)) dung('congMay.stt chưa cấp — lấy số `stt` của dự án trong 08-update/DU-AN-DANG-KY.json (dự án mới: số lớn nhất + 1)');
if (!Number.isInteger(c.goc) || !Number.isInteger(c.khoi) || !c.viec) dung('khối congMay thiếu goc / khoi / viec');
for (const [v, lech] of Object.entries(c.viec)) if (!Number.isInteger(lech) || lech < 0 || lech >= c.khoi) dung(`độ lệch của "${v}" phải trong 0–${c.khoi - 1}`);

const cong = (v) => {
  if (!(v in c.viec)) dung(`việc lạ "${v}" — có: ${Object.keys(c.viec).join(', ')}`);
  return c.goc + c.stt * c.khoi + c.viec[v];
};

function doiChieuSo() {
  const mf = H.docJson('.harness-manifest.json', null);
  const so = mf && mf.harnessPath ? H.docJson(H.path.join(mf.harnessPath, '08-update', 'DU-AN-DANG-KY.json'), null) : null;
  if (!so || !Array.isArray(so.duAn)) return 'không đọc được sổ đăng ký ở máy này — chưa đối chiếu';
  const ten = H.C.duAn && H.C.duAn.ten;
  const minh = so.duAn.find((d) => d.ten === ten);
  const khac = so.duAn.find((d) => d.stt === c.stt && d.ten !== ten);
  if (khac) dung(`stt ${c.stt} đã cấp cho "${khac.ten}"`);
  if (!minh) return `"${ten}" chưa có trong sổ đăng ký — đăng ký với stt ${c.stt}`;
  if (minh.stt !== c.stt) dung(`congMay.stt = ${c.stt} nhưng sổ đăng ký ghi "${ten}" là ${minh.stt}`);
  return 'khớp sổ đăng ký';
}

const dangNghe = (p) => new Promise((ok) => {
  const s = net.createServer();
  s.once('error', () => ok(true));
  s.once('listening', () => s.close(() => ok(false)));
  s.listen(p, '127.0.0.1');
});

(async () => {
  const a = process.argv.slice(2);
  if (a[0] === '--cong') { console.log(cong(a[1])); return; }
  if (a[0] === '--trong') {
    const p = cong(a[1]);
    if (await dangNghe(p)) dung(`cổng ${p} (${a[1]}) đang có tiến trình nghe — tìm xem của ai, không tự đổi số`);
    console.log(`${p} rảnh`);
    return;
  }
  if (a.length) dung(`không hiểu: ${a.join(' ')}`);
  console.log(`${H.C.duAn && H.C.duAn.ten}: stt ${c.stt} · khối ${c.goc + c.stt * c.khoi}–${c.goc + (c.stt + 1) * c.khoi - 1} · ${doiChieuSo()}`);
  for (const v of Object.keys(c.viec)) { const p = cong(v); console.log(`  ${v.padEnd(8)} ${p}${await dangNghe(p) ? '  (đang bận)' : ''}`); }
})();
