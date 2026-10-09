/**
 * Device lock pattern/PIN management.
 *
 * Wraps Android's `locksettings` CLI for clearing and setting
 * lock patterns and PINs. App-agnostic — works on any Android device.
 */
import { type AdbExecOptions } from "./exec.js";
export interface LockStatus {
    hasPattern: boolean;
    hasPin: boolean;
    hasPassword: boolean;
    isSecure: boolean;
}
/**
 * Check current device lock status.
 */
export declare function getLockStatus(options?: AdbExecOptions): Promise<LockStatus>;
/**
 * Clear the device lock pattern/PIN.
 * Requires the current pattern/PIN to clear it.
 */
export declare function clearLock(currentCredential: string, options?: AdbExecOptions): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Set a pattern lock on the device.
 * Pattern is a comma-separated string of dot indices (e.g., "1,2,5,8,9").
 * Dot layout: 0=top-left, 1=top-center, 2=top-right, ..., 8=bottom-right.
 */
export declare function setPattern(pattern: string, options?: AdbExecOptions): Promise<{
    success: boolean;
    message: string;
}>;
/**
 * Set a PIN lock on the device.
 */
export declare function setPin(pin: string, options?: AdbExecOptions): Promise<{
    success: boolean;
    message: string;
}>;
