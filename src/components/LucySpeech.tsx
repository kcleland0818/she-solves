import { cn } from "@/lib/utils";

const LucySpeech = ({ text, className }: { text: string; className?: string }) => (
  <div className={cn("flex items-start gap-3", className)} role="status" aria-live="polite">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-arcade-gold/30 border-2 border-arcade-neon/60 flex items-center justify-center text-xl shadow-sm" aria-hidden="true">
      🎟️
    </div>
    <div className="bg-card border border-arcade-neon/30 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-md">
      <p className="text-sm leading-relaxed text-card-foreground">
        <span className="sr-only">Lucy says: </span>
        {text}
      </p>
    </div>
  </div>
);

export default LucySpeech;
