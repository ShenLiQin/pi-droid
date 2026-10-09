/**
 * Safe, auditable shell command execution on Android devices.
 *
 * Provides structured wrappers around `adb shell` for arbitrary commands,
 * multi-line scripts, process management, and memory inspection.
 */
export interface ShellOptions {
    /** Device serial to target */
    serial?: string;
    /** Command timeout in ms (default: 30000) */
    timeout?: number;
    /** Max stdout buffer size in bytes (default: 1MB) */
    maxOutput?: number;
}
export interface ShellResult {
    stdout: string;
    exitCode: number;
    duration: number;
}
export interface ScriptOptions extends ShellOptions {
    /** Shell interpreter (default: "sh") */
    interpreter?: string;
}
export interface ProcessInfo {
    pid: number;
    user: string;
    rss: number;
    name: string;
}
export interface MemoryInfo {
    totalMb: number;
    freeMb: number;
    availableMb: number;
    usedPercent: number;
}
/**
 * Execute an arbitrary shell command on the device.
 *
 * Captures the exit code via `echo $?` to reliably report success/failure
 * even when ADB itself doesn't propagate it.
 */
export declare function executeShell(command: string, options?: ShellOptions): Promise<ShellResult>;
/**
 * Push a multi-line script to the device, execute it, and clean up.
 *
 * The script is written to a temp file on the host, pushed via `adb push`,
 * executed with the chosen interpreter, then removed from the device.
 */
export declare function executeShellScript(script: string, options?: ScriptOptions): Promise<ShellResult>;
/**
 * List running processes with PID, user, name, and RSS memory.
 *
 * Robust to varying `ps` output formats across Android versions.
 */
export declare function getProcessList(options?: ShellOptions): Promise<ProcessInfo[]>;
/**
 * Kill a process by PID. Returns true if the kill command succeeded.
 */
export declare function killProcess(pid: number, options?: ShellOptions): Promise<boolean>;
/**
 * Get device memory summary by parsing `/proc/meminfo`.
 *
 * Returns total, free, and available memory in MB plus used percentage.
 */
export declare function getMemoryInfo(options?: ShellOptions): Promise<MemoryInfo>;
