import { THEME } from "../pptx/theme";
import { addSlideHeader, addPanel } from "../pptx/components";

export const createVerdictSlide = (ppt: any, data: any) => {
   if (!data.analyst_verdict) return;

   // Extract Sections
   const verdictMatch = data.analyst_verdict.match(/\*\*Verdict:\*\*\s*(.*?)(?=\n|$)/i);
   const verdictText = verdictMatch ? verdictMatch[1].trim() : "REVIEW REQUIRED";
   const coreMatch = data.analyst_verdict.match(/\*\*Core Thesis:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
   const bullMatch = data.analyst_verdict.match(/\*\*Bull Case:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
   const bearMatch = data.analyst_verdict.match(/\*\*Bear Case:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);
   const recoMatch = data.analyst_verdict.match(/\*\*Engagement Recommendation:\*\*\s*([\s\S]*?)(?=\*\*|$)/i);

   let verdictColor = THEME.accentBlue;
   if (verdictText.toUpperCase().includes("BUY") || verdictText.toUpperCase().includes("HIGH CONVICTION")) {
      verdictColor = THEME.success;
   } else if (verdictText.toUpperCase().includes("SELL") || verdictText.toUpperCase().includes("RISK")) {
      verdictColor = THEME.danger;
   }

   // Slide 1: High Level Verdict
   const slide1 = ppt.addSlide();
   slide1.background = { color: THEME.bg };
   addSlideHeader(slide1, "Analyst Verdict", "Final strategic assessment and investment conviction");

   addPanel(slide1, { x: 0.5, y: 1.4, w: 12.3, h: 1.8, label: "Overall Conviction" });
   slide1.addText(verdictText.toUpperCase(), {
      x: 0.6, y: 2.0, w: 12.1, h: 0.8,
      color: verdictColor, fontSize: 48, bold: true, fontFace: THEME.font, align: "center", charSpacing: 3
   });

   if (coreMatch) {
      addPanel(slide1, { x: 0.5, y: 3.5, w: 12.3, h: 3.5, label: "Core Thesis" });
      slide1.addText(coreMatch[1].trim(), {
         x: 0.7, y: 4.1, w: 11.9, h: 2.7,
         color: THEME.textPrimary, fontSize: 16, bold: true, fontFace: THEME.font, valign: "top", lineSpacing: 24
      });
   }

   // Slide 2: Strategic Drivers
   const slide2 = ppt.addSlide();
   slide2.background = { color: THEME.bg };
   addSlideHeader(slide2, "Strategic Drivers", "Bull/Bear scenarios and engagement roadmap");

   // Bull Case Block
   addPanel(slide2, { x: 0.5, y: 1.2, w: 6.0, h: 3.0, label: "Bull Case", accent: THEME.success });
   if (bullMatch) {
      slide2.addText(bullMatch[1].trim(), {
         x: 0.7, y: 1.7, w: 5.6, h: 2.3,
         color: THEME.textPrimary, fontSize: 13, bold: true, fontFace: THEME.font, valign: "top", lineSpacing: 20
      });
   }

   // Bear Case Block
   addPanel(slide2, { x: 6.8, y: 1.2, w: 6.0, h: 3.0, label: "Bear Case", accent: THEME.danger });
   if (bearMatch) {
      slide2.addText(bearMatch[1].trim(), {
         x: 7.0, y: 1.7, w: 5.6, h: 2.3,
         color: THEME.textPrimary, fontSize: 13, bold: true, fontFace: THEME.font, valign: "top", lineSpacing: 20
      });
   }

   // Engagement Recommendation
   if (recoMatch) {
       addPanel(slide2, { x: 0.5, y: 4.4, w: 12.3, h: 2.6, label: "Engagement Recommendation" });
       slide2.addText(recoMatch[1].trim(), {
           x: 0.7, y: 4.9, w: 11.9, h: 1.9,
           color: THEME.textPrimary, fontSize: 14, bold: true, fontFace: THEME.font, valign: "top", lineSpacing: 22
       });
   }
};
