import React from "react";
import ReactMarkdown from "react-markdown";
import { parseTimeline, parseKeyValuePairs } from "../../../utils/reportParser";
import "../styles/IntelligenceReport.css";

interface OverviewTabProps {
  brief?: string;
  signals?: string;
  techStack?: string;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ brief, signals, techStack }) => {
  const timeline = parseTimeline(signals);
  const techItems = parseKeyValuePairs(techStack);
  
  // Clean up brief (remove the first line if it's a title and clean markdown)
  const lines = brief?.split("\n") || [];
  const body = (lines.length > 0 && lines[0].includes("#")) ? lines.slice(1).join("\n") : brief;

  return (
    <div className="ir-panel">
      <div className="ir-prose" style={{ marginBottom: "24px" }}>
        <ReactMarkdown>{body || ""}</ReactMarkdown>
      </div>
      
      <div className="ir-section-title">Strategic signals</div>
      <div className="ir-card" style={{ padding: "4px 16px" }}>
        {timeline.length > 0 ? timeline.map((item, idx) => (
          <div className="ir-timeline-item" key={idx}>
            <span className="ir-tdate">{item.date}</span>
            <span className="ir-ttxt">{item.text}</span>
          </div>
        )) : <p className="ir-prose">No strategic signals found.</p>}
      </div>

      <div className="ir-grid2">
        <div>
          <div className="ir-section-title" style={{ marginTop: "4px" }}>Key themes</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            <span className="ir-signal-pill">Strategic Expansion</span>
            <span className="ir-signal-pill">Operational Efficiency</span>
            <span className="ir-signal-pill">Market Leadership</span>
            <span className="ir-signal-pill">Innovation Cycle</span>
          </div>
        </div>
        <div>
          <div className="ir-section-title" style={{ marginTop: "4px" }}>Tech stack</div>
          <div className="ir-card" style={{ marginBottom: 0 }}>
            {techItems.length > 0 ? techItems.slice(0, 4).map((item, idx) => (
              <div className="ir-kv" key={idx}>
                <span className="ir-k">{item.k}</span>
                <span className="ir-v">{item.v}</span>
              </div>
            )) : <p className="ir-prose">Tech fingerprint details unavailable.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
