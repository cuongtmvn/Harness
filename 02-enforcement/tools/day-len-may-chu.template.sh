#!/usr/bin/env bash
# day-len-may-chu.sh — ĐƯỜNG ỐNG ĐẨY LÊN MÔI TRƯỜNG CÓ NGƯỜI DÙNG THẬT (mẫu — điền chặng 3/4/5 theo hạ tầng dự án)
#
# Cách dùng (Git Bash, đứng ở gốc kho mã):
#     bash Log/day-len-may-chu.sh                 # triển khai HEAD
#     bash Log/day-len-may-chu.sh <mã-commit>     # triển khai đúng bản đó (repo nhiều phiên song song: HEAD có thể là của phiên khác)
#     bash Log/day-len-may-chu.sh --ngoai-le "<lý do thật ≥25 ký tự>" --huynh-xac-nhan <YYYY-MM-DD>
# ⛔ Hai cờ ngoại lệ là CHỮ KÝ của chủ dự án — AI không được tự cắm.
#
# NĂM CHẶNG: cổng ở máy chủ dự án → bộ test ở máy chủ dự án → đóng gói/chuyển → CỔNG TEST TRÊN MÁY CHỦ → đổi bản + đối chứng.
# Chặng nào đỏ thì DỪNG, bản đang chạy trên máy chủ không bị đụng tới.
#
# 🔴 KHUÔN CỔNG GIẢ — đừng viết lại: `node x.cjs > /dev/null && echo "✅"` KHÔNG chặn được gì, vì `set -e`
#    cố ý không kích hoạt cho lệnh nằm trong AND-list. Cổng đỏ ⇒ không in nhãn, rồi ĐI TIẾP. Tương tự
#    `pytest | tail` ăn mã thoát của `tail`. Mọi cổng ở đây dùng hàm cong() có if/else tường minh.
set -euo pipefail

vach() { echo; echo "──────── $* ────────"; }
cong() {                      # cong <nhãn> <lệnh...>  — fail-closed
  local nhan="$1"; shift
  local ra; ra="${TEMP:-/tmp}/cong-$nhan.txt"
  if "$@" > "$ra" 2>&1; then
    echo "  ✅ $nhan"
  else
    echo "  🔴 CỔNG ĐỎ: $nhan — dừng, KHÔNG có gì rời khỏi máy này."
    tail -20 "$ra" | sed 's/^/     /'
    exit 1
  fi
}

vach "0/5 · Trạng thái kho mã"
# Hai tệp nhật ký do chính hệ đo tự ghi luôn "bẩn" (hook ghi trước mỗi lượt gọi công cụ) ⇒ bỏ qua
# ĐÚNG HAI tệp đó, không nới khuôn nào khác. Một chốt kiểm luôn kêu là chốt người ta học cách bấm qua.
BO_QUA_NHAT_KY='^ M (Log/HOOK-EVENTS\.ndjson|Log/USAGE\.md)$'
BAN="$(git status --porcelain | grep -vE "$BO_QUA_NHAT_KY" || true)"
if [ -n "$BAN" ]; then
  echo "⚠️  Cây làm việc CÓ thay đổi chưa commit. Đường ống chỉ đưa lên phần ĐÃ COMMIT (git archive)."
  echo "$BAN" | sed 's/^/      /'
  read -r -p "    Vẫn tiếp tục? [g/K] " tra
  [ "$tra" = "g" ] || [ "$tra" = "G" ] || { echo "    Dừng theo yêu cầu."; exit 0; }
fi
CO_NGOAI_LE=(); MOC="HEAD"
while [ $# -gt 0 ]; do
  case "$1" in
    --ngoai-le|--huynh-xac-nhan) CO_NGOAI_LE+=("$1" "${2:-}"); shift 2 ;;
    *) MOC="$1"; shift ;;
  esac
done
git rev-parse --verify --quiet "$MOC^{commit}" >/dev/null || { echo "⛔ Không có commit: $MOC"; exit 1; }
NHAN="$(git rev-parse --short "$MOC")-$(date +%Y%m%d-%H%M%S)"
[ "$MOC" != "HEAD" ] && echo "  ⚠️ Triển khai bản CHỈ ĐỊNH ($MOC), không phải HEAD"
echo "  Bản sẽ triển khai: $NHAN"

vach "1/5 · Cổng kiểm tài liệu + phạm vi ở máy chủ dự án"
cong kiem-luat       node Log/kiem-luat.cjs
cong kiem-khoa-lo    node Log/kiem-khoa-lo.cjs --toan-bo
cong rtm-check       node Log/rtm-check.cjs
cong kiem-backlog    node Log/kiem-backlog.cjs          # tính năng có trong danh mục sản phẩm không
cong phu-moi-truong  node Log/kiem-phu-moi-truong.cjs   # phép đo chạy Ở ĐÂU — câu hỏi chỉ sống đúng lúc mã sắp rời máy
cong pham-vi         node Log/kiem-pham-vi.cjs --truoc-prod   # mục tiêu bị hoãn phải có chữ ký chủ dự án
if node Log/cong-uat-truoc-prod.cjs "${CO_NGOAI_LE[@]}"; then
  echo "  ✅ cổng UAT → Production"
else
  echo; echo "  🔴 DỪNG — chưa duyệt xong UAT (Bước 9) thì không đẩy production."; exit 1
fi

vach "2/5 · KIỂM ĐỊNH Ở MÁY CHỦ DỰ ÁN — bộ test chạy trước khi mã rời máy"
# Lớp MỘT bắt lỗi mã. Lớp HAI (chặng 4) chạy lại trên máy chủ, bắt lỗi MÔI TRƯỜNG (thiếu gói, lược đồ lệch).
[ "$MOC" != "HEAD" ] && echo "  ⚠️ Test local chạy trên cây làm việc, KHÔNG phải bản $MOC"
KQ="${TEMP:-/tmp}/test-local.txt"
# <ĐIỀN> lệnh chạy bộ test của dự án (harness.config.json › kiemThu.lenhChayBo), ví dụ:
if ( cd App && python -m pytest -q > "$KQ" 2>&1 ); then
  tail -3 "$KQ" | sed 's/^/  /'; echo "  ✅ bộ test ở máy chủ dự án: XANH"
else
  echo "  🔴 BỘ TEST ĐỎ — dừng."; grep -E "FAILED|ERROR|failed" "$KQ" | tail -12 | sed 's/^/     /'; exit 1
fi

vach "3/5 · Đóng gói + chuyển lên máy chủ"
GOI="${TEMP:-/tmp}/ma.tar.gz"
git archive --format=tar.gz -o "$GOI" "$MOC"
echo "  gói: $(du -h "$GOI" | cut -f1)"
# <ĐIỀN> scp/rsync gói + script triển khai lên máy chủ. Ví dụ:
# scp -o BatchMode=yes "$GOI" "$MAY_CHU:/tmp/ma.tar.gz"
# scp -o BatchMode=yes Log/trien-khai.sh "$MAY_CHU:/tmp/trien-khai.sh"
echo "  <ĐIỀN chặng 3: chuyển gói lên máy chủ>"

vach "4/5 · Cổng phân xử — SAO LƯU CSDL + test chạy LẠI TRÊN MÁY CHỦ, rồi mới đổi bản"
# <ĐIỀN> ssh chạy script triển khai trên máy chủ: giải nén vào thư mục bản mới → sao lưu CSDL và ĐỐI CHỨNG
# bản sao (cp một CSDL WAL là bản sao THIẾU mà không báo gì — phải checkpoint trước) → chạy bộ test trên
# máy chủ → xanh mới đổi liên kết "đang chạy" sang bản mới → khởi động lại dịch vụ. Đỏ thì bản cũ không đụng.
echo "  <ĐIỀN chặng 4: ssh \$MAY_CHU bash /tmp/trien-khai.sh '$NHAN'>"

vach "5/5 · Đối chứng sau triển khai"
# <ĐIỀN> (a) bản đang chạy là gì; (b) KHÓI TRÌNH DUYỆT CHỈ ĐỌC trên production — chạy TỰ ĐỘNG, vì phép đo chỉ
# chạy khi có người nhớ thì sớm muộn không ai nhớ; dùng bản CHỈ ĐỌC vì thao tác ghi vào CSDL người thật không
# được nấp trong lệnh tự động; (c) phiên bản gói THẬT đang chạy trên máy chủ (ghim ≠ đang chạy);
# (d) ghi sổ phát hành — máy chủ chỉ giữ N bản gần nhất, lịch sử phải nằm trong kho mã.
# ⛔ Tới chặng này KHÔNG exit 1: bản mới đã phục vụ rồi, dừng không lùi được gì — nói to để chủ dự án quyết.
echo "  <ĐIỀN chặng 5: khói chỉ đọc · phiên bản gói · sổ phát hành>"

echo; echo "✅ Xong. ⛔ Lưu ý: mã đã lên máy chủ, nhưng chỉ PHỤC VỤ được khi dịch vụ đã bật."
