# HƯỚNG DẪN CẬP NHẬT — cho phiên AI ở dự án khác, máy khác, hoặc ngay tại GlobalHarness

> **GlobalHarness** = kho dùng chung (thư mục `<Harness>`, repo `cuongtmvn/Harness`). **ProjectHarness** = bản cài trong từng dự án, chỉ tác dụng trong dự án đó. Quy ước lệnh (từ 1.5.0): *"cập nhật harness"* không nói gì thêm = tầng **ProjectHarness** (sửa harness dự án, kể cả kéo bản GlobalHarness mới về) · *"cập nhật GlobalHarness"* (câu cũ *"đưa vào harness"*) = tầng **GlobalHarness**, chỉ khi Huynh nói rõ. GlobalHarness đổi bản ⇒ hook `SessionStart` và `kiem-harness` của mọi dự án cảnh báo, kèm số mục **bắt buộc**.

> Đọc tệp này khi: (a) hook mở phiên báo *"Harness có bản mới"*; (b) Huynh bảo *"đưa vào harness"* / *"cập nhật harness"*; (c) phiên mở trong chính kho `Harness` và cần sửa kho. Luật đầy đủ ở hai skill `02-enforcement/skills/cap-nhat-harness` và `dua-vao-harness`; tệp này là bản đồ ngắn.

## 1. Ba thứ luôn phải biết

| Thứ | Ở đâu | Lệnh xem |
|---|---|---|
| Bản GlobalHarness mới nhất | `VERSION` ở kho · GitHub `cuongtmvn/Harness` nhánh `main` | `cat <Harness>/VERSION` |
| Bản dự án đang dùng | `<dự án>/.harness-manifest.json › harnessVersion` | `node -p "require('./.harness-manifest.json').harnessVersion"` |
| Gì đổi giữa hai bản | `CHANGELOG.md` ở kho, mục mới trên cùng | đọc từ bản đang dùng tới bản mới |

Kho ở đâu trên máy này: `.harness-manifest.json › harnessPath`. Không có ổ (phiên điện thoại, máy ảo) ⇒ `git clone https://github.com/cuongtmvn/Harness.git` vào thư mục tạm; mọi lệnh `<Harness>/…` dùng đường dẫn đó.

## 2. Hai chiều, hai câu lệnh

```
   ProjectHarness  ──"đưa vào harness"──▶  GlobalHarness  ──đẩy GitHub kèm ghi chú──▶  GitHub
   ProjectHarness  ◀──"cập nhật harness"──  GlobalHarness  ◀──git pull──────────────  GitHub
                 ▲
     hook SessionStart nhắc khi VERSION kho > bản dự án (chỉ nhắc)
```

| Chiều | Skill | Công cụ | Kết quả phải có |
|---|---|---|---|
| ProjectHarness → GlobalHarness | `dua-vao-harness` | `git pull --ff-only` · cài thử `cai-dat.cjs` vào thư mục trống · `kiem-harness.cjs` | `VERSION` tăng · mục mới trong `CHANGELOG.md` · commit theo khuôn `harness <bản>: …` đã lên `origin/main` · Dev Book dự án gốc ghi vết |
| GlobalHarness → ProjectHarness | `cap-nhat-harness` | `node <Harness>/08-update/cap-nhat.cjs <dự án>` rồi `--ap-dung` | bảng kê lên bản mới · `kiem-harness` xanh · không tệp xung đột nào bị ghi đè · Dev Book ghi vết · `DU-AN-DANG-KY.json` đổi `banDangDung` |

## 3. Dự án chưa có bảng kê (cài tay, bản 1.0.0)

```bash
node <Harness>/08-update/cap-nhat.cjs <dự án> --dang-ky   # dựng .harness-manifest.json, không ghi đè gì
node <Harness>/08-update/cap-nhat.cjs <dự án>             # xem trước, chưa ghi (dry run): gì sẽ đổi
node <Harness>/08-update/cap-nhat.cjs <dự án> --ap-dung   # sau khi Huynh gật
```
Tệp dự án **khác** harness được ghi nhận là *bản riêng*: về sau harness đổi tệp đó thì công cụ báo xung đột, không ghi đè. Commit `.harness-manifest.json` vào dự án.

## 4. Bốn điều không được làm, dù ai bảo

1. **Không ghi đè tệp dự án đã tự sửa** — xung đột thì trình diff, Huynh gộp.
2. **Không đẩy GlobalHarness mà thiếu `VERSION` tăng + mục `CHANGELOG.md`** — commit không có ghi chú là commit không tra cứu được.
3. **Không sửa luật quản AI trong kho** (dây cương, 7 điều dừng, cổng, `reviewPolicy`, hook) mà không khai *"CULI được lợi nếu nới"* và chờ Huynh — điều dừng 5.
4. **Không cập nhật giữa một Bước đang dở** của dự án — chờ đóng Bước hoặc Huynh cho phép.

## 5. Lớp của một bài học — quyết trước khi viết

| Lớp | Nghĩa | Đặt ở |
|---|---|---|
| **Lõi chung** | mọi dự án, mọi loại | `00`–`07` |
| **Gói `<loại>`** | chỉ dự án cùng loại (`web`, `desktop-tauri`, `mobile`…) | `09-packs/<loại>/` (tạo khi có bài học đầu) |
| **Riêng** | chỉ đúng cho một dự án | ở lại dự án, ⛔ không đưa |

Không trả lời được *"chặn lỗi gì / tiết kiệm gì"* thì không đưa. Mặc định là **gói**, không mặc định lõi.

## 6. Nâng một dự án từ 1.x lên 2.0 — chỉ khi chủ dự án yêu cầu

Dự án chưa yêu cầu thì **vẫn chạy bản đã cài** (bản chép trong dự án); hook `nhac-cap-nhat-harness` chỉ nhắc có bản mới, không đổi gì.

1. **Chọn lúc giữa hai Bước** (tốt nhất giữa hai MVP / Round), cây làm việc sạch: `git status --short` không có tệp dở.
2. **Xem trước:** `node <Harness>/08-update/cap-nhat.cjs <dự án>` — đọc mục 🔀 ĐỔI TÊN (6 tệp luật + `Instructions/goi` → `Instructions/packs`), ⬆️ CẬP NHẬT ĐƯỢC, ⛔ XUNG ĐỘT.
3. **Áp dụng (chủ dự án gật):** thêm `--ap-dung`. Công cụ đổi tên tệp **giữ nguyên nội dung dự án** (kể cả phần dự án tự sửa — thành xung đột, không ghi đè), chuyển bảng kê theo tên mới, thay tên cũ → mới trong `harness.config.json`, `Instructions/LUAT-DANGKY.json`, `CLAUDE.md`.
4. **Gộp tay phần riêng của dự án** (nhóm `rieng`, công cụ chỉ báo "mẫu đổi"):
   - `.claude/settings.json`: gộp khối `SessionStart` / `UserPromptSubmit` / `Stop` / `SessionEnd` của hook `ghi-so-gio.cjs` và khối `permissions.ask` từ mẫu `02-enforcement/settings.json` (hạ tầng gác — điều dừng 5, chủ dự án duyệt).
   - `harness.config.json`: thêm khối `doGio` (`phutNghi: 15`); thêm các tệp luật mới vào `tepLuat.danhSach` (`B2-EXTERNAL-TOOLS.md`, `B4-RULEBOOK.md`, `B5-SESSIONS.md`, `RULE-TREE.md`, `B3-DOC-HEALTH.md`, `UT/IT-SIT/UAT-RULES.md`).
   - `Instructions/LUAT-DANGKY.json`: thêm cột cây luật (`nhanh`, `phamVi`, `apDung`, `soGhiVet`) cho luật của dự án; luật mới của 2.0 lấy từ `03-records/LUAT-DANGKY.json` (`themBan: "2.0.0"`).
   - `CLAUDE.md`: thay "Playbook 11 bước" bằng "quy trình SDLC 11 bước"; trỏ tới `Instructions/RULE-TREE.md`.
4b. Gộp xong tệp nào (mẫu đổi hoặc xung đột) thì ghi nhận: `node <Harness>/08-update/cap-nhat.cjs <dự án> --da-gop <tệp>` — `kiem-harness` thôi nhắc tệp đó.
5. **Kiểm:** `node Log/kiem-harness.cjs` xanh (cảnh báo phần 2.0 chưa gộp là bình thường tới khi gộp xong) · `node Log/kiem-luat.cjs --mat --trung` sạch · `node Log/kiem-luat.cjs --cot` xem ô trống.
6. Đẩy git qua skill day-git; cập nhật `08-update/DU-AN-DANG-KY.json` (thông điệp `sổ đăng ký: …`).

**Quay lại bản cũ:** GlobalHarness gắn nhãn `v1.7.0` trên main trước khi gộp 2.0 — `git -C <Harness> worktree add <thư mục tạm> v1.7.0` rồi chạy `cap-nhat.cjs` của bản đó; hoặc `git revert` commit nâng bản của dự án.
