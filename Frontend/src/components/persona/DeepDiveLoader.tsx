import React, { useState, useEffect } from "react";
import { Cpu, ShieldCheck, Database, Globe, UserCheck, BarChart4, FileCheck } from "lucide-react";

interface Step {
  id: number;
  label: string;
  icon: React.ElementType;
  threshold: number;
}

const STEPS: Step[] = [
  { id: 1, label: "Initializing Identity Mapping...", icon: Database, threshold: 15 },
  { id: 2, label: "Extracting Professional Journey...", icon: UserCheck, threshold: 35 },
  { id: 3, label: "Scanning Social Media Activity...", icon: Globe, threshold: 55 },
  { id: 4, label: "Resolving Institutional Connections...", icon: BarChart4, threshold: 75 },
  { id: 5, label: "Running Psychological Synthesis...", icon: ShieldCheck, threshold: 85 },
  { id: 6, label: "Calculating Forensic Risk Metrics...", icon: Cpu, threshold: 92 },
  { id: 7, label: "Finalizing Intelligence Dossier...", icon: FileCheck, threshold: 98 },
];

const SUB_MESSAGES = [
  "Synchronizing identity clusters...",
  "Mapping professional trajectory...",
  "Analyzing sentiment across social nodes...",
  "Detecting institutional connection density...",
  "Synthesizing psychological archetypes...",
  "Resolving historical career anomalies...",
  "Benchmarking influence coefficients...",
  "Evaluating forensic risk indicators...",
  "Cross-referencing media footprints...",
  "Generating intelligence dossier..."
];

export default function DeepDiveLoader({ isError, errorMsg }: { isError?: boolean; errorMsg?: string }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(STEPS[0]);
  const [subMessageIdx, setSubMessageIdx] = useState(0);
  const [isCrawlMode, setIsCrawlMode] = useState(false);

  // ── Main Progress Logic (8-10 Minute Calibration) ──
  useEffect(() => {
    if (isError) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        // Stage 1: Fast Start (0-20%) - approx 25s
        if (prev < 20) return prev + 0.12; 
        
        // Stage 2: Deep Scanning (20-50%) - approx 150s
        if (prev < 50) return prev + 0.03; 
        
        // Stage 3: Neural Synthesis (50-80%) - approx 220s
        if (prev < 80) return prev + 0.02; 
        
        // Stage 4: Forensic Analysis (80-95%) - approx 180s
        if (prev < 95) return prev + 0.012; 
        
        // Stage 5: Finalizing (95-99%) - approx 60s
        if (prev < 99.2) return prev + 0.002;

        // Stage 6: Asymptotic Crawl (Never hits 100% until API returns)
        setIsCrawlMode(true);
        return prev + 0.0002; 
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isError]);

  // ── Rotating Sub-Messages (Every 8 seconds) ──
  useEffect(() => {
    if (isError) return;
    const msgInterval = setInterval(() => {
      setSubMessageIdx((prev) => (prev + 1) % SUB_MESSAGES.length);
    }, 8000);
    return () => clearInterval(msgInterval);
  }, [isError]);

  useEffect(() => {
    const step = STEPS.findLast((s) => progress >= s.threshold - 5) || STEPS[0];
    setCurrentStep(step);
  }, [progress]);


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
      {/* Cinematic Animation Hub */}
      <div className="forensic-scanner-container">
        <div className="scanner-pulse-ring"></div>
        <div className="scanner-pulse-ring"></div>
        <div className="scanner-pulse-ring"></div>
        <div className="scanner-icon-hub">
          <currentStep.icon size={32} className="step-icon-active" strokeWidth={1.5} />
        </div>
      </div>

      <div className="loader-details">
        <h2 className="loader-title-premium">Krish is conducting Deep Analysis</h2>
        <p className="loader-subtitle">
          <span className="scanning-status-dot"></span>
          {isCrawlMode ? "Optimizing Final Output..." : currentStep.label}
        </p>

        <div className="loader-sub-message">
           {SUB_MESSAGES[subMessageIdx]}
        </div>

        {/* Progress Bar Container */}
        <div className="premium-progress-container">
          <div 
            className="premium-progress-fill" 
            style={{ width: `${progress}%`, transition: "width 0.15s linear" }}
          />
          <div className="progress-percentage-label">
            {progress >= 99.9 ? "99.9" : progress.toFixed(1)}%
          </div>
        </div>

        <div className="loader-metadata">
          <span>Security Protocol: AES-256</span>
          <span>Source Verification: Active</span>
          <span>Neural Nodes: Online</span>
        </div>
      </div>
    </div>
  );
}
