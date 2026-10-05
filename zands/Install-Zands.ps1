$ErrorActionPreference = 'Stop'
$target = 'C:\Users\ianla\Documents\games\zands'
$source = $PSScriptRoot
if ([IO.Path]::GetFullPath($source).TrimEnd('\') -eq [IO.Path]::GetFullPath($target).TrimEnd('\')) {
    Write-Host 'The assets are already in the correct folder.'
    Start-Process (Join-Path $target 'asset-preview.html')
    exit 0
}
New-Item -ItemType Directory -Force -Path $target | Out-Null
$copied = 0
$skipped = 0
Get-ChildItem -LiteralPath $source -Recurse -File | ForEach-Object {
    $relative = $_.FullName.Substring($source.Length).TrimStart('\')
    $destination = Join-Path $target $relative
    if (Test-Path -LiteralPath $destination) { $skipped++ }
    else {
        New-Item -ItemType Directory -Force -Path (Split-Path $destination -Parent) | Out-Null
        Copy-Item -LiteralPath $_.FullName -Destination $destination
        $copied++
    }
}
Write-Host "Copied $copied files to $target. Skipped $skipped existing files."
Write-Host 'No existing files were overwritten.'
Start-Process (Join-Path $target 'asset-preview.html')
