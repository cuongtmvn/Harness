---
name: cap-nhat-harness
description: Kéo bản GlobalHarness mới về ProjectHarness của dự án đang mở theo bảng kê .harness-manifest.json — chỉ báo trước, áp dụng khi chủ dự án gật, không ghi đè tệp dự án đã tự sửa. Dùng khi chủ dự án gõ "cập nhật harness" (không nói gì thêm = tầng ProjectHarness), hoặc khi hook SessionStart / kiem-harness báo "GlobalHarness có bản …". KHÔNG dùng để sửa kho chung (đó là skill dua-vao-harness, chỉ khi chủ dự án nói rõ "cập nhật GlobalHarness").
---

# Cập nhật ProjectHarness — kéo bản GlobalHarness mới về dự án, 4 bước có kiểm chứng

> Câu kích hoạt: **"cập nhật harness"**. Vai: *Huynh* = chủ dự án, *CULI* = AI (`harness.config.json › vaiTro`).
> **GlobalHarness** = kho dùng chung (`harnessPath`); **ProjectHarness** = bản cài trong dự án này. Skill này đi một chiều GlobalHarness → ProjectHarness; tệp dự án đã tự sửa không bị ghi đè. Ghi `banDangDung` của dự án vào sổ `08-cap-nhat/DU-AN-DANG-KY.json` ở GlobalHarness là **một phần** của skill này (sổ đăng ký, không phải nội dung luật — không cần tăng VERSION, commit với thông điệp `sổ đăng ký: …`).
> Cơ chế 2 của harness: harness cải tiến ⇒ dự án được **nhắc** (hook `nhac-cap-nhat-harness.cjs` lúc mở phiên) ⇒ cập nhật **khi Huynh bảo**. ⛔ Không tự cập nhật giữa một Bước đang dở.

## Bước 1 — XEM GÌ ĐỔI (chưa ghi gì)

```bash
cat .harness-manifest.json | head -n 5          # bản đang dùng, đường dẫn harness
cat <harnessPath>/VERSION                        # bản mới
```
Đọc `<harnessPath>/CHANGELOG.md` **từ bản đang dùng tới bản mới**: mục nào ghi **bắt buộc**, mục nào **khuyến nghị**, lớp nào (*lõi chung* áp mọi dự án · *gói <loại>* chỉ áp dự án cùng loại · *riêng* không áp).
Không có ổ chứa GlobalHarness (phiên điện thoại) ⇒ `git clone https://github.com/cuongtmvn/Harness.git /tmp/Harness` rồi dùng đường dẫn đó.

**Báo Huynh:** bản A → B · số mục bắt buộc / khuyến nghị · mục nào chạm Bước đang mở. **Dừng chờ Huynh gật** (điều dừng 5: đổi luật quản AI là việc của Huynh).

## Bước 2 — XEM TRƯỚC, CHƯA GHI (dry run)

```bash
node <harnessPath>/08-cap-nhat/cap-nhat.cjs . 
```
Đọc bốn nhóm công cụ in ra:
| Nhóm | Nghĩa | Làm gì |
|---|---|---|
| ⬆️ CẬP NHẬT ĐƯỢC | GlobalHarness đổi, dự án chưa sửa tệp đó | sẽ ghi ở Bước 3 |
| ⬜ THIẾU | GlobalHarness có tệp mới (công cụ / hook / skill mới) | sẽ chép ở Bước 3 |
| 📄 MẪU ĐỔI | tệp dự án tự điền (config, CLAUDE.md, mẫu artefact) mà GlobalHarness đổi mẫu | **không ghi đè** — xem diff, đề xuất Huynh gộp phần nào |
| ⛔ XUNG ĐỘT | GlobalHarness đổi **và** dự án đã sửa riêng | **không ghi đè** — chạy lệnh `git diff --no-index` công cụ in ra, trình Huynh từng chỗ khác |

🛑 Có XUNG ĐỘT ở tệp **hạ tầng gác luật** (`settings.json`, hook, `gate-check.cjs`, `kiem-luat.cjs`, `harness.config.json`) ⇒ nói rõ *"CULI được lợi nếu nới"* rồi để Huynh quyết (điều dừng 5).

## Bước 3 — ÁP DỤNG (sau khi Huynh gật)

```bash
node <harnessPath>/08-cap-nhat/cap-nhat.cjs . --ap-dung
```
Công cụ ghi nhóm ⬆️ và ⬜, nâng bảng kê lên bản mới, rồi tự chạy `node Log/kiem-harness.cjs`. Đỏ ⇒ sửa tới xanh, **không ép**.
Mục CHANGELOG ghi **bắt buộc** mà không thuộc nhóm tự động (ví dụ: thêm khoá mới vào `harness.config.json`, gộp hook mới vào `settings.json` đã sửa riêng) ⇒ làm tay theo hướng dẫn của mục đó, kiểm lại bằng `kiem-harness`.

## Bước 4 — GHI VẾT + ĐẨY

1. `Output/DEVBOOK.md`: một dòng *"Đã cập nhật ProjectHarness lên GlobalHarness bản B — mục đã nhận: … · mục để lại: … (vì sao)"*.
2. `<harnessPath>/08-cap-nhat/DU-AN-DANG-KY.json`: sửa `banDangDung` của dự án này.
3. **"đẩy git đi"** (skill `day-git`) — `.harness-manifest.json` phải vào commit; ⛔ không ignore nó.

### ✅ Kiểm chứng xong
`node Log/kiem-harness.cjs` xanh · `.harness-manifest.json › harnessVersion` = bản mới · Dev Book có dòng ghi vết · không tệp xung đột nào bị ghi đè (so `git diff --stat`).
