import React from "react";
import { Award } from "lucide-react";

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

const CareerSkillsTab: React.FC<TabProps> = ({ data, nameA, nameB }) => {
    const career = data?.career?.data || {};
    const skills = data?.skills?.data || {};

    const careerMetrics = career?.career_metrics || {};
    const velocityScore = career?.velocity_score || {};
    const domainDepth = career?.domain_depth_comparison || {};
    const credibilityAudit = career?.institutional_credibility_audit || {};
    const vennMapping = skills?.venn_mapping || {};
    const strategicSignal = skills?.strategic_signal || {};

    const metricA = careerMetrics?.person_a || {};
    const metricB = careerMetrics?.person_b || {};
    const firstNameA = nameA.split(" ")[0];
    const firstNameB = nameB.split(" ")[0];

    const metrics = [
        { label: "Total Years", a: metricA.total_years, b: metricB.total_years, suffix: " yrs" },
        { label: "Biggest Brand", a: metricA.biggest_brand, b: metricB.biggest_brand },
        { label: "Companies Built", a: metricA.companies_built, b: metricB.companies_built },
    ];

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", fontFamily: "'IBM Plex Sans', sans-serif" }}>

            {/* ── CAREER METRICS ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                {metrics.map((metric, i) => (
                    <SectionCard key={i}>
                        <SectionHeader label={metric.label} />
                        <div style={{ padding: "14px 16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ textAlign: "center", flex: 1 }}>
                                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2563eb", lineHeight: 1 }}>
                                        {metric.a}{metric.suffix}
                                    </div>
                                    <div style={{ ...T.label, marginTop: "4px", display: "block" }}>{firstNameA}</div>
                                </div>
                                <div style={{ width: "1px", height: "36px", background: "#e2e8f0" }} />
                                <div style={{ textAlign: "center", flex: 1 }}>
                                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#7c3aed", lineHeight: 1 }}>
                                        {metric.b}{metric.suffix}
                                    </div>
                                    <div style={{ ...T.label, marginTop: "4px", display: "block" }}>{firstNameB}</div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                ))}
            </div>

            {/* ── VELOCITY SCORE ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {[
                    { label: velocityScore.person_a_label, name: nameA, color: "#2563eb", borderColor: "#3b82f6", bg: "#eff6ff" },
                    { label: velocityScore.person_b_label, name: nameB, color: "#7c3aed", borderColor: "#8b5cf6", bg: "#f5f3ff" },
                ].map((v, i) => (
                    <div key={i} style={{
                        background: v.bg,
                        border: `1px solid ${v.borderColor}30`,
                        borderLeft: `3px solid ${v.color}`,
                        borderRadius: "10px",
                        padding: "16px 18px",
                    }}>
                        <div style={{ ...T.label, color: v.color, marginBottom: "6px", display: "block" }}>{v.name}</div>
                        <div style={{ ...T.heading, fontSize: "0.9rem" }}>{v.label}</div>
                    </div>
                ))}
            </div>

            {/* Velocity synthesis */}
            {velocityScore.synthesis && (
                <SectionCard>
                    <div style={{ padding: "14px 18px" }}>
                        <p style={{ ...T.body, margin: 0, fontStyle: "italic", color: "#475569" }}>
                            {velocityScore.synthesis}
                        </p>
                    </div>
                </SectionCard>
            )}

            {/* ── DOMAIN DEPTH COMPARISON ── */}
            <SectionCard>
                <SectionHeader label="Domain Depth Comparison" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    <div style={{ padding: "16px 20px", borderRight: "1px solid #f1f5f9" }}>
                        <div style={{ ...T.label, color: "#2563eb", marginBottom: "7px", display: "block" }}>{nameA} Focus</div>
                        <p style={{ ...T.body, fontSize: "0.875rem", margin: 0 }}>{domainDepth.person_a_focus}</p>
                    </div>
                    <div style={{ padding: "16px 20px" }}>
                        <div style={{ ...T.label, color: "#7c3aed", marginBottom: "7px", display: "block" }}>{nameB} Focus</div>
                        <p style={{ ...T.body, fontSize: "0.875rem", margin: 0 }}>{domainDepth.person_b_focus}</p>
                    </div>
                </div>
                {domainDepth.overlap_analysis && (
                    <div style={{ padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #f1f5f9" }}>
                        <span style={{ ...T.label, marginRight: "6px" }}>Overlap Analysis</span>
                        <span style={{ ...T.body, fontSize: "0.85rem" }}>{domainDepth.overlap_analysis}</span>
                    </div>
                )}
            </SectionCard>

            {/* ── SKILLS VENN ── */}
            <SectionCard>
                <SectionHeader label="Skills & Expertise Venn" />
                <div style={{ padding: "18px 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>

                    {/* Person A Only */}
                    <div>
                        <div style={{
                            fontSize: "0.75rem", fontWeight: 700, color: "#2563eb",
                            paddingBottom: "8px", marginBottom: "10px",
                            borderBottom: "2px solid #3b82f6",
                        }}>
                            {firstNameA} Only
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            {(vennMapping.person_a_only || []).map((skill: string, i: number) => (
                                <div key={i} style={{
                                    padding: "5px 10px", background: "#eff6ff",
                                    borderRadius: "5px", fontSize: "0.8rem", fontWeight: 600,
                                    color: "#1d4ed8", border: "1px solid #bfdbfe",
                                }}>
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shared */}
                    <div>
                        <div style={{
                            fontSize: "0.75rem", fontWeight: 700, color: "#0d9488",
                            paddingBottom: "8px", marginBottom: "10px",
                            borderBottom: "2px solid #0d9488",
                        }}>
                            Shared
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            {(vennMapping.shared || []).map((skill: string, i: number) => (
                                <div key={i} style={{
                                    padding: "5px 10px", background: "#f0fdfa",
                                    borderRadius: "5px", fontSize: "0.8rem", fontWeight: 600,
                                    color: "#0f766e", border: "1px solid #99f6e4",
                                }}>
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Person B Only */}
                    <div>
                        <div style={{
                            fontSize: "0.75rem", fontWeight: 700, color: "#7c3aed",
                            paddingBottom: "8px", marginBottom: "10px",
                            borderBottom: "2px solid #8b5cf6",
                        }}>
                            {firstNameB} Only
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            {(vennMapping.person_b_only || []).map((skill: string, i: number) => (
                                <div key={i} style={{
                                    padding: "5px 10px", background: "#f5f3ff",
                                    borderRadius: "5px", fontSize: "0.8rem", fontWeight: 600,
                                    color: "#6d28d9", border: "1px solid #ddd6fe",
                                }}>
                                    {skill}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SectionCard>

            {/* ── STRATEGIC SIGNAL ── */}
            <div style={{
                background: "#0d1117",
                borderRadius: "10px",
                padding: "22px 24px",
                position: "relative",
                overflow: "hidden",
            }}>
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: "1px",
                    background: strategicSignal.type === "complementary"
                        ? "linear-gradient(90deg, #059669, transparent)"
                        : "linear-gradient(90deg, #dc2626, transparent)",
                }} />

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                    <span style={{
                        padding: "3px 10px", borderRadius: "99px",
                        background: strategicSignal.type === "complementary" ? "#064e3b" : "#7f1d1d",
                        border: `1px solid ${strategicSignal.type === "complementary" ? "#059669" : "#dc2626"}`,
                        fontSize: "0.65rem", fontWeight: 700,
                        color: strategicSignal.type === "complementary" ? "#34d399" : "#fca5a5",
                        textTransform: "uppercase" as const, letterSpacing: "0.1em",
                    }}>
                        {strategicSignal.type}
                    </span>
                    <span style={{ ...T.label, color: "#475569" }}>Strategic Signal</span>
                </div>

                <p style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.75, margin: "0 0 14px" }}>
                    {strategicSignal.rationale}
                </p>

                {strategicSignal.dominance_mapping && (
                    <div style={{
                        padding: "12px 16px", background: "#111827",
                        borderRadius: "7px", border: "1px solid #1e293b",
                    }}>
                        <span style={{ ...T.label, color: "#475569", marginRight: "6px" }}>Dominance Mapping</span>
                        <span style={{ fontSize: "0.85rem", color: "#64748b" }}>{strategicSignal.dominance_mapping}</span>
                    </div>
                )}
            </div>

            {/* ── INSTITUTIONAL CREDIBILITY ── */}
            <SectionCard>
                <SectionHeader label="Institutional Credibility Audit" />
                <div style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <Award size={14} color="#d97706" />
                        <span style={{ ...T.body, fontSize: "0.875rem", color: "#374151", margin: 0 }}>
                            Stronger Party:
                        </span>
                        <span style={{
                            fontSize: "0.9rem", fontWeight: 700,
                            color: credibilityAudit.stronger_party === "person_a" ? "#2563eb" : "#7c3aed",
                        }}>
                            {credibilityAudit.stronger_party === "person_a" ? nameA : nameB}
                        </span>
                    </div>
                    <p style={{ ...T.body, fontSize: "0.875rem", margin: 0 }}>{credibilityAudit.rationale}</p>
                </div>
            </SectionCard>

        </div>
    );
};

export default CareerSkillsTab;