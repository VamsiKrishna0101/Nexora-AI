import { THEME } from "./theme";

// Clean, large slide header
export const addSlideHeader = (slide: any, title: string, subtitle?: string) => {
  // Left accent line - FULL HEIGHT NASA/Palantir style
  slide.addShape("rect", { x: 0, y: 0, w: 0.15, h: 7.5, fill: { color: THEME.accentBlue } });

  // Main title - MASSIVE and PURE WHITE
  slide.addText(title.toUpperCase(), {
    x: 0.4, y: 0.25, w: 12.0, h: 0.55, valign: "top",
    color: THEME.textPrimary, fontSize: 36, bold: true, fontFace: THEME.font, margin: 0, charSpacing: 1
  });

  if (subtitle) {
    slide.addText(subtitle.toUpperCase(), {
      x: 0.4, y: 0.85, w: 12.0, h: 0.25, valign: "top",
      color: THEME.accentBlue, fontSize: 12, fontFace: "Courier New", margin: 0, bold: true, charSpacing: 3
    });
  }
};

// Spacious Panel
export const addPanel = (slide: any, opts: any) => {
  // Card Background
  slide.addShape("rect", {
    x: opts.x, y: opts.y, w: opts.w, h: opts.h,
    fill: { color: THEME.bgCard },
    line: { color: THEME.borderBright, pt: 1 }
  });

  // Top Label bar - TACTICAL STYLE
  if (opts.label) {
    slide.addShape("rect", {
      x: opts.x, y: opts.y, w: opts.w, h: 0.35,
      fill: { color: THEME.borderBright }
    });
    slide.addText(opts.label.toUpperCase(), {
      x: opts.x + 0.1, y: opts.y, w: opts.w - 0.2, h: 0.35, valign: "middle", margin: 0,
      color: THEME.textPrimary, fontSize: 12, bold: true, fontFace: "Courier New", charSpacing: 2
    });
  }
};

// Large Stat for high-impact numbers
export const addLargeStat = (slide: any, opts: any) => {
  slide.addText((opts.label || "").toUpperCase(), {
    x: opts.x, y: opts.y, w: opts.w || 3,
    color: THEME.textMuted, fontSize: 10, bold: true, fontFace: THEME.font, margin: 0
  });
  slide.addText(opts.value || "—", {
    x: opts.x, y: opts.y + 0.3, w: opts.w || 3,
    color: opts.color || THEME.textPrimary,
    fontSize: opts.size || 36, bold: true, fontFace: THEME.font, margin: 0
  });
};

// Clean bullet point with better spacing
export const addBullet = (slide: any, text: string, x: number, y: number, w: number, color: string = THEME.accentBlue, size: number = 14) => {
  slide.addText(text, {
    x: x, y: y, w: w,
    color: THEME.textPrimary, fontSize: size, fontFace: THEME.font, lineSpacing: 20, margin: 0,
    bullet: { characterCode: '25A0', color: color }
  });
};

// Clean Progress Bar
export const addProgressBar = (slide: any, opts: any) => {
  const pct = Math.min(100, Math.max(0, opts.value || 0));
  const trackW = opts.w || 5;
  
  slide.addText((opts.label || "").toUpperCase(), {
    x: opts.x, y: opts.y, w: trackW,
    color: THEME.textSecondary, fontSize: 10, bold: true, fontFace: THEME.font, margin: 0
  });

  // Track
  slide.addShape("rect", {
    x: opts.x, y: opts.y + 0.3, w: trackW, h: 0.15,
    fill: { color: THEME.border }
  });

  // Fill
  if (pct > 0) {
    slide.addShape("rect", {
      x: opts.x, y: opts.y + 0.3, w: (pct / 100) * trackW, h: 0.15,
      fill: { color: opts.color || THEME.accentBlue }
    });
  }

  // Percentage Label
  slide.addText(`${pct}%`, {
    x: opts.x + trackW + 0.1, y: opts.y + 0.25, w: 0.6,
    color: opts.color || THEME.accentBlue, fontSize: 12, bold: true, fontFace: THEME.font, margin: 0
  });
};

// Section Divider Slide
export const addSectionSlide = (ppt: any, title: string, subtitle?: string) => {
  const slide = ppt.addSlide();
  slide.background = { color: THEME.bg };
  
  slide.addShape("rect", { x: 0, y: 3, w: 13.33, h: 1.5, fill: { color: THEME.bgCard } });
  slide.addShape("rect", { x: 0, y: 3, w: 13.33, h: 0.05, fill: { color: THEME.accentBlue } });
  slide.addShape("rect", { x: 0, y: 4.45, w: 13.33, h: 0.05, fill: { color: THEME.accentBlue } });

  slide.addText(title.toUpperCase(), {
    x: 0, y: 3.3, w: 13.33, align: "center",
    color: THEME.textPrimary, fontSize: 44, bold: true, fontFace: THEME.font, margin: 0
  });

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0, y: 4.0, w: 13.33, align: "center",
      color: THEME.accentBlue, fontSize: 14, fontFace: THEME.font, margin: 0, italic: true
    });
  }
};

// Clean Tag/Badge
export const addTag = (slide: any, opts: any) => {
  slide.addShape("rect", {
    x: opts.x, y: opts.y, w: opts.w || 1.2, h: 0.3,
    fill: { color: opts.bgColor || THEME.border },
    line: { color: opts.borderColor || THEME.accentBlue, pt: 1 }
  });
  slide.addText(opts.text.toUpperCase(), {
    x: opts.x, y: opts.y + 0.05, w: opts.w || 1.2, align: "center",
    color: THEME.textPrimary, fontSize: 8, bold: true, fontFace: THEME.fontMono
  });
};