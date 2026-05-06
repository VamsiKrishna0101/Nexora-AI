import React from "react";
import { GitBranch, Target, Zap, MessageSquare, Users } from "lucide-react";

interface TabProps {
    data: any;
    nameA: string;
    nameB: string;
}

/* ── Shared type tokens ── */
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

const InfluenceEngagementTab: React.FC<TabProps> = ({ data, nameA, nameB }) => {
    const influence = data?.influence?.data || {};
    const engagement = data?.engagement?.data || {};

    const reachDynamics = influence?.reach_dynamics || {};
    const platformMetrics = influence?.platform_metrics || [];
    const networkQuality = influence?.network_quality_audit || {};
    const tacticalPlaybook = engagement?.tactical_playbook || {};
    const differentiator = engagement?.the_differentiator || {};

    const firstNameA = nameA.split(" ")[0];
    const firstNameB = nameB.split(" ")[0];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontFamily: "'IBM Plex Sans', sans-serif" }}>

            {/* ── PLATFORM METRICS ── */}
            <SectionCard>
                <SectionHeader label="Platform Metrics" />
                {/* Table header */}
                <div style={{
                    display: "grid", gridTemplateColumns: "120px 1fr 1fr 90px",
                    padding: "8px 20px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
                }}>
                    {["Platform", nameA, nameB, "Advantage"].map((h, i) => (
                        <div key={i} style={{ ...T.label }}>{h}</div>
                    ))}
                </div>
                {/* Rows */}
                {platformMetrics.map((metric: any, i: number) => (
                    <div key={i} style={{
                        display: "grid", gridTemplateColumns: "120px 1fr 1fr 90px",
                        padding: "14px 20px",
                        borderBottom: i < platformMetrics.length - 1 ? "1px solid #f1f5f9" : "none",
                        alignItems: "start",
                    }}>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>{metric.platform}</div>
                        <div style={{ ...T.body, fontSize: "0.825rem", paddingRight: "16px" }}>{metric.person_a}</div>
                        <div style={{ ...T.body, fontSize: "0.825rem", paddingRight: "16px" }}>{metric.person_b}</div>
                        <div>
                            <span style={{
                                padding: "3px 9px", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 700,
                                background: metric.advantage === "person_a" ? "#eff6ff" : "#f5f3ff",
                                color: metric.advantage === "person_a" ? "#1d4ed8" : "#6d28d9",
                                border: `1px solid ${metric.advantage === "person_a" ? "#bfdbfe" : "#ddd6fe"}`,
                            }}>
                                {metric.advantage === "person_a" ? firstNameA : firstNameB}
                            </span>
                        </div>
                    </div>
                ))}
            </SectionCard>

            {/* ── NETWORK QUALITY ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                {[
                    { label: nameA, tier: networkQuality.person_a_tier, color: "#2563eb", borderColor: "#3b82f6", bg: "#eff6ff" },
                    { label: nameB, tier: networkQuality.person_b_tier, color: "#7c3aed", borderColor: "#8b5cf6", bg: "#f5f3ff" },
                ].map((n, i) => (
                    <div key={i} style={{
                        background: n.bg,
                        border: `1px solid ${n.borderColor}25`,
                        borderLeft: `3px solid ${n.color}`,
                        borderRadius: "10px",
                        padding: "16px 18px",
                    }}>
                        <div style={{ ...T.label, color: n.color, marginBottom: "6px", display: "block" }}>{n.label}</div>
                        <div style={{ ...T.heading, fontSize: "0.95rem" }}>{n.tier}</div>
                    </div>
                ))}
                <div style={{
                    background: "#f0fdfa",
                    border: "1px solid #99f6e425",
                    borderLeft: "3px solid #0d9488",
                    borderRadius: "10px",
                    padding: "16px 18px",
                }}>
                    <div style={{ ...T.label, color: "#0d9488", marginBottom: "6px", display: "block" }}>Amplification Leader</div>
                    <div style={{ ...T.heading, fontSize: "0.95rem" }}>
                        {reachDynamics.amplification_leader === "person_a" ? nameA : nameB}
                    </div>
                </div>
            </div>

            {/* Network comparative advantage */}
            {networkQuality.comparative_advantage && (
                <SectionCard>
                    <div style={{ padding: "14px 18px" }}>
                        <p style={{ ...T.body, margin: 0 }}>{networkQuality.comparative_advantage}</p>
                    </div>
                </SectionCard>
            )}

            {/* ── REACH DYNAMICS ── */}
            <div style={{
                background: "#0d1117",
                borderRadius: "10px",
                padding: "22px 24px",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                    background: "linear-gradient(90deg, #6366f1, transparent)",
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "14px" }}>
                    <GitBranch size={13} color="#818cf8" />
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Reach Dynamics
                    </span>
                </div>
                <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.75, margin: "0 0 14px" }}>
                    {reachDynamics.synthesis}
                </p>
                {reachDynamics.combined_multiplier_estimate && (
                    <div style={{ padding: "11px 16px", background: "#111827", borderRadius: "7px", border: "1px solid #1e293b" }}>
                        <span style={{ ...T.label, color: "#475569", marginRight: "8px" }}>Combined Multiplier</span>
                        <span style={{ fontSize: "0.875rem", color: "#818cf8", fontWeight: 600 }}>
                            {reachDynamics.combined_multiplier_estimate}
                        </span>
                    </div>
                )}
            </div>

            {/* ── TACTICAL PLAYBOOK ── */}
            <SectionCard>
                <SectionHeader label="Tactical Engagement Playbook" />
                <div>
                    {[
                        { key: "best_channel", label: "Best Channel", Icon: MessageSquare },
                        { key: "meeting_vibe", label: "Meeting Vibe", Icon: Users },
                        { key: "opening_hook", label: "Opening Hook", Icon: Zap },
                        { key: "trust_builders", label: "Trust Builders", Icon: Target },
                    ].map(({ key, label, Icon }, i, arr) => {
                        const values = tacticalPlaybook[key] || {};
                        return (
                            <div key={i} style={{
                                display: "grid", gridTemplateColumns: "148px 1fr 1fr",
                                borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                            }}>
                                {/* Row label */}
                                <div style={{
                                    padding: "16px 18px",
                                    background: "#f8fafc",
                                    borderRight: "1px solid #f1f5f9",
                                    display: "flex", alignItems: "flex-start", gap: "7px",
                                }}>
                                    <Icon size={12} color="#94a3b8" style={{ marginTop: "1px", flexShrink: 0 }} />
                                    <span style={{ ...T.label }}>{label}</span>
                                </div>

                                {/* Person A */}
                                <div style={{ padding: "16px 18px", borderRight: "1px solid #f1f5f9" }}>
                                    <div style={{ ...T.label, color: "#2563eb", marginBottom: "5px", display: "block" }}>{firstNameA}</div>
                                    <p style={{ ...T.body, fontSize: "0.85rem", margin: 0 }}>{values.person_a}</p>
                                </div>

                                {/* Person B */}
                                <div style={{ padding: "16px 18px" }}>
                                    <div style={{ ...T.label, color: "#7c3aed", marginBottom: "5px", display: "block" }}>{firstNameB}</div>
                                    <p style={{ ...T.body, fontSize: "0.85rem", margin: 0 }}>{values.person_b}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </SectionCard>

            {/* ── THE DIFFERENTIATOR ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                    { label: "Five Minute Rule", content: differentiator.five_minute_rule, color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
                    { label: "Pitch Framing Contrast", content: differentiator.pitch_framing_contrast, color: "#4f46e5", bg: "#eef2ff", border: "#c7d2fe" },
                ].map((d, i) => (
                    <div key={i} style={{
                        background: d.bg,
                        border: `1px solid ${d.border}`,
                        borderLeft: `3px solid ${d.color}`,
                        borderRadius: "10px",
                        padding: "16px 18px",
                    }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: d.color, marginBottom: "10px" }}>
                            {d.label}
                        </div>
                        <p style={{ ...T.body, fontSize: "0.875rem", color: "#374151", margin: 0 }}>{d.content}</p>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default InfluenceEngagementTab;