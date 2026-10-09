/**
 * Screen state detection — foreground activity, keyboard, orientation,
 * overlay detection, and activity stack inspection.
 *
 * Provides a comprehensive snapshot of what the device is currently
 * displaying, essential for reliable automation navigation.
 */
import { type AdbExecOptions } from "./exec.js";
export interface ScreenState {
    /** Is the physical screen on? */
    screenOn: boolean;
    /** Is the lock screen showing? */
    locked: boolean;
    /** Foreground app package name */
    foregroundPackage: string;
    /** Foreground activity class name */
    foregroundActivity: string;
    /** Is a dialog/popup/overlay visible? */
    hasOverlay: boolean;
    /** Is the keyboard visible? */
    keyboardVisible: boolean;
    /** Screen orientation: portrait, landscape */
    orientation: "portrait" | "landscape";
    /** Current display density */
    density: number;
}
export interface ActivityInfo {
    packageName: string;
    activityName: string;
    taskId: number;
}
/**
 * Get a comprehensive snapshot of the current screen state.
 */
export declare function getScreenState(options?: AdbExecOptions): Promise<ScreenState>;
/**
 * Get the current activity stack (back stack).
 */
export declare function getActivityStack(options?: AdbExecOptions): Promise<ActivityInfo[]>;
/**
 * Check if the soft keyboard is currently shown.
 */
export declare function isKeyboardVisible(options?: AdbExecOptions): Promise<boolean>;
/**
 * Get screen orientation.
 */
export declare function getOrientation(options?: AdbExecOptions): Promise<"portrait" | "landscape">;
/**
 * Wait until a specific app/activity is in the foreground.
 *
 * @returns true if the target was found before timeout, false otherwise
 */
export declare function waitForActivity(packageName: string, activityName?: string, options?: AdbExecOptions & {
    timeout?: number;
    interval?: number;
}): Promise<boolean>;
