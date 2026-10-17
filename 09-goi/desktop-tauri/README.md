# Gói `desktop-tauri` — bài học riêng cho app desktop dựng bằng Tauri (webview + Rust)

> Áp cho dự án có `harness.config.json › duAn.goi` chứa `"desktop-tauri"`. Bộ cài chép thư mục này vào `Instructions/goi/desktop-tauri/`. Gói này **đọc kèm gói `desktop`** (tường lửa, bản cài). Nguồn: Mười Ngón, 16–17/10/2026.

## 1. CSP của Tauri chèn nonce ⇒ `style="…"` trong HTML bị chặn

**Hiện tượng:** bản cài thật hiện sai bố cục (ví dụ 87 phím chồng một chỗ) trong khi mọi kịch bản trình duyệt và Tester đều xanh.
**Nguyên nhân:** Tauri tự chèn `nonce` vào `Content-Security-Policy`. Có nonce thì trình duyệt **bỏ qua `'unsafe-inline'`** ⇒ mọi `style="--x:…"` viết thẳng trong HTML bị chặn. Chromium mở `file://` không có CSP này nên không bắt được.
**Cách sửa đã dùng (hai lớp):**
1. `tauri.conf.json`: `"dangerousDisableAssetCspModification": ["style-src"]` — chỉ nới `style-src`, `script-src` vẫn có nonce.
2. Mã: áp lại style bằng **CSSOM** (`el.style.setProperty`) sau mỗi lần vẽ + `MutationObserver`; CSSOM không bị CSP chặn.
**Phép kiểm bắt buộc trước khi đóng Bước 9:** kịch bản dựng lại đúng CSP có nonce (`csp-tauri.mau.py` cạnh tệp này: chép `dist/`, gắn meta CSP có nonce và nonce cho `<style>`, mở bằng Chromium, kiểm các phần tử đáng ra phải hiện). Ghi môi trường của phép đo là *"Chromium giả lập CSP Tauri"*, **không** ghi là "app thật".
**Luật chung rút ra** (đã vào lõi, `RUNBOOK.md §8`): kiểm trong điều kiện chạy thật.

## 2. Đóng gói và cài đè
- Tắt app đang chạy trước khi cài đè; ghi số bản cài (`YYYYMMDD-HHMM`) vào `NEXT.md` / Dev Book để biết máy đang chạy bản nào.
- Bản cài phát cho máy khác kèm script tường lửa (gói `desktop`).

## 3. Cấu hình harness cho dự án Tauri (mẫu)
```json
"maCode": { "duoi": ["ts","tsx","js","mjs","html","css","rs"], "boQua": ["node_modules/","App/web/dist/","src-tauri/target/","target/",".git/"] },
"route":  { "thuMuc": "App/web", "khuon": "(?!x)x" },
"csdlThat": { "khuon": [], "khuonProd": "", "kichBanNguy": "", "thuMucSaoLuu": "", "khuonSaoLuu": "", "hanSaoLuuPhut": 120 },
"moiTruong": { "uat": { "ten": "UAT", "diaChi": "bản cài thật trên máy phát triển", "dauHieu": "csp-tauri|tauri|ban-cai" },
               "production": { "ten": "PRODUCTION", "diaChi": "bản cài .exe phát cho người dùng", "dauHieu": "ban-cai|20\\d{6}-\\d{4}" } }
```
Không có đường HTTP ⇒ `kiem-pham-vi.cjs` xác minh `xong` bằng **tệp kiểm trên đĩa**, không bằng route.
