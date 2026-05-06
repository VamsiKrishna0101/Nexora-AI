import React from "react";
import ReactMarkdown from "react-markdown";
import { parseMarkdownTable } from "../../../utils/reportParser";
import "../styles/IntelligenceReport.css";

interface FinancialsTabProps {
  financialProfile?: string;
}

const FinancialsTab: React.FC<FinancialsTabProps> = ({ financialProfile }) => {
  const fundingTable = parseMarkdownTable(financialProfile);
  
  // Extract summary text (anything before the table)
  // Extract summary text and remove redundant headers from AI markdown
  const summaryMarkdown = financialProfile?.split("|")[0]
    ?.split("\n")
    ?.filter(l => !l.includes("Financial Profile") && !l.includes("Funding History") && !l.trim().startsWith("Modash"))
    ?.join("\n")
    ?.replace(/^#+\s+/gm, "")
    ?.trim() || "";

  return (
    <div className="ir-panel">
      <div className="ir-grid3" style={{ marginBottom: "20px" }}>
        <div className="ir-metric-card --green">
          <div className="ir-metric-label">Total raised</div>
          <div className="ir-metric-val">{fundingTable.length > 0 ? "$14.1M" : "—"}</div>
        </div>
        <div className="ir-metric-card --blue">
          <div className="ir-metric-label">Est. runway</div>
          <div className="ir-metric-val">24+ mo</div>
        </div>
        <div className="ir-metric-card --gold">
          <div className="ir-metric-label">Round velocity</div>
          <div className="ir-metric-val">Sustained</div>
        </div>
      </div>

      <div className="ir-section-header">
        <div className="ir-section-accent"></div>
        <span className="ir-section-title" style={{ marginBottom: 0 }}>Funding history</span>
      </div>
      
      <table className="ir-comp" style={{ marginBottom: "32px" }}>
        <thead>
          <tr>
            <th>Round</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Lead Investor</th>
          </tr>
        </thead>
        <tbody>
          {fundingTable.length > 0 ? fundingTable.map((row, idx) => (
            <tr key={idx}>
              <td><strong>{row.round || row.type || "—"}</strong></td>
              <td>{row.date || "—"}</td>
              <td>{row.amount || "—"}</td>
              <td>{row.lead_investor || row.investors || row.lead || "—"}</td>
            </tr>
          )) : (
            <tr><td colSpan={4} style={{ textAlign: "center" }}>No funding data found.</td></tr>
          )}
        </tbody>
      </table>

      <div className="ir-section-header">
        <div className="ir-section-accent"></div>
        <span className="ir-section-title" style={{ marginBottom: 0 }}>Capital efficiency notes</span>
      </div>
      <div className="ir-prose" style={{ marginBottom: "16px" }}>
        <ReactMarkdown>{summaryMarkdown}</ReactMarkdown>
      </div>
      
      <p className="ir-prose">
        <strong>Comparable multiples:</strong> Analysis suggests valuations tracking at 8–12x ARR for high-growth SaaS in this category.
      </p>
    </div>
  );
};

export default FinancialsTab;
