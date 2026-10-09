/**
 * ADB module — public API.
 *
 * Re-exports all ADB functionality for clean imports:
 *   import { tap, takeScreenshot, dumpUiTree, launchApp } from "./adb/index.js";
 */
// Command execution
export { adb, adbShell, AdbError, listDevices, getScreenSize, isDeviceReady, getForegroundPackage } from "./exec.js";
// Input actions
export { tap, swipe, typeText, keyEvent, pressBack, pressHome, pressEnter, scrollDown, scrollUp } from "./input.js";
// Screenshots
export { takeScreenshot, screenshotBase64, setScreenshotDir } from "./screenshot.js";
// OCR
export { runOcrOnImage, runOcrOnCurrentScreen } from "./ocr.js";
// UI hierarchy
export { dumpUiTree, findElements, findElement, waitForElement, summarizeTree, setUiDumpDir } from "./ui-tree.js";
// App management
export { launchApp, stopApp, getAppInfo, listPackages, keepScreenOn, restoreScreenTimeout, wakeScreen, isScreenOn } from "./app.js";
// File management
export { pushFile, pullFile, listDir, deleteFile, getStorageInfo, fileExists } from "./files.js";
// Device monitoring
export { getBatteryInfo, getNetworkInfo, getDeviceInfo, isScreenLocked, getRunningApps } from "./monitor.js";
// Notifications, clipboard, and intents
export { readNotifications, getClipboard, setClipboard, sendIntent, openUrl, shareText, makeCall, sendSms } from "./intents.js";
// Cache management
export { setCacheTtl, invalidateCache, isCacheValid } from "./cache.js";
// Screen recording
export { startRecording, stopRecording, pullRecording, isRecording } from "./recording.js";
// Annotated screenshots
export { annotatedScreenshot, generateAnnotationSvg } from "./annotate.js";
// WiFi ADB
export { connectWifi, disconnectWifi, enableWifiAdb, getWifiIp, isWifiConnected, autoConnect } from "./wifi.js";
// Gesture macros
export { executeMacro, saveMacro, loadMacro, listMacros } from "./macros.js";
// System settings
export { setWifiEnabled, isWifiEnabled, setBluetoothEnabled, isBluetoothEnabled, setAirplaneMode, setBrightness, getBrightness, setAutoBrightness, setVolume, getVolume, setScreenTimeout, getScreenTimeout, setLocationEnabled, isLocationEnabled, setDoNotDisturb, isDoNotDisturbEnabled, setAutoRotate, isAutoRotateEnabled, getSetting, putSetting, } from "./settings.js";
// Multi-device registry
export { DeviceRegistry } from "./registry.js";
// Preflight / health check
export { runPreflight } from "./preflight.js";
// APK installer
export { installApk, uninstallPackage, getPackageVersion, isPackageInstalled, getApkPath } from "./installer.js";
// Logcat
export { captureLogcat, searchLogcat, clearLogcat, getLogcatStats } from "./logcat.js";
// Automation helpers
export { ensureReady, observe, findAndTap, tapAndWait, typeIntoField, scrollToFind } from "./automation.js";
export { DefaultStuckDetector } from "./stuck-detector.js";
export { createTaskBudget, TaskBudgetTracker, DEFAULT_TASK_BUDGET } from "./task-budget.js";
// Lock pattern/PIN management
export { getLockStatus, clearLock, setPattern, setPin } from "./lock.js";
// Shell command execution
export { executeShell, executeShellScript, getProcessList, killProcess, getMemoryInfo } from "./shell.js";
// Screen state detection
export { getScreenState, getActivityStack, isKeyboardVisible, getOrientation, waitForActivity } from "./screen-state.js";
// High-level device abstraction
export { Device } from "./device.js";
//# sourceMappingURL=index.js.map