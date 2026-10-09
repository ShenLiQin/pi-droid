/**
 * APK installation and package management — install, uninstall, query.
 */
import { type AdbExecOptions } from "./exec.js";
export interface InstallResult {
    success: boolean;
    package?: string;
    message: string;
}
export interface UninstallResult {
    success: boolean;
    message: string;
}
export interface PackageVersion {
    versionName: string;
    versionCode: number;
}
/**
 * Install an APK file onto the device.
 *
 * Uses `adb install` (not shell) since install is a host-side command.
 */
export declare function installApk(apkPath: string, options?: AdbExecOptions & {
    replace?: boolean;
    downgrade?: boolean;
}): Promise<InstallResult>;
/**
 * Uninstall a package from the device.
 */
export declare function uninstallPackage(packageName: string, options?: AdbExecOptions & {
    keepData?: boolean;
}): Promise<UninstallResult>;
/**
 * Get the installed version of a package.
 *
 * Returns null if the package is not installed.
 */
export declare function getPackageVersion(packageName: string, options?: AdbExecOptions): Promise<PackageVersion | null>;
/**
 * Quick check whether a package is installed on the device.
 */
export declare function isPackageInstalled(packageName: string, options?: AdbExecOptions): Promise<boolean>;
/**
 * Get the on-device path of an installed APK.
 *
 * Returns null if the package is not installed.
 */
export declare function getApkPath(packageName: string, options?: AdbExecOptions): Promise<string | null>;
