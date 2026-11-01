# Model, effort và agent

## 1. Chọn model và effort theo việc
| Việc | Model | Effort | Ghi chú |
|---|---|---|---|
| Tìm tệp, đếm, đọc nhanh, tóm tắt | `claude-haiku-5-5` | low | Rẻ nhất; không quyết gì |
| Script, việc hàng loạt có đầu bài rõ, viết tài liệu, nội dung | `claude-sonnet-5-5` | medium | Đủ giỏi khi đầu bài rõ; rẻ khoảng 3 lần Opus 5.5 |
| Tester độc lập (kiểm sản phẩm) | `claude-sonnet-5-5` | medium | Lên Opus 5.5 / high khi chạm bảo mật hoặc dữ liệu nhạy cảm |
| Phiên chính: lập kế hoạch, tích hợp, viết mã, quyết kỹ thuật | `claude-opus-5-5` | medium | high khi gỡ lỗi khó |
| Thiết kế giao diện, chấm ảnh chụp màn hình | `claude-opus-5-5` | high | Cần mắt thẩm mỹ |

Model mạnh hơn nữa dành cho kiến trúc hoặc thiết kế lại luật: đắt hơn nhiều, chỉ dùng phiên ngắn có đầu bài viết sẵn. Xem danh sách model hiện hành trước khi dùng.

Quy tắc: **effort mặc định medium**. Tăng lên high cho thiết kế và gỡ lỗi; hạ xuống low cho tra cứu. Không để max làm mặc định.

## 2. Giao agent con hay tự làm
**Giao** khi:
- Phải đọc nhiều tệp mà chỉ cần kết luận (dò quét): agent con đọc, phiên chính nhận kết luận.
- Việc độc lập, chạy song song được.
- Cần góc nhìn không bị lệch theo quá trình làm (tester).

**Tự làm** khi:
- Việc nhỏ, vài lời gọi công cụ, biết rõ đích đến.
- Việc cần ngữ cảnh dài của phiên hiện tại.
- Bạn không viết nổi một đầu bài rõ: nghĩa là chưa hiểu việc, chưa nên giao.

## 3. Các bước tạo một agent
1. **Định nghĩa việc**: đầu vào, đầu ra, "xong khi nào". Không rõ thì chưa giao.
2. **Chọn model + effort** theo bảng ở mục 1.
3. **Viết tệp agent**: `.claude/agents/<tên>.md` (dự án) hoặc `~/.claude/agents/` (mọi dự án). Cấp ít công cụ nhất: tester không có quyền sửa.
4. **Viết đầu bài** (xem mục 4).
5. **Chạy**: việc độc lập chạy nền song song; đừng tự làm lại cùng việc.
6. **Kiểm kết quả**: lỗi của agent trả về với giọng chắc chắn, hãy kiểm các điểm then chốt.
7. **Đo và giữ/bỏ**: vai nào không đáng chi phí thì bỏ.

## 4. Tệp agent mẫu
```markdown
---
name: tra-cuu
description: Tra cứu nhanh trong repo — tìm tệp, tìm chỗ dùng một hàm hoặc chuỗi, đếm, đọc nhanh và tóm tắt. Không sửa gì.
model: claude-haiku-5-5
effort: low
tools: Read, Grep, Glob
---

Bạn tra cứu nhanh trong repo. Không sửa, không tạo tệp, không chạy lệnh có ghi.
Trả lời ngắn: đường dẫn + số dòng + trích đoạn cần thiết.
Không tìm thấy thì nói "không có" kèm lệnh đã dùng, không đoán.
```
Ghi chú: `description` quyết định khi nào Claude chọn agent này, nên viết rõ "làm gì" và "không làm gì". Các agent mẫu của kho (`02-enforcement/agents/`) dùng tên rút gọn như `haiku`, `sonnet`, `opus` ở trường `model`; dùng id đầy đủ nếu muốn ghim phiên bản.

## 5. Cách giao việc (Brief)
Đầu bài là **toàn bộ ngữ cảnh** agent có. Gồm:
- **Mục tiêu**: một câu, và "xong khi nào".
- **Tệp cần đọc**: đường dẫn cụ thể, không bắt agent đoán.
- **Điều đã loại trừ**: cái bạn đã thử, cái không cần xét lại.
- **Phạm vi**: được làm gì, không được làm gì (ví dụ không commit).
- **Dạng kết quả**: ngắn, có số dòng, có mức độ chắc chắn; nêu rõ phần nào là suy đoán.

Không đưa giả thuyết của bạn như sự thật: agent nhận giả thuyết thường trả về "đã xác nhận".

## 6. Không nên
- Dùng model đắt nhất cho việc thường ngày.
- Để effort max làm mặc định.
- Mở nhiều agent song song cho việc nhỏ: mỗi agent tự nạp lại ngữ cảnh.
- Giao việc rồi tự làm lại chính việc đó.
- Tin kết luận của agent mà không kiểm điểm then chốt.
- Cho agent kiểm tra quyền sửa mã mà nó đang kiểm.
