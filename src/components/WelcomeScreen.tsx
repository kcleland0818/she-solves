import { Button } from "@/components/ui/button";
import mayaAvatar from "@/assets/maya-avatar.png";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-in">
    <div className="text-6xl mb-4">🍓✨🍌</div>
    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2">
      Berry Bliss Smoothie Shop
    </h1>
    <p className="text-muted-foreground text-lg mb-6 max-w-md">
      Congratulations — you're the new owner! 💖 Time to learn the math behind running your shop.
    </p>
    <div className="bg-card border border-primary/20 rounded-2xl p-5 mb-8 max-w-sm shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 overflow-hidden animate-[bounce_3s_ease-in-out_infinite]">
          <img src={mayaAvatar} alt="Maya" width={56} height={56} className="w-full h-full object-cover" />
        </div>
        <span className="font-semibold text-card-foreground">Maya, your mentor ✨</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        "Hey! I'm Maya 👋 I'll walk you through everything — ratios, percentages, and discounts. 
        No stress, just smoothies. Ready?"
      </p>
    </div>
    <Button size="lg" onClick={onStart} className="text-base px-8 hover-scale shadow-lg">
      Let's Go! 🚀
    </Button>
  </div>
);

export default WelcomeScreen;
