import { THEME } from "./theme";
import { addSlideHeader, addPanel, addBullet, addProgressBar } from "./components";

// 1. Tactical Outreach Openers
export const createOutreachOpenersSlide = (ppt: any, data: any) => {
  const starters = data.outreach.conversation_starters || [];
  const chunks = [];
  for (let i = 0; i < starters.length; i += 3) chunks.push(starters.slice(i, i + 3));
  if (chunks.length === 0) chunks.push([]);

  chunks.forEach((chunk: any[], pageIndex: number) => {
    const slide = ppt.addSlide();
    slide.background = { color: THEME.bg };
    const suffix = chunks.length > 1 ? ` (${pageIndex + 1}/${chunks.length})` : "";
    addSlideHeader(slide, `Tactical Engagement Openers${suffix}`, "High-resonance conversation starters for initial outreach");

    addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 5.8, label: "Engagement Starters" });
    chunk.forEach((item: any, i: number) => {
      const y = 1.8 + i * 1.8;
      
      // Opener - LARGE
      slide.addText(`"${item.opener || ""}"`, {
        x: 0.8, y: y, w: 11.5,
        color: THEME.textPrimary, fontSize: 18, bold: true, fontFace: THEME.font, italic: true, lineSpacing: 28
      });

      // Context
      slide.addText(`STRATEGY: ${(item.context || "").toUpperCase()}`, {
        x: 0.8, y: y + 1.0, w: 11.5,
        color: THEME.accentBlue, fontSize: 12, bold: true, fontFace: THEME.fontMono
      });

      if (i < chunk.length - 1) {
        slide.addShape("rect", { x: 0.8, y: y + 1.6, w: 11.5, h: 0.01, fill: { color: THEME.borderBright } });
      }
    });
  });
};

// 2. Strategic Email Outreach Script
export const createOutreachScriptSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "Strategic Outreach Script", "Data-backed email template for executive alignment");

  const script = data.outreach.outreach_scripts?.email_draft || {};

  addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 1.0, label: "Subject Line" });
  slide.addText(script.subject || "Strategic Alignment Opportunity", {
    x: 0.8, y: 1.6, w: 11.5, h: 0.5, valign: "top",
    color: THEME.accent, fontSize: 20, bold: true, fontFace: THEME.font
  });

  addPanel(slide, { x: 0.5, y: 2.5, w: 12.3, h: 4.5, label: "Message Body" });
  slide.addText(script.body || "No script available.", {
    x: 0.8, y: 3.0, w: 11.5, h: 3.8, valign: "top",
    color: THEME.textPrimary, fontSize: 14, fontFace: THEME.font, lineSpacing: 22
  });
};

// 3. Red Flags & Regulatory Assessment
export const createRiskSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "Risk & Regulatory Assessment", "Critical headwinds, data gaps, and organizational friction");

  const risk = data.risk.data || {};

  // Risk Rating
  addPanel(slide, { x: 0.5, y: 1.2, w: 6.0, h: 2.0, label: "Overall Risk Rating" });
  const riskColor = risk.overall_risk_rating === "High" ? THEME.accentRed : THEME.accent;
  slide.addText(risk.overall_risk_rating?.toUpperCase() || "MEDIUM", {
    x: 0.8, y: 1.8, w: 5.5,
    color: riskColor, fontSize: 44, bold: true, fontFace: THEME.font
  });

  // Risk Summary
  addPanel(slide, { x: 6.8, y: 1.2, w: 6.0, h: 2.0, label: "Risk Summary" });
  slide.addText(risk.risk_summary || "", {
    x: 7.0, y: 1.7, w: 5.6, h: 1.4, valign: "top",
    color: THEME.textPrimary, fontSize: 12, lineSpacing: 18, fontFace: THEME.font
  });

  // Reputation Signals
  addPanel(slide, { x: 0.5, y: 3.5, w: 12.3, h: 3.5, label: "Reputation & Legal Signals", accent: THEME.accentRed });
  const signals = [...(risk.reputation_signals || []), ...(risk.legal_or_regulatory_issues || []).map((l: string) => ({ signal: l }))];
  if (signals.length > 0) {
    const signalTexts = signals.slice(0, 4).map((s: any) => ({
      text: s.signal || s,
      options: { bullet: { characterCode: '25A0', color: THEME.accentRed } }
    }));
    slide.addText(signalTexts, {
      x: 0.7, y: 4.0, w: 11.8, h: 2.8,
      color: THEME.textPrimary, fontSize: 15, fontFace: THEME.font, lineSpacing: 26, margin: 0, valign: "top"
    });
  }
};

// 4. Comprehensive Analyst Verdict
export const createVerdictSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "AI Analyst Verdict", "Final strategic assessment and engagement rationale");

  const v = data.verdict.data || {};

  // One Line Verdict - MASSIVE
  addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 2.2, label: "Strategic Rationale" });
  slide.addText(v.one_line_verdict?.toUpperCase() || "", {
    x: 0.8, y: 1.7, w: 11.5, h: 1.5, valign: "top",
    color: THEME.textPrimary, fontSize: 24, bold: true, fontFace: THEME.font, lineSpacing: 34
  });

  // Strengths & Concerns
  addPanel(slide, { x: 0.5, y: 3.7, w: 6.0, h: 3.3, label: "Key Strengths", accent: THEME.accentGreen });
  const strengths = v.key_strengths || [];
  if (strengths.length > 0) {
    const sTexts = strengths.slice(0, 3).map((s: string) => ({
      text: s,
      options: { bullet: { characterCode: '25A0', color: THEME.accentGreen } }
    }));
    slide.addText(sTexts, {
      x: 0.7, y: 4.2, w: 5.6, h: 2.6,
      color: THEME.textPrimary, fontSize: 15, fontFace: THEME.font, lineSpacing: 26, margin: 0, valign: "top"
    });
  }

  addPanel(slide, { x: 6.8, y: 3.7, w: 6.0, h: 3.3, label: "Critical Concerns", accent: THEME.accentRed });
  const concerns = v.key_concerns || [];
  if (concerns.length > 0) {
    const cTexts = concerns.slice(0, 3).map((c: string) => ({
      text: c,
      options: { bullet: { characterCode: '25A0', color: THEME.accentRed } }
    }));
    slide.addText(cTexts, {
      x: 7.0, y: 4.2, w: 5.6, h: 2.6,
      color: THEME.textPrimary, fontSize: 15, fontFace: THEME.font, lineSpacing: 26, margin: 0, valign: "top"
    });
  }
};

// 5. Profile Strength Score Breakdown
export const createScoreSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "Profile Strength Analysis", "Quantified intelligence depth and signal strength scores");

  const v = data.verdict.data || {};
  const breakdown = v.profile_strength_breakdown || {};

  // Total Score
  addPanel(slide, { x: 0.5, y: 1.2, w: 4.0, h: 5.8, label: "Aggregate Strength" });
  slide.addText(`${v.profile_strength_score || 85}%`, {
    x: 0.5, y: 3.0, w: 4.0, align: "center",
    color: THEME.textPrimary, fontSize: 72, bold: true, fontFace: THEME.font
  });
  slide.addText("CONFIDENCE: HIGH", {
    x: 0.5, y: 4.5, w: 4.0, align: "center",
    color: THEME.accentGreen, fontSize: 14, bold: true, fontFace: THEME.fontMono
  });

  // Score Breakdown
  addPanel(slide, { x: 5.0, y: 1.2, w: 7.8, h: 5.8, label: "Strength Dimensions" });
  Object.entries(breakdown).forEach(([key, val]: [string, any], i) => {
    addProgressBar(slide, {
      x: 5.3, y: 1.7 + i * 0.85, w: 6.0,
      label: key.replace(/_/g, " "), value: (val / 20) * 100 // assuming 20 is max for each dimension
    });
  });
};