import { THEME } from "../pptx/theme";
import { parseMarkdownList } from "./markdown";
import { addSlideHeader, addPanel } from "../pptx/components";

export const createSwotSlide = (ppt: any, data: any) => {
  if (!data.swot) return;

  const rawSwot = data.swot + "\n**END**";

  const extractSection = (header: string) => {
    const regex = new RegExp(`\\*\\*${header}:?\\*\\*([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i');
    const match = rawSwot.match(regex);
    return match ? match[1].trim() : "";
  };

  const strengths = extractSection("Strengths");
  const weaknesses = extractSection("Weaknesses");
  const opportunities = extractSection("Opportunities");
  const threats = extractSection("Threats");

  const renderHalf = (title: string, leftTitle: string, leftData: string, rightTitle: string, rightData: string) => {
    const slide = ppt.addSlide();
    slide.background = { color: THEME.bg };

    addSlideHeader(slide, title, "Strategic internal and external factors analysis");

    const cols = [
      { title: leftTitle, data: leftData, x: 0.5, w: 6.0, color: title.includes("(1/2)") ? THEME.accentGreen : THEME.accentBlue },
      { title: rightTitle, data: rightData, x: 6.8, w: 6.0, color: title.includes("(1/2)") ? THEME.accentRed : THEME.accent },
    ];

    cols.forEach(q => {
      const bullets = parseMarkdownList(q.data);
      if (bullets && bullets.length > 0) {
        // Fix: parseMarkdownList returns an array of text run objects, not strings.
        const textObjects = bullets.map(b => ({
            ...b,
            options: { 
                ...b.options, 
                bullet: b.options.bullet ? { characterCode: '25A0', color: q.color } : false 
            }
        }));
        slide.addText(textObjects, {
          x: q.x + 0.2, y: 1.7, w: q.w - 0.4, h: 5.1,
          valign: "top", color: THEME.textPrimary, fontSize: 13, fontFace: THEME.font, lineSpacing: 22
        });
      } else {
        slide.addText("No data available.", {
          x: q.x + 0.2, y: 1.7, w: q.w - 0.4, h: 5.1,
          color: THEME.textMuted, fontSize: 12, fontFace: THEME.font, valign: "top"
        });
      }
    });
  };

  renderHalf("SWOT ANALYSIS (1/2)", "STRENGTHS", strengths, "WEAKNESSES", weaknesses);
  renderHalf("SWOT ANALYSIS (2/2)", "OPPORTUNITIES", opportunities, "THREATS", threats);
};
