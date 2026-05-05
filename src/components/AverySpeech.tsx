import { cn } from "@/lib/utils";
import averyAvatar from "@/assets/avery-avatar.png";

interface AverySpeechProps {
  /** Plain-text message. Use `children` instead when you need inline JSX (e.g. <Inequality />). */
  text?: string;
  children?: React.ReactNode;
  className?: string;
}

const AverySpeech = ({ text, children, className }: AverySpeechProps) => (
  <div
    className={cn("flex items-start gap-3 animate-fade-in", className)}
    role="status"
    aria-live="polite"
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-bookstore-gold/30 border-2 border-bookstore-leather/50 overflow-hidden shadow-sm">
      <img
        src={averyAvatar}
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
    <div className="bg-card border border-bookstore-leather/30 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-md">
      <p className="text-sm leading-relaxed text-card-foreground">
        <span className="sr-only">Avery says: </span>
        {children ?? text}
      </p>
    </div>
  </div>
);

export default AverySpeech;
