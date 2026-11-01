# REVIEW-POLICY — Bước nào cần kiểm duyệt độc lập, ở Round nào

> **Đọc khi nào:** lúc khai mục `R3` của cổng RA, và khi mở một Round mới (để biết Round này Bước nào được phép *tự soi*).
> **Nguồn sự thật cho máy:** `harness.config.json › reviewPolicy`. File này giải thích **vì sao** và **khai thế nào**. Đổi chính sách = **điều dừng 5** (AI khai xung đột lợi ích, Huynh duyệt).
> **Nguyên văn yêu cầu sinh ra chính sách này:** *"Bước quan trọng cần yếu tố kiểm duyệt có thể là round đầu cho thiết kế (ví dụ vậy) còn các round sau thì không cần."*

---

## 1. Hai mức review — khác nhau về chất

| Mức | `R3.lopReview` | Ai làm | Bằng chứng tối thiểu |
|---|---|---|---|
| **Tự soi** | `tu-soi` | CULI tự đối chiếu checklist RA + review chéo 4 lăng kính *(Requirement · Test · Nghiệm thu · Kiến trúc)* | `canCu` nêu đã soi gì, thấy gì |
| **Độc lập** | `doc-lap` | **Tester độc lập** (subagent không thấy hội thoại) **hoặc Huynh** đọc với nhiệm vụ **đi tìm chỗ sai** | `nguoiReview` · `phatHien[]` (từng phát hiện, kể cả 0 — khi 0 thì ghi *"0 phát hiện"* và nói đã soi gì) · `quyetDinh` = **nguyên văn Huynh** quyết sau khi đọc phát hiện |

🔑 *"Đã review" mà không tìm ra gì không phải bằng chứng review — nó là bằng chứng đã mở file ra.* Nên `phatHien` phải là mảng, và một mảng rỗng phải đi kèm lời khai đã soi những gì.

---

## 2. Chính sách mặc định theo Bước

| Bước | Chính sách | Vì sao |
|---|---|---|
| **0** Phạm vi | `moi-round` | Phạm vi là của Huynh — mỗi Round Huynh **tự chốt** làm gì / bỏ gì. Không có Round nào "kế thừa phạm vi" mà không ai nhìn |
| **1** SRS | `round-dau` | Story / AC / NFR là **đầu vào của mọi kiểm thử**; sai ở đây thì mọi tầng dưới đo thứ sai. Round sau thường chỉ **thêm** story — lớp kiểm ngoài vẫn áp cho story mới qua Bước 9 |
| **2** Module map | `round-dau` | Phân tầng nền / bề mặt sai thì xây lại. Round sau phần lớn kế thừa |
| **3** Kiến trúc | `round-dau` | Quyết định kiến trúc + độ nhạy dữ liệu — **đây là ví dụ Huynh nêu**. Round sau chỉ cần độc lập khi có **thay đổi lược đồ / mô hình phân quyền** — khi đó chính `V4`/`V6` phải ghi ra và `lopReview` tự nâng lên `doc-lap` |
| **4** WBS | `khong` | Chẻ việc là việc kỹ thuật, cổng máy `(a)` và checklist sót kinh điển gác đủ |
| **5** Ước lượng | `khong` | Con số có giả định là đủ; Huynh quyết khi vượt quỹ (điều dừng 4) |
| **6** Rủi ro + dây cương | `round-dau` | Bảng dây cương là **luật quản AI** — AI có xung đột lợi ích khi tự xếp mức |
| **7** DoR | `round-dau` | Cổng vào harness; Round sau chủ yếu kế thừa lát cắt đã chọn |
| **8** Build | `moi-round` | Mã mới ở mọi Round. Ca thật: cổng xanh 10/10, Tester bác 5 khẳng định, cả 5 đều đúng |
| **9** Test & Gate | `moi-round` | Lượt UAT 1 là Tester, lượt 2 là Huynh — không Round nào được bỏ |
| **10** Truy vết | `khong` | Toàn bộ đã là phép đo máy (`rtm-check`, `doc-health`, `kiem-pham-vi`); phần người là Huynh đọc báo cáo tuần |

---

## 3. Cổng máy thi hành thế nào — điều kiện `(l)`

```
yêuCầu = reviewPolicy.buoc[<n>] ?? reviewPolicy.macDinh
round   = --round đang đóng (không có ⇒ R1)

yêuCầu == 'moi-round'            ⇒ R3 PHẢI là doc-lap
yêuCầu == 'round-dau' && round==R1 ⇒ R3 PHẢI là doc-lap
yêuCầu == 'round-dau' && round>R1  ⇒ tu-soi được, TRỪ KHI bản khai V4/V6 có cờ `doiThietKe: true` ⇒ doc-lap
yêuCầu == 'khong'                ⇒ tu-soi được
```

Khi phải là `doc-lap`, máy kiểm: `R3.lopReview === "doc-lap"` · `nguoiReview` không rỗng · `phatHien` là mảng · `quyetDinh` ≥ 20 ký tự. ⚠️ Máy **không** đọc được chất lượng phát hiện — nó chỉ đóng cửa *"khai `doc-lap` cho có"*.

---

## 4. Khai mục `R3` — mẫu

```json
"R3": {
  "dat": true,
  "lopReview": "doc-lap",
  "nguoiReview": "Tester Senior (subagent, chỉ nhận SPEC.md + ARCH.md)",
  "phatHien": [
    "AC4 của US-07 có hai nhánh 'hoặc' ⇒ người viết test không biết chờ cái nào",
    "Bảng vai × tình huống thiếu vai 'kế toán'"
  ],
  "quyetDinh": "Huynh: 'tách AC4 thành hai AC; vai kế toán để Round sau, ghi backlog PB-014'",
  "canCu": "Review 3 lớp: tự soi checklist RA → review chéo 4 lăng kính → Tester độc lập. Quyết định đã vào DEVBOOK.md dòng 12."
}
```

Round sau, Bước chính sách `round-dau`:
```json
"R3": { "dat": true, "lopReview": "tu-soi", "canCu": "Round R2 không đổi lược đồ hay phân quyền (V4 doiThietKe:false). Tự soi 4 lăng kính; 0 phát hiện; đã đối chiếu từng AC mới với bảng vai." }
```

---

## 5. Hai chỗ dễ hiểu sai

1. **`khong` không có nghĩa là không ai nhìn.** Cổng máy (13 điều kiện) và "Done khi" vẫn áp đủ. Nó chỉ nói: *không bắt buộc một con mắt khác*.
2. **`tu-soi` ở Round sau không phải lối thoát.** Hễ Round sau **chạm lại thứ khiến Bước đó quan trọng** (lược đồ, phân quyền, phạm vi, dây cương) thì `V4.doiThietKe: true` và review trở lại `doc-lap`. AI tự quyết *"không đổi thiết kế"* để né review là **điều dừng 5**.
