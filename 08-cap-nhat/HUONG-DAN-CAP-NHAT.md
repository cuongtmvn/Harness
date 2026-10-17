# HƯỚNG DẪN CẬP NHẬT — cho phiên AI ở dự án khác, máy khác, hoặc ngay tại kho Harness

> Đọc tệp này khi: (a) hook mở phiên báo *"Harness có bản mới"*; (b) Huynh bảo *"đưa vào harness"* / *"cập nhật harness"*; (c) phiên mở trong chính kho `Harness` và cần sửa kho. Luật đầy đủ ở hai skill `05-hook-skill/skills/cap-nhat-harness` và `dua-vao-harness`; tệp này là bản đồ ngắn.

## 1. Ba thứ luôn phải biết

| Thứ | Ở đâu | Lệnh xem |
|---|---|---|
| Bản harness mới nhất | `VERSION` ở kho · GitHub `cuongtmvn/Harness` nhánh `main` | `cat <Harness>/VERSION` |
| Bản dự án đang dùng | `<dự án>/.harness-manifest.json › harnessVersion` | `node -p "require('./.harness-manifest.json').harnessVersion"` |
| Gì đổi giữa hai bản | `CHANGELOG.md` ở kho, mục mới trên cùng | đọc từ bản đang dùng tới bản mới |

Kho ở đâu trên máy này: `.harness-manifest.json › harnessPath`. Không có ổ (phiên điện thoại, máy ảo) ⇒ `git clone https://github.com/cuongtmvn/Harness.git` vào thư mục tạm; mọi lệnh `<Harness>/…` dùng đường dẫn đó.

## 2. Hai chiều, hai câu lệnh

```
   dự án  ──"đưa vào harness"──▶  kho Harness  ──đẩy GitHub kèm ghi chú──▶  GitHub
   dự án  ◀──"cập nhật harness"──  kho Harness  ◀──git pull──────────────  GitHub
                 ▲
     hook SessionStart nhắc khi VERSION kho > bản dự án (chỉ nhắc)
```

| Chiều | Skill | Công cụ | Kết quả phải có |
|---|---|---|---|
| Dự án → harness | `dua-vao-harness` | `git pull --ff-only` · cài thử `cai-dat.cjs` vào thư mục trống · `kiem-harness.cjs` | `VERSION` tăng · mục mới trong `CHANGELOG.md` · commit theo khuôn `harness <bản>: …` đã lên `origin/main` · Dev Book dự án gốc ghi vết |
| Harness → dự án | `cap-nhat-harness` | `node <Harness>/08-cap-nhat/cap-nhat.cjs <dự án>` rồi `--ap-dung` | bảng kê lên bản mới · `kiem-harness` xanh · không tệp xung đột nào bị ghi đè · Dev Book ghi vết · `DU-AN-DANG-KY.json` đổi `banDangDung` |

## 3. Dự án chưa có bảng kê (cài tay, bản 1.0.0)

```bash
node <Harness>/08-cap-nhat/cap-nhat.cjs <dự án> --dang-ky   # dựng .harness-manifest.json, không ghi đè gì
node <Harness>/08-cap-nhat/cap-nhat.cjs <dự án>             # xem trước, chưa ghi (dry run): gì sẽ đổi
node <Harness>/08-cap-nhat/cap-nhat.cjs <dự án> --ap-dung   # sau khi Huynh gật
```
Tệp dự án **khác** harness được ghi nhận là *bản riêng*: về sau harness đổi tệp đó thì công cụ báo xung đột, không ghi đè. Commit `.harness-manifest.json` vào dự án.

## 4. Bốn điều không được làm, dù ai bảo

1. **Không ghi đè tệp dự án đã tự sửa** — xung đột thì trình diff, Huynh gộp.
2. **Không đẩy kho Harness mà thiếu `VERSION` tăng + mục `CHANGELOG.md`** — commit không có ghi chú là commit không tra cứu được.
3. **Không sửa luật quản AI trong kho** (dây cương, 7 điều dừng, cổng, `reviewPolicy`, hook) mà không khai *"CULI được lợi nếu nới"* và chờ Huynh — điều dừng 5.
4. **Không cập nhật giữa một Bước đang dở** của dự án — chờ đóng Bước hoặc Huynh cho phép.

## 5. Lớp của một bài học — quyết trước khi viết

| Lớp | Nghĩa | Đặt ở |
|---|---|---|
| **Lõi chung** | mọi dự án, mọi loại | `00`–`07` |
| **Gói `<loại>`** | chỉ dự án cùng loại (`web`, `desktop-tauri`, `mobile`…) | `09-goi/<loại>/` (tạo khi có bài học đầu) |
| **Riêng** | chỉ đúng cho một dự án | ở lại dự án, ⛔ không đưa |

Không trả lời được *"chặn lỗi gì / tiết kiệm gì"* thì không đưa. Mặc định là **gói**, không mặc định lõi.
