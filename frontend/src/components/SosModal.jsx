import React, { useState, useEffect } from "react";
import { 
  AlertOctagon, X, MapPin, Navigation, CheckSquare, Square, 
  AlertCircle, CheckCircle2, ArrowRight, Shield, Flame, HeartPulse, Activity
} from "lucide-react";
import MapComponent from "./MapComponent";
import { incidentApi } from "../services/api";
import { sounds } from "../services/soundEffects";

const EXACT_CHECKLIST = [
  "Person injured",
  "Person unconscious",
  "Road accident",
  "Fire or smoke",
  "Person trapped",
  "Crime/personal safety threat",
  "Other emergency"
];

export default function SosModal({ isOpen, onClose, onSubmitted }) {
  const [checklist, setChecklist] = useState([]);
  const [description, setDescription] = useState("");
  const [checklistError, setChecklistError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [coords, setCoords] = useState({ lat: 17.5800, lng: 78.4867 });

  useEffect(() => {
    if (isOpen) {
      setChecklist([]);
      setDescription("");
      setChecklistError("");
      handleDetectLocation();
    }
  }, [isOpen]);

  const handleDetectLocation = () => {
    sounds.playTap();
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: parseFloat(pos.coords.latitude.toFixed(5)),
            lng: parseFloat(pos.coords.longitude.toFixed(5))
          });
          sounds.playStep();
          setIsLocating(false);
        },
        () => {
          setCoords({ lat: 17.5800, lng: 78.4867 });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  const handleToggleChecklist = (item) => {
    sounds.playTap();
    setChecklistError("");
    if (checklist.includes(item)) {
      setChecklist(checklist.filter(i => i !== item));
    } else {
      setChecklist([...checklist, item]);
    }
  };

  // Dynamic service calculation
  const getDispatchedService = () => {
    if (checklist.includes("Fire or smoke") || checklist.includes("Person trapped")) {
      return { name: "Fire Department", icon: <Flame size={16} color="#ff334b" />, color: "#ff334b" };
    }
    if (checklist.includes("Crime/personal safety threat")) {
      return { name: "Police Safety Unit", icon: <Shield size={16} color="#00e5ff" />, color: "#00e5ff" };
    }
    if (checklist.includes("Person injured") || checklist.includes("Person unconscious") || checklist.includes("Road accident")) {
      return { name: "Emergency Ambulance", icon: <HeartPulse size={16} color="#00ff88" />, color: "#00ff88" };
    }
    return { name: "Quick Response Unit", icon: <Activity size={16} color="#eab308" />, color: "#eab308" };
  };

  const currentService = getDispatchedService();

  // Danger severity score (1 to 4)
  const severityScore = checklist.length;
  const severityLabel = severityScore === 0 ? "Select Conditions" :
    severityScore === 1 ? "Level 1 • High Priority" :
    severityScore === 2 ? "Level 2 • Severe Emergency" :
    "Level 3 • CRITICAL LIFE SAFETY";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mandatory Checklist validation: At least 1 item must be selected
    if (!checklist || checklist.length === 0) {
      sounds.playAlertSiren();
      setChecklistError("⚠️ Please select at least one item from the emergency checklist before submitting.");
      return;
    }

    setIsSubmitting(true);
    sounds.playAlertSiren();
    try {
      let type = "Medical";
      if (checklist.includes("Fire or smoke") || checklist.includes("Person trapped")) type = "Fire";
      else if (checklist.includes("Crime/personal safety threat")) type = "Crime";
      else if (checklist.includes("Road accident")) type = "Crash";

      const payload = {
        emergency_type: type,
        description: description.trim(), // Optional description
        checklist,
        lat: coords.lat,
        lng: coords.lng,
        address: `GPS Location: Lat ${coords.lat}, Lng ${coords.lng}`
      };

      const res = await incidentApi.create(payload);
      sounds.playSuccess();
      if (onSubmitted) onSubmitted(res.incident || res.data);
      onClose();
    } catch (err) {
      sounds.playSuccess();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: "640px", padding: "26px", background: "#0e1424", border: "1px solid rgba(255,51,75,0.4)" }}>
        
        {/* Close Button */}
        <button
          onClick={() => { sounds.playTap(); onClose(); }}
          style={{ position: "absolute", top: "18px", right: "18px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#ff334b", color: "white", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 16px rgba(255,51,75,0.4)" }}>
            <AlertOctagon size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#f8fafc", margin: 0 }}>
              Emergency SOS Report
            </h2>
          </div>
        </div>
        <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginBottom: "16px" }}>
          Select all conditions that apply. Checklist is <strong>mandatory</strong>; description is <strong>optional</strong>.
        </p>

        {/* Dynamic Live Triage Badge */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "10px 14px", 
          borderRadius: "10px", 
          background: "rgba(15, 23, 42, 0.7)", 
          border: `1px solid ${currentService.color}40`,
          marginBottom: "16px" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.84rem", color: currentService.color, fontWeight: "700" }}>
            {currentService.icon}
            <span>Target Dispatch: {currentService.name}</span>
          </div>
          <div style={{ fontSize: "0.74rem", color: severityScore > 2 ? "#ff334b" : severityScore > 0 ? "#f59e0b" : "#64748b", fontWeight: "800", textTransform: "uppercase" }}>
            {severityLabel}
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {/* 1. Mandatory Checklist */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "800", color: "#ff334b" }}>
                1. Emergency Checklist (Select at least one) *
              </label>
              <span style={{ fontSize: "0.72rem", color: "#ff334b", fontWeight: "700" }}>Mandatory</span>
            </div>

            {checklistError && (
              <div style={{ background: "rgba(255, 51, 75, 0.2)", border: "1px solid rgba(255, 51, 75, 0.4)", color: "#ff4d67", padding: "8px 12px", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertCircle size={16} />
                <span>{checklistError}</span>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {EXACT_CHECKLIST.map((item) => {
                const isChecked = checklist.includes(item);
                return (
                  <div
                    key={item}
                    onClick={() => handleToggleChecklist(item)}
                    style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      border: isChecked ? "1.5px solid #ff334b" : "1px solid rgba(255,255,255,0.1)",
                      background: isChecked ? "rgba(255, 51, 75, 0.18)" : "rgba(30, 41, 59, 0.45)",
                      color: isChecked ? "#ffffff" : "#cbd5e1",
                      fontSize: "0.82rem",
                      fontWeight: isChecked ? "700" : "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.15s ease",
                      transform: isChecked ? "scale(1.02)" : "scale(1)"
                    }}
                  >
                    {isChecked ? <CheckSquare size={16} color="#ff334b" /> : <Square size={16} color="#64748b" />}
                    <span>{item}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Optional Description */}
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#94a3b8", display: "block", marginBottom: "6px" }}>
              2. Emergency Description <span style={{ color: "#64748b", fontWeight: "400" }}>(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened, landmarks, floor number... (Optional)"
              rows={2}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.15)", color: "#f8fafc", fontSize: "0.88rem" }}
            />
          </div>

          {/* 3. Automatic Location Detection */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#00e5ff", display: "flex", alignItems: "center", gap: "6px" }}>
                <MapPin size={16} color="#00e5ff" /> 3. Automatic GPS Location Detection
              </label>
              <button
                type="button"
                onClick={handleDetectLocation}
                style={{ background: "transparent", border: "none", color: "#00e5ff", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Navigation size={12} className={isLocating ? "animate-spin" : ""} />
                {isLocating ? "Detecting GPS..." : "Refresh Location"}
              </button>
            </div>

            <div style={{ height: "150px", borderRadius: "8px", overflow: "hidden", marginBottom: "6px", border: "1px solid rgba(56,189,248,0.3)" }}>
              <MapComponent
                height="150px"
                center={[coords.lat, coords.lng]}
                pickerMode={true}
                pickerCoords={coords}
                onPickerCoordsChange={(lat, lng) => setCoords({ lat: parseFloat(lat.toFixed(5)), lng: parseFloat(lng.toFixed(5)) })}
              />
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Detected: Lat {coords.lat}, Lng {coords.lng} (Drag pin or tap map to adjust)
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px" }}>
            <button 
              type="button" 
              onClick={() => { sounds.playTap(); onClose(); }} 
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-emergency-main"
              style={{ padding: "12px 28px", fontSize: "0.95rem" }}
            >
              {isSubmitting ? "Dispatching..." : "🚨 Transmit SOS Emergency"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
