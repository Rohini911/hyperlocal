import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, Globe, Check, AlertCircle, RefreshCw, X } from "lucide-react";
import { translationApi } from "../services/api";

const SUPPORTED_LANGUAGES = [
  { code: "hi-IN", name: "Hindi (हिंदी)" },
  { code: "en-US", name: "English (US/UK)" },
  { code: "en-IN", name: "English (India)" },
  { code: "es-ES", name: "Spanish (Español)" },
  { code: "fr-FR", name: "French (Français)" },
  { code: "ta-IN", name: "Tamil (தமிழ்)" },
  { code: "te-IN", name: "Telugu (తెలుగు)" },
  { code: "kn-IN", name: "Kannada (ಕನ್ನಡ)" },
  { code: "bn-IN", name: "Bengali (বাংলা)" }
];

export default function VoiceInputModal({ isOpen, onClose, onConfirmText }) {
  const [selectedLang, setSelectedLang] = useState("hi-IN");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check Speech Recognition API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechRecognition(false);
    }
  }, []);

  const startListening = () => {
    setErrorMsg("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrorMsg("Web Speech API is not supported in this browser. You can type directly below.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLang;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === "not-allowed") {
          setErrorMsg("Microphone access was denied. Please allow microphone permissions or type below.");
        } else {
          setErrorMsg(`Voice input error: ${event.error}. You can edit text manually.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Automatically trigger translation when speech stops
        if (transcript.trim()) {
          handleTranslate(transcript);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setErrorMsg("Failed to start voice recognition. Please try typing directly.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    if (transcript.trim()) {
      handleTranslate(transcript);
    }
  };

  const handleTranslate = async (textToTranslate) => {
    const text = textToTranslate || transcript;
    if (!text.trim()) return;

    setIsTranslating(true);
    setErrorMsg("");
    try {
      const res = await translationApi.translate(text, selectedLang);
      setTranslatedText(res.translated_text);
    } catch (err) {
      // Fallback: use original text
      setTranslatedText(text);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleConfirm = () => {
    const finalText = translatedText.trim() || transcript.trim();
    if (!finalText) {
      setErrorMsg("Please speak or enter text before confirming.");
      return;
    }
    onConfirmText(finalText, transcript);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ maxWidth: "560px", width: "100%", padding: "24px", position: "relative" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(59, 130, 246, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3b82f6" }}>
              <Mic size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#f8fafc" }}>Voice Emergency Input</h3>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Speak in your native language & convert to English</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Language selector */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "0.8rem", color: "#cbd5e1", display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
            <Globe size={14} /> Select Spoken Language:
          </label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            disabled={isListening}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "#1e293b",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#f8fafc",
              borderRadius: "10px",
              fontSize: "0.9rem"
            }}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mic Visualizer & Trigger */}
        <div style={{
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px dashed rgba(255,255,255,0.15)",
          borderRadius: "14px",
          padding: "24px 16px",
          textAlign: "center",
          marginBottom: "16px"
        }}>
          <button
            type="button"
            onClick={isListening ? stopListening : startListening}
            className={isListening ? "pulse-emergency" : ""}
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              border: "none",
              background: isListening ? "linear-gradient(135deg, #ef4444, #b91c1c)" : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              color: "white",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: isListening ? "0 0 25px rgba(239, 68, 68, 0.6)" : "0 4px 15px rgba(59, 130, 246, 0.4)",
              transition: "all 0.2s ease"
            }}
          >
            {isListening ? <MicOff size={32} /> : <Mic size={32} />}
          </button>

          <p style={{ marginTop: "12px", fontSize: "0.9rem", fontWeight: "600", color: isListening ? "#f87171" : "#94a3b8" }}>
            {isListening ? "Listening... Speak now (Click to stop)" : "Click microphone to start speaking"}
          </p>

          {/* Preset quick test phrases */}
          <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "#64748b", width: "100%", marginBottom: "2px" }}>Quick Test Presets (Click to simulate):</span>
            <button
              type="button"
              onClick={() => { setTranscript("Accident ho gaya hai, khoon beh raha hai jaldi aao"); handleTranslate("Accident ho gaya hai, khoon beh raha hai jaldi aao"); }}
              style={{ fontSize: "0.75rem", padding: "4px 8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#93c5fd", cursor: "pointer" }}
            >
              "Accident ho gaya..." (Hindi)
            </button>
            <button
              type="button"
              onClick={() => { setTranscript("Ghar me aag lag gayi hai aur smoke bohot hai"); handleTranslate("Ghar me aag lag gayi hai aur smoke bohot hai"); }}
              style={{ fontSize: "0.75rem", padding: "4px 8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "#fdba74", cursor: "pointer" }}
            >
              "Aag lag gayi..." (Fire)
            </button>
          </div>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "10px 14px", borderRadius: "10px", color: "#fca5a5", fontSize: "0.85rem", marginBottom: "14px" }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 5: Original transcription display */}
        <div style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
            <label style={{ fontSize: "0.8rem", color: "#94a3b8" }}>1. Original Spoken Transcript:</label>
            {transcript && (
              <button
                type="button"
                onClick={() => handleTranslate(transcript)}
                style={{ background: "transparent", border: "none", color: "#38bdf8", fontSize: "0.75rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <RefreshCw size={12} className={isTranslating ? "animate-spin" : ""} /> Re-translate
              </button>
            )}
          </div>
          <textarea
            value={transcript}
            onChange={(e) => { setTranscript(e.target.value); }}
            placeholder="Your spoken words will appear here (or type in native language)..."
            rows={2}
            style={{
              width: "100%",
              padding: "10px",
              background: "#1e293b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "0.85rem",
              resize: "none"
            }}
          />
        </div>

        {/* Step 6: Translated English Description with Edit and Confirm */}
        <div style={{ marginBottom: "18px" }}>
          <label style={{ fontSize: "0.8rem", color: "#34d399", fontWeight: "600", display: "block", marginBottom: "4px" }}>
            2. Verified English Translation (Editable):
          </label>
          <textarea
            value={translatedText}
            onChange={(e) => setTranslatedText(e.target.value)}
            placeholder="English translation will appear here. You can review and edit before confirming..."
            rows={3}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(16, 185, 129, 0.08)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              borderRadius: "8px",
              color: "#f8fafc",
              fontSize: "0.9rem",
              fontWeight: "500",
              resize: "none"
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: "8px 16px" }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-green"
            style={{ padding: "8px 20px" }}
          >
            <Check size={16} /> Use Verified English Text
          </button>
        </div>

      </div>
    </div>
  );
}
