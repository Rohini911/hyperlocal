import React, { useState, useEffect } from "react";
import { 
  AlertOctagon, Phone, MapPin, Navigation, CheckCircle2, 
  Clock, RefreshCw, User, LogOut, PhoneCall, ChevronRight, Check,
  ShieldAlert, HeartPulse, Flame, Maximize2, Minimize2, Radio, Shield, Activity
} from "lucide-react";
import MapComponent from "./MapComponent";
import { incidentApi, routingApi, socket } from "../services/api";
import { sounds } from "../services/soundEffects";

const STATUS_STEPS = ["Reported", "Assigned", "En Route", "On Scene", "Resolved"];

export default function CitizenDashboard({ currentUser, onOpenSos, onLogout, initialIncident }) {
  const [incidents, setIncidents] = useState([]);
  const [activeIncident, setActiveIncident] = useState(initialIncident || null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [responderLiveLoc, setResponderLiveLoc] = useState(null);

  // Keep a ref of activeIncident for socket callbacks without triggering useEffect re-runs
  const activeIncidentRef = React.useRef(activeIncident);
  activeIncidentRef.current = activeIncident;

  useEffect(() => {
    if (initialIncident) {
      setActiveIncident(initialIncident);
      if (initialIncident.assigned_responder) {
        fetchRoute(initialIncident);
      }
    }
  }, [initialIncident]);

  useEffect(() => {
    loadIncidents();

    const handleCreated = (data) => {
      loadIncidents();
      sounds.playAlertSiren();
      if (data) {
        setActiveIncident(data);
        if (data.assigned_responder) fetchRoute(data);
      }
    };

    const handleStatusChanged = (data) => {
      loadIncidents();
      sounds.playStep();
      if (activeIncidentRef.current && data?.incident?.id === activeIncidentRef.current.id) {
        setActiveIncident(data.incident);
        if (data.incident.assigned_responder) {
          fetchRoute(data.incident);
        }
      }
    };

    const handleUpdated = (data) => {
      loadIncidents();
      if (activeIncidentRef.current && data?.id === activeIncidentRef.current.id) {
        setActiveIncident(data);
        if (data.assigned_responder) {
          fetchRoute(data);
        }
      }
    };

    const handleGps = (data) => {
      setResponderLiveLoc({ lat: data.lat, lng: data.lng });
    };

    socket.on("incident_created", handleCreated);
    socket.on("incident_status_changed", handleStatusChanged);
    socket.on("incident_updated", handleUpdated);
    socket.on("responder_gps_update", handleGps);

    return () => {
      socket.off("incident_created", handleCreated);
      socket.off("incident_status_changed", handleStatusChanged);
      socket.off("incident_updated", handleUpdated);
      socket.off("responder_gps_update", handleGps);
    };
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await incidentApi.list();
      setIncidents(data || []);
      if (data && data.length > 0) {
        if (!activeIncidentRef.current) {
          const current = data.find(i => i.status !== "Resolved" && i.status !== "Cancelled") || data[0];
          setActiveIncident(current);
          if (current.assigned_responder) {
            fetchRoute(current);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load citizen incidents", e);
    }
  };

  const handleSelectIncident = (inc) => {
    sounds.playTap();
    setActiveIncident(inc);
    if (inc.assigned_responder) {
      fetchRoute(inc);
    } else {
      setRouteCoords([]);
    }
  };

  const fetchRoute = async (incident) => {
    if (!incident.assigned_responder) return;
    try {
      const r = incident.assigned_responder;
      const res = await routingApi.getRoute(r.lat, r.lng, incident.lat, incident.lng);
      if (res && res.coordinates) {
        setRouteCoords(res.coordinates);
      }
    } catch (e) {
      console.warn("Route fetch error", e);
    }
  };

  const getStepIndex = (status) => {
    if (status === "Reported" || status === "Awaiting Responder") return 0;
    if (status === "Assigned") return 1;
    if (status === "En Route") return 2;
    if (status === "On Scene") return 3;
    if (status === "Resolved") return 4;
    return 0;
  };

  const currentStepIdx = activeIncident ? getStepIndex(activeIncident.status) : 0;

  const getServiceColor = (service) => {
    if (service === "Fire") return "#ff334b";
    if (service === "Police") return "#00e5ff";
    return "#00ff88"; // Ambulance
  };

  const getServiceIcon = (service) => {
    if (service === "Fire") return <Flame size={15} color="#ff334b" />;
    if (service === "Police") return <Shield size={15} color="#00e5ff" />;
    return <HeartPulse size={15} color="#00ff88" />;
  };

  return (
    <div style={{
      maxWidth: "960px",
      margin: "0 auto",
      padding: "16px 14px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      minHeight: "100vh"
    }}>
      
      {/* 1. Sleek Top Navigation Bar */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        background: "rgba(14, 20, 36, 0.95)",
        backdropFilter: "blur(16px)",
        borderRadius: "14px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.4)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(0, 229, 255, 0.15)", color: "#00e5ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Radio size={18} className="animate-pulse" />
          </div>
          <div>
            <div style={{ fontSize: "0.95rem", fontWeight: "900", color: "#f8fafc", lineHeight: "1.1" }}>
              Live Tracking
            </div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
              {currentUser?.full_name || "Citizen"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={() => { sounds.playAlertSiren(); onOpenSos(); }}
            className="btn-emergency-main"
            style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "5px" }}
          >
            <AlertOctagon size={14} /> + New SOS
          </button>
          <button
            onClick={() => { sounds.playTap(); onLogout(); }}
            className="btn-outline"
            style={{ padding: "8px 12px", fontSize: "0.78rem" }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* 2. Switcher Pills (If multiple reports exist) */}
      {incidents.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", overflowX: "auto", padding: "2px 0" }}>
          {incidents.map((inc) => {
            const isSel = activeIncident?.id === inc.id;
            return (
              <button
                key={inc.id}
                onClick={() => handleSelectIncident(inc)}
                style={{
                  background: isSel ? "rgba(0, 229, 255, 0.25)" : "rgba(30, 41, 59, 0.6)",
                  border: isSel ? "1.5px solid #00e5ff" : "1px solid rgba(255,255,255,0.08)",
                  color: isSel ? "#00e5ff" : "#cbd5e1",
                  borderRadius: "20px",
                  padding: "5px 12px",
                  fontSize: "0.75rem",
                  fontWeight: isSel ? "800" : "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span>{inc.id}</span>
                <span className={`neon-badge ${inc.status === "Resolved" ? "neon-badge-resolved" : "neon-badge-critical"}`} style={{ fontSize: "0.6rem", padding: "1px 5px" }}>
                  {inc.status}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Hero Interactive Live Map (Dominant Centerpiece) */}
      {activeIncident ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          
          {/* Main Map Canvas */}
          <div style={{
            height: "44vh",
            minHeight: "320px",
            maxHeight: "520px",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1.5px solid rgba(56, 189, 248, 0.35)",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.6)",
            position: "relative"
          }}>
            <MapComponent
              height="100%"
              center={[activeIncident.lat, activeIncident.lng]}
              zoom={14}
              incidentLocation={{ lat: activeIncident.lat, lng: activeIncident.lng }}
              incidentLabel={`${activeIncident.id} (${activeIncident.emergency_type})`}
              responderLocation={responderLiveLoc || (activeIncident.assigned_responder ? { lat: activeIncident.assigned_responder.lat, lng: activeIncident.assigned_responder.lng } : null)}
              responderType={activeIncident.assigned_responder?.service_type || activeIncident.suggested_service}
              responderLabel={activeIncident.assigned_responder?.full_name || "Assigned Responder"}
              routeCoordinates={routeCoords}
            />

            {/* Floating Top Pill over Map */}
            <div style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              right: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              zIndex: 999,
              pointerEvents: "none"
            }}>
              <div style={{
                background: "rgba(14, 20, 36, 0.92)",
                backdropFilter: "blur(10px)",
                padding: "6px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
              }}>
                <span style={{ fontFamily: "monospace", fontWeight: "800", color: "#00e5ff", fontSize: "0.82rem" }}>
                  {activeIncident.id}
                </span>
                <span style={{ color: "#64748b" }}>•</span>
                <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#f8fafc" }}>
                  {activeIncident.emergency_type}
                </span>
              </div>

              <div style={{
                background: "rgba(14, 20, 36, 0.92)",
                backdropFilter: "blur(10px)",
                padding: "6px 12px",
                borderRadius: "10px",
                border: `1px solid ${getServiceColor(activeIncident.suggested_service)}60`,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
                fontSize: "0.76rem",
                fontWeight: "800",
                color: getServiceColor(activeIncident.suggested_service)
              }}>
                {getServiceIcon(activeIncident.suggested_service)}
                <span>{activeIncident.suggested_service}</span>
              </div>
            </div>
          </div>

          {/* 4. Single Unified Floating Status Card */}
          <div style={{
            background: "rgba(14, 20, 36, 0.95)",
            backdropFilter: "blur(18px)",
            borderRadius: "16px",
            padding: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}>
            
            {/* 5-Step Connected Progress Bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", position: "relative", alignItems: "center" }}>
                {/* Connecting Line */}
                <div style={{
                  position: "absolute",
                  top: "13px",
                  left: "20px",
                  right: "20px",
                  height: "2px",
                  background: "rgba(255, 255, 255, 0.1)",
                  zIndex: 0
                }} />
                
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step} style={{ flex: 1, textAlign: "center", position: "relative", zIndex: 1 }}>
                      <div style={{
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        margin: "0 auto 4px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isDone ? "#00ff88" : isCurrent ? "#ff334b" : "#1e293b",
                        color: isDone ? "#070a12" : "white",
                        fontSize: "10px",
                        fontWeight: "800",
                        boxShadow: isCurrent ? "0 0 14px rgba(255, 51, 75, 0.85)" : "none",
                        transition: "all 0.3s ease"
                      }}>
                        {isDone ? <Check size={13} /> : idx + 1}
                      </div>
                      <div style={{ fontSize: "0.65rem", fontWeight: isCurrent ? "800" : isDone ? "700" : "500", color: isCurrent ? "#f8fafc" : isDone ? "#00ff88" : "#64748b" }}>
                        {step}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Responder Information or 5-Min Escalation Alert */}
            {activeIncident.assigned_responder ? (
              <div style={{
                background: "rgba(30, 41, 59, 0.6)",
                border: "1px solid rgba(0, 229, 255, 0.3)",
                borderRadius: "12px",
                padding: "12px 14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "rgba(0, 229, 255, 0.18)", color: "#00e5ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Navigation size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.92rem", fontWeight: "900", color: "#f8fafc" }}>
                      {activeIncident.assigned_responder.full_name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                      {activeIncident.assigned_responder.service_type} • Vehicle: <strong>{activeIncident.assigned_responder.vehicle_number || "DEMO-UNIT"}</strong>
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${activeIncident.assigned_responder.phone || "112"}`}
                  onClick={() => sounds.playTap()}
                  style={{
                    background: "linear-gradient(135deg, #00ff88, #059669)",
                    color: "#070a12",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: "900",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    boxShadow: "0 4px 14px rgba(0, 255, 136, 0.3)"
                  }}
                >
                  <Phone size={14} /> Call
                </a>
              </div>
            ) : (
              <div style={{
                background: "rgba(255, 184, 0, 0.12)",
                border: "1px solid rgba(255, 184, 0, 0.35)",
                borderRadius: "12px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                color: "#ffb800"
              }}>
                <Clock size={20} className="animate-spin" />
                <div style={{ fontSize: "0.78rem" }}>
                  <div style={{ fontWeight: "800", color: "#f8fafc" }}>
                    Awaiting Responder Acceptance
                  </div>
                  <div style={{ color: "#cbd5e1", marginTop: "1px" }}>
                    5-Minute Escalation Alert broadcasted to nearest 5 {activeIncident.suggested_service} units.
                  </div>
                </div>
              </div>
            )}

            {/* Checklist Conditions summary */}
            {activeIncident.checklist_json && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", fontWeight: "700" }}>Reported:</span>
                {JSON.parse(activeIncident.checklist_json || "[]").map((item) => (
                  <span key={item} style={{ fontSize: "0.7rem", background: "rgba(255, 51, 75, 0.15)", border: "1px solid rgba(255, 51, 75, 0.3)", color: "#ff4d67", padding: "2px 8px", borderRadius: "6px", fontWeight: "600" }}>
                    {item}
                  </span>
                ))}
              </div>
            )}

          </div>

        </div>
      ) : (
        <div style={{
          background: "rgba(14, 20, 36, 0.95)",
          borderRadius: "16px",
          padding: "40px 20px",
          textAlign: "center",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          margin: "auto 0"
        }}>
          <CheckCircle2 size={40} color="#00ff88" style={{ margin: "0 auto 10px auto" }} />
          <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#f8fafc", marginBottom: "4px" }}>
            No Active Emergencies
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#94a3b8", maxWidth: "340px", margin: "0 auto 16px auto" }}>
            Press the button below if emergency help or rescue is needed.
          </p>
          <button
            onClick={() => { sounds.playAlertSiren(); onOpenSos(); }}
            className="btn-emergency-main"
            style={{ padding: "10px 24px", fontSize: "0.9rem" }}
          >
            <AlertOctagon size={16} /> Report Emergency SOS
          </button>
        </div>
      )}

    </div>
  );
}
