# Cây luật (Rule tree)

Mọi luật của harness nằm ở **một** nhánh. Có hai nhóm lớn: **A** luật theo từng bước của pipeline, và **B** luật kiểm soát chung.

## Các nhánh
| Mã | Tên | Điều khiển cái gì | Ví dụ |
|---|---|---|---|
| **A** | Pipeline rules | Công việc theo từng bước SDLC: cổng vào, cổng ra, checklist, review, kiểm thử của bước, tài liệu bước sinh ra | Cấm nhảy cóc Bước; Bước 9 AI không tuyên bố UAT đạt |
| **B1** | AI authority (Quyền hạn AI) | Chính AI: được tự làm tới đâu, khi nào phải dừng hỏi, cái gì không bao giờ được làm | Thang L0–L5, dây cương A/A+, 3 luật cứng, 7 điều dừng, phạm vi là của chủ dự án |
| **B2** | External tools (Công cụ ngoài) | Chỗ AI chạm ra ngoài dự án, chia theo từng công cụ: làm thế nào cho đúng | Git, GitHub, máy chủ/deploy, CSDL, trình duyệt/MCP, API |
| **B3** | Project information (Thông tin dự án) | Thông tin phải đúng và nhất quán: truy vết, đồng bộ khi đổi, đo lường, báo cáo | RTM, cổng c2, không sửa số cho đẹp |
| **B4** | The rulebook (Bộ luật) | Chính harness: ai được sửa luật, sửa ở tầng nào, bỏ luật thế nào | GlobalHarness khác ProjectHarness; không sửa hạ tầng gác; bỏ luật phải tường minh |
| **B5** | Sessions & coordination (Phiên và phối hợp) | Thời gian làm việc: nạp context, bàn giao, nhiều phiên, agent, chi phí | Bàn giao mỗi phiên lớn; phiên dài không treo |

## Trục phạm vi (Scope axis)
Mỗi luật còn có một **phạm vi** độc lập với nhánh:
| Phạm vi | Là gì | Nằm ở đâu |
|---|---|---|
| **Machine** (máy) | Lớp gác chạy cho mọi dự án trên một máy | `~/.claude/` (cài bằng `07-install/machine/`) |
| **GlobalHarness** | Bộ luật nguồn, dùng chung | Kho này |
| **ProjectHarness** | Bản cài và chỉnh riêng trong một dự án | Gốc dự án (`.harness-manifest.json` nhận ra nó) |

ProjectHarness không tác động ngược lên GlobalHarness. Sửa GlobalHarness chỉ khi chủ dự án nói rõ.

## Luật phân xử (Tie-break rule)
Khi một luật nằm giữa hai nhánh, hỏi lần lượt:
1. Chỉ đúng ở **một bước** thì thuộc **A**.
2. Là chuyện **"được hay không"** thì thuộc **B1**.
3. Là chuyện **"làm thế nào cho đúng"** thì thuộc **B2**.
4. Đối tượng là **chính bộ luật** thì thuộc **B4**.

Ví dụ: "không tự đẩy / gộp / phát hành" là nguyên tắc được-hay-không nên ở B1; cách đẩy đúng (qua skill `day-git`) ở B2.

## Mỗi nhánh nằm ở tệp nào
| Nhánh | Tệp trong kho |
|---|---|
| A | `01-pipeline/PIPELINE.md` (11 Bước), `01-pipeline/PHASEGATE.md` (cổng vào/ra), `01-pipeline/REVIEW-POLICY.md`, `01-pipeline/steps/B00–B10.md`, `01-pipeline/testing/` (UT, IT/SIT, UAT) |
| B1 | `00-rules/B1-AI-AUTHORITY.md` |
| B2 | `00-rules/B2-EXTERNAL-TOOLS.md` (Git, GitHub, deploy, CSDL thật, shell, web/MCP, đăng tải) — cưỡng chế bằng skill `day-git` và các hook chặn ở `02-enforcement/hooks/` |
| B3 | `00-rules/B3-TRACEABILITY.md`, `00-rules/B3-DOC-HEALTH.md`, mẫu ở `01-pipeline/templates/` |
| B4 | `00-rules/B4-RULEBOOK.md`, `08-update/HUONG-DAN-CAP-NHAT.md` |
| B5 | `00-rules/B5-SESSIONS.md` |

Sổ đăng ký luật cho máy đọc: `03-records/LUAT-DANGKY.json`. Thêm luật thì thêm một dòng ở đó, rồi chạy `kiem-luat.cjs`.

## Dùng cây để làm gì
- Thêm luật mới: tìm nhánh bằng luật phân xử, ghi vào tệp của nhánh, thêm dòng sổ đăng ký.
- Tìm luật: đi từ câu hỏi ("AI có được tự push không?" thì B1) tới tệp.
- Phát hiện luật trùng: hai luật cùng nhánh, cùng ý thì gộp.
