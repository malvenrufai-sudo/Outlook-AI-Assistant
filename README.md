# Outlook AI Add-in

An Outlook add-in that uses AI to summarize emails and suggest replies, with a built-in Q&A feature to ask questions about email content.

## Features

- **Email reading** — reads the selected email directly from Outlook
- **AI summary** — generates a concise summary of email content
- **Suggested reply** — drafts a polite, relevant reply
- **Ask questions** — type any question about the email and get an AI-powered answer
- **Local LLM support** — works with Ollama, LM Studio, vLLM, or any OpenAI-compatible server

## Architecture

```
┌─────────────────┐     HTTPS proxy      ┌──────────────────┐
│  Outlook Add-in │ ──────────────────►  │  Vite (port 3000) │
│  (React task    │                      │  ── proxies /api  │
│   pane)         │ ◄──────────────────  │  ── to backend    │
└─────────────────┘                      └────────┬─────────┘
                                                  │
                                                  │ HTTP
                                                  ▼
                                           ┌──────────────────┐
                                           │  FastAPI (8000)  │
                                           │  ── AI routing   │
                                           │  ── validation   │
                                           └────────┬─────────┘
                                                     │
                                                     │ OpenAI API
                                                     ▼
                                            ┌──────────────────┐
                                            │  Local LLM       │
                                            │  (qwen3.6-27b)   │
                                            └──────────────────┘
```

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- A local LLM server (Ollama, LM Studio, vLLM, etc.)

### Backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt

# Configure your LLM
cp .env.example .env
# Edit .env with your server URL, model, and API key

# Start
.venv/Scripts/python.exe -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev  # Starts on https://localhost:3000
```

### Outlook Add-in

1. Install the dev certificate as trusted:
   ```powershell
   Import-Certificate -FilePath "frontend/cert.pem" -CertStoreLocation Cert:\CurrentUser\Root
   ```
2. Copy `manifest.xml` to `%LOCALAPPDATA%\Microsoft\Office\Addins\`
3. Restart Outlook
4. Enable sideloading: **File > Options > Trust Center > Trust Center Settings > Add-ins**
5. Open an email and click **AI Assistant** on the ribbon

## Project Structure

```
outlook-ai-addin/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app
│   │   ├── routers/
│   │   │   └── email.py       # /api/email/analyze endpoint
│   │   ├── models/
│   │   │   ├── schemas.py     # Pydantic models
│   │   │   └── settings.py    # Config from .env
│   │   └── services/
│   │       └── ai.py          # AI provider abstraction
│   ├── .env                   # Your secrets (not committed)
│   ├── .env.example           # Template
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.tsx            # React UI
│   │   └── index.css          # Styles
│   └── vite.config.ts         # Dev server + proxy
└── manifest.xml               # Outlook add-in manifest
```

## API

### POST /api/email/analyze

```json
{
  "subject": "Meeting Notes",
  "body": "The team discussed Q4 targets...",
  "sender": "ceo@company.com",
  "recipients": [],
  "question": "What was the revenue target?"
}
```

Response:

```json
{
  "summary": "Q4 meeting notes highlighting a 5M revenue goal...",
  "suggested_reply": "",
  "answer": "The revenue target is 5M.",
  "provider": "openai",
  "model": "qwen/qwen3.6-27b-fp8"
}
```

## License

Private project
