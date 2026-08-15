param([string[]]$Only)

$root  = "c:\Users\mathe\Desktop\theatrum\conta-frases"
$posts = Get-Content "$root\posts.json" -Raw -Encoding UTF8 | ConvertFrom-Json

# Le o result_url do proprio job.json que o gen-imagens.ps1 gravou. A versao
# antiga procurava o job na listagem casando o prompt e filtrando por
# job_type gpt_image_2, o que passou a perder tudo que fosse gerado por
# outro modelo.
$listaCache = $null

foreach ($p in $posts) {
  if ($Only -and ($Only -notcontains $p.id)) { continue }

  $dest = "$root\img\$($p.id).png"
  $meta = "$root\img\$($p.id).job.json"
  if (Test-Path $dest) { Write-Host "$($p.id) ja baixada"; continue }

  $url = $null

  if (Test-Path $meta) {
    $job = (Get-Content $meta -Raw -Encoding UTF8 | ConvertFrom-Json) | Select-Object -First 1
    if ($job.status -eq "completed") { $url = $job.result_url }
    else { Write-Host "$($p.id): $($job.status)"; continue }
  }
  else {
    # sem job.json (gerado fora do script): procura na listagem pelo prompt
    if (-not $listaCache) { $listaCache = higgsfield generate list --json | ConvertFrom-Json }
    $needle = $p.scene.Substring(0, [Math]::Min(60, $p.scene.Length))
    $job = $listaCache |
           Where-Object { $_.params.prompt -like "*$needle*" -and $_.status -eq "completed" } |
           Sort-Object created_at -Descending | Select-Object -First 1
    if ($job) { $url = $job.result_url }
  }

  if (-not $url) { Write-Host "$($p.id): job nao encontrado"; continue }

  Invoke-WebRequest $url -OutFile $dest
  Write-Host "$($p.id): baixada ($([Math]::Round((Get-Item $dest).Length/1MB,1)) MB)"
}
