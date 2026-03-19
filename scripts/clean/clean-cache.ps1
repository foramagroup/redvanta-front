Write-Host "🧽 Nettoyage des caches..." -ForegroundColor Yellow

Set-Location "$PSScriptRoot/../../"

# cache vite
if (Test-Path "node_modules/.vite") {
    Write-Host "🗑 Suppression cache Vite..."
    Remove-Item -Recurse -Force node_modules/.vite
}

# dist
if (Test-Path "dist") {
    Write-Host "🗑 Suppression du build dist..."
    Remove-Item -Recurse -Force dist
}

# npm cache
Write-Host "🧹 Nettoyage cache npm..."
npm cache clean --force

Write-Host "✔️ Fin du cleanup" -ForegroundColor Green
