import { RefreshCw } from "lucide-react";

/**
 * Dev-only floating button that hard-reloads the page so you can verify
 * scene state survives a reload (via sessionStorage in Index.tsx).
 * Renders nothing in production builds.
 */
const ReloadDebugButton = () => {
  if (!import.meta.env.DEV) return null;

  const handleReload = () => {
    // eslint-disable-next-line no-console
    console.info("[debug] Simulating reload — current scene should restore.");
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={handleReload}
      className="
        fixed z-50 bottom-4 left-4
        inline-flex items-center gap-2 px-3 h-10 rounded-full
        bg-card text-foreground border border-border shadow-lg
        text-xs font-semibold
        hover:scale-105 transition-transform
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
      "
      aria-label="Simulate reload (dev only)"
      title="Dev only — reload the page to verify scene state persistence"
    >
      <RefreshCw className="w-4 h-4" aria-hidden="true" />
      Reload
      <span className="text-[10px] text-muted-foreground font-normal">dev</span>
    </button>
  );
};

export default ReloadDebugButton;
