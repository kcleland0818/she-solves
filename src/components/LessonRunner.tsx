import { Suspense, useEffect, useMemo, useState, createElement } from "react";
import { Map } from "lucide-react";
import ProgressBar from "@/components/ProgressBar";
import SceneErrorBoundary from "@/components/SceneErrorBoundary";
import MiniCalculator from "@/components/MiniCalculator";
import KeyboardShortcutsHint from "@/components/KeyboardShortcutsHint";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { COMPONENTS } from "@/content/lessons/registry";
import type { Lesson } from "@/content/lessons/types";
import { validateLesson, type LessonValidationIssue } from "@/content/lessons/validate";
import { markShopCompleted, markActivityCompleted } from "@/lib/progress";

export type RunnerStage =
  | { kind: "welcome" }
  | { kind: "activity"; idx: number }
  | { kind: "complete" };

interface LessonRunnerProps {
  lesson: Lesson;
  onExit: () => void;
  initialStage?: RunnerStage;
  onStageChange?: (stage: RunnerStage) => void;
}

const Fallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center" aria-busy="true" aria-live="polite">
    <div className="flex flex-col items-center gap-2 text-muted-foreground">
      <div className="w-8 h-8 rounded-full border-2 border-muted border-t-primary animate-spin" aria-hidden="true" />
      <span className="text-sm">Loading…</span>
    </div>
  </div>
);

interface MissingStageFallbackProps {
  title?: string;
  description?: string;
  onRetry: () => void;
  onExit: () => void;
}

const MissingStageFallback = ({
  title = "This scene isn't available",
  description = "We couldn't find the next step for this shop. You can restart the shop or head back to the map.",
  onRetry,
  onExit,
}: MissingStageFallbackProps) => (
  <div
    className="min-h-[40vh] flex items-center justify-center animate-fade-in"
    role="alert"
    aria-live="polite"
  >
    <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 shadow-sm text-center flex flex-col gap-3">
      <div className="text-4xl" aria-hidden="true">🗺️</div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="flex gap-2 justify-center flex-wrap pt-1">
        <Button type="button" onClick={onRetry}>Restart shop</Button>
        <Button type="button" variant="outline" onClick={onExit}>Back to map</Button>
      </div>
    </div>
  </div>
);

const LessonRunner = ({ lesson, onExit, initialStage, onStageChange }: LessonRunnerProps) => {
  const [stage, setStage] = useState<RunnerStage>(initialStage ?? { kind: "welcome" });

  useEffect(() => {
    onStageChange?.(stage);
  }, [stage, onStageChange]);

  const isWelcome = stage.kind === "welcome";
  const showProgress = stage.kind === "activity";
  const bg = isWelcome ? lesson.bgClass : "bg-background";

  const advance = () => {
    if (stage.kind !== "activity") return;
    const next = stage.idx + 1;
    if (next >= lesson.activities.length) {
      markShopCompleted(lesson.id);
      setStage({ kind: "complete" });
    } else {
      setStage({ kind: "activity", idx: next });
    }
  };

  const handleActivityComplete = () => {
    if (stage.kind !== "activity") return;
    markActivityCompleted(lesson.id, lesson.activities[stage.idx].id);
    advance();
  };

  const replayScene = (sceneId: string) => {
    const idx = lesson.activities.findIndex((a) => a.id === sceneId);
    if (idx >= 0) setStage({ kind: "activity", idx });
  };

  const resetToWelcome = () => setStage({ kind: "welcome" });

  const renderStage = () => {
    if (stage.kind === "welcome") {
      const Welcome = COMPONENTS[lesson.welcome];
      if (!Welcome) {
        return (
          <MissingStageFallback
            description="This shop's intro is missing. Head back to the map and try another shop."
            onRetry={resetToWelcome}
            onExit={onExit}
          />
        );
      }
      return createElement(Welcome as any, {
        onStart: () => setStage({ kind: "activity", idx: 0 }),
      });
    }
    if (stage.kind === "activity") {
      const activity = lesson.activities[stage.idx];
      if (!activity) {
        return (
          <MissingStageFallback
            title="This scene isn't available"
            description="We couldn't find this step anymore. Restart the shop to pick up from the beginning."
            onRetry={resetToWelcome}
            onExit={onExit}
          />
        );
      }
      const Activity = COMPONENTS[activity.component];
      if (!Activity) {
        return (
          <MissingStageFallback
            title="This scene isn't available"
            description="This activity is missing right now. Try restarting the shop or head back to the map."
            onRetry={resetToWelcome}
            onExit={onExit}
          />
        );
      }
      return createElement(Activity as any, { onComplete: handleActivityComplete });
    }
    const Completion = COMPONENTS[lesson.completion];
    if (!Completion) {
      return (
        <MissingStageFallback
          title="Nice work!"
          description="We couldn't load the wrap-up screen. Your progress is saved — head back to the map to keep exploring."
          onRetry={resetToWelcome}
          onExit={onExit}
        />
      );
    }
    return createElement(Completion as any, {
      onRestart: onExit,
      onReplayScene: replayScene,
    });
  };

  return (
    <div className={`min-h-screen flex flex-col px-4 py-5 md:py-6 ${bg}`}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <main
        id="main-content"
        className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center"
        aria-label={`${lesson.shopName} activity`}
      >
        <h1 className="sr-only">{lesson.shopName}</h1>
        {showProgress && (
          <div className="mb-4 flex items-center gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs h-8 px-2 gap-1"
                  aria-label="Leave shop and return to town map"
                >
                  <Map className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Map</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave this shop?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your progress on this scene won't be saved. You can come back and start the shop again anytime.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep going</AlertDialogCancel>
                  <AlertDialogAction onClick={onExit}>Back to map</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="flex-1">
              <ProgressBar
                currentScene={stage.kind === "activity" ? stage.idx : 0}
                totalScenes={lesson.activities.length}
                labels={lesson.progressLabels}
              />
            </div>
            <div className="shrink-0 w-8 sm:w-[60px]" aria-hidden="true" />
          </div>
        )}

        <SceneErrorBoundary onBackToMap={onExit}>
          <Suspense fallback={<Fallback />}>{renderStage()}</Suspense>
        </SceneErrorBoundary>
      </main>
      {showProgress && (
        <Suspense fallback={null}>
          <MiniCalculator />
          <KeyboardShortcutsHint />
        </Suspense>
      )}
    </div>
  );
};

export default LessonRunner;
