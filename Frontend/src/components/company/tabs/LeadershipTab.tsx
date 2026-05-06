import React from "react";
import { parseMarkdownTable } from "../../../utils/reportParser";
import "../styles/IntelligenceReport.css";

interface Leader {
  name: string;
  title: string;
  image_url?: string;
  linkedin_url?: string;
}

interface LeadershipTabProps {
  personas?: string;
  leadersData?: Leader[];
}

const LeadershipTab: React.FC<LeadershipTabProps> = ({ personas, leadersData }) => {
  const parsedTeam = parseMarkdownTable(personas);
  // Use leadersData as fallback for the table if parsedTeam is empty
  const fullTeam = parsedTeam.length > 0 ? parsedTeam : (leadersData || []);
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <div className="ir-panel">
      <div className="ir-grid2" style={{ marginBottom: "20px" }}>
        {leadersData && leadersData.length > 0 ? leadersData.slice(0, 2).map((leader, idx) => (
          <div className="ir-person-card" key={idx}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              {leader.image_url ? (
                <img src={leader.image_url} alt={leader.name} className="ir-avatar" style={{ objectFit: "cover" }} />
              ) : (
                <div className={`ir-avatar ${idx === 1 ? 'teal' : ''}`}>{getInitials(leader.name)}</div>
              )}
              <div>
                <div className="ir-person-name">{leader.name}</div>
                <div className="ir-person-title">{leader.title}</div>
              </div>
            </div>
            <p className="ir-prose" style={{ fontSize: "12px", marginBottom: "10px" }}>
              Executive leadership focused on strategic growth and operational excellence. 
              {leader.linkedin_url && <a href={leader.linkedin_url} target="_blank" rel="noreferrer" style={{ marginLeft: "5px", color: "#185FA5" }}>View LinkedIn</a>}
            </p>
            <span className={`ir-badge ${idx === 1 ? 'info' : 'warn'}`}>
              {idx === 0 ? "Strategic Decision Maker" : "Technical Visionary"}
            </span>
          </div>
        )) : <p className="ir-prose">No key leadership detail found.</p>}
      </div>

      <div className="ir-section-header">
        <div className="ir-section-accent"></div>
        <span className="ir-section-title" style={{ marginBottom: 0 }}>Full leadership team</span>
      </div>
      <table className="ir-comp" style={{ marginBottom: "28px" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Title</th>
            <th>Signal</th>
          </tr>
        </thead>
        <tbody>
          {fullTeam.length > 0 ? fullTeam.map((row, idx) => (
            <tr key={idx}>
              <td><strong>{row.name || "—"}</strong></td>
              <td>{row.title || "—"}</td>
              <td>{row.signal || row.prior || "Executive Alignment"}</td>
            </tr>
          )) : (
            <tr><td colSpan={3} style={{ textAlign: "center" }}>Full roster currently being mapped...</td></tr>
          )}
        </tbody>
      </table>

      <div className="ir-section-header">
        <div className="ir-section-accent"></div>
        <span className="ir-section-title" style={{ marginBottom: 0 }}>Active openings</span>
      </div>
      <div>
        <span className="ir-signal-pill">Senior Engineering</span>
        <span className="ir-signal-pill">Growth Operations</span>
        <span className="ir-signal-pill">Account Management</span>
      </div>
    </div>
  );
};

export default LeadershipTab;
