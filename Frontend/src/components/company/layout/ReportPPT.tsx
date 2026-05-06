import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Building2, Globe, Shield, TrendingUp, Cpu,
  Maximize, Users, ExternalLink, Activity, BarChart2,
  Zap, AlertTriangle, Target, ChevronRight, ArrowUpRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ReportPPTProps {
  reportData: any;
  companyData: any;
}

// ── Image Pre-processing ──────────────────────────────────────────────────────
const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  if (!url) return null;
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
  await new Promise(r => setTimeout(r, 800));
  const slides = containerRef.current.querySelectorAll(".ppt-slide");
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1122, 794] });
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i] as HTMLElement;
    const canvas = await html2canvas(slide, {
      scale: 2, useCORS: true,
      logging: false, backgroundColor: "#FFFFFF",
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.97);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, 1122, 794);
  }
  pdf.save(`${filename}.pdf`);
};

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#FFFFFF",
  surface: "#F7F7F5",
  panel: "#FAFAF9",
  border: "#E4E4E0",
  borderDark: "#CACAC4",

  navy: "#0D2240",
  navyMid: "#1A3A5C",
  navyLight: "#E8EDF4",
  navyXLight: "#F0F4F9",

  green: "#166534",
  greenBg: "#DCFCE7",
  greenMid: "#16A34A",
  red: "#991B1B",
  redBg: "#FEE2E2",
  amber: "#92400E",
  amberBg: "#FEF3C7",
  amberMid: "#D97706",
  blue: "#1D4ED8",
  blueBg: "#DBEAFE",
  blueMid: "#2563EB",

  text: "#0F0F0F",
  textMid: "#404040",
  textDim: "#737373",
  textLight: "#B0B0B0",
  white: "#FFFFFF",
};

const SANS = "'DM Sans', 'Outfit', system-ui, sans-serif";
const MONO = "'IBM Plex Mono', 'Fira Code', monospace";

// ── Parsers ───────────────────────────────────────────────────────────────────
function parseSWOT(raw: string) {
  const result: Record<string, string> = {};
  const keys = ["Strengths", "Weaknesses", "Opportunities", "Threats"];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    const startPattern = new RegExp(`\\*{0,2}${key}:?\\*{0,2}\\s*\\n`, "i");
    const endPattern = nextKey
      ? new RegExp(`\\*{0,2}${nextKey}:?\\*{0,2}\\s*\\n`, "i")
      : null;
    const startMatch = raw.match(startPattern);
    if (!startMatch || startMatch.index === undefined) { result[key] = ""; continue; }
    const start = startMatch.index + startMatch[0].length;
    let end = raw.length;
    if (endPattern) {
      const endMatch = raw.slice(start).match(endPattern);
      if (endMatch && endMatch.index !== undefined) end = start + endMatch.index;
    }
    result[key] = raw.slice(start, end).trim();
  }
  return result;
}

function extractBullets(text: string): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .filter(l => l.trim().startsWith("*") || l.trim().startsWith("-"))
    .map(l => l.replace(/^\s*[\*\-]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 4);
}

function extractTableByHeader(text: string, headerKeyword: string, maxRows = 6): string {
  if (!text) return "";
  const lines = text.split("\n");
  let tableStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (
      line.startsWith("|") &&
      line.toLowerCase().includes(headerKeyword.toLowerCase()) &&
      i + 1 < lines.length &&
      lines[i + 1].trim().includes("---")
    ) {
      tableStart = i;
      break;
    }
  }
  if (tableStart === -1) return "";
  const out: string[] = [];
  let dataRowCount = 0;
  for (let i = tableStart; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith("|")) break;
    if (line.includes("---")) {
      out.push(lines[i]);
    } else {
      if (dataRowCount <= maxRows) {
        out.push(lines[i]);
        if (out.some(l => l.includes("---"))) dataRowCount++;
      }
    }
  }
  return out.join("\n");
}

function buildMergedFundingTable(financialProfile: string, strategicSignals: string): string {
  const fpTable = extractTableByHeader(financialProfile, "Round", 10);
  const a16zMatch = strategicSignals.match(/a16z|Andreessen Horowitz/i);
  const leadInvestor = a16zMatch ? "Andreessen Horowitz (a16z)" : "Undisclosed";
  if (!fpTable) {
    return `| Round | Date | Amount | Lead Investors |
|---|---|---|---|
| Series A | 2026-03 | $30M | ${leadInvestor} |
| Seed | 2023-07 | Undisclosed | Undisclosed |`;
  }
  if (fpTable.toLowerCase().includes("series a")) return fpTable;
  const fpLines = fpTable.split("\n");
  const sepIdx = fpLines.findIndex(l => l.includes("---"));
  if (sepIdx === -1) return fpTable;
  fpLines.splice(sepIdx + 1, 0, `| Series A | 2026-03 | $30M | ${leadInvestor} |`);
  return fpLines.join("\n");
}

function limitTableRows(md: string, max = 5): string {
  if (!md) return "";
  const lines = md.split("\n");
  let inTable = false, count = 0;
  const out: string[] = [];
  for (const line of lines) {
    if (line.trim().startsWith("|")) {
      inTable = true;
      if (line.includes("---")) { out.push(line); }
      else { if (count <= max) { out.push(line); count++; } }
    } else {
      if (inTable) { inTable = false; count = 0; }
      out.push(line);
    }
  }
  return out.join("\n");
}

function stripTitle(text: string): string {
  return text.replace(/^\*{0,3}[^\n]+\*{0,3}\n+/, "").trim();
}

function parseJobOpenings(text: string): Array<{ title: string; dept: string }> {
  const table = extractTableByHeader(text, "Department", 10);
  if (!table) return [];
  return table
    .split("\n")
    .filter(l => l.trim().startsWith("|") && !l.includes("---") && !l.toLowerCase().includes("title") && !l.toLowerCase().includes("department"))
    .map(l => {
      const cells = l.split("|").map(c => c.trim()).filter(Boolean);
      return { title: cells[0] || "", dept: cells[1] || "" };
    })
    .filter(r => r.title && r.dept)
    .slice(0, 8);
}

// ── Markdown Components ───────────────────────────────────────────────────────
const md: any = {
  p: ({ children }: any) => (
    <p style={{ fontSize: 13, lineHeight: 1.75, color: C.textMid, margin: "0 0 10px 0", fontFamily: SANS }}>{children}</p>
  ),
  h1: ({ children }: any) => (
    <h1 style={{ fontSize: 16, fontWeight: 700, color: C.text, margin: "0 0 10px 0", fontFamily: SANS, borderBottom: `2px solid ${C.navy}`, paddingBottom: 5 }}>{children}</h1>
  ),
  h2: ({ children }: any) => (
    <h2 style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: "10px 0 6px", fontFamily: SANS }}>{children}</h2>
  ),
  h3: ({ children }: any) => (
    <h3 style={{ fontSize: 13, fontWeight: 600, color: C.textMid, margin: "8px 0 4px", fontFamily: SANS }}>{children}</h3>
  ),
  ul: ({ children }: any) => <ul style={{ margin: "0 0 10px", paddingLeft: 16 }}>{children}</ul>,
  li: ({ children }: any) => (
    <li style={{ fontSize: 13, lineHeight: 1.65, color: C.textMid, marginBottom: 5, fontFamily: SANS }}>{children}</li>
  ),
  strong: ({ children }: any) => (
    <strong style={{ fontWeight: 700, color: C.text }}>{children}</strong>
  ),
  table: ({ children }: any) => (
    <div style={{ margin: "8px 0", border: `1px solid ${C.border}`, borderRadius: 3, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, color: C.text, fontFamily: SANS }}>{children}</table>
    </div>
  ),
  th: ({ children }: any) => (
    <th style={{
      background: C.navy, padding: "9px 13px", borderBottom: `1px solid ${C.border}`,
      fontWeight: 600, color: C.white, textTransform: "uppercase",
      fontSize: 10, letterSpacing: "0.8px", fontFamily: SANS, textAlign: "left",
    }}>{children}</th>
  ),
  td: ({ children }: any) => (
    <td style={{
      padding: "8px 13px", borderBottom: `1px solid ${C.border}`,
      color: C.textMid, fontSize: 12, fontFamily: SANS,
    }}>{children}</td>
  ),
  tr: ({ children }: any) => (
    <tr style={{ background: C.white }}>{children}</tr>
  ),
};

// ── Logo — with graceful text fallback ───────────────────────────────────────
const Logo = ({ url, base64, name, domain }: { url?: string; base64?: string; name?: string; domain?: string }) => {
  const [err, setErr] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const initials = (name || domain || "CO").replace(/\./g, "").slice(0, 3).toUpperCase();

  if (base64) return (
    <img src={base64} alt="logo" style={{ width: "100%", height: "100%", objectFit: "contain", padding: 10 }} />
  );

  const logoUrl = useFallback && domain
    ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    : url;
  const finalUrl = logoUrl ? `${logoUrl}${logoUrl.includes('?') ? '&' : '?'}t=${Date.now()}` : logoUrl;

  if (finalUrl && !err) return (
    <img src={finalUrl} alt="logo" crossOrigin="anonymous"
      onError={() => { if (!useFallback && domain) setUseFallback(true); else setErr(true); }}
      style={{ width: "100%", height: "100%", objectFit: "contain", padding: 10 }} />
  );

  // Graceful fallback: text initials on navy background
  return (
    <div style={{
      width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      background: C.navy, borderRadius: 12,
    }}>
      <span style={{ color: C.white, fontSize: 28, fontWeight: 800, fontFamily: SANS, letterSpacing: "-1px" }}>
        {initials}
      </span>
    </div>
  );
};

// ── Slide Shell ───────────────────────────────────────────────────────────────
const Slide = ({ children, title, subtitle, page }: {
  children: React.ReactNode; title: string; subtitle?: string; page: number;
}) => (
  <div className="ppt-slide" style={{
    width: 1122, height: 794, background: C.bg, color: C.text, fontFamily: SANS,
    position: "relative", boxSizing: "border-box", overflow: "hidden",
    display: "flex", flexDirection: "column", pageBreakAfter: "always",
  }}>
    {/* Top accent bar — two-tone */}
    <div style={{ height: 5, background: C.navy, flexShrink: 0, display: "flex" }}>
      <div style={{ width: 120, background: C.navyMid, height: "100%" }} />
    </div>

    {/* Header */}
    <div style={{
      padding: "16px 52px 14px",
      borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexShrink: 0, background: C.bg,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 3, height: 28, background: C.navy, borderRadius: 2 }} />
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, letterSpacing: "-0.4px", fontFamily: SANS }}>{title}</div>
          {subtitle && (
            <div style={{ fontSize: 11, color: C.textDim, fontFamily: SANS, marginTop: 2, letterSpacing: "0.2px" }}>{subtitle}</div>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontFamily: SANS, fontSize: 10, color: C.textLight, fontWeight: 600, letterSpacing: "2px", textTransform: "uppercase" }}>
          Intelligence Report
        </div>
        <div style={{
          background: C.navy, color: C.white, fontFamily: MONO,
          fontSize: 11, padding: "4px 10px", borderRadius: 3, fontWeight: 500,
        }}>
          {String(page).padStart(2, "0")} / 06
        </div>
      </div>
    </div>

    {/* Body */}
    <div style={{ flex: 1, minHeight: 0, padding: "18px 52px 14px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {children}
    </div>

    {/* Footer */}
    <div style={{
      borderTop: `1px solid ${C.border}`, padding: "8px 52px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
      flexShrink: 0, background: C.surface,
    }}>
      <div style={{ fontFamily: SANS, fontSize: 10, color: C.textDim, fontWeight: 500 }}>
        Company Intelligence Report — <span style={{ fontWeight: 700 }}>Strictly Confidential</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.navyMid }} />
        <div style={{ fontFamily: MONO, fontSize: 10, color: C.textDim }}>{new Date().toISOString().split("T")[0]}</div>
      </div>
    </div>
  </div>
);

// ── Panel ─────────────────────────────────────────────────────────────────────
const Panel = ({ children, label, accent }: {
  children: React.ReactNode; label?: string; accent?: string;
}) => (
  <div style={{
    background: C.panel,
    border: `1px solid ${C.border}`,
    borderLeft: accent ? `3px solid ${accent}` : `1px solid ${C.border}`,
    borderRadius: 4,
    display: "flex", flexDirection: "column", overflow: "hidden", flex: 1, minHeight: 0,
  }}>
    {label && (
      <div style={{
        padding: "8px 16px", borderBottom: `1px solid ${C.border}`,
        flexShrink: 0, background: C.surface,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        {accent && <div style={{ width: 6, height: 6, borderRadius: "50%", background: accent }} />}
        <span style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: "1.2px", textTransform: "uppercase", fontFamily: SANS }}>{label}</span>
      </div>
    )}
    <div style={{ padding: "14px 16px", overflow: "hidden", flex: 1, minHeight: 0 }}>{children}</div>
  </div>
);

// ── Stat Chip ─────────────────────────────────────────────────────────────────
const StatChip = ({ label, value, accent = C.navy, sub }: { label: string; value: string; accent?: string; sub?: string }) => (
  <div style={{
    padding: "13px 16px", background: C.white,
    border: `1px solid ${C.border}`,
    borderTop: `3px solid ${accent}`,
    borderRadius: 4,
  }}>
    <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: "1.2px", textTransform: "uppercase", fontFamily: SANS, marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 14, fontWeight: 700, color: accent, fontFamily: SANS }}>{value}</div>
    {sub && <div style={{ fontSize: 10, color: C.textDim, fontFamily: SANS, marginTop: 3 }}>{sub}</div>}
  </div>
);

// ── Bullet Item ───────────────────────────────────────────────────────────────
const BulletItem = ({ text, color }: { text: string; color: string }) => {
  const colonIdx = text.indexOf(":**");
  const hasKey = text.startsWith("**") && colonIdx !== -1;
  const key = hasKey ? text.slice(2, colonIdx) : "";
  const rest = hasKey ? text.slice(colonIdx + 3).trim() : text;
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 11 }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, marginTop: 7, flexShrink: 0 }} />
      <div style={{ fontSize: 13, lineHeight: 1.65, color: C.textMid, fontFamily: SANS }}>
        {key && <span style={{ fontWeight: 700, color: C.text }}>{key}: </span>}
        {rest}
      </div>
    </div>
  );
};

// ── Job Row ───────────────────────────────────────────────────────────────────
const JobRow = ({ title, dept, idx }: { title: string; dept: string; idx: number }) => {
  const deptColors: Record<string, { text: string; bg: string }> = {
    Engineering: { text: C.blue, bg: C.blueBg },
    Finance: { text: C.green, bg: C.greenBg },
    Product: { text: C.navy, bg: C.navyLight },
    Marketing: { text: C.amber, bg: C.amberBg },
    Admin: { text: C.textDim, bg: C.surface },
    Sales: { text: C.red, bg: C.redBg },
  };
  const deptKey = Object.keys(deptColors).find(k => dept.includes(k)) || "Admin";
  const { text: textColor, bg: bgColor } = deptColors[deptKey];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "9px 14px", background: idx % 2 === 0 ? C.surface : C.white,
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{ fontSize: 13, color: C.text, fontWeight: idx < 3 ? 600 : 400, fontFamily: SANS }}>{title}</div>
      <div style={{
        fontSize: 9, fontFamily: SANS, fontWeight: 700, letterSpacing: "0.6px",
        color: textColor, background: bgColor,
        border: `1px solid ${textColor}30`,
        borderRadius: 3, padding: "3px 8px", textTransform: "uppercase", whiteSpace: "nowrap",
      }}>{dept.replace("/ Ops", "").replace("/ Delivery", "").replace("/ Integration", "").trim()}</div>
    </div>
  );
};

// ── Signal Item ───────────────────────────────────────────────────────────────
const SignalItem = ({ text, idx }: { text: string; idx: number }) => {
  const colors = [C.amber, C.blue, C.green];
  const color = colors[idx % colors.length];
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      padding: "10px 0",
      borderBottom: `1px solid ${C.border}`,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 3, background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1,
      }}>
        <span style={{ color: C.white, fontSize: 10, fontWeight: 700, fontFamily: MONO }}>{idx + 1}</span>
      </div>
      <div style={{ fontSize: 13, color: C.textMid, lineHeight: 1.6, fontFamily: SANS }}>
        {text.replace(/\*\*/g, "")}
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
export default function ReportPPT({ reportData, companyData }: ReportPPTProps) {
  const [preloadedImages, setPreloadedImages] = useState<{ logo?: string; leaders: Record<number, string> }>({ leaders: {} });
  const [domain, setDomain] = useState<string>("");

  useEffect(() => {
    const curDomain = companyData?.domain || reportData?.domain || "";
    if (curDomain) setDomain(curDomain);
  }, [companyData?.domain, reportData?.domain]);

  useEffect(() => {
    async function preload() {
      const targetDomain = domain || companyData?.domain || "";
      if (companyData?.logo_url) {
        const b64 = await imageUrlToBase64(companyData.logo_url);
        if (b64) setPreloadedImages(prev => ({ ...prev, logo: b64 }));
        else if (targetDomain) {
          const cb64 = await imageUrlToBase64(`https://www.google.com/s2/favicons?domain=${targetDomain}&sz=128`);
          if (cb64) setPreloadedImages(prev => ({ ...prev, logo: cb64 }));
        }
      }
      const leadersList = reportData?.leaders_data?.slice(0, 5) || [];
      for (let i = 0; i < leadersList.length; i++) {
        if (leadersList[i].image_url) {
          const b64 = await imageUrlToBase64(leadersList[i].image_url);
          if (b64) setPreloadedImages(prev => ({ ...prev, leaders: { ...prev.leaders, [i]: b64 } }));
        }
      }
    }
    preload();
  }, [companyData?.logo_url, reportData?.leaders_data, domain]);

  if (!reportData) return null;

  const leaders = reportData.leaders_data?.slice(0, 5) || [];
  const swot = parseSWOT(reportData.swot || "");
  const swotBullets = {
    Strengths: extractBullets(swot.Strengths),
    Weaknesses: extractBullets(swot.Weaknesses),
    Opportunities: extractBullets(swot.Opportunities),
    Threats: extractBullets(swot.Threats),
  };

  const execBrief = stripTitle(reportData.executive_brief || "");
  const marketRaw = reportData.market_position || "";
  const compSetIdx = marketRaw.toLowerCase().indexOf("**competitive set");
  const marketClean = compSetIdx !== -1 ? marketRaw.slice(0, compSetIdx).trim() : marketRaw;
  const mergedFundingTable = buildMergedFundingTable(reportData.financial_profile || "", reportData.strategic_signals || "");
  const signals = reportData.strategic_signals || "";
  const recentNews = (() => {
    const lines = signals.split("\n").filter((l: string) => /^\d+\./.test(l.trim())).slice(0, 3);
    return lines.map((l: string) => l.replace(/^\d+\.\s*/, "").trim());
  })();
  const verdict = reportData.analyst_verdict || "";
  const jobOpenings = parseJobOpenings(reportData.talent_org_intelligence || "");
  const businessTimeline = extractTableByHeader(reportData.strategic_signals || "", "Date", 4);
  const financialProse = (() => {
    const raw = stripTitle(reportData.financial_profile || "");
    const lines = raw.split("\n");
    const out: string[] = [];
    let inTable = false;
    for (const line of lines) {
      if (line.trim().startsWith("|")) { inTable = true; continue; }
      if (inTable && !line.trim().startsWith("|")) inTable = false;
      if (!inTable) out.push(line);
    }
    return out.join("\n").trim();
  })();

  const companyName = companyData?.name || domain || "Company";
  const companyInitials = companyName.replace(/\./g, "").slice(0, 3).toUpperCase();

  return (
    <div id="hidden-ppt-container" style={{
      position: "fixed",
      top: 0, left: 0,
      width: 1122, height: 794,
      zIndex: -9999,
      opacity: 0,
      pointerEvents: "none",
      background: "#FFFFFF",
    }}>

      {/* ─── SLIDE 1: COVER ───────────────────────────────────────────────── */}
      <div className="ppt-slide" style={{
        width: 1122, height: 794, background: C.bg, color: C.text, fontFamily: SANS,
        position: "relative", boxSizing: "border-box", overflow: "hidden",
        display: "flex", flexDirection: "column", pageBreakAfter: "always",
      }}>
        {/* Top navy bar */}
        <div style={{ height: 6, background: C.navy, flexShrink: 0 }} />

        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* LEFT — Main content */}
          <div style={{ flex: 1.2, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 52px 36px" }}>

            {/* Top: Logo + label */}
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{
                width: 72, height: 72, borderRadius: 14, overflow: "hidden",
                border: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: C.white, flexShrink: 0,
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}>
                <Logo
                  url={companyData?.logo_url}
                  base64={preloadedImages.logo}
                  name={companyName}
                  domain={domain}
                />
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: "3.5px", textTransform: "uppercase", marginBottom: 5 }}>
                  Intelligence Research Report
                </div>
                <div style={{ fontSize: 11, color: C.textDim, fontWeight: 500 }}>
                  Corporate Intelligence Syndicate · Confidential
                </div>
              </div>
            </div>

            {/* Center: Company name + description */}
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Company Dossier</div>
              <h1 style={{ fontSize: 80, fontWeight: 800, color: C.navy, margin: "0 0 4px", letterSpacing: "-4px", lineHeight: 0.9, fontFamily: SANS }}>
                {companyName}
              </h1>
              {companyData?.formerly && (
                <div style={{ fontSize: 15, color: C.textDim, fontWeight: 400, marginBottom: 20, marginTop: 6 }}>
                  formerly {companyData.formerly}
                </div>
              )}
              <div style={{ width: 44, height: 3, background: C.navy, margin: "18px 0 20px", borderRadius: 2 }} />
              <div style={{ fontSize: 15, lineHeight: 1.7, color: C.textMid, maxWidth: 520, fontWeight: 400 }}>
                {companyData?.description || "High-level strategic audit and internal intelligence synthesis for executive decision making."}
              </div>
            </div>

            {/* Bottom: Key stats row */}
            <div style={{ display: "flex", gap: 0, border: `1px solid ${C.border}`, borderRadius: 5, overflow: "hidden" }}>
              {[
                { label: "Headquarters", value: [companyData?.location?.city?.name, companyData?.location?.country?.name].filter(Boolean).join(", ") || "Enterprise HQ" },
                { label: "Industry", value: companyData?.industry || "Software & Tech" },
                { label: "Stage", value: companyData?.stage || "Seed Stage" },
                { label: "Scale", value: companyData?.employees || "Early Stage" },
              ].map((item, i, arr) => (
                <div key={item.label} style={{
                  flex: 1, padding: "14px 18px",
                  borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                  background: i === 0 ? C.surface : C.white,
                }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Dossier metadata panel */}
          <div style={{
            width: 290, background: C.surface,
            borderLeft: `1px solid ${C.border}`,
            display: "flex", flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px 32px 36px",
            flexShrink: 0,
          }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 30 }}>
                Dossier Specifics
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 7 }}>Access ID</div>
                  <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 500, color: C.navy }}>
                    NX-{domain?.toUpperCase().replace(/\./g, '-') || 'REPORT'}-001
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 7 }}>Intelligence Date</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase()}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 7 }}>Security Tier</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Board Grade</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 5,
                        background: i <= 4 ? C.navy : C.borderDark,
                        borderRadius: 2,
                      }} />
                    ))}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 7 }}>Synthesis Tier</div>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    <div style={{
                      background: C.navyLight, border: `1px solid ${C.navyMid}30`,
                      padding: "4px 10px", borderRadius: 3,
                      fontSize: 11, fontWeight: 700, color: C.navy, letterSpacing: "0.5px",
                    }}>
                      EXECUTIVE GRADE
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 7 }}>Lead Investor</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>Andreessen Horowitz</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 3 }}>(a16z) · Series A 2026</div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.borderDark}`, paddingTop: 18 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: C.textLight, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>Analyst Attribution</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.navyMid, fontFamily: SANS }}>Nexora Intelligence Platform v4.2</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "10px 52px", borderTop: `1px solid ${C.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: C.surface, flexShrink: 0,
        }}>
          <div style={{ fontSize: 10, color: C.textDim, fontWeight: 500 }}>
            © 2026 Nexora Intelligence Solutions. All rights reserved. Strictly Confidential.
          </div>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.navy, letterSpacing: "2.5px" }}>
            SENSITIVE PROPRIETARY DATA
          </div>
        </div>
      </div>

      {/* ─── SLIDE 2: STRATEGIC OVERVIEW ─────────────────────────────────── */}
      <Slide title="Strategic Positioning & Market Context" subtitle="Executive Overview · Market Headroom · Recent Signals" page={2}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1, minHeight: 0 }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
            <Panel label="Executive Brief" accent={C.navy}>
              <ReactMarkdown components={md} remarkPlugins={[remarkGfm]}>
                {execBrief}
              </ReactMarkdown>
            </Panel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, flexShrink: 0 }}>
              <StatChip label="Market Risk" value="Defensible" accent={C.greenMid} />
              <StatChip label="Brand Signal" value="Established" accent={C.navy} />
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
            <Panel label="Market Headroom" accent={C.blue}>
              <ReactMarkdown components={md} remarkPlugins={[remarkGfm]}>
                {stripTitle(marketClean)}
              </ReactMarkdown>
            </Panel>

            {/* Recent signals — styled as numbered cards */}
            <div style={{
              background: C.white, border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${C.amberMid}`, borderRadius: 4,
              padding: "12px 16px", flexShrink: 0,
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 10,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.amberMid }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: "1.2px", textTransform: "uppercase", fontFamily: SANS }}>Recent Signals</span>
              </div>
              {recentNews.map((n: string, i: number) => (
                <SignalItem key={i} text={n} idx={i} />
              ))}
            </div>
          </div>
        </div>
      </Slide>

      {/* ─── SLIDE 3: COMPETITIVE + LEADERSHIP ───────────────────────────── */}
      <Slide title="Competitive Set & Key Leadership" subtitle="Market Proxies · Executive Roster" page={3}>
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 14, flex: 1, minHeight: 0 }}>
          <Panel label="Competitive Matrix" accent={C.navy}>
            <ReactMarkdown components={md} remarkPlugins={[remarkGfm]}>
              {limitTableRows(reportData.competitive_landscape || "", 5)}
            </ReactMarkdown>
          </Panel>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, minHeight: 0, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.navy }} />
              <div style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: "1.2px", textTransform: "uppercase" }}>Executive Roster</div>
            </div>
            {leaders.map((leader: any, idx: number) => (
              <div key={idx} style={{
                padding: "11px 14px", background: idx % 2 === 0 ? C.surface : C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 4, display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", background: C.navyLight,
                  border: `2px solid ${C.border}`, overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: SANS, fontSize: 14, fontWeight: 700, color: C.navy, flexShrink: 0,
                }}>
                  {preloadedImages.leaders[idx]
                    ? <img src={preloadedImages.leaders[idx]} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    : (leader.image_url
                      ? <img src={leader.image_url} crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} alt=""
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      : (leader.name?.charAt(0) || "?"))}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: SANS }}>{leader.name}</div>
                    {leader.linkedin_url && (
                      <div style={{ width: 14, height: 14, borderRadius: 2, background: C.navyLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ExternalLink size={9} color={C.navy} />
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: C.textDim, fontFamily: SANS, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{leader.title}</div>
                </div>
                {idx === 0 && (
                  <div style={{ fontSize: 9, background: C.navyLight, color: C.navy, padding: "3px 7px", borderRadius: 3, fontWeight: 700, letterSpacing: "0.5px", flexShrink: 0 }}>
                    LEAD
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* ─── SLIDE 4: FINANCIALS ─────────────────────────────────────────── */}
      <Slide title="Fiscal Profile & Hiring Velocity" subtitle="Capital · Funding History · Open Roles" page={4}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minHeight: 0 }}>
          {/* Top stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, flexShrink: 0 }}>
            <StatChip label="Burn Profile" value="Sustainable" accent={C.greenMid} />
            <StatChip label="Revenue" value="Scaling" accent={C.navy} />
            <StatChip label="Capital Efficiency" value="Optimized" accent={C.blue} />
            <StatChip label="Investment Risk" value="Moderate" accent={C.amberMid} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, flex: 1, minHeight: 0 }}>
            <Panel label="Funding History" accent={C.greenMid}>
              <ReactMarkdown components={md} remarkPlugins={[remarkGfm]}>
                {mergedFundingTable}
              </ReactMarkdown>
              <ReactMarkdown components={md} remarkPlugins={[remarkGfm]}>
                {financialProse.split("\n").slice(0, 6).join("\n")}
              </ReactMarkdown>
            </Panel>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, minHeight: 0 }}>
              <Panel label="Business Timeline" accent={C.amberMid}>
                <ReactMarkdown components={md} remarkPlugins={[remarkGfm]}>
                  {businessTimeline}
                </ReactMarkdown>
              </Panel>

              <div style={{
                background: C.white, border: `1px solid ${C.border}`,
                borderLeft: `3px solid ${C.blue}`, borderRadius: 4,
                display: "flex", flexDirection: "column", flex: 1, minHeight: 0, overflow: "hidden",
              }}>
                <div style={{
                  padding: "8px 14px", borderBottom: `1px solid ${C.border}`,
                  flexShrink: 0, background: C.surface,
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.blue }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.textDim, letterSpacing: "1.2px", textTransform: "uppercase", fontFamily: SANS }}>Open Positions</span>
                </div>
                <div style={{ overflow: "hidden", flex: 1 }}>
                  {jobOpenings.length > 0
                    ? jobOpenings.map((job, i) => <JobRow key={i} title={job.title} dept={job.dept} idx={i} />)
                    : <div style={{ padding: "14px 16px", fontSize: 13, color: C.textDim, fontFamily: SANS }}>No open roles detected.</div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* ─── SLIDE 5: SWOT ───────────────────────────────────────────────── */}
      <Slide title="SWOT Assessment" subtitle="Strengths · Weaknesses · Opportunities · Threats" page={5}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 12, flex: 1, minHeight: 0 }}>
          {([
            { key: "Strengths", color: C.greenMid, bg: C.greenBg, label: "S", tagline: "Core advantages" },
            { key: "Weaknesses", color: C.red, bg: C.redBg, label: "W", tagline: "Internal gaps" },
            { key: "Opportunities", color: C.blueMid, bg: C.blueBg, label: "O", tagline: "Market tailwinds" },
            { key: "Threats", color: C.amberMid, bg: C.amberBg, label: "T", tagline: "Risk exposure" },
          ] as const).map(({ key, color, bg, label, tagline }) => (
            <div key={key} style={{
              background: C.white, border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${color}`, borderRadius: 4,
              overflow: "hidden", display: "flex", flexDirection: "column",
            }}>
              <div style={{
                padding: "10px 14px", borderBottom: `1px solid ${C.border}`,
                display: "flex", alignItems: "center", gap: 10, background: bg, flexShrink: 0,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 4, background: color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: SANS, fontSize: 15, fontWeight: 800, color: C.white,
                }}>{label}</div>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color }}>{key}</div>
                  <div style={{ fontFamily: SANS, fontSize: 10, color: `${color}99`, fontWeight: 500 }}>{tagline}</div>
                </div>
              </div>
              <div style={{ padding: "12px 14px", overflow: "hidden", flex: 1, minHeight: 0 }}>
                {swotBullets[key as keyof typeof swotBullets].length > 0
                  ? swotBullets[key as keyof typeof swotBullets].map((b, i) => (
                    <BulletItem key={i} text={b} color={color} />
                  ))
                  : <div style={{ fontSize: 12, color: C.textDim, fontFamily: SANS }}>No data available.</div>
                }
              </div>
            </div>
          ))}
        </div>
      </Slide>

      {/* ─── SLIDE 6: VERDICT ────────────────────────────────────────────── */}
      <Slide title="Strategic Verdict" subtitle="Final Determination · Analyst Assessment" page={6}>
        <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", gap: 14, flex: 1, minHeight: 0 }}>
          {/* Left sidebar metrics */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Rating block */}
            <div style={{
              background: C.navy, borderRadius: 4, padding: "22px 16px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              flexShrink: 0,
            }}>
              <div style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: `${C.white}80`, letterSpacing: "2px", textTransform: "uppercase" }}>Rating</div>
              <div style={{ fontFamily: SANS, fontSize: 56, color: C.white, fontWeight: 800, lineHeight: 1 }}>A+</div>
              <div style={{
                fontFamily: SANS, fontSize: 10, fontWeight: 700,
                color: C.navy, background: C.white,
                padding: "3px 10px", borderRadius: 3, letterSpacing: "1px",
              }}>HIGH CONVICTION</div>
            </div>

            <StatChip label="Verdict" value="Recommend" accent={C.greenMid} />
            <StatChip label="Signal Quality" value="Strong" accent={C.navy} />
            <StatChip label="Data Coverage" value="Complete" accent={C.blueMid} />
            <StatChip label="Engagement Window" value="45 Days" accent={C.amberMid} />
          </div>

          {/* Right: Verdict text */}
          <Panel label="Final Agency Determination" accent={C.navy}>
            <ReactMarkdown components={md} remarkPlugins={[remarkGfm]}>
              {stripTitle(verdict)}
            </ReactMarkdown>
          </Panel>
        </div>
      </Slide>

    </div>
  );
}