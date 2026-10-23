## Harness — luật mức máy (mọi dự án trên máy này)

**GlobalHarness** = `{{HARNESS}}` (repo `cuongtmvn/Harness`), bộ luật điều hành AI dùng chung. **ProjectHarness** = bản cài từ đó vào từng dự án, nhận ra bằng tệp `.harness-manifest.json` ở gốc dự án.

Khi Huynh nói *"nạp context"* (hoặc mở phiên làm việc ở một dự án), **trước khi đọc luật của dự án**:
1. Kiểm `.harness-manifest.json`. **Có** ⇒ so `harnessVersion` với `VERSION` của GlobalHarness, báo bản và số mục bắt buộc chưa nhận (`CHANGELOG.md`), rồi nạp context theo `CLAUDE.md` dự án.
2. **Không có** ⇒ dự án chưa có ProjectHarness. Báo Huynh **đầu tiên**, đọc `CLAUDE.md` + `README.md` + mục trên cùng `CHANGELOG.md` của GlobalHarness, rồi đề xuất: dự án mới ⇒ cài (`07-cai-dat/cai-dat.cjs`); dự án có luật chép tay (bố cục cũ, hậu tố riêng, không có `harness.config.json`) ⇒ di trú. ⛔ Không coi luật chép tay là harness hiện hành; ⛔ không tự cài / di trú khi Huynh chưa gật.
3. Ngoại lệ có chủ ý (ví dụ Thiên Số) ghi ở `08-cap-nhat/DU-AN-DANG-KY.json` — làm theo ghi chú ở đó.
4. **Dự án mới** — kể cả tạo từ phiên điện thoại / cloud: cài từ GlobalHarness, ⛔ không chép tay bộ luật của dự án khác.

Cưỡng chế: hook `SessionStart` mức máy `{{HARNESS_POSIX}}/07-cai-dat/muc-may/kiem-project-harness.cjs` tự bơm cảnh báo khi thiếu bảng kê. Phiên cloud / điện thoại không có `~/.claude` của máy ⇒ gác bằng skill claude.ai `kiem-harness-du-an` (`07-cai-dat/muc-may/skill-claude-ai/`).
