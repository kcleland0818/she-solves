import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentScene: number;
  totalScenes: number;
}

const labels = ["Mix It", "Sales", "Discounts"];

const ProgressBar = ({ currentScene, totalScenes }: ProgressBarProps) => (
  <nav aria-label="Lesson progress" className="flex items-center gap-2 w-full max-w-md mx-auto">
    <span className="sr-only">
      Step {Math.min(currentScene + 1, totalScenes)} of {totalScenes}: {labels[Math.min(currentScene, totalScenes - 1)]}
    </span>
    {Array.from({ length: totalScenes }, (_, i) => (
      <div key={i} className="flex items-center flex-1">
        <div className="flex flex-col items-center flex-1">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
              i < currentScene
                ? "bg-primary text-primary-foreground scale-100"
                : i === currentScene
                ? "bg-accent text-accent-foreground scale-110 shadow-md"
                : "bg-muted text-muted-foreground"
            )}
            aria-current={i === currentScene ? "step" : undefined}
            aria-label={`${labels[i]}: ${i < currentScene ? "completed" : i === currentScene ? "current" : "upcoming"}`}
          >
            {i < currentScene ? "✓" : i + 1}
          </div>
          <span
            className={cn(
              "text-[10px] mt-1 font-medium",
              i <= currentScene ? "text-foreground" : "text-muted-foreground"
            )}
            aria-hidden="true"
          >
            {labels[i]}
          </span>
        </div>
        {i < totalScenes - 1 && (
          <div
            className={cn(
              "h-0.5 flex-1 mx-1 rounded transition-colors duration-300",
              i < currentScene ? "bg-primary" : "bg-muted"
            )}
            aria-hidden="true"
          />
        )}
      </div>
    ))}
  </nav>
);

export default ProgressBar;
