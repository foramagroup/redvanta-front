@echo off
echo ♻️ RESET COMPLET DU FRONTEND...

cd %~dp0
cd ..\..\

IF EXIST node_modules (
    echo 🗑 Suppression node_modules...
    rmdir /s /q node_modules
)

IF EXIST dist (
    echo 🗑 Suppression du dossier dist...
    rmdir /s /q dist
)

echo 📥 Réinstallation des dépendances...
npm install

echo ✅ Reset terminé !
