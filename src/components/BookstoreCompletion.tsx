import { Button } from "@/components/ui/button";
import AverySpeech from "./AverySpeech";

type ReplayScene = "scene1" | "scene2" | "scene3";

interface BookstoreCompletionProps {
  onRestart: () => void;
  onReplayScene?: (scene: ReplayScene) => void;
}

const skills: { emoji: string; title: string; desc: string; scene: ReplayScene }[] = [
  {
    emoji: "📖",
    title: "Reading Inequalities",
    desc: "You can read <, >, =, ≤, and ≥ and say what they mean.",
    scene: "scene1",
  },
  {
    emoji: "✍️",
    title: "Writing Inequalities",
    desc: "You can turn words like 'at least' or 'fewer than' into the right symbol.",
    scene: "scene2",
  },
  {
    emoji: "⚖️",
    title: "Comparing With Inequalities",
    desc: "You can compare two amounts and pick the symbol that fits.",
    scene: "scene3",
  },
];

const BookstoreCompletion = ({ onRestart, onReplayScene }: BookstoreCompletionProps) => (
  <main className="flex flex-col items-center gap-3 animate-fade-in max-w-lg mx-auto text-center">
    <div className="text-5xl" aria-hidden="true">🎉📚🏆📖🎉</div>
    <h2 className="text-3xl font-bold bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep bg-clip-text text-transparent">
      Closing Time, Bookworm!
    </h2>

    <AverySpeech text="You did it! Inequalities used to look like funny little arrows — now they're tools you can read, write, and use to compare. Look what you picked up:" />

    <div className="w-full space-y-2" role="list" aria-label="Skills you learned">
      {skills.map((item) => (
        <div
          key={item.title}
          role="listitem"
          className="bg-card border border-bookstore-leather/30 rounded-xl p-4 text-left flex gap-3 items-start"
        >
          <span className="text-2xl shrink-0" aria-hidden="true">{item.emoji}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
          {onReplayScene && (
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 text-xs h-8 px-2"
              onClick={() => onReplayScene(item.scene)}
              aria-label={`Revisit ${item.title} scene`}
            >
              Revisit <span aria-hidden="true">↻</span>
            </Button>
          )}
        </div>
      ))}
    </div>

    <p className="text-muted-foreground text-sm">
      Inequalities show up everywhere — speed limits, age ratings, sale prices. You're ready!
    </p>

    <Button onClick={onRestart} variant="outline" className="hover-scale">
      Back to Town <span aria-hidden="true">🗺️</span>
    </Button>
  </main>
);

export default BookstoreCompletion;
