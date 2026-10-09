/**
 * Plugin Manager — registers, manages, and discovers plugins.
 */
import { getCoreVersion, isCoreVersionCompatible } from "./manifest.js";
import { loadPluginPackage } from "./marketplace.js";
import { generateSkillJson, generateAllSkills } from "./skill.js";
/** Registry of plugin constructors for dynamic loading. */
const pluginRegistry = new Map();
/**
 * Register a plugin constructor so it can be loaded by name from config.
 * Call this at module level for each available plugin.
 */
export function registerPluginType(name, factory) {
    pluginRegistry.set(name, factory);
}
export class PluginManager {
    plugins = new Map();
    capabilityOwners = new Map();
    assertPluginIsolation(plugin) {
        for (const capability of plugin.getCapabilities()) {
            if (!capability.name.startsWith(`${plugin.name}.`)) {
                throw new Error(`Plugin "${plugin.name}" capability "${capability.name}" must be namespaced as "${plugin.name}.*"`);
            }
            const owner = this.capabilityOwners.get(capability.name);
            if (owner && owner !== plugin.name) {
                throw new Error(`Plugin "${plugin.name}" capability "${capability.name}" conflicts with plugin "${owner}"`);
            }
        }
    }
    trackCapabilities(plugin) {
        for (const capability of plugin.getCapabilities()) {
            this.capabilityOwners.set(capability.name, plugin.name);
        }
    }
    /**
     * Register and initialize a plugin instance.
     */
    async register(plugin, config) {
        if (this.plugins.has(plugin.name)) {
            throw new Error(`Plugin "${plugin.name}" is already registered`);
        }
        this.assertPluginIsolation(plugin);
        await plugin.initialize({ ...config });
        this.plugins.set(plugin.name, plugin);
        this.trackCapabilities(plugin);
    }
    /**
     * Load a plugin by name from the registry. Creates instance and initializes it.
     */
    async loadByName(name, config) {
        const factory = pluginRegistry.get(name);
        if (!factory) {
            throw new Error(`Unknown plugin type "${name}". Registered: ${[...pluginRegistry.keys()].join(", ")}`);
        }
        const plugin = factory();
        await this.register(plugin, config);
        return plugin;
    }
    /**
     * Load all enabled plugins from a config object.
     * Config format: { "pluginName": { enabled: true, ...options } }
     */
    async loadFromConfig(pluginConfigs) {
        const loaded = [];
        const coreVersion = await getCoreVersion();
        for (const [name, config] of Object.entries(pluginConfigs)) {
            if (config.enabled === false)
                continue;
            try {
                if (pluginRegistry.has(name)) {
                    await this.loadByName(name, config);
                }
                else if (typeof config.package === "string") {
                    // Dynamic plugin loading from marketplace packages — extends loader
                    // to support npm-installed plugins alongside built-in plugin types.
                    const loadedPackage = await loadPluginPackage(config.package);
                    if (loadedPackage.manifest.name !== name) {
                        throw new Error(`Configured plugin key "${name}" does not match manifest name "${loadedPackage.manifest.name}"`);
                    }
                    if (!isCoreVersionCompatible(coreVersion, loadedPackage.manifest.requiredCoreVersion)) {
                        throw new Error(`Plugin "${name}" requires pi-droid ${loadedPackage.manifest.requiredCoreVersion}, current ${coreVersion}`);
                    }
                    const plugin = loadedPackage.createPlugin();
                    if (plugin.name !== loadedPackage.manifest.name) {
                        throw new Error(`Plugin factory name "${plugin.name}" does not match manifest "${loadedPackage.manifest.name}"`);
                    }
                    await this.register(plugin, config);
                }
                else {
                    throw new Error(`Unknown plugin "${name}" and no package configured`);
                }
                loaded.push(name);
            }
            catch (err) {
                console.error(`[pi-droid] Failed to load plugin "${name}":`, err);
            }
        }
        return loaded;
    }
    get(name) {
        return this.plugins.get(name);
    }
    getAll() {
        return Array.from(this.plugins.values());
    }
    has(name) {
        return this.plugins.has(name);
    }
    async getStatuses() {
        const statuses = {};
        for (const [name, plugin] of this.plugins) {
            try {
                statuses[name] = await plugin.getStatus();
            }
            catch (err) {
                statuses[name] = {
                    ready: false,
                    message: `Error: ${err instanceof Error ? err.message : String(err)}`,
                };
            }
        }
        return statuses;
    }
    /**
     * Get skill definitions for all loaded plugins (for agent discovery).
     */
    getSkills() {
        return this.getAll().map((p) => generateSkillJson(p));
    }
    /**
     * Generate a combined SKILL.md for all loaded plugins.
     */
    getSkillsMd() {
        return generateAllSkills(this.getAll());
    }
    /**
     * Run a health check on all plugins. Returns unhealthy ones.
     */
    async healthCheck() {
        const unhealthy = [];
        const statuses = await this.getStatuses();
        for (const [name, status] of Object.entries(statuses)) {
            if (!status.ready)
                unhealthy.push({ name, status });
        }
        return unhealthy;
    }
    async destroyAll() {
        for (const plugin of this.plugins.values()) {
            try {
                await plugin.destroy();
            }
            catch {
                // best effort
            }
        }
        this.plugins.clear();
        this.capabilityOwners.clear();
    }
}
//# sourceMappingURL=loader.js.map