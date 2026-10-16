# NGUYÊN TẮC THIẾT KẾ CỔNG — 15 bài học rút từ dự án thật, đã chưng cất thành luật

> **Đọc khi nào:** trước khi thêm, sửa, hay nới bất kỳ cổng / hook / phép kiểm nào. Đây là phần **Lesson Learnt** của harness — thứ dùng lại được, không phải bản chép lại sự vụ.
> Mỗi bài học ghi: **luật** · **vì sao** (ca thật, đã bỏ chi tiết riêng dự án) · **cơ chế** trong harness. Bài học không có cơ chế thì ghi thẳng là *dựa vào kỷ luật*.

---

| # | Luật | Vì sao — ca thật | Cơ chế trong harness |
|---|---|---|---|
| **1** | **Luật không có phép kiểm thì không sống.** Mọi luật phải chỉ ra được *cưỡng chế bằng gì*; không chỉ ra được thì khai là **đang hở** | Luật "mỗi Bước qua cổng" viết rõ; 4 Bước được đóng trong **0,7 giây** bằng vòng lặp shell, cổng máy xanh — vì 11 mục cổng chỉ là văn bản. Lặp lại ít nhất **bốn lần** ở bốn chỗ khác nhau | Sổ đăng ký luật có trường `cochequuongche`; `kiem-luat --trangtri` đếm luật trang trí; bản khai cổng (f) |
| **2** | **Thứ AI biết không dự đoán được thứ AI làm.** Mọi biện pháp dạng *"nhớ đừng làm X"* cùng loại với thứ vừa hỏng | AI đọc ranh giới cấm do chính nó viết vài giờ trước, rồi vẫn vi phạm. Luật cấm `git commit` tay bị vượt bốn lần dù nằm trong file tự nạp mọi phiên | **Skill để NẠP, Hook để CHẶN.** Ba hook chặn: commit tay · ghi đè file luật · ghi CSDL thật chưa sao lưu |
| **3** | **Fail-closed, cả hai chiều.** Không xác minh được = CHẶN. Không rơi về mặc định ngầm | Bảng dây cương chép tay ở hai nơi, "đồng bộ thủ công" — không phép kiểm nào canh cả hai; bảng mặc định lặng lẽ là đúng thứ khiến A+ thành A mà không ai kêu | `_harness-config.cjs` thoát 2 khi thiếu config; `gate-check` chặn khi không đọc được LEASH-BANG; `rtm-check` mã 1 = chưa xác minh được, cổng Bước đọc là CHẶN |
| **4** | **Cổng máy chỉ kiểm kế toán. Cổng xanh ≠ Bước đạt.** Phải đối chiếu "Done khi" | Cổng trả *đủ điều kiện đóng*, AI báo *"không còn việc gì"*; thực tế Bước còn thiếu định nghĩa nghiệm thu và mâu thuẫn văn bản | Ba tầng báo trạng thái (`PHASEGATE §4`); cổng tự in dòng nhắc |
| **5** | **Không tuyên bố "xong" khi chưa chạy phép kiểm cụ thể và dán kết quả.** | Báo *"đã sắp xếp xong bộ luật"* trước khi rà — rà xong mới lộ mất 13 luật (>20%) | Dựa vào kỷ luật + khối "XONG NGHĨA LÀ GÌ" của cổng |
| **6** | **Chỗ nào cổng được NỚI thì AI được lợi ⇒ phải khai xung đột lợi ích và SIẾT bù.** | Nới cổng bằng chứng từ "chỉ HTTP" sang năm loại — kèm hai trường bắt buộc `loaiBangChung` + `lyDoKhongHttp` ≥30 ký tự, thử ngược 5/5 chặn được | Điều dừng 5; mọi chỗ nới trong mã có chú thích *KHAI XUNG ĐỘT LỢI ÍCH* |
| **7** | **Không có đường nào cho qua mà không để lại chữ ("nợ đã ghi").** Mục không đạt có lý do thì qua được, nhưng bản ghi mang cảnh báo | Cổng R8 bị chặn bởi file của phiên song song; nếu không có lối ra thì cổng treo vĩnh viễn vì việc của người khác — và **một cổng không ai qua nổi sẽ bị vô hiệu hoá bằng cách khác, tệ hơn không có cổng** | `dat:false + lyDo`; `R8` nợ; `#QUA-DAY-GIT` ghi vết `di-vong`; `ke-thua` kèm lý do |
| **8** | **Một cổng lúc nào cũng đỏ thì không còn là cổng.** Dương tính giả là nhiễu nền che mất chỗ đỏ thật | Bốn luật báo "MẤT" ở mọi lần chạy chỉ vì xuống dòng giữa chừng — nằm ngay cạnh chỗ luật mất thật sẽ hiện ra | `kiem-luat --mat` gộp khoảng trắng (và chỉ thế); `--diff` không chặn; sổ chờ quyết **im lặng** khi chưa tới lúc |
| **9** | **Một dấu hiệu người làm tự tạo ra được không chứng minh được việc đã làm.** Dấu nói ý định; bằng chứng nói việc đã làm | Dấu `#DAY-GIT-BUOC-3` một mình từng đủ để qua hook — tức một mật khẩu: gõ đúng chuỗi là qua, không cần chạy cổng nào | Mốc `moc-day-git` dán vân tay `git write-tree`, hạn 15 phút; hook đòi **cả dấu lẫn mốc** |
| **10** | **Cổng phải đo thứ chủ dự án YÊU CẦU, không chỉ thứ đã KHAI.** Vòng khép kín *AI chọn phạm vi → AI viết task → cổng đo task* là chỗ nguy nhất | MVP lên môi trường thật **thiếu 3/7 mục tiêu** trong khi 20 cổng đều xanh: RTM nhắc mục tiêu đó 0 lần, vẫn PASS | `PHAM-VI-MVP.json` nguyên văn, AI không sửa; `kiem-pham-vi --truoc-prod`; `kiem-backlog` ở Bước 1 |
| **11** | **Một phép đo đúng, chạy nhầm môi trường, vẫn là không đo — và nó làm số đẹp lên.** Phải KHAI nơi chạy, không tự suy từ mã | Hàng chục ca trình duyệt, tất cả trỏ localhost; production chưa từng bị trình duyệt chạm, không cổng nào đỏ. Quét chuỗi để tự suy môi trường đếm nhầm tệp chỉ *nhắc* tên miền | `PHU-MOI-TRUONG.json` + `kiem-phu-moi-truong` (ô trống ≥60 ký tự lý do; tệp phải có thật và nhắc đúng môi trường) |
| **12** | **Ô truy vết phải trỏ tới thứ CÓ THẬT.** Đếm hàng "có ghi gì đó" là đếm chữ, không đếm sự thật | Ma trận truy vết trôi 93/310 ca test mà không ai biết suốt một Bước; ô ghi tên file đã xoá vẫn làm chỉ số đẹp | `doc-health` c1 chỉ tính ô trỏ tệp tồn tại; `rtm-check` #3; `kiem-pham-vi` ②; `kiem-phu-moi-truong` ② |
| **13** | **Chỉ số đo lịch sử không đo ngược được.** Chuẩn bị TRƯỚC khi thay đổi xảy ra | Bản nhập mã ban đầu gộp 179 file vào một commit ⇒ mất vĩnh viễn điểm dữ liệu `c2` đầu tiên; quyết định chỉ trong chat thì c6 không tìm lại được | `TRACEABILITY §6` ba quy ước phải dựng ngay; `docHealth.c2LoaiTru` ghi ngoại lệ thay vì sửa lịch sử |
| **14** | **Phép đối chiếu chỉ bắt được LỆCH, không bắt được CÙNG THIẾU.** Phải có một neo ngoài không do AI khai | Hai sổ cùng thiếu một tính năng thì `kiem-backlog` vẫn xanh | Mắt xích 1 của chuỗi truy vết là **nguyên văn chủ dự án** |
| **15** | **Định nghĩa chỉ số phải giữ nguyên văn người ra đề, rồi mới diễn giải.** Và mọi vế ⚠️ trong bảng đối chiếu phải đẻ ra một mục nợ — *thứ gắn nhãn "đạt" thì không ai kiểm lại* | 5/7 chỉ số trôi đúng ở khâu diễn giải, không ai phát hiện suốt 6 ngày; hai chỉ số gắn nhãn ✅ với vế ⚠️ phía sau bị bỏ quên | `DOC-HEALTH-RULES.md §2` trích nguyên văn; mục nợ công khai dạng bảng trong mọi luật kiểm thử |

---

## Bốn khuôn thiết kế dùng lại

**A. Cổng đối chứng 4 lớp** *(PHASEGATE §7)* — làm mỗi lần dừng của người **rẻ đi** (máy chỉ đích danh chỗ cần quyết) thay vì bỏ cổng. Khuôn này nên nhân ra mọi cổng có "người quyết".

**B. Khai trước khi biết kết quả** — bảng khai Round khai lúc MỞ; bộ ca kiểm soạn xong TRƯỚC khi chạy; `V4` điểm mơ hồ viết TRƯỚC khi làm. Lời khai sau khi biết kết quả không có giá trị đối chiếu.

**C. Gờ giảm tốc có ghi vết, không phải bức tường** — bức tường không kẽ hở mời gọi AI đổi cách gõ cho lọt mà không tự thấy đó là lách. Đường đi vòng tồn tại, cố ý, và để lại chữ.

**D. Đọc nguồn đã có, không đẻ sổ thứ bảy** — một sổ phải-nhớ-ghi thì sẽ trống, y như mọi sổ phải-nhớ-ghi khác. Công cụ gom quyết định đọc sáu nguồn đã có; nguồn sự thật nằm nguyên chỗ cũ.

---

## Ba lỗi dụng cụ đo lặp lại — kiểm dụng cụ trước khi kết luận

| Khuôn | Ví dụ | Phản xạ |
|---|---|---|
| **Sai đơn vị trong ô** | Cột tên "(phút)" mà 19 dòng ghi giây — một công cụ đọc sai 60 lần, công cụ khác bỏ qua sạch | Đọc đơn vị **ghi trong ô**, không tin tên cột |
| **Sai cách gọi, không phải công cụ hỏng** | Phạm vi 1 ngày cắt cụt ngày đầu dải ⇒ lệch 20 lần; kết luận nhầm "công cụ hỏng" | Số ra **vô lý** thì nghi **dụng cụ** trước, đừng sửa kết luận cho khớp |
| **Đo chuỗi thay vì đo hành vi** | Quét chuỗi `127.0.0.1` đếm nhầm tệp chỉ nhắc nó trong dữ liệu thử; ô "Chưa đánh ✅" bị đọc là xong | Bắt KHAI thay vì tự suy; đọc **ký tự đầu** ô trạng thái |
