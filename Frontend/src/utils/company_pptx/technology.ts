import { THEME } from "../pptx/theme";
import { parseMarkdownTable, parseRichTextParagraphs } from "./markdown";
import { addSlideHeader, addPanel } from "../pptx/components";

export const createTechnologySlide = (ppt: any, data: any) => {
  if (!data.technology_fingerprint) return;

  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  addSlideHeader(slide, "Technology Fingerprint", "Core infrastructure, stack composition and architectural signals");

  const tableData = parseMarkdownTable(data.technology_fingerprint);
  
  // Extract Sections using Regex for better reliability
  const archMatch = data.technology_fingerprint.match(/\*\*Architecture Signal:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
  const debtMatch = data.technology_fingerprint.match(/\*\*Technical Debt Indicator:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
  const hiringMatch = data.technology_fingerprint.match(/\*\*Hiring Signal:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

  // Stack Breakdown Table
  if (tableData.length > 0) {
    slide.addTable(tableData.slice(0, 8), {
        x: 0.5, y: 1.4, w: 6.0,
        border: { type: "solid", color: THEME.border, pt: 1 },
        fill: THEME.bgSurface,
        color: THEME.textPrimary,
        fontSize: 11,
        fontFace: THEME.font
    });
  }

  // Architecture Signal Panel
  addPanel(slide, { x: 6.8, y: 1.4, w: 6.0, h: 2.5, label: "Architecture Signal" });
  if (archMatch) {
    const archRuns = parseRichTextParagraphs(archMatch[1].trim()).flat();
    slide.addText(archRuns as any, {
      x: 7.0, y: 1.9, w: 5.6, h: 1.8,
      valign: "top", lineSpacing: 18, fontFace: THEME.font
    });
  }

  // Hiring & Strategy Panel
  addPanel(slide, { x: 6.8, y: 4.1, w: 6.0, h: 2.9, label: "Tech Strategy & Hiring" });
  let strategyText = "";
  if (debtMatch) strategyText += `**Technical Debt:** ${debtMatch[1].trim()}\n\n`;
  if (hiringMatch) strategyText += `**Hiring Signal:** ${hiringMatch[1].trim()}`;

  if (strategyText) {
    const strategyRuns = parseRichTextParagraphs(strategyText).flat();
    slide.addText(strategyRuns as any, {
      x: 7.0, y: 4.6, w: 5.6, h: 2.2,
      valign: "top", lineSpacing: 18, fontFace: THEME.font
    });
  }
};
