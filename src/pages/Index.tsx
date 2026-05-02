import { useState, useEffect, lazy, Suspense } from "react";
import TownMap from "@/components/TownMap";
import ProgressBar from "@/components/ProgressBar";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ReloadDebugButton from "@/components/ReloadDebugButton";
import { isShopCompleted, markShopCompleted } from "@/lib/progress";

const WelcomeScreen = lazy(() => import("@/components/WelcomeScreen"));
const Scene1Ratios = lazy(() => import("@/components/Scene1Ratios"));
const Scene2Percentages = lazy(() => import("@/components/Scene2Percentages"));
const Scene3Discounts = lazy(() => import("@/components/Scene3Discounts"));
const CompletionScreen = lazy(() => import("@/components/CompletionScreen"));
const BakeryWelcome = lazy(() => import("@/components/BakeryWelcome"));
const BakeryScene1 = lazy(() => import("@/components/BakeryScene1"));
const BakeryScene2 = lazy(() => import("@/components/BakeryScene2"));
const BakeryScene3 = lazy(() => import("@/components/BakeryScene3"));
const BakeryCompletion = lazy(() => import("@/components/BakeryCompletion"));
const MiniCalculator = lazy(() => import("@/components/MiniCalculator"));
const KeyboardShortcutsHint = lazy(() => import("@/components/KeyboardShortcutsHint"));

type Shop = "smoothie" | "bakery";
type Stage = "welcome" | "scene1" | "scene2" | "scene3" | "complete";
type Screen =
  | { kind: "town" }
  | { kind: "shop"; shop: Shop; stage: Stage };

const stageIndex: Record<Stage, number> = {
  welcome: -1,
  scene1: 0,
  scene2: 1,
  scene3: 2,
  complete: 3,
};

const SHOP_IDS: Record<Shop, string> = {
  smoothie: "smoothie-shop",
  bakery: "bakery",
};

// Light gradients for the welcome screen. In dark mode we fall back to the
// themed background so text stays readable.
const SHOP_BG: Record<Shop, string> = {
  smoothie:
    "bg-gradient-to-br from-[hsl(280,60%,92%)] via-[hsl(320,50%,93%)] to-[hsl(340,60%,92%)] dark:from-background dark:via-background dark:to-background",
  bakery:
    "bg-gradient-to-br from-[hsl(35,65%,94%)] via-[hsl(20,55%,93%)] to-[hsl(340,55%,93%)] dark:from-background dark:via-background dark:to-background",
};

const SHOP_PROGRESS_LABELS: Record<Shop, string[]> = {
  smoothie: ["Mix It", "Sales", "Discounts"],
  bakery: ["Slice", "Frost", "Compare"],
};

// Persist the current screen across reloads (incl. Vite HMR full reloads)
// so a learner mid-activity isn't bounced back to the map. sessionStorage
// (not localStorage) — closing the tab still starts fresh at the map.
const SCREEN_STORAGE_KEY = "shesolves:screen";
const VALID_STAGES: Stage[] = ["welcome", "scene1", "scene2", "scene3", "complete"];
const VALID_SHOPS: Shop[] = ["smoothie", "bakery"];

const getInitialScreen = (): Screen => {
  if (typeof window === "undefined") return { kind: "town" };
  try {
    const raw = window.sessionStorage.getItem(SCREEN_STORAGE_KEY);
    if (!raw) return { kind: "town" };
    const parsed = JSON.parse(raw);
    if (parsed?.kind === "town") return { kind: "town" };
    if (
      parsed?.kind === "shop" &&
      VALID_SHOPS.includes(parsed.shop) &&
      VALID_STAGES.includes(parsed.stage)
    ) {
      return { kind: "shop", shop: parsed.shop, stage: parsed.stage };
    }
  } catch {
    // ignore
  }
  return { kind: "town" };
};

const saveScreen = (screen: Screen) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SCREEN_STORAGE_KEY, JSON.stringify(screen));
  } catch {
    // ignore
  }
};

const Index = () => {
  const [screen, setScreen] = useState<Screen>(getInitialScreen);

  useEffect(() => {
    saveScreen(screen);
  }, [screen]);

  const enterShop = (shopId: string) => {
    const shop: Shop | null =
      shopId === SHOP_IDS.smoothie ? "smoothie" : shopId === SHOP_IDS.bakery ? "bakery" : null;
    if (!shop) return;
    // Returning learners (already completed) skip the intro.
    const stage: Stage = isShopCompleted(SHOP_IDS[shop]) ? "scene1" : "welcome";
    setScreen({ kind: "shop", shop, stage });
  };

  const setStage = (stage: Stage) => {
    setScreen((s) => (s.kind === "shop" ? { ...s, stage } : s));
  };

  const handleComplete = (shop: Shop) => {
    markShopCompleted(SHOP_IDS[shop]);
    setScreen({ kind: "shop", shop, stage: "complete" });
  };

  const goToTown = () => setScreen({ kind: "town" });

  if (screen.kind === "town") {
    return (
      <>
        <TownMap onEnterShop={enterShop} />
        <ThemeSwitcher />
        <ReloadDebugButton />
      </>
    );
  }

  const { shop, stage } = screen;
  const isWelcome = stage === "welcome";
  const showProgress = stage !== "welcome" && stage !== "complete";
  const bg = isWelcome ? SHOP_BG[shop] : "bg-background";

  return (
    <div className={`min-h-screen px-4 py-5 md:py-6 ${bg}`}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div id="main-content" className="max-w-2xl mx-auto">
        {showProgress && (
          <div className="mb-4">
            <ProgressBar
              currentScene={stageIndex[stage]}
              totalScenes={3}
              labels={SHOP_PROGRESS_LABELS[shop]}
            />
          </div>
        )}

        <Suspense
          fallback={
            <div
              className="min-h-[40vh] flex items-center justify-center"
              aria-busy="true"
              aria-live="polite"
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div
                  className="w-8 h-8 rounded-full border-2 border-muted border-t-primary animate-spin"
                  aria-hidden="true"
                />
                <span className="text-sm">Loading…</span>
              </div>
            </div>
          }
        >
          {shop === "smoothie" && (
            <>
              {stage === "welcome" && <WelcomeScreen onStart={() => setStage("scene1")} />}
              {stage === "scene1" && <Scene1Ratios onComplete={() => setStage("scene2")} />}
              {stage === "scene2" && <Scene2Percentages onComplete={() => setStage("scene3")} />}
              {stage === "scene3" && <Scene3Discounts onComplete={() => handleComplete("smoothie")} />}
              {stage === "complete" && (
                <CompletionScreen
                  onRestart={goToTown}
                  onReplayScene={(s) => setStage(s)}
                />
              )}
            </>
          )}

          {shop === "bakery" && (
            <>
              {stage === "welcome" && <BakeryWelcome onStart={() => setStage("scene1")} />}
              {stage === "scene1" && <BakeryScene1 onComplete={() => setStage("scene2")} />}
              {stage === "scene2" && <BakeryScene2 onComplete={() => setStage("scene3")} />}
              {stage === "scene3" && <BakeryScene3 onComplete={() => handleComplete("bakery")} />}
              {stage === "complete" && (
                <BakeryCompletion
                  onRestart={goToTown}
                  onReplayScene={(s) => setStage(s)}
                />
              )}
            </>
          )}
        </Suspense>
      </div>
      <ThemeSwitcher />
      {showProgress && (
        <Suspense fallback={null}>
          <MiniCalculator />
          <KeyboardShortcutsHint />
        </Suspense>
      )}
    </div>
  );
};

export default Index;
