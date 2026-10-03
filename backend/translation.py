import re
from typing import Dict

# Common emergency phrases dictionary for fast offline/local translation demo
EMERGENCY_TRANSLATION_MAP = {
    # Hindi / Hinglish
    "madad chahiye": "Help needed immediately",
    "bachao": "Save me / Help",
    "aag lag gayi": "Fire broke out",
    "aag lagi hai": "There is a fire",
    "accident ho gaya": "Accident occurred",
    "sadak durghatna": "Road accident occurred",
    "khoon beh raha hai": "Heavy bleeding reported",
    "chot lagi hai": "Person is injured",
    "behosh ho gaya": "Person became unconscious",
    "dil ka daura": "Heart attack suspected",
    "saans lene me takleef": "Difficulty in breathing",
    "chori ho gayi": "Theft / robbery occurred",
    "humla hua": "Assault / attack occurred",
    "police bhejo": "Send police immediately",
    "ambulance bhejo": "Send ambulance immediately",
    
    # Spanish
    "necesito ayuda": "I need help",
    "hay un incendio": "There is a fire",
    "accidente de tráfico": "Traffic accident",
    "persona inconsciente": "Person is unconscious",
    "mucha sangre": "Severe bleeding",
    
    # French
    "au secours": "Help / Emergency",
    "il y a un incendie": "There is a fire",
    "accident de voiture": "Car accident",
    
    # Kannada / South Indian languages phonetics
    "sahaya beku": "Help needed",
    "benki bidhdhide": "Fire has broken out",
    "apaghatha aagidhe": "Accident has happened"
}

def translate_to_english(text: str, source_lang: str = "auto") -> Dict[str, str]:
    cleaned = text.strip()
    lower = cleaned.lower()
    
    # Check for direct phrase matches
    for phrase, english in EMERGENCY_TRANSLATION_MAP.items():
        if phrase in lower:
            return {
                "original_text": text,
                "translated_text": f"{english} (Details: {cleaned})",
                "detected_language": "Hindi/Regional" if " " in phrase else "Auto-detected"
            }
    
    # If text appears to be already English or has general keywords
    return {
        "original_text": text,
        "translated_text": cleaned,
        "detected_language": "English (or direct transcription)"
    }
