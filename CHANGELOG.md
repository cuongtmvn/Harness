# CHANGELOG — Harness

> Mỗi mục ghi đủ: **dự án nguồn** · **lớp** (*lõi chung* = mọi dự án · *gói `<loại>`* = dự án cùng loại · *riêng* = không đưa) · **bắt buộc / khuyến nghị** với dự án nhận · **tệp đổi** · **vì sao** (bằng chứng). Mục *bắt buộc* mà `cap-nhat.cjs` không tự làm được thì ghi rõ dự án nhận phải làm gì.
> Số bản: `VERSION`. PATCH sửa chữ / lỗi công cụ · MINOR thêm luật, công cụ, hook, skill, gói · MAJOR đổi cấu trúc thư mục, khoá `harness.config.json`, cách khai cổng.

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
