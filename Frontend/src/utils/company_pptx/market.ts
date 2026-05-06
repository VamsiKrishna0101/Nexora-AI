import { THEME } from "../pptx/theme";
import { parseMarkdownTable, parseParagraphs } from "./markdown";
import { addSlideHeader, addPanel } from "../pptx/components";

export const createMarketSlide = (ppt: any, data: any) => {
  if (!data.market_position && !data.competitive_landscape) return;

  // Slide 1: Market Positioning
  if (data.market_position) {
    const slide1 = ppt.addSlide();
    slide1.background = { color: THEME.bg };

    addSlideHeader(slide1, "Market Positioning", "Strategic industry placement and core value proposition");

    const marketText = parseParagraphs(data.market_position).join("\n\n");

    addPanel(slide1, { x: 0.5, y: 1.2, w: 12.3, h: 5.8, label: "Market Intelligence" });

    slide1.addText(marketText, {
      x: 0.8, y: 1.7, w: 11.9, h: 5.0,
      color: THEME.textSecondary, fontSize: 16, fontFace: THEME.font, valign: "top", lineSpacing: 26
    });
  }

  // Slide 2: Competitive Landscape
  let tableData = parseMarkdownTable(data.competitive_landscape || "");
  if (tableData.length === 0 && data.market_position) {
    tableData = parseMarkdownTable(data.market_position);
  }

  if (tableData && tableData.length > 0) {
    const slide2 = ppt.addSlide();
    slide2.background = { color: THEME.bg };

    addSlideHeader(slide2, "Competitive Landscape", "Comparative analysis of key industry rivals and market peers");

    slide2.addTable(tableData.slice(0, 10), {
      x: 0.5, y: 1.4, w: 12.3,
      border: { type: "solid", color: THEME.border, pt: 1 },
      fill: THEME.bgSurface,
      autoPage: false,
      color: THEME.textPrimary,
      fontSize: 12,
      fontFace: THEME.font,
      colW: [2.0, 2.0, 2.0, 2.0, 4.3],
      valign: "middle"
    });
  }
};
