# PROJECT TREE — Cây tệp và thư mục mặc định của một dự án cài harness

> **Nhánh A · Pipeline rules** (`RULE-TREE.md`). Bản 2.0 (M11): bộ cài tạo **đủ** cây này ngay khi khởi tạo dự án. Tệp chưa có thông tin vẫn có mặt, dòng trạng thái ghi *"Chưa có thông tin"* hoặc còn chỗ trống `<...>` — để ai mở dự án cũng thấy **tệp nào sẽ chứa gì, điền ở Bước nào**.
> Tên thư mục lấy từ `harness.config.json › thuMuc` (mặc định dưới đây).

```
<dự án>/
├── CLAUDE.md                     luật luôn đúng, nạp mỗi phiên — bản đồ chỉ đường tới các tệp dưới
├── harness.config.json           cấu hình duy nhất mọi công cụ đọc (thư mục, cổng, reviewPolicy, CSDL thật, sổ giờ…)
├── .harness-manifest.json        bảng kê mã băm: tệp nào cài từ GlobalHarness bản nào — cap-nhat.cjs dựa vào đây
├── .claude/
│   ├── settings.json             hook + quyền (allow / ask) — hạ tầng gác, AI không sửa
│   ├── hooks/                    hook chặn việc cấm, ghi sổ giờ, ghi mốc công cụ
│   ├── skills/                   day-git · cap-nhat-harness · dua-vao-harness · bao-cao-html
│   └── agents/                   vai trợ lý: tester · tra-cuu · ve-hinh · viet-noi-dung · dung-tai-nguyen
├── Instructions/                 LUẬT (chỉ đọc khi làm việc; sửa = điều dừng 5)
│   ├── RULE-TREE.md              cây luật: nhánh nào ở tệp nào, thế nào là "đủ"
│   ├── B1-AI-AUTHORITY.md … B5-SESSIONS.md   luật chung theo nhánh B1–B5
│   ├── PIPELINE.md · PHASEGATE.md · REVIEW-POLICY.md · PROJECT-TREE.md   luật pipeline
│   ├── UT-RULES.md · IT-SIT-RULES.md · UAT-RULES.md                        luật kiểm thử
│   ├── checklist/B00–B10.md      checklist từng Bước
│   ├── packs/<loại>/             luật theo loại dự án (desktop, desktop-tauri…) nếu khai trong config
│   ├── LUAT-DANGKY.json          sổ đăng ký luật (nhánh · neo · cưỡng chế · sổ ghi vết)
│   ├── LEASH-BANG.json           bảng dây cương A / A+
│   ├── PHAM-VI-MVP.json          mục tiêu NGUYÊN VĂN của chủ dự án theo MVP
│   └── PHU-MOI-TRUONG.json       môi trường đã đo cho từng phép kiểm
├── Output/                       SẢN PHẨM TÀI LIỆU từng Bước (tệp có sẵn từ đầu, điền dần)
├── Log/                          công cụ cổng (.cjs) + sổ máy ghi (ndjson) + bản khai cổng
│   ├── cong-buoc/ · khai-round/  bản khai cổng từng Bước, khai Round
│   └── so-gio/                   sổ giờ mỗi phiên (chỉ thời điểm)
└── App/                          mã nguồn (bắt đầu ở Bước 8) · App/tests/ ca kiểm thử
```

## Output/ — tài liệu nào, điền ở Bước nào

| Tệp | Chứa gì | Điền ở |
|---|---|---|
| SCOPE.md | Phạm vi MVP: trong / ngoài phạm vi, điều kiện bung lại | Bước 0 |
| SPEC.md | Đặc tả: user story, tiêu chí chấp nhận (AC), yêu cầu phi chức năng (NFR) | Bước 1 |
| BACKLOG.md | §A tính năng có mã `PB-` · §B việc đã quyết hoãn có mã `BL-` | Bước 1, cập nhật mọi Bước |
| ARCH.md | Kiến trúc, quyết định kiến trúc `D-ARCH-` | Bước 2 |
| MODULEMAP.md | Bản đồ module và phân tầng | Bước 2 |
| WBS.md | Chẻ việc rolling-wave, mã work item | Bước 4 |
| EST.md | Ước lượng | Bước 5 |
| RISK.md | Sổ rủi ro L×I | Bước 6 |
| DOR.md | Điều kiện được bắt đầu viết mã | Bước 7 |
| DELEGATION-MAP.md | Chính sách uỷ quyền cho AI theo loại việc | Bước 0–7 |
| RTM.md | Ma trận truy vết Scope → Requirement → Design → Plan → Code → Test → Release | Từ Bước 1, cập nhật mọi Bước |
| SITUAT.md | Hồ sơ kiểm thử IT · SIT · UAT | Bước 8–9 |
| TELEMETRY.md | Số đo vận hành | Bước 9–10 |
| WEEKLY.md | Báo cáo tuần | Hằng tuần |
| DEVBOOK.md | Quyết định của chủ dự án (nguyên văn) và bài học | Mọi Bước |
| **GHI-CHU-CHU-DU-AN.md** | Ghi chú của chủ dự án gắn một Bước (phát hiện UAT, quan điểm giữ cho Round sau) — **cổng vào bắt buộc đọc** (gate-check (n)) | Khi chủ dự án ghi |

## Log/ — sổ máy ghi (AI không sửa tay)

| Sổ | Ghi gì |
|---|---|
| CHO-QUYET.ndjson | **Sổ chờ quyết** — quyết định chủ dự án chưa đưa ra; `V6.chuaQuyet` nêu mã trong sổ này |
| PHASE-GATE-LOG.ndjson | Bản ghi mở / đóng Bước, mở Round |
| DAYGIT-LOG.ndjson | Mỗi lần đẩy git qua day-git |
| HOOK-EVENTS.ndjson | Mốc mỗi lần gọi công cụ |
| so-gio/<phiên>.ndjson | Sổ giờ: bắt đầu phiên · gửi tin · AI xong · kết thúc (không nội dung) |
| PROOF-LOG.ndjson | Bằng chứng chạy thật |
| CHAN-*.ndjson | Lần hook chặn (commit tay, ghi đè luật, ghi CSDL thật) |
| TASKLIST.md | Danh sách việc cấp 3 của Bước đang mở |
