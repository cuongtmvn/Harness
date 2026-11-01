# Gói `desktop` — bài học riêng cho app cài trên máy Windows (mọi khung: Tauri, Electron, .NET…)

> Áp cho dự án có `harness.config.json › duAn.goi` chứa `"desktop"`. Bộ cài chép thư mục này vào `Instructions/goi/desktop/`. Nguồn: Mười Ngón, 16/10/2026.

## 1. App có mạng LAN: hộp hỏi tường lửa bị Cancel ⇒ Windows tạo luật CHẶN

**Hiện tượng:** hai máy cùng mạng không tìm thấy nhau; nhập IP thì *"connection timeout"*; **ping vẫn thông**.
**Nguyên nhân:** lần đầu app mở cổng, Windows hỏi tường lửa; hộp đó bị Cancel / đóng ⇒ Windows tự tạo luật **Block** mọi kết nối vào `<app>.exe` (cả Private lẫn Public). Ping là ICMP, không qua cổng app, nên không chứng minh gì.
**Luật:** *ping thông không chứng minh cổng mở*; phép kiểm mạng phải bắn đúng cổng (UDP tìm, TCP nối) từ máy thứ hai.
**Cách sửa:** script `mo-tuong-lua.mau.ps1` cạnh tệp này — xoá luật Block của app, cho phép đúng các cổng app dùng, **chỉ mạng Private**, tự xin quyền quản trị (UAC). ⛔ Không mở cho mạng Công cộng. Chép script kèm bản cài; app khi timeout thì gợi ý chạy script.
**AI không tự vượt UAC** — hộp UAC là của người; AI mở hộp rồi chờ, không tìm cách lách.

## 2. UAT của app desktop = bản cài thật
- "UAT" là **cài bản `.exe` lên máy thật và bấm thử**, không phải chạy `npm run dev`. Tester ghi rõ bản cài nào (`YYYYMMDD-HHMM`).
- Kiểm ở đúng cỡ màn hình người dùng (liệt kê trong SPEC/NFR), đo tràn/cuộn bằng số px, không bằng mắt.
