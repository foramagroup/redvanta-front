Write-Host "♻️ RESET COMPLET DU FRONTEND..." -ForegroundColor Yellow

Set-Location "$PSScriptRoot/../../"

# Supprime node_modules
if (Test-Path "node_modules") {
    Write-Host "🗑 Suppression node_modules..."
    Remove-Item -Recurse -Force node_modules
}

# Supprime le cache Vite
if (Test-Path "node_modules/.vite") {
    Write-Host "🧹 Nettoyage cache Vite..."
    Remove-Item -Recurse -Force node_modules/.vite
}

# Supprime le dossier build
if (Test-Path "dist") {
    Write-Host "🗑 Suppression du dossier dist..."
    Remove-Item -Recurse -Force dist
}

Write-Host "📥 Réinstallation des dépendances..."
npm install

Write-Host "✅ Reset terminé !" -ForegroundColor Green
