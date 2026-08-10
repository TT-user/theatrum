param([string[]]$Only)

$root = "c:\Users\mathe\Desktop\theatrum\conta-frases"
$ff   = "C:\Users\mathe\AppData\Local\Temp\claude\c--Users-mathe-Desktop-theatrum\356bc590-b4c7-4d31-b45e-1a90c3cb66a8\scratchpad\tools\node_modules\ffmpeg-static\ffmpeg.exe"
$posts = Get-Content "$root\posts.json" -Raw -Encoding UTF8 | ConvertFrom-Json

New-Item -ItemType Directory -Force "$root\final\instagram" | Out-Null
New-Item -ItemType Directory -Force "$root\final\pinterest" | Out-Null

foreach ($p in $posts) {
  if ($Only -and ($Only -notcontains $p.id)) { continue }
  $src = "$root\video\$($p.id).mp4"
  if (-not (Test-Path $src)) { Write-Host "$($p.id): video ausente, pulando"; continue }

  # 4:5 — 1080x1350, corte central a partir do 1080x1440 original
  & $ff -hide_banner -loglevel error -y -i $src -i "$root\overlay\$($p.id)-4x5.png" `
    -filter_complex "[0:v]crop=1080:1350:0:45[v];[v][1:v]overlay=0:0,format=yuv420p" `
    -c:v libx264 -crf 18 -preset slow -movflags +faststart -an `
    "$root\final\instagram\$($p.id)-4x5.mp4"

  # 2:3 — 1000x1500 para os pins
  & $ff -hide_banner -loglevel error -y -i $src -i "$root\overlay\$($p.id)-2x3.png" `
    -filter_complex "[0:v]crop=960:1440:60:0,scale=1000:1500[v];[v][1:v]overlay=0:0,format=yuv420p" `
    -c:v libx264 -crf 18 -preset slow -movflags +faststart -an `
    "$root\final\pinterest\$($p.id)-2x3.mp4"

  # capas estaticas (primeiro quadro) para thumbnail e pin de imagem
  & $ff -hide_banner -loglevel error -y -i "$root\final\instagram\$($p.id)-4x5.mp4" -vframes 1 -q:v 2 "$root\final\instagram\$($p.id)-4x5.jpg"
  & $ff -hide_banner -loglevel error -y -i "$root\final\pinterest\$($p.id)-2x3.mp4"  -vframes 1 -q:v 2 "$root\final\pinterest\$($p.id)-2x3.jpg"

  $mb = [Math]::Round((Get-Item "$root\final\instagram\$($p.id)-4x5.mp4").Length/1MB,1)
  Write-Host "$($p.id): pronto (4:5 $mb MB + 2:3 + capas)"
}
