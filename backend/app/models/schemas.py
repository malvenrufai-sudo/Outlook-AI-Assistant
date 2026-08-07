"""Request/response schemas with validation"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional


class EmailRequest(BaseModel):
    """Request from Outlook add-in"""
    subject: str = Field(..., min_length=0, max_length=500)
    body: str = Field(..., min_length=0, max_length=50_000)
    sender: Optional[str] = Field(default="", max_length=255)
    recipients: Optional[list[str]] = Field(default_factory=list)
    question: Optional[str] = Field(default="", max_length=1000)

    @field_validator("body")
    @classmethod
    def reject_empty_body(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Email body cannot be empty or whitespace-only")
        return v


class AIResponse(BaseModel):
    """Response to Outlook add-in"""
    summary: str
    suggested_reply: Optional[str] = ""
    answer: Optional[str] = ""
    provider: str = "mock"
    model: str = "mock"


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    detail: Optional[str] = None
