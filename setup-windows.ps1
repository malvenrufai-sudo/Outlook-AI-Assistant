# Outlook AI Assistant — One-Click Setup for Windows
# Run this in PowerShell (right-click > Run with PowerShell)

$ErrorActionPreference = "Stop"
$PROJECT = $PSScriptRoot

Write-Host "=== Outlook AI Assistant Setup ===" -ForegroundColor Cyan

# 1. Python check
Write-Host "`n[1/5] Checking Python..." -ForegroundColor Yellow
try {
    $py = & python --version 2>&1
    Write-Host "  Found: $py" -ForegroundColor Green
} catch {
    Write-Host "  Python not found. Please install Python 3.11+ from https://python.org" -ForegroundColor Red
    exit 1
}

# 2. Node check
Write-Host "[2/5] Checking Node.js..." -ForegroundColor Yellow
try {
    $node = & node --version 2>&1
    Write-Host "  Found: $node" -ForegroundColor Green
} catch {
    Write-Host "  Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# 3. Setup backend
Write-Host "[3/5] Setting up backend..." -ForegroundColor Yellow
Set-Location $PROJECT\backend
if (!(Test-Path ".venv")) {
    python -m venv .venv
    Write-Host "  Created virtual environment" -ForegroundColor Green
}
.venv\Scripts\python.exe -m pip install -r requirements.txt
Write-Host "  Backend dependencies installed" -ForegroundColor Green

# 4. Setup frontend
Write-Host "[4/5] Setting up frontend..." -ForegroundColor Yellow
Set-Location $PROJECT\frontend
if (!(Test-Path "node_modules")) {
    npm install
    Write-Host "  Frontend dependencies installed" -ForegroundColor Green
}

# 5. Configure .env
Write-Host "[5/5] Configuring..." -ForegroundColor Yellow
if (!(Test-Path "$PROJECT\backend\.env")) {
    Copy-Item "$PROJECT\backend\.env.example" "$PROJECT\backend\.env"
    Write-Host "  Created .env from template — edit it with your LLM settings" -ForegroundColor Green
}

# Install dev certificate
Write-Host "`nInstalling trusted certificate..." -ForegroundColor Yellow
try {
    Import-Certificate -FilePath "$PROJECT\frontend\cert.pem" -CertStoreLocation Cert:\CurrentUser\Root -ErrorAction Stop
    Write-Host "  Certificate installed" -ForegroundColor Green
} catch {
    Write-Host "  Certificate install failed (may need admin). Install manually:" -ForegroundColor Yellow
    Write-Host "  Import-Certificate -FilePath '$PROJECT\frontend\cert.pem' -CertStoreLocation Cert:\LocalMachine\Root" -ForegroundColor Yellow
}

# Copy manifest
Write-Host "`nInstalling Outlook manifest..." -ForegroundColor Yellow
$addins = "$env:LOCALAPPDATA\Microsoft\Office\Addins"
if (!(Test-Path $addins)) {
    New-Item -ItemType Directory -Path $addins -Force | Out-Null
}
Copy-Item "$PROJECT\manifest.xml" "$addins\manifest.xml" -Force
Write-Host "  Manifest copied to $addins" -ForegroundColor Green

Write-Host "`n=== SETUP COMPLETE ===" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend\.env with your LLM server details"
Write-Host "2. Restart Outlook (if it was open)"
Write-Host "3. Run 'start-backend.ps1' and 'start-frontend.ps1' to launch"
Write-Host "4. Open an email in Outlook and click AI Assistant"
