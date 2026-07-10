export default function RecordsTable({ records }) {
  if (!records || records.length === 0) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "GOOD_LEAD_FOLLOW_UP":
        return "bg-green-900/50 text-green-300";

      case "SALE_DONE":
        return "bg-blue-900/50 text-blue-300";

      case "BAD_LEAD":
        return "bg-red-900/50 text-red-300";

      case "DID_NOT_CONNECT":
        return "bg-yellow-900/50 text-yellow-300";

      default:
        return "bg-gray-700 text-gray-300";
    }
  };

  return (
    <div className="mt-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-5">

        <h2 className="text-2xl font-bold text-gray-100">
          Mapped CRM Records
        </h2>

        <p className="text-gray-400 mt-2 md:mt-0">
          Showing <strong>{records.length}</strong> record(s)
        </p>

      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-700 shadow">

        <table className="min-w-full text-sm">

          <thead className="bg-gray-900 text-white sticky top-0">

            <tr>

              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Created At</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Mobile</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">CRM Note</th>

            </tr>

          </thead>

          <tbody>

            {records.map((record, index) => (

              <tr
                key={index}
                className={`
                  border-b border-gray-700
                  hover:bg-blue-900/20
                  transition
                  ${index % 2 === 0 ? "bg-gray-800" : "bg-gray-700"}
                `}
              >

                <td className="px-4 py-3 font-semibold">
                  {index + 1}
                </td>

                <td
                  className="px-4 py-3 whitespace-nowrap"
                  title={record.created_at}
                >
                  {record.created_at || "--"}
                </td>

                <td
                  className="px-4 py-3 font-medium"
                  title={record.name}
                >
                  {record.name || "--"}
                </td>

                <td
                  className="px-4 py-3"
                  title={record.email}
                >
                  {record.email || "--"}
                </td>

                <td className="px-4 py-3">
                  {record.mobile_without_country_code || "--"}
                </td>

                <td
                  className="px-4 py-3"
                  title={record.company}
                >
                  {record.company || "--"}
                </td>

                <td className="px-4 py-3">

                  <span
                    className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold
                      ${getStatusColor(record.crm_status)}
                    `}
                  >
                    {record.crm_status || "N/A"}
                  </span>

                </td>

                <td className="px-4 py-3">
                  {record.data_source || "--"}
                </td>

                <td
                  className="px-4 py-3 max-w-xs truncate"
                  title={record.crm_note}
                >
                  {record.crm_note || "--"}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}