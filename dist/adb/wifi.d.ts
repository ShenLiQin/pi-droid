/**
 * WiFi ADB — connect, disconnect, and auto-detect wireless devices.
 *
 * Enables wireless device automation: switch a USB-connected device to
 * WiFi mode, discover its IP, and connect over the network.
 */
import { type AdbExecOptions } from "./exec.js";
export interface WifiConnectResult {
    success: boolean;
    /** The host:port serial string (e.g., "192.168.1.42:5555") */
    serial: string;
    message: string;
}
/**
 * Connect to a device over WiFi via `adb connect`.
 */
export declare function connectWifi(host: string, port?: number, options?: AdbExecOptions): Promise<WifiConnectResult>;
/**
 * Disconnect a WiFi-connected device via `adb disconnect`.
 *
 * If host is omitted, disconnects all WiFi devices.
 */
export declare function disconnectWifi(host?: string, port?: number, options?: AdbExecOptions): Promise<string>;
/**
 * Enable WiFi ADB on a USB-connected device by switching to TCP/IP mode.
 *
 * The device must already be connected via USB. After this call the device
 * will listen on the given port for wireless ADB connections.
 */
export declare function enableWifiAdb(options?: AdbExecOptions & {
    port?: number;
}): Promise<string>;
/**
 * Get the device's WiFi IP address from `wlan0`.
 *
 * Parses `ip addr show wlan0` and returns the first IPv4 address, or null
 * if the device is not connected to WiFi.
 */
export declare function getWifiIp(options?: AdbExecOptions): Promise<string | null>;
/**
 * Check if a WiFi device is currently connected.
 *
 * Looks for a `host:port` entry with state "device" in the device list.
 */
export declare function isWifiConnected(host: string, port?: number): Promise<boolean>;
/**
 * Convenience: enable WiFi ADB on a USB device, detect its IP, and connect.
 *
 * Returns the WiFi serial string (e.g., "192.168.1.42:5555") on success,
 * or throws if the IP cannot be determined or the connection fails.
 */
export declare function autoConnect(options?: AdbExecOptions & {
    port?: number;
}): Promise<string>;
