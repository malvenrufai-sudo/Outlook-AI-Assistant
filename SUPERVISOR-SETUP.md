# Outlook AI Assistant — Quick Setup Guide

## What you need

- Windows PC with **Outlook** installed (Microsoft 365)
- **Python 3.11+** — https://python.org (check "Add to PATH" during install)
- **Node.js 18+** — https://nodejs.org
- A running LLM server (Ollama, LM Studio, etc.)

## Setup (2 minutes)

1. **Extract the zip** to any folder (e.g. `C:\projects\Outlook-AI-Assistant`)
2. **Double-click `setup-windows.ps1`** and choose "Run with PowerShell"
3. When prompted, edit `backend\.env` with your LLM server URL and model name
4. **Restart Outlook** if it was open

## Run

Open **two** PowerShell windows and run:

```powershell
# Window 1
.\start-backend.ps1

# Window 2
.\start-frontend.ps1
```

## Use in Outlook

1. Open any email
2. Click **AI Assistant** on the ribbon (or Add-ins tab)
3. Click **Read Selected Email**
4. Click **Analyze with AI** — wait ~30s for AI response
5. Type any question in the input box to ask about the email

## Troubleshooting

- **"Cannot reach backend"** — make sure both scripts are running
- **Task pane won't load** — restart Outlook after running setup
- **Certificate error** — run setup again as Administrator
