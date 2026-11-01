# RISK — Sổ rủi ro (<TÊN DỰ ÁN>)

> Artefact **Bước 6**. *Done khi:* mọi việc chạm dữ liệu nhạy / bảo mật ở **A+ + cổng fail-closed**; **có nhóm rủi ro do AI sinh**; mỗi rủi ro **có người sở hữu**; rủi ro **L×I ≥ ngưỡng cao** (`harness.config.json › docHealth.nguongRuiRoCao`, mặc định 12) có **mã quyết định** gắn vào (chỉ số c6).
> **Cột cố định — máy đọc:** `| Mã | Rủi ro | Nhóm | Chủ sở hữu | L | I | L×I | Giảm thiểu | Quyết định |`. Mã theo `harness.config.json › ma.ruiRo` (ví dụ `R-M1-01`). Tiêu đề cột L×I phải có chữ `L×I`.

## 1. Thang
L (xác suất) 1–4 · I (tác động) 1–4 · **L×I ≥ 12 = cao** ⇒ Tester Senior bắt buộc, cần quyết định có mã.

## 2. Sổ rủi ro
| Mã | Rủi ro | Nhóm | Chủ sở hữu | L | I | L×I | Giảm thiểu | Quyết định |
|---|---|---|---|---|---|---|---|---|
| R-M1-01 | AI bịa nội dung không có nguồn | AI-sinh | Huynh | 3 | 4 | 12 | <…> | D-ARCH-… |
| R-M1-02 | Dữ liệu cá nhân lọt vào prompt / log | AI-sinh | Huynh | 2 | 4 | 8 | | |
| R-M1-03 | Duyệt bừa output AI (rubber-stamp) | AI-sinh | Huynh | 3 | 3 | 9 | Review độc lập theo REVIEW-POLICY | |
| R-M1-04 | <rủi ro nghiệp vụ> | Nghiệp vụ | | | | | | |

## 3. Rủi ro mới do Round này lộ ra
| Mã | Rủi ro | Phát hiện ở | Hệ quả |
|---|---|---|---|
