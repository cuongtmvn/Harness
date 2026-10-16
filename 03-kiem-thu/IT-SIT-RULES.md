# IT-SIT-RULES — Nguyên tắc Integration Test (IT) và System Integration Test (SIT)

> **Đọc khi:** **Bước 8 (BUILD)** — cuối Bước, khi ghép các lát cắt (IT); **Bước 9 (Test & Gate)** — kiểm lại IT + chạy SIT trước khi mở UAT.
> **Đọc kèm:** `UT-RULES.md` (tầng 1 — **không lặp định nghĩa UT ở đây**) · `UAT-RULES.md` (tầng 4 — thang severity §6 và bộ test data §4 dùng chung) · `Instructions/PLAYBOOK.md` mục Bước 8/9 · `Output/SPEC.md` (NFR) · `Output/RISK.md` (thang L×I) · `Output/SITUAT.md` (nơi lưu kết quả).
> Những chỗ dự án mới phải điền được đánh dấu `<...>`.

---

## 0. Vị trí trong kim tự tháp 4 tầng

| Tầng | Phạm vi | Chạy ở Bước | Ai làm | Kết quả lưu ở đâu | Exit criteria |
|---|---|---|---|---|---|
| **UT** | 1 hàm/đơn vị logic, không I/O thật | **8 (BUILD)** — viết cùng lúc với code | AI thực thi viết, chủ dự án review mẫu | `App/tests/` + report tự sinh | `UT-RULES.md` §4 (C0/C1/C2, mutation, flake) |
| **IT** | **≥2 module NỘI BỘ** ghép với nhau, chưa vượt ra ngoài process | 8 (cuối, khi ghép lát cắt) → kiểm lại ở **9** | AI thực thi viết; **Tester độc lập** *(tiến trình con, không thấy ngữ cảnh hội thoại)* rà | `Output/SITUAT.md` §IT | §6 — 4 điều |
| **SIT** | **Vượt ranh giới process/mạng** ra hệ thống ngoài | **9** | Tester độc lập (mức Senior khi chạm rủi ro L×I ≥ ngưỡng cao) | `Output/SITUAT.md` §SIT | §6 — 5 điều |
| **UAT** | Góc người dùng cuối, qua giao diện/API, **không đọc source** | **9** | Tester độc lập đóng vai user; **chủ dự án sign-off** | `Output/SITUAT.md` §UAT | `UAT-RULES.md` §7 |

> ⚠️ **Khớp với `UT-RULES.md` §3:** mục §3.2 "Integration Test" của tệp đó **chính là tầng IT ở đây** — tệp này giữ phần chi tiết. Mục §3.3 "E2E/smoke test" của tệp đó = **smoke pre-check** (điều kiện tiên quyết trước UAT, `UAT-RULES.md` §5), **không phải một tầng riêng**.

---

## 1. Ranh giới 4 tầng — phân biệt bằng tiêu chí máy móc được

Không phán đoán cảm tính "cái này giống SIT hơn". Trả lời 5 câu hỏi dưới là ra đúng tầng:

| Câu hỏi phân loại | UT | IT | SIT | UAT |
|---|---|---|---|---|
| Gọi ≥2 module thật? | ❌ (1 đơn vị) | ✅ | ✅ | ✅ (cả hệ) |
| **Vượt ra ngoài process** (mạng / API bên thứ ba)? | ❌ | ❌ | **✅** | ✅ (gián tiếp) |
| Hệ thống ngoài được mock không? | Mock ở boundary I/O | **Mock** (stub / fake client) | **KHÔNG mock — gọi `<hệ ngoài>` thật** | Không mock |
| Người kiểm nhìn gì? | source | source + log | source + log + response mạng thật | **chỉ giao diện/API như user** |
| Sai thì bản chất lỗi ở đâu? | Logic 1 hàm | Thiết kế ghép nối nội bộ | Contract với bên ngoài | Nghiệp vụ / AC sai |

🔑 **Tiêu chí quyết định nhanh nhất:** *có gọi `<hệ ngoài>` thật không?* — Có = **SIT**. Không, nhưng ghép ≥2 module = **IT**. Chỉ 1 hàm = **UT**. Chạy như người dùng = **UAT**.

---

## 2. Mục tiêu

- **IT (Integration Testing — tích hợp nội bộ):** xác nhận các module dự án tự build **ghép đúng với nhau** — contract giữa layer khớp, dữ liệu không biến dạng khi đi qua ranh giới, giao dịch DB toàn vẹn.
- **SIT (System Integration Testing — tích hợp hệ thống ngoài):** xác nhận app hoạt động đúng khi làm việc với **hệ thống bên thứ ba** `<API thanh toán / LLM / dịch vụ thư / cổng SMS…>` — contract, xử lý lỗi, retry, chi phí, và **ranh giới dữ liệu được phép gửi ra ngoài**.

---

## 3. Integration Map — BẮT BUỘC

> ⛔ **Cập nhật bảng này TRƯỚC khi viết ca test, và mỗi khi thêm module mới.** Không có Integration Map = không biết đã phủ đủ chưa = **không được coi là kiểm xong**.
> Phạm vi mỗi MVP/Round = các module **đã build** trong đợt đó. Đợt sau thêm module (Auth / Entitlement / Notification…) thì **bổ sung dòng mới**, không lập bảng mới.
> Bảng này đặt ở `Output/SITUAT.md` (mục Integration Map), tệp này chỉ giữ **mẫu**.

### 3.1. IT — điểm tích hợp NỘI BỘ (`IT-Px`)

| ID | Từ → Đến | File | Dữ liệu / contract qua ranh giới | Rủi ro liên quan (`Output/RISK.md`) |
|---|---|---|---|---|
| `IT-P1` | `<route>` → `<engine>` | `<...>` | `<đầu vào>` → `<đầu ra>` | `<R-xx>` |
| `IT-P2` | `<route>` → DB (đọc / dedupe) | `<...>` | `<truy vấn theo khoá nào>` | `<R-xx>` |
| `IT-P3` | `<route>` → DB (ghi) | `<...>` | `<bản ghi nào>` — ⚠️ dữ liệu nhạy cảm ⇒ Leash A+ | `<R-xx>` |
| `IT-P4` | `<route>` → `<lớp nội dung / dữ liệu nguồn>` → DB | `<...>` | `<chỉ bản ghi trạng thái được duyệt mới được dùng>` | `<R-xx>` |
| `IT-P5` | `<route>` → audit → DB | `<...>` | Bản ghi audit — **không được chứa PII** | `<R-xx>` |
| `IT-P6` | middleware + disclaimer → response | `<...>` | Mọi response có nội dung diễn giải **bắt buộc kèm disclaimer** | `<R-xx>` |
| `IT-P7` | Ranh giới giao dịch commit/rollback xuyên `<route>`↔`<audit>`↔DB | `<...>` | Rollback phải xoá sạch, **không để bản ghi mồ côi** | `<R-xx>` |

### 3.2. SIT — điểm tích hợp với hệ thống NGOÀI (`SIT-Px`)

| ID | Ranh giới | File | Contract / hành vi cần kiểm | Rủi ro liên quan |
|---|---|---|---|---|
| `SIT-P1` | `<client>` → **`<hệ ngoài>`** | `<...>` | Model/phiên bản đúng · giới hạn tham số (`<MAX_TOKENS / timeout…>`) · cấu trúc response đủ trường | `<R-xx>` |
| `SIT-P2` | Retry / timeout / rate-limit | `<...>` | **Tổng số lần gọi THẬT bị tính tiền** (SDK có thể tự retry ngầm) | `<R-xx>` |
| `SIT-P3` | Cache trên đĩa / bộ nhớ | `<...>` | Cache hỏng / không đọc được **không được làm sập app** | `<R-xx>` |
| `SIT-P4` | Ghi nhật ký usage / chi phí | `<...>` | Mỗi lượt gọi thật ghi **đúng 1** bản ghi usage (đối soát chi phí) | `<R-xx>` |
| `SIT-P5` | **Ranh giới dữ liệu ra ngoài** | `<...>` | **CHỈ** các khoá trong danh sách cho phép (`<_SAFE_KEYS>`) được vượt ra — dữ liệu cá nhân gốc tuyệt đối không | `<R-xx>` — L×I ≥ ngưỡng cao ⇒ **Tester Senior bắt buộc** |

> Các dòng trên là **điểm thường gặp** để gợi ý khi lập Map lần đầu — dự án không có điểm nào thì **xoá dòng**, không để dòng trống làm "phủ giả".

---

## 4. Nguyên tắc chính — 10 điều

| # | Nguyên tắc gốc | Trạng thái trong dự án này | Cách áp trong harness |
|---|---|---|---|
| 1 | **Scope rõ ràng** — SIT tập trung tích hợp hệ thống, IT tập trung module nội bộ | `<✅/🔧/⬜>` | Đúng ranh giới §1: có gọi `<hệ ngoài>` thật = SIT, còn lại = IT |
| 2 | **Test interfaces và contracts** — API contract, message format, error handling, retry | `<✅/🔧/⬜>` | Trọng tâm `SIT-P1`/`SIT-P2`. 🔑 Phải đo **số lần gọi thật bị tính tiền**, không tin cam kết trên giấy của SDK |
| 3 | **Dữ liệu tích hợp** — dữ liệu mô phỏng thực tế, chuẩn hoá schema/mapping | `<✅/🔧/⬜>` | Dùng chung bộ test data `TD-xx` định nghĩa ở `UAT-RULES.md` §4 — **không tự chế dữ liệu riêng cho IT/SIT** |
| 4 | **Môi trường tích hợp** — stub/mock cho hệ ngoài, hoặc sandbox thật | `<✅/🔧/⬜>` | Stub/fake client trong bộ test (IT) + `<tài khoản/khoá API riêng có giới hạn chi tiêu>` (SIT gọi thật) |
| 5 | **Automation ưu tiên** — tự động hoá chạy liên tục trong pipeline | `<✅/🔧/⬜>` | Bộ IT tự động hoá qua `kiemThu.lenhChayBo`; SIT gọi hệ ngoài thật thì chạy có kiểm soát chi phí. Chưa có CI/CD ⇒ ghi nợ §7 |
| 6 | **Regression control** — mỗi thay đổi tích hợp chạy lại bộ regression liên quan | `<✅/🔧/⬜>` | Toàn bộ `App/tests/` = bộ regression. 🔑 **Luật: sửa bất kỳ điểm nào trong Integration Map → chạy lại TOÀN BỘ suite, không chỉ test vừa sửa** |
| 7 | **Monitoring và logs** — logging chi tiết, trace request xuyên hệ thống | `<✅/🔧/⬜>` | Audit log (DB) + usage log (chi phí). Correlation ID xuyên hệ thống: `<có/chưa>` — chưa thì ghi nợ §7 |
| 8 | **Performance baseline** — đo throughput/latency luồng chính | `<✅/🔧/⬜>` | Dùng đúng NFR đã chốt ở `Output/SPEC.md` mục NFR: `<engine < … s (p95)>`, `<hệ ngoài < … s (p95)>` — **không tự đặt ngưỡng mới** |
| 9 | **Error handling và recovery** — kịch bản lỗi tích hợp + kế hoạch rollback | `<✅/🔧/⬜>` | `IT-P7` (rollback giao dịch) + `SIT-P2` (lỗi mạng/rate-limit). Điểm nào **từng có bug thật** → bắt buộc có ca test, không bỏ |
| 10 | **Traceability** — map integration point ↔ test case | `<✅/🔧/⬜>` | Mỗi ca test **bắt buộc** ghi ID integration point (`IT-Px`/`SIT-Px`) nó đang kiểm. 🔑 Ca không truy được về Integration Map = **ca thừa**, phải bỏ hoặc bổ sung điểm vào Map |

Quy ước cột "Trạng thái": ✅ áp được · 🔧 phải điều chỉnh vì quy mô · ⬜ chưa làm được ⇒ **ghi nợ §7, không giả vờ có**.

---

## 5. Checklist IT/SIT

| Hạng mục gốc | Trạng thái | Ghi chú áp dụng |
|---|---|---|
| Danh sách integration points | `<...>` | §3 (Integration Map trong `Output/SITUAT.md`) |
| Contract tests (schema, version) | `<...>` | `SIT-P1` |
| End-to-end flows với dữ liệu representative | `<...>` | Bộ `TD-xx` |
| Stubs/mocks cho hệ ngoài | `<...>` | `<tên fake client>` |
| **Authentication & authorization** | `<...>` | Chưa có Auth thì **⬜ HOÃN có hạn** — bắt buộc bổ sung ngay khi build Auth, không được quên |
| Data consistency (idempotency, duplicate, reconciliation) | `<...>` | `IT-P2` (dedupe) + `IT-P7` (giao dịch) |
| Error scenarios (timeout, partial failure, retry) | `<...>` | `SIT-P2`, `SIT-P3` |
| Performance checks | `<...>` | NFR `Output/SPEC.md` |
| Automation trong CI/CD | `<...>` | §7 nếu chưa có |
| Logging & tracing (correlation ID) | `<...>` | — |
| Rollback plan | `<...>` | `IT-P7` |
| Sign-off criteria | `<...>` | §6 |

---

## 6. Exit criteria — cổng mặc-định-đóng (fail-closed)

> Đúng tinh thần `Instructions/PLAYBOOK.md` Bước 9: *"Không xác minh được = chặn"*. Thiếu bất kỳ điều kiện nào dưới đây = **CHẶN**, không được "gần đúng nên cho qua".

**IT đạt khi cả 4:**
1. **Phủ đủ:** mọi điểm `IT-Px` trong Integration Map có ≥1 ca test.
2. **0 defect S1/S2 còn mở** (thang severity: `UAT-RULES.md` §6).
3. Mọi ca có **nhánh lỗi** tương ứng đã kiểm (không chỉ đường thuận).
4. Chạy lại **toàn bộ regression suite PASS** sau lần sửa cuối.

**SIT đạt khi cả 5:**
1. **Phủ đủ:** mọi điểm `SIT-Px` có ≥1 ca test.
2. **0 defect S1/S2 còn mở.**
3. Contract test PASS với **`<hệ ngoài>` thật** (không chỉ fake client).
4. **NFR latency đạt ngưỡng `Output/SPEC.md`** (đo p95).
5. **Điểm gác ranh giới dữ liệu ra ngoài (`SIT-P5`) PASS tuyệt đối** — 1 ca fail ở đây = **S1**, chặn ngay bất kể các ca khác.

**Không đạt thì làm gì:** ghi defect vào Defect Log (`Output/SITUAT.md`) kèm severity → sửa → **retest đúng ca đó + chạy lại regression** → mới được đóng. ⛔ Không có "chấp nhận tạm để đi tiếp".

> 📌 Bằng chứng chạy thật của ca SIT phải khai **nơi chạy** (môi trường nào) — xem `Instructions/PHU-MOI-TRUONG.json`: một phép đo đúng, chạy nhầm môi trường, vẫn là không đo.

---

## 7. Nợ công khai — chưa áp được (ghi trung thực, không giả vờ có)

| Hạng mục | Vì sao chưa | Khi nào phải trả (điều kiện nhận ra được) |
|---|---|---|
| `<...>` | `<...>` | `<...>` |

> Mục thường rơi vào đây ở dự án nhỏ: automation trong CI/CD · correlation ID xuyên hệ thống · test authentication & authorization (khi Auth chưa build) · môi trường giống production. Mỗi mục phải có **điều kiện trả** cụ thể — ⛔ không phải "khi nào rảnh".
