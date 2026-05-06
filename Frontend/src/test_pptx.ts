import pptxgen from 'pptxgenjs';

const THEME = {
  bg: "0A0F1E",
  bgCard: "141D2E",
  accentBlue: "00C8FF",
  textPrimary: "FFFFFF",
  borderBright: "2A3F66",
  font: "Calibri",
};

const ppt = new pptxgen();
const slide = ppt.addSlide();
slide.background = { color: THEME.bg };

try {
  slide.addShape("rect", { x: 0, y: 0, w: 0.12, h: 0.8, fill: { color: THEME.accentBlue } });
  console.log("Shape 'rect' works.");
} catch (e) {
  console.error("Shape 'rect' failed:", e);
}

try {
  slide.addText("TESTING TEXT", {
    x: 0.3, y: 0.2, w: 11.5,
    color: THEME.textPrimary, fontSize: 28, bold: true, fontFace: THEME.font, margin: 0
  });
  console.log("Text works.");
} catch (e) {
  console.error("Text failed:", e);
}

ppt.writeFile({ fileName: "test_slides.pptx" }).then(() => {
  console.log("Wrote test_slides.pptx successfully");
}).catch(e => {
  console.error("Failed to write pptx:", e);
});
