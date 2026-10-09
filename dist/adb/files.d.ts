/**
 * File management tools — push, pull, list, delete, storage info.
 *
 * Wraps ADB file operations with proper error handling and
 * structured return types.
 */
import { type AdbExecOptions } from "./exec.js";
export interface DirEntry {
    /** File permissions string (e.g., "-rwxr-xr-x") */
    permissions: string;
    /** Owner */
    owner: string;
    /** Group */
    group: string;
    /** File size in bytes */
    size: number;
    /** Last modified date string */
    date: string;
    /** File/directory name */
    name: string;
    /** True if entry is a directory */
    isDirectory: boolean;
    /** True if entry is a symlink */
    isSymlink: boolean;
}
export interface StorageInfo {
    /** Filesystem path */
    filesystem: string;
    /** Total size (human-readable) */
    size: string;
    /** Used space (human-readable) */
    used: string;
    /** Available space (human-readable) */
    available: string;
    /** Use percentage (e.g., "42%") */
    usePercent: string;
    /** Mount point */
    mountedOn: string;
}
export interface PushPullResult {
    /** Source path */
    source: string;
    /** Destination path */
    destination: string;
    /** Raw ADB output (contains transfer speed, bytes) */
    output: string;
}
/**
 * Push a local file to the device.
 */
export declare function pushFile(localPath: string, remotePath: string, options?: AdbExecOptions): Promise<PushPullResult>;
/**
 * Pull a file from the device to local filesystem.
 */
export declare function pullFile(remotePath: string, localPath: string, options?: AdbExecOptions): Promise<PushPullResult>;
/**
 * List directory contents on the device.
 */
export declare function listDir(remotePath: string, options?: AdbExecOptions): Promise<DirEntry[]>;
/**
 * Delete a file or directory on the device.
 */
export declare function deleteFile(remotePath: string, options?: AdbExecOptions & {
    recursive?: boolean;
    force?: boolean;
}): Promise<void>;
/**
 * Get storage usage information for the device.
 */
export declare function getStorageInfo(options?: AdbExecOptions): Promise<StorageInfo[]>;
/**
 * Check if a file or directory exists on the device.
 */
export declare function fileExists(remotePath: string, options?: AdbExecOptions): Promise<boolean>;
