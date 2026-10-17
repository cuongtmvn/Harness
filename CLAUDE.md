# CLAUDE.md — kho HARNESS (bộ luật + cổng máy dùng lại cho mọi dự án)

> Đây là **kho nguồn harness**, không phải một dự án phần mềm. Phiên mở ở đây làm hai việc: **sửa harness** (theo cơ chế 1) hoặc **tra cứu để cập nhật dự án khác** (cơ chế 2). Không có `Instructions/`, `Output/`, `Log/` ở đây — chúng chỉ xuất hiện trong dự án sau khi cài.

## Xưng hô
Chủ dự án = **Huynh**. AI = **ĐỆ** (ở dự án thì là CULI theo `harness.config.json › vaiTro`). Tiếng Việt, ngắn, thẳng, có phản biện.

## Đọc gì trước
1. `README.md` — bản đồ thư mục, bộ cài, §8 phiên bản & cập nhật.
2. `CHANGELOG.md` mục trên cùng — kho đang ở bản nào, vừa đổi gì. `VERSION` là số bản.
3. `08-cap-nhat/HUONG-DAN-CAP-NHAT.md` — hai chiều cập nhật, bốn điều cấm.
4. `MO-TA-HARNESS.html` — mở trong trình duyệt khi cần nhìn toàn cảnh (pipeline, ma trận 11 Bước, điểm can thiệp).

## ⚡ Lệnh kích hoạt tại kho này

| Huynh gõ | ĐỆ làm |
|---|---|
| *"nạp context"* | Đọc 4 tệp trên · `git status` · `git log --oneline -5` · báo bản hiện tại và tệp dở |
| *"đưa vào harness …"* | Skill `05-hook-skill/skills/dua-vao-harness/SKILL.md` — 7 bước; Bước 4 **phải** cài thử vào thư mục trống và `kiem-harness` xanh |
| *"cập nhật harness"* (cho dự án X) | Skill `05-hook-skill/skills/cap-nhat-harness/SKILL.md` — `node 08-cap-nhat/cap-nhat.cjs <X>` khô trước, `--ap-dung` sau khi Huynh gật |
| *"đẩy git đi"* | commit máy theo kỷ luật `day-git` (kho này chưa cài hook, ĐỆ tự giữ 5 bước) |
| *"đẩy GitHub đi"* | commit + `git push origin main` — **chỉ khi** `VERSION` đã tăng và `CHANGELOG.md` có mục mới; thông điệp commit theo khuôn `harness <bản>: <tóm tắt>` + từng mục lớp/mức/tệp/vì sao |

## 🔒 Luật của kho

1. **Mọi thay đổi nội dung harness = tăng `VERSION` + mục `CHANGELOG.md`** (PATCH chữ/lỗi · MINOR thêm · MAJOR đổi cấu trúc/khoá). Sửa `MO-TA-HARNESS.html` hay README không đổi luật thì PATCH. Ngoại lệ duy nhất không cần tăng bản: sổ `08-cap-nhat/DU-AN-DANG-KY.json` (ghi dự án nào ở bản nào) — vẫn commit + đẩy GitHub với thông điệp `sổ đăng ký: …`.
2. **Không đẩy GitHub mà thiếu ghi chú** — ghi chú = mục CHANGELOG + thông điệp commit trùng nhau.
3. **Sửa tệp luật (`00`–`03`) = Edit từng khối**, không ghi đè cả tệp; thêm luật thì thêm dòng vào `06-so-ghi/LUAT-DANGKY.json`; chạy `node 04-cong-may/kiem-luat.cjs --mat --trung` sau khi sửa (chạy trong một dự án đã cài, hoặc thư mục cài thử).
4. **Chạm luật quản AI** (dây cương, 7 điều dừng, cổng, `reviewPolicy`, `congRaRieng`, `csdlThat`, hook, `gate-check.cjs`, `kiem-luat.cjs`, `settings.json`) ⇒ khai *"ĐỆ được lợi nếu nới"* rồi dừng chờ Huynh — điều dừng 5.
5. **Mọi thứ đưa vào phải trả lời "chặn lỗi gì / tiết kiệm gì"** và gắn lớp lõi / gói / riêng; mặc định gói. Chi tiết riêng dự án (đường dẫn, cổng, tên bảng) không được vào kho.
6. **Công cụ mới**: `.cjs`, không gói npm, đọc config qua `04-cong-may/_harness-config.cjs`, thoát 0 / 2; bản đồ chép ở `07-cai-dat/_ban-do.cjs` tự nhận tệp mới trong các thư mục đã liệt kê.
7. **Trước khi đẩy**: `node 07-cai-dat/cai-dat.cjs <thư-mục-tạm> --ten "Thu nghiem" --kho` → `cd <tạm> && git init -q && node Log/kiem-harness.cjs` phải xanh (cảnh báo về chỗ trống `<...>` và `mocGoc` là bình thường).

## Bố cục kho
`00-nguyen-tac` luật nền · `01-playbook` 11 Bước + phasegate + review + checklist · `02-truy-vet` RTM + 15 mẫu artefact · `03-kiem-thu` 4 tầng kiểm thử · `04-cong-may` 17 công cụ · `05-hook-skill` 6+1 hook, 3 skill · `06-so-ghi` sổ mẫu · `07-cai-dat` bộ cài + bản đồ · `08-cap-nhat` công cụ nâng cấp, sổ đăng ký dự án, hướng dẫn · `09-goi/` (chưa có) gói theo loại dự án · `MO-TA-HARNESS.html` mô tả tương tác · `tomtat.md` ghi chú quyết định 17/10/2026 (việc còn chờ Huynh ở mục 8).
