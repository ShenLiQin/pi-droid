/**
 * Automation helpers — higher-level composed operations built on
 * the low-level ADB primitives.
 *
 * These are convenience functions that combine multiple ADB calls
 * into common automation workflows.
 */
import { type AdbExecOptions } from "./exec.js";
import type { ElementSelector, UIElement, ScreenshotResult, StuckDetector, TaskBudget } from "./types.js";
type AutomationOptions = AdbExecOptions & {
    taskBudget?: TaskBudget;
};
/**
 * Ensure the device is awake, unlocked (swipe-only), and showing the
 * home screen or the requested app. A common "get ready" preamble.
 */
export declare function ensureReady(options?: AutomationOptions & {
    packageName?: string;
}): Promise<{
    wasAsleep: boolean;
    launched: boolean;
}>;
/**
 * Take a screenshot and dump UI tree in parallel, returning both.
 * The fundamental "observe" operation for any automation loop.
 */
export declare function observe(options?: AdbExecOptions & {
    includeBase64?: boolean;
}): Promise<{
    screenshot: ScreenshotResult;
    foregroundPackage: string;
    interactiveElements: UIElement[];
    allElements: UIElement[];
}>;
/**
 * Find an element and tap it, with retry logic. Returns the element
 * that was tapped, or null if not found after retries.
 */
export declare function findAndTap(selector: ElementSelector, options?: AutomationOptions & {
    retries?: number;
    retryDelay?: number;
    stuckDetector?: StuckDetector;
}): Promise<UIElement | null>;
/**
 * Wait for an element, tap it, then wait for a follow-up element.
 * Common pattern: tap a button → wait for the next screen to load.
 */
export declare function tapAndWait(tapSelector: ElementSelector, waitSelector: ElementSelector, options?: AutomationOptions & {
    tapTimeout?: number;
    waitTimeout?: number;
    stuckDetector?: StuckDetector;
}): Promise<{
    tapped: UIElement;
    found: UIElement | null;
}>;
/**
 * Type text into a field identified by selector.
 * Taps the field first, waits for keyboard, then types.
 */
export declare function typeIntoField(selector: ElementSelector, text: string, options?: AutomationOptions & {
    clearFirst?: boolean;
    stuckDetector?: StuckDetector;
}): Promise<UIElement>;
/**
 * Scroll until an element is found, or give up after maxScrolls.
 */
export declare function scrollToFind(selector: ElementSelector, options?: AutomationOptions & {
    direction?: "down" | "up";
    maxScrolls?: number;
    stuckDetector?: StuckDetector;
}): Promise<UIElement | null>;
export {};
