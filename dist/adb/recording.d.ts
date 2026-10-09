/**
 * Screen recording — start, stop, and pull device screen recordings.
 *
 * Uses `adb shell screenrecord` to capture video on the device,
 * then pulls it locally for debugging or training data.
 */
import { type AdbExecOptions } from "./exec.js";
export interface RecordingOptions extends AdbExecOptions {
    /** Max recording duration in seconds (default: 180, max: 180) */
    maxDuration?: number;
    /** Video bit rate in bits/s (e.g., 6000000 for 6Mbps) */
    bitRate?: number;
    /** Video size as "WIDTHxHEIGHT" (e.g., "1280x720") */
    size?: string;
}
/**
 * Start screen recording on the device.
 *
 * Launches `screenrecord` in the background — does not wait for completion.
 * Returns the remote path where the recording will be saved.
 */
export declare function startRecording(options?: RecordingOptions): Promise<string>;
/**
 * Stop an active screen recording by sending SIGINT to the screenrecord process.
 *
 * SIGINT causes screenrecord to finalize the mp4 file cleanly.
 */
export declare function stopRecording(options?: AdbExecOptions): Promise<void>;
/**
 * Pull the recording from the device to a local directory.
 *
 * Returns the local file path where the recording was saved.
 */
export declare function pullRecording(localDir?: string, options?: AdbExecOptions): Promise<string>;
/**
 * Check if a screenrecord process is currently running on the device.
 */
export declare function isRecording(options?: AdbExecOptions): Promise<boolean>;
