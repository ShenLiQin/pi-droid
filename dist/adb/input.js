/**
 * Input actions: tap, swipe, type text, key events.
 *
 * Supports both coordinate-based and selector-based interactions.
 * ASCII text is typed with the system `input text` command; Unicode text goes
 * through the ADBKeyboard IME.
 */
import { adbShell } from "./exec.js";
import { invalidateCache } from "./cache.js";
/** Validate and round a coordinate value for ADB input commands. */
function validCoord(value, name) {
    if (!Number.isFinite(value) || value < 0) {
        throw new Error(`Invalid coordinate ${name}: ${value} (must be a non-negative finite number)`);
    }
    return Math.round(value);
}
/** Escape a value for safe use in an adb shell command argument. */
function shellEscape(value) {
    return `'${value.replace(/'/g, "'\\''")}'`;
}
/**
 * Tap at screen coordinates.
 */
export async function tap(x, y, options = {}) {
    const rx = validCoord(x, "x");
    const ry = validCoord(y, "y");
    invalidateCache();
    if (options.duration && options.duration > 0) {
        await adbShell(`input swipe ${rx} ${ry} ${rx} ${ry} ${options.duration}`, options);
    }
    else {
        await adbShell(`input tap ${rx} ${ry}`, options);
    }
}
/**
 * Swipe from one point to another.
 */
export async function swipe(x1, y1, x2, y2, options = {}) {
    const rx1 = validCoord(x1, "x1");
    const ry1 = validCoord(y1, "y1");
    const rx2 = validCoord(x2, "x2");
    const ry2 = validCoord(y2, "y2");
    invalidateCache();
    const duration = options.duration ?? 300;
    await adbShell(`input swipe ${rx1} ${ry1} ${rx2} ${ry2} ${duration}`, options);
}
/**
 * Type text into the currently focused field.
 *
 * Strategy:
 *  - ASCII-only text is entered with the system `input text` command. This
 *    works whether or not a soft keyboard is visible, so it is reliable on
 *    devices with a hardware keyboard attached (e.g. emulators) where the IME
 *    input view may never be shown.
 *  - Non-ASCII (Unicode) text is sent through the ADBKeyboard IME, which is
 *    also used when `useAdbKeyboard` is explicitly true.
 *
 * ADBKeyboard only registers its broadcast receiver in `onCreateInputView()`,
 * i.e. when its input view is actually shown. On devices with a hardware
 * keyboard and `show_ime_with_hard_keyboard=0` the view (and therefore the
 * receiver) never appears and `ADB_INPUT_B64` broadcasts are silently dropped,
 * so we enable that setting before using the broadcast path.
 */
export async function typeText(text, options = {}) {
    invalidateCache();
    if (options.clear) {
        // Move to the end of the field, then delete a generous number of
        // characters in a single `input` invocation.
        await adbShell("input keyevent KEYCODE_MOVE_END", options);
        const deletes = new Array(100).fill("KEYCODE_DEL").join(" ");
        await adbShell(`input keyevent ${deletes}`, options);
    }
    const asciiOnly = /^[\x20-\x7e\r\n\t]*$/.test(text);
    const useAdbKeyboard = options.useAdbKeyboard === true || (options.useAdbKeyboard !== false && !asciiOnly);
    if (!useAdbKeyboard) {
        // Reliable path: `input text` handles spaces and shell metacharacters
        // via single-quote escaping (verified for % & ( ) ' ").
        await adbShell(`input text ${shellEscape(text)}`, options);
        return;
    }
    // ADBKeyboard path (Unicode, or explicitly requested).
    await typeViaAdbKeyboard(text, options);
}
const ADB_KEYBOARD_IME = "com.android.adbkeyboard/.AdbIME";
/** Whether the ADBKeyboard broadcast receiver is currently registered. */
async function adbKeyboardReceiverRegistered(options) {
    try {
        const out = await adbShell("dumpsys activity broadcasts | sed -n '/Registered Receivers:/,/Historical Broadcast/p' | grep adbkeyboard | head -n 1", options);
        return out.trim().length > 0;
    }
    catch {
        // grep exits non-zero when there is no match.
        return false;
    }
}
/**
 * Send text through the ADBKeyboard IME.
 *
 * ADBKeyboard registers its `ADB_INPUT_B64` receiver from
 * `onCreateInputView()`, so the broadcast only works once its input view has
 * been shown. Devices with a hardware keyboard keep the soft IME hidden unless
 * `show_ime_with_hard_keyboard` is enabled, and an already-bound IME only
 * recreates its input view when the IME session is recreated. We therefore
 * enable that setting and, if needed, bounce the IME selection before
 * broadcasting so the receiver is guaranteed to exist.
 */
async function typeViaAdbKeyboard(text, options) {
    try {
        await adbShell("settings put secure show_ime_with_hard_keyboard 1", options);
    }
    catch {
        // Non-fatal; the broadcast below may still reach an existing receiver.
    }
    if (!(await adbKeyboardReceiverRegistered(options))) {
        try {
            const enabled = (await adbShell("ime list -s", options))
                .split(/\r?\n/)
                .map((id) => id.trim())
                .filter((id) => id.length > 0 && id !== ADB_KEYBOARD_IME);
            if (enabled.length > 0) {
                await adbShell(`ime set '${enabled[0]}'`, options);
            }
        }
        catch {
            // Ignore; fall through to re-selecting ADBKeyboard.
        }
        try {
            await adbShell(`ime set '${ADB_KEYBOARD_IME}'`, options);
        }
        catch {
            // Ignore; the broadcast may still work.
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    const encoded = Buffer.from(text, "utf-8").toString("base64");
    await adbShell(`am broadcast -a ADB_INPUT_B64 --es msg '${encoded}'`, options);
}
/**
 * Send a key event.
 */
export async function keyEvent(keycode, options = {}) {
    invalidateCache();
    await adbShell(`input keyevent ${keycode}`, options);
}
/**
 * Press the back button.
 */
export async function pressBack(options = {}) {
    await keyEvent("KEYCODE_BACK", options);
}
/**
 * Press the home button.
 */
export async function pressHome(options = {}) {
    await keyEvent("KEYCODE_HOME", options);
}
/**
 * Press enter/return.
 */
export async function pressEnter(options = {}) {
    await keyEvent("KEYCODE_ENTER", options);
}
/** Common scroll gesture — scroll down on center of screen */
export async function scrollDown(screenWidth, screenHeight, options = {}) {
    const cx = Math.round(screenWidth / 2);
    const fromY = Math.round(screenHeight * 0.7);
    const toY = Math.round(screenHeight * 0.3);
    await swipe(cx, fromY, cx, toY, { duration: 400, ...options });
}
/** Common scroll gesture — scroll up on center of screen */
export async function scrollUp(screenWidth, screenHeight, options = {}) {
    const cx = Math.round(screenWidth / 2);
    const fromY = Math.round(screenHeight * 0.3);
    const toY = Math.round(screenHeight * 0.7);
    await swipe(cx, fromY, cx, toY, { duration: 400, ...options });
}
//# sourceMappingURL=input.js.map