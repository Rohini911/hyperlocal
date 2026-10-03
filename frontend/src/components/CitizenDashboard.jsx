import React, { useState, useEffect } from "react";
import { 
  AlertOctagon, Phone, MapPin, Navigation, CheckCircle2, 
  Clock, RefreshCw, User, LogOut, PhoneCall, ChevronRight, Check
} from "lucide-react";
import MapComponent from "./MapComponent";
import { incidentApi, routingApi, socket } from "../services/api";

const STATUS_STEPS = ["Awaiting Responder", "Assigned", "En Route", "On Scene", "Resolved"];

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
      if (data) {
        setActiveIncident(data);
        if (data.assigned_responder) fetchRoute(data);
      }
    };

    const handleStatusChanged = (data) => {
      loadIncidents();
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

    const handleAssignmentNotice = (data) => {
      loadIncidents();
    };

    const handleNoResponders = (data) => {
      loadIncidents();
    };

    socket.on("incident_created", handleCreated);
    socket.on("incident_status_changed", handleStatusChanged);
    socket.on("incident_updated", handleUpdated);
    socket.on("citizen_assignment_notification", handleAssignmentNotice);
    socket.on("no_responders_alert", handleNoResponders);
    socket.on("responder_gps_update", handleGps);

    return () => {
      socket.off("incident_created", handleCreated);
      socket.off("incident_status_changed", handleStatusChanged);
      socket.off("incident_updated", handleUpdated);
      socket.off("citizen_assignment_notification", handleAssignmentNotice);
      socket.off("no_responders_alert", handleNoResponders);
      socket.off("responder_gps_update", handleGps);
    };
  }, []); // Run ONCE on mount

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

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "16px", display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#f8fafc" }}>
            Citizen Emergency Dashboard
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
            User: <strong>{currentUser?.full_name || "Guest Citizen"}</strong> • Live Incident Status & GPS Tracking
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Prominent SOS button */}
          <button
            onClick={onOpenSos}
            className="btn-emergency-main"
            style={{ padding: "10px 20px", borderRadius: "8px", fontSize: "0.95rem" }}
          >
            <AlertOctagon size={18} /> + Report New SOS
          </button>

          <button
            onClick={onLogout}
            className="btn-outline"
            style={{ padding: "10px 14px", fontSize: "0.85rem" }}
          >
            <LogOut size={16} /> Exit
          </button>
        </div>
      </div>

      {/* Main Grid: Left = Incident History, Right = Active Incident Tracker & Route Map */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "20px", alignItems: "start" }}>
        
        {/* Left: Your Incidents */}
        <div className="tactical-glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#f8fafc" }}>
              Your Incidents ({incidents.length})
            </h2>
            <button
              onClick={loadIncidents}
              style={{ background: "transparent", border: "none", color: "#00e5ff", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "0.78rem" }}
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {incidents.length === 0 ? (
            <div style={{ padding: "30px 10px", textAlign: "center", color: "#94a3b8", fontSize: "0.88rem" }}>
              <CheckCircle2 size={32} color="#00ff88" style={{ margin: "0 auto 8px auto" }} />
              <div>No active emergencies.</div>
              <div style={{ fontSize: "0.78rem", marginTop: "4px" }}>Click "+ Report New SOS" above if emergency help is needed.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "550px", overflowY: "auto" }}>
              {incidents.map((inc) => {
                const isSel = activeIncident?.id === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => handleSelectIncident(inc)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: "10px",
                      cursor: "pointer",
                      border: isSel ? "1.5px solid #00e5ff" : "1px solid rgba(255,255,255,0.1)",
                      background: isSel ? "rgba(0, 229, 255, 0.12)" : "rgba(30, 41, 59, 0.5)",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "monospace", fontWeight: "800", color: "#00e5ff", fontSize: "0.88rem" }}>
                        {inc.id}
                      </span>
                      <span className={`neon-badge ${inc.status === "Resolved" ? "neon-badge-resolved" : inc.status === "En Route" ? "neon-badge-enroute" : "neon-badge-critical"}`} style={{ fontSize: "0.68rem" }}>
                        {inc.status === "Reported" ? "Awaiting Responder" : inc.status}
                      </span>
                    </div>

                    <div style={{ fontWeight: "700", fontSize: "0.95rem", color: "#f8fafc" }}>
                      {inc.emergency_type} Emergency
                    </div>

                    {inc.checklist_json && (
                      <div style={{ fontSize: "0.75rem", color: "#cbd5e1" }}>
                        Checklist: {JSON.parse(inc.checklist_json || "[]").join(", ")}
                      </div>
                    )}

                    <div style={{ fontSize: "0.72rem", color: "#64748b", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "4px" }}>
                      Target Service: <strong>{inc.suggested_service}</strong> • {new Date(inc.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Active Incident Tracker & Live Map (Requirements 6 & 7) */}
        {activeIncident ? (
          <div className="tactical-glass-card" style={{ padding: "24px" }}>
            
            {/* Header with Incident Details */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Incident Tracker
                </div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#f8fafc" }}>
                  {activeIncident.id} • {activeIncident.emergency_type}
                </h2>
                <div style={{ fontSize: "0.8rem", color: "#00e5ff", marginTop: "2px" }}>
                  Required Unit: <strong>{activeIncident.suggested_service}</strong>
                </div>
              </div>

              <span className="neon-badge neon-badge-enroute" style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
                {activeIncident.status === "Reported" ? "Awaiting Responder" : activeIncident.status}
              </span>
            </div>

            {/* Status Steps Progress Bar (Requirement 7) */}
            <div style={{ background: "rgba(15, 23, 42, 0.7)", borderRadius: "12px", padding: "14px 10px", marginBottom: "20px", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx < currentStepIdx;
                  const isCurrent = idx === currentStepIdx;
                  const isPending = idx > currentStepIdx;

                  return (
                    <div key={step} style={{ flex: 1, textAlign: "center", position: "relative" }}>
                      <div style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        margin: "0 auto 6px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: isDone ? "#00ff88" : isCurrent ? "#ff334b" : "#1e293b",
                        color: isDone ? "#070a12" : "white",
                        fontSize: "11px",
                        fontWeight: "800",
                        boxShadow: isCurrent ? "0 0 12px rgba(255, 51, 75, 0.7)" : "none"
                      }}>
                        {isDone ? <Check size={14} /> : idx + 1}
                      </div>
                      <div style={{ fontSize: "0.68rem", fontWeight: isCurrent ? "800" : isDone ? "700" : "500", color: isCurrent ? "#f8fafc" : isDone ? "#00ff88" : "#64748b" }}>
                        {step}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Leaflet Map with Route to Incident (Requirement 6) */}
            <div style={{ height: "300px", borderRadius: "12px", overflow: "hidden", marginBottom: "16px", border: "1px solid rgba(56,189,248,0.3)" }}>
              <MapComponent
                height="300px"
                center={[activeIncident.lat, activeIncident.lng]}
                zoom={14}
                incidentLocation={{ lat: activeIncident.lat, lng: activeIncident.lng }}
                incidentLabel={`Incident (${activeIncident.emergency_type})`}
                responderLocation={responderLiveLoc || (activeIncident.assigned_responder ? { lat: activeIncident.assigned_responder.lat, lng: activeIncident.assigned_responder.lng } : null)}
                responderType={activeIncident.assigned_responder?.service_type || activeIncident.suggested_service}
                responderLabel={activeIncident.assigned_responder?.full_name || "Assigned Responder"}
                routeCoordinates={routeCoords}
              />
            </div>

            {/* Assigned Responder Details (Requirement 6) */}
            {activeIncident.assigned_responder ? (
              <div style={{
                background: "rgba(30, 41, 59, 0.7)",
                border: "1px solid rgba(0, 229, 255, 0.3)",
                borderRadius: "12px",
                padding: "16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: "rgba(0, 229, 255, 0.2)", color: "#00e5ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Navigation size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: "1rem", fontWeight: "800", color: "#f8fafc" }}>
                      {activeIncident.assigned_responder.full_name}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      Service: <strong>{activeIncident.assigned_responder.service_type}</strong> • Vehicle: <strong>{activeIncident.assigned_responder.vehicle_number || "DEMO-UNIT"}</strong>
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${activeIncident.assigned_responder.phone || "112"}`}
                  style={{
                    background: "#00ff88",
                    color: "#070a12",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: "800",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Phone size={15} /> Call Responder
                </a>
              </div>
            ) : activeIncident.status === "NO_RESPONDER_AVAILABLE" ? (
              <div style={{ background: "rgba(239, 68, 68, 0.15)", border: "1.5px solid #ef4444", padding: "16px", borderRadius: "10px", color: "#fca5a5", fontSize: "0.88rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <AlertOctagon size={22} color="#ef4444" />
                  <div style={{ fontWeight: "800", color: "#f8fafc", fontSize: "1rem" }}>
                    No Nearby Registered Responders Available
                  </div>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#e2e8f0" }}>
                  No nearby verified {activeIncident.suggested_service} unit was able to accept your emergency at this time. Please call the emergency helpline directly.
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <a
                    href="tel:112"
                    style={{
                      background: "#ef4444",
                      color: "white",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: "800",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <Phone size={15} /> Dial 112 National SOS
                  </a>
                  <a
                    href="tel:108"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      color: "#f8fafc",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <Phone size={15} /> Dial 108 Ambulance
                  </a>
                </div>
              </div>
            ) : (
              <div style={{ background: "rgba(255, 184, 0, 0.12)", border: "1px solid rgba(255, 184, 0, 0.3)", padding: "14px", borderRadius: "10px", color: "#ffb800", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "10px" }}>
                <Clock size={20} className="animate-spin" />
                <div>
                  <div style={{ fontWeight: "700" }}>Contacting Nearby Eligible Responders</div>
                  <div style={{ fontSize: "0.78rem", color: "#cbd5e1" }}>
                    Alert broadcasted to all eligible nearby {activeIncident.suggested_service} units within configured radius. First acceptance wins.
                  </div>
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="tactical-glass-card" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
            Select an incident on the left or click "+ Report New SOS" to begin.
          </div>
        )}

      </div>

    </div>
  );
}
