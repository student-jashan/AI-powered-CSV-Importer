export default function Loader({ message = "Processing..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-300 text-sm">{message}</p>
    </div>
  );
}
