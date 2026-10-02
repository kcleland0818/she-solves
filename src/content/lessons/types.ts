import type { ComponentId } from "./registry";

export interface LessonActivity {
  id: string;
  component: ComponentId;
}

export interface Lesson {
  id: string;
  shopName: string;
  bgClass: string;
  progressLabels: string[];
  welcome: ComponentId;
  completion: ComponentId;
  /** Optional endless-practice component, entered from the completion screen. */
  practice?: ComponentId;
  activities: LessonActivity[];
}
