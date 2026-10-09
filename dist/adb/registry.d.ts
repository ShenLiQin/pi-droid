/**
 * DeviceRegistry — manage multiple connected Android devices.
 *
 * Provides named aliases, active-device selection, and auto-discovery.
 * Designed for multi-device workflows (e.g., testing on multiple phones,
 * or switching between USB and WiFi connections).
 */
import { Device } from "./device.js";
import type { DeviceInfo } from "./types.js";
export interface RegisteredDevice {
    /** User-assigned alias (e.g., "galaxy-s9", "pixel-7") */
    alias: string;
    /** ADB serial string */
    serial: string;
    /** High-level Device instance (created on first use) */
    device: Device | null;
    /** Device info from last scan */
    info: DeviceInfo | null;
    /** When the device was registered */
    registeredAt: string;
}
export declare class DeviceRegistry {
    private devices;
    private activeAlias;
    /**
     * Register a device by serial with an alias.
     */
    register(alias: string, serial: string): RegisteredDevice;
    /**
     * Remove a device by alias.
     */
    unregister(alias: string): boolean;
    /**
     * Set the active device by alias.
     */
    setActive(alias: string): void;
    /**
     * Get the active Device instance (creates on first access).
     */
    getActive(): Promise<Device>;
    /**
     * Get a Device by alias (creates on first access).
     */
    getByAlias(alias: string): Promise<Device>;
    /**
     * Get the active alias name, or null.
     */
    getActiveAlias(): string | null;
    /**
     * List all registered aliases.
     */
    listAliases(): string[];
    /**
     * Get registration info for all devices.
     */
    list(): RegisteredDevice[];
    /**
     * Get a specific registration entry.
     */
    get(alias: string): RegisteredDevice | undefined;
    /**
     * Scan for connected ADB devices and auto-register any new ones.
     * Returns the list of newly registered devices.
     */
    discover(): Promise<RegisteredDevice[]>;
    /**
     * Refresh device info for all registered devices.
     * Marks unreachable devices by nulling their info.
     */
    refresh(): Promise<{
        reachable: string[];
        unreachable: string[];
    }>;
    /**
     * Number of registered devices.
     */
    get size(): number;
    private findBySerial;
    private generateAlias;
}
