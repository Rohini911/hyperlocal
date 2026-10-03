import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Phone, PhoneOff, User, Shield, X, AlertCircle } from "lucide-react";
import { chatApi, socket } from "../services/api";

export default function IncidentChatDrawer({ isOpen, onClose, incident, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isCalling, setIsCalling] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && incident) {
      loadChats();
      socket.emit("join_incident", incident.id);

      const handleNewChat = (chat) => {
        if (chat.incident_id === incident.id) {
          setMessages((prev) => [...prev, chat]);
        }
      };

      socket.on("new_chat_message", handleNewChat);
      return () => {
        socket.off("new_chat_message", handleNewChat);
      };
    }
  }, [isOpen, incident]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Call timer
  useEffect(() => {
    let timer;
    if (isCalling) {
      timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCalling]);

  const loadChats = async () => {
    try {
      const data = await chatApi.getChats(incident.id);
      setMessages(data || []);
    } catch (e) {
      console.warn("Failed to load chats", e);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!newMessage.trim() || !incident) return;

    const msg = newMessage.trim();
    setNewMessage("");

    socket.emit("send_chat", {
      incidentId: incident.id,
      message: msg,
      senderId: currentUser.id,
      senderName: currentUser.full_name,
      senderRole: currentUser.role
    });
  };

  const sendQuickText = (text) => {
    socket.emit("send_chat", {
      incidentId: incident.id,
      message: text,
      senderId: currentUser.id,
      senderName: currentUser.full_name,
      senderRole: currentUser.role
    });
  };

  if (!isOpen || !incident) return null;

  const targetName = currentUser.role === "citizen" 
    ? (incident.assigned_responder?.full_name || "Assigned Unit")
    : incident.citizen_name;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-card" style={{ maxWidth: "520px", width: "100%", height: "80vh", display: "flex", flexDirection: "column", padding: "0", overflow: "hidden", position: "relative" }}>
        
        {/* Header */}
        <div style={{ background: "rgba(15, 23, 42, 0.95)", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#f8fafc" }}>
                Live Emergency Chat
              </h3>
              <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                With: <strong>{targetName}</strong> • Incident {incident.id}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setIsCalling(!isCalling)}
              style={{
                background: isCalling ? "#ef4444" : "#10b981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "8px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: "600",
                fontSize: "0.8rem"
              }}
            >
              {isCalling ? <PhoneOff size={16} /> : <Phone size={16} />}
              {isCalling ? `In Call (${callDuration}s)` : "Emergency Call"}
            </button>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Live Call Simulator Overlay */}
        {isCalling && (
          <div style={{ background: "rgba(16, 185, 129, 0.15)", borderBottom: "1px solid rgba(16, 185, 129, 0.3)", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", animation: "pulse-active 2s infinite" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#34d399", fontSize: "0.85rem", fontWeight: "600" }}>
              <Phone size={16} /> Connected to {targetName} ({Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')})
            </div>
            <span style={{ fontSize: "0.75rem", color: "#a7f3d0" }}>VoIP Audio Encrypted</span>
          </div>
        )}

        {/* Messages Body */}
        <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", background: "rgba(11, 15, 25, 0.6)" }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: "center", color: "#64748b", margin: "auto" }}>
              <MessageSquare size={32} style={{ margin: "0 auto 8px auto", opacity: 0.5 }} />
              <p>No messages yet. Send a direct update or question below.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === currentUser.id;
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    background: isMe ? "#2563eb" : "#1e293b",
                    color: "#f8fafc",
                    padding: "10px 14px",
                    borderRadius: isMe ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                  }}
                >
                  <div style={{ fontSize: "0.7rem", color: isMe ? "#93c5fd" : "#94a3b8", marginBottom: "3px", display: "flex", justifyContent: "space-between", gap: "10px" }}>
                    <span>{m.sender_name} ({m.sender_role})</span>
                    <span>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <div style={{ fontSize: "0.9rem", lineHeight: "1.4" }}>{m.message}</div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Response Pills */}
        <div style={{ padding: "8px 16px", background: "rgba(15, 23, 42, 0.8)", display: "flex", gap: "6px", overflowX: "auto", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={() => sendQuickText("What is your current location?")} style={{ whiteSpace: "nowrap", padding: "4px 8px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "none", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer" }}>
            "Where are you?"
          </button>
          <button onClick={() => sendQuickText("Patient is conscious and breathing.")} style={{ whiteSpace: "nowrap", padding: "4px 8px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "none", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer" }}>
            "Patient is breathing"
          </button>
          <button onClick={() => sendQuickText("Arrived at the main entrance.")} style={{ whiteSpace: "nowrap", padding: "4px 8px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "none", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer" }}>
            "At main entrance"
          </button>
          <button onClick={() => sendQuickText("Sirens audible, standing by.")} style={{ whiteSpace: "nowrap", padding: "4px 8px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "none", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer" }}>
            "Sirens heard"
          </button>
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} style={{ padding: "12px 16px", background: "rgba(15, 23, 42, 0.95)", display: "flex", gap: "10px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your emergency message..."
            style={{
              flex: 1,
              padding: "10px 14px",
              background: "#1e293b",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "10px",
              color: "#f8fafc",
              fontSize: "0.9rem"
            }}
          />
          <button
            type="submit"
            className="btn-primary-red"
            style={{ padding: "10px 18px", borderRadius: "10px" }}
          >
            <Send size={16} />
          </button>
        </form>

      </div>
    </div>
  );
}
