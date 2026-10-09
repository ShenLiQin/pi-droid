/**
 * UI tree cache — avoids redundant uiautomator dumps.
 *
 * The UI dump is expensive (~500-1000ms per call). Caching the result
 * for a short TTL avoids repeated dumps when multiple tools need the
 * tree in quick succession (e.g., android_look followed by android_tap).
 *
 * Cache is invalidated automatically on any input action (tap, swipe, type, key).
 */
import type { UITreeResult } from "./types.js";
/**
 * Set the cache TTL in milliseconds (default: 2000).
 */
export declare function setCacheTtl(ms: number): void;
/**
 * Get a cached UI tree if still valid, or null.
 */
export declare function getCachedTree(): UITreeResult | null;
/**
 * Store a UI tree in the cache.
 */
export declare function setCachedTree(tree: UITreeResult): void;
/**
 * Invalidate the cache (call after any input action).
 */
export declare function invalidateCache(): void;
/**
 * Check if cache has a valid entry.
 */
export declare function isCacheValid(): boolean;
