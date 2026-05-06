import { Briefcase, Brain, Trophy, Sparkles, Calendar, Building2, Award } from "lucide-react";

interface Props { profession: any; skills: any; achievements: any; }

export default function ProfessionTab({ profession, skills, achievements }: Props) {
  const narrative = profession?.skill_progression_narrative || skills?.skill_progression_narrative || "";
  const roleSummary = profession?.current_role_summary || "";
  const careerHighlight = achievements?.career_highlight || profession?.career_highlight || "";
  const timeline = profession?.career_timeline || [];
  const topSkills = skills?.top_technical_skills || [];
  const softSkills = skills?.soft_skills_signals || [];
  const domainEx = skills?.domain_expertise || [];
  const skillGaps = skills?.skill_gaps_or_blind_spots || [];
  const awards = achievements?.awards_and_recognition || [];
  const notable = achievements?.notable_achievements || [];
  const products = achievements?.products_launched || [];
  const companies = achievements?.companies_built_or_scaled || [];

  if (!profession && !skills && !achievements) {
    return <div style={styles.empty}>Profession data unavailable for this profile.</div>;
  }

  const depthColor: Record<string, string> = {
    expert: "#0ea5e9",
    advanced: "#38bdf8",
    intermediate: "#7dd3fc",
    beginner: "#bae6fd",
  };

  return (
    <div style={styles.root}>

      {/* Executive Summary */}
      {(roleSummary || narrative) && (
        <section style={styles.summaryCard}>
          <div style={styles.summaryAccent} />
          <div style={styles.summaryBody}>
            <header style={styles.sectionHeader}>
              <span style={styles.iconWrap}><Sparkles size={13} color="#0ea5e9" /></span>
              <span style={styles.sectionLabel}>Executive Summary</span>
            </header>
            {roleSummary && (
              <p style={styles.summaryTitle}>{roleSummary}</p>
            )}
            {narrative && (
              <p style={styles.summaryNarrative}>{narrative}</p>
            )}
          </div>
        </section>
      )}

      {/* Career Timeline */}
      {timeline.length > 0 && (
        <section style={styles.card}>
          <header style={styles.sectionHeader}>
            <span style={styles.iconWrap}><Briefcase size={13} color="#0ea5e9" /></span>
            <span style={styles.sectionLabel}>Career Timeline</span>
          </header>
          <div style={styles.timeline}>
            {timeline.map((item: any, i: number) => {
              const start = item.start_date || "Unknown";
              const end = item.end_date || "Present";
              const duration = item.duration_months
                ? `${Math.floor(item.duration_months / 12)}y ${item.duration_months % 12}m`
                : null;
              const isLast = i === timeline.length - 1;

              return (
                <div key={i} style={{ display: "flex", gap: "0" }}>
                  {/* Dot + line */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: "16px", width: "20px", flexShrink: 0 }}>
                    <div style={styles.timelineDot} />
                    {!isLast && <div style={styles.timelineLine} />}
                  </div>

                  {/* Content */}
                  <div style={{ ...styles.timelineItem, marginBottom: isLast ? "0" : "16px" }}>
                    <div style={styles.timelineTop}>
                      <div>
                        <div style={styles.timelineCompany}>
                          <Building2 size={12} color="#94a3b8" style={{ marginRight: "5px", flexShrink: 0 }} />
                          {item.company}
                        </div>
                        <div style={styles.timelineTitle}>{item.title}</div>
                      </div>
                      <div style={styles.timelineMeta}>
                        <Calendar size={11} color="#94a3b8" style={{ marginRight: "4px" }} />
                        <span>{start} – {end}</span>
                        {duration && <span style={styles.durationBadge}>{duration}</span>}
                      </div>
                    </div>
                    {item.one_line_impact && (
                      <p style={styles.timelineImpact}>{item.one_line_impact}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Skills + Domain Row */}
      <div style={styles.twoCol}>

        {/* Domain Expertise */}
        {domainEx.length > 0 && (
          <section style={styles.card}>
            <header style={styles.sectionHeader}>
              <span style={styles.iconWrap}><Brain size={13} color="#0ea5e9" /></span>
              <span style={styles.sectionLabel}>Domain Expertise</span>
            </header>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {domainEx.map((ex: any, i: number) => {
                const depth = ex.depth?.toLowerCase() || "intermediate";
                const color = depthColor[depth] || "#7dd3fc";
                return (
                  <div key={i} style={styles.expertiseRow}>
                    <div style={styles.expertiseBar(color)} />
                    <div style={{ flex: 1 }}>
                      <div style={styles.expertiseTop}>
                        <span style={styles.expertiseDomain}>{ex.domain}</span>
                        <span style={{ ...styles.depthBadge, color, borderColor: color + "33", background: color + "10" }}>
                          {ex.depth}
                        </span>
                      </div>
                      {ex.evidence && (
                        <p style={styles.expertiseEvidence}>{ex.evidence}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Key Proficiencies */}
        {(softSkills.length > 0 || topSkills.length > 0) && (
          <section style={styles.card}>
            <header style={styles.sectionHeader}>
              <span style={styles.iconWrap}><Brain size={13} color="#0ea5e9" /></span>
              <span style={styles.sectionLabel}>Key Proficiencies</span>
            </header>

            {topSkills.length > 0 && (
              <div style={{ marginBottom: "18px" }}>
                <p style={styles.groupLabel}>Technical Skills</p>
                <div style={styles.tagCloud}>
                  {topSkills.slice(0, 10).map((s: any, i: number) => (
                    <span key={i} style={styles.tag}>{s.skill || s}</span>
                  ))}
                </div>
              </div>
            )}

            {softSkills.length > 0 && (
              <div>
                <p style={styles.groupLabel}>Leadership & Strategy</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {softSkills.slice(0, 4).map((s: any, i: number) => (
                    <div key={i} style={styles.softRow}>
                      <span style={styles.softSkill}>{s.skill || s}</span>
                      {s.justification && (
                        <span style={styles.softJustification}>{s.justification}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Achievements */}
      {(notable.length > 0 || awards.length > 0) && (
        <section style={styles.card}>
          <header style={styles.sectionHeader}>
            <span style={styles.iconWrap}><Trophy size={13} color="#0ea5e9" /></span>
            <span style={styles.sectionLabel}>Key Achievements & Recognition</span>
          </header>

          <div style={styles.twoCol}>
            {notable.length > 0 && (
              <div>
                <p style={styles.groupLabel}>Major Contributions</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {notable.map((n: any, i: number) => (
                    <div key={i} style={styles.achievementItem}>
                      <div style={styles.achievementDot} />
                      <div>
                        <div style={styles.achievementTitle}>{n.achievement}</div>
                        {n.context && <div style={styles.achievementContext}>{n.context}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {awards.length > 0 && (
              <div>
                <p style={styles.groupLabel}>Industry Recognition</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {awards.map((a: any, i: number) => (
                    <div key={i} style={styles.awardItem}>
                      <Award size={12} color="#0ea5e9" style={{ flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <span style={styles.awardName}>{a.award}</span>
                        {a.issuing_body && (
                          <span style={styles.awardIssuer}> · {a.issuing_body}</span>
                        )}
                        {a.year && <div style={styles.awardYear}>{a.year}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Products Launched */}
      {products.length > 0 && (
        <section style={styles.card}>
          <header style={styles.sectionHeader}>
            <span style={styles.iconWrap}><Briefcase size={13} color="#8b5cf6" /></span>
            <span style={styles.sectionLabel}>Products Launched</span>
          </header>
          <div style={styles.twoCol}>
            {products.map((p: any, i: number) => (
              <div key={i} style={styles.achievementItem}>
                <div style={{ ...styles.achievementDot, background: "#8b5cf6" }} />
                <div>
                  <div style={styles.achievementTitle}>{p.product}</div>
                  {p.context && <div style={styles.achievementContext}>{p.context}</div>}
                  {p.impact && <div style={{ ...styles.achievementContext, color: "#0ea5e9", fontWeight: 600 }}>{p.impact}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Companies Built / Scaled */}
      {companies.length > 0 && (
        <section style={styles.card}>
          <header style={styles.sectionHeader}>
            <span style={styles.iconWrap}><Building2 size={13} color="#10b981" /></span>
            <span style={styles.sectionLabel}>Companies Built & Scaled</span>
          </header>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {companies.map((c: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f8fbff", border: "1px solid #e8f4fd", borderRadius: "9px" }}>
                <div>
                  <span style={styles.achievementTitle}>{c.company}</span>
                  <span style={{ ...styles.achievementContext, display: "inline", marginLeft: "6px" }}> · {c.role}</span>
                </div>
                {c.outcome && (
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: c.outcome === "Active" ? "#16a34a" : "#94a3b8", background: c.outcome === "Active" ? "#f0fdf4" : "#f8fafc", border: `1px solid ${c.outcome === "Active" ? "#bbf7d0" : "#e2e8f0"}`, padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" as const }}>{c.outcome}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skill Gaps */}
      {skillGaps.length > 0 && (
        <section style={styles.card}>
          <header style={styles.sectionHeader}>
            <span style={styles.iconWrap}><Brain size={13} color="#f59e0b" /></span>
            <span style={styles.sectionLabel}>Skill Gaps & Blind Spots</span>
          </header>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {skillGaps.map((g: string, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "9px", padding: "9px 12px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.78rem", color: "#92400e", lineHeight: 1.55 }}>⚠ {g}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles: Record<string, any> = {
  root: {
    fontFamily: "'DM Sans', 'Geist', -apple-system, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "4px 0",
    maxWidth: "100%",
  },
  empty: {
    textAlign: "center",
    padding: "48px 24px",
    color: "#94a3b8",
    fontSize: "0.875rem",
  },

  // Cards
  card: {
    background: "#ffffff",
    border: "1px solid #e8f0fe",
    borderRadius: "12px",
    padding: "20px 22px",
    boxShadow: "0 1px 3px rgba(14,165,233,0.04), 0 1px 2px rgba(0,0,0,0.03)",
  },
  summaryCard: {
    background: "#ffffff",
    border: "1px solid #e0f0ff",
    borderRadius: "12px",
    padding: "0",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(14,165,233,0.06)",
    display: "flex",
    flexDirection: "row",
  },
  summaryAccent: {
    width: "3px",
    background: "linear-gradient(180deg, #38bdf8 0%, #0ea5e9 100%)",
    flexShrink: 0,
  },
  summaryBody: {
    padding: "20px 22px",
    flex: 1,
  },

  // Section header
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    marginBottom: "16px",
  },
  iconWrap: {
    width: "24px",
    height: "24px",
    background: "#f0f9ff",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionLabel: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#64748b",
  },

  // Summary
  summaryTitle: {
    fontSize: "0.92rem",
    fontWeight: 600,
    color: "#0f172a",
    lineHeight: 1.6,
    margin: "0 0 8px 0",
  },
  summaryNarrative: {
    fontSize: "0.83rem",
    color: "#64748b",
    lineHeight: 1.7,
    margin: 0,
  },

  // Timeline
  timeline: {
    display: "flex",
    flexDirection: "column",
  },
  timelineDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#0ea5e9",
    border: "2px solid #e0f2fe",
    flexShrink: 0,
    marginTop: "5px",
  },
  timelineLine: {
    width: "1px",
    flex: 1,
    background: "linear-gradient(180deg, #bae6fd 0%, #e0f2fe 100%)",
    minHeight: "20px",
    marginTop: "4px",
  },
  timelineItem: {
    flex: 1,
    background: "#f8fbff",
    border: "1px solid #e8f4fd",
    borderRadius: "10px",
    padding: "12px 14px",
  },
  timelineTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap",
  },
  timelineCompany: {
    display: "flex",
    alignItems: "center",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "3px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  timelineTitle: {
    fontSize: "0.93rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  timelineMeta: {
    display: "flex",
    alignItems: "center",
    fontSize: "0.73rem",
    color: "#94a3b8",
    flexShrink: 0,
    gap: "0",
  },
  durationBadge: {
    marginLeft: "6px",
    background: "#f0f9ff",
    color: "#0ea5e9",
    fontSize: "0.7rem",
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: "4px",
    border: "1px solid #bae6fd",
  },
  timelineImpact: {
    margin: "8px 0 0 0",
    fontSize: "0.8rem",
    color: "#64748b",
    lineHeight: 1.55,
    borderTop: "1px solid #e8f4fd",
    paddingTop: "8px",
  },

  // Two-column layout
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "12px",
  },

  // Domain expertise
  expertiseRow: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    padding: "10px 12px",
    background: "#f8fbff",
    borderRadius: "8px",
    border: "1px solid #e8f4fd",
  },
  expertiseBar: (color: string) => ({
    width: "3px",
    minHeight: "36px",
    borderRadius: "2px",
    background: color,
    flexShrink: 0,
    alignSelf: "stretch",
  }),
  expertiseTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  expertiseDomain: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#0f172a",
  },
  depthBadge: {
    fontSize: "0.67rem",
    fontWeight: 700,
    padding: "2px 7px",
    borderRadius: "4px",
    border: "1px solid",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  expertiseEvidence: {
    margin: 0,
    fontSize: "0.77rem",
    color: "#64748b",
    lineHeight: 1.5,
  },

  // Tags
  groupLabel: {
    margin: "0 0 8px 0",
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "#94a3b8",
  },
  tagCloud: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  tag: {
    fontSize: "0.77rem",
    fontWeight: 500,
    color: "#0369a1",
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "5px",
    padding: "3px 9px",
    letterSpacing: "0.01em",
  },

  // Soft skills
  softRow: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    paddingLeft: "10px",
    borderLeft: "2px solid #bae6fd",
  },
  softSkill: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  softJustification: {
    fontSize: "0.77rem",
    color: "#64748b",
    lineHeight: 1.5,
  },

  // Achievements
  achievementItem: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    padding: "10px 12px",
    background: "#f8fbff",
    borderRadius: "8px",
    border: "1px solid #e8f4fd",
  },
  achievementDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#0ea5e9",
    flexShrink: 0,
    marginTop: "5px",
  },
  achievementTitle: {
    fontSize: "0.83rem",
    fontWeight: 600,
    color: "#0f172a",
    lineHeight: 1.45,
  },
  achievementContext: {
    fontSize: "0.77rem",
    color: "#64748b",
    marginTop: "3px",
    lineHeight: 1.5,
  },
  awardItem: {
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
    padding: "10px 12px",
    background: "#f8fbff",
    borderRadius: "8px",
    border: "1px solid #e8f4fd",
  },
  awardName: {
    fontSize: "0.83rem",
    fontWeight: 600,
    color: "#0f172a",
  },
  awardIssuer: {
    fontSize: "0.78rem",
    color: "#64748b",
  },
  awardYear: {
    fontSize: "0.72rem",
    fontWeight: 600,
    color: "#0ea5e9",
    marginTop: "3px",
  },
};