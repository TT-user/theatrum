# 2k = 1744x2336, folgado para o entregavel de 1080x1350. 1k = 872x1168, que
# fica ABAIXO do final e exigiria upscale: quando faltar credito, baixe a
# -Quality antes de baixar a -Resolution.
param(
  [string[]]$Only,
  [int]$Tentativas = 4,
  [ValidateSet('1k', '2k', '4k')][string]$Resolution = '2k',
  [ValidateSet('low', 'medium', 'high')][string]$Quality = 'high'
)

$root  = "c:\Users\mathe\Desktop\theatrum\conta-frases"
$posts = Get-Content "$root\posts.json" -Raw -Encoding UTF8 | ConvertFrom-Json

New-Item -ItemType Directory -Force "$root\img" | Out-Null

foreach ($p in $posts) {
  if ($Only -and ($Only -notcontains $p.id)) { continue }

  # nao regerar o que ja existe: cada imagem custa credito
  $png  = "$root\img\$($p.id).png"
  $meta = "$root\img\$($p.id).job.json"
  if (Test-Path $png) { Write-Host "$($p.id): imagem ja baixada, pulando"; continue }
  if ((Test-Path $meta) -and ((Get-Content $meta -Raw) -match 'result_url.{0,4}http')) {
    Write-Host "$($p.id): job ja concluido, pulando"; continue
  }

  $fig = if ($p.surreal) {
    "Seen from behind, small in frame, face never visible, painted in loose confident brushstrokes."
  } else {
    "Solitary figure seen from behind, small in frame, face never visible, wearing a simple long coat, painted in loose confident brushstrokes."
  }

  $prompt = @"
Textured oil painting on rough linen canvas, naive folk-art style.
$($p.scene).
$fig
$($p.palette).
Soft diffused light, hazy horizon, no hard shadows.
Thick visible impasto texture, canvas weave showing through, subtle film grain, slightly desaturated, muted and dreamlike.
Wide open negative space in the $($p.text_zone) third of the frame, empty and low-contrast, reserved for text overlay.
Painterly, contemplative, quiet, melancholic but hopeful.
No text, no lettering, no watermark, no signature, no faces, no logos.
Vertical portrait composition.
"@

  # a API devolve 503/403 quando o lote aperta: serializar e tentar de novo
  for ($t = 1; $t -le $Tentativas; $t++) {
    Write-Host "=== imagem $($p.id) ($($p.pilar)) $Resolution/$Quality - tentativa $t ==="
    $out = higgsfield generate create gpt_image_2 --prompt $prompt --aspect_ratio 3:4 --resolution $Resolution --quality $Quality --wait --json

    $txt = ($out | Out-String)
    if ($txt -match 'result_url.{0,4}http') {
      $txt | Out-File $meta -Encoding utf8
      Write-Host "$($p.id): ok"
      break
    }

    # saldo insuficiente nao melhora tentando de novo: aborta o lote inteiro
    # em vez de queimar as tentativas restantes de todos os posts
    if ($txt -match 'not_enough_credits') {
      Write-Host "$($p.id): creditos insuficientes, abortando o lote"
      exit 3
    }

    Write-Host "$($p.id): falhou ($($txt.Trim()))"
    if ($t -lt $Tentativas) { Start-Sleep -Seconds (20 * $t) }
  }
}
