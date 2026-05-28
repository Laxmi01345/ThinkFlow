import tempfile
import os
from sarvamai import SarvamAI
from app.config import SARVAM_API_KEY

client = None


def get_client():
    global client
    if client is None:
        if not SARVAM_API_KEY:
            raise RuntimeError("SARVAM_API_KEY is not configured")
        client = SarvamAI(api_subscription_key=SARVAM_API_KEY)
    return client


def extract_transcript(response):
    if isinstance(response, str):
        return response.strip()

    if isinstance(response, dict):
        for key in ("transcript", "text", "output", "result"):
            value = response.get(key)
            if isinstance(value, str) and value.strip():
                return value.strip()

        nested = response.get("data") or response.get("response")
        if nested is not None:
            transcript = extract_transcript(nested)
            if transcript:
                return transcript

    for attribute in ("transcript", "text", "output", "result"):
        value = getattr(response, attribute, None)
        if isinstance(value, str) and value.strip():
            return value.strip()

    model_dump = getattr(response, "model_dump", None)
    if callable(model_dump):
        return extract_transcript(model_dump())

    return ""


async def transcribe_audio(audio):

    suffix = os.path.splitext(audio.filename)[1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:

        tmp.write(await audio.read())

        temp_path = tmp.name

    try:

        with open(temp_path, "rb") as audio_file:
            result = get_client().speech_to_text.transcribe(
                file=audio_file,
                model="saaras:v3",
                mode="transcribe",
            )

        transcript = extract_transcript(result)

        if not transcript or not transcript.strip():
            raise ValueError("Audio was not clear enough to transcribe")

        return transcript

    except Exception as exc:
        raise RuntimeError(f"Transcription failed: {exc}") from exc

    finally:

        os.remove(temp_path)