# Tóm tắt trao đổi về Harness — chuyển sang phiên Thiên Số làm tiếp

> Soạn 17/10/2026 trong phiên Claude Code của dự án **Mười Ngón** (TypingMaster). Huynh quyết phiên Mười Ngón tập trung phát triển,
> phần harness chuyển sang **phiên Thiên Số**. Đọc tệp này đầu phiên, rồi làm theo mục 7.
> Chưa có gì trong tệp này được áp vào repo Harness — tất cả đang **chờ Huynh gật**.

## 1. Hiện trạng repo Harness (kiểm 17/10)

- Thư mục `D:\OneDrive\AI\Harness`, GitHub `cuongtmvn/Harness`, nhánh `main` đồng bộ (commit đầu `e72df72`: Playbook 11 Bước, Phasegate, Review Policy, Traceability, 17 công cụ cổng máy, 6 hook, skill `day-git`).
- **Chưa có số phiên bản** (`VERSION`, `CHANGELOG.md`), **chưa có bảng kê** dự án nào dùng bản nào.
- Bộ cài `07-cai-dat/cai-dat.cjs` chỉ **cài mới** (không ghi đè, không nâng cấp).
- Ba repo trên máy: Thiên Số `D:\OneDrive\AI\Bootcamp` · Harness `D:\OneDrive\AI\Harness` · Mười Ngón `D:\OneDrive\AI\TypingMaster\Source code\typingmaster`.
  Mười Ngón dùng harness **rút gọn bằng tay** từ Thiên Số (không qua bộ cài) ⇒ chưa có bảng kê.

## 2. Hai cơ chế Huynh chốt (nguyên văn, 17/10)

> *"ý ta là bộ Harness này sẽ có 02 cơ chế:*
> *1. Từ các dự án nhỏ lẻ, riêng biệt: khi có điều gì hợp lý ta sẽ chỉ thị cho "ĐỆ" ở dự án đó cập nhật vào bộ harness này (gồm cả đẩy git và github).*
> *2. Khi harness được cải tiến, thì có cơ chế nhắc các dự án khác cập nhật lại để tối ưu cách làm việc ngay.*
> *đệ đưa ra phân tích đánh giá sự phù hợp và cần thiết, cải tiến nếu cần"*

## 3. Đánh giá

| | Cơ chế 1 — dự án → harness theo lệnh Huynh | Cơ chế 2 — harness mới → nhắc các dự án |
|---|---|---|
| Phù hợp | ✅ Rất hợp: luật quản AI là của Huynh (điều dừng 5); lệnh của Huynh = sự duyệt | ✅ Hợp, nhưng chỉ **nhắc + cập nhật khi Huynh bảo** — đổi luật giữa một Bước có thể làm lệch việc đang dở |
| Cần thiết | ✅ Bài học mới chỉ nằm trong từng dự án (xem mục 6) | ✅ Thiếu nó thì cơ chế 1 vô ích |
| Giới hạn | — | Không đẩy được thông báo vào phiên đang chạy ⇒ "ngay" = **lúc mở phiên kế tiếp** |

**Sáu rủi ro phải chặn:**
1. Mang cái **riêng** vào cái chung (ví dụ luật CSP chỉ đúng cho app desktop Tauri).
2. Harness **phình to**, không ai đọc nổi.
3. Hai dự án **cùng sửa** harness một lúc ⇒ ghi đè nhau.
4. Sửa harness **làm hỏng** harness ⇒ lan ra mọi dự án.
5. Cập nhật **ghi đè phần riêng** của dự án (`CLAUDE.md`, cấu hình, sổ ghi).
6. Phiên trên **điện thoại** (máy ảo đám mây) không có ổ `D:\OneDrive\AI\Harness`.

## 4. Tám cải tiến đề xuất

1. **Ba lớp**: *Lõi chung* (mọi dự án) · *Gói theo loại dự án* (`web`, `desktop-tauri`, `mobile`…) · *Riêng dự án* (ở lại, ⛔ không đưa lên). Mỗi bài học gắn nhãn lớp — chặn rủi ro 1.
2. **Lệnh "đưa vào harness"** (cơ chế 1) làm thành skill, trình tự cố định: `git pull --ff-only` (xung đột ⇒ DỪNG, rủi ro 3) → viết lại cho chung + bằng chứng (dòng Dev Book dự án gốc) → chọn lớp + **bắt buộc / khuyến nghị** → phải trả lời "chặn lỗi gì / tiết kiệm gì", không trả lời được thì không đưa (rủi ro 2) → chạy `kiem-harness.cjs` + **cài thử vào dự án mẫu trống**, đỏ thì không đẩy (rủi ro 4) → tăng phiên bản, ghi `CHANGELOG.md` → commit + đẩy GitHub Harness → ghi Dev Book dự án gốc "đã đưa vào harness bản X".
3. **`VERSION` + `CHANGELOG.md`**: mỗi mục ghi dự án nguồn · lớp · bắt buộc/khuyến nghị · tệp đổi · vì sao.
4. **Bảng kê trong mỗi dự án** (`.harness-manifest.json`): bản đang dùng, gói đã nhận, **mã băm từng tệp lúc cài** ⇒ khi nâng cấp: tệp chưa sửa thì cập nhật thẳng; tệp đã sửa riêng chỉ hiện chỗ khác nhau để duyệt, ⛔ không ghi đè (rủi ro 5).
5. **Nhắc tự động lúc mở phiên** (cơ chế 2): hook `SessionStart` ở mỗi dự án so bản đang dùng với bản mới nhất — PC đọc ổ OneDrive, điện thoại đọc `VERSION` trên GitHub (rủi ro 6) — rồi hiện *"Harness có bản 1.4.0 (3 thay đổi, 1 bắt buộc) — gõ 'cập nhật harness'"*. Chỉ nhắc, ⛔ không tự sửa.
6. **Lệnh "cập nhật harness"**: kéo bản mới theo bảng kê → chạy lại cổng của dự án (đỏ thì báo, không ép) → ghi Dev Book.
7. **Sổ đăng ký dự án** trong Harness: tên · đường dẫn · loại · bản đang dùng ⇒ nhìn một bảng biết dự án nào tụt bản.
8. **Đăng ký Mười Ngón lần đầu**: so khớp tệp nào trùng harness, tệp nào riêng; nhân dịp đưa bài học mục 6 vào harness bản đầu.

**Thứ tự làm:** 3 → 4 → 2 → 5 → 6 → 7 → 8, rồi đẩy GitHub Harness.
**Chưa nên:** đóng harness thành plugin Claude Code — mới 2 dự án là quá tay; tính lại khi có 3–4 dự án.

## 5. Luật chọn model + effort cho trợ lý (đã làm ở Mười Ngón — ứng viên đưa lên lõi chung)

Huynh chốt 17/10: *"làm cả 2 đi"* ⇒ ở Mười Ngón đã thêm mục "Chọn model + effort cho trợ lý" vào `CLAUDE.md` và 5 vai trong `.claude/agents/` (⛔ chưa commit ở Mười Ngón):

| Loại việc | Vai | Model | Effort |
|---|---|---|---|
| Kiểm sản phẩm độc lập | `tester` | Sonnet | medium |
| Dựng tài nguyên hàng loạt, script kỹ thuật rõ đầu bài | `dung-tai-nguyen` | Sonnet | medium |
| Nội dung, tài liệu, hướng dẫn | `viet-noi-dung` | Sonnet | medium |
| Vẽ hình, thiết kế, chấm thẩm mỹ | `ve-hinh` | Opus | high |
| Tra cứu nhanh | `tra-cuu` | Haiku | low |
| Lõi, tích hợp, gỡ lỗi khó | phiên chính | Opus | high |

Lý do cần luật: công cụ giao việc chỉ cho AI đặt effort khi người dùng hoặc `CLAUDE.md` **yêu cầu rõ**; model phiên chính chỉ Huynh đổi được (`/model`).
Phương án lan cho mọi dự án: đặt vai chung ở `~/.claude/agents` (máy Huynh) hoặc đưa vào lõi harness.

## 6. Bài học từ Mười Ngón chờ đưa vào harness (đề xuất lớp)

| # | Bài học | Bằng chứng (Mười Ngón) | Lớp |
|---|---|---|---|
| 1 | Luật model + effort + 5 vai trợ lý | `CLAUDE.md`, `.claude/agents/` | Lõi chung |
| 2 | **Kiểm trong điều kiện app thật**: Chromium `file://` báo xanh không chứng minh app chạy | Dev Book 16/10: bàn phím chỉ hiện 1 phím trong app cài thật | Lõi chung (nguyên tắc) |
| 3 | CSP Tauri chèn nonce ⇒ `'unsafe-inline'` bị bỏ ⇒ `style="…"` trong HTML bị chặn; cách sửa + kịch bản `App/e2e/csp-tauri.py` | Dev Book 16/10 | Gói `desktop-tauri` |
| 4 | App có mạng LAN: hộp hỏi tường lửa bị Cancel ⇒ Windows tạo luật CHẶN; ping thông không chứng minh cổng mở; script mở tường lửa chỉ mạng Private | `App/mo-tuong-lua-dau-truong.ps1` | Gói `desktop` |
| 5 | "Đẩy git đi" trên PC = commit máy; "đẩy github đi" = đẩy GitHub; điện thoại thì cả hai đều đẩy | skill `day-git` | Lõi chung (đã có ở Thiên Số? — so lại) |
| 6 | Tệp bàn giao `Log/HANDOFF-<ngày>.md` phải làm mới mỗi phiên lớn ("nạp context" đọc nó trước tiên) | `Log/HANDOFF-2026-10-16.md` | Lõi chung |
| 7 | Sửa tệp bằng script: tránh `sed` với `` \` `` (GNU sed hiểu là đầu dòng) và chuỗi Python không raw (`\b`, `\t` thành ký tự điều khiển) — viết script ra tệp, kiểm ký tự điều khiển sau khi sửa | Dev Book 16/10 (DEVBOOK bị chèn backtick mọi dòng) | Lõi chung (RUNBOOK) |
| 8 | Workspace phải mở **đúng gốc repo** (thư mục đứng đầu trong workspace nhiều thư mục) — nếu không `CLAUDE.md`, hook, vai trợ lý không nạp | Mục 7 dưới | Lõi chung (cài đặt) |

## 7. Bố cục workspace — phát hiện + đề xuất (chưa quyết)

- Claude Code chạy ở **thư mục đứng đầu** của workspace và chỉ nạp `CLAUDE.md` / `.claude/` ở thư mục đó và các thư mục **phía trên**.
- Mười Ngón: workspace chưa đặt tên `%APPDATA%\Code\Workspaces\1791986665066\workspace.json` (tạo 14/10 21:04) có 3 thư mục, đứng đầu là `D:\OneDrive\AI\TypingMaster` (thư mục **cha** của repo) ⇒ harness của dự án không tự nạp. Không có tệp `.code-workspace` nào Huynh tự lưu trên ổ D hay thư mục người dùng.
- Thông lệ: workspace = gốc repo · repo code để **ngoài OneDrive** (OneDrive đồng bộ `.git`, `node_modules` dễ khoá tệp, sinh bản trùng; GitHub đã lo sao lưu) · đường dẫn **không dấu cách, không dấu tiếng Việt**. OneDrive vẫn hợp cho tài liệu, tài nguyên nặng (`D:\OneDrive\AI\Assets`).
- Đề xuất bố cục chuẩn ghi vào harness: `D:\Projects\Harness\` · `D:\Projects\ThienSo\` · `D:\Projects\MuoiNgon\` · `D:\OneDrive\AI\Assets\`.
- Hai mức: **tối thiểu** — lưu tệp `.code-workspace` với repo đứng đầu; **đầy đủ** — chuyển cả ba repo ra `D:\Projects\…` (đụng bản cài, script đóng gói, đường dẫn trong sổ — phải kiểm lại sau khi chuyển).

## 8. Việc chờ Huynh quyết

1. Gật làm 8 cải tiến (mục 4) theo thứ tự đề xuất — hay chỉ một phần.
2. Bài học nào ở mục 6 đưa vào harness, lớp nào.
3. Bố cục workspace: tối thiểu hay đầy đủ (mục 7).
4. Vai trợ lý chung: đặt ở `~/.claude/agents` hay trong lõi harness.

## 8b. Việc nhận từ phiên Mười Ngón (typingmaster-fd) soát bản 1.1.1 — 17/10/2026

| # | Việc | Ai | Trạng thái |
|---|---|---|---|
| 1 | Sổ đăng ký sai: mục Harness ghi 1.1.0 khi kho 1.1.1; Thiên Số / Mười Ngón `repo: null` | phiên Harness | ✅ 1.1.2: mục Harness trỏ `VERSION`, điền repo `git@github.com:cuongtmvn/ThienSo.git` · `https://github.com/Cuongtmvn/typingmaster` |
| 2 | Mười Ngón: hook SessionStart chưa cắm vào `settings.json` riêng; **workspace đang mở thư mục cha** nên cắm rồi hook vẫn không chạy — sửa workspace trước (mục 7) | phiên Harness (cắm) · Huynh (workspace) | ✅ đã gộp 7 hook + permissions vào `settings.json` riêng, điền `harness.config.json` theo Tauri, neo lại 25 luật vào `Instructions/LUAT-LUON-DUNG.md`, skill day-git bản harness; `kiem-harness` ✅ `kiem-luat` ✅ (bản 1.2.0). ⏳ Huynh mở lại VS Code đúng gốc repo rồi phiên Mười Ngón "đẩy git đi" |
| 3 | `cap-nhat.cjs` chạy khô không cho thấy tệp dự án tự sửa khi harness chưa đổi | phiên Harness | ✅ 1.1.2: in *"dự án tự sửa N tệp"* kèm tên |
| 4 | Thiên Số chưa đăng ký dù là dự án gốc | phiên Harness | ⚠️ đã chạy `--dang-ky` (chỉ ghi bảng kê). **Phát hiện:** Thiên Số giữ bố cục *trước đóng gói* — tệp luật mang hậu tố `-TS` (`PLAYBOOK-TS.md`, `PHASEGATE-11BUOC-TS.md`, `LUAT-DANGKY-TS.json`), không có `harness.config.json`, công cụ tên khác (`MVP2_gate-check.cjs`, hook `chan-cham-csdl-that.cjs`). Bản đồ chép của bộ cài không khớp ⇒ ⛔ **không được `--ap-dung`** (sẽ chép bản song song, luật trùng hai nơi). Cần Huynh quyết: (a) di trú Thiên Số sang bố cục đóng gói (đổi tên tệp, thêm config) — việc lớn, làm ở phiên Thiên Số; hay (b) để Thiên Số là "bản gốc riêng", chỉ nhận thủ công các mục harness mới |
| 5 | 8 bài học Mười Ngón + 5 vai trợ lý chưa đưa lên | phiên Harness | ✅ 1.2.0 — Huynh gật 17/10 *"đồng ý làm cả 3"*: 6 bài học + 5 vai vào lõi (`RUNBOOK §8`, `agents/`, `CLAUDE.template`, day-git điện thoại, 3 luật mới), CSP Tauri → gói `desktop-tauri`, tường lửa → gói `desktop`. Thiên Số: Huynh quyết (b) giữ gốc, chép tay (mục 4). Còn chờ: bố cục workspace (mục 8.3) |

## 9. Mở phiên Thiên Số

Mở VS Code **đúng thư mục repo** (`D:\OneDrive\AI\Bootcamp`, hoặc `D:\OneDrive\AI\Harness` nếu làm thẳng trên harness), rồi gõ:
> *"Đọc `D:\OneDrive\AI\Harness\tomtat.md`, làm tiếp phần harness từ mục 8."*
