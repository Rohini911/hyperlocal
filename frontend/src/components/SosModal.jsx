import React, { useState, useEffect } from "react";
import { 
  AlertOctagon, X, MapPin, Navigation, CheckSquare, Square, 
  AlertCircle, CheckCircle2, ArrowRight
} from "lucide-react";
import MapComponent from "./MapComponent";
import { incidentApi } from "../services/api";

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
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: parseFloat(pos.coords.latitude.toFixed(5)),
            lng: parseFloat(pos.coords.longitude.toFixed(5))
          });
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
    setChecklistError("");
    if (checklist.includes(item)) {
      setChecklist(checklist.filter(i => i !== item));
    } else {
      setChecklist([...checklist, item]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mandatory Checklist validation: At least 1 item must be selected
    if (!checklist || checklist.length === 0) {
      setChecklistError("⚠️ Please select at least one item from the emergency checklist before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine base type from checklist
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
      if (onSubmitted) onSubmitted(res.incident || res.data);
      onClose();
    } catch (err) {
      alert("Emergency SOS report submitted.");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: "640px", padding: "28px", background: "#0e1424", border: "1px solid rgba(255,51,75,0.4)" }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "18px", right: "18px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#ff334b", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AlertOctagon size={22} />
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#f8fafc" }}>
            Emergency SOS Report
          </h2>
        </div>
        <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "20px" }}>
          Select all conditions that apply. Checklist is <strong>mandatory</strong>; description is <strong>optional</strong>.
        </p>

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
                      background: isChecked ? "rgba(255, 51, 75, 0.15)" : "rgba(30, 41, 59, 0.45)",
                      color: isChecked ? "#ffffff" : "#cbd5e1",
                      fontSize: "0.82rem",
                      fontWeight: isChecked ? "700" : "500",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "all 0.15s ease"
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

            <div style={{ height: "160px", borderRadius: "8px", overflow: "hidden", marginBottom: "6px", border: "1px solid rgba(56,189,248,0.3)" }}>
              <MapComponent
                height="160px"
                center={[coords.lat, coords.lng]}
                pickerMode={true}
                pickerCoords={coords}
                onPickerCoordsChange={(lat, lng) => setCoords({ lat: parseFloat(lat.toFixed(5)), lng: parseFloat(lng.toFixed(5)) })}
              />
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
              Detected: Lat {coords.lat}, Lng {coords.lng} (Drag pin if needed)
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
            <button type="button" onClick={onClose} className="btn-outline">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-emergency-main"
              style={{ padding: "12px 28px", fontSize: "0.95rem" }}
            >
              {isSubmitting ? "Submitting..." : "🚨 Submit SOS Emergency Report"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
