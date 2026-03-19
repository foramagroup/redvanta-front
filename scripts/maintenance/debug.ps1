Write-Host "🐞 DEBUG MODE — ANALYSE DU FRONTEND…" -ForegroundColor Cyan

Set-Location "$PSScriptRoot/../../"

Write-Host "`n🔎 Vérification Node.js…" -ForegroundColor Yellow
node -v
if ($LASTEXITCODE -ne 0) { Write-Host "❌ Node n'est pas installé !" -ForegroundColor Red; exit 1 }

Write-Host "`n🔎 Vérification npm…" -ForegroundColor Yellow
npm -v
if ($LASTEXITCODE -ne 0) { Write-Host "❌ NPM n'est pas installé !" -ForegroundColor Red; exit 1 }

Write-Host "`n📦 Vérification des dépendances…" -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "⚠️ node_modules manquant → installation…"
    npm install
}

Write-Host "`n🧪 Test import ES modules cassés…" -ForegroundColor Yellow
try {
    node -e "import('./src/main.jsx').then(()=>console.log('✔️ Imports OK')).catch(e=>console.error(e))"
} catch {
    Write-Host "❌ ERREUR IMPORT" -ForegroundColor Red
}

Write-Host "`n🌐 Vérification port 5173…" -ForegroundColor Yellow
$portUsed = (Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue)
if ($portUsed) {
    Write-Host "⚠️ Port 5173 occupé par PID $($portUsed.OwningProcess)" -ForegroundColor Red
}

Write-Host "`n🔗 Vérification du build Vite…"
npm run build

Write-Host "`n🧹 Nettoyage caches éventuels…"
npm cache verify

Write-Host "`n🟢 DEBUG TERMINÉ" -ForegroundColor Green
