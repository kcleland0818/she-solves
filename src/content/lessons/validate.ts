import { COMPONENTS } from "./registry";
import type { Lesson } from "./types";

export interface LessonValidationIssue {
  path: string;
  message: string;
}

export interface LessonValidationResult {
  valid: boolean;
  issues: LessonValidationIssue[];
}

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0;

const isKnownComponent = (id: unknown): boolean =>
  typeof id === "string" && Object.prototype.hasOwnProperty.call(COMPONENTS, id);

/**
 * Validate a lesson JSON object against the runtime shape the LessonRunner
 * expects. Catches missing fields, unknown component IDs, empty activity lists,
 * and duplicate activity IDs before we try to render.
 */
export const validateLesson = (lesson: unknown): LessonValidationResult => {
  const issues: LessonValidationIssue[] = [];
  const push = (path: string, message: string) => issues.push({ path, message });

  if (!lesson || typeof lesson !== "object") {
    return { valid: false, issues: [{ path: "$", message: "Lesson is missing or not an object." }] };
  }

  const l = lesson as Partial<Lesson> & Record<string, unknown>;

  if (!isNonEmptyString(l.id)) push("id", "Missing lesson id.");
  if (!isNonEmptyString(l.shopName)) push("shopName", "Missing shopName.");
  if (!isNonEmptyString(l.bgClass)) push("bgClass", "Missing bgClass.");

  if (!isNonEmptyString(l.welcome)) {
    push("welcome", "Missing welcome component id.");
  } else if (!isKnownComponent(l.welcome)) {
    push("welcome", `Unknown component "${l.welcome}".`);
  }

  if (!isNonEmptyString(l.completion)) {
    push("completion", "Missing completion component id.");
  } else if (!isKnownComponent(l.completion)) {
    push("completion", `Unknown component "${l.completion}".`);
  }

  if (!Array.isArray(l.activities) || l.activities.length === 0) {
    push("activities", "Lesson must have at least one activity.");
  } else {
    const seenIds = new Set<string>();
    l.activities.forEach((a, i) => {
      const base = `activities[${i}]`;
      if (!a || typeof a !== "object") {
        push(base, "Activity entry is not an object.");
        return;
      }
      if (!isNonEmptyString(a.id)) {
        push(`${base}.id`, "Activity is missing an id.");
      } else if (seenIds.has(a.id)) {
        push(`${base}.id`, `Duplicate activity id "${a.id}".`);
      } else {
        seenIds.add(a.id);
      }
      if (!isNonEmptyString(a.component)) {
        push(`${base}.component`, "Activity is missing a component id.");
      } else if (!isKnownComponent(a.component)) {
        push(`${base}.component`, `Unknown component "${a.component}".`);
      }
    });

    if (Array.isArray(l.progressLabels) && l.progressLabels.length !== l.activities.length) {
      push(
        "progressLabels",
        `progressLabels length (${l.progressLabels.length}) does not match activities length (${l.activities.length}).`,
      );
    }
  }

  return { valid: issues.length === 0, issues };
};
