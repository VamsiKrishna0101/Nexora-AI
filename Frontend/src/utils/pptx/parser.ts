export const parseSection = (val: any): any => {
  if (val === null || val === undefined) return {};
  
  if (typeof val === "object" && !Array.isArray(val)) {
    if (val.data !== undefined) return val.data;
    if (val.raw && val.raw.data !== undefined) return val.raw.data;
    return val;
  }

  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      if (parsed && typeof parsed === "object") {
        if (parsed.data !== undefined) return parsed.data;
        if (parsed.raw && parsed.raw.data !== undefined) return parsed.raw.data;
        return parsed;
      }
    } catch (e) { }

    try {
      const fixed = val
        .replace(/:\s*None\b/g, ": null")
        .replace(/:\s*True\b/g, ": true")
        .replace(/:\s*False\b/g, ": false")
        .replace(/'/g, '"');
      const parsed = JSON.parse(fixed);
      if (parsed && typeof parsed === "object") {
        if (parsed.data !== undefined) return parsed.data;
        if (parsed.raw && parsed.raw.data !== undefined) return parsed.raw.data;
        return parsed;
      }
    } catch (e) { }

    try {
      const fixed = val
        .replace(/:\s*None\b/g, ": null")
        .replace(/:\s*True\b/g, ": true")
        .replace(/:\s*False\b/g, ": false");
      const result = new Function("return " + fixed)();
      if (result && typeof result === "object") {
        if (result.data !== undefined) return result.data;
        if (result.raw && result.raw.data !== undefined) return result.raw.data;
        return result;
      }
    } catch (e) { }
  }

  return {};
};

export const fmt = (n: any) => {
  if (!n) return "0";
  const num = typeof n === "string" ? parseInt(n, 10) : n;
  if (isNaN(num)) return String(n);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return String(num);
};