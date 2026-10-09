/**
 * Device preflight / health check.
 *
 * Runs a series of checks to verify the device is ready for automation
 * and returns a structured result with pass/fail status and fix hints.
 */
export interface PreflightCheck {
    name: string;
    passed: boolean;
    message: string;
    /** Hint on how to fix if the check failed. */
    fix?: string;
}
export interface PreflightResult {
    /** True when all critical checks passed. */
    ready: boolean;
    checks: PreflightCheck[];
    serial: string;
    timestamp: string;
}
/**
 * Run all preflight checks and return a structured result.
 */
export declare function runPreflight(options?: {
    serial?: string;
}): Promise<PreflightResult>;
