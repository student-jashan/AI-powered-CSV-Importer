export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: "Total Records",
      value: summary.totalRecords,
      color: "blue",
      description: "Records uploaded from CSV",
    },
    {
      title: "Imported",
      value: summary.importedRecords,
      color: "green",
      description: "Successfully mapped and imported",
    },
    {
      title: "Skipped",
      value: (summary.mappingSkipped || 0) + (summary.invalidRecords || 0),
      color: "red",
      description: "Skipped (invalid + missing email/mobile)",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className={`
            rounded-2xl
            border
            shadow-md
            p-6
            transition-all
            duration-300
            hover:shadow-xl
            hover:-translate-y-1
            ${
              card.color === "blue"
                ? "bg-blue-900/30 border-blue-700"
                : card.color === "green"
                ? "bg-green-900/30 border-green-700"
                : "bg-red-900/30 border-red-700"
            }
          `}
        >
          <div>
            <p className="text-gray-400 text-sm font-medium">
              {card.title}
            </p>

            <h2 className="text-4xl font-bold mt-3 text-gray-100">
              {card.value}
            </h2>
          </div>

          <hr className="my-4 border-gray-700" />

          <p className="text-sm text-gray-400">
            {card.description}
          </p>
        </div>
      ))}
    </div>
  );
}
