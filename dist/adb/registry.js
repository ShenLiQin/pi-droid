/**
 * DeviceRegistry — manage multiple connected Android devices.
 *
 * Provides named aliases, active-device selection, and auto-discovery.
 * Designed for multi-device workflows (e.g., testing on multiple phones,
 * or switching between USB and WiFi connections).
 */
import { Device } from "./device.js";
import { listDevices } from "./exec.js";
export class DeviceRegistry {
    devices = new Map();
    activeAlias = null;
    /**
     * Register a device by serial with an alias.
     */
    register(alias, serial) {
        const entry = {
            alias,
            serial,
            device: null,
            info: null,
            registeredAt: new Date().toISOString(),
        };
        this.devices.set(alias, entry);
        // Auto-set active if this is the first device
        if (this.devices.size === 1) {
            this.activeAlias = alias;
        }
        return entry;
    }
    /**
     * Remove a device by alias.
     */
    unregister(alias) {
        const existed = this.devices.delete(alias);
        if (this.activeAlias === alias) {
            // Switch active to first remaining, or null
            const first = this.devices.keys().next();
            this.activeAlias = first.done ? null : first.value;
        }
        return existed;
    }
    /**
     * Set the active device by alias.
     */
    setActive(alias) {
        if (!this.devices.has(alias)) {
            throw new Error(`Device alias "${alias}" not registered. Known: ${this.listAliases().join(", ")}`);
        }
        this.activeAlias = alias;
    }
    /**
     * Get the active Device instance (creates on first access).
     */
    async getActive() {
        if (!this.activeAlias) {
            throw new Error("No active device. Register a device first.");
        }
        return this.getByAlias(this.activeAlias);
    }
    /**
     * Get a Device by alias (creates on first access).
     */
    async getByAlias(alias) {
        const entry = this.devices.get(alias);
        if (!entry) {
            throw new Error(`Device alias "${alias}" not registered`);
        }
        if (!entry.device) {
            entry.device = await Device.connect(entry.serial);
        }
        return entry.device;
    }
    /**
     * Get the active alias name, or null.
     */
    getActiveAlias() {
        return this.activeAlias;
    }
    /**
     * List all registered aliases.
     */
    listAliases() {
        return Array.from(this.devices.keys());
    }
    /**
     * Get registration info for all devices.
     */
    list() {
        return Array.from(this.devices.values());
    }
    /**
     * Get a specific registration entry.
     */
    get(alias) {
        return this.devices.get(alias);
    }
    /**
     * Scan for connected ADB devices and auto-register any new ones.
     * Returns the list of newly registered devices.
     */
    async discover() {
        const connected = await listDevices();
        const newDevices = [];
        for (const info of connected) {
            if (info.state !== "device")
                continue;
            // Check if already registered by serial
            const existing = this.findBySerial(info.serial);
            if (existing) {
                // Update info
                existing.info = info;
                continue;
            }
            // Auto-generate alias from model or serial
            const alias = this.generateAlias(info);
            const entry = this.register(alias, info.serial);
            entry.info = info;
            newDevices.push(entry);
        }
        return newDevices;
    }
    /**
     * Refresh device info for all registered devices.
     * Marks unreachable devices by nulling their info.
     */
    async refresh() {
        const connected = await listDevices();
        const connectedSerials = new Set(connected.filter((d) => d.state === "device").map((d) => d.serial));
        const reachable = [];
        const unreachable = [];
        for (const [alias, entry] of this.devices) {
            if (connectedSerials.has(entry.serial)) {
                entry.info = connected.find((d) => d.serial === entry.serial) ?? null;
                reachable.push(alias);
            }
            else {
                entry.info = null;
                entry.device = null; // Invalidate stale Device instance
                unreachable.push(alias);
            }
        }
        return { reachable, unreachable };
    }
    /**
     * Number of registered devices.
     */
    get size() {
        return this.devices.size;
    }
    // ── Internal ─────────────────────────────────────────────────────
    findBySerial(serial) {
        for (const entry of this.devices.values()) {
            if (entry.serial === serial)
                return entry;
        }
        return undefined;
    }
    generateAlias(info) {
        const base = (info.model ?? info.serial).toLowerCase().replace(/[^a-z0-9]/g, "-");
        let alias = base;
        let counter = 2;
        while (this.devices.has(alias)) {
            alias = `${base}-${counter++}`;
        }
        return alias;
    }
}
//# sourceMappingURL=registry.js.map