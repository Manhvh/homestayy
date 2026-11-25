/**
 * Export tabular data to a UTF-8 CSV file with BOM so Microsoft Excel displays Vietnamese cleanly.
 */
const escapeCsvCell = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const downloadCsv = ({ filename, headers = [], rows = [] }) => {
  const lines = [];
  if (headers.length > 0) {
    lines.push(headers.map(escapeCsvCell).join(","));
  }
  for (const row of rows) {
    lines.push((Array.isArray(row) ? row : []).map(escapeCsvCell).join(","));
  }

  // UTF-8 BOM ensures Excel recognizes UTF-8 Vietnamese characters automatically
  const csvContent = "\uFEFF" + lines.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
