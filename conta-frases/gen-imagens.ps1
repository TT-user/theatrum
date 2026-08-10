param([string[]]$Only)

$root  = "c:\Users\mathe\Desktop\theatrum\conta-frases"
$posts = Get-Content "$root\posts.json" -Raw -Encoding UTF8 | ConvertFrom-Json

foreach ($p in $posts) {
  if ($Only -and ($Only -notcontains $p.id)) { continue }

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

  Write-Host "=== gerando imagem $($p.id) ($($p.pilar)) ==="
  $out = higgsfield generate create gpt_image_2 --prompt $prompt --aspect_ratio 3:4 --resolution 2k --quality high --wait --json
  $out | Out-File "$root\img\$($p.id).job.json" -Encoding utf8
  Write-Host $out
}
