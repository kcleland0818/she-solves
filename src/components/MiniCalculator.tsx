import { useState } from "react";
import { Button } from "@/components/ui/button";

const MiniCalculator = () => {
  const [open, setOpen] = useState(false);
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [fresh, setFresh] = useState(true);

  const handleNumber = (n: string) => {
    if (fresh) {
      setDisplay(n);
      setFresh(false);
    } else {
      setDisplay(display === "0" ? n : display + n);
    }
  };

  const handleOp = (nextOp: string) => {
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
  };

  const calc = (a: number, b: number, o: string) => {
    switch (o) {
      case "+": return a + b;
      case "−": return a - b;
      case "×": return a * b;
      case "÷": return b !== 0 ? parseFloat((a / b).toFixed(6)) : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (prev !== null && op) {
      const result = calc(prev, parseFloat(display), op);
      setDisplay(String(result));
      setPrev(null);
      setOp(null);
      setFresh(true);
    }
  };

  const handleClear = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setFresh(true);
  };

  const handleDot = () => {
    if (fresh) {
      setDisplay("0.");
      setFresh(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-transform text-lg font-bold"
        aria-label="Open calculator"
      >
        🧮
      </button>
    );
  }

  const btnClass = "h-10 text-base font-semibold rounded-lg transition-colors";
  const numClass = `${btnClass} bg-card border border-border hover:bg-muted`;
  const opClass = `${btnClass} bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20`;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-56 bg-card border border-border rounded-2xl shadow-xl p-3 animate-fade-in">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-muted-foreground">🧮 Calculator</span>
        <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
      </div>
      <div className="bg-muted rounded-lg px-3 py-2 mb-2 text-right font-mono text-lg truncate">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        <button onClick={handleClear} className={`${btnClass} col-span-2 bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20`}>C</button>
        <button onClick={() => handleOp("÷")} className={opClass}>÷</button>
        <button onClick={() => handleOp("×")} className={opClass}>×</button>
        {["7","8","9"].map(n => <button key={n} onClick={() => handleNumber(n)} className={numClass}>{n}</button>)}
        <button onClick={() => handleOp("−")} className={opClass}>−</button>
        {["4","5","6"].map(n => <button key={n} onClick={() => handleNumber(n)} className={numClass}>{n}</button>)}
        <button onClick={() => handleOp("+")} className={opClass}>+</button>
        {["1","2","3"].map(n => <button key={n} onClick={() => handleNumber(n)} className={numClass}>{n}</button>)}
        <button onClick={handleEquals} className={`${btnClass} row-span-2 bg-primary text-primary-foreground hover:bg-primary/90`}>=</button>
        <button onClick={() => handleNumber("0")} className={`${numClass} col-span-2`}>0</button>
        <button onClick={handleDot} className={numClass}>.</button>
      </div>
    </div>
  );
};

export default MiniCalculator;
