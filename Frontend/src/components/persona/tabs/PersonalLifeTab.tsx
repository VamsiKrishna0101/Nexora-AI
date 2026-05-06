import { MapPin, GraduationCap, Users, BookOpen, Lightbulb, TrendingUp, Building2, Sparkles, Briefcase } from "lucide-react";

interface Props { profile: any; profession: any; network: any; social: any; }

// ── Shared primitives ─────────────────────────────────────────────────────────
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ ...s.card, ...style }}>{children}</div>
);

const SectionHead = ({ icon, label, color = "#0ea5e9" }: { icon: React.ReactNode; label: string; color?: string }) => (
  <div style={s.secHead}>
    <span style={{ ...s.secIconWrap, background: color + "12" }}>{icon}</span>
    <span style={s.secLabel}>{label}</span>
  </div>
);

const Tag = ({ text, color = "#0369a1", bg = "#f0f9ff", border = "#bae6fd" }: { text: string; color?: string; bg?: string; border?: string }) => (
  <span style={{ ...s.tag, color, background: bg, borderColor: border }}>{text}</span>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function PersonalLifeTab({ profile, profession, network, social }: Props) {
  const education = profession?.education_history || [];
  const location = profile?.location || null;
  const communities = network?.industry_communities || [];
  const topics = social?.key_topics_covered || [];
  const narrative = profession?.skill_progression_narrative || null;
  const highlight = profession?.career_highlight || null;
  const roleSummary = profession?.current_role_summary || null;
  const roleBullets = profession?.role_summary_bullets || [];
  const industryAreas = profession?.industry_expertise_areas || [];
  const totalYears = profession?.total_years_experience || null;
  const assocCompanies = network?.associated_companies || [];
  const scoreRationale = profile?.influence_score_rationale || null;
  const scoreBreakdown = profile?.influence_score_breakdown || {};
  const linkedinFollowers = profile?.linkedin_followers || null;
  const twitterFollowers = profile?.twitter_followers || null;
  const connections = profile?.connections_count || null;

  return (
    <div style={s.root}>

      {/* ── Story Card ──────────────────────────────────────── */}
      {(highlight || roleSummary) && (
        <div style={s.storyCard}>
          <div style={s.storyAccent} />
          <div style={s.storyBody}>
            <SectionHead icon={<Sparkles size={13} color="#0ea5e9" />} label="The Story" color="#0ea5e9" />
            {roleSummary && (
              <p style={s.storyTitle}>{roleSummary}</p>
            )}
            {highlight && (
              <p style={s.storyText}>{highlight}</p>
            )}
          </div>
        </div>
      )}

      {/* ── Quick Facts row ─────────────────────────────────── */}
      {(location || totalYears || communities.length > 0) && (
        <div style={s.factsRow}>
          {location && (
            <div style={s.factChip}>
              <span style={{ ...s.factIcon, background: "#f0f9ff" }}>
                <MapPin size={14} color="#0ea5e9" />
              </span>
              <div>
                <div style={s.factLabel}>Based In</div>
                <div style={s.factValue}>{location}</div>
              </div>
            </div>
          )}
          {totalYears && (
            <div style={s.factChip}>
              <span style={{ ...s.factIcon, background: "#f0fdf4" }}>
                <TrendingUp size={14} color="#22c55e" />
              </span>
              <div>
                <div style={s.factLabel}>Experience</div>
                <div style={s.factValue}>{totalYears} Years</div>
              </div>
            </div>
          )}
          {linkedinFollowers && (
            <div style={s.factChip}>
              <span style={{ ...s.factIcon, background: "#f0f9ff", fontSize: "0.7rem", fontWeight: 800, color: "#0077b5" }}>in</span>
              <div>
                <div style={s.factLabel}>LinkedIn</div>
                <div style={s.factValue}>{linkedinFollowers >= 1000000 ? `${(linkedinFollowers / 1000000).toFixed(1)}M` : linkedinFollowers >= 1000 ? `${(linkedinFollowers / 1000).toFixed(1)}K` : linkedinFollowers} followers</div>
              </div>
            </div>
          )}
          {twitterFollowers && (
            <div style={s.factChip}>
              <span style={{ ...s.factIcon, background: "#f8fafc", fontSize: "0.75rem", fontWeight: 800, color: "#000" }}>𝕏</span>
              <div>
                <div style={s.factLabel}>X / Twitter</div>
                <div style={s.factValue}>{twitterFollowers >= 1000000 ? `${(twitterFollowers / 1000000).toFixed(1)}M` : twitterFollowers >= 1000 ? `${(twitterFollowers / 1000).toFixed(1)}K` : twitterFollowers} followers</div>
              </div>
            </div>
          )}
          {communities.slice(0, 3).map((c: string, i: number) => (
            <div key={i} style={s.factChip}>
              <span style={{ ...s.factIcon, background: "#faf5ff" }}>
                <Users size={14} color="#8b5cf6" />
              </span>
              <div>
                <div style={s.factLabel}>Community</div>
                <div style={s.factValue}>{c}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Leadership Profile bullets ───────────────────────── */}
      {roleBullets.length > 0 && (
        <Card>
          <SectionHead icon={<Briefcase size={13} color="#6366f1" />} label="Leadership Profile" color="#6366f1" />
          <div style={s.bulletGrid}>
            {roleBullets.map((b: string, i: number) => {
              const [label, desc] = b.includes(":")
                ? [b.split(":")[0], b.split(":").slice(1).join(":")]
                : [null, b];
              return (
                <div key={i} style={s.bulletCard}>
                  {label && <div style={s.bulletLabel}>{label.trim()}</div>}
                  <div style={s.bulletDesc}>{desc.trim()}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Education ───────────────────────────────────────── */}
      {education.length > 0 && (
        <Card>
          <SectionHead icon={<GraduationCap size={13} color="#0ea5e9" />} label="Academic Background" color="#0ea5e9" />
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {education.map((e: any, i: number) => (
              <div key={i} style={{
                ...s.eduRow,
                borderBottom: i < education.length - 1 ? "1px solid #f1f5f9" : "none",
                paddingBottom: i < education.length - 1 ? "14px" : "0",
                marginBottom: i < education.length - 1 ? "14px" : "0",
              }}>
                <div style={s.eduBadge}>
                  {e.degree?.replace(/\./g, "")?.slice(0, 3) || "EDU"}
                </div>
                <div>
                  <div style={s.eduDegree}>
                    {e.degree}
                    {e.field_of_study && e.field_of_study !== "N/A"
                      ? <span style={s.eduField}> · {e.field_of_study}</span>
                      : null}
                  </div>
                  <div style={s.eduInstitution}>{e.institution}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Narrative + Domains ─────────────────────────────── */}
      <div style={s.twoCol}>
        {narrative && (
          <Card style={{ margin: 0 }}>
            <SectionHead icon={<Lightbulb size={13} color="#f59e0b" />} label="Career Narrative" color="#f59e0b" />
            <p style={s.narrativeText}>{narrative}</p>
          </Card>
        )}
        {industryAreas.length > 0 && (
          <Card style={{ margin: 0 }}>
            <SectionHead icon={<BookOpen size={13} color="#10b981" />} label="Professional Domains" color="#10b981" />
            <div style={s.tagCloud}>
              {industryAreas.map((a: string, i: number) => (
                <Tag key={i} text={a} color="#065f46" bg="#f0fdf4" border="#bbf7d0" />
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ── Intellectual Interests ──────────────────────────── */}
      {topics.length > 0 && (
        <Card>
          <SectionHead icon={<BookOpen size={13} color="#8b5cf6" />} label="Intellectual Interests" color="#8b5cf6" />
          <p style={s.subNote}>Derived from public speaking, posts, and content history</p>
          <div style={s.tagCloud}>
            {topics.map((t: string, i: number) => (
              <Tag key={i} text={t} color="#5b21b6" bg="#f5f3ff" border="#ddd6fe" />
            ))}
          </div>
        </Card>
      )}

      {/* ── Associated Companies ────────────────────────────── */}
      {assocCompanies.length > 0 && (
        <Card>
          <SectionHead icon={<Building2 size={13} color="#0ea5e9" />} label="Associated Organizations" color="#0ea5e9" />
          <div>
            {assocCompanies.map((c: any, i: number) => (
              <div key={i} style={{
                ...s.orgRow,
                borderBottom: i < assocCompanies.length - 1 ? "1px solid #f1f5f9" : "none",
              }}>
                <div style={s.orgLeft}>
                  <div style={s.orgIcon}><Building2 size={13} color="#0ea5e9" /></div>
                  <div>
                    <span style={s.orgName}>{c.company}</span>
                    <span style={s.orgRole}> · {c.role}</span>
                  </div>
                </div>
                <span style={s.orgTypeBadge}>{c.type}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Influence Score ─────────────────────────────────── */}
      {(scoreRationale || Object.keys(scoreBreakdown).length > 0) && (
        <Card>
          <SectionHead icon={<TrendingUp size={13} color="#6366f1" />} label="Influence Score Breakdown" color="#6366f1" />
          {Object.keys(scoreBreakdown).length > 0 && (
            <div style={s.scoreGrid}>
              {Object.entries(scoreBreakdown).map(([k, v]) => (
                <div key={k} style={s.scoreChip}>
                  <div style={s.scoreValue}>{v as number}</div>
                  <div style={s.scoreKey}>{k.replace(/_points$/, "").replace(/_/g, " ")}</div>
                </div>
              ))}
            </div>
          )}
          {scoreRationale && (
            <p style={{ ...s.narrativeText, marginTop: Object.keys(scoreBreakdown).length > 0 ? "14px" : "0", marginBottom: 0 }}>
              {scoreRationale}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s: Record<string, any> = {
  root: {
    fontFamily: "'DM Sans', 'Geist', -apple-system, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  // Card
  card: {
    background: "#ffffff",
    border: "1px solid #e8f0fe",
    borderRadius: "14px",
    padding: "20px 22px",
    boxShadow: "0 1px 3px rgba(14,165,233,0.04), 0 1px 2px rgba(0,0,0,0.03)",
  },

  // Section header
  secHead: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "14px",
  },
  secIconWrap: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  secLabel: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#64748b",
  },

  // Story card
  storyCard: {
    background: "#ffffff",
    border: "1px solid #e0f0ff",
    borderRadius: "14px",
    display: "flex",
    flexDirection: "row",
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(14,165,233,0.06)",
  },
  storyAccent: {
    width: "3px",
    background: "linear-gradient(180deg, #38bdf8 0%, #6366f1 100%)",
    flexShrink: 0,
  },
  storyBody: { padding: "20px 22px", flex: 1 },
  storyTitle: {
    margin: "0 0 8px",
    fontSize: "0.92rem",
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.6,
  },
  storyText: {
    margin: 0,
    fontSize: "0.83rem",
    color: "#64748b",
    lineHeight: 1.7,
  },

  // Quick facts
  factsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  factChip: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#ffffff",
    border: "1px solid #e8f0fe",
    borderRadius: "10px",
    padding: "10px 14px",
    flex: "1 1 160px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },
  factIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  factLabel: {
    fontSize: "0.6rem",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    marginBottom: "2px",
  },
  factValue: {
    fontSize: "0.83rem",
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1.3,
  },

  // Leadership bullets
  bulletGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "10px",
  },
  bulletCard: {
    background: "#f8fbff",
    border: "1px solid #e8f4fd",
    borderRadius: "10px",
    padding: "12px 14px",
  },
  bulletLabel: {
    fontSize: "0.65rem",
    fontWeight: 700,
    color: "#6366f1",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "4px",
  },
  bulletDesc: {
    fontSize: "0.82rem",
    color: "#334155",
    lineHeight: 1.5,
  },

  // Education
  eduRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  eduBadge: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    color: "#0ea5e9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: "0.7rem",
    letterSpacing: "0.02em",
    flexShrink: 0,
  },
  eduDegree: {
    fontWeight: 700,
    color: "#0f172a",
    fontSize: "0.88rem",
    lineHeight: 1.3,
  },
  eduField: {
    fontWeight: 500,
    color: "#64748b",
  },
  eduInstitution: {
    fontSize: "0.78rem",
    color: "#94a3b8",
    marginTop: "3px",
  },

  // Two col
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "12px",
  },

  // Tags
  tagCloud: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
  },
  tag: {
    fontSize: "0.77rem",
    fontWeight: 500,
    padding: "3px 10px",
    borderRadius: "5px",
    border: "1px solid",
    letterSpacing: "0.01em",
  },

  // Narrative
  narrativeText: {
    margin: 0,
    fontSize: "0.83rem",
    color: "#64748b",
    lineHeight: 1.7,
  },
  subNote: {
    margin: "-6px 0 10px",
    fontSize: "0.74rem",
    color: "#94a3b8",
  },

  // Orgs
  orgRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "11px 0",
  },
  orgLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  orgIcon: {
    width: "30px",
    height: "30px",
    borderRadius: "7px",
    background: "#f0f9ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  orgName: {
    fontWeight: 700,
    color: "#0f172a",
    fontSize: "0.85rem",
  },
  orgRole: {
    color: "#94a3b8",
    fontSize: "0.78rem",
  },
  orgTypeBadge: {
    fontSize: "0.62rem",
    fontWeight: 700,
    background: "#f0f9ff",
    color: "#0369a1",
    border: "1px solid #bae6fd",
    padding: "2px 8px",
    borderRadius: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    flexShrink: 0,
  },

  // Influence score
  scoreGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  scoreChip: {
    background: "#f8fbff",
    border: "1px solid #e8f4fd",
    borderRadius: "10px",
    padding: "10px 16px",
    textAlign: "center",
    minWidth: "80px",
  },
  scoreValue: {
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#6366f1",
    letterSpacing: "-0.02em",
    lineHeight: 1,
  },
  scoreKey: {
    fontSize: "0.62rem",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginTop: "4px",
    lineHeight: 1.3,
  },
};