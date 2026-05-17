import re

FILLERS = [
    "um", "uh", "umm", "uhh", "hmm",
    "like", "okay", "ok", "right",
    "you know", "i mean", "basically",
    "so yeah", "yeah", "yep"
]

def clean_transcript(text: str) -> str:
    if not text:
        return text

    # Step 1 — lowercase for processing
    cleaned = text.lower().strip()

    # Step 2 — remove filler words
    for filler in FILLERS:
        cleaned = re.sub(rf'\b{filler}\b', '', cleaned)

    # Step 3 — remove double words ("and and" → "and")
    cleaned = re.sub(r'\b(\w+)\s+\1\b', r'\1', cleaned)

    # Step 4 — remove extra spaces
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()

    # Step 5 — remove trailing punctuation
    cleaned = cleaned.rstrip('.,!?')

    return cleaned