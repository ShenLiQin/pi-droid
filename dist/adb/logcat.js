/**
 * Logcat — capture, search, clear, and inspect Android device logs.
 *
 * Uses `adb logcat` in dump mode (non-blocking) for safe agent consumption.
 * All output is structured for machine-readable JSON pipelines.
 */
import { adb } from "./exec.js";
/**
 * Capture logcat output for a duration.
 *
 * Optionally clears the buffer first, waits for the specified duration,
 * then dumps all accumulated logs via `adb logcat -d`.
 */
export async function captureLogcat(options = {}) {
    const duration = options.duration ?? 5000;
    const maxLines = options.maxLines ?? 200;
    if (options.clear) {
        await clearLogcat(options);
    }
    // Wait for the capture duration
    await new Promise((resolve) => setTimeout(resolve, duration));
    // Dump logs (non-blocking)
    const args = ["logcat", "-d"];
    if (options.filter) {
        args.push(options.filter, "*:S");
    }
    const output = await adb(args, options);
    const allLines = output
        .split("\n")
        .filter((l) => l.trim().length > 0);
    const lines = allLines.slice(-maxLines);
    return {
        lines,
        count: lines.length,
        duration,
    };
}
/**
 * Search recent logcat lines matching a regex pattern.
 *
 * Uses `adb logcat -t N -d` to grab the last N lines, then filters
 * client-side with the provided pattern.
 */
export async function searchLogcat(pattern, options = {}) {
    const lineCount = options.lines ?? 1000;
    const args = ["logcat", "-t", String(lineCount), "-d"];
    const output = await adb(args, options);
    const regex = new RegExp(pattern);
    return output
        .split("\n")
        .filter((l) => l.trim().length > 0)
        .filter((l) => regex.test(l));
}
/**
 * Clear the logcat buffer on the device.
 */
export async function clearLogcat(options = {}) {
    await adb(["logcat", "-c"], options);
}
/**
 * Get logcat buffer sizes (main, system, crash).
 *
 * Parses the output of `adb logcat -g`.
 */
export async function getLogcatStats(options = {}) {
    const output = await adb(["logcat", "-g"], options);
    const getSize = (buffer) => {
        const regex = new RegExp(`${buffer}:.*?([\\d.]+[KkMmGg]?[Bb]?\\S*)`, "i");
        const match = output.match(regex);
        return match ? match[1] : "unknown";
    };
    return {
        main: getSize("main"),
        system: getSize("system"),
        crash: getSize("crash"),
    };
}
//# sourceMappingURL=logcat.js.map