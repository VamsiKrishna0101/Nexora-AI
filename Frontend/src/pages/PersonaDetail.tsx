import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, ExternalLink, User, Briefcase, Heart, BarChart2, Zap, Brain } from "lucide-react";
import { reportsAPI } from "../services/api";
import PersonalityTab from "../components/persona/tabs/PersonalityTab";
import ProfessionTab from "../components/persona/tabs/ProfessionTab";
import PersonalLifeTab from "../components/persona/tabs/PersonalLifeTab";
import SocialTab from "../components/persona/tabs/SocialTab";
import IntelligenceTab from "../components/persona/tabs/IntelligenceTab";
import PersonaPPT from "../components/persona/layout/PersonaPPT";
import { generatePPT as generatePersonaPPT } from "../utils/pptx";
import { useRef } from "react";
import "../styles/persona-detail.css";
import "../styles/intelligence.css";
import { Download } from "lucide-react";

const TABS = [
  { id: "personality", label: "Personality", icon: User },
  { id: "profession", label: "Profession", icon: Briefcase },
  { id: "personal", label: "Personal Life", icon: Heart },
  { id: "social", label: "Social Media", icon: BarChart2 },
  { id: "intel", label: "Intelligence", icon: Zap },
];

const parse = (val: any): any => {
  if (!val) return null;
  if (typeof val !== "string") return val;
  try {
    return JSON.parse(val);
  } catch {
    try {
      const fixed = val
        .replace(/:\s*None/g, ": null")
        .replace(/:\s*True/g, ": true")
        .replace(/:\s*False/g, ": false");
      return (new Function("return " + fixed))();
    } catch { return null; }
  }
};

export default function PersonaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personality");
  const [isExporting, setIsExporting] = useState(false);
  const pptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    reportsAPI.getById(id)
      .then(res => setReport(res.data.data))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0f2f7" }}>
      <div className="dashboard-spinner" />
    </div>
  );

  if (!report) return (
    <div className="detail-error">
      <p>Report not found.</p>
      <button onClick={() => navigate("/dashboard/personas")} className="back-btn" style={{ marginTop: 16 }}>
        <ArrowLeft size={14} /> Back to Personas
      </button>
    </div>
  );

  const S = report.report_data?.sections || {};
  const subject = report.report_data?.subject || {};

  const profile = parse(S.executive_profile)?.data || {};
  const personality = S.personality_analysis?.data || {};
  const profession = parse(S.professional_journey)?.data || {};
  const skills = S.skills_expertise?.data || {};
  const achievements = S.recent_projects_partnerships?.data || parse(S.professional_achievements)?.data || {};
  const online = S.online_presence?.data || {};
  const social = S.social_content_summary?.raw?.data || parse(S.speaks_or_writes)?.data || {};
  const network = S.network_influence?.data || parse(S.events_networking)?.data || {};
  const redFlags = S.red_flags?.data || {};
  const engage = S.how_to_engage?.data || {};
  const verdict = S.analyst_verdict?.data || {};
  const postIntel = S.social_post_intelligence?.data || {};

  const name = subject.name || profile.full_name || "Unknown";
  const role = subject.designation || profile.current_role || "";
  const company = subject.company || profile.company || "";
  const location = profile.location || "";
  const photoUrl = (profile.profile_photo_url || "").replace(/\/e=/, '?e=') || null;
  const inflScore = profile.influence_score || 0;

  const tier = inflScore >= 80 ? "DECISION MAKER" : inflScore >= 50 ? "INFLUENCER" : "USER";
  const tierColor = inflScore >= 80 ? "#e8d5b0" : inflScore >= 50 ? "#fcd34d" : "#94a3b8";
  const barColor = inflScore >= 80 ? "#c8a96e" : inflScore >= 50 ? "#f59e0b" : "#94a3b8";

  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="persona-detail">

      {/* ── Dark Premium Header ── */}
      <div className="detail-header">

        {/* Avatar */}
        <div className="dh-avatar-col">
          {photoUrl
            ? <img src={photoUrl} alt={name} className="detail-avatar" referrerPolicy="no-referrer" />
            : <div className="detail-avatar detail-avatar--fallback">{initials}</div>
          }
          <div className="avatar-tier-badge" style={{ background: tierColor + "15", color: tierColor, borderColor: tierColor + "40" }}>
            {tier}
          </div>
        </div>

        {/* Identity — center */}
        <div className="dh-identity">
          <div className="detail-header-label">Executive Research Profile</div>
          <h1 className="detail-name">{name}</h1>
          <p className="detail-role">{role}{company ? ` · ${company}` : ""}</p>
          {location && (
            <span className="detail-location">
              <MapPin size={11} /> {location}
            </span>
          )}
        </div>

        {/* Right column — score + links */}
        <div className="dh-right">
          <div className="dh-score-top">
            <span className="influence-label">Influence Score</span>
            <span className="influence-value" style={{ color: barColor }}>{inflScore}</span>
          </div>
          <div className="influence-bar-bg">
            <div className="influence-bar-fill" style={{ width: `${inflScore}%`, background: barColor }} />
          </div>
          <div className="influence-ticks">
            <div className="tick-item"><span className="tick-num">0</span><span className="tick-lbl">User</span></div>
            <div className="tick-item"><span className="tick-num">50</span><span className="tick-lbl">Influencer</span></div>
            <div className="tick-item tick-item--right"><span className="tick-num">100</span><span className="tick-lbl">Decision Maker</span></div>
          </div>
          <div className="detail-header-links">
            <button
              className="detail-link-btn cursor-pointer"
              style={{ background: "rgba(0,212,255,0.15)", borderColor: "#00d4ff", color: "#00d4ff" }}
              disabled={isExporting}
              onClick={async () => {
                setIsExporting(true);
                try {
                  await generatePersonaPPT(report);
                } catch (err) {
                  console.error("PPT Export failed:", err);
                } finally {
                  setIsExporting(false);
                }
              }}
            >
              <Download size={10} /> {isExporting ? "Generating..." : "Export PPT Deck"}
            </button>
            <button
              className="detail-link-btn cursor-pointer"
              style={{ background: "rgba(200,169,110,0.15)", borderColor: "#c8a96e", color: "#e8d5b0" }}
              onClick={() => navigate(`/dashboard/insights?personaId=${id}`)}
            >
              <Brain size={10} /> AI Insights
            </button>
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noreferrer" className="detail-link-btn">
                LinkedIn <ExternalLink size={10} />
              </a>
            )}
            {profile.twitter_handle && (
              <a href={`https://twitter.com/${profile.twitter_handle}`} target="_blank" rel="noreferrer" className="detail-link-btn">
                @{profile.twitter_handle} <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="tab-bar">
        {TABS.map(({ id: tabId, label, icon: Icon }) => (
          <button
            key={tabId}
            className={`tab-btn${activeTab === tabId ? " tab-btn--active" : ""}`}
            onClick={() => setActiveTab(tabId)}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="tab-content" key={activeTab}>
        {activeTab === "personality" && <PersonalityTab data={personality} />}
        {activeTab === "profession" && <ProfessionTab profession={profession} skills={skills} achievements={achievements} />}
        {activeTab === "personal" && <PersonalLifeTab profile={profile} profession={profession} network={network} social={social} />}
        {activeTab === "social" && <SocialTab online={online} social={social} postIntel={postIntel} />}
        {activeTab === "intel" && <IntelligenceTab verdict={verdict} engage={engage} redFlags={redFlags} network={network} />}
      </div>

      {/* Hidden PDF Engine */}
      <div ref={pptRef}>
        <PersonaPPT reportData={report.report_data} personaData={report} />
      </div>
    </div>
  );
}