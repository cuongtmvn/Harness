---
name: day-git
description: Đẩy thay đổi của CHÍNH KHO GlobalHarness lên Git theo đúng 5 bước có kiểm chứng của skill day-git. Dùng khi Huynh gõ "đẩy git đi" / "đẩy GitHub đi" ở kho này, và ở Bước 6 của skill dua-vao-harness. Không merge, rebase, release.
---

# Đẩy git — bản cho kho GlobalHarness

Làm **đúng** các bước của skill chuẩn `05-hook-skill/skills/day-git/SKILL.md` (đọc tệp đó trước), với hai khác biệt của kho này:

1. **Công cụ nằm ở `04-cong-may/`**, không phải `Log/`: thay `node Log/<công cụ>.cjs` bằng `node 04-cong-may/<công cụ>.cjs` — `moc-day-git.cjs` (sinh mốc sau 3 cổng), `ghi-vet-day-git.cjs` (ghi vết sau khi đẩy). Mốc và vết nằm ở `Log/` của kho (`Log/.moc-day-git.json` bị bỏ qua khỏi git; `Log/DAYGIT-LOG.ndjson`, `Log/CHAN-GIT-COMMIT.ndjson` được commit).
2. **Chế độ ĐẦY ĐỦ** (đẩy GitHub là mục đích của kho) — thông điệp commit theo khuôn của skill `dua-vao-harness` Bước 6 (`harness <bản>: …` + từng mục + `Nguồn:`).

Thứ tự lệnh, mỗi lệnh một lượt gọi riêng (hook kiểm mốc **trước** khi lệnh chạy):
```bash
cd <kho> && git status --short && git pull --ff-only      # tệp dở của phiên khác: KHÔNG đưa vào, hỏi Huynh
cd <kho> && git add <từng tệp của việc này> && git diff --cached --name-only
cd <kho> && node 04-cong-may/moc-day-git.cjs              # 3 cổng xanh ⇒ mốc 15 phút
cd <kho> && git commit -m "…" #DAY-GIT-BUOC-3             # hook đối chiếu mốc của CHÍNH kho này
cd <kho> && git push && node 04-cong-may/ghi-vet-day-git.cjs
```
⛔ Không `#QUA-DAY-GIT`, không commit tay, không bỏ bước (luật `L-HARNESS-02` của dự án nguồn; Huynh 19/10/2026). Kẹt ⇒ dừng, báo Huynh.
