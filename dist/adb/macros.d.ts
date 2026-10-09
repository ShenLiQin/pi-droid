/**
 * Gesture macros — record, save, and replay named gesture sequences.
 *
 * A macro is a JSON file containing an ordered list of steps (tap, swipe,
 * key, type, wait).  Macros are portable across sessions and devices.
 */
import type { GestureMacro, MacroExecOptions } from "./types.js";
/**
 * Execute every step in a macro sequentially, inserting a configurable
 * delay between steps.
 */
export declare function executeMacro(macro: GestureMacro, options?: MacroExecOptions): Promise<void>;
/**
 * Save a macro to disk as a JSON file.
 */
export declare function saveMacro(macro: GestureMacro, dir: string): Promise<string>;
/**
 * Load a macro from a JSON file by name.
 */
export declare function loadMacro(name: string, dir: string): Promise<GestureMacro>;
/**
 * List all macro names available in a directory.
 */
export declare function listMacros(dir: string): Promise<string[]>;
