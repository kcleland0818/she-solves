import { Button } from "@/components/ui/button";
import pennyAvatar from "@/assets/penny-avatar.png";

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
      Welcome to the bakery! Today you're helping behind the counter — slicing cakes, filling trays, and learning fractions while you bake.
    </p>
    <div className="bg-card border border-bakery-frosting-deep/20 rounded-2xl p-4 mb-5 max-w-sm shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-bakery-frosting/30 border-2 border-bakery-frosting-deep/40 overflow-hidden animate-[bounce_3s_ease-in-out_infinite]">
          <img
            src={pennyAvatar}
            alt="Penny, your baking buddy"
            width={56}
            height={56}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="font-semibold text-card-foreground">Penny, your baking buddy</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        "Hey, partner! I'm Penny. We run this bakery together today — slicing cakes, filling cupcake trays, and figuring out which dessert is BIGGER. Fractions are just fancy slices. Let's bake!"
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
