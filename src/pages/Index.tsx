import { useState } from "react";
import TownMap from "@/components/TownMap";
import WelcomeScreen from "@/components/WelcomeScreen";
import Scene1Ratios from "@/components/Scene1Ratios";
import Scene2Percentages from "@/components/Scene2Percentages";
import Scene3Discounts from "@/components/Scene3Discounts";
import CompletionScreen from "@/components/CompletionScreen";
import ProgressBar from "@/components/ProgressBar";
import MiniCalculator from "@/components/MiniCalculator";
import KeyboardShortcutsHint from "@/components/KeyboardShortcutsHint";
import { isShopCompleted, markShopCompleted } from "@/lib/progress";

type Screen = "town" | "welcome" | "scene1" | "scene2" | "scene3" | "complete";

const sceneIndex: Record<Screen, number> = {
  town: -2,
  welcome: -1,
  scene1: 0,
  scene2: 1,
  scene3: 2,
  complete: 3,
};

const SHOP_ID = "smoothie-shop";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("town");

  const showProgress = !["town", "welcome", "complete"].includes(screen);
  const isWelcome = screen === "welcome";
  const isTown = screen === "town";

  const enterShop = (shopId: string) => {
    if (shopId !== SHOP_ID) return;
    // Returning learners (already completed) skip the intro.
    setScreen(isShopCompleted(SHOP_ID) ? "scene1" : "welcome");
  };

  const handleComplete = () => {
    markShopCompleted(SHOP_ID);
    setScreen("complete");
  };

  if (isTown) {
    return <TownMap onEnterShop={enterShop} />;
  }

  return (
    <div
      className={`min-h-screen px-4 py-5 md:py-6 ${
        isWelcome
          ? "bg-gradient-to-br from-[hsl(280,60%,92%)] via-[hsl(320,50%,93%)] to-[hsl(340,60%,92%)]"
          : "bg-background"
      }`}
    >
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <div id="main-content" className="max-w-2xl mx-auto">
        {showProgress && (
          <div className="mb-4">
            <ProgressBar currentScene={sceneIndex[screen]} totalScenes={3} />
          </div>
        )}

        {screen === "welcome" && <WelcomeScreen onStart={() => setScreen("scene1")} />}
        {screen === "scene1" && <Scene1Ratios onComplete={() => setScreen("scene2")} />}
        {screen === "scene2" && <Scene2Percentages onComplete={() => setScreen("scene3")} />}
        {screen === "scene3" && <Scene3Discounts onComplete={handleComplete} />}
        {screen === "complete" && (
          <CompletionScreen
            onRestart={() => setScreen("town")}
            onReplayScene={(scene) => setScreen(scene)}
          />
        )}
      </div>
      {showProgress && <MiniCalculator />}
      {showProgress && <KeyboardShortcutsHint />}
    </div>
  );
};

export default Index;
