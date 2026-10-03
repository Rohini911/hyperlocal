import React from "react";
import { User, Shield, ArrowRight, PlusCircle } from "lucide-react";

export default function RoleSelectScreen({ onSelectRole }) {
  return (
    <div style={{
      minHeight: "85vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      background: "#f0f4f8"
    }}>
      <div style={{ maxWidth: "780px", width: "100%", textAlign: "center" }}>
        
        {/* Title */}
        <h2 style={{ fontSize: "2rem", fontWeight: "800", color: "#0f172a", marginBottom: "8px" }}>
          Select Your Role
        </h2>
        <p style={{ color: "#64748b", fontSize: "1rem", marginBottom: "36px" }}>
          Choose how you want to use the platform
        </p>

        {/* 2 Role Selection Cards (Screen 2) */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          
          {/* Card 1: Citizen */}
          <div className="story-card" style={{ padding: "36px 28px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <User size={36} />
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a", marginBottom: "10px" }}>
                Citizen
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "28px" }}>
                Report emergencies, track incidents in real-time, and access offline emergency contacts.
              </p>
            </div>

            <button
              onClick={() => onSelectRole("citizen")}
              className="btn-primary-blue"
              style={{ width: "100%", padding: "12px", borderRadius: "10px", fontSize: "1rem" }}
            >
              Continue as Citizen <ArrowRight size={18} />
            </button>
          </div>

          {/* Card 2: Responder */}
          <div className="story-card" style={{ padding: "36px 28px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                <Shield size={36} />
              </div>
              <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a", marginBottom: "10px" }}>
                Responder
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "28px" }}>
                View and accept eligible nearby incidents, update status, and navigate with turn-by-turn routing.
              </p>
            </div>

            <button
              onClick={() => onSelectRole("ambulance")}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                fontSize: "1rem",
                background: "#059669",
                color: "white",
                border: "none",
                fontWeight: "600",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              Continue as Responder <ArrowRight size={18} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
