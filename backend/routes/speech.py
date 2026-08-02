from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from gtts import gTTS
import io

router = APIRouter(prefix="/api/speech", tags=["speech"])

class TTSRequest(BaseModel):
    text: str
    lang: str = "en"  # "en", "hi", "mr"

@router.post("/tts")
def text_to_speech(request: TTSRequest):
    try:
        # Map lang to gTTS compatible language codes
        lang_map = {
            "english": "en",
            "hindi": "hi",
            "marathi": "mr",
            "en": "en",
            "hi": "hi",
            "mr": "mr"
        }
        gtts_lang = lang_map.get(request.lang.lower(), "en")
        
        # Generate speech
        tts = gTTS(text=request.text, lang=gtts_lang, slow=False)
        
        # Save to memory buffer
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        
        return Response(content=fp.read(), media_type="audio/mpeg")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS Generation failed: {str(e)}")
