import type { StuckDetector, StuckEvent, StuckState, UIElement } from "./types.js";
export interface StuckDetectorOptions {
    screenRepeatThreshold?: number;
    actionRepeatThreshold?: number;
    actionWindowSize?: number;
    onStuck?: (event: StuckEvent) => void;
}
export declare class DefaultStuckDetector implements StuckDetector {
    private readonly options;
    private readonly actionWindow;
    private lastScreenHash;
    private sameScreenCount;
    private state;
    constructor(options?: StuckDetectorOptions);
    recordAction(action: string, params: Record<string, unknown>): void;
    recordScreenState(uiTree: UIElement[]): void;
    isStuck(): StuckState;
    reset(): void;
    private emitStuck;
    private hashUiTree;
}
