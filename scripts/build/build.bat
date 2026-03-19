@echo off
echo 📦 Build du frontend...

REM Vérifie Node.js
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js n'est pas installé !
    exit /b 1
)

cd %~dp0
cd ..\..\

IF NOT EXIST node_modules (
    echo 📥 Installation des dépendances...
    npm install
)

echo 🔨 Génération du build...
npm run build

echo ✅ Build terminé ! Les fichiers sont dans /dist
