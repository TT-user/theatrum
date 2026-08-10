$root  = "c:\Users\mathe\Desktop\theatrum\conta-frases"
$posts = Get-Content "$root\posts.json" -Raw -Encoding UTF8 | ConvertFrom-Json

foreach ($p in $posts) {
  $dest = "$root\video\$($p.id).mp4"
  $meta = "$root\video\$($p.id).job.json"
  if (Test-Path $dest) { Write-Host "$($p.id) ja baixado"; continue }
  if (-not (Test-Path $meta)) { Write-Host "$($p.id): ainda gerando"; continue }

  $job = (Get-Content $meta -Raw -Encoding UTF8 | ConvertFrom-Json) | Select-Object -First 1
  if ($job.status -ne "completed") { Write-Host "$($p.id): $($job.status)"; continue }

  Invoke-WebRequest $job.result_url -OutFile $dest
  Write-Host "$($p.id): baixado ($([Math]::Round((Get-Item $dest).Length/1MB,1)) MB)"
}
