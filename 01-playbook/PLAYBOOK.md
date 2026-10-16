# PLAYBOOK — Đường ray 11 Bước, mỗi Bước có cổng vào và cổng ra

> **Vị trí:** mục ④ của bộ luật điều hành AI. **File này là NGUỒN DUY NHẤT cho nội dung 11 Bước.**
> **Đọc khi nào:** mở Bước nào thì đọc **mục Bước đó** trước khi làm bất cứ gì. Cổng chung (V1–V6, R1–R8, 13 điều kiện máy) ở `PHASEGATE.md`; chính sách kiểm duyệt ở `REVIEW-POLICY.md`; chuỗi truy vết ở `TRACEABILITY.md`.
> **Hai vai:** Huynh = chủ dự án · CULI = AI thực thi *(`harness.config.json › vaiTro`)*.
> **Nguồn gốc:** khung 11 Bước "Từ đề tới lát cắt dọc chạy được" của một chương trình đào tạo PM-AI, cộng các cổng vào / cổng ra và cơ chế máy mà dự án gốc rút ra sau nhiều lần vỡ. Chỗ nào là khung gốc ghi 🎓, chỗ nào harness thêm ghi 🔧.

---

## 0. Cách dùng

| Huynh gõ | CULI làm |
|---|---|
| *"nạp context"* | Đọc theo thứ tự: bàn giao mới nhất trong `Log/` → `Log/TASKLIST.md` *(nguồn trạng thái duy nhất)* → `CLAUDE.md` → mục Bước đang mở trong file này |
| *"mở Bước N"* | Đọc **mục Bước N** → chạy **cổng VÀO** (`PHASEGATE.md §1`) → khai `V1`–`V6` vào `Log/cong-buoc/<mvp>[-<round>]-B<N>.json` → chưa đủ thì **KHÔNG mở** |
| *"đóng Bước N"* | Chạy **cổng RA** `R1`–`R8` → `node Log/gate-check.cjs --buoc N --mvp <nn> [--round R<k>]` → 13 điều kiện xanh **và** "Done khi" đạt mới `--ghi` |
| *"mở Round R<k>"* | Khai đủ 11 Bước ở `Log/khai-round/<mvp>-R<k>.json` → `node Log/gate-check.cjs --mo-round R<k> --mvp <nn> --ghi` |
| *"đóng MVP"* | `node Log/gate-check.cjs --dong-mvp <nn> --ghi` — mọi Bước phải **đã đóng** hoặc **mọi Round khai `ke-thua`** |
| *"Bước N còn gì"* | Trả lời bằng **ba tầng** (`PHASEGATE.md §4`), ⛔ **không đếm task** |

**Nguyên tắc trùm lên tất cả — fail-closed:** *không xác minh được thì CHẶN, không "tạm cho qua"*. Áp cho **cả cổng vào lẫn cổng ra**.

### 0.1. Ba tầng MVP ↔ Round ↔ Bước — đừng lẫn

| Tầng | Nghĩa vụ | Ai gác |
|---|---|---|
| **MVP** | ⛔ **PHẢI chạy đủ 11 Bước.** Đóng MVP mà còn Bước nào chưa Round nào chạm ⇒ MVP chưa xong, bất kể mọi Round đều xanh | `--dong-mvp` |
| **Round** | 🔑 **Được bắt đầu ở Bước bất kỳ**, tuỳ tình hình. Đổi lại: **khai đủ 11 Bước lúc MỞ Round** — `cham` / `khong-cham` / `ke-thua`, hai cái sau **bắt buộc lý do** | `--mo-round` + điều kiện `(0)`, `(e)` |
| **Bước** | Qua **cổng VÀO `V1`–`V6`** và **cổng RA `R1`–`R8`** + 13 điều kiện máy | `--buoc` |

> ⚠️ **Vì sao phải tách tầng:** bản luật cũ ghi *"mỗi Round chạy đủ pipeline"* — và luật đó đẻ ra hành vi giả: 9 Bước được khai `cham` rồi đóng gọn trong một buổi, không phải vì Bước nào cũng có việc mà vì **không khai `cham` thì cổng chặn**. Luật không khớp thực tế thì sẽ được thi hành **hình thức**.
> ⚠️ **Lời khai Round phải có VIỆC CỤ THỂ**, kể cả Bước khai `cham`. Lời khai có việc kèm theo thì **đối chiếu được**; lời khai trống thì không — và khai cả 11 Bước = `cham` với lý do trống rồi 4 Bước không làm gì là ca đã xảy ra.

### 0.2. Vòng đời một Bước — 5 nhịp

```
MỞ BƯỚC          →  CHẺ VIỆC     →  LÀM + GHI SỐ ĐO  →  CỔNG RA          →  ĐÓNG BƯỚC
(khai V1–V6)        (1–3 cấp)       (telemetry thật)    (R1–R8 + 13 máy)    (ghi bản ghi đóng)
```

### 0.3. ⛔ Cấm nhảy cóc Bước

**Bước N không được mở khi Bước N−1 chưa đóng** *(trừ Bước mà bảng khai Round tuyên bố `khong-cham`/`ke-thua`)*. Thực thi ở **ba nơi cùng lúc**: mục `V1` cổng vào · điều kiện máy `(e)` · bản ghi đóng sai thứ tự bị **huỷ hiệu lực** (`ketQua: "huy"`).
*Một cổng bị vượt mà không có hậu quả sẽ bị vượt tiếp.*

### 0.4. Round — năm luật

1. Mỗi Round có **mốc bắt đầu ghi rõ** (bản ghi `mo-round`) và **cổng riêng** cho từng Bước nó chạm (tên tệp bản khai cổng mang mã Round).
2. Round sau **được phép không chạy hết 11 Bước**. Cái **không được rút gọn** là **lời khai**.
3. ⛔ **Không dùng Round để lách cổng.** Mở Round mới khi Bước của Round trước còn treo thì phải ghi rõ lý do ở `moVi`.
4. 🔧 **Mở Round là hành vi có cổng**, không phải gõ mã `.R<k>.` vào TASKLIST. Task mang `.R<k>.` mà Round chưa có bản ghi mở ⇒ cổng Bước **CHẶN** (điều kiện `(0)`).
5. 🔧 **Khai đủ 11 Bước**, mỗi Bước đúng một trạng thái, kèm `moVi` — Round này mở vì **khoảng cách nào** của Round trước.

### 0.5. Ba quy ước làm việc gác bằng máy

| Quy ước | Cưỡng chế |
|---|---|
| **Mọi commit đi qua skill `day-git`** — ⛔ cấm gõ tay `git commit`. Repo có thể chạy nhiều phiên song song, vùng staged là tài nguyên dùng chung | Hook `chan-git-commit-tay.cjs` + mốc `moc-day-git.cjs` |
| **Chạm mã ⇒ chủ động xác minh tài liệu đi kèm TRƯỚC khi commit** — tra `RTM.md` xem mã thuộc dòng nào, dòng đó đòi tài liệu nào, cập nhật **cùng một commit** | `kiem-c2-staged.cjs` mã thoát 2 = CHẶN. ⛔ Vẫn cấm sửa tài liệu chỉ để cổng xanh: phép phân biệt là *"sản phẩm có làm điều gì mà tài liệu không mô tả không?"* |
| **Không tuyên bố "xong" khi chưa chạy phép kiểm** — trước khi nói *xong / đã đủ / không còn việc gì* phải chạy được một phép kiểm cụ thể và dán kết quả | Cổng tự in khối *"XONG NGHĨA LÀ GÌ"* mỗi khi đỏ |

---

## 1. Bảng tra nhanh — Bước ↔ artefact ↔ mã truy vết sinh ra ↔ kiểm duyệt

| # | Bước | Artefact ra (`Output/`) | Mã truy vết Bước này **tạo** | Review độc lập *(mặc định)* |
|---|---|---|---|---|
| 0 | Làm rõ phạm vi | `SCOPE.md` + `Instructions/PHAM-VI-MVP.json` | `M<n>` mục tiêu · `D-<..>-n` quyết định nền | **mọi Round** — Huynh tự chốt phạm vi |
| 1 | Đặc tả yêu cầu (SRS) | `SPEC.md` + `BACKLOG.md` | `US-xx` · `AC` · `NFR-xx` · `PB-xxx` | Round đầu |
| 2 | Bản đồ module | `MODULEMAP.md` | `L0-n` / `M-n` module | Round đầu |
| 3 | Kiến trúc | `ARCH.md` | `D-ARCH-n` · bảng/trường/API có độ nhạy | Round đầu |
| 4 | Chẻ việc (WBS) | `WBS.md` + `Log/TASKLIST.md` | mã task cấp 3 `MVP_nn.b.X.Y.n` | không |
| 5 | Ước lượng | `EST.md` | — | không |
| 6 | Rủi ro + phân quyền | `RISK.md` + `DELEGATION-MAP.md` + `Instructions/LEASH-BANG.json` | `R-xx` rủi ro · mục dây cương | Round đầu |
| 7 | Điều kiện vào xây (DoR) | `DOR.md` | — | Round đầu |
| 8 | Xây lát cắt dọc | mã `App/` + `DEVBOOK.md` + `Log/PROOF-LOG.ndjson` | tệp mã · tệp test · dòng bằng chứng | **mọi Round** |
| 9 | Kiểm thử & cổng | `SITUAT.md` + `App/tests/` | `IT-Px` · `SIT-Px` · `UAT-xx` ↔ `AC` | **mọi Round** |
| 10 | Truy vết · số đo · báo cáo | `RTM.md` · `TELEMETRY.md` · `WEEKLY.md` | dòng RTM khép kín | không |

> Cột *Review độc lập* đọc từ `harness.config.json › reviewPolicy` — **đây là mặc định**, dự án đổi được nhưng là **điều dừng 5**. Nghĩa của từng giá trị ở `REVIEW-POLICY.md`.

---

## 2. 🤖 AI — luật chung mọi Bước

**🚫 TUYỆT ĐỐI KHÔNG, không câu lệnh nào trong phiên gỡ được:** tự đẩy / gộp / phát hành · đụng khoá bí mật · tự đánh dấu xong khi đang chờ duyệt · sinh nội dung không có nguồn khi dự án đòi nguồn · tự hoà giải hai nguồn mâu thuẫn · sửa tài liệu hay test để cổng xanh · đổi phạm vi.

**⛔ DỪNG HỎI ở mọi Bước** khi chạm vùng A+ của dự án (`Instructions/LEASH-BANG.json`) — bất kể đang ở Bước nào.

---

# Bước 0 — Nhận đề & làm rõ phạm vi

**Mục tiêu** 🎓 Biến đề mơ hồ thành **phạm vi chốt được**: làm gì, bỏ gì, cược vào giả định nào.
**Artefact ra:** `Output/SCOPE.md` · 🔧 `Instructions/PHAM-VI-MVP.json` *(danh mục mục tiêu, nguyên văn Huynh)*.

### 📥 Đọc gì trước khi mở
| File | Lấy nội dung gì |
|---|---|
| Đề / yêu cầu gốc của Huynh | Nguyên văn — để chép vào `PHAM-VI-MVP.json`, ⛔ không diễn đạt lại |
| `Output/SCOPE.md` | Phạm vi Round / MVP trước · những gì đã ghi là ngoài phạm vi |
| `Output/RTM.md` | Dòng còn mồ côi · khối **RÀNG BUỘC THEO BƯỚC** dành cho Bước 0 |
| `Output/BACKLOG.md` §ⓑ | Việc đã hoãn — có mục nào tới điều kiện bung lại không |
| `Output/TELEMETRY.md` | Giờ thật đã dùng · vận tốc Round trước |

### 📥 Cổng vào riêng
Có brief / yêu cầu gốc · biết **quỹ giờ thật còn lại** · biết Round này mở vì **khoảng cách nào** của Round trước.

### 🤖 AI ở Bước này
- ✅ **Được:** viết phát biểu vấn đề · liệt kê giả định · đề xuất phần ngoài phạm vi · **lập bảng lựa chọn kèm hệ quả từng phương án** · chép nguyên văn mục tiêu vào `PHAM-VI-MVP.json` với `trangThai: "chua-lam"`
- ⛔ **Dừng hỏi:** **chốt phạm vi** — làm gì, bỏ gì, chia Round thế nào (điều dừng 3). AI trình bảng, **Huynh chọn**
- 🚫 **Không:** tự chốt phạm vi rồi báo *"đã chốt"* · **im lặng bỏ một mục ra khỏi phạm vi** · tự xếp mục tiêu sang Round sau

### 📤 Done khi 🎓
Đọc SCOPE là biết MVP **gồm gì · bỏ gì · đang cược vào giả định nào**; phần ngoài phạm vi ghi rõ.
🔧 Thêm: mọi quyết định nền mang **mã tra được** (`D-…`) · `PHAM-VI-MVP.json` có **đủ mọi mục tiêu Huynh nêu**, mỗi mục một nguyên văn.

### ⚠️ Bẫy 🎓
Nhảy vào tính năng khi phạm vi còn mơ hồ · không ghi giả định · 🔧 AI tự chia Round rồi mục bị hoãn "tự rơi khỏi định nghĩa xong".

---

# Bước 1 — Đặc tả yêu cầu (SRS)

**Mục tiêu** 🎓 Yêu cầu đủ để **thiết kế VÀ kiểm thử**: chức năng + phi chức năng + tình huống dùng theo vai + tiêu chí chấp nhận.
**Artefact ra:** `Output/SPEC.md` · 🔧 `Output/BACKLOG.md` §ⓐ *(mọi tính năng của đợt mang mã `PB-xxx`)*.

### 📥 Đọc gì trước khi mở
| File | Lấy nội dung gì |
|---|---|
| `Output/SCOPE.md` *(đã đóng)* | Phạm vi đã chốt — để không viết story ngoài phạm vi |
| 🔑 **Nguồn tri thức miền thật** của dự án | **Nguyên văn nguồn** để viết tiêu chí chấp nhận có chỗ trỏ về — ⛔ cấm viết AC từ trí nhớ |
| `Output/SPEC.md` | Story hiện có · số hiệu tiếp theo · NFR đã có |
| `Output/RTM.md` | Ràng buộc cho Bước 1 · story chưa truy được về SCOPE |

### 📥 Cổng vào riêng
🔧 Nguồn tri thức miền **đã mở và đọc thật**. *Lý do: một dòng mô tả viết khi chưa ai mở nguồn đã sai 3 chỗ và sống nhiều ngày.*

### 🤖 AI ở Bước này
- ✅ **Được:** viết story · AC dạng Given/When/Then **đo được** · NFR **có con số** · bảng **vai × tình huống dùng** · **ca nghịch và ca phân quyền theo vai** · gán mã `PB-` cho từng tính năng
- ⛔ **Dừng hỏi:** nguồn mâu thuẫn không phân xử được (1) · story nào thuộc phạm vi (3) · **mọi ngưỡng "đủ tốt"** (4)
- 🚫 **Không:** 🔧 **tự kiểm AC của chính mình rồi tuyên bố đạt** — phải có lớp kiểm ngoài · viết AC không đo được · bỏ ca nghịch / phân quyền

### 📤 Done khi 🎓
Mỗi story MVP có **AC kiểm được** · có **bảng vai × tình huống dùng** · **NFR ghi rõ con số**.
🔧 Thêm — **cổng RA riêng:** `node Log/kiem-backlog.cjs` mã `0` — mọi tính năng của đợt, **cả chức năng lẫn phi chức năng**, có mã `PB-xxx` trong `BACKLOG.md` §ⓐ, và mọi dòng RTM có `US-xx` trỏ về một mã `PB-`.

> 🔑 *Hết Bước 1 là toàn bộ tính năng của MVP / Round đã nằm trong backlog.* Không có sổ ở tầng tính năng thì một tính năng có thể được xây, đo, đóng Bước, lên môi trường thật mà **không nằm trong danh mục nào**.

### ⚠️ Bẫy 🎓
Chỉ viết đường thuận · quên ca nghịch và phân quyền theo vai · NFR bỏ trắng · AC không đo được.

---

# Bước 2 — Bản đồ module & phân tầng

**Mục tiêu** 🎓 Chia module, tách **tầng nền** (xác thực · mô hình dữ liệu · phân quyền · cổng vào) khỏi tầng bề mặt; chỉ ra **lát cắt dọc mỏng** đầu tiên.
**Artefact ra:** `Output/MODULEMAP.md`.

### 📥 Đọc gì trước khi mở
| File | Lấy nội dung gì |
|---|---|
| `Output/SPEC.md` *(đã đóng)* | Story để gom thành module |
| `Output/ARCH.md` | Ranh giới nền / bề mặt đã cố định (Round sau) |
| `Output/MODULEMAP.md` | Bảng module hiện có |
| 🔑 `git status` + cây thư mục `App/` | **Module đã có mã nhưng chưa vào bản đồ** |

### 📥 Cổng vào riêng
🔧 **Liệt kê đủ module mới phát sinh từ Round trước.** *Lý do: một Round quên hẳn hai module, và đó là Bước chặn cả dây chuyền.*

### 🤖 AI ở Bước này
- ✅ **Được:** gom story thành module · phân tầng nền / bề mặt · đề xuất thứ tự làm · chỉ ra lát cắt dọc mỏng · 🔧 ghi **cột tệp thực thi** cho từng module (để chỉ số `c4` đo được)
- ⛔ **Dừng hỏi:** nếu lát cắt đầu làm **đổi phạm vi đã chốt** (3)
- 🚫 **Không:** thêm module **không truy được về SPEC** · xếp bề mặt lên nền chưa có

### 📤 Done khi 🎓
Thấy rõ **móng nào làm trước** và có **một lát cắt dọc mỏng** để xây đầu tiên. 🔧 Mỗi module có cột tệp thực thi *(hoặc ghi rõ "chưa có mã")*.

### ⚠️ Bẫy 🎓
Làm bề mặt đẹp trên nền chưa có · ôm hết module cùng lúc.

---

# Bước 3 — Kiến trúc

**Mục tiêu** 🎓 Bản thiết kế đủ để bắt tay viết mã: nguyên tắc · sơ đồ thành phần · mô hình dữ liệu **có độ nhạy từng trường** · giao ước API · nền tảng kỹ thuật kèm lý do · mô hình phân quyền.
**Artefact ra:** `Output/ARCH.md`.

### 📥 Đọc gì trước khi mở
| File | Lấy nội dung gì |
|---|---|
| `Output/SPEC.md` + `MODULEMAP.md` *(đã đóng)* | Story và module để thiết kế cho khớp |
| Lược đồ CSDL hiện có | Trường hiện có · trường sắp thêm |
| `Output/ARCH.md` | Quyết định đã đánh mã, để không mâu thuẫn |
| `Instructions/LEASH-BANG.json` | Vùng nào là A+ — để biết chỗ nào phải dừng trước khi tạo / sửa |

### 📥 Cổng vào riêng
🔧 **Danh sách trường dữ liệu mới**, và trường nào chạm dữ liệu cá nhân.

### 🤖 AI ở Bước này
- ✅ **Được:** nguyên tắc kiến trúc · sơ đồ · mô hình dữ liệu · giao ước API · mô hình phân quyền · **gắn độ nhạy vào TỪNG trường** · đánh mã `D-ARCH-n` cho từng quyết định
- ⛔ **Dừng hỏi:** trường chạm **dữ liệu cá nhân** ⇒ dừng **trước khi** tạo / sửa cấu trúc · cần thư viện mới (7) · đổi nền tảng đã cố định
- 🚫 **Không:** **để một trường mới không gắn độ nhạy** · quyết định kiến trúc **không có mã** *(một quy tắc chỉ tồn tại trong lịch sử chat thì người sau sẽ lấp bằng phỏng đoán)*

### 📤 Done khi 🎓
Một người viết mã đọc là **bắt tay dựng được**; mô hình dữ liệu và giao ước API **khớp story MVP**.
🔧 Thêm: **mọi trường mới đã gắn độ nhạy** · mọi thay đổi kiến trúc có mã `D-ARCH-n` · phần chưa chốt đánh dấu rõ.

### ⚠️ Bẫy 🎓
Chọn nền tảng theo quen tay · **bỏ quên phân quyền ở tầng dữ liệu** · 🔧 di trú CSDL người thật **hai lần** cho một việc có thể gộp.

---

# Bước 4 — Chẻ việc (WBS)

**Mục tiêu** 🎓 Bẻ việc thành đơn vị làm được; việc gần bẻ sâu, việc xa để thô (rolling-wave).
**Artefact ra:** `Output/WBS.md` · 🔧 `Log/TASKLIST.md` *(mã task cấp 3 — đơn vị duy nhất mà telemetry và cổng bám vào được)*.

### 📥 Đọc gì trước khi mở
| File | Lấy nội dung gì |
|---|---|
| `Output/ARCH.md` + `MODULEMAP.md` *(đã đóng)* | Ranh giới module để chia việc không chồng |
| `PHASEGATE.md §5` | Quy ước mã task · 3 tiêu chí một việc hợp lệ |
| `Output/WBS.md` | Cây việc hiện có |

### 📥 Cổng vào riêng
🔧 **Có checklist "sót kinh điển" trong tay** trước khi chẻ: tích hợp · đối soát · kiểm thử · màn quản trị · phân quyền · nhật ký kiểm toán.

### 🤖 AI ở Bước này
- ✅ **Được:** chẻ việc 1–3 cấp · ghi phụ thuộc · tự rà checklist sót kinh điển · gán mã task cấp 3 **TRƯỚC khi làm** *(không có mã = vô hình với hệ thống đo)*
- ⛔ **Dừng hỏi:** nếu lộ ra việc **nằm ngoài phạm vi đã chốt** (3)
- 🚫 **Không:** viết việc **mơ hồ** — *"hoàn thiện phần X"*, *"làm tiếp phần còn lại"*

### 📤 Done khi 🎓
Việc ở đợt gần **chạy được ngay**; **6 việc hay sót đã có mặt hoặc ghi rõ vì sao không cần**.
🔧 Thêm: việc cấp 3 **rõ ràng · trọn vẹn · tương đối độc lập**, **≤ 2 ngày/việc**, mỗi việc có **cột Work item** trỏ được từ RTM.

**Ba cấp chẻ việc** 🔧 — cấp 2 có thể bỏ khi Bước nhỏ, **cấp 3 bắt buộc**:

| Cấp | Là gì | Ví dụ |
|---|---|---|
| 1 | **Bước** (0→10) | Bước 8 — BUILD |
| 2 | **Nhóm việc** trong Bước — theo mục phạm vi hoặc lát cắt | Mục B · lát cắt `W2-C1` |
| 3 | **Việc thực thi** — có telemetry, có cổng | `MVP_02.8.B.BUILD.1` |

### ⚠️ Bẫy 🎓
Quên tích hợp / đối soát · quên màn quản trị / phân quyền / nhật ký kiểm toán · **quên kiểm thử**.

---

# Bước 5 — Ước lượng

**Mục tiêu** 🎓 Ước lượng có cơ sở, đo bằng **giờ người thật**, không suy từ token.
**Artefact ra:** `Output/EST.md`.

### 📥 Đọc gì trước khi mở
| File | Lấy nội dung gì |
|---|---|
| `Output/WBS.md` *(đã đóng)* | Danh sách việc cần ước |
| 🔑 `Output/TELEMETRY.md` | **Giờ thật đã tiêu cho việc tương tự** — cơ sở ước, thay cho đoán |
| `Output/EST.md` | Cách ước đã dùng ở Round trước, để nhất quán |

### 📥 Cổng vào riêng
🔧 Biết **quỹ giờ thật còn lại** và **vận tốc thật** của các Bước trước *(`node Log/do-gio.cjs`)*.

### 🤖 AI ở Bước này
- ✅ **Được:** ước lượng kèm giả định · khoảng lạc quan / khả dĩ / bi quan · chỉ 3 việc rủi ro ước lượng cao nhất
- ⛔ **Dừng hỏi:** tổng **vượt quỹ giờ** — cắt gì là **quyết định kinh doanh** (4)
- 🚫 **Không:** phun một con số **không giả định** · **suy giờ từ token**

### 📤 Done khi 🎓
**Mỗi ước lượng gắn giả định**; tổng khớp mốc **hoặc chỉ rõ lệch ở đâu**.

### ⚠️ Bẫy 🎓
AI phun số không giả định · **quên đệm cho tích hợp và kiểm thử** · tin mốc mà không kiểm.

---

# Bước 6 — Rủi ro & phân quyền

**Mục tiêu** 🎓 Rủi ro có **người sở hữu + cách giảm**; quy tắc ủy quyền cho AI rõ (việc nào A, việc nào A+).
**Artefact ra:** `Output/RISK.md` + `Output/DELEGATION-MAP.md` + 🔧 `Instructions/LEASH-BANG.json` *(nguồn sự thật duy nhất cho cổng máy)*.

### 📥 Đọc gì trước khi mở
| File | Lấy nội dung gì |
|---|---|
| `Output/WBS.md` *(đã đóng)* | Việc để soi rủi ro |
| `Output/RISK.md` | Rủi ro đã đánh mã — để không trùng, biết mã tiếp theo |
| `Instructions/LEASH-BANG.json` | Bảng dây cương hiện tại |
| `OPERATING-MODEL.md §5` | 7 điều dừng — để xếp rủi ro mới vào đúng nhóm thẩm quyền |

### 📥 Cổng vào riêng
🔧 **Rủi ro mới do Round này lộ ra đã liệt kê.**

### 🤖 AI ở Bước này
- ✅ **Được:** lập danh sách rủi ro có xác suất × tác động · cách giảm · người sở hữu · **nhóm rủi ro do AI sinh** (bịa · lộ dữ liệu vào prompt · duyệt bừa) · đề xuất mức dây cương cho từng loại việc
- ⛔ **Dừng hỏi:** **sửa chính luật quản AI** — bảng dây cương · 7 điều dừng · cơ chế cổng (5). **Phải khai xung đột lợi ích**
- 🚫 **Không:** **tự hạ mức** của việc chạm dữ liệu nhạy · viết cách giảm sáo rỗng không ai sở hữu

### 📤 Done khi 🎓
**Mọi việc chạm dữ liệu nhạy / bảo mật đều ở A+ + cổng fail-closed**; **có nhóm rủi ro do AI sinh**; mỗi rủi ro **có người sở hữu**.
🔧 Thêm: mọi rủi ro **L×I ≥ ngưỡng cao** có **mã quyết định** gắn vào *(chỉ số `c6`)* · **Bước 6 phải đóng TRƯỚC Bước 8** — xây việc A+ khi bảng dây cương còn trống thì cổng máy không bao giờ đòi cờ xác nhận.

### ⚠️ Bẫy 🎓
Quên rủi ro do AI sinh · đặt mức chờ duyệt rồi vẫn cho qua · **không ai sở hữu rủi ro**.

---

# Bước 7 — Điều kiện được phép bắt đầu viết mã (DoR)

**Mục tiêu** 🎓 Xác nhận đủ điều kiện vào xây cho **lát cắt dọc đầu tiên** — phân tầng theo mức tự hành. Đây là ***"cổng vào harness"***: chưa PASS thì không giao cho AI chạy tự hành.
**Artefact ra:** `Output/DOR.md`.

### 📥 Đọc gì trước khi mở
| File | Lấy nội dung gì |
|---|---|
| `Log/PHASE-GATE-LOG.ndjson` | Bản ghi **mới nhất** của Bước 1–6 — phải là `qua` |
| Toàn bộ artefact Bước 1–6 | Nội dung để trả lời 6 câu |
| `Output/DOR.md` | Checklist đã có, mục nào chưa đạt |

### 📥 Cổng vào riêng
🔧 **Toàn bộ Bước 1–6 đã đóng thật** (kiểm bằng bản ghi, không bằng trí nhớ) · **lát cắt dọc đã chọn**.

### 🤖 AI ở Bước này
- ✅ **Được:** viết checklist đạt / không đạt · tự đánh giá từng mục · nêu mục nào chưa đạt và vì sao
- ⛔ **Dừng hỏi:** lát cắt chạm vùng A+
- 🚫 **Không:** **xây khi còn mục chưa đạt** — kể cả việc ở mức an toàn · **nhảy cóc sang Bước 8** · chạy DoR **sau** khi mã đã viết xong *(ba câu bị bỏ qua kiểu đó đã gây ba lỗi thật)*

### 📤 Done khi 🎓
6 câu DoR **đạt toàn bộ**: đặc tả rõ · có mô hình dữ liệu · có giao ước API · tiêu chí chấp nhận đo được · mức phân quyền nào · **cổng kiểm là gì**. Lát cắt **đủ mỏng** để xong trong vài ngày.

### ⚠️ Bẫy 🎓
Xây khi đặc tả / dữ liệu / tiêu chí còn trống · **chọn lát cắt quá dày**.

---

# Bước 8 — Xây lát cắt dọc

**Mục tiêu** 🎓 Một luồng **chạy thật** xuyên hệ thống, demo được. **Bằng chứng số 1** của cả dự án.
**Artefact ra:** mã trong `App/` + `Output/DEVBOOK.md` + `Log/PROOF-LOG.ndjson`.

### 📥 Đọc gì trước khi mở
| File | Lấy nội dung gì |
|---|---|
| 🔑 `Output/RTM.md` — dòng của story đang xây + khối **RÀNG BUỘC THEO BƯỚC** | Ràng buộc ghi từ Bước trước cho Bước 8 |
| `Output/DOR.md` *(đạt)* | Xác nhận đủ điều kiện vào |
| `PHASEGATE.md §6` | Cách lấy bằng chứng chạy thật — **năm loại** |
| `Output/SPEC.md` — AC của story | Điều kiện phải thoả, để không xây lệch |
| `Output/ARCH.md` · `Instructions/LEASH-BANG.json` | Ranh giới thiết kế · mức dây cương của từng lát cắt |
| Mã nguồn liên quan trong `App/` | Trạng thái hiện tại trước khi sửa |

### 📥 Cổng vào riêng
🔧 **Đã đọc ràng buộc RTM cho Bước 8** · biết mức dây cương của từng lát cắt · nếu dự án có tri thức miền tính toán: **nguồn đối chứng độc lập đã sẵn** (`PHASEGATE.md §7`).

### 🤖 AI ở Bước này
- ✅ **Được:** sinh mã và ca kiểm thử trong phạm vi đã chốt · chạy lệnh · **tự vá lỗi của chính mình** · gọi Tester độc lập · trình kế hoạch (Plan mode) trước mỗi lát cắt
- ⛔ **Dừng hỏi:** phát ra ngoài / không hoàn lại (6) · cài gói bên thứ ba (7) · nguồn mâu thuẫn (1) · chạm vùng A+
- 🚫 **Không:** 🔧 **đánh dấu xong khi chưa có bằng chứng chạy thật** trong `PROOF-LOG.ndjson` · chạy tự do không trình kế hoạch · **chỉ có mã và test mà chưa nối đường vào giao diện thì không được đánh Bước 8 xong** cho lát cắt đó

### 📤 Done khi 🎓
**Chạy được suốt luồng, demo được**; Dev Book có **quyết định của Huynh** rút ra từ vòng review.
🔧 Thêm: bằng chứng gọi thật dán **nguyên văn** · mọi task `.BUILD.` có dòng bằng chứng · **Tester độc lập đã soi trước khi đóng** *(REVIEW-POLICY: mọi Round)*.

> 🔑 **Vì sao Dev Book ghi QUYẾT ĐỊNH, không ghi "AI sai — người sửa":** cơ chế *"chủ dự án tự đi tìm lỗi AI"* là cơ chế **rèn kỹ năng**, không phải cơ chế **làm sản phẩm**. Thay bằng **review 4 lớp → Huynh quyết → quyết định vào Dev Book**. Review thay được việc Huynh tự dò lỗi; **không thay được việc Huynh QUYẾT**. Dev Book trống = đóng dấu bừa = chưa đạt Bước.

### ⚠️ Bẫy 🎓
Để AI chạy tự do không kế hoạch, không cổng · duyệt bừa vì *"nhìn có vẻ đúng"* · **không ghi Dev Book ngay → tối viết bù = bịa**.

---

# Bước 9 — Kiểm thử & cổng

**Mục tiêu** 🎓 Chứng minh lát cắt **đúng**, không phải *"cảm giác đúng"*. **Không xác minh được = chặn.**
**Artefact ra:** `Output/SITUAT.md` + bộ ca trong `App/tests/`.

### 📥 Đọc gì trước khi mở
| File | Lấy nội dung gì |
|---|---|
| 🔑 `UT-RULES.md` · `IT-SIT-RULES.md` · `UAT-RULES.md` | **Cách viết ca theo 4 tầng** · exit criteria từng tầng |
| `Output/SPEC.md` | AC — **mỗi ca nghiệm thu = một AC** |
| `Output/SITUAT.md` | Bộ ca đã soạn · sổ lỗi đang mở · Integration Map |
| `Log/PROOF-LOG.ndjson` | Bằng chứng chạy thật của phần sắp kiểm |
| `Instructions/PHU-MOI-TRUONG.json` | Phép đo nào chạy **ở môi trường nào** |

### 📥 Cổng vào riêng
🔧 Mã Bước 8 đã đóng · **bộ ca soạn xong TRƯỚC khi chạy** · dữ liệu kiểm là dữ liệu giả có mã `TD-xx`.

### 🤖 AI ở Bước này
- ✅ **Được:** soạn bộ ca · chạy · báo đạt / không đạt từng ca · chỉ nguyên nhân và **đề xuất** cách sửa · chạy lượt UAT thứ nhất để **lọc lỗi rẻ**
- ⛔ **Dừng hỏi:** 🔑 **ca "gần đúng"** — AI **không được tự quyết cho qua**, giữ cổng **ĐÓNG** và trình Huynh (4) · ca không đạt thì **Huynh duyệt rồi mới sửa** · cần công cụ kiểm thử mới (7)
- 🚫 **Không:** 🔧 **tự tuyên bố đạt bằng chính bộ ca mình viết** khi chưa có lớp độc lập · **sửa ca cho xanh** · **giấu lỗi** · chỉ chạy đường thuận · **thêm ca sau khi biết kết quả** để đẩy tỷ lệ

### 📤 Done khi — tách đôi UAT và SIT

**UAT 🎓 — không có ngưỡng phần trăm**, ba điều kiện **nhị phân**: ① **mọi AC của lát cắt PHẢI ĐẠT** · ② có **ca nghịch và ca phân quyền theo vai** · ③ **lỗi còn lại được ghi nhận, không giấu**.
**Hai lượt UAT:** lượt 1 — **Tester độc lập** chạy để lọc lỗi rẻ, kết quả là **BÁO CÁO**; lượt 2 — **Huynh tự bấm thử**, kết quả là **PHÁN QUYẾT**. 🔒 *CULI không được tuyên bố UAT đạt — chỉ lượt Huynh mới là nghiệm thu.*

**SIT / IT 🔧** — bộ ca ghép nối do AI tự soạn, exit criteria ở `IT-SIT-RULES.md`. Ngưỡng % chỉ có nghĩa ở đây (số ca không phải cam kết với người dùng), kèm chốt: **ca soạn xong trước khi chạy**, không thêm ca sau khi biết kết quả.

🔧 **Trần chi phí** — N vòng *(dự án đặt, mặc định 9)*: một vòng = chạy hết bộ ca → ghi → sửa → chạy lại. Hết trần mà AC chưa đạt hết ⇒ **DỪNG**, báo Huynh kèm bảng ca chưa đạt và ba lựa chọn: thu hẹp phạm vi · chấp nhận nợ có ghi · làm lại. *Đây là trần chi phí, không phải ngưỡng chất lượng.*

🔧 **Cổng RA riêng:** `node Log/kiem-phu-moi-truong.cjs` — mỗi ô *(môi trường × tầng đo)* hoặc có tệp kiểm **có thật và đúng môi trường**, hoặc khai lý do ≥60 ký tự. *Một phép đo đúng, chạy nhầm môi trường, vẫn là không đo — mà nó làm mọi con số đẹp lên.*

### ⚠️ Bẫy 🎓
Chỉ chạy đường thuận · bỏ ca nghịch và phân quyền · ***"gần đúng nên cho qua"*** · 🔧 tỷ lệ đạt là chỉ số **dễ lách nhất** — thêm ca dễ là mẫu số tăng.

---

# Bước 10 — Truy vết, số đo, báo cáo

**Mục tiêu** 🎓 Truy vết story → mã → ca kiểm; đo bằng dữ liệu; báo cáo ra quyết định được.
**Artefact ra:** `Output/RTM.md` · `TELEMETRY.md` · `WEEKLY.md`.

### 📥 Đọc gì trước khi mở
| File | Lấy nội dung gì |
|---|---|
| `Output/RTM.md` | Dòng nào còn mồ côi |
| `Output/TELEMETRY.md` · `Log/HOOK-EVENTS.ndjson` | Giờ thật · token đã đối soát |
| `DOC-HEALTH-RULES.md` | 7 chỉ số sức khoẻ tài liệu |
| 🔑 `Output/DEVBOOK.md` | Các ca đã ghi — để **chưng cất thành bài học** |
| `Instructions/PHAM-VI-MVP.json` | Mục tiêu nào đã giao, mục nào chưa — **đối chiếu với thứ Huynh yêu cầu**, không chỉ thứ đã khai |

### 📥 Cổng vào riêng
🔧 Bước 9 đã đóng · telemetry của mọi Bước đã đủ.

### 🤖 AI ở Bước này
- ✅ **Được:** cập nhật bảng truy vết · chạy các phép soát (`rtm-check` · `doc-health` · `kiem-backlog` · `kiem-pham-vi`) · gom số **từ nguồn máy** · viết báo cáo tuần **bản nháp**
- ⛔ **Dừng hỏi:** cần bằng chứng **ngoài kho mã** (2) · đặt ngưỡng cho 7 chỉ số (4)
- 🚫 **Không:** **bịa số** · suy giờ từ token · **công bố chỉ số mà mẫu số sai lệch** · **viết hộ Huynh phần phán xét** trong Dev Book · sửa RTM cho chỉ số đẹp lên

### 📤 Done khi 🎓
Bảng truy vết **phủ hết story MVP**, không còn dòng mồ côi · số liệu là **giờ người thật**, không lấy token thay.
🔧 Thêm: số không đo được thì **ghi rõ là không đo được** · báo cáo tuần có **ít nhất một quyết định** · 🔑 **đã chưng cất Dev Book**: mỗi bài học phải thành **luật trong `CLAUDE.md`** hoặc **phép kiểm chạy được** — không chưng cất thì nó nằm chết · `kiem-pham-vi.cjs` cho thấy mục tiêu nào chưa giao **và có chữ ký Huynh cho phần hoãn**.

### ⚠️ Bẫy 🎓
Để AI bịa số · đo token thay vì giờ thật · bảng truy vết bỏ sót story · 🔧 cổng xanh mà thiếu mục tiêu Huynh nêu.

---

## 3. Sau Bước 10 — đẩy lên môi trường có người dùng thật

Đây là **điều dừng 6** có thêm cổng máy. Luật: **duyệt xong UAT (ít nhất đóng được Bước 9) mới đẩy production**, trừ ngoại lệ Huynh ký.

| Cưỡng chế | Nội dung |
|---|---|
| `Log/cong-uat-truoc-prod.cjs` | Đọc `PHASE-GATE-LOG.ndjson` + `khai-round/` → **CHẶN** nếu Bước 9 chưa đóng. Khai `ke-thua` mà không Round nào từng đóng Bước 9 cũng chặn — *kế thừa một thứ chưa từng tồn tại* |
| `Log/day-len-may-chu.sh` chặng 1 | Cổng tài liệu + cổng phạm vi `--truoc-prod` + cổng phủ môi trường + cổng UAT→Prod, **mỗi cổng là `if/else` tường minh** *(khuôn `cmd && echo ✅` là cổng giả — `set -e` không kích hoạt trong AND-list)* |
| Đường ngoại lệ | `--ngoai-le "<lý do ≥25 ký tự>" --huynh-xac-nhan <hôm nay>` — ghi vết `NGOAI-LE-PRODUCTION.ndjson`. ⛔ AI không tự cắm; xác nhận ngày cũ không dùng lại |
| Khói sau đẩy | Phép kiểm **chỉ đọc** trên production chạy tự động sau mỗi lần đẩy. Phép **ghi** vào CSDL thật không nằm trong bộ test tự động |

---

## 4. Nhật ký thay đổi Playbook

| Ngày | Thay đổi |
|---|---|
| 2026-10-16 | Đóng gói từ dự án gốc thành bản dùng lại: bỏ phần riêng dự án, giữ 11 Bước + cổng vào/ra + cơ chế máy, thêm cột review theo Round và mã truy vết sinh ra ở từng Bước |
