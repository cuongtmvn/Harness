# Tiết kiệm token (Token economy)

Khoản tốn lớn nhất: mỗi lời gọi trong một phiên dài phải đọc lại toàn bộ ngữ cảnh. Mọi mẹo dưới đây đều quy về một việc: **giữ ngữ cảnh nhỏ và sạch**.

## 1. Phiên ngắn, có bàn giao
Phiên dài làm mỗi lời gọi đọc lại ngữ cảnh lớn. Hết một mốc thì viết bàn giao (đang ở đâu, việc tiếp theo, tệp dở) rồi mở phiên mới. Bàn giao nên nằm trong tệp, không nằm trong đầu.

## 2. CLAUDE.md dạng bản đồ
CLAUDE.md nạp toàn bộ ở mọi phiên. Chỉ ghi luật luôn đúng và chỉ đường tới tài liệu. Tài liệu sâu để ở tệp riêng, nạp khi cần.

## 3. Skill thay cho luật dài
Skill chỉ nạp mô tả cho tới khi được gọi. Quy trình ít dùng nên là skill, không phải đoạn dài trong CLAUDE.md.

## 4. Agent con cho dò quét
Đọc nhiều tệp trong agent con; phiên chính chỉ nhận kết luận. Nhưng đừng mở agent cho việc nhỏ: mỗi agent tự nạp lại ngữ cảnh (xem `04-MODEL-EFFORT-AGENTS.md`).

## 5. Công cụ đồ thị mã cho kho lớn
Với kho mã lớn, một công cụ đồ thị mã (ví dụ MCP codegraph nếu dự án đã lập chỉ mục) trả mã liên quan và đường gọi trong một lời gọi, thay cho vòng tìm rồi đọc. Với kho nhỏ thì không đáng.

## 6. Đọc đúng đoạn
Đọc theo khoảng dòng. Không đọc lại tệp vừa sửa: công cụ sửa đã báo lỗi nếu thất bại.

## 7. Nén và xoá đúng lúc
- Nén ngữ cảnh (`/compact`) ở mốc xong việc.
- Xoá (`/clear`) khi chuyển sang việc không liên quan.
- Đừng nén giữa chừng một việc đang dở.

## 8. Effort theo việc
medium mặc định; high cho thiết kế và gỡ lỗi; low cho tra cứu. Model nhỏ cho việc rõ đầu bài.

## 9. Thói quen khác
- Chạy lệnh kiểm tra (gate, test) ở dạng đầu ra ngắn; chỉ đọc phần lỗi.
- Hỏi một lần cho đủ thay vì nhiều lượt hỏi nhỏ.
- Đo trước khi tối ưu: xem bản ghi phiên để biết phiên nào tốn, đừng đoán.

## Danh mục kiểm nhanh
- [ ] Phiên này đã dài? Bàn giao và mở phiên mới.
- [ ] CLAUDE.md có đoạn dài chỉ dùng thỉnh thoảng? Chuyển thành skill hoặc tệp riêng.
- [ ] Sắp đọc hơn 5 tệp để trả lời một câu? Giao agent con.
- [ ] Effort đang cao hơn việc cần?
