import React, { useState } from "react";
import { PlusCircle, Lock, Mail, User, Phone, X, Eye, EyeOff } from "lucide-react";
import { authApi } from "../services/api";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState("login"); // 'login' or 'register'
  const [email, setEmail] = useState("priya@example.com");
  const [password, setPassword] = useState("password123");
  const [fullName, setFullName] = useState("Priya Sharma");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      if (activeTab === "login") {
        const res = await authApi.login(email, password);
        onLoginSuccess(res.user);
      } else {
        const res = await authApi.register({
          email,
          password,
          full_name: fullName,
          phone,
          role: "citizen"
        });
        onLoginSuccess(res.user);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Authentication failed. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div 
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "840px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          overflow: "hidden",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          position: "relative"
        }}
      >
        {/* Left Hero Graphic Card (Screen 1) */}
        <div style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "40px 32px",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Background image overlay */}
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1587745416684-47b883828363?auto=format&fit=crop&w=800&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.25
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
              <PlusCircle size={28} color="white" />
            </div>
            <h2 style={{ fontSize: "1.7rem", fontWeight: "800", lineHeight: "1.2", marginBottom: "12px" }}>
              Hyperlocal Emergency Response Platform
            </h2>
            <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
              Your safety, our priority. Instant real-time dispatch and GPS tracking connecting citizens with nearby emergency units.
            </p>
          </div>

          <div style={{ position: "relative", zIndex: 1, fontSize: "0.8rem", color: "#cbd5e1" }}>
            Report • Connect • Respond • Save Lives
          </div>
        </div>

        {/* Right Form Card */}
        <div style={{ padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          
          <button 
            onClick={onClose} 
            style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
          >
            <X size={20} />
          </button>

          {/* Toggle Tabs (Login / Register) */}
          <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "10px", marginBottom: "16px" }}>
            <button
              onClick={() => setActiveTab("login")}
              style={{
                flex: 1,
                padding: "8px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "0.88rem",
                background: activeTab === "login" ? "#ffffff" : "transparent",
                color: activeTab === "login" ? "#0f172a" : "#64748b",
                boxShadow: activeTab === "login" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer"
              }}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab("register")}
              style={{
                flex: 1,
                padding: "8px",
                border: "none",
                borderRadius: "8px",
                fontWeight: "700",
                fontSize: "0.88rem",
                background: activeTab === "register" ? "#ffffff" : "transparent",
                color: activeTab === "register" ? "#0f172a" : "#64748b",
                boxShadow: activeTab === "register" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer"
              }}
            >
              Register
            </button>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div style={{ marginBottom: "16px", background: "#f8fafc", padding: "10px", borderRadius: "8px", border: "1px dashed #cbd5e1" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b", marginBottom: "6px" }}>
              ⚡ 1-Click Demo Accounts (Password: password123)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <button
                type="button"
                onClick={() => { setEmail("priya@example.com"); setPassword("password123"); }}
                style={{ background: "#e0f2fe", border: "1px solid #bae6fd", color: "#0369a1", fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                👤 Citizen (Priya)
              </button>
              <button
                type="button"
                onClick={() => { setEmail("ravi@ambulance.com"); setPassword("password123"); }}
                style={{ background: "#dbeafe", border: "1px solid #bfdbfe", color: "#1d4ed8", fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                🚑 Ambulance (Friend 1)
              </button>
              <button
                type="button"
                onClick={() => { setEmail("vikram@police.com"); setPassword("password123"); }}
                style={{ background: "#fef3c7", border: "1px solid #fde68a", color: "#b45309", fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                🚓 Police (Friend 2)
              </button>
              <button
                type="button"
                onClick={() => { setEmail("suresh@fire.com"); setPassword("password123"); }}
                style={{ background: "#ffedd5", border: "1px solid #fed7aa", color: "#c2410c", fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                🚒 Fire (Friend 3)
              </button>
              <button
                type="button"
                onClick={() => { setEmail("admin@eoc.gov.in"); setPassword("password123"); }}
                style={{ background: "#f3e8ff", border: "1px solid #e9d5ff", color: "#7e22ce", fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
              >
                🛡️ EOC Admin
              </button>
            </div>
          </div>

          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0f172a", marginBottom: "4px" }}>
            {activeTab === "login" ? "Sign In" : "Create Account"}
          </h3>

          {errorMsg && (
            <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "8px 12px", borderRadius: "8px", fontSize: "0.82rem", marginBottom: "14px" }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {activeTab === "register" && (
              <>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" }}>Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" }}>Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: "600", color: "#475569", display: "block", marginBottom: "4px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: "100%", padding: "8px 40px 8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.88rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "8px", background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "#64748b" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Use demo accounts with password: password123"); }} style={{ color: "#2563eb", textDecoration: "none", fontWeight: "600" }}>
                Default: password123
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary-blue"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", fontSize: "0.92rem", fontWeight: "700", marginTop: "4px" }}
            >
              {isLoading ? "Signing in..." : (activeTab === "login" ? "Sign In" : "Create Account")}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}
