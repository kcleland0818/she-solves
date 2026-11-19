import { Button } from "@/components/ui/button";
import lucyAvatar from "@/assets/lucy-avatar.webp";

const ArcadeWelcome = ({ onStart }: { onStart: () => void }) => (
  <section aria-label="Welcome" className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in">
    <div className="text-5xl mb-3" aria-hidden="true">🎡🕹️🎟️</div>
    <h1 className="text-2xl md:text-4xl font-extrabold text-foreground mb-1">Lucky Stars Arcade</h1>
    <p className="text-muted-foreground text-base mb-4 max-w-md">
      You're running the prize booth today! Spin wheels, pick prize bags, and forecast the claw machine — all with probability.
    </p>
    <div className="bg-card border border-arcade-neon/30 rounded-2xl p-4 mb-5 max-w-sm shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-arcade-gold/30 border-2 border-arcade-neon/60 overflow-hidden shadow-md animate-[bounce_3s_ease-in-out_infinite]">
          <img
            src={lucyAvatar}
            alt="Lucy, the arcade owner"
            width={56}
            height={56}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="font-semibold text-card-foreground">Lucy, the arcade owner</span>
      </div>
      <p className="text-sm text-foreground leading-relaxed">
        "Hi, booth boss! Every game here runs on chance. Probability is just a way of saying how likely something is — and once you can measure it, you can make smart predictions. Ready to run the booth?"
      </p>
    </div>
    <Button size="lg" onClick={onStart} className="text-base px-8 hover-scale shadow-lg bg-arcade-neon hover:bg-arcade-deep text-white">
      Open the Shop! <span aria-hidden="true">🎡</span>
    </Button>
  </section>
);
export default ArcadeWelcome;
