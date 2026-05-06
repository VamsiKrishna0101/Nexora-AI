import React from "react";
import ReactMarkdown from "react-markdown";
import { parseMarkdownTable } from "../../../utils/reportParser";
import "../styles/IntelligenceReport.css";

interface CompetitiveTabProps {
  landscape?: string;
  marketPosition?: string;
}

const CompetitiveTab: React.FC<CompetitiveTabProps> = ({ landscape, marketPosition }) => {
  const compMap = parseMarkdownTable(landscape);
  
  // Clean up market position text
  const cleanedMarket = marketPosition?.replace(/^#+\s+/gm, "")?.trim() || "";
  const parts = cleanedMarket.split("**Win/Loss Risk:**");
  
  // Helper to fix "squashed" markdown tables (replace | | with newlines)
  const formatMarkdown = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\|\s+\|/g, "|\n|")
      .replace(/(\*\*.*?\*\*)\s*\|/g, "$1\n\n|") // Add newline before table if it follows bold text
      .trim();
  };

  const marketAnalysis = formatMarkdown(parts[0]);
  const riskAnalysis = formatMarkdown(parts[1]);

  return (
    <div className="ir-panel">
      <div className="ir-section-header">
        <div className="ir-section-accent"></div>
        <span className="ir-section-title" style={{ marginBottom: 0 }}>Competitive map</span>
      </div>
      
      <table className="ir-comp" style={{ marginBottom: "28px" }}>
        <thead>
          <tr>
            <th>Competitor</th>
            <th>HQ</th>
            <th>Stage</th>
            <th>Core differentiation</th>
          </tr>
        </thead>
        <tbody>
          {compMap.length > 0 ? compMap.map((row, idx) => (
            <tr key={idx}>
              <td><strong>{row.competitor || row.name || "—"}</strong></td>
              <td>{row.hq || row.location || "—"}</td>
              <td>{row.stage || "—"}</td>
              <td>{row.core_differentiation || row.differentiation || "—"}</td>
            </tr>
          )) : (
            <tr><td colSpan={4} style={{ textAlign: "center" }}>Competitive mapping in progress...</td></tr>
          )}
        </tbody>
      </table>

      <div className="ir-section-header">
        <div className="ir-section-accent"></div>
        <span className="ir-section-title" style={{ marginBottom: 0 }}>Structural position</span>
      </div>
      <div className="ir-prose" style={{ marginBottom: "24px" }}>
        <ReactMarkdown>{marketAnalysis || "Strategic positioning analysis unavailable."}</ReactMarkdown>
      </div>

      <div className="ir-section-header">
        <div className="ir-section-accent"></div>
        <span className="ir-section-title" style={{ marginBottom: 0 }}>Win/loss risk</span>
      </div>
      <div className="ir-prose">
        <ReactMarkdown>{riskAnalysis || "Risk assessment currently being calculated by Analyst Core."}</ReactMarkdown>
      </div>
    </div>
  );
};

export default CompetitiveTab;
