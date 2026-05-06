import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Target, Megaphone, Palette, Activity, Calendar, MessageCircle,
  AlertCircle, ArrowLeft, Loader2, Sparkles, Building2, ChevronDown, Cpu,
  Shield, TrendingUp, Coins, Zap, Users
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { reportsAPI, insightsAPI, companyAPI } from "../services/api";
import "../styles/insights.css";

const TABS = ["Persona", "Company", "Compare Persona", "Compare Company"];

const INSIGHT_CARDS = [
  { id: "sales_pitch", title: "Sales Pitch Intelligence", desc: "Tailored engagement frameworks based on professional journey & triggers", icon: Target, colorClass: "bg-blue" },
  { id: "reputation_intelligence", title: "Reputation & Controversy", desc: "Online reputation signals, controversy footprints, and risk exposure", icon: Megaphone, colorClass: "bg-purple" },
  { id: "thought_leadership", title: "Thought Leadership & Content", desc: "Content patterns, authority signals, and thought leadership footprint", icon: Palette, colorClass: "bg-pink" },
  { id: "career_anomaly", title: "Career Trajectory Anomaly", desc: "Deep-dive modeling on career deviations and unexplained transitions", icon: Activity, colorClass: "bg-orange" },
  { id: "network_density", title: "Network Density & Influence", desc: "Networking density score and influence spread across communities", icon: Calendar, colorClass: "bg-green" },
  { id: "communication_risk", title: "Communication Risk Profile", desc: "Psychological safety signals and communication risk classification", icon: MessageCircle, colorClass: "bg-cyan" },
];

const COMPANY_INSIGHT_CARDS = [
  { id: "capital_efficiency", title: "Capital Efficiency & Runway", desc: "Deep math on burn rate, funding discipline, and institutional conviction", icon: Coins, colorClass: "bg-blue" },
  { id: "competitive_moat", title: "Competitive Moat Durability", desc: "Technical analysis of switching costs, data dominance, and defensibility", icon: Shield, colorClass: "bg-purple" },
  { id: "leadership_risk", title: "Leadership & Execution Risk", desc: "Internal team dynamics, founder transition status, and critical org gaps", icon: Users, colorClass: "bg-pink" },
  { id: "market_timing", title: "Market Timing & Tailwinds", desc: "Macro assessment of category growth, buyer sophistication, and windows", icon: TrendingUp, colorClass: "bg-orange" },
  { id: "strategic_signals", title: "Strategic Signal Decoding", desc: "Reading between the lines of acquisitions, hiring, and stealth moves", icon: Zap, colorClass: "bg-green" },
  { id: "exit_valuation", title: "Exit & Valuation Thesis", desc: "Probabilistic modeling of strategic vs financial buyer scenarios and multiples", icon: Sparkles, colorClass: "bg-gold" },
];

const COMPARE_INSIGHT_CARDS = [

  { id: "executive_dominance", title: "Executive Dominance & Prowess", desc: "Probabilistic hierarchy modeling: who holds the leverage in high-stakes negotiation", icon: Target, colorClass: "bg-blue" },
  { id: "network_collision", title: "Network DNA & Collision", desc: "Entity resolution of shared hidden ties, alumni cabals, and overlapping influence shadows", icon: Building2, colorClass: "bg-orange" },
  { id: "behavioral_tension", title: "Behavioral Tension & Synergy", desc: "Psychological friction analysis and optimal collaboration or conflict patterns", icon: Activity, colorClass: "bg-purple" },
  { id: "adversarial_modeling", title: "Adversarial Maneuver Pathways", desc: "Game-theory based modeling on how each party likely counters or sabotages the other", icon: AlertCircle, colorClass: "bg-pink" },
  { id: "strategic_verdict", title: "Strategic Comparison Verdict", desc: "High-density definitive summary on who to prioritize and the final bottom line", icon: Sparkles, colorClass: "bg-gold" },
];

// ── Dynamic Result Renderer ────────────────────────────────────────────
const DynamicInsightsRenderer = ({ data }: { data: any }) => {
  if (typeof data !== "object" || data === null) return <p>{String(data)}</p>;

  const fmt = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const scoreKeys = Object.keys(data).filter(
    (k) => typeof data[k] === "number" && k.toLowerCase().includes("score")
  );
  const otherKeys = Object.keys(data).filter((k) => !scoreKeys.includes(k));

  const NestedValue = ({ val, contextKey }: { val: any; contextKey?: string }) => {
    let v = val;
    if (typeof v === "string") {
      const t = v.trim();
      if ((t.startsWith("[") && t.endsWith("]")) || (t.startsWith("{") && t.endsWith("}"))) {
        try { v = JSON.parse(t); } catch { }
      }
    }
    if (v === null || v === "" || v === "null" || v === "none")
      return <span style={{ fontStyle: "italic", color: "#94a3b8", fontSize: "0.85rem" }}>No {contextKey ? fmt(contextKey).toLowerCase() : "data"} detected.</span>;
    if (Array.isArray(v)) {
      if (v.length === 0) return <span style={{ fontStyle: "italic", color: "#94a3b8", fontSize: "0.85rem" }}>None detected.</span>;
      return (
        <ul style={{ margin: "3px 0", paddingLeft: "16px" }}>
          {v.map((item, i) => (
            <li key={i} style={{ marginBottom: "4px", fontSize: "0.875rem", color: "#1e293b", lineHeight: "1.55" }}>
              {typeof item === "object" ? JSON.stringify(item) : String(item)}
            </li>
          ))}
        </ul>
      );
    }
    if (typeof v === "object")
      return Object.keys(v).length === 0
        ? <span style={{ fontStyle: "italic", color: "#94a3b8", fontSize: "0.85rem" }}>None detected.</span>
        : <span style={{ fontSize: "0.875rem", color: "#1e293b" }}>{JSON.stringify(v)}</span>;
    return <span style={{ fontSize: "0.875rem", color: "#1e293b", lineHeight: "1.6" }}>{String(v)}</span>;
  };

  return (
    <div className="dynamic-insight-container">
      {scoreKeys.length > 0 && (
        <div className="insight-score-row">
          {scoreKeys.map((k) => (
            <div key={k} className="insight-score-card">
              <div className="insight-score-value">{data[k]}</div>
              <div className="insight-score-label">{fmt(k)}</div>
            </div>
          ))}
        </div>
      )}

      {otherKeys.map((key) => {
        let val = data[key];
        if (typeof val === "string") {
          const t = val.trim();
          if ((t.startsWith("[") && t.endsWith("]")) || (t.startsWith("{") && t.endsWith("}"))) {
            try { val = JSON.parse(t); } catch { }
          }
        }

        if (val === null || val === "" || val === "null" || val === "none") {
          return (
            <div key={key} className="insight-section-block">
              <h3 className="insight-section-title">{fmt(key)}</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic" }}>
                No {fmt(key).toLowerCase()} detected.
              </p>
            </div>
          );
        }

        let content;

        if (Array.isArray(val)) {
          if (val.length === 0) {
            content = <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic" }}>No {fmt(key).toLowerCase()} detected.</p>;
          } else {
            const isPrimitive = val.every((v) => typeof v !== "object" || v === null);
            if (isPrimitive) {
              content = (
                <ul style={{ margin: 0, paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "5px" }}>
                  {val.map((item, i) => <li key={i} style={{ fontSize: "0.9rem", lineHeight: 1.65, color: "#1e293b" }}>{String(item)}</li>)}
                </ul>
              );
            } else {
              content = (
                <div className="insight-grid-array">
                  {val.map((item, i) => (
                    <div key={i} className="insight-array-card">
                      {typeof item === "object" && item !== null
                        ? Object.entries(item).map(([ik, iv]) => (
                          <div key={ik} className="insight-dict-row">
                            <strong>{fmt(ik)}</strong>
                            <NestedValue val={iv} contextKey={ik} />
                          </div>
                        ))
                        : <span style={{ fontSize: "0.875rem", color: "#1e293b" }}>{String(item)}</span>}
                    </div>
                  ))}
                </div>
              );
            }
          }
        } else if (typeof val === "object" && val !== null) {
          if (Object.keys(val).length === 0) {
            content = <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic" }}>No {fmt(key).toLowerCase()} detected.</p>;
          } else {
            content = (
              <div className="insight-dict-box">
                {Object.entries(val).map(([ik, iv]) => (
                  <div key={ik} className="insight-dict-row">
                    <strong>{fmt(ik)}</strong>
                    <NestedValue val={iv} contextKey={ik} />
                  </div>
                ))}
              </div>
            );
          }
        } else {
          content = <p style={{ margin: 0, fontSize: "0.9rem", color: "#334155", lineHeight: 1.7 }}>{String(val)}</p>;
        }

        return (
          <div key={key} className="insight-section-block">
            <h3 className="insight-section-title">{fmt(key)}</h3>
            {content}
          </div>
        );
      })}
    </div>
  );
};

// ── Shared Selector ───────────────────────────────────────────────────
const PersonaSelector = ({ 
  label, 
  value, 
  onSelect, 
  personas, 
  dropdownOpen, 
  setDropdownOpen, 
  searchQuery, 
  setSearchQuery 
}: any) => {
  const selected = personas.find((p: any) => p.id === value);
  const selectedName = selected ? (selected.report_data?.subject?.name || selected.company_name) : `Select ${label.toLowerCase()}...`;
  
  const filtered = personas.filter((p: any) => {
    const name = p.report_data?.subject?.name || p.company_name || "";
    const role = p.report_data?.subject?.designation || "";
    const term = searchQuery.toLowerCase();
    return name.toLowerCase().includes(term) || role.toLowerCase().includes(term);
  });

  return (
    <div className="target-persona-bar" style={{ flex: 1, margin: 0 }}>
      <span className="target-persona-label">{label}</span>
      <div className="target-select-wrapper">
        <div
          className="target-select-input"
          style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <span style={{ fontWeight: value ? 600 : 400, color: value ? "#0f172a" : "#94a3b8" }}>
            {selectedName}
          </span>
          <ChevronDown size={13} color="#94a3b8" />
        </div>

        {dropdownOpen && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 90 }} onClick={() => { setDropdownOpen(false); setSearchQuery(""); }} />
            <div style={{
              position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
              background: "#ffffff", border: "1px solid #dde3ec", borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100,
              maxHeight: "280px", display: "flex", flexDirection: "column", overflow: "hidden",
            }}>
              <div style={{ padding: "8px", borderBottom: "1px solid #f1f5f9" }}>
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%", padding: "6px 10px", border: "1px solid #dde3ec",
                    borderRadius: "5px", outline: "none", fontSize: "0.8rem",
                    background: "#f8fafc", boxSizing: "border-box", color: "#0f172a"
                  }}
                />
              </div>
              <div style={{ overflowY: "auto", flex: 1, padding: "4px" }}>
                {filtered.map((p: any) => (
                  <div
                    key={p.id}
                    onClick={() => { onSelect(p.id); setDropdownOpen(false); setSearchQuery(""); }}
                    style={{
                      padding: "8px 10px", cursor: "pointer", borderRadius: "5px",
                      background: p.id === value ? "#f1f5f9" : "transparent"
                    }}
                  >
                    <div style={{ fontSize: "0.825rem", fontWeight: p.id === value ? 700 : 500 }}>{p.report_data?.subject?.name || p.company_name}</div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{p.report_data?.subject?.designation || "Executive"}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────
export default function AiInsights() {
  const [searchParams] = useSearchParams();
  const initPersonaId = searchParams.get("personaId");
  const initTab = searchParams.get("tab");
  const initReport1 = searchParams.get("report1");
  const initReport2 = searchParams.get("report2");

  const [activeTab, setActiveTab] = useState(initTab || "Persona");
  const [personas, setPersonas] = useState<any[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(initPersonaId || "");
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");

  // Comparison state
  const [report1Id, setReport1Id] = useState<string>(initReport1 || "");
  const [report2Id, setReport2Id] = useState<string>(initReport2 || "");

  const [searchQuery, setSearchQuery] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [insightResult, setInsightResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dropdown states
  const [dropA, setDropA] = useState(false);
  const [dropB, setDropB] = useState(false);
  const [dropSingle, setDropSingle] = useState(false);
  const [dropCompany, setDropCompany] = useState(false);

  useEffect(() => {
    // Fetch Personas
    reportsAPI.getAll()
      .then((res) => {
        const arr = res.data?.data || res.data?.reports || [];
        setPersonas(arr);
        if (!initPersonaId && arr.length > 0 && !initReport1) setSelectedPersonaId(arr[0].id);
      })
      .catch((err) => console.error("Failed to load personas:", err));

    // Fetch Companies
    companyAPI.getMy()
      .then((res) => {
        const allCompanes = res.data?.data || res.data?.reports || [];
        // Filter to only show Deep Dive reports
        const deepDiveOnly = allCompanes.filter((c: any) => c.report_type === "DEEP_DIVE");
        setCompanies(deepDiveOnly);
        if (deepDiveOnly.length > 0) setSelectedCompanyId(deepDiveOnly[0].id);
      })
      .catch((err) => console.error("Failed to load companies:", err));

  }, [initPersonaId, initReport1]);


  const handleGenerate = async (themeId: string) => {
    setError(null);
    setInsightResult(null);

    const isCompare = activeTab === "Compare Persona";
    const isCompany = activeTab === "Company";

    if (isCompare && (!report1Id || !report2Id)) {
      setError("Please select both subjects for comparison."); return;
    }
    if (!isCompare && !isCompany && !selectedPersonaId) {
      setError("Please select a target persona first."); return;
    }
    if (isCompany && !selectedCompanyId) {
      setError("Please select a target company first."); return;
    }

    const reportId = isCompare ? report1Id : (isCompany ? selectedCompanyId : selectedPersonaId);
    const persona = isCompany ? companies.find(c => c.id === reportId) : personas.find((p) => p.id === reportId);
    const p2 = isCompare ? personas.find(p => p.id === report2Id) : null;
    
    setGenerating(themeId);

    try {
      // 1. Check Cache First
      let cacheRes;
      if (isCompany) {
        cacheRes = await insightsAPI.checkCompanyForensic({
          type: themeId,
          companyId: reportId
        });
      } else {
        cacheRes = await insightsAPI.checkSavedForensic({
          type: themeId,
          reportId: isCompare ? undefined : reportId,
          comparisonId: isCompare ? `${report1Id}_${report2Id}` : undefined
        });
      }

      if (cacheRes.data?.success && cacheRes.data?.data) {
        console.log("[Cache] Hit for", themeId);
        setInsightResult({
          theme: (isCompare ? COMPARE_INSIGHT_CARDS : (isCompany ? COMPANY_INSIGHT_CARDS : INSIGHT_CARDS)).find((c) => c.id === themeId)?.title,
          target: isCompare 
            ? `${persona?.report_data?.subject?.name || "Subject A"} vs ${p2?.report_data?.subject?.name || "Subject B"}`
            : (isCompany ? (persona?.company_name || "Company") : (persona?.report_data?.subject?.name || persona?.company_name || "Target")),
          content: cacheRes.data.data.forensic_data,
        });
        setGenerating(null);
        return;
      }

      // 2. Generate if Cache Miss
      console.log("[Cache] Miss. Generating via AI...");
      
      const payload = {
        report_id: reportId,
        theme_id: themeId,
        target_name: isCompare 
          ? `${persona?.report_data?.subject?.name || "Subject A"} vs ${p2?.report_data?.subject?.name || "Subject B"}`
          : (isCompany ? persona?.company_name : (persona?.report_data?.subject?.name || persona?.company_name || "Target")),
        company_name: isCompare ? "Comparative Analysis" : (isCompany ? persona?.company_name : (persona?.report_data?.subject?.company || "Company")),
        compare_report_id: isCompare ? report2Id : undefined,
      };

      const res = isCompany 
        ? await insightsAPI.generateCompanyForensic(payload)
        : await insightsAPI.generateForensic(payload);

      if (res.data.success) {
        const generatedData = res.data.data?.data || res.data.data;
        
        // 3. Save to Cache
        if (isCompany) {
          await insightsAPI.saveCompanyForensic({
            type: themeId,
            data: generatedData,
            companyId: reportId
          });
        } else {
          await insightsAPI.saveForensic({
            type: themeId,
            data: generatedData,
            reportId: isCompare ? undefined : reportId,
            comparisonId: isCompare ? `${report1Id}_${report2Id}` : undefined,
            compareReportId: isCompare ? report2Id : undefined
          });
        }



        setInsightResult({
          theme: (isCompare ? COMPARE_INSIGHT_CARDS : (isCompany ? COMPANY_INSIGHT_CARDS : INSIGHT_CARDS)).find((c) => c.id === themeId)?.title,
          target: payload.target_name,
          content: generatedData,
        });
      } else {
        setError(res.data.error || "Generation failed.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setGenerating(null);
    }
  };


  if (generating) {
    return (
      <div className="insights-page insight-loading">
        <div className="forensic-scanner-container">
          <div className="scanner-pulse-ring"></div>
          <div className="scanner-pulse-ring"></div>
          <div className="scanner-pulse-ring"></div>
          <div className="scanner-icon-hub">
            <Cpu size={32} strokeWidth={1.5} />
          </div>
        </div>
        <div className="scanner-text-premium">
          <h3>Krish is analyzing with Premium Intelligence</h3>
          <p>
            <span className="scanning-status-dot"></span>
            Synchronizing forensic data components...
          </p>
        </div>
      </div>
    );
  }

  // ── Result view ─────────────────────────────────────────────
  if (insightResult) {
    return (
      <div className="insights-page">
        <button className="back-to-insights" onClick={() => setInsightResult(null)}>
          <ArrowLeft size={12} /> Back to Insights
        </button>
        <div className="insight-result-view">
          <div className="insight-result-header">
            <div className="insight-result-theme">{insightResult.theme}</div>
            <h2 className="insight-result-target">{insightResult.target}</h2>
          </div>
          <div className="insight-content">
            {typeof insightResult.content === "object"
              ? <DynamicInsightsRenderer data={insightResult.content} />
              : <ReactMarkdown>{insightResult.content}</ReactMarkdown>}
          </div>
        </div>
      </div>
    );
  }

  // ── Main view ───────────────────────────────────────────────
  return (
    <div className="insights-page">

      {/* Tabs */}
      <div className="insights-top-nav">
        {TABS.map((t) => (
          <button key={t} className={`insight-main-tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="insights-error-banner">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Target Selection Area */}
      {activeTab === "Persona" && (
        <PersonaSelector
          label="Single Target"
          value={selectedPersonaId}
          onSelect={setSelectedPersonaId}
          personas={personas}
          dropdownOpen={dropSingle}
          setDropdownOpen={setDropSingle}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {activeTab === "Company" && (
        <PersonaSelector
          label="Target Company"
          value={selectedCompanyId}
          onSelect={setSelectedCompanyId}
          personas={companies}
          dropdownOpen={dropCompany}
          setDropdownOpen={setDropCompany}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {activeTab === "Compare Persona" && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
          <PersonaSelector
            label="Subject A"
            value={report1Id}
            onSelect={setReport1Id}
            personas={personas}
            dropdownOpen={dropA}
            setDropdownOpen={setDropA}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <div style={{ alignSelf: "center", fontStyle: "italic", fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700 }}>VS</div>
          <PersonaSelector
            label="Subject B"
            value={report2Id}
            onSelect={setReport2Id}
            personas={personas}
            dropdownOpen={dropB}
            setDropdownOpen={setDropB}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        </div>
      )}

      {/* Cards Grid */}
      {(activeTab === "Persona" || activeTab === "Compare Persona" || activeTab === "Company") ? (
        <div className="insights-grid">
          {(activeTab === "Persona" ? INSIGHT_CARDS : (activeTab === "Company" ? COMPANY_INSIGHT_CARDS : COMPARE_INSIGHT_CARDS)).map((card) => {
            const Icon = card.icon;
            const isThis = generating === card.id;
            return (
              <div key={card.id} className={`insight-card ${card.colorClass}`}>
                <div className="insight-card-header">
                  <div className="insight-icon-box">
                    <Icon size={15} strokeWidth={1.75} />
                  </div>
                  <h3 className="insight-card-title">{card.title}</h3>
                </div>
                <p className="insight-card-desc">{card.desc}</p>
                <button
                  className="insight-generate-btn"
                  onClick={() => handleGenerate(card.id)}
                  disabled={!!generating}
                >
                  {isThis
                    ? <><Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> Generating...</>
                    : <><Sparkles size={12} /> Generate Intelligence</>}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="insights-empty-state">
          <Building2 size={36} style={{ opacity: 0.15 }} />
          <h3>{activeTab} Intelligence</h3>
          <p>Coming soon. The {activeTab.toLowerCase()} forensic models are actively being built.</p>
        </div>
      )}
    </div>
  );
}