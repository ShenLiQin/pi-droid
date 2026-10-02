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

import { adbShell, type AdbExecOptions } from "./exec.js";

/** Screen on/off state and current orientation, reported by `dumpsys display`. */
export const DISPLAY_STATE_CMD =
  "dumpsys display | grep -E 'mScreenState|Display State=|mCurrentOrientation'";

/** Wakefulness / legacy "Display Power" state / older builds' mScreenOn. */
export const POWER_STATE_CMD = "dumpsys power | grep -E 'mWakefulness|mScreenOn|Display Power'";

/** Combined screen-on probe: display state + power wakefulness in one shell call. */
export const SCREEN_POWER_CMD =
  "dumpsys display | grep -E 'mScreenState|Display State=' ; dumpsys power | grep -E 'mWakefulness|mScreenOn|Display Power'";

/** Keyguard / lock-screen visibility across Android versions. */
export const KEYGUARD_STATE_CMD =
  "dumpsys window | grep -E 'KeyguardServiceDelegate|showing=|isKeyguardShowing|mKeyguardShowing|mDreamingLockscreen|mShowingLockscreen|isStatusBarKeyguard'";

/** Soft-keyboard visibility across Android versions. */
export const INPUT_METHOD_CMD = "dumpsys input_method | grep -E 'mInputShown|mIsImeShowing'";

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
export async function readDisplayState(options: AdbExecOptions = {}): Promise<RawDisplayState> {
  const [displayDump, powerDump, keyguardDump] = await Promise.all([
    adbShell(DISPLAY_STATE_CMD, options).catch(() => ""),
    adbShell(POWER_STATE_CMD, options).catch(() => ""),
    adbShell(KEYGUARD_STATE_CMD, options).catch(() => ""),
  ]);
  return { displayDump, powerDump, keyguardDump };
}

/**
 * True when the display is on.
 * Prefers the modern `dumpsys display` field, then power wakefulness /
 * legacy `Display Power: state=` / older `mScreenOn`.
 */
export function parseScreenOn(state: { displayDump?: string; powerDump?: string } = {}): boolean {
  const { displayDump = "", powerDump = "" } = state;

  // Preferred: dumpsys display (present on modern and older Android).
  if (/(?:mScreenState|Display State)=ON\b/.test(displayDump)) return true;
  if (/(?:mScreenState|Display State)=OFF\b/.test(displayDump)) return false;
  // Legacy `dumpsys power` (Android <= 12).
  if (/Display Power: state=ON\b/.test(powerDump)) return true;
  if (/Display Power: state=OFF\b/.test(powerDump)) return false;
  // Older builds that still print mScreenOn.
  if (/mScreenOn=true\b/.test(powerDump)) return true;
  if (/mScreenOn=false\b/.test(powerDump)) return false;
  // Last resort: wakefulness (Awake can include dozing, so it is last).
  if (/mWakefulness=Awake\b/.test(powerDump)) return true;
  if (/mWakefulness=(?:Asleep|Dozing)\b/.test(powerDump)) return false;

  return false;
}

/**
 * Parse screen-on from a single combined dump (display + power lines).
 * Convenience for callers that issue one shell call instead of three.
 */
export function parseScreenOnDump(dump = ""): boolean {
  return parseScreenOn({ displayDump: dump, powerDump: dump });
}

/**
 * True when the keyguard / lock screen is showing.
 * Matches both the modern `KeyguardServiceDelegate { showing=true }` form
 * and legacy window flags.
 */
export function parseLocked(state: { keyguardDump?: string } = {}): boolean {
  const { keyguardDump = "" } = state;
  return (
    /^[ \t]*showing=true[ \t]*$/m.test(keyguardDump) ||
    /isKeyguardShowing=true\b/.test(keyguardDump) ||
    /mKeyguardShowing=true\b/.test(keyguardDump) ||
    /isStatusBarKeyguard=true\b/.test(keyguardDump) ||
    /mDreamingLockscreen=true\b/.test(keyguardDump) ||
    /mShowingLockscreen=true\b/.test(keyguardDump)
  );
}

/** True when the soft keyboard is currently shown. */
export function parseKeyboardVisible(inputMethodDump = ""): boolean {
  return /mInputShown=true\b/.test(inputMethodDump) || /mIsImeShowing=true\b/.test(inputMethodDump);
}

/**
 * Resolve display density in dpi from a `wm density` dump, then a
 * `dumpsys window` dump. Returns 0 when unknown.
 */
export function parseDensity(...sources: string[]): number {
  for (const source of sources) {
    if (!source) continue;
    // `wm density` prints the effective override when one is set.
    const override = source.match(/Override density:\s*(\d+)/);
    if (override) return parseInt(override[1], 10);
    const physical = source.match(/Physical density:\s*(\d+)/);
    if (physical) return parseInt(physical[1], 10);
    const base = source.match(/mBaseDisplayDensity=(\d+)/);
    if (base) return parseInt(base[1], 10);
    // `dumpsys window displays` prints e.g. "init=720x1280 320dpi ...".
    const dpi = source.match(/\b(\d+)dpi\b/);
    if (dpi) return parseInt(dpi[1], 10);
  }
  return 0;
}

export interface DisplayAndLockState extends RawDisplayState {
  screenOn: boolean;
  locked: boolean;
}

/** Convenience: screenOn + locked (+ raw dumps) in one call. */
export async function getDisplayAndLockState(
  options: AdbExecOptions = {},
): Promise<DisplayAndLockState> {
  const dumps = await readDisplayState(options);
  return { ...dumps, screenOn: parseScreenOn(dumps), locked: parseLocked(dumps) };
}
