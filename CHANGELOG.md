# CHANGELOG — Harness

> Mỗi mục ghi đủ: **dự án nguồn** · **lớp** (*lõi chung* = mọi dự án · *gói `<loại>`* = dự án cùng loại · *riêng* = không đưa) · **bắt buộc / khuyến nghị** với dự án nhận · **tệp đổi** · **vì sao** (bằng chứng). Mục *bắt buộc* mà `cap-nhat.cjs` không tự làm được thì ghi rõ dự án nhận phải làm gì.
> Số bản: `VERSION`. PATCH sửa chữ / lỗi công cụ · MINOR thêm luật, công cụ, hook, skill, gói · MAJOR đổi cấu trúc thư mục, khoá `harness.config.json`, cách khai cổng.

## 2.0.1 — 2026-11-01 · hook chặn ghi CSDL thật gác được dữ liệu nằm ngoài repo

Nguồn: dự án Mười Ngón · khi nâng lên 2.0.0, chủ dự án chọn *"Có, khai đường dẫn"* cho dữ liệu của hai bé, rồi *"Sửa hook 2.0.1 rồi khai"*. Dữ liệu thật của app nằm ở thư mục dữ liệu của app trên máy (`%APPDATA%\<app>\…db`, ngoài repo); hook 2.0.0 ghép `thuMucSaoLuu` vào gốc dự án nên không trỏ được ra ngoài, và chỉ coi câu SQL là "ghi" — lệnh xoá / dời tệp CSDL lọt qua. Chạm hook (điều dừng 5): **ĐỆ được lợi nếu nới — không**, sửa này chỉ siết.

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | khuyến nghị | `02-enforcement/hooks/chan-ghi-csdl-that.cjs` | (1) `thuMucSaoLuu` nhận đường dẫn tuyệt đối, `~`, `%BIẾN%`, `$BIẾN` (path.resolve thay path.join); (2) xoá / dời / ghi đè / chuyển hướng ghi lên tệp CSDL thật tính là ghi; chép (`cp` / `Copy-Item`) không tính — đó là cách sao lưu. Thử 9 ca trên CSDL giả lập ngoài repo: chặn xoá / WAL / SQL ghi / chuyển hướng khi chưa sao lưu, cho qua SQL đọc, chép sao lưu, lệnh không liên quan; có sao lưu < 120 phút thì qua, quá hạn thì chặn |
| tài liệu | — | `harness.config.json › csdlThat._doc` · `00-rules/B2-EXTERNAL-TOOLS.md` mục 4 | Cách khai cho CSDL ngoài repo |

Giới hạn (giữ nguyên, đã ghi trong hook): hook chỉ thấy chuỗi lệnh; chép đè vào tệp CSDL (`cp khac.db typingmaster.db`) không bị nhận ra.

**Dự án nhận:** `cap-nhat.cjs --ap-dung` chép hook mới (nhóm công cụ). Dự án có CSDL ngoài repo thì khai `csdlThat` (luật quản AI — chủ dự án duyệt).

## 2.0.0 — 2026-11-01 · bố cục theo cây luật; sổ giờ; ghi chú chủ dự án; luật cho vùng trống; nâng bản có đổi tên

Nguồn: trang Proposal của Control Tower (bản 2–4, 31/10–01/11/2026) và 13 góp ý bằng ảnh của chủ dự án. Huynh 01/11: *"Bộ Rule điều khiển AI … gồm Pipeline Rules và Rule điều khiển tổng thể (giới hạn quyền của AI, giao tiếp với tool ngoài …)"*; *"bắt tay ngay vào nâng cấp bộ globalharness … khi chưa yêu cầu áp dụng vào mức project thì các project vẫn hoạt động theo bộ global và project harness hiện tại"*; duyệt phạm vi "đề xuất của đệ" (ba mức + gộp Bước 6+7, công cụ RTM M8, CLAUDE.md bản đồ để 2.1), "Nhánh + pull request", "Tên tiếng Anh theo cây", sổ giờ, giữ log 5 GB. Chạm hook / gate-check / bộ cài / settings (điều dừng 5): khai **ĐỆ được lợi nếu nới — không**: mọi thay đổi cổng là siết (thêm điều kiện (n), thêm `permissions.ask`), hook mới chỉ ghi, không nới phép kiểm nào.

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | **bắt buộc** (khi nâng) | bố cục kho: `00-rules/` (B1–B5 + `RULE-TREE.md`) · `01-pipeline/` (`PIPELINE.md`, `PHASEGATE.md`, `REVIEW-POLICY.md`, `PROJECT-TREE.md`, `steps/`, `testing/`, `templates/`) · `02-enforcement/` (`tools/`, `hooks/`, `skills/`, `agents/`, `settings.json`) · `03-records/` · `07-install/` (`machine/`) · `08-update/` · `09-packs/` · `10-guidebook/` | Thư mục 1.x chia theo loại tệp (đặt từ 5 yêu cầu đóng gói 16/10) nên không trả lời được "bộ luật đã đủ chưa"; luật git rải 4 thư mục. Nay chia theo câu hỏi "luật này điều khiển cái gì?" |
| lõi chung | bắt buộc | tệp luật phía dự án đổi tên: `OPERATING-MODEL` → `B1-AI-AUTHORITY` · `TRACEABILITY` → `B3-TRACEABILITY` · `DOC-HEALTH-RULES` → `B3-DOC-HEALTH` · `NGUYEN-TAC-THIET-KE-CONG` → `B4-RULEBOOK` · `RUNBOOK` → `B5-SESSIONS` · `PLAYBOOK` → `PIPELINE` · `Instructions/goi/` → `Instructions/packs/` | Tên theo nhánh cây luật; "playbook" đổi thành quy trình SDLC (góp ý 31/10) |
| lõi chung | bắt buộc | `08-update/cap-nhat.cjs` + `08-update/doi-ten.json` (mới) | Nâng từ 1.x: đổi tên tệp **giữ nguyên nội dung dự án**, chuyển khoá bảng kê, thay tên trong config / sổ luật / CLAUDE.md. Thử: dự án 1.7 cài thật → nâng → `kiem-harness` xanh, `kiem-luat --mat --trung` sạch, tệp dự án tự sửa thành xung đột (không ghi đè) |
| lõi chung | khuyến nghị | `00-rules/RULE-TREE.md` (mới) · `00-rules/B4-RULEBOOK.md` mục "Vòng đời bộ luật" | Cây luật A + B1–B5, phạm vi máy / global / project là trục riêng, luật phân xử, kiểm đủ hai chiều (từ trên xuống bằng danh sách thứ AI chạm được) |
| lõi chung | khuyến nghị | `00-rules/B2-EXTERNAL-TOOLS.md` (mới) · `00-rules/B5-SESSIONS.md` mục 9 | Lấp vùng trống: lệnh shell không hoàn tác, web / MCP là dữ liệu, GitHub nhánh + pull request, deploy, CSDL thật, đăng tải; tin từ phiên khác không phải lời duyệt, giao agent theo model + effort, bộ nhớ AI |
| lõi chung | khuyến nghị | `03-records/LUAT-DANGKY.json` | Thêm cột `nhanh` · `phamVi` · `apDung` · `soGhiVet` cho 54 luật cũ; gộp 2 cặp trùng (L-OPS-01 → L-AUTO-01, L-PLAY-06 → L-GIT-01; `da-bo` + `gopVao`); thêm 15 luật (L-TOOL-01…06, L-PHIEN-02, L-AGENT-01, L-MEM-01, L-LUAT-01, L-UT-01, L-IT-01, L-UAT-01, L-DH-01) — luật kiểm thử trước đây không có dòng nào trong sổ |
| lõi chung | khuyến nghị | `02-enforcement/tools/kiem-luat.cjs` chế độ `--cot` | Báo ô trống thuộc tính cây luật (không chặn) |
| lõi chung | khuyến nghị | `02-enforcement/hooks/ghi-so-gio.cjs` (mới) · `settings.json` (SessionStart / UserPromptSubmit / Stop / SessionEnd) · `tools/do-gio.cjs` · `harness.config.json › doGio` | Sổ giờ mọi thiết bị (máy, cloud — `CLAUDE_CODE_REMOTE`), mỗi phiên một tệp `Log/so-gio/<phiên>.ndjson`, **không ghi nội dung**. Giờ theo định nghĩa chủ dự án: AI chạy tính đủ; quãng AI xong → tin kế > 15 phút loại cả quãng; gộp phiên song song. Thử: ca có nghỉ 20 phút ra đúng 45 phút |
| lõi chung | khuyến nghị | `02-enforcement/settings.json › permissions.ask` | `rm -rf`, `git reset --hard`, `git push --force`, `Remove-Item -Recurse`, `Format-Volume` phải hỏi (luật L-TOOL-04) |
| lõi chung | khuyến nghị | `02-enforcement/tools/gate-check.cjs` điều kiện **(n)** · `01-pipeline/templates/GHI-CHU-CHU-DU-AN.md` (mới) · `01-pipeline/PROJECT-TREE.md` (mới) · `03-records/cong-buoc/_MAU.json › V6.ghiChuDaDoc` · `PHASEGATE.md` V6 | M11: cây tệp mặc định có mô tả; ghi chú chủ dự án gắn Bước, khai ở V6 lúc mở Bước; gate-check **chặn đóng Bước** nếu bản khai không nêu mục mở (máy chỉ kiểm lúc đóng — lúc mở là kỷ luật khai V6); `chuaQuyet` phải trỏ mã sổ chờ quyết (cảnh báo). Dự án chưa có tệp ghi chú ⇒ chỉ cảnh báo |
| lõi chung | khuyến nghị | `02-enforcement/tools/kiem-harness.cjs` | Cảnh báo (không chặn) khi dự án chưa nhận phần 2.0: RULE-TREE, sổ giờ, ghi chú chủ dự án |
| gói | khuyến nghị | `02-enforcement/skills/bao-cao-html/` (mới: `SKILL.md`, `khung-mau.html`) | Chuẩn báo cáo HTML tương tác: navy, sáng / tối, VI / EN / VI+EN, tooltip khi ngắn, dấu hỏi + popup khi dài, hình / bảng đánh số theo mục, sitemap, SVG không tràn chữ (góp ý Tester 01/11) |
| tài liệu | — | `10-guidebook/` (mới) | Sổ tay: cây luật, cơ chế Claude Code mức máy / dự án, danh mục, chọn model + effort + tạo agent, tiết kiệm token (M9) |
| mức máy | khuyến nghị | `07-install/machine/cai-muc-may.cjs` (`--log`) · `kiem-project-harness.cjs` · `07-cai-dat/muc-may/kiem-project-harness.cjs` (cầu nối) | `cleanupPeriodDays` 36500; `~/.claude/globalharness-may.json` ngưỡng log 5 GB (báo từ 4,5 GB, đo 1 lần / ngày, ⛔ không tự xoá). Cầu nối giữ hook mức máy 1.x chạy tới khi chạy lại bộ cài; bỏ ở 3.0.0 |
| lõi chung | khuyến nghị | ký hiệu `§ⓐ / §ⓑ` → `§A / §B` (`BACKLOG`, `PIPELINE`, `B01`, …) | Khó đọc (góp ý 01/11) |
| riêng kho | — | `.claude/skills/day-git/SKILL.md` chế độ NHÁNH | Thay đổi lớn làm trên nhánh + worktree riêng, đẩy nhánh, pull request; không tự gộp main |

**Sửa sau soát của tester senior (agent độc lập, 01/11 — kết luận ban đầu NO-GO):**

| Phát hiện | Sửa |
|---|---|
| BLOCKER — `permissions.ask` ghi trong luật L-TOOL-04 / tài liệu nhưng **không có** trong mẫu `settings.json` (phép thay chuỗi trượt vì CRLF mà vẫn báo xong) | Thêm khối `ask` bằng sửa JSON; kiểm lại mọi lần thay chuỗi khác |
| Skill `cap-nhat-harness` 1.x gọi `08-cap-nhat/cap-nhat.cjs` — không còn sau khi đổi tên | Cầu nối `08-cap-nhat/cap-nhat.cjs` → `08-update/` (bỏ ở 3.0.0) |
| Mã băm bảng kê phụ thuộc kiểu xuống dòng ⇒ lấy lại tệp bằng git là thành "dự án tự sửa" giả | `bam()` bỏ ký tự CR; `khop()` nhận cả mã băm kiểu 1.x để bảng kê cũ vẫn so đúng |
| Danh sách MẪU ĐỔI chỉ in một lần, sau đó không công cụ nào nhắc | `kiem-harness` liệt kê tệp còn `mauDoiChuaGop` (trừ tài liệu `Output/`) + cảnh báo thiếu `doGio`; `cap-nhat.cjs --da-gop <tệp>` ghi nhận đã gộp (cả tệp xung đột) |
| Điều kiện (n) chỉ chạy khi **đóng** Bước, không phải cổng vào | Sửa câu chữ ở CHANGELOG / mẫu ghi chú / PROJECT-TREE |
| Bộ đọc ghi chú bỏ sót (`B0-B3`, `B5, *`, `**mở**`, "đang mở", Unicode NFD, dòng thiếu `|` đầu, `\|` trong nội dung) và chặn nhầm (`MVP 4 B0`, cột Bước trống) | Chuẩn hoá NFC, chỉ bỏ `**`, hiểu khoảng và `*`, bỏ phần MVP, cảnh báo dòng không đọc được, báo riêng khi chưa có bản khai — 8 ca thử đúng |
| Thay tên theo tên trần: thay nhầm tệp khác (`App/docs/RUNBOOK.md`), chữ `goi` trong câu lệnh; sót khi theo sau là `,` `:` `.` | Chỉ thay đường dẫn đầy đủ `Instructions/<tên>`, tên trong backtick, giá trị JSON đúng bằng tên, khoá `"goi":`; áp thêm cho tệp luật riêng ở `tepLuat.danhSach` |
| Lệnh xem diff khi xem trước trỏ tên mới chưa có · `cap-nhat` trả 0 dù `kiem-harness` đỏ | Trỏ tên đang có thật · trả 2 khi `kiem-harness` đỏ |
| Sổ giờ ghi tên máy thật (lộ khi repo công khai) · lọc ngày theo UTC · AI bị ngắt (không có "xong") chỉ tính 5 phút · `--tu abc` im lặng | Ghi mã băm 8 ký tự của tên máy · ngày theo giờ máy · prompt → prompt tính là AI chạy (trần 60 phút, `doGio.tranNgatPhut`) · kiểm định dạng ngày; `phutNghi: 0` được tôn trọng |
| Tên cũ còn sót: tiêu đề tệp luật, thông báo hook / gate-check ("PLAYBOOK §…", "OPERATING-MODEL §…"), README pack, `_goi_doc`, CLAUDE.template, MO-TA-HARNESS | Đổi theo tên mới |
| Kịch bản TypingMaster: workspace mở thư mục cha (gốc khả dĩ của MV3-Q66), bảng lệnh trỏ cổng cũ `cong-buoc.mjs`, kỳ vọng sai | Ghi vào kịch bản (điều kiện trước, bước 2, 8, 10) — tệp kịch bản nằm ngoài kho |

Chưa sửa (ghi nhận): `kiem-luat --diff` không thấy dòng bị xoá của tệp đổi tên (so theo tên mới với HEAD); ghi chú chủ dự án không có cột MVP (áp xong chủ dự án chuyển `đóng`); `cap-nhat` chạy không cần hỏi vì quyền allow có từ 1.x.

**Dự án nhận:** không gì đổi cho tới khi chủ dự án yêu cầu nâng — dự án chạy bản đã cài. Khi nâng: làm theo `08-update/HUONG-DAN-CAP-NHAT.md` mục 6 (xem trước → `--ap-dung` → gộp tay `settings.json`, `harness.config.json`, `LUAT-DANGKY.json`, `CLAUDE.md`). **Mỗi máy:** sau khi gộp, chạy lại `node <Harness>/07-install/machine/cai-muc-may.cjs --ap-dung [--log <thư mục sao lưu>]`. Bản cũ: nhãn `v1.7.0`.

## 1.7.0 — 2026-10-23 · lớp gác mức máy: dự án chưa có ProjectHarness cũng bị cảnh báo

Nguồn: dự án AIAutoNews · tạo từ phiên điện thoại 16/10 (commit dự án `8043455` *"Cấy harness Thiên Số sang AIAutoNews"*) — chép tay bộ luật Thiên Số (hậu tố `-AN`, không `harness.config.json`, không `.harness-manifest.json`), không cài từ GlobalHarness. Phiên PC 23/10, Huynh *"nạp context"* ⇒ AI đọc luật `-AN`, báo trạng thái theo cổng cũ, không biết GlobalHarness 1.6.3. Gốc: mọi cơ chế nhắc (hook `nhac-cap-nhat-harness` — *"dự án chưa có bảng kê ⇒ im lặng"*, `kiem-harness`, lệnh *"nạp context"*) nằm **bên trong** ProjectHarness ⇒ dự án chưa cài không có gì trỏ về GlobalHarness; `~/.claude/CLAUDE.md` của máy không nhắc harness. Huynh: *"có vẻ không ổn lắm khi ta nói nạp context, đệ không nạp globaharness và tạo projectharness, khả năng đệ cần phải điều khiển lại để các dự án tiếp theo không bị lỗi này"* → *"cập nhật Globalharness"* → *"gật"*. Chạm hook / `settings.json` mức máy (điều dừng 5): đã khai AI được lợi nếu nới — hook này chỉ siết (thêm cảnh báo), không nới gì.

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung · mức máy | khuyến nghị | `07-cai-dat/muc-may/kiem-project-harness.cjs` (mới) | Hook `SessionStart` lắp ở `~/.claude/settings.json`, trỏ **thẳng** vào kho (kho đổi là máy nhận, không bản chép để lệch). Dự án thiếu `.harness-manifest.json` ⇒ cảnh báo vào ngữ cảnh AI + dòng hiện cho Huynh, phân biệt *chưa có harness* (đề xuất cài) với *có luật chép tay* (đề xuất di trú, cấm coi là harness hiện hành). Dự án trong sổ đăng ký có `banDangDung` không phải số bản (Thiên Số) ⇒ chỉ nhắc theo ghi chú. Im lặng ở kho, ở dự án đã cài, ở thư mục không phải dự án. Thử 5 ca: AIAutoNews ⚠️ di trú · Harness im · Bootcamp 🧭 ngoại lệ · DressShop im · thư mục nhà im |
| lõi chung · mức máy | khuyến nghị | `07-cai-dat/muc-may/khoi-claude-md.md` (mới) | Khối luật vào `~/.claude/CLAUDE.md` giữa mốc `<!-- GLOBALHARNESS_START/END -->`: *"nạp context"* ⇒ kiểm ProjectHarness **trước** khi đọc luật dự án; dự án mới (kể cả từ điện thoại / cloud) cài từ GlobalHarness, ⛔ không chép tay luật dự án khác. Không vào `LUAT-DANGKY.json` (sổ đó đi theo dự án, `kiem-luat` quét tệp dự án) — cưỡng chế là cảnh báo của hook mỗi phiên |
| lõi chung · mức máy | khuyến nghị | `07-cai-dat/muc-may/cai-muc-may.cjs` (mới) | Bộ cài mức máy: xem trước mặc định, `--ap-dung` gộp hook vào `settings.json` (giữ hook khác) + chèn / thay khối `CLAUDE.md`, sao lưu tệp cũ vào `~/.claude/backups/`, chạy lại không trùng. Đã chạy trên PC của Huynh: lần 1 ghi 2 tệp, lần 2 *"đã lắp đủ"* |
| lõi chung · phiên cloud | khuyến nghị | `07-cai-dat/muc-may/skill-claude-ai/kiem-harness-du-an/SKILL.md` (mới) · `07-cai-dat/muc-may/README.md` (mới) | Phiên điện thoại / cloud không có `~/.claude` của máy — đúng nơi AIAutoNews ra đời. Skill claude.ai cùng luật (clone `cuongtmvn/Harness` công khai khi không có ổ máy). **Huynh tự tải lên claude.ai** — AI không tải hộ được. Giới hạn: skill chỉ chạy khi khớp mô tả, không bảo đảm như hook |
| tài liệu | — | `README.md` §1, §8 · `CLAUDE.md` (bố cục) | Chỉ đường tới lớp mức máy; quy ước phiên điện thoại / cloud tạo dự án mới = clone kho rồi `cai-dat.cjs` |
| riêng kho | — | `HANDOFF-2026-10-18.md` | Ghi chú 19/10 của phiên GlobalHarness (khớp 1.6.3), đi kèm bản này theo chính ghi chú đó; bộ công cụ quan sát `10-quan-sat/` lùi sang **1.8.0** (Huynh gật 23/10) |

**Dự án nhận:** không có tệp nào chép vào dự án — `cap-nhat.cjs` không đổi gì. **Mỗi máy** chạy một lần `node <Harness>/07-cai-dat/muc-may/cai-muc-may.cjs --ap-dung`. Huynh tải `skill-claude-ai/kiem-harness-du-an/` lên claude.ai (Settings → Skills). Dự án chưa có bảng kê (AIAutoNews) sẽ được cảnh báo từ phiên kế tiếp cho tới khi cài / di trú.

## 1.6.3 — 2026-10-19 · cổng kho nhận ngoại lệ sổ đăng ký; cài thử chạy môi trường sạch

Nguồn: dự án ChildDressShop · khi "Kéo GlobalHarness" lên 1.6.2, commit sổ đăng ký bị cổng kho chặn vì đòi tăng VERSION — trái luật 1 `CLAUDE.md` của kho ("Ngoại lệ duy nhất không cần tăng bản: sổ 08-cap-nhat/DU-AN-DANG-KY.json"); 1.6.2 của phiên khác cũng đã phải tăng bản chỉ vì lý do này. Tăng bản cho sổ thì mọi dự án lại bị coi là tụt bản ⇒ vòng không dứt. Huynh duyệt: câu *"Huynh duyệt sửa cổng kho cho đúng ngoại lệ sổ đăng ký (commit chỉ gồm đúng tệp DU-AN-DANG-KY.json thì không đòi tăng bản; mọi phép khác vẫn chạy) không?"* → *"Duyệt (Recommended)"* (điều dừng 5, đã khai AI được lợi nếu nới).

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | khuyến nghị | `04-cong-may/kiem-kho-phat-hanh.cjs` | (a) Commit gồm **đúng một** tệp `08-cap-nhat/DU-AN-DANG-KY.json` ⇒ bỏ phép tăng bản + mục CHANGELOG; vẫn đòi sổ đọc được JSON, bản cài thử = bản commit, cài thử dự án trống xanh. Thêm bất kỳ tệp nào khác ⇒ luật thường. (b) Bản cài thử chạy môi trường **không** có `HARNESS_ROOT` / `CLAUDE_PROJECT_DIR` (kế thừa làm công cụ trong dự án tạm trỏ nhầm gốc). Thử trên bản sao kho: sổ riêng không tăng bản ⇒ xanh; sổ + CLAUDE.md không tăng bản ⇒ đỏ "VERSION không tăng" |
| sổ | — | `08-cap-nhat/DU-AN-DANG-KY.json` | ChildDressShop lên 1.6.2 (commit dự án `f48c457`) |

**Dự án nhận:** không phải làm gì (cổng kho chỉ chạy ở kho); `cap-nhat.cjs` sẽ chép bản công cụ mới khi dự án kéo bản kế.

## 1.6.2 — 2026-10-19 · tệp bàn giao phiên GlobalHarness (không đổi luật)

Nguồn: phiên GlobalHarness 18/10 · Huynh *"tạo handoff để mai làm"* rồi *"đẩy github đi"*.

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| riêng kho | — | `HANDOFF-2026-10-18.md` (mới) | Bàn giao thiết kế `10-quan-sat/` (quan sát cách dùng Claude + định giá chi phí theo token) để phiên sau / phiên điện thoại làm tiếp. Không phải nội dung luật; ra bản PATCH chỉ vì cổng kho đòi mọi commit tăng VERSION — mâu thuẫn với ngoại lệ sổ đăng ký ở `CLAUDE.md` luật 1, ghi trong handoff mục 2 chờ Huynh |

**Dự án nhận:** không phải làm gì.

## 1.6.1 — 2026-10-19 · chế độ kho cho ghi-vet-day-git; Log/ của kho chỉ lưu ở máy

Nguồn: dự án ChildDressShop · lần đẩy 1.6.0 (commit `bc3cf95`) qua skill day-git đúng đường (hook ghi `qua-skill`, repo kho), nhưng `ghi-vet-day-git` chạy lại 4 cổng của dự án sau commit ⇒ c2, rtm-check đỏ ở kho ⇒ vết ghi `daQua: false` (đúng sự thật, nhưng là lỗi công cụ, không phải lỗi bản 1.6.0). Trong phạm vi Huynh duyệt 19/10 *"duyệt chế độ kho"*.

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | khuyến nghị | `04-cong-may/ghi-vet-day-git.cjs` · `04-cong-may/kiem-kho-phat-hanh.cjs` (`--sau-commit`) | Ở kho, vết sau commit chạy kiem-luat + kiem-khoa-lo + cổng kho trên **bản đã commit** (VERSION / CHANGELOG đọc từ HEAD, cây làm việc khớp HEAD, cài thử dự án trống xanh); bỏ phép so VERSION với origin/main sau khi đẩy. Dự án không đổi (4 cổng cũ) |
| riêng kho | — | `.gitignore` (`Log/`) · `.claude/skills/day-git/SKILL.md` · `CLAUDE.md` (kho) | Mốc + vết của kho chỉ lưu ở máy: nếu commit vết thì mỗi lần ghi vết lại phải tăng bản (cổng kho đòi VERSION tăng mỗi commit). Vết `bc3cf95` (`daQua: false` do lỗi công cụ) nằm ở `Log/DAYGIT-LOG.ndjson` máy Huynh |

**Dự án nhận:** không phải làm gì thêm (dự án không có `.kho-globalharness`).

## 1.6.0 — 2026-10-19 · luật phiên dài không treo (L-PHIEN-01); hook chặn commit nhận đúng repo đích; kho tự gác bằng day-git

Nguồn: dự án ChildDressShop · sự cố đêm 18→19/10/2026: phiên chạy đêm gọi trợ lý kiểm độc lập ở chế độ chạy nền rồi kết thúc lượt để chờ tin báo; trợ lý treo, phiên đứng yên 00:41 → 05:22 (đo bằng `do-gio.cjs`, DEVBOOK #23 của dự án). Huynh 19/10: *"cập nhật lại projectharness và globalharness về luật tránh bị treo, mục tiêu để các phiên dài không bị treo nhất là  khi chạy qua đêm."* Dự án nguồn đã áp bản tương đương ở ProjectHarness (commit `2d3ae4c`).

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | **bắt buộc** | `CLAUDE.template.md` khối mới *"⏱️ Phiên dài không treo — nhất là khi chạy qua đêm"* (6 điểm) · `06-so-ghi/LUAT-DANGKY.json` +`L-PHIEN-01` | Không kết thúc lượt khi việc kế tiếp chỉ còn là chờ trợ lý chạy nền mà chủ dự án không theo dõi; việc phụ thuộc kết quả gọi **chờ trực tiếp**; chạy nền chỉ khi còn việc độc lập; đầu bài trợ lý dài đọc theo đoạn + ghi khung báo cáo trước; trợ lý hỏng chạy lại **đúng một lần** rồi tự làm hoặc ghi nợ; đẩy git + bàn giao trước việc dài; khoảng trống > 30 phút trong `do-gio.cjs` là sự cố. Không nới luật nào, chỉ thêm kỷ luật — chưa có hook chặn kết thúc lượt (ghi rõ trong khối) |
| lõi chung | **bắt buộc** | `05-hook-skill/hooks/chan-git-commit-tay.cjs` | **Hook nhận đúng repo đích** của lệnh commit (`cd` đứng trước lệnh, hoặc `git -C` trong chính đoạn `git … commit`), đọc `harness.config.json` của chính repo đó để biết mốc nằm đâu, so vân tay với vùng staged của repo đó; repo không xác định được hoặc không có `harness.config.json` ⇒ **chặn** (không lỏng hơn trước). Trước đây hook luôn so với gốc dự án của phiên ⇒ chặn cả commit hợp lệ ở kho khác, chỉ còn lối `#QUA-DAY-GIT`. Huynh 19/10 bác mọi lối vòng: *"khi nói đẩy globalharness hoặc projectharness thì phải chạy trình tự từng bước, nếu có skill đẩy git, và có hook bắt buộc thì phải gọi skill để chạy, không làm đường vòng, hoặc làm tay dễ thiếu sót các lần sau."*; rồi duyệt sửa cơ chế (điều dừng 5, AI được lợi nếu nới — đã khai): câu *"Huynh duyệt sửa cơ chế theo ba bước trên (điều dừng 5) để đẩy GlobalHarness 1.6.0 đúng skill day-git không?"* → *"Duyệt cả ba bước (Recommended)"*. Thử 7 ca (gồm chữ "git -C" trong thông điệp — lần đầu bị đọc nhầm, đã sửa) |
| lõi chung | khuyến nghị | `04-cong-may/moc-day-git.cjs` · `04-cong-may/kiem-kho-phat-hanh.cjs` (mới) · `.kho-globalharness` (tệp đánh dấu, riêng kho) | **Chế độ kho của skill day-git**: ở kho GlobalHarness không có RTM của dự án ⇒ cổng c2 đỏ mãi. Thấy tệp đánh dấu thì `moc-day-git` chạy **cổng kho** thay c2: VERSION staged tăng so với origin/main · CHANGELOG staged có mục đúng bản · không có tệp đã theo dõi bị sửa mà chưa staged, không có tệp chưa theo dõi trong thư mục bộ cài chép · cài thử dự án trống → `kiem-harness` + `kiem-luat --mat --trung` xanh. Biến các bước skill `dua-vao-harness` vốn làm tay thành phép đo máy. Dự án (không có tệp đánh dấu) chạy 3 cổng cũ, không đổi. Huynh duyệt 19/10 *"duyệt chế độ kho"* (điều dừng 5, đã khai AI được lợi nếu cổng thay thế lỏng). Thử: cổng kho xanh trên đúng 1.6.0; thêm một dòng vào VERSION chưa staged ⇒ đỏ |
| riêng kho | — | `.claude/settings.json` · `.claude/skills/day-git/SKILL.md` · `.gitignore` · `CLAUDE.md` (kho) | **Kho tự gác commit** như mọi dự án: hook chặn commit tay + skill day-git (công cụ `04-cong-may/`, mốc / vết ở `Log/` của kho). Hết cảnh "kho này chưa cài hook, ĐỆ tự giữ 5 bước". Bộ cài không chép các tệp này (chỉ chép từ `04-cong-may/`, `05-hook-skill/`) |

**Dự án nhận — BẮT BUỘC:** (1) chép tay khối *"⏱️ Phiên dài không treo"* từ `CLAUDE.template.md` vào `CLAUDE.md` của dự án (đặt trước mục Kiến trúc); (2) thêm dòng `L-PHIEN-01` vào `Instructions/LUAT-DANGKY.json` của dự án; (3) chạy `node Log/kiem-luat.cjs --mat --trung`. `cap-nhat.cjs` không tự chép được khối vào `CLAUDE.md` đã tuỳ biến. (4) `cap-nhat.cjs --ap-dung` nhận hook `chan-git-commit-tay.cjs` mới (nhóm công cụ). ChildDressShop đã có sẵn cả khối luật (commit `2d3ae4c`) lẫn hook (commit `86b016a`) — khi kéo bản này chỉ cần ghi `banDangDung`.

## 1.5.0 — 2026-10-18 · quy ước lệnh hai tầng; AI kiểm soát tầng; cảnh báo mục bắt buộc

Nguồn: dự án ChildDressShop · Huynh bác luật 3 của 1.4.0 (18/10): *"Luật 3 không khi vào GlobalHarness là sai. Ta yêu cầu là khi yêu cầu cập nhật Harness mà không nói gì thì ngữ cảnh là cập nhật Harness. Giống như đẩy Git là local. Còn ta thấy phù hợp và nói cập nhật GlobalHarness thì cập nhật vào global. Nhiệm vụ đệ là phải kiểm soát. Dự án mới thì kéo GlobalHarness về thamhf ProjectHarness, rồi thay đổi theo đặc thù dự án nếu có. Nêua dự án đang cjayj thì phải kiểm soát điều chỉnh nào là cho ProjectHarness, và điều chỉnh nào là GlobalHarness. Nếu globalharness cập nhật thì phải có cơ chế cảnh báo để các project khác cập nhật lại ProjectHarness để hoạt động cho đúng"*; rồi *"Cập nhật globalharness"*. Dự án nguồn đã áp bản tương đương ở ProjectHarness (commit `d8a9254`).

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | **bắt buộc** | `CLAUDE.template.md` khối 🧭 + dòng đầu + hai dòng lệnh · `CLAUDE.md` (kho) · `README.md` Thuật ngữ · `08-cap-nhat/HUONG-DAN-CAP-NHAT.md` · `06-so-ghi/LUAT-DANGKY.json` (`L-HARNESS-01` viết lại) | **Quy ước lệnh hai tầng**, giống git: *"cập nhật harness"* không nói gì thêm = **ProjectHarness** (mặc định, như *"đẩy git đi"*); *"cập nhật GlobalHarness"* (câu cũ *"đưa vào harness"*) = **GlobalHarness**, chỉ khi chủ dự án nói rõ (như *"đẩy GitHub đi"*). **Bỏ luật 3 của 1.4.0** ("phiên dự án không ghi vào GlobalHarness") — sai vì chặn cả việc cập nhật kho chung hợp lệ. Thay bằng **5 luật AI kiểm soát tầng**: mặc định Project · ghi "Tầng: …" trước mỗi điều chỉnh, thứ đáng dùng chung thì đề xuất chờ câu *"cập nhật GlobalHarness"* · đặc thù dự án ở lại Project · báo cáo ghi rõ tầng · kho đổi bản thì cảnh báo, không mở Bước mới khi còn mục bắt buộc chưa nhận mà chưa hỏi |
| lõi chung | **bắt buộc** | `05-hook-skill/hooks/nhac-cap-nhat-harness.cjs` | Dòng 🧭 nói quy ước lệnh mới. Báo bản mới kèm **số mục bắt buộc** đọc từ `CHANGELOG.md` (khi có ổ máy) và nhắc: AI trình các mục đó, không mở Bước mới khi còn mục bắt buộc chưa nhận mà chưa hỏi |
| lõi chung | **bắt buộc** | `04-cong-may/kiem-harness.cjs` | **Cảnh báo tụt bản**: ProjectHarness cũ hơn GlobalHarness ⇒ cảnh báo kèm số mục bắt buộc. Chỉ cảnh báo, không chặn. Vì `kiem-harness` chạy lúc cài, lúc cập nhật và khi nghi cổng không gác ⇒ dự án thấy cả ngoài lúc mở phiên |
| lõi chung | khuyến nghị | skill `dua-vao-harness` · skill `cap-nhat-harness` | Câu kích hoạt: `dua-vao-harness` chỉ chạy khi nói rõ *"cập nhật GlobalHarness"*; *"cập nhật harness"* không chạy skill này. `cap-nhat-harness` gồm việc ghi `banDangDung` vào sổ đăng ký kho chung (sổ, không cần tăng VERSION) |
| sổ | — | `08-cap-nhat/DU-AN-DANG-KY.json` | ChildDressShop lên 1.4.0 |

**Dự án nhận — BẮT BUỘC:** (1) Huynh nói *"cập nhật harness"* ⇒ `cap-nhat.cjs --ap-dung` nhận hook, `kiem-harness.cjs`, hai skill; (2) chép tay khối *"🧭 GlobalHarness ≠ ProjectHarness — không được nhầm"* (bản 5 luật) và hai dòng lệnh từ `CLAUDE.template.md` vào `CLAUDE.md` của dự án — **thay** bản 4 luật của 1.4.0 nếu đã chép; (3) cập nhật dòng `L-HARNESS-01` trong `Instructions/LUAT-DANGKY.json` của dự án; chạy `node Log/kiem-luat.cjs --mat --trung`. Thiên Số (bố cục cũ, không bảng kê): hook không nhắc được — chép tay theo mục này.

**Đề xuất chưa làm (điều dừng 5, chờ chủ dự án):** hook `chan-git-commit-tay.cjs` đọc vùng staged theo gốc dự án đang mở ⇒ chặn commit ở kho khác (GlobalHarness) dù lệnh hợp lệ, phải đi vòng `#QUA-DAY-GIT`. Sửa cho hook nhận đúng repo của lệnh là **nới hook — AI được lợi nếu nới**.

## 1.4.0 — 2026-10-18 · thuật ngữ GlobalHarness / ProjectHarness; gỡ điều tra web khỏi lõi

Nguồn: dự án ChildDressShop · Huynh chỉ thị 18/10: *"Bộ dùng chung cho nhiều dự án, có folder riêng trên máy laptop, và link vào Repo Harness, thì đổi thành 'GlobalHarness'. Bộ harness các dự án kéo về rồi điều chỉnh lại, chỉ có tác dụng trong dự án đó không tác động vào GlobalHarness thì đổi tên là ProjectHarness."* và *"gỡ rule 1 về điều tra web trong GlobalHarness. Lấy dữ liệu ở đâu là đặc thù riêng mỗi dự án. Globalharness tập trung vào cơ chế cânh hành AI theo pipeline, và đảm bảo tối ưu, tránh thiếu sót."*

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | khuyến nghị | `README.md` (mục Thuật ngữ, tiêu đề, bản đồ §2, §8) · `CLAUDE.md` (kho) · `08-cap-nhat/HUONG-DAN-CAP-NHAT.md` · `05-hook-skill/skills/dua-vao-harness/SKILL.md` · `05-hook-skill/skills/cap-nhat-harness/SKILL.md` · `CLAUDE.template.md` (dòng đầu, lệnh "đưa vào harness") · thông báo của `07-cai-dat/cai-dat.cjs`, `08-cap-nhat/cap-nhat.cjs` · tên mục trong `08-cap-nhat/DU-AN-DANG-KY.json` | Hai tên rõ nghĩa: **GlobalHarness** = kho dùng chung; **ProjectHarness** = bản cài trong dự án, không tác động ngược. Trước đây chữ "harness" chỉ cả hai, dễ nhầm sửa ở dự án tưởng là sửa bộ chung. ⛔ **Không đổi** tên thư mục, repo, tệp (`harness.config.json`, `kiem-harness.cjs`, `.harness-manifest.json`, hook `nhac-cap-nhat-harness.cjs`), khoá cấu hình, câu lệnh *"cập nhật harness"* / *"đưa vào harness"* — đổi là MAJOR và gãy mọi dự án đã cài. Tệp luật `00`–`03` không sửa (chữ "harness" ở đó chỉ bộ cơ chế, đúng cho cả hai). |
| lõi chung | **bắt buộc** | `CLAUDE.template.md` khối mới *"🧭 GlobalHarness ≠ ProjectHarness — không được nhầm"* (bảng hai tầng + 4 luật) · `06-so-ghi/LUAT-DANGKY.json` +`L-HARNESS-01` · `CLAUDE.md` (kho) | Huynh: *"đệ phải chỉ thị rõ ràng, để tất cả các dự án không được phép nhần lẫn global và mức cục bộ của Project."* 4 luật: báo cáo luôn ghi rõ tầng · sửa dự án ≠ sửa bộ chung · ⛔ phiên dự án không ghi/commit vào GlobalHarness ngoài skill `dua-vao-harness` · thứ chỉ đúng cho dự án ở lại ProjectHarness. Bằng chứng: 1.3.0 đưa hàng "khảo sát web" (đặc thù ChildDressShop) vào lõi, Huynh phải gỡ |
| lõi chung | **bắt buộc** | `05-hook-skill/hooks/nhac-cap-nhat-harness.cjs` | Mỗi phiên in **dòng định vị 🧭** (ProjectHarness bản X của dự án này · GlobalHarness ở đâu · ⛔ không sửa trực tiếp). Hook thuộc nhóm công cụ ⇒ tới cả dự án cũ có `CLAUDE.md` riêng. Thông báo bản mới đổi thành *"GlobalHarness có bản …"*. Chỉ thêm chữ nhắc, không nới luật nào — Huynh duyệt sửa hook 18/10 *"4. Đồng ý."* |
| lõi chung | khuyến nghị | `CLAUDE.template.md` mục "Chọn model + effort" | **Gỡ** hàng "Khảo sát web theo cụm" ở Bảng 1, chữ "khảo sát web" ở Bảng 2 Bước 0, và đoạn "Đọc web". Thay bằng một câu: thu thập dữ liệu ở đâu, bằng công cụ gì là đặc thù dự án, dự án tự thêm hàng vào Bảng 1 của mình. Giữ hai hàng "So sánh nền tảng / công nghệ / pháp lý" và "Tổng hợp nhiều ghi chú thành báo cáo có nguồn" vì là việc phân tích, không phụ thuộc nguồn dữ liệu |
| lõi chung | khuyến nghị | `CLAUDE.md` (kho) luật 5 · skill `dua-vao-harness` Bước 2 | Thêm nguyên tắc phạm vi: **GlobalHarness chỉ giữ cơ chế điều hành AI theo pipeline** (Bước, cổng, truy vết, review, dây cương, đo lường, chọn model); nguồn dữ liệu, cách thu thập, nội dung miền là lớp **riêng**, không đưa lên. Bước 2 của skill có câu hỏi kiểm riêng cho việc này — chặn lặp lại lỗi của 1.3.0 |

**Dự án nhận — BẮT BUỘC:** (1) *"cập nhật harness"* để nhận hook mới (dòng 🧭), hai skill và hai công cụ; (2) chép tay khối *"🧭 GlobalHarness ≠ ProjectHarness — không được nhầm"* từ `CLAUDE.template.md` vào `CLAUDE.md` của dự án; (3) thêm dòng `L-HARNESS-01` vào `Instructions/LUAT-DANGKY.json` của dự án (sổ nhóm `rieng`, công cụ không tự chép) rồi chạy `node Log/kiem-luat.cjs --mat --dongbo`. **Dự án nhận:** skill `dua-vao-harness`, `cap-nhat-harness` và hai công cụ thuộc nhóm tự cập nhật ⇒ *"cập nhật harness"* là nhận. `CLAUDE.md` của dự án (nhóm `rieng`) chỉ được báo: muốn đồng bộ thì sửa tay dòng đầu và bỏ hàng khảo sát web nếu dự án không cần. Dự án nào **cần** điều tra web (như ChildDressShop) giữ hàng đó trong `CLAUDE.md` riêng — đúng tinh thần ProjectHarness.

## 1.3.0 — 2026-10-18 · bảng model + effort theo Bước; 3 loại việc nghiên cứu

Nguồn: dự án ChildDressShop · Huynh chỉ thị 18/10 *"phần về cách thức sử dụng model đệ lưu vào context của dự án này để tự động chuyên model và effort ở từng bước."* (DEVBOOK #2 của dự án), rồi duyệt đưa lên lõi chung *"làm theo đệ đề xuất đi"*. Bằng chứng: phiên 18/10 chạy 8 trợ lý khảo sát theo bảng (5 Sonnet medium ≈ 452 nghìn token, 3 Opus high); Huynh hỏi giữa chừng *"bây giờ dùng opus phù hợp chưa?"* — không có bảng theo Bước thì chủ dự án không biết lúc nào nên đổi model phiên chính.

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | khuyến nghị | `CLAUDE.template.md` mục "Chọn model + effort" | **Bảng 1** thêm 3 loại việc: khảo sát web theo cụm (Sonnet medium), so sánh nền tảng / công nghệ / pháp lý (Opus high), tổng hợp ghi chú thành báo cáo có nguồn (Opus high); `tester` thêm việc review độc lập một Bước. **Bảng 2 mới** — khuyến nghị theo 11 Bước cho phiên chính (Huynh đặt `/model`) và trợ lý (CULI đặt). Khai thẳng giới hạn: CULI chỉ đổi được model của trợ lý con. Tên model ghi theo dòng, không ghi số phiên bản. Thêm một đoạn ngắn về đọc web (trang công khai / trình duyệt điều khiển được; cấm đăng nhập, gửi biểu mẫu, thanh toán hộ) |
| lõi chung | khuyến nghị | `CLAUDE.template.md` bảng lệnh kích hoạt, dòng *"mở Bước N"* | Thêm nhịp đầu: **in dòng khuyến nghị model + effort cho phiên chính** theo Bảng 2 trước khi khai cổng vào — chủ dự án thấy đúng lúc để gõ `/model` |

**Dự án nhận:** `CLAUDE.template.md` cài thành `CLAUDE.md` thuộc nhóm `rieng` ⇒ `cap-nhat.cjs` chỉ **báo**, không ghi đè. Muốn nhận: chép tay mục "Chọn model + effort" (hai bảng) và dòng *"mở Bước N"* vào `CLAUDE.md` của dự án; nếu dự án có bảng riêng thì giữ bảng riêng. Không đổi luật quản AI, không đổi `harness.config.json`. ChildDressShop đã có bản tương đương (nguồn).

**Còn ghi nhận, chưa đưa vào (chờ Huynh):** (1) mẫu `SPEC.md` / `BACKLOG.md` mang mã giả `US-01`, `PB-001`, `PB-002` làm `rtm-check` / `kiem-backlog` đỏ hoặc xanh sai ở Bước 0 (máy dò chuỗi); (2) dòng "Bối cảnh 1 dòng" của `CLAUDE.md` cần cập nhật mỗi Bước nhưng `kiem-luat --dongbo` đòi đổi `LUAT-DANGKY.json` (hạ tầng gác luật) ⇒ AI không cập nhật được; (3) hook `chan-git-commit-tay` / `chan-ghi-de-file-luat` đọc theo gốc dự án đang mở ⇒ chặn commit ở kho khác (kho Harness) và chặn nhầm lệnh chỉ *nhắc* chữ `CLAUDE.md` cùng `rm`/`cat >`.

## 1.2.2 — 2026-10-17 · đổi thuật ngữ "chạy khô" thành "xem trước, chưa ghi (dry run)"

Nguồn: dự án Mười Ngón · Huynh hỏi *"mục 2, chạy thử khô là gì?"* rồi chỉ thị *"vậy sửa lại thuật ngữ 'chạy thử khô - dry run'"* (17/10).

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | khuyến nghị | `05-hook-skill/skills/cap-nhat-harness/SKILL.md` (tiêu đề Bước 2) · `08-cap-nhat/cap-nhat.cjs` (chú thích + lời báo cuối "Đây là bản XEM TRƯỚC — chưa ghi gì") · `08-cap-nhat/HUONG-DAN-CAP-NHAT.md` · `CLAUDE.md` · `CLAUDE.template.md` · `MO-TA-HARNESS.html` · `tomtat.md` · mục 1.1.0, 1.1.2 của tệp này | "Chạy khô" là dịch máy của *dry run*, đọc không hiểu ⇒ người duyệt không nhận ra đây là bước an toàn chưa ghi gì. Thuật ngữ mới nói thẳng việc nó làm: lần đầu ghi *"xem trước, chưa ghi (dry run)"*, các lần sau *"xem trước"*. ⛔ Không đổi tên tham số dòng lệnh (`--kho`, `--ap-dung`) để khỏi làm hỏng lệnh / script đang gọi. Dự án nhận: chạy "cập nhật harness" là nhận đủ (tệp skill, công cụ thuộc nhóm tự cập nhật); `CLAUDE.md` riêng của dự án nếu có chữ "chạy khô" thì sửa tay |

## 1.2.1 — 2026-10-17 · chốt bố cục workspace

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | khuyến nghị | `00-nguyen-tac/RUNBOOK.md §8` (nếp "workspace") · `tomtat.md` mục 8.3 | Huynh quyết: giữ repo trong OneDrive, **tạm dừng đồng bộ OneDrive khi dev**, bật lại sau khi đẩy git; không chuyển sang `D:\Projects`. Đóng câu hỏi cuối của `tomtat.md` mục 8 |
| lõi chung | khuyến nghị | `05-hook-skill/hooks/nhac-cap-nhat-harness.cjs` | Huynh: *"nhắc ta là được"* ⇒ hook mở phiên nhắc thêm một dòng khi `CLAUDE_PROJECT_DIR` nằm trong OneDrive; nhắc không cần bảng kê, gộp cùng nhắc bản mới thành một thông điệp |

## 1.2.0 — 2026-10-17 · bài học Mười Ngón vào lõi + hai gói desktop; 5 vai trợ lý

Nguồn: Mười Ngón (`tomtat.md` mục 5–6), Huynh gật 17/10/2026 *"đồng ý làm cả 3"*. Bằng chứng: Dev Book Mười Ngón 14–16/10 (HANDOFF, CSP Tauri, tường lửa LAN, Tester không bắt được lỗi app thật).

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | **bắt buộc** | `00-nguyen-tac/RUNBOOK.md §8` (4 nếp) · `06-so-ghi/LUAT-DANGKY.json` (+3 luật `L-KIEM-01`, `L-HANDOFF-01`, `L-WS-01`) | Kiểm trong điều kiện chạy thật · bàn giao `Log/HANDOFF-<ngày>.md` mỗi phiên lớn · sửa tệp bằng script thì kiểm ký tự điều khiển · workspace mở đúng gốc repo. Ba cái đầu từng gây lỗi thật; cái cuối làm hook không chạy mà không ai biết. **Dự án nhận:** `LUAT-DANGKY.json` là nhóm `rieng` ⇒ chép tay 3 mục luật mới vào sổ của dự án (hoặc chạy `cap-nhat` rồi `kiem-luat --mat`) |
| lõi chung | khuyến nghị | `05-hook-skill/skills/day-git/SKILL.md` | Thêm chế độ: *"đẩy git đi"* trên điện thoại / máy ảo = ĐẦY ĐỦ (Huynh chốt 14/10 ở Mười Ngón) |
| lõi chung | khuyến nghị | `05-hook-skill/agents/` 5 vai (`tester`, `dung-tai-nguyen`, `viet-noi-dung`, `ve-hinh`, `tra-cuu`, có model + effort) · `CLAUDE.template.md` mục "Chọn model + effort" · `_ban-do.cjs` chép vào `.claude/agents/` (nhóm `rieng`, thay `<TÊN DỰ ÁN>`) | Công cụ giao việc chỉ cho AI đặt effort khi CLAUDE.md yêu cầu rõ; vai có sẵn thì gọi đúng tên. Dự án đã có vai riêng (Mười Ngón) giữ nguyên |
| gói `desktop` | khuyến nghị (bắt buộc với app có LAN) | `09-goi/desktop/README.md` · `mo-tuong-lua.mau.ps1` | Hộp tường lửa bị Cancel ⇒ Windows tạo luật CHẶN; ping thông không chứng minh cổng mở; script mở đúng cổng chỉ mạng Private, không vượt UAC |
| gói `desktop-tauri` | **bắt buộc** với Tauri | `09-goi/desktop-tauri/README.md` · `csp-tauri.mau.py` | Tauri chèn nonce ⇒ `'unsafe-inline'` bị bỏ ⇒ `style=` bị chặn; cách sửa hai lớp + kịch bản dựng lại CSP; mẫu cấu hình harness cho dự án Tauri |
| lõi chung | khuyến nghị | `harness.config.json › duAn.goi` (khoá mới, mặc định `[]`) · `_ban-do.cjs` | Bộ cài / `cap-nhat` chép gói theo loại vào `Instructions/goi/<loại>/`. **Dự án nhận:** thêm khoá `goi` vào config (xem `_goi_doc`) |
| lõi chung | **bắt buộc** (sửa lỗi) | `08-cap-nhat/cap-nhat.cjs` | Lỗi phát hiện khi nâng Mười Ngón: tệp ghi nhận là *bản riêng* lúc `--dang-ky` vẫn bị coi là "cập nhật được" khi harness đổi (vì bảng kê lấy mã băm bản riêng làm `dich`). Nay bảng kê đánh dấu `rieng: true` và tệp đó luôn thành **xung đột**, không ghi đè. Dự án đã `--dang-ky` trước 1.2.0: chạy lại `--dang-ky` không cần, nhưng tệp riêng chưa có cờ sẽ cần xem kỹ nhóm "cập nhật được" lần đầu |

**Việc còn chờ Huynh** (`tomtat.md` mục 8.3): bố cục workspace tối thiểu / đầy đủ (`D:\Projects\…`).

## 1.1.2 — 2026-10-17 · cap-nhat báo tệp dự án tự sửa; sửa sổ đăng ký

Nguồn: phiên Mười Ngón (typingmaster-fd) soát bản 1.1.1, chuyển 3 việc về phiên Harness.

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | khuyến nghị | `08-cap-nhat/cap-nhat.cjs` | Bản xem trước (dry run) trước đây im lặng về tệp dự án đã tự sửa khi harness chưa đổi tệp đó — đúng nhưng thiếu thông tin. Nay in *"dự án tự sửa N tệp"* kèm tên, để biết trước chỗ sẽ thành xung đột |
| sổ | — | `08-cap-nhat/DU-AN-DANG-KY.json` | Mục Harness không chép số bản nữa (trỏ `VERSION`, tránh lệch như 1.1.0/1.1.1); điền `repo` Thiên Số (`git@github.com:cuongtmvn/ThienSo.git`) và Mười Ngón (`https://github.com/Cuongtmvn/typingmaster`) |

## 1.1.1 — 2026-10-17 · đăng ký Mười Ngón, nới luật sổ đăng ký

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | khuyến nghị | `CLAUDE.md` (kho) luật 1 | Sổ `DU-AN-DANG-KY.json` đổi mỗi lần một dự án đăng ký / cập nhật — bắt tăng bản cho việc đó sinh số bản rỗng nghĩa. Ngoại lệ ghi rõ, vẫn phải commit + đẩy kèm thông điệp `sổ đăng ký: …` |
| sổ | — | `08-cap-nhat/DU-AN-DANG-KY.json` | Mười Ngón đăng ký bản 1.1.0 (19 tệp riêng, 64 tệp chép); việc còn lại ở dự án: gộp hook vào `settings.json` riêng, điền `harness.config.json`, đồng bộ `LUAT-DANGKY.json` với PLAYBOOK bản riêng |

## 1.1.0 — 2026-10-17 · cơ chế cập nhật hai chiều + tài liệu tương tác

Nguồn: phiên Harness 17/10/2026, theo hai cơ chế Huynh chốt (ghi ở `tomtat.md` mục 2) và tám cải tiến mục 4.

| Lớp | Mức | Tệp | Vì sao |
|---|---|---|---|
| lõi chung | bắt buộc | `VERSION` · `CHANGELOG.md` | Chưa có số bản thì không dự án nào biết mình tụt bản; không có lịch sử thì không tra được vì sao luật đổi |
| lõi chung | bắt buộc | `07-cai-dat/_ban-do.cjs` (mới) · `07-cai-dat/cai-dat.cjs` (sửa) | Bản đồ chép tệp tách ra dùng chung cho cài và nâng cấp; bộ cài ghi `.harness-manifest.json` (bản + mã băm từng tệp) — cơ sở để nâng cấp không ghi đè phần dự án tự sửa (rủi ro 5 trong `tomtat.md`). Bộ cài nay chép **mọi** thư mục trong `05-hook-skill/skills/` |
| lõi chung | bắt buộc | `08-cap-nhat/cap-nhat.cjs` (mới) | Công cụ nâng cấp: xem trước (dry run) báo 4 nhóm (cập nhật được · thiếu · mẫu đổi · xung đột); `--ap-dung` chỉ ghi hai nhóm đầu; `--dang-ky` cho dự án cài tay. Thoát 2 khi có xung đột |
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
