/**
 * Plugin Manager — registers, manages, and discovers plugins.
 */
import type { PiDroidPlugin, PluginStatus } from "./interface.js";
import { type SkillDefinition } from "./skill.js";
/**
 * Register a plugin constructor so it can be loaded by name from config.
 * Call this at module level for each available plugin.
 */
export declare function registerPluginType(name: string, factory: () => PiDroidPlugin): void;
export declare class PluginManager {
    private plugins;
    private capabilityOwners;
    private assertPluginIsolation;
    private trackCapabilities;
    /**
     * Register and initialize a plugin instance.
     */
    register(plugin: PiDroidPlugin, config: Record<string, unknown>): Promise<void>;
    /**
     * Load a plugin by name from the registry. Creates instance and initializes it.
     */
    loadByName(name: string, config: Record<string, unknown>): Promise<PiDroidPlugin>;
    /**
     * Load all enabled plugins from a config object.
     * Config format: { "pluginName": { enabled: true, ...options } }
     */
    loadFromConfig(pluginConfigs: Record<string, Record<string, unknown>>): Promise<string[]>;
    get(name: string): PiDroidPlugin | undefined;
    getAll(): PiDroidPlugin[];
    has(name: string): boolean;
    getStatuses(): Promise<Record<string, PluginStatus>>;
    /**
     * Get skill definitions for all loaded plugins (for agent discovery).
     */
    getSkills(): SkillDefinition[];
    /**
     * Generate a combined SKILL.md for all loaded plugins.
     */
    getSkillsMd(): string;
    /**
     * Run a health check on all plugins. Returns unhealthy ones.
     */
    healthCheck(): Promise<Array<{
        name: string;
        status: PluginStatus;
    }>>;
    destroyAll(): Promise<void>;
}
