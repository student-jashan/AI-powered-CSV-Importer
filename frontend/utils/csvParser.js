export function parseCSVText(text) {
  const lines = [];
  let current = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        current.push(field.trim());
        field = "";
      } else if (char === "\n" || (char === "\r" && next === "\n")) {
        if (char === "\r") i++;
        current.push(field.trim());
        field = "";
        if (current.some((f) => f !== "")) {
          lines.push(current);
        }
        current = [];
      } else if (char === "\r") {
        current.push(field.trim());
        field = "";
        if (current.some((f) => f !== "")) {
          lines.push(current);
        }
        current = [];
      } else {
        field += char;
      }
    }
  }

  if (field || current.length > 0) {
    current.push(field.trim());
    if (current.some((f) => f !== "")) {
      lines.push(current);
    }
  }

  if (lines.length < 2) return { headers: [], rows: [] };

  const headers = lines[0];
  const rows = lines.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] || "";
    });
    return obj;
  });

  return { headers, rows };
}
