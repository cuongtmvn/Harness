# mo-tuong-lua.mau.ps1 — MẪU mở tường lửa Windows cho app desktop có mạng LAN. Chạy MỘT lần trên MỖI máy (cần quyền quản trị).
# Chép vào dự án, điền 3 tham số dưới (hoặc truyền khi gọi). Nguồn: Mười Ngón 16/10/2026 (gói desktop, mục 1).
#
# Vì sao: lần đầu app mở cổng, Windows hỏi tường lửa; hộp bị Cancel/đóng ⇒ Windows tự tạo luật CHẶN mọi kết nối vào app
# ⇒ máy kia không tìm thấy (UDP) và nhập IP thì "connection timeout" (TCP). Ping vẫn thông vì ping không dùng cổng app.
# Script: (1) xoá luật CHẶN của app; (2) cho phép đúng các cổng, CHỈ mạng Riêng tư (Private); (3) in lại luật để kiểm.
# ⛔ Không mở cho mạng Công cộng. Chạy: chuột phải → "Run with PowerShell", hoặc PowerShell (Admin): .\mo-tuong-lua.mau.ps1

param(
  [string]$App  = "$env:LOCALAPPDATA\<TenApp>\<tenapp>.exe",   # đường dẫn .exe đã cài
  [string]$Ten  = "<Tên app> - LAN",                            # tiền tố tên luật
  [int[]] $Tcp  = @(),                                          # ví dụ @(47811)
  [int[]] $Udp  = @()                                           # ví dụ @(47810)
)

$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $admin) {
  Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`" -App `"$App`" -Ten `"$Ten`""
  exit
}
Write-Host "== $Ten: mở tường lửa ==" -ForegroundColor Cyan
Write-Host "App: $App"
if (-not (Test-Path $App)) { Write-Host "⚠️ Không thấy app ở đường dẫn trên — vẫn tạo luật theo đường dẫn này." -ForegroundColor Yellow }

$exe = [IO.Path]::GetFileNameWithoutExtension($App)
# 1. Xoá luật CHẶN gắn với app (mọi bản, mọi đường dẫn)
$chan = Get-NetFirewallApplicationFilter | Where-Object { $_.Program -like "*$exe*.exe" } | Get-NetFirewallRule | Where-Object { $_.Action -eq 'Block' }
foreach ($r in $chan) { Write-Host "Xoá luật CHẶN: $($r.DisplayName) ($($r.Profile))"; Remove-NetFirewallRule -Name $r.Name }

# 2. Cho phép đúng cổng, chỉ mạng Riêng tư
Get-NetFirewallRule -DisplayName "$Ten*" -ErrorAction SilentlyContinue | Remove-NetFirewallRule
foreach ($p in $Tcp) { New-NetFirewallRule -DisplayName "$Ten (TCP $p)" -Direction Inbound -Action Allow -Program $App -Protocol TCP -LocalPort $p -Profile Private | Out-Null }
foreach ($p in $Udp) { New-NetFirewallRule -DisplayName "$Ten (UDP $p)" -Direction Inbound -Action Allow -Program $App -Protocol UDP -LocalPort $p -Profile Private | Out-Null }

# 3. In lại để kiểm
Write-Host "`nLuật hiện có cho app:" -ForegroundColor Cyan
Get-NetFirewallApplicationFilter | Where-Object { $_.Program -like "*$exe*.exe" } | Get-NetFirewallRule | Select-Object DisplayName, Direction, Action, Profile, Enabled | Format-Table -AutoSize
Write-Host "Kiểu mạng hiện tại (phải là Private):" -ForegroundColor Cyan
Get-NetConnectionProfile | Select-Object Name, NetworkCategory | Format-Table -AutoSize
Write-Host "Xong. Chạy lại script này trên máy còn lại." -ForegroundColor Green
