Write-Host "🧪 Exécution des tests..." -ForegroundColor Cyan

Set-Location "$PSScriptRoot/../../"

if (!(Test-Path "node_modules")) {
    Write-Host "📥 Installation des dépendances..."
    npm install
}

if (Test-Path "coverage") {
    Write-Host "🗑 Suppression ancienne couverture..."
    Remove-Item -Recurse -Force coverage
}

Write-Host "🏃 Lancement des tests Jest/Vitest..."
npm test

Write-Host "📊 Génération du coverage..."
npm run test:coverage

Write-Host "🟢 Tests terminés !" -ForegroundColor Green
