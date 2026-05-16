import { Button } from "@/components/ui/button";
import averyAvatar from "@/assets/avery-avatar.png";

interface BookstoreWelcomeProps {
  onStart: () => void;
}

const BookstoreWelcome = ({ onStart }: BookstoreWelcomeProps) => (
  <section aria-label="Welcome" className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in">
    <div className="text-5xl mb-3" aria-hidden="true">📚📖✨</div>
    <h1 className="text-2xl md:text-4xl font-extrabold text-foreground mb-1">
      Page Turner Bookstore
    </h1>
    <p className="text-muted-foreground text-base mb-4 max-w-md">
      Welcome to the bookstore! Today you're helping Avery sort, recommend, and compare books — using inequalities to talk about page counts, ages, and prices.
    </p>
    <div className="bg-card border border-bookstore-leather/30 rounded-2xl p-4 mb-5 max-w-sm shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-14 h-14 rounded-full bg-bookstore-gold/30 border-2 border-bookstore-leather/50 overflow-hidden animate-[bounce_3s_ease-in-out_infinite]">
          <img
            src={averyAvatar}
            alt="Avery, your bookstore buddy"
            width={56}
            height={56}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full h-full object-cover"
          />
        </div>
        <span className="font-semibold text-card-foreground">Avery, your bookstore buddy</span>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        "Hey, so glad you're here! Inequalities sound fancy, but they're just little symbols that say which side is bigger, smaller, or equal. We use them all the time in here — to find books for the right age, the right length, the right price. Let's read a few together!"
      </p>
    </div>
    <Button
      size="lg"
      onClick={onStart}
      className="text-base px-8 hover-scale shadow-lg bg-gradient-to-r from-bookstore-leather to-bookstore-leather-deep text-white"
    >
      Open the Shop! <span aria-hidden="true">📖</span>
    </Button>
  </section>
);

export default BookstoreWelcome;
