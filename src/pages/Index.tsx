import { useState } from "react";
import WelcomeScreen from "@/components/WelcomeScreen";
import Scene1Ratios from "@/components/Scene1Ratios";
import Scene2Percentages from "@/components/Scene2Percentages";
import Scene3Discounts from "@/components/Scene3Discounts";
import CompletionScreen from "@/components/CompletionScreen";
import ProgressBar from "@/components/ProgressBar";
import MiniCalculator from "@/components/MiniCalculator";

type Screen = "welcome" | "scene1" | "scene2" | "scene3" | "complete";

const sceneIndex: Record<Screen, number> = {
  welcome: -1,
  scene1: 0,
  scene2: 1,
  scene3: 2,
  complete: 3,
};

const Index = () => {
  const [screen, setScreen] = useState<Screen>("welcome");

  const showProgress = screen !== "welcome" && screen !== "complete";
  const isWelcome = screen === "welcome";

  return (
    <div
      className={`min-h-screen px-4 py-6 md:py-10 ${
        isWelcome
          ? "bg-gradient-to-br from-[hsl(280,60%,92%)] via-[hsl(320,50%,93%)] to-[hsl(340,60%,92%)]"
          : "bg-background"
      }`}
    >
      <div className="max-w-2xl mx-auto">
        {showProgress && (
          <div className="mb-8">
            <ProgressBar currentScene={sceneIndex[screen]} totalScenes={3} />
          </div>
        )}

        {screen === "welcome" && <WelcomeScreen onStart={() => setScreen("scene1")} />}
        {screen === "scene1" && <Scene1Ratios onComplete={() => setScreen("scene2")} />}
        {screen === "scene2" && <Scene2Percentages onComplete={() => setScreen("scene3")} />}
        {screen === "scene3" && <Scene3Discounts onComplete={() => setScreen("complete")} />}
        {screen === "complete" && <CompletionScreen onRestart={() => setScreen("welcome")} />}
      </div>
    </div>
  );
};

export default Index;
