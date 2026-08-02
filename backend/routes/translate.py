from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from deep_translator import GoogleTranslator

router = APIRouter(prefix="/api/translate", tags=["translate"])

class TranslationRequest(BaseModel):
    text: str
    target_lang: str  # "en", "hi", "mr"

@router.post("/")
def translate_text(request: TranslationRequest):
    try:
        # Map lang keys
        lang_map = {
            "english": "en",
            "hindi": "hi",
            "marathi": "mr",
            "en": "en",
            "hi": "hi",
            "mr": "mr"
        }
        target = lang_map.get(request.target_lang.lower(), "en")
        
        # Translate
        translated = GoogleTranslator(source='auto', target=target).translate(request.text)
        return {"translated_text": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")
