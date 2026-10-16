# DOC-HEALTH-RULES — 7 chỉ số sức khoẻ tài liệu

> **Đọc khi:** **Bước 9 (Test & Gate)** — cổng RA `R7` đòi đo đủ 7 chỉ số bằng `node Log/doc-health.cjs`; **Bước 8 (BUILD)** — mỗi lần commit mã, cổng `c2` (`node Log/kiem-c2-staged.cjs`) chạy trước; và **ngay ngày đầu dự án** — xem §5 (ba chỉ số mất dữ liệu vĩnh viễn nếu không ghi từ đầu).
> **Đọc kèm:** `Output/RTM.md` · `Output/DEVBOOK.md` · `Output/RISK.md` · `Output/ARCH.md` · `Log/cong-buoc/*.json` · `harness.config.json` khối `docHealth` · `UT-RULES.md` / `IT-SIT-RULES.md` / `UAT-RULES.md` (bộ 4 tệp kiểm thử cùng cấp).
> Những chỗ dự án mới phải điền được đánh dấu `<...>`.

---

## §0. Bài học trước khi đọc định nghĩa

🔑 **Định nghĩa chỉ số phải giữ NGUYÊN VĂN người ra đề ngay từ đầu, rồi mới diễn giải bên dưới.**

Một bộ định nghĩa được diễn giải trước, giữ nguyên văn sau, đã trôi **5/7 chỉ số** đúng ở khâu diễn giải — ba trong năm chỗ lệch làm **đo sai thứ được hỏi**, không phải sai câu chữ (đo *tốc độ* thay vì *tồn kho* · đo *độ đúng* thay vì *độ phủ nguồn* · hỏi *ai đặt hàng cái này* thay vì *cái này có được giải thích không*). Không ai phát hiện cho tới khi đặt hai bản cạnh nhau.

⇒ Trong §2, mỗi chỉ số mở đầu bằng khối `>` **nguyên văn**; mọi công thức, bẫy, cách đo đều đứng **dưới** khối đó và phải đối chiếu lại với nó.

🔑 **Thứ được gắn nhãn "đạt" thì không ai kiểm lại.** Nhãn ✅ trong bảng đối chiếu phải kèm *"đạt ở điểm nào, còn hở điểm nào"*, và **mọi vế ⚠️ đều phải đẻ ra một mục nợ** — nếu không nó sẽ tự bay hơi.

---

## §1. Bảy chỉ số này đo cái gì

Chúng **không đo phần mềm** — chúng đo **sức khoẻ của bộ tài liệu và mối nối giữa tài liệu với mã nguồn**.

Câu hỏi chung đứng sau cả bảy: *"Bộ tài liệu này còn nói đúng về hệ thống thật không, hay đã trôi mất mà không ai biết?"*

| Mã | Tên | Câu hỏi nó trả lời |
|---|---|---|
| **c1** | Traceability coverage | Bao nhiêu **requirement quan trọng** nối được tới **work item**, **code/module** và **test**? |
| **c2** | Change coupling | Khi mã đổi, tài liệu **liên quan** **có đổi cùng lúc** không? |
| **c3** | Freshness | **Bao nhiêu tài liệu** đã **quá hạn** hoặc **không còn khớp** với phiên bản hiện tại? |
| **c4** | Orphan rate | Bao nhiêu **requirement không có code/test**, và bao nhiêu **module quan trọng không có tài liệu giải thích**? |
| **c5** | Review evidence | Bao nhiêu artifact có **dấu vết con người sửa, bác bỏ giả định, hoặc phê duyệt**? |
| **c6** | Decision coverage | Các **thay đổi kiến trúc** và **vùng rủi ro cao** có **decision record** hay không? |
| **c7** | Retrieval quality | Khi hỏi về một **chức năng**, AI có tìm đúng **spec · code · test · quyết định liên quan** hay không? |

🔑 Mục đích của cả bộ: **biến việc "tình cờ phát hiện" thành việc "đo được định kỳ"** — lỗ truy vết, quyết định chỉ nằm trong chat, mã chạy mà không tài liệu nào nhận… đều là những thứ thường chỉ lộ ra do may.

---

## §2. Định nghĩa từng chỉ số

### c1 — Traceability coverage
> **Nguyên văn:** *"bao nhiêu requirement quan trọng nối được tới work item, code/module và test"*.

**Đo:** tỉ lệ **requirement quan trọng** nối được **đủ cả ba chặng**.
**Công thức:** `số requirement nối đủ (→ work item → code/module → test) ÷ số requirement quan trọng`.
🔴 Chuỗi *"yêu cầu → thiết kế → mã → test"* là **sai** — **thiếu mắt xích `work item`**. Người ra đề muốn thấy requirement ứng với **task/backlog nào**, không phải với tài liệu thiết kế nào. Ma trận truy vết phải có **cột work item**; nếu không thì có tính cũng chưa phải cái được hỏi.
**Nguồn:** ma trận truy vết (`Output/RTM.md`).
⚠️ **Bẫy 1:** đếm hàng *"có ghi gì đó ở mọi cột"* thay vì *"cột đó trỏ tới thứ CÓ THẬT"*. Một ô ghi tên file đã bị xoá vẫn làm chỉ số đẹp lên. ⇒ Công cụ phải kiểm **tệp có tồn tại**, không chỉ ô có chữ.
⚠️ **Bẫy 2 — MẪU SỐ trên dự án cuốn chiếu (rolling-wave):** nếu đếm **mọi** hàng yêu cầu thì các hàng **chưa tới lượt build** sẽ luôn kéo chỉ số xuống, và số ra **đánh lừa** — trông như mất truy vết trong khi thực tế là chưa làm.
⇒ **Mẫu số phải là "hàng ĐÃ BUILD"**, và phải **công bố kèm số hàng bị loại + lý do**. Nếu không thì hoặc chỉ số luôn xấu (đếm hết), hoặc luôn đẹp (âm thầm loại) — cả hai đều không dùng được.

### c2 — Change coupling
> **Nguyên văn:** *"khi code thay đổi, tài liệu liên quan có được cập nhật trong cùng change set hay không"*.

**Đo:** trong các commit có đụng mã nguồn, bao nhiêu % **đụng cả tài liệu LIÊN QUAN** trong cùng commit.
**Công thức:** `số commit chạm CẢ mã lẫn tài liệu liên quan ÷ số commit chạm mã`.
**Nguồn:** lịch sử git.
⚠️ **Chữ "liên quan" không được sót:** đếm **bất kỳ** tài liệu nào trong commit là **dương tính giả** (sửa code auth mà tiện tay sửa bản đồ file cũng thành "coupled").
**Quy tắc máy tra được "tài liệu liên quan" trong harness** — *tài liệu liên quan là tài liệu có trong RTM*: với mỗi file mã trong commit → tìm dòng `Output/RTM.md` có file đó ở cột Test/Code → tài liệu liên quan = `Output/RTM.md` + `Output/SPEC.md` (story `US-xx` của dòng đó) + `Output/ARCH.md` (mã quyết định của dòng đó). Không đòi `Output/SCOPE.md` — luật đó đánh trượt cả commit mẫu mực. Commit mà file mã **không có dòng RTM nào trỏ tới** nhận phán quyết thứ ba **`không tra được`** và **loại khỏi mẫu số** — đó là lỗ **c4**, không phải trượt c2.
🔑 Khi siết từ "bất kỳ `.md`" sang "liên quan", chỉ số **thường rớt mạnh** — số cũ đẹp vì đếm cả tài liệu phụ. Công bố kèm **độ nhạy** (bỏ một điều kiện thì số ra bao nhiêu) để thấy kết quả không phụ thuộc một lựa chọn duy nhất.
⚠️ **Bẫy 1 — bản nhập ban đầu:** commit đầu tiên đưa cả thư mục mã vào git sẽ **luôn** được chấm "coupled" bất kể thực tế ⇒ **điểm dương giả**. Phải loại hoặc đánh dấu `initial-import` — khai ở `docHealth.c2LoaiTru` trong `harness.config.json`.
⚠️ **Bẫy 2 — chỉ số này KHÔNG ĐO NGƯỢC ĐƯỢC.** Nó đo lịch sử, nên phải chuẩn bị (đưa mã vào git) **trước** khi thay đổi xảy ra. Chuẩn bị sau là mất vĩnh viễn các điểm dữ liệu trước đó.
⚠️ **Bẫy 3:** commit gộp quá to (một commit đụng hàng trăm file) làm chỉ số vô nghĩa theo cả hai chiều.

### c3 — Freshness
> **Nguyên văn:** *"bao nhiêu tài liệu đã quá hạn hoặc không còn khớp với phiên bản hiện tại"*.

**Đo:** **SỐ LƯỢNG tài liệu** đang ở trạng thái quá hạn / không còn khớp với phiên bản hệ thống hiện tại.
**Công thức:** `số tài liệu lệch ÷ tổng số tài liệu`.
🔴 **Đây là TỒN KHO, không phải TỐC ĐỘ:** đo *"bao lâu thì tài liệu đuổi kịp"* (độ trễ) là **sai đại lượng**. Câu hỏi là *ngay lúc này có bao nhiêu tài liệu đang lệch*. Mẫu số rất dễ: **tổng số tài liệu**. *(Độ trễ vẫn là chỉ số tốt, nhưng là **chỉ số phụ tự thêm**, không phải `c3`.)*
**Khung đo thực dụng:** tồn kho **điểm lệch đã ghi nhận** (các dòng đính chính / `~~gạch bỏ~~`). Ghi rõ: điểm lệch **chưa từng bị phát hiện** thì không đo được — theo đúng định nghĩa của chính nó.
⚠️ **Bẫy:** một bộ tài liệu **không có dòng đính chính nào** có thể là rất tươi — hoặc **chưa ai từng kiểm**. Chỉ số này phải đọc kèm c1/c2, đứng một mình dễ hiểu ngược.

### c4 — Orphan rate
> **Nguyên văn:** *"bao nhiêu requirement không có code/test, và bao nhiêu module quan trọng không có tài liệu giải thích"*.

**Đo:** tỉ lệ phần tử **mồ côi**, theo cả hai chiều:
- **Mồ côi xuôi:** yêu cầu có mà **không** truy được xuống mã/test ⇒ *đã hứa mà chưa làm*
- **Mồ côi ngược:** **module quan trọng** có mà **không có tài liệu giải thích** ⇒ *có thứ đang chạy mà không ai giải thích được nó làm gì*

🔴 Chiều ngược định nghĩa là *"mã không truy được về yêu cầu nào"* là **SAI** — đó là câu hỏi *"ai đặt hàng cái này"*, còn câu được hỏi là *"cái này có được giải thích ở đâu không"*. Hai câu khác nhau. **Giữ lại cả hai** khi đo, nhưng gọi đúng tên: vế của người ra đề là **thiếu tài liệu**, vế kia là **thiếu nguồn gốc yêu cầu**.
⚠️ **Bẫy:** chỉ đếm chiều xuôi. Chiều ngược mới là chỗ lộ **cơ chế chết** — thứ tồn tại trong mã, được ghi trong tài liệu là "đã có", nhưng **không đường nào chạy tới** (template không route nào render · module không điểm vào nào gọi).
⚠️ **Chặn kỹ thuật phải khai thẳng:** muốn đo chiều ngược bằng máy thì `Output/MODULEMAP.md` phải nêu **tên file thực thi**, không chỉ mô tả khái niệm. Khai `docHealth.c4.ngonNgu = "none"` trong `harness.config.json` ⇒ chiều ngược **khai là không đo được bằng máy**, không công bố 0% rồi coi như sạch.

### c5 — Review evidence
> **Nguyên văn:** *"bao nhiêu artifact có dấu vết con người sửa, bác bỏ giả định hoặc phê duyệt"*.

**Đo:** tỉ lệ artifact có **ít nhất một trong ba dấu vết**: người **sửa** · người **bác bỏ giả định** · người **phê duyệt**.
⚠️ **Hai cách đếm, phải khai đang dùng cách nào:** luật *"đã review mà không tìm ra gì thì không tính"* là **siết chặt hơn** người ra đề (tự loại vế phê duyệt). Đếm theo nguyên văn thì số cao hơn; đếm theo luật siết thì thấp hơn nhưng chặt hơn. **Không được lẫn hai cách rồi so với nhau.**
**Bằng chứng thật trông thế nào:** ghi được **ai** review, **tìm ra gì**, **sửa thế nào**. Dev Book có cột quyết định của chủ dự án; biên bản review có phát hiện cụ thể.
⚠️ 🔑 **Bẫy lớn nhất trong cả 7 chỉ số:** *"đã review"* mà **không tìm ra gì** thì không phải bằng chứng review — nó là bằng chứng **đã mở file ra**. Chỉ số này phải đếm **phát hiện**, không đếm **lượt**.

### c6 — Decision coverage
> **Nguyên văn:** *"các thay đổi kiến trúc và vùng rủi ro cao có decision record hay không"*.

**Đo:** tỉ lệ **(thay đổi kiến trúc + vùng rủi ro cao)** có decision record truy được.
🔴 **Mẫu số có HAI vế:** chỉ đối chiếu danh sách rủi ro cao là **thiếu hẳn vế kiến trúc** — một quyết định kiến trúc không ghi lại sẽ **không bao giờ bị chỉ số này bắt**.
**Công thức:** `số quyết định có mã và ghi trong tài liệu ÷ số điểm đáng lẽ phải có quyết định`.
⚠️ **Bẫy:** mẫu số khó. Cách thực dụng — đối chiếu với **các rủi ro mức cao** (L×I ≥ `docHealth.nguongRuiRoCao`): mỗi rủi ro cao mà **không** có quyết định gắn vào là một lỗ; **cộng** mọi mã quyết định kiến trúc trong `Output/ARCH.md`.
📌 **Dấu hiệu nhận ra lỗ:** một quy tắc nghiệp vụ **đang chi phối thiết kế** nhưng **chỉ tồn tại trong lịch sử chat** — người sau đọc tài liệu sẽ tự lấp bằng phỏng đoán, mỗi người một kiểu.

### c7 — Retrieval quality
> **Nguyên văn:** *"khi hỏi về một chức năng, AI có tìm đúng spec, code, test và quyết định liên quan hay không"*.

**Đo:** với mỗi **chức năng** được hỏi, AI có trỏ ra đúng **cả 4 loại nguồn**: **spec · code · test · quyết định liên quan**.
**Cách chấm:** mỗi câu hỏi chấm theo **4 cột nguồn** (đủ / thiếu / sai), không chấm một điểm đúng-sai duy nhất. Mỗi ô trích **`file:dòng`** để soi lại được.
🔴 **Đây là ĐỘ PHỦ NGUỒN, không phải ĐỘ ĐÚNG:** một AI trả lời đúng nhờ suy luận mà **không trỏ được về tài liệu nào** thì theo định nghĩa này là **trượt**. Hai con số *độ đúng* và *độ phủ nguồn* **không thay thế nhau** — có đo cả hai thì giữ cả hai, gọi đúng tên từng cái.
⚠️ **Khác hẳn 6 chỉ số kia:** sáu cái trên đọc tĩnh được; cái này là **phép đo hành vi**, phải **dựng bộ câu hỏi và chạy thật**.
**Cách làm:** soạn bộ câu hỏi có đáp án đã biết → tra → chấm đủ/thiếu/sai từng cột. Công bố kèm **khoảng tin cậy**, vì cỡ mẫu thường nhỏ.
⚠️ **Bẫy 1:** tự soạn câu hỏi rồi tự chấm mình. Người soạn câu hỏi **biết tài liệu nằm ở đâu** nên sẽ vô tình hỏi những câu tra được.
⚠️ **Bẫy 2 — đường cụt đã thử:** chấm bằng **grep** thay cho tra tay **thổi số lên** (và gấp gần đôi số chức năng "đủ 4 nguồn") — grep đếm chuỗi xuất hiện, không đếm nguồn *liên quan*. Giữ kết quả đường cụt làm bằng chứng phương pháp, không xoá.

---

## §3. Nguồn dữ liệu của từng chỉ số trong harness

| Chỉ số | Nguồn | Công cụ |
|---|---|---|
| **c1** | `Output/RTM.md` — hàng đã build, đủ ba cột Story · Work item · Test/Code trỏ tới **tệp có thật** | `node Log/doc-health.cjs` · `node Log/rtm-check.cjs` |
| **c2** | Lịch sử git + `Output/RTM.md` (quy tắc "tài liệu liên quan" §2) | `node Log/doc-health.cjs` (đo lịch sử) · `node Log/kiem-c2-staged.cjs` (cổng **trước commit**, chạy trong skill `day-git`) — hai bên phải cho **cùng phán quyết** trên cùng commit |
| **c3** | Các dòng đính chính / `~~gạch bỏ~~` trong `Output/*.md` | `node Log/doc-health.cjs` |
| **c4** | Xuôi: `Output/RTM.md` (story không có Test/Code) · Ngược: `Output/MODULEMAP.md` + điểm vào `docHealth.c4.diemVao` | `node Log/doc-health.cjs` |
| **c5** | `Output/DEVBOOK.md` + mục `R3` (lớp review) trong `Log/cong-buoc/*.json` | `node Log/doc-health.cjs` |
| **c6** | `Output/RISK.md` (L×I ≥ `docHealth.nguongRuiRoCao`) + `Output/ARCH.md` (mã quyết định, khuôn `ma.quyetDinh`) | `node Log/doc-health.cjs` |
| **c7** | `Log/c7-ket-qua.json` — phép đo hành vi, **chạy tay**; `doc-health.cjs` chỉ **đọc lại** tệp này | Bộ câu hỏi `<Log/c7-cau-hoi.md>` + tra tay |

Kết quả gom ở `Log/DOC-HEALTH.json`; theo từng Bước ở `Log/doc-health-theo-buoc/`. Cổng RA `R7` của mỗi Bước đòi khai đủ `c1`…`c7` **số thật** — thiếu mã nào thì chặn.

---

## §4. Bẫy đã gặp thật — bài học tổng quát

### 4.1. Chỉ số đo lịch sử không đo ngược được
Thi công xong rồi mới commit, lại gộp chung với **bản nhập mã lần đầu** vào một commit lớn ⇒ commit đó có cả mã lẫn tài liệu, phép đếm ngây thơ chấm "coupled" — nhưng là **điểm dương giả**, đúng loại lỗi chỉ số sinh ra để phát hiện. Không dựng lại lịch sử (rủi ro hỏng bộ test đang xanh, đổi lấy một điểm dữ liệu) — **ghi ngoại lệ tường minh** (`docHealth.c2LoaiTru`) thay vì sửa lịch sử.
🔑 **Một chỉ số đo lịch sử thì không đo ngược lại được.** Phải chuẩn bị *trước* khi thay đổi xảy ra. Với c2, "chuẩn bị" nghĩa là **đưa mã vào git trước khi bắt đầu sửa** — không phải "khi rảnh".

### 4.2. Bẫy đơn vị — tên cột không bảo đảm đơn vị bên trong ô
Cột tên *"(phút)"* nhưng nhiều ô ghi bằng **giây** — và đó là cách ghi trung thực hơn, không phải cẩu thả. Hai công cụ đọc cột đó sai theo hai kiểu ngược nhau: một lấy số đầu coi là phút (sai **60 lần**, một dòng làm cả một Bước phình gấp hàng chục lần); một đòi đúng chữ "phút" nên **bỏ qua sạch** các dòng đó (đếm thiếu, báo lệch giả).
🔑 **Phải đọc đơn vị ghi trong ô, không tin tên cột.** Lỗi này sống lâu vì cả hai công cụ đều *chạy được, không lỗi, ra số trông hợp lý* — chỉ lộ khi **nhìn số trong bối cảnh** (vẽ lên biểu đồ thấy một Bước chiếm phần lớn tổng), đọc code không ra.

### 4.3. Bản nhập ban đầu phải loại
Mọi phép đếm trên lịch sử (c2, và chỉ số phụ độ trễ của c3) phải **loại hoặc đánh dấu `initial-import`** — bản nhập ban đầu đúng theo mọi tiêu chí mà không nói gì về thói quen làm việc.

### 4.4. Nhãn "đạt" làm nợ bay hơi
Bảng đối chiếu gắn một chỉ số nhãn ✅ với vế ⚠️ nằm phía sau; chỉ số khác ghi ❌ nhưng **không mở thành mục nợ**. Danh sách nợ vì thế thiếu hai mục, đóng sạch phần còn lại rồi **tưởng xong cả bộ**.
🔑 **Mọi vế ⚠️ phải đẻ ra một mục nợ có điều kiện trả** — ghi vào `Log/CHO-QUYET.ndjson` hoặc `Output/BACKLOG.md`, không để trong một ô bảng.

---

## §5. Phạm vi khi áp lần đầu — câu hỏi đúng không phải "dựng dashboard thế nào"

🔑 Khi áp bộ này vào một dự án, **việc đầu tiên không phải dựng báo cáo** mà là hỏi: **chỉ số nào mất dữ liệu vĩnh viễn nếu không bắt đầu ghi ngay?** — tổng quát hoá bài học §4.1 ra cả bảy.

| Nhóm | Chỉ số | Vì sao |
|---|---|---|
| 🔴 **Mất vĩnh viễn — phải ghi ngay từ ngày đầu** | **c2** | Đo **lịch sử commit**. Không commit thì không có điểm dữ liệu, và **không dựng lại được** |
| | **c3** | Dòng đính chính thường chỉ ghi **lúc sửa**, không ghi **lệch từ bao giờ** ⇒ tử số có, mốc bắt đầu lệch **mất** |
| | **c6** | Đo **quyết định chỉ tồn tại trong đầu/chat**. Thứ chưa bao giờ được ghi thì **không tìm lại được bằng cách đọc tài liệu** ⇒ chỉ số tự đo chính cái đã có, **thành vòng tròn** |
| ✅ **Tính lại bất cứ lúc nào** | **c1 · c4 · c5** | Đều đọc **trạng thái hiện tại** (ma trận truy vết · cấu trúc mã · nhật ký review), không cần lịch sử |
| ⏸️ **Chạy khi cần** | **c7** | Phép đo **hành vi** — chạy lúc nào cũng được trên bộ tài liệu lúc đó. Chỉ cần ghi trước **nếu muốn xem xu hướng theo thời gian** |

### Ba quy ước phải dựng ngay *(và chỉ ba)*

| Chỉ số | Quy ước |
|---|---|
| **c2** | Đưa mã vào version control **trước khi bắt đầu sửa**; giữ commit **nhỏ**, gộp **mã + tài liệu liên quan trong cùng một lượt** — cổng `kiem-c2-staged.cjs` gác điều này ở skill `day-git` |
| **c3** | Mỗi dòng đính chính ghi thêm **mốc bắt đầu lệch**, không chỉ mốc sửa |
| **c6** | **Mọi quyết định được gán mã NGAY LÚC QUYẾT** (khuôn `ma.quyetDinh`), không để ghi sau |

⚠️ **Ba quy ước này là LUẬT THƯỜNG TRỰC, không phải việc một lần** — đặt vào `Instructions/PLAYBOOK.md`, không đặt vào danh sách việc.

### Khi xuất báo cáo — bắt buộc ghi mốc bắt đầu đo

`c3` và `c6` **chỉ có ý nghĩa từ lúc áp quy ước trở đi**. Trình bày chúng như thể đo cả dự án là **nói sai**, và sai theo hướng làm số đẹp lên. Ghi `duAn.ngayBatDau` (`harness.config.json`) và mốc `dayGit.mocGoc` vào đầu mọi báo cáo.

---

## §6. Khi báo một con số — ba điều bắt buộc đi kèm

| # | Phải kèm | Vì sao |
|---|---|---|
| 1 | **Định nghĩa đang dùng** (nguyên văn hay bản siết — c5; độ đúng hay độ phủ — c7) | Hai cách đếm cho hai số khác nhau; lẫn là so táo với cam |
| 2 | **Mẫu số + số bị loại + lý do loại** (c1 hàng chưa build · c2 commit `initial-import` / `không tra được`) | Loại âm thầm = số luôn đẹp; không loại = số luôn xấu |
| 3 | **Khoảng tin cậy** khi n nhỏ (c7, c1 ở đợt đầu) | Một tỉ lệ trên 10 mẫu không nói được gì nếu không có khoảng |

🔑 **Không sửa tài liệu hay test để chỉ số đẹp lên** — đây là dạng gian lận nặng nhất bộ chỉ số này dính, và nó khó bắt nhất vì mọi cổng vẫn xanh.
