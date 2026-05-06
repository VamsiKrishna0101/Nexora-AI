import React from "react";
import ReactMarkdown from "react-markdown";
import "../styles/IntelligenceReport.css";

interface VerdictTabProps {
  verdict?: string;
}

const VerdictTab: React.FC<VerdictTabProps> = ({ verdict }) => {
  const getVerdictBadge = (text?: string) => {
    if (!text) return "NEUTRAL";
    if (text.toUpperCase().includes("BUY")) return "BUY — Moderate conviction";
    if (text.toUpperCase().includes("SELL")) return "SELL — High risk";
    return "HOLD — Strategic watch";
  };

  const parseVerdictSections = (text?: string) => {
    if (!text) return { thesis: "", bull: "", bear: "", multiples: "", rec: "" };
    
    const thesis = text.split("**Core Thesis:**")[1]?.split("**Bull Case:**")[0]?.trim() || "";
    const bull = text.split("**Bull Case:**")[1]?.split("**Bear Case:**")[0]?.trim() || "";
    const bear = text.split("**Bear Case:**")[1]?.split("**Comparable Multiples:**")[0]?.trim() || "";
    const multiples = text.split("**Comparable Multiples:**")[1]?.split("**Engagement Recommendation:**")[0]?.trim() || "";
    const rec = text.split("**Engagement Recommendation:**")[1]?.trim() || "";
    
    return { thesis, bull, bear, multiples, rec };
  };

  const sections = parseVerdictSections(verdict);
  const badgeText = getVerdictBadge(verdict);

  return (
    <div className="ir-panel">
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
        <span style={{ fontSize: "18px", fontWeight: "600", color: "#1a1a1a" }}>Analyst verdict</span>
        <span className={`ir-badge ${badgeText.includes("BUY") ? "ir-buy" : "ir-warn"}`} style={{ fontSize: "12px", padding: "5px 14px" }}>
          {badgeText}
        </span>
      </div>

      <div className="ir-verdict-block">
        <div className="ir-verdict-label">Core thesis</div>
        <div className="ir-verdict-text">
          <ReactMarkdown>{sections.thesis || "Strategic alignment with market tailwinds."}</ReactMarkdown>
        </div>
      </div>

      <div className="ir-grid2" style={{ marginBottom: "12px" }}>
        <div className="ir-verdict-block" style={{ background: "#EAF3DE", marginBottom: 0 }}>
          <div className="ir-verdict-label" style={{ color: "#3B6D11" }}>Bull case</div>
          <div className="ir-verdict-text" style={{ fontSize: "12px" }}>
            <ReactMarkdown>{sections.bull || "Execution on roadmap leads to market share consolidation."}</ReactMarkdown>
          </div>
        </div>
        <div className="ir-verdict-block" style={{ background: "#FCEBEB", marginBottom: 0 }}>
          <div className="ir-verdict-label" style={{ color: "#A32D2D" }}>Bear case</div>
          <div className="ir-verdict-text" style={{ fontSize: "12px" }}>
             <ReactMarkdown>{sections.bear || "Market dependency and competitive pressure erode data moat."}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="ir-verdict-block">
        <div className="ir-verdict-label">Comparable multiples</div>
        <div className="ir-verdict-text">
           <ReactMarkdown>{sections.multiples || "Multiples currently tracking the 8-12x ARR range for the sector."}</ReactMarkdown>
        </div>
      </div>

      <div className="ir-verdict-block" style={{ marginBottom: 0 }}>
        <div className="ir-verdict-label">Engagement recommendation</div>
        <div className="ir-verdict-text">
           <ReactMarkdown>{sections.rec || "Initiate monitoring of product-led growth metrics."}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default VerdictTab;
