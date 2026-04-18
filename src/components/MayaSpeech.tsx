import { cn } from "@/lib/utils";
import mayaAvatar from "@/assets/maya-avatar.webp";

interface MayaSpeechProps {
  text: string;
  className?: string;
}

const MayaSpeech = ({ text, className }: MayaSpeechProps) => (
  <div className={cn("flex items-start gap-3 animate-fade-in", className)} role="status" aria-live="polite">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 border-2 border-primary/40 overflow-hidden shadow-sm">
      <img src={mayaAvatar} alt="" width={40} height={40} loading="eager" decoding="async" fetchPriority="high" className="w-full h-full object-cover" aria-hidden="true" />
    </div>
    <div className="bg-card border border-primary/20 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-md">
      <p className="text-sm leading-relaxed text-card-foreground">
        <span className="sr-only">Maya says: </span>{text}
      </p>
    </div>
  </div>
);

export default MayaSpeech;
