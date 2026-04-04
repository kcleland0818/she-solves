import { Button } from "@/components/ui/button";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-in">
    <div className="text-6xl mb-4">🍓🫐🍌</div>
    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
      Berry Bliss Smoothie Shop
    </h1>
    <p className="text-muted-foreground text-lg mb-6 max-w-md">
      Congratulations — you're the new owner! Time to learn the math behind running your shop.
    </p>
    <div className="bg-card border rounded-2xl p-5 mb-8 max-w-sm shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
          M
        </div>
        <span className="font-semibold text-card-foreground">Maya, your mentor</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        "Hey! I'm Maya 👋 I'll walk you through everything — ratios, percentages, and discounts. 
        No stress, just smoothies. Ready?"
      </p>
    </div>
    <Button size="lg" onClick={onStart} className="text-base px-8 hover-scale">
      Let's Go! 🚀
    </Button>
  </div>
);

export default WelcomeScreen;
