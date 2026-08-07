"""Email AI router with error handling"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from app.services.ai import get_ai_response
from app.models.schemas import EmailRequest, ErrorResponse

router = APIRouter()


@router.post("/email/analyze")
def analyze_email(request: EmailRequest):
    """Analyze email content and return AI insights"""
    try:
        return get_ai_response(
            subject=request.subject,
            body=request.body,
            sender=request.sender,
            recipients=request.recipients or [],
            question=request.question or "",
        )
    except NotImplementedError as exc:
        raise HTTPException(status_code=501, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {exc}")


@router.post("/email/analyze", status_code=422)
def validation_error(request: EmailRequest):
    """Handle validation errors - not reached, FastAPI intercepts first"""
    pass
