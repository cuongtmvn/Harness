# muc-may — lớp gác MỨC MÁY của GlobalHarness

**Chặn lỗi gì:** mọi cơ chế nhắc của GlobalHarness (hook `nhac-cap-nhat-harness`, `kiem-harness`, lệnh *"nạp context"*) nằm **bên trong** ProjectHarness. Dự án chưa cài ProjectHarness — mới tạo, hoặc chép tay luật của dự án khác — thì không có gì trỏ về GlobalHarness, AI nạp luật lạc hậu như thể là luật hiện hành. Ca thật: AIAutoNews 16→23/10/2026.

Thư mục này **không** được bộ cài dự án (`cai-dat.cjs`) chép — nó gác ở ngoài mọi dự án.

| Tệp | Là gì | Đến đâu |
|---|---|---|
| `kiem-project-harness.cjs` | Hook `SessionStart`: dự án thiếu `.harness-manifest.json` ⇒ cảnh báo + đề xuất cài / di trú; im lặng ở kho và ở dự án đã cài; dự án ngoại lệ trong sổ đăng ký ⇒ nhắc theo ghi chú | `~/.claude/settings.json` trỏ **thẳng** vào tệp trong kho |
| `khoi-claude-md.md` | Khối luật *"nạp context ⇒ kiểm ProjectHarness trước"* | `~/.claude/CLAUDE.md`, giữa mốc `<!-- GLOBALHARNESS_START/END -->` |
| `cai-muc-may.cjs` | Bộ cài hai thứ trên; xem trước mặc định, `--ap-dung` để ghi, sao lưu tệp cũ, chạy lại không trùng | — |
| `skill-claude-ai/kiem-harness-du-an/SKILL.md` | Cùng luật, dạng skill claude.ai — đường duy nhất tới phiên **điện thoại / cloud** (không có `~/.claude` của máy) | Chủ dự án **tự tải lên** claude.ai (Settings → Skills); AI không tải hộ được |

```bash
node D:/OneDrive/AI/Harness/07-cai-dat/muc-may/cai-muc-may.cjs            # xem trước
node D:/OneDrive/AI/Harness/07-cai-dat/muc-may/cai-muc-may.cjs --ap-dung  # một lần mỗi máy
```

**Giới hạn — khai thẳng:** hook chỉ **nhắc**, không chặn; luật trong `~/.claude/CLAUDE.md` không nằm trong `LUAT-DANGKY.json` (sổ đó đi theo dự án, `kiem-luat` quét tệp dự án) ⇒ việc AI làm theo khối luật là kỷ luật, cưỡng chế là dòng cảnh báo của hook mỗi phiên. Skill claude.ai chỉ chạy khi khớp mô tả — không bảo đảm như hook.
