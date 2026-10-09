/**
 * Device — high-level abstraction over a connected Android device.
 *
 * Combines all ADB operations into a single stateful object that tracks
 * the device serial, screen dimensions, and provides convenience methods.
 */
import { listDevices, getScreenSize, isDeviceReady } from "./exec.js";
import { tap, swipe, typeText, keyEvent, pressBack, pressHome, pressEnter, scrollDown, scrollUp } from "./input.js";
import { takeScreenshot, screenshotBase64 } from "./screenshot.js";
import { dumpUiTree, findElement, findElements, waitForElement, summarizeTree } from "./ui-tree.js";
import { launchApp, stopApp, getAppInfo, keepScreenOn, wakeScreen, isScreenOn } from "./app.js";
export class Device {
    serial;
    screenSize = null;
    constructor(serial) {
        this.serial = serial;
    }
    get opts() {
        return { serial: this.serial };
    }
    /**
     * Connect to a device by serial, or auto-detect the first available.
     */
    static async connect(serial) {
        if (serial) {
            const ready = await isDeviceReady(serial);
            if (!ready)
                throw new Error(`Device ${serial} not ready`);
            return new Device(serial);
        }
        const devices = await listDevices();
        const available = devices.find((d) => d.state === "device");
        if (!available)
            throw new Error("No ADB devices found");
        return new Device(available.serial);
    }
    /**
     * List all connected devices.
     */
    static async listAll() {
        return listDevices();
    }
    async getScreenSize() {
        if (!this.screenSize) {
            this.screenSize = await getScreenSize(this.opts);
        }
        return this.screenSize;
    }
    async isReady() {
        return isDeviceReady(this.serial);
    }
    // --- Input ---
    async tap(x, y, options) {
        await tap(x, y, { ...this.opts, ...options });
    }
    async swipe(x1, y1, x2, y2, options) {
        await swipe(x1, y1, x2, y2, { ...this.opts, ...options });
    }
    async typeText(text, options) {
        await typeText(text, { ...this.opts, ...options });
    }
    async keyEvent(keycode) {
        await keyEvent(keycode, this.opts);
    }
    async back() {
        await pressBack(this.opts);
    }
    async home() {
        await pressHome(this.opts);
    }
    async enter() {
        await pressEnter(this.opts);
    }
    async scrollDown() {
        const size = await this.getScreenSize();
        await scrollDown(size.width, size.height, this.opts);
    }
    async scrollUp() {
        const size = await this.getScreenSize();
        await scrollUp(size.width, size.height, this.opts);
    }
    // --- Screenshot ---
    async screenshot(options) {
        return takeScreenshot({ ...this.opts, ...options });
    }
    async screenshotBase64() {
        return screenshotBase64(this.opts);
    }
    // --- UI Tree ---
    async uiDump() {
        return dumpUiTree(this.opts);
    }
    async findElement(selector) {
        const tree = await dumpUiTree(this.opts);
        return findElement(tree.elements, selector);
    }
    async findElements(selector) {
        const tree = await dumpUiTree(this.opts);
        return findElements(tree.elements, selector);
    }
    async waitForElement(selector, options) {
        return waitForElement(selector, { ...this.opts, ...options });
    }
    /**
     * Get a text summary of the current screen (for LLM context).
     */
    async describeScreen() {
        const tree = await dumpUiTree(this.opts);
        return summarizeTree(tree);
    }
    // --- Selector-based actions ---
    /**
     * Tap an element matching a selector. UI dumps first to get fresh coordinates.
     */
    async tapElement(selector, options) {
        const tree = await dumpUiTree(this.opts);
        const el = findElement(tree.elements, selector);
        if (!el)
            throw new Error(`Element not found: ${JSON.stringify(selector)}`);
        await tap(el.center.x, el.center.y, { ...this.opts, ...options });
        return el;
    }
    /**
     * Wait for an element and tap it.
     */
    async waitAndTap(selector, options) {
        const el = await waitForElement(selector, { ...this.opts, ...options });
        if (!el)
            throw new Error(`Timed out waiting for element: ${JSON.stringify(selector)}`);
        await tap(el.center.x, el.center.y, { ...this.opts, ...options });
        return el;
    }
    /**
     * Type text into an element (taps it first to focus).
     */
    async typeInto(selector, text, options) {
        await this.tapElement(selector);
        await new Promise((r) => setTimeout(r, 300)); // Wait for focus
        await typeText(text, { ...this.opts, ...options });
    }
    // --- App management ---
    async launchApp(packageName, activity) {
        await launchApp(packageName, { ...this.opts, activity });
    }
    async stopApp(packageName) {
        await stopApp(packageName, this.opts);
    }
    async getAppInfo(packageName) {
        return getAppInfo(packageName, this.opts);
    }
    async keepScreenOn() {
        await keepScreenOn(this.opts);
    }
    async wake() {
        await wakeScreen(this.opts);
    }
    async isScreenOn() {
        return isScreenOn(this.opts);
    }
    /**
     * Ensure the screen is on and awake.
     */
    async ensureAwake() {
        const on = await this.isScreenOn();
        if (!on)
            await this.wake();
    }
}
//# sourceMappingURL=device.js.map