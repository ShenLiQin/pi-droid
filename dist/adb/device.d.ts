/**
 * Device — high-level abstraction over a connected Android device.
 *
 * Combines all ADB operations into a single stateful object that tracks
 * the device serial, screen dimensions, and provides convenience methods.
 */
import type { DeviceInfo, ScreenSize, UIElement, ElementSelector, TapOptions, SwipeOptions, TypeOptions, WaitOptions, ScreenshotResult, UITreeResult, AppInfo } from "./types.js";
export declare class Device {
    readonly serial: string;
    private screenSize;
    constructor(serial: string);
    private get opts();
    /**
     * Connect to a device by serial, or auto-detect the first available.
     */
    static connect(serial?: string): Promise<Device>;
    /**
     * List all connected devices.
     */
    static listAll(): Promise<DeviceInfo[]>;
    getScreenSize(): Promise<ScreenSize>;
    isReady(): Promise<boolean>;
    tap(x: number, y: number, options?: TapOptions): Promise<void>;
    swipe(x1: number, y1: number, x2: number, y2: number, options?: SwipeOptions): Promise<void>;
    typeText(text: string, options?: TypeOptions): Promise<void>;
    keyEvent(keycode: string | number): Promise<void>;
    back(): Promise<void>;
    home(): Promise<void>;
    enter(): Promise<void>;
    scrollDown(): Promise<void>;
    scrollUp(): Promise<void>;
    screenshot(options?: {
        prefix?: string;
        includeBase64?: boolean;
    }): Promise<ScreenshotResult>;
    screenshotBase64(): Promise<string>;
    uiDump(): Promise<UITreeResult>;
    findElement(selector: ElementSelector): Promise<UIElement | null>;
    findElements(selector: ElementSelector): Promise<UIElement[]>;
    waitForElement(selector: ElementSelector, options?: WaitOptions): Promise<UIElement | null>;
    /**
     * Get a text summary of the current screen (for LLM context).
     */
    describeScreen(): Promise<string>;
    /**
     * Tap an element matching a selector. UI dumps first to get fresh coordinates.
     */
    tapElement(selector: ElementSelector, options?: TapOptions): Promise<UIElement>;
    /**
     * Wait for an element and tap it.
     */
    waitAndTap(selector: ElementSelector, options?: WaitOptions & TapOptions): Promise<UIElement>;
    /**
     * Type text into an element (taps it first to focus).
     */
    typeInto(selector: ElementSelector, text: string, options?: TypeOptions): Promise<void>;
    launchApp(packageName: string, activity?: string): Promise<void>;
    stopApp(packageName: string): Promise<void>;
    getAppInfo(packageName: string): Promise<AppInfo>;
    keepScreenOn(): Promise<void>;
    wake(): Promise<void>;
    isScreenOn(): Promise<boolean>;
    /**
     * Ensure the screen is on and awake.
     */
    ensureAwake(): Promise<void>;
}
