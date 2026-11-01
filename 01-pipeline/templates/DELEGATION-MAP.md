# DELEGATION-MAP — Chính sách uỷ quyền cho AI (<TÊN DỰ ÁN>)

> Artefact **Bước 6**. **Giá trị dây cương (A / A+) nằm ở `Instructions/LEASH-BANG.json` — nguồn sự thật duy nhất, cổng máy đọc thẳng.** File này chỉ **trỏ tới** mã mục và giữ phần văn xuôi *vì sao* — ⛔ không chép giá trị ra chỗ thứ hai (hai bản chép tay sẽ trôi khỏi nhau mà không ai kêu).
> Hạ một mục từ A+ xuống A = **nới luật quản AI** = điều dừng 5.

## 1. Năm nhóm việc
1. Sinh mã / kỹ thuật, không đụng dữ liệu thật · 2. Quyết định kiến trúc / nghiệp vụ · 3. Dữ liệu cá nhân / nhạy cảm · 4. Nội dung người dùng cuối đọc trực tiếp · 5. Vận hành hạ tầng & governance

## 2. Bảng uỷ quyền theo loại việc
| # | Loại việc | Nhóm | Mức L | Mục dây cương (`LEASH-BANG.json`) | Ai duyệt | Vì sao |
|---|---|---|---|---|---|---|
| D1 | Viết mã nghiệp vụ thường + test | 1 | L3 | `MA-THUONG` | AI tự đóng khi cổng xanh | Kiểm được bằng test |
| D2 | Đọc/ghi dữ liệu cá nhân | 3 | L4 | `DU-LIEU-CA-NHAN` | Huynh, cờ `--huynh-xac-nhan` | Không hoàn lại được |
| D3 | Đổi lược đồ CSDL | 3 | L4 | `LUOC-DO-CSDL` | Huynh | Ảnh hưởng mọi dữ liệu |
| D4 | Xác thực / phân quyền | 3+5 | L4 | `PHAN-QUYEN` | Huynh | |
| D5 | Nội dung AI sinh cho người dùng | 4 | L4 | `NOI-DUNG-NGUOI-DUNG` | Huynh duyệt nguồn | |
| D6 | Đẩy lên production | 5 | L1 | `PHAT-HANH` | **Huynh tự tay** — AI không bao giờ tự release | Luật cứng #1 |
| D7 | <vùng cấm của dự án, nếu có> | 4 | **L5 — cấm** | — | **Không ai mở khoá được** | |

## 3. Cổng fail-closed theo nhóm hazard
| Nhóm hazard | Việc liên quan | Cổng chặn mặc định | Điều kiện mở khoá |
|---|---|---|---|
| Dữ liệu cá nhân | D2 | Chặn mọi đọc/ghi thiếu claim đúng quyền + audit-log | Đúng vai + có audit |
| Mật khẩu / OTP | D4 | Chặn nếu chưa hash + rate-limit | Hash + rate-limit đã bật |
| Vận hành production | D6 | Chặn mọi merge/deploy tự động | Chủ dự án bấm, cổng UAT→Prod xanh |
