export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-volcanic-800" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-ark-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-ark-400/50 animate-spin-slow" />
      </div>
      <p className="text-sm text-volcanic-500 animate-pulse">Chargement...</p>
    </div>
  );
}
