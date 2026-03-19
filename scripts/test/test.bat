@echo off
echo 🧪 Exécution des tests...

cd %~dp0
cd ..\..\

if not exist node_modules (
    echo 📥 Installation des dépendances...
    npm install
)

if exist coverage (
    echo 🗑 Suppression ancienne couverture...
    rmdir /s /q coverage
)

echo 🏃 Lancement des tests...
npm test

echo 📊 Génération du coverage...
npm run test:coverage

echo 🟢 Tests terminés !
