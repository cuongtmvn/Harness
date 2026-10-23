---
name: kiem-harness-du-an
description: Kiểm dự án đang mở đã có ProjectHarness (cài từ GlobalHarness cuongtmvn/Harness) chưa, TRƯỚC khi nạp luật của dự án. Dùng khi Huynh nói "nạp context", "bắt đầu làm việc", "dự án mới", "khởi tạo dự án", "tạo repo mới", hoặc khi bắt tay vào một dự án có CLAUDE.md / Instructions/ / PLAYBOOK mà không có .harness-manifest.json — đặc biệt ở phiên điện thoại / cloud. Không dùng để sửa GlobalHarness (đó là "cập nhật GlobalHarness").
---

# Kiểm ProjectHarness trước khi nạp context — mọi dự án, mọi nơi chạy

> **GlobalHarness** = bộ luật điều hành AI dùng chung: repo công khai `https://github.com/cuongtmvn/Harness.git` (trên PC của Huynh: `D:\OneDrive\AI\Harness`). **ProjectHarness** = bản cài từ đó vào một dự án, nhận ra bằng `.harness-manifest.json` ở gốc dự án.
> Skill này có vì: mọi cơ chế nhắc của GlobalHarness nằm **bên trong** ProjectHarness, nên dự án chưa cài thì không có gì trỏ về GlobalHarness. Ca thật 16/10/2026: AIAutoNews tạo từ phiên điện thoại, chép tay luật Thiên Số; tới 23/10 vẫn chạy luật cũ, không biết GlobalHarness 1.6.3.

## Bước 1 — Dự án có `.harness-manifest.json` không?

- **Có** ⇒ đọc `harnessVersion`; so với `VERSION` của GlobalHarness (ổ máy, hoặc `https://raw.githubusercontent.com/cuongtmvn/Harness/main/VERSION`). Tụt bản ⇒ báo Huynh số bản + mục **bắt buộc** trong `CHANGELOG.md`. Rồi nạp context theo `CLAUDE.md` của dự án. Hết skill.
- **Không** ⇒ sang Bước 2.

## Bước 2 — Lấy GlobalHarness và đọc

- PC có ổ `D:\OneDrive\AI\Harness` ⇒ dùng ở đó (`git pull --ff-only` nếu sạch).
- Phiên điện thoại / cloud ⇒ `git clone --depth 1 https://github.com/cuongtmvn/Harness.git /tmp/Harness`.
- Đọc `CLAUDE.md`, `README.md` (§1 cài, §6 chỗ phải điền), mục trên cùng `CHANGELOG.md`. Tra `08-cap-nhat/DU-AN-DANG-KY.json`: dự án có trong sổ với ghi chú ngoại lệ ⇒ làm theo ghi chú, hết skill.

## Bước 3 — Báo Huynh ĐẦU TIÊN, rồi đề xuất (chưa làm)

| Dự án | Đề xuất |
|---|---|
| Mới, chưa có luật | **Cài:** `node <Harness>/07-cai-dat/cai-dat.cjs . --ten "<tên>"` → điền `harness.config.json` + `CLAUDE.md` → `node Log/kiem-harness.cjs` xanh → commit qua skill `day-git` (kèm `.harness-manifest.json`) → đăng ký vào sổ `DU-AN-DANG-KY.json` |
| Có luật chép tay (hậu tố riêng như `-AN`, không có `harness.config.json`) | **Di trú:** cài thử vào thư mục tạm để so bố cục · liệt kê dữ liệu dự án cần chuyển (SCOPE, Dev Book, sổ chờ quyết, phạm vi, bản khai cổng) · gỡ luật cũ · cài thật · `kiem-harness` xanh · cổng Bước đang mở phải đỏ/xanh **y như trước** di trú |

⛔ Không coi luật chép tay là harness hiện hành; không mở/đóng Bước theo nó. ⛔ Không tự cài / di trú khi Huynh chưa gật — đụng hook, `settings.json`, cổng = điều dừng 5 (khai *"AI được lợi nếu nới"*). ⛔ Dự án mới không chép tay bộ luật của dự án khác — luôn cài từ GlobalHarness.

## ✅ Xong khi
Huynh đã được báo tình trạng ProjectHarness (có / tụt bản / chưa có) **trước** mọi việc khác của phiên, và có đề xuất cụ thể kèm lệnh.
