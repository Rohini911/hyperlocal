import React, { useState, useEffect } from "react";
import { 
  AlertOctagon, Phone, MapPin, Navigation, CheckCircle2, 
  Clock, RefreshCw, User, LogOut, PhoneCall, ChevronRight, Check,
  ShieldAlert, HeartPulse, Flame, Maximize2, Minimize2, Radio
} from "lucide-react";
import MapComponent from "./MapComponent";
import { incidentApi, routingApi, socket } from "../services/api";
import { sounds } from "../services/soundEffects";

const STATUS_STEPS = ["Awaiting Responder", "Assigned", "En Route", "On Scene", "Resolved"];

export default function CitizenDashboard({ currentUser, onOpenSos, onLogout, initialIncident }) {
  const [incidents, setIncidents] = useState([]);
  const [activeIncident, setActiveIncident] = useState(initialIncident || null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [responderLiveLoc, setResponderLiveLoc] = useState(null);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);

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

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      
      {/* Top Navbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "14px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "1.4rem", fontWeight: "900", color: "#f8fafc", margin: 0 }}>
              Live Emergency Tracking
            </h1>
            <span className="live-badge" style={{ fontSize: "0.72rem" }}>GPS ACTIVE</span>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginTop: "2px" }}>
            User: <strong>{currentUser?.full_name || "Guest Citizen"}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Prominent SOS button */}
          <button
            onClick={() => { sounds.playAlertSiren(); onOpenSos(); }}
            className="btn-emergency-main"
            style={{ padding: "9px 18px", borderRadius: "8px", fontSize: "0.9rem" }}
          >
            <AlertOctagon size={16} /> + Report New SOS
          </button>

          <button
            onClick={() => { sounds.playTap(); onLogout(); }}
            className="btn-outline"
            style={{ padding: "9px 14px", fontSize: "0.82rem" }}
          >
            <LogOut size={15} /> Exit
          </button>
        </div>
      </div>

      {/* Incident Switcher Pills (If multiple incidents exist) */}
      {incidents.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: "700", whiteSpace: "nowrap" }}>
            Your Reports:
          </span>
          {incidents.map((inc) => {
            const isSel = activeIncident?.id === inc.id;
            return (
              <button
                key={inc.id}
                onClick={() => handleSelectIncident(inc)}
                style={{
                  background: isSel ? "rgba(0, 229, 255, 0.2)" : "rgba(30, 41, 59, 0.6)",
                  border: isSel ? "1.5px solid #00e5ff" : "1px solid rgba(255,255,255,0.1)",
                  color: isSel ? "#00e5ff" : "#cbd5e1",
                  borderRadius: "20px",
                  padding: "6px 14px",
                  fontSize: "0.8rem",
                  fontWeight: isSel ? "800" : "600",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease"
                }}
              >
                <span>{inc.id} ({inc.emergency_type})</span>
                <span className={`neon-badge ${inc.status === "Resolved" ? "neon-badge-resolved" : "neon-badge-critical"}`} style={{ fontSize: "0.62rem", padding: "1px 6px" }}>
                  {inc.status}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Full-Width Live Tracking Map View (Requirement 6 & 7) */}
      {activeIncident ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {/* Status 5-Step Lifecycle Timeline */}
          <div style={{ background: "rgba(15, 23, 42, 0.85)", borderRadius: "14px", padding: "14px 16px", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="neon-badge neon-badge-enroute" style={{ fontSize: "0.78rem" }}>
                  {activeIncident.id}
                </span>
                <span style={{ fontWeight: "800", color: "#f8fafc", fontSize: "1rem" }}>
                  {activeIncident.emergency_type} Emergency
                </span>
                <span style={{ fontSize: "0.8rem", color: "#00e5ff" }}>
                  • Unit: <strong>{activeIncident.suggested_service}</strong>
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  onClick={() => setIsFullscreenMap(!isFullscreenMap)}
                  className="btn-outline"
                  style={{ padding: "4px 10px", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  {isFullscreenMap ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                  {isFullscreenMap ? "Standard View" : "Full Screen Map"}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
              {STATUS_STEPS.map((step, idx) => {
                const isDone = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

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
                      boxShadow: isCurrent ? "0 0 14px rgba(255, 51, 75, 0.8)" : "none",
                      transition: "all 0.3s ease"
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

          {/* Expansive Full-Width Interactive Map */}
          <div style={{
            height: isFullscreenMap ? "75vh" : "480px",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1.5px solid rgba(56,189,248,0.35)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            position: "relative",
            transition: "all 0.3s ease"
          }}>
            <MapComponent
              height="100%"
              center={[activeIncident.lat, activeIncident.lng]}
              zoom={14}
              incidentLocation={{ lat: activeIncident.lat, lng: activeIncident.lng }}
              incidentLabel={`Incident (${activeIncident.emergency_type})`}
              responderLocation={responderLiveLoc || (activeIncident.assigned_responder ? { lat: activeIncident.assigned_responder.lat, lng: activeIncident.assigned_responder.lng } : null)}
              responderType={activeIncident.assigned_responder?.service_type || activeIncident.suggested_service}
              responderLabel={activeIncident.assigned_responder?.full_name || "Assigned Responder"}
              routeCoordinates={routeCoords}
            />

            {/* Floating Live Telemetry Badge over Map */}
            <div style={{
              position: "absolute",
              top: "14px",
              left: "14px",
              background: "rgba(14, 20, 36, 0.9)",
              backdropFilter: "blur(8px)",
              padding: "8px 14px",
              borderRadius: "10px",
              border: "1px solid rgba(0, 229, 255, 0.3)",
              zIndex: 999,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
            }}>
              <Radio size={16} color="#00ff88" className="animate-pulse" />
              <div style={{ fontSize: "0.78rem", color: "#f8fafc", fontWeight: "700" }}>
                {activeIncident.assigned_responder ? `Live Tracking: ${activeIncident.assigned_responder.full_name}` : `5-Min Escalation Alert Broadcasted`}
              </div>
            </div>
          </div>

          {/* Assigned Responder Card / Awaiting Notification */}
          {activeIncident.assigned_responder ? (
            <div style={{
              background: "rgba(30, 41, 59, 0.8)",
              border: "1px solid rgba(0, 229, 255, 0.35)",
              borderRadius: "14px",
              padding: "16px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              backdropFilter: "blur(12px)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: "rgba(0, 229, 255, 0.2)", color: "#00e5ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Navigation size={24} />
                </div>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: "900", color: "#f8fafc" }}>
                    {activeIncident.assigned_responder.full_name}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
                    Unit: <strong>{activeIncident.assigned_responder.service_type}</strong> • Vehicle: <strong>{activeIncident.assigned_responder.vehicle_number || "DEMO-UNIT"}</strong>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${activeIncident.assigned_responder.phone || "112"}`}
                onClick={() => sounds.playTap()}
                style={{
                  background: "linear-gradient(135deg, #00ff88, #059669)",
                  color: "#070a12",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  fontSize: "0.9rem",
                  fontWeight: "900",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 4px 16px rgba(0, 255, 136, 0.3)"
                }}
              >
                <Phone size={16} /> Call Responder
              </a>
            </div>
          ) : (
            <div style={{ background: "rgba(255, 184, 0, 0.12)", border: "1px solid rgba(255, 184, 0, 0.35)", padding: "16px", borderRadius: "14px", color: "#ffb800", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "12px" }}>
              <Clock size={24} className="animate-spin" />
              <div>
                <div style={{ fontWeight: "800" }}>Awaiting Responder Acceptance (5-Minute Escalation Active)</div>
                <div style={{ fontSize: "0.8rem", color: "#cbd5e1", marginTop: "2px" }}>
                  Direct alert sent to 5 nearest eligible {activeIncident.suggested_service} units with OSRM turn-by-turn routing.
                </div>
              </div>
            </div>
          )}

          {/* Emergency Details Accordion / Checklist info */}
          <div style={{ background: "rgba(30, 41, 59, 0.5)", borderRadius: "12px", padding: "14px 18px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: "700", color: "#ff334b", marginBottom: "4px" }}>
              Reported Conditions Checklist:
            </div>
            <div style={{ fontSize: "0.88rem", color: "#f8fafc" }}>
              {activeIncident.checklist_json ? JSON.parse(activeIncident.checklist_json || "[]").join(" • ") : "Standard Emergency"}
            </div>
            {activeIncident.description && (
              <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginTop: "6px" }}>
                Description: "{activeIncident.description}"
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="tactical-glass-card" style={{ padding: "50px", textAlign: "center", color: "#94a3b8" }}>
          <CheckCircle2 size={42} color="#00ff88" style={{ margin: "0 auto 12px auto" }} />
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc", marginBottom: "6px" }}>No Active Emergencies</h3>
          <p style={{ fontSize: "0.88rem", maxWidth: "420px", margin: "0 auto" }}>
            Tap the button below if you or someone nearby requires immediate emergency assistance.
          </p>
          <button
            onClick={() => { sounds.playAlertSiren(); onOpenSos(); }}
            className="btn-emergency-main"
            style={{ margin: "18px auto 0 auto", padding: "10px 24px" }}
          >
            <AlertOctagon size={18} /> Report Emergency SOS
          </button>
        </div>
      )}

      {/* Emergency Helpline Quick-Dials */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginTop: "6px" }}>
        <a 
          href="tel:108"
          onClick={() => sounds.playTap()}
          style={{ textDecoration: "none", background: "rgba(0, 255, 136, 0.08)", border: "1px solid rgba(0, 255, 136, 0.25)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#f8fafc" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <HeartPulse size={18} color="#00ff88" />
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: "700" }}>Ambulance</div>
              <div style={{ fontSize: "0.72rem", color: "#00ff88", fontWeight: "800" }}>Dial 108</div>
            </div>
          </div>
          <PhoneCall size={15} color="#00ff88" />
        </a>

        <a 
          href="tel:100"
          onClick={() => sounds.playTap()}
          style={{ textDecoration: "none", background: "rgba(0, 229, 255, 0.08)", border: "1px solid rgba(0, 229, 255, 0.25)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#f8fafc" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldAlert size={18} color="#00e5ff" />
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: "700" }}>Police Control</div>
              <div style={{ fontSize: "0.72rem", color: "#00e5ff", fontWeight: "800" }}>Dial 100 / 112</div>
            </div>
          </div>
          <PhoneCall size={15} color="#00e5ff" />
        </a>

        <a 
          href="tel:101"
          onClick={() => sounds.playTap()}
          style={{ textDecoration: "none", background: "rgba(255, 51, 75, 0.08)", border: "1px solid rgba(255, 51, 75, 0.25)", borderRadius: "10px", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", color: "#f8fafc" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Flame size={18} color="#ff334b" />
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: "700" }}>Fire Rescue</div>
              <div style={{ fontSize: "0.72rem", color: "#ff334b", fontWeight: "800" }}>Dial 101</div>
            </div>
          </div>
          <PhoneCall size={15} color="#ff334b" />
        </a>
      </div>

    </div>
  );
}
