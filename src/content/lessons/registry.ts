import { lazy, type LazyExoticComponent, type ComponentType } from "react";

// Single registry: lesson JSON references components by string id; the runner
// looks them up here. Adding a new component = one entry below.
export const COMPONENTS = {
  // Smoothie
  WelcomeScreen: lazy(() => import("@/components/WelcomeScreen")),
  Scene1Ratios: lazy(() => import("@/components/Scene1Ratios")),
  Scene2Percentages: lazy(() => import("@/components/Scene2Percentages")),
  Scene3Discounts: lazy(() => import("@/components/Scene3Discounts")),
  CompletionScreen: lazy(() => import("@/components/CompletionScreen")),

  // Bakery
  BakeryWelcome: lazy(() => import("@/components/BakeryWelcome")),
  BakeryScene1: lazy(() => import("@/components/BakeryScene1")),
  BakeryScene2: lazy(() => import("@/components/BakeryScene2")),
  BakeryScene3: lazy(() => import("@/components/BakeryScene3")),
  BakeryPractice: lazy(() => import("@/components/BakeryPractice")),
  BakeryCompletion: lazy(() => import("@/components/BakeryCompletion")),

  // Bookstore
  BookstoreWelcome: lazy(() => import("@/components/BookstoreWelcome")),
  BookstoreScene1: lazy(() => import("@/components/BookstoreScene1")),
  BookstoreScene2: lazy(() => import("@/components/BookstoreScene2")),
  BookstoreScene3: lazy(() => import("@/components/BookstoreScene3")),
  BookstoreCompletion: lazy(() => import("@/components/BookstoreCompletion")),
} as const satisfies Record<string, LazyExoticComponent<ComponentType<any>>>;

export type ComponentId = keyof typeof COMPONENTS;
