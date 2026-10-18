---
name: dua-vao-harness
description: Đưa một bài học / luật / công cụ từ ProjectHarness của dự án đang làm vào GlobalHarness (kho dùng chung) — chỉ cơ chế điều hành AI theo pipeline, không đưa nguồn dữ liệu hay nội dung miền — viết lại cho chung, gắn lớp (lõi chung / gói theo loại / riêng), cài thử vào dự án trống, tăng VERSION, ghi CHANGELOG, commit và đẩy GitHub kèm ghi chú. Dùng khi chủ dự án NÓI RÕ "cập nhật GlobalHarness" (câu cũ: "đưa vào harness"). KHÔNG dùng khi chủ dự án chỉ nói "cập nhật harness" — câu đó mặc định là tầng ProjectHarness (skill cap-nhat-harness / sửa harness dự án).
---

# Đưa vào GlobalHarness — 7 bước, bước nào đỏ thì DỪNG

> Câu kích hoạt: **"cập nhật GlobalHarness"** (câu cũ *"đưa vào harness"*), kèm điều gì. Chính câu đó là sự duyệt của Huynh cho **nội dung và cho việc commit + đẩy GitHub kho chung**; các chốt dưới đây thì không câu nào gỡ được. ⛔ Huynh chỉ nói *"cập nhật harness"* ⇒ **không** chạy skill này — đó là tầng ProjectHarness; nếu thấy điều chỉnh nên dùng chung thì **đề xuất** và chờ câu *"cập nhật GlobalHarness"*.
> **GlobalHarness** = kho dùng chung; **ProjectHarness** = bản cài trong dự án đang làm. Skill này đi một chiều ProjectHarness → GlobalHarness.
> Cơ chế 1: bài học mới chỉ nằm trong ProjectHarness của từng dự án; luật quản AI là của Huynh (điều dừng 5) nên lệnh của Huynh = sự duyệt.
> Kho: `D:\OneDrive\AI\Harness` (PC) · `https://github.com/cuongtmvn/Harness.git` (mọi nơi). Đường dẫn ghi ở `.harness-manifest.json › harnessPath` của dự án.

## Bước 1 — ĐỒNG BỘ KHO (chặn rủi ro hai dự án cùng sửa)

```bash
cd <harnessPath> && git status --short && git pull --ff-only
```
🛑 `git status` có tệp dở của phiên khác, hoặc `pull --ff-only` không fast-forward được ⇒ **DỪNG**, báo Huynh; không merge, không stash hộ.
Không có ổ ⇒ `git clone https://github.com/cuongtmvn/Harness.git` vào thư mục tạm và làm ở đó.

## Bước 2 — VIẾT LẠI CHO CHUNG + BẰNG CHỨNG

Trả lời **bằng chữ, trước khi sửa tệp**:
| Câu | Không trả lời được ⇒ |
|---|---|
| Bài học này **chặn lỗi gì / tiết kiệm gì**? | ⛔ không đưa (chặn GlobalHarness phình to) |
| Đây có phải **cơ chế điều hành AI theo pipeline** (Bước, cổng, truy vết, review, dây cương, đo lường, chọn model)? Hay là **nguồn dữ liệu / cách thu thập (web, trình duyệt, API) / nội dung miền nghiệp vụ**? | Loại sau ⇒ lớp **riêng**, ⛔ không đưa — ở lại ProjectHarness (Huynh chốt 18/10/2026) |
| **Bằng chứng**: dòng Dev Book / sự cố nào ở dự án gốc? | ghi vào CHANGELOG, không có thì ghi "chưa có ca thật" |
| **Lớp**: *lõi chung* (mọi dự án) · *gói `<loại>`* (`web`, `desktop-tauri`, `mobile`…) · *riêng* (ở lại dự án, ⛔ không đưa) | mặc định **gói**, không mặc định lõi |
| **Bắt buộc** hay **khuyến nghị** với dự án nhận? | mặc định khuyến nghị |
| Chạm **luật quản AI** (dây cương · 7 điều dừng · cổng · reviewPolicy · hook)? | khai *"CULI được lợi nếu nới"* và chờ Huynh xác nhận riêng |

Bỏ mọi chi tiết riêng dự án (đường dẫn, tên bảng, cổng, tên miền) — thay bằng khoá trong `harness.config.json` nếu cần tham số.

## Bước 3 — SỬA KHO THEO ĐÚNG CHỖ

| Loại | Đặt ở | Lưu ý |
|---|---|---|
| Luật / nguyên tắc | `00-nguyen-tac/` · `01-playbook/` · `03-kiem-thu/` | Sửa tệp luật = **Edit từng khối**, ⛔ không ghi đè cả tệp; thêm luật thì thêm dòng vào `06-so-ghi/LUAT-DANGKY.json` |
| Công cụ cổng | `04-cong-may/*.cjs` | Không gói npm; thoát 0/2; đọc config qua `_harness-config.cjs`; thêm tên vào `CONG_CU` trong `kiem-harness.cjs` nếu bắt buộc |
| Hook | `05-hook-skill/hooks/` + `settings.json` | Chỉ việc AI có thể quên mà hậu quả không hoàn lại; không bao giờ làm tê liệt phiên |
| Skill / vai | `05-hook-skill/skills/<tên>/SKILL.md` · `05-hook-skill/agents/` | Bộ cài chép mọi thư mục trong `skills/` |
| Gói theo loại | `09-goi/<loại>/` (tạo khi có bài học đầu tiên) | README của gói nói áp cho loại dự án nào |
| Mẫu artefact | `02-truy-vet/templates/` | Nhóm `rieng`: dự án nhận chỉ được **báo**, không ghi đè |

## Bước 4 — KIỂM: CÀI THỬ VÀO DỰ ÁN TRỐNG

```bash
node <harnessPath>/07-cai-dat/cai-dat.cjs <thư-mục-tạm-trống> --ten "Thu nghiem" --kho
cd <thư-mục-tạm-trống> && git init -q && node Log/kiem-harness.cjs ; cd -
node <harnessPath>/04-cong-may/kiem-luat.cjs --mat --trung   # nếu chạm file luật / sổ luật
```
🛑 `kiem-harness` đỏ vì thứ vừa thêm ⇒ sửa tới xanh **rồi mới** sang Bước 5. Xoá thư mục tạm sau khi xanh.

## Bước 5 — TĂNG BẢN + CHANGELOG

- `VERSION`: **PATCH** sửa chữ / sửa lỗi công cụ · **MINOR** thêm luật, công cụ, hook, skill, gói · **MAJOR** đổi cấu trúc thư mục, đổi khoá `harness.config.json`, đổi cách khai cổng.
- `CHANGELOG.md`: thêm mục trên cùng, mỗi dòng đủ: **dự án nguồn · lớp · bắt buộc/khuyến nghị · tệp đổi · vì sao (bằng chứng)**. Mục bắt buộc ghi rõ **dự án nhận phải làm gì** nếu công cụ `cap-nhat.cjs` không tự làm được.
- `08-cap-nhat/DU-AN-DANG-KY.json`: dự án gốc giữ bản cũ cho tới khi nó chạy `cap-nhat`.

## Bước 6 — COMMIT + ĐẨY GITHUB (luôn kèm ghi chú)

Trong GlobalHarness, **"đẩy GitHub đi"** qua skill `day-git` (chế độ ĐẦY ĐỦ — GlobalHarness không có người dùng thật, đẩy GitHub là mục đích). Thông điệp commit **bắt buộc** theo khuôn:
```
harness <bản>: <một dòng tóm tắt>

- <lớp> · <bắt buộc|khuyến nghị> · <tệp> — <vì sao>   (lặp cho từng mục, trùng với CHANGELOG)
Nguồn: <dự án> · <dòng Dev Book / sự cố>
```
Sau khi đẩy: `git log -1 --stat` dán vào báo cáo. Dự án khác sẽ được hook `nhac-cap-nhat-harness.cjs` nhắc ở phiên kế tiếp.

## Bước 7 — GHI VẾT Ở DỰ ÁN GỐC

`Output/DEVBOOK.md` của dự án gốc: *"Đã đưa vào harness bản <bản>: <gì> — commit <hash>"*. Nếu dự án gốc cũng nên nhận lại (ví dụ công cụ mới), chạy skill `cap-nhat-harness` ngay.

### ✅ Kiểm chứng xong
`git log origin/main -1` ở GlobalHarness là commit vừa đẩy · `VERSION` tăng · `CHANGELOG.md` có mục cùng nội dung thông điệp commit · `kiem-harness` xanh trên dự án trống · Dev Book dự án gốc có dòng ghi vết.
