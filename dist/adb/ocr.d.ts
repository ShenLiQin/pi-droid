/**
 * OCR text extraction using Tesseract.
 *
 * Converts TSV OCR output into UIElement-compatible entries so OCR data can
 * be used as a fallback (or merged) in the same screen understanding pipeline.
 */
import type { AdbExecOptions } from "./exec.js";
import type { UIElement } from "./types.js";
/** Non-throwing check for Tesseract availability. Result is cached after first call. */
export declare function isTesseractAvailable(timeout?: number): Promise<boolean>;
export interface OcrResult {
    source: "ocr";
    screenshotPath: string;
    confidenceThreshold: number;
    elements: UIElement[];
}
export declare function runOcrOnImage(screenshotPath: string, options?: {
    confidenceThreshold?: number;
    timeout?: number;
}): Promise<OcrResult>;
export declare function runOcrOnCurrentScreen(options?: AdbExecOptions & {
    confidenceThreshold?: number;
}): Promise<OcrResult>;
