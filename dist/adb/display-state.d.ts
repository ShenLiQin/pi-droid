/**
 * Shared display / keyguard state detection.
 *
 * Newer Android (13+) changed `dumpsys power` so the legacy
 * "Display Power: state=ON" line is gone — it now prints an object
 * reference (e.g. "Display Power: com.android.server.power.PowerManagerService$1@...")
 * — and the keyguard indicator moved. Querying only those old fields made
 * screen/lock checks silently report `false` on modern devices.
 *
 * These helpers query the display/keyguard dumps that are stable across
 * versions and parse them tolerantly, with legacy fallbacks. They are shared
 * by `screen-state.ts`, `app.ts` and `monitor.ts` so the logic lives in one
 * place.
 */
import { type AdbExecOptions } from "./exec.js";
/** Screen on/off state and current orientation, reported by `dumpsys display`. */
export declare const DISPLAY_STATE_CMD = "dumpsys display | grep -E 'mScreenState|Display State=|mCurrentOrientation'";
/** Wakefulness / legacy "Display Power" state / older builds' mScreenOn. */
export declare const POWER_STATE_CMD = "dumpsys power | grep -E 'mWakefulness|mScreenOn|Display Power'";
/** Combined screen-on probe: display state + power wakefulness in one shell call. */
export declare const SCREEN_POWER_CMD = "dumpsys display | grep -E 'mScreenState|Display State=' ; dumpsys power | grep -E 'mWakefulness|mScreenOn|Display Power'";
/** Keyguard / lock-screen visibility across Android versions. */
export declare const KEYGUARD_STATE_CMD = "dumpsys window | grep -E 'KeyguardServiceDelegate|showing=|isKeyguardShowing|mKeyguardShowing|mDreamingLockscreen|mShowingLockscreen|isStatusBarKeyguard'";
/** Soft-keyboard visibility across Android versions. */
export declare const INPUT_METHOD_CMD = "dumpsys input_method | grep -E 'mInputShown|mIsImeShowing'";
export interface RawDisplayState {
    /** `dumpsys display` screen-state/orientation lines (empty on failure). */
    displayDump: string;
    /** `dumpsys power` wakefulness / legacy display-power lines. */
    powerDump: string;
    /** `dumpsys window` keyguard lines. */
    keyguardDump: string;
}
/**
 * Read the raw display / power / keyguard dumps in parallel.
 * Each field is an empty string when the underlying call fails.
 */
export declare function readDisplayState(options?: AdbExecOptions): Promise<RawDisplayState>;
/**
 * True when the display is on.
 * Prefers the modern `dumpsys display` field, then power wakefulness /
 * legacy `Display Power: state=` / older `mScreenOn`.
 */
export declare function parseScreenOn(state?: {
    displayDump?: string;
    powerDump?: string;
}): boolean;
/**
 * Parse screen-on from a single combined dump (display + power lines).
 * Convenience for callers that issue one shell call instead of three.
 */
export declare function parseScreenOnDump(dump?: string): boolean;
/**
 * True when the keyguard / lock screen is showing.
 * Matches both the modern `KeyguardServiceDelegate { showing=true }` form
 * and legacy window flags.
 */
export declare function parseLocked(state?: {
    keyguardDump?: string;
}): boolean;
/** True when the soft keyboard is currently shown. */
export declare function parseKeyboardVisible(inputMethodDump?: string): boolean;
/**
 * Resolve display density in dpi from a `wm density` dump, then a
 * `dumpsys window` dump. Returns 0 when unknown.
 */
export declare function parseDensity(...sources: string[]): number;
export interface DisplayAndLockState extends RawDisplayState {
    screenOn: boolean;
    locked: boolean;
}
/** Convenience: screenOn + locked (+ raw dumps) in one call. */
export declare function getDisplayAndLockState(options?: AdbExecOptions): Promise<DisplayAndLockState>;
