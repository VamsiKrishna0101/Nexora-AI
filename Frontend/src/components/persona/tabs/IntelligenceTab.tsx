import React, { useState } from "react";
import { ShieldAlert, Target, Zap, Globe, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Mail } from "lucide-react";

interface Props { verdict: any; engage: any; redFlags: any; network: any; }

const RISK_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  Low: { color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  Medium: { color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  High: { color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
};

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

const Tag = ({ text, color = "#0369a1", bg = "#f0f9ff", border = "#bae6fd" }: {
  text: string; color?: string; bg?: string; border?: string;
}) => (
  <span style={{ ...s.tag, color, background: bg, borderColor: border }}>{text}</span>
);

const BulletList = ({ items, color }: { items: string[]; color: string }) => (
  <ul style={s.bulletList}>
    {items?.map((item: string, i: number) => (
      <li key={i} style={s.bulletItem}>
        <span style={{ ...s.dot, background: color }} />
        <span style={s.bulletText}>{item}</span>
      </li>
    ))}
  </ul>
);

const GroupLabel = ({ text }: { text: string }) => (
  <p style={s.groupLabel}>{text}</p>
);

function ExpandableBlock({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ ...s.expandable, ...(open ? s.expandableOpen : {}) }}>
      <button style={s.expandTrigger} onClick={() => setOpen(!open)}>
        <span style={s.expandTriggerLeft}>
          <span style={s.expandIcon}>{icon}</span>
          <span style={s.expandTitle}>{title}</span>
        </span>
        {open ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
      </button>
      {open && <div style={s.expandContent}>{children}</div>}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function IntelligenceTab({ verdict, engage, redFlags, network }: Props) {
  const breakdown = verdict?.profile_strength_breakdown || {};
  const strengthScore = verdict?.profile_strength_score || 0;
  const strengthRationale = verdict?.profile_strength_rationale || "";
  const useCaseRationale = verdict?.use_case_rationale || "";
  const confidenceLevel = verdict?.confidence_level || "";
  const intelligenceGaps = verdict?.intelligence_gaps || [];
  const riskKey = redFlags?.overall_risk_rating as string;
  const riskStyle = RISK_COLORS[riskKey] || { color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0" };
  const repSignals = redFlags?.reputation_signals || [];
  const legalIssues = redFlags?.legal_or_regulatory_issues || [];
  const controversials = redFlags?.controversial_statements || [];
  const failedVentures = redFlags?.failed_ventures || [];
  const jobHopping = redFlags?.job_hopping_signal || null;
  const scripts = engage?.outreach_scripts || {};
  const starters = engage?.conversation_starters || [];
  const collab = network?.notable_collaborations || [];
  const mentions = network?.media_mentions || [];

  // Score bar color
  const barColor = strengthScore >= 70 ? "#22c55e" : strengthScore >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div style={s.root}>

      {/* ── Analyst Verdict ─────────────────────────────────── */}
      <Card>
        <SectionHead icon={<Target size={13} color="#6366f1" />} label="AI Analyst Verdict" color="#6366f1" />

        {/* Use case badges */}
        {verdict?.recommended_use_cases?.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
            {verdict.recommended_use_cases.map((uc: string) => (
              <span key={uc} style={s.useCaseBadge}>{uc}</span>
            ))}
          </div>
        )}

        {/* One-line verdict */}
        {verdict?.one_line_verdict && (
          <div style={s.verdictQuote}>
            <div style={s.verdictQuoteMark}>"</div>
            <p style={s.verdictQuoteText}>{verdict.one_line_verdict}</p>
          </div>
        )}

        {/* Profile strength bar */}
        <div style={s.strengthWrap}>
          <div style={s.strengthTop}>
            <span style={s.strengthLabel}>Profile Strength</span>
            <span style={{ ...s.strengthScore, color: barColor }}>{strengthScore}<span style={s.strengthOf}>/100</span></span>
          </div>
          <div style={s.barBg}>
            <div style={{ ...s.barFill, width: `${strengthScore}%`, background: barColor }} />
          </div>
          {Object.keys(breakdown).length > 0 && (
            <div style={s.breakdownRow}>
              {Object.entries(breakdown).map(([k, v]) => (
                <div key={k} style={s.breakdownChip}>
                  <span style={{ ...s.breakdownVal, color: barColor }}>{v as number}</span>
                  <span style={s.breakdownKey}>{k.replace(/_points$/, "").replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          )}
          {strengthRationale && (
            <p style={{ ...s.narrativeText, marginTop: "10px", fontSize: "0.78rem", fontStyle: "italic" }}>{strengthRationale}</p>
          )}
        </div>

        {/* Confidence + Use Case rationale */}
        {(confidenceLevel || useCaseRationale) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            {confidenceLevel && (
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "8px 14px" }}>
                <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "2px" }}>Confidence Level</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#16a34a" }}>{confidenceLevel}</span>
              </div>
            )}
            {useCaseRationale && (
              <div style={{ flex: 1, background: "#f8fbff", border: "1px solid #e8f4fd", borderRadius: "8px", padding: "8px 14px" }}>
                <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "2px" }}>Use Case Rationale</span>
                <span style={{ fontSize: "0.8rem", color: "#475569", lineHeight: 1.5 }}>{useCaseRationale}</span>
              </div>
            )}
          </div>
        )}

        {/* Strengths + Concerns */}
        <div style={s.twoCol}>
          {verdict?.key_strengths?.length > 0 && (
            <div>
              <GroupLabel text="Key Strengths" />
              <BulletList items={verdict.key_strengths} color="#22c55e" />
            </div>
          )}
          {verdict?.key_concerns?.length > 0 && (
            <div>
              <GroupLabel text="Key Concerns" />
              <BulletList items={verdict.key_concerns} color="#ef4444" />
            </div>
          )}
        </div>

        {/* Intelligence Gaps */}
        {intelligenceGaps.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            <GroupLabel text="Intelligence Gaps" />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
              {intelligenceGaps.map((g: string, i: number) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", padding: "8px 12px", background: "#f8fbff", border: "1px solid #e8f4fd", borderRadius: "7px" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.75rem", marginTop: "1px" }}>○</span>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.5 }}>{g}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ── Tactical Outreach Playbook ──────────────────────── */}
      {engage?.optimization && (
        <Card>
          <SectionHead icon={<Zap size={13} color="#f59e0b" />} label="Tactical Outreach Playbook" color="#f59e0b" />

          {/* Best channel / days / time chips */}
          <div style={s.optimRow}>
            {engage.optimization.best_channel && (
              <div style={s.optimChip}>
                <span style={s.optimKey}>Best Channel</span>
                <span style={s.optimVal}>{engage.optimization.best_channel}</span>
              </div>
            )}
            {engage.optimization.best_days?.length > 0 && (
              <div style={s.optimChip}>
                <span style={s.optimKey}>Best Days</span>
                <span style={s.optimVal}>{engage.optimization.best_days.join(", ")}</span>
              </div>
            )}
            {engage.optimization.suggested_time_of_day && (
              <div style={s.optimChip}>
                <span style={s.optimKey}>Best Time</span>
                <span style={s.optimVal}>{engage.optimization.suggested_time_of_day}</span>
              </div>
            )}
          </div>

          {/* Resonance topics */}
          {engage.high_resonance_topics?.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <GroupLabel text="High Resonance Topics" />
              <div style={s.tagCloud}>
                {engage.high_resonance_topics.map((t: string) => (
                  <Tag key={t} text={t} color="#065f46" bg="#f0fdf4" border="#bbf7d0" />
                ))}
              </div>
            </div>
          )}

          {/* Topics to avoid */}
          {engage.topics_to_avoid?.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <GroupLabel text="Topics to Avoid" />
              <div style={s.tagCloud}>
                {engage.topics_to_avoid.map((t: string) => (
                  <Tag key={t} text={t} color="#b91c1c" bg="#fef2f2" border="#fecaca" />
                ))}
              </div>
            </div>
          )}

          {/* Conversation starters */}
          {starters.length > 0 && (
            <div style={{ marginBottom: "14px" }}>
              <GroupLabel text="Conversation Starters" />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {starters.map((st: any, i: number) => (
                  <div key={i} style={s.starterCard}>
                    <div style={s.starterQuote}>"{st.opener}"</div>
                    {st.context && <div style={s.starterContext}>{st.context}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expandable drafts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {scripts.email_draft && (
              <ExpandableBlock title="Email Draft" icon={<Mail size={13} color="#0ea5e9" />}>
                {scripts.email_draft.subject && (
                  <p style={s.draftSubject}>Subject: {scripts.email_draft.subject}</p>
                )}
                <pre style={s.draftPre}>{scripts.email_draft.body}</pre>
              </ExpandableBlock>
            )}
            {scripts.linkedin_inmail && (
              <ExpandableBlock 
                title="LinkedIn InMail Draft" 
                icon={
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0077b5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                }
              >
                <pre style={s.draftPre}>{scripts.linkedin_inmail.body}</pre>
              </ExpandableBlock>
            )}
          </div>
        </Card>
      )}

      {/* ── Risk & Red Flags ────────────────────────────────── */}
      <Card>
        <SectionHead icon={<ShieldAlert size={13} color="#ef4444" />} label="Risk & Red Flags" color="#ef4444" />

        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <span style={{ ...s.riskBadge, color: riskStyle.color, background: riskStyle.bg, borderColor: riskStyle.border }}>
            {riskKey || "Unknown"} Risk
          </span>
        </div>

        {redFlags.risk_summary && (
          <p style={{ ...s.narrativeText, marginBottom: "16px" }}>{redFlags.risk_summary}</p>
        )}

        {repSignals.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <GroupLabel text="Reputation Signals" />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {repSignals.map((sig: any, i: number) => {
                const neg = sig.sentiment === "Negative";
                return (
                  <div key={i} style={{
                    ...s.signalCard,
                    background: neg ? "#fef2f2" : "#f8fbff",
                    borderColor: neg ? "#fecaca" : "#e8f4fd",
                  }}>
                    <div style={s.signalLeft}>
                      {neg
                        ? <AlertCircle size={14} color="#dc2626" style={{ flexShrink: 0, marginTop: "1px" }} />
                        : <CheckCircle2 size={14} color="#22c55e" style={{ flexShrink: 0, marginTop: "1px" }} />
                      }
                      <p style={s.signalText}>{sig.signal}</p>
                    </div>
                    <span style={{ ...s.signalMeta, color: neg ? "#dc2626" : "#94a3b8" }}>
                      {sig.sentiment} · {sig.source}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {redFlags.data_gaps?.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <GroupLabel text="Data Gaps" />
            <BulletList items={redFlags.data_gaps} color="#94a3b8" />
          </div>
        )}

        {legalIssues.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <GroupLabel text="Legal & Regulatory Issues" />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "4px" }}>
              {legalIssues.map((l: string, i: number) => (
                <div key={i} style={{ padding: "9px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "0.8rem", color: "#991b1b", lineHeight: 1.5 }}>
                  ⚖ {l}
                </div>
              ))}
            </div>
          </div>
        )}

        {controversials.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <GroupLabel text="Controversial Statements" />
            <BulletList items={controversials} color="#f97316" />
          </div>
        )}

        {failedVentures.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <GroupLabel text="Failed Ventures" />
            <BulletList items={failedVentures} color="#94a3b8" />
          </div>
        )}

        {jobHopping?.detected && (
          <div style={{ padding: "10px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "8px" }}>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Job Hopping Signal</div>
            <div style={{ fontSize: "0.82rem", color: "#78350f", lineHeight: 1.5 }}>{jobHopping.assessment}</div>
            <div style={{ marginTop: "6px", display: "flex", gap: "14px" }}>
              <span style={{ fontSize: "0.72rem", color: "#92400e" }}><strong>{jobHopping.roles_analyzed}</strong> roles analyzed</span>
              <span style={{ fontSize: "0.72rem", color: "#92400e" }}>Avg tenure: <strong>{Math.round(jobHopping.average_tenure_months / 12)}y</strong></span>
              <span style={{ fontSize: "0.72rem", color: "#92400e" }}>Shortest: <strong>{jobHopping.shortest_tenure_months}mo</strong></span>
            </div>
          </div>
        )}
      </Card>

      {/* ── Network & Influence ─────────────────────────────── */}
      {(collab.length > 0 || mentions.length > 0 || network?.network_strength_assessment) && (
        <Card>
          <SectionHead icon={<Globe size={13} color="#10b981" />} label="Network & Influence" color="#10b981" />

          {network?.network_reach && (
            <div style={{ marginBottom: "12px" }}>
              <span style={s.reachBadge}>{network.network_reach}</span>
            </div>
          )}

          {network?.network_strength_assessment && (
            <p style={{ ...s.narrativeText, marginBottom: "16px" }}>{network.network_strength_assessment}</p>
          )}

          <div style={s.twoCol}>
            {collab.length > 0 && (
              <div>
                <GroupLabel text="Notable Collaborations" />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {collab.map((c: any, i: number) => (
                    <div key={i} style={s.collabRow}>
                      <div style={s.collabDot} />
                      <div>
                        <span style={s.collabName}>{c.name}</span>
                        {c.context && <span style={s.collabCtx}> — {c.context}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mentions.length > 0 && (
              <div>
                <GroupLabel text="Media Mentions" />
                <div style={s.tagCloud}>
                  {mentions.map((m: any, i: number) => (
                    <a key={i} href={m.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <Tag text={m.outlet} color="#0369a1" bg="#f0f9ff" border="#bae6fd" />
                    </a>
                  ))}
                </div>
              </div>
            )}
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
  card: {
    background: "#ffffff",
    border: "1px solid #e8f0fe",
    borderRadius: "14px",
    padding: "20px 22px",
    boxShadow: "0 1px 3px rgba(14,165,233,0.04), 0 1px 2px rgba(0,0,0,0.03)",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginTop: "16px",
  },

  // Section header
  secHead: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
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

  // Use case badges
  useCaseBadge: {
    fontSize: "0.8rem",
    fontWeight: 700,
    padding: "5px 14px",
    borderRadius: "99px",
    background: "#f0f9ff",
    color: "#0369a1",
    border: "1px solid #bae6fd",
  },

  // Verdict quote
  verdictQuote: {
    background: "#f8fbff",
    border: "1px solid #e8f4fd",
    borderRadius: "10px",
    padding: "14px 16px 14px 20px",
    marginBottom: "18px",
    position: "relative",
  },
  verdictQuoteMark: {
    position: "absolute",
    top: "6px",
    left: "12px",
    fontSize: "2rem",
    lineHeight: 1,
    color: "#bae6fd",
    fontFamily: "Georgia, serif",
    userSelect: "none",
  },
  verdictQuoteText: {
    margin: 0,
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#0f172a",
    lineHeight: 1.6,
    paddingLeft: "8px",
  },

  // Strength bar
  strengthWrap: { marginBottom: "18px" },
  strengthTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "8px",
  },
  strengthLabel: {
    fontSize: "0.78rem",
    fontWeight: 700,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  strengthScore: {
    fontSize: "1.3rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  strengthOf: {
    fontSize: "0.75rem",
    fontWeight: 600,
    color: "#94a3b8",
  },
  barBg: {
    height: "6px",
    background: "#f1f5f9",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "12px",
  },
  barFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.5s ease",
  },
  breakdownRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  breakdownChip: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "#f8fbff",
    border: "1px solid #e8f4fd",
    borderRadius: "6px",
    padding: "3px 8px",
  },
  breakdownVal: {
    fontSize: "0.8rem",
    fontWeight: 800,
  },
  breakdownKey: {
    fontSize: "0.72rem",
    color: "#94a3b8",
    textTransform: "capitalize",
  },

  // Bullets
  groupLabel: {
    margin: "0 0 8px",
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "#94a3b8",
  },
  bulletList: {
    margin: 0,
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  bulletItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
  },
  dot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: "5px",
  },
  bulletText: {
    fontSize: "0.82rem",
    color: "#334155",
    lineHeight: 1.55,
  },

  // Outreach optimization chips
  optimRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "16px",
  },
  optimChip: {
    background: "#f8fbff",
    border: "1px solid #e8f4fd",
    borderRadius: "10px",
    padding: "10px 14px",
    flex: "1 1 120px",
  },
  optimKey: {
    display: "block",
    fontSize: "0.62rem",
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: "3px",
  },
  optimVal: {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "#0f172a",
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

  // Conversation starters
  starterCard: {
    background: "#f8fbff",
    border: "1px solid #e8f4fd",
    borderRadius: "10px",
    padding: "12px 14px",
  },
  starterQuote: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#0f172a",
    lineHeight: 1.5,
    marginBottom: "4px",
  },
  starterContext: {
    fontSize: "0.77rem",
    color: "#64748b",
    lineHeight: 1.5,
  },

  // Expandable drafts
  expandable: {
    border: "1px solid #e8f4fd",
    borderRadius: "10px",
    overflow: "hidden",
    background: "#f8fbff",
  },
  expandableOpen: {
    border: "1px solid #bae6fd",
  },
  expandTrigger: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "11px 14px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    gap: "8px",
  },
  expandTriggerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  expandIcon: {
    display: "flex",
    alignItems: "center",
  },
  expandTitle: {
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  expandContent: {
    padding: "0 14px 14px",
    borderTop: "1px solid #e8f4fd",
  },
  draftSubject: {
    margin: "10px 0 8px",
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  draftPre: {
    margin: "10px 0 0",
    fontFamily: "'DM Mono', 'Fira Code', monospace",
    fontSize: "0.78rem",
    color: "#475569",
    lineHeight: 1.7,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    background: "transparent",
    border: "none",
    padding: 0,
  },

  // Risk
  riskBadge: {
    display: "inline-block",
    fontSize: "0.78rem",
    fontWeight: 700,
    padding: "4px 14px",
    borderRadius: "99px",
    border: "1px solid",
    letterSpacing: "0.03em",
  },
  narrativeText: {
    margin: 0,
    fontSize: "0.83rem",
    color: "#64748b",
    lineHeight: 1.7,
  },
  signalCard: {
    border: "1px solid",
    borderRadius: "9px",
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  signalLeft: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
  },
  signalText: {
    margin: 0,
    fontSize: "0.83rem",
    color: "#0f172a",
    lineHeight: 1.45,
  },
  signalMeta: {
    fontSize: "0.72rem",
    fontWeight: 600,
    paddingLeft: "22px",
  },

  // Network
  reachBadge: {
    display: "inline-block",
    fontSize: "0.73rem",
    fontWeight: 700,
    color: "#0369a1",
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "6px",
    padding: "3px 10px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  collabRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px 12px",
    background: "#f8fbff",
    borderRadius: "8px",
    border: "1px solid #e8f4fd",
  },
  collabDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#10b981",
    flexShrink: 0,
    marginTop: "5px",
  },
  collabName: {
    fontSize: "0.83rem",
    fontWeight: 700,
    color: "#0f172a",
  },
  collabCtx: {
    fontSize: "0.8rem",
    color: "#64748b",
  },
};