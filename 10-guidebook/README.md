# Guidebook (Sổ tay) của GlobalHarness 2.0

## Đây là gì
Sổ tay đi kèm bộ luật. Bộ luật (`00-rules/`, `01-pipeline/`) nói **phải làm gì**. Sổ tay nói **tìm luật ở đâu, Claude Code chạy ra sao, chọn model nào, tiết kiệm token thế nào**.
Sổ tay không thay luật. Nếu sổ tay và luật lệch nhau, **luật thắng**; hãy sửa sổ tay.

GlobalHarness 2.0 là bộ luật dùng chung để điều hành AI làm phần mềm với Claude Code. Mỗi dự án cài một bản riêng gọi là ProjectHarness.

## Ai đọc
- **Người** (chủ dự án, người mới vào): đọc theo thứ tự 01 đến 05 để nắm bức tranh.
- **AI** (Claude Code): đọc `01-RULE-TREE.md` khi cần biết luật nằm ở đâu; đọc `04-` khi chọn model hoặc giao việc cho agent con; đọc `05-` khi phiên dài.
- Mỗi tệp đứng được một mình. Không cần đọc hết.

## Mục lục
| Tệp | Nội dung |
|---|---|
| `01-RULE-TREE.md` | Cây luật A + B1–B5, trục phạm vi (máy / Global / Project), luật phân xử, luật nằm ở tệp nào |
| `02-CLAUDE-CODE-MECHANISMS.md` | Claude Code tự nạp gì, theo thứ tự nào, cái nào thắng cái nào |
| `03-CATALOGUE.md` | Danh mục thứ GlobalHarness phát hành: luật, hook, skill, agent, công cụ cổng, sổ, pack |
| `04-MODEL-EFFORT-AGENTS.md` | Chọn model và effort theo việc; khi nào giao agent con; cách tạo và giao việc |
| `05-TOKEN-ECONOMY.md` | Cách tiết kiệm token |

## Quy ước
- Tiếng Việt, câu ngắn. Thuật ngữ kỹ thuật giữ tiếng Anh.
- Sổ tay chỉ chứa hướng dẫn chung. Thông tin riêng của dự án (đường dẫn máy, chi phí, dữ liệu cá nhân) **không** được đưa vào đây, vì kho này công khai.
- Đổi sổ tay là đổi nội dung kho: theo luật kho, tăng `VERSION` và ghi `CHANGELOG.md`.
