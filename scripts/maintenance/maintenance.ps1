Write-Host "🧰 MAINTENANCE FRONTEND..." -ForegroundColor Cyan

Set-Location "$PSScriptRoot/../../"

# Vérif Node
if (!(Get-Command node.exe -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js non installé" -ForegroundColor Red
    exit 1
}

# Vérif NPM
if (!(Get-Command npm.exe -ErrorAction SilentlyContinue)) {
    Write-Host "❌ NPM non installé" -ForegroundColor Red
    exit 1
}

# Nettoyage cache npm
Write-Host "🧹 Purge du cache npm..."
npm cache verify
npm cache clean --force

# Nettoyage node_modules/.vite
if (Test-Path "node_modules/.vite") {
    Write-Host "🧹 Suppression du cache Vite..."
    Remove-Item -Recurse -Force node_modules/.vite
}

# Cleanup lockfiles
foreach ($f in @("package-lock.json", "pnpm-lock.yaml", "yarn.lock")) {
    if (Test-Path $f) {
        Write-Host "🗑 Suppression du lockfile $f..."
        Remove-Item -Force $f
    }
}

Write-Host "📥 Réinstallation propre des dépendances..."
npm install

Write-Host "🟢 Maintenance terminée !" -ForegroundColor Green
