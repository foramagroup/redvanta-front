Write-Host "=== Installing Krootal Review Frontend ===" -ForegroundColor Cyan

# Go to script location
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

Write-Host "Checking Node.js installation..."
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit
}

Write-Host "Node.js version:"
node -v

Write-Host "Installing dependencies..."
cd ../..
npm install

Write-Host "Creating .env file if missing..."
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    @"
VITE_API_URL=http://localhost:4000/api
"@ | Out-File $envFile -Encoding UTF8

    Write-Host ".env file created." -ForegroundColor Green
} else {
    Write-Host ".env already exists." -ForegroundColor Yellow
}

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Start the development server with:"
Write-Host "npm run dev"
