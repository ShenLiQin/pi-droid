import type { PluginCapability } from "./interface.js";
export interface PluginManifest {
    schemaVersion: "1.0";
    name: string;
    packageName: string;
    version: string;
    displayName: string;
    description: string;
    requiredCoreVersion: string;
    targetApps: string[];
    tools: PluginCapability[];
}
export declare function validatePluginManifest(value: unknown): {
    valid: true;
    manifest: PluginManifest;
} | {
    valid: false;
    errors: string[];
};
export declare function isCoreVersionCompatible(coreVersion: string, requiredRange: string): boolean;
/**
 * Get the pi-droid core version.
 * Without args: reads pi-droid's own package.json (module-relative).
 * With cwd: reads package.json from the specified directory (for marketplace admin).
 */
export declare function getCoreVersion(cwd?: string): Promise<string>;
