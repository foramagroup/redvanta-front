Write-Host "📦 BUILD DU FRONTEND EN COURS..." -ForegroundColor Cyan

# Vérifie Node.js
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js n'est pas installé. Installe-le avant de continuer." -ForegroundColor Red
    exit 1
}

# Aller dans le dossier frontend
Set-Location "$PSScriptRoot/../../"

# Installer les dépendances si nécessaires
if (!(Test-Path "node_modules")) {
    Write-Host "📥 Installation des dépendances..."
    npm install
}

# Build Vite
Write-Host "🔨 Génération du build..."
npm run build

Write-Host "✅ Build terminé ! Les fichiers sont dans /dist" -ForegroundColor Green
