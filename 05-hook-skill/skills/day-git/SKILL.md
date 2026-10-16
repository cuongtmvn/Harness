---
name: day-git
description: Đẩy thay đổi lên Git theo đúng 5 bước có kiểm chứng — kiểm tra → đưa file vào → commit → đẩy lên → kiểm tra lại. Dùng khi chủ dự án gõ "đẩy git đi" (hoặc "đẩy git", "commit đi", "commit và đẩy lên"). KHÔNG dùng cho merge, rebase, release, hay đẩy nhánh khác nhánh chính.
---

# Đẩy git — 5 bước, mỗi bước có điều kiện kiểm chứng

> Câu lệnh kích hoạt: **"đẩy git đi"**. Chính câu đó là sự cho phép của chủ dự án cho lần đẩy này — không hỏi lại "có đẩy không?". Nhưng **các chốt chặn dưới đây thì không câu nào gỡ được.**
> Tên vai: *Huynh* = chủ dự án, *CULI* = AI (`harness.config.json › vaiTro`).

## Nguyên tắc đứng trên mọi bước
- Mỗi bước là **cổng kiểm chứng được** (hành động → DỪNG → điều kiện kiểm cụ thể). **Không gộp 5 bước thành một chuỗi lệnh chạy một hơi.**
- Chỉ làm trên nhánh hiện tại. **Không** merge · rebase · `push --force` · `--no-verify` · tự tạo tag/release.
- Bước nào DỪNG: báo Huynh lý do + việc cần làm, **không tự chữa rồi đi tiếp**.
- ⛔ Hook `chan-git-commit-tay.cjs` chặn mọi `git commit` không mang **mốc hợp lệ + dấu `#DAY-GIT-BUOC-3`**. Đó là cố ý.

---

## Bước 1 — KIỂM TRA (chưa đụng gì vào repo)

```bash
git status --short
git remote -v
git branch -vv
git log --oneline -3
```

### Xác định CHẾ ĐỘ — làm đầu tiên
🔑 **Chế độ do CÂU HUYNH GÕ quyết định, KHÔNG do repo có remote hay không.**

| Huynh gõ | Chế độ | Chạy bước nào |
|---|---|---|
| *"đẩy git đi"* · *"commit đi"* | 🏠 **LOCAL** | 1 → 2 → 3 → 5 *(bản local)*. **Bỏ Bước 4.** |
| *"đẩy GitHub đi"* · *"push đi"* · *"đẩy lên remote"* | 🌐 **ĐẦY ĐỦ** | Cả 5 bước |

> 🛑 Gõ *"đẩy git đi"* mà chạy `git push` = vi phạm luật cứng #1 *(không tự đẩy/phát hành)*. Chế độ LOCAL: commit xong là **DỪNG**, không bao giờ viết "đã đẩy lên".
> *Vì sao:* phép cũ *"remote rỗng ⇒ local"* đọc **trạng thái repo** để suy ra **ý định người** — ngày repo có remote là ngày cùng một câu lệnh lặng lẽ đảo nghĩa, và không cổng nào bắt được.
> Không tự chạy `git remote add` — chọn kho chứa là quyết định của Huynh.

### 🛑 Chốt chặn — gặp bất kỳ điều nào thì DỪNG
| # | Điều kiện | Vì sao |
|---|---|---|
| **C1** | File khớp **bí mật/khoá** (`harness.config.json › dayGit.tepBiMat`): `.env`, `.env.*`, `*credential*`, `*secret*`, `*.key`, `*.pem` | **Luật cứng #2 — kể cả Huynh bảo cứ đẩy.** Ngoại lệ duy nhất: tên trong `dayGit.ngoaiLeBiMat` (ví dụ `.env.example`) **và** tệp chỉ có tên biến, không có giá trị sau `=` |
| **C2** | File khớp **dữ liệu thật** (`dayGit.tepDuLieu`): `*.db`, `*.sqlite*`, `*.db-wal/-shm/-journal`, bản sao lưu | Chứa dữ liệu người dùng. Vào git là **vĩnh viễn**. Tiền lệ: bản sao lưu `*.db.bak-…` lọt qua khuôn `*.db` vì không kết thúc bằng `.db` |
| **C3** | **Repo git lồng nhau** / `git add` báo *"adding embedded git repository"* | `.gitignore` hỏng — sửa trước |
| **C4** | **Detached HEAD** hoặc nhánh lạ | Xác nhận với Huynh |

### ⚠️ Cảnh báo — không dừng, nhưng phải nói ra và chờ Huynh trả lời
| # | Điều kiện | Nói gì |
|---|---|---|
| **W1** | File rác `*.bak` `*.tmp` `*.orig` `*.rej` `*~` | Liệt kê; mặc định **bỏ ra** |
| **W2** | File mới **sai chỗ** theo bản đồ thư mục (script ở gốc thay vì `Log/`, artefact ngoài `Output/`) | Chỉ chỗ đúng |
| **W3** | **Changeset to hoặc trộn việc THẬT SỰ RỜI NHAU** — >25 file, hoặc nhiều mảng không cùng một việc | Đề xuất tách; Huynh quyết. 🔴 **Không cảnh báo nhầm `App/` + `Output/`** — mã đi cùng tài liệu của chính nó **chính là hình dạng ĐÚNG mà `c2` muốn**. Đếm theo **số việc**, không theo số thư mục |
| **W4** | File **phiên khác đang làm dở** (mtime vài phút trước, mảng việc không phải của phiên này) | Nhiều phiên song song — đẩy hộ = cướp commit của họ. Nêu tên file, hỏi Huynh |

**Xong Bước 1 phải báo:** chế độ · danh sách file sẽ đưa vào (đã track/sửa vs mới) · remote, nhánh · mọi cờ C/W đã bật.

---

## Bước 2 — ĐƯA FILE VÀO

```bash
git add -A        # hoặc git add <từng đường dẫn> nếu Bước 1 có loại trừ / W4
```

### ✅ Kiểm chứng — bắt buộc
```bash
git diff --cached --name-only
git diff --cached --stat
```
- Đối chiếu danh sách staged với danh sách Bước 1 — lệch ⇒ DỪNG tìm hiểu (`.gitignore` không che như tưởng).
- **Chạy lại C1/C2/C3 trên danh sách ĐÃ STAGED** — `git status` và `git add -A` không luôn cho cùng tập file.
- Staged rỗng ⇒ không có gì để đẩy, báo và dừng.

### 🚦 Ba cổng + MỐC — một lệnh
```bash
node Log/moc-day-git.cjs
```
Nó chạy **ba cổng** rồi mới ghi mốc `Log/.moc-day-git.json`:

| Cổng | Bắt gì | Mã 2 ⇒ |
|---|---|---|
| `kiem-luat.cjs` | dòng luật bị xoá · luật trong sổ mất khỏi file · sửa luật quên sổ · id trùng | 🛑 DỪNG. Truy từng luật: *nay ở đâu / bỏ có chủ ý vì sao*. ⛔ Không tự đánh dấu "đã bỏ" để cổng xanh — điều dừng 5 |
| `kiem-khoa-lo.cjs` | chuỗi dạng khoá bí mật trong vùng staged | 🛑 DỪNG. Gỡ khoá, đưa vào biến môi trường, **coi như khoá đã lộ** — xoay vòng |
| `kiem-c2-staged.cjs` | mã đổi mà tài liệu RTM nói là liên quan không cùng change set | 🛑 DỪNG. Báo danh sách thiếu. *"Không tra được"* ⛔ không phải trượt — đó là lỗ c4, báo ra, hỏi có nên thêm dòng RTM |

🔑 **Vì sao là mốc chứ không phải một dấu gõ tay:** dấu nói *ý định*, mốc nói *việc đã làm*. Mốc dán vào vân tay `git write-tree` của đúng vùng staged, hạn 15 phút, vô hiệu khi vùng staged rỗng. **Đổi vùng staged sau khi sinh mốc ⇒ mốc chết, chạy lại** — đó là tính năng.

🛑 **Gặp mã 2 thì tuyệt đối KHÔNG tự sửa tài liệu cho đủ rồi commit.** Sửa SPEC/RTM để chỉ số đẹp lên là gian lận nặng nhất bộ chỉ số có thể dính. Trình danh sách thiếu, Huynh quyết viết gì.

---

## Bước 3 — COMMIT

Soạn thông điệp **đọc từ diff thật**:
```bash
git diff --cached --stat
git diff --cached | head -200
```
**Quy cách:** dòng đầu nói **thay đổi gì** (kèm mã task); thân bài: **vì sao**, bằng chứng `file:dòng`, kết quả phép kiểm. ❌ Không *"update files"*, *"fix"*. Kết thúc bằng dòng Co-Authored-By theo quy ước của phiên.

```bash
git commit -m "$(cat <<'EOF'
<dòng tiêu đề>

<thân bài>

Co-Authored-By: <theo quy ước phiên>
EOF
)" #DAY-GIT-BUOC-3
```
> Dấu `#DAY-GIT-BUOC-3` **bắt buộc nhưng không đủ** — hook đòi **cả dấu lẫn mốc** Bước 2. ⛔ **Không dùng `#QUA-DAY-GIT` ở đây**: cờ đó dành cho đi vòng (ghi vết `di-vong`), dùng nhầm là đổ mọi commit hợp lệ vào sổ như một lần lách.

### ✅ Kiểm chứng
- `git log --oneline -1` hiện đúng commit vừa tạo. Hook fail thì **sửa gốc, không `--no-verify`**.

---

## Bước 4 — ĐẨY LÊN *(chỉ 🌐 ĐẦY ĐỦ)*

🏠 LOCAL → ghi đúng một dòng *"Chế độ local — dừng ở commit."* Không hỏi, không đề xuất đẩy, không tô đỏ. **Repo có remote không phải lý do để đẩy.**

🌐 ĐẦY ĐỦ:
```bash
git push            # nhánh chưa upstream: git push -u origin <nhánh>
```
Bị từ chối (non-fast-forward) ⇒ **DỪNG**. Không `--force`, không tự `pull --rebase` (nhiều phiên song song — rebase mù có thể nuốt commit phiên khác).

---

## Bước 5 — KIỂM TRA LẠI + GHI VẾT (bắt buộc — không báo xong khi chưa chạy)

🏠 LOCAL — đủ 3:
```bash
git status --short              # 1. sạch (hoặc chỉ còn file cố ý loại trừ)
git log --oneline -1            # 2. đúng commit vừa tạo
git show --stat --oneline HEAD | tail -3   # 3. số file khớp Bước 1
```
🌐 ĐẦY ĐỦ — đủ 4: thêm `git rev-parse HEAD` **bằng** `git rev-parse @{u}` và `git diff HEAD @{u} --stat` **rỗng**.

Rồi **ghi vết**:
```bash
node Log/ghi-vet-day-git.cjs
```
Chạy lại 4 cổng trên cây đã commit, ghi `Log/DAYGIT-LOG.ndjson` — ghi **cả khi đỏ** (vết chỉ ghi khi đẹp thì nó là quảng cáo). `kiem-day-git.cjs` là thứ phát hiện khi ai đó quên bước này.

### Báo cáo cuối
| Mục | Giá trị |
|---|---|
| Chế độ | 🏠 LOCAL / 🌐 ĐẦY ĐỦ |
| Commit | `<hash>` — `<tiêu đề>` |
| Số file | `<n>` (`+x/-y`) |
| Đã lên remote | 🏠: **"— (chế độ local)"** · 🌐: ✅/❌ kèm lý do |
| Cổng (vết) | kiem-luat · kiem-khoa-lo · c2 · rtm-check — mã thoát từng cái |
| Cố ý loại trừ | `<danh sách hoặc "không có">` |

## Sau khi đẩy — 2 việc dễ quên
1. **Tạo file mới?** → thêm vào bản đồ thư mục của dự án.
2. **Đẩy git ≠ đẩy production.** Lên môi trường có người dùng thật là đường ống riêng (`Log/day-len-may-chu.sh`) có cổng UAT→Production. Không lẫn.
