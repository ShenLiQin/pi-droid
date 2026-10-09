/**
 * System settings control — toggles and adjustments for WiFi, Bluetooth,
 * brightness, volume, screen timeout, location, and more.
 *
 * Uses `adb shell svc`, `adb shell settings`, and `adb shell cmd` to
 * modify device state without requiring root.
 */
import { adbShell } from "./exec.js";
/** Escape a value for safe use in an adb shell command argument. */
function shellEscape(value) {
    return `'${value.replace(/'/g, "'\\''")}'`;
}
// ── WiFi ────────────────────────────────────────────────────────────
export async function setWifiEnabled(enabled, options = {}) {
    await adbShell(`svc wifi ${enabled ? "enable" : "disable"}`, options);
}
export async function isWifiEnabled(options = {}) {
    const output = await adbShell("settings get global wifi_on", options);
    return output.trim() === "1";
}
// ── Bluetooth ───────────────────────────────────────────────────────
export async function setBluetoothEnabled(enabled, options = {}) {
    // svc bluetooth was added in Android 12+ ; cmd works on older
    try {
        await adbShell(`cmd bluetooth_manager ${enabled ? "enable" : "disable"}`, options);
    }
    catch {
        // Fallback for older Android versions
        await adbShell(`svc bluetooth ${enabled ? "enable" : "disable"}`, options);
    }
}
export async function isBluetoothEnabled(options = {}) {
    const output = await adbShell("settings get global bluetooth_on", options);
    return output.trim() === "1";
}
// ── Airplane Mode ───────────────────────────────────────────────────
export async function setAirplaneMode(enabled, options = {}) {
    await adbShell(`settings put global airplane_mode_on ${enabled ? 1 : 0}`, options);
    // Broadcast the change so the system reacts
    await adbShell(`am broadcast -a android.intent.action.AIRPLANE_MODE --ez state ${enabled}`, options);
}
// ── Brightness ──────────────────────────────────────────────────────
export async function setBrightness(level, options = {}) {
    const clamped = Math.max(0, Math.min(255, Math.round(level)));
    // Disable auto-brightness first
    await adbShell("settings put system screen_brightness_mode 0", options);
    await adbShell(`settings put system screen_brightness ${clamped}`, options);
}
export async function getBrightness(options = {}) {
    const [levelStr, modeStr] = await Promise.all([
        adbShell("settings get system screen_brightness", options),
        adbShell("settings get system screen_brightness_mode", options),
    ]);
    return {
        level: parseInt(levelStr.trim()) || 0,
        auto: modeStr.trim() === "1",
    };
}
export async function setAutoBrightness(enabled, options = {}) {
    await adbShell(`settings put system screen_brightness_mode ${enabled ? 1 : 0}`, options);
}
const STREAM_MAP = {
    music: 3,
    ring: 2,
    notification: 5,
    alarm: 4,
    system: 1,
};
export async function setVolume(stream, level, options = {}) {
    const streamId = STREAM_MAP[stream];
    const clamped = Math.max(0, Math.min(25, Math.round(level)));
    await adbShell(`media volume --stream ${streamId} --set ${clamped}`, options);
}
export async function getVolume(stream, options = {}) {
    const streamId = STREAM_MAP[stream];
    const output = await adbShell(`media volume --stream ${streamId} --get`, options);
    const match = output.match(/volume is (\d+)/);
    return match ? parseInt(match[1]) : 0;
}
// ── Screen Timeout ──────────────────────────────────────────────────
export async function setScreenTimeout(ms, options = {}) {
    await adbShell(`settings put system screen_off_timeout ${ms}`, options);
}
export async function getScreenTimeout(options = {}) {
    const output = await adbShell("settings get system screen_off_timeout", options);
    return parseInt(output.trim()) || 30000;
}
// ── Location ────────────────────────────────────────────────────────
export async function setLocationEnabled(enabled, options = {}) {
    // 0 = off, 3 = high accuracy
    await adbShell(`settings put secure location_mode ${enabled ? 3 : 0}`, options);
}
export async function isLocationEnabled(options = {}) {
    const output = await adbShell("settings get secure location_mode", options);
    return parseInt(output.trim()) > 0;
}
// ── Do Not Disturb ──────────────────────────────────────────────────
export async function setDoNotDisturb(enabled, options = {}) {
    // zen_mode: 0=off, 1=priority only, 2=total silence, 3=alarms only
    await adbShell(`settings put global zen_mode ${enabled ? 2 : 0}`, options);
}
export async function isDoNotDisturbEnabled(options = {}) {
    const output = await adbShell("settings get global zen_mode", options);
    return parseInt(output.trim()) > 0;
}
// ── Auto-Rotate ─────────────────────────────────────────────────────
export async function setAutoRotate(enabled, options = {}) {
    await adbShell(`settings put system accelerometer_rotation ${enabled ? 1 : 0}`, options);
}
export async function isAutoRotateEnabled(options = {}) {
    const output = await adbShell("settings get system accelerometer_rotation", options);
    return output.trim() === "1";
}
export async function getSetting(namespace, key, options = {}) {
    const output = await adbShell(`settings get ${namespace} ${shellEscape(key)}`, options);
    const trimmed = output.trim();
    // Android returns literal "null" when a setting doesn't exist
    return trimmed === "null" ? null : trimmed;
}
export async function putSetting(namespace, key, value, options = {}) {
    await adbShell(`settings put ${namespace} ${shellEscape(key)} ${shellEscape(String(value))}`, options);
}
//# sourceMappingURL=settings.js.map