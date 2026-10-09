/**
 * Pi-Droid — pi-agent extension entry point.
 *
 * Android automation extension for pi-agent. Registers ADB tools,
 * app-specific plugins, and input routing.
 * Extends pi-agent's capabilities for Android device control.
 */
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
export default function piDroid(pi: ExtensionAPI): void;
export { PluginManager, registerPluginType } from "./plugins/loader.js";
export type { PiDroidPlugin, PluginCapability, PluginStatus, PluginActionResult } from "./plugins/interface.js";
export type { PluginManifest } from "./plugins/manifest.js";
export { CliPlugin, type CliPluginConfig, type CommandMapping } from "./plugins/cli-plugin.js";
export { TelegramPlugin } from "./plugins/telegram.js";
export { TelegramChannel, type TelegramChannelConfig } from "./notifications/telegram.js";
export { ApprovalQueue } from "./notifications/approval-queue.js";
export type { NotificationChannel, ApprovalRequest, ApprovalResult, ParsedCommand, ManualOverrideCommand, } from "./notifications/interface.js";
export { Device, adb, adbShell, AdbError, listDevices, isDeviceReady, tap, swipe, typeText, keyEvent, pressBack, pressHome, pressEnter, scrollDown, scrollUp, getScreenState, waitForActivity, getActivityStack, isKeyboardVisible, getOrientation, takeScreenshot, screenshotBase64, annotatedScreenshot, dumpUiTree, findElements, findElement, waitForElement, launchApp, stopApp, getAppInfo, listPackages, wakeScreen, isScreenOn, getBatteryInfo, getNetworkInfo, getDeviceInfo, isScreenLocked, getRunningApps, ensureReady, findAndTap, scrollToFind, DefaultStuckDetector, createTaskBudget, runOcrOnImage, runOcrOnCurrentScreen, } from "./adb/index.js";
export type { AdbExecOptions } from "./adb/index.js";
export type { StuckEvent, UIElement, Bounds, ElementSelector } from "./adb/index.js";
