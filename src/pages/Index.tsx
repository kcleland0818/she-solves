import { useState } from "react";
import TownMap from "@/components/TownMap";
import WelcomeScreen from "@/components/WelcomeScreen";
import Scene1Ratios from "@/components/Scene1Ratios";
import Scene2Percentages from "@/components/Scene2Percentages";
import Scene3Discounts from "@/components/Scene3Discounts";
import CompletionScreen from "@/components/CompletionScreen";
import BakeryWelcome from "@/components/BakeryWelcome";
import BakeryScene1 from "@/components/BakeryScene1";
import BakeryScene2 from "@/components/BakeryScene2";
import BakeryScene3 from "@/components/BakeryScene3";
import BakeryCompletion from "@/components/BakeryCompletion";
import ProgressBar from "@/components/ProgressBar";
import MiniCalculator from "@/components/MiniCalculator";
import KeyboardShortcutsHint from "@/components/KeyboardShortcutsHint";
import { isShopCompleted, markShopCompleted } from "@/lib/progress";

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

const SHOP_BG: Record<Shop, string> = {
  smoothie:
    "bg-gradient-to-br from-[hsl(280,60%,92%)] via-[hsl(320,50%,93%)] to-[hsl(340,60%,92%)]",
  bakery:
    "bg-gradient-to-br from-[hsl(35,65%,94%)] via-[hsl(20,55%,93%)] to-[hsl(340,55%,93%)]",
};

const SHOP_PROGRESS_LABELS: Record<Shop, string[]> = {
  smoothie: ["Mix It", "Sales", "Discounts"],
  bakery: ["Slice", "Frost", "Compare"],
};

const Index = () => {
  const [screen, setScreen] = useState<Screen>({ kind: "town" });

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
    return <TownMap onEnterShop={enterShop} />;
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
      </div>
      {showProgress && <MiniCalculator />}
      {showProgress && <KeyboardShortcutsHint />}
    </div>
  );
};

export default Index;
