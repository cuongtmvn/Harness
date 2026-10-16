# SPEC — Đặc tả yêu cầu (<TÊN DỰ ÁN>)

> Artefact **Bước 1**. *Done khi:* mỗi story MVP có **AC kiểm được** (Given/When/Then, đo bằng gì) · có **bảng vai × tình huống dùng** · **NFR ghi rõ con số**. Cổng RA riêng: `node Log/kiem-backlog.cjs` — mọi tính năng có mã `PB-` ở `BACKLOG.md` §ⓐ.
> Mã: story `US-xx` · tiêu chí `US-xx AC<n>` · phi chức năng `NFR-<nhóm>-<n>`. **Số không tái dùng.** AC viết từ **nguồn tri thức miền đã mở thật**, không từ trí nhớ.
> ⛔ AI không tự kiểm AC của chính mình rồi tuyên bố đạt — lớp kiểm ngoài (`REVIEW-POLICY`).

## 1. Vai người dùng
| Vai | Là ai | Được làm gì | KHÔNG được làm gì |
|---|---|---|---|

## 2. User story

### US-01 — <tên> · `PB-001` · mục tiêu `M1`
*Là <vai>, tôi muốn <việc>, để <giá trị>.*

| AC | Given / When / Then | Đo bằng gì (PASS/FAIL) |
|---|---|---|
| AC1 | Given … When … Then … | <mã HTTP / số dòng CSDL / chuỗi nguyên văn> |
| AC2 *(ca nghịch)* | Given dữ liệu sai … Then … | |
| AC3 *(phân quyền)* | Given vai X … Then 403 … | |

## 3. Yêu cầu phi chức năng — có con số
| Mã | Yêu cầu | Ngưỡng đo được | Đo ở Bước 9 bằng |
|---|---|---|---|
| NFR-PERF-1 | <…> | <… ms p95, n lần, trên máy nào> | |
| NFR-SEC-1 | <…> | | |

## 4. Bảng vai × tình huống dùng
| Tình huống | Vai A | Vai B | Vai Admin |
|---|---|---|---|
| <…> | ✅ / ❌ / — | | |

## 5. Ràng buộc từ Bước trước (chép từ `RTM.md` khối RÀNG BUỘC THEO BƯỚC)
