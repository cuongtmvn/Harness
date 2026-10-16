# TRACEABILITY — Chuỗi truy vết từ yêu cầu tới kiểm thử và phát hành

> **Đọc khi nào:** Bước 1 (gán mã), Bước 4 (work item), Bước 8–10 (mã ↔ test ↔ RTM), và trước mỗi lần đẩy production.
> **Câu hỏi duy nhất chuỗi này trả lời:** *Một thứ Huynh yêu cầu → đã thành story nào → thiết kế ở đâu → ai làm (task nào) → mã nào → test nào ở tầng nào → đã lên bản phát hành nào?* Và **chiều ngược**: *dòng mã / ca test này phục vụ yêu cầu nào?*
> **Xương sống:** `Output/RTM.md`. Mọi sổ khác nối vào RTM bằng **mã**, không bằng văn xuôi.

---

## 1. Chuỗi mắt xích — mỗi mắt xích có MÃ, có SỔ, có BƯỚC sinh ra, có CỔNG gác

| # | Mắt xích | Mã | Sổ | Sinh ở Bước | Cổng gác mắt xích này |
|---|---|---|---|---|---|
| 1 | **Mục tiêu** Huynh nêu | `M<n>` | `Instructions/PHAM-VI-MVP.json` (nguyên văn) | 0 | `kiem-pham-vi.cjs` — `xong` đòi bằng chứng có thật; hoãn / bỏ đòi chữ ký |
| 2 | **Tính năng** (chức năng + phi chức năng) | `PB-xxx` | `Output/BACKLOG.md` §ⓐ | 1 | `kiem-backlog.cjs` — PB ↔ RTM hai chiều |
| 3 | **Phạm vi / quyết định nền** | `SCOPE §n` · `D-<..>-n` | `Output/SCOPE.md` | 0 | `doc-health` c6 |
| 4 | **Story · AC · NFR** | `US-xx` · `US-xx AC<n>` · `NFR-xx` | `Output/SPEC.md` | 1 | `rtm-check` #5 — story có trong SPEC mà không có dòng RTM |
| 5 | **Module** | `L0-n` (nền) · `M-n` (bề mặt) | `Output/MODULEMAP.md` (có cột tệp thực thi) | 2 | `doc-health` c4 chiều ngược |
| 6 | **Thiết kế** | `D-ARCH-n` · bảng / trường / endpoint | `Output/ARCH.md` | 3 | `doc-health` c6 · `kiem-c2-staged` (mã đổi ⇒ ARCH cùng commit khi dòng RTM mang `D-ARCH`) |
| 7 | **Rủi ro · dây cương** | `R-xx` · mục dây cương | `Output/RISK.md` · `Instructions/LEASH-BANG.json` | 6 | cổng Leash `--muc` · c6 |
| 8 | **Work item** | `MVP_nn.b.X.Y.n` | `Output/WBS.md` · `Log/TASKLIST.md` | 4 | `gate-check` (a)(b)(d) · c1 đòi cột Work item |
| 9 | **Mã** | tệp trong `App/` | kho mã | 8 | `kiem-c2-staged` · c2 · c4 |
| 10 | **Bằng chứng chạy thật** | dòng theo `taskId` | `Log/PROOF-LOG.ndjson` | 8 | `gate-check` (b) |
| 11 | **UT** | tệp `test_*` | `App/tests/` | 8 | `rtm-check` #1 #2 — số ca khớp · tệp test mồ côi |
| 12 | **IT / SIT** | `IT-Px` · `SIT-Px` | `Output/SITUAT.md` §Integration Map | 9 | exit criteria `IT-SIT-RULES.md` |
| 13 | **UAT** | `UAT-xx` ↔ **đúng một** `AC` | `Output/SITUAT.md` §UAT bảng trace | 9 | `rtm-check` #6 — ô UAT/SIT trống trên dòng đã build; `UAT-RULES.md` §2 |
| 14 | **Môi trường đã đo** | ô (môi trường × tầng) | `Instructions/PHU-MOI-TRUONG.json` | 9 | `kiem-phu-moi-truong.cjs` |
| 15 | **Bản phát hành** | commit / tag | sổ phát hành (nếu có) · `git tag` | sau 10 | `cong-uat-truoc-prod.cjs` · `kiem-pham-vi --truoc-prod` |

```
 M1 ──► PB-003 ──► SCOPE §4 / D-01 ──► US-07 (AC1..AC4) ──► L0-2, M-3 ──► D-ARCH-5 (bảng x, cột y: nhạy)
                                                     │
                                                     ▼
                                      MVP_01.8.A.BUILD.2 ──► App/routes/x.py ──► test_x.py (11 ca)
                                                     │                 │
                                                     ▼                 ▼
                                          PROOF-LOG: HTTP 200     IT-P3 · SIT-P1 · UAT-07 ↔ AC1..AC4
                                                                       │
                                                                       ▼
                                                           PHU-MOI-TRUONG: uat×http, prod×trình duyệt
                                                                       │
                                                                       ▼
                                                               bản phát hành 4c9ee51 (2026-..-..)
```

---

## 2. `Output/RTM.md` — bảng xương sống

Mỗi dòng truy vết: `| # | Nguồn | Nội dung | Story | Trạng thái | Code/Test | UAT/SIT | Work item |`

| Cột | Ghi gì | Máy đọc thế nào |
|---|---|---|
| **#** | số thứ tự, có thể hậu tố `a/b` | `^\| \d+[a-z]? \|` |
| **Nguồn** | `M<n>` · `SCOPE §n` · `D-…` | c6: có mã quyết định ⇒ ARCH là tài liệu liên quan |
| **Nội dung** | một dòng ngắn | — |
| **Story** | `US-xx` **·** `PB-xxx` *(bắt buộc có PB khi có US)* | `rtm-check` #5 · `kiem-backlog` |
| **Trạng thái** | ✅ đã build · ⬜ chưa · ⚠️ mồ côi *(— chấp nhận: lý do)* | `rtm-check` #3 |
| **Code/Test** | **tên tệp có thật** `App/...py` · `test_x.py (11)` | c1 chỉ tính ô trỏ tới tệp **tồn tại trên đĩa**; `rtm-check` #1 đếm số ca khớp |
| **UAT/SIT** | `UAT-07` · `IT-P3` · `SIT-P1` | `rtm-check` #6: dòng ✅ mà ô này trống ⇒ chuỗi đứt |
| **Work item** | mã task cấp 3 | c1 đòi **cả ba**: story + work item thật + code/test |

**Khối thứ hai của RTM — `## RÀNG BUỘC THEO BƯỚC`:** mỗi Bước N khi đóng ghi vào đây ràng buộc cho Bước N+1 (`R5`); Bước N+1 chép sang `V2.keThua` (`V2`). Đây là cách *"phát hiện ở phase trước đến được phase này"*.

⚠️ **Bẫy c1 — ô truy vết phải trỏ tới thứ CÓ THẬT.** Một ô ghi tên tệp đã xoá vẫn làm chỉ số đẹp lên. `rtm-check` không kiểm nội dung ô có trỏ tới thứ tồn tại không — `doc-health` c1 mới kiểm; `kiem-pham-vi` kiểm cho mục tiêu; `kiem-phu-moi-truong` kiểm cho tệp kiểm.

---

## 3. Hai chiều — mỗi phép kiểm chỉ bắt được LỆCH, không bắt được CÙNG THIẾU

| Chiều xuôi (đã hứa → đã làm?) | Chiều ngược (đang có → ai đặt hàng? ai giải thích?) |
|---|---|
| Mục tiêu `M` không thành story ⇒ `kiem-pham-vi` | Mã không dòng RTM nào trỏ tới ⇒ c4 / `kiem-c2-staged` "không tra được" |
| Story không dòng RTM ⇒ `rtm-check` #5 | Tệp test không được RTM nhắc ⇒ `rtm-check` #2 |
| PB không dòng RTM ⇒ `kiem-backlog` | PB trong RTM mà không có trong Backlog ⇒ `kiem-backlog` |
| AC không ca UAT ⇒ bảng trace `SITUAT.md` | Ca UAT không truy về AC ⇒ ca thừa, phải bỏ hoặc bổ sung AC |
| Dòng ✅ mà ô UAT/SIT trống ⇒ `rtm-check` #6 | Tệp bắn tới production mà không ô nào khai ⇒ `kiem-phu-moi-truong` cảnh báo |

🔑 **Giới hạn chung, khai thẳng:** phép đối chiếu chỉ bắt **hai sổ lệch nhau**. Hai sổ **cùng thiếu** một thứ thì nó vẫn xanh. Vì vậy mắt xích 1 (mục tiêu, **nguyên văn Huynh**, AI không được sửa) là **neo ngoài** — thứ duy nhất không do AI tự khai.

---

## 4. Cổng c2 — mã đổi thì tài liệu liên quan đổi cùng commit

*"Liên quan" không do AI tự đặt — tài liệu liên quan thì **có trong RTM**:*
tệp mã đổi → dòng RTM có tệp đó ở cột Code/Test → **RTM** (chính dòng đó) + **SPEC** (nếu cột Story có `US-`) + **ARCH** (nếu cột Nguồn có mã quyết định). Không đòi SCOPE — phạm vi cấp cao, sửa một AC không bắt buộc đổi SCOPE.

**Ba phán quyết:** `coupled` · `thiếu` (CHẶN) · `không tra được` (không phải trượt — đó là lỗ c4, báo ra, hỏi có nên thêm dòng RTM).

**Chủ động, không phản ứng:** chạm mã ⇒ **trước khi soạn commit** tự hỏi *"sản phẩm có làm điều gì mà tài liệu không mô tả không?"* — **có** thì lệch thật, sửa; **không** thì để cổng đỏ và **ghi nợ**, không viết bù cho cổng xanh.

---

## 5. Quy ước đặt mã — để máy đọc được

| Họ | Khuôn mặc định (`harness.config.json › ma`) | Ghi chú |
|---|---|---|
| Story | `US-\d+` | số tăng dần, không tái dùng |
| Backlog | `PB-\d{3}` | tính năng F và NF đều có; việc **hoãn** dùng `BL-` ở §ⓑ, không dùng `PB-` |
| Quyết định | `D-[A-Z]+-\d+` · `NFR-…-\d+` | **gán mã NGAY LÚC QUYẾT**, không để ghi sau *(c6 mất vĩnh viễn nếu không)* |
| Rủi ro | `R-<đợt>-\d+` | kèm L · I · L×I |
| Mục tiêu | `M\d+` | nguyên văn, AI không sửa |
| Ca kiểm | `UAT-\d+` · `IT-P\d+` · `SIT-P\d+` | UAT ↔ đúng 1 AC |
| Task | `<tienTo><nn>.<bước>[.R<k>].<nhóm>.<loại>.<số>` | `PHASEGATE.md §5` |

---

## 6. Ba quy ước phải dựng NGAY TỪ ĐẦU — vì chỉ số đo lịch sử không đo ngược được

| Chỉ số | Quy ước | Nếu không |
|---|---|---|
| **c2** | Đưa mã vào git **trước khi bắt đầu sửa**; commit nhỏ; mã + tài liệu cùng lượt | Mọi điểm dữ liệu trước đó **mất vĩnh viễn** |
| **c3** | Mỗi dòng đính chính ghi **mốc bắt đầu lệch**, không chỉ mốc sửa | Tử số có, mẫu số mất |
| **c6** | **Mọi quyết định gán mã ngay lúc quyết** | Quyết định chỉ tồn tại trong chat thì không tìm lại được bằng cách đọc tài liệu |

Và **mục tiêu** (mắt xích 1) phải được chép **nguyên văn** vào `PHAM-VI-MVP.json` **ngay tại Bước 0** — trước khi AI kịp diễn đạt lại.
