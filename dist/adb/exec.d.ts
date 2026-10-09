/**
 * Low-level ADB command execution.
 *
 * Wraps child_process.execFile for ADB commands with proper error handling,
 * serial targeting, and timeout management.
 */
import type { DeviceInfo, ScreenSize } from "./types.js";
export declare class AdbError extends Error {
    readonly command: string;
    readonly stderr: string;
    readonly exitCode: number | null;
    constructor(message: string, command: string, stderr: string, exitCode: number | null);
}
export interface AdbExecOptions {
    /** Device serial to target */
    serial?: string;
    /** Command timeout in ms (default: 30000) */
    timeout?: number;
    /** Max stdout buffer size in bytes (default: 10MB) */
    maxBuffer?: number;
}
/**
 * Execute an ADB command and return stdout.
 */
export declare function adb(args: string[], options?: AdbExecOptions): Promise<string>;
/**
 * Execute a shell command on the device.
 */
export declare function adbShell(command: string, options?: AdbExecOptions): Promise<string>;
/**
 * List connected ADB devices.
 */
export declare function listDevices(): Promise<DeviceInfo[]>;
/**
 * Get screen size of the device.
 */
export declare function getScreenSize(options?: AdbExecOptions): Promise<ScreenSize>;
/**
 * Check if ADB server is reachable and a device is connected.
 */
export declare function isDeviceReady(serial?: string): Promise<boolean>;
/**
 * Get the foreground activity's package name.
 */
export declare function getForegroundPackage(options?: AdbExecOptions): Promise<string>;
