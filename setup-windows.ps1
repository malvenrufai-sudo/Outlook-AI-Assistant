# Outlook AI Assistant - One-Click Setup for Windows
# Right-click this file > "Run with PowerShell"

$ErrorActionPreference = "Stop"
$PROJECT = $PSScriptRoot

Write-Host "=== Outlook AI Assistant Setup ===" -ForegroundColor Cyan

# Check execution policy
$policy = Get-ExecutionPolicy -Scope CurrentUser
if ($policy -eq "Restricted") {
    Write-Host "`nPowerShell is blocking scripts. Enabling..." -ForegroundColor Yellow
    Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
}

# 1. Python check
Write-Host "`n[1/5] Checking Python..." -ForegroundColor Yellow
try {
    $py = & python --version 2>&1
    Write-Host "  OK: $py" -ForegroundColor Green
} catch {
    Write-Host "  MISSING: Python not found" -ForegroundColor Red
    Write-Host "  Download from https://python.org (check 'Add to PATH')" -ForegroundColor Yellow
    exit 1
}

# 2. Node check
Write-Host "[2/5] Checking Node.js..." -ForegroundColor Yellow
try {
    $node = & node --version 2>&1
    Write-Host "  OK: $node" -ForegroundColor Green
} catch {
    Write-Host "  MISSING: Node.js not found" -ForegroundColor Red
    Write-Host "  Download from https://nodejs.org (LTS version)" -ForegroundColor Yellow
    exit 1
}

# 3. Setup backend
Write-Host "[3/5] Setting up backend..." -ForegroundColor Yellow
Set-Location "$PROJECT\backend"
if (-not (Test-Path ".venv")) {
    python -m venv .venv
    Write-Host "  Created virtual environment" -ForegroundColor Green
}
& ".venv\Scripts\python.exe" -m pip install -r requirements.txt --quiet
Write-Host "  Backend dependencies installed" -ForegroundColor Green

# 4. Setup frontend
Write-Host "[4/5] Setting up frontend..." -ForegroundColor Yellow
Set-Location "$PROJECT\frontend"
if (-not (Test-Path "node_modules")) {
    npm install --prefer-offline 2>&1 | Out-Null
    Write-Host "  Frontend dependencies installed" -ForegroundColor Green
}

# 5. Configure .env
Write-Host "[5/5] Configuring..." -ForegroundColor Yellow
Set-Location $PROJECT
$envPath = Join-Path $PROJECT "backend\.env"
$examplePath = Join-Path $PROJECT "backend\.env.example"
if (-not (Test-Path $envPath)) {
    Copy-Item $examplePath $envPath
    Write-Host "  Created .env - edit backend\.env with your LLM settings" -ForegroundColor Green
} else {
    Write-Host "  .env already exists" -ForegroundColor Green
}

# Install dev certificate
Write-Host "`nInstalling trusted certificate..." -ForegroundColor Yellow
$certPath = Join-Path $PROJECT "frontend\cert.pem"
try {
    Import-Certificate -FilePath $certPath -CertStoreLocation Cert:\CurrentUser\Root -ErrorAction Stop | Out-Null
    Write-Host "  Certificate installed" -ForegroundColor Green
} catch {
    Write-Host "  WARNING: Certificate install failed" -ForegroundColor Yellow
    Write-Host "  Run this command as Administrator:" -ForegroundColor Yellow
    Write-Host "    Import-Certificate -FilePath '$certPath' -CertStoreLocation Cert:\LocalMachine\Root" -ForegroundColor Cyan
}

# Copy manifest
Write-Host "`nInstalling Outlook manifest..." -ForegroundColor Yellow
$addinsPath = Join-Path $env:LOCALAPPDATA "Microsoft\Office\Addins"
if (-not (Test-Path $addinsPath)) {
    New-Item -ItemType Directory -Path $addinsPath -Force | Out-Null
}
Copy-Item "$PROJECT\manifest.xml" "$addinsPath\manifest.xml" -Force
Write-Host "  Manifest installed at: $addinsPath" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Edit backend\.env with your LLM server URL and API key"
Write-Host "  2. Restart Outlook (if it was open)"
Write-Host "  3. Run .\start-backend.ps1 in one PowerShell window"
Write-Host "  4. Run .\start-frontend.ps1 in another PowerShell window"
Write-Host "  5. Open an email in Outlook and click AI Assistant"
Write-Host ""
