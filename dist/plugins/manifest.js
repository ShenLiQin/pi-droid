import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
function isStringArray(value) {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
}
export function validatePluginManifest(value) {
    const errors = [];
    if (!value || typeof value !== "object") {
        return { valid: false, errors: ["Manifest must be an object"] };
    }
    const manifest = value;
    const requiredStrings = ["name", "packageName", "version", "displayName", "description", "requiredCoreVersion"];
    for (const key of requiredStrings) {
        if (typeof manifest[key] !== "string" || manifest[key].trim() === "") {
            errors.push(`"${key}" must be a non-empty string`);
        }
    }
    if (manifest.schemaVersion !== "1.0") {
        errors.push("\"schemaVersion\" must be \"1.0\"");
    }
    if (!isStringArray(manifest.targetApps)) {
        errors.push("\"targetApps\" must be an array of strings");
    }
    if (!Array.isArray(manifest.tools)) {
        errors.push("\"tools\" must be an array");
    }
    if (errors.length > 0) {
        return { valid: false, errors };
    }
    return {
        valid: true,
        manifest: {
            schemaVersion: "1.0",
            name: manifest.name,
            packageName: manifest.packageName,
            version: manifest.version,
            displayName: manifest.displayName,
            description: manifest.description,
            requiredCoreVersion: manifest.requiredCoreVersion,
            targetApps: manifest.targetApps,
            tools: manifest.tools,
        },
    };
}
function parseVersion(version) {
    const match = /^v?(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
    if (!match)
        return null;
    return [Number(match[1]), Number(match[2]), Number(match[3])];
}
function compareVersions(a, b) {
    for (let i = 0; i < 3; i++) {
        if (a[i] > b[i])
            return 1;
        if (a[i] < b[i])
            return -1;
    }
    return 0;
}
export function isCoreVersionCompatible(coreVersion, requiredRange) {
    const core = parseVersion(coreVersion);
    if (!core)
        return false;
    const range = requiredRange.trim();
    if (range.startsWith(">=")) {
        const min = parseVersion(range.slice(2));
        return min !== null && compareVersions(core, min) >= 0;
    }
    if (range.startsWith("^")) {
        const min = parseVersion(range.slice(1));
        if (!min)
            return false;
        const max = min[0] === 0
            ? [0, min[1] + 1, 0]
            : [min[0] + 1, 0, 0];
        return compareVersions(core, min) >= 0 && compareVersions(core, max) < 0;
    }
    const exact = parseVersion(range);
    return exact !== null && compareVersions(core, exact) === 0;
}
/**
 * Get the pi-droid core version.
 * Without args: reads pi-droid's own package.json (module-relative).
 * With cwd: reads package.json from the specified directory (for marketplace admin).
 */
export async function getCoreVersion(cwd) {
    let pkgPath;
    if (cwd) {
        pkgPath = join(cwd, "package.json");
    }
    else {
        const moduleDir = import.meta.dirname ?? dirname(fileURLToPath(import.meta.url));
        pkgPath = join(moduleDir, "..", "..", "package.json");
    }
    const raw = await readFile(pkgPath, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed.version ?? "0.0.0";
}
//# sourceMappingURL=manifest.js.map