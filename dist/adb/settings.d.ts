/**
 * System settings control — toggles and adjustments for WiFi, Bluetooth,
 * brightness, volume, screen timeout, location, and more.
 *
 * Uses `adb shell svc`, `adb shell settings`, and `adb shell cmd` to
 * modify device state without requiring root.
 */
import { type AdbExecOptions } from "./exec.js";
export declare function setWifiEnabled(enabled: boolean, options?: AdbExecOptions): Promise<void>;
export declare function isWifiEnabled(options?: AdbExecOptions): Promise<boolean>;
export declare function setBluetoothEnabled(enabled: boolean, options?: AdbExecOptions): Promise<void>;
export declare function isBluetoothEnabled(options?: AdbExecOptions): Promise<boolean>;
export declare function setAirplaneMode(enabled: boolean, options?: AdbExecOptions): Promise<void>;
export declare function setBrightness(level: number, options?: AdbExecOptions): Promise<void>;
export declare function getBrightness(options?: AdbExecOptions): Promise<{
    level: number;
    auto: boolean;
}>;
export declare function setAutoBrightness(enabled: boolean, options?: AdbExecOptions): Promise<void>;
export type VolumeStream = "music" | "ring" | "notification" | "alarm" | "system";
export declare function setVolume(stream: VolumeStream, level: number, options?: AdbExecOptions): Promise<void>;
export declare function getVolume(stream: VolumeStream, options?: AdbExecOptions): Promise<number>;
export declare function setScreenTimeout(ms: number, options?: AdbExecOptions): Promise<void>;
export declare function getScreenTimeout(options?: AdbExecOptions): Promise<number>;
export declare function setLocationEnabled(enabled: boolean, options?: AdbExecOptions): Promise<void>;
export declare function isLocationEnabled(options?: AdbExecOptions): Promise<boolean>;
export declare function setDoNotDisturb(enabled: boolean, options?: AdbExecOptions): Promise<void>;
export declare function isDoNotDisturbEnabled(options?: AdbExecOptions): Promise<boolean>;
export declare function setAutoRotate(enabled: boolean, options?: AdbExecOptions): Promise<void>;
export declare function isAutoRotateEnabled(options?: AdbExecOptions): Promise<boolean>;
export type SettingsNamespace = "system" | "secure" | "global";
export declare function getSetting(namespace: SettingsNamespace, key: string, options?: AdbExecOptions): Promise<string | null>;
export declare function putSetting(namespace: SettingsNamespace, key: string, value: string | number, options?: AdbExecOptions): Promise<void>;
