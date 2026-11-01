---
name: bao-cao-html
description: Dựng báo cáo / tài liệu HTML tương tác theo một chuẩn chung (sáng-tối, VI/EN/VI+EN, thuật ngữ có giải thích, hình-bảng đánh số, sitemap bên trái, sơ đồ SVG bấm được). Dùng khi người dùng nhờ "báo cáo html", "tài liệu html tương tác", "dashboard page", "interactive HTML report", "trang mô tả có sơ đồ", hoặc sửa một trang HTML như vậy.
---

# bao-cao-html — báo cáo HTML tương tác theo một chuẩn

## Khi nào dùng
- Người dùng cần một trang HTML tự chứa để đọc, trình bày, hoặc giao cho người khác xem.
- Trang có sơ đồ, bảng, thuật ngữ cần giải thích, hoặc cần hai ngôn ngữ.
- Sửa / mở rộng một trang cũ đã theo chuẩn này.

Không dùng cho slide, tài liệu Word / PDF, hay trang chỉ có một đoạn chữ.

## Bắt đầu từ khung mẫu
1. Chép `khung-mau.html` (cùng thư mục với tệp này) sang chỗ đầu ra của dự án, đổi tên theo nội dung.
2. Chỉ sửa ba khối: `C` (nội dung, mỗi chuỗi là cặp `[vi, en]`), `G` (từ điển thuật ngữ), và các `<section>` trong `<main>`.
3. Giữ nguyên bộ máy: `render()`, `linkify()`, tooltip, popup, sitemap, `drawDiagram()`.
4. Thêm mục = thêm `<section id="sN">` có `<h2 data-k="sN">`, thêm khoá `sN` vào `C`, thêm `sN` vào mảng `NAV`.
5. Thêm hình / bảng = thêm phần tử có `data-kind="fig"` hoặc `"tab"` và `data-k`. Số do `render()` tự gán theo mục.
6. Thêm thuật ngữ = thêm một mục vào `G`. Mục dài hơn `LONG_AT` ký tự tự thành loại bấm-mở-popup.
7. Màu: chỉ dùng biến `:root`. Không viết mã màu cứng trong phần tử.

## Danh mục chuẩn (kiểm từng điều trước khi giao)
1. **Giao diện.** Màu chính xanh navy (`#0B2545`), nhấn `#0070C0`. Sáng + tối bằng biến CSS trên `:root` (có `@media prefers-color-scheme` và `[data-theme]`), có nút đổi giao diện. `body` có nền tường minh. Màn hình điện thoại: lề 16px, không cuộn ngang cả trang; bảng rộng cuộn trong khung riêng, cột đầu dính (`position:sticky`).
2. **Giải thích thuật ngữ.** Rê chuột vào thuật ngữ: giải thích NGẮN hiện thành tooltip. Giải thích DÀI: con trỏ thành `help` (dấu hỏi), bấm mở popup đủ nội dung. Thuật ngữ tô màu như liên kết, KHÔNG gạch chân, đổi màu khi rê. Một đối tượng `G` điều khiển cả hai (mỗi mục: `tv` `bv` `te` `be` `al`), `linkify()` tự bọc thuật ngữ trong văn bản, bỏ qua tiêu đề, nút, `code`, chữ trong SVG.
3. **Song ngữ.** Ba nút VI / EN / VI+EN. Bấm EN phải ra TOÀN BỘ tiếng Anh: văn bản, tiêu đề cột bảng, chú thích, nhãn SVG, popup, sitemap. VI+EN hiện cả hai. Nội dung lưu dạng cặp `[vi, en]`, không viết cứng chữ vào HTML.
4. **Đánh số.** Mọi hình và bảng có chú thích đánh số theo mục: Hình 3.1 / Figure 3.1, Bảng 3.1 / Table 3.1. Không đánh số tay; để `render()` gán.
5. **Sitemap trái.** Làm nổi mục đang đọc khi cuộn. Tiêu đề mục dạng "N. Tên mục". Nhóm thu gọn được. Căn lề trái đồng nhất, không thụt sâu.
6. **Phần tử bấm được.** Khối sơ đồ / dòng bảng bấm mở popup chi tiết. Phần tử đã bấm giữ nổi bật (`.sel`) suốt lúc popup mở. Popup đóng bằng Esc hoặc bấm ra ngoài; đổi ngôn ngữ khi popup mở thì popup đổi theo.
7. **SVG nội tuyến.** (a) Không gán class HTML có `font-size` cho `<text>`; đặt cỡ chữ bằng thuộc tính `font-size`. (b) Ước chiều rộng chữ khoảng 6.2px / ký tự ở cỡ 10.5 và tự xuống dòng trong khối. (c) Không để hai nhãn cùng `y` trong một cột; xếp chồng khối theo chiều cao đã tính. (d) Chữ không tràn khối. (e) Dùng hết bề rộng (`viewBox` rộng, `width:100%`), không để khoảng trống lớn bên phải.
8. **Văn phong.** Viết cho người đọc ngang hàng: không dùng đại từ xưng hô cá nhân (anh / em / huynh / đệ / ta); gọi vai là "chủ dự án", "AI thực thi". Giọng sản phẩm hoàn chỉnh: không "bản nháp", "TODO", "tạo bởi". Hạn chế tên tệp; mô tả nội dung thay cho tên. Bài học rút ra thay cho danh sách cảnh báo hù doạ. Tên menu / nhãn nút dùng tiếng Anh.
9. **Kiểm trước khi giao.** Xem mục dưới.

## Kiểm trước khi giao
1. Cú pháp: tách từng thẻ `<script>` ra tệp tạm rồi `node --check <tệp>`.
2. Mở trang bằng trình duyệt (Chrome / Edge, thường hoặc headless). Console không có lỗi.
3. Bấm EN: đọc `document.body.innerText`, không còn tiếng Việt (trừ danh từ riêng, lệnh). Bấm VI+EN: thấy cả hai.
4. Bấm thử mọi phần tử bấm được (khối sơ đồ, dòng bảng, thuật ngữ dài); Esc đóng; phần tử được chọn giữ nổi bật khi popup mở.
5. Thu cửa sổ về ~400px: không cuộn ngang cả trang (`document.documentElement.scrollWidth <= innerWidth`).
6. Chạy đoạn kiểm tràn chữ SVG (dán vào console, hoặc nhúng vào bản thử). Đổi sang EN và VI+EN rồi chạy lại, vì chữ dài ra:

```js
[...document.querySelectorAll('svg g')].filter(g => g.querySelector('rect') && g.querySelector('text')).forEach(g => {
  const r = g.querySelector('rect').getBBox(), t = g.querySelector('text').getBBox();
  if (t.x < r.x || t.y < r.y || t.x + t.width > r.x + r.width || t.y + t.height > r.y + r.height)
    console.warn('SVG text overflow:', g.textContent.trim().slice(0, 60));
});
```

Ghi kết quả kiểm vào báo cáo giao việc; không giao khi còn một cảnh báo.

## Bẫy hay gặp
- Gán `font-size` qua class CSS chung (ví dụ `.small`) cho `<text>` trong SVG: chữ đổi cỡ, tràn khối. Dùng thuộc tính.
- Quên đổi nhãn SVG khi đổi ngôn ngữ: sơ đồ vẫn tiếng Việt khi bấm EN. Vẽ lại SVG trong `render()`.
- Viết chữ cứng trong HTML thay vì `C`: EN còn sót tiếng Việt.
- Tiêu đề cột bảng không nằm trong `C`: thường bị bỏ sót nhất.
- Đánh số hình / bảng bằng tay: lệch khi thêm mục giữa chừng.
- Thuật ngữ nằm trong tiêu đề hoặc nút: `linkify()` bỏ qua có chủ ý, đừng ép.
- Bảng đặt trực tiếp trong `<main>` không có khung cuộn: cả trang tràn ngang trên điện thoại.
- Dòng bảng chọn rồi mà nổi bật mất khi popup mở: không xoá `.sel` trước khi popup đóng.
- Hai nhãn SVG cùng `y` trong một cột: chữ chồng nhau. Tính `y` từ chiều cao khối trước đó.
- Tải thư viện JS ngoài: khung chỉ dùng phông ngoài tuỳ chọn; trang phải chạy khi ngoại tuyến.
- Lệnh `Edit` thay chuỗi trong tệp lớn lặp lại nhiều chỗ: kiểm duy nhất trước khi thay.
