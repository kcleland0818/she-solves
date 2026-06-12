import { useState, useEffect, useCallback } from "react";
import TownMap from "@/components/TownMap";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import ReloadDebugButton from "@/components/ReloadDebugButton";
import LessonRunner, { type RunnerStage } from "@/components/LessonRunner";
import smoothieLesson from "@/content/lessons/smoothie.json";
import bakeryLesson from "@/content/lessons/bakery.json";
import bookstoreLesson from "@/content/lessons/bookstore.json";
import type { Lesson } from "@/content/lessons/types";
import { isShopCompleted } from "@/lib/progress";

type Shop = "smoothie" | "bakery" | "bookstore";

const LESSONS = {
  smoothie: smoothieLesson as Lesson,
  bakery: bakeryLesson as Lesson,
  bookstore: bookstoreLesson as Lesson,
};

const SHOP_BY_ID: Record<string, Shop> = {
  [LESSONS.smoothie.id]: "smoothie",
  [LESSONS.bakery.id]: "bakery",
  [LESSONS.bookstore.id]: "bookstore",
};

type Screen =
  | { kind: "town" }
  | { kind: "shop"; shop: Shop; stage: RunnerStage };

const SCREEN_STORAGE_KEY = "shesolves:screen";

const isValidStage = (s: unknown): s is RunnerStage => {
  if (!s || typeof s !== "object") return false;
  const k = (s as { kind?: unknown }).kind;
  if (k === "welcome" || k === "complete") return true;
  if (k === "activity") {
    const idx = (s as { idx?: unknown }).idx;
    return typeof idx === "number" && idx >= 0;
  }
  return false;
};

const getInitialScreen = (): Screen => {
  if (typeof window === "undefined") return { kind: "town" };
  try {
    const raw = window.sessionStorage.getItem(SCREEN_STORAGE_KEY);
    if (!raw) return { kind: "town" };
    const parsed = JSON.parse(raw);
    if (parsed?.kind === "town") return { kind: "town" };
    if (
      parsed?.kind === "shop" &&
      (parsed.shop === "smoothie" || parsed.shop === "bakery" || parsed.shop === "bookstore") &&
      isValidStage(parsed.stage)
    ) {
      const lesson = LESSONS[parsed.shop as Shop];
      if (parsed.stage.kind === "activity" && parsed.stage.idx >= lesson.activities.length) {
        return { kind: "town" };
      }
      return { kind: "shop", shop: parsed.shop as Shop, stage: parsed.stage as RunnerStage };
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
    const shop = SHOP_BY_ID[shopId];
    if (!shop) return;
    const stage: RunnerStage = isShopCompleted(LESSONS[shop].id)
      ? { kind: "activity", idx: 0 }
      : { kind: "welcome" };
    setScreen({ kind: "shop", shop, stage });
  };

  const goToTown = () => setScreen({ kind: "town" });

  const handleStageChange = useCallback((stage: RunnerStage) => {
    setScreen((s) => (s.kind === "shop" ? { ...s, stage } : s));
  }, []);

  if (screen.kind === "town") {
    return (
      <>
        <TownMap onEnterShop={enterShop} />
        <ThemeSwitcher />
        <ReloadDebugButton />
      </>
    );
  }

  return (
    <>
      <LessonRunner
        key={screen.shop}
        lesson={LESSONS[screen.shop]}
        initialStage={screen.stage}
        onStageChange={handleStageChange}
        onExit={goToTown}
      />
      <ThemeSwitcher />
      <ReloadDebugButton />
    </>
  );
};

export default Index;
