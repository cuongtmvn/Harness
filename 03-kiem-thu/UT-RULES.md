# UT-RULES — Nguyên tắc Unit Test và chỉ số đo chất lượng

> **Đọc khi:** **Bước 8 (BUILD)** — UT viết **cùng lúc** với mã, không viết sau; **Bước 9 (Test & Gate)** — đối chiếu chỉ số §4 trước khi đóng Bước.
> **Đọc kèm:** `IT-SIT-RULES.md` (tầng 2–3) · `UAT-RULES.md` (tầng 4) · `Instructions/PLAYBOOK.md` mục Bước 8/9 · `Output/RISK.md` (thang L×I) · `Output/RTM.md` (truy vết test ↔ requirement).
> **Bộ 4 tệp cùng cấp:** **tệp này** (tầng 1) · `IT-SIT-RULES.md` (tầng 2–3) · `UAT-RULES.md` (tầng 4) · `DOC-HEALTH-RULES.md` (sức khoẻ tài liệu).
> Những chỗ dự án mới phải điền được đánh dấu `<...>`.

---

## 1. Mục tiêu

Unit Test (UT) là lớp kiểm thử tự động kiểm tra hành vi của **từng đơn vị logic nhỏ nhất** trong phần mềm, nhằm bảo vệ logic nghiệp vụ, giảm regression, và tạo nền tảng cho review/triển khai an toàn.

UT nên được **ưu tiên** cho các module có **tính toán xác định** và các quy tắc **rủi ro cao**, ví dụ:

| Nhóm | Dự án này là gì |
|---|---|
| Engine tính toán xác định | `<engine cốt lõi của sản phẩm>` |
| Validation đầu vào | `<form / API nhận dữ liệu người dùng>` |
| Audit / governance | `<audit log, bộ lọc vùng cấm, disclaimer>` |
| Lớp contract với hệ ngoài | `<wrapper gọi API thanh toán / LLM / dịch vụ thư>` |

⛔ UT **không** nhắm vào việc kiểm tra câu trả lời **không xác định** của hệ ngoài (ví dụ LLM) như một "mức đúng chuẩn cố định" — chúng không phải deterministic engine. Với lớp đó, kiểm **contract và guardrail** (§2.8).

---

## 2. Nguyên tắc xây dựng UT

### 2.1. Test đúng đối tượng

UT phải test **behavior của input/output**, không phải test cách code được cài đặt nội bộ.

- Nếu hàm A nhận dữ liệu X thì trả về Y.
- Nếu dữ liệu không hợp lệ thì phải ném lỗi hoặc trả ra contract an toàn.
- Nếu logic quyết định nhánh thì test nhánh đó.

Không được viết test nhằm mục đích "test lại implementation" của một function nếu thực tế không bảo vệ yêu cầu khách hàng.

### 2.2. Test theo rủi ro

Ưu tiên xây UT cho các thành phần có tác động trực tiếp đến:

- Tính toán sai dẫn tới nội dung sai
- Rủi ro pháp lý / dữ liệu cá nhân / nội dung do máy sinh
- Hiển thị sai cho người dùng
- Audit, logging, governance
- Tích hợp với API và hệ ngoài

🔑 **Nguyên tắc ưu tiên: rủi ro cao → test mạnh, rủi ro thấp → test tối thiểu nhưng có contract.** Mức rủi ro lấy từ thang L×I của `Output/RISK.md` — không đẻ thang riêng cho UT (§6.3).

### 2.3. Cover happy path và fault path

Một bộ UT đủ không chỉ test điều kiện "thành công". Nó còn phải test:

- Input không hợp lệ
- Dữ liệu thiếu
- Giá trị biên
- Trường hợp overflow / không đủ dữ liệu
- Exception và error mapping

Ví dụ: với một trường ngày tháng, UT phải kiểm cả ngày hợp lệ **và** ngày không hợp lệ (sai định dạng · ngày không tồn tại · ngày biên hợp lệ như 29/02 năm nhuận).

### 2.4. Không mock quá mức

Mock chỉ nên dùng ở **boundary gần I/O** hoặc service phụ thuộc, ví dụ:

- `<API hệ ngoài / LLM>`
- Database
- Cache (Redis…)
- HTTP external call

Nếu mock hoá logic quá nhiều, test sẽ **đánh giá mock, không đánh giá hệ thống thật**. Đây là anti-pattern nếu mục tiêu là test production behavior.

### 2.5. Test deterministic logic phải có determinism

Các engine chính nên là **pure function** hoặc không phụ thuộc trạng thái global và random. Ví dụ:

- `<hàm tính toán cốt lõi>`
- `<hàm mapping / phân loại>`
- Hàm validation đầu vào

Các test này phải chạy lặp lại với cùng dữ liệu và cho **cùng output**.

### 2.6. Test name đọc được và có nghĩa

Tên test nên làm rõ mục tiêu business, ví dụ:

- `should_return_profile_for_valid_input`
- `should_raise_error_when_required_field_is_missing`
- `should_return_audit_record_when_invalid_request_received`

Tên test tốt phải trả lời được: **"đang test trường hợp gì?"**

### 2.7. TDD và regression

Nguyên tắc tốt nhất là tạo test **trước** khi code hoặc khi sửa logic:

1. Thêm test mới để mô tả bug hoặc requirement
2. Chạy test và **chứng minh fail**
3. Sửa code / root-cause
4. Chạy lại test và **chứng minh pass**

🔑 Đây là cách để UT mang giá trị thực, không chỉ làm đẹp coverage.

### 2.8. Điểm dừng của UT

UT không phải là "test mọi thứ" bằng mọi cách. Test chỉ nên cover các nơi cần bảo vệ thuộc phạm vi quality gate. Với lớp gọi hệ ngoài không xác định (LLM…), ưu tiên **contract và guardrails** hơn coverage 100%.

---

## 3. Các cấp độ UT và phân tầng kiểm thử

> Bảng đầy đủ kim tự tháp 4 tầng + tiêu chí phân biệt máy móc được: `IT-SIT-RULES.md` §0–§1. Tệp này chỉ nêu tên, không định nghĩa lại.

### 3.1. Unit Test
Lớp test chắc chắn nhất. Test một hàm/logic đơn lẻ với data chuẩn. Mục tiêu: xác định business rule · kiểm tra lỗi boundary · khoá behavior chính.

### 3.2. Integration Test
Test tương tác giữa module với module (engine → controller · controller → lớp dữ liệu · API → dữ liệu chuẩn). Mục tiêu: xác nhận giao diện giữa layer chính xác · phát hiện contract mismatch. **Chính là tầng IT** ở `IT-SIT-RULES.md`.

### 3.3. E2E test / smoke test
Test workflow người dùng qua UI/API. Mục tiêu: kiểm tra lộ trình chính · đảm bảo hệ thống chạy trong môi trường gần production.
Smoke test nên tập trung vào luồng chính `<nhập liệu → kết quả → disclaimer → governance>`, **không** cần test mọi câu trả lời của hệ ngoài. Trong harness, đây là **smoke pre-check** trước UAT (`UAT-RULES.md` §5), không phải một tầng riêng.

---

## 4. Các chỉ số đo lường UT

### 4.1. Line Coverage (C0)
Tỷ lệ dòng code được test thực thi.
- C0 là mức tối thiểu, và **quá mức cần thiết nếu chỉ vì "đạt cover"**.
- C0 **không** đảm bảo branch/hành vi chính xác được test.

### 4.2. Branch Coverage (C1)
Tỷ lệ nhánh decision được đi qua **cả true/false**.

```python
if age < 18:
    return "child"
else:
    return "adult"
```
C1 yêu cầu có test cho cả nhánh true lẫn false.

### 4.3. Condition Coverage / Multiple Condition Coverage (C2)
Dùng cho các điều kiện phức tạp:

```python
if a and b:
    ...
```
C2 nghĩa là test thật sự cover **từng điều kiện và tổ hợp điều kiện** của chúng. Nên áp cho các điều kiện quan trọng như:

- `<hợp lệ / không hợp lệ của đầu vào chính>`
- `<có dữ liệu nguồn hay không>`
- có dữ liệu audit hay không
- có nhạy cảm hay không

### 4.4. Mutation Score
Test được đánh giá tốt khi **code đổi một chút thì test có fail**. Chỉ số này trả lời: "test có thực sự bắt được bug?"
- Cao: test có giá trị bảo vệ logic
- Thấp: coverage cao nhưng test dễ "bypass"

### 4.5. Defect Density
Số lỗi phát hiện trên một đơn vị code được sản xuất. Module có defect density cao cần test/thiết kế lại.

### 4.6. Test Stability / Flake Rate
Tỷ lệ test fail **không do logic** mà do môi trường, async, random, time dependency. Flake rate cao = UT chưa ổn định.

### 4.7. Test Execution Time
UT nên đủ nhanh để chạy trong CI **mỗi commit**. Test chạy quá lâu trở thành rào cản cho workflow.

> Lệnh chạy/đếm bộ kiểm trong harness: `harness.config.json` khối `kiemThu` (`lenhChayBo` · `lenhDemCa`). Tệp test đặt ở `App/tests/`, tiền tố `test_`.

---

## 5. Chỉ số đánh giá chất lượng code từ UT

| Tiêu chí | Câu hỏi | Cách xác minh |
|---|---|---|
| **Correctness** | Code chạy đúng business rule không? | Test + manual/QA validation |
| **Reliability** | Ổn định khi input bất thường không? | Test invalid inputs và recovery path |
| **Maintainability** | Dễ hiểu, dễ cập nhật, dễ test không? | UT tốt giúp code phân tách tốt, giảm kiểu "đặt test sau khi code xong" |
| **Governance** | Audit/logging/policy có được test không? | Bảo vệ vùng nhạy cảm, dữ liệu cá nhân, vùng cấm của AI |
| **Regression Shield** | Test mới có chặn bug cũ tái phát không? | Test viết sau một bug trở thành "regression gate" |

---

## 6. Khuyến nghị áp vào dự án

### 6.1. Mức ưu tiên UT
1. Logic deterministic trong engine
2. Validation dữ liệu đầu vào
3. Contract với hệ ngoài / governance tracing
4. API route response contract
5. UI smoke path

### 6.2. Mức coverage mục tiêu
| Lớp | Mục tiêu |
|---|---|
| Engine tính toán | C0/C1/C2 cẩn thận, ưu tiên nhánh quan trọng |
| Service layer | Coverage vừa phải, không cần 100% |
| Wrapper hệ ngoài (LLM/API) | Test contract, guardrails, response format |
| UI/static layer | Smoke path nếu có tác động người dùng |

### 6.3. Mức rủi ro — dùng thang L×I của `Output/RISK.md`
Xác định mỗi module chạm rủi ro nào trong `Output/RISK.md`. Ngưỡng **rủi ro cao** = `docHealth.nguongRuiRoCao` trong `harness.config.json` (mặc định L×I ≥ 12). Không đẻ thang "thấp/trung bình/cao" riêng cho UT.

🔑 **Module chạm rủi ro cao / vùng nhạy cảm / dữ liệu cá nhân / hệ thống AI không thể chỉ có happy path** — bắt buộc UT cho guardrail và failure case.

---

## 7. Chất lượng UT là "kim chỉ nam"

Một bộ UT chất lượng **không** được đánh giá bằng số lượng test, mà bằng hai tiêu chí:

1. Test có phủ được logic **rủi ro cao** không.
2. Test có **bắt được lỗi khi logic đổi** không.

🔑 Nếu hai điều này không đạt, test là **"đồ trang trí"** chứ không phải bảo vệ chất lượng phần mềm.

---

## 8. Checklist cuối cùng

Trước khi báo "xong" một task `.BUILD.`:

- [ ] UT có cover logic quyết định chính
- [ ] Có test cho input invalid
- [ ] Có test cho exception/failure path
- [ ] Không mock logic đang test
- [ ] Test chạy được trên CI (hoặc bằng `kiemThu.lenhChayBo`)
- [ ] Có thống kê coverage, branch, condition, số regression
- [ ] UI/API integration response được test
- [ ] Contract với `<hệ ngoài>` có test đủ
- [ ] Dữ liệu nhạy cảm và disclaimer có guardrail test
- [ ] Mỗi tệp test được một dòng `Output/RTM.md` trỏ tới (cổng `node Log/rtm-check.cjs`)

---

## 9. Kết luận

UT phải được nhìn như **"hệ thống bảo vệ phần mềm khỏi việc sinh bug trong quá trình phát triển"**, không chỉ là "bộ test để cài xong sớm".

Một hệ thống chất lượng tốt cần: UT đúng chỗ · test thực tế, không quá mock · coverage đủ cho logic cốt lõi · branch/condition coverage cho quyết định quan trọng · mutation score / defect density / flake rate để đánh giá "sự sống" của test.

Khi các chỉ số này được giám sát và cải thiện, chất lượng phần mềm mới được bảo vệ bền vững.
