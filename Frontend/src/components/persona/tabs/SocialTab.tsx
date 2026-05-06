import { Mic, Users, TrendingUp, Radio, MessageCircle, Heart, Repeat2, BarChart2 } from "lucide-react";

interface Props { online: any; social: any; postIntel?: any; }

const fmtNum = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
    n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);

// ── Primitives ────────────────────────────────────────────────────────────────
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ ...s.card, ...style }}>{children}</div>
);

const SectionHead = ({ icon, label, color = "#0ea5e9" }: { icon: React.ReactNode; label: string; color?: string }) => (
  <div style={s.secHead}>
    <span style={{ ...s.secIconWrap, background: color + "12" }}>{icon}</span>
    <span style={s.secLabel}>{label}</span>
  </div>
);

const StatPill = ({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) => (
  <div style={s.statPill}>
    <span style={s.statIcon}>{icon}</span>
    <div>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  </div>
);

const Tag = ({ text, color = "#0369a1", bg = "#f0f9ff", border = "#bae6fd" }: {
  text: string; color?: string; bg?: string; border?: string;
}) => (
  <span style={{ ...s.tag, color, background: bg, borderColor: border }}>{text}</span>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SocialTab({ online, social, postIntel }: Props) {
  const linkedin = online?.linkedin || {};
  const twitter = online?.twitter || {};
  const talks = social?.conference_talks || [];
  const podcasts = social?.podcast_appearances || [];
  const interviews = social?.interviews || [];
  const topics = social?.key_topics_covered || [];
  const tier = social?.thought_leadership_tier || online?.overall_digital_footprint || "";
  const assess = social?.thought_leadership_assessment || "";
  const otherPlatforms = online?.other_platforms || [];
  const contentVolume = social?.content_volume || "";

  // Post Intelligence Extracts
  const piContent = postIntel?.content_analysis || {};
  const piBreakdown = postIntel?.post_breakdown || [];
  const piSummaries = postIntel?.summaries || {};

  const tierColor = (t: string) => {
    const lower = t.toLowerCase();
    if (lower.includes("top") || lower.includes("elite")) return { color: "#b45309", bg: "#fffbeb", border: "#fde68a" };
    if (lower.includes("high") || lower.includes("rising")) return { color: "#065f46", bg: "#f0fdf4", border: "#bbf7d0" };
    return { color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" };
  };
  const tc = tierColor(tier);

  return (
    <div style={s.root}>

      {/* ── Platform Cards ──────────────────────────────────── */}
      <div style={s.twoCol}>

        {/* LinkedIn */}
        {linkedin.followers && (
          <Card>
            <div style={s.platformHead}>
              <div style={{ ...s.platformBadge, background: "#0077b5" }}>in</div>
              <span style={s.platformName}>LinkedIn</span>
              {linkedin.posting_frequency && (
                <span style={s.freqBadge}>{linkedin.posting_frequency}</span>
              )}
            </div>
            <div style={s.statsRow}>
              <StatPill
                value={fmtNum(linkedin.followers)}
                label="Followers"
                icon={<Users size={12} color="#0077b5" />}
              />
              <StatPill
                value={fmtNum(linkedin.avg_likes_per_post || 0)}
                label="Avg Likes"
                icon={<Heart size={12} color="#0077b5" />}
              />
              <StatPill
                value={String(linkedin.avg_comments_per_post || 0)}
                label="Avg Comments"
                icon={<MessageCircle size={12} color="#0077b5" />}
              />
            </div>
            {linkedin.last_post_date && (
              <div style={{ marginTop: "10px", fontSize: "0.72rem", color: "#94a3b8" }}>
                Last post: <span style={{ fontWeight: 600, color: "#64748b" }}>{new Date(linkedin.last_post_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                {linkedin.last_post_summary && <span> · {linkedin.last_post_summary}</span>}
              </div>
            )}
            {linkedin.top_topics?.length > 0 && (
              <div style={{ ...s.tagCloud, marginTop: "10px" }}>
                {linkedin.top_topics.map((t: string) => (
                  <Tag key={t} text={t} color="#0369a1" bg="#f0f9ff" border="#bae6fd" />
                ))}
              </div>
            )}
          </Card>
        )}

        {/* X / Twitter */}
        {twitter.followers && (
          <Card>
            <div style={s.platformHead}>
              <div style={{ ...s.platformBadge, background: "#000000" }}>𝕏</div>
              <span style={s.platformName}>X (Twitter)</span>
              {twitter.posting_frequency && (
                <span style={s.freqBadge}>{twitter.posting_frequency}</span>
              )}
            </div>
            <div style={s.statsRow}>
              <StatPill
                value={fmtNum(twitter.followers)}
                label="Followers"
                icon={<Users size={12} color="#334155" />}
              />
              <StatPill
                value={fmtNum(twitter.avg_likes_per_tweet || 0)}
                label="Avg Likes"
                icon={<Heart size={12} color="#334155" />}
              />
              <StatPill
                value={String(twitter.avg_retweets_per_tweet || 0)}
                label="Avg RTs"
                icon={<Repeat2 size={12} color="#334155" />}
              />
            </div>
            {twitter.last_tweet_date && (
              <div style={{ marginTop: "10px", fontSize: "0.72rem", color: "#94a3b8" }}>
                Last tweet: <span style={{ fontWeight: 600, color: "#64748b" }}>{new Date(twitter.last_tweet_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            )}
            {twitter.top_topics?.length > 0 && (
              <div style={{ ...s.tagCloud, marginTop: "10px" }}>
                {twitter.top_topics.map((t: string) => (
                  <Tag key={t} text={t} color="#334155" bg="#f8fafc" border="#e2e8f0" />
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Other Platforms + Content Volume */}
      {(otherPlatforms.length > 0 || contentVolume) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          {contentVolume && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#f8fbff", border: "1px solid #e8f4fd", borderRadius: "8px", padding: "7px 12px" }}>
              <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Content Volume</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#0f172a" }}>{contentVolume}</span>
            </div>
          )}
          {otherPlatforms.map((p: string, i: number) => (
            <div key={i} style={{ background: "#f8fbff", border: "1px solid #e8f4fd", borderRadius: "8px", padding: "7px 12px", fontSize: "0.8rem", fontWeight: 600, color: "#64748b" }}>
              {p}
            </div>
          ))}
        </div>
      )}

      {/* ── Recent Activity ─────────────────────────────────── */}
      {online?.recent_activity_summary && (
        <div style={s.storyCard}>
          <div style={s.storyAccent} />
          <div style={s.storyBody}>
            <SectionHead icon={<BarChart2 size={13} color="#0ea5e9" />} label="Recent Activity" color="#0ea5e9" />
            <p style={s.storyText}>{online.recent_activity_summary}</p>
          </div>
        </div>
      )}

      {/* ── Thought Leadership ──────────────────────────────── */}
      {tier && (
        <Card>
          <SectionHead icon={<TrendingUp size={13} color="#6366f1" />} label="Thought Leadership" color="#6366f1" />
          <div style={{ marginBottom: assess || topics.length ? "14px" : "0" }}>
            <span style={{ ...s.tierBadge, color: tc.color, background: tc.bg, borderColor: tc.border }}>
              {tier}
            </span>
          </div>
          {assess && <p style={s.assessText}>{assess}</p>}
          {topics.length > 0 && (
            <div style={{ ...s.tagCloud, marginTop: assess ? "14px" : "0" }}>
              {topics.map((t: string) => (
                <Tag key={t} text={t} color="#5b21b6" bg="#f5f3ff" border="#ddd6fe" />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── Talks + Podcasts ────────────────────────────────── */}
      <div style={s.twoCol}>

        {talks.length > 0 && (
          <Card>
            <SectionHead icon={<Users size={13} color="#10b981" />} label="Conference Talks" color="#10b981" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {talks.map((t: any, i: number) => (
                <div key={i} style={{
                  ...s.eventRow,
                  borderBottom: i < talks.length - 1 ? "1px solid #f1f5f9" : "none",
                  paddingBottom: i < talks.length - 1 ? "12px" : "0",
                  marginBottom: i < talks.length - 1 ? "12px" : "0",
                }}>
                  <div style={s.eventIconWrap}>
                    <Users size={13} color="#10b981" />
                  </div>
                  <div>
                    <div style={s.eventTitle}>{t.talk_title}</div>
                    <div style={s.eventMeta}>
                      <span>{t.event}</span>
                      {t.date && <><span style={s.metaDot}>·</span><span>{t.date}</span></>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {podcasts.length > 0 && (
          <Card>
            <SectionHead icon={<Mic size={13} color="#f59e0b" />} label="Podcast Appearances" color="#f59e0b" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              {podcasts.map((p: any, i: number) => (
                <div key={i} style={{
                  ...s.eventRow,
                  borderBottom: i < podcasts.length - 1 ? "1px solid #f1f5f9" : "none",
                  paddingBottom: i < podcasts.length - 1 ? "12px" : "0",
                  marginBottom: i < podcasts.length - 1 ? "12px" : "0",
                }}>
                  <div style={{ ...s.eventIconWrap, background: "#fffbeb" }}>
                    <Radio size={13} color="#f59e0b" />
                  </div>
                  <div>
                    <div style={s.eventTitle}>{p.episode_title}</div>
                    <div style={s.eventMeta}>
                      <span>{p.show_name}</span>
                      {p.date && <><span style={s.metaDot}>·</span><span>{p.date}</span></>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Interviews */}
      {interviews.length > 0 && (
        <Card>
          <SectionHead icon={<Radio size={13} color="#8b5cf6" />} label="Interviews" color="#8b5cf6" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            {interviews.map((iv: any, i: number) => (
              <div key={i} style={{
                ...s.eventRow,
                borderBottom: i < interviews.length - 1 ? "1px solid #f1f5f9" : "none",
                paddingBottom: i < interviews.length - 1 ? "12px" : "0",
                marginBottom: i < interviews.length - 1 ? "12px" : "0",
              }}>
                <div style={{ ...s.eventIconWrap, background: "#f5f3ff" }}>
                  <Radio size={13} color="#8b5cf6" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={s.eventTitle}>{iv.title}</div>
                  <div style={s.eventMeta}>
                    <span>{iv.outlet}</span>
                    {iv.date && <><span style={s.metaDot}>·</span><span>{iv.date}</span></>}
                    {iv.url && <a href={iv.url} target="_blank" rel="noreferrer" style={{ color: "#0ea5e9", fontSize: "0.72rem", marginLeft: "4px", textDecoration: "none" }}>↗</a>}
                  </div>
                </div>
                {/* ── Social Post Intelligence ──────────────────────────────── */}
      {(piContent.top_topics?.length > 0 || piBreakdown.length > 0) && (
        <>
          <div className="insight-section-title" style={{ marginTop: "16px", marginBottom: "8px" }}>Content Strategy Analysis</div>
          
          <div style={s.twoCol}>
            {/* Content Style Card */}
            <Card>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Posting Pattern</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", lineHeight: 1.5 }}>{piContent.posting_pattern || "N/A"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Content Style</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", lineHeight: 1.5 }}>{piContent.content_style || "N/A"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Engagement Insight</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#0f172a", lineHeight: 1.5 }}>{piContent.engagement_insight || "N/A"}</div>
                </div>
              </div>
            </Card>

            {/* Top Topics Card */}
            <Card style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px" }}>Primary Topics / Themes</div>
              <div style={s.tagCloud}>
                {(piContent.top_topics || []).map((t: string) => (
                  <Tag key={t} text={t} color="#0ea5e9" bg="#f0f9ff" border="#bae6fd" />
                ))}
                {(!piContent.top_topics || piContent.top_topics.length === 0) && (
                  <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>No specific topics identified.</span>
                )}
              </div>
              
              {(piSummaries.posts?.length > 0 || piSummaries.reposts?.length > 0) && (
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px dashed #e2e8f0" }}>
                   {piSummaries.posts?.length > 0 && (
                     <div style={{ marginBottom: "12px" }}>
                       <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", marginBottom: "6px" }}>ORIGINAL POST SUMMARIES</div>
                       <ul style={{ margin: 0, paddingLeft: "16px", color: "#475569", fontSize: "0.8rem", lineHeight: 1.6 }}>
                         {piSummaries.posts.map((p: string, i: number) => <li key={i}>{p}</li>)}
                       </ul>
                     </div>
                   )}
                   {piSummaries.reposts?.length > 0 && (
                     <div>
                       <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#475569", marginBottom: "6px" }}>REPOST/AMPLIFICATION SUMMARIES</div>
                       <ul style={{ margin: 0, paddingLeft: "16px", color: "#475569", fontSize: "0.8rem", lineHeight: 1.6 }}>
                         {piSummaries.reposts.map((p: string, i: number) => <li key={i}>{p}</li>)}
                       </ul>
                     </div>
                   )}
                </div>
              )}
            </Card>
          </div>

          {/* Social Post Feed Audit Table */}
          {piBreakdown.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              <div className="insight-section-title">Post Analysis Audit</div>
              <div style={{ overflowX: "auto", background: "#fff", border: "1px solid #e8ecf2", borderRadius: "10px", marginTop: "12px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px", fontSize: "0.85rem" }}>
                  <thead>
                    <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#475569", width: "15%" }}>Platform & Type</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#475569", width: "40%" }}>Brief Description</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#475569", width: "22.5%" }}>Content Theme</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, color: "#475569", width: "22.5%" }}>Engagement Style</th>
                    </tr>
                  </thead>
                  <tbody>
                    {piBreakdown.map((row: any, i: number) => (
                      <tr key={i} style={{ borderBottom: i < piBreakdown.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                        <td style={{ padding: "12px 16px", verticalAlign: "top" }}>
                          <div style={{ fontWeight: 600, color: "#0f172a", marginBottom: "4px" }}>{row.platform || "Platform"}</div>
                          <span style={{
                            display: "inline-block", 
                            padding: "2px 6px", 
                            borderRadius: "4px", 
                            fontSize: "0.68rem", 
                            fontWeight: 700,
                            background: row.type?.toLowerCase() === "repost" ? "#fbf0f4" : "#f0f9ff",
                            color: row.type?.toLowerCase() === "repost" ? "#be185d" : "#0369a1",
                            border: `1px solid ${row.type?.toLowerCase() === "repost" ? "#fbcfe8" : "#bae6fd"}`
                          }}>
                            {row.type || "Post"}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", verticalAlign: "top", color: "#334155", lineHeight: 1.5 }}>
                          {row.brief_description || "N/A"}
                        </td>
                        <td style={{ padding: "12px 16px", verticalAlign: "top", color: "#475569" }}>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>{row.theme || "General"}</span>
                        </td>
                        <td style={{ padding: "12px 16px", verticalAlign: "top", color: "#475569" }}>
                          <span style={{ fontWeight: 600, color: "#0f172a" }}>{row.engagement_style || "Standard"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

    </div>
            ))}
          </div>
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
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "12px",
  },
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

  // Platform header
  platformHead: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  platformBadge: {
    width: "28px",
    height: "28px",
    borderRadius: "7px",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.75rem",
    fontWeight: 800,
    flexShrink: 0,
  },
  platformName: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#0f172a",
    flex: 1,
  },
  freqBadge: {
    fontSize: "0.68rem",
    fontWeight: 700,
    color: "#64748b",
    background: "#f1f5f9",
    border: "1px solid #e2e8f0",
    borderRadius: "5px",
    padding: "2px 8px",
    letterSpacing: "0.03em",
  },

  // Stats
  statsRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  statPill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f8fbff",
    border: "1px solid #e8f4fd",
    borderRadius: "9px",
    padding: "8px 12px",
    flex: "1 1 80px",
  },
  statIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    background: "#fff",
    flexShrink: 0,
  },
  statValue: {
    fontSize: "0.95rem",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.01em",
    lineHeight: 1.1,
  },
  statLabel: {
    fontSize: "0.63rem",
    color: "#94a3b8",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginTop: "1px",
  },

  // Story / activity card
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
  storyText: {
    margin: 0,
    fontSize: "0.83rem",
    color: "#64748b",
    lineHeight: 1.7,
  },

  // Tier badge
  tierBadge: {
    display: "inline-block",
    fontSize: "0.75rem",
    fontWeight: 700,
    padding: "4px 12px",
    borderRadius: "6px",
    border: "1px solid",
    letterSpacing: "0.03em",
  },
  assessText: {
    margin: 0,
    fontSize: "0.83rem",
    color: "#64748b",
    lineHeight: 1.7,
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

  // Event rows (talks/podcasts)
  eventRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
  },
  eventIconWrap: {
    width: "30px",
    height: "30px",
    borderRadius: "8px",
    background: "#f0fdf4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "1px",
  },
  eventTitle: {
    fontWeight: 600,
    fontSize: "0.85rem",
    color: "#0f172a",
    lineHeight: 1.4,
    marginBottom: "3px",
  },
  eventMeta: {
    fontSize: "0.76rem",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexWrap: "wrap",
  },
  metaDot: {
    color: "#cbd5e1",
  },
};