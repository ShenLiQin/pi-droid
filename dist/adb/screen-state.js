/**
 * Screen state detection — foreground activity, keyboard, orientation,
 * overlay detection, and activity stack inspection.
 *
 * Provides a comprehensive snapshot of what the device is currently
 * displaying, essential for reliable automation navigation.
 */
import { adbShell } from "./exec.js";
import { DISPLAY_STATE_CMD, INPUT_METHOD_CMD, KEYGUARD_STATE_CMD, POWER_STATE_CMD, parseDensity, parseKeyboardVisible, parseLocked, parseScreenOn, } from "./display-state.js";
// ── Helpers ─────────────────────────────────────────────────────────
/**
 * Parse package/activity from a dumpsys window line.
 * Handles both mCurrentFocus and mFocusedApp formats:
 *   mCurrentFocus=Window{abc u0 com.example/.MainActivity}
 *   mFocusedApp=AppWindowToken{... ActivityRecord{abc com.example/.MainActivity t42}}
 */
function parseFocusLine(line) {
    // Match "package/activity" pattern anywhere in the line
    const match = line.match(/([a-zA-Z0-9_.]+)\/(\.?[a-zA-Z0-9_.$]+)/);
    if (match) {
        return { packageName: match[1], activityName: match[2] };
    }
    return { packageName: "unknown", activityName: "unknown" };
}
// ── Public API ──────────────────────────────────────────────────────
/**
 * Get a comprehensive snapshot of the current screen state.
 */
export async function getScreenState(options = {}) {
    // Run the dumpsys/wm probes in parallel for speed. The first five calls keep
    // their original order; `wm density` is appended for a reliable density read.
    const [windowDump, inputMethodDump, displayDump, powerDump, keyguardDump, wmDensityDump] = await Promise.all([
        adbShell("dumpsys window", options),
        adbShell(INPUT_METHOD_CMD, options).catch(() => ""),
        adbShell(DISPLAY_STATE_CMD, options).catch(() => ""),
        adbShell(POWER_STATE_CMD, options).catch(() => ""),
        adbShell(KEYGUARD_STATE_CMD, options).catch(() => ""),
        adbShell("wm density", options).catch(() => ""),
    ]);
    // Screen on/off — prefers `dumpsys display`, falls back to power wakefulness.
    const screenOn = parseScreenOn({ displayDump, powerDump });
    // Lock screen — keyguard flags across Android versions.
    const locked = parseLocked({ keyguardDump });
    // Foreground activity from mCurrentFocus
    let foregroundPackage = "unknown";
    let foregroundActivity = "unknown";
    const focusLine = windowDump
        .split("\n")
        .find((l) => l.includes("mCurrentFocus"));
    if (focusLine) {
        const parsed = parseFocusLine(focusLine);
        foregroundPackage = parsed.packageName;
        foregroundActivity = parsed.activityName;
    }
    // Overlay / popup detection — mCurrentFocus differs from mFocusedApp
    let hasOverlay = false;
    const focusedAppLine = windowDump
        .split("\n")
        .find((l) => l.includes("mFocusedApp"));
    if (focusLine && focusedAppLine) {
        const currentParsed = parseFocusLine(focusLine);
        const focusedParsed = parseFocusLine(focusedAppLine);
        // If current focus window doesn't match the focused app, there's an overlay
        hasOverlay = currentParsed.packageName !== focusedParsed.packageName;
    }
    // Keyboard visibility
    const keyboardVisible = parseKeyboardVisible(inputMethodDump);
    // Orientation
    let orientation = "portrait";
    const orientMatch = displayDump.match(/mCurrentOrientation=(\d)/);
    if (orientMatch) {
        const val = parseInt(orientMatch[1]);
        orientation = val === 1 || val === 3 ? "landscape" : "portrait";
    }
    // Density — prefer `wm density`, then window display info.
    const density = parseDensity(wmDensityDump, windowDump);
    return {
        screenOn,
        locked,
        foregroundPackage,
        foregroundActivity,
        hasOverlay,
        keyboardVisible,
        orientation,
        density,
    };
}
/**
 * Get the current activity stack (back stack).
 */
export async function getActivityStack(options = {}) {
    const output = await adbShell("dumpsys activity activities", options);
    const activities = [];
    // Parse lines like: "* TaskRecord{abc123 #42 A=com.example U=0 StackId=1 sz=2}"
    // Followed by: "* Hist #0: ActivityRecord{abc com.example/.MainActivity t42}"
    let currentTaskId = 0;
    for (const line of output.split("\n")) {
        // Extract task ID
        const taskMatch = line.match(/TaskRecord\{[^\s]+\s+#(\d+)/);
        if (taskMatch) {
            currentTaskId = parseInt(taskMatch[1]);
        }
        // Extract activity record
        const actMatch = line.match(/ActivityRecord\{[^\s]+\s+([a-zA-Z0-9_.]+)\/(\.?[a-zA-Z0-9_.]+)\s+t(\d+)/);
        if (actMatch) {
            activities.push({
                packageName: actMatch[1],
                activityName: actMatch[2],
                taskId: parseInt(actMatch[3]),
            });
        }
    }
    return activities;
}
/**
 * Check if the soft keyboard is currently shown.
 */
export async function isKeyboardVisible(options = {}) {
    try {
        const output = await adbShell(INPUT_METHOD_CMD, options);
        return parseKeyboardVisible(output);
    }
    catch {
        return false;
    }
}
/**
 * Get screen orientation.
 */
export async function getOrientation(options = {}) {
    try {
        const output = await adbShell("dumpsys display | grep mCurrentOrientation", options);
        const match = output.match(/mCurrentOrientation=(\d)/);
        if (match) {
            const val = parseInt(match[1]);
            return val === 1 || val === 3 ? "landscape" : "portrait";
        }
    }
    catch {
        // fallback
    }
    // Fallback: use wm rotation
    try {
        const output = await adbShell("settings get system user_rotation", options);
        const val = parseInt(output.trim());
        return val === 1 || val === 3 ? "landscape" : "portrait";
    }
    catch {
        return "portrait";
    }
}
/**
 * Wait until a specific app/activity is in the foreground.
 *
 * @returns true if the target was found before timeout, false otherwise
 */
export async function waitForActivity(packageName, activityName, options = {}) {
    const timeout = options.timeout ?? 10_000;
    const interval = options.interval ?? 500;
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
        try {
            const output = await adbShell("dumpsys window | grep mCurrentFocus", options);
            const match = output.match(/\{[^}]*\s+([a-zA-Z0-9_.]+)\/(\.?[a-zA-Z0-9_.$]+)\}/);
            if (match) {
                const currentPkg = match[1];
                const currentActivity = match[2];
                if (currentPkg === packageName) {
                    if (!activityName || currentActivity === activityName
                        || currentActivity.endsWith(`.${activityName}`)
                        || currentActivity.endsWith(`$${activityName}`)) {
                        return true;
                    }
                }
            }
        }
        catch {
            // ADB call failed, retry
        }
        // Wait before next poll
        await new Promise((resolve) => setTimeout(resolve, interval));
    }
    return false;
}
//# sourceMappingURL=screen-state.js.map