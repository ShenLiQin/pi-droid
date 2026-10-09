/**
 * App lifecycle management — launch, stop, check state.
 */
import { type AdbExecOptions } from "./exec.js";
import type { AppInfo } from "./types.js";
/**
 * Launch an app by package name.
 */
export declare function launchApp(packageName: string, options?: AdbExecOptions & {
    activity?: string;
}): Promise<void>;
/**
 * Force stop an app.
 */
export declare function stopApp(packageName: string, options?: AdbExecOptions): Promise<void>;
/**
 * Check if an app is running and in foreground.
 */
export declare function getAppInfo(packageName: string, options?: AdbExecOptions): Promise<AppInfo>;
/**
 * List installed packages matching a filter.
 */
export declare function listPackages(filter?: string, options?: AdbExecOptions): Promise<string[]>;
/**
 * Keep the screen on (disable auto-sleep).
 */
export declare function keepScreenOn(options?: AdbExecOptions): Promise<void>;
/**
 * Restore default screen timeout behavior.
 */
export declare function restoreScreenTimeout(options?: AdbExecOptions): Promise<void>;
/**
 * Wake up the device screen.
 */
export declare function wakeScreen(options?: AdbExecOptions): Promise<void>;
/**
 * Check if screen is on.
 */
export declare function isScreenOn(options?: AdbExecOptions): Promise<boolean>;
