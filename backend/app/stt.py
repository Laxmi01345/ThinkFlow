import whisper
import tempfile
import os
from app.config import WHISPER_MODEL

model = None


def get_model():
    global model
    if model is None:
        model = whisper.load_model(WHISPER_MODEL)
    return model


async def transcribe_audio(audio):

    suffix = os.path.splitext(audio.filename)[1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:

        tmp.write(await audio.read())

        temp_path = tmp.name

    try:

        result = get_model().transcribe(temp_path)

        transcript = result["text"]

        if not transcript or not transcript.strip():
            raise ValueError("Audio was not clear enough to transcribe")

        return transcript

    except Exception as exc:
        raise RuntimeError(f"Transcription failed: {exc}") from exc

    finally:

        os.remove(temp_path)