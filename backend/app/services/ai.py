"""AI service abstraction with provider fallback"""
import re
from app.models.settings import settings
from app.models.schemas import AIResponse
from typing import Optional


def get_ai_response(
    subject: str,
    body: str,
    sender: Optional[str] = "",
    recipients: Optional[list[str]] = [],
    question: Optional[str] = "",
) -> AIResponse:
    """Route to configured AI provider with graceful fallback"""
    provider = (settings.AI_PROVIDER or "mock").lower().strip()

    handlers = {
        "mock": _mock_response,
        "openai": _openai_response,
        "azure_openai": _azure_openai_response,
        "ollama": _ollama_response,
    }

    handler = handlers.get(provider, handlers["mock"])

    try:
        return handler(subject, body, sender, recipients or [], question or "")
    except NotImplementedError:
        return _mock_response(subject, body, sender, [], question or "")
    except Exception as exc:
        return AIResponse(
            summary=f"[Error: {exc}] Could not process '{subject[:40]}'. Using fallback summary.",
            suggested_reply="Sorry, the AI service encountered an error. Please try again.",
            answer="",
            provider="mock-fallback",
            model="mock",
        )


def _trim_body(body: str, limit: int = 3000) -> str:
    """Strip HTML and truncate for consistent processing"""
    text = re.sub(r"<[^>]+>", "", body)
    text = re.sub(r"&nbsp;", " ", text)
    text = re.sub(r"&amp;", " ", text)
    text = re.sub(r"&lt;", "<", text)
    text = re.sub(r"&gt;", ">", text)
    text = re.sub(r"&[a-z]+;", " ", text)  # catch-all for other entities
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit]


def _mock_response(subject: str, body: str, sender: str, _recipients: list[str] = [], question: str = "") -> AIResponse:
    """Prototype mock - returns structured placeholder response"""
    clean = _trim_body(body, 500)
    preview = clean[:200]

    summary = (
        f"Email from {sender or 'unknown'} titled '{subject[:60]}'. "
        f"Preview: {preview}{'...' if len(clean) > 200 else ''}"
    )

    answer = ""
    if question.strip():
        answer = f"Based on the email: {preview[:150]} — this appears to be a brief message from {sender}."

    return AIResponse(
        summary=summary,
        suggested_reply=f"Thank you for your email regarding '{subject}'. I'll review this and respond shortly.",
        answer=answer,
        provider="mock",
        model="mock",
    )


def _openai_response(subject: str, body: str, sender: str, recipients: list[str], question: str = "") -> AIResponse:
    from openai import OpenAI

    client = OpenAI(
        api_key=settings.OPENAI_API_KEY,
        base_url=settings.OPENAI_API_BASE,
    )

    clean = _trim_body(body, 3000)
    email_context = (
        f"From: {sender}\n"
        f"Subject: {subject}\n"
        f"Body:\n{clean}"
    )

    if question.strip():
        prompt = (
            f"You are an AI email assistant. Answer the user's question based on the email below.\n\n"
            f"{email_context}\n\n"
            f"User's question: {question}\n\n"
            f"Return ONLY valid JSON with this structure:\n"
            f'{{"summary": "Brief 1-sentence summary of the email", "suggested_reply": "", "answer": "Direct, concise answer to the question based on the email content"}}'
        )
    else:
        prompt = (
            f"You are an AI email assistant. Analyze the following email and respond in JSON.\n\n"
            f"{email_context}\n\n"
            f"Return ONLY valid JSON with this structure:\n"
            f'{{"summary": "2-3 sentence summary of the email", "suggested_reply": "A polite, concise suggested reply", "answer": ""}}'
        )

    resp = client.chat.completions.create(
        model=settings.AI_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=2000,
    )

    msg = resp.choices[0].message
    text = msg.content or getattr(msg, "reasoning", None) or getattr(msg, "refusal", None) or ""
    text = text.replace("```json", "").replace("```", "").strip()

    import json
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        parsed = {}

    return AIResponse(
        summary=parsed.get("summary", "Email analyzed successfully."),
        suggested_reply=parsed.get("suggested_reply", "Thank you for your email. I'll review this and respond shortly."),
        answer=parsed.get("answer", ""),
        provider="openai",
        model=settings.AI_MODEL,
    )


def _azure_openai_response(subject: str, body: str, sender: str, recipients: list[str]) -> AIResponse:
    raise NotImplementedError("Azure OpenAI provider not yet implemented")


def _ollama_response(subject: str, body: str, sender: str, recipients: list[str]) -> AIResponse:
    raise NotImplementedError("Ollama provider not yet implemented")
