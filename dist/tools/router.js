import { readFile } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { launchApp } from "../adb/app.js";
import { keyEvent } from "../adb/input.js";
import { takeScreenshot } from "../adb/screenshot.js";
const PACKAGE_NAME_RE = /^(?:[a-zA-Z][\w]*\.)+[a-zA-Z][\w]*$/;
function toObject(value) {
    return typeof value === "object" && value !== null ? value : {};
}
function toRoutes(value) {
    if (!Array.isArray(value))
        return [];
    const routes = [];
    for (const item of value) {
        if (typeof item !== "object" || item === null)
            continue;
        const route = item;
        const patterns = Array.isArray(route.patterns)
            ? route.patterns.filter((p) => typeof p === "string")
            : [];
        const tool = route.tool;
        if ((tool !== "android_screenshot" && tool !== "android_key" && tool !== "android_app") || patterns.length === 0) {
            continue;
        }
        routes.push({
            name: typeof route.name === "string" ? route.name : undefined,
            patterns,
            tool,
            args: toObject(route.args),
        });
    }
    return routes;
}
export async function loadRouterConfig(baseDir, routeFile) {
    const relativePath = routeFile ?? "config/routes.json";
    const fullPath = isAbsolute(relativePath) ? relativePath : join(baseDir, relativePath);
    try {
        const raw = await readFile(fullPath, "utf-8");
        const parsed = JSON.parse(raw);
        return {
            routes: toRoutes(parsed.routes),
            appAliases: Object.fromEntries(Object.entries(toObject(parsed.appAliases))
                .filter(([, value]) => typeof value === "string")
                .map(([key, value]) => [key.toLowerCase(), value])),
        };
    }
    catch {
        return { routes: [] };
    }
}
function resolveTemplate(template, groups, numbered) {
    return template.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*|\d+)/g, (_m, token) => {
        if (/^\d+$/.test(token)) {
            const idx = Number(token);
            return numbered[idx] ?? "";
        }
        return groups[token] ?? "";
    });
}
function resolveArgs(args, groups, numbered) {
    if (!args)
        return {};
    const resolved = {};
    for (const [key, value] of Object.entries(args)) {
        if (typeof value === "string") {
            resolved[key] = resolveTemplate(value, groups, numbered);
        }
        else {
            resolved[key] = value;
        }
    }
    return resolved;
}
function normalizeAppValue(value) {
    return value.trim().replace(/^["']|["']$/g, "").replace(/[.?!,:;]+$/g, "");
}
function resolveAppPackage(rawValue, appAliases) {
    const value = normalizeAppValue(rawValue);
    const alias = appAliases[value.toLowerCase()];
    if (alias)
        return alias;
    if (PACKAGE_NAME_RE.test(value))
        return value;
    return undefined;
}
function routeFromMatch(entry, match, appAliases) {
    const groups = {};
    for (const [key, value] of Object.entries(match.groups ?? {})) {
        if (typeof value === "string")
            groups[key] = value;
    }
    const args = resolveArgs(entry.args, groups, match);
    if (entry.tool === "android_app" && args.action === "launch" && typeof args.package === "string") {
        const packageName = resolveAppPackage(args.package, appAliases);
        if (!packageName)
            return null;
        args.package = packageName;
    }
    return {
        name: entry.name ?? entry.tool,
        tool: entry.tool,
        args,
    };
}
function detectSingleTool(text, appAliases) {
    const normalized = text.trim();
    if (/^android_screenshot$/i.test(normalized)) {
        return { name: "single_tool", tool: "android_screenshot", args: {} };
    }
    const keyMatch = normalized.match(/^android_key\s+(.+)$/i);
    if (keyMatch) {
        const key = keyMatch[1].trim();
        if (key)
            return { name: "single_tool", tool: "android_key", args: { key } };
    }
    const appMatch = normalized.match(/^android_app\s+launch\s+(.+)$/i);
    if (appMatch) {
        const packageName = resolveAppPackage(appMatch[1], appAliases);
        if (packageName) {
            return { name: "single_tool", tool: "android_app", args: { action: "launch", package: packageName } };
        }
    }
    return null;
}
export function resolveRoutedTool(text, config) {
    const appAliases = config.appAliases ?? {};
    for (const route of config.routes) {
        for (const pattern of route.patterns) {
            let re;
            try {
                re = new RegExp(pattern, "i");
            }
            catch {
                continue;
            }
            const match = text.trim().match(re);
            if (!match)
                continue;
            const resolved = routeFromMatch(route, match, appAliases);
            if (resolved)
                return resolved;
        }
    }
    return detectSingleTool(text, appAliases);
}
export async function executeRoutedTool(call, options = {}) {
    switch (call.tool) {
        case "android_screenshot": {
            const result = await takeScreenshot(options);
            return { routed_to: call.tool, result };
        }
        case "android_key": {
            if (typeof call.args.key !== "string" || call.args.key.length === 0) {
                throw new Error("android_key route requires a key argument");
            }
            await keyEvent(call.args.key, options);
            return { routed_to: call.tool, key: call.args.key };
        }
        case "android_app": {
            if (call.args.action !== "launch" || typeof call.args.package !== "string" || call.args.package.length === 0) {
                throw new Error("android_app route requires action=launch and package");
            }
            await launchApp(call.args.package, options);
            return { routed_to: call.tool, launched: call.args.package };
        }
    }
}
export function createInputRouter(baseDir) {
    let enabled = true;
    let routerConfig = { routes: [] };
    return {
        async configure(routingConfig) {
            enabled = routingConfig.enabled !== false;
            const routeFile = typeof routingConfig.file === "string" ? routingConfig.file : undefined;
            routerConfig = await loadRouterConfig(baseDir, routeFile);
        },
        async handleRoutedInput(text, options) {
            if (!enabled)
                return { handled: false };
            const route = resolveRoutedTool(text, routerConfig);
            if (!route)
                return { handled: false };
            try {
                const result = await executeRoutedTool(route, options);
                return {
                    handled: true,
                    message: {
                        customType: "pidroid-route",
                        content: JSON.stringify(result),
                        display: true,
                        details: { route: route.name, tool: route.tool, args: route.args },
                    },
                    notification: { text: `Pi-Droid route: ${route.name} -> ${route.tool}`, level: "info" },
                };
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                return {
                    handled: true,
                    message: {
                        customType: "pidroid-route",
                        content: JSON.stringify({ routed_to: route.tool, error: message }),
                        display: true,
                        details: { route: route.name, tool: route.tool, args: route.args },
                    },
                    notification: { text: `Pi-Droid route failed: ${message}`, level: "warning" },
                };
            }
        },
    };
}
//# sourceMappingURL=router.js.map