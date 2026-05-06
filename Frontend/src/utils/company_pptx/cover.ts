import { THEME } from "../pptx/theme";
import { addSlideHeader, addPanel } from "../pptx/components";
import { parseParagraphs } from "./markdown";

export const createCompanyCoverSlide = (ppt: any, data: any) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };

  // Decorative side bar (Clean and large) - FULL HEIGHT
  slide.addShape("rect", { x: 0, y: 0, w: 0.15, h: 7.5, fill: { color: THEME.accentBlue } });

  // Intelligence Report Label
  slide.addText("COMPANY INTELLIGENCE DOSSIER", {
    x: 0.4, y: 0.25, w: 6.0,
    color: THEME.accentBlue, fontSize: 14, bold: true, fontFace: THEME.font, charSpacing: 2
  });
  
  if (data.preloadedImages && data.preloadedImages['COMPANY_LOGO']) {
      const box = { x: 10.4, y: 0.7, w: 2.2, h: 2.2 };
      addPanel(slide, { ...box, label: "IDENT" });
      slide.addImage({
          data: data.preloadedImages['COMPANY_LOGO'],
          x: box.x + 0.2, y: box.y + 0.5, w: 1.8, h: 1.4, sizing: { type: "contain" }
      });
  }

  // Extract metadata if available
  let companyName = data.companyName || "Target Enterprise";
  let metaInfo = "Strategic Intelligence | Confidential";

  if (data.executive_brief) {
    const metaMatch = data.executive_brief.match(/\*(.*?)\*/);
    if (metaMatch) metaInfo = metaMatch[1];

    // Try to guess company name from the first bolded word if not provided
    if (!data.companyName) {
      const nameMatch = data.executive_brief.match(/\*\*([^\s]+)/);
      if (nameMatch) {
        companyName = nameMatch[1].replace('—', '').trim();
      }
    }
  }

  // Company Name - MASSIVE and PURE WHITE
  slide.addText(companyName.toUpperCase(), {
    x: 0.4, y: 1.8, w: 12.0,
    color: THEME.textPrimary, fontSize: 72, bold: true, fontFace: THEME.font, margin: 0
  });

  // Metadata / Subtitle
  slide.addText(metaInfo.toUpperCase(), {
    x: 0.4, y: 3.1, w: 12.0,
    color: THEME.accent, fontSize: 18, bold: true, fontFace: THEME.font, margin: 0, charSpacing: 1
  });

  // Divider
  slide.addShape("rect", { x: 0.4, y: 3.6, w: 12.0, h: 0.05, fill: { color: THEME.accentBlue } });

  // Brief Summary - Using a Panel style for the brief
  const paragraphs = parseParagraphs(data.executive_brief);
  if (paragraphs.length > 0) {
    slide.addText(paragraphs[0], {
      x: 0.4, y: 4.0, w: 9.0, h: 2.0,
      color: THEME.textSecondary, fontSize: 18, fontFace: THEME.font, valign: "top", lineSpacing: 28, italic: true
    });
  }

  // Footer / Stats
  const reportDate = new Date().toISOString().split("T")[0];
  const refId = `CMP-INTEL-${Math.floor(Math.random() * 10000)}`;

  slide.addText(`REPORT GENERATED: ${reportDate}`, {
    x: 0.4, y: 7.0, w: 4.0,
    color: THEME.textMuted, fontSize: 9, fontFace: THEME.font
  });
  slide.addText(`REF ID: ${refId}`, {
    x: 8.9, y: 7.0, w: 4.0, align: "right",
    color: THEME.textMuted, fontSize: 9, fontFace: THEME.font
  });
};
