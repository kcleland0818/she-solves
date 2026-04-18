import { useEffect, useState, useRef } from "react";
import { Keyboard, X } from "lucide-react";

const STORAGE_KEY = "berry-bliss:kbd-hint-dismissed";

const KeyboardShortcutsHint = () => {
  const [visible, setVisible] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // Slight delay so it doesn't steal focus from the scene heading
        const t = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (visible) closeBtnRef.current?.focus();
  }, [visible]);

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="kbd-hint-title"
      aria-describedby="kbd-hint-body"
      className="fixed bottom-4 left-4 z-50 max-w-xs bg-card border border-primary/30 rounded-2xl shadow-xl p-4 animate-fade-in"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center">
          <Keyboard className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 id="kbd-hint-title" className="font-semibold text-sm text-card-foreground mb-1">
            Keyboard tips
          </h2>
          <ul id="kbd-hint-body" className="text-xs text-muted-foreground space-y-1 leading-relaxed">
            <li><kbd className="font-mono bg-muted px-1 rounded">Tab</kbd> to move between controls</li>
            <li><kbd className="font-mono bg-muted px-1 rounded">←</kbd> <kbd className="font-mono bg-muted px-1 rounded">→</kbd> to adjust sliders</li>
            <li><kbd className="font-mono bg-muted px-1 rounded">Enter</kbd> or <kbd className="font-mono bg-muted px-1 rounded">Space</kbd> to activate buttons</li>
            <li>Calculator: type numbers, <kbd className="font-mono bg-muted px-1 rounded">Esc</kbd> to close</li>
          </ul>
        </div>
        <button
          ref={closeBtnRef}
          onClick={dismiss}
          aria-label="Dismiss keyboard tips"
          className="flex-shrink-0 w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      <button
        onClick={dismiss}
        className="mt-3 w-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md py-1.5"
      >
        Got it
      </button>
    </div>
  );
};

export default KeyboardShortcutsHint;
