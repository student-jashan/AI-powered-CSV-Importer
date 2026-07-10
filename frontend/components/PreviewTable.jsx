export default function PreviewTable({ headers, rows }) {
  if (!headers || headers.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-100">
          CSV Preview
        </h3>
        <span className="text-sm text-gray-400">
          {rows.length} row(s) &middot; {headers.length} column(s)
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-700 shadow max-h-96 overflow-y-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900 text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">#</th>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="px-4 py-3 text-left whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr
                key={ri}
                className={`border-b border-gray-700 hover:bg-blue-900/20 transition ${
                  ri % 2 === 0 ? "bg-gray-800" : "bg-gray-700"
                }`}
              >
                <td className="px-4 py-3 font-semibold text-gray-400">
                  {ri + 1}
                </td>
                {headers.map((h, ci) => (
                  <td
                    key={ci}
                    className="px-4 py-3 whitespace-nowrap max-w-xs truncate"
                    title={row[h]}
                  >
                    {row[h] || "--"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No data rows found in CSV.
        </p>
      )}
    </div>
  );
}
