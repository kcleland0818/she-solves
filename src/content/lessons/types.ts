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
  activities: LessonActivity[];
}
