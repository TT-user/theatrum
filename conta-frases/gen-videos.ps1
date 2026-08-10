param([string[]]$Only, [int]$Tentativas = 4)

$root  = "c:\Users\mathe\Desktop\theatrum\conta-frases"
$posts = Get-Content "$root\posts.json" -Raw -Encoding UTF8 | ConvertFrom-Json

$prompt = @"
The oil painting gently comes alive, as if the canvas itself were breathing.
Clouds drift very slowly across the sky, the water surface shimmers softly, grass and foliage sway in a light breeze.
The small figure stays almost perfectly still, seen from behind, and never turns around, never shows a face.
Locked static camera. No zoom, no pan, no cuts, no camera movement at all.
The thick impasto paint texture and the canvas weave stay visible over the whole frame at all times.
Nothing new enters the frame. No text, no lettering, no watermark, no logos.
Extremely slow, calm, contemplative, dreamlike.
"@

foreach ($p in $posts) {
  if ($Only -and ($Only -notcontains $p.id)) { continue }

  $img  = "$root\img\$($p.id).png"
  $meta = "$root\video\$($p.id).job.json"
  if (-not (Test-Path $img)) { Write-Host "$($p.id): imagem ausente, pulando"; continue }
  if ((Test-Path $meta) -and ((Get-Content $meta -Raw) -match 'result_url.{0,4}http')) {
    Write-Host "$($p.id): ja gerado"; continue
  }

  for ($t = 1; $t -le $Tentativas; $t++) {
    Write-Host "=== video $($p.id) ($($p.pilar)) - tentativa $t ==="
    $out = higgsfield generate create seedance_2_0 `
      --prompt $prompt `
      --start-image $img `
      --aspect_ratio 3:4 `
      --duration 5 `
      --resolution 1080p `
      --mode std `
      --generate_audio false `
      --wait --wait-timeout 25m --json

    $txt = ($out | Out-String)
    if ($txt -match 'result_url.{0,4}http') {
      $txt | Out-File $meta -Encoding utf8
      Write-Host "$($p.id): ok"
      break
    }

    Write-Host "$($p.id): falhou ($($txt.Trim()))"
    if ($t -lt $Tentativas) { Start-Sleep -Seconds (20 * $t) }
  }
}
