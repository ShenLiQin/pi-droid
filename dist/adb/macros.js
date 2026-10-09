/**
 * Gesture macros — record, save, and replay named gesture sequences.
 *
 * A macro is a JSON file containing an ordered list of steps (tap, swipe,
 * key, type, wait).  Macros are portable across sessions and devices.
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tap, swipe, typeText, keyEvent } from "./input.js";
/** Pause for `ms` milliseconds. */
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Execute a single gesture step.
 */
async function executeStep(step) {
    const p = step.params;
    switch (step.type) {
        case "tap":
            await tap(p.x, p.y, {
                duration: p.duration ?? undefined,
            });
            break;
        case "swipe":
            await swipe(p.x1, p.y1, p.x2, p.y2, { duration: p.duration ?? undefined });
            break;
        case "key":
            await keyEvent(p.keycode);
            break;
        case "type":
            await typeText(p.text);
            break;
        case "wait":
            await sleep(p.ms);
            break;
        default:
            throw new Error(`Unknown gesture step type: ${step.type}`);
    }
}
/**
 * Execute every step in a macro sequentially, inserting a configurable
 * delay between steps.
 */
export async function executeMacro(macro, options = {}) {
    const stepDelay = options.stepDelay ?? 200;
    const verbose = options.verbose ?? false;
    for (let i = 0; i < macro.steps.length; i++) {
        const step = macro.steps[i];
        if (verbose) {
            console.log(`[macro:${macro.name}] step ${i + 1}/${macro.steps.length} — ${step.type}`);
        }
        await executeStep(step);
        // Skip inter-step delay after the last step and after explicit wait steps.
        if (i < macro.steps.length - 1 && step.type !== "wait") {
            await sleep(stepDelay);
        }
    }
}
// ── Persistence ─────────────────────────────────────────────────────
/** Derive the file path for a macro name. */
function macroPath(name, dir) {
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    return join(dir, `${safeName}.json`);
}
/**
 * Save a macro to disk as a JSON file.
 */
export async function saveMacro(macro, dir) {
    await mkdir(dir, { recursive: true });
    const filePath = macroPath(macro.name, dir);
    await writeFile(filePath, JSON.stringify(macro, null, 2) + "\n", "utf-8");
    return filePath;
}
/**
 * Load a macro from a JSON file by name.
 */
export async function loadMacro(name, dir) {
    const filePath = macroPath(name, dir);
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw);
}
/**
 * List all macro names available in a directory.
 */
export async function listMacros(dir) {
    let entries;
    try {
        entries = await readdir(dir);
    }
    catch {
        return [];
    }
    return entries
        .filter((f) => f.endsWith(".json"))
        .map((f) => f.replace(/\.json$/, ""));
}
//# sourceMappingURL=macros.js.map