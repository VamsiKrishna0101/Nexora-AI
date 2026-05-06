import React from "react";
import { Target, Info, Zap, TrendingUp, AlertTriangle } from "lucide-react";

interface TabProps {
  data: any;
  nameA: string;
  nameB: string;
}

/* ── Shared type tokens ── */
const T = {
  label: { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.08em" },
  heading: { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" },
  subhead: { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "0.875rem", fontWeight: 600, color: "#1e293b" },
  body: { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "0.9rem", fontWeight: 400, color: "#334155", lineHeight: 1.7 },
  muted: { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "0.825rem", fontWeight: 400, color: "#64748b", lineHeight: 1.6 },
};

const SectionCard = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    overflow: "hidden",
    ...style,
  }}>
    {children}
  </div>
);

const SectionHeader = ({ label }: { label: string }) => (
  <div style={{
    padding: "12px 20px",
    borderBottom: "1px solid #f1f5f9",
    background: "#f8fafc",
  }}>
    <span style={T.label}>{label}</span>
  </div>
);

const SnapshotTab: React.FC<TabProps> = ({ data, nameA, nameB }) => {
  const snapshot = data?.snapshot?.data || {};
  const cards = snapshot?.cards || {};
  const personA = cards?.person_a || {};
  const personB = cards?.person_b || {};
  const verdict = data?.verdict?.data || {};
  const whoFirst = verdict?.who_to_approach_first || {};
  const dealIntel = verdict?.deal_intelligence || {};
  const compatibility = verdict?.compatibility_score || 0;

  const primaryTarget = whoFirst?.primary_target === "person_a" ? nameA : nameB;

  const persons = [
    { person: personA, name: nameA, color: "#2563eb", barColor: "#3b82f6", bg: "#eff6ff", tagBg: "#dbeafe", tagColor: "#1d4ed8" },
    { person: personB, name: nameB, color: "#7c3aed", barColor: "#8b5cf6", bg: "#f5f3ff", tagBg: "#ede9fe", tagColor: "#6d28d9" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {/* ── DUAL PROFILE CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {persons.map((p, i) => (
          <div key={i} style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderTop: `3px solid ${p.color}`,
            borderRadius: "10px",
            padding: "20px",
          }}>
            {/* Avatar + name row */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%",
                background: p.bg, border: `2px solid ${p.color}22`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "18px", fontWeight: "800", color: p.color, flexShrink: 0,
                overflow: "hidden",
              }}>
                {p.person.photo_url
                  ? <img src={p.person.photo_url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : p.name?.[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                {p.person.archetype && (
                  <div style={{ ...T.label, color: p.color, marginBottom: "3px" }}>{p.person.archetype}</div>
                )}
                <div style={{ ...T.heading, fontSize: "1rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                <div style={{ ...T.muted, fontSize: "0.78rem", marginTop: "1px" }}>{p.person.title}{p.person.company ? ` · ${p.person.company}` : ""}</div>
              </div>
            </div>

            {/* Confidence bar */}
            {p.person.confidence_indicator != null && (
              <div style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <span style={T.label}>Data Confidence</span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: p.color }}>{p.person.confidence_indicator}%</span>
                </div>
                <div style={{ height: "3px", background: "#f1f5f9", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${p.person.confidence_indicator}%`, background: p.barColor, borderRadius: "99px" }} />
                </div>
              </div>
            )}

            {/* Trait tags */}
            {(p.person.trait_tags || []).length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {(p.person.trait_tags || []).map((tag: string, j: number) => (
                  <span key={j} style={{
                    padding: "3px 8px",
                    background: p.tagBg,
                    color: p.tagColor,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    borderRadius: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    border: `1px solid ${p.color}20`,
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── COMPATIBILITY SCORE ── */}
      <div style={{
        background: "#0d1117",
        borderRadius: "10px",
        padding: "32px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "32px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 15% 50%, rgba(59,130,246,0.08) 0%, transparent 55%), radial-gradient(ellipse at 85% 50%, rgba(139,92,246,0.08) 0%, transparent 55%)",
          pointerEvents: "none",
        }} />

        {/* Person A */}
        <div style={{ textAlign: "center", zIndex: 1, minWidth: "120px" }}>
          <div style={{ fontSize: "0.65rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px", fontWeight: 600 }}>Subject A</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#60a5fa", lineHeight: 1.2 }}>{nameA}</div>
          {personA.archetype && <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: "4px" }}>{personA.archetype}</div>}
        </div>

        {/* Score center */}
        <div style={{ textAlign: "center", zIndex: 1, flex: 1 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "#475569", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "10px" }}>
            Compatibility Index
          </div>
          <div style={{
            fontSize: "5rem", fontWeight: 800, lineHeight: 1,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            letterSpacing: "-0.04em",
          }}>
            {compatibility}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#475569", fontWeight: 600, marginTop: "2px" }}>/ 100</div>
          <div style={{ width: "160px", height: "3px", background: "#1e293b", borderRadius: "99px", margin: "12px auto 0", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${compatibility}%`,
              background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              borderRadius: "99px",
            }} />
          </div>
          <div style={{ fontSize: "0.65rem", color: "#475569", marginTop: "8px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            {compatibility >= 70 ? "High Synergy" : compatibility >= 50 ? "Moderate Alignment" : "Low Compatibility"}
          </div>
        </div>

        {/* Person B */}
        <div style={{ textAlign: "center", zIndex: 1, minWidth: "120px" }}>
          <div style={{ fontSize: "0.65rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "6px", fontWeight: 600 }}>Subject B</div>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "#a78bfa", lineHeight: 1.2 }}>{nameB}</div>
          {personB.archetype && <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: "4px" }}>{personB.archetype}</div>}
        </div>
      </div>

      {/* ── SHARED COMMONALITY + FUNDAMENTAL DIFFERENCE ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {/* Shared */}
        <div style={{ background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: "10px", padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}>
            <Info size={13} color="#0d9488" />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0d9488" }}>Shared Commonality</span>
          </div>
          <p style={{ ...T.body, color: "#134e4a", fontSize: "0.875rem", margin: 0, fontStyle: "italic" }}>"{snapshot.shared_commonality}"</p>
        </div>
        {/* Difference */}
        <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px", padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "10px" }}>
            <Zap size={13} color="#ea580c" />
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ea580c" }}>Fundamental Difference</span>
          </div>
          <p style={{ ...T.body, color: "#431407", fontSize: "0.875rem", margin: 0 }}>{snapshot.fundamental_difference}</p>
        </div>
      </div>

      {/* ── DEAL INTELLIGENCE ── */}
      <SectionCard>
        <SectionHeader label="Deal Intelligence" />
        <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          {/* Champion + Operator */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <div style={{ ...T.label, marginBottom: "5px" }}>The Champion</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#2563eb" }}>{dealIntel.the_champion}</div>
            </div>
            <div style={{ height: "1px", background: "#f1f5f9" }} />
            <div>
              <div style={{ ...T.label, marginBottom: "5px" }}>The Operator</div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: "#7c3aed" }}>{dealIntel.the_operator}</div>
            </div>
          </div>
          {/* Combined intelligence */}
          <div>
            <div style={{ ...T.label, marginBottom: "8px" }}>Combined Intelligence</div>
            <p style={{ ...T.body, margin: 0, fontSize: "0.875rem" }}>{dealIntel.combined_intelligence_summary}</p>
          </div>
        </div>
      </SectionCard>

      {/* ── WHO TO APPROACH FIRST ── */}
      <div style={{
        background: "#fffbeb",
        border: "1px solid #fde68a",
        borderLeft: "4px solid #f59e0b",
        borderRadius: "10px",
        padding: "20px 22px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
          <Target size={14} color="#d97706" />
          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#d97706" }}>Primary Target — Approach First</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            background: "#fef3c7", border: "2px solid #f59e0b",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem", fontWeight: 800, color: "#d97706", flexShrink: 0,
          }}>
            {primaryTarget?.[0]}
          </div>
          <div>
            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#92400e" }}>{primaryTarget}</div>
            <div style={{ fontSize: "0.775rem", color: "#b45309", marginTop: "1px" }}>Recommended First Contact</div>
          </div>
        </div>
        <p style={{ ...T.body, color: "#78350f", fontSize: "0.875rem", margin: 0 }}>{whoFirst?.rationale}</p>
        {whoFirst?.recommended_use_case && (
          <div style={{ marginTop: "10px", padding: "10px 14px", background: "#fef9c3", borderRadius: "7px", border: "1px solid #fde68a" }}>
            <span style={{ ...T.label, color: "#a16207" }}>Use Case: </span>
            <span style={{ fontSize: "0.875rem", color: "#713f12" }}>{whoFirst.recommended_use_case}</span>
          </div>
        )}
      </div>

      {/* ── STRATEGIC BOTTOM LINE ── */}
      <div style={{
        background: "#0d1117",
        borderRadius: "10px",
        padding: "24px 26px",
        borderLeft: "4px solid #6366f1",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg, #6366f1, transparent)",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
          <TrendingUp size={13} color="#818cf8" />
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Strategic Bottom Line
          </span>
        </div>
        <p style={{ ...T.body, color: "#cbd5e1", fontSize: "0.9rem", margin: 0 }}>{verdict.strategic_bottom_line}</p>
        {verdict.compatibility_rationale && (
          <>
            <div style={{ height: "1px", background: "#1e293b", margin: "14px 0" }} />
            <p style={{ ...T.muted, fontSize: "0.825rem", margin: 0, fontStyle: "italic", color: "#64748b" }}>{verdict.compatibility_rationale}</p>
          </>
        )}
      </div>

    </div>
  );
};

export default SnapshotTab;