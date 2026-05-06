import React from "react";
import { AlertTriangle, Shield, Target, CheckCircle } from "lucide-react";

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

const SectionHeader = ({ label, icon }: { label: string; icon?: React.ReactNode }) => (
    <div style={{ padding: "12px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", alignItems: "center", gap: "7px" }}>
        {icon}
        <span style={T.label}>{label}</span>
    </div>
);

const getRiskColor = (level: string) => {
    const l = (level || "").toLowerCase();
    if (l.includes("high")) return { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
    if (l.includes("medium") || l.includes("moderate")) return { bg: "#fffbeb", color: "#d97706", border: "#fde68a" };
    if (l.includes("low")) return { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" };
    return { bg: "#f8fafc", color: "#64748b", border: "#e2e8f0" };
};

const RiskVerdictTab: React.FC<TabProps> = ({ data, nameA, nameB }) => {
    const risk = data?.risk?.data || {};
    const verdict = data?.verdict?.data || {};

    const riskDashboard = risk?.risk_dashboard || [];
    const redFlagContrast = risk?.red_flag_contrast || {};
    const viabilityVerdict = risk?.viability_verdict || {};
    const dealIntel = verdict?.deal_intelligence || {};
    const whoFirst = verdict?.who_to_approach_first || {};
    const compatibility = verdict?.compatibility_score || 0;

    const saferBet = viabilityVerdict.the_safer_bet === "person_a" ? nameA : nameB;
    const primaryTarget = whoFirst.primary_target === "person_a" ? nameA : nameB;
    const firstNameA = nameA.split(" ")[0];
    const firstNameB = nameB.split(" ")[0];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontFamily: "'IBM Plex Sans', sans-serif" }}>

            {/* ── RISK DASHBOARD ── */}
            <SectionCard>
                <SectionHeader label="Risk Dashboard" icon={<Shield size={12} color="#94a3b8" />} />
                {/* Table header */}
                <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                    padding: "8px 20px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9",
                }}>
                    {["Metric", nameA, nameB].map((h, i) => (
                        <div key={i} style={T.label}>{h}</div>
                    ))}
                </div>
                {/* Rows */}
                {riskDashboard.map((row: any, i: number) => {
                    const colorA = getRiskColor(row.person_a);
                    const colorB = getRiskColor(row.person_b);
                    return (
                        <div key={i} style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                            padding: "13px 20px",
                            borderBottom: i < riskDashboard.length - 1 ? "1px solid #f1f5f9" : "none",
                            alignItems: "center",
                        }}>
                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>{row.metric}</div>
                            <div>
                                <span style={{
                                    padding: "3px 10px", borderRadius: "99px",
                                    fontSize: "0.75rem", fontWeight: 700,
                                    background: colorA.bg, color: colorA.color, border: `1px solid ${colorA.border}`,
                                }}>
                                    {row.person_a}
                                </span>
                            </div>
                            <div>
                                <span style={{
                                    padding: "3px 10px", borderRadius: "99px",
                                    fontSize: "0.75rem", fontWeight: 700,
                                    background: colorB.bg, color: colorB.color, border: `1px solid ${colorB.border}`,
                                }}>
                                    {row.person_b}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </SectionCard>

            {/* ── RED FLAGS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                    { flags: redFlagContrast.person_a_flags, name: nameA, color: "#2563eb", bg: "#eff6ff" },
                    { flags: redFlagContrast.person_b_flags, name: nameB, color: "#7c3aed", bg: "#f5f3ff" },
                ].map((p, i) => (
                    <SectionCard key={i}>
                        <div style={{
                            padding: "12px 16px",
                            background: p.bg,
                            borderBottom: `1px solid ${p.color}20`,
                            display: "flex", alignItems: "center", gap: "7px",
                        }}>
                            <AlertTriangle size={12} color={p.color} />
                            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: p.color }}>{p.name} — Red Flags</span>
                        </div>
                        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "9px" }}>
                            {(p.flags || []).map((flag: string, j: number) => (
                                <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
                                    <div style={{
                                        width: "5px", height: "5px", borderRadius: "50%",
                                        background: "#ef4444", flexShrink: 0, marginTop: "7px",
                                    }} />
                                    <span style={{ ...T.body, fontSize: "0.85rem" }}>{flag}</span>
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                ))}
            </div>

            {/* ── VIABILITY VERDICT ── */}
            <div style={{
                background: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderLeft: "3px solid #16a34a",
                borderRadius: "10px",
                padding: "18px 20px",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "12px" }}>
                    <CheckCircle size={13} color="#16a34a" />
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#15803d" }}>Viability Verdict</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <span style={{ ...T.body, fontSize: "0.85rem", color: "#166534", margin: 0 }}>The Safer Bet:</span>
                    <span style={{
                        padding: "3px 12px", background: "#dcfce7", borderRadius: "99px",
                        fontSize: "0.875rem", fontWeight: 700, color: "#15803d",
                        border: "1px solid #86efac",
                    }}>
                        {saferBet}
                    </span>
                </div>
                <p style={{ ...T.body, fontSize: "0.875rem", color: "#166534", margin: 0 }}>
                    {viabilityVerdict.comparative_risk_summary}
                </p>
            </div>

            {/* ── FINAL ANALYST VERDICT ── */}
            <div style={{ background: "#0d1117", borderRadius: "10px", overflow: "hidden", position: "relative" }}>
                {/* Gold top line */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, #6366f1, #8b5cf6, transparent)" }} />

                {/* Header */}
                <div style={{ padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "#060810", display: "flex", alignItems: "center", gap: "7px" }}>
                    <Target size={12} color="#818cf8" />
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#818cf8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Final Analyst Verdict
                    </span>
                </div>

                <div style={{ padding: "22px" }}>

                    {/* Compatibility score + bars */}
                    <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "22px" }}>
                        <div style={{ textAlign: "center", flexShrink: 0 }}>
                            <div style={{ ...T.label, color: "#475569", marginBottom: "6px", display: "block" }}>Compatibility</div>
                            <div style={{
                                fontSize: "3.2rem", fontWeight: 800, lineHeight: 1,
                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                                letterSpacing: "-0.04em",
                            }}>
                                {compatibility}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: 600 }}>/100</div>
                        </div>

                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                            {[
                                { label: "Technical Synergy", pct: 82, color: "#3b82f6", status: "High", statusColor: "#34d399" },
                                { label: "Operational Velocity", pct: compatibility, color: "#f59e0b", status: "Moderate", statusColor: "#fbbf24" },
                            ].map((bar, i) => (
                                <div key={i}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                                        <span style={{ fontSize: "0.775rem", fontWeight: 600, color: "#94a3b8" }}>{bar.label}</span>
                                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: bar.statusColor }}>{bar.status}</span>
                                    </div>
                                    <div style={{ height: "3px", background: "#1e293b", borderRadius: "99px", overflow: "hidden" }}>
                                        <div style={{ height: "100%", width: `${bar.pct}%`, background: bar.color, borderRadius: "99px" }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Deal roles */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                        {[
                            { role: "The Champion", person: dealIntel.the_champion, color: "#3b82f6", desc: "Disrupts status quo, pushes boundaries" },
                            { role: "The Operator", person: dealIntel.the_operator, color: "#8b5cf6", desc: "Scales and integrates at global level" },
                        ].map((d, i) => (
                            <div key={i} style={{
                                padding: "14px 16px", background: "#111827",
                                borderRadius: "8px", borderLeft: `3px solid ${d.color}`,
                            }}>
                                <div style={{ ...T.label, color: d.color, marginBottom: "5px", display: "block" }}>{d.role}</div>
                                <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e8edf5", marginBottom: "3px" }}>{d.person}</div>
                                <div style={{ fontSize: "0.775rem", color: "#64748b", lineHeight: 1.5 }}>{d.desc}</div>
                            </div>
                        ))}
                    </div>

                    {/* Approach first */}
                    <div style={{
                        padding: "14px 16px", background: "#111827",
                        borderRadius: "8px", border: "1px solid rgba(245,158,11,0.2)",
                        borderLeft: "3px solid #f59e0b", marginBottom: "18px",
                    }}>
                        <div style={{ ...T.label, color: "#fbbf24", marginBottom: "5px", display: "block" }}>Approach First</div>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e8edf5", marginBottom: "5px" }}>{primaryTarget}</div>
                        <p style={{ fontSize: "0.825rem", color: "#94a3b8", lineHeight: 1.65, margin: 0 }}>{whoFirst.rationale}</p>
                    </div>

                    {/* Strategic conclusion */}
                    <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ ...T.label, color: "#475569", marginBottom: "8px", display: "block" }}>Strategic Conclusion</div>
                        <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.75, margin: 0 }}>
                            {verdict.strategic_bottom_line}
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default RiskVerdictTab;