# CHANGELOG — Harness

> Mỗi mục ghi đủ: **dự án nguồn** · **lớp** (*lõi chung* = mọi dự án · *gói `<loại>`* = dự án cùng loại · *riêng* = không đưa) · **bắt buộc / khuyến nghị** với dự án nhận · **tệp đổi** · **vì sao** (bằng chứng). Mục *bắt buộc* mà `cap-nhat.cjs` không tự làm được thì ghi rõ dự án nhận phải làm gì.
> Số bản: `VERSION`. PATCH sửa chữ / lỗi công cụ · MINOR thêm luật, công cụ, hook, skill, gói · MAJOR đổi cấu trúc thư mục, khoá `harness.config.json`, cách khai cổng.

## 1.1.0 — 2026-10-17 · cơ chế cập nhật hai chiều + tài liệu tương tác

Nguồn: phiên Harness 17/10/2026, theo hai cơ chế Huynh chốt (ghi ở `tomtat.md` mục 2) và tám cải tiến mục 4.

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | bắt buộc | `VERSION` · `CHANGELOG.md` | Chưa có số bản thì không dự án nào biết mình tụt bản; không có lịch sử thì không tra được vì sao luật đổi |
| lõi chung | bắt buộc | `07-cai-dat/_ban-do.cjs` (mới) · `07-cai-dat/cai-dat.cjs` (sửa) | Bản đồ chép tệp tách ra dùng chung cho cài và nâng cấp; bộ cài ghi `.harness-manifest.json` (bản + mã băm từng tệp) — cơ sở để nâng cấp không ghi đè phần dự án tự sửa (rủi ro 5 trong `tomtat.md`). Bộ cài nay chép **mọi** thư mục trong `05-hook-skill/skills/` |
| lõi chung | bắt buộc | `08-cap-nhat/cap-nhat.cjs` (mới) | Công cụ nâng cấp: chạy khô báo 4 nhóm (cập nhật được · thiếu · mẫu đổi · xung đột); `--ap-dung` chỉ ghi hai nhóm đầu; `--dang-ky` cho dự án cài tay. Thoát 2 khi có xung đột |
| lõi chung | khuyến nghị | `05-hook-skill/hooks/nhac-cap-nhat-harness.cjs` (mới) · `05-hook-skill/settings.json` (thêm `SessionStart`) | Cơ chế 2: nhắc lúc mở phiên khi có bản mới — đọc `VERSION` ở ổ máy, không có ổ (điện thoại) thì GitHub raw, chờ ≤2,5 s. Chỉ nhắc, không sửa. **Dự án đã gộp `settings.json` riêng: thêm khối `SessionStart` bằng tay** |
| lõi chung | khuyến nghị | `05-hook-skill/skills/cap-nhat-harness/SKILL.md` (mới) | Quy trình 4 bước kéo bản mới về dự án, Huynh gật mới áp dụng |
| lõi chung | khuyến nghị | `05-hook-skill/skills/dua-vao-harness/SKILL.md` (mới) | Cơ chế 1: 7 bước đưa bài học từ dự án vào kho — pull --ff-only (rủi ro 3), hỏi "chặn lỗi gì" (rủi ro 2), cài thử dự án trống (rủi ro 4), VERSION + CHANGELOG, đẩy GitHub kèm ghi chú theo khuôn, ghi Dev Book |
| lõi chung | khuyến nghị | `CLAUDE.template.md` (thêm 2 dòng lệnh) · `04-cong-may/kiem-harness.cjs` (thêm 2 cảnh báo) | Dự án biết hai câu lệnh mới; `kiem-harness` cảnh báo khi thiếu bảng kê / skill mới — cảnh báo, không chặn, để dự án cũ không đỏ |
| lõi chung | khuyến nghị | `08-cap-nhat/DU-AN-DANG-KY.json` · `08-cap-nhat/HUONG-DAN-CAP-NHAT.md` · `CLAUDE.md` (của kho) · `README.md §8` | Sổ đăng ký dự án nào bản nào; hướng dẫn cho phiên ở dự án khác / máy khác; CLAUDE.md để phiên mở ngay tại kho Harness biết luật sửa kho |
| lõi chung | khuyến nghị | `MO-TA-HARNESS.html` | Tài liệu tương tác một tệp: tóm tắt pipeline, ma trận 11 Bước, checklist phasegate từng Bước, 13 điều kiện máy, MVP × Round, mô hình dự án áp dụng + tech stack, 35 điểm can thiệp, từ điển viết tắt bấm được |

**Chưa làm, chờ Huynh quyết** (`tomtat.md` mục 8): đưa 8 bài học Mười Ngón vào lớp nào · 5 vai trợ lý vào lõi hay `~/.claude/agents` · bố cục workspace tối thiểu / đầy đủ · tạo gói `desktop-tauri`.

## 1.0.0 — 2026-10-16 · đóng gói lần đầu

Nguồn: dự án Thiên Số sau 4 MVP, nhiều Round. Commit `e72df72`.

- lõi chung · bắt buộc · toàn bộ `00-nguyen-tac/` `01-playbook/` `02-truy-vet/` `03-kiem-thu/` — Playbook 11 Bước, Phasegate (V1–V6 · R1–R8 · 13 điều kiện máy), Review Policy theo Round, Traceability 15 mắt xích, luật kiểm thử 4 tầng, 15 bài học thiết kế cổng.
- lõi chung · bắt buộc · `04-cong-may/` 17 công cụ `.cjs` + `day-len-may-chu.template.sh` — cổng máy, fail-closed, không gói npm.
- lõi chung · bắt buộc · `05-hook-skill/` 6 hook + skill `day-git` — Skill để NẠP, Hook để CHẶN.
- lõi chung · bắt buộc · `06-so-ghi/` sổ cấu hình + sổ ghi mẫu · `harness.config.json` · `CLAUDE.template.md` · `07-cai-dat/cai-dat.cjs`.
