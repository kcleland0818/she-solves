import { Button } from "@/components/ui/button";
import MayaSpeech from "./MayaSpeech";

interface CompletionScreenProps {
  onRestart: () => void;
}

const CompletionScreen = ({ onRestart }: CompletionScreenProps) => (
  <main className="flex flex-col items-center gap-3 animate-fade-in max-w-lg mx-auto text-center">
    <div className="text-5xl" aria-hidden="true">🎉🍓🏆✨🎉</div>
    <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">You Did It!</h2>

    <MayaSpeech text="I'm SO proud of you! You just learned some seriously cool math. Here's what you crushed today:" />

    <div className="w-full space-y-2" role="list" aria-label="Skills you learned">
      {[
        { emoji: "🍹", title: "Ratios", desc: "You can compare amounts and scale them up while keeping the same proportion." },
        { emoji: "📊", title: "Percentages", desc: "You know how to find what percent a part is of a whole: (part ÷ whole) × 100." },
        { emoji: "🏷️", title: "Discounts", desc: "You can calculate sale prices using percentages — real-world math!" },
      ].map((item) => (
        <div key={item.title} role="listitem" className="bg-card border border-primary/20 rounded-xl p-4 text-left flex gap-3 items-start">
          <span className="text-2xl" aria-hidden="true">{item.emoji}</span>
          <div>
            <h3 className="font-semibold text-sm">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>

    <p className="text-muted-foreground text-sm">
      Remember: math is just a tool to figure cool things out. You've got this!
    </p>

    <Button onClick={onRestart} variant="outline" className="hover-scale">
      Play Again <span aria-hidden="true">🔄</span>
    </Button>
  </main>
);

export default CompletionScreen;
