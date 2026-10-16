# PHASEGATE — Checklist cổng của MỌI Bước: cổng VÀO · cổng RA · 13 điều kiện máy

> **Đọc khi nào:** mỗi lần mở hoặc đóng một Bước, và mỗi lần Huynh hỏi *"Bước N còn gì"*.
> **Nguyên tắc trùm:** **fail-closed** — không xác minh được = CHẶN. Áp cho cả hai chiều.
> **Ba lớp của một phase gate — ba câu hỏi khác nhau, ⛔ không thay nhau:**
>
> | Lớp | Hỏi gì | Ai kiểm | Nguồn |
> |---|---|---|---|
> | **L1 — Kế toán** | Sổ sách đủ chưa? | Máy: `node Log/gate-check.cjs --buoc N` | 13 điều kiện §3 |
> | **L2 — Lời khai** | Người làm đã khai đủ 13 mục cổng chưa, mục nào nợ? | Bản khai `Log/cong-buoc/*.json` | §1 + §2 |
> | **L3 — Nội dung** | Sản phẩm của Bước có **ĐẠT** không? | Người đọc theo **"Done khi"** của Bước | `PLAYBOOK.md` mục Bước N |
>
> 🔑 **Cổng xanh ≠ Bước đạt.** Cổng máy chỉ đếm sổ sách. Bốn Bước từng được đóng trong **0,7 giây** bằng một vòng lặp shell với cổng máy xanh thật — chỉ phát hiện nhờ **dấu thời gian**.

---

## 1. 📥 CỔNG VÀO — 6 mục chung cho mọi Bước (`V1`–`V6`)

> 🔧 Khung gốc chỉ đặt điều kiện được-phép-bắt-đầu ở Bước 7 (DoR). Harness tổng quát hoá ra cả 11 Bước. *Lý do: có cổng ra mà không có cổng vào thì dữ liệu thiếu vẫn lọt vào chặng, rồi **bị lấp bằng phỏng đoán**, và sau đó không ai phân biệt được đâu là dữ kiện đâu là suy đoán.*

| # | Mục kiểm | Không đạt thì |
|---|---|---|
| **V1** | Artefact của Bước trước **đã đóng** — bản ghi **mới nhất** trong `Log/PHASE-GATE-LOG.ndjson` là `qua`, không phải `huy` *(trừ Bước mà Round khai `khong-cham`/`ke-thua`)* | Không mở Bước |
| **V2** | 🔑 Đã đọc `Output/RTM.md`, **và chép sang mảng `V2.keThua` từng ràng buộc mà `R5` của Bước trước đã ghi** — xem §1b | Không mở Bước |
| **V3** | **Nguồn dữ liệu cần có đã có mặt** — ghi rõ đường dẫn và ai xác nhận. Nguồn thiếu thì **nêu tên, không lấp bằng suy đoán** | Dừng hỏi Huynh |
| **V4** | 🔑 **Danh sách điểm mơ hồ viết ra TRƯỚC khi làm.** Mỗi điểm gắn nhãn: *tự quyết được* hoặc *phải hỏi Huynh (điều dừng số mấy)*. Điểm phải hỏi ⇒ ghi vào sổ `CHO-QUYET.ndjson` kèm điều kiện bung | Dừng hỏi Huynh |
| **V5** | Trả lời **4 câu hỏi phản xạ**: (1) quyền tác động tới đâu? (2) mức L nào, A hay A+? (3) **cổng nào gác đầu ra này**? (4) phần nguy hiểm **ai đích thân duyệt**? | Không mở Bước |
| **V6** | Các quyết định đã chốt áp cho Bước này (`D-…`, `NFR-…`, mục tiêu `M…`) đã liệt kê; quyết định **chưa có** mà Bước này cần ghi ở `chuaQuyet` | Không mở Bước |

### 1b. `V2` khép vòng với `R5`

`R5` bắt Bước N ghi ràng buộc phát sinh cho Bước sau vào RTM; `V2` bắt Bước N+1 đọc RTM. Hai đầu dây có sẵn mà **không gì kiểm rằng thứ `R5` ghi ra có ĐẾN được `V2`** — đo thật: 4/8 cặp Bước liền nhau có **0 từ khoá chung** giữa hai đầu, và cả hai đầu vẫn khai `dat: true`.

**Cơ chế:** `V2.keThua` là **mảng**, mỗi phần tử là **một ràng buộc** mang sang. Điều kiện máy `(g)`:

| Tình huống | Cổng làm gì |
|---|---|
| Bước trước có `R5.canCu`, Bước này thiếu `V2.keThua` hoặc mảng rỗng | 🛑 **CHẶN** |
| Có `keThua` nhưng **0 từ khoá chung** với `R5` của Bước trước | ⚠️ Cảnh báo — phải tự đọc lại |
| Bước trước khai `khong-cham`/`ke-thua`, hoặc là Bước 0 | Bỏ qua, in rõ lý do |

⚠️ **Giới hạn:** máy không đọc hiểu nội dung — bắt được ca *"để trống"* và *"chép sang chuyện khác"*; ca **chép hời hợt thì không**. Vì thế sổ chờ quyết có mục mặc định *"Huynh soi `V2.keThua` khi đóng Bước"*.

---

## 2. 📤 CỔNG RA — 8 mục chung cho mọi Bước (`R1`–`R8`)

| # | Mục kiểm | Nguồn |
|---|---|---|
| **R1** | **"Done khi"** của Bước — từng tiêu chí **PASS/FAIL**, **không có "gần đúng"** | 🎓 |
| **R2** | Mỗi mục PASS có **bằng chứng chỉ được**: đường dẫn file · lệnh chạy lại được · dòng trong sổ bằng chứng. Bằng chứng chạy thật theo **năm loại** §6 | 🎓 |
| **R3** | **Đã qua vòng review** theo `REVIEW-POLICY.md`: `lopReview` (`doc-lap` / `tu-soi`) · ai review · **phát hiện gì** (mảng) · **Huynh quyết định gì** (nguyên văn) → quyết định vào Dev Book | 🎓🔧 |
| **R4** | **13 điều kiện máy** của `gate-check.cjs` — §3 | 🔧 |
| **R5** | **Ràng buộc phát sinh cho Bước sau đã ghi vào `RTM.md`** khối *RÀNG BUỘC THEO BƯỚC* | 🔧 |
| **R6** | 🔑 **Mọi điểm mơ hồ ở V4 đã được giải quyết, hoặc đã chuyển thành ràng buộc / mục chờ quyết ghi lại** — không mục nào bỏ lửng. Điểm phát sinh thêm mà Bước này không giải ⇒ khai `dat:false` kèm `lyDo` — đó là **nợ đã ghi**, không phải việc đã làm | 🔧 |
| **R7** | 🔑 **Bộ 7 chỉ số sức khoẻ tài liệu đã ĐO lúc đóng Bước** — `node Log/doc-health.cjs`, `R7.canCu` dẫn số thật **đủ bảy** `c1`…`c7`. Không đo được thì ghi rõ kèm lý do, ⛔ không bịa số cho đủ | 🎓🔧 |
| **R8** | 🔑 **Đã đẩy git** — các thư mục `thuMuc.gacGit` không còn file dở. Đóng Bước khi mã và tài liệu của nó còn trong cây làm việc thì bản ghi đóng trỏ tới **một trạng thái không tồn tại trong lịch sử git**. Lối ra duy nhất cho file của **phiên song song**: khai `R8: {dat:false, lyDo}` — cổng chuyển CHẶN → cảnh báo, bản ghi mang nợ | 🔧 |

**Bản khai cổng** — `Log/cong-buoc/<mvp>[-<round>]-B<n>.json`: 13 mục `V1`–`V6` + `R1,R2,R3,R5,R6,R7,R8` *(R4 là máy, không khai tay)*, mỗi mục `{dat, canCu}`, **bắt buộc `lyDo` nếu `dat:false`**. Mẫu: `Log/cong-buoc/_MAU.json`. Thiếu file ⇒ **CHẶN**. Mục không đạt có lý do thì qua được, nhưng bản ghi đóng mang cảnh báo *"nợ đã ghi, không phải việc đã làm"*. ⛔ **Không có đường nào cho qua mà không để lại chữ.**

---

## 3. 🤖 13 ĐIỀU KIỆN MÁY — `node Log/gate-check.cjs --buoc <n> --mvp <nn> [--round R<k>] [--ghi]`

Mã thoát **0** = đủ điều kiện · **2** = còn điều kiện chưa đạt · **1** = dùng sai. `--ghi` **chỉ ghi khi qua** — không lưu một lần đóng không có thật.

| # | Điều kiện | Xong nghĩa là gì |
|---|---|---|
| **(0)** | Round đã mở | Có bản ghi `mo-round` trong `PHASE-GATE-LOG.ndjson`, bảng khai đủ 11 Bước *(Round 1 ngầm định được miễn)* |
| **(a)** | Task cấp 3 | MỌI task của Bước hoặc bắt đầu bằng ✅, hoặc ghi rõ lý do gác lại *(gác lại · để sau · ngoài phạm vi · hoãn)*. Ô trạng thái đọc theo **ký tự đầu**, không tìm chuỗi con |
| **(b)** | Bằng chứng chạy thật | Mỗi task `.BUILD.` đã ✅ có dòng trong `PROOF-LOG.ndjson` đúng **một trong năm loại** §6. Khai loại khác `http` mà thiếu `lyDoKhongHttp` ≥30 ký tự hoặc nội dung không khớp khuôn ⇒ CHẶN |
| **(c)** | c2 staged | `kiem-c2-staged.cjs` thoát 0 — tài liệu RTM nói là liên quan đã nằm trong cùng change set |
| **(d)** | Telemetry | Mỗi task ✅ có dòng `**[mã]**` trong `TELEMETRY.md` |
| **(e)** | Thứ tự | Mọi Bước trước có bản ghi `qua` — trừ Bước Round khai `khong-cham`/`ke-thua` *(bỏ qua được in ra và vào cảnh báo của bản ghi đóng)* |
| **(f)** | Bản khai cổng | File `cong-buoc/<mvp>[-<round>]-B<n>.json` khai đủ 13 mục; `dat:false` có `lyDo`. Có `--round` thì **bắt buộc** file của chính Round đó, ⛔ không lùi về file Round 1 |
| **(g)** | Khép vòng RTM | `V2.keThua` không rỗng khi Bước trước có `R5.canCu` (§1b) |
| **(h)** | Bộ 7 chỉ số | `doc-health.cjs` chạy được **và** `R7.canCu` dẫn đủ 7 mã. Bản chụp lưu `Log/doc-health-theo-buoc/` để so xu hướng. ⚠️ Cổng **không đặt ngưỡng** — ngưỡng là điều dừng 4 |
| **(i)** | Đã đẩy git | `git status --porcelain` trên `thuMuc.gacGit` rỗng, hoặc `R8:{dat:false,lyDo}` (liệt kê tên file, không chỉ đếm) |
| **(j)** | Sổ chờ quyết | Mọi mục `CHO-QUYET.ndjson` đến hạn ở Bước này mang cờ `chan:true` đã được Huynh quyết (`--da-quyet <id> "nguyên văn"`) |
| **(k)** | rtm-check | `rtm-check.cjs` thoát 0 — không story mồ côi · số ca test khớp · mọi tệp test được RTM nhắc. ⛔ Không phân biệt mã 1 với 2 ở đây — *không xác minh được = CHẶN* |
| **(l)** | Review theo chính sách | Nếu `reviewPolicy` đòi review độc lập ở Bước này / Round này: `R3.lopReview === "doc-lap"`, có `nguoiReview`, `phatHien` là mảng, `quyetDinh` ≥20 ký tự *(`REVIEW-POLICY.md`)* |
| **(m)** | Cổng RA riêng của Bước | Mọi lệnh trong `harness.config.json › congRaRieng[<n>]` thoát 0 *(Bước 1: backlog · Bước 9: phủ môi trường · Bước 10: phạm vi)* |

**Cổng tự in khối `📋 XONG NGHĨA LÀ GÌ`** cho đúng những điều kiện đang chặn. *Luật nằm trong tài liệu thì trông chờ người đọc; luật nằm trong đầu ra của cổng thì mọi Bước sau đều được nhắc, không cần ai nhớ.*

⚠️ **Chỗ cổng yếu nhất, ghi rõ để không tin quá:** `(b)` chỉ nhận ra task sinh mã qua quy ước tên `.BUILD.`. Task ✅ không mang `.BUILD.` mà thiếu bằng chứng thì cổng **chỉ cảnh báo và nêu đích danh**. Người phải tự soi.

---

## 4. 📊 Báo trạng thái một Bước ⇒ ĐỦ BA TẦNG, ⛔ không đếm task

Số task **không phải** thước đo trạng thái: một Bước có thể còn 12 task treo mà vẫn đóng được (nếu khai lý do gác lại), và 0 task treo mà không đóng nổi (thiếu bằng chứng, hở vòng RTM…).

| # | Tầng | Nguồn | Trả lời gì |
|---|---|---|---|
| ① | **13 điều kiện máy** | `gate-check.cjs --buoc` | Từng điều kiện **đạt / chưa**, kèm số đo |
| ② | **13 mục cổng** | `cong-buoc/*.json` | Mục nào khai, mục nào `dat:false` kèm lý do |
| ③ | **"Done khi"** của chính Bước | `PLAYBOOK.md` | Từng tiêu chí **PASS/FAIL**, không "gần đúng" |

🔑 **Với MỖI mục chưa đạt, phải mô tả *"xong nghĩa là gì"*** — tiêu chí cụ thể, kiểm được. Không có tiêu chí thì "chưa đạt" chỉ là một lời phàn nàn.

---

## 5. Mã task cấp 3 — quy ước để công cụ đọc được

```
<tienTo><nn>.<bước>[a-z]?[.R<k>].<nhóm>.<loại>.<số>

MVP_01.8.A.BUILD.1        ← Round 1 ngầm định
MVP_02.8.R2.B.BUILD.3     ← Round 2 của MVP 2, Bước 8, nhóm B
MVP_02.6a.RISK.C.1        ← hậu tố chữ cái tách nhánh trong cùng Bước
```

- Tiền tố ở `harness.config.json › maTask.tienTo`. **Round chèn SAU số Bước.** Công cụ khớp `<số>[a-z]?\.`, không khớp cứng.
- `<loại>`: **BUILD** (sinh mã chạy được — bắt buộc bằng chứng) · **C** tạo · **R** review · **U** cập nhật · **D** quyết định.
- **Ba tiêu chí một việc hợp lệ:** rõ ràng (biết xong ra cái gì) · trọn vẹn (không "làm tiếp phần còn lại") · tương đối độc lập. **≤ 2 ngày/việc.**
- **Mọi việc phải gắn mã task cấp 3 TRƯỚC khi làm** — không có mã = vô hình với hệ thống đo. Mã tạo **sau** khi làm thì khai thẳng *"mã tạo sau khi làm"*, không giấu.

Dòng `Log/TASKLIST.md`: `| `MVP_01.8.A.BUILD.1` | Create | <việc> | <ai> | ✅ xong <ngày> — <bằng chứng> |` — ô cuối là trạng thái, ký tự đầu quyết định: ✅ xong · 🔒 chờ duyệt · 🔄 đang làm · ⬜ chưa làm · ⛔ chặn.

---

## 6. 🧾 Bằng chứng chạy thật — NĂM LOẠI, ⛔ đừng máy móc

> *Nguyên văn luật gốc:* **"Các task liên quan đến CSDL thì không có bài test http được, nên tạo rule tách ra, không làm máy móc."**

| Loại | Dùng cho việc gì | Dấu hiệu máy đọc được trong `output` |
|---|---|---|
| `http` | Việc đẻ ra màn hình / điểm cuối | `HTTP <3 số>` |
| `sql` | Ràng buộc **bên trong CSDL** — khoá ngoại, chỉ mục, di trú | `PRAGMA` · `IntegrityError` · `constraint failed` · `rowcount` |
| `ma-thoat` | Cổng / lệnh chạy ở dòng lệnh | `mã thoát: <số>` |
| `doi-chieu-tep` | Kết luận **không cài gì** / đối chiếu kho mã | `requirements` · `git ls-files` · `git log` · `KHÔNG CÓ` |
| `nguoi-quyet` | Kết quả là **quyết định của người**, không phải mã | `nguyên văn` · `<chủ dự án> chốt` |

Dòng `Log/PROOF-LOG.ndjson`:
```json
{"taskId":"MVP_01.8.A.BUILD.1","cmd":"curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:8000/x","output":"HTTP 200 {...}","loggedAt":"..."}
{"taskId":"MVP_01.8.A.BUILD.2","loaiBangChung":"sql","lyDoKhongHttp":"việc bật khoá ngoại nằm trong CSDL, không có điểm cuối HTTP nào để gọi","cmd":"...","output":"PRAGMA foreign_keys = 1 · IntegrityError khi xoá cha","loggedAt":"..."}
```
⚠️ **Nới chỗ này thì AI được lợi**, nên nó siết bằng hai trường bắt buộc khi khác `http`: `loaiBangChung` **và** `lyDoKhongHttp` ≥30 ký tự, **và** nội dung phải khớp khuôn đúng loại. **Dán nguyên văn kết quả, không diễn giải lại.**

**Năm bước lấy bằng chứng `http`:** khởi động ứng dụng thật → gọi ≥1 luồng end-to-end chạm đúng tính năng → dán nguyên văn → `gate-check.cjs <taskId> --deliverable BUILD` → chỉ có mã + test chưa nối giao diện thì **không đánh xong**.

---

## 7. Cổng đối chứng độc lập — cho module tri thức miền tính toán xác định

> Thay hẳn luật *"chủ dự án phải tự đọc code"*. Luật đó hỏng về logic: mã, test và người đọc **đều chỉ có cùng một nguồn** ⇒ cùng một vòng lặp tự xác nhận; sai hệ thống thì không ai bắt được từ bên trong.

| Lớp | Nội dung | Ai |
|---|---|---|
| **L1** | **Nguồn đối chứng độc lập** (tác giả khác, kho mã khác, đường suy dẫn khác) quét **toàn không gian đầu vào có nghĩa**, so từng ô | Máy |
| **L2** | **Máy khoanh vùng mập mờ, không tự chọn** — chỗ các trường phái lệch nhau phải thành **dữ liệu có địa chỉ** | Máy |
| **L3** | **Bất biến toán học** tự suy từ thuật toán | Máy |
| **L4** | **Việc của Huynh — đúng 3 quyết định, không đọc code:** chốt trường phái khi L2 báo mâu thuẫn · cấp / duyệt nguồn đối chứng · chấp nhận rủi ro còn lại | Huynh |

**Điều kiện qua:** ≥1 nguồn đối chứng chạy được · mọi điểm lệch được phân loại (lỗi thật → sửa · khác trường phái → Huynh chốt **ghi tại chỗ thực thi** kèm căn cứ, không có căn cứ thì nói thẳng) · không có nguồn đối chứng ⇒ **chưa được coi là đã kiểm**, bất kể bao nhiêu test xanh. ⚠️ *Khớp là bằng chứng yếu, lệch mới là tín hiệu mạnh* — nhất là khi nguồn đối chứng cũng do AI sinh.

🔑 **Khuôn mẫu này nên nhân ra các cổng khác:** làm mỗi lần dừng của Huynh **rẻ đi** — máy chỉ đích danh chỗ cần quyết — thay vì bỏ cổng.

---

## 8. Lớp kiểm độc lập — Tester

**Tester độc lập** = tiến trình con riêng (subagent), **không thấy ngữ cảnh hội thoại**, chỉ thấy đúng thứ được giao, nhiệm vụ là **đi tìm chỗ sai**. Hai cấp Middle / Senior theo mức rủi ro; việc chạm rủi ro cao nhất (L×I ở ngưỡng cao của `RISK.md`) ⇒ **Senior bắt buộc** trước khi báo xong.

⚠️ **Giới hạn phải khai:** Tester chạy **cùng dòng model** với AI thực thi ⇒ đây là **lớp phòng vệ tương quan** — bắt được lỗi cẩu thả và lỗi biên, **không phải lớp độc lập thật**. Lớp độc lập thật chỉ có hai: **nguồn đối chứng bên ngoài** và **con người**. ⛔ Khi báo cáo không được viết *"đã qua kiểm định độc lập"* rồi để trống lượt Huynh.

📌 **Bằng chứng vì sao cần:** hai lần trong một tối, cổng máy xanh *(10/10 điều kiện · 13/13 mục)* rồi Tester bác **5 + 13 khẳng định**, và **cả 18 chỗ đều lệch cùng một hướng: làm việc trông rẻ hơn thực tế** — hướng AI được lợi. Thứ bắt được không phải cổng, không phải checklist, mà là **một con mắt khác đọc lại cùng mã với nhiệm vụ đi tìm chỗ sai**.

---

## 9. 🔔 Sổ chờ Huynh quyết — bung đúng lúc, không dồn một đống

Thứ AI không tự quyết được trước nay đi vào hai chỗ, **cả hai đều hỏng**: nói trong tin nhắn → trôi theo hội thoại; ghi vào bàn giao → nằm im, không gì bung ra đúng lúc. *(Một mục treo 15 ngày với 4 việc "chờ duyệt" — hoá ra đã lạc hậu từ lâu, không ai phát hiện.)*

**Cơ chế:** `Log/CHO-QUYET.ndjson` + `node Log/cho-quyet.cjs`. Mỗi mục bắt buộc: **việc gì** · **vì sao AI không tự quyết được** *(điều dừng số mấy)* · **gật thì sao / lắc thì sao** · 🔑 **điều kiện bung** — `moi-buoc` · `buoc` *(Bước cụ thể)* · `dong-mvp` · `su-kien` · `luon`. Mục `chan:true` ⇒ **CHẶN** cổng.

⚠️ **Mục chưa tới lúc thì IM LẶNG, có chủ ý.** Dồn hết ra mọi lúc thì Huynh ngừng đọc — *một cổng lúc nào cũng đỏ thì không còn là cổng*.
⛔ **AI không được tự đóng một mục.** `--da-quyet <id> "…"` bắt buộc **nguyên văn** Huynh — chỗ nào AI vừa ghi nợ vừa xoá nợ thì sổ vô nghĩa. Nguyên văn không được là một cái cờ (`--…`).

---

## 10. Ba sổ, ba câu hỏi khác nhau — ⛔ đừng lẫn

| Sổ | Trả lời câu | Ai đóng mục được |
|---|---|---|
| `Instructions/PHAM-VI-MVP.json` | *MVP này **PHẢI giao** những gì?* | **Chỉ Huynh** |
| `Log/CHO-QUYET.ndjson` | *Thứ này **quyết thế nào**?* | **Chỉ Huynh**, đòi nguyên văn |
| `Output/BACKLOG.md` | *Thứ này đã quyết là **HOÃN** — bung lại khi nào?* | Vào đây **sau khi** Huynh đã quyết hoãn, kèm **điều kiện bung lại nhận ra được** |

🔑 *Đưa vào backlog là cách êm ái nhất để một việc biến mất mà không ai thấy nó biến mất. Cột "bung lại khi" là thứ phân biệt **hoãn** với **bỏ**.*
