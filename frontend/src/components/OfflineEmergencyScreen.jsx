import React, { useState, useEffect } from "react";
import { 
  PhoneCall, Shield, HeartPulse, Flame, AlertOctagon, 
  WifiOff, MapPin, Send, RefreshCw, Phone, Clock, 
  CheckCircle2, ArrowRight, MessageSquare, AlertTriangle
} from "lucide-react";
import { sounds } from "../services/soundEffects";
import { getDeviceLocation } from "../services/api";

export default function OfflineEmergencyScreen({ onReconnect, onOpenOfflineReport }) {
  const [coords, setCoords] = useState(() => {
    const savedLat = parseFloat(localStorage.getItem("last_device_gps_lat"));
    const savedLng = parseFloat(localStorage.getItem("last_device_gps_lng"));
    return (!isNaN(savedLat) && !isNaN(savedLng)) ? { lat: savedLat, lng: savedLng } : { lat: 17.5800, lng: 78.4867 };
  });
  const [isCheckingNet, setIsCheckingNet] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  useEffect(() => {
    getDeviceLocation().then((loc) => {
      setCoords({ lat: loc.lat, lng: loc.lng });
    });
  }, []);

  const handleCheckConnection = () => {
    sounds.playTap();
    setIsCheckingNet(true);
    setTimeout(() => {
      setIsCheckingNet(false);
      if (navigator.onLine) {
        sounds.playSuccess();
        if (onReconnect) onReconnect();
      } else {
        sounds.playAlertSiren();
      }
    }, 1200);
  };

  const emergencySmsUrl = `sms:112?body=EMERGENCY! I need immediate help. My GPS Location is: Lat ${coords.lat}, Lng ${coords.lng}. (Hyperlocal SOS)`;

  const SERVICES = [
    { name: "National Emergency", number: "112", icon: AlertOctagon, color: "#ff334b", desc: "All-in-one Police, Fire & Medical" },
    { name: "Medical Ambulance", number: "108", icon: HeartPulse, color: "#00ff88", desc: "Emergency Trauma & EMS" },
    { name: "Police Control", number: "100", icon: Shield, color: "#00e5ff", desc: "Police Patrol & Immediate Security" },
    { name: "Fire & Rescue", number: "101", icon: Flame, color: "#f97316", desc: "Fire Engine & Disaster Squad" }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#070a12",
      color: "#f8fafc",
      padding: "20px 16px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      
      {/* Top Offline Header Banner */}
      <div style={{
        maxWidth: "540px",
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        background: "rgba(255, 51, 75, 0.15)",
        border: "1px solid rgba(255, 51, 75, 0.4)",
        borderRadius: "12px",
        marginBottom: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <WifiOff size={18} color="#ff334b" />
          <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#ff4d67" }}>
            OFFLINE EMERGENCY MODE
          </span>
        </div>

        <button
          onClick={handleCheckConnection}
          disabled={isCheckingNet}
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "#f8fafc",
            borderRadius: "8px",
            padding: "5px 10px",
            fontSize: "0.75rem",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          <RefreshCw size={12} className={isCheckingNet ? "animate-spin" : ""} />
          {isCheckingNet ? "Checking..." : "Retry Online"}
        </button>
      </div>

      <main style={{ maxWidth: "540px", width: "100%", display: "flex", flexDirection: "column", gap: "14px" }}>
        
        {/* Big Red 112 National Helpline */}
        <a
          href="tel:112"
          onClick={() => sounds.playAlertSiren()}
          style={{
            textDecoration: "none",
            background: "linear-gradient(135deg, #ff334b 0%, #b91c1c 100%)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "#ffffff",
            boxShadow: "0 8px 30px rgba(255, 51, 75, 0.45)",
            border: "2px solid rgba(255, 255, 255, 0.3)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PhoneCall size={28} />
            </div>
            <div>
              <div style={{ fontSize: "1.3rem", fontWeight: "900", letterSpacing: "0.5px" }}>
                CALL 112 NOW
              </div>
              <div style={{ fontSize: "0.78rem", opacity: 0.9 }}>
                Direct Cellular Voice Call • Works With 0 Internet
              </div>
            </div>
          </div>
          <ArrowRight size={24} />
        </a>

        {/* 1-Tap Emergency SMS Dispatch with GPS */}
        <div style={{
          background: "rgba(14, 20, 36, 0.95)",
          border: "1.5px solid rgba(0, 229, 255, 0.3)",
          borderRadius: "14px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <MessageSquare size={18} color="#00e5ff" />
            <div style={{ fontSize: "0.92rem", fontWeight: "800", color: "#f8fafc" }}>
              Emergency SMS with Live GPS
            </div>
          </div>

          <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>
            Sends your exact GPS coordinates via standard cellular SMS (requires zero mobile data):
          </div>

          <div style={{ background: "rgba(0, 229, 255, 0.08)", padding: "8px 12px", borderRadius: "8px", fontFamily: "monospace", fontSize: "0.75rem", color: "#00e5ff" }}>
            📍 GPS: Lat {coords.lat}, Lng {coords.lng}
          </div>

          <a
            href={emergencySmsUrl}
            onClick={() => { sounds.playSuccess(); setSmsSent(true); }}
            style={{
              textDecoration: "none",
              background: "linear-gradient(135deg, #00e5ff, #0284c7)",
              color: "#070a12",
              borderRadius: "10px",
              padding: "12px",
              fontWeight: "900",
              fontSize: "0.88rem",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 15px rgba(0, 229, 255, 0.3)"
            }}
          >
            <Send size={16} /> Send SOS SMS to 112
          </a>
        </div>

        {/* Quick Dial Helplines Grid */}
        <div style={{
          background: "rgba(14, 20, 36, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "14px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#f8fafc" }}>
            Direct Department Dials (Stored Offline)
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {SERVICES.map((s) => (
              <a
                key={s.number}
                href={`tel:${s.number}`}
                onClick={() => sounds.playTap()}
                style={{
                  textDecoration: "none",
                  background: "rgba(30, 41, 59, 0.6)",
                  border: `1px solid ${s.color}40`,
                  borderRadius: "12px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <s.icon size={18} color={s.color} />
                  <span style={{ fontFamily: "monospace", fontWeight: "900", fontSize: "1.1rem", color: s.color }}>
                    {s.number}
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#f8fafc" }}>
                  {s.name}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
                  {s.desc}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Draft Offline Report Button */}
        {onOpenOfflineReport && (
          <button
            onClick={onOpenOfflineReport}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#cbd5e1",
              borderRadius: "12px",
              padding: "12px",
              fontSize: "0.82rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px"
            }}
          >
            <Clock size={15} /> Draft Incident Report (Queues for Auto-Sync)
          </button>
        )}

      </main>

    </div>
  );
}
