# MODULEMAP — Bản đồ module & phân tầng (<TÊN DỰ ÁN>)

> Artefact **Bước 2**. *Done khi:* thấy rõ **móng nào làm trước** và có **một lát cắt dọc mỏng** để xây đầu tiên; mỗi module có **cột tệp thực thi** (hoặc "chưa có mã") — không có cột này thì chỉ số c4 chiều ngược không đo được bằng máy.
> Mã: tầng nền `L0-n` · bề mặt `M-n`. Module **không truy được về SPEC** = xây thừa.

## 1. Tầng nền (Layer 0 — móng ẩn, phải có trước)
| Mã | Module | Phục vụ story | Tệp thực thi | Trạng thái |
|---|---|---|---|---|
| L0-1 | Mô hình dữ liệu cốt lõi | US-01, US-02 | `App/db/…` | chưa có mã |
| L0-2 | Xác thực · phân quyền | US-… | | |
| L0-3 | Cổng vào (routing / API gateway) | | | |
| L0-4 | Nhật ký kiểm toán | | | |

## 2. Tầng bề mặt (người dùng thấy)
| Mã | Module | Phục vụ story | Tệp thực thi | Trạng thái |
|---|---|---|---|---|
| M-1 | <…> | US-01 | | |

## 3. Thứ tự làm — móng trước, bề mặt sau
1. <L0-… vì bề mặt … không chạy nếu thiếu nó>

## 4. Lát cắt dọc mỏng đầu tiên (Walking Skeleton)
<Luồng mỏng nhất đi xuyên: móng → 1 API → 1 màn hình chạy được. Đây là thứ Bước 7 chốt và Bước 8 xây.>

## 5. Module đã có mã nhưng chưa vào bản đồ (rà `App/` mỗi Round)
| Tệp | Thuộc module nào | Việc cần làm |
|---|---|---|
