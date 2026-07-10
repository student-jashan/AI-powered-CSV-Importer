export default function EmptyState({ title = "No records found", description = "" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <div className="text-5xl mb-4 opacity-50">📋</div>
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      {description && <p className="text-sm">{description}</p>}
    </div>
  );
}
