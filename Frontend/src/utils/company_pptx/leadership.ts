import { THEME } from "../pptx/theme";
import { parseRichTextParagraphs, parseMarkdownTable } from "./markdown";
import { addSlideHeader, addPanel } from "../pptx/components";

export const createLeadershipSlide = (ppt: any, data: any) => {
  if (!data.leaders_data && !data.leadership_personas && !data.talent_org_intelligence) return;

  // Slide 1: Key Executives Gallery (The user likes this)
  if (data.leaders_data && Array.isArray(data.leaders_data)) {
    const slide2 = ppt.addSlide();
    slide2.background = { color: THEME.bg };
    addSlideHeader(slide2, "Key Executives", "Top leadership profiles and strategic stakeholders");

    const leaders = data.leaders_data.slice(0, 8); 
    leaders.forEach((leader, idx) => {
      const row = Math.floor(idx / 4);
      const col = idx % 4;
      const x = 0.5 + (col * 3.1); 
      const y = 1.4 + (row * 2.8);

      addPanel(slide2, { x, y, w: 2.8, h: 2.6 });

      const base64Img = data.preloadedImages ? data.preloadedImages[leader.name] : null;
      if (base64Img) {
        slide2.addImage({ data: base64Img, x: x + 0.9, y: y + 0.3, w: 1.0, h: 1.0, rounding: true });
      } else {
        slide2.addShape("rect", { x: x + 0.9, y: y + 0.3, w: 1.0, h: 1.0, fill: { color: THEME.border }, rounding: true });
      }

      slide2.addText(leader.name || "Unknown", {
        x: x + 0.1, y: y + 1.4, w: 2.6, h: 0.3,
        align: "center", color: THEME.textPrimary, fontSize: 14, bold: true, fontFace: THEME.font
      });

      slide2.addText(leader.title || "Executive", {
        x: x + 0.1, y: y + 1.7, w: 2.6, h: 0.6,
        align: "center", color: THEME.textMuted, fontSize: 10, fontFace: THEME.font, valign: "top", italic: true
      });
    });
  }

  // Slide 2+: Individual Persona Slides
  if (data.leadership_personas) {
    const personaBlocks = data.leadership_personas.split('---')
      .map((p: string) => p.trim())
      .filter((p: string) => {
          const lines = p.split('\n').filter(l => l.trim() !== '');
          // Must have a persona header (with —) AND at least 3 lines of actual content
          return lines.length >= 4 && p.includes('—') && !p.includes('Leadership Personas');
      });
    
    personaBlocks.forEach((block: string) => {
      const slide = ppt.addSlide();
      slide.background = { color: THEME.bg };
      
      // Extract Name and Title for header
      const headerLine = block.trim().split('\n')[0].replace(/\*\*/g, '');
      const [name, title] = headerLine.split('—').map(s => s.trim());
      
      addSlideHeader(slide, name || "Executive Persona", title || "Leadership Intelligence");

      // Left Panel: Photo and Quick Stats
      addPanel(slide, { x: 0.5, y: 1.2, w: 3.5, h: 5.8, label: "Profile" });
      
      const base64Img = data.preloadedImages ? data.preloadedImages[name] : null;
      if (base64Img) {
        slide.addImage({ data: base64Img, x: 1.25, y: 1.8, w: 2.0, h: 2.0, rounding: true });
      } else {
        slide.addShape("rect", { x: 1.25, y: 1.8, w: 2.0, h: 2.0, fill: { color: THEME.border }, rounding: true });
      }

      // Right Panel: Detailed Persona
      addPanel(slide, { x: 4.2, y: 1.2, w: 8.6, h: 5.8, label: "Persona Analysis" });
      
      const paragraphBlocks = parseRichTextParagraphs(block);
      // Remove the header line from the text runs
      const filteredBlocks = paragraphBlocks.filter(runs => !runs.some(r => r.text.includes(name || "___")));
      const flatRuns = filteredBlocks.flat().map(run => ({
          ...run,
          options: { ...run.options, fontSize: 13 }
      }));
      
      slide.addText(flatRuns as any, {
        x: 4.5, y: 1.7, w: 8.0, h: 5.0,
        valign: "top", lineSpacing: 22, fontFace: THEME.font
      });
    });
  }
};
