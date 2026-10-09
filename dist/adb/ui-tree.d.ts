/**
 * UI hierarchy dumping and parsing.
 *
 * Uses `uiautomator dump` to capture the UI tree, parses XML into
 * structured UIElement objects, and supports selector-based element finding.
 */
import { type AdbExecOptions } from "./exec.js";
import type { UIElement, UITreeResult, ElementSelector } from "./types.js";
export declare function setUiDumpDir(dir: string): void;
/**
 * Dump and parse the current UI hierarchy.
 * Uses cache if available and fresh (avoids redundant ~500ms dumps).
 */
export declare function dumpUiTree(options?: AdbExecOptions & {
    skipCache?: boolean;
    ocrConfidenceThreshold?: number;
    debug?: boolean;
}): Promise<UITreeResult>;
/**
 * Find elements matching a selector.
 */
export declare function findElements(elements: UIElement[], selector: ElementSelector): UIElement[];
/**
 * Find a single element matching a selector, or null.
 */
export declare function findElement(elements: UIElement[], selector: ElementSelector): UIElement | null;
/**
 * Wait for an element matching a selector to appear.
 */
export declare function waitForElement(selector: ElementSelector, options?: AdbExecOptions & {
    timeout?: number;
    interval?: number;
}): Promise<UIElement | null>;
/**
 * Get a text summary of interactive elements (for LLM context).
 */
export declare function summarizeTree(tree: UITreeResult): string;
