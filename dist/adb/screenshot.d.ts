/**
 * Screenshot capture — pull screenshots from device to local storage.
 */
import { type AdbExecOptions } from "./exec.js";
import type { ScreenshotResult } from "./types.js";
export declare function setScreenshotDir(dir: string): void;
/**
 * Take a screenshot and pull it to local storage.
 */
export declare function takeScreenshot(options?: AdbExecOptions & {
    prefix?: string;
    includeBase64?: boolean;
}): Promise<ScreenshotResult>;
/**
 * Take a screenshot and return base64 directly (no file save).
 */
export declare function screenshotBase64(options?: AdbExecOptions): Promise<string>;
