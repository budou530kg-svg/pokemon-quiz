# data/roster.txt の一覧から PokeAPI を引いて data/pokemon.js を生成する。
# 使い方: PowerShell で  .\scripts\build-data.ps1
# 取得結果は scripts/.cache に保存され、2 回目以降は通信しない。

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$cacheDir = Join-Path $PSScriptRoot '.cache'
New-Item -ItemType Directory -Force $cacheDir | Out-Null
$utf8 = New-Object Text.UTF8Encoding $false

function Get-Api($url) {
  $key = ($url -replace '^https://pokeapi.co/api/v2/', '') -replace '[/\\:?]', '_'
  $file = Join-Path $cacheDir "$key.json"
  if (-not (Test-Path $file)) {
    $res = Invoke-WebRequest $url -UseBasicParsing
    # Content はエンコーディング判定が怪しいので生バイトから UTF-8 で読む
    $text = $utf8.GetString($res.RawContentStream.ToArray())
    [IO.File]::WriteAllText($file, $text, $utf8)
  }
  [IO.File]::ReadAllText($file, $utf8) | ConvertFrom-Json
}

function Get-JaName($names) {
  $n = $names | Where-Object { $_.language.name -eq 'ja-hrkt' } | Select-Object -First 1
  if (-not $n) { $n = $names | Where-Object { $_.language.name -eq 'ja' } | Select-Object -First 1 }
  if ($n) { $n.name } else { $null }
}

# 同じ form_names を持つフォルムの区別用
$nameOverrides = @{
  'tauros-paldea-combat-breed' = 'ケンタロス（パルデア・コンバット種）'
  'tauros-paldea-blaze-breed'  = 'ケンタロス（パルデア・ブレイズ種）'
  'tauros-paldea-aqua-breed'   = 'ケンタロス（パルデア・ウォーター種）'
}

$slugs = Get-Content (Join-Path $root 'data\roster.txt') -Encoding UTF8 |
  ForEach-Object { $_.Trim() } | Where-Object { $_ -and -not $_.StartsWith('#') }

$pokemon = @()
$abilitySlugs = [ordered]@{}
foreach ($slug in $slugs) {
  $p = Get-Api "https://pokeapi.co/api/v2/pokemon/$slug"
  $species = Get-Api $p.species.url
  $form = Get-Api $p.forms[0].url
  $speciesName = Get-JaName $species.names
  $formName = Get-JaName $form.form_names

  if ($nameOverrides.ContainsKey($slug)) { $name = $nameOverrides[$slug] }
  elseif ($p.is_default -or -not $formName) { $name = $speciesName }
  elseif ($formName.Contains($speciesName) -or $formName.StartsWith('メガ')) { $name = $formName }
  else { $name = "$speciesName（$formName）" }
  $name = $name.Replace('Ｘ', 'X').Replace('Ｙ', 'Y').Replace('Ｚ', 'Z')

  $abilities = @($p.abilities | Sort-Object slot | ForEach-Object { $_.ability.name })
  foreach ($a in $abilities) { $abilitySlugs[$a] = $true }

  $pokemon += [ordered]@{
    id        = $slug
    name      = $name
    types     = @($p.types | Sort-Object slot | ForEach-Object { $_.type.name })
    abilities = $abilities
    mega      = [bool]($slug -match '-mega')
    image     = $p.sprites.other.'official-artwork'.front_default
  }
  Write-Host "$slug -> $name"
}

$abilities = [ordered]@{}
$review = @()
foreach ($a in $abilitySlugs.Keys) {
  $ab = Get-Api "https://pokeapi.co/api/v2/ability/$a"
  $ja = Get-JaName $ab.names
  $effect = ($ab.effect_entries | Where-Object { $_.language.name -eq 'en' } | Select-Object -First 1).short_effect
  if (-not $effect) { $effect = ($ab.flavor_text_entries | Where-Object { $_.language.name -eq 'en' } | Select-Object -Last 1).flavor_text }
  $abilities[$a] = $ja
  $review += "$a`t$ja`t$($effect -replace '\s+', ' ')"
}

$json = @{ pokemon = $pokemon; abilityNames = $abilities } | ConvertTo-Json -Depth 5 -Compress
$js = "// scripts/build-data.ps1 が生成。手で編集しない。`nwindow.GENERATED_DATA = $json;`n"
[IO.File]::WriteAllText((Join-Path $root 'data\pokemon.js'), $js, $utf8)
[IO.File]::WriteAllLines((Join-Path $PSScriptRoot 'abilities-review.tsv'), $review, $utf8)
Write-Host "pokemon: $($pokemon.Count), abilities: $($abilities.Count)"
