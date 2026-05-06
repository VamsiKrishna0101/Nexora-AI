import { THEME } from "../pptx/theme";
import { parseMarkdownTable, parseRichTextParagraphs } from "./markdown";
import { addSlideHeader, addPanel } from "../pptx/components";

export const createFinancialsSlide = (ppt: any, data: any) => {
  if (!data.financial_profile && !data.strategic_signals) return;

  // Slide 1: Financial Profile
  if (data.financial_profile) {
    const slide1 = ppt.addSlide();
    slide1.background = { color: THEME.bg };

    addSlideHeader(slide1, "Financial Profile", "Key financial metrics and fiscal health analysis");

    const tableData = parseMarkdownTable(data.financial_profile);
    if (tableData && tableData.length > 0) {
      slide1.addTable(tableData.slice(0, 8), {
        x: 0.5, y: 1.4, w: 12.3,
        border: { type: "solid", color: THEME.border, pt: 1 },
        fill: THEME.bgSurface,
        color: THEME.textPrimary,
        fontSize: 11,
        fontFace: THEME.font
      });
    }

    const rawText = data.financial_profile.replace(/\|.*\|/g, ''); 
    const paragraphBlocks = parseRichTextParagraphs(rawText);
    
    // Split commentary: fewer paragraphs per slide to avoid overflow
    const chunks = [];
    for (let i = 0; i < paragraphBlocks.length; i += 5) chunks.push(paragraphBlocks.slice(i, i + 5));
    
    chunks.forEach((chunk, idx) => {
        let currentSlide = slide1;
        let panelY = tableData.length > 0 ? 3.5 : 1.4;
        let panelH = tableData.length > 0 ? 3.5 : 5.6;

        if (idx > 0) {
            currentSlide = ppt.addSlide();
            currentSlide.background = { color: THEME.bg };
            addSlideHeader(currentSlide, "Financial Profile (Cont.)", "Additional fiscal health commentary and analysis");
            panelY = 1.4;
            panelH = 5.6;
        }

        addPanel(currentSlide, { x: 0.5, y: panelY, w: 12.3, h: panelH, label: "Fiscal Commentary" });
        
        const flatRuns = chunk.flat().map(run => ({
            ...run,
            options: { ...run.options, fontSize: 13 }
        }));

        currentSlide.addText(flatRuns as any, {
            x: 0.7, y: panelY + 0.5, w: 11.9, h: panelH - 0.7,
            valign: "top", lineSpacing: 20, fontFace: THEME.font
        });
    });
  }

  // Slide 2: Strategic Signals & Buying Triggers
  if (data.strategic_signals) {
    const rawText = data.strategic_signals.replace(/\|.*\|/g, ''); 
    const paragraphBlocks = parseRichTextParagraphs(rawText);
    const tableData = parseMarkdownTable(data.strategic_signals);

    // Split across slides: 4-5 paragraphs per slide if table is present
    const chunks = [];
    for (let i = 0; i < paragraphBlocks.length; i += 5) chunks.push(paragraphBlocks.slice(i, i + 5));

    chunks.forEach((chunk, idx) => {
        const slide = ppt.addSlide();
        slide.background = { color: THEME.bg };
        const suffix = chunks.length > 1 ? ` (${idx + 1}/${chunks.length})` : "";
        addSlideHeader(slide, `Strategic Signals${suffix}`, "Market triggers and forward-looking strategic indicators");

        let currentY = 1.4;
        let panelH = 5.6;
        
        if (idx === 0 && tableData && tableData.length > 0) {
            slide.addTable(tableData.slice(0, 6), {
                x: 0.5, y: 1.4, w: 12.3,
                border: { type: "solid", color: THEME.border, pt: 1 },
                fill: THEME.bgSurface,
                color: THEME.textPrimary,
                fontSize: 12,
                fontFace: THEME.font
            });
            currentY = 3.6;
            panelH = 3.4;
        }

        addPanel(slide, { x: 0.5, y: currentY, w: 12.3, h: panelH, label: "Strategic Outlook" });

        const flatRuns = chunk.flat().map(run => ({
            ...run,
            options: { ...run.options, fontSize: 13 }
        }));

        slide.addText(flatRuns as any, {
            x: 0.7, y: currentY + 0.5, w: 11.9, h: panelH - 0.7,
            valign: "top", lineSpacing: 20, fontFace: THEME.font
        });
    });
  }
};
