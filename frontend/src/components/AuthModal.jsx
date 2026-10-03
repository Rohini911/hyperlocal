import React, { useState } from "react";
import { X, User, Shield, Lock, Phone, Mail, ArrowRight } from "lucide-react";
import { authApi } from "../services/api";

export default function AuthModal({ isOpen, onClose, initialMode = "citizen-login", onAuthSuccess }) {
  // mode: 'citizen-login', 'citizen-register', 'responder-login', 'responder-register'
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("Ambulance"); // For responder
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    setMode(initialMode);
    setErrorMsg("");
    // Quick demo fills
    if (initialMode === "citizen-login") {
      setEmail("citizen@demo.com");
      setPassword("123456");
    } else if (initialMode === "responder-login") {
      setEmail("ambulance1@demo.com");
      setPassword("password123");
    } else {
      setEmail("");
      setPassword("");
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (mode === "citizen-login" || mode === "responder-login") {
        const res = await authApi.login(email, password);
        onAuthSuccess(res.user);
        onClose();
      } else if (mode === "citizen-register") {
        const res = await authApi.register({
          email,
          password,
          full_name: fullName,
          phone,
          role: "citizen"
        });
        onAuthSuccess(res.user);
        onClose();
      } else if (mode === "responder-register") {
        const res = await authApi.register({
          email,
          password,
          full_name: fullName,
          phone,
          role: "responder",
          service_type: serviceType
        });
        onAuthSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const isRegister = mode === "citizen-register" || mode === "responder-register";

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: "480px", padding: "28px", background: "#0e1424", border: "1px solid rgba(56,189,248,0.3)" }}>
        
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: "absolute", top: "18px", right: "18px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", marginBottom: "4px" }}>
            {mode === "citizen-login" && "Citizen Login"}
            {mode === "citizen-register" && "Citizen Registration"}
            {mode === "responder-login" && "Responder Login"}
            {mode === "responder-register" && "Responder Registration"}
          </div>
          <div style={{ fontSize: "0.82rem", color: "#94a3b8" }}>
            {isRegister ? "Create a new demo account" : "Enter your credentials to continue"}
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: "rgba(255, 51, 75, 0.2)", border: "1px solid rgba(255, 51, 75, 0.4)", color: "#ff4d67", padding: "8px 12px", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "14px" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          
          {isRegister && (
            <>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.15)", color: "#f8fafc", fontSize: "0.88rem" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.15)", color: "#f8fafc", fontSize: "0.88rem" }}
                />
              </div>

              {mode === "responder-register" && (
                <div>
                  <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#00e5ff", display: "block", marginBottom: "4px" }}>Service Type (Select One)</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(30,41,59,0.7)", border: "1px solid rgba(0,229,255,0.4)", color: "#f8fafc", fontSize: "0.88rem" }}
                  >
                    <option value="Ambulance">🚑 Ambulance</option>
                    <option value="Police">🚓 Police</option>
                    <option value="Fire">🚒 Fire</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@demo.com"
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.15)", color: "#f8fafc", fontSize: "0.88rem" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#cbd5e1", display: "block", marginBottom: "4px" }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", background: "rgba(30,41,59,0.7)", border: "1px solid rgba(255,255,255,0.15)", color: "#f8fafc", fontSize: "0.88rem" }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary-blue"
            style={{ width: "100%", padding: "12px", fontSize: "0.95rem", marginTop: "8px" }}
          >
            {isLoading ? "Processing..." : isRegister ? "Create Account" : "Sign In"}
          </button>

        </form>

        {/* Alternate switcher links */}
        <div style={{ marginTop: "16px", textAlign: "center", fontSize: "0.78rem", color: "#94a3b8" }}>
          {mode === "citizen-login" && (
            <span>New citizen? <button onClick={() => setMode("citizen-register")} style={{ background: "transparent", border: "none", color: "#00e5ff", fontWeight: "700", cursor: "pointer" }}>Register here</button></span>
          )}
          {mode === "citizen-register" && (
            <span>Already registered? <button onClick={() => setMode("citizen-login")} style={{ background: "transparent", border: "none", color: "#00e5ff", fontWeight: "700", cursor: "pointer" }}>Login here</button></span>
          )}
          {mode === "responder-login" && (
            <span>New demo responder? <button onClick={() => setMode("responder-register")} style={{ background: "transparent", border: "none", color: "#00ff88", fontWeight: "700", cursor: "pointer" }}>Register service here</button></span>
          )}
          {mode === "responder-register" && (
            <span>Already registered? <button onClick={() => setMode("responder-login")} style={{ background: "transparent", border: "none", color: "#00ff88", fontWeight: "700", cursor: "pointer" }}>Login here</button></span>
          )}
        </div>

      </div>
    </div>
  );
}
