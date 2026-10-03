import React, { useState, useEffect } from "react";
import { Phone, Shield, HeartPulse, Flame, AlertTriangle, X, Search, WifiOff, CheckCircle2, Clock, PhoneCall } from "lucide-react";
import { contactsApi } from "../services/api";

export default function OfflineContactsModal({ isOpen, onClose }) {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  const loadContacts = async () => {
    try {
      const res = await contactsApi.fetchAndCache();
      setContacts(res.contacts || []);
      setIsOffline(res.offline);
    } catch (e) {
      console.warn(e);
    }
  };

  if (!isOpen) return null;

  const defaultSections = [
    {
      category: "Ambulance Services",
      icon: HeartPulse,
      color: "#2563eb",
      items: [
        { name: "SRKR Hospital Ambulance", phone: "+91 98765 43210", dist: "1.2 km" },
        { name: "City Government Trauma Care", phone: "+91 98765 11223", dist: "2.4 km" }
      ]
    },
    {
      category: "Police Stations",
      icon: Shield,
      color: "#f59e0b",
      items: [
        { name: "Bhimavaram Police Station", phone: "+91 98480 12345", dist: "2.8 km" },
        { name: "Traffic Control HQ", phone: "+91 98480 55667", dist: "3.1 km" }
      ]
    },
    {
      category: "Fire Services",
      icon: Flame,
      color: "#ef4444",
      items: [
        { name: "Fire Station Central", phone: "+91 94400 67890", dist: "3.5 km" }
      ]
    }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container story-card" style={{ maxWidth: "600px", padding: "28px", position: "relative" }}>
        
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "20px", right: "20px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        {/* Header matching Screen 11 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#0f172a" }}>Emergency Contacts</h2>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
              Last updated: 10 Nov 2025, 10:00 AM
            </div>
          </div>
          <span style={{
            background: "#fef3c7",
            color: "#b45309",
            fontWeight: "700",
            fontSize: "0.75rem",
            padding: "4px 10px",
            borderRadius: "6px",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}>
            <WifiOff size={12} /> Offline Mode
          </span>
        </div>

        {/* Red 112 Banner (Screen 11) */}
        <div style={{
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          borderRadius: "12px",
          padding: "16px 20px",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          boxShadow: "0 4px 14px rgba(239, 68, 68, 0.3)"
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.9 }}>
              National Emergency Hotline
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", letterSpacing: "-0.01em" }}>
              112 Emergency Call
            </div>
            <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>All Services (Ambulance, Police, Fire)</div>
          </div>

          <a
            href="tel:112"
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "white",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              textDecoration: "none"
            }}
          >
            <PhoneCall size={22} />
          </a>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "16px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "11px", color: "#94a3b8" }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search emergency services & hospitals..."
            style={{
              width: "100%",
              padding: "8px 12px 8px 36px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem"
            }}
          />
        </div>

        {/* Categorized Lists matching Screen 11 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "380px", overflowY: "auto" }}>
          {defaultSections.map((sec) => {
            const Icon = sec.icon;
            const items = sec.items.filter(i => !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.phone.includes(searchQuery));
            if (items.length === 0) return null;

            return (
              <div key={sec.category}>
                <div style={{ fontSize: "0.82rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Icon size={14} color={sec.color} /> {sec.category}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#0f172a" }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: "600", marginTop: "2px" }}>
                          {item.phone} • <span style={{ color: "#64748b" }}>{item.dist}</span>
                        </div>
                      </div>

                      <a
                        href={`tel:${item.phone.replace(/[^0-9+]/g, '')}`}
                        style={{
                          background: "#16a34a",
                          color: "white",
                          padding: "6px 14px",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: "700",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)"
                        }}
                      >
                        <Phone size={13} /> Call
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f1f5f9", fontSize: "0.72rem", color: "#64748b", textAlign: "center" }}>
          * Cached in IndexedDB for zero-network connectivity. Direct cellular voice dialing works without data.
        </div>

      </div>
    </div>
  );
}
