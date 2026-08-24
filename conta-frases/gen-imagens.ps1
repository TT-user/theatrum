# 2k = 1744x2336, folgado para o entregavel de 1080x1350. 1k = 872x1168, que
# fica ABAIXO do final e exigiria upscale: quando faltar credito, baixe a
# -Quality antes de baixar a -Resolution.
#
# -Modelo gpt_image_2    7 creditos, exige plano basic ou acima
# -Modelo nano_banana_pro 2 creditos, roda no plano free e aceita referencia
#
# Com nano_banana_pro o script passa uma pintura ja aprovada do MESMO pilar
# como referencia de estilo, senao o look muda de modelo para modelo e a
# grade do perfil perde a unidade.
param(
  [string[]]$Only,
  [int]$Tentativas = 4,
  [ValidateSet('1k', '2k', '4k')][string]$Resolution = '2k',
  [ValidateSet('low', 'medium', 'high')][string]$Quality = 'high',
  [ValidateSet('gpt_image_2', 'nano_banana_pro')][string]$Modelo = 'gpt_image_2'
)

$root  = "c:\Users\mathe\Desktop\theatrum\conta-frases"
$posts  = Get-Content "$root\posts.json"  -Raw -Encoding UTF8 | ConvertFrom-Json
$estilo = Get-Content "$root\estilo.json" -Raw -Encoding UTF8 | ConvertFrom-Json

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

  # estilo vem de estilo.json, lido tambem pelo gen-imagens-gemini.mjs e pelo
  # build-md.js: trocar o look das imagens de fundo e editar aquele arquivo
  $fig = if ($p.surreal) { $estilo.figura.surreal } else { $estilo.figura.padrao }
  $paleta = if ($p.palette) { $p.palette } else { $estilo.paletas.PSObject.Properties[$p.pilar].Value }

  # referencia de estilo: primeira pintura ja baixada do mesmo pilar
  $ref = $null
  if ($Modelo -eq 'nano_banana_pro') {
    $ref = $posts |
      Where-Object { $_.pilar -eq $p.pilar -and $_.id -ne $p.id -and (Test-Path "$root\img\$($_.id).png") } |
      Select-Object -First 1
  }
  $trava = if ($ref) { $estilo.trava_referencia + "`n" } else { "" }

  $prompt = $estilo.template.
    Replace('{abertura}', $estilo.abertura).
    Replace('{cena}', $p.scene).
    Replace('{figura}', $fig).
    Replace('{paleta}', $paleta).
    Replace('{luz}', $estilo.luz).
    Replace('{materia}', $estilo.materia).
    Replace('{respiro}', $estilo.respiro.Replace('{zona}', $p.text_zone)).
    Replace('{clima}', $estilo.clima).
    Replace('{trava}', $trava).
    Replace('{negativos}', $estilo.negativos).
    Replace('{enquadramento}', $estilo.enquadramento)

  # gpt_image_2 tem --quality, nano_banana_pro nao
  $extra = if ($Modelo -eq 'gpt_image_2') { @('--quality', $Quality) } else { @() }
  if ($ref) { $extra += @('--image', "$root\img\$($ref.id).png") }

  # a API devolve 503/403 quando o lote aperta: serializar e tentar de novo
  for ($t = 1; $t -le $Tentativas; $t++) {
    $comRef = if ($ref) { " ref=$($ref.id)" } else { "" }
    Write-Host "=== imagem $($p.id) ($($p.pilar)) $Modelo $Resolution$comRef - tentativa $t ==="
    $out = higgsfield generate create $Modelo --prompt $prompt --aspect_ratio 3:4 --resolution $Resolution @extra --wait --json

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
