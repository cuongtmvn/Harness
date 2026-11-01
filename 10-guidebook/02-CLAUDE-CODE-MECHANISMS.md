# Cơ chế của Claude Code (Claude Code mechanisms)

Đây là cách **Claude Code của Anthropic** tự chạy, tách khỏi harness. Biết nó để đặt luật đúng chỗ. Có hai tầng: **máy** (`~/.claude/`) và **dự án** (thư mục repo).

## 1. CLAUDE.md (trí nhớ viết tay, Memory file)
- Máy: `~/.claude/CLAUDE.md`. Dự án: `CLAUDE.md` ở gốc repo (commit, dùng chung), `CLAUDE.local.md` (riêng, không commit), `CLAUDE.md` trong thư mục con.
- Đầu phiên nạp toàn bộ, từ thư mục đang mở ngược lên gốc, cộng bản của máy. Thư mục con nạp khi Claude đọc tệp trong đó.
- Các tầng **ghép nối**, không tầng nào đè tầng nào; tệp gần thư mục làm việc được đọc sau cùng.
- `@import` tối đa 4 tầng. `.claude/rules/` nạp như CLAUDE.md.

## 2. Auto memory (trí nhớ tự động)
- `~/.claude/projects/<thư-mục>/memory/`, mỗi thư mục dự án một kho, chỉ nằm trên máy, không đi theo git.
- Đầu phiên nạp **200 dòng hoặc 25 KB đầu** của `MEMORY.md`; tệp chủ đề đọc khi cần.
- Nên dùng cho: con trỏ bàn giao, sở thích của chủ dự án.

## 3. Settings
- Máy: `~/.claude/settings.json`. Dự án: `.claude/settings.json` (commit), `.claude/settings.local.json` (riêng).
- Thứ tự ưu tiên: **managed > dòng lệnh > local > dự án > máy**. Danh sách quyền được gộp.

## 4. Permissions (quyền)
- `allow` / `ask` / `deny` trong settings.
- Xét **deny trước, rồi ask, rồi allow**. Một allow không mở được chỗ đã deny.
- Chế độ `auto` và `bypass` không nhận từ settings dự án.

## 5. Hooks
- Chạy theo sự kiện: `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`, `PreCompact`...
- Hook của mọi tầng **gộp lại và chạy song song**; hook giống hệt chỉ chạy một lần.
- Thoát mã **2** ở `PreToolUse` = chặn lệnh. Ở `SessionStart` và `PostToolUse` thì không chặn.
- Hệ quả: việc AI có thể quên mà hậu quả không hoàn lại được thì phải là hook, không phải chữ trong CLAUDE.md.

## 6. Skills
- Máy: `~/.claude/skills/<tên>/SKILL.md`. Dự án: `.claude/skills/<tên>/SKILL.md`.
- Đầu phiên chỉ nạp **tên + mô tả**; thân skill nạp khi được gọi.
- Cùng tên: managed > máy > dự án (bản máy thắng). Skill của plugin có tiền tố nên không trùng.

## 7. Subagents (agent con)
- Máy: `~/.claude/agents/<tên>.md`. Dự án: `.claude/agents/<tên>.md`.
- Đầu phiên nạp mô tả. Khi gọi, agent chạy trong **ngữ cảnh riêng** và chỉ trả về kết luận.
- Cùng tên: bản dự án thắng bản máy.

## 8. MCP servers
- Máy: phạm vi user (`~/.claude.json`). Dự án: `.mcp.json` (commit) hoặc phạm vi local.
- Đầu phiên nạp danh sách công cụ; chi tiết có thể hoãn nạp.
- Cùng tên: local > dự án > máy > plugin. Lấy **nguyên một cấu hình**, không gộp từng trường.

## 9. Plugins
- Cài từ marketplace cho người dùng; bật/tắt trong settings dự án.
- Hoạt động như thành phần nó mang: skill, agent, hook, MCP.
- Bật ở nhiều chỗ: local > dự án > máy. Hook của plugin gộp với hook khác.

## 10. Transcripts (bản ghi phiên)
- `~/.claude/projects/<thư-mục>/*.jsonl`, ghi liên tục trong phiên.
- Tự xoá sau `cleanupPeriodDays`, mặc định **30 ngày**. Muốn giữ lâu hơn thì sao lưu.

## 11. Model và effort
- Chọn bằng lệnh `/model` hoặc khoá model trong settings; mỗi phiên một model, agent con có thể dùng model khác.
- Agent khai model / effort riêng thì thắng phiên.
- Effort mặc định là **medium** trên Opus 5.5, Sonnet 5.5, Haiku 5.5.

## Tóm tắt: ai thắng ai
| Thứ | Thứ tự (thắng trước) |
|---|---|
| Settings | managed > dòng lệnh > local > dự án > máy |
| Permissions | deny > ask > allow |
| Skill cùng tên | managed > máy > dự án |
| Agent cùng tên | dự án > máy |
| MCP cùng tên | local > dự án > máy > plugin |
| CLAUDE.md | ghép nối; tệp gần nhất đọc cuối |
