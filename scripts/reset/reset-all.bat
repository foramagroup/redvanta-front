@echo off
echo 🧨 FULL RESET KROOTAL...

cd %~dp0
cd ..\..\

echo Nettoyage frontend...
rmdir /s /q frontend\node_modules
rmdir /s /q frontend\dist
del /q frontend\package-lock.json

echo Nettoyage backend...
rmdir /s /q backend\node_modules
rmdir /s /q backend\dist
del /q backend\package-lock.json

echo Reset DB Prisma...
del /q backend\prisma\dev.db
npm --prefix backend install
npx --prefix backend prisma migrate reset -f

echo Réinstallation frontend/backend...
npm --prefix frontend install
npm --prefix backend install

echo Build frontend...
npm --prefix frontend run build

echo 🟢 FULL RESET TERMINE !
