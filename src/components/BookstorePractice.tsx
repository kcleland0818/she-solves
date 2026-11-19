import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import SentenceToInequality from "./templates/SentenceToInequality";
import { generateInequalityLesson } from "@/content/generators/inequalityWriting";
import { markPracticeRound } from "@/lib/progress";

const BookstorePractice = ({ onExitPractice }: { onExitPractice: () => void }) => {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const lesson = useMemo(() => generateInequalityLesson({ seed }), [seed]);
  return (
    <section className="flex flex-col gap-3 max-w-lg mx-auto w-full" aria-label="Inequality practice mode">
      <SentenceToInequality key={seed} {...lesson} heading="📚 Inequality Practice"
        intro="The reading club has new book requests. Which symbol matches each request?"
        nextLabel="Back to Wrap-Up" onComplete={onExitPractice}
        onSolved={() => markPracticeRound("bookstore")} />
      <div className="flex gap-2 justify-center flex-wrap">
        <Button variant="outline" className="min-h-11" onClick={() => setSeed((s) => (s + 1) >>> 0)}>New Challenge <span aria-hidden="true">🔀</span></Button>
        <Button variant="ghost" className="min-h-11" onClick={onExitPractice}>Back to Wrap-Up</Button>
      </div>
    </section>
  );
};
export default BookstorePractice;