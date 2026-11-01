# Danh mục (Catalogue)

Những gì GlobalHarness phát hành, đọc từ các thư mục thật của kho. Mỗi dòng: tên, mục đích.

## 1. Tệp luật (Rules)
| Tệp | Mục đích |
|---|---|
| `00-rules/B1-AI-AUTHORITY.md` | Thang tự hành L0–L5, dây cương A/A+, 3 luật cứng, 7 điều dừng, phạm vi là của chủ dự án |
| `00-rules/B3-TRACEABILITY.md` | Chuỗi truy vết từ yêu cầu tới kiểm thử và phát hành (RTM) |
| `00-rules/B3-DOC-HEALTH.md` | 7 chỉ số sức khoẻ tài liệu |
| `00-rules/B4-RULEBOOK.md` | 15 bài học thiết kế cổng, đã chưng cất thành luật |
| `00-rules/B5-SESSIONS.md` | Vòng 7 nhịp, 8 cần điều khiển, câu lệnh mẫu, bẫy |
| `01-pipeline/PIPELINE.md` | Đường ray 11 Bước, mỗi Bước có cổng vào và cổng ra |
| `01-pipeline/PHASEGATE.md` | Checklist cổng: cổng vào V1–V6, cổng ra R1–R8, 13 điều kiện máy |
| `01-pipeline/REVIEW-POLICY.md` | Bước nào cần review độc lập, ở Round nào |
| `01-pipeline/steps/B00–B10.md` | Checklist riêng cho từng Bước (11 tệp) |
| `01-pipeline/testing/` | Luật kiểm thử: UT, IT/SIT, UAT |
| `01-pipeline/templates/` | 15 mẫu artefact (SCOPE, SPEC, ARCH, RTM, WBS, RISK...) |

## 2. Hook (`02-enforcement/hooks/`)
Quy tắc: việc AI có thể quên mà hậu quả không hoàn lại được thì là hook.
| Hook | Sự kiện | Mục đích |
|---|---|---|
| `nhac-cap-nhat-harness` | SessionStart | Nhắc khi GlobalHarness có bản mới hơn bản dự án đang dùng (chỉ nhắc) |
| `chan-git-commit-tay` | PreToolUse | Chặn `git commit` gõ tay, buộc đi qua skill `day-git` |
| `chan-ghi-de-file-luat` | PreToolUse | Chặn ghi đè toàn bộ một tệp luật đang có |
| `chan-ghi-csdl-that` | PreToolUse | Chặn ghi vào CSDL thật khi chưa có bản sao lưu mới |
| `kiem-luat-hook` | PostToolUse | Sau mỗi Edit/Write lên tệp luật, tự chạy `kiem-luat.cjs --mat` |
| `log-tool-event` | PostToolUse | Ghi mốc giờ cho mỗi lần gọi công cụ (nguồn đo giờ làm việc) |
| `log-usage` | Stop | Ghi token usage mỗi lượt trả lời |
| `_hook-chung` | (thư viện) | Phần dùng chung: tìm gốc dự án, đọc config, ghi sổ, trả quyết định chặn |

## 3. Skill (`02-enforcement/skills/`)
| Skill | Mục đích |
|---|---|
| `day-git` | Đẩy thay đổi lên Git theo 5 bước có kiểm chứng (kiểm tra, đưa tệp vào, commit, đẩy, kiểm lại) |
| `cap-nhat-harness` | Kéo bản GlobalHarness mới về ProjectHarness; xem trước, chỉ áp dụng khi chủ dự án gật |
| `dua-vao-harness` | Đưa bài học/luật/công cụ từ một dự án vào GlobalHarness, 7 bước; chỉ khi chủ dự án nói rõ |

## 4. Agent (`02-enforcement/agents/`)
Năm vai mẫu; mỗi vai khai model và effort riêng.
| Agent | Vai | Model / effort |
|---|---|---|
| `tra-cuu` | Tra cứu nhanh trong repo, không sửa gì | haiku / low |
| `dung-tai-nguyen` | Dựng tài nguyên hàng loạt theo đầu bài rõ | sonnet / medium |
| `viet-noi-dung` | Viết nội dung, tài liệu, bám nguồn | sonnet / medium |
| `tester` | Tester độc lập, kiểm sản phẩm, không sửa mã | sonnet / medium |
| `ve-hinh` | Vẽ hình, thiết kế giao diện, chấm bằng ảnh thật | opus / high |

## 5. Công cụ cổng (`02-enforcement/tools/`, `.cjs`, không cần gói npm)
| Công cụ | Mục đích |
|---|---|
| `gate-check` | Phase gate: mở Round, vào/ra Bước, đóng MVP |
| `rtm-check` | Sức khoẻ ma trận truy vết hai chiều |
| `kiem-backlog` | RTM và Product Backlog khớp hai chiều (cổng ra Bước 1) |
| `kiem-pham-vi` | Mục tiêu chủ dự án nêu đã giao chưa |
| `kiem-phu-moi-truong` | Phép đo chạy ở môi trường nào đã được phủ chưa |
| `kiem-c2-staged` | Cổng c2 (change coupling) trước khi commit |
| `doc-health` | Đo 7 chỉ số sức khoẻ tài liệu |
| `kiem-luat` | Bộ test cho tài liệu luật (thiếu, trùng) |
| `kiem-khoa-lo` | Quét chuỗi có dạng khoá bí mật |
| `kiem-harness` | Harness đã lắp đủ và đúng vào dự án chưa |
| `kiem-kho-phat-hanh` | Cổng kho khi chạy ở chính GlobalHarness |
| `cong-uat-truoc-prod` | Cổng UAT trước Production |
| `moc-day-git`, `ghi-vet-day-git`, `kiem-day-git` | Mốc, vết và đối chiếu cho kỷ luật day-git |
| `cho-quyet` | Sổ điểm chờ chủ dự án quyết, bung đúng lúc |
| `do-gio` | Tính giờ làm việc từ sổ hook |
| `check-telemetry-gaps` | Tìm task xong mà chưa có dòng telemetry |
| `_harness-config` | Bộ nạp cấu hình dùng chung cho mọi công cụ |
| `day-len-may-chu.template.sh` | Mẫu đường ống đẩy lên máy chủ, đi qua các cổng |

## 6. Sổ (`03-records/`)
| Sổ | Mục đích |
|---|---|
| `LUAT-DANGKY.json` | Sổ đăng ký luật cho máy đọc |
| `LEASH-BANG.json` | Bảng dây cương, nguồn sự thật duy nhất |
| `PHAM-VI-MVP.json` | Phạm vi MVP |
| `PHU-MOI-TRUONG.json` | Phủ môi trường |
| `CHO-QUYET.ndjson` | Điểm chờ quyết |
| `PHASE-GATE-LOG`, `PROOF-LOG`, `HOOK-EVENTS`, `DAYGIT-LOG` (`.ndjson`) | Vết cổng, bằng chứng, sự kiện hook, đẩy git |
| `TASKLIST.md` | Danh sách việc |
| `cong-buoc/`, `khai-round/` | Mẫu bản khai cổng Bước và khai Round |

## 7. Pack (`09-packs/`)
Luật riêng theo loại dự án; áp khi `harness.config.json` khai gói.
| Pack | Nội dung |
|---|---|
| `desktop` | Bài học cho app cài trên máy Windows (ví dụ tường lửa) |
| `desktop-tauri` | Bài học cho app dựng bằng Tauri (ví dụ CSP). Đọc kèm `desktop` |

## 8. Cài đặt và cập nhật
- `07-install/cai-dat.cjs`: cài ProjectHarness vào dự án, không ghi đè tệp đã có.
- `07-install/machine/`: lớp gác mức máy, cài một lần mỗi máy.
- `08-update/cap-nhat.cjs`: nâng bản dự án, mặc định chỉ xem trước.
