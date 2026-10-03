import React, { useState } from "react";
import { 
  AlertOctagon, User, Shield, Lock, Radio, ArrowRight, 
  HeartPulse, Activity, Flame, PhoneCall, Sparkles, CheckCircle2,
  MapPin, Clock, Phone
} from "lucide-react";

export default function LandingScreen({ 
  onGuestSOS, 
  onOpenCitizenLogin, 
  onOpenResponderLogin, 
  onOpenAdminLogin,
  onQuickRoleSelect
}) {
  return (
    <div style={{
      minHeight: "88vh",
      background: "#f0f4f8",
      color: "#0f172a",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "20px 16px"
    }}>
      {/* Main Hero & Portals (User Point 1) */}
      <main style={{ maxWidth: "1180px", margin: "20px auto", width: "100%", textAlign: "center" }}>
        
        {/* Main Headline */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8", padding: "4px 14px", borderRadius: "20px", fontSize: "0.82rem", fontWeight: "700", marginBottom: "14px" }}>
            <Sparkles size={15} /> Real-Time Hyperlocal Emergency Dispatch Platform
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: "900", lineHeight: "1.2", marginBottom: "12px", letterSpacing: "-0.03em", color: "#0f172a" }}>
            Immediate Emergency Response <br />
            <span style={{ color: "#ef4444" }}>
              Directly Connected to Nearby First Responders
            </span>
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.05rem", maxWidth: "680px", margin: "0 auto", lineHeight: "1.5" }}>
            Report emergencies in seconds as a guest or registered citizen. Your GPS coordinates and danger checklist are broadcasted instantly to the <strong>nearest 5 online service units (Ambulance, Police, Fire)</strong> with live turn-by-turn road navigation.
          </p>
        </div>

        {/* Big One-Tap SOS Button (User Point 2) */}
        <div style={{ marginBottom: "40px" }}>
          <button
            onClick={onGuestSOS}
            className="btn-emergency-main pulse-emergency"
            style={{
              padding: "20px 48px",
              fontSize: "1.25rem",
              borderRadius: "50px",
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 8px 30px rgba(239, 68, 68, 0.4)"
            }}
          >
            <AlertOctagon size={32} />
            ONE-TAP GUEST SOS (NO LOGIN REQUIRED)
          </button>
          <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "10px", fontWeight: "600" }}>
            ⚡ Auto-detects your live GPS location • Dispatches to nearby Ambulance, Police or Fire units
          </div>
        </div>

        {/* 3 Dedicated Role Login Portals (User Point 1) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", textAlign: "left" }}>
          
          {/* Portal 1: Citizen Login/Register */}
          <div className="story-card" style={{
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#ffffff"
          }}>
            <div>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <User size={26} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                Citizen Portal
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.88rem", lineHeight: "1.5", marginBottom: "20px" }}>
                Sign in to report emergencies, view active incident status, and track assigned responder vehicles on the live map in real-time.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={onOpenCitizenLogin}
                className="btn-primary-blue"
                style={{ width: "100%", padding: "12px", borderRadius: "8px", fontSize: "0.95rem" }}
              >
                Citizen Login / Register <ArrowRight size={16} />
              </button>
              <button
                onClick={() => onQuickRoleSelect("citizen")}
                style={{ background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", padding: "8px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "600", cursor: "pointer" }}
              >
                Quick Demo Citizen: Priya Sharma
              </button>
            </div>
          </div>

          {/* Portal 2: Responder Service Login (For the 3 Friends Services) */}
          <div className="story-card" style={{
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#ffffff",
            border: "1.5px solid #bbf7d0"
          }}>
            <div>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Shield size={26} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                First Responder Console
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.88rem", lineHeight: "1.5", marginBottom: "20px" }}>
                For on-duty services (Ambulance, Police, Fire). Receive nearby 5-service alerts, accept incidents, auto-detect location, and get turn-by-turn road navigation.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                <button
                  onClick={() => onQuickRoleSelect("ambulance")}
                  style={{ background: "#2563eb", color: "white", border: "none", padding: "10px 4px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}
                >
                  🚑 Ambulance
                </button>
                <button
                  onClick={() => onQuickRoleSelect("police")}
                  style={{ background: "#f59e0b", color: "white", border: "none", padding: "10px 4px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}
                >
                  🚓 Police
                </button>
                <button
                  onClick={() => onQuickRoleSelect("fire")}
                  style={{ background: "#ef4444", color: "white", border: "none", padding: "10px 4px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}
                >
                  🚒 Fire
                </button>
              </div>
              <button
                onClick={onOpenResponderLogin}
                className="btn-outline"
                style={{ width: "100%", padding: "8px", borderRadius: "8px", fontSize: "0.82rem" }}
              >
                Custom Responder Sign In
              </button>
            </div>
          </div>

          {/* Portal 3: Dispatcher / Admin */}
          <div className="story-card" style={{
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: "#ffffff"
          }}>
            <div>
              <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#f3e8ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <Lock size={26} />
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
                Dispatcher / Admin
              </h3>
              <p style={{ color: "#64748b", fontSize: "0.88rem", lineHeight: "1.5", marginBottom: "20px" }}>
                Central command oversight: city-wide fleet heatmap, 5-minute escalation logs, duplicate resolution, and area hazard warning broadcasts.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={() => onQuickRoleSelect("admin")}
                style={{
                  background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                  color: "white",
                  border: "none",
                  padding: "12px",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                Access EOC Dispatch Console <ArrowRight size={16} />
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer style={{ maxWidth: "1180px", margin: "20px auto 0 auto", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", fontSize: "0.82rem", color: "#64748b", borderTop: "1px solid #e2e8f0", paddingTop: "16px" }}>
        <div>
          Hyperlocal Emergency Response Platform • Multi-Service Routing Engine
        </div>
        <div>
          Unified National Emergency: Dial <strong>112</strong>
        </div>
      </footer>
    </div>
  );
}
