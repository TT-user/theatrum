$root  = "c:\Users\mathe\Desktop\theatrum\conta-frases"
$posts = Get-Content "$root\posts.json" -Raw -Encoding UTF8 | ConvertFrom-Json

$all = higgsfield generate list --json | ConvertFrom-Json

foreach ($p in $posts) {
  $dest = "$root\img\$($p.id).png"
  if (Test-Path $dest) { Write-Host "$($p.id) ja baixada"; continue }

  $needle = $p.scene.Substring(0, [Math]::Min(60, $p.scene.Length))
  $job = $all | Where-Object { $_.job_type -eq "gpt_image_2" -and $_.params.prompt -like "*$needle*" } |
         Sort-Object created_at -Descending | Select-Object -First 1

  if (-not $job) { Write-Host "$($p.id): job nao encontrado"; continue }
  if ($job.status -ne "completed") { Write-Host "$($p.id): $($job.status)"; continue }

  Invoke-WebRequest $job.result_url -OutFile $dest
  Write-Host "$($p.id): baixada ($([Math]::Round((Get-Item $dest).Length/1MB,1)) MB)"
}
