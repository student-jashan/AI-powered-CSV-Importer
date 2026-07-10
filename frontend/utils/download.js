export const downloadJSON = (records) => {
  if (!records.length) return;

  const blob = new Blob(
    [JSON.stringify(records, null, 2)],
    { type: "application/json" }
  );

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "crm_records.json";
  a.click();

  window.URL.revokeObjectURL(url);
};

export const downloadCSV = (records) => {
  if (!records.length) return;

  const headers = Object.keys(records[0]);

  const csvRows = [];

  csvRows.push(headers.join(","));

  records.forEach((record) => {
    const values = headers.map((header) => {
      const value = record[header] ?? "";
      const escaped = String(value)
        .replace(/"/g, '""')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
      return `"${escaped}"`;
    });

    csvRows.push(values.join(","));
  });

  const csvContent = csvRows.join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "crm_records.csv";
  a.click();

  window.URL.revokeObjectURL(url);
};