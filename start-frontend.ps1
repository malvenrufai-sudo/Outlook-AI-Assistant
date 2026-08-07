# Start the frontend dev server
# Run from project root

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\frontend
Write-Host "Starting frontend on https://localhost:3000..." -ForegroundColor Green
npx vite --port 3000 --strictPort
