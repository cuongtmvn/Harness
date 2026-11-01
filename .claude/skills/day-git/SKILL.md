---
name: day-git
description: Đẩy thay đổi của CHÍNH KHO GlobalHarness lên Git theo đúng 5 bước có kiểm chứng của skill day-git. Dùng khi Huynh gõ "đẩy git đi" / "đẩy GitHub đi" ở kho này, và ở Bước 6 của skill dua-vao-harness. Không merge, rebase, release.
---

# Đẩy git — bản cho kho GlobalHarness

Làm **đúng** các bước của skill chuẩn `02-enforcement/skills/day-git/SKILL.md` (đọc tệp đó trước), với hai khác biệt của kho này:

1. **Công cụ nằm ở `02-enforcement/tools/`**, không phải `Log/`: thay `node Log/<công cụ>.cjs` bằng `node 02-enforcement/tools/<công cụ>.cjs` — `moc-day-git.cjs` (sinh mốc sau 3 cổng), `ghi-vet-day-git.cjs` (ghi vết sau khi đẩy). Mốc và vết nằm ở `Log/` của kho và **chỉ lưu ở máy** (cả thư mục `Log/` bị bỏ qua khỏi git — nếu commit vết thì mỗi lần ghi vết lại phải tăng bản). Ở kho, `moc-day-git` và `ghi-vet-day-git` chạy **chế độ kho**: cổng kho `kiem-kho-phat-hanh.cjs` thay c2 / rtm-check.
2. **Chế độ ĐẦY ĐỦ** (đẩy GitHub là mục đích của kho) — thông điệp commit theo khuôn của skill `dua-vao-harness` Bước 6 (`harness <bản>: …` + từng mục + `Nguồn:`).

Thứ tự lệnh, mỗi lệnh một lượt gọi riêng (hook kiểm mốc **trước** khi lệnh chạy):
```bash
cd <kho> && git status --short && git pull --ff-only      # tệp dở của phiên khác: KHÔNG đưa vào, hỏi Huynh
cd <kho> && git add <từng tệp của việc này> && git diff --cached --name-only
cd <kho> && node 02-enforcement/tools/moc-day-git.cjs              # 3 cổng xanh ⇒ mốc 15 phút
cd <kho> && git commit -m "…" #DAY-GIT-BUOC-3             # hook đối chiếu mốc của CHÍNH kho này
cd <kho> && git push && node 02-enforcement/tools/ghi-vet-day-git.cjs
```
⛔ Không `#QUA-DAY-GIT`, không commit tay, không bỏ bước (luật `L-HARNESS-02` của dự án nguồn; Huynh 19/10/2026). Kẹt ⇒ dừng, báo Huynh.

## Chế độ NHÁNH (từ 2.0.0 — Huynh duyệt 01/11/2026: "Nhánh + pull request")

Thay đổi lớn của kho làm trên **nhánh riêng trong thư mục làm việc riêng** (`git worktree add -b harness-<bản> <thư mục> main`) — thư mục kho chính giữ nguyên `main`, nên hook mức máy và các dự án đang đọc thẳng kho không bị ảnh hưởng tới khi gộp.
- Năm bước như trên, chạy trong thư mục nhánh (`cd <thư mục nhánh>`); bước cuối đẩy **nhánh**, không đẩy main:
  ```bash
  cd <thư mục nhánh> && git push -u origin harness-<bản> && node 02-enforcement/tools/ghi-vet-day-git.cjs
  gh pr create --base main --head harness-<bản> --title "harness <bản>: …" --body "<trùng mục CHANGELOG>"
  ```
- ⛔ **Không tự gộp vào main**, không `--force`. Huynh xem pull request rồi gộp; sau khi gộp: ở thư mục kho chính `git pull --ff-only`, gắn nhãn bản (`git tag v<bản>` + `git push origin v<bản>`), rồi gỡ thư mục nhánh (`git worktree remove`).
- Trước khi gộp một bản đổi cấu trúc, gắn nhãn bản cũ trên main (`v<bản cũ>`) để dự án nào cần cài lại bản cũ vẫn lấy được.
