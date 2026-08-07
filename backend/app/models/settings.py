from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Outlook AI Add-in Backend"
    DEBUG: bool = True

    # Server
    HOST: str = "localhost"
    PORT: int = 8000

    # CORS - which origins can call this backend
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://outlook.office.com",
        "https://outlook.live.com",
        "https://outlook.office365.com",
        "https://outlook.office.net",
        "https://outlook-s.df.office.net",
    ]

    # AI Service (pluggable - starts as mock)
    AI_PROVIDER: str = "mock"  # mock | openai | azure_openai | ollama
    AI_MODEL: str = "mock"

    # OpenAI (for later)
    OPENAI_API_KEY: str = ""
    OPENAI_API_BASE: str = "https://api.openai.com/v1"

    # Azure OpenAI (for later)
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_DEPLOYMENT: str = ""

    # Ollama (for later)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3"

    # Microsoft Entra ID (for later - auth)
    AZURE_TENANT_ID: str = ""
    AZURE_CLIENT_ID: str = ""
    AZURE_CLIENT_SECRET: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
