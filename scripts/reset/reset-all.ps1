Write-Host "🧨 FULL RESET DU PROJET KROOTAL…" -ForegroundColor Red

# root project
$root = "$PSScriptRoot/../../"
Set-Location $root

# FRONTEND
Write-Host "`n🧹 Clean Frontend…" -ForegroundColor Yellow
if (Test-Path "frontend/node_modules") { Remove-Item -Recurse -Force frontend/node_modules }
if (Test-Path "frontend/dist") { Remove-Item -Recurse -Force frontend/dist }
if (Test-Path "frontend/package-lock.json") { Remove-Item -Force frontend/package-lock.json }

# BACKEND
Write-Host "`n🧹 Clean Backend…" -ForegroundColor Yellow
if (Test-Path "backend/node_modules") { Remove-Item -Recurse -Force backend/node_modules }
if (Test-Path "backend/dist") { Remove-Item -Recurse -Force backend/dist }
if (Test-Path "backend/package-lock.json") { Remove-Item -Force backend/package-lock.json }

# PRISMA DATABASE
Write-Host "`n💣 Reset DB Prisma…" -ForegroundColor Yellow
if (Test-Path "backend/prisma/dev.db") {
    Remove-Item -Force backend/prisma/dev.db
}
npm --prefix backend install
npx --prefix backend prisma migrate reset -f

# Reinstall everything
Write-Host "`n📦 Réinstallation Frontend + Backend…" -ForegroundColor Cyan
npm --prefix frontend install
npm --prefix backend install

Write-Host "`n🧱 Rebuild Frontend…" -ForegroundColor Yellow
npm --prefix frontend run build

Write-Host "`n🟢 FULL RESET TERMINÉ" -ForegroundColor Green
