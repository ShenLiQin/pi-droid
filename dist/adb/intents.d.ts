/**
 * Notification reading, clipboard management, and intent tools.
 *
 * Provides structured access to Android notifications, clipboard,
 * and generic intent sending (URLs, SMS, calls, shares).
 */
import { type AdbExecOptions } from "./exec.js";
import type { NotificationInfo, IntentExtras } from "./types.js";
/**
 * Read active notifications from the notification shade.
 *
 * Parses `dumpsys notification --noredact` for posted notifications
 * and extracts package, title, text, and timestamp.
 */
export declare function readNotifications(options?: AdbExecOptions): Promise<NotificationInfo[]>;
/**
 * Get current clipboard text content.
 *
 * Uses the clipboard service call to retrieve the primary clip.
 * Falls back to empty string if clipboard is empty or inaccessible.
 */
export declare function getClipboard(options?: AdbExecOptions): Promise<string>;
/**
 * Set clipboard text content.
 *
 * Uses `am broadcast` with the clipper action. Requires a clipboard helper
 * app, or falls back to the `service call` approach.
 */
export declare function setClipboard(text: string, options?: AdbExecOptions): Promise<void>;
/**
 * Send a generic Android intent via `am start` or `am broadcast`.
 *
 * @param action - Intent action (e.g., "android.intent.action.VIEW")
 * @param extras - Key-value string extras to attach
 * @param options - ADB execution options plus intent delivery mode
 */
export declare function sendIntent(action: string, extras?: IntentExtras, options?: AdbExecOptions & {
    broadcast?: boolean;
}): Promise<string>;
/**
 * Open a URL in the default browser.
 */
export declare function openUrl(url: string, options?: AdbExecOptions): Promise<void>;
/**
 * Share text via the Android share sheet.
 */
export declare function shareText(text: string, options?: AdbExecOptions): Promise<void>;
/**
 * Open the dialer with a phone number pre-filled (does not auto-call).
 */
export declare function makeCall(number: string, options?: AdbExecOptions): Promise<void>;
/**
 * Open SMS compose with a pre-filled number and message body.
 */
export declare function sendSms(number: string, message: string, options?: AdbExecOptions): Promise<void>;
