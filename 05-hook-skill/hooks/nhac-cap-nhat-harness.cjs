#!/usr/bin/env node
'use strict';
/*
 * SessionStart hook — NHẮC khi harness có bản mới hơn bản dự án đang dùng. CHỈ NHẮC, không sửa gì.
 *
 * *** VÌ SAO ***
 * Cơ chế 2 của harness: harness cải tiến thì các dự án phải biết để cập nhật. Không đẩy được thông báo
 * vào phiên đang chạy, nên "ngay" = lúc mở phiên kế tiếp — và lúc đó là hook này. Chỉ nhắc, vì đổi luật
 * giữa một Bước đang dở có thể làm lệch việc; cập nhật là quyết định của chủ dự án.
 *
 * Đọc bản mới từ đâu: (1) VERSION tại harnessPath ghi trong .harness-manifest.json (PC có ổ OneDrive);
 * (2) không có ổ (phiên điện thoại / máy ảo) ⇒ GET raw GitHub, chờ tối đa 2,5 giây; lỗi mạng ⇒ im lặng.
 * Không bao giờ throw / thoát khác 0. Dự án chưa có bảng kê ⇒ im lặng (chưa đăng ký thì không có gì để so).
 */
const K = require('./_hook-chung.cjs');
const MF = (() => { try { return JSON.parse(K.fs.readFileSync(K.path.join(K.GOC, '.harness-manifest.json'), 'utf8')); } catch { return null; } })();

// Nhắc thứ hai, không cần bảng kê: repo nằm trong OneDrive ⇒ nhắc tạm dừng đồng bộ khi dev (Huynh chốt 17/10/2026, RUNBOOK §8).
const LOI = [];
if (/onedrive/i.test(K.GOC)) LOI.push(`📁 Repo nằm trong OneDrive (${K.GOC}). ${K.vai.chu} chốt: tạm dừng đồng bộ OneDrive trong lúc dev (chuột phải biểu tượng OneDrive → Pause syncing), bật lại sau khi đẩy git. ${K.vai.ai} nhắc một lần đầu phiên, không nhắc lại.`);
function xuat() { if (LOI.length) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: LOI.join('\n') } })); process.exit(0); }
if (!MF || !MF.harnessVersion) xuat();

const so = (a, b) => { const x = String(a).split('.').map(Number), y = String(b).split('.').map(Number); for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) - (y[i] || 0); return 0; };
function nhac(banMoi, nguon) {
  if (so(banMoi, MF.harnessVersion) <= 0) return;
  LOI.push(`📦 Harness có bản ${banMoi} (dự án đang dùng ${MF.harnessVersion}, nguồn: ${nguon}). Gõ "cập nhật harness" để xem gì đổi — đọc CHANGELOG.md mục ${banMoi} trước; chỉ cập nhật khi ${K.vai.chu} bảo, không tự sửa giữa Bước đang dở.`);
}
let local = null;
try { if (MF.harnessPath) local = K.fs.readFileSync(K.path.join(MF.harnessPath, 'VERSION'), 'utf8').trim(); } catch { local = null; }
if (local) { nhac(local, 'ổ máy'); xuat(); }

const repo = String(MF.harnessRepo || 'https://github.com/cuongtmvn/Harness.git').replace(/\.git$/, '').replace('https://github.com/', '');
const url = `https://raw.githubusercontent.com/${repo}/main/VERSION`;
try {
  const https = require('https');
  const req = https.get(url, { timeout: 2500 }, (res) => {
    let d = ''; res.on('data', (c) => { d += c; });
    res.on('end', () => { if (res.statusCode === 200 && /^\d+\.\d+\.\d+/.test(d.trim())) nhac(d.trim(), 'GitHub'); xuat(); });
  });
  req.on('timeout', () => { req.destroy(); xuat(); });
  req.on('error', () => xuat());
} catch { xuat(); }
