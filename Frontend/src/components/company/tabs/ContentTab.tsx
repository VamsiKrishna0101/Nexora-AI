import React from "react";
import { parseMarkdownTable, parseKeyValuePairs } from "../../../utils/reportParser";
import "../styles/IntelligenceReport.css";

interface ContentTabProps {
  contentMessaging?: string;
}

const ContentTab: React.FC<ContentTabProps> = ({ contentMessaging }) => {
  const topPosts = parseMarkdownTable(contentMessaging);
  const themes = parseKeyValuePairs(contentMessaging);
  
  // Extract content gap (usually at the end)
  const contentGap = contentMessaging?.split("**Content Gap:**")?.[1]?.trim() || "Analysis of messaging strategy gaps pending.";

  return (
    <div className="ir-panel">
      <div className="ir-section-title">Top posts by engagement</div>
      <div className="ir-card" style={{ padding: "4px 16px", marginBottom: "20px" }}>
        {topPosts.length > 0 ? topPosts.slice(0, 5).map((post, idx) => (
          <div className="ir-post-row" key={idx}>
            <span className="ir-post-num">{idx + 1}</span>
            <span className="ir-post-text">{post.excerpt || post.content || "Engagement anchor text..."}</span>
            <span className="ir-post-meta">
              <span>{post.likes || "—"} likes</span>
              <span>{post.comments || "—"} comments</span>
              <span className="ir-badge ir-info">{post.theme || "Messaging"}</span>
            </span>
          </div>
        )) : <p className="ir-prose">No high-engagement content identified.</p>}
      </div>

      <div className="ir-section-title">Narrative themes</div>
      <div className="ir-card" style={{ marginBottom: "16px" }}>
        {themes.length > 0 ? themes.slice(0, 3).map((theme, idx) => (
          <div className="ir-kv" key={idx}>
            <span className="ir-k">{theme.k}</span>
            <span className="ir-v">{theme.v}</span>
          </div>
        )) : <p className="ir-prose">Content narrative classification in progress.</p>}
      </div>

      <div className="ir-section-title">Content gap</div>
      <p className="ir-prose">{contentGap}</p>
    </div>
  );
};

export default ContentTab;
