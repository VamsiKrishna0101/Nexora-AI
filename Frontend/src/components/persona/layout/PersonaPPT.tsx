import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface PersonaPPTProps {
  reportData: any;
  personaData: any;
}

// ── Image Pre-processing ──────────────────────────────────────────────────────
const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  if (!url) return null;
  // Fix malformed LinkedIn URLs (LLM sometimes replaces ? with /)
  const cleanUrl = url.replace(/\/e=/, '?e=');
  try {
    const proxyUrl = `http://localhost:8000/api/proxy-image?url=${encodeURIComponent(cleanUrl)}`;
    const response = await fetch(proxyUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error("[Pre-load] Image proxy fetch failed:", cleanUrl, err);
    return null;
  }
};

export const generatePDF = async (
  containerRef: React.RefObject<HTMLDivElement>,
  filename: string
) => {
  if (!containerRef.current) return;
  await new Promise((r) => setTimeout(r, 1000));
  const slides = containerRef.current.querySelectorAll(".persona-ppt-slide");
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1122, 794] });
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i] as HTMLElement;
    const canvas = await html2canvas(slide, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, 1122, 794);
  }
  pdf.save(`${filename}.pdf`);
};

// ── Design Tokens ─────────────────────────────────────────────────────────────
const T = {
  // Backgrounds
  bg: "#ffffff",
  bgSurface: "#f8f9fb",
  bgMuted: "#f1f3f7",

  // Text
  textPrimary: "#0f172a",
  textSecondary: "#475569",
  textMuted: "#94a3b8",

  // Accent (single navy blue)
  accent: "#1e3a8a",
  accentLight: "#eff6ff",
  accentBorder: "#bfdbfe",
  accentMid: "#2563eb",

  // Borders
  border: "#e2e8f0",
  borderMid: "#cbd5e1",

  // Status
  positive: "#166534",
  positiveBg: "#f0fdf4",
  positiveBorder: "#bbf7d0",
  warning: "#92400e",
  warningBg: "#fffbeb",
  warningBorder: "#fde68a",
  danger: "#991b1b",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
};

const FONT = "'Inter','DM Sans','Segoe UI',system-ui,sans-serif";
const TOTAL_SLIDES = 7;

// ── Data Parser ───────────────────────────────────────────────────────────────
const parse = (val: any): any => {
  if (val === null || val === undefined) return null;
  if (typeof val === "object" && !Array.isArray(val)) {
    if (val.raw?.data) return val.raw.data;
    if (val.data !== undefined) return val.data;
    return val;
  }
  if (typeof val !== "string") return val;
  try {
    const parsed = JSON.parse(val);
    if (parsed && typeof parsed === "object") {
      if (parsed.raw?.data) return parsed.raw.data;
      if (parsed.data !== undefined) return parsed.data;
    }
    return parsed;
  } catch { }
  try {
    const fixed = val
      .replace(/:\s*None\b/g, ": null")
      .replace(/:\s*True\b/g, ": true")
      .replace(/:\s*False\b/g, ": false")
      .replace(/'/g, '"');
    const parsed = JSON.parse(fixed);
    if (parsed?.raw?.data) return parsed.raw.data;
    if (parsed?.data !== undefined) return parsed.data;
    return parsed;
  } catch { }
  try {
    const fixed = val
      .replace(/:\s*None\b/g, ": null")
      .replace(/:\s*True\b/g, ": true")
      .replace(/:\s*False\b/g, ": false");
    const result = new Function("return " + fixed)();
    if (result?.raw?.data) return result.raw.data;
    if (result?.data !== undefined) return result.data;
    return result;
  } catch {
    return null;
  }
};

const section = (raw: any): any => {
  if (!raw) return {};
  if (typeof raw === "object" && raw.data) return raw.data;
  const parsed = parse(raw);
  if (!parsed) return {};
  if (parsed.data) return parsed.data;
  return parsed;
};

// ── Shared Layout Components ──────────────────────────────────────────────────

/** Top header bar shared by slides 2–7 */
const SlideHeader = ({
  title,
  subtitle,
  page,
}: {
  title: string;
  subtitle?: string;
  page: number;
}) => (
  <div
    style={{
      padding: "18px 40px 14px",
      borderBottom: `1px solid ${T.border}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
      backgroundColor: T.bg,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 3,
          height: 28,
          background: T.accent,
          borderRadius: 2,
          flexShrink: 0,
        }}
      />
      <div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: T.textPrimary,
            fontFamily: FONT,
            letterSpacing: "-0.3px",
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontSize: 12,
              color: T.textMuted,
              fontFamily: FONT,
              marginTop: 2,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
    </div>
    <div
      style={{
        fontSize: 12,
        color: T.textMuted,
        fontFamily: FONT,
        fontWeight: 500,
      }}
    >
      {String(page).padStart(2, "0")} / {String(TOTAL_SLIDES).padStart(2, "0")}
    </div>
  </div>
);

/** Bottom footer */
const SlideFooter = () => (
  <div
    style={{
      borderTop: `1px solid ${T.border}`,
      padding: "8px 40px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexShrink: 0,
      backgroundColor: T.bgSurface,
    }}
  >
    <div style={{ fontSize: 10, color: T.textMuted, fontFamily: FONT, letterSpacing: "0.5px" }}>
      EXECUTIVE RESEARCH PROFILE · NEXORA v3.2
    </div>
    <div style={{ fontSize: 10, color: T.textMuted, fontFamily: FONT }}>
      {new Date().toISOString().split("T")[0]}
    </div>
  </div>
);

/** Wrapper for slides 2–7 */
const Slide = ({
  children,
  title,
  subtitle,
  page,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  page: number;
}) => (
  <div
    className="persona-ppt-slide"
    style={{
      width: 1122,
      height: 794,
      background: T.bg,
      fontFamily: FONT,
      position: "relative",
      boxSizing: "border-box",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      pageBreakAfter: "always",
    }}
  >
    <SlideHeader title={title} subtitle={subtitle} page={page} />
    <div
      style={{
        flex: 1,
        minHeight: 0,
        padding: "22px 40px 18px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
    <SlideFooter />
  </div>
);

/** Labeled panel with thin border */
const Panel = ({
  children,
  label,
  flex,
  minHeight,
}: {
  children: React.ReactNode;
  label?: string;
  flex?: number;
  minHeight?: number;
}) => (
  <div
    style={{
      border: `1px solid ${T.border}`,
      borderRadius: 6,
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      flex: flex ?? 1,
      minHeight: minHeight ?? 0,
    }}
  >
    {label && (
      <div
        style={{
          padding: "8px 16px",
          borderBottom: `1px solid ${T.border}`,
          backgroundColor: T.bgSurface,
          display: "flex",
          alignItems: "center",
          gap: 7,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: T.accent,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: T.textSecondary,
            textTransform: "uppercase",
            letterSpacing: "0.8px",
            fontFamily: FONT,
          }}
        >
          {label}
        </span>
      </div>
    )}
    <div
      style={{
        padding: "14px 16px",
        flex: 1,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  </div>
);

/** Small metric chip */
const MetricChip = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <div
    style={{
      padding: "10px 14px",
      border: `1px solid ${T.border}`,
      borderRadius: 6,
      backgroundColor: T.bgSurface,
    }}
  >
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: T.textMuted,
        textTransform: "uppercase",
        letterSpacing: "0.8px",
        marginBottom: 5,
        fontFamily: FONT,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 14,
        fontWeight: 700,
        color: color ?? T.accent,
        fontFamily: FONT,
      }}
    >
      {value}
    </div>
  </div>
);

/** Data row (label / value) */
const DataRow = ({
  label,
  value,
  last,
}: {
  label: string;
  value: string | number;
  last?: boolean;
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      padding: "7px 0",
      borderBottom: last ? "none" : `1px solid ${T.border}`,
    }}
  >
    <span style={{ fontSize: 12, color: T.textSecondary, fontFamily: FONT }}>
      {label}
    </span>
    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: T.textPrimary,
        fontFamily: FONT,
      }}
    >
      {value}
    </span>
  </div>
);

/** Tag pill */
const Tag = ({
  text,
  variant = "accent",
}: {
  text: string;
  variant?: "accent" | "neutral" | "positive" | "warning" | "danger";
}) => {
  const styles: Record<string, { bg: string; color: string; border: string }> = {
    accent: { bg: T.accentLight, color: T.accent, border: T.accentBorder },
    neutral: { bg: T.bgMuted, color: T.textSecondary, border: T.border },
    positive: { bg: T.positiveBg, color: T.positive, border: T.positiveBorder },
    warning: { bg: T.warningBg, color: T.warning, border: T.warningBorder },
    danger: { bg: T.dangerBg, color: T.danger, border: T.dangerBorder },
  };
  const s = styles[variant];
  return (
    <div
      style={{
        padding: "4px 11px",
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        borderRadius: 100,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: FONT,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

/** Trait bar */
const TraitBar = ({ label, score }: { label: string; score: number }) => (
  <div style={{ marginBottom: 10 }}>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 11,
        color: T.textSecondary,
        marginBottom: 5,
        fontFamily: FONT,
      }}
    >
      <span style={{ textTransform: "capitalize" }}>{label.replace(/_/g, " ")}</span>
      <span style={{ fontWeight: 600, color: T.textPrimary }}>{score}%</span>
    </div>
    <div
      style={{
        height: 5,
        background: T.bgMuted,
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${score}%`,
          height: "100%",
          background: T.accent,
          borderRadius: 3,
        }}
      />
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════════
export default function PersonaPPT({ reportData }: PersonaPPTProps) {
  const [preloadedPhoto, setPreloadedPhoto] = useState<string | null>(null);

  const S = reportData?.sections || {};
  const profile = section(S.executive_profile);
  const personality = section(S.personality_analysis);
  const profData = section(S.professional_journey);
  const skills = section(S.skills_expertise);
  const online = section(S.online_presence);
  const redFlags = section(S.red_flags);
  const engage = section(S.how_to_engage);
  const verdict = section(S.analyst_verdict);
  const achievements = section(S.professional_achievements ?? S.recent_projects_partnerships);
  const thoughtLead = section(S.speaks_or_writes ?? S.social_content_summary);
  const networkData = section(S.network_influence ?? S.events_networking);

  const subject = reportData?.subject || {};
  const name = subject.name || profile.full_name || "Unknown";
  const photoUrl = profile.profile_photo_url || null;
  const careerTimeline = (profData.career_timeline || []).slice(0, 5);
  const education = profData.education_history || [];
  const awards = achievements.awards_and_recognition || [];
  const products = achievements.products_launched || [];
  const confTalks = thoughtLead.conference_talks || [];
  const podcasts = thoughtLead.podcast_appearances || [];
  const tlTopics = thoughtLead.key_topics_covered || [];

  useEffect(() => {
    if (photoUrl) {
      imageUrlToBase64(photoUrl).then(setPreloadedPhoto);
    }
  }, [photoUrl]);

  if (!reportData) return null;

  // ─────────────────────────────────────────────────────────────────────────
  // Helper: format follower counts
  const fmt = (n: number) =>
    n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1000
        ? `${(n / 1000).toFixed(0)}K`
        : String(n);

  return (
    <div
      id="hidden-persona-ppt"
      style={{ position: "absolute", left: "-9999px", top: "-9999px" }}
    >
      {/* ───────────────────────────────────────────────────────────────────
          SLIDE 1 — COVER
      ─────────────────────────────────────────────────────────────────── */}
      {/* ─── SLIDE 1: COVER ───────────────────────────────────────────────── */}
      <div
        className="persona-ppt-slide"
        style={{
          width: 1122, height: 794, background: T.bg, fontFamily: FONT,
          position: "relative", boxSizing: "border-box", overflow: "hidden",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "0 100px", pageBreakAfter: "always",
        }}
      >
        {/* Top accent bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: T.accent }} />

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, marginBottom: 40 }}>
          <div style={{
            width: 180, height: 180, borderRadius: "50%", background: T.bgSurface,
            border: `3px solid ${T.border}`, overflow: "hidden", display: "flex",
            alignItems: "center", justifyContent: "center", boxShadow: "0 12px 40px rgba(0,0,0,0.1)"
          }}>
            {preloadedPhoto ? (
              <img src={preloadedPhoto} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ fontSize: 72, fontWeight: 900, color: T.accent, opacity: 0.2 }}>{name.charAt(0)}</div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: T.accent, letterSpacing: 5, textTransform: "uppercase", opacity: 0.7 }}>
              Executive Research Dossier
            </div>
            <h1 style={{ fontSize: 72, fontWeight: 800, color: T.textPrimary, margin: 0, letterSpacing: "-0.04em", lineHeight: 0.9 }}>
              {name}
            </h1>
            <div style={{ fontSize: 22, fontWeight: 600, color: T.textSecondary, marginTop: 12 }}>
              {profile.current_role || "Executive Leadership"} · {profile.company || "Enterprise"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 60, borderTop: `1px solid ${T.border}`, paddingTop: 40, width: "100%", justifyContent: "center" }}>
          {[
            { label: "LOCATION", value: profile.location || "Global View" },
            { label: "INFLUENCE", value: profile.influence_score ? `${profile.influence_score}/100` : "Tier 1" },
            { label: "ARCHETYPE", value: (personality.behavioral_profile?.archetype || "Strategic Visionary").toUpperCase() }
          ].map(item => (
            <div key={item.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: T.textMuted, letterSpacing: 1.5 }}>{item.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ position: "absolute", bottom: 40, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ fontSize: 11, color: T.textMuted, fontWeight: 600, letterSpacing: 2 }}>
            © {new Date().getFullYear()} NEXORA EXECUTIVE RESEARCH · STRICTLY CONFIDENTIAL
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          SLIDE 2 — DIGITAL IDENTITY
      ─────────────────────────────────────────────────────────────────── */}
      <Slide
        title="Digital Identity & Footprint"
        subtitle="Network reach · Content velocity · Platform presence"
        page={2}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 18,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Left col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel label="Footprint Summary">
              <p
                style={{
                  fontSize: 13,
                  color: T.textSecondary,
                  lineHeight: 1.65,
                  margin: 0,
                  fontFamily: FONT,
                }}
              >
                {online.recent_activity_summary ||
                  "Subject maintains a robust industry presence with peak authority across professional networks."}
              </p>

              <div style={{ marginTop: 16 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 8,
                    fontFamily: FONT,
                  }}
                >
                  Network Statistics
                </div>
                {online.linkedin && (
                  <>
                    <DataRow
                      label="LinkedIn Followers"
                      value={fmt(online.linkedin.followers)}
                    />
                    <DataRow
                      label="Avg. Likes / LinkedIn Post"
                      value={online.linkedin.avg_likes_per_post?.toLocaleString() || "—"}
                    />
                  </>
                )}
                {online.twitter && (
                  <>
                    <DataRow
                      label="X (Twitter) Followers"
                      value={fmt(online.twitter.followers)}
                    />
                    <DataRow
                      label="Avg. Likes / Tweet"
                      value={online.twitter.avg_likes_per_tweet?.toLocaleString() || "—"}
                      last
                    />
                  </>
                )}
              </div>
            </Panel>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <MetricChip
                label="Digital Footprint"
                value={
                  online.overall_digital_footprint?.toUpperCase() || "STRONG"
                }
                color={T.positive}
              />
              <MetricChip
                label="Network Tier"
                value={networkData.network_reach || "Tier 1 Global"}
              />
            </div>
          </div>

          {/* Right col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel label="Top Industry Themes">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
                {(
                  online.linkedin?.top_topics ||
                  online.twitter?.top_topics ||
                  []
                ).map((t: string, i: number) => (
                  <Tag key={i} text={`#${t}`} variant="accent" />
                ))}
              </div>

              {online.linkedin?.last_post_summary && (
                <>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      marginBottom: 8,
                      fontFamily: FONT,
                    }}
                  >
                    Latest Activity
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: T.textSecondary,
                      lineHeight: 1.6,
                      margin: "0 0 12px",
                      paddingLeft: 12,
                      borderLeft: `3px solid ${T.accentBorder}`,
                      fontFamily: FONT,
                    }}
                  >
                    {online.linkedin.last_post_summary}
                  </p>
                </>
              )}

              <div style={{ display: "flex", gap: 10 }}>
                {online.linkedin?.posting_frequency && (
                  <MetricChip
                    label="LinkedIn Cadence"
                    value={online.linkedin.posting_frequency}
                  />
                )}
                {online.twitter?.posting_frequency && (
                  <MetricChip
                    label="X Cadence"
                    value={online.twitter.posting_frequency}
                  />
                )}
              </div>
            </Panel>
          </div>
        </div>
      </Slide>

      {/* ───────────────────────────────────────────────────────────────────
          SLIDE 3 — PROFESSIONAL JOURNEY
      ─────────────────────────────────────────────────────────────────── */}
      <Slide
        title="Professional Foundations & Expertise"
        subtitle="Career history · Domain mastery · Education"
        page={3}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.35fr) minmax(0,1fr)",
            gap: 18,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Career timeline */}
          <Panel label="Career Timeline">
            {careerTimeline.length > 0 ? (
              careerTimeline.map((item: any, i: number) => (
                <div
                  key={i}
                  style={{ display: "flex", gap: 14, marginBottom: 14 }}
                >
                  {/* Dot + line */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        background: i === 0 ? T.accent : T.borderMid,
                        flexShrink: 0,
                        border: i === 0 ? `2px solid ${T.accentLight}` : "none",
                        marginTop: 3,
                      }}
                    />
                    {i < careerTimeline.length - 1 && (
                      <div
                        style={{
                          width: 1,
                          flex: 1,
                          background: T.border,
                          minHeight: 10,
                          marginTop: 3,
                        }}
                      />
                    )}
                  </div>

                  {/* Text */}
                  <div style={{ paddingBottom: 6 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: T.textPrimary,
                        marginBottom: 2,
                        fontFamily: FONT,
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: T.textSecondary,
                        marginBottom: 3,
                        fontFamily: FONT,
                      }}
                    >
                      {item.company}
                      {item.start_date || item.end_date
                        ? ` · ${item.start_date || ""}–${item.end_date || "Present"}`
                        : ""}
                    </div>
                    {item.one_line_impact && (
                      <div
                        style={{
                          fontSize: 12,
                          color: T.textMuted,
                          lineHeight: 1.4,
                          fontFamily: FONT,
                        }}
                      >
                        {item.one_line_impact}
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p
                style={{
                  fontSize: 13,
                  color: T.textMuted,
                  fontFamily: FONT,
                }}
              >
                No career data available.
              </p>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div
                style={{
                  marginTop: 12,
                  borderTop: `1px solid ${T.border}`,
                  paddingTop: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 10,
                    fontFamily: FONT,
                  }}
                >
                  Education
                </div>
                {education.map((e: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      alignItems: "baseline",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.textPrimary,
                          fontFamily: FONT,
                        }}
                      >
                        {e.institution}
                      </span>
                      {e.field_of_study && e.field_of_study !== "N/A" && (
                        <span
                          style={{
                            fontSize: 11,
                            color: T.textMuted,
                            marginLeft: 6,
                            fontFamily: FONT,
                          }}
                        >
                          · {e.field_of_study}
                        </span>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: T.accent,
                        fontWeight: 600,
                        fontFamily: FONT,
                      }}
                    >
                      {e.degree}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Right col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel label="Core Domain Expertise">
              {(skills.domain_expertise || []).slice(0, 4).map((d: any, i: number) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: T.textPrimary,
                        fontFamily: FONT,
                      }}
                    >
                      {d.domain}
                    </span>
                    <Tag
                      text={d.depth?.toUpperCase() || "EXPERT"}
                      variant="accent"
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.textMuted,
                      lineHeight: 1.4,
                      fontFamily: FONT,
                    }}
                  >
                    {d.evidence}
                  </div>
                </div>
              ))}
            </Panel>

            <Panel label="Soft Skill Signals">
              {(skills.soft_skills_signals || []).slice(0, 3).map((s: any, i: number) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: T.textPrimary,
                      marginBottom: 2,
                      fontFamily: FONT,
                    }}
                  >
                    {s.skill}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: T.textMuted,
                      lineHeight: 1.4,
                      fontFamily: FONT,
                    }}
                  >
                    {s.justification}
                  </div>
                </div>
              ))}
            </Panel>
          </div>
        </div>
      </Slide>

      {/* ───────────────────────────────────────────────────────────────────
          SLIDE 4 — ACHIEVEMENTS & THOUGHT LEADERSHIP
      ─────────────────────────────────────────────────────────────────── */}
      <Slide
        title="Achievements & Thought Leadership"
        subtitle="Awards · Products launched · Speaking engagements · Media"
        page={4}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 18,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel label="Awards & Recognition">
              {awards.length > 0 ? (
                awards.map((a: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      padding: "8px 0",
                      borderBottom:
                        i < awards.length - 1
                          ? `1px solid ${T.border}`
                          : "none",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.textPrimary,
                          fontFamily: FONT,
                        }}
                      >
                        {a.award}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: T.textMuted,
                          fontFamily: FONT,
                        }}
                      >
                        {a.issuing_body}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: T.textSecondary,
                        fontFamily: FONT,
                        marginLeft: 8,
                        flexShrink: 0,
                      }}
                    >
                      {a.year}
                    </span>
                  </div>
                ))
              ) : (
                <p
                  style={{
                    fontSize: 12,
                    color: T.textMuted,
                    fontFamily: FONT,
                  }}
                >
                  No awards data available.
                </p>
              )}
            </Panel>

            <Panel label="Products Built / Scaled">
              {products.length > 0 ? (
                products.map((p: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      padding: "7px 0",
                      borderBottom:
                        i < products.length - 1
                          ? `1px solid ${T.border}`
                          : "none",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.textPrimary,
                          fontFamily: FONT,
                        }}
                      >
                        {p.product}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: T.textMuted,
                          fontFamily: FONT,
                        }}
                      >
                        {p.context}
                      </div>
                    </div>
                    {p.impact && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: T.accent,
                          fontFamily: FONT,
                          marginLeft: 8,
                          flexShrink: 0,
                        }}
                      >
                        {p.impact}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <p
                  style={{
                    fontSize: 12,
                    color: T.textMuted,
                    fontFamily: FONT,
                  }}
                >
                  No products data available.
                </p>
              )}
            </Panel>
          </div>

          {/* Right */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel label="Speaking & Media">
              {confTalks.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      marginBottom: 8,
                      fontFamily: FONT,
                    }}
                  >
                    Conference Talks
                  </div>
                  {confTalks.slice(0, 3).map((t: any, i: number) => (
                    <div key={i} style={{ marginBottom: 10 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.textPrimary,
                          fontFamily: FONT,
                        }}
                      >
                        {t.talk_title}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: T.textMuted,
                          fontFamily: FONT,
                        }}
                      >
                        {t.event}
                        {t.date ? ` · ${t.date.slice(0, 7)}` : ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {podcasts.length > 0 && (
                <div
                  style={{
                    borderTop: `1px solid ${T.border}`,
                    paddingTop: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      marginBottom: 8,
                      fontFamily: FONT,
                    }}
                  >
                    Podcast Appearances
                  </div>
                  {podcasts.slice(0, 2).map((p: any, i: number) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: T.textPrimary,
                          fontFamily: FONT,
                        }}
                      >
                        {p.show_name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: T.textMuted,
                          fontFamily: FONT,
                        }}
                      >
                        {p.episode_title}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <Panel label="Thought Leadership Topics">
              <div
                style={{
                  fontSize: 11,
                  color: T.textMuted,
                  marginBottom: 10,
                  fontFamily: FONT,
                }}
              >
                Tier:{" "}
                <strong style={{ color: T.textSecondary }}>
                  {thoughtLead.thought_leadership_tier || "Industry Authority"}
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 7,
                  marginBottom: 12,
                }}
              >
                {tlTopics
                  .slice(0, 6)
                  .map((t: string, i: number) => (
                    <Tag key={i} text={t} variant="neutral" />
                  ))}
              </div>
              {thoughtLead.thought_leadership_assessment && (
                <p
                  style={{
                    fontSize: 12,
                    color: T.textSecondary,
                    lineHeight: 1.6,
                    margin: 0,
                    fontFamily: FONT,
                  }}
                >
                  {thoughtLead.thought_leadership_assessment.slice(0, 240)}…
                </p>
              )}
            </Panel>
          </div>
        </div>
      </Slide>

      {/* ───────────────────────────────────────────────────────────────────
          SLIDE 5 — BEHAVIORAL INTELLIGENCE
      ─────────────────────────────────────────────────────────────────── */}
      <Slide
        title="Behavioral Intelligence"
        subtitle="Psychographic profile · Traits · Working style"
        page={5}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 18,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel label="Behavioral Archetype">
              <div
                style={{
                  padding: "16px",
                  background: T.accentLight,
                  border: `1px solid ${T.accentBorder}`,
                  borderRadius: 6,
                  textAlign: "center",
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.accent,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: 6,
                    fontFamily: FONT,
                  }}
                >
                  Psychographic Profile
                </div>
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: T.textPrimary,
                    fontFamily: FONT,
                  }}
                >
                  {personality.behavioral_profile?.archetype || "The Visionary"}
                </div>
              </div>

              {personality.behavioral_profile?.one_line_description && (
                <p
                  style={{
                    fontSize: 13,
                    color: T.textSecondary,
                    lineHeight: 1.6,
                    fontStyle: "italic",
                    margin: "0 0 12px",
                    fontFamily: FONT,
                  }}
                >
                  "{personality.behavioral_profile.one_line_description}"
                </p>
              )}

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(personality.behavioral_profile?.trait_tags || []).map(
                  (t: string, i: number) => (
                    <Tag key={i} text={t} variant="neutral" />
                  )
                )}
              </div>
            </Panel>

            <Panel label="Working Style">
              {[
                { lbl: "Pace", val: personality.working_style?.pace },
                { lbl: "Conflict style", val: personality.working_style?.conflict_style },
                { lbl: "Decision making", val: personality.working_style?.decision_making },
                { lbl: "Collaboration", val: personality.working_style?.collaboration },
              ]
                .filter((x) => x.val)
                .map((item, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: T.textMuted,
                        textTransform: "uppercase",
                        letterSpacing: "0.8px",
                        marginBottom: 2,
                        fontFamily: FONT,
                      }}
                    >
                      {item.lbl}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: T.textSecondary,
                        fontFamily: FONT,
                      }}
                    >
                      {item.val}
                    </div>
                  </div>
                ))}
            </Panel>
          </div>

          {/* Right */}
          <Panel label="Trait Assessment">
            <div style={{ padding: "4px 0" }}>
              {Object.entries(personality.trait_scores || {}).map(
                ([key, val], i) => (
                  <TraitBar key={i} label={key} score={val as number} />
                )
              )}
            </div>

            <div
              style={{
                marginTop: 14,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div
                style={{
                  padding: 12,
                  background: T.positiveBg,
                  border: `1px solid ${T.positiveBorder}`,
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.positive,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 6,
                    fontFamily: FONT,
                  }}
                >
                  Energizers
                </div>
                {(personality.what_drives_them?.energizers || [])
                  .slice(0, 3)
                  .map((e: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 11,
                        color: T.positive,
                        marginBottom: 4,
                        fontFamily: FONT,
                      }}
                    >
                      · {e}
                    </div>
                  ))}
              </div>

              <div
                style={{
                  padding: 12,
                  background: T.dangerBg,
                  border: `1px solid ${T.dangerBorder}`,
                  borderRadius: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.danger,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    marginBottom: 6,
                    fontFamily: FONT,
                  }}
                >
                  Drainers
                </div>
                {(personality.what_drives_them?.drainers || [])
                  .slice(0, 3)
                  .map((d: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 11,
                        color: T.danger,
                        marginBottom: 4,
                        fontFamily: FONT,
                      }}
                    >
                      · {d}
                    </div>
                  ))}
              </div>
            </div>

            {personality.dos_and_donts && (
              <div
                style={{
                  marginTop: 12,
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    padding: 12,
                    background: T.bgSurface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: T.positive,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      marginBottom: 6,
                      fontFamily: FONT,
                    }}
                  >
                    Do
                  </div>
                  {(personality.dos_and_donts.dos || [])
                    .slice(0, 3)
                    .map((d: string, i: number) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 11,
                          color: T.textSecondary,
                          marginBottom: 4,
                          fontFamily: FONT,
                        }}
                      >
                        ✓ {d}
                      </div>
                    ))}
                </div>

                <div
                  style={{
                    padding: 12,
                    background: T.bgSurface,
                    border: `1px solid ${T.border}`,
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: T.danger,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      marginBottom: 6,
                      fontFamily: FONT,
                    }}
                  >
                    Don't
                  </div>
                  {(personality.dos_and_donts.donts || [])
                    .slice(0, 3)
                    .map((d: string, i: number) => (
                      <div
                        key={i}
                        style={{
                          fontSize: 11,
                          color: T.textSecondary,
                          marginBottom: 4,
                          fontFamily: FONT,
                        }}
                      >
                        ✗ {d}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Panel>
        </div>
      </Slide>

      {/* ───────────────────────────────────────────────────────────────────
          SLIDE 6 — TACTICAL OUTREACH
      ─────────────────────────────────────────────────────────────────── */}
      <Slide
        title="Tactical Outreach & Engagement"
        subtitle="Optimised channels · Email blueprint · Conversation starters"
        page={6}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
            gap: 18,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel label="Outreach Optimisation">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <MetricChip
                  label="Best Channel"
                  value={engage.optimization?.best_channel || "Email"}
                />
                <MetricChip
                  label="Best Days"
                  value={
                    (engage.optimization?.best_days || []).join(", ") || "Tue–Wed"
                  }
                />
                <MetricChip
                  label="Best Time"
                  value={engage.optimization?.suggested_time_of_day || "—"}
                />
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.textMuted,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: 8,
                  fontFamily: FONT,
                }}
              >
                High-Resonance Topics
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                {(engage.high_resonance_topics || [])
                  .slice(0, 4)
                  .map((t: string, i: number) => (
                    <Tag key={i} text={t} variant="neutral" />
                  ))}
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.danger,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: 8,
                  fontFamily: FONT,
                }}
              >
                Topics to Avoid
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(engage.topics_to_avoid || [])
                  .slice(0, 3)
                  .map((t: string, i: number) => (
                    <Tag key={i} text={t} variant="danger" />
                  ))}
              </div>
            </Panel>

            <Panel label="Conversation Starters">
              {(engage.conversation_starters || [])
                .slice(0, 2)
                .map((c: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      marginBottom: 12,
                      paddingBottom: 10,
                      borderBottom:
                        i === 0 ? `1px solid ${T.border}` : "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: T.textPrimary,
                        marginBottom: 4,
                        fontFamily: FONT,
                      }}
                    >
                      "{c.opener}"
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: T.textMuted,
                        fontFamily: FONT,
                      }}
                    >
                      Context: {c.context}
                    </div>
                  </div>
                ))}
            </Panel>
          </div>

          {/* Right — Email template */}
          <Panel label="Cold Email Blueprint">
            <div
              style={{
                background: T.bgSurface,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: 18,
                height: "100%",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: T.accent,
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: 12,
                  fontFamily: FONT,
                }}
              >
                Template: Cold Email v1
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: T.textSecondary,
                  borderBottom: `1px solid ${T.border}`,
                  paddingBottom: 10,
                  marginBottom: 14,
                  fontFamily: FONT,
                }}
              >
                <span style={{ fontWeight: 700, color: T.textPrimary }}>
                  Subject:{" "}
                </span>
                {engage.outreach_scripts?.email_draft?.subject}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: T.textSecondary,
                  lineHeight: 1.75,
                  whiteSpace: "pre-wrap",
                  fontFamily: FONT,
                }}
              >
                {engage.outreach_scripts?.email_draft?.body}
              </div>
            </div>
          </Panel>
        </div>
      </Slide>

      {/* ───────────────────────────────────────────────────────────────────
          SLIDE 7 — ANALYST VERDICT
      ─────────────────────────────────────────────────────────────────── */}
      <Slide
        title="AI Analyst Determination"
        subtitle="Profile strength · Risk matrix · Final signal"
        page={7}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px minmax(0,1fr)",
            gap: 18,
            flex: 1,
            minHeight: 0,
          }}
        >
          {/* Left col — score + chips */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Score card */}
            <div
              style={{
                background: T.accentLight,
                border: `1px solid ${T.accentBorder}`,
                borderRadius: 6,
                padding: "24px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: T.accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: 8,
                  fontFamily: FONT,
                }}
              >
                Profile Strength
              </div>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 700,
                  color: T.accent,
                  lineHeight: 1,
                  fontFamily: FONT,
                }}
              >
                {verdict.profile_strength_score || 85}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: T.textMuted,
                  fontFamily: FONT,
                  marginTop: 2,
                }}
              >
                / 100
              </div>
            </div>

            <MetricChip
              label="Risk Profile"
              value={
                (redFlags.overall_risk_rating || "MEDIUM").toUpperCase()
              }
              color={T.warning}
            />
            <MetricChip
              label="Data Confidence"
              value={(verdict.confidence_level || "HIGH").toUpperCase()}
              color={T.positive}
            />

            {/* Risk signals */}
            {(redFlags.reputation_signals || []).length > 0 && (
              <Panel label="Risk Signals">
                {redFlags.reputation_signals.slice(0, 2).map((r: any, i: number) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <Tag
                      text={r.sentiment?.toUpperCase() || "NEUTRAL"}
                      variant={
                        r.sentiment === "Negative" ? "danger" : "warning"
                      }
                    />
                    <div
                      style={{
                        fontSize: 12,
                        color: T.textSecondary,
                        lineHeight: 1.4,
                        marginTop: 4,
                        fontFamily: FONT,
                      }}
                    >
                      {r.signal}
                    </div>
                  </div>
                ))}
              </Panel>
            )}
          </div>

          {/* Right col */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Panel label="Strategic Verdict">
              <div
                style={{
                  padding: "14px 16px",
                  background: T.accentLight,
                  border: `1px solid ${T.accentBorder}`,
                  borderRadius: 6,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: T.accent,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: 6,
                    fontFamily: FONT,
                  }}
                >
                  Executive Signal
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: T.textPrimary,
                    lineHeight: 1.6,
                    margin: 0,
                    fontFamily: FONT,
                    fontWeight: 500,
                  }}
                >
                  {verdict.one_line_verdict}
                </p>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 18,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.positive,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      marginBottom: 10,
                      fontFamily: FONT,
                    }}
                  >
                    Key Strengths
                  </div>
                  {(verdict.key_strengths || [])
                    .slice(0, 3)
                    .map((t: string, i: number) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 8,
                          marginBottom: 8,
                          fontSize: 12,
                          color: T.textSecondary,
                          fontFamily: FONT,
                          lineHeight: 1.4,
                        }}
                      >
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: T.positive,
                            marginTop: 5,
                            flexShrink: 0,
                          }}
                        />
                        {t}
                      </div>
                    ))}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: T.danger,
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      marginBottom: 10,
                      fontFamily: FONT,
                    }}
                  >
                    Risk Areas
                  </div>
                  {(verdict.key_concerns || [])
                    .slice(0, 3)
                    .map((t: string, i: number) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: 8,
                          marginBottom: 8,
                          fontSize: 12,
                          color: T.textSecondary,
                          fontFamily: FONT,
                          lineHeight: 1.4,
                        }}
                      >
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: T.danger,
                            marginTop: 5,
                            flexShrink: 0,
                          }}
                        />
                        {t}
                      </div>
                    ))}
                </div>
              </div>
            </Panel>

            {(verdict.recommended_use_cases || []).length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: T.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    flexShrink: 0,
                    fontFamily: FONT,
                  }}
                >
                  Best Fit:
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {verdict.recommended_use_cases.map((u: string, i: number) => (
                    <Tag key={i} text={u} variant="accent" />
                  ))}
                </div>
              </div>
            )}

            {(verdict.intelligence_gaps || []).length > 0 && (
              <Panel label="Intelligence Gaps">
                {verdict.intelligence_gaps
                  .slice(0, 2)
                  .map((g: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        fontSize: 12,
                        color: T.textMuted,
                        marginBottom: 6,
                        fontFamily: FONT,
                        display: "flex",
                        gap: 8,
                      }}
                    >
                      <span style={{ flexShrink: 0, color: T.textMuted }}>◇</span>
                      {g}
                    </div>
                  ))}
              </Panel>
            )}
          </div>
        </div>
      </Slide>
    </div>
  );
}