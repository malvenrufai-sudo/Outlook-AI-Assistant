# Start the backend server
# Run from project root

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\backend
Write-Host "Starting backend on http://localhost:8000..." -ForegroundColor Green
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
