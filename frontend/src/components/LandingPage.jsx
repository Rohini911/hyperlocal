import React, { useState } from "react";
import { AlertOctagon, User, Shield, ArrowRight, Activity, Volume2, VolumeX, Radio, Zap } from "lucide-react";
import { sounds } from "../services/soundEffects";

export default function LandingPage({
  onContinueAsGuest,
  onOpenCitizenLogin,
  onOpenCitizenRegister,
  onOpenResponderLogin,
  onOpenResponderRegister,
  onTriggerSos
}) {
  const [isMuted, setIsMuted] = useState(sounds.isMuted());

  const handleSos = () => {
    sounds.playAlertSiren();
    onTriggerSos();
  };

  const handleAction = (cb) => {
    sounds.playTap();
    if (cb) cb();
  };

  const handleToggleAudio = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070a12",
      color: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "24px 16px"
    }}>
      
      {/* Main Hero & Portals */}
      <main style={{ maxWidth: "1100px", margin: "20px auto 40px auto", width: "100%", textAlign: "center" }}>
        
        {/* Headline */}
        <div style={{ marginBottom: "36px" }}>
          <h1 style={{ fontSize: "2.8rem", fontWeight: "900", lineHeight: "1.15", marginBottom: "12px", color: "#f8fafc" }}>
            Immediate Hyperlocal Emergency Response
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.08rem", maxWidth: "700px", margin: "0 auto", lineHeight: "1.5" }}>
            Submit an emergency SOS with mandatory danger checklist and automatic GPS detection. Nearby available responders (Ambulance, Police, Fire) are notified in real time.
          </p>
        </div>

        {/* Center Prominent SOS Button with live radar rings */}
        <div style={{ marginBottom: "52px", position: "relative", display: "inline-block" }}>
          <button
            onClick={handleSos}
            className="sos-main-trigger"
            style={{ margin: "0 auto" }}
          >
            <AlertOctagon size={48} color="white" />
            <span style={{ fontWeight: "900", fontSize: "1.25rem", letterSpacing: "1px", marginTop: "4px" }}>
              SOS
            </span>
            <span style={{ fontSize: "0.7rem", opacity: 0.9, fontWeight: "800" }}>
              EMERGENCY
            </span>
          </button>
          <div style={{ fontSize: "0.85rem", color: "#94a3b8", marginTop: "16px", fontWeight: "500" }}>
            📍 Click SOS to open emergency form • Automatic GPS detection • No login required
          </div>
        </div>

        {/* Exact Landing Page Actions Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", textAlign: "left" }}>
          
          {/* Card 1: Guest Access & Citizen Portal */}
          <div className="tactical-glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(0,229,255,0.15)", color: "#00e5ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", boxShadow: "0 0 16px rgba(0,229,255,0.2)" }}>
                <User size={26} />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", marginBottom: "6px" }}>
                Citizen Portal
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "22px" }}>
                Submit emergency reports, track responder GPS live, and view assigned ambulance, police, or fire units.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {/* 1. Continue as Guest */}
              <button
                onClick={() => handleAction(onContinueAsGuest)}
                className="btn-primary-blue"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", fontSize: "0.92rem" }}
              >
                Continue as Guest <ArrowRight size={16} />
              </button>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {/* 2. Citizen Login */}
                <button
                  onClick={() => handleAction(onOpenCitizenLogin)}
                  className="btn-outline"
                  style={{ padding: "10px", fontSize: "0.86rem" }}
                >
                  Citizen Login
                </button>
                {/* 3. Citizen Register */}
                <button
                  onClick={() => handleAction(onOpenCitizenRegister)}
                  className="btn-outline"
                  style={{ padding: "10px", fontSize: "0.86rem" }}
                >
                  Citizen Register
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Responder Portal (Ambulance, Police, Fire) */}
          <div className="tactical-glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between", border: "1px solid rgba(0,255,136,0.3)" }}>
            <div>
              <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(0,255,136,0.15)", color: "#00ff88", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", boxShadow: "0 0 16px rgba(0,255,136,0.2)" }}>
                <Shield size={26} />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", marginBottom: "6px" }}>
                Responder Portal
              </h2>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "22px" }}>
                For demo service responders (Ambulance, Police, Fire). Receive incoming nearby alerts, accept incidents, and view live turn-by-turn road route directions.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {/* 4. Responder Login */}
                <button
                  onClick={() => handleAction(onOpenResponderLogin)}
                  style={{ background: "#00ff88", color: "#070a12", border: "none", borderRadius: "10px", padding: "12px", fontWeight: "800", fontSize: "0.9rem", cursor: "pointer", boxShadow: "0 4px 18px rgba(0,255,136,0.3)" }}
                >
                  Responder Login
                </button>
                {/* 5. Responder Register */}
                <button
                  onClick={() => handleAction(onOpenResponderRegister)}
                  className="btn-outline"
                  style={{ padding: "12px", fontSize: "0.86rem", borderColor: "rgba(0,255,136,0.4)", color: "#00ff88" }}
                >
                  Responder Register
                </button>
              </div>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
