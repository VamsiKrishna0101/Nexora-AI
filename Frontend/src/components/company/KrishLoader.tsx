import React from "react";
import { ShieldCheck } from "lucide-react";

interface KrishLoaderProps {
  isError?: boolean;
  errorMsg?: string;
  message?: string;
}

export default function KrishLoader({ isError, errorMsg, message = "Krish is analyzing company intelligence..." }: KrishLoaderProps) {
  if (isError) {
    return (
      <div className="deep-dive-loader error-state">
        <div className="loader-glitch-icon">
          <ShieldCheck size={48} color="#ef4444" />
        </div>
        <h2 className="loader-title-premium" style={{ color: "#ef4444" }}>Analysis Interrupted</h2>
        <p className="loader-subtitle">{errorMsg || "A system synchronization error has occurred."}</p>
        <button onClick={() => window.location.reload()} className="loader-retry-btn">
          Return to Hub
        </button>
      </div>
    );
  }

  return (
    <div className="deep-dive-loader">
      {/* Cinematic Animation Hub (Nexus Pulse) */}
      <div className="forensic-scanner-container">
        <div className="scanner-pulse-ring" style={{ width: 120, height: 120 }}></div>
        <div className="scanner-pulse-ring" style={{ width: 120, height: 120, animationDelay: "0.5s" }}></div>
        <div className="scanner-pulse-ring" style={{ width: 120, height: 120, animationDelay: "1s" }}></div>
        <div className="scanner-icon-hub" style={{ width: 60, height: 60 }}>
          <div className="nexus-gem" />
        </div>
      </div>

      <div className="loader-details">
        <h2 className="loader-title-premium" style={{ fontSize: "1.25rem", letterSpacing: "0.05em", color: "#1e293b" }}>
          INTELLIGENCE SYNTHESIS ACTIVE
        </h2>
        <p className="loader-subtitle" style={{ color: "#64748b", fontStyle: "italic" }}>
          <span className="scanning-status-dot"></span>
          {message}
        </p>

        <div className="loader-metadata" style={{ justifyContent: "center", marginTop: 20 }}>
          <span>Market Vector: Tracking</span>
          <span>Financial Nodes: Syncing</span>
        </div>
      </div>

      <style>{`
        .nexus-gem {
            width: 24px;
            height: 24px;
            background: #ef4444;
            transform: rotate(45deg);
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.6);
            animation: pulse-gem 2s infinite ease-in-out;
        }
        @keyframes pulse-gem {
            0%, 100% { transform: rotate(45deg) scale(0.9); opacity: 0.8; }
            50% { transform: rotate(45deg) scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
