import type { PiDroidPlugin } from "./interface.js";
import { type PluginManifest } from "./manifest.js";
export declare const PLUGIN_NAMESPACE = "@pi-droid/plugin-";
export interface InstalledPluginInfo {
    name: string;
    packageName: string;
    version: string;
    compatible: boolean;
    requiredCoreVersion?: string;
    tools: string[];
    description?: string;
}
export interface PluginSearchResult {
    name: string;
    version: string;
    description: string;
}
export interface LoadedPluginPackage {
    packageName: string;
    manifest: PluginManifest;
    createPlugin: () => PiDroidPlugin;
}
export declare function normalizePackageName(name: string): string;
export declare function loadPluginPackage(packageName: string, cwd?: string): Promise<LoadedPluginPackage>;
export declare function installPlugin(name: string, cwd?: string): Promise<InstalledPluginInfo>;
export declare function removePlugin(name: string, cwd?: string): Promise<{
    removed: string;
    packageName: string;
}>;
export declare function listInstalledPlugins(cwd?: string): Promise<InstalledPluginInfo[]>;
export declare function searchPlugins(query: string, limit?: number): Promise<PluginSearchResult[]>;
