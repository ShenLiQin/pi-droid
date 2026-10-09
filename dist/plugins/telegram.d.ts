import type { PiDroidPlugin, PluginActionResult, PluginCapability, PluginStatus } from "./interface.js";
export declare class TelegramPlugin implements PiDroidPlugin {
    readonly name = "telegram";
    readonly displayName = "Telegram HITL";
    readonly targetApps: string[];
    private channel;
    private paused;
    private commands;
    private heartbeatPollIntervalMs;
    private lastHeartbeatPollAt;
    initialize(config: Record<string, unknown>): Promise<void>;
    getCapabilities(): PluginCapability[];
    getStatus(): Promise<PluginStatus>;
    execute(action: string, params: Record<string, unknown>): Promise<PluginActionResult>;
    onHeartbeat(): Promise<PluginActionResult | null>;
    destroy(): Promise<void>;
    private applyControlCommands;
}
