# csp-tauri.mau.py — MẪU kịch bản dựng lại CSP có nonce của Tauri để kiểm bố cục trong điều kiện app thật (gói desktop-tauri, mục 1).
# Chép vào App/e2e/ của dự án và THAY: đường dẫn dist, luồng thao tác (các pg.fill/pg.click bên dưới là của Mười Ngón), các check cuối.
# Giữ nguyên phần dựng CSP (meta Content-Security-Policy có nonce + nonce cho <style>) — đó là điều kiện Tauri tạo ra mà Chromium thường không có.
# Môi trường ghi vào báo cáo: "Chromium GIẢ LẬP CSP Tauri" — không ghi "app thật". Cần: playwright, npm run build:web trước.
#
# Lỗi Huynh thấy 16/10 trong app thật: 87 phím chồng một chỗ, Mèo phình to. Nguyên nhân: Tauri chèn nonce vào CSP, có nonce
# thì trình duyệt bỏ qua 'unsafe-inline' ⇒ mọi style="…" viết trong HTML bị chặn. Chromium thường không có CSP này nên
# các kịch bản khác không bắt được. Kịch bản này dựng lại đúng điều kiện đó: chép dist/, gắn CSP có nonce và nonce cho khối
# <style> (như Tauri làm), rồi kiểm bàn phím và hình vẫn đúng.
# Chạy: npm run build:web rồi python App/e2e/csp-tauri.py <thư mục ảnh>. Môi trường: Chromium (TD) GIẢ LẬP CSP Tauri.
import os, shutil, sys, tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'
DIST = Path(__file__).resolve().parents[1] / 'web' / 'dist'
CHROME = os.environ.get('CHROME', '/opt/pw-browsers/chromium-1194/chrome-linux/chrome')
ok, errs = {}, []
def check(name, cond): ok[name] = bool(cond)

tmp = Path(tempfile.mkdtemp()) / 'dist'
shutil.copytree(DIST, tmp)
html = (tmp / 'index.html').read_text(encoding='utf-8')
CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' 'nonce-tauri123'; img-src 'self' data:"
html = html.replace('<meta charset="utf-8">', f'<meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="{CSP}">', 1)
html = html.replace('<style>', '<style nonce="tauri123">', 1)
(tmp / 'index.html').write_text(html, encoding='utf-8')

with sync_playwright() as p:
    br = p.chromium.launch(executable_path=CHROME if os.path.exists(CHROME) else None)
    pg = br.new_page(viewport={'width': 1495, 'height': 1167})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(tmp.joinpath('index.html').as_uri())
    pg.fill('#p1', 'bome123'); pg.fill('#p2', 'bome123'); pg.click('#ok'); pg.wait_for_selector('#code'); pg.check('#saved'); pg.click('#next')
    pg.click('#add'); pg.fill('#name', 'Na'); pg.fill('#age', '13'); pg.dispatch_event('#age', 'change'); pg.fill('#pw', 'nana2026'); pg.click('#ok')
    pg.click('#out'); pg.click('.profile'); pg.fill('#pw', 'nana2026'); pg.click('#ok'); pg.wait_for_selector('#skip'); pg.click('#skip')
    pg.click('#luyen'); pg.click('#tiep'); pg.wait_for_selector('.ds-buoc'); pg.wait_for_timeout(400)
    r = pg.evaluate("""() => {
      const t = document.createElement('div'); t.innerHTML = '<span style="display:inline-block;width:77px">x</span>'; document.documentElement.appendChild(t);
      const blocked = t.firstElementChild.getBoundingClientRect().width !== 77; t.remove();
      const keys = [...document.querySelectorAll('.kb .key')].map((k) => k.getBoundingClientRect());
      const vo = document.querySelector('.kb-vo').getBoundingClientRect();
      return { blocked, pos: new Set(keys.map((k) => Math.round(k.left) + ',' + Math.round(k.top))).size, n: keys.length,
        ratio: vo.width / vo.height, meo: document.querySelector('#meo').getBoundingClientRect().width }; }""")
    check('dieu kien Tauri da dung lai: CSP co nonce chan style viet thang', r['blocked'])
    check(f'87 phim o 87 cho khac nhau ({r["pos"]}/{r["n"]})', r['n'] == 87 and r['pos'] == 87)
    check(f'vo ban phim van ty le 359:137 ({r["ratio"]:.3f})', abs(r['ratio'] - 359 / 137) < 0.05)
    check(f'Meo dung co 84px ({r["meo"]:.0f})', abs(r['meo'] - 84) < 2)
    pg.screenshot(path=f'{OUT}/csp-tauri-bai.png')
    # Lặn biển: cá có style="width:…" chèn động trong ván
    pg.click('#back'); pg.click('#home'); pg.wait_for_selector('#sea'); pg.click('#sea'); pg.wait_for_selector('.ca-svg'); pg.wait_for_timeout(300)
    w = pg.evaluate("Math.round(document.querySelector('.ca-svg').getBoundingClientRect().width)")
    check(f'ca Lan bien chen dong van dung co ({w}px)', 40 <= w <= 90)
    br.close()
shutil.rmtree(tmp.parent, ignore_errors=True)
for k, v in ok.items(): print(('ĐẠT  ' if v else 'TRƯỢT') + ' ' + k)
print('LOI JS:', '; '.join(errs) if errs else 'khong')
print('KET QUA:', 'DAT' if all(ok.values()) and not errs else 'KHONG DAT')
