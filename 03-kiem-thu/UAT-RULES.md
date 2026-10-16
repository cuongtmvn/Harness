# UAT-RULES — Nguyên tắc User Acceptance Test (UAT)

> **Đọc khi:** **Bước 9 (Test & Gate)** — sau khi IT/SIT đã đạt (`IT-SIT-RULES.md` §6), trước khi đóng Bước 9 và trước mọi lần đẩy production.
> **Đọc kèm:** `UT-RULES.md` (tầng 1) · `IT-SIT-RULES.md` (tầng 2–3; bảng kim tự tháp §0 **không lặp ở đây**) · `Instructions/PLAYBOOK.md` mục Bước 9 · `Output/SPEC.md` (User Story + AC) · `Output/RISK.md` (thang L×I) · `Output/SITUAT.md` (nơi lưu bảng trace, Defect Log, kết quả).
> Những chỗ dự án mới phải điền được đánh dấu `<...>`.

---

## 0. Vị trí trong kim tự tháp 4 tầng

- **Chạy ở Bước 9** (Test & Gate), sau khi IT/SIT đã đạt.
- **Ai làm:** **Tester độc lập** *(tiến trình con, không thấy ngữ cảnh hội thoại)* đóng vai người dùng thật → **chủ dự án sign-off cuối**.
- **Nhìn gì:** CHỈ giao diện/API như người dùng — **không đọc source code** (đó là việc của IT/SIT).
- **Kết quả lưu:** `Output/SITUAT.md` §UAT.

---

## 1. Mục tiêu & phạm vi

- **Mục tiêu:** xác nhận phần mềm đáp ứng **Acceptance Criteria** trong `Output/SPEC.md` và chạy đúng quy trình nghiệp vụ thật, trước khi coi lát cắt là xong.
- **Phạm vi:** chỉ kiểm thử **nghiệp vụ + trải nghiệm người dùng + tiêu chí chấp nhận**.
- **Ngoài phạm vi (tuyệt đối không đưa vào UAT):** kiểm mối ghép module, đọc code, đo contract API — những thứ đó thuộc IT/SIT. Đưa test kỹ thuật vào UAT là làm thừa và làm loãng mục tiêu.

---

## 2. Traceability bắt buộc

**Luật:** mỗi User Story / AC đã build phải có **≥1 ca UAT**; ngược lại mỗi ca UAT phải truy được về **đúng 1 AC cụ thể**.

- Chuỗi truy vết đầy đủ: `Output/SCOPE.md (mục tiêu) → Output/SPEC.md (US + AC) → Output/SITUAT.md (UAT-xx)`.
- **Bảng trace đặt trong `Output/SITUAT.md`** — ⛔ không đặt ở `Output/RTM.md` (tệp đó truy vết Requirement ↔ Code ↔ Test ở tầng dự án; tránh hai nơi lưu cùng một thứ).
- **Không cho sign-off nếu bảng trace còn dòng trống** — AC đã build mà không có ca UAT = lỗ hổng, không phải "chưa cần".
- Ca UAT không truy được về AC nào = **ca thừa**, phải bỏ hoặc bổ sung AC vào `Output/SPEC.md` trước.

**Mẫu bảng trace** (đặt trong `Output/SITUAT.md`):

| US | AC | Ca UAT | Test data | Rủi ro (§3) | Kết quả | Defect |
|---|---|---|---|---|---|---|
| `US-01` | `AC1` | `UAT-01` | `TD-01` | 🟢 | `<PASS/FAIL>` | — |
| `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` | `<...>` |

Mã ca test theo họ `testCase` trong `harness.config.json` khối `ma` (mặc định `UAT-<nhóm>-<số>`).

---

## 3. Phủ theo rủi ro — dùng đúng thang đã có, không đẻ thang mới

Mỗi ca UAT gắn **một nhãn rủi ro lấy thẳng từ `Output/RISK.md`** (thang L×I đã có) — ⛔ không tự chế thang High/Medium/Low riêng. Ngưỡng cao = `docHealth.nguongRuiRoCao` trong `harness.config.json` (mặc định 12).

| Nhãn | Điều kiện | Bắt buộc gì |
|---|---|---|
| 🔴 **High** | Ca chạm rủi ro **L×I ≥ ngưỡng cao** — `<R-xx, R-yy…>` | **Bắt buộc có ca** + **Tester độc lập mức Senior** · fail = chặn ngay |
| 🟡 **Medium** | Ca chạm rủi ro L×I `<khoảng giữa, vd 8–11>` — `<R-xx…>` | Bắt buộc có ca · Tester độc lập mức Middle trở lên |
| 🟢 **Low** | Còn lại | Test tối thiểu nhưng vẫn phải có contract rõ |

🔑 **Nguyên tắc:** rủi ro cao → test mạnh, rủi ro thấp → test tối thiểu. **Không phủ đều** mọi thứ như nhau — đó là làm thừa.

---

## 4. Luật test data

> ⚠️ Dữ liệu cá nhân `<ngày/giờ/nơi sinh · số điện thoại · email · địa chỉ…>` = **dữ liệu nhạy cảm, Leash A+**. Đây không phải khuyến nghị hình thức — đây là **luật cứng**.

**Cấm tuyệt đối:**
- ❌ **KHÔNG dùng dữ liệu cá nhân của người thật** — kể cả của chủ dự án, gia đình, bạn bè, đồng nghiệp — trong test case, log, screenshot, hay bất kỳ tài liệu nào.
- ❌ Không dùng **tên thật** của người thật kèm dữ liệu cá nhân (kể cả tên phổ biến), tránh vô tình trùng người có thật.

**Bắt buộc:**
- ✅ Dùng **bộ dữ liệu tổng hợp cố định, có mã `TD-xx`** — mỗi ca test ghi rõ dùng `TD` nào để **tái lập lại được** (chạy lại ra đúng kết quả cũ).
- ✅ Tên trong dữ liệu test phải **hiển nhiên là giả** (chứa "Test" / "Mau"), không đặt tên nhìn như người thật.
- ✅ Dùng **chung một bộ `TD-xx` cho cả IT/SIT/UAT** — không mỗi tầng tự chế dữ liệu riêng.
- ✅ 🔑 **Mọi "kết quả mong đợi" phải VERIFY bằng hệ thật trước khi ghi vào bộ test — không được suy luận rồi ghi.** Một kỳ vọng ghi theo suy luận mà sai thì ca đó **không kiểm được gì cả**, và còn tạo cảm giác đã kiểm.
- ✅ Khi một thay đổi làm kết quả lệch theo **hai chiều** (cách cũ đúng/cách mới sai *và* ngược lại), bộ test phải **phủ cả hai chiều**, không chỉ chiều phát hiện ra bug.

**Mẫu bộ dữ liệu chuẩn** (mở rộng khi build thêm tính năng; đặt trong `Output/SITUAT.md`):

| Mã | Dữ liệu | Dùng để kiểm | Kết quả mong đợi (đã verify bằng hệ thật) |
|---|---|---|---|
| `TD-01` | "Nguyen Van Test" · `<đầu vào hợp lệ>` | Đường thuận cơ bản | `<...>` |
| `TD-02` | "Tran Thi Mau" · `<đầu vào biên — chiều 1>` | `<ca biên chiều 1>` | `<...>` |
| `TD-03` | "Le Van Mau" · `<đầu vào biên — chiều 2>` | `<ca biên chiều 2>` | `<...>` |
| `TD-04` | "Pham Thi Test" · `<sai định dạng>` | Sai định dạng | Báo lỗi, **không echo lại chuỗi đã nhập** |
| `TD-05` | "Hoang Van Test" · `<giá trị không tồn tại, vd 30/02>` | Giá trị không tồn tại | Báo lỗi rõ ràng, không tính toán |
| `TD-06` | "Do Thi Mau" · `<giá trị biên hợp lệ, vd 29/02 năm nhuận>` | Biên **hợp lệ** | Xử lý bình thường, không báo lỗi oan |
| `TD-07` | Trùng khớp `TD-01` | Dedupe / chống trùng | `<chặn + thông báo đúng AC>` |
| `TD-08` 🔒 | `<tên có dấu / ký tự đặc biệt>` | Xử lý Unicode, dấu tiếng Việt | `<...>` — bất biến: **gõ có dấu và không dấu phải ra kết quả y hệt** |

> ⚠️ **Ngoại lệ có chủ ý về tên:** muốn kiểm xử lý dấu tiếng Việt / ký tự đặc biệt thì tên phải **có dấu thật**, nên không chứa "Test"/"Mau". Được phép, với điều kiện: ghi rõ đây là **ngoại lệ cố ý**, tên **tự nghĩ ra**, và **không gắn với dữ liệu cá nhân của bất kỳ ai thật**. Nên phủ cả chữ "Đ" — chỗ hay lỗi Unicode.
> 🔒 Dữ liệu **để dành** (chưa có ca nào dùng vì tính năng chưa build) vẫn ghi trước **nếu đã verify bằng hệ thật** — thành mốc regression dùng ngay khi build, khỏi tính lại và khỏi rơi vào lỗi "ghi kỳ vọng theo suy luận".

**Anonymize:** vì đã dùng dữ liệu tổng hợp ngay từ đầu nên không cần bước ẩn danh hoá về sau — an toàn hơn là tạo dữ liệu thật rồi mới che.

---

## 5. Môi trường & smoke pre-check

| Nguyên tắc gốc | Trạng thái | Cách áp trong harness |
|---|---|---|
| Môi trường giống production | `<✅/🔧/⬜>` | UAT chạy ở `moiTruong.uat.diaChi` (`harness.config.json`). Chưa có production hoặc UAT khác production thì **phải ghi rõ giới hạn trong kết quả UAT**, không viết như thể đã kiểm trên môi trường thật. Nơi chạy của từng phép đo khai ở `Instructions/PHU-MOI-TRUONG.json` |
| Smoke pre-check trước khi chạy UAT | **Bắt buộc, rẻ** | (1) chạy toàn bộ `kiemThu.lenhChayBo` — phải **PASS 100%**; (2) gọi thật **1 request** qua app đang chạy ở địa chỉ UAT. **Fail bất kỳ bước nào = HOÃN UAT**, không chạy tiếp |
| Accounts & quyền cho các vai nghiệp vụ | `<✅/🔧/⬜>` | Chưa có Auth thì chỉ có vai Guest — **⬜ HOÃN có hạn**, bắt buộc bổ sung ngay khi có Auth |
| Change control | 🔧 nhẹ | Mỗi lần sửa `Output/SPEC.md` (thêm/đổi AC) → **rà lại ngay bảng trace §2** xem ca UAT nào bị ảnh hưởng, không đợi tới lần chạy sau |

---

## 6. Defect severity + retest & closure

**Thang severity — dùng chung cho cả IT/SIT/UAT:**

| Mức | Định nghĩa | Ví dụ trong dự án này |
|---|---|---|
| **S1 — Critical** | Sai kết quả nghiệp vụ · lộ dữ liệu cá nhân · mất/hỏng dữ liệu · hệ thống không chạy · vi phạm governance | `<kết quả cốt lõi tính sai · dữ liệu cá nhân lọt vào prompt/log · thiếu disclaimer · AI phán quyết trong vùng cấm>` |
| **S2 — Major** | AC fail, **không có đường vòng** cho người dùng | `<lỗi khiến user kẹt vĩnh viễn ở một màn>` |
| **S3 — Minor** | AC fail nhưng **có đường vòng**, hoặc hiển thị sai không ảnh hưởng kết quả | `<thông báo lỗi khó hiểu nhưng vẫn thử lại được>` |
| **S4 — Cosmetic** | Chính tả, canh lề, màu sắc | `<sai dấu trong nhãn nút>` |

**Retest & closure:**
1. Mỗi defect ghi vào **Defect Log** trong `Output/SITUAT.md`: mô tả · severity · ca test phát hiện · trạng thái (`Open` / `Fixed` / `Accepted`).
2. Sửa xong → **retest đúng ca đó** + **chạy lại toàn bộ regression** (không chỉ ca vừa sửa).
3. Defect chấp nhận không sửa (`Accepted`) phải ghi **rõ lý do + ai quyết định** (chủ dự án) — không được im lặng bỏ qua.
4. **Không giấu defect còn lại** — `Instructions/PLAYBOOK.md` Bước 9 nêu đích danh đây là điều kiện "Done".

---

## 7. Exit criteria & sign-off — cổng mặc-định-đóng

**UAT đạt khi CẢ 4 điều kiện:**

1. **100% AC bắt buộc PASS** (mọi AC của story đã build trong lát cắt).
2. **0 defect S1 hoặc S2 còn mở.**
3. **S3 ≤ `<ngưỡng, mặc định 2>`**, và **mỗi S3 phải có kế hoạch xử lý ghi rõ** (sửa ở đâu / khi nào). *Ngưỡng số là quyết định của chủ dự án, không phải của AI; lớp chống lách còn lại là điều kiện "mỗi S3 có kế hoạch" — ⛔ không được bỏ, vì cap số có thể dụ hạ S3 xuống S4 để lách cổng.*
4. **S4 ghi nhận đầy đủ**, không chặn sign-off.

> ⚠️ **Fail-closed tuyệt đối:** thiếu bất kỳ điều kiện nào = **CHẶN**. Cấm "gần đúng nên cho qua" — đây là bẫy mất trụ Governance mà `Instructions/PLAYBOOK.md` Bước 9 nêu đích danh. 🔑 Mọi ca "gần đúng" phải được **nêu tường minh** để chủ dự án quyết, không phải AI tự cho qua.

**Sign-off:**
- Nguyên tắc gốc đòi "stakeholder chính ký" + "Business + QA peer review". Dự án một người + AI ánh xạ: **chủ dự án = business owner ký cuối** · **Tester độc lập = QA proxy** · cơ chế duyệt-trước-khi-thực-thi của harness (Plan mode) là lớp đệm trước đó.
- ⚠️ **Ghi trung thực:** khi không có bên thứ ba độc lập thật thì đây là **tự-sign-off**. Điểm yếu này phải nêu rõ trong kết quả UAT, không viết như thể đã qua kiểm duyệt độc lập.
- Sign-off là **quyết định của chủ dự án** → ghi vào `Output/DEVBOOK.md`; Bước 9 không đóng khi chưa có dòng đó.

---

## 8. Checklist UAT

| Hạng mục gốc | Trạng thái | Ghi chú |
|---|---|---|
| Traceability matrix (AC ↔ UAT TC ID) | `<...>` | §2 — bảng đặt trong `Output/SITUAT.md` |
| Risk tagging (High/Medium/Low) | `<...>` | §3 — dùng thang L×I của `Output/RISK.md` |
| Kịch bản nghiệp vụ (happy + edge) | `<...>` | Bắt buộc đủ hai vế, không chỉ đường thuận |
| AC có expected result rõ ràng | `<...>` | Mỗi ca một kết quả mong đợi **đo được** |
| Test data (danh sách, nguồn, anonymize) | `<...>` | §4 — bộ `TD-xx` |
| Accounts & quyền theo vai | `<...>` | §5 |
| Môi trường (URL, config, version build) | `<...>` | §5 — ghi rõ giới hạn |
| Báo lỗi (template, severity, SLA) | `<...>` | §6. SLA phản hồi chỉ áp khi có hàng đợi giao việc |
| Retest & closure | `<...>` | §6 |
| Sign-off | `<...>` | §7 — tự-sign-off thì ghi rõ |

---

## 9. Nợ công khai — chưa áp được

| Hạng mục | Vì sao chưa | Khi nào phải trả (điều kiện nhận ra được) |
|---|---|---|
| `<...>` | `<...>` | `<...>` |

> Mục thường rơi vào đây ở dự án nhỏ: peer review độc lập thật (Business + QA là hai người khác nhau — giới hạn cố hữu của dự án một người, ghi nhận chứ không che) · test theo vai/phân quyền (khi Auth chưa build — `Instructions/PLAYBOOK.md` Bước 9 nêu đích danh "negative + phân quyền theo role") · môi trường giống production · automation cho ca UAT lặp lại. Mỗi mục phải có **điều kiện trả** cụ thể.
