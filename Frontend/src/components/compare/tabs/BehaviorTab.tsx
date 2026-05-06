import React from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { Zap } from "lucide-react";

interface TabProps {
  data: any;
  nameA: string;
  nameB: string;
}

/* ── Shared type tokens (same as SnapshotTab) ── */
const T = {
  label: { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.08em" },
  heading: { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" },
  body: { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "0.875rem", fontWeight: 400, color: "#334155", lineHeight: 1.7 },
  muted: { fontFamily: "'IBM Plex Sans', sans-serif", fontSize: "0.825rem", fontWeight: 400, color: "#64748b", lineHeight: 1.6 },
};

const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden" }}>
    {children}
  </div>
);

const SectionHeader = ({ label }: { label: string }) => (
  <div style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
    <span style={T.label}>{label}</span>
  </div>
);

const BehaviorTab: React.FC<TabProps> = ({ data, nameA, nameB }) => {
  const behavior = data?.behavior?.data || {};
  const radarData = behavior?.trait_radar_comparison || [];
  const workingStyle = behavior?.working_style_contrast || {};
  const interaction = behavior?.interaction_intelligence || {};

  const chartData = radarData.map((item: any) => ({
    dimension: item.dimension,
    [nameA]: item.a_score,
    [nameB]: item.b_score,
  }));

  const firstNameA = nameA.split(" ")[0];
  const firstNameB = nameB.split(" ")[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontFamily: "'IBM Plex Sans', sans-serif" }}>

      {/* ── RADAR CHART ── */}
      <SectionCard>
        <SectionHeader label="Behavioral Trait Radar" />
        <div style={{ padding: "20px 24px" }}>

          {/* Legend */}
          <div style={{ display: "flex", gap: "20px", marginBottom: "16px" }}>
            {[{ name: nameA, color: "#2563eb" }, { name: nameB, color: "#7c3aed" }].map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: l.color, flexShrink: 0 }} />
                <span style={{ fontSize: "0.825rem", fontWeight: 600, color: "#374151" }}>{l.name}</span>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={chartData}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fontSize: 11, fontWeight: 600, fill: "#64748b", fontFamily: "'IBM Plex Sans', sans-serif" }}
              />
              <Radar name={nameA} dataKey={nameA} stroke="#2563eb" fill="#3b82f6" fillOpacity={0.12} strokeWidth={2} />
              <Radar name={nameB} dataKey={nameB} stroke="#7c3aed" fill="#8b5cf6" fillOpacity={0.12} strokeWidth={2} />
              <Tooltip
                contentStyle={{
                  background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "7px", fontSize: "0.8rem", color: "#e2e8f0",
                  fontFamily: "'IBM Plex Sans', sans-serif",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>

          {/* Score grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "16px" }}>
            {radarData.map((item: any, i: number) => (
              <div key={i} style={{
                background: "#f8fafc", borderRadius: "8px", padding: "12px 14px",
                border: "1px solid #e2e8f0",
              }}>
                {/* Dimension label */}
                <div style={{ ...T.label, marginBottom: "10px", display: "block" }}>{item.dimension}</div>

                {/* Score row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>{item.a_score}</div>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600, marginTop: "2px" }}>{firstNameA}</div>
                  </div>
                  <div style={{
                    fontSize: "0.7rem", fontWeight: 700,
                    color: item.higher === "person_a" ? "#2563eb" : "#7c3aed",
                    background: item.higher === "person_a" ? "#eff6ff" : "#f5f3ff",
                    padding: "2px 6px", borderRadius: "4px",
                  }}>
                    Δ{item.delta}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#7c3aed", lineHeight: 1 }}>{item.b_score}</div>
                    <div style={{ fontSize: "0.65rem", color: "#94a3b8", fontWeight: 600, marginTop: "2px" }}>{firstNameB}</div>
                  </div>
                </div>

                {/* Comparison bars */}
                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "3px" }}>
                  <div style={{ height: "3px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${item.a_score}%`, background: "#3b82f6", borderRadius: "99px" }} />
                  </div>
                  <div style={{ height: "3px", background: "#e2e8f0", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${item.b_score}%`, background: "#8b5cf6", borderRadius: "99px" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── WORKING STYLE CONTRAST ── */}
      <SectionCard>
        <SectionHeader label="Working Style Contrast" />
        <div>
          {Object.entries(workingStyle).map(([key, values]: any, i: number, arr) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "1fr 100px 1fr",
              borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
            }}>
              {/* Person A */}
              <div style={{ padding: "16px 20px", borderRight: "1px solid #f1f5f9" }}>
                <div style={{ ...T.label, color: "#2563eb", marginBottom: "5px", display: "block" }}>{firstNameA}</div>
                <p style={{ ...T.body, fontSize: "0.875rem", margin: 0 }}>{values.person_a}</p>
              </div>

              {/* Center label */}
              <div style={{
                padding: "16px 10px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#f8fafc", borderRight: "1px solid #f1f5f9",
              }}>
                <span style={{ ...T.label, textAlign: "center", lineHeight: 1.4 }}>
                  {key.replace(/_/g, " ")}
                </span>
              </div>

              {/* Person B */}
              <div style={{ padding: "16px 20px" }}>
                <div style={{ ...T.label, color: "#7c3aed", marginBottom: "5px", display: "block" }}>{firstNameB}</div>
                <p style={{ ...T.body, fontSize: "0.875rem", margin: 0 }}>{values.person_b}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── INTERACTION INTELLIGENCE ── */}
      <div style={{
        background: "#0d1117",
        borderRadius: "10px",
        padding: "22px 24px",
        borderLeft: "4px solid #f59e0b",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "1px",
          background: "linear-gradient(90deg, #f59e0b, transparent)",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "18px" }}>
          <Zap size={13} color="#fbbf24" />
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Interaction Intelligence
          </span>
        </div>

        {/* Core personality tension */}
        <div style={{ marginBottom: "18px" }}>
          <div style={{ ...T.label, color: "#475569", marginBottom: "8px", display: "block" }}>Core Personality Tension</div>
          <div style={{
            padding: "12px 16px",
            background: "#111827",
            borderRadius: "7px",
            border: "1px solid #1e293b",
            borderLeft: "3px solid #f59e0b",
          }}>
            <p style={{ fontSize: "0.9rem", color: "#fbbf24", fontWeight: 600, lineHeight: 1.65, margin: 0 }}>
              {interaction.core_personality_tension}
            </p>
          </div>
        </div>

        {/* Predicted interaction */}
        <div>
          <div style={{ ...T.label, color: "#475569", marginBottom: "8px", display: "block" }}>Predicted Interaction Summary</div>
          <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.75, margin: 0 }}>
            {interaction.predicted_interaction_summary}
          </p>
        </div>
      </div>

    </div>
  );
};

export default BehaviorTab;