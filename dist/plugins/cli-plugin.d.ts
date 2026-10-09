/**
 * Generic CLI plugin — wraps any JSON-outputting CLI tool as a pi-droid plugin.
 * Subclasses just define the command mapping and capabilities.
 */
import type { PiDroidPlugin, PluginCapability, PluginStatus, PluginActionResult, PluginTaskBudgetConfig } from "./interface.js";
export interface CommandMapping {
    /** CLI subcommand string (e.g., "myapp scrape", "adb status") */
    command: string;
    /** Build CLI args from action params. Defaults to no args. */
    args?: (params: Record<string, unknown>) => string[];
    /** Build a logEntry from the result data. If omitted, no logEntry is attached. */
    logEntry?: (params: Record<string, unknown>, data: Record<string, unknown>) => PluginActionResult["logEntry"];
}
export interface CliPluginConfig {
    /** CLI binary name or path (e.g., "weather-cli") */
    cli_command: string;
    /** Per-run automation budget */
    task_budget?: PluginTaskBudgetConfig;
    /** Additional plugin-specific config — subclasses can extend */
    [key: string]: unknown;
}
export declare abstract class CliPlugin implements PiDroidPlugin {
    abstract readonly name: string;
    abstract readonly displayName: string;
    abstract readonly targetApps: string[];
    protected config: CliPluginConfig;
    private readonly capabilities;
    private readonly commandMap;
    private activeBudget;
    constructor(defaultConfig: CliPluginConfig, capabilities: PluginCapability[], commandMap: Record<string, CommandMapping>);
    initialize(config: Record<string, unknown>): Promise<void>;
    getCapabilities(): PluginCapability[];
    protected runWithBudget<T>(fn: () => Promise<T>): Promise<T>;
    private getOrCreateBudget;
    private budgetExceededResult;
    private withBudget;
    /**
     * Execute a CLI subcommand and parse the JSON response.
     * Tries stdout first, then stderr (some tools put error JSON there).
     */
    protected runCli(command: string, args?: string[]): Promise<Record<string, unknown>>;
    /**
     * Default execute — looks up the action in the command map and runs it.
     * Subclasses can override for custom actions.
     */
    execute(action: string, params: Record<string, unknown>): Promise<PluginActionResult>;
    /** Override in subclasses for custom status logic. */
    getStatus(): Promise<PluginStatus>;
    /** Override in subclasses for autonomous heartbeat behavior. */
    onHeartbeat(): Promise<PluginActionResult | null>;
    destroy(): Promise<void>;
}
