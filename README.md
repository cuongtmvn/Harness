# GlobalHarness — Bộ luật + cổng máy để lái AI làm phần mềm, dùng lại cho mọi dự án mới

> **Thuật ngữ (từ bản 1.4.0):**
> - **GlobalHarness** = bộ dùng chung cho mọi dự án — chính kho này: thư mục riêng trên máy Huynh (`D:\OneDrive\AI\Harness`), gắn repo GitHub `cuongtmvn/Harness`. Chỉ đổi khi Huynh nói rõ *"cập nhật GlobalHarness"* (câu cũ *"đưa vào harness"*).
> - **ProjectHarness** = bản mỗi dự án kéo về rồi điều chỉnh (bộ cài chép vào `Instructions/`, `Log/`, `.claude/`, `harness.config.json`, `CLAUDE.md` của dự án). Chỉ có tác dụng trong dự án đó, **không tác động ngược** lên GlobalHarness. *"cập nhật harness"* không nói gì thêm = sửa tầng này, kể cả kéo bản GlobalHarness mới về.
> - **Quy ước lệnh (từ 1.5.0)** giống git: *"cập nhật harness"* ↔ *"đẩy git đi"* (cục bộ, mặc định) · *"cập nhật GlobalHarness"* ↔ *"đẩy GitHub đi"* (dùng chung, phải nói rõ). AI phân loại tầng trước mỗi điều chỉnh harness. GlobalHarness đổi bản ⇒ hook `SessionStart` + `kiem-harness` cảnh báo các dự án, kèm số mục **bắt buộc**.
> - Tên thư mục, tên repo, tên tệp (`harness.config.json`, `kiem-harness.cjs`, `.harness-manifest.json`…) **giữ nguyên** để không gãy các dự án đã cài.
> - **Phạm vi GlobalHarness:** cơ chế điều hành AI theo pipeline — Bước, cổng, truy vết, review, dây cương, đo lường — để tối ưu và không thiếu sót. **Lấy dữ liệu ở đâu, thu thập bằng công cụ gì, nội dung miền nghiệp vụ là đặc thù từng dự án** ⇒ thuộc ProjectHarness, không đưa vào đây.

> Đóng gói 2026-10-16 từ một dự án thật đã chạy 4 MVP, nhiều Round, hàng chục lần cổng bị vượt và được vá. Phần riêng dự án đã bỏ; phần giữ lại là **đường ray 11 Bước · cổng vào/ra từng Bước · chính sách kiểm duyệt theo Round · chuỗi truy vết từ yêu cầu tới kiểm thử · 17 công cụ cổng máy · 6 hook · 1 skill · 15 bài học thiết kế cổng**.
> **Năm yêu cầu đóng gói** *(nguyên văn chủ dự án)* và nơi đáp ứng:
>
> | # | Yêu cầu | Ở đâu |
> |---|---|---|
> | 1 | *Đủ đường ray các bước* | `01-pipeline/PIPELINE.md` — 11 Bước, mỗi Bước: mục tiêu · artefact · đọc gì · cổng vào riêng · AI được/dừng/không · Done khi · bẫy |
> | 2 | *Bước quan trọng cần kiểm duyệt, có thể chỉ round đầu* | `01-pipeline/REVIEW-POLICY.md` + `harness.config.json › reviewPolicy` + điều kiện máy **(l)** |
> | 3 | *Mọi bước có checklist (phasegate) để sang bước tiếp* | `01-pipeline/PHASEGATE.md` (V1–V6 · R1–R8 · 13 điều kiện máy) + `checklist/B00…B10.md` + `02-enforcement/tools/gate-check.cjs` |
> | 4 | *Traceability Requirements → Scope → … → Design → Test (IT/SIT/UAT)* | `00-rules/B3-TRACEABILITY.md` — 15 mắt xích có mã, sổ, cổng gác; `rtm-check` · `kiem-backlog` · `kiem-pham-vi` · `kiem-c2-staged` · `doc-health` |
> | 5 | *Đóng gói thành folder* | Chính thư mục này. Cài: `node 07-install/cai-dat.cjs <dự án>` |

---

## 1. Cài vào dự án mới — 15 phút

```bash
node D:/OneDrive/AI/Harness/07-install/cai-dat.cjs D:/duong/dan/du-an --ten "Tên dự án"
cd D:/duong/dan/du-an
# 1. sửa harness.config.json (duAn · moiTruong · kiemThu · route · csdlThat · maCode)
# 2. sửa CLAUDE.md (bối cảnh · kiến trúc không được phá · vùng cấm · dữ liệu nhạy)
# 3. git init; commit đầu qua skill day-git; đặt dayGit.mocGoc
node Log/kiem-harness.cjs          # ✅ HARNESS ĐỦ
```
Bộ cài **không ghi đè** tệp đã có (liệt kê ra), không xoá, không chạy git. Chi tiết: `07-install/cai-dat.cjs` đầu tệp.

**Mức máy — một lần mỗi máy (từ 1.7.0):** `node D:/OneDrive/AI/Harness/07-install/machine/cai-muc-may.cjs --ap-dung` — lắp hook `SessionStart` + khối luật vào `~/.claude/`, để dự án **chưa có** ProjectHarness (mới tạo, hoặc chép tay luật dự án khác) cũng bị cảnh báo khi mở phiên. **Phiên điện thoại / cloud** (không có `~/.claude` của máy): tạo dự án mới thì `git clone https://github.com/cuongtmvn/Harness.git /tmp/Harness` rồi chạy `cai-dat.cjs` như trên — ⛔ không chép tay bộ luật của dự án khác; Huynh tải skill `07-install/machine/skill-claude-ai/kiem-harness-du-an` lên claude.ai để luật này tới được các phiên đó. Chi tiết: `07-install/machine/README.md`.

**Yêu cầu:** Node ≥ 18 · git · Claude Code (hook/skill). Không cài gói npm nào.

---

## 2. Bản đồ thư mục GlobalHarness → ProjectHarness (vị trí trong dự án)

> **Bản 2.0 — bố cục theo cây luật** (`00-rules/RULE-TREE.md`): luật chung theo nhánh B1–B5, luật pipeline, máy thi hành, sổ. Bố cục **phía dự án** (`Instructions/` · `Output/` · `Log/` · `.claude/`) giữ nguyên; một số tệp luật đổi tên — `cap-nhat.cjs` tự đổi tên khi nâng từ 1.x (bản đồ ở `08-update/doi-ten.json`).

| Trong GlobalHarness | Là gì | Cài vào ProjectHarness |
|---|---|---|
| `harness.config.json` | **Một file cấu hình** — mọi công cụ đọc từ đây; ba khối `reviewPolicy` · `congRaRieng` · `csdlThat` là luật quản AI; `doGio` ngưỡng nghỉ của sổ giờ | `<gốc>/` |
| `CLAUDE.template.md` | Trí nhớ dự án tự nạp mọi phiên: luật luôn đúng + bảng lệnh kích hoạt + bảng chỉ đường | `<gốc>/CLAUDE.md` |
| `00-rules/` | **Luật chung (nhánh B)**: `RULE-TREE.md` (cây luật, luật phân xử, kiểm đủ) · `B1-AI-AUTHORITY.md` (L0–L5 · A/A+ · 3 luật cứng · 7 điều dừng · phạm vi) · `B2-EXTERNAL-TOOLS.md` (Git · GitHub · deploy · CSDL · shell · web/MCP · đăng tải) · `B3-TRACEABILITY.md` + `B3-DOC-HEALTH.md` (truy vết, 7 chỉ số) · `B4-RULEBOOK.md` (thiết kế cổng, vòng đời bộ luật) · `B5-SESSIONS.md` (lái AI, phiên, agent, bộ nhớ, sổ giờ) | `Instructions/` |
| `01-pipeline/` | **Luật pipeline (nhánh A)**: `PIPELINE.md` (SDLC 11 bước) · `PHASEGATE.md` · `REVIEW-POLICY.md` · `PROJECT-TREE.md` (cây tệp mặc định) · `steps/B00–B10.md` · `testing/` (UT · IT/SIT · UAT) · `templates/` 16 tài liệu (gồm ghi chú chủ dự án) | `Instructions/` (+ `checklist/`) · `Output/` |
| `02-enforcement/` | **Máy thi hành**: `tools/` 18 công cụ cổng · `hooks/` 8 hook · `skills/` (day-git · cap-nhat-harness · dua-vao-harness · bao-cao-html) · `agents/` 5 vai · `settings.json` (hook + quyền allow / ask) | `Log/` · `.claude/` |
| `03-records/` | **Sổ**: cấu hình (`LEASH-BANG` · `PHAM-VI-MVP` · `PHU-MOI-TRUONG` · `LUAT-DANGKY`) → `Instructions/`; sổ ghi (`TASKLIST` · ndjson · mẫu `cong-buoc`/`khai-round`) → `Log/` | |
| `07-install/` | Bộ cài dự án + `machine/` lớp gác mức máy (`~/.claude`) | — |
| `08-update/` | Công cụ nâng bản, bản đồ đổi tên, sổ đăng ký dự án, hướng dẫn hai chiều | — |
| `09-packs/` | Luật theo loại dự án (`desktop`, `desktop-tauri`) — khai `duAn.packs` | `Instructions/packs/` |
| `10-guidebook/` | Sổ tay cho người và AI: cây luật, cơ chế Claude Code, danh mục, chọn model + effort + agent, tiết kiệm token | — (đọc tại kho) |
| `07-cai-dat/muc-may/` | Cầu nối đường dẫn cũ cho hook mức máy đã lắp từ 1.x — bỏ ở 3.0.0 | — |

---

## 3. Cách vận hành một MVP — tóm tắt một trang

```
"nạp context"  →  "mở Bước N"  →  làm (vòng 7 nhịp, task cấp 3, bằng chứng chạy thật)  →  "đóng Bước N"  →  … Bước 10  →  "đóng MVP"
                    │ cổng VÀO V1–V6                                                        │ cổng RA R1–R8 + 13 điều kiện máy + "Done khi"
                    │ bản khai Log/cong-buoc/<mvp>[-Rk]-B<N>.json                            │ gate-check.cjs --buoc N --ghi
Round ≥2: "mở Round Rk" → khai đủ 11 Bước (cham/khong-cham/ke-thua + việc cụ thể) → Round được bắt đầu ở Bước bất kỳ
Đẩy production: bash Log/day-len-may-chu.sh → cổng tài liệu · backlog · phủ môi trường · phạm vi (--truoc-prod) · UAT→Prod
```

| Tầng | Nghĩa vụ | Gác bằng |
|---|---|---|
| **MVP** | chạy đủ 11 Bước | `gate-check --dong-mvp` |
| **Round** | bắt đầu ở Bước bất kỳ, khai đủ 11 | `gate-check --mo-round` + (0)(e) |
| **Bước** | V1–V6 · R1–R8 · 13 điều kiện (0)(a)…(m) · Done khi | `gate-check --buoc` + checklist |

**13 điều kiện máy:** (0) Round mở · (a) task ✅/gác có lý do · (b) bằng chứng chạy thật 5 loại · (c) c2 · (d) telemetry · (e) thứ tự · (f) bản khai 13 mục · (g) R5→V2 · (h) 7 chỉ số · (i) git sạch · (j) sổ chờ quyết · (k) rtm-check · **(l) review theo chính sách** · **(m) cổng RA riêng** (Bước 1 backlog · 9 phủ môi trường · 10 phạm vi).

---

## 4. Chuỗi truy vết — một dòng

`M<n>` mục tiêu *(nguyên văn, AI không sửa)* → `PB-xxx` backlog → `SCOPE §` / `D-…` → `US-xx AC<n>` / `NFR` → `L0-n`/`M-n` module → `D-ARCH-n` + trường có độ nhạy → `MVP_nn.b.X.Y.n` work item → tệp mã → `test_*` (UT) → `IT-Px` / `SIT-Px` → `UAT-xx ↔ 1 AC` → ô môi trường đã đo → bản phát hành. Xương sống: `Output/RTM.md`. Hai chiều, mỗi mắt xích có cổng — `00-rules/B3-TRACEABILITY.md`.

---

## 5. Công cụ — chạy ở gốc dự án

| Lệnh | Việc | Mã thoát |
|---|---|---|
| `node Log/kiem-harness.cjs` | Harness lắp đủ chưa | 0 / 2 |
| `node Log/gate-check.cjs --buoc N --mvp nn [--round Rk] [--ghi]` | 13 điều kiện đóng Bước | 0 / 2 |
| `node Log/gate-check.cjs --mo-round Rk --mvp nn --ghi` · `--dong-mvp nn --ghi` | Mở Round · đóng MVP | 0 / 2 |
| `node Log/gate-check.cjs <taskId> [--deliverable BUILD] [--muc <mã>] [--huynh-xac-nhan <ngày>]` | Cổng cấp task (dây cương · telemetry · c2 · chạy thật) | 0 / 2 |
| `node Log/rtm-check.cjs` · `kiem-backlog.cjs` · `kiem-pham-vi.cjs [--truoc-prod]` · `kiem-phu-moi-truong.cjs` | Truy vết · backlog · phạm vi · nơi chạy phép đo | 0 / 1 / 2 |
| `node Log/doc-health.cjs` | 7 chỉ số sức khoẻ tài liệu → `Log/DOC-HEALTH.json` | 0 |
| `node Log/kiem-luat.cjs [--diff\|--mat\|--dongbo\|--trung\|--trangtri\|--dabo]` | Bộ test cho tài liệu luật | 0 / 2 |
| `node Log/cho-quyet.cjs [--them '{…}' \| --den-han … \| --da-quyet <id> "nguyên văn"]` | Sổ chờ chủ dự án quyết | 0 / 2 |
| `node Log/kiem-c2-staged.cjs` · `kiem-khoa-lo.cjs [--toan-bo]` · `moc-day-git.cjs` · `ghi-vet-day-git.cjs` · `kiem-day-git.cjs` | Bộ cổng của skill `day-git` | 0 / 2 |
| `node Log/check-telemetry-gaps.cjs` · `do-gio.cjs` | Hố telemetry · giờ làm việc máy đo | |
| `node Log/cong-uat-truoc-prod.cjs` · `bash Log/day-len-may-chu.sh` | Cổng và đường ống đẩy production | 0 / 2 |

**Hook** (`.claude/settings.json`): chặn `git commit` tay (đòi mốc + dấu) · chặn ghi đè file luật · chặn ghi CSDL thật chưa sao lưu · ghi mốc giờ mọi lượt gọi công cụ · ghi token usage · tự kiểm luật sau khi sửa file luật. *Skill để NẠP, Hook để CHẶN.*

---

## 6. Những chỗ dự án mới PHẢI điền (chỗ trống `<...>`)

| Ở đâu | Điền gì | Nếu không |
|---|---|---|
| `harness.config.json › duAn` | tên, mô tả | cảnh báo |
| `› moiTruong.*.dauHieu / diaChi` | regex nhận ra tệp bắn tới môi trường; địa chỉ | `kiem-phu-moi-truong` không kiểm được phép ② |
| `› kiemThu.lenhDemCa / khuonSoCa / lenhChayBo` | lệnh đếm & chạy test theo ngôn ngữ | `rtm-check` báo "không đếm được bằng máy" (không bịa) |
| `› route.thuMuc / khuon` | cách tìm đường HTTP trong mã | `kiem-pham-vi` không xác minh được `xong` |
| `› csdlThat` | khuôn CSDL thật, thư mục sao lưu | hook CSDL không gác (khuôn rỗng ⇒ bỏ qua) |
| `› maCode.duoi` | đuôi tệp mã của ngôn ngữ | c2 / c4 / kiem-khoa-lo đếm thiếu |
| `› dayGit.mocGoc` | commit đầu sau khi cài | `kiem-day-git` bỏ qua |
| `Instructions/PHAM-VI-MVP.json` | **nguyên văn** mục tiêu — Bước 0 | cổng phạm vi chặn |
| `Instructions/LEASH-BANG.json` | mục dây cương riêng của dự án — Bước 6 | cổng task `--muc` không biết mục |
| `Instructions/PHU-MOI-TRUONG.json` | ô nào có tệp, ô nào trống vì sao — Bước 9 | cổng (m) Bước 9 chặn |
| `Log/day-len-may-chu.sh` chặng 3/4/5 | chuyển gói, chạy test trên máy chủ, đối chứng | đường ống dừng ở chặng 2 |
| `CLAUDE.md` | bối cảnh, kiến trúc không được phá, vùng cấm | AI thiếu luật riêng dự án |

---

## 7. Giới hạn — khai thẳng

- **Cổng máy chỉ kiểm kế toán.** Cổng xanh ≠ Bước đạt. Tầng "Done khi" và Tester độc lập là của người.
- **Phép đối chiếu chỉ bắt lệch, không bắt cùng thiếu.** Neo ngoài duy nhất là nguyên văn chủ dự án trong `PHAM-VI-MVP.json`.
- **Hook chỉ nhìn chuỗi lệnh.** SQL trong tệp `.py` chạy bằng `python x.py` thì hook CSDL không thấy — lớp bù ở lớp kết nối của ứng dụng.
- **Tester độc lập chạy cùng dòng model** với AI thực thi — lớp phòng vệ tương quan, không phải độc lập thật.
- **c4 chiều ngược** (cơ chế chết) chỉ đo được bằng máy cho Python (`docHealth.c4.ngonNgu`); ngôn ngữ khác khai không đo được.
- **Giờ máy đo là cận dưới** — khoảng đọc/nghĩ không để lại mốc.
- Một số luật **dựa vào kỷ luật** (ghi thẳng trong `LUAT-DANGKY.json › cochequuongche`): dừng ở sát mép quyết định · không tuyên bố xong khi chưa kiểm · không sửa tài liệu cho cổng xanh. `node Log/kiem-luat.cjs --trangtri` đếm chúng để thấy chiều đi.

---

## 8. Phiên bản · cập nhật hai chiều · tài liệu tương tác

| Thứ | Ở đâu | Dùng khi |
|---|---|---|
| Số bản | `VERSION` (semver: PATCH sửa chữ/lỗi · MINOR thêm luật/công cụ/hook/skill · MAJOR đổi cấu trúc/khoá config) | mọi lần sửa kho |
| Lịch sử | `CHANGELOG.md` — mỗi mục: dự án nguồn · lớp (lõi / gói / riêng) · bắt buộc/khuyến nghị · tệp · vì sao | trước khi cập nhật dự án |
| Bảng kê trong dự án | `<dự án>/.harness-manifest.json` — bản đang dùng + mã băm từng tệp lúc cài (bộ cài ghi; **commit tệp này**) | `cap-nhat.cjs` so để biết tệp nào dự án đã tự sửa |
| **Cơ chế 1** dự án → harness | skill `dua-vao-harness` (7 bước: pull --ff-only · viết chung · lớp · cài thử dự án trống · VERSION+CHANGELOG · đẩy GitHub kèm ghi chú · Dev Book) | Huynh gõ *"đưa vào harness"* |
| **Cơ chế 2** harness → dự án | hook `SessionStart` `nhac-cap-nhat-harness.cjs` **chỉ nhắc** (đọc `VERSION` ổ máy, không có thì GitHub) → skill `cap-nhat-harness` → `node <Harness>/08-update/cap-nhat.cjs <dự án> [--ap-dung]` | Huynh gõ *"cập nhật harness"* |
| **Lớp gác mức máy** (từ 1.7.0) | `07-install/machine/` — hook `SessionStart` ở `~/.claude` cảnh báo dự án **chưa có** bảng kê (chỗ hook `nhac-cap-nhat-harness` im lặng) · khối luật `~/.claude/CLAUDE.md` · skill claude.ai cho phiên điện thoại / cloud. Bộ cài dự án không chép | Mỗi máy mới: `cai-muc-may.cjs --ap-dung` |
| Đăng ký dự án cài tay | `cap-nhat.cjs <dự án> --dang-ky` — dựng bảng kê từ trạng thái hiện tại, không ghi đè | Thiên Số, Mười Ngón lần đầu |
| Sổ đăng ký | `08-update/DU-AN-DANG-KY.json` — dự án nào đang bản nào | nhìn ai tụt bản |
| Hướng dẫn cho phiên khác | `08-update/HUONG-DAN-CAP-NHAT.md` · `CLAUDE.md` của chính kho này | mở phiên ở GlobalHarness hoặc ở dự án (ProjectHarness) |
| Mô tả tương tác | `MO-TA-HARNESS.html` — pipeline, ma trận 11 Bước, checklist phasegate, MVP × Round, mô hình dự án, điểm can thiệp, từ điển | đọc để hiểu / kiểm toàn bộ harness |

---

## 9. Kiểm "có thiếu mục nào không" — từ 2.0 dùng cây luật

> **Bản 2.0:** câu hỏi "bộ luật đã đủ chưa" trả lời bằng **cây luật** `00-rules/RULE-TREE.md` (A pipeline + B1–B5) và `kiem-luat.cjs --cot` (ô trống của từng luật). Tám mục dưới đây là cách chia của bản 1.x, giữ lại để đối chiếu.

① Harness (công cụ · cổng · hook) · ② Thang L0–L5 · ③ Dây cương + 7 điều dừng · ④ Quy trình SDLC 11 Bước + Phasegate + Review policy · ⑤ Mô hình vận hành · ⑥ Sổ tay lái · ⑦ Dev Book (quyết định + bài học chưng cất) · ⑧ Telemetry / AgentOps. Mỗi mục phải nói được **nội dung gì · ở file nào · cưỡng chế bằng gì** — mục nào không chỉ ra được cơ chế thì **khai là đang hở**.
