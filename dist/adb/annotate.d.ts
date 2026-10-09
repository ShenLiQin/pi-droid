/**
 * Annotated screenshots — overlay numbered element labels for LLM understanding.
 *
 * Takes a screenshot and UI dump in parallel, then generates:
 * 1. A text index mapping element numbers to their info
 * 2. Annotation data (coordinates + labels) that can be overlaid on the image
 *
 * Note: Actual image rendering is optional (requires canvas/sharp).
 * The text index alone is often sufficient for LLM understanding.
 */
import type { AdbExecOptions } from "./exec.js";
export interface AnnotatedElement {
    /** Sequential label number */
    label: number;
    /** Element display text (text > contentDesc > resourceId > className) */
    displayText: string;
    /** Element type (last part of className) */
    type: string;
    /** Center coordinates */
    center: {
        x: number;
        y: number;
    };
    /** Bounding box */
    bounds: {
        left: number;
        top: number;
        right: number;
        bottom: number;
    };
    /** Interaction flags */
    clickable: boolean;
    scrollable: boolean;
    /** Raw resource ID */
    resourceId: string;
}
export interface AnnotatedScreenshot {
    /** Screenshot file path */
    screenshotPath: string;
    /** Screenshot as base64 (if requested) */
    screenshotBase64?: string;
    /** UI dump XML path */
    xmlPath: string;
    /** Foreground package */
    foregroundPackage: string;
    /** Annotated interactive elements */
    elements: AnnotatedElement[];
    /** Human-readable text index for LLM consumption */
    textIndex: string;
    /** Total interactive elements found */
    count: number;
}
/**
 * Capture an annotated screenshot — screenshot + UI dump in parallel.
 *
 * Returns the screenshot, a numbered list of interactive elements,
 * and a text index the LLM can use to identify elements by number.
 */
export declare function annotatedScreenshot(options?: AdbExecOptions & {
    includeBase64?: boolean;
    allElements?: boolean;
}): Promise<AnnotatedScreenshot>;
/**
 * Generate annotation overlay data as SVG (can be composited on the screenshot).
 * Returns SVG string with numbered rectangles at element positions.
 */
export declare function generateAnnotationSvg(elements: AnnotatedElement[], width: number, height: number): string;
