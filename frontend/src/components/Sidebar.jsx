import React from "react";
import { 
  PlusCircle, Home, AlertOctagon, FileText, Phone, 
  HardDrive, User, LogOut, Radio, Shield, BarChart3, Users 
} from "lucide-react";

export default function Sidebar({ 
  currentRole, 
  activeTab, 
  onSelectTab, 
  onLogout,
  onOpenReportModal,
  onOpenContacts,
  onOpenOfflineReports
}) {
  return (
    <aside style={{
      width: "240px",
      background: "#0f172a",
      color: "#f8fafc",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      padding: "20px 16px",
      minHeight: "100vh",
      borderRight: "1px solid rgba(255,255,255,0.08)"
    }}>
      {/* Top Logo */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px", paddingLeft: "8px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
            <PlusCircle size={22} />
          </div>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#f8fafc", lineHeight: "1.2" }}>
              Hyperlocal
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              Emergency Response
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {currentRole === "citizen" && (
            <>
              <button
                onClick={() => onSelectTab("home")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: activeTab === "home" ? "#2563eb" : "transparent",
                  color: activeTab === "home" ? "#ffffff" : "#94a3b8",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <Home size={18} /> Home
              </button>

              <button
                onClick={onOpenReportModal}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  color: "#f87171",
                  fontWeight: "700",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <AlertOctagon size={18} /> Report Emergency
              </button>

              <button
                onClick={() => onSelectTab("incidents")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: activeTab === "incidents" ? "rgba(255,255,255,0.1)" : "transparent",
                  color: activeTab === "incidents" ? "#ffffff" : "#94a3b8",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <FileText size={18} /> My Incidents
              </button>

              <button
                onClick={onOpenContacts}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <Phone size={18} /> Emergency Contacts
              </button>

              <button
                onClick={onOpenOfflineReports}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: "transparent",
                  color: "#94a3b8",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <HardDrive size={18} /> Offline Reports
              </button>
            </>
          )}

          {currentRole === "responder" && (
            <>
              <button
                onClick={() => onSelectTab("home")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: activeTab === "home" ? "#2563eb" : "transparent",
                  color: activeTab === "home" ? "#ffffff" : "#94a3b8",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <Home size={18} /> Home
              </button>

              <button
                onClick={() => onSelectTab("available")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: activeTab === "available" ? "rgba(255,255,255,0.1)" : "transparent",
                  color: activeTab === "available" ? "#ffffff" : "#94a3b8",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <Radio size={18} /> Available Incidents
              </button>

              <button
                onClick={() => onSelectTab("assignments")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: activeTab === "assignments" ? "rgba(255,255,255,0.1)" : "transparent",
                  color: activeTab === "assignments" ? "#ffffff" : "#94a3b8",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <FileText size={18} /> My Assignments
              </button>
            </>
          )}

          {currentRole === "admin" && (
            <>
              <button
                onClick={() => onSelectTab("dashboard")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: activeTab === "dashboard" ? "#2563eb" : "transparent",
                  color: activeTab === "dashboard" ? "#ffffff" : "#94a3b8",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <BarChart3 size={18} /> Dashboard
              </button>

              <button
                onClick={() => onSelectTab("incidents")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: activeTab === "incidents" ? "rgba(255,255,255,0.1)" : "transparent",
                  color: activeTab === "incidents" ? "#ffffff" : "#94a3b8",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <AlertOctagon size={18} /> Incidents
              </button>

              <button
                onClick={() => onSelectTab("responders")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: activeTab === "responders" ? "rgba(255,255,255,0.1)" : "transparent",
                  color: activeTab === "responders" ? "#ffffff" : "#94a3b8",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <Shield size={18} /> Responders
              </button>

              <button
                onClick={() => onSelectTab("reports")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "none",
                  background: activeTab === "reports" ? "rgba(255,255,255,0.1)" : "transparent",
                  color: activeTab === "reports" ? "#ffffff" : "#94a3b8",
                  fontWeight: "600",
                  fontSize: "0.88rem",
                  cursor: "pointer",
                  textAlign: "left"
                }}
              >
                <FileText size={18} /> Reports
              </button>
            </>
          )}

          <button
            onClick={() => onSelectTab("profile")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "profile" ? "rgba(255,255,255,0.1)" : "transparent",
              color: activeTab === "profile" ? "#ffffff" : "#94a3b8",
              fontWeight: "600",
              fontSize: "0.88rem",
              cursor: "pointer",
              textAlign: "left"
            }}
          >
            <User size={18} /> Profile
          </button>
        </nav>
      </div>

      {/* Bottom Logout */}
      <div>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            padding: "10px 14px",
            borderRadius: "8px",
            border: "none",
            background: "transparent",
            color: "#94a3b8",
            fontWeight: "600",
            fontSize: "0.88rem",
            cursor: "pointer",
            textAlign: "left"
          }}
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
