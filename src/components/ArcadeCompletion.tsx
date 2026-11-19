import { Button } from "@/components/ui/button";
import LucySpeech from "./LucySpeech";
import SkillStamp from "./SkillStamp";
import { getPracticeRounds } from "@/lib/progress";

type ReplayScene = "scene1" | "scene2" | "scene3";
interface Props { onRestart: () => void; onReplayScene?: (s: ReplayScene) => void; onPractice?: () => void }

const skills: { emoji: string; title: string; desc: string; scene: ReplayScene }[] = [
  { emoji: "🎡", title: "Probability of a Single Event", desc: "You can write the chance of something as a fraction and simplify it.", scene: "scene1" },
  { emoji: "👜", title: "Comparing Likelihood", desc: "You can tell impossible from certain, and pick the better chance.", scene: "scene2" },
  { emoji: "🕹️", title: "Predicting With Probability", desc: "You can forecast results and compare them with what really happens.", scene: "scene3" },
];

const ArcadeCompletion = ({ onRestart, onReplayScene, onPractice }: Props) => {
  const rounds = getPracticeRounds("arcade");
  return (
    <main className="flex flex-col items-center gap-3 animate-fade-in max-w-lg mx-auto text-center">
      <div className="text-5xl" aria-hidden="true">🎉🎟️🏆🎡🎉</div>
      <h2 className="text-3xl font-bold text-arcade-neon">Jackpot, Booth Boss!</h2>
      <LucySpeech text="You ran the whole booth! Chance used to feel like pure luck — now you can measure it, compare it, and predict with it. Look what you won:" />
      <div className="flex flex-wrap justify-center gap-2">
        {skills.map((s) => <SkillStamp key={s.title} label={s.title} />)}
      </div>
      <div className="w-full space-y-2" role="list" aria-label="Skills you learned">
        {skills.map((item) => (
          <div key={item.title} role="listitem" className="bg-card border border-arcade-neon/30 rounded-xl p-4 text-left flex gap-3 items-start">
            <span className="text-2xl shrink-0" aria-hidden="true">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">{item.title}</h3>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
            {onReplayScene && (
              <Button size="sm" variant="ghost" className="shrink-0 text-xs h-8 px-2" onClick={() => onReplayScene(item.scene)} aria-label={`Revisit ${item.title} scene`}>
                Revisit <span aria-hidden="true">↻</span>
              </Button>
            )}
          </div>
        ))}
      </div>
      <p className="text-muted-foreground text-sm">Weather forecasts, board games, sports — probability is everywhere. You're ready!</p>
      {onPractice && (
        <div className="flex flex-col items-center gap-1">
          <Button onClick={onPractice} className="min-h-11">Practice Probability <span aria-hidden="true">🔁</span></Button>
          {rounds > 0 && <p className="text-xs text-muted-foreground">You've solved {rounds} practice challenges so far — keep it up!</p>}
        </div>
      )}
      <Button onClick={onRestart} variant="outline" className="hover-scale">Back to Town <span aria-hidden="true">🗺️</span></Button>
    </main>
  );
};
export default ArcadeCompletion;
