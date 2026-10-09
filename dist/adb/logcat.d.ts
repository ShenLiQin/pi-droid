/**
 * Logcat — capture, search, clear, and inspect Android device logs.
 *
 * Uses `adb logcat` in dump mode (non-blocking) for safe agent consumption.
 * All output is structured for machine-readable JSON pipelines.
 */
import { type AdbExecOptions } from "./exec.js";
export interface CaptureLogcatOptions extends AdbExecOptions {
    /** Capture duration in ms (default: 5000) */
    duration?: number;
    /** Logcat filter spec, e.g. "ActivityManager:I" */
    filter?: string;
    /** Max lines to return (default: 200) */
    maxLines?: number;
    /** Clear logcat buffer before capturing (default: false) */
    clear?: boolean;
}
export interface CaptureLogcatResult {
    lines: string[];
    count: number;
    duration: number;
}
export interface SearchLogcatOptions extends AdbExecOptions {
    /** Number of recent log lines to search (default: 1000) */
    lines?: number;
}
export interface LogcatStats {
    main: string;
    system: string;
    crash: string;
}
/**
 * Capture logcat output for a duration.
 *
 * Optionally clears the buffer first, waits for the specified duration,
 * then dumps all accumulated logs via `adb logcat -d`.
 */
export declare function captureLogcat(options?: CaptureLogcatOptions): Promise<CaptureLogcatResult>;
/**
 * Search recent logcat lines matching a regex pattern.
 *
 * Uses `adb logcat -t N -d` to grab the last N lines, then filters
 * client-side with the provided pattern.
 */
export declare function searchLogcat(pattern: string, options?: SearchLogcatOptions): Promise<string[]>;
/**
 * Clear the logcat buffer on the device.
 */
export declare function clearLogcat(options?: AdbExecOptions): Promise<void>;
/**
 * Get logcat buffer sizes (main, system, crash).
 *
 * Parses the output of `adb logcat -g`.
 */
export declare function getLogcatStats(options?: AdbExecOptions): Promise<LogcatStats>;
