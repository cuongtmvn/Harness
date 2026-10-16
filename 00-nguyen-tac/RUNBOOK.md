# RUNBOOK — Sổ tay lái AI: vòng 7 nhịp, cần điều khiển, câu lệnh mẫu, bẫy

> **Vị trí:** mục ⑥ của bộ luật. `OPERATING-MODEL.md` là **luật giao thông** (ai quyết gì); file này là **sách dạy lái xe** (lái thế nào).
> **Đọc khi nào:** đầu dự án, và khi thấy mình đang micromanage hoặc đang buông tay.

---

## 1. Vòng 7 nhịp — dùng cho MỌI việc

`Context → Plan → Delegate → Execute → Gate → Log → Iterate`

| Nhịp | Làm gì | Trong harness là gì |
|---|---|---|
| **1 Context** | Nạp bối cảnh: `CLAUDE.md` tự nạp · *"nạp context"* đọc bàn giao → TASKLIST → mục Bước đang mở | `CLAUDE.md` + bảng lệnh kích hoạt |
| **2 Plan** | Bật **Plan mode**, trình kế hoạch, **chờ duyệt kế hoạch** rồi mới làm. *(Duyệt kế hoạch, không duyệt từng lát cắt mã — việc sau đã bỏ)* | Mục `V4`/`V5` cổng vào là kế hoạch tối thiểu |
| **3 Delegate** | Giao có ranh giới: được làm gì / không được làm gì (A hay A+) | `LEASH-BANG.json` · 7 điều dừng |
| **4 Execute** | Để AI chạy trọn bước: đọc/ghi file, chạy lệnh, gọi subagent. Không micromanage | Task cấp 3 trong `TASKLIST.md` |
| **5 Gate** | Cổng mặc định đóng. **Không xác minh được = chặn** | `gate-check.cjs` + "Done khi" + Tester độc lập |
| **6 Log** | Ghi **ngay trong lượt**: Dev Book (quyết định), telemetry (giờ máy đo), bằng chứng chạy thật | `DEVBOOK.md` · `TELEMETRY.md` · `PROOF-LOG.ndjson` |
| **7 Iterate** | Sang việc tiếp | — |

> *"Càng để AI tự chạy nhiều bước, cổng kiểm càng phải chặt."* Orchestrator không phải để buông tay — mà để **rảnh tay lo phần phán đoán**.

---

## 2. Tám cần điều khiển — biết khi nào bật cái nào

| Cần | Là gì | Khi nào | Trong harness |
|---|---|---|---|
| **`CLAUDE.md`** | Trí nhớ dự án, tự nạp mọi phiên — độ tin 100% | Luật **ngắn, luôn đúng** + bảng chỉ đường | `CLAUDE.template.md` |
| **Plan mode** | Lập kế hoạch trước, chờ duyệt | Việc nhiều bước / rủi ro | Mọi lát cắt Bước 8 |
| **Subagent** | Trợ lý con chạy song song, **không thấy hội thoại** | Việc lớn; **lớp kiểm độc lập** | Tester (`PHASEGATE.md §8`) |
| **MCP tools** | Cắm công cụ ngoài | Khi cần đụng hệ thống thật | tuỳ dự án |
| **Skill** | Kỹ năng đóng gói, **AI tự gọi khi tình huống khớp** — kích hoạt MỀM | Quy trình nhiều bước có kiểm chứng | `day-git` |
| **Hook** | Chạy lệnh theo sự kiện, **bất kể AI nghĩ gì** — kích hoạt CỨNG | Việc AI có thể quên mà **hậu quả không hoàn lại** | 6 hook trong `settings.json` |
| **Memory** | Nhớ sở thích qua phiên | Cách Huynh muốn làm việc | memory của Claude Code |
| **Permission mode** | Hỏi từng bước ↔ tự làm trong ranh giới | Đặt đúng dây cương | `settings.json › permissions` |

🔑 **Luật chọn cơ chế: Skill để NẠP, Hook để CHẶN.** Việc nào AI có thể quên mà hậu quả không hoàn lại được thì bắt buộc là Hook. *(Ca thật: luật "cấm gõ tay git commit" nằm trong file tự nạp mọi phiên vẫn bị vượt bốn lần; hook thì không cần ai nhớ.)*

🔑 **Progressive disclosure:** ngữ cảnh là tài nguyên hữu hạn — nhồi thêm không làm tốt hơn mà làm loãng. `CLAUDE.md` chỉ giữ luật luôn đúng + **bảng chỉ đường**; luật dài nạp đúng lúc (mục Bước N trong `PLAYBOOK.md`).

---

## 3. Bảy câu lệnh mẫu — để LÁI, không phải để hỏi

| Mục đích | Câu |
|---|---|
| Giao trọn bước | *"Mục tiêu: [X]. Tự lập kế hoạch, chờ tôi duyệt rồi thực thi trên file dự án. Nêu giả định thay vì bịa."* |
| Bắt lập kế hoạch trước | *"Chưa làm vội. Trình kế hoạch từng bước + rủi ro + chỗ cần tôi quyết."* |
| Cắm ranh giới | *"Được sửa mã + chạy test. KHÔNG commit / đẩy / đổi lược đồ khi chưa hỏi tôi."* |
| Ép hard-stop | *"Chỗ nào mâu thuẫn hoặc thiếu thông tin để quyết thì DỪNG và liệt kê câu hỏi — đừng tự đoán."* |
| Cổng kiểm | *"Sửa xong tự chạy test + cổng, báo kết quả. Đỏ thì sửa tới xanh rồi mới coi là xong."* |
| Việc lớn | *"Chia thành phần độc lập, chạy song song bằng subagent, tổng hợp lại."* |
| Tự phản biện | *"Đóng vai reviewer khó tính, tìm lỗi trong chính kết quả bạn vừa tạo."* — rồi **gọi Tester độc lập**, vì tự phản biện vẫn là cùng một vòng lặp |

**Bảng lệnh kích hoạt của harness** *(chép vào `CLAUDE.md`)*: *"bắt đầu làm việc"* · *"nạp context"* · *"mở Bước N"* · *"đóng Bước N"* · *"mở Round Rk"* · *"đóng MVP"* · *"đẩy git đi"* · *"đẩy lên production"*.

---

## 4. Ba khuôn lỗi phải nhận diện được — rút từ dự án thật

| Khuôn | Dấu hiệu | Phòng bằng |
|---|---|---|
| **Tài liệu nói một đằng, mã nói một nẻo — và TÀI LIỆU LÀ THỨ SAI** | *"nợ X còn sống"* trong khi đã vá · *"không có màn Y"* trong khi tệp 18KB có sẵn | Trước khi khẳng định, **grep mã**; Tester độc lập đọc lại cùng mã |
| **Số ước đội lốt số đo** | Hai CSDL ghép thành một câu · nhãn nguồn dán vào số ước · *"đã đo"* mà không có lệnh đo | Mọi con số công bố phải có **công cụ tạo ra nó**; `kiem-khang-dinh` kiểu chạy lại |
| **Giả định viết như dữ kiện** | *"lược đồ vốn đã cho phép…"* trong khi có chỉ mục UNIQUE chặn | `V4` viết điểm mơ hồ **trước** khi làm; *giả định nguy hiểm nhất là giả định được viết như dữ kiện* |

**Và một hướng lệch có tên:** cổng máy xanh, Tester bác 18 chỗ — **cả 18 đều lệch cùng một hướng: làm việc trông rẻ hơn thực tế**, hướng AI được lợi. Nên **mở Bước nào cũng gọi Tester độc lập trước khi đóng**, đừng tin cổng xanh.

---

## 5. Bẫy orchestrator kinh điển

| Bẫy | Hậu quả | Cách tránh |
|---|---|---|
| Copy output AI ra mà không đọc | Lỗi lọt | Review 4 lớp → Huynh quyết → Dev Book |
| Cho tự chạy việc rủi ro không cổng | Mất dữ liệu, lộ thông tin | A+ chờ duyệt + hook |
| Prompt mơ hồ, thiếu bối cảnh | AI đoán → sai hướng | `CLAUDE.md` + mục tiêu rõ + Plan mode |
| Tin số AI tự bịa | Báo cáo sai | Bắt nêu nguồn; số máy đo; không suy giờ từ token |
| Micromanage từng lệnh | Mất lợi thế orchestrator | Giao **mục tiêu**, không giao thao tác |
| Không ghi Dev Book / telemetry ngay | Không có bằng chứng, viết bù = bịa | Ghi **trong lượt** |
| Chạy *"toàn bộ 11 Bước, đi ngủ"* | Dừng ở lát cắt không giao diện, không ai cảnh báo mâu thuẫn | Bước 8 thiết kế để **người cầm lái từng lát cắt**; mâu thuẫn với lệnh phải được nêu **trước khi chạy** |

---

## 6. Checklist bỏ túi

**Trước khi giao việc:** nạp bối cảnh? · nêu **mục tiêu** (không phải thao tác)? · Plan mode? · cắm ranh giới A/A+? · **mã task cấp 3 đã gán?**
**Trong khi chạy:** việc rủi ro có dừng để duyệt? · chỗ mơ hồ đã hard-stop? · điểm phải hỏi đã vào sổ chờ quyết?
**Trước khi coi là xong:** tự verify (test / bấm thử)? · **Tester độc lập** đã soi? · bằng chứng chạy thật dán nguyên văn? · Dev Book + telemetry? · **đã chạy một phép kiểm cụ thể** trước khi nói "xong"?

---

## 7. Quỹ thời gian và nhịp

Quỹ giờ của chủ dự án là nguồn lực khan hiếm nhất. **Bốn việc Huynh không làm:** đọc mã dò lỗi AI · duyệt từng lát cắt mã · duyệt test · duyệt tài liệu nội bộ chỉ ghi lại việc đã làm. **Việc Huynh làm:** chốt phạm vi · quyết điểm mơ hồ · đọc phát hiện của review rồi **quyết** · bấm thử UAT · ký hoãn / ký ngoại lệ · chấp nhận rủi ro còn lại.

Nhịp dự án do **đợt khảo sát người dùng thật** và **lịch phát hành** quyết định — không phải lịch của ai khác.
