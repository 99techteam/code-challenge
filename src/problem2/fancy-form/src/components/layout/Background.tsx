export function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Large blob - top right */}
      <div className="absolute -right-32 -top-32 h-[500px] w-[500px] animate-blob rounded-full bg-slate-300/40 blur-3xl dark:bg-blue-500/20 sm:h-[600px] sm:w-[600px]" />

      {/* Medium blob - bottom left */}
      <div className="animation-delay-2000 absolute -bottom-24 -left-24 h-[400px] w-[400px] animate-blob rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-500/20 sm:h-[500px] sm:w-[500px]" />

      {/* Small blob - center */}
      <div className="animation-delay-4000 absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 animate-blob rounded-full bg-blue-200/30 blur-3xl dark:bg-sky-500/15" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />
    </div>
  );
}
