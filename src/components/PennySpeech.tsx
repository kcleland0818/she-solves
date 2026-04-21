import { cn } from "@/lib/utils";
import pennyAvatar from "@/assets/penny-avatar.png";

interface PennySpeechProps {
  text: string;
  className?: string;
}

const PennySpeech = ({ text, className }: PennySpeechProps) => (
  <div
    className={cn("flex items-start gap-3 animate-fade-in", className)}
    role="status"
    aria-live="polite"
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bakery-frosting/30 border-2 border-bakery-frosting-deep/40 overflow-hidden shadow-sm">
      <img
        src={pennyAvatar}
        alt=""
        width={40}
        height={40}
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="w-full h-full object-cover"
        aria-hidden="true"
      />
    </div>
    <div className="bg-card border border-bakery-frosting-deep/20 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-md">
      <p className="text-sm leading-relaxed text-card-foreground">
        <span className="sr-only">Penny says: </span>
        {text}
      </p>
    </div>
  </div>
);

export default PennySpeech;
