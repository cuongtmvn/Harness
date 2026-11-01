# ARCH — Kiến trúc (<TÊN DỰ ÁN>)

> Artefact **Bước 3**. *Done khi:* người viết mã đọc là **bắt tay dựng được**; mô hình dữ liệu và giao ước API **khớp story**; **mọi trường mới đã gắn độ nhạy**; mọi thay đổi kiến trúc có mã `D-ARCH-n` (chỉ số c6 đếm dòng `**D-ARCH-n**`).
> ⛔ Trường chạm dữ liệu cá nhân ⇒ **A+**, dừng hỏi **trước khi** tạo/sửa lược đồ. Di trú trên CSDL người thật: **gộp một đợt**, sao lưu trước.

## 1. Quyết định kiến trúc — gán mã NGAY LÚC QUYẾT
- **D-ARCH-1** — <quyết định>. *Vì sao / đánh đổi:* <…>. *Thay thế đã bỏ:* <…>.
- **D-ARCH-2** — <…>

## 2. Nguyên tắc kiến trúc (3–5 gạch đầu dòng)
- <…>

## 3. Sơ đồ thành phần
```
<web/mobile> → <API> → <dịch vụ> → <CSDL> ; <hệ ngoài: …>
```

## 4. Mô hình dữ liệu — độ nhạy gắn vào TỪNG trường
| Bảng | Trường | Kiểu | Độ nhạy *(Public / Internal / Confidential / Personal)* | Ghi chú (unique, FK, xoá mềm…) |
|---|---|---|---|---|

## 5. Giao ước API
| Endpoint | Vào | Ra | Mã lỗi | Vai được gọi | Story |
|---|---|---|---|---|---|

## 6. Nền tảng kỹ thuật — kèm lý do, đánh dấu chưa chốt
| Thành phần | Chọn | Vì sao (theo ràng buộc, không theo quen tay) | Chưa chốt? |
|---|---|---|---|

## 7. Mô hình phân quyền — map tới bảng vai × tình huống của SPEC
| Vai | Tầng dữ liệu được chạm | Cơ chế chặn mặc định (fail-closed) |
|---|---|---|

## 8. Phần chưa chốt
| Điểm | Vì sao chưa | Mã CHO-QUYET |
|---|---|---|
