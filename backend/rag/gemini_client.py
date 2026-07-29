import os
import time
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai.errors import ServerError

from config import LLM_MODEL

BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


class GeminiClient:
    def generate(self, prompt: str) -> str:

        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model=LLM_MODEL,
                    contents=prompt,
                )

                return response.text

            except ServerError:
                if attempt == 2:
                    raise

                print(f"Gemini busy. Retrying ({attempt + 1}/3)...")
                time.sleep(2)