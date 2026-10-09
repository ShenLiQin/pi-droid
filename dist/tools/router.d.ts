import type { AdbExecOptions } from "../adb/exec.js";
export type SupportedRouteTool = "android_screenshot" | "android_key" | "android_app";
export interface RouteEntry {
    name?: string;
    patterns: string[];
    tool: SupportedRouteTool;
    args?: Record<string, unknown>;
}
export interface RouterConfig {
    routes: RouteEntry[];
    appAliases?: Record<string, string>;
}
export interface RoutedToolCall {
    name: string;
    tool: SupportedRouteTool;
    args: Record<string, unknown>;
}
export interface RouterRoutingConfig {
    enabled?: unknown;
    file?: unknown;
}
export interface RoutedInputResult {
    handled: boolean;
    message?: {
        customType: "pidroid-route";
        content: string;
        display: true;
        details: Record<string, unknown>;
    };
    notification?: {
        text: string;
        level: "info" | "warning";
    };
}
export interface InputRouter {
    configure(routingConfig: RouterRoutingConfig): Promise<void>;
    handleRoutedInput(text: string, options: AdbExecOptions): Promise<RoutedInputResult>;
}
export declare function loadRouterConfig(baseDir: string, routeFile?: string): Promise<RouterConfig>;
export declare function resolveRoutedTool(text: string, config: RouterConfig): RoutedToolCall | null;
export declare function executeRoutedTool(call: RoutedToolCall, options?: AdbExecOptions): Promise<Record<string, unknown>>;
export declare function createInputRouter(baseDir: string): InputRouter;
