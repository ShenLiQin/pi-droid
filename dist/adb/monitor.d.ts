/**
 * Device state monitoring — battery, network, storage, screen lock, running apps.
 *
 * Parses ADB dumpsys / getprop output into structured data for
 * autonomous health checks and decision-making.
 */
import { type AdbExecOptions } from "./exec.js";
import type { BatteryInfo, NetworkInfo, FullDeviceInfo } from "./types.js";
/**
 * Get battery level, charging status, and temperature.
 */
export declare function getBatteryInfo(options?: AdbExecOptions): Promise<BatteryInfo>;
/**
 * Get network connectivity state (WiFi, cellular, airplane mode).
 */
export declare function getNetworkInfo(options?: AdbExecOptions): Promise<NetworkInfo>;
/**
 * Get device hardware and software info.
 */
export declare function getDeviceInfo(options?: AdbExecOptions): Promise<FullDeviceInfo>;
/**
 * Check if the device screen is locked.
 */
export declare function isScreenLocked(options?: AdbExecOptions): Promise<boolean>;
/**
 * List running app processes (user-facing apps, not system daemons).
 */
export declare function getRunningApps(options?: AdbExecOptions): Promise<string[]>;
