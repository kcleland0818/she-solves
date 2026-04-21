import { Button } from "@/components/ui/button";
import NiaSpeech from "./NiaSpeech";

type ReplayScene = "scene1" | "scene2" | "scene3";

interface BakeryCompletionProps {
  onRestart: () => void;
  onReplayScene?: (scene: ReplayScene) => void;
}

const skills: { emoji: string; title: string; desc: string; scene: ReplayScene }[] = [
  {
    emoji: "🍰",
    title: "Identifying Fractions",
    desc: "You can name a fraction by counting shaded slices over total slices.",
    scene: "scene1",
  },
  {
    emoji: "🧁",
    title: "Equivalent Fractions",
    desc: "You know that 2/4 and 1/2 are the same amount — just sliced differently.",
    scene: "scene2",
  },
  {
    emoji: "⚖️",
    title: "Comparing Fractions",
    desc: "You can tell which fraction is bigger by lining up the visuals.",
    scene: "scene3",
  },
];

const BakeryCompletion = ({ onRestart, onReplayScene }: BakeryCompletionProps) => (
  <main className="flex flex-col items-center gap-3 animate-fade-in max-w-lg mx-auto text-center">
    <div className="text-5xl" aria-hidden="true">🎉🧁🏆🥐🎉</div>
    <h2 className="text-3xl font-bold bg-gradient-to-r from-bakery-frosting-deep to-accent bg-clip-text text-transparent">
      Sweet Success!
    </h2>

    <NiaSpeech text="You're a fractions pro now! Whether it's a cake or a tray of cupcakes, you can slice and compare like a real baker. Look what you learned:" />

    <div className="w-full space-y-2" role="list" aria-label="Skills you learned">
      {skills.map((item) => (
        <div
          key={item.title}
          role="listitem"
          className="bg-card border border-bakery-frosting-deep/20 rounded-xl p-4 text-left flex gap-3 items-start"
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
      Fractions show up everywhere — recipes, time, money. You've got the tools now!
    </p>

    <Button onClick={onRestart} variant="outline" className="hover-scale">
      Back to Town <span aria-hidden="true">🗺️</span>
    </Button>
  </main>
);

export default BakeryCompletion;
