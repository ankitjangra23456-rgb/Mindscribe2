import os
from urllib.parse import quote_plus

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

def detect_sql_server_driver() -> str:
    """Dynamically detect installed SQL Server ODBC driver on the host system."""
    env_driver = os.getenv("DB_DRIVER")
    try:
        import pyodbc
        available = pyodbc.drivers()
        if env_driver and env_driver in available:
            return env_driver
        
        # Preference order for SQL Server drivers
        candidates = [
            "ODBC Driver 18 for SQL Server",
            "ODBC Driver 17 for SQL Server",
            "ODBC Driver 13 for SQL Server",
            "SQL Server Native Client 11.0",
            "SQL Server"
        ]
        for candidate in candidates:
            if candidate in available:
                return candidate
    except Exception:
        pass
    return env_driver or "ODBC Driver 17 for SQL Server"

class Settings:
    # Individual DB environment variables for dynamic connection building
    DB_SERVER: str = os.getenv("DB_SERVER", r"ANKIT_JANGRA_1\SQLEXPRESS")
    DB_NAME: str = os.getenv("DB_NAME", "MindscribeDB")
    DB_DRIVER: str = detect_sql_server_driver()
    DB_TRUSTED: bool = os.getenv("DB_TRUSTED", "True").lower() in ("true", "1", "t", "yes")
    DB_USER: str = os.getenv("DB_USER", "")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")

    # Dynamic DATABASE_URL construction if not explicitly overridden
    _custom_db_url = os.getenv("DATABASE_URL")

    @property
    def DATABASE_URL(self) -> str:
        if self._custom_db_url:
            return self._custom_db_url
        
        # Build SQL Server connection string dynamically
        driver_encoded = quote_plus(self.DB_DRIVER)
        server_encoded = quote_plus(self.DB_SERVER)
        
        # Include TrustServerCertificate=yes for SSL compatibility across ODBC 17 and 18
        if self.DB_TRUSTED:
            return f"mssql+pyodbc://{server_encoded}/{self.DB_NAME}?driver={driver_encoded}&trusted_connection=yes&TrustServerCertificate=yes"
        else:
            user_encoded = quote_plus(self.DB_USER)
            pwd_encoded = quote_plus(self.DB_PASSWORD)
            return f"mssql+pyodbc://{user_encoded}:{pwd_encoded}@{server_encoded}/{self.DB_NAME}?driver={driver_encoded}&TrustServerCertificate=yes"

    @property
    def MASTER_DB_URL(self) -> str:
        """Connection URL to master database to auto-create MindscribeDB if missing"""
        driver_encoded = quote_plus(self.DB_DRIVER)
        server_encoded = quote_plus(self.DB_SERVER)
        if self.DB_TRUSTED:
            return f"mssql+pyodbc://{server_encoded}/master?driver={driver_encoded}&trusted_connection=yes&TrustServerCertificate=yes"
        else:
            user_encoded = quote_plus(self.DB_USER)
            pwd_encoded = quote_plus(self.DB_PASSWORD)
            return f"mssql+pyodbc://{user_encoded}:{pwd_encoded}@{server_encoded}/master?driver={driver_encoded}&TrustServerCertificate=yes"

    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")

    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-mindscribe-jwt-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # Configurable LLM Settings for AI Viva
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    LLM_API_URL: str = os.getenv("LLM_API_URL", "https://api.openai.com/v1/chat/completions")
    LLM_MODEL_NAME: str = os.getenv("LLM_MODEL_NAME", "gpt-3.5-turbo")

settings = Settings()
