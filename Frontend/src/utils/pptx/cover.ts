import { THEME } from "./theme";

export const createCoverSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };

  // Decorative side bar (Clean and large)
  slide.addShape("rect", { x: 0, y: 0, w: 0.25, h: 7.5, fill: { color: THEME.accentBlue } });

  // Intelligence Report Label
  slide.addText("NEXORA INTELLIGENCE REPORT", {
    x: 0.6, y: 0.5, w: 6.0,
    color: THEME.accentBlue, fontSize: 14, bold: true, fontFace: THEME.font, charSpacing: 2
  });

  // Photo (Larger)
  if (data.profile.profile_photo_url) {
    slide.addImage({
      path: `http://localhost:8000/api/proxy-image?url=${encodeURIComponent(data.profile.profile_photo_url)}`,
      x: 0.6, y: 1.2, w: 3.5, h: 3.5, rounding: true
    });
  }

  // Name - MASSIVE and PURE WHITE
  slide.addText(data.name.toUpperCase(), {
    x: 4.5, y: 1.8, w: 8.5,
    color: THEME.textPrimary, fontSize: 64, bold: true, fontFace: THEME.font, margin: 0
  });

  // Title & Company - Cleaned up
  slide.addText(`${data.role} | ${data.company}`, {
    x: 4.5, y: 2.8, w: 8.5,
    color: THEME.accent, fontSize: 24, bold: true, fontFace: THEME.font, margin: 0
  });

  // Divider
  slide.addShape("rect", { x: 4.5, y: 3.4, w: 8.0, h: 0.05, fill: { color: THEME.accentBlue } });

  // Key Stats Row (Clean boxes)
  const stats = [
    { label: "Influence", value: `${data.profile.influence_score || 80}/100` },
    { label: "LinkedIn", value: `${(data.profile.linkedin_followers / 1_000_000).toFixed(1)}M` },
    { label: "Twitter/X", value: `${(data.profile.twitter_followers / 1_000_000).toFixed(1)}M` },
  ];

  stats.forEach((s, i) => {
    const sx = 4.5 + i * 2.8;
    slide.addShape("rect", {
      x: sx, y: 4.0, w: 2.5, h: 1.1,
      fill: { color: THEME.bgCard }, line: { color: THEME.borderBright, pt: 1 }
    });
    // Label - Centered
    slide.addText(s.label.toUpperCase(), {
      x: sx, y: 4.1, w: 2.5, align: "center",
      color: THEME.textMuted, fontSize: 12, fontFace: THEME.font, bold: true, charSpacing: 1
    });
    // Value - Centered and Larger
    slide.addText(s.value, {
      x: sx, y: 4.4, w: 2.5, h: 0.6, align: "center", valign: "middle",
      color: THEME.textPrimary, fontSize: 32, bold: true, fontFace: THEME.font
    });
  });

  // Date and ID at the bottom (Subtle)
  slide.addText(`REPORT GENERATED: ${new Date().toISOString().split("T")[0]}`, {
    x: 0.6, y: 7.0, w: 4.0,
    color: THEME.textMuted, fontSize: 9, fontFace: THEME.font
  });
  slide.addText(`REF ID: ${data.profile.person_id || "NEXORA-INTEL-001"}`, {
    x: 9.0, y: 7.0, w: 4.0, align: "right",
    color: THEME.textMuted, fontSize: 9, fontFace: THEME.font
  });
};