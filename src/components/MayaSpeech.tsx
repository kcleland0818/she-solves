import { cn } from "@/lib/utils";

interface MayaSpeechProps {
  text: string;
  className?: string;
}

const MayaSpeech = ({ text, className }: MayaSpeechProps) => (
  <div className={cn("flex items-start gap-3 animate-fade-in", className)}>
    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-bold shadow-md">
      M
    </div>
    <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-md">
      <p className="text-sm leading-relaxed text-card-foreground">{text}</p>
    </div>
  </div>
);

export default MayaSpeech;
