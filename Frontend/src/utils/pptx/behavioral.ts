import { THEME } from "./theme";
import { addSlideHeader, addPanel, addProgressBar, addBullet, addSectionSlide } from "./components";

// 1. Executive Identity Profile
export const createIdentitySlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "Executive Identity Profile", "Core mission and high-level leadership footprint");

  // Summary Panel - LARGE TEXT
  addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 2.2, label: "Intelligence Summary" });
  slide.addText(data.profData.current_role_summary || "No summary available.", {
    x: 0.7, y: 1.7, w: 11.9, h: 1.6, valign: "top",
    color: THEME.textPrimary, fontSize: 18, lineSpacing: 28, fontFace: THEME.font, margin: 0
  });

  // Mission Bullets
  addPanel(slide, { x: 0.5, y: 3.7, w: 12.3, h: 3.3, label: "Core Leadership Mission" });
  const bullets = data.profData.role_summary_bullets || [];
  if (bullets.length > 0) {
    const textObjects = bullets.slice(0, 5).map((b: any) => ({
      text: b,
      options: { bullet: { characterCode: '25A0', color: THEME.accentBlue } }
    }));
    slide.addText(textObjects, {
      x: 0.7, y: 4.2, w: 11.8, h: 2.5,
      color: THEME.textPrimary, fontSize: 14, fontFace: THEME.font, lineSpacing: 24, margin: 0, valign: "top"
    });
  }
};

// 2. Professional Trajectory Timeline
export const createTrajectorySlide = (ppt: any, data: any) => {
  const timeline = data.profData.career_timeline || [];
  const chunks = [];
  for (let i = 0; i < timeline.length; i += 4) chunks.push(timeline.slice(i, i + 4));
  if (chunks.length === 0) chunks.push([]);

  chunks.forEach((chunk: any[], pageIndex: number) => {
    const slide = ppt.addSlide();
    slide.background = { color: THEME.bg };
    const suffix = chunks.length > 1 ? ` (${pageIndex + 1}/${chunks.length})` : "";
    addSlideHeader(slide, `Professional Trajectory${suffix}`, "Chronological career milestones and progression");

    addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 5.8, label: "Career Timeline" });
    chunk.forEach((item: any, i: number) => {
      const y = 1.7 + i * 1.3;
      
      slide.addText(`${item.start_date || ""} – ${item.end_date || ""}`, {
        x: 0.7, y: y, w: 2.0,
        color: THEME.accent, fontSize: 14, bold: true, fontFace: THEME.font
      });

      slide.addText(item.title || "Unknown Role", {
        x: 3.0, y: y, w: 9.0,
        color: THEME.textPrimary, fontSize: 18, bold: true, fontFace: THEME.font
      });
      slide.addText((item.company || "").toUpperCase(), {
        x: 3.0, y: y + 0.35, w: 9.0,
        color: THEME.accentBlue, fontSize: 13, bold: true, fontFace: THEME.font
      });

      if (item.one_line_impact) {
        slide.addText(item.one_line_impact, {
          x: 3.0, y: y + 0.65, w: 9.0,
          color: THEME.textSecondary, fontSize: 13, fontFace: THEME.font, italic: true
        });
      }
    });
  });

  // Dedicated Education Slide
  const education = data.profData.education_history || [];
  if (education.length > 0) {
    const slide = ppt.addSlide();
    slide.background = { color: THEME.bg };
    addSlideHeader(slide, "Academic Foundation", "Educational background and institutional degrees");
    addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 5.8, label: "Education History" });
    
    const eduTexts = education.map((item: any) => {
      const fieldStr = item.field_of_study && item.field_of_study !== 'N/A' ? ` in ${item.field_of_study}` : '';
      return {
        text: `${item.degree || 'Degree'}${fieldStr} - ${item.institution || 'Unknown'}`,
        options: { bullet: { characterCode: '25A0', color: THEME.accent } }
      };
    });
    slide.addText(eduTexts, {
      x: 0.7, y: 1.8, w: 11.8, h: 5.0,
      color: THEME.textPrimary, fontSize: 20, fontFace: THEME.font, lineSpacing: 34, margin: 0, valign: "top"
    });
  }
};

// 3. Behavioral Archetype & Personality
export const createPsychometricsSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "Behavioral Intelligence", "Psychometric traits and executive archetype analysis");

  // Archetype
  addPanel(slide, { x: 0.5, y: 1.2, w: 5.0, h: 2.5, label: "Lead Archetype" });
  slide.addText(data.personality.behavioral_profile?.archetype || "STRATEGIC LEADER", {
    x: 0.7, y: 1.7, w: 4.6,
    color: THEME.textPrimary, fontSize: 32, bold: true, fontFace: THEME.font
  });
  slide.addText(data.personality.behavioral_profile?.one_line_description || "", {
    x: 0.7, y: 2.5, w: 4.6,
    color: THEME.textSecondary, fontSize: 14, fontFace: THEME.font, italic: true, lineSpacing: 18
  });

  // Traits
  addPanel(slide, { x: 6.8, y: 1.2, w: 6.0, h: 5.8, label: "Vulnerability Drivers" });
  const risks = data.personality.potential_derailers || [];
  if (risks.length > 0) {
    const riskTexts = risks.map((r: any) => ({
      text: r.derailer,
      options: { bullet: { characterCode: '25A0', color: THEME.accentRed } }
    }));
    slide.addText(riskTexts, {
      x: 7.0, y: 1.8, w: 5.6, h: 5.0,
      color: THEME.textPrimary, fontSize: 15, fontFace: THEME.font, lineSpacing: 26, margin: 0, valign: "top"
    });
  }

  // Trait Scores - RADAR CHART
  addPanel(slide, { x: 0.5, y: 4.0, w: 6.0, h: 3.0, label: "Psychometric Score Analysis" });
  const traits = data.personality.trait_scores || {};
  const labels = Object.keys(traits).map(k => k.replace(/_/g, " ").toUpperCase());
  const values = Object.values(traits);

  if (labels.length > 0) {
    slide.addChart(ppt.ChartType.radar, [
      {
        name: "Psychometric Traits",
        labels: labels,
        values: values
      }
    ], {
      x: 0.6, y: 4.5, w: 5.8, h: 2.3,
      radarStyle: "standard",
      showLegend: false,
      showTitle: false,
      showValue: true,
      showLabel: true,
      catAxisLabelColor: THEME.textPrimary,
      catAxisLabelFontSize: 11,
      catAxisLabelFontFace: THEME.fontMono,
      dataLabelColor: THEME.textPrimary,
      dataLabelFontSize: 12,
      dataLabelFontFace: THEME.font,
      chartColors: [THEME.accentBlue],
      chartColorsOpacity: 50,
      lineDataSymbol: "circle",
      lineDataSymbolSize: 6
    });
  }
};

// 4. Strategic Drivers & Energizers
export const createDriversSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "High Resonance Drivers", "What energizes and motivates executive decision-making");

  const energizers = data.personality.what_drives_them?.energizers || [];
  
  addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 5.8, label: "Primary Energizers", accent: THEME.accentGreen });
  energizers.forEach((e: any, i: number) => {
    addBullet(slide, e, 1.0, 1.8 + i * 0.7, 11.3, THEME.accentGreen, 20);
  });
};

// 5. Friction Points & Engagement Guide
export const createFrictionSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "Friction Points & Outreach", "Tactical dos and don'ts for successful engagement");

  // Drainers
  addPanel(slide, { x: 0.5, y: 1.2, w: 6.0, h: 5.8, label: "Avoid These (Drainers)", accent: THEME.accentRed });
  const drainers = data.personality.what_drives_them?.drainers || [];
  drainers.forEach((d: any, i: number) => {
    addBullet(slide, d, 0.7, 1.8 + i * 0.7, 5.5, THEME.accentRed, 16);
  });

  // Dos & Donts
  addPanel(slide, { x: 6.8, y: 1.2, w: 6.0, h: 2.75, label: "Engagement Dos", accent: THEME.accentGreen });
  const dos = data.personality.dos_and_donts?.dos || [];
  dos.slice(0, 3).forEach((d: any, i: number) => {
    addBullet(slide, d, 7.0, 1.7 + i * 0.6, 5.5, THEME.accentGreen, 14);
  });

  addPanel(slide, { x: 6.8, y: 4.25, w: 6.0, h: 2.75, label: "Engagement Don'ts", accent: THEME.accentRed });
  const donts = data.personality.dos_and_donts?.donts || [];
  donts.slice(0, 3).forEach((d: any, i: number) => {
    addBullet(slide, d, 7.0, 4.75 + i * 0.6, 5.5, THEME.accentRed, 14);
  });
};