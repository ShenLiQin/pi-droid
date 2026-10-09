/**
 * Android tool registrations for pi-mono.
 *
 * These tools are registered via pi.registerTool() and become callable by the LLM.
 * Each tool wraps a plugin action, adding approval gates where needed.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import type { PluginManager } from "../plugins/loader.js";
export declare function registerAndroidTools(pi: ExtensionAPI, plugins: PluginManager): void;
