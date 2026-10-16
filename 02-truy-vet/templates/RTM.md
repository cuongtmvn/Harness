# RTM — Ma trận truy vết yêu cầu (<TÊN DỰ ÁN>)

> **Xương sống của chuỗi truy vết** (`Instructions/TRACEABILITY.md`). Bắt đầu từ Bước 1, cập nhật mỗi khi sửa `SCOPE.md` / `SPEC.md`, khép vòng ở Bước 10.
> **Cột cố định — máy đọc theo vị trí:** `| # | Nguồn | Nội dung | Story | Trạng thái | Code/Test | UAT/SIT | Work item |`
> - **Nguồn:** `M<n>` (mục tiêu) · `SCOPE §n` · mã quyết định `D-…` (có mã ⇒ `ARCH.md` là tài liệu liên quan của cổng c2)
> - **Story:** `US-xx` **·** `PB-xxx` — dòng có `US-` **bắt buộc** có `PB-` (`kiem-backlog.cjs`)
> - **Trạng thái:** ✅ đã build · ⬜ chưa build · ⚠️ mồ côi *(— chấp nhận: lý do, nếu chủ dự án xác nhận)*
> - **Code/Test:** **tên tệp có thật** `App/…` · `test_x.py (số ca)` — chỉ số c1 chỉ tính ô trỏ tới tệp **tồn tại trên đĩa**
> - **UAT/SIT:** `UAT-xx` · `IT-Px` · `SIT-Px` — dòng ✅ mà ô này trống ⇒ chuỗi đứt (`rtm-check` #6)
> - **Work item:** mã task cấp 3 — c1 đòi cả ba: story + work item + code/test
> ⛔ **Không sửa file này cho chỉ số đẹp lên.** Kiểm: `node Log/rtm-check.cjs` · `node Log/kiem-backlog.cjs` · `node Log/doc-health.cjs`.

---

## Bảng truy vết

| # | Nguồn | Nội dung | Story | Trạng thái | Code/Test | UAT/SIT | Work item |
|---|---|---|---|---|---|---|---|
| 1 | M1 · SCOPE §2 | <một dòng> | US-01 · PB-001 | ⬜ chưa build | — (chưa build) | — | — (chưa chẻ) |
| 2 | M1 · SCOPE §2 | <yêu cầu phi chức năng> | NFR-PERF-1 · PB-002 | ⬜ chưa build | — (chưa build) | — | — (chưa chẻ) |

---

## RÀNG BUỘC THEO BƯỚC — MVP 01 (Round R1)

> Mỗi Bước N khi đóng ghi vào đây ràng buộc cho Bước sau (`R5`); Bước sau chép sang `V2.keThua` của bản khai cổng (`V2`). Đây là cách *phát hiện ở phase trước đến được phase này*. Điều kiện máy `(g)` đối chiếu từ khoá hai đầu.

| Sinh ở Bước | Dành cho Bước | Ràng buộc | Nguồn |
|---|---|---|---|
| 0 | 1 | <ví dụ: mục M2 còn mơ hồ ở điểm X — story của M2 phải chờ chủ dự án quyết CQ-01> | `cong-buoc/01-B0.json` R5 |

---

## Bảng số ca test theo tệp *(tuỳ chọn — `rtm-check` đối chiếu với số máy đếm)*

| Tệp | Số ca |
|---|---|
