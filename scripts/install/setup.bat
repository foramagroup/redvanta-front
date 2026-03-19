@echo off
echo === Installing Krootal Review Frontend ===

REM Move to script directory
cd /d "%~dp0"

echo Checking Node.js installation...
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Node.js not found! Install Node.js 18+ from https://nodejs.org/
    pause
    exit /b
)

echo Node version:
node -v

echo Installing dependencies...
cd ..\..
npm install

echo Creating .env file if missing...
if not exist ".env" (
    (
        echo VITE_API_URL=http://localhost:4000/api
    ) > ".env"
    echo .env file created.
) else (
    echo .env already exists.
)

echo Setup complete!
echo Start the dev server with: npm run dev
pause
