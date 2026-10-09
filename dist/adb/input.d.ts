/**
 * Input actions: tap, swipe, type text, key events.
 *
 * Supports both coordinate-based and selector-based interactions.
 * ASCII text is typed with the system `input text` command; Unicode text goes
 * through the ADBKeyboard IME.
 */
import { type AdbExecOptions } from "./exec.js";
import type { TapOptions, SwipeOptions, TypeOptions } from "./types.js";
/**
 * Tap at screen coordinates.
 */
export declare function tap(x: number, y: number, options?: TapOptions & AdbExecOptions): Promise<void>;
/**
 * Swipe from one point to another.
 */
export declare function swipe(x1: number, y1: number, x2: number, y2: number, options?: SwipeOptions & AdbExecOptions): Promise<void>;
/**
 * Type text into the currently focused field.
 *
 * Strategy:
 *  - ASCII-only text is entered with the system `input text` command. This
 *    works whether or not a soft keyboard is visible, so it is reliable on
 *    devices with a hardware keyboard attached (e.g. emulators) where the IME
 *    input view may never be shown.
 *  - Non-ASCII (Unicode) text is sent through the ADBKeyboard IME, which is
 *    also used when `useAdbKeyboard` is explicitly true.
 *
 * ADBKeyboard only registers its broadcast receiver in `onCreateInputView()`,
 * i.e. when its input view is actually shown. On devices with a hardware
 * keyboard and `show_ime_with_hard_keyboard=0` the view (and therefore the
 * receiver) never appears and `ADB_INPUT_B64` broadcasts are silently dropped,
 * so we enable that setting before using the broadcast path.
 */
export declare function typeText(text: string, options?: TypeOptions & AdbExecOptions): Promise<void>;
/**
 * Send a key event.
 */
export declare function keyEvent(keycode: string | number, options?: AdbExecOptions): Promise<void>;
/**
 * Press the back button.
 */
export declare function pressBack(options?: AdbExecOptions): Promise<void>;
/**
 * Press the home button.
 */
export declare function pressHome(options?: AdbExecOptions): Promise<void>;
/**
 * Press enter/return.
 */
export declare function pressEnter(options?: AdbExecOptions): Promise<void>;
/** Common scroll gesture — scroll down on center of screen */
export declare function scrollDown(screenWidth: number, screenHeight: number, options?: SwipeOptions & AdbExecOptions): Promise<void>;
/** Common scroll gesture — scroll up on center of screen */
export declare function scrollUp(screenWidth: number, screenHeight: number, options?: SwipeOptions & AdbExecOptions): Promise<void>;
