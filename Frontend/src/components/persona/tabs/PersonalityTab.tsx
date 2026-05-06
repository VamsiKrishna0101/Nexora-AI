import { Brain, Zap, AlertTriangle, Target, ShieldCheck, Eye, ThumbsUp, BookOpen, MessageSquare, Users } from "lucide-react";

interface Props { data: any; }

// ── Circular Arc Gauge ────────────────────────────────────────────────────────
const ArcGauge = ({ score, label, color }: { score: number; label: string; color: string }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={s.gaugeWrap}>
      <div style={s.gaugeSvgWrap}>
        <svg width="72" height="72" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#e8f0fe" strokeWidth="5" />
          <circle
            cx="32" cy="32" r={r} fill="none"
            stroke={color} strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${circ}`}
            strokeDashoffset={`${offset}`}
            transform="rotate(-90 32 32)"
          />
        </svg>
        <span style={{ ...s.gaugeScore, color }}>{score}</span>
      </div>
      <span style={s.gaugeLabel}>{label}</span>
    </div>
  );
};

// ── Bullet list with colored dot ──────────────────────────────────────────────
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

// ── Pill chip ─────────────────────────────────────────────────────────────────
const Pill = ({ text }: { text: string }) => (
  <div style={s.pill}>{text}</div>
);

// ── Section card wrapper ──────────────────────────────────────────────────────
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ ...s.card, ...style }}>{children}</div>
);

// ── Section header ────────────────────────────────────────────────────────────
const SectionHead = ({
  icon, label, color
}: { icon: React.ReactNode; label: string; color: string }) => (
  <div style={s.secHead}>
    <span style={{ ...s.secIcon, color }}>{icon}</span>
    <span style={{ ...s.secTitle, color }}>{label}</span>
  </div>
);

const TRAITS = [
  { key: "dominance", label: "Dominance", color: "#ef4444" },
  { key: "expressiveness", label: "Expression", color: "#8b5cf6" },
  { key: "pace", label: "Pace", color: "#6366f1" },
  { key: "pragmatism", label: "Pragmatic", color: "#10b981" },
  { key: "risk_appetite", label: "Risk", color: "#f59e0b" },
  { key: "social_energy", label: "Social", color: "#06b6d4" },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function PersonalityTab({ data }: Props) {
  if (!data || Object.keys(data).length === 0)
    return <div style={s.empty}>Personality data unavailable for this profile.</div>;

  const profile = data.behavioral_profile || {};
  const scores = data.trait_scores || {};
  const drives = data.what_drives_them || {};
  const tactics = data.dos_and_donts || {};
  const working = data.working_style || {};
  const guide = data.engagement_guide || {};
  const blinds = data.blind_spots || [];
  const workingEntries = Object.entries(working);

  const guideBlocks = [
    { label: "How to Open", items: guide.how_to_open, icon: <MessageSquare size={14} />, color: "#0ea5e9" },
    { label: "How to Email", items: guide.how_to_email, icon: <BookOpen size={14} />, color: "#8b5cf6" },
    { label: "Run a Meeting", items: guide.how_to_run_meeting, icon: <Users size={14} />, color: "#10b981" },
    { label: "Follow Up", items: guide.how_to_follow_up, icon: <Zap size={14} />, color: "#f59e0b" },
    { label: "Build Trust", items: guide.how_to_build_trust, icon: <ShieldCheck size={14} />, color: "#6366f1" },
  ].filter(b => b.items?.length > 0);

  return (
    <div style={s.root}>

      {/* ── Row 1: Archetype half-width ─────────────────────── */}
      <div style={s.twoCol}>

        {/* Archetype card */}
        <Card>
          <div style={s.archetypeAccentBar} />
          <div style={{ paddingTop: "4px" }}>
            <p style={s.archetypeEyebrow}>Behavioral Archetype</p>
            <p style={s.archetypeName}>{profile.archetype || "—"}</p>
            <p style={s.archetypeDesc}>{profile.one_line_description}</p>
            {profile.trait_tags?.length > 0 && (
              <div style={s.tagCloud}>
                {profile.trait_tags.map((t: string) => (
                  <span key={t} style={s.tag}>{t}</span>
                ))}
              </div>
            )}
          </div>
        </Card>

      </div>

      {/* ── Trait Matrix — full width single row ────────────── */}
      <Card>
        <SectionHead icon={<Brain size={15} />} label="Trait Matrix" color="#0ea5e9" />
        <div style={s.gaugeRow}>
          {TRAITS.map(({ key, label, color }) => (
            <ArcGauge key={key} score={scores[key] || 0} label={label} color={color} />
          ))}
        </div>
      </Card>

      {/* ── Row 2: Strengths + Motivations ─────────────────── */}
      <div style={s.twoCol}>

        <Card>
          <SectionHead icon={<ThumbsUp size={15} />} label="Strengths" color="#22c55e" />
          <BulletList items={drives.energizers || []} color="#22c55e" />
        </Card>

        <Card>
          <SectionHead icon={<Target size={15} />} label="Motivations" color="#0ea5e9" />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
            {(drives.energizers || []).slice(0, 5).map((m: string, i: number) => (
              <Pill key={i} text={m} />
            ))}
          </div>
        </Card>
      </div>

      {/* ── Row 3: Blind Spots + Energy Drainers ───────────── */}
      <div style={s.twoCol}>

        <Card>
          <SectionHead icon={<AlertTriangle size={15} />} label="Blind Spots" color="#f97316" />
          <BulletList items={blinds} color="#f97316" />
        </Card>

        <Card>
          <SectionHead icon={<Zap size={15} />} label="Energy Drainers" color="#ef4444" />
          <BulletList items={drives.drainers || []} color="#ef4444" />
        </Card>
      </div>

      {/* ── Row 4: Working Style ────────────────────────────── */}
      {workingEntries.length > 0 && (
        <Card>
          <SectionHead icon={<Target size={15} />} label="Working Style" color="#6366f1" />
          <div style={s.workingGrid}>
            {workingEntries.map(([k, v]) => (
              <div key={k} style={s.workingItem}>
                <span style={s.workingKey}>{k.replace(/_/g, " ")}</span>
                <span style={s.workingVal}>{v as string}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Row 5: Do's & Don'ts ─────────────────────────────── */}
      {(tactics.dos?.length > 0 || tactics.donts?.length > 0) && (
        <div style={s.twoCol}>
          {tactics.dos?.length > 0 && (
            <Card>
              <SectionHead icon={<ShieldCheck size={15} />} label="Do's" color="#22c55e" />
              <BulletList items={tactics.dos} color="#22c55e" />
            </Card>
          )}
          {tactics.donts?.length > 0 && (
            <Card>
              <SectionHead icon={<ShieldCheck size={15} />} label="Don'ts" color="#ef4444" />
              <BulletList items={tactics.donts} color="#ef4444" />
            </Card>
          )}
        </div>
      )}

      {/* ── Row 6: Engagement Guide ──────────────────────────── */}
      {guideBlocks.length > 0 && (
        <Card>
          <SectionHead icon={<MessageSquare size={15} />} label="Engagement Guide" color="#8b5cf6" />
          <div style={s.guideGrid}>
            {guideBlocks.map(({ label, items, icon, color }) => (
              <div key={label} style={s.guideBlock}>
                <div style={{ ...s.guideLabelRow, color }}>
                  {icon}
                  <span style={s.guideLabel}>{label}</span>
                </div>
                <ul style={s.bulletList}>
                  {items.map((tip: string, i: number) => (
                    <li key={i} style={s.bulletItem}>
                      <span style={{ ...s.dot, background: color }} />
                      <span style={s.bulletText}>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s: Record<string, any> = {
  root: {
    fontFamily: "'DM Sans', 'Geist', -apple-system, sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  empty: {
    padding: "48px 24px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "0.875rem",
  },

  // Layout
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
  secIcon: {
    display: "flex",
    alignItems: "center",
  },
  secTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
  },

  // Archetype
  archetypeAccentBar: {
    height: "3px",
    width: "40px",
    borderRadius: "2px",
    background: "linear-gradient(90deg, #38bdf8, #6366f1)",
    marginBottom: "14px",
  },
  archetypeEyebrow: {
    margin: "0 0 4px",
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#94a3b8",
  },
  archetypeName: {
    margin: "0 0 8px",
    fontSize: "1.25rem",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
  },
  archetypeDesc: {
    margin: "0 0 14px",
    fontSize: "0.83rem",
    color: "#64748b",
    lineHeight: 1.6,
  },
  tagCloud: { display: "flex", flexWrap: "wrap", gap: "6px" },
  tag: {
    fontSize: "0.73rem",
    fontWeight: 600,
    color: "#0369a1",
    background: "#f0f9ff",
    border: "1px solid #bae6fd",
    borderRadius: "5px",
    padding: "3px 9px",
  },

  // Gauge
  gaugeRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    paddingTop: "4px",
  },
  gaugeWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    flex: "1 1 80px",
  },
  gaugeSvgWrap: {
    position: "relative",
    width: "72px",
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  gaugeScore: {
    position: "absolute",
    fontSize: "0.95rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
  },
  gaugeLabel: {
    fontSize: "0.68rem",
    fontWeight: 700,
    color: "#64748b",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    textAlign: "center",
  },

  // Bullets
  bulletList: {
    margin: "4px 0 0",
    padding: 0,
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  bulletItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  dot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    flexShrink: 0,
    marginTop: "5px",
  },
  bulletText: {
    fontSize: "0.84rem",
    color: "#334155",
    lineHeight: 1.55,
  },

  // Motivations pill
  pill: {
    padding: "10px 14px",
    background: "#f8fbff",
    border: "1px solid #e0f0ff",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#0f172a",
    fontWeight: 500,
  },

  // Working style
  workingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "10px",
    marginTop: "4px",
  },
  workingItem: {
    background: "#f8fbff",
    border: "1px solid #e8f4fd",
    borderRadius: "8px",
    padding: "10px 14px",
  },
  workingKey: {
    display: "block",
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: "4px",
  },
  workingVal: {
    fontSize: "0.83rem",
    fontWeight: 600,
    color: "#0f172a",
    lineHeight: 1.45,
  },

  // Engagement guide
  guideGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginTop: "4px",
  },
  guideBlock: {
    background: "#f8fbff",
    border: "1px solid #e8f4fd",
    borderRadius: "10px",
    padding: "14px",
  },
  guideLabelRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "10px",
  },
  guideLabel: {
    fontSize: "0.78rem",
    fontWeight: 700,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
  },
};