import { useState, useEffect, useCallback, useRef } from "react";

const MiniCalculator = () => {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);

  const handleNumber = useCallback((n: string) => {
    setDisplay((d) => {
      if (fresh) return n;
      return d === "0" ? n : d + n;
    });
    if (fresh) setFresh(false);
  }, [fresh]);

  const calc = (a: number, b: number, o: string) => {
    switch (o) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? parseFloat((a / b).toFixed(6)) : 0;
      default: return b;
    }
  };

  const handleOp = useCallback((nextOp: string) => {
    const current = parseFloat(display);
    if (prev !== null && op && !fresh) {
      const result = calc(prev, current, op);
      setDisplay(String(result));
      setPrev(result);
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setFresh(true);
  }, [display, prev, op, fresh]);

  const handleEquals = useCallback(() => {
    if (prev !== null && op) {
      const result = calc(prev, parseFloat(display), op);
      setDisplay(String(result));
      setPrev(null);
      setOp(null);
      setFresh(true);
    }
  }, [prev, op, display]);

  const handleClear = useCallback(() => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setFresh(true);
  }, []);

  const handleDot = useCallback(() => {
    if (fresh) {
      setDisplay("0.");
      setFresh(false);
    } else {
      setDisplay((d) => (d.includes(".") ? d : d + "."));
    }
  }, [fresh]);

  const handleBackspace = useCallback(() => {
    setDisplay((d) => {
      if (fresh || d.length <= 1 || (d.length === 2 && d.startsWith("-"))) return "0";
      return d.slice(0, -1);
    });
  }, [fresh]);

  // Keyboard support — only when calculator is open
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't hijack typing in inputs/textareas elsewhere
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const k = e.key;
      if (/^[0-9]$/.test(k)) { e.preventDefault(); handleNumber(k); }
      else if (k === "+") { e.preventDefault(); handleOp("+"); }
      else if (k === "-") { e.preventDefault(); handleOp("−"); }
      else if (k === "*" || k === "x" || k === "X") { e.preventDefault(); handleOp("×"); }
      else if (k === "/") { e.preventDefault(); handleOp("÷"); }
      else if (k === "Enter" || k === "=") { e.preventDefault(); handleEquals(); }
      else if (k === "." || k === ",") { e.preventDefault(); handleDot(); }
      else if (k === "Backspace") { e.preventDefault(); handleBackspace(); }
      else if (k === "Escape") { e.preventDefault(); setOpen(false); openBtnRef.current?.focus(); }
      else if (k === "c" || k === "C" || k === "Delete") { e.preventDefault(); handleClear(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleNumber, handleOp, handleEquals, handleDot, handleBackspace, handleClear]);

  if (!open) {
    return (
      <button
        ref={openBtnRef}
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-lg font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="Open calculator. Supports keyboard input when open."
      >
        <span aria-hidden="true">🧮</span>
      </button>
    );
  }

  const btnClass = "min-h-[44px] text-base font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1";
  const numClass = `${btnClass} bg-card border border-border hover:bg-muted`;
  const opClass = `${btnClass} bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20`;

  return (
    <aside
      ref={panelRef}
      className="fixed bottom-4 right-4 z-50 w-64 bg-card border border-border rounded-2xl shadow-xl p-3 animate-fade-in"
      role="region"
      aria-label="Calculator. Use number keys, operators, Enter to equals, Backspace to delete, Escape to close."
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-muted-foreground">
          <span aria-hidden="true">🧮 </span>Calculator
        </span>
        <button
          onClick={() => { setOpen(false); openBtnRef.current?.focus(); }}
          className="min-w-[32px] min-h-[32px] text-muted-foreground hover:text-foreground text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          aria-label="Close calculator"
        >
          ✕
        </button>
      </div>
      <div className="bg-muted rounded-lg px-3 py-2 mb-2 text-right font-mono text-lg truncate" role="status" aria-live="polite" aria-atomic="true" aria-label={`Display: ${display}`}>
        {display}
      </div>
      <p className="sr-only">Tip: you can also type with your keyboard. Use number keys, plus, minus, asterisk, slash, Enter for equals, Backspace to delete, and Escape to close.</p>
      <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Calculator buttons">
        <button onClick={handleClear} aria-label="Clear" className={`${btnClass} col-span-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20`}>C</button>
        <button onClick={() => handleOp("÷")} aria-label="Divide" className={opClass}>÷</button>
        <button onClick={() => handleOp("×")} aria-label="Multiply" className={opClass}>×</button>
        {["7","8","9"].map(n => <button key={n} onClick={() => handleNumber(n)} aria-label={n} className={numClass}>{n}</button>)}
        <button onClick={() => handleOp("−")} aria-label="Subtract" className={opClass}>−</button>
        {["4","5","6"].map(n => <button key={n} onClick={() => handleNumber(n)} aria-label={n} className={numClass}>{n}</button>)}
        <button onClick={() => handleOp("+")} aria-label="Add" className={opClass}>+</button>
        {["1","2","3"].map(n => <button key={n} onClick={() => handleNumber(n)} aria-label={n} className={numClass}>{n}</button>)}
        <button onClick={handleEquals} aria-label="Equals" className={`${btnClass} row-span-2 bg-primary text-primary-foreground hover:bg-primary/90`}>=</button>
        <button onClick={() => handleNumber("0")} aria-label="Zero" className={`${numClass} col-span-2`}>0</button>
        <button onClick={handleDot} aria-label="Decimal point" className={numClass}>.</button>
      </div>
    </aside>
  );
};

export default MiniCalculator;
