import React from "react";
import { CheckCircle2, X, ShieldCheck } from "lucide-react";

export default function ResolvedModal({ isOpen, onClose, incident }) {
  if (!isOpen || !incident) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ padding: "36px 28px", textAlign: "center", maxWidth: "440px" }}>
        
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        {/* Green Checkmark Badge (Screen 13) */}
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#dcfce7", color: "#16a34a", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
          <CheckCircle2 size={44} />
        </div>

        <h3 style={{ fontSize: "1.5rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
          Incident Resolved!
        </h3>

        <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#2563eb", fontFamily: "monospace", marginBottom: "4px" }}>
          {incident.id || "INC-2025-001"}
        </div>
        <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#334155", marginBottom: "4px" }}>
          {incident.emergency_type} Emergency
        </div>
        <div style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "24px" }}>
          Resolved at {new Date(incident.updated_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={onClose}
            className="btn-primary-blue"
            style={{ width: "100%", padding: "12px", borderRadius: "8px" }}
          >
            View Details
          </button>
          <button
            onClick={onClose}
            className="btn-outline"
            style={{ width: "100%", padding: "10px", border: "none", color: "#64748b" }}
          >
            Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
