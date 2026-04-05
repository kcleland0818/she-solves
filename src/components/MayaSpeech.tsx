import { cn } from "@/lib/utils";
import mayaAvatar from "@/assets/maya-avatar.png";

interface MayaSpeechProps {
  text: string;
  className?: string;
}

const MayaSpeech = ({ text, className }: MayaSpeechProps) => (
  <div className={cn("flex items-start gap-3 animate-fade-in", className)}>
    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/40 overflow-hidden shadow-md animate-[bounce_3s_ease-in-out_infinite]">
      <img src={mayaAvatar} alt="Maya, your mentor" width={56} height={56} className="w-full h-full object-cover" />
    </div>
    <div className="bg-card border border-primary/20 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-md">
      <p className="text-sm leading-relaxed text-card-foreground">{text}</p>
    </div>
  </div>
);

export default MayaSpeech;
