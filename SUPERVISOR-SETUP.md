# Outlook AI Assistant — Complete Setup Guide

This guide walks you through setting up the Outlook AI add-in step by step.
Follow each step in order and confirm it works before moving to the next one.

---

## Prerequisites

Before you start, make sure your PC has these installed. If anything is missing, install it first.

### 1. Microsoft Outlook
- Must be the desktop version (Microsoft 365 / Office 365)
- Open Outlook and make sure you can see your emails
- **Check:** Open Outlook → you should see your inbox

### 2. Python 3.11 or higher
- Download from: https://python.org
- During installation, **check the box that says "Add Python to PATH"**
- **Check:** Open PowerShell (search "PowerShell" in the Start menu) and run:
  ```
  python --version
  ```
  You should see something like `Python 3.11.x` or higher.

### 3. Node.js 18 or higher
- Download from: https://nodejs.org (use the LTS version)
- Just click Next through the installer
- **Check:** In PowerShell, run:
  ```
  node --version
  ```
  You should see something like `v18.x` or higher.

### 4. A running LLM server
- You need a local AI server running (e.g., Ollama, LM Studio, or any OpenAI-compatible server)
- Note down the server URL, model name, and API key — you'll need these later

---

## Step 1: Extract the project

1. Right-click the zip file you received (`Outlook-AI-Assistant.zip`)
2. Choose **"Extract All..."**
3. Extract to a simple path like `C:\Outlook-AI-Assistant`
4. Open the extracted folder in File Explorer

**What you should see:**
```
Outlook-AI-Assistant/
├── backend/
├── frontend/
├── manifest.xml
├── setup-windows.ps1
├── start-backend.ps1
├── start-frontend.ps1
└── SUPERVISOR-SETUP.md  (this file)
```

---

## Step 2: Configure your LLM connection

1. Open the `backend` folder
2. You'll see a file called `.env.example`
3. **Copy it** and rename the copy to `.env`
   - Right-click `.env.example` → Copy → Paste
   - Rename the copy to `.env`
   - If you don't see file extensions, go to View → Show → File name extensions in File Explorer
4. Open `.env` in Notepad (right-click → Open with → Notepad)
5. Fill in your details:

   ```
   AI_PROVIDER=openai
   OPENAI_API_KEY=your-api-key-here
   OPENAI_API_BASE=http://your-llm-server:port/v1
   AI_MODEL=your-model-name
   ```

   Example if using Ollama:
   ```
   AI_PROVIDER=openai
   OPENAI_API_KEY=ollama
   OPENAI_API_BASE=http://localhost:11434/v1
   AI_MODEL=llama3
   ```

6. Save the file

**Check:** Open `.env` and verify your server URL, API key, and model name are correct.

---

## Step 3: Allow PowerShell scripts

Windows blocks running PowerShell scripts by default. To fix this:

1. Open PowerShell (search "PowerShell" in Start menu)
2. Run this command and press Enter:
   ```
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```
3. If prompted, type `Y` and press Enter

**Check:** No error message should appear.

---

## Step 4: Run the setup script

1. Open the project folder in File Explorer (`C:\Outlook-AI-Assistant`)
2. Find `setup-windows.ps1`
3. **Right-click** it → choose **"Run with PowerShell"**
4. A PowerShell window will open and run automatically
5. Watch the progress — it will:
   - Create a Python virtual environment
   - Install backend dependencies
   - Install frontend dependencies
   - Install the HTTPS certificate
   - Copy the manifest to Outlook
6. Wait until you see **"SETUP COMPLETE"** in green text
7. Close the PowerShell window

**Check:** The window should close without any red error messages.

---

## Step 5: Restart Outlook

1. Close Outlook completely
   - Right-click the Outlook icon in the system tray (bottom-right corner)
   - Click **Exit**
2. Wait 10 seconds
3. Reopen Outlook

**Check:** Outlook opens normally with your inbox visible.

---

## Step 6: Enable add-in sideloading in Outlook

1. In Outlook, click **File** (top-left)
2. Click **Options** (bottom-left)
3. Click **Trust Center** (left sidebar)
4. Click **Trust Center Settings...** button
5. Click **Add-ins** (left sidebar)
6. Check the box: **"Allow all sources to sideload Office Add-ins"**
7. Click **OK**, then **OK** again

**Check:** The option is now checked.

---

## Step 7: Start the backend server

1. Open PowerShell
2. Navigate to the project folder:
   ```
   cd C:\Outlook-AI-Assistant
   ```
3. Run:
   ```
   .\start-backend.ps1
   ```
4. Wait for the message: `Uvicorn running on http://127.0.0.1:8000`
5. **Leave this window open** — don't close it

**Check:** You should see green text saying "Application startup complete."

---

## Step 8: Start the frontend server

1. Open a **new** PowerShell window
2. Navigate to the project folder:
   ```
   cd C:\Outlook-AI-Assistant
   ```
3. Run:
   ```
   .\start-frontend.ps1
   ```
4. Wait for the message: `Local: https://localhost:3000/`
5. **Leave this window open** — don't close it

**Check:** You should see green text saying "VITE ready" with the localhost URL.

---

## Step 9: Use the add-in in Outlook

1. In Outlook, open any email by double-clicking it
2. Look at the ribbon at the top — you should see an **AI Assistant** button
   - If you don't see it, click the **Add-ins** tab instead
3. Click **AI Assistant** — a task pane will open on the right
4. Click **"Read Selected Email"** — it will read the email content
5. You'll see the email preview (sender and subject)
6. Click **"Analyze with AI"** — the AI will analyze the email
7. Wait ~30 seconds for the AI response
8. You'll see:
   - A **Summary** of the email
   - A **Suggested Reply**
   - A text box where you can **ask questions** about the email
9. Type a question in the text box and press Enter (e.g., "What date was mentioned?")

---

## Troubleshooting

### "Set-ExecutionPolicy" command is denied
Run this instead (as Administrator):
1. Right-click the Start button → **Terminal (Admin)** or **PowerShell (Admin)**
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned`

### The setup script doesn't run when double-clicking
Right-click `setup-windows.ps1` → **"Run with PowerShell"** instead of double-clicking.

### PowerShell says "cannot be loaded because running scripts is disabled"
Run: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` and press Enter, then try again.

### The AI Assistant button doesn't appear in Outlook
1. Make sure Outlook was restarted after running the setup
2. Check that sideloading is enabled (Step 6)
3. Make sure an email is open (double-click to open, not just selected)

### Task pane shows "Cannot reach backend"
- Make sure BOTH PowerShell windows from Steps 7 and 8 are still open and running
- Check for any error messages in either window
- Restart both scripts if needed (close the windows and run the scripts again)

### "Email body is empty" error
- Make sure you have double-clicked to fully open an email (not just previewed it)
- Try with a different email that has text content

### Certificate error in the task pane
1. Open PowerShell as Administrator
2. Run:
   ```
   Import-Certificate -FilePath "C:\Outlook-AI-Assistant\frontend\cert.pem" -CertStoreLocation Cert:\LocalMachine\Root
   ```
3. Restart Outlook

---

## Summary of what you need to do every time

1. Start the backend (PowerShell window 1): `.\start-backend.ps1`
2. Start the frontend (PowerShell window 2): `.\start-frontend.ps1`
3. Open Outlook → open an email → click AI Assistant
