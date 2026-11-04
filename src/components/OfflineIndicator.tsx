import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

const OfflineIndicator = () => {
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      {!online && (
        <div className="flex items-center gap-2 rounded-full bg-card text-card-foreground border border-border shadow-md px-3 py-1.5 text-xs font-semibold">
          <WifiOff className="w-4 h-4" aria-hidden="true" />
          You're offline — everything still works
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
