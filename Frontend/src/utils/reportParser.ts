/**
 * Utility to parse markdown tables and lists into structured data.
 */

export function parseMarkdownTable(markdown?: string): any[] {
  if (!markdown) return [];
  const lines = markdown.split("\n");
  const tableStartIndex = lines.findIndex(l => l.includes("|") && l.includes("-") && lines[lines.indexOf(l) - 1]?.includes("|"));
  
  if (tableStartIndex === -1) return [];

  const headers = lines[tableStartIndex - 1]
    .split("|")
    .map(h => h.trim())
    .filter(Boolean);

  const rows = lines.slice(tableStartIndex + 1);
  const result: any[] = [];

  for (const row of rows) {
    if (!row.includes("|")) break;
    const cells = row.split("|").map(c => c.trim()).filter(Boolean);
    if (cells.length === headers.length) {
      const rowObj: any = {};
      headers.forEach((h, i) => {
        rowObj[h.toLowerCase().replace(/ /g, "_")] = cells[i];
      });
      result.push(rowObj);
    }
  }

  return result;
}

export function parseMarkdownList(markdown?: string): string[] {
  if (!markdown) return [];
  return markdown
    .split("\n")
    .filter(line => line.trim().startsWith("*") || line.trim().startsWith("-"))
    .map(line => line.trim().substring(1).trim());
}

export function parseKeyValuePairs(markdown?: string): { k: string, v: string }[] {
  if (!markdown) return [];
  const pairs: { k: string, v: string }[] = [];
  const lines = markdown.split("\n");
  
  for (const line of lines) {
    if (line.includes("**") && line.includes(":")) {
      const match = line.match(/\*\*(.*?)\*\*:\s*(.*)/);
      if (match) {
        pairs.push({ k: match[1], v: match[2] });
      }
    } else if (line.includes("|")) {
        // Maybe it's a 2-col table acting as KV
        const cells = line.split("|").map(c => c.trim()).filter(Boolean);
        if (cells.length === 2 && !line.includes("---")) {
            pairs.push({ k: cells[0], v: cells[1] });
        }
    }
  }
  return pairs;
}

export function parseTimeline(markdown?: string): { date: string, text: string }[] {
    if (!markdown) return [];
    const items: { date: string, text: string }[] = [];
    const lines = markdown.split("\n");
    
    for (const line of lines) {
        // Look for "1. **Date**: Event" or "* **Date**: Event" or "Date: Event"
        const match = line.match(/(?:\d+\.|\*|-)?\s*\*\*?(.*?)\*\*?[:\-]\s*(.*)/);
        if (match) {
            items.push({ date: match[1], text: match[2] });
        }
    }
    return items;
}
