# DOR — Điều kiện được phép bắt đầu viết mã (<TÊN DỰ ÁN>)

> Artefact **Bước 7** — *"cổng vào harness"*: chưa PASS toàn bộ thì **không giao cho AI chạy tự hành**. *Done khi:* 6 câu **đạt toàn bộ** cho lát cắt dọc đầu tiên; lát cắt **đủ mỏng** để xong trong vài ngày.
> ⛔ Chạy DoR **trước** khi viết mã — chạy sau là ba câu bị bỏ qua, và mỗi câu bỏ qua là một lỗi thật. ⛔ Xây khi còn mục FAIL — kể cả việc A.

## 0. Walking Skeleton — lát cắt dọc đầu tiên
<Luồng: <vai> làm <việc> → <API> → <xử lý> → <CSDL> → <màn hình> — mỏng nhất mà vẫn xuyên hết các tầng>

## 1. Sáu câu DoR — PASS / FAIL, không "gần đúng"
| # | Câu | Bằng chứng (đường dẫn / mã) | PASS/FAIL | Nếu FAIL: vì sao chưa được build khi thiếu nó |
|---|---|---|---|---|
| 1 | Đặc tả rõ? | `SPEC.md` US-… | | |
| 2 | Có mô hình dữ liệu? | `ARCH.md` §4 | | |
| 3 | Có giao ước API? | `ARCH.md` §5 | | |
| 4 | AC đo được? | từng AC có cột "đo bằng gì" | | |
| 5 | Mức dây cương của lát cắt? | `LEASH-BANG.json` mục … | | |
| 6 | **Cổng kiểm là gì?** | `gate-check` + Tester + UAT lượt 2 | | |

## 2. Ranh giới cấm trong khi xây lát cắt này
| # | Cấm | Cưỡng chế bằng |
|---|---|---|
| 1 | <ví dụ: không chạm CSDL thật khi chưa sao lưu> | hook `chan-ghi-csdl-that` |
