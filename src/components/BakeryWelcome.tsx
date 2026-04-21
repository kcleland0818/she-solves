import { Button } from "@/components/ui/button";
import niaAvatar from "@/assets/nia-avatar.png";

interface BakeryWelcomeProps {
  onStart: () => void;
}

const BakeryWelcome = ({ onStart }: BakeryWelcomeProps) => (
  <main className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in">
    <div className="text-5xl mb-3" aria-hidden="true">🧁🥐🍰</div>
    <h1 className="text-2xl md:text-4xl font-extrabold text-foreground mb-1">
      Sweet Crumbs Bakery
    </h1>
    <p className="text-muted-foreground text-base mb-4 max-w-md">
      Welcome to the bakery! Today we're slicing cakes and trays of treats — and learning fractions while we do it.
    </p>
    <div className="bg-card border border-bakery-frosting-deep/20 rounded-2xl p-4 mb-5 max-w-sm shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-bakery-frosting/30 border-2 border-bakery-frosting-deep/40 overflow-hidden animate-[bounce_3s_ease-in-out_infinite]">
          <img
            src={niaAvatar}
            alt="Baker Nia, your guide"
            width={56}
            height={56}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="font-semibold text-card-foreground">Baker Nia, your guide</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        "Hi there! I'm Nia. We're going to slice some cakes, fill cupcake trays, and figure out which dessert is BIGGER. Fractions are just fancy slices — let's bake!"
      </p>
    </div>
    <Button
      size="lg"
      onClick={onStart}
      className="text-base px-8 hover-scale shadow-lg bg-gradient-to-r from-bakery-frosting-deep to-accent text-accent-foreground"
    >
      Start Baking! <span aria-hidden="true">🥖</span>
    </Button>
  </main>
);

export default BakeryWelcome;
