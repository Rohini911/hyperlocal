import React, { useState, useEffect } from "react";
import { HardDrive, CloudOff, RefreshCw, X, CheckCircle2, Clock } from "lucide-react";
import { offlineStorage } from "../services/offlineStorage";
import { incidentApi } from "../services/api";

export default function OfflineReportsModal({ isOpen, onClose, onSyncComplete }) {
  const [offlineReports, setOfflineReports] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReports();
    }
  }, [isOpen]);

  const loadReports = () => {
    const list = offlineStorage.getOfflineReports();
    setOfflineReports(list);
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      for (const report of offlineReports) {
        await incidentApi.create(report);
        offlineStorage.removeOfflineReport(report.offlineId);
      }
      loadReports();
      alert("All offline incident reports synced successfully!");
      if (onSyncComplete) onSyncComplete();
    } catch (e) {
      alert("Failed to sync some reports. Please check your internet connection.");
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ padding: "32px 28px", textAlign: "center", maxWidth: "520px" }}>
        
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "18px", right: "18px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        {/* Cloud Off Icon (Screen 12) */}
        <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "#eff6ff", color: "#2563eb", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
          <CloudOff size={36} />
        </div>

        <h3 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a", marginBottom: "6px" }}>
          You are offline
        </h3>
        <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: "1.5", marginBottom: "24px" }}>
          Your reports have been saved locally on this device and will be transmitted to emergency dispatch when internet connectivity returns.
        </p>

        {/* Saved Offline Incidents List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px", textAlign: "left" }}>
          {offlineReports.length === 0 ? (
            <div style={{ background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: "10px", padding: "20px", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
              No pending offline reports. (Drafts appear here when reporting without internet).
            </div>
          ) : (
            offlineReports.map((r) => (
              <div
                key={r.offlineId}
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "2px" }}>
                    <span style={{ fontWeight: "800", color: "#2563eb", fontFamily: "monospace", fontSize: "0.9rem" }}>
                      {r.offlineId.slice(0, 14)}
                    </span>
                    <span className="badge-status badge-en-route">Pending</span>
                  </div>
                  <div style={{ fontWeight: "600", fontSize: "0.88rem", color: "#0f172a" }}>{r.emergency_type} Emergency</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{new Date(r.createdOfflineAt).toLocaleString()}</div>
                </div>

                <button
                  onClick={() => handleSyncAll()}
                  disabled={isSyncing}
                  className="btn-primary-blue"
                  style={{ padding: "6px 12px", fontSize: "0.78rem" }}
                >
                  <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} /> Sync
                </button>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: "16px" }}>
          <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>
            Pending Reports ({offlineReports.length})
          </span>
          <button
            onClick={handleSyncAll}
            disabled={isSyncing || offlineReports.length === 0}
            className="btn-primary-blue"
            style={{ padding: "10px 20px" }}
          >
            Go Online to Sync
          </button>
        </div>

      </div>
    </div>
  );
}
