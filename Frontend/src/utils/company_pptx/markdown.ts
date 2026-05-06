import { THEME } from "../pptx/theme";

export const parseMarkdownTable = (md: string) => {
  if (!md) return [];
  const lines = md.split('\n').filter(line => line.trim().startsWith('|'));
  if (lines.length === 0) return [];

  const tableData = lines.map((line, rowIndex) => {
    const cells = line.split('|').map(c => c.trim()).filter((_, i, arr) => i !== 0 && i !== arr.length - 1);

    if (cells.every(c => c.match(/^-+$/))) return null;

    const isHeader = rowIndex === 0;
    return cells.map(text => ({
      text,
      options: {
        bold: isHeader,
        color: isHeader ? THEME.textPrimary : THEME.textSecondary,
        fill: isHeader ? THEME.bgSurface : (rowIndex % 2 === 0 ? THEME.bgCard : THEME.bg),
        fontSize: 11,
        fontFace: THEME.font,
        valign: "middle",
        margin: [5, 5, 5, 5]
      }
    }));
  }).filter(Boolean);

  return tableData;
};

export const parseMarkdownList = (md: string) => {
  if (!md) return [];
  const lines = md.split('\n').filter(line => line.trim().startsWith('*') || line.trim().startsWith('-'));

  const textRuns: any[] = [];

  lines.forEach(line => {
    let cleanLine = line.replace(/^[\*\-\s]+/, '').trim();
    const parts = cleanLine.split(/(\*\*.*?\*\*)/g).filter(Boolean);

    parts.forEach((part, index) => {
      const isBold = part.startsWith('**') && part.endsWith('**');
      const text = part.replace(/\*\*/g, '');

      textRuns.push({
        text: text,
        options: {
          bold: isBold,
          color: isBold ? THEME.accentBlue : THEME.textSecondary,
          fontSize: 12,
          fontFace: THEME.font,
          bullet: index === 0 ? true : false,
          breakLine: index === parts.length - 1 ? true : false
        }
      });
    });
  });

  return textRuns;
};

export const parseParagraphs = (md: string) => {
  if (!md) return [];
  const textOnly = md.split('\n').filter(l => !l.startsWith('|') && !l.startsWith('#') && !l.trim().startsWith('*')).join('\n');
  const paragraphs = textOnly.split('\n\n').filter(p => p.trim() !== '');

  return paragraphs.map(p => {
    let clean = p.replace(/\*\*.*?\*\*/g, match => match.replace(/\*\*/g, '')).trim();
    return clean;
  });
};

export const parseRichTextParagraphs = (md: string) => {
  if (!md) return [];

  // Remove tables and headers, and ignore separators like ---
  const lines = md.split('\n')
    .filter(l => !l.startsWith('|') && !l.startsWith('#') && l.trim() !== '---')
    .join('\n');
    
  const paragraphs = lines.split('\n').filter(p => p.trim() !== '');

  const paragraphBlocks: any[][] = [];

  paragraphs.forEach((p) => {
    const trimmed = p.trim();
    // Improved list detection: must start with bullet char AND have content
    const isList = (trimmed.startsWith('- ') || trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed));
    let clean = trimmed;
    if (isList) {
        clean = trimmed.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '');
    }

    const parts = clean.split(/(\*\*.*?\*\*)/g).filter(Boolean);
    const runs: any[] = [];

    parts.forEach((part, index) => {
      const isBold = part.startsWith('**') && part.endsWith('**');
      const text = part.replace(/\*\*/g, '');

      runs.push({
        text: text,
        options: {
          bold: isBold,
          color: isBold ? THEME.accentBlue : THEME.textPrimary,
          fontSize: 12,
          fontFace: THEME.font,
          bullet: index === 0 && isList ? { characterCode: '25A0', color: THEME.accentBlue } : false,
          breakLine: index === parts.length - 1
        }
      });
    });
    
    if (runs.length > 0) paragraphBlocks.push(runs);
  });

  return paragraphBlocks;
};
