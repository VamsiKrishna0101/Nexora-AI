import { THEME } from "./theme";
import { addSlideHeader, addPanel, addBullet, addLargeStat } from "./components";

// 1. Notable Core Achievements
export const createAchievementsSlide = (ppt: any, data: any) => {
  const notable = data.achievements.notable_achievements || [];
  const chunks = [];
  for (let i = 0; i < notable.length; i += 3) chunks.push(notable.slice(i, i + 3));
  if (chunks.length === 0) chunks.push([]);

  chunks.forEach((chunk: any[], pageIndex: number) => {
    const slide = ppt.addSlide();
    slide.background = { color: THEME.bg };
    const suffix = chunks.length > 1 ? ` (${pageIndex + 1}/${chunks.length})` : "";
    addSlideHeader(slide, `Notable Core Achievements${suffix}`, "High-impact professional milestones and quantified results");

    addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 5.8, label: "Core Achievements" });
    chunk.forEach((item: any, i: number) => {
      const y = 1.8 + i * 1.8;
      
      slide.addText(item.achievement || "No achievement specified", {
        x: 0.8, y: y, w: 11.5,
        color: THEME.textPrimary, fontSize: 24, bold: true, fontFace: THEME.font
      });

      slide.addText(item.context || "", {
        x: 0.8, y: y + 0.45, w: 11.5,
        color: THEME.textSecondary, fontSize: 16, fontFace: THEME.font
      });

      if (item.quantified_impact) {
        slide.addShape("rect", {
          x: 0.8, y: y + 1.0, w: 3.5, h: 0.45,
          fill: { color: THEME.border }, line: { color: THEME.accentBlue, pt: 2 }
        });
        slide.addText(`IMPACT: ${item.quantified_impact.toUpperCase()}`, {
          x: 0.9, y: y + 1.05, w: 3.3,
          color: THEME.accentBlue, fontSize: 13, bold: true, fontFace: THEME.fontMono
        });
      }

      if (i < chunk.length - 1) {
        slide.addShape("rect", { x: 0.8, y: y + 1.6, w: 11.5, h: 0.01, fill: { color: THEME.borderBright } });
      }
    });
  });
};

// 2. Recognition & Awards
export const createAwardsSlide = (ppt: any, data: any) => {
  const awards = data.achievements.awards_and_recognition || [];
  const chunks = [];
  for (let i = 0; i < awards.length; i += 6) chunks.push(awards.slice(i, i + 6));
  if (chunks.length === 0) chunks.push([]);

  chunks.forEach((chunk: any[], pageIndex: number) => {
    const slide = ppt.addSlide();
    slide.background = { color: THEME.bg };
    const suffix = chunks.length > 1 ? ` (${pageIndex + 1}/${chunks.length})` : "";
    addSlideHeader(slide, `Awards & Industry Recognition${suffix}`, "Prestigious honors and global executive distinctions");

    addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 5.8, label: "Awards & Honors", accent: THEME.accent });
    chunk.forEach((item: any, i: number) => {
      const col = i < 3 ? 0 : 1;
      const row = i % 3;
      const x = 0.8 + col * 6.2;
      const y = 1.8 + row * 1.8;

      // Year Badge
      slide.addText(String(item.year || "N/A"), {
        shape: ppt.ShapeType.rect,
        fill: { color: THEME.border },
        line: { color: THEME.accent, pt: 1 },
        x: x, y: y, w: 1.6, h: 0.35,
        align: "center", valign: "middle", margin: 0,
        color: THEME.accent, fontSize: 13, bold: true, fontFace: THEME.fontMono
      });

      // Award Title
      slide.addText(item.award || "Unknown Award", {
        x: x, y: y + 0.55, w: 5.5,
        color: THEME.textPrimary, fontSize: 18, bold: true, fontFace: THEME.font
      });

      // Issuing Body
      slide.addText(item.issuing_body || "Unknown", {
        x: x, y: y + 0.95, w: 5.5,
        color: THEME.textSecondary, fontSize: 14, fontFace: THEME.font
      });
    });
  });
};

// 3. Domain Expertise Depth
export const createExpertiseSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "Strategic Domain Expertise", "Core competencies and verified technical mastery");

  const domains = data.skills.domain_expertise || [];

  addPanel(slide, { x: 0.5, y: 1.2, w: 12.3, h: 5.8, label: "Expertise Domains" });
  domains.slice(0, 4).forEach((item: any, i: number) => {
    const y = 1.8 + i * 1.35;
    
    // Depth Label
    const color = item.depth === "Expert" ? THEME.accentGreen : THEME.accent;
    slide.addText(item.depth?.toUpperCase() || "EXPERT", {
      x: 0.8, y: y, w: 2.0,
      color: color, fontSize: 12, bold: true, fontFace: THEME.fontMono
    });

    // Domain Title
    slide.addText(item.domain, {
      x: 2.8, y: y, w: 9.5,
      color: THEME.textPrimary, fontSize: 22, bold: true, fontFace: THEME.font
    });

    // Evidence
    slide.addText(item.evidence || "", {
      x: 2.8, y: y + 0.45, w: 9.5,
      color: THEME.textSecondary, fontSize: 14, fontFace: THEME.font, lineSpacing: 20
    });

    if (i < 3) {
      slide.addShape("rect", { x: 0.8, y: y + 1.2, w: 11.5, h: 0.01, fill: { color: THEME.borderBright } });
    }
  });
};

// 4. Technical Capabilities & Soft Skills
export const createSkillsSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "Technical & Strategic Skills", "Specialized technical focus and soft skill signals");

  // Technical Skills - GRID
  addPanel(slide, { x: 0.5, y: 1.2, w: 6.0, h: 5.8, label: "Technical Mastery" });
  const tech = data.skills.top_technical_skills || [];
  tech.slice(0, 8).forEach((item: any, i: number) => {
    const y = 1.8 + i * 0.65;
    addBullet(slide, item.skill, 0.8, y, 5.5, THEME.accentBlue, 15);
  });

  // Soft Skills
  addPanel(slide, { x: 6.8, y: 1.2, w: 6.0, h: 5.8, label: "Soft Skill Signals", accent: THEME.accent });
  const soft = data.skills.soft_skills_signals || [];
  soft.forEach((item: any, i: number) => {
    const y = 1.8 + i * 1.35;
    slide.addText(item.skill, {
      x: 7.0, y: y, w: 5.5,
      color: THEME.accent, fontSize: 18, bold: true, fontFace: THEME.font
    });
    slide.addText(item.justification || "", {
      x: 7.0, y: y + 0.4, w: 5.5,
      color: THEME.textSecondary, fontSize: 12, fontFace: THEME.font, lineSpacing: 16
    });
  });
};