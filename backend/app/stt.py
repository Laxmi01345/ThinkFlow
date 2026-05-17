import whisper
import tempfile
import os

model = None


def get_model():
    global model
    if model is None:
        model = whisper.load_model("base")
    return model


async def transcribe_audio(audio):

    suffix = os.path.splitext(audio.filename)[1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:

        tmp.write(await audio.read())

        temp_path = tmp.name

    try:

        result = get_model().transcribe(temp_path)

        transcript = result["text"]

        return transcript

    finally:

        os.remove(temp_path)