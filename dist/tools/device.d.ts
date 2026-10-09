/**
 * Core device tools — direct ADB operations registered as pi-mono tools.
 *
 * These are always available regardless of plugins. They give the LLM
 * direct control over the connected Android device.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
export declare function registerDeviceTools(pi: ExtensionAPI, adbConfig: Record<string, unknown>): void;
