/**
 * SKILL.md auto-generation for plugins.
 *
 * Inspired by CLI-Anything's SKILL.md pattern. Each plugin can generate
 * a machine-readable skill definition that agents use to discover
 * capabilities without hardcoding knowledge.
 */
import type { PiDroidPlugin, PluginCapability } from "./interface.js";
export interface SkillDefinition {
    name: string;
    displayName: string;
    description: string;
    targetApps: string[];
    capabilities: PluginCapability[];
    examples: SkillExample[];
}
export interface SkillExample {
    description: string;
    action: string;
    params: Record<string, unknown>;
    expectedOutcome: string;
}
/**
 * Generate a SKILL.md string from a plugin's capabilities.
 */
export declare function generateSkillMd(plugin: PiDroidPlugin, examples?: SkillExample[]): string;
/**
 * Generate a structured JSON skill definition (for programmatic consumption).
 */
export declare function generateSkillJson(plugin: PiDroidPlugin, examples?: SkillExample[]): SkillDefinition;
/**
 * Generate a combined skill document for all loaded plugins.
 */
export declare function generateAllSkills(plugins: PiDroidPlugin[], examplesMap?: Map<string, SkillExample[]>): string;
