import os
from dotenv import load_dotenv

load_dotenv()

CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY")
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
DATABASE_URL = os.getenv("DATABASE_URL")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "tiny")
CEREBRAS_MODEL = os.getenv("CEREBRAS_MODEL", "gpt-oss-120b")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")