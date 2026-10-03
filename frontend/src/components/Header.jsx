import React, { useState } from "react";
import { 
  Shield, Radio, Wifi, WifiOff, PhoneCall, PlayCircle, Phone
} from "lucide-react";
import { demoApi } from "../services/api";

export default function Header({ 
  currentUser, 
  onRoleSwitch, 
  onOpenContacts, 
  isOnline = true
}) {
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunDemoSimulation = async () => {
    setIsSimulating(true);
    try {
      await demoApi.simulateFullCycle();
      alert("🚨 Full Lifecycle Incident Simulation Triggered! Watch dispatches cycle from Reported -> Assigned -> En Route -> On Scene -> Resolved.");
    } catch (e) {
      alert("Demo simulation triggered.");
    } finally {
      setTimeout(() => setIsSimulating(false), 6000);
    }
  };

  return (
    <header style={{
      background: "#ffffff",
      borderBottom: "1px solid #e2e8f0",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      padding: "10px 20px",
      boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)"
    }}>
      <div style={{ maxWidth: "1600px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        
        {/* Brand & Logo (Blue shield with medical cross) */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            boxShadow: "0 3px 10px rgba(37, 99, 235, 0.3)",
            position: "relative"
          }}>
            <Shield size={22} fill="#2563eb" color="white" />
            <span style={{ position: "absolute", fontWeight: "900", fontSize: "16px", color: "white", marginTop: "-1px" }}>+</span>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0f172a", letterSpacing: "-0.02em" }}>
                Hyperlocal Emergency Response Platform
              </h1>
              <span style={{
                background: "#dbeafe",
                color: "#1e40af",
                fontSize: "0.68rem",
                fontWeight: "700",
                padding: "2px 8px",
                borderRadius: "12px"
              }}>
                Live
              </span>
            </div>
            <div style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "500" }}>
              Report • Connect • Respond • Save Lives
            </div>
          </div>
        </div>

        {/* Right side controls: 3 Services Switcher, Simulation & 112 */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          
          {/* Quick Role Switcher for the 3 Friends Services + Citizen + Admin */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#f8fafc", border: "1px solid #e2e8f0", padding: "3px 6px", borderRadius: "10px" }}>
            <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "700", paddingRight: "4px" }}>
              Role:
            </span>
            
            <button
              onClick={() => onRoleSwitch("citizen")}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "700",
                cursor: "pointer",
                border: "none",
                background: currentUser?.role === "citizen" ? "#2563eb" : "transparent",
                color: currentUser?.role === "citizen" ? "white" : "#475569"
              }}
            >
              🧑 Citizen
            </button>

            <button
              onClick={() => onRoleSwitch("ambulance")}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "700",
                cursor: "pointer",
                border: "none",
                background: currentUser?.service_type === "Ambulance" ? "#16a34a" : "transparent",
                color: currentUser?.service_type === "Ambulance" ? "white" : "#475569"
              }}
            >
              🚑 Ambulance
            </button>

            <button
              onClick={() => onRoleSwitch("police")}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "700",
                cursor: "pointer",
                border: "none",
                background: currentUser?.service_type === "Police" ? "#f59e0b" : "transparent",
                color: currentUser?.service_type === "Police" ? "white" : "#475569"
              }}
            >
              🚓 Police
            </button>

            <button
              onClick={() => onRoleSwitch("fire")}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "700",
                cursor: "pointer",
                border: "none",
                background: currentUser?.service_type === "Fire" ? "#f97316" : "transparent",
                color: currentUser?.service_type === "Fire" ? "white" : "#475569"
              }}
            >
              🚒 Fire
            </button>

            <button
              onClick={() => onRoleSwitch("admin")}
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: "700",
                cursor: "pointer",
                border: "none",
                background: currentUser?.role === "admin" ? "#7c3aed" : "transparent",
                color: currentUser?.role === "admin" ? "white" : "#475569"
              }}
            >
              🛡️ Admin
            </button>
          </div>

          {/* Demo Simulator */}
          <button
            onClick={handleRunDemoSimulation}
            disabled={isSimulating}
            style={{
              background: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "6px 12px",
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(139, 92, 246, 0.3)"
            }}
          >
            <PlayCircle size={14} className={isSimulating ? "animate-spin" : ""} />
            {isSimulating ? "Simulating..." : "⚡ Demo Mode"}
          </button>

          {/* Offline Contacts Button */}
          <button
            onClick={onOpenContacts}
            className="btn-outline"
            style={{ padding: "6px 12px", fontSize: "0.78rem" }}
          >
            <Phone size={14} color="#2563eb" /> Contacts
          </button>

          {/* Emergency 112 CTA */}
          <a
            href="tel:112"
            style={{
              background: "#ef4444",
              color: "white",
              padding: "6px 14px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: "800",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.35)"
            }}
          >
            <PhoneCall size={14} /> 112
          </a>

        </div>

      </div>
    </header>
  );
}
