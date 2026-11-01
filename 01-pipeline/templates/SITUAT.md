# SITUAT — Hồ sơ kiểm thử IT · SIT · UAT (<TÊN DỰ ÁN>)

> Artefact **Bước 9**. Luật: `Instructions/IT-SIT-RULES.md` · `UAT-RULES.md`. Bộ ca **soạn xong TRƯỚC khi chạy**; ⛔ không thêm ca sau khi biết kết quả để đẩy tỷ lệ.
> **UAT không có ngưỡng %** — ba điều kiện nhị phân: mọi AC PASS · có ca nghịch + phân quyền · lỗi còn lại ghi nhận. Lượt 1 = Tester độc lập (**BÁO CÁO**), lượt 2 = Huynh (**PHÁN QUYẾT**). ⛔ AI không tuyên bố UAT đạt.
> Cổng RA riêng: `node Log/kiem-phu-moi-truong.cjs` — phép đo nào chạy **ở đâu** khai ở `Instructions/PHU-MOI-TRUONG.json`.

## 0. Smoke pre-check (trước mỗi lượt UAT)
| Phép | Kết quả | Ngày |
|---|---|---|
| Toàn bộ bộ test PASS 100% | | |
| 1 request thật qua app đang chạy | | |

## 1. Integration Map
### IT — điểm tích hợp NỘI BỘ
| ID | Từ → Đến | Tệp | Dữ liệu / contract qua ranh giới | Rủi ro |
|---|---|---|---|---|
| IT-P1 | | | | |

### SIT — ranh giới ra hệ NGOÀI (không mock)
| ID | Ranh giới | Tệp | Contract / hành vi cần kiểm | Rủi ro |
|---|---|---|---|---|
| SIT-P1 | | | | |

## 2. Bảng trace UAT ↔ AC — mỗi ca đúng MỘT AC, mỗi AC ≥1 ca
| Ca | Story · AC | Vai | Dữ liệu `TD-xx` | Kịch bản | Kết quả mong đợi (đã verify bằng hệ thật) | Rủi ro | Lượt 1 (Tester) | Lượt 2 (Huynh) |
|---|---|---|---|---|---|---|---|---|
| UAT-01 | US-01 AC1 | | TD-01 | | | | | |

## 3. Bộ dữ liệu thử `TD-xx` — giả, cố định, dùng chung 3 tầng
| Mã | Dữ liệu | Dùng để kiểm | Kết quả mong đợi (verify bằng hệ thật trước khi ghi) |
|---|---|---|---|

## 4. Sổ lỗi
| Mã | Mô tả | Severity (S1–S4) | Ca phát hiện | Trạng thái (Open/Fixed/Accepted) | Ai quyết, lý do nếu Accepted |
|---|---|---|---|---|---|

## 5. Vòng chạy (trần: <N> vòng)
| Vòng | Ngày | Đạt / tổng | Sửa gì | Chạy lại regression? |
|---|---|---|---|---|

## 6. Exit criteria & sign-off
| Tầng | Điều kiện | Đạt? | Bằng chứng |
|---|---|---|---|
| IT | phủ đủ IT-Px · 0 S1/S2 · có nhánh lỗi · regression PASS | | |
| SIT | phủ đủ SIT-Px · 0 S1/S2 · contract thật PASS · NFR đạt · ranh giới dữ liệu ra ngoài PASS tuyệt đối | | |
| UAT | 100% AC · 0 S1/S2 · S3 ≤ <ngưỡng> có kế hoạch · S4 ghi nhận | | |

**Sign-off chủ dự án (nguyên văn, ngày):** "<…>" — ⚠️ ghi trung thực nếu là tự-sign-off không có bên thứ ba.
